<?php
/**
 * DropCMS Site Configuration
 * Edit these values for your site.
 */

// ─── Site Identity ──────────────────────────────────────────
define('SITE_URL',   'https://your-domain.com');
define('SITE_NAME',  'My Site');

// ─── Admin Credentials ──────────────────────────────────────
// Change these! Use a strong password.
define('ADMIN_USER', 'admin');
define('ADMIN_PASS', 'change-this-password');

// ─── Contact ────────────────────────────────────────────────
define('CONTACT_EMAIL', 'you@example.com');
define('CONTACT_NAME',  'Your Name');
define('CONTACT_BRAND', 'Your Brand');

// ─── CORS Origins ───────────────────────────────────────────
define('CORS_DOMAIN', 'your-domain');

// ─── Upload Limits ──────────────────────────────────────────
define('MAX_IMAGE_SIZE', 50 * 1024 * 1024); // 50 MB
