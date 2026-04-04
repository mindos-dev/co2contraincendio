export const COOKIE_NAME = "app_session_id";

// ─── Paginação e limites de query ─────────────────────────────────────────────
/** Limite padrão para listas paginadas (ex: equipamentos, manutenções) */
export const DEFAULT_PAGE_LIMIT = 50;
/** Limite para listas de export / relatórios */
export const EXPORT_LIMIT = 500;
/** Limite máximo para listas administrativas */
export const ADMIN_LIST_LIMIT = 200;
/** Limite de logs de acesso por consulta */
export const ACCESS_LOG_LIMIT = 50;
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
export const AXIOS_TIMEOUT_MS = 30_000;
export const UNAUTHED_ERR_MSG = 'Please login (10001)';
export const NOT_ADMIN_ERR_MSG = 'You do not have required permission (10002)';
