import axios from "axios";

const apiOrigin =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const API = axios.create({

  baseURL:
    `${apiOrigin}/api`
});

API.interceptors.request.use((config) => {

  const token =
    localStorage.getItem(
      "token"
    );

  if (token && !config.headers.Authorization) {
    config.headers.Authorization =
      `Bearer ${token}`;
  }

  return config;
});

export default API;
