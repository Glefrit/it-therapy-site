<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = ['https://it-therapy.ru', 'https://www.it-therapy.ru'];
if ($origin !== '' && !in_array($origin, $allowed, true)) {
    http_response_code(403); echo json_encode(['error'=>'Этот источник не разрешён']); exit;
}
if ($origin !== '') { header('Access-Control-Allow-Origin: '.$origin); header('Vary: Origin'); }
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
try {
    $private = dirname(__DIR__, 2).'/polls-private';
    require $private.'/app.php';
    $config = json_decode(file_get_contents($private.'/config.json'), true, 512, JSON_THROW_ON_ERROR);
    $app = new PollApp($config, $private.'/state');
    $raw = file_get_contents('php://input', false, null, 0, 16385);
    if (strlen($raw) > 16384) { http_response_code(413); echo json_encode(['error'=>'Слишком большой запрос']); exit; }
    $body = $raw === '' ? [] : json_decode($raw, true, 32, JSON_THROW_ON_ERROR);
    if (!is_array($body)) throw new JsonException();
    [$status, $data] = $app->handle($_SERVER['REQUEST_METHOD'], $_GET['route'] ?? '/health', $body, $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '', $_SERVER['REMOTE_ADDR'] ?? 'unknown');
    http_response_code($status);
    if ($status === 429) header('Retry-After: 900');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
} catch (JsonException $e) {
    http_response_code(400); echo json_encode(['error'=>'Неверный формат запроса']);
} catch (Throwable $e) {
    http_response_code(503); echo json_encode(['error'=>'Сервис временно недоступен. Повторите позже.']);
}
