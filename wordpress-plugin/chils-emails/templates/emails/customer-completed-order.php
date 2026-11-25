<?php
/**
 * Customer Completed Order Email — Chils & Co.
 *
 * Drop this file at:
 * yourtheme/woocommerce/emails/customer-completed-order.php
 *
 * Removed: use Automattic\WooCommerce\Utilities\FeaturesUtil;
 * (prevents fatal PHP errors inside WooCommerce's email dispatcher)
 *
 * @package WooCommerce\Templates\Emails
 * @version 10.4.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Safety guard for order object (crucial for admin email previews)
if ( ! isset( $order ) || ! is_a( $order, 'WC_Order' ) ) {
	$recent_orders = wc_get_orders( array( 'limit' => 1 ) );
	if ( ! empty( $recent_orders ) ) {
		$order = $recent_orders[0];
	} else {
		return;
	}
}

/*
 * ── BLOCK "WooCommerce Print Invoice & Delivery Note" plugin links ──────────
 * Removes Invoice, Receipt, Packing Slip and Delivery Note links that the
 * plugin injects into all three email hooks below.
 */
add_action( 'woocommerce_email_order_details',    'chilsco_remove_print_links_completed', 1 );
add_action( 'woocommerce_email_order_meta',       'chilsco_remove_print_links_completed', 1 );
add_action( 'woocommerce_email_customer_details', 'chilsco_remove_print_links_completed', 1 );

if ( ! function_exists( 'chilsco_remove_print_links_completed' ) ) {
	function chilsco_remove_print_links_completed() {
		$classes = array( 'WooCommerce_PDF_IPS_Main', 'WPO_WCPDF', 'WCPDF_Main' );
		$methods = array( 'add_order_document_links', 'email_order_details_links', 'add_pdf_link_to_email' );
		foreach ( $classes as $class ) {
			if ( ! class_exists( $class ) ) {
				continue;
			}
			foreach ( $methods as $method ) {
				remove_action( 'woocommerce_email_order_details',    array( $class, $method ), PHP_INT_MAX );
				remove_action( 'woocommerce_email_order_meta',       array( $class, $method ), PHP_INT_MAX );
				remove_action( 'woocommerce_email_customer_details', array( $class, $method ), PHP_INT_MAX );
			}
		}
	}
}
// ── END BLOCK ────────────────────────────────────────────────────────────────

do_action( 'woocommerce_email_header', $email_heading, $email );

$first_name = $order->get_billing_first_name();
?>

<!-- CHILS & CO. COMPLETED ORDER EMAIL: paper, ink and brass, like the site -->
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#141311;">

  <div style="font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#9c8152;margin:0 0 14px;">
    Order delivered
  </div>

  <p style="margin:0 0 8px;font-size:15px;line-height:1.65;color:#141311;">
    <?php echo $first_name ? 'Hey ' . esc_html( $first_name ) . ',' : 'Hey,'; ?>
  </p>
  <p style="margin:0 0 28px;font-size:15px;line-height:1.65;color:#141311;">
    Your order has been delivered and completed. Wear it well.
  </p>

  <!-- Order summary -->
  <div style="background:#f4f2ee;border-radius:16px;padding:8px 22px;margin:0 0 16px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
        <tr>
          <td style="padding:11px 0;border-bottom:1px solid rgba(20,19,17,0.09);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#716c64;">Order</td>
          <td align="right" style="padding:11px 0;border-bottom:1px solid rgba(20,19,17,0.09);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;color:#141311;">#<?php echo esc_html( $order->get_order_number() ); ?></td>
        </tr>
        <tr>
          <td style="padding:11px 0;border-bottom:1px solid rgba(20,19,17,0.09);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#716c64;">Date</td>
          <td align="right" style="padding:11px 0;border-bottom:1px solid rgba(20,19,17,0.09);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;color:#141311;"><?php echo esc_html( wc_format_datetime( $order->get_date_created() ) ); ?></td>
        </tr>
        <tr>
          <td style="padding:11px 0;border-bottom:1px solid rgba(20,19,17,0.09);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#716c64;">Status</td>
          <td align="right" style="padding:11px 0;border-bottom:1px solid rgba(20,19,17,0.09);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;color:#141311;"><span style="color:#3e4a3a;font-weight:600;">Delivered</span></td>
        </tr>
        <tr>
          <td style="padding:11px 0;border-bottom:1px solid rgba(20,19,17,0.09);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#716c64;">Payment</td>
          <td align="right" style="padding:11px 0;border-bottom:1px solid rgba(20,19,17,0.09);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;color:#141311;"><?php echo esc_html( $order->get_payment_method_title() ); ?></td>
        </tr>
        <tr>
          <td style="padding:11px 0;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#716c64;">Total</td>
          <td align="right" style="padding:11px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;color:#141311;"><strong style="font-size:17px;"><?php echo wp_kses_post( $order->get_formatted_order_total() ); ?></strong></td>
        </tr>
    </table>
  </div>

  <!-- Items -->
  <div style="background:#f4f2ee;border-radius:16px;padding:20px 22px;margin:0 0 16px;">
    <div style="font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#9c8152;margin:0 0 14px;">Delivered items</div>
    <?php
    $items = $order->get_items();
    $count = count( $items );
    $i     = 0;
    foreach ( $items as $item ) :
        $i++;
        $is_last = ( $i === $count );
    ?>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="<?php echo $is_last ? '' : 'margin-bottom:12px;border-bottom:1px solid rgba(20,19,17,0.09);padding-bottom:12px;'; ?>">
        <tr>
          <td style="vertical-align:top;padding-right:12px;">
            <div style="font-size:14px;font-weight:600;line-height:1.4;color:#141311;"><?php echo esc_html( $item->get_name() ); ?></div>
            <div style="font-size:12px;color:#716c64;margin-top:3px;">Qty <?php echo esc_html( $item->get_quantity() ); ?></div>
          </td>
          <td align="right" style="vertical-align:top;white-space:nowrap;font-size:14px;color:#141311;"><?php echo wp_kses_post( $order->get_formatted_line_subtotal( $item ) ); ?></td>
        </tr>
      </table>
    <?php endforeach; ?>
  </div>

  <?php if ( $order->get_shipping_address_1() ) : ?>
  <div style="background:#f4f2ee;border-radius:16px;padding:20px 22px;margin:0 0 28px;">
    <div style="font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#9c8152;margin:0 0 10px;">Delivered to</div>
    <div style="font-size:14px;line-height:1.65;color:#141311;"><?php echo wp_kses_post( $order->get_formatted_shipping_address() ); ?></div>
  </div>
  <?php else : ?>
    <div style="height:12px;"></div>
  <?php endif; ?>

  <!-- Pill button -->
  <p style="margin:0 0 30px;">
    <a href="<?php echo esc_url( $order->get_view_order_url() ); ?>"
       style="display:inline-block;background:#141311;color:#f4f2ee;text-decoration:none;padding:14px 30px;border-radius:999px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;font-weight:600;">View your order</a>
  </p>

  <p style="margin:0 0 26px;font-size:13px;line-height:1.7;color:#716c64;">If anything isn't right with your delivery, just reply to this email.<br>A real person from CHILS &amp; CO. will get back to you.</p>

  <div style="border-top:1px solid rgba(20,19,17,0.09);padding-top:20px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;line-height:1.8;color:#9c8152;">
    Not made for seasons.<br>Made for reasons.
  </div>

</div>
<!-- END CHILS & CO. COMPLETED ORDER EMAIL -->

<?php
do_action( 'woocommerce_structured_data_order', $order, $sent_to_admin, $email );
do_action( 'woocommerce_email_footer', $email );
?>
