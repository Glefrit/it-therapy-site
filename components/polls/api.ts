export function pollFetch(path: string, init: RequestInit = {}) {
  return fetch("https://api.it-therapy.ru/index.php?route=" + encodeURIComponent(path), { ...init, cache: "no-store", credentials: "omit" });
}
