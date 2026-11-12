<?php
/**
 * Plugin Name: CHILS Order Emails
 * Description: The CHILS "Dispatched" email (sent when an order is marked Dispatched) and the CHILS-styled "Completed" email. Works with any theme.
 * Version: 1.0.0
 * Author: CHILS & CO.
 * Requires Plugins: woocommerce
 */

defined( 'ABSPATH' ) || exit;

// Use the CHILS templates from this plugin instead of the theme.
add_filter( 'woocommerce_locate_template', function ( $template, $name ) {
	$mine = __DIR__ . '/templates/' . $name;
	return in_array( $name, array( 'emails/customer-dispatched-order.php', 'emails/customer-completed-order.php' ), true ) && file_exists( $mine ) ? $mine : $template;
}, 10, 2 );

// Register the Dispatched email with WooCommerce (WooCommerce → Settings → Emails → Order dispatched).
add_filter( 'woocommerce_email_classes', function ( $emails ) {
	if ( ! class_exists( 'Chils_Email_Dispatched' ) ) {
		class Chils_Email_Dispatched extends WC_Email {
			function __construct() {
				$this->id             = 'chils_customer_dispatched_order';
				$this->customer_email = true;
				$this->title          = 'Order dispatched';
				$this->description    = 'Sent to the customer when an order is marked Dispatched.';
				$this->template_html  = 'emails/customer-dispatched-order.php';
				$this->placeholders   = array( '{order_date}' => '', '{order_number}' => '' );
				add_action( 'woocommerce_order_status_dispatched-order_notification', array( $this, 'trigger' ), 10, 2 );
				parent::__construct();
			}
			function get_default_subject() { return 'Your CHILS & CO. order {order_number} is on its way'; }
			function get_default_heading() { return 'Your order is on its way'; }
			function trigger( $order_id, $order = false ) {
				$this->setup_locale();
				if ( $order_id && ! is_a( $order, 'WC_Order' ) ) $order = wc_get_order( $order_id );
				if ( is_a( $order, 'WC_Order' ) ) {
					$this->object = $order;
					$this->recipient = $order->get_billing_email();
					$this->placeholders['{order_date}']   = wc_format_datetime( $order->get_date_created() );
					$this->placeholders['{order_number}'] = $order->get_order_number();
				}
				if ( $this->is_enabled() && $this->get_recipient() ) {
					$this->send( $this->get_recipient(), $this->get_subject(), $this->get_content(), $this->get_headers(), $this->get_attachments() );
				}
				$this->restore_locale();
			}
			function get_content_html() {
				return wc_get_template_html( $this->template_html, array( 'order' => $this->object, 'email_heading' => $this->get_heading(),
					'additional_content' => $this->get_additional_content(), 'sent_to_admin' => false, 'plain_text' => false, 'email' => $this ) );
			}
		}
	}
	$emails['Chils_Email_Dispatched'] = new Chils_Email_Dispatched();
	return $emails;
} );

// Let WooCommerce fire the "_notification" hook for the Dispatched status, like its own statuses.
add_filter( 'woocommerce_email_actions', function ( $actions ) {
	$actions[] = 'woocommerce_order_status_dispatched-order';
	return $actions;
} );
