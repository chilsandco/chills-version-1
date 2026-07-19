<?php
/**
 * Plugin Name: Chils & Co. Login Branding
 * Description: Custom styling for the WordPress login/lostpassword screen matching Chils & Co. brand guidelines, and redirects "Back to Blog" and Logo links to the main frontend website.
 * Version: 1.1
 * Author: Antigravity AI
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

// 1. Change the logo link to point to the frontend website (https://chilsandco.com)
add_filter( 'login_headerurl', 'chils_login_logo_url' );
function chils_login_logo_url() {
    return 'https://chilsandco.com/';
}

// 2. Change the logo tooltip/text to "CHILS & CO."
add_filter( 'login_headertext', 'chils_login_logo_title' );
function chils_login_logo_title() {
    return 'CHILS & CO.';
}

// 3. Change the "Back to blog" link to point to the frontend website (https://chilsandco.com)
add_filter( 'login_site_html_link', 'chils_login_back_to_blog_link', 10, 1 );
function chils_login_back_to_blog_link( $link ) {
    return '<a href="https://chilsandco.com/">&larr; Go to Chils and Co.</a>';
}

// 4. Change the login URL globally (including on the password reset success page) to point to the frontend site
add_filter( 'login_url', 'chils_login_url', 10, 3 );
function chils_login_url( $login_url, $redirect, $force_reauth ) {
    // If the redirect contains 'wp-admin', keep the original WordPress login URL so admins can log in.
    if ( ! empty( $redirect ) && ( strpos( $redirect, 'wp-admin' ) !== false || strpos( $redirect, 'wp-login' ) !== false ) ) {
        return $login_url;
    }
    
    // Otherwise, redirect to the frontend auth page
    return 'https://chilsandco.com/auth';
}

// 5. Inject custom CSS matching the Chils & Co. branding
add_action( 'login_enqueue_scripts', 'chils_login_styles' );
function chils_login_styles() {
    ?>
    <style type="text/css">
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

        /* 1. Page Background & Base Text */
        body.login {
            background-color: #000000 !important;
            color: #ffffff !important;
            font-family: 'Space Grotesk', 'Inter', sans-serif !important;
        }

        /* 2. Login Header / Logo Styling */
        body.login h1 a {
            background-image: url('https://res.cloudinary.com/ddatd5ruz/image/upload/v1774668881/chils_simple_logo_transparent_kdfrfk.png') !important;
            background-size: contain !important;
            background-position: center !important;
            width: 80px !important;
            height: 80px !important;
            margin-bottom: 24px !important;
            filter: brightness(0) saturate(100%) invert(85%) sepia(13%) saturate(1229%) hue-rotate(356deg) brightness(98%) contrast(90%) drop-shadow(0 0 8px rgba(212, 175, 55, 0.4)) !important;
            transition: transform 0.3s ease !important;
        }
        
        body.login h1 a:hover {
            transform: scale(1.05) !important;
        }

        /* 3. Main Login Form Container */
        body.login form {
            background: #0a0a0a !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            box-shadow: none !important;
            padding: 36px 30px !important;
            border-radius: 2px !important;
        }

        /* 4. Labels */
        body.login label {
            color: rgba(255, 255, 255, 0.5) !important;
            font-size: 10px !important;
            text-transform: uppercase !important;
            letter-spacing: 0.15em !important;
            font-family: 'Space Grotesk', sans-serif !important;
            font-weight: 600 !important;
        }

        /* 5. Inputs (Username, Email, Password) */
        body.login input[type="text"],
        body.login input[type="password"],
        body.login input[type="email"] {
            background: rgba(255, 255, 255, 0.05) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            color: #ffffff !important;
            border-radius: 0px !important;
            padding: 12px 16px !important;
            font-size: 14px !important;
            font-family: 'Inter', sans-serif !important;
            box-shadow: none !important;
            transition: border-color 0.25s ease, box-shadow 0.25s ease !important;
        }

        body.login input[type="text"]:focus,
        body.login input[type="password"]:focus,
        body.login input[type="email"]:focus {
            border-color: #d4af37 !important;
            outline: none !important;
            box-shadow: 0 0 10px rgba(212, 175, 55, 0.2) !important;
        }

        /* 6. Remember Me Checkbox */
        .forgetmenot {
            float: none !important;
            margin-bottom: 20px !important;
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
        }
        
        .forgetmenot label {
            text-transform: none !important;
            letter-spacing: normal !important;
            font-size: 11px !important;
            color: rgba(255, 255, 255, 0.6) !important;
        }

        body.login input[type="checkbox"] {
            background: rgba(255, 255, 255, 0.05) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            border-radius: 0px !important;
            margin: 0 !important;
        }

        body.login input[type="checkbox"]:checked::before {
            content: url('data:image/svg+xml;utf8,<svg%20xmlns="http://www.w3.org/2000/svg"%20viewBox="0%200%2020%2020"><path%20fill="%23d4af37"%20d="M14.8%204L8%2010.8%205.2%208%204%209.2%208%2013.2%2016%205.2z"/></svg>') !important;
        }

        /* 7. Action Button (Submit) */
        body.login input[type="submit"] {
            background: #ffffff !important;
            border: none !important;
            color: #000000 !important;
            text-shadow: none !important;
            box-shadow: none !important;
            border-radius: 0px !important;
            width: 100% !important;
            height: auto !important;
            padding: 14px !important;
            font-weight: 700 !important;
            font-size: 11px !important;
            letter-spacing: 0.25em !important;
            text-transform: uppercase !important;
            font-family: 'Space Grotesk', sans-serif !important;
            margin-top: 10px !important;
            transition: background-color 0.25s ease, color 0.25s ease !important;
            cursor: pointer !important;
        }

        body.login input[type="submit"]:hover {
            background: #d4af37 !important;
            color: #000000 !important;
        }

        /* 8. Links under the Form */
        body.login #nav,
        body.login #backtoblog {
            text-align: center !important;
            font-family: 'Space Grotesk', sans-serif !important;
            padding: 0 !important;
            margin: 16px 0 0 0 !important;
        }

        body.login #nav a,
        body.login #backtoblog a {
            color: rgba(255, 255, 255, 0.4) !important;
            font-size: 10px !important;
            text-transform: uppercase !important;
            letter-spacing: 0.15em !important;
            font-weight: 600 !important;
            transition: color 0.25s ease !important;
        }

        body.login #nav a:hover,
        body.login #backtoblog a:hover {
            color: #d4af37 !important;
        }

        /* Separator between links */
        body.login #nav {
            margin-bottom: 8px !important;
        }

        /* 9. Feedback & Errors */
        body.login .message,
        body.login #login_error {
            background-color: rgba(255, 255, 255, 0.05) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            border-left: 4px solid #d4af37 !important;
            color: #ffffff !important;
            font-size: 11px !important;
            border-radius: 0px !important;
            box-shadow: none !important;
            font-family: 'Inter', sans-serif !important;
            padding: 16px !important;
            line-height: 1.6 !important;
        }

        body.login #login_error {
            border-left-color: #ff3b30 !important;
        }
        
        body.login .message a,
        body.login #login_error a {
            color: #d4af37 !important;
            text-decoration: underline !important;
        }
    </style>
    <?php
}
