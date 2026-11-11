<?php
/**
 * Plugin Name: CHILS History Import
 * Description: One-time import of past customers (with their existing passwords) and their order history into this store. Tools → CHILS history import. Always do a dry run first.
 * Version: 1.0.0
 * Author: CHILS & CO.
 * Requires Plugins: woocommerce
 * Requires PHP: 7.4
 */

defined( 'ABSPATH' ) || exit;

final class Chils_History_Import {
	const STATE = 'chils_hi_state';
	const FILE  = 'chils_hi_file';
	const STATUSES = array(
		'dispatched-order' => 'Dispatched',
		'return-requested' => 'Return requested',
		'return-approved'  => 'Return approved',
		'return-cancelled' => 'Return rejected',
	);

	static function boot() { add_action( 'plugins_loaded', array( __CLASS__, 'init' ) ); }

	static function init() {
		if ( ! class_exists( 'WooCommerce' ) ) return;
		// the store's own order statuses (returns and dispatch) must exist, or old orders could not keep theirs
		add_action( 'init', array( __CLASS__, 'register_statuses' ), 20 );
		add_filter( 'wc_order_statuses', array( __CLASS__, 'status_list' ), 20 );
		// customers keep seeing their old order numbers (CHILS_AND_94 …)
		add_filter( 'woocommerce_order_number', array( __CLASS__, 'order_number' ), 10, 2 );
		add_action( 'admin_menu', array( __CLASS__, 'menu' ) );
	}

	static function register_statuses() {
		foreach ( self::STATUSES as $slug => $label ) {
			if ( get_post_status_object( 'wc-' . $slug ) ) continue;
			register_post_status( 'wc-' . $slug, array(
				'label' => $label, 'public' => false, 'exclude_from_search' => false,
				'show_in_admin_all_list' => true, 'show_in_admin_status_list' => true,
				'label_count' => _n_noop( "$label <span class=\"count\">(%s)</span>", "$label <span class=\"count\">(%s)</span>" ),
			) );
		}
	}

	static function status_list( $list ) {
		foreach ( self::STATUSES as $slug => $label ) if ( ! isset( $list[ 'wc-' . $slug ] ) ) $list[ 'wc-' . $slug ] = $label;
		return $list;
	}

	static function order_number( $number, $order ) {
		$old = $order->get_meta( '_chils_old_order_number' );
		return $old ? $old : $number;
	}

	/* ------------------------------------------------------------------ safety while importing */

	/** Nothing leaves the store and no stock moves while old data is written. Runs at the start of every request that writes. */
	static function guards() {
		if ( ! defined( 'CHILS_IMPORTING' ) ) define( 'CHILS_IMPORTING', true );
		add_filter( 'pre_wp_mail', '__return_true', 1 );                                // no email to customers
		add_filter( 'woocommerce_webhook_should_deliver', '__return_false', 1 );        // nothing pushed to Shiprocket / couriers
		add_filter( 'woocommerce_can_reduce_order_stock', '__return_false', 1 );        // WooCommerce's own stock untouched
		add_filter( 'woocommerce_email_actions', '__return_empty_array', 1 );
		remove_action( 'woocommerce_order_status_refunded', 'wc_order_fully_refunded' );  // WooCommerce would invent its own refund; we recreate the real ones
		add_filter( 'send_password_change_email', '__return_false', 1 );
		add_filter( 'send_email_change_email', '__return_false', 1 );
		add_filter( 'wp_send_new_user_notification_to_user', '__return_false', 1 );
		add_filter( 'wp_send_new_user_notification_to_admin', '__return_false', 1 );
	}

	static function ts( $gmt ) { return $gmt ? strtotime( $gmt . ' UTC' ) : null; }

	/* ------------------------------------------------------------------ bundle file */

	static function dir() {
		$u = wp_upload_dir();
		$d = trailingslashit( $u['basedir'] ) . 'chils-import';
		if ( ! is_dir( $d ) ) {
			wp_mkdir_p( $d );
			file_put_contents( $d . '/.htaccess', "Require all denied\nDeny from all\n" );
			file_put_contents( $d . '/index.php', "<?php // silence\n" );
		}
		return $d;
	}

	static function load() {
		$f = get_option( self::FILE );
		if ( ! $f || ! file_exists( $f ) ) return null;
		$b = json_decode( file_get_contents( $f ), true );
		return is_array( $b ) && ( $b['format'] ?? 0 ) === 1 ? $b : null;
	}

	static function state() {
		$s = get_option( self::STATE );
		return is_array( $s ) ? $s : array( 'users' => array(), 'orders' => array(), 'log' => array(), 'stats' => array() );
	}

	static function bump( &$s, $k, $n = 1 ) { $s['stats'][ $k ] = ( $s['stats'][ $k ] ?? 0 ) + $n; }

	static function note( &$s, $line ) { $s['log'][] = $line; if ( count( $s['log'] ) > 300 ) array_shift( $s['log'] ); }

	/* ------------------------------------------------------------------ users */

	static function find_imported_user( $old_id ) {
		$q = get_users( array( 'meta_key' => '_chils_old_user_id', 'meta_value' => (int) $old_id, 'number' => 1, 'fields' => 'ID' ) );
		return $q ? (int) $q[0] : 0;
	}

	static function import_user( $u, &$s, $dry ) {
		$id = self::find_imported_user( $u['old_id'] );
		if ( $id ) return array( $id, 'already' );
		$ex = get_user_by( 'email', $u['email'] );
		if ( $ex ) { // an account with this email is already here (for example the owner's own): keep it as it is, attach the history
			if ( ! $dry ) update_user_meta( $ex->ID, '_chils_old_user_id', (int) $u['old_id'] );
			return array( (int) $ex->ID, 'existing' );
		}
		$login = $u['login']; $n = 1;
		while ( username_exists( $login ) ) $login = $u['login'] . '-' . ( ++$n );
		$renamed = $login !== $u['login'];
		if ( $dry ) return array( 0, $renamed ? 'would_create_renamed' : 'would_create' );

		$id = wp_insert_user( array(
			'user_login' => $login, 'user_pass' => wp_generate_password( 32 ), 'user_email' => $u['email'],
			'user_nicename' => sanitize_title( $u['nicename'] ?: $login ), 'display_name' => $u['display_name'] ?: $login,
			'first_name' => $u['first_name'], 'last_name' => $u['last_name'], 'role' => 'customer',
			'user_registered' => gmdate( 'Y-m-d H:i:s', self::ts( $u['registered_gmt'] ) ?: time() ),
		) );
		if ( is_wp_error( $id ) ) return array( 0, 'error: ' . $id->get_error_message() );
		global $wpdb;
		$wpdb->update( $wpdb->users, array( 'user_pass' => $u['pass_hash'] ), array( 'ID' => $id ) ); // their own password, exactly as it was
		clean_user_cache( $id );
		foreach ( array( 'billing' => 'billing_', 'shipping' => 'shipping_' ) as $k => $pre ) {
			foreach ( (array) ( $u[ $k ] ?? array() ) as $field => $val ) update_user_meta( $id, $pre . $field, $val );
		}
		foreach ( (array) $u['meta'] as $k => $v ) update_user_meta( $id, $k, $v );
		update_user_meta( $id, '_chils_old_user_id', (int) $u['old_id'] );
		update_user_meta( $id, '_chils_imported_user', 1 );
		if ( $u['orders'] ) update_user_meta( $id, 'paying_customer', 1 );
		return array( (int) $id, $renamed ? 'created_renamed' : 'created' );
	}

	/* ------------------------------------------------------------------ orders */

	static function find_imported_order( $old_id ) {
		$r = wc_get_orders( array( 'limit' => 1, 'status' => array_keys( wc_get_order_statuses() ), 'meta_key' => '_chils_old_order_id', 'meta_value' => (int) $old_id, 'return' => 'ids' ) );
		return $r ? (int) $r[0] : 0;
	}

	static function import_order( $o, $user_id, &$s, $dry ) {
		$ex = self::find_imported_order( $o['old_id'] );
		if ( $ex ) return array( $ex, 'already' );
		if ( $dry ) return array( 0, 'would_create' );

		$order = wc_create_order( array( 'status' => 'pending', 'customer_id' => (int) $user_id, 'created_via' => 'chils-import', 'currency' => $o['currency'] ?: 'INR' ) );
		if ( is_wp_error( $order ) ) return array( 0, 'error: ' . $order->get_error_message() );
		$order->set_address( $o['billing'], 'billing' );
		$order->set_address( $o['shipping'], 'shipping' );
		$order->set_payment_method( $o['payment_method'] );
		$order->set_payment_method_title( $o['payment_title'] );
		$order->set_transaction_id( $o['transaction_id'] );
		$order->set_customer_note( $o['customer_note'] );
		foreach ( $o['items'] as $i ) {
			$it = new WC_Order_Item_Product();
			$it->set_name( $i['name'] ); $it->set_quantity( (int) $i['qty'] );
			$it->set_subtotal( $i['subtotal'] ); $it->set_total( $i['total'] );
			$it->add_meta_data( '_chils_old_product_id', (int) $i['product_id'], true );
			$it->add_meta_data( '_chils_old_variation_id', (int) $i['variation_id'], true );
			if ( $i['sku'] ) $it->add_meta_data( '_chils_old_sku', $i['sku'], true );
			foreach ( $i['meta'] as $m ) {
				if ( strpos( $m['key'], 'pa_' ) === 0 ) continue; // taxonomy duplicates of Size / Colour
				$it->add_meta_data( $m['key'], $m['value'] );
			}
			$order->add_item( $it );
		}
		foreach ( $o['shipping_lines'] as $l ) {
			$it = new WC_Order_Item_Shipping();
			$it->set_method_title( $l['title'] ); $it->set_method_id( $l['method_id'] ); $it->set_total( $l['total'] );
			$order->add_item( $it );
		}
		foreach ( $o['fee_lines'] as $l ) {
			$it = new WC_Order_Item_Fee();
			$it->set_name( $l['name'] ); $it->set_tax_status( 'none' ); $it->set_total( $l['total'] ); $it->set_amount( $l['total'] );
			$order->add_item( $it );
		}
		foreach ( $o['coupon_lines'] as $l ) {
			$it = new WC_Order_Item_Coupon();
			$it->set_code( $l['code'] ); $it->set_discount( $l['discount'] );
			$order->add_item( $it );
		}
		foreach ( $o['meta'] as $m ) $order->update_meta_data( $m['key'], $m['value'] );
		// marks that tell every other plugin (stock, Slack, shipping) this is history, not a new sale
		$order->update_meta_data( '_chils_old_order_id', (int) $o['old_id'] );
		$order->update_meta_data( '_chils_old_order_number', (string) $o['old_order_number'] );
		$order->update_meta_data( '_chils_imported', 1 );
		$order->set_discount_total( $o['discount_total'] );
		$order->set_shipping_total( $o['shipping_total'] );
		$order->set_total( $o['total'] );
		$order->set_date_created( self::ts( $o['created_gmt'] ) );
		$order->save();

		$order->set_status( $o['status'], '', false );
		$order->save();

		$refund_ok = true;
		foreach ( $o['refunds'] as $r ) {
			$ref = wc_create_refund( array( 'order_id' => $order->get_id(), 'amount' => $r['amount'], 'reason' => $r['reason'], 'refund_payment' => false, 'restock_items' => false ) );
			if ( is_wp_error( $ref ) ) { $refund_ok = false; self::note( $s, 'Order ' . $o['number'] . ' refund: ' . $ref->get_error_message() ); continue; }
			if ( $r['date_gmt'] ) { $ref->set_date_created( self::ts( $r['date_gmt'] ) ); $ref->save(); }
			self::bump( $s, 'refunds' );
		}

		$order = wc_get_order( $order->get_id() );
		if ( $order->get_status() !== $o['status'] ) { $order->set_status( $o['status'], '', false ); }
		$order->set_date_created( self::ts( $o['created_gmt'] ) );
		$order->set_date_paid( self::ts( $o['paid_gmt'] ) );
		$order->set_date_completed( self::ts( $o['completed_gmt'] ) );
		$order->save();

		// the old notes, with their original dates; drop the automatic "status changed" notes created just now
		foreach ( wc_get_order_notes( array( 'order_id' => $order->get_id() ) ) as $n ) wc_delete_order_note( $n->id );
		foreach ( $o['notes'] as $n ) {
			$cid = $order->add_order_note( $n['note'], 0, false ); // added as private first: a customer note would trigger an email
			if ( $cid && $n['to_customer'] ) add_comment_meta( $cid, 'is_customer_note', 1 );   // then marked as shown to the customer
			if ( $cid && $n['date_gmt'] ) {
				wp_update_comment( array( 'comment_ID' => $cid, 'comment_date_gmt' => gmdate( 'Y-m-d H:i:s', self::ts( $n['date_gmt'] ) ), 'comment_date' => get_date_from_gmt( gmdate( 'Y-m-d H:i:s', self::ts( $n['date_gmt'] ) ) ) ) );
				self::bump( $s, 'notes' );
			}
		}
		return array( $order->get_id(), $refund_ok ? 'created' : 'created_refund_issue' );
	}

	/* ------------------------------------------------------------------ the run */

	/** Work through the bundle until the time budget is used. Safe to repeat: finished people and orders are skipped. */
	static function run( $dry ) {
		$b = self::load();
		if ( ! $b ) return array( 'error' => 'No import file loaded.' );
		if ( ! $dry ) self::guards();
		@set_time_limit( 0 );
		$max = (int) ini_get( 'max_execution_time' );
		$budget = $max > 0 ? max( 10, $max * 0.6 ) : 40;
		$t0 = microtime( true );
		$s = $dry ? array( 'users' => array(), 'orders' => array(), 'log' => array(), 'stats' => array() ) : self::state();
		$done = true;
		$todo = array();
		foreach ( $b['users'] as $u ) $todo[] = array( 'u', $u );
		foreach ( $b['guests'] as $g ) $todo[] = array( 'g', $g );
		foreach ( $todo as $t ) {
			if ( ! $dry && ( microtime( true ) - $t0 ) > $budget ) { $done = false; break; }
			if ( $t[0] === 'u' ) {
				$u = $t[1];
				if ( ! $dry && isset( $s['users'][ $u['old_id'] ] ) && ! array_filter( $u['orders'], function ( $o ) use ( $s ) { return ! isset( $s['orders'][ $o['old_id'] ] ); } ) ) continue;
				list( $uid, $res ) = self::import_user( $u, $s, $dry );
				self::bump( $s, 'users_' . preg_replace( '/:.*/', '', $res ) );
				if ( strpos( $res, 'error' ) === 0 ) { self::note( $s, 'User ' . $u['old_id'] . ': ' . $res ); continue; }
				if ( $res === 'created_renamed' || $res === 'would_create_renamed' ) self::note( $s, 'Login "' . $u['login'] . '" was taken, so this customer got a numbered login (their email is unchanged).' );
				if ( $res === 'existing' ) self::note( $s, 'An account with email ' . substr( $u['email'], 0, 2 ) . '*** already existed: kept as it is, its password was not changed.' );
				if ( ! $dry ) $s['users'][ $u['old_id'] ] = $uid;
				foreach ( $u['orders'] as $o ) {
					list( $oid, $r2 ) = self::import_order( $o, $uid, $s, $dry );
					self::bump( $s, 'orders_' . preg_replace( '/:.*/', '', $r2 ) );
					if ( strpos( $r2, 'error' ) === 0 ) self::note( $s, 'Order ' . $o['number'] . ': ' . $r2 );
					elseif ( ! $dry ) $s['orders'][ $o['old_id'] ] = $oid;
				}
			} else {
				foreach ( $t[1]['orders'] as $o ) {
					$ex = get_user_by( 'email', $t[1]['email'] ); // a guest who has since registered here gets the order on their account
					list( $oid, $r2 ) = self::import_order( $o, $ex ? $ex->ID : 0, $s, $dry );
					self::bump( $s, 'orders_' . preg_replace( '/:.*/', '', $r2 ) );
					self::bump( $s, 'guest_orders' );
					if ( strpos( $r2, 'error' ) === 0 ) self::note( $s, 'Order ' . $o['number'] . ': ' . $r2 );
					elseif ( ! $dry ) $s['orders'][ $o['old_id'] ] = $oid;
				}
			}
			if ( ! $dry ) update_option( self::STATE, $s, false );
		}
		if ( ! $dry ) { $s['finished'] = $done; update_option( self::STATE, $s, false ); }
		return array( 'done' => $done, 'state' => $s );
	}

	/* ------------------------------------------------------------------ verification */

	/** Compare the store with the bundle. Returns a list of [ok(bool), text]. */
	static function verify() {
		$b = self::load();
		if ( ! $b ) return array( array( false, 'No import file loaded.' ) );
		$R = array(); $bad = array();
		global $wpdb;
		$ok_users = 0; $hash_ok = 0; $hash_checked = 0; $orders = 0; $order_bad = 0; $rev = 0.0; $by = array();
		$check_order = function ( $o, $uid ) use ( &$orders, &$order_bad, &$rev, &$by, &$bad ) {
			$id = self::find_imported_order( $o['old_id'] );
			if ( ! $id ) { $order_bad++; $bad[] = 'Order ' . $o['number'] . ' is missing'; return; }
			$w = wc_get_order( $id ); $orders++;
			$p = array();
			if ( $w->get_status() !== $o['status'] ) $p[] = 'status ' . $w->get_status() . ' ≠ ' . $o['status'];
			if ( abs( (float) $w->get_total() - (float) $o['total'] ) > 0.005 ) $p[] = 'total ' . $w->get_total() . ' ≠ ' . $o['total'];
			if ( count( $w->get_items() ) !== count( $o['items'] ) ) $p[] = 'item count';
			if ( (int) $w->get_customer_id() !== (int) $uid ) $p[] = 'owner';
			if ( $w->get_date_created() && $w->get_date_created()->getTimestamp() !== self::ts( $o['created_gmt'] ) ) $p[] = 'date';
			if ( count( wc_get_order_notes( array( 'order_id' => $id ) ) ) !== count( $o['notes'] ) ) $p[] = 'notes ' . count( wc_get_order_notes( array( 'order_id' => $id ) ) ) . ' ≠ ' . count( $o['notes'] );
			$rf = 0.0; foreach ( $w->get_refunds() as $r ) $rf += abs( (float) $r->get_amount() );
			if ( abs( $rf - array_sum( array_map( function ( $r ) { return (float) $r['amount']; }, $o['refunds'] ) ) ) > 0.005 ) $p[] = 'refunds';
			if ( (string) $w->get_meta( '_chils_old_order_number' ) !== (string) $o['old_order_number'] ) $p[] = 'order number';
			if ( $p ) { $order_bad++; $bad[] = 'Order ' . $o['number'] . ': ' . implode( ', ', $p ); }
			if ( $o['status'] !== 'refunded' ) $rev += (float) $o['total'];
			$by[ $w->get_status() ] = ( $by[ $w->get_status() ] ?? 0 ) + 1;
		};
		foreach ( $b['users'] as $u ) {
			$id = self::find_imported_user( $u['old_id'] );
			if ( ! $id ) { $bad[] = 'Customer ' . $u['old_id'] . ' is missing'; continue; }
			$ok_users++;
			if ( get_user_meta( $id, '_chils_imported_user', true ) ) { // accounts that already existed here keep their own password
				$hash_checked++;
				$stored = $wpdb->get_var( $wpdb->prepare( "SELECT user_pass FROM {$wpdb->users} WHERE ID = %d", $id ) );
				if ( $stored === $u['pass_hash'] ) $hash_ok++; else $bad[] = 'Customer ' . substr( $u['email'], 0, 2 ) . '***: password does not match the original';
			}
			foreach ( $u['orders'] as $o ) $check_order( $o, $id );
		}
		foreach ( $b['guests'] as $g ) {
			$ex = get_user_by( 'email', $g['email'] );
			foreach ( $g['orders'] as $o ) $check_order( $o, $ex ? $ex->ID : 0 );
		}
		$e = $b['expected'];
		$R[] = array( $ok_users === (int) $e['users'], "Customers in store: $ok_users of {$e['users']}" );
		$R[] = array( $hash_ok === $hash_checked, "Passwords carried over exactly: $hash_ok of $hash_checked checked" );
		$R[] = array( $orders === (int) $e['orders'], "Orders in store: $orders of {$e['orders']}" );
		$R[] = array( $order_bad === 0, "Orders matching the original (status, total, items, owner, date, notes, refunds, number): " . ( $orders - $order_bad ) . " of {$e['orders']}" );
		$R[] = array( abs( $rev - (float) $e['revenue'] ) < 0.01, 'Revenue in imported orders: ' . number_format( $rev, 0 ) . ' (expected ' . number_format( (float) $e['revenue'], 0 ) . ')' );
		$exp = $e['by_status']; ksort( $exp ); ksort( $by );
		$R[] = array( $by == $exp, 'Orders by status: ' . wp_json_encode( $by ) );
		foreach ( array_slice( $bad, 0, 20 ) as $x ) $R[] = array( false, $x );
		return $R;
	}

	/* ------------------------------------------------------------------ admin page */

	static function menu() {
		add_management_page( 'CHILS history import', 'CHILS history import', 'manage_options', 'chils-history-import', array( __CLASS__, 'page' ) );
	}

	static function page() {
		if ( ! current_user_can( 'manage_options' ) ) return;
		$out = '';
		if ( $_SERVER['REQUEST_METHOD'] === 'POST' && check_admin_referer( 'chils_hi' ) ) {
			$do = sanitize_key( $_POST['do'] ?? '' );
			if ( $do === 'upload' && ! empty( $_FILES['bundle']['tmp_name'] ) && is_uploaded_file( $_FILES['bundle']['tmp_name'] ) ) {
				$j = json_decode( file_get_contents( $_FILES['bundle']['tmp_name'] ), true );
				if ( ! is_array( $j ) || ( $j['format'] ?? 0 ) !== 1 || empty( $j['users'] ) ) $out .= '<div class="notice notice-error"><p>That is not a CHILS import file.</p></div>';
				else {
					$old = get_option( self::FILE ); if ( $old && file_exists( $old ) ) @unlink( $old );
					$path = self::dir() . '/bundle-' . wp_generate_password( 24, false ) . '.json';
					move_uploaded_file( $_FILES['bundle']['tmp_name'], $path ); @chmod( $path, 0600 );
					update_option( self::FILE, $path, false );
					delete_option( self::STATE );
					$out .= '<div class="notice notice-success"><p>Import file loaded. Run the dry run next.</p></div>';
				}
			} elseif ( $do === 'dry' || $do === 'import' ) {
				$r = self::run( $do === 'dry' );
				if ( isset( $r['error'] ) ) $out .= '<div class="notice notice-error"><p>' . esc_html( $r['error'] ) . '</p></div>';
				else {
					$st = $r['state']['stats'];
					$out .= '<div class="notice notice-' . ( $r['done'] ? 'success' : 'warning' ) . '"><p><strong>' . ( $do === 'dry' ? 'Dry run (nothing was created)' : ( $r['done'] ? 'Import finished' : 'Import paused: press Import again to continue' ) ) . '</strong></p><pre>' . esc_html( wp_json_encode( $st, JSON_PRETTY_PRINT ) ) . '</pre>';
					if ( $r['state']['log'] ) $out .= '<p>Notes:</p><ul style="list-style:disc;margin-left:20px"><li>' . implode( '</li><li>', array_map( 'esc_html', array_slice( $r['state']['log'], -30 ) ) ) . '</li></ul>';
					$out .= '</div>';
				}
			} elseif ( $do === 'verify' ) {
				$out .= '<div class="notice"><p><strong>Verification</strong></p><ul>';
				foreach ( self::verify() as $v ) $out .= '<li>' . ( $v[0] ? '✅ ' : '❌ ' ) . esc_html( $v[1] ) . '</li>';
				$out .= '</ul></div>';
			} elseif ( $do === 'delete' ) {
				$f = get_option( self::FILE ); if ( $f && file_exists( $f ) ) @unlink( $f );
				delete_option( self::FILE );
				$out .= '<div class="notice notice-success"><p>Import file deleted from the server.</p></div>';
			}
		}
		$b = self::load();
		$nonce = wp_nonce_field( 'chils_hi', '_wpnonce', true, false );
		echo '<div class="wrap"><h1>CHILS history import</h1>' . $out;
		echo '<p>Brings over past customers with their <strong>existing passwords</strong> and their order history. No emails are sent, no stock moves, and nothing is pushed to Shiprocket while it runs. Do the dry run first.</p>';
		if ( $b ) {
			$e = $b['expected'];
			printf( '<p><strong>File loaded:</strong> %d customers · %d orders (%d from guests) · built %s</p>', $e['users'], $e['orders'], $e['guest_orders'], esc_html( $b['built_at'] ) );
			foreach ( array( 'dry' => 'Dry run (creates nothing)', 'import' => 'Import', 'verify' => 'Verify', ) as $k => $label ) {
				printf( '<form method="post" style="display:inline-block;margin-right:8px">%s<input type="hidden" name="do" value="%s"><button class="button%s">%s</button></form>', $nonce, $k, $k === 'import' ? ' button-primary' : '', esc_html( $label ) );
			}
			echo '<form method="post" style="display:inline-block" onsubmit="return confirm(\'Delete the import file (it contains password hashes)?\')">' . $nonce . '<input type="hidden" name="do" value="delete"><button class="button">Delete import file</button></form>';
		}
		echo '<h2>Load the import file</h2><form method="post" enctype="multipart/form-data">' . $nonce . '<input type="hidden" name="do" value="upload"><input type="file" name="bundle" accept=".json" required> <button class="button">Upload</button></form>';
		echo '<p style="color:#666">The file holds password hashes. It is stored where the web cannot read it. Delete it when you have verified the import.</p></div>';
	}
}

Chils_History_Import::boot();
