# Сервер опросов REG.RU

PHP 8.3 с расширениями curl и mbstring. Основной сайт и формы размещены на GitHub Pages. Хранилище опросов — `data/polls.json` в этом репозитории.

Размещение файлов на хостинге:

- `public/index.php` и `public/.htaccess` → `~/www/api.it-therapy.ru/`
- `app.php` и секретный `config.json` → `~/polls-private/`
- `~/polls-private/state/` создаётся автоматически для сессий и ограничения попыток входа.

У каталога `polls-private` должны быть права 700; у config.json — 600. Никогда не помещайте config.json, state или архив с настройками в публичную папку сайта или Git.

Формат config.json: объект со строками `githubToken`, `passwordHash`, `rateSecret`. Пароль хранится как `salt:hex`, где hex — PBKDF2-SHA256, 100000 итераций, 32 байта. GitHub-токен имеет Contents Read and write только для этого репозитория.

Проверка: `php test.php`. API: `https://api.it-therapy.ru/index.php?route=/health`. Все маршруты передаются через параметр route; запросы панели используют заголовок Authorization: Bearer. Cookies не требуются. CORS разрешает it-therapy.ru и www.it-therapy.ru.

Опросы публичны в GitHub. Удаление убирает опрос из актуального файла, но оставляет историю Git. При недоступности GitHub сервер возвращает ошибку, не выдавая отправку за успешную.

Перед изменением маршрута на основном сайте проверьте действующий HTTPS-сертификат, вход, отправку ответа и наличие коммита в GitHub. Старый сервер отключайте после успешной проверки нового.
