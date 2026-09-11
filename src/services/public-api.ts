import axios from "axios";

/**
 * Public API client for unauthenticated requests
 * Used for public endpoints like document verification
 */
export const publicApi = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL || "https://mindgest-api.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
    ...(process.env.NEXT_PUBLIC_API_KEY ? { "x-api-key": process.env.NEXT_PUBLIC_API_KEY } : {}),
  },
});

// No authentication interceptors for public API
export default publicApi;
