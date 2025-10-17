import axios from "axios";

const api = axios.create({
  // ✅ use full backend URL (without trailing /api)
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    "https://dialiease-backend-1.onrender.com",

  withCredentials: true, // ✅ required for Laravel Sanctum cookie sessions

  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

// ✅ Optional: only attach Authorization if you use token auth
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("auth_token") || localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Handle unauthorized errors gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
