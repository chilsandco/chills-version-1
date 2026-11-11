<?php
/**
 * Plugin Name: CHILS Blank Stock
 * Description: Central inventory. Stock is counted on the plain tee (the "blank": body + colour + size). Every design size draws from its blank, so selling any design reduces the same shared count.
 * Version: 1.0.0
 * Author: CHILS & CO.
 * Requires Plugins: woocommerce
 * Requires PHP: 7.4
 */

defined( 'ABSPATH' ) || exit;

final class Chils_Blank_Stock {
	const VERSION = '1.0.0';
	const META    = '_chils_blank_sku';     // on a variation or simple product: which blank it uses
	const TAKEN   = '_chils_blank_taken';   // on an order item: how many tees were taken from the blank
	const TAKEN_SKU = '_chils_blank_taken_sku';
	const PULL    = 'Pull';                 // visible order-item meta: the blank the packer pulls
	const REASONS = array(
		'receive'        => 'Received from supplier',
		'sale'           => 'Sold',
		'cancel'         => 'Order cancelled (back to shelf)',
		'return_restock' => 'Return, back on shelf (grade A)',
		'return_damaged' => 'Return, damaged (not restocked)',
		'misprint'       => 'Misprint / waste',
		'sample'         => 'Sample or giveaway',
		'count'          => 'Count correction',
		'adjust'         => 'Other adjustment',
	);

	/* ------------------------------------------------------------------ setup */

	static function boot() {
		register_activation_hook( __FILE__, array( __CLASS__, 'install' ) );
		add_action( 'before_woocommerce_init', function () {
			if ( class_exists( '\Automattic\WooCommerce\Utilities\FeaturesUtil' ) ) {
				\Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'custom_order_tables', __FILE__, true );
			}
		} );
		add_action( 'plugins_loaded', array( __CLASS__, 'init' ) );
	}

	static function init() {
		if ( ! class_exists( 'WooCommerce' ) ) return;
		if ( get_option( 'chils_blank_db' ) !== self::VERSION ) self::install();

		// orders: take from / give back to the blank
		foreach ( array( 'woocommerce_payment_complete', 'woocommerce_order_status_processing', 'woocommerce_order_status_completed', 'woocommerce_order_status_on-hold' ) as $h ) {
			add_action( $h, array( __CLASS__, 'take_for_order' ), 20 );
		}
		foreach ( array( 'woocommerce_order_status_cancelled', 'woocommerce_order_status_pending', 'woocommerce_order_status_failed' ) as $h ) {
			add_action( $h, array( __CLASS__, 'give_back_for_order' ), 20 );
		}
		add_action( 'woocommerce_new_order_item', array( __CLASS__, 'tag_new_item' ), 10, 3 );

		// shoppers: never sell more than the blank has
		// runs inside WC_Cart::add_to_cart for every path (product form, Store API, code); throwing stops the add
		add_filter( 'woocommerce_add_cart_item_data', array( __CLASS__, 'guard_add_to_cart' ), 99, 4 );
		add_filter( 'woocommerce_update_cart_validation', array( __CLASS__, 'validate_cart_update' ), 20, 4 );
		add_action( 'woocommerce_check_cart_items', array( __CLASS__, 'validate_cart' ) );
		add_filter( 'woocommerce_available_variation', array( __CLASS__, 'variation_max_qty' ), 20, 3 );
		add_filter( 'woocommerce_quantity_input_max', array( __CLASS__, 'simple_max_qty' ), 20, 2 );
		add_filter( 'woocommerce_rest_pre_insert_shop_order_object', array( __CLASS__, 'validate_rest_order' ), 20, 3 );

		// REST: expose blank info on products, plus our own endpoints for the Slack bot
		add_filter( 'woocommerce_rest_prepare_product_object', array( __CLASS__, 'rest_product_field' ), 20, 2 );
		add_filter( 'woocommerce_rest_prepare_product_variation_object', array( __CLASS__, 'rest_product_field' ), 20, 2 );
		add_action( 'rest_api_init', array( __CLASS__, 'routes' ) );

		// admin
		add_action( 'admin_menu', array( __CLASS__, 'menu' ), 60 );
		add_action( 'woocommerce_product_after_variable_attributes', array( __CLASS__, 'variation_field' ), 10, 3 );
		add_action( 'woocommerce_save_product_variation', array( __CLASS__, 'save_variation_field' ), 10, 2 );
		add_action( 'woocommerce_product_options_inventory_product_data', array( __CLASS__, 'simple_field' ) );
		add_action( 'woocommerce_admin_process_product_object', array( __CLASS__, 'save_simple_field' ) );
	}

	static function t_blanks() { global $wpdb; return $wpdb->prefix . 'chils_blanks'; }
	static function t_moves()  { global $wpdb; return $wpdb->prefix . 'chils_stock_moves'; }

	static function install() {
		global $wpdb;
		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		$c = $wpdb->get_charset_collate();
		dbDelta( 'CREATE TABLE ' . self::t_blanks() . " (
			sku varchar(40) NOT NULL,
			body varchar(60) NOT NULL DEFAULT '',
			colour varchar(60) NOT NULL DEFAULT '',
			size varchar(8) NOT NULL DEFAULT '',
			on_hand int NOT NULL DEFAULT 0,
			alert_below int NOT NULL DEFAULT 3,
			updated_at datetime NOT NULL,
			PRIMARY KEY  (sku)
		) $c;" );
		dbDelta( 'CREATE TABLE ' . self::t_moves() . " (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			sku varchar(40) NOT NULL,
			delta int NOT NULL,
			after_qty int NOT NULL,
			reason varchar(30) NOT NULL,
			order_id bigint(20) unsigned NOT NULL DEFAULT 0,
			item_id bigint(20) unsigned NOT NULL DEFAULT 0,
			user_id bigint(20) unsigned NOT NULL DEFAULT 0,
			note varchar(255) NOT NULL DEFAULT '',
			created_at datetime NOT NULL,
			PRIMARY KEY  (id),
			KEY sku (sku),
			KEY order_id (order_id)
		) $c;" );
		update_option( 'chils_blank_db', self::VERSION );
	}

	/* ------------------------------------------------------------------ the ledger */

	static function blank( $sku ) {
		global $wpdb;
		return $sku ? $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM ' . self::t_blanks() . ' WHERE sku = %s', $sku ) ) : null;
	}

	static function all_blanks() {
		global $wpdb;
		return $wpdb->get_results( 'SELECT * FROM ' . self::t_blanks() . ' ORDER BY body, colour, CASE size WHEN "S" THEN 1 WHEN "M" THEN 2 WHEN "L" THEN 3 WHEN "XL" THEN 4 WHEN "XXL" THEN 5 ELSE 6 END' );
	}

	static function buffer() { return max( 0, (int) get_option( 'chils_blank_buffer', 0 ) ); }

	/** What the website may sell: on hand minus the safety buffer. */
	static function available( $sku ) {
		$b = self::blank( $sku );
		return $b ? max( 0, (int) $b->on_hand - self::buffer() ) : null;
	}

	/** Every stock change goes through here and is logged with a reason. Returns the new on-hand count. */
	static function move( $sku, $delta, $reason, $args = array() ) {
		global $wpdb;
		$delta = (int) $delta;
		if ( ! isset( self::REASONS[ $reason ] ) ) return new WP_Error( 'chils_reason', 'Unknown reason: ' . $reason );
		$before = self::blank( $sku );
		if ( ! $before ) return new WP_Error( 'chils_no_blank', 'No blank called ' . $sku );
		// one atomic UPDATE, so two orders at the same moment can't both read the old number
		$wpdb->query( $wpdb->prepare( 'UPDATE ' . self::t_blanks() . ' SET on_hand = on_hand + %d, updated_at = %s WHERE sku = %s', $delta, current_time( 'mysql', true ), $sku ) );
		$after = (int) $wpdb->get_var( $wpdb->prepare( 'SELECT on_hand FROM ' . self::t_blanks() . ' WHERE sku = %s', $sku ) );
		$wpdb->insert( self::t_moves(), array(
			'sku' => $sku, 'delta' => $delta, 'after_qty' => $after, 'reason' => $reason,
			'order_id' => (int) ( $args['order_id'] ?? 0 ), 'item_id' => (int) ( $args['item_id'] ?? 0 ),
			'user_id' => get_current_user_id(), 'note' => substr( (string) ( $args['note'] ?? '' ), 0, 255 ),
			'created_at' => current_time( 'mysql', true ),
		) );
		self::after_change( $sku, (int) $before->on_hand, $after );
		return $after;
	}

	/** Create a blank, or set its count (logged as the difference). */
	static function set_count( $sku, $qty, $fields = array(), $note = 'count' ) {
		global $wpdb;
		$sku = self::clean_sku( $sku );
		if ( ! $sku ) return new WP_Error( 'chils_sku', 'Blank SKU is empty or invalid' );
		$b = self::blank( $sku );
		$now = current_time( 'mysql', true );
		if ( ! $b ) {
			$wpdb->insert( self::t_blanks(), array(
				'sku' => $sku, 'body' => $fields['body'] ?? '', 'colour' => $fields['colour'] ?? '', 'size' => $fields['size'] ?? '',
				'on_hand' => 0, 'alert_below' => (int) ( $fields['alert_below'] ?? 3 ), 'updated_at' => $now,
			) );
			$b = self::blank( $sku );
		} else {
			$upd = array_intersect_key( $fields, array_flip( array( 'body', 'colour', 'size', 'alert_below' ) ) );
			if ( $upd ) $wpdb->update( self::t_blanks(), $upd, array( 'sku' => $sku ) );
		}
		$diff = (int) $qty - (int) $b->on_hand;
		if ( $diff !== 0 ) return self::move( $sku, $diff, 'count', array( 'note' => $note ) );
		self::sync_products( $sku );
		return (int) $qty;
	}

	static function clean_sku( $s ) {
		$s = strtoupper( trim( (string) $s ) );
		return preg_match( '/^[A-Z0-9]+(-[A-Z0-9]+)*$/', $s ) && strlen( $s ) <= 40 ? $s : '';
	}

	/* ------------------------------------------------------------------ products that point at a blank */

	static function sku_for_product( $product ) {
		if ( ! $product ) return '';
		$sku = $product->get_meta( self::META );
		if ( ! $sku && $product->is_type( 'variation' ) ) { // a variation may inherit from its parent (simple-ish products)
			$parent = wc_get_product( $product->get_parent_id() );
			$sku = $parent ? $parent->get_meta( self::META ) : '';
		}
		return (string) $sku;
	}

	static function linked_ids( $sku ) {
		global $wpdb;
		return array_map( 'intval', $wpdb->get_col( $wpdb->prepare( "SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key = %s AND meta_value = %s", self::META, $sku ) ) );
	}

	/** Make every design on this blank show the blank's real availability. */
	static function sync_products( $sku ) {
		$avail = self::available( $sku );
		if ( $avail === null ) return;
		$status = $avail > 0 ? 'instock' : 'outofstock';
		foreach ( self::linked_ids( $sku ) as $id ) {
			$p = wc_get_product( $id );
			if ( ! $p ) continue;
			$dirty = false;
			if ( $p->get_manage_stock() ) { $p->set_manage_stock( false ); $dirty = true; } // the blank owns the count
			if ( $p->get_stock_status() !== $status ) { $p->set_stock_status( $status ); $dirty = true; }
			if ( $dirty ) $p->save(); // a variation save re-syncs its parent's status too
		}
	}

	static function after_change( $sku, $before, $after ) {
		self::sync_products( $sku );
		$b = self::blank( $sku );
		$alert = (int) $b->alert_below;
		$designs = count( self::linked_ids( $sku ) );
		if ( $after < 0 ) {
			self::alert( 'oversold', $b, sprintf( ':rotating_light: *Oversold* %s: on hand is now %d. %d design(s) affected. Check the latest orders.', self::label( $b ), $after, $designs ) );
		} elseif ( $after <= 0 && $before > 0 ) {
			self::alert( 'sold_out', $b, sprintf( ':no_entry: *Sold out* %s: all %d design(s) on it now show sold out.', self::label( $b ), $designs ) );
		} elseif ( $after < $alert && $before >= $alert ) {
			self::alert( 'low', $b, sprintf( ':warning: *Low stock* %s: %d left (alert below %d). Used by %d design(s).', self::label( $b ), $after, $alert, $designs ) );
		} elseif ( $before <= 0 && $after > 0 ) {
			self::alert( 'back', $b, sprintf( ':white_check_mark: *Back in stock* %s: %d on hand.', self::label( $b ), $after ) );
		}
	}

	static function label( $b ) {
		return trim( sprintf( '%s · %s · %s (%s)', $b->body, $b->colour, $b->size, $b->sku ), ' ·' );
	}

	static function alert( $type, $blank, $text ) {
		do_action( 'chils_blank_alert', $type, $blank, $text );
		$hook = get_option( 'chils_blank_slack_webhook', '' );
		if ( $hook && strpos( $hook, 'https://hooks.slack.com/' ) === 0 ) {
			wp_remote_post( $hook, array( 'blocking' => false, 'timeout' => 3, 'headers' => array( 'Content-Type' => 'application/json' ), 'body' => wp_json_encode( array( 'text' => $text ) ) ) );
		}
	}

	/* ------------------------------------------------------------------ orders */

	static function item_blank( $item ) {
		$pid = $item->get_variation_id() ?: $item->get_product_id();
		return self::sku_for_product( wc_get_product( $pid ) );
	}

	static function tag_new_item( $item_id, $item, $order_id ) {
		if ( ! $item instanceof WC_Order_Item_Product ) return;
		$sku = self::item_blank( $item );
		if ( $sku && ! wc_get_order_item_meta( $item_id, self::PULL, true ) ) wc_add_order_item_meta( $item_id, self::PULL, $sku );
	}

	/** Orders brought over from the old store are history: their tees were already counted in the shelf count, so they never move stock. */
	static function is_history( $order ) {
		return ( defined( 'CHILS_IMPORTING' ) && CHILS_IMPORTING ) || (bool) $order->get_meta( '_chils_imported' );
	}

		/** Paid / on-hold / completed: take each item's tees from its blank, exactly once per item. */
	static function take_for_order( $order_id ) {
		$order = wc_get_order( $order_id );
		if ( ! $order || self::is_history( $order ) ) return;
		$lines = array();
		foreach ( $order->get_items() as $item_id => $item ) {
			if ( (int) $item->get_meta( self::TAKEN ) > 0 ) continue; // already taken: duplicate hooks or presses do nothing
			$sku = self::item_blank( $item );
			if ( ! $sku || ! self::blank( $sku ) ) continue;
			$qty = (int) $item->get_quantity() - absint( $order->get_qty_refunded_for_item( $item_id ) );
			if ( $qty <= 0 ) continue;
			$item->update_meta_data( self::TAKEN, $qty );
			$item->update_meta_data( self::TAKEN_SKU, $sku );
			if ( ! $item->get_meta( self::PULL ) ) $item->update_meta_data( self::PULL, $sku );
			$item->save(); // mark first, so a parallel hook skips it
			$after = self::move( $sku, -$qty, 'sale', array( 'order_id' => $order->get_id(), 'item_id' => $item_id, 'note' => $item->get_name() ) );
			$lines[] = sprintf( '%s −%d (now %s)', $sku, $qty, is_wp_error( $after ) ? '?' : $after );
		}
		if ( $lines ) $order->add_order_note( 'Blank stock taken: ' . implode( ', ', $lines ) );
	}

	/** Cancelled / failed / back to pending: give the tees back. */
	static function give_back_for_order( $order_id ) {
		$order = wc_get_order( $order_id );
		if ( ! $order || self::is_history( $order ) ) return;
		$lines = array();
		foreach ( $order->get_items() as $item_id => $item ) {
			$qty = (int) $item->get_meta( self::TAKEN );
			$sku = (string) $item->get_meta( self::TAKEN_SKU );
			if ( $qty <= 0 || ! $sku ) continue;
			$item->delete_meta_data( self::TAKEN );
			$item->delete_meta_data( self::TAKEN_SKU );
			$item->save();
			$after = self::move( $sku, $qty, 'cancel', array( 'order_id' => $order->get_id(), 'item_id' => $item_id, 'note' => 'Order ' . $order->get_status() ) );
			$lines[] = sprintf( '%s +%d (now %s)', $sku, $qty, is_wp_error( $after ) ? '?' : $after );
		}
		if ( $lines ) $order->add_order_note( 'Blank stock returned to shelf: ' . implode( ', ', $lines ) );
	}

	/* ------------------------------------------------------------------ never oversell */

	static function demand_in_cart( $skip_key = null ) {
		$need = array();
		if ( ! WC()->cart ) return $need;
		foreach ( WC()->cart->get_cart() as $key => $ci ) {
			if ( $key === $skip_key ) continue;
			$sku = self::sku_for_product( $ci['data'] ?? null );
			if ( $sku ) $need[ $sku ] = ( $need[ $sku ] ?? 0 ) + (int) $ci['quantity'];
		}
		return $need;
	}

	static function guard_add_to_cart( $data, $product_id, $variation_id, $qty ) {
		$sku = self::sku_for_product( wc_get_product( $variation_id ?: $product_id ) );
		if ( ! $sku ) return $data;
		$avail = (int) self::available( $sku );
		$in_cart = self::demand_in_cart()[ $sku ] ?? 0;
		if ( $in_cart + (int) $qty > $avail ) {
			throw new Exception( $avail > 0
				? sprintf( 'Only %d left in this size and colour (your cart already has %d).', $avail, $in_cart )
				: 'Sorry, this size and colour just sold out.' );
		}
		return $data;
	}

	static function validate_cart_update( $passed, $key, $values, $qty ) {
		$sku = self::sku_for_product( $values['data'] ?? null );
		if ( ! $passed || ! $sku ) return $passed;
		$avail = (int) self::available( $sku );
		$other = self::demand_in_cart( $key )[ $sku ] ?? 0;
		if ( $other + (int) $qty > $avail ) {
			wc_add_notice( sprintf( 'Only %d left in this size and colour.', $avail ), 'error' );
			return false;
		}
		return $passed;
	}

	static function validate_cart() {
		foreach ( self::demand_in_cart() as $sku => $need ) {
			$avail = (int) self::available( $sku );
			if ( $need > $avail ) {
				$b = self::blank( $sku );
				wc_add_notice( sprintf( 'Only %d left of %s %s in size %s, but your cart has %d. Please reduce the quantity.', $avail, $b ? $b->colour : '', $b ? $b->body : '', $b ? $b->size : '', $need ), 'error' );
			}
		}
	}

	static function variation_max_qty( $data, $product, $variation ) {
		$sku = self::sku_for_product( $variation );
		if ( $sku ) {
			$avail = (int) self::available( $sku );
			$data['max_qty'] = $avail;
			$data['is_in_stock'] = $avail > 0;
			$data['chils_available'] = $avail;
		}
		return $data;
	}

	static function simple_max_qty( $max, $product ) {
		$sku = self::sku_for_product( $product );
		return $sku ? (int) self::available( $sku ) : $max;
	}

	/** Orders created through the API (the headless site) are checked too. */
	static function validate_rest_order( $order, $request, $creating ) {
		if ( ! $creating || is_wp_error( $order ) ) return $order;
		$need = array();
		foreach ( $order->get_items() as $item ) {
			$sku = self::item_blank( $item );
			if ( $sku ) $need[ $sku ] = ( $need[ $sku ] ?? 0 ) + (int) $item->get_quantity();
		}
		foreach ( $need as $sku => $n ) {
			$avail = (int) self::available( $sku );
			if ( $n > $avail ) {
				$b = self::blank( $sku );
				return new WP_Error( 'chils_out_of_stock', sprintf( 'Only %d left of %s, but the order asks for %d.', $avail, $b ? self::label( $b ) : $sku, $n ), array( 'status' => 409, 'sku' => $sku, 'available' => $avail ) );
			}
		}
		return $order;
	}

	/* ------------------------------------------------------------------ REST */

	static function rest_product_field( $response, $product ) {
		$sku = self::sku_for_product( $product );
		if ( $sku ) {
			$b = self::blank( $sku );
			$response->data['chils_blank'] = array( 'sku' => $sku, 'available' => (int) self::available( $sku ), 'label' => $b ? self::label( $b ) : $sku );
		}
		return $response;
	}

	static function routes() {
		$can = function () { return current_user_can( 'manage_woocommerce' ); };
		register_rest_route( 'wc/v3', '/chils/blanks', array( 'methods' => 'GET', 'permission_callback' => $can, 'callback' => function () {
			return array_map( array( __CLASS__, 'blank_out' ), self::all_blanks() );
		} ) );
		register_rest_route( 'wc/v3', '/chils/blanks/adjust', array( 'methods' => 'POST', 'permission_callback' => $can, 'callback' => function ( WP_REST_Request $r ) {
			$sku = self::clean_sku( $r['sku'] );
			$res = $r['set'] !== null && $r['set'] !== ''
				? self::set_count( $sku, (int) $r['set'], array(), (string) $r['note'] )
				: self::move( $sku, (int) $r['delta'], (string) $r['reason'], array( 'note' => (string) $r['note'] ) );
			if ( is_wp_error( $res ) ) return new WP_Error( $res->get_error_code(), $res->get_error_message(), array( 'status' => 400 ) );
			return self::blank_out( self::blank( $sku ) );
		} ) );
		register_rest_route( 'wc/v3', '/chils/moves', array( 'methods' => 'GET', 'permission_callback' => $can, 'callback' => function ( WP_REST_Request $r ) {
			global $wpdb;
			$sku = self::clean_sku( $r['sku'] );
			$sql = 'SELECT * FROM ' . self::t_moves() . ( $sku ? $wpdb->prepare( ' WHERE sku = %s', $sku ) : '' ) . ' ORDER BY id DESC LIMIT ' . min( 500, max( 1, (int) ( $r['limit'] ?: 100 ) ) );
			return $wpdb->get_results( $sql );
		} ) );
	}

	static function blank_out( $b ) {
		return array(
			'sku' => $b->sku, 'body' => $b->body, 'colour' => $b->colour, 'size' => $b->size,
			'on_hand' => (int) $b->on_hand, 'available' => max( 0, (int) $b->on_hand - self::buffer() ), 'alert_below' => (int) $b->alert_below,
			'designs' => count( self::linked_ids( $b->sku ) ),
			'status' => $b->on_hand <= 0 ? 'sold_out' : ( $b->on_hand < $b->alert_below ? 'low' : 'ok' ),
		);
	}

	/* ------------------------------------------------------------------ admin: product fields */

	static function blank_options( $current ) {
		$o = '<option value="">— none —</option>';
		foreach ( self::all_blanks() as $b ) {
			$o .= sprintf( '<option value="%s"%s>%s</option>', esc_attr( $b->sku ), selected( $current, $b->sku, false ), esc_html( self::label( $b ) . ' · ' . $b->on_hand . ' on hand' ) );
		}
		return $o;
	}

	static function variation_field( $loop, $data, $variation ) {
		$cur = get_post_meta( $variation->ID, self::META, true );
		printf( '<p class="form-row form-row-full"><label>Blank (central stock)</label><select name="chils_blank[%d]" style="width:100%%">%s</select></p>', (int) $loop, self::blank_options( $cur ) );
	}

	static function save_variation_field( $variation_id, $i ) {
		if ( ! isset( $_POST['chils_blank'][ $i ] ) ) return;
		self::link( $variation_id, wp_unslash( $_POST['chils_blank'][ $i ] ) );
	}

	static function simple_field() {
		global $product_object;
		if ( ! $product_object || ! $product_object->is_type( 'simple' ) ) return;
		echo '<div class="options_group"><p class="form-field"><label>Blank (central stock)</label><select name="chils_blank_simple">' . self::blank_options( $product_object->get_meta( self::META ) ) . '</select></p></div>';
	}

	static function save_simple_field( $product ) {
		if ( isset( $_POST['chils_blank_simple'] ) && $product->is_type( 'simple' ) ) {
			$sku = self::clean_sku( wp_unslash( $_POST['chils_blank_simple'] ) );
			if ( $sku && self::blank( $sku ) ) { $product->update_meta_data( self::META, $sku ); $product->set_manage_stock( false ); }
			elseif ( ! $sku ) $product->delete_meta_data( self::META );
		}
	}

	/** Point a product/variation at a blank (or unlink with ''), then refresh its stock status. */
	static function link( $product_id, $sku ) {
		$sku = self::clean_sku( $sku );
		$p = wc_get_product( $product_id );
		if ( ! $p ) return new WP_Error( 'chils_product', 'No product ' . $product_id );
		if ( $sku === '' ) { $p->delete_meta_data( self::META ); $p->save(); return true; }
		if ( ! self::blank( $sku ) ) return new WP_Error( 'chils_no_blank', 'No blank called ' . $sku );
		$p->update_meta_data( self::META, $sku );
		$p->set_manage_stock( false );
		$p->save();
		self::sync_products( $sku );
		return true;
	}

	/* ------------------------------------------------------------------ admin: Blank stock page */

	static function menu() {
		add_submenu_page( 'woocommerce', 'Blank stock', 'Blank stock', 'manage_woocommerce', 'chils-blank-stock', array( __CLASS__, 'page' ) );
	}

	static function read_csv( $field ) {
		if ( empty( $_FILES[ $field ]['tmp_name'] ) || ! is_uploaded_file( $_FILES[ $field ]['tmp_name'] ) ) return array();
		$fh = fopen( $_FILES[ $field ]['tmp_name'], 'r' );
		$head = array_map( function ( $h ) { return strtolower( trim( preg_replace( '/^\xEF\xBB\xBF/', '', $h ) ) ); }, (array) fgetcsv( $fh ) );
		$rows = array();
		while ( ( $r = fgetcsv( $fh ) ) !== false ) {
			if ( count( array_filter( $r, 'strlen' ) ) === 0 ) continue;
			$rows[] = array_combine( $head, array_pad( array_slice( $r, 0, count( $head ) ), count( $head ), '' ) );
		}
		fclose( $fh );
		return $rows;
	}

	/** blanks.csv: sku, body, colour, size, on_hand, alert_below */
	static function import_blanks( $rows ) {
		$ok = 0; $err = array();
		foreach ( $rows as $n => $r ) {
			if ( ! is_numeric( $r['on_hand'] ?? '' ) || (int) $r['on_hand'] < 0 ) { $err[] = 'Row ' . ( $n + 2 ) . ': on_hand must be a whole number ≥ 0'; continue; }
			$res = self::set_count( $r['sku'] ?? '', (int) $r['on_hand'], array(
				'body' => sanitize_text_field( $r['body'] ?? '' ), 'colour' => sanitize_text_field( $r['colour'] ?? '' ),
				'size' => sanitize_text_field( $r['size'] ?? '' ), 'alert_below' => (int) ( $r['alert_below'] ?? 3 ),
			), 'import' );
			if ( is_wp_error( $res ) ) $err[] = 'Row ' . ( $n + 2 ) . ': ' . $res->get_error_message();
			else $ok++;
		}
		return array( $ok, $err );
	}

	/** designs.csv: design_sku, blank_sku (design_sku = the product/variation SKU in the store) */
	static function import_links( $rows ) {
		$ok = 0; $err = array();
		foreach ( $rows as $n => $r ) {
			$ds = trim( $r['design_sku'] ?? '' );
			$id = $ds ? wc_get_product_id_by_sku( $ds ) : 0;
			if ( ! $id ) { $err[] = 'Row ' . ( $n + 2 ) . ": no product with SKU $ds"; continue; }
			$res = self::link( $id, $r['blank_sku'] ?? '' );
			if ( is_wp_error( $res ) ) $err[] = 'Row ' . ( $n + 2 ) . ': ' . $res->get_error_message();
			else $ok++;
		}
		return array( $ok, $err );
	}

	static function page() {
		if ( ! current_user_can( 'manage_woocommerce' ) ) return;
		$msg = array();
		if ( $_SERVER['REQUEST_METHOD'] === 'POST' && check_admin_referer( 'chils_blank_stock' ) ) {
			$do = sanitize_key( $_POST['do'] ?? '' );
			if ( $do === 'adjust' ) {
				$res = self::move( self::clean_sku( wp_unslash( $_POST['sku'] ?? '' ) ), (int) $_POST['delta'], sanitize_key( $_POST['reason'] ?? '' ), array( 'note' => sanitize_text_field( wp_unslash( $_POST['note'] ?? '' ) ) ) );
				$msg[] = is_wp_error( $res ) ? array( 'error', $res->get_error_message() ) : array( 'success', 'Saved. On hand is now ' . $res . '.' );
			} elseif ( $do === 'blanks' ) {
				list( $ok, $err ) = self::import_blanks( self::read_csv( 'csv' ) );
				$msg[] = array( $err ? 'warning' : 'success', "Blanks imported: $ok." . ( $err ? ' Problems: ' . implode( '; ', array_slice( $err, 0, 10 ) ) : '' ) );
			} elseif ( $do === 'links' ) {
				list( $ok, $err ) = self::import_links( self::read_csv( 'csv' ) );
				$msg[] = array( $err ? 'warning' : 'success', "Designs linked: $ok." . ( $err ? ' Problems: ' . implode( '; ', array_slice( $err, 0, 10 ) ) : '' ) );
			} elseif ( $do === 'settings' ) {
				update_option( 'chils_blank_buffer', max( 0, (int) $_POST['buffer'] ) );
				$hook = esc_url_raw( wp_unslash( $_POST['webhook'] ?? '' ) );
				update_option( 'chils_blank_slack_webhook', strpos( $hook, 'https://hooks.slack.com/' ) === 0 ? $hook : '' );
				foreach ( self::all_blanks() as $b ) self::sync_products( $b->sku );
				$msg[] = array( 'success', 'Settings saved.' );
			}
		}
		$blanks = self::all_blanks();
		$total = array_sum( wp_list_pluck( $blanks, 'on_hand' ) );
		$out = count( array_filter( $blanks, function ( $b ) { return $b->on_hand <= 0; } ) );
		$low = count( array_filter( $blanks, function ( $b ) { return $b->on_hand > 0 && $b->on_hand < $b->alert_below; } ) );
		global $wpdb;
		$moves = $wpdb->get_results( 'SELECT * FROM ' . self::t_moves() . ' ORDER BY id DESC LIMIT 100' );
		$nonce = wp_nonce_field( 'chils_blank_stock', '_wpnonce', true, false );
		echo '<div class="wrap"><h1>Blank stock</h1><p>Stock is counted on the plain tee. Every design size points at one blank; selling any design takes from that blank.</p>';
		foreach ( $msg as $m ) printf( '<div class="notice notice-%s"><p>%s</p></div>', esc_attr( $m[0] ), esc_html( $m[1] ) );
		printf( '<p><strong>%d</strong> tees on hand · <strong>%d</strong> blanks · <strong style="color:#a2412e">%d sold out</strong> · <strong style="color:#b7791f">%d low</strong> · safety buffer %d</p>', $total, count( $blanks ), $out, $low, self::buffer() );

		echo '<h2>Adjust stock</h2><form method="post" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">' . $nonce . '<input type="hidden" name="do" value="adjust"><select name="sku" required>' . self::blank_options( '' ) . '</select>';
		echo '<input type="number" name="delta" placeholder="+12 or -1" required style="width:110px"><select name="reason">';
		foreach ( self::REASONS as $k => $v ) if ( ! in_array( $k, array( 'sale', 'cancel' ), true ) ) printf( '<option value="%s">%s</option>', esc_attr( $k ), esc_html( $v ) );
		echo '</select><input type="text" name="note" placeholder="Note (supplier, batch, who)" style="width:260px"><button class="button button-primary">Save</button></form>';

		echo '<h2>Blanks</h2><table class="widefat striped"><thead><tr><th>Blank SKU</th><th>Body</th><th>Colour</th><th>Size</th><th>On hand</th><th>Available</th><th>Alert below</th><th>Designs</th><th>Status</th></tr></thead><tbody>';
		foreach ( $blanks as $b ) {
			$o = self::blank_out( $b );
			$st = array( 'sold_out' => '<b style="color:#a2412e">Sold out</b>', 'low' => '<b style="color:#b7791f">Low</b>', 'ok' => 'OK' )[ $o['status'] ];
			printf( '<tr><td><code>%s</code></td><td>%s</td><td>%s</td><td>%s</td><td>%d</td><td>%d</td><td>%d</td><td>%d</td><td>%s</td></tr>', esc_html( $b->sku ), esc_html( $b->body ), esc_html( $b->colour ), esc_html( $b->size ), $o['on_hand'], $o['available'], $o['alert_below'], $o['designs'], $st );
		}
		echo '</tbody></table>';

		echo '<h2>Recent movements</h2><table class="widefat striped"><thead><tr><th>When (UTC)</th><th>Blank</th><th>Change</th><th>After</th><th>Reason</th><th>Order</th><th>Note</th></tr></thead><tbody>';
		foreach ( $moves as $m ) printf( '<tr><td>%s</td><td><code>%s</code></td><td>%+d</td><td>%d</td><td>%s</td><td>%s</td><td>%s</td></tr>', esc_html( $m->created_at ), esc_html( $m->sku ), $m->delta, $m->after_qty, esc_html( self::REASONS[ $m->reason ] ?? $m->reason ), $m->order_id ? '#' . (int) $m->order_id : '', esc_html( $m->note ) );
		echo '</tbody></table>';

		echo '<h2>Import</h2><form method="post" enctype="multipart/form-data">' . $nonce . '<input type="hidden" name="do" value="blanks"><p><strong>Blank counts</strong> (CSV: sku, body, colour, size, on_hand, alert_below). Existing blanks are set to the new count and the difference is logged as a count correction.</p><input type="file" name="csv" accept=".csv" required> <button class="button">Import blanks</button></form>';
		echo '<form method="post" enctype="multipart/form-data" style="margin-top:12px">' . $nonce . '<input type="hidden" name="do" value="links"><p><strong>Design links</strong> (CSV: design_sku, blank_sku). Import blanks first.</p><input type="file" name="csv" accept=".csv" required> <button class="button">Link designs</button></form>';

		echo '<h2>Settings</h2><form method="post">' . $nonce . '<input type="hidden" name="do" value="settings"><p><label>Safety buffer (tees kept back from the website per blank) <input type="number" min="0" name="buffer" value="' . esc_attr( self::buffer() ) . '" style="width:70px"></label></p>';
		echo '<p><label>Slack webhook for stock alerts <input type="url" name="webhook" value="' . esc_attr( get_option( 'chils_blank_slack_webhook', '' ) ) . '" style="width:420px" placeholder="https://hooks.slack.com/services/..."></label></p><button class="button">Save settings</button></form></div>';
	}
}

Chils_Blank_Stock::boot();
