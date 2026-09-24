declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
    POLL_PASSWORD_HASH?: string;
    POLL_RATE_SECRET?: string;
    POLL_GITHUB_TOKEN?: string;
    BUCKET?: R2Bucket;
  }
}
