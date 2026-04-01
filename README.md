# DropCMS

A modern, flat-file CMS with visual editing. No database required.

**[Live Demo](https://dropcms.app)** | **[Create a Free Site](https://dropcms.app/signup.html)**

---

## What is DropCMS?

DropCMS is a lightweight content management system that runs on any PHP server. Edit your website visually in the browser — click any text to change it, upload images and videos, switch themes, and publish instantly.

Everything is stored in simple JSON files. No MySQL, no migrations, no complexity.

## Features

- **Visual inline editing** — click any text to edit it directly on the page
- **Multilingual** — built-in EN/SV support with per-language content
- **Industry templates** — pre-built themes for restaurants, consultants, tech, shops, and more
- **Light & dark mode** — with customizable accent colors
- **Custom pages** — create unlimited pages with drag-and-drop navigation
- **Project showcase** — portfolio/blog system with rich content and SEO
- **Contact form** — with email notifications and spam protection
- **Automatic SEO** — meta tags, Open Graph, JSON-LD, and sitemaps
- **Password reset** — secure token-based self-service recovery
- **Flat-file storage** — no database needed, just JSON files
- **Self-hosted** — own your data, no vendor lock-in

## Quick Start

### 1. Upload to your server

Upload all files to your web hosting (any PHP 8.0+ server with Apache or Nginx).

### 2. Configure your site

Edit `site-config.php` with your details:

```php
define('SITE_URL',   'https://your-domain.com');
define('SITE_NAME',  'My Site');
define('ADMIN_USER', 'admin');
define('ADMIN_PASS', 'your-secure-password');
define('CONTACT_EMAIL', 'you@example.com');
```

### 3. Choose a template (optional)

Copy one of the industry templates to use as your starting content:

```bash
cp industries/restaurant.json data/content.json
```

Available templates: `consulting`, `frisor`, `musiker`, `portfolio`, `restaurant`, `shop`, `snickare`, `tech`, `transport`, `vvs`

### 4. Open your site

Visit `https://your-domain.com/#admin` to log in and start editing.

## File Structure

```
your-site/
  index.html          # Main site HTML (React app)
  index.php           # PHP router with SEO injection
  admin-api.php       # Backend API (content, uploads, auth)
  dropcms-core.js     # Shared platform components
  site-config.php     # Your site configuration
  .htaccess           # Apache rewrite rules
  .user.ini           # PHP upload limits
  data/
    content.json      # Your site content (auto-created)
    content_sv.json   # Swedish content (if multilingual)
    posts.json        # Blog/project posts
  uploads/            # Uploaded images and videos
  industries/         # Industry template files
```

## Requirements

- PHP 8.0 or higher
- Apache with `mod_rewrite` (or Nginx with equivalent rules)
- No database required

## Admin Access

Navigate to `your-site.com/#admin` and log in with the credentials from `site-config.php`.

In edit mode you can:
- Click any text to edit it
- Upload hero images and videos
- Change themes and colors
- Create new pages
- Manage navigation
- Write blog posts
- Configure settings

## License

MIT License. See [LICENSE](LICENSE) for details.

## Links

- **Website:** [dropcms.app](https://dropcms.app)
- **Create a site:** [dropcms.app/signup.html](https://dropcms.app/signup.html)
- **Built by:** [GeenCloud AB](https://geencloud.com)
