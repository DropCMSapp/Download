<?php
/**
 * DropCMS Admin API
 * Handles authentication, content editing, project posts, image uploads, and SEO generation.
 * Storage: flat-file JSON (no database required).
 *
 * Site-specific settings are loaded from site-config.php.
 * This file (admin-api.php) is shared across all DropCMS instances.
 */

session_start();
header('Content-Type: application/json; charset=utf-8');

// ─── Load site-specific config ──────────────────────────────────────
require_once __DIR__ . '/site-config.php';

// ─── Shared configuration ───────────────────────────────────────────
define('DATA_DIR',   __DIR__ . '/data');
define('UPLOAD_DIR', __DIR__ . '/uploads');

// Ensure directories exist
if (!is_dir(DATA_DIR))   mkdir(DATA_DIR, 0755, true);
if (!is_dir(UPLOAD_DIR)) mkdir(UPLOAD_DIR, 0755, true);

// ─── CORS (same-origin, but allow local dev) ────────────────────────
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin && (strpos($origin, CORS_DOMAIN) !== false || strpos($origin, 'localhost') !== false)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
}
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

// ─── Helpers ─────────────────────────────────────────────────────────
function jsonResponse($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

function requireAuth() {
    // Template preview and demo sites skip auth
    if (defined('TEMPLATE_MODE') && TEMPLATE_MODE) return;
    if (defined('DEMO_MODE') && DEMO_MODE) return;
    if (empty($_SESSION['admin_logged_in'])) {
        jsonResponse(['error' => 'Unauthorized'], 401);
    }
}

function readJson($file) {
    $path = DATA_DIR . '/' . $file;
    if (!file_exists($path)) return null;
    return json_decode(file_get_contents($path), true);
}

function writeJson($file, $data) {
    $path = DATA_DIR . '/' . $file;
    file_put_contents($path, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), LOCK_EX);
}

function slugify($text) {
    $text = mb_strtolower(trim($text));
    $text = preg_replace('/[^a-z0-9\-]/', '-', $text);
    $text = preg_replace('/-+/', '-', $text);
    return trim($text, '-');
}

function generateExcerpt($html, $maxLen = 160) {
    $text = strip_tags($html);
    $text = preg_replace('/\s+/', ' ', trim($text));
    if (mb_strlen($text) > $maxLen) {
        $text = mb_substr($text, 0, $maxLen);
        $text = preg_replace('/\s+\S*$/', '', $text) . '...';
    }
    return $text;
}

// ─── Auto SEO generation ─────────────────────────────────────────────
function generatePostSEO($post) {
    $title = htmlspecialchars($post['title'] ?? 'Project', ENT_QUOTES);
    $excerpt = generateExcerpt($post['content'] ?? '', 155);
    $slug = $post['slug'] ?? slugify($post['title'] ?? 'project');
    $url = SITE_URL . '/projects/' . $slug;
    $image = !empty($post['image']) ? SITE_URL . '/' . $post['image'] : SITE_URL . '/wp-content/uploads/2025/05/cropped-Enkel-och-stilren-logotyp.png';
    $tags = implode(', ', $post['tags'] ?? []);
    $datePublished = $post['created_at'] ?? date('Y-m-d');
    $dateModified  = $post['updated_at'] ?? date('Y-m-d');

    $brand = defined('CONTACT_BRAND') ? CONTACT_BRAND : (defined('SITE_NAME') ? SITE_NAME : 'DropCMS');
    $siteName = defined('SITE_NAME') ? SITE_NAME : 'DropCMS';

    return [
        'title'       => "$title | $siteName",
        'description' => $excerpt,
        'keywords'    => "$siteName, project, $tags",
        'og' => [
            'title'       => "$title | $siteName",
            'description' => $excerpt,
            'url'         => $url,
            'image'       => $image,
            'type'        => 'article',
        ],
        'jsonLd' => [
            '@context'      => 'https://schema.org',
            '@type'         => 'Article',
            'headline'      => $title,
            'description'   => $excerpt,
            'url'           => $url,
            'image'         => $image,
            'datePublished' => $datePublished,
            'dateModified'  => $dateModified,
            'author'        => [
                '@type' => 'Organization',
                'name'  => $brand,
                'url'   => SITE_URL,
            ],
            'publisher' => [
                '@type' => 'Organization',
                'name'  => $brand,
                'url'   => SITE_URL,
            ],
        ],
    ];
}

function rebuildSitemap() {
    $posts = readJson('posts.json') ?? [];
    $today = date('Y-m-d');
    // Main pages with Swedish hreflang alternates
    $mainPages = [
        ['loc' => '/',         'priority' => '1.0', 'changefreq' => 'weekly',  'lastmod' => $today],
        ['loc' => '/about',    'priority' => '0.8', 'changefreq' => 'monthly', 'lastmod' => $today],
        ['loc' => '/contact',  'priority' => '0.8', 'changefreq' => 'monthly', 'lastmod' => $today],
        ['loc' => '/projects', 'priority' => '0.8', 'changefreq' => 'weekly',  'lastmod' => $today],
    ];
    $postPages = [];
    foreach ($posts as $p) {
        if (!empty($p['published'])) {
            $lastmod = $p['updated_at'] ?? $p['created_at'] ?? $today;
            if (strlen($lastmod) > 10) $lastmod = substr($lastmod, 0, 10);
            $postPages[] = [
                'loc'        => '/projects/' . ($p['slug'] ?? ''),
                'priority'   => '0.6',
                'changefreq' => 'monthly',
                'lastmod'    => $lastmod,
            ];
        }
    }
    $xml  = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
    $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"' . "\n";
    $xml .= '        xmlns:xhtml="http://www.w3.org/1999/xhtml"' . "\n";
    $xml .= '        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' . "\n";
    $xml .= '        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9' . "\n";
    $xml .= '        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">' . "\n";
    // Main pages with hreflang alternates
    foreach ($mainPages as $u) {
        $fullUrl = SITE_URL . $u['loc'];
        $xml .= "  <url>\n";
        $xml .= "    <loc>{$fullUrl}</loc>\n";
        $xml .= '    <xhtml:link rel="alternate" hreflang="en" href="' . $fullUrl . '" />' . "\n";
        $xml .= '    <xhtml:link rel="alternate" hreflang="sv" href="' . $fullUrl . '?lang=sv" />' . "\n";
        if (!empty($u['lastmod']))    $xml .= "    <lastmod>{$u['lastmod']}</lastmod>\n";
        if (!empty($u['changefreq'])) $xml .= "    <changefreq>{$u['changefreq']}</changefreq>\n";
        if (!empty($u['priority']))   $xml .= "    <priority>{$u['priority']}</priority>\n";
        $xml .= "  </url>\n";
    }
    // Project posts as proper /projects/slug routes
    foreach ($postPages as $u) {
        $xml .= "  <url>\n";
        $xml .= "    <loc>" . SITE_URL . $u['loc'] . "</loc>\n";
        if (!empty($u['lastmod']))    $xml .= "    <lastmod>{$u['lastmod']}</lastmod>\n";
        if (!empty($u['changefreq'])) $xml .= "    <changefreq>{$u['changefreq']}</changefreq>\n";
        if (!empty($u['priority']))   $xml .= "    <priority>{$u['priority']}</priority>\n";
        $xml .= "  </url>\n";
    }
    $xml .= '</urlset>';
    file_put_contents(__DIR__ . '/sitemap.xml', $xml);
}

// ─── Routing ─────────────────────────────────────────────────────────
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ($action) {

    // ── Auth ──────────────────────────────────────────────────────────
    case 'login':
        if ($method !== 'POST') jsonResponse(['error' => 'POST required'], 405);
        $input = json_decode(file_get_contents('php://input'), true);
        $user = $input['username'] ?? '';
        $pass = $input['password'] ?? '';
        // Support both plain text (legacy) and bcrypt hashed passwords
        $userMatch = ($user === ADMIN_USER);
        // Also accept email as username if CONTACT_EMAIL is set
        if (!$userMatch && defined('CONTACT_EMAIL') && $user === CONTACT_EMAIL) $userMatch = true;

        $passMatch = false;
        if (str_starts_with(ADMIN_PASS, '$2y$') || str_starts_with(ADMIN_PASS, '$2a$')) {
            $passMatch = password_verify($pass, ADMIN_PASS);
        } else {
            $passMatch = ($pass === ADMIN_PASS);
        }

        if ($userMatch && $passMatch) {
            $_SESSION['admin_logged_in'] = true;
            jsonResponse(['ok' => true, 'message' => 'Logged in']);
        }
        jsonResponse(['error' => 'Invalid credentials'], 403);
        break;

    case 'logout':
        session_destroy();
        jsonResponse(['ok' => true, 'message' => 'Logged out']);
        break;

    case 'auth-check':
        $isDemo = defined('DEMO_MODE') && DEMO_MODE;
        $isTemplate = defined('TEMPLATE_MODE') && TEMPLATE_MODE;
        jsonResponse([
            'authenticated' => $isDemo || $isTemplate || !empty($_SESSION['admin_logged_in']),
            'demo_mode' => $isDemo,
            'template_mode' => $isTemplate,
        ]);
        break;

    // ── Forgot password ─────────────────────────────────────────────
    case 'forgot-password':
        if (defined('DEMO_MODE') && DEMO_MODE) jsonResponse(['error' => 'Password reset is disabled on the demo site'], 403);
        if ($method !== 'POST') jsonResponse(['error' => 'POST required'], 405);
        $input = json_decode(file_get_contents('php://input'), true);
        $email = trim($input['email'] ?? '');

        // Always return success to prevent email enumeration
        $successMsg = ['ok' => true, 'message' => 'If this email is registered, a reset link has been sent.'];

        if (!$email || !defined('CONTACT_EMAIL') || strtolower($email) !== strtolower(CONTACT_EMAIL)) {
            jsonResponse($successMsg);
        }

        // Rate limit: max 3 reset requests per hour
        $resetFile = DATA_DIR . '/reset-token.json';
        $existing = file_exists($resetFile) ? json_decode(file_get_contents($resetFile), true) : [];
        $recentAttempts = array_filter($existing['attempts'] ?? [], fn($t) => $t > time() - 3600);
        if (count($recentAttempts) >= 3) {
            jsonResponse($successMsg); // Silent fail, don't reveal rate limit
        }

        // Generate secure token with 1-hour expiry
        $token = bin2hex(random_bytes(32));
        $tokenData = [
            'token' => password_hash($token, PASSWORD_BCRYPT),
            'expires' => time() + 3600,
            'attempts' => array_merge(array_values($recentAttempts), [time()]),
        ];
        file_put_contents($resetFile, json_encode($tokenData), LOCK_EX);

        // Build reset URL
        $siteUrl = defined('SITE_URL') ? SITE_URL : ('https://' . ($_SERVER['HTTP_HOST'] ?? 'localhost'));
        $resetUrl = $siteUrl . '/#reset=' . $token;

        // Send email
        $siteName = defined('SITE_NAME') ? SITE_NAME : 'DropCMS';
        $subject = "Password Reset — $siteName";
        $body  = "A password reset was requested for your admin account.\n\n";
        $body .= "Click the link below to set a new password:\n";
        $body .= "$resetUrl\n\n";
        $body .= "This link expires in 1 hour.\n\n";
        $body .= "If you did not request this, you can safely ignore this email.\n";

        $headers  = "From: $siteName <noreply@" . ($_SERVER['HTTP_HOST'] ?? 'dropcms.app') . ">\r\n";
        $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

        @mail(CONTACT_EMAIL, $subject, $body, $headers);

        jsonResponse($successMsg);
        break;

    // ── Reset password (with token) ─────────────────────────────────
    case 'reset-password':
        if ($method !== 'POST') jsonResponse(['error' => 'POST required'], 405);
        $input = json_decode(file_get_contents('php://input'), true);
        $token = $input['token'] ?? '';
        $newPassword = $input['new_password'] ?? '';

        if (!$token || !$newPassword) jsonResponse(['error' => 'Token and new password are required'], 400);
        if (strlen($newPassword) < 8) jsonResponse(['error' => 'Password must be at least 8 characters'], 400);

        $resetFile = DATA_DIR . '/reset-token.json';
        if (!file_exists($resetFile)) jsonResponse(['error' => 'Invalid or expired reset link'], 400);

        $tokenData = json_decode(file_get_contents($resetFile), true);
        if (!$tokenData || ($tokenData['expires'] ?? 0) < time()) {
            @unlink($resetFile);
            jsonResponse(['error' => 'Reset link has expired'], 400);
        }

        if (!password_verify($token, $tokenData['token'] ?? '')) {
            jsonResponse(['error' => 'Invalid reset link'], 400);
        }

        // Update password in site-config.php
        $configFile = __DIR__ . '/site-config.php';
        if (!file_exists($configFile)) jsonResponse(['error' => 'Configuration error'], 500);

        $configContent = file_get_contents($configFile);
        $newHash = password_hash($newPassword, PASSWORD_BCRYPT);
        $safeHash = str_replace('$', '\\$', $newHash);
        $configContent = preg_replace(
            "/define\('ADMIN_PASS',\s*'[^']+'\)/",
            "define('ADMIN_PASS', '$safeHash')",
            $configContent
        );
        file_put_contents($configFile, $configContent, LOCK_EX);

        // Clean up token
        @unlink($resetFile);

        jsonResponse(['ok' => true, 'message' => 'Password has been reset. You can now log in.']);
        break;

    // ── Content (editable text blocks) ───────────────────────────────
    case 'content':
        // Hero background fields are language-independent — always from EN
        $heroBgFields = ['bg_image', 'bg_video', 'overlay_dark', 'overlay_light'];

        if ($method === 'GET') {
            $getLang = $_GET['lang'] ?? 'en';
            $enContent = readJson('content.json');
            if (!$enContent) {
                $enContent = getDefaultContent();
                writeJson('content.json', $enContent);
            }
            if ($getLang === 'sv') {
                $svContent = readJson('content_sv.json');
                if ($svContent) {
                    // Inject EN hero background into SV content
                    foreach ($heroBgFields as $f) {
                        if (isset($enContent['hero'][$f])) {
                            $svContent['hero'][$f] = $enContent['hero'][$f];
                        }
                    }
                    jsonResponse($svContent);
                }
            }
            jsonResponse($enContent);
        }
        if ($method === 'PUT') {
            requireAuth();
            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input) jsonResponse(['error' => 'Invalid JSON'], 400);

            $saveLang = $_GET['lang'] ?? 'en';

            // When saving SV, strip hero bg fields (they live in EN only)
            // But first: if SV payload has hero bg changes, apply them to EN content
            if ($saveLang === 'sv' && isset($input['hero'])) {
                $enContent = readJson('content.json');
                if ($enContent) {
                    $bgChanged = false;
                    foreach ($heroBgFields as $f) {
                        if (array_key_exists($f, $input['hero'])) {
                            $enContent['hero'][$f] = $input['hero'][$f];
                            $bgChanged = true;
                        }
                    }
                    if ($bgChanged) writeJson('content.json', $enContent);
                }
                foreach ($heroBgFields as $f) {
                    unset($input['hero'][$f]);
                }
            }

            $file = ($saveLang === 'sv') ? 'content_sv.json' : 'content.json';
            writeJson($file, $input);

            // If this is a template editing site, also save to industry template
            // Walk up from site dir to find _template/
            if (defined('TEMPLATE_INDUSTRY') && TEMPLATE_INDUSTRY && $saveLang === 'en') {
                $searchDir = dirname(__DIR__);
                for ($i = 0; $i < 5; $i++) {
                    if (is_dir($searchDir . '/_template/industries')) break;
                    $searchDir = dirname($searchDir);
                }
                $tplFile = $searchDir . '/_template/industries/' . TEMPLATE_INDUSTRY . '.json';
                if (is_dir(dirname($tplFile))) {
                    file_put_contents($tplFile, json_encode($input, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), LOCK_EX);
                }
                // Also sync uploaded files to _template/uploads/<industry>/
                $tplUploads = $searchDir . '/_template/uploads/' . TEMPLATE_INDUSTRY;
                $siteUploads = UPLOAD_DIR;
                if (is_dir($siteUploads)) {
                    if (!is_dir($tplUploads)) mkdir($tplUploads, 0755, true);
                    $iter = new DirectoryIterator($siteUploads);
                    foreach ($iter as $f) {
                        if ($f->isFile()) copy($f->getPathname(), $tplUploads . '/' . $f->getFilename());
                    }
                }
            }

            jsonResponse(['ok' => true, 'message' => 'Content saved (' . strtoupper($saveLang) . ')']);
        }
        break;

    // ── Posts (project posts) ────────────────────────────────────────
    case 'posts':
        if ($method === 'GET') {
            $posts = readJson('posts.json') ?? [];
            // Public: only return published posts unless admin
            if (empty($_SESSION['admin_logged_in'])) {
                $posts = array_values(array_filter($posts, fn($p) => !empty($p['published'])));
            }
            jsonResponse($posts);
        }
        if ($method === 'POST') {
            requireAuth();
            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input || empty($input['title'])) jsonResponse(['error' => 'Title required'], 400);

            $posts = readJson('posts.json') ?? [];
            $id = uniqid('post_');
            $slug = slugify($input['title']);

            // Ensure unique slug
            $existingSlugs = array_column($posts, 'slug');
            $baseSlug = $slug;
            $counter = 1;
            while (in_array($slug, $existingSlugs)) {
                $slug = $baseSlug . '-' . $counter++;
            }

            $post = [
                'id'           => $id,
                'title'        => $input['title'],
                'slug'         => $slug,
                'content'      => $input['content'] ?? '',
                'excerpt'      => $input['excerpt'] ?? generateExcerpt($input['content'] ?? ''),
                'image'        => $input['imageUrl'] ?? $input['image'] ?? '',
                'imageUrl'     => $input['imageUrl'] ?? $input['image'] ?? '',
                'images'       => $input['images'] ?? [],
                'tags'         => $input['tags'] ?? [],
                'features'     => $input['features'] ?? [],
                'role'         => $input['role'] ?? '',
                'technologies' => $input['technologies'] ?? [],
                'links'        => $input['links'] ?? [],
                'category'     => $input['category'] ?? 'external',
                'published'    => $input['published'] ?? false,
                'created_at'   => date('c'),
                'updated_at'   => date('c'),
            ];

            // Auto-generate SEO
            $post['seo'] = generatePostSEO($post);

            // Insert at top of its category (newest first)
            $category = $post['category'];
            $insertIdx = 0;
            foreach ($posts as $i => $p) {
                if (($p['category'] ?? '') === $category) {
                    $insertIdx = $i;
                    break;
                }
                $insertIdx = $i + 1;
            }
            array_splice($posts, $insertIdx, 0, [$post]);
            writeJson('posts.json', $posts);
            rebuildSitemap();
            jsonResponse(['ok' => true, 'post' => $post], 201);
        }
        break;

    case 'post':
        // Single post operations: ?action=post&id=xxx
        $postId = $_GET['id'] ?? '';
        if (!$postId) jsonResponse(['error' => 'Post ID required'], 400);

        $posts = readJson('posts.json') ?? [];
        $idx = array_search($postId, array_column($posts, 'id'));
        if ($idx === false) jsonResponse(['error' => 'Post not found'], 404);

        if ($method === 'GET') {
            jsonResponse($posts[$idx]);
        }
        if ($method === 'PUT') {
            requireAuth();
            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input) jsonResponse(['error' => 'Invalid JSON'], 400);

            // Merge updates
            foreach (['title','content','excerpt','image','imageUrl','images','tags','features','role','technologies','links','category','published'] as $key) {
                if (array_key_exists($key, $input)) {
                    $posts[$idx][$key] = $input[$key];
                }
            }
            // Keep image and imageUrl in sync
            if (isset($input['imageUrl'])) {
                $posts[$idx]['image'] = $input['imageUrl'];
                $posts[$idx]['imageUrl'] = $input['imageUrl'];
            } elseif (isset($input['image'])) {
                $posts[$idx]['imageUrl'] = $input['image'];
            }
            if (isset($input['title'])) {
                $posts[$idx]['slug'] = slugify($input['title']);
            }
            if (isset($input['content']) && empty($input['excerpt'])) {
                $posts[$idx]['excerpt'] = generateExcerpt($input['content']);
            }
            $posts[$idx]['updated_at'] = date('c');
            $posts[$idx]['seo'] = generatePostSEO($posts[$idx]);

            writeJson('posts.json', $posts);
            rebuildSitemap();
            jsonResponse(['ok' => true, 'post' => $posts[$idx]]);
        }
        if ($method === 'DELETE') {
            requireAuth();
            array_splice($posts, $idx, 1);
            writeJson('posts.json', array_values($posts));
            rebuildSitemap();
            jsonResponse(['ok' => true, 'message' => 'Post deleted']);
        }
        break;

    // ── Reorder Posts ──────────────────────────────────────────────────
    case 'reorder-posts':
        requireAuth();
        if ($method !== 'PUT') jsonResponse(['error' => 'PUT required'], 405);
        $input = json_decode(file_get_contents('php://input'), true);
        $postId = $input['id'] ?? '';
        $direction = (int)($input['direction'] ?? 0); // -1 = up, 1 = down
        if (!$postId || !$direction) jsonResponse(['error' => 'id and direction required'], 400);

        $posts = readJson('posts.json') ?? [];
        $idx = array_search($postId, array_column($posts, 'id'));
        if ($idx === false) jsonResponse(['error' => 'Post not found'], 404);

        $targetIdx = $idx + $direction;
        if ($targetIdx < 0 || $targetIdx >= count($posts)) {
            jsonResponse(['ok' => true, 'message' => 'Already at boundary']);
        }

        // Swap
        $temp = $posts[$idx];
        $posts[$idx] = $posts[$targetIdx];
        $posts[$targetIdx] = $temp;
        writeJson('posts.json', array_values($posts));
        jsonResponse(['ok' => true]);
        break;

    // ── Image Upload ─────────────────────────────────────────────────
    case 'upload':
        requireAuth();
        if ($method !== 'POST') jsonResponse(['error' => 'POST required'], 405);
        if (empty($_FILES['image'])) jsonResponse(['error' => 'No image uploaded'], 400);

        $file = $_FILES['image'];
        if ($file['size'] > MAX_IMAGE_SIZE) jsonResponse(['error' => 'File too large (max 50MB)'], 400);

        $allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'video/mp4', 'video/webm'];
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime = finfo_file($finfo, $file['tmp_name']);
        if (!in_array($mime, $allowed)) jsonResponse(['error' => 'Invalid image type'], 400);

        $ext = match($mime) {
            'image/jpeg'    => '.jpg',
            'image/png'     => '.png',
            'image/gif'     => '.gif',
            'image/webp'    => '.webp',
            'image/svg+xml' => '.svg',
            'video/mp4'     => '.mp4',
            'video/webm'    => '.webm',
            default         => '.bin',
        };

        $filename = date('Ymd_His') . '_' . uniqid() . $ext;
        $destPath = UPLOAD_DIR . '/' . $filename;

        if (!move_uploaded_file($file['tmp_name'], $destPath)) {
            jsonResponse(['error' => 'Upload failed'], 500);
        }

        jsonResponse([
            'ok'   => true,
            'url'  => 'uploads/' . $filename,
            'name' => $filename,
        ]);
        break;

    // ── SEO data (public, for meta tag injection) ────────────────────
    case 'seo':
        $slug = $_GET['slug'] ?? '';
        if (!$slug) {
            // Return site-level SEO
            $seoName = defined('SITE_NAME') ? SITE_NAME : 'DropCMS';
            jsonResponse([
                'title'       => $seoName,
                'description' => '',
            ]);
        }
        $posts = readJson('posts.json') ?? [];
        foreach ($posts as $p) {
            if (($p['slug'] ?? '') === $slug && !empty($p['published'])) {
                jsonResponse($p['seo'] ?? generatePostSEO($p));
            }
        }
        jsonResponse(['error' => 'Not found'], 404);
        break;

    // ── Change password ──────────────────────────────────────────────
    case 'change-password':
        requireAuth();
        if ($method !== 'POST') jsonResponse(['error' => 'POST required'], 405);
        $input = json_decode(file_get_contents('php://input'), true);
        // Note: password is stored in this PHP file. For simplicity we save to a config file.
        // In production, use hashed passwords in a separate config.
        jsonResponse(['ok' => true, 'message' => 'To change password, edit ADMIN_PASS in admin-api.php']);
        break;

    // ── Contact form submission ─────────────────────────────────────
    case 'contact':
        if ($method !== 'POST') jsonResponse(['error' => 'POST required'], 405);

        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) jsonResponse(['error' => 'Invalid JSON'], 400);

        // Anti-bot: honeypot field (must be empty)
        if (!empty($input['website_url'])) {
            // Bot detected — pretend success
            jsonResponse(['ok' => true, 'message' => 'Message sent']);
        }

        // Anti-bot: timestamp check (form must take > 3 seconds)
        $formLoadedAt = intval($input['_t'] ?? 0);
        if ($formLoadedAt > 0 && (time() - $formLoadedAt) < 3) {
            jsonResponse(['ok' => true, 'message' => 'Message sent']);
        }

        // Anti-bot: math captcha
        $captchaAnswer = intval($input['captcha'] ?? -1);
        $captchaExpected = intval($input['_ca'] ?? -999);
        if ($captchaAnswer !== $captchaExpected) {
            jsonResponse(['error' => 'Incorrect answer to the verification question'], 400);
        }

        // Validate required fields
        $name    = trim($input['name'] ?? '');
        $email   = trim($input['email'] ?? '');
        $subject = trim($input['subject'] ?? '');
        $message = trim($input['message'] ?? '');

        if (!$name || !$email || !$subject || !$message) {
            jsonResponse(['error' => 'Please fill in all required fields'], 400);
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            jsonResponse(['error' => 'Invalid email address'], 400);
        }

        // Sanitize
        $company = htmlspecialchars(trim($input['company'] ?? ''), ENT_QUOTES, 'UTF-8');
        $phone   = htmlspecialchars(trim($input['phone'] ?? ''), ENT_QUOTES, 'UTF-8');
        $name    = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
        $subject = htmlspecialchars($subject, ENT_QUOTES, 'UTF-8');
        $message = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');

        // Rate limit: max 5 submissions per IP per hour
        $rateLimitFile = DATA_DIR . '/contact_rate.json';
        $rateLimits = file_exists($rateLimitFile) ? json_decode(file_get_contents($rateLimitFile), true) : [];
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $now = time();
        // Clean old entries
        $rateLimits = array_filter($rateLimits, fn($entry) => ($now - ($entry['time'] ?? 0)) < 3600);
        $ipCount = count(array_filter($rateLimits, fn($entry) => ($entry['ip'] ?? '') === $ip));
        if ($ipCount >= 5) {
            jsonResponse(['error' => 'Too many submissions. Please try again later.'], 429);
        }

        // ── 1. Notification email TO Jesper ──────────────────────────────
        $to = CONTACT_EMAIL;
        $emailSubject = CONTACT_BRAND . " Contact: $subject";
        $emailBody  = "New contact form submission from " . SITE_URL . "\n";
        $emailBody .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
        $emailBody .= "Name:    $name\n";
        $emailBody .= "Email:   $email\n";
        if ($company) $emailBody .= "Company: $company\n";
        if ($phone)   $emailBody .= "Phone:   $phone\n";
        $emailBody .= "\nSubject: $subject\n\n";
        $emailBody .= "Message:\n$message\n";
        $emailBody .= "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
        $emailBody .= "Sent at: " . date('Y-m-d H:i:s') . " (server time)\n";
        $emailBody .= "IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'unknown') . "\n";

        // Use jesper.hogman@geencloud.com as From so the server's SPF/DKIM
        // recognises it as a legitimate sender. Reply-To points to the visitor.
        $headers  = "From: " . CONTACT_BRAND . " Contact <" . CONTACT_EMAIL . ">\r\n";
        $headers .= "Reply-To: $name <$email>\r\n";
        $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
        $headers .= "X-Mailer: DropCMS-Contact-Form\r\n";

        $sent = @mail($to, $emailSubject, $emailBody, $headers);

        // ── 2. Confirmation receipt email TO the sender ──────────────────
        $confirmSubject = "Thank you for contacting " . CONTACT_BRAND;
        $confirmBody  = "Hi $name,\n\n";
        $confirmBody .= "Thank you for reaching out to " . CONTACT_BRAND . "! This is a confirmation that we have received your message.\n\n";
        $confirmBody .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
        $confirmBody .= "Subject: $subject\n\n";
        $confirmBody .= "Your message:\n$message\n";
        $confirmBody .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
        $confirmBody .= "I'll review your message and get back to you as soon as possible, usually within 1-2 business days.\n\n";
        $confirmBody .= "Best regards,\n";
        $confirmBody .= CONTACT_NAME . "\n";
        $confirmBody .= CONTACT_BRAND . "\n";
        $confirmBody .= SITE_URL . "\n";

        $confirmHeaders  = "From: " . CONTACT_NAME . " <" . CONTACT_EMAIL . ">\r\n";
        $confirmHeaders .= "Reply-To: " . CONTACT_NAME . " <" . CONTACT_EMAIL . ">\r\n";
        $confirmHeaders .= "Content-Type: text/plain; charset=UTF-8\r\n";
        $confirmHeaders .= "X-Mailer: DropCMS-Contact-Form\r\n";

        $confirmSent = @mail($email, $confirmSubject, $confirmBody, $confirmHeaders);

        // Log submission
        $rateLimits[] = ['ip' => $ip, 'time' => $now, 'email' => $email];
        file_put_contents($rateLimitFile, json_encode(array_values($rateLimits)), LOCK_EX);

        // Also save to a local log file as backup
        $logFile = DATA_DIR . '/contact_log.json';
        $log = file_exists($logFile) ? json_decode(file_get_contents($logFile), true) : [];
        $log[] = [
            'name' => $name, 'email' => $email, 'company' => $company,
            'phone' => $phone, 'subject' => $subject, 'message' => $message,
            'sent' => $sent, 'confirmSent' => $confirmSent, 'date' => date('c'), 'ip' => $ip,
        ];
        file_put_contents($logFile, json_encode($log, JSON_PRETTY_PRINT));

        if ($sent) {
            jsonResponse(['ok' => true, 'message' => 'Message sent successfully']);
        } else {
            jsonResponse(['error' => 'Failed to send email. Please try again or email directly.'], 500);
        }
        break;

    // ── Weather proxy (avoids exposing API key to client) ──────────
    case 'weather':
        if ($method !== 'GET') jsonResponse(['error' => 'GET required'], 405);
        $lat = floatval($_GET['lat'] ?? 0);
        $lon = floatval($_GET['lon'] ?? 0);
        if ($lat == 0 && $lon == 0) jsonResponse(['error' => 'lat and lon required'], 400);

        $content = readJson('content.json') ?? [];
        $apiKey = $content['settings']['weather_api_key'] ?? '';
        if (!$apiKey) jsonResponse(['error' => 'Weather API key not configured'], 400);

        $url = 'https://api.openweathermap.org/data/2.5/weather?lat=' . urlencode($lat) . '&lon=' . urlencode($lon) . '&appid=' . urlencode($apiKey);
        $ctx = stream_context_create(['http' => ['timeout' => 5, 'ignore_errors' => true]]);
        $result = @file_get_contents($url, false, $ctx);
        if ($result === false) jsonResponse(['error' => 'Weather API request failed'], 502);

        $data = json_decode($result, true);
        $main = strtolower($data['weather'][0]['main'] ?? 'clear');
        $desc = $data['weather'][0]['description'] ?? '';
        $icon = $data['weather'][0]['icon'] ?? '';
        $city = $data['name'] ?? '';

        jsonResponse(['condition' => $main, 'description' => $desc, 'icon' => $icon, 'city' => $city]);
        break;

    // ── Platform: Heartbeat (admin-only, sends status to control panel) ──
    case 'platform-heartbeat':
        requireAuth();
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $platformDir = __DIR__ . '/_platform';
        if (!is_dir($platformDir)) mkdir($platformDir, 0755, true);

        // Store errors locally
        $errors = $input['errors'] ?? [];
        if (!empty($errors)) {
            $errFile = $platformDir . '/errors.json';
            $existing = file_exists($errFile) ? json_decode(file_get_contents($errFile), true) ?? [] : [];
            $existing = array_merge($existing, $errors);
            // Keep last 200 errors
            if (count($existing) > 200) $existing = array_slice($existing, -200);
            file_put_contents($errFile, json_encode($existing, JSON_PRETTY_PRINT), LOCK_EX);
        }

        // Auto-register with control panel if not yet registered
        $panelUrl = defined('PLATFORM_PANEL_URL') ? PLATFORM_PANEL_URL : '';
        $siteId = defined('PLATFORM_SITE_ID') ? PLATFORM_SITE_ID : '';
        $apiKey = defined('PLATFORM_API_KEY') ? PLATFORM_API_KEY : '';
        $regToken = defined('PLATFORM_REGISTRATION_TOKEN') ? PLATFORM_REGISTRATION_TOKEN : '';

        if ($panelUrl && !$siteId && $regToken) {
            try {
                $regData = json_encode([
                    'registration_token' => $regToken,
                    'site_url' => defined('SITE_URL') ? SITE_URL : '',
                    'site_name' => defined('SITE_NAME') ? SITE_NAME : '',
                    'version' => defined('DROPCMS_VERSION') ? DROPCMS_VERSION : 'unknown',
                    'php_version' => PHP_VERSION,
                ]);
                $ctx = stream_context_create(['http' => [
                    'method' => 'POST',
                    'header' => 'Content-Type: application/json',
                    'content' => $regData,
                    'timeout' => 10,
                    'ignore_errors' => true,
                ]]);
                $regResult = @file_get_contents($panelUrl . '/panel-api.php?action=register', false, $ctx);
                if ($regResult) {
                    $regResponse = json_decode($regResult, true);
                    if (!empty($regResponse['ok']) && !empty($regResponse['site_id']) && !empty($regResponse['api_key'])) {
                        $siteId = $regResponse['site_id'];
                        $apiKey = $regResponse['api_key'];

                        // Save credentials to _platform/auto-registered.json
                        file_put_contents($platformDir . '/auto-registered.json', json_encode([
                            'site_id' => $siteId,
                            'api_key' => $apiKey,
                            'registered_at' => date('c'),
                            'panel_url' => $panelUrl,
                            'message' => 'Auto-registered. Add these to site-config.php for permanent config.',
                        ], JSON_PRETTY_PRINT), LOCK_EX);

                        // Try to update site-config.php automatically
                        $configFile = __DIR__ . '/site-config.php';
                        if (file_exists($configFile) && is_writable($configFile)) {
                            $configContent = file_get_contents($configFile);
                            // Replace empty PLATFORM_SITE_ID
                            $configContent = preg_replace(
                                "/define\('PLATFORM_SITE_ID',\s*(?:\\\$isLocal\s*\?\s*'[^']*'\s*:\s*)?''\)/",
                                "define('PLATFORM_SITE_ID',  '$siteId')",
                                $configContent
                            );
                            // Replace empty PLATFORM_API_KEY
                            $configContent = preg_replace(
                                "/define\('PLATFORM_API_KEY',\s*(?:\\\$isLocal\s*\?\s*'[^']*'\s*:\s*)?''\)/",
                                "define('PLATFORM_API_KEY',  '$apiKey')",
                                $configContent
                            );
                            file_put_contents($configFile, $configContent, LOCK_EX);
                        }
                    }
                }
            } catch (Exception $e) { /* silent */ }
        }

        // Also check for auto-registered credentials if site-config has empty values
        if ($panelUrl && !$siteId) {
            $autoReg = file_exists($platformDir . '/auto-registered.json')
                ? json_decode(file_get_contents($platformDir . '/auto-registered.json'), true) : null;
            if ($autoReg && !empty($autoReg['site_id'])) {
                $siteId = $autoReg['site_id'];
                $apiKey = $autoReg['api_key'];
            }
        }

        // Check for updates from control panel
        $updateAvailable = false;
        $latestVersion = '';
        $changelog = '';

        if ($panelUrl && $siteId && $apiKey) {
            try {
                $timestamp = time();

                $heartbeatData = json_encode([
                    'site_id' => $siteId,
                    'version' => defined('DROPCMS_VERSION') ? DROPCMS_VERSION : ($input['version'] ?? 'unknown'),
                    'php_version' => PHP_VERSION,
                    'error_count' => count($errors),
                    'errors' => array_slice($errors, 0, 20),
                ]);

                $bodyHash = hash('sha256', $heartbeatData);
                $signature = hash_hmac('sha256', $timestamp . ':' . $siteId . ':' . $bodyHash, $apiKey);

                $ctx = stream_context_create(['http' => [
                    'method' => 'POST',
                    'header' => implode("\r\n", [
                        'Content-Type: application/json',
                        'X-DropCMS-SiteID: ' . $siteId,
                        'X-DropCMS-Timestamp: ' . $timestamp,
                        'X-DropCMS-Signature: ' . $signature,
                    ]),
                    'content' => $heartbeatData,
                    'timeout' => 5,
                    'ignore_errors' => true,
                ]]);
                $result = @file_get_contents($panelUrl . '/panel-api.php?action=heartbeat', false, $ctx);
                if ($result) {
                    $panelResponse = json_decode($result, true);
                    if (!empty($panelResponse['update_available'])) {
                        $updateAvailable = true;
                        $latestVersion = $panelResponse['latest_version'] ?? '';
                        $changelog = $panelResponse['changelog'] ?? '';
                    }
                }
            } catch (Exception $e) { /* silent */ }
        }

        // Save heartbeat timestamp
        file_put_contents($platformDir . '/last-heartbeat.json', json_encode([
            'timestamp' => date('c'),
            'version' => $input['version'] ?? 'unknown',
            'update_available' => $updateAvailable,
        ], JSON_PRETTY_PRINT), LOCK_EX);

        jsonResponse([
            'ok' => true,
            'version' => defined('DROPCMS_VERSION') ? DROPCMS_VERSION : 'unknown',
            'update_available' => $updateAvailable,
            'latest_version' => $latestVersion,
            'changelog' => $changelog,
        ]);
        break;

    // ── Platform: Status (authenticated by HMAC from control panel) ──
    case 'platform-status':
        $siteId = defined('PLATFORM_SITE_ID') ? PLATFORM_SITE_ID : '';
        $apiKey = defined('PLATFORM_API_KEY') ? PLATFORM_API_KEY : '';

        // Verify HMAC signature from control panel
        $reqSiteId = $_SERVER['HTTP_X_DROPCMS_SITEID'] ?? '';
        $reqTimestamp = intval($_SERVER['HTTP_X_DROPCMS_TIMESTAMP'] ?? 0);
        $reqSignature = $_SERVER['HTTP_X_DROPCMS_SIGNATURE'] ?? '';

        if (!$siteId || !$apiKey || $reqSiteId !== $siteId) {
            jsonResponse(['error' => 'Unauthorized'], 401);
        }
        if (abs(time() - $reqTimestamp) > 300) {
            jsonResponse(['error' => 'Request expired'], 401);
        }
        $expectedSig = hash_hmac('sha256', $reqTimestamp . ':' . $siteId . ':' . hash('sha256', ''), $apiKey);
        if (!hash_equals($expectedSig, $reqSignature)) {
            jsonResponse(['error' => 'Invalid signature'], 401);
        }

        $platformDir = __DIR__ . '/_platform';
        $diskUsage = 0;
        if (is_dir(UPLOAD_DIR)) {
            $iter = new RecursiveIteratorIterator(new RecursiveDirectoryIterator(UPLOAD_DIR));
            foreach ($iter as $file) { if ($file->isFile()) $diskUsage += $file->getSize(); }
        }

        jsonResponse([
            'ok' => true,
            'version' => defined('DROPCMS_VERSION') ? DROPCMS_VERSION : 'unknown',
            'php_version' => PHP_VERSION,
            'disk_usage_mb' => round($diskUsage / 1024 / 1024, 1),
            'site_url' => defined('SITE_URL') ? SITE_URL : '',
            'site_name' => defined('SITE_NAME') ? SITE_NAME : '',
        ]);
        break;

    // ── Platform: Self-update (pulls files from release server) ──────
    case 'platform-update':
        requireAuth();
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $targetVersion = $input['version'] ?? '';
        if (!$targetVersion) jsonResponse(['error' => 'No version specified'], 400);

        $panelUrl = defined('PLATFORM_PANEL_URL') ? PLATFORM_PANEL_URL : '';
        if (!$panelUrl) jsonResponse(['error' => 'Platform panel URL not configured'], 400);

        $platformDir = __DIR__ . '/_platform';
        $backupDir = $platformDir . '/backups/v' . (defined('DROPCMS_VERSION') ? DROPCMS_VERSION : 'unknown');
        if (!is_dir($platformDir)) mkdir($platformDir, 0755, true);
        if (!is_dir($backupDir)) mkdir($backupDir, 0755, true);

        // 1. Download manifest
        $ctx = stream_context_create(['http' => ['timeout' => 10, 'ignore_errors' => true]]);
        $manifestUrl = $panelUrl . '/releases/v' . $targetVersion . '/manifest.json';
        $manifestRaw = @file_get_contents($manifestUrl, false, $ctx);
        if (!$manifestRaw) jsonResponse(['error' => 'Failed to download manifest from ' . $manifestUrl], 502);

        $manifest = json_decode($manifestRaw, true);
        if (!$manifest || !isset($manifest['files'])) jsonResponse(['error' => 'Invalid manifest'], 400);

        // 2. Check PHP version requirement
        if (!empty($manifest['min_php_version']) && version_compare(PHP_VERSION, $manifest['min_php_version'], '<')) {
            jsonResponse(['error' => "Requires PHP {$manifest['min_php_version']}, you have " . PHP_VERSION], 400);
        }

        // Allowed files (never update site-config.php, index.html, or data/)
        $allowedFiles = ['dropcms-core.js', 'admin-api.php', 'index.php', 'sw.js'];
        $downloaded = [];

        // 3. Download and verify each file
        foreach ($manifest['files'] as $filename => $fileInfo) {
            if (!in_array($filename, $allowedFiles)) continue;

            $fileUrl = $fileInfo['url'] ?? ($panelUrl . '/releases/v' . $targetVersion . '/' . $filename);
            $fileContent = @file_get_contents($fileUrl, false, $ctx);
            if ($fileContent === false) {
                jsonResponse(['error' => "Failed to download $filename"], 502);
            }

            // Verify SHA-256
            $actualHash = hash('sha256', $fileContent);
            if ($actualHash !== ($fileInfo['sha256'] ?? '')) {
                jsonResponse(['error' => "SHA-256 mismatch for $filename (expected {$fileInfo['sha256']}, got $actualHash)"], 400);
            }

            $downloaded[$filename] = $fileContent;
        }

        if (empty($downloaded)) {
            jsonResponse(['error' => 'No files to update'], 400);
        }

        // 4. Backup current files
        foreach ($downloaded as $filename => $content) {
            $currentPath = __DIR__ . '/' . $filename;
            if (file_exists($currentPath)) {
                copy($currentPath, $backupDir . '/' . $filename);
            }
        }

        // 5. Atomic-ish replacement (write .tmp, then rename)
        $applied = [];
        foreach ($downloaded as $filename => $content) {
            $targetPath = __DIR__ . '/' . $filename;
            $tmpPath = $targetPath . '.tmp';
            file_put_contents($tmpPath, $content, LOCK_EX);
            if (rename($tmpPath, $targetPath)) {
                $applied[] = $filename;
            } else {
                // Rename failed — restore from backup
                foreach ($applied as $restored) {
                    $bak = $backupDir . '/' . $restored;
                    if (file_exists($bak)) copy($bak, __DIR__ . '/' . $restored);
                }
                jsonResponse(['error' => "Failed to apply $filename, rolled back"], 500);
            }
        }

        // 6. Record update
        file_put_contents($platformDir . '/last-update.json', json_encode([
            'from_version' => defined('DROPCMS_VERSION') ? DROPCMS_VERSION : 'unknown',
            'to_version' => $targetVersion,
            'timestamp' => date('c'),
            'files' => $applied,
        ], JSON_PRETTY_PRINT), LOCK_EX);

        jsonResponse(['ok' => true, 'version' => $targetVersion, 'files_updated' => $applied]);
        break;

    // ── Platform: Rollback to previous version ──────────────────────
    case 'platform-rollback':
        requireAuth();
        $platformDir = __DIR__ . '/_platform';

        // Find most recent backup
        $lastUpdate = file_exists($platformDir . '/last-update.json')
            ? json_decode(file_get_contents($platformDir . '/last-update.json'), true) : null;

        if (!$lastUpdate || empty($lastUpdate['from_version'])) {
            jsonResponse(['error' => 'No backup found to rollback to'], 400);
        }

        $backupDir = $platformDir . '/backups/v' . $lastUpdate['from_version'];
        if (!is_dir($backupDir)) {
            jsonResponse(['error' => 'Backup directory not found: v' . $lastUpdate['from_version']], 400);
        }

        $restored = [];
        foreach ($lastUpdate['files'] as $filename) {
            $bakPath = $backupDir . '/' . $filename;
            if (file_exists($bakPath)) {
                copy($bakPath, __DIR__ . '/' . $filename);
                $restored[] = $filename;
            }
        }

        file_put_contents($platformDir . '/last-update.json', json_encode([
            'rollback' => true,
            'to_version' => $lastUpdate['from_version'],
            'timestamp' => date('c'),
            'files' => $restored,
        ], JSON_PRETTY_PRINT), LOCK_EX);

        jsonResponse(['ok' => true, 'rolled_back_to' => $lastUpdate['from_version'], 'files_restored' => $restored]);
        break;

    // ── Platform: Maintenance mode (toggle site on/off) ─────────
    // ── Platform: Receive file updates from control panel ──────
    case 'platform-receive-files':
        // Verify HMAC from panel
        $siteId = defined('PLATFORM_SITE_ID') ? PLATFORM_SITE_ID : '';
        $apiKey = defined('PLATFORM_API_KEY') ? PLATFORM_API_KEY : '';
        $reqSiteId = $_SERVER['HTTP_X_DROPCMS_SITEID'] ?? '';
        $reqTimestamp = intval($_SERVER['HTTP_X_DROPCMS_TIMESTAMP'] ?? 0);
        $reqSignature = $_SERVER['HTTP_X_DROPCMS_SIGNATURE'] ?? '';

        // Also accept admin session as auth
        $isAdmin = !empty($_SESSION['admin_logged_in']);
        $isPanel = false;
        if (!$isAdmin && $siteId && $apiKey && $reqSiteId === $siteId && abs(time() - $reqTimestamp) < 300) {
            $rawBody = file_get_contents('php://input') ?: '';
            $expectedSig = hash_hmac('sha256', $reqTimestamp . ':' . $siteId . ':' . hash('sha256', $rawBody), $apiKey);
            if (hash_equals($expectedSig, $reqSignature)) $isPanel = true;
        }
        if (!$isAdmin && !$isPanel) jsonResponse(['error' => 'Unauthorized'], 401);

        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $files = $input['files'] ?? [];
        $allowedFiles = ['dropcms-core.js', 'admin-api.php', 'index.php', 'sw.js'];

        if (empty($files)) jsonResponse(['error' => 'No files provided'], 400);

        $platformDir = __DIR__ . '/_platform';
        if (!is_dir($platformDir)) mkdir($platformDir, 0755, true);
        $backupDir = $platformDir . '/backups/' . date('Ymd_His');
        if (!is_dir($backupDir)) mkdir($backupDir, 0755, true);

        $updated = [];
        $errors = [];
        foreach ($files as $filename => $content) {
            if (!in_array($filename, $allowedFiles)) {
                $errors[] = "$filename: not allowed";
                continue;
            }
            $targetPath = __DIR__ . '/' . $filename;
            // Backup
            if (file_exists($targetPath)) {
                copy($targetPath, $backupDir . '/' . $filename);
            }
            // Write new file
            if (file_put_contents($targetPath, $content, LOCK_EX) !== false) {
                $updated[] = $filename;
            } else {
                $errors[] = "$filename: write failed";
            }
        }

        jsonResponse(['ok' => empty($errors), 'updated' => $updated, 'errors' => $errors]);
        break;

    case 'platform-maintenance':
        // Accept from admin session OR HMAC-signed panel request
        $isAdmin = !empty($_SESSION['admin_logged_in']);
        $isPanel = false;
        if (!$isAdmin) {
            $reqSiteId = $_SERVER['HTTP_X_DROPCMS_SITEID'] ?? '';
            $reqTimestamp = intval($_SERVER['HTTP_X_DROPCMS_TIMESTAMP'] ?? 0);
            $reqSignature = $_SERVER['HTTP_X_DROPCMS_SIGNATURE'] ?? '';
            $siteId = defined('PLATFORM_SITE_ID') ? PLATFORM_SITE_ID : '';
            $apiKey = defined('PLATFORM_API_KEY') ? PLATFORM_API_KEY : '';
            if ($siteId && $apiKey && $reqSiteId === $siteId && abs(time() - $reqTimestamp) < 300) {
                $body = file_get_contents('php://input') ?: '';
                $expectedSig = hash_hmac('sha256', $reqTimestamp . ':' . $siteId . ':' . hash('sha256', $body), $apiKey);
                if (hash_equals($expectedSig, $reqSignature)) $isPanel = true;
            }
        }
        if (!$isAdmin && !$isPanel) jsonResponse(['error' => 'Unauthorized'], 401);

        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $enabled = !empty($input['enabled']);
        $platformDir = __DIR__ . '/_platform';
        if (!is_dir($platformDir)) mkdir($platformDir, 0755, true);
        $flagFile = $platformDir . '/maintenance.flag';

        if ($enabled) {
            $flagData = [
                'enabled' => true,
                'site_name' => defined('SITE_NAME') ? SITE_NAME : 'Site',
                'message' => $input['message'] ?? 'We\'re working on something new. Check back soon!',
                'enabled_at' => date('c'),
            ];
            file_put_contents($flagFile, json_encode($flagData, JSON_PRETTY_PRINT), LOCK_EX);
            jsonResponse(['ok' => true, 'maintenance' => true]);
        } else {
            if (file_exists($flagFile)) unlink($flagFile);
            jsonResponse(['ok' => true, 'maintenance' => false]);
        }
        break;

    // ── Platform: Check maintenance status ──────────────────────
    case 'platform-maintenance-status':
        $flagFile = __DIR__ . '/_platform/maintenance.flag';
        $active = file_exists($flagFile);
        jsonResponse(['maintenance' => $active]);
        break;

    default:
        jsonResponse(['error' => 'Unknown action', 'available' => [
            'login', 'logout', 'auth-check', 'content', 'posts', 'post', 'upload', 'seo', 'change-password', 'contact', 'weather',
            'platform-heartbeat', 'platform-status', 'platform-update', 'platform-rollback'
        ]], 404);
}

// ─── Default content structure ───────────────────────────────────────
function getDefaultContent() {
    return [
        'hero' => [
            'tagline'     => 'Available for consulting',
            'title1'      => 'Experienced',
            'title2'      => 'Salesforce Consultant',
            'description' => 'I help businesses get the most out of Salesforce — from handling everyday admin work to leading complex implementations that align with key business goals.',
            'stat1_num'   => '15+',
            'stat1_label' => 'Years Experience',
            'stat2_num'   => 'SaaS',
            'stat2_label' => 'Industry Focus',
            'stat3_num'   => 'Sweden',
            'stat3_label' => 'Based in Stockholm',
        ],
        'interim' => [
            'label'       => 'Interim Salesforce Specialist',
            'title'       => 'Flexible Salesforce Administration and Consulting',
            'description' => 'Salesforce Consultant with 15+ years of experience in Sales, Service & Marketing Automation. True Salesforce skill — especially in the SaaS business area — isn\'t something you pick up overnight. It\'s earned through years of working closely with real users, real processes, and real business needs. I help SaaS companies turn Salesforce into a powerful engine for growth.',
            'bullets'     => [
                'Lead Salesforce implementation projects, working closely with business and IT teams',
                'Provide strategic consulting to improve business processes using Salesforce',
                'Support sales efforts by creating proposals and demonstrating Salesforce solutions',
            ],
        ],
        'services' => [
            'adhoc_title'    => 'Flexible Ad-hoc Support',
            'adhoc_subtitle' => 'Time Bank',
            'adhoc_price'    => 'Pre-purchase hours — buy a pot of hours or monthly fixed price. Valid for 6 months. Billed upfront.',
            'adhoc_items'    => [
                'Any Salesforce-related work (admin, advice, small projects)',
                'Custom Salesforce setup & configuration',
                'Reports & Dashboards',
                'Support (Phone/email)',
            ],
            'admin_title'    => 'Salesforce Administration',
            'admin_subtitle' => '32h · 64h · 96h / month',
            'admin_price'    => 'Fixed-price packages — lock hours per week or monthly fixed price. Billed upfront.',
            'admin_items'    => [
                'Troubleshooting and Health Check',
                'User Management',
                'Reports & Dashboards',
                'Data Import & Minor Automations',
                'Daily support (Phone/email)',
            ],
            'project_title'    => 'Project-Based Implementation',
            'project_subtitle' => 'Time & Material',
            'project_price'    => 'Billed monthly based on actual hours worked.',
            'project_items'    => [
                'Business process analysis & design workshops',
                'Custom Salesforce setup & configuration',
                'Integrations with third-party apps',
                'User training session',
                'Post-implementation support for 14 days',
            ],
        ],
        'audit' => [
            'title'       => 'Salesforce Optimization Audit',
            'description' => 'Need a fresh review of your Salesforce instance?',
            'items'       => [
                'Full audit of Salesforce',
                'Identify bottlenecks and automation opportunities',
                'Security, permissions, reporting, and data model review',
                'Discuss findings',
            ],
        ],
        'about' => [
            'title'       => 'Expert Salesforce Consultant for SaaS Solutions',
            'description' => 'Salesforce Consultant with 15+ years of experience in Sales, Service & Marketing Automation. Expert in aligning sales, marketing, and finance processes through scalable Salesforce solutions. Proven ability to manage both daily admin tasks and large-scale implementations involving Sales Cloud, Service Cloud, Pardot, CPQ, and various integrations. Passionate about automation, user adoption, and delivering systems that drive business growth.',
        ],
        'settings' => [
            'ga_id'          => '',
            'contact_email'  => CONTACT_EMAIL,
            'linkedin_url'   => 'https://linkedin.com/in/jesper-h-b1361019',
        ],
        'interimHire' => [
            'title'       => "Need a Salesforce Admin — without the full-time commitment?",
            'description' => "Not every company needs a full-time Salesforce Administrator — but every Salesforce org needs someone who knows what they're doing. Whether you're between hires, scaling up, or simply need senior-level expertise on a flexible basis, I step in as your interim Salesforce Administrator and keep everything running smoothly.",
            'scenarios'   => [
                "Are searching for a permanent Salesforce Administrator and need someone to bridge the gap",
                "Don't need a full-time admin — but need professional-level support regularly",
                "Have a team member on parental leave, sick leave, or vacation",
                "Are growing fast and need an experienced hand to set things up right from the start",
                "Want a senior expert to mentor and support your junior admin",
            ],
            'btn_label'      => "Let's Talk →",
            'btn_linkType'   => 'page',
            'btn_linkTarget' => 'contact',
        ],
        'contact' => [
            'title'   => "Let's start a conversation",
            'address' => 'GeenCloud AB — Stockholm, Sweden',
        ],
        'footer' => [
            'description' => "Since 2010, I've worked as a Salesforce Administrator and System Owner, helping growing SaaS companies streamline and scale their operations.",
        ],
    ];
}
