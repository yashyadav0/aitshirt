// Helper to build request headers with dev/test admin bypass

export function getAdminHeaders() {

  const token =
    localStorage.getItem(
      "token"
    );

  const headers = {
    Authorization: `Bearer ${token}`
  };

  // Dev/test bypass header for local testing without DB admin role
  const isDev =
    import.meta.env.DEV ||
    import.meta.env.MODE === "development";

  if (isDev) {
    headers["x-admin-bypass"] = "true";
  }

  return headers;
}
