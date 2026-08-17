// Production & Development API Configuration
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

// Global fetch interceptor so relative endpoint calls work seamlessly and handle server errors gracefully
if (typeof window !== "undefined" && !window.__apiFetchPatched) {
  window.__apiFetchPatched = true;
  const originalFetch = window.fetch;
  window.fetch = async function (resource, config) {
    if (typeof resource === "string" && resource.startsWith("/") && !resource.startsWith("//")) {
      const baseUrl = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
      if (baseUrl) {
        resource = `${baseUrl}${resource}`;
      }
    }
    const response = await originalFetch(resource, config);
    
    // Safely parse JSON responses to prevent 'Unexpected token' syntax crashes on server 500 HTML responses
    const originalJson = response.json.bind(response);
    response.json = async function () {
      try {
        return await originalJson();
      } catch {
        const text = await response.clone().text().catch(() => "");
        return {
          error: text.toLowerCase().includes("server error")
            ? "Server error. Please verify MONGODB_URI & JWT_SECRET in your Vercel Environment Variables."
            : text || "Invalid response from server",
          success: false
        };
      }
    };
    return response;
  };
}
