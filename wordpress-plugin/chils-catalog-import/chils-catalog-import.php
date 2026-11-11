<?php
/**
 * Plugin Name: CHILS Catalog Import
 * Description: One-time import of the clean CHILS catalog: products, sizes with design codes, prices, pictures, categories, combos, coupons and store settings. Links every size to its blank (needs CHILS Blank Stock). Tools → CHILS catalog import. Always do a dry run first.
 * Version: 1.0.0
 * Author: CHILS & CO.
 * Requires Plugins: woocommerce
 * Requires PHP: 7.4
 */

defined( 'ABSPATH' ) || exit;

final class Chils_Catalog_Import {
	const STATE = 'chils_ci_state';
	const FILE  = 'chils_ci_file';
	const IMAGES = 'chils_ci_images'; // 'yes' (default) or 'no'
	const OLD   = '_chils_old_id';

	static function boot() { add_action( 'plugins_loaded', array( __CLASS__, 'init' ) ); }

	static function init() {
		if ( ! class_exists( 'WooCommerce' ) ) return;
		add_action( 'admin_menu', function () {
			add_management_page( 'CHILS catalog import', 'CHILS catalog import', 'manage_options', 'chils-catalog-import', array( __CLASS__, 'page' ) );
		} );
	}

	/* ------------------------------------------------------------------ files and state */

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

	/** Pictures can be uploaded here first (same folder layout as wp-content/uploads); otherwise they are fetched from the old store. */
	static function local_images_dir() { $u = wp_upload_dir(); return trailingslashit( $u['basedir'] ) . 'chils-import-images/'; }

	static function load() {
		$f = get_option( self::FILE );
		if ( ! $f || ! file_exists( $f ) ) return null;
		$b = json_decode( file_get_contents( $f ), true );
		return is_array( $b ) && ( $b['format'] ?? 0 ) === 1 && isset( $b['products'] ) ? $b : null;
	}

	static function state() {
		$s = get_option( self::STATE );
		return is_array( $s ) ? $s : array( 'products' => array(), 'images' => array(), 'log' => array(), 'stats' => array(), 'setup' => false );
	}

	static function bump( &$s, $k, $n = 1 ) { $s['stats'][ $k ] = ( $s['stats'][ $k ] ?? 0 ) + $n; }
	static function note( &$s, $line ) { $s['log'][] = $line; if ( count( $s['log'] ) > 300 ) array_shift( $s['log'] ); }
	static function ts( $gmt ) { return $gmt ? strtotime( $gmt . ' UTC' ) : null; }

	static function guards() {
		add_filter( 'woocommerce_webhook_should_deliver', '__return_false', 1 ); // nothing pushed to Shiprocket while importing
		add_filter( 'pre_wp_mail', '__return_true', 1 );
		add_filter( 'big_image_size_threshold', '__return_false' );          // keep originals as they are
		add_filter( 'intermediate_image_sizes_advanced', function ( $sizes ) { // only the sizes the store needs: much faster
			return array_intersect_key( $sizes, array_flip( array( 'thumbnail', 'woocommerce_thumbnail', 'woocommerce_gallery_thumbnail' ) ) );
		} );
	}

	/* ------------------------------------------------------------------ store setup: settings, attributes, categories */

	static function setup( $b, &$s ) {
		$st = $b['settings'];
		$map = array( 'currency' => 'woocommerce_currency', 'currency_position' => 'woocommerce_currency_pos', 'thousand_separator' => 'woocommerce_price_thousand_sep',
			'decimal_separator' => 'woocommerce_price_decimal_sep', 'number_of_decimals' => 'woocommerce_price_num_decimals', 'default_country' => 'woocommerce_default_country',
			'calc_taxes' => 'woocommerce_calc_taxes', 'enable_guest_checkout' => 'woocommerce_enable_guest_checkout', 'manage_stock' => 'woocommerce_manage_stock' );
		foreach ( $map as $k => $opt ) if ( isset( $st[ $k ] ) ) update_option( $opt, $st[ $k ] );
		if ( ! empty( $st['permalink'] ) && get_option( 'permalink_structure' ) !== $st['permalink'] ) { update_option( 'permalink_structure', $st['permalink'] ); flush_rewrite_rules( false ); }

		foreach ( $b['attributes'] as $a ) {
			$slug = substr( $a['tax'], 3 );
			if ( ! wc_attribute_taxonomy_id_by_name( $slug ) ) {
				$id = wc_create_attribute( array( 'name' => $a['label'], 'slug' => $slug, 'type' => 'select', 'order_by' => 'menu_order', 'has_archives' => false ) );
				if ( is_wp_error( $id ) ) { self::note( $s, 'Attribute ' . $a['label'] . ': ' . $id->get_error_message() ); continue; }
				self::bump( $s, 'attributes_created' );
			}
			if ( ! taxonomy_exists( $a['tax'] ) ) {
				register_taxonomy( $a['tax'], array( 'product' ), array( 'hierarchical' => false, 'show_ui' => false, 'query_var' => true, 'rewrite' => false ) );
			}
			foreach ( $a['terms'] as $i => $name ) {
				$t = term_exists( $name, $a['tax'] );
				if ( ! $t ) { $t = wp_insert_term( $name, $a['tax'] ); self::bump( $s, 'terms_created' ); }
				if ( ! is_wp_error( $t ) ) update_term_meta( (int) $t['term_id'], 'order', $i );
			}
		}
		$s['cats'] = array();
		foreach ( $b['categories'] as $c ) {
			$t = get_term_by( 'slug', $c['slug'], 'product_cat' );
			if ( ! $t ) { $r = wp_insert_term( $c['name'], 'product_cat', array( 'slug' => $c['slug'] ) ); $id = is_wp_error( $r ) ? 0 : (int) $r['term_id']; self::bump( $s, 'categories_created' ); }
			else $id = (int) $t->term_id;
			if ( $id ) $s['cats'][ $c['old_id'] ] = $id;
		}
		$s['setup'] = true;
	}

	static function term_ids( $tax, $names ) {
		$ids = array();
		foreach ( $names as $n ) {
			$t = term_exists( $n, $tax );
			if ( ! $t ) $t = wp_insert_term( $n, $tax );
			if ( ! is_wp_error( $t ) ) $ids[] = (int) $t['term_id'];
		}
		return $ids;
	}

	static function term_slug( $tax, $name ) {
		$t = get_term_by( 'name', $name, $tax );
		if ( ! $t ) { $r = wp_insert_term( $name, $tax ); $t = is_wp_error( $r ) ? null : get_term( $r['term_id'], $tax ); }
		return $t ? $t->slug : sanitize_title( $name );
	}

	/* ------------------------------------------------------------------ pictures */

	static function image( $img, $b, &$s, $dry ) {
		if ( ! $img || get_option( self::IMAGES, 'yes' ) !== 'yes' ) return 0;
		$rel = $img['rel'];
		if ( isset( $s['images'][ $rel ] ) && get_post( $s['images'][ $rel ] ) ) return (int) $s['images'][ $rel ];
		$found = get_posts( array( 'post_type' => 'attachment', 'post_status' => 'any', 'numberposts' => 1, 'fields' => 'ids', 'meta_key' => '_chils_img_rel', 'meta_value' => $rel ) );
		if ( $found ) return $s['images'][ $rel ] = (int) $found[0];
		$local = self::local_images_dir() . $rel;
		if ( $dry ) { self::bump( $s, file_exists( $local ) ? 'pictures_from_upload_folder' : 'pictures_from_old_store' ); return 0; }
		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/media.php';
		require_once ABSPATH . 'wp-admin/includes/image.php';
		if ( file_exists( $local ) ) { $tmp = wp_tempnam( basename( $rel ) ); copy( $local, $tmp ); $from = 'upload folder'; }
		else { $tmp = download_url( $b['image_base_url'] . implode( '/', array_map( 'rawurlencode', explode( '/', $rel ) ) ), 90 ); $from = 'old store'; }
		if ( is_wp_error( $tmp ) ) { self::note( $s, "Picture $rel ($from): " . $tmp->get_error_message() ); self::bump( $s, 'pictures_failed' ); return 0; }
		$id = media_handle_sideload( array( 'name' => basename( $rel ), 'tmp_name' => $tmp ), 0, $img['name'] ?: null );
		if ( is_wp_error( $id ) ) { @unlink( $tmp ); self::note( $s, "Picture $rel: " . $id->get_error_message() ); self::bump( $s, 'pictures_failed' ); return 0; }
		update_post_meta( $id, '_chils_img_rel', $rel );
		if ( $img['alt'] ) update_post_meta( $id, '_wp_attachment_image_alt', $img['alt'] );
		self::bump( $s, 'pictures_imported' );
		return $s['images'][ $rel ] = (int) $id;
	}

	/* ------------------------------------------------------------------ products */

	static function find( $old_id, $type = 'product' ) {
		$q = get_posts( array( 'post_type' => $type, 'post_status' => 'any', 'numberposts' => 1, 'fields' => 'ids', 'meta_key' => self::OLD, 'meta_value' => (int) $old_id ) );
		return $q ? (int) $q[0] : 0;
	}

	static function import_product( $p, $b, &$s, $dry ) {
		$ex = self::find( $p['old_id'] );
		if ( $ex ) return array( $ex, 'already' );
		if ( $dry ) {
			foreach ( $p['images'] as $i ) self::image( $i, $b, $s, true );
			foreach ( $p['variations'] as $v ) {
				if ( $v['sku'] && wc_get_product_id_by_sku( $v['sku'] ) ) self::note( $s, 'SKU ' . $v['sku'] . ' already exists in this store' );
				if ( class_exists( 'Chils_Blank_Stock' ) && ! Chils_Blank_Stock::blank( $v['blank'] ) ) self::bump( $s, 'sizes_whose_blank_is_not_loaded_yet' );
			}
			return array( 0, 'would_create' );
		}
		$cls = array( 'variable' => 'WC_Product_Variable', 'simple' => 'WC_Product_Simple', 'grouped' => 'WC_Product_Grouped' )[ $p['type'] ] ?? null;
		if ( ! $cls ) return array( 0, 'error: unknown type ' . $p['type'] );
		$prod = null;
		try {
			$imgs = array_values( array_filter( array_map( function ( $i ) use ( $b, &$s ) { return self::image( $i, $b, $s, false ); }, $p['images'] ) ) );
			$prod = new $cls();
			$prod->set_name( $p['name'] );
			$prod->set_slug( $p['slug'] );
			$prod->set_status( 'publish' );
			$prod->set_description( $p['description'] );
			$prod->set_short_description( $p['short_description'] );
			$prod->set_menu_order( (int) $p['menu_order'] );
			$prod->set_featured( (bool) $p['featured'] );
			$prod->set_reviews_allowed( (bool) $p['reviews_allowed'] );
			$prod->set_tax_status( $p['tax_status'] ?: 'taxable' );
			$prod->set_category_ids( array_values( array_filter( array_map( function ( $c ) use ( $s ) { return $s['cats'][ $c ] ?? 0; }, $p['categories'] ) ) ) );
			if ( $p['created_gmt'] ) $prod->set_date_created( self::ts( $p['created_gmt'] ) );
			if ( $imgs ) { $prod->set_image_id( $imgs[0] ); $prod->set_gallery_image_ids( array_slice( $imgs, 1 ) ); }
			if ( $p['type'] === 'simple' ) { $prod->set_regular_price( $p['regular_price'] ); $prod->set_sale_price( $p['sale_price'] ); }
			$attrs = array();
			foreach ( $p['attributes'] as $a ) {
				$pa = new WC_Product_Attribute();
				$pa->set_id( wc_attribute_taxonomy_id_by_name( substr( $a['tax'], 3 ) ) );
				$pa->set_name( $a['tax'] );
				$pa->set_options( self::term_ids( $a['tax'], $a['options'] ) );
				$pa->set_position( (int) $a['position'] );
				$pa->set_visible( (bool) $a['visible'] );
				$pa->set_variation( (bool) $a['variation'] );
				$attrs[] = $pa;
			}
			if ( $attrs ) $prod->set_attributes( $attrs );
			if ( $p['default_attributes'] ) {
				$d = array(); foreach ( $p['default_attributes'] as $da ) $d[ $da['tax'] ] = self::term_slug( $da['tax'], $da['option'] );
				$prod->set_default_attributes( $d );
			}
			$prod->update_meta_data( self::OLD, (int) $p['old_id'] );
			$prod->save();
			$pid = $prod->get_id();

			$linked = 0;
			foreach ( $p['variations'] as $v ) {
				$var = new WC_Product_Variation();
				$var->set_parent_id( $pid );
				$va = array(); foreach ( $v['attrs'] as $tax => $name ) $va[ $tax ] = self::term_slug( $tax, $name );
				$var->set_attributes( $va );
				$var->set_sku( $v['sku'] );
				$var->set_regular_price( $v['regular_price'] );
				$var->set_sale_price( $v['sale_price'] );
				$var->set_manage_stock( false ); // the blank owns the count
				$var->set_stock_status( 'instock' );
				$var->set_status( 'publish' );
				if ( $v['image'] ) { $iid = self::image( $v['image'], $b, $s, false ); if ( $iid ) $var->set_image_id( $iid ); }
				if ( $v['old_id'] ) $var->update_meta_data( self::OLD, (int) $v['old_id'] );
				if ( $v['vargal'] ) $var->update_meta_data( '_chils_old_vargal', $v['vargal'] ); // extra photos per colour, for later
				$var->update_meta_data( '_chils_blank_sku', $v['blank'] );
				$var->save();
				self::bump( $s, 'sizes_created' );
				if ( class_exists( 'Chils_Blank_Stock' ) && Chils_Blank_Stock::blank( $v['blank'] ) ) {
					$r = Chils_Blank_Stock::link( $var->get_id(), $v['blank'] );
					if ( ! is_wp_error( $r ) ) $linked++;
				}
			}
			if ( $p['type'] === 'variable' ) WC_Product_Variable::sync( $pid );
			self::bump( $s, 'sizes_linked_to_blank', $linked );
			return array( $pid, 'created' );
		} catch ( Exception $e ) {
			if ( $prod && $prod->get_id() ) { // leave nothing half-made: the next run tries it again cleanly
				foreach ( $prod->get_children() as $c ) wp_delete_post( $c, true );
				$prod->delete( true );
			}
			return array( 0, 'error: ' . $e->getMessage() );
		}
	}

	static function finish_combos( $b, &$s, $dry ) {
		foreach ( $b['products'] as $p ) {
			if ( $p['type'] !== 'grouped' ) continue;
			$id = self::find( $p['old_id'] );
			if ( ! $id || $dry ) continue;
			$kids = array_values( array_filter( array_map( array( __CLASS__, 'find' ), $p['grouped'] ) ) );
			$g = wc_get_product( $id );
			if ( count( $kids ) !== count( $p['grouped'] ) ) self::note( $s, 'Combo ' . $p['name'] . ': only ' . count( $kids ) . ' of ' . count( $p['grouped'] ) . ' tees found' );
			if ( $g->get_children() != $kids ) { $g->set_children( $kids ); $g->save(); }
		}
	}

	static function coupons_and_reviews( $b, &$s, $dry ) {
		foreach ( $b['coupons'] as $c ) {
			if ( wc_get_coupon_id_by_code( $c['code'] ) ) continue;
			if ( $dry ) { self::bump( $s, 'coupons_would_create' ); continue; }
			$k = new WC_Coupon();
			$k->set_code( $c['code'] ); $k->set_discount_type( $c['type'] ); $k->set_amount( $c['amount'] );
			if ( (float) $c['min'] > 0 ) $k->set_minimum_amount( $c['min'] );
			if ( $c['limit'] ) $k->set_usage_limit( (int) $c['limit'] );
			if ( $c['expires'] ) $k->set_date_expires( self::ts( $c['expires'] ) );
			$k->set_free_shipping( (bool) $c['free_shipping'] );
			$k->update_meta_data( '_chils_imported', 1 );
			$k->save();
			self::bump( $s, 'coupons_created' );
		}
		foreach ( $b['reviews'] as $r ) {
			$pid = self::find( $r['product'] );
			if ( ! $pid ) continue;
			$have = get_comments( array( 'post_id' => $pid, 'meta_key' => '_chils_imported', 'count' => true, 'status' => 'all' ) );
			if ( $have ) continue;
			if ( $dry ) { self::bump( $s, 'reviews_would_create' ); continue; }
			$cid = wp_insert_comment( array( 'comment_post_ID' => $pid, 'comment_author' => $r['name'], 'comment_author_email' => $r['email'], 'comment_content' => wp_strip_all_tags( $r['text'] ),
				'comment_type' => 'review', 'comment_approved' => $r['status'] === 'approved' ? 1 : 0,
				'comment_date_gmt' => gmdate( 'Y-m-d H:i:s', self::ts( $r['date_gmt'] ) ), 'comment_date' => get_date_from_gmt( gmdate( 'Y-m-d H:i:s', self::ts( $r['date_gmt'] ) ) ) ) );
			if ( $cid ) { add_comment_meta( $cid, 'rating', (int) $r['rating'] ); add_comment_meta( $cid, '_chils_imported', 1 ); self::bump( $s, 'reviews_created' ); }
		}
	}

	/* ------------------------------------------------------------------ the run */

	static function run( $dry ) {
		$b = self::load();
		if ( ! $b ) return array( 'error' => 'No import file loaded.' );
		self::guards();
		@set_time_limit( 0 );
		$max = (int) ini_get( 'max_execution_time' );
		$budget = $max > 0 ? max( 10, $max * 0.6 ) : 40;
		$t0 = microtime( true );
		$s = $dry ? array( 'products' => array(), 'images' => array(), 'log' => array(), 'stats' => array(), 'setup' => false, 'cats' => array() ) : self::state();
		if ( $dry ) {
			foreach ( $b['attributes'] as $a ) if ( ! wc_attribute_taxonomy_id_by_name( substr( $a['tax'], 3 ) ) ) self::bump( $s, 'attributes_would_create' );
			if ( ! class_exists( 'Chils_Blank_Stock' ) ) self::note( $s, 'CHILS Blank Stock is not active: sizes would not be linked to blanks. Activate it and load the blank counts first.' );
		} elseif ( empty( $s['setup'] ) ) {
			self::setup( $b, $s );
			update_option( self::STATE, $s, false );
		}
		$done = true;
		// tees first, combos last (they point at the tees)
		$order = array_merge( array_filter( $b['products'], function ( $p ) { return $p['type'] !== 'grouped'; } ), array_filter( $b['products'], function ( $p ) { return $p['type'] === 'grouped'; } ) );
		foreach ( $order as $p ) {
			if ( ! $dry && isset( $s['products'][ $p['old_id'] ] ) ) continue;
			if ( ! $dry && ( microtime( true ) - $t0 ) > $budget ) { $done = false; break; }
			list( $id, $res ) = self::import_product( $p, $b, $s, $dry );
			self::bump( $s, 'products_' . preg_replace( '/:.*/', '', $res ) );
			if ( strpos( $res, 'error' ) === 0 ) self::note( $s, $p['name'] . ': ' . $res );
			elseif ( ! $dry ) { $s['products'][ $p['old_id'] ] = $id; update_option( self::STATE, $s, false ); }
		}
		if ( $done ) { self::finish_combos( $b, $s, $dry ); self::coupons_and_reviews( $b, $s, $dry ); }
		if ( ! $dry ) { $s['finished'] = $done; update_option( self::STATE, $s, false ); }
		return array( 'done' => $done, 'state' => $s );
	}

	/* ------------------------------------------------------------------ verification */

	static function verify() {
		$b = self::load();
		if ( ! $b ) return array( array( false, 'No import file loaded.' ) );
		$R = array(); $bad = array(); $e = $b['expected'];
		$prods = 0; $vars = 0; $var_ok = 0; $linked = 0; $blank_missing = 0; $img_ok = 0; $img_exp = 0; $combo_ok = 0;
		$want_images = get_option( self::IMAGES, 'yes' ) === 'yes';
		foreach ( $b['products'] as $p ) {
			$id = self::find( $p['old_id'] );
			if ( ! $id ) { $bad[] = 'Missing product: ' . $p['name']; continue; }
			$w = wc_get_product( $id ); $prods++;
			$pr = array();
			if ( $w->get_type() !== $p['type'] ) $pr[] = 'type';
			if ( $w->get_slug() !== $p['slug'] ) $pr[] = 'web address (slug) ' . $w->get_slug();
			if ( $w->get_status() !== 'publish' ) $pr[] = 'not published';
			if ( $want_images && $p['images'] ) { $img_exp++; $n = ( $w->get_image_id() ? 1 : 0 ) + count( $w->get_gallery_image_ids() ); if ( $n === count( $p['images'] ) ) $img_ok++; else $pr[] = "pictures $n of " . count( $p['images'] ); }
			if ( $p['type'] === 'grouped' ) { if ( count( $w->get_children() ) === count( $p['grouped'] ) ) $combo_ok++; else $pr[] = 'combo tees ' . count( $w->get_children() ) . ' of ' . count( $p['grouped'] ); }
			if ( $p['type'] === 'variable' ) {
				if ( count( $w->get_children() ) !== count( $p['variations'] ) ) $pr[] = 'sizes ' . count( $w->get_children() ) . ' of ' . count( $p['variations'] );
				foreach ( $p['variations'] as $v ) {
					$vid = wc_get_product_id_by_sku( $v['sku'] ); $vars++;
					if ( ! $vid ) { $pr[] = 'missing ' . $v['sku']; continue; }
					$x = wc_get_product( $vid ); $vp = array();
					if ( $x->get_parent_id() !== $id ) $vp[] = 'wrong product';
					if ( abs( (float) $x->get_regular_price() - (float) $v['regular_price'] ) > 0.005 ) $vp[] = 'price ' . $x->get_regular_price();
					foreach ( $v['attrs'] as $tax => $name ) { $t = get_term_by( 'slug', $x->get_attributes()[ $tax ] ?? '', $tax ); if ( ! $t || $t->name !== $name ) $vp[] = $tax; }
					if ( $x->get_meta( '_chils_blank_sku' ) !== $v['blank'] ) $vp[] = 'blank';
					if ( $x->get_manage_stock() ) $vp[] = 'keeps its own stock';
					if ( class_exists( 'Chils_Blank_Stock' ) ) { if ( Chils_Blank_Stock::blank( $v['blank'] ) ) $linked++; else $blank_missing++; }
					if ( $vp ) $pr[] = $v['sku'] . ': ' . implode( ', ', $vp ); else $var_ok++;
				}
			}
			if ( $pr ) $bad[] = $p['name'] . ': ' . implode( '; ', array_slice( $pr, 0, 4 ) );
		}
		$R[] = array( $prods === (int) $e['products'], "Products in store: $prods of {$e['products']}" );
		$R[] = array( $var_ok === (int) $e['variations'], "Sizes correct (design code, price, size/colour, blank, no own stock): $var_ok of {$e['variations']}" );
		if ( class_exists( 'Chils_Blank_Stock' ) ) $R[] = array( $blank_missing === 0, "Sizes whose blank exists in central stock: $linked of $vars" . ( $blank_missing ? " ($blank_missing blanks not loaded: import blanks.csv)" : '' ) );
		else $R[] = array( false, 'CHILS Blank Stock is not active, so sizes are not linked to blanks' );
		$R[] = array( $combo_ok === (int) $e['grouped'], "Combos with all their tees: $combo_ok of {$e['grouped']}" );
		if ( $want_images ) $R[] = array( $img_ok === $img_exp, "Products with all their pictures: $img_ok of $img_exp" );
		$cats = count( array_filter( $b['categories'], function ( $c ) { return (bool) get_term_by( 'slug', $c['slug'], 'product_cat' ); } ) );
		$R[] = array( $cats === (int) $e['categories'], "Categories: $cats of {$e['categories']}" );
		$cps = count( array_filter( $b['coupons'], function ( $c ) { return (bool) wc_get_coupon_id_by_code( $c['code'] ); } ) );
		$R[] = array( $cps === (int) $e['coupons'], "Coupons: $cps of {$e['coupons']}" );
		$R[] = array( get_option( 'woocommerce_currency' ) === ( $b['settings']['currency'] ?? 'INR' ), 'Store currency: ' . get_option( 'woocommerce_currency' ) );
		foreach ( array_slice( $bad, 0, 20 ) as $x ) $R[] = array( false, $x );
		return $R;
	}

	/* ------------------------------------------------------------------ admin page */

	static function page() {
		if ( ! current_user_can( 'manage_options' ) ) return;
		$out = '';
		if ( $_SERVER['REQUEST_METHOD'] === 'POST' && check_admin_referer( 'chils_ci' ) ) {
			$do = sanitize_key( $_POST['do'] ?? '' );
			if ( $do === 'upload' && ! empty( $_FILES['bundle']['tmp_name'] ) && is_uploaded_file( $_FILES['bundle']['tmp_name'] ) ) {
				$j = json_decode( file_get_contents( $_FILES['bundle']['tmp_name'] ), true );
				if ( ! is_array( $j ) || ( $j['format'] ?? 0 ) !== 1 || empty( $j['products'] ) ) $out .= '<div class="notice notice-error"><p>That is not a CHILS catalog file.</p></div>';
				else {
					$old = get_option( self::FILE ); if ( $old && file_exists( $old ) ) @unlink( $old );
					$path = self::dir() . '/catalog-' . wp_generate_password( 24, false ) . '.json';
					move_uploaded_file( $_FILES['bundle']['tmp_name'], $path );
					update_option( self::FILE, $path, false ); delete_option( self::STATE );
					$out .= '<div class="notice notice-success"><p>Catalog file loaded. Run the dry run next.</p></div>';
				}
			} elseif ( $do === 'pictures' ) {
				update_option( self::IMAGES, ! empty( $_POST['images'] ) ? 'yes' : 'no' );
			} elseif ( $do === 'dry' || $do === 'import' ) {
				$r = self::run( $do === 'dry' );
				if ( isset( $r['error'] ) ) $out .= '<div class="notice notice-error"><p>' . esc_html( $r['error'] ) . '</p></div>';
				else {
					$out .= '<div class="notice notice-' . ( $r['done'] ? 'success' : 'warning' ) . '"><p><strong>' . ( $do === 'dry' ? 'Dry run (nothing was created)' : ( $r['done'] ? 'Import finished' : 'Import paused: press Import again to continue' ) ) . '</strong></p><pre>' . esc_html( wp_json_encode( $r['state']['stats'], JSON_PRETTY_PRINT ) ) . '</pre>';
					if ( $r['state']['log'] ) $out .= '<ul style="list-style:disc;margin-left:20px"><li>' . implode( '</li><li>', array_map( 'esc_html', array_slice( $r['state']['log'], -30 ) ) ) . '</li></ul>';
					$out .= '</div>';
				}
			} elseif ( $do === 'verify' ) {
				$out .= '<div class="notice"><p><strong>Verification</strong></p><ul>';
				foreach ( self::verify() as $v ) $out .= '<li>' . ( $v[0] ? '✅ ' : '❌ ' ) . esc_html( $v[1] ) . '</li>';
				$out .= '</ul></div>';
			}
		}
		$b = self::load();
		$nonce = wp_nonce_field( 'chils_ci', '_wpnonce', true, false );
		echo '<div class="wrap"><h1>CHILS catalog import</h1>' . $out;
		echo '<p>Creates the clean catalog: every size gets its design code and is linked to its blank. <strong>Load the blank counts first</strong> (WooCommerce → Blank stock → Import blanks), then dry run, then import.</p>';
		if ( $b ) {
			$e = $b['expected'];
			printf( '<p><strong>File loaded:</strong> %d products · %d sizes · %d combos · %d pictures · %d coupons · built %s</p>', $e['products'], $e['variations'], $e['grouped'], $e['images'], $e['coupons'], esc_html( $b['built_at'] ) );
			printf( '<form method="post">%s<input type="hidden" name="do" value="pictures"><label><input type="checkbox" name="images" value="1" %s onchange="this.form.submit()"> Import pictures</label> <span style="color:#666">(from <code>wp-content/uploads/chils-import-images/</code> if you uploaded them there, otherwise straight from the old store while it is still online)</span></form><p></p>', $nonce, checked( get_option( self::IMAGES, 'yes' ), 'yes', false ) );
			foreach ( array( 'dry' => 'Dry run (creates nothing)', 'import' => 'Import', 'verify' => 'Verify' ) as $k => $label ) {
				printf( '<form method="post" style="display:inline-block;margin-right:8px">%s<input type="hidden" name="do" value="%s"><button class="button%s">%s</button></form>', $nonce, $k, $k === 'import' ? ' button-primary' : '', esc_html( $label ) );
			}
		}
		echo '<h2>Load the catalog file</h2><form method="post" enctype="multipart/form-data">' . $nonce . '<input type="hidden" name="do" value="upload"><input type="file" name="bundle" accept=".json" required> <button class="button">Upload</button></form></div>';
	}
}

Chils_Catalog_Import::boot();
