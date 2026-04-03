<?php
/**
 * DropCMS Site Configuration
 * Edit these values to match your site.
 */

// ─── Site Identity ──────────────────────────────────────────
define('SITE_URL',   'https://example.com');      // Your domain (no trailing slash)
define('SITE_NAME',  'My Website');                // Your site name

// ─── Admin Credentials ──────────────────────────────────────
define('ADMIN_USER', 'admin');                     // Admin username
define('ADMIN_PASS', 'changeme');                  // Change this! Use a strong password

// ─── Contact ────────────────────────────────────────────────
define('CONTACT_EMAIL', 'you@example.com');        // Contact form sends to this email
define('CONTACT_NAME',  'My Website');
define('CONTACT_BRAND', 'My Website');

// ─── CORS Origins ───────────────────────────────────────────
define('CORS_DOMAIN', 'example.com');              // Your domain without https://

// ─── Upload Limits ──────────────────────────────────────────
define('MAX_IMAGE_SIZE', 50 * 1024 * 1024);        // 50 MB

// ─── Version ────────────────────────────────────────────────
define('DROPCMS_VERSION', '2.3.1');