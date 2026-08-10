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

<!-- ═══════════════════════════════════════════════════════
     CHILS & CO. — COMPLETED ORDER EMAIL
════════════════════════════════════════════════════════════ -->
<div style="background:#000000;padding:40px 20px;">
  <div style="max-width:600px;margin:0 auto;background:#000000;border:1px solid #111111;">

    <!-- ── LOGO ─────────────────────────────────────────── -->
    <div style="padding:50px 20px 20px;text-align:center;">
      <img
        src="https://res.cloudinary.com/ddatd5ruz/image/upload/v1777905877/fevicon_fryjqz.png"
        alt="Chils & Co."
        width="120"
        style="display:block;margin:0 auto;"
      >
    </div>

    <!-- ── HEADLINE COPY ─────────────────────────────────── -->
    <div style="padding:10px 40px 10px;text-align:center;">

      <div style="color:#C5A048;font-size:12px;font-weight:bold;letter-spacing:4px;text-transform:uppercase;margin-bottom:15px;">
        Order Delivered
      </div>

      <div style="font-size:32px;font-weight:700;color:#ffffff;margin-bottom:24px;">
        It's all yours.
      </div>

      <div style="color:#b3b3b3;font-size:16px;line-height:1.9;max-width:420px;margin:0 auto 35px;">
        <?php if ( $first_name ) : ?>
          Hey <?php echo esc_html( $first_name ); ?>,
        <?php else : ?>
          Hey,
        <?php endif; ?>
        <br><br>
        Your order has officially been delivered and completed. 
        Wear it well — you earned it.
        <br><br>
        Here is a summary of your delivered items.
      </div>

      <!-- ── ORDER IDENTITY BOX ────────────────────────── -->
      <div style="background:#080808;border:1px solid #1a1a1a;padding:28px;margin:0 auto 12px;max-width:360px;">

        <div style="color:#C5A048;font-size:10px;letter-spacing:3px;text-transform:uppercase;margin-bottom:18px;">
          Order Identity
        </div>

        <!-- Order number -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:14px;border-bottom:1px solid #1a1a1a;padding-bottom:14px;">
          <tr>
            <td style="color:#7a7a7a;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Order No.</td>
            <td align="right" style="font-size:15px;font-weight:700;color:#ffffff;">
              #<?php echo esc_html( $order->get_order_number() ); ?>
            </td>
          </tr>
        </table>

        <!-- Date -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:14px;border-bottom:1px solid #1a1a1a;padding-bottom:14px;">
          <tr>
            <td style="color:#7a7a7a;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Date</td>
            <td align="right" style="font-size:13px;color:#b3b3b3;">
              <?php echo esc_html( wc_format_datetime( $order->get_date_created() ) ); ?>
            </td>
          </tr>
        </table>

        <!-- Status -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:14px;border-bottom:1px solid #1a1a1a;padding-bottom:14px;">
          <tr>
            <td style="color:#7a7a7a;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Status</td>
            <td align="right" style="font-size:11px;font-weight:800;color:#C5A048;letter-spacing:2px;text-transform:uppercase;">
              Completed
            </td>
          </tr>
        </table>

        <!-- Payment method -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:14px;border-bottom:1px solid #1a1a1a;padding-bottom:14px;">
          <tr>
            <td style="color:#7a7a7a;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Payment</td>
            <td align="right" style="font-size:13px;color:#b3b3b3;">
              <?php echo esc_html( $order->get_payment_method_title() ); ?>
            </td>
          </tr>
        </table>

        <!-- Order total -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="color:#7a7a7a;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Total</td>
            <td align="right" style="font-size:20px;font-weight:700;color:#C5A048;">
              <?php echo wp_kses_post( $order->get_formatted_order_total() ); ?>
            </td>
          </tr>
        </table>

      </div><!-- /Order Identity box -->

      <!-- ── ITEMS DELIVERED BOX ────────────────────────── -->
      <div style="background:#080808;border:1px solid #1a1a1a;border-top:none;padding:28px;margin:0 auto 12px;max-width:360px;">

        <div style="color:#C5A048;font-size:10px;letter-spacing:3px;text-transform:uppercase;margin-bottom:18px;">
          Delivered Items
        </div>

        <?php
        $items = $order->get_items();
        $count = count( $items );
        $i     = 0;
        foreach ( $items as $item ) :
            $i++;
            $is_last  = ( $i === $count );
            $subtotal = $order->get_formatted_line_subtotal( $item );
        ?>
          <table width="100%" cellpadding="0" cellspacing="0" border="0"
                 style="<?php echo $is_last ? '' : 'margin-bottom:14px;border-bottom:1px solid #1a1a1a;padding-bottom:14px;'; ?>">
            <tr>
              <td style="vertical-align:top;padding-right:12px;">
                <div style="color:#ffffff;font-size:13px;font-weight:600;line-height:1.4;">
                  <?php echo esc_html( $item->get_name() ); ?>
                </div>
                <div style="color:#7a7a7a;font-size:11px;letter-spacing:1px;margin-top:4px;">
                  Qty: <?php echo esc_html( $item->get_quantity() ); ?>
                </div>
              </td>
              <td align="right" style="vertical-align:top;white-space:nowrap;color:#b3b3b3;font-size:13px;font-weight:600;">
                <?php echo wp_kses_post( $subtotal ); ?>
              </td>
            </tr>
          </table>
        <?php endforeach; ?>

      </div><!-- /Items box -->

      <!-- ── SHIPPING ADDRESS BOX ───────────────────────── -->
      <?php if ( $order->get_shipping_address_1() ) : ?>
      <div style="background:#080808;border:1px solid #1a1a1a;border-top:none;padding:28px;margin:0 auto 35px;max-width:360px;text-align:left;">

        <div style="color:#C5A048;font-size:10px;letter-spacing:3px;text-transform:uppercase;margin-bottom:14px;">
          Delivered To
        </div>

        <div style="color:#b3b3b3;font-size:13px;line-height:1.8;">
          <?php echo wp_kses_post( $order->get_formatted_shipping_address() ); ?>
        </div>

      </div>
      <?php else : ?>
        <div style="margin-bottom:35px;"></div>
      <?php endif; ?>

      <!-- ── CTA BUTTON ─────────────────────────────────── -->
      <a href="<?php echo esc_url( $order->get_view_order_url() ); ?>"
         style="display:inline-block;background:#C5A048;color:#000000;text-decoration:none;padding:18px 42px;font-size:12px;font-weight:800;letter-spacing:3px;text-transform:uppercase;">
        VIEW YOUR ORDER →
      </a>

      <!-- ── PERSONAL SIGN-OFF ──────────────────────────── -->
      <div style="margin-top:40px;color:#7a7a7a;font-size:13px;line-height:1.8;">
        If anything isn't right with your delivery, just reply to this email.<br>
        A real person from Chils & Co. will get back to you.
      </div>

      <!-- ── BRAND TAGLINE ──────────────────────────────── -->
      <div style="margin-top:45px;color:#C5A048;font-size:12px;letter-spacing:4px;text-transform:uppercase;line-height:1.8;">
        NOT MADE FOR SEASONS.<br>
        MADE FOR REASONS.
      </div>

    </div><!-- /content -->

    <!-- ── FOOTER ─────────────────────────────────────── -->
    <div style="border-top:1px solid #111111;background:#050505;padding:40px 20px;text-align:center;">
      <div style="color:#555555;font-size:11px;letter-spacing:2px;text-transform:uppercase;">
        Order Completed.
      </div>
      <div style="color:#333333;font-size:10px;margin-top:12px;">
        © CHILS & CO.
      </div>
    </div>

  </div>
</div>
<!-- END CHILS & CO COMPLETED ORDER EMAIL -->

<?php
do_action( 'woocommerce_structured_data_order', $order, $sent_to_admin, $email );
do_action( 'woocommerce_email_footer', $email );
?>
