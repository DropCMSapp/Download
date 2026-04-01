<?php
/**
 * Server-side OG meta tag injection for social media crawlers.
 * Reads the request URI, looks up post SEO data if it's a project page,
 * and injects the correct meta tags before serving index.html.
 */

$uri = $_SERVER['REQUEST_URI'] ?? '/';
$path = parse_url($uri, PHP_URL_PATH);

// ─── Maintenance mode check ─────────────────────────────────
// If maintenance.flag exists, show a "Coming Soon" page
// Admin can still access via ?bypass=admin or #admin
$maintenanceFile = __DIR__ . '/_platform/maintenance.flag';
if (file_exists($maintenanceFile) && !isset($_GET['bypass']) && strpos($uri, '#admin') === false) {
    // Allow admin-api.php requests through
    if (strpos($path, 'admin-api.php') !== false) {
        // Let it pass — handled by admin-api.php
    } else {
        $flagData = json_decode(file_get_contents($maintenanceFile), true) ?: [];
        $siteName = $flagData['site_name'] ?? 'This site';
        $message = $flagData['message'] ?? 'We\'re working on something new. Check back soon!';
        header('HTTP/1.1 503 Service Unavailable');
        header('Retry-After: 3600');
        echo '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<meta name="robots" content="noindex, nofollow"><title>' . htmlspecialchars($siteName) . ' — Coming Soon</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&display=swap" rel="stylesheet">
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:"DM Sans",sans-serif;background:#0a0f1a;color:#e2e8f0;min-height:100vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:40px}
.wrap{max-width:480px}.logo{font-size:42px;font-weight:700;color:#22d3ee;margin-bottom:16px}h1{font-size:24px;font-weight:600;margin-bottom:12px}p{font-size:15px;color:#94a3b8;line-height:1.7}</style>
</head><body><div class="wrap"><div class="logo">' . htmlspecialchars($siteName) . '</div><h1>Coming Soon</h1><p>' . htmlspecialchars($message) . '</p></div></body></html>';
        exit;
    }
}

$html = file_get_contents(__DIR__ . '/index.html');

// Check if this is a project post URL: /projects/some-slug
if (preg_match('#^/projects/([a-z0-9\-]+)$#', $path, $matches)) {
    $slug = $matches[1];
    $postsFile = __DIR__ . '/data/posts.json';

    if (file_exists($postsFile)) {
        $posts = json_decode(file_get_contents($postsFile), true) ?: [];

        foreach ($posts as $post) {
            if (($post['slug'] ?? '') === $slug && !empty($post['published'])) {
                $seo = $post['seo'] ?? [];
                $og = $seo['og'] ?? [];

                $title = htmlspecialchars($og['title'] ?? $post['title'] ?? '', ENT_QUOTES, 'UTF-8');
                $desc = htmlspecialchars($og['description'] ?? $post['excerpt'] ?? '', ENT_QUOTES, 'UTF-8');
                // Always use clean /projects/slug URL (override any legacy #slug URLs in data)
                $url = htmlspecialchars(SITE_URL . "/projects/$slug", ENT_QUOTES, 'UTF-8');
                $image = htmlspecialchars($og['image'] ?? '', ENT_QUOTES, 'UTF-8');
                $type = 'article';

                // Replace static OG tags with post-specific ones
                $html = preg_replace('/<meta property="og:title" content="[^"]*">/', '<meta property="og:title" content="' . $title . '">', $html);
                $html = preg_replace('/<meta property="og:description" content="[^"]*">/', '<meta property="og:description" content="' . $desc . '">', $html);
                $html = preg_replace('/<meta property="og:url" content="[^"]*">/', '<meta property="og:url" content="' . $url . '">', $html);
                $html = preg_replace('/<meta property="og:image" content="[^"]*">/', '<meta property="og:image" content="' . $image . '">', $html);
                $html = preg_replace('/<meta property="og:type" content="[^"]*">/', '<meta property="og:type" content="' . $type . '">', $html);

                // Also replace the <title> and meta description
                $html = preg_replace('/<title>[^<]*<\/title>/', '<title>' . $title . '</title>', $html);
                $html = preg_replace('/<meta name="description" content="[^"]*">/', '<meta name="description" content="' . $desc . '">', $html);

                // Update canonical URL
                $html = preg_replace('/<link rel="canonical" href="[^"]*">/', '<link rel="canonical" href="' . $url . '">', $html);

                // Inject article dates and author for LinkedIn/social crawlers
                $published = htmlspecialchars($post['created_at'] ?? '', ENT_QUOTES, 'UTF-8');
                $modified = htmlspecialchars($post['updated_at'] ?? '', ENT_QUOTES, 'UTF-8');
                $extraMeta = '';
                if ($published) $extraMeta .= '  <meta property="article:published_time" content="' . $published . '">' . "\n";
                if ($modified) $extraMeta .= '  <meta property="article:modified_time" content="' . $modified . '">' . "\n";
                $extraMeta .= '  <meta property="article:author" content="' . htmlspecialchars(SITE_NAME, ENT_QUOTES, 'UTF-8') . '">' . "\n";
                $html = str_replace('</head>', $extraMeta . '</head>', $html);

                break;
            }
        }
    }
}

header('Content-Type: text/html; charset=UTF-8');
echo $html;
