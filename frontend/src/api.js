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

// Response interceptor to handle 304 Not Modified and ensure loading states resolve
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 304 Not Modified - axios treats this as an error sometimes
    if (error.response?.status === 304) {
      // Return a resolved response with the cached data
      return Promise.resolve({
        data: error.response.config.cachedResponse || {},
        status: 304,
        statusText: "Not Modified",
        headers: error.response.headers,
        config: error.response.config,
        request: error.response.request
      });
    }
    return Promise.reject(error);
  }
);

export default API;
