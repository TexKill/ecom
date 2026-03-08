const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export const setAuthCookies = (token: string, isAdmin: boolean) => {
  if (typeof document === "undefined") return;
  document.cookie = `auth_token=${encodeURIComponent(token)}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  document.cookie = `auth_is_admin=${isAdmin ? "1" : "0"}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax`;
};

export const clearAuthCookies = () => {
  if (typeof document === "undefined") return;
  document.cookie = "auth_token=; Path=/; Max-Age=0; SameSite=Lax";
  document.cookie = "auth_is_admin=; Path=/; Max-Age=0; SameSite=Lax";
};
