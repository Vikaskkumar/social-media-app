// Production & Development API Configuration
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

// Global fetch interceptor so relative endpoint calls seamlessly work across decoupled domains
if (typeof window !== "undefined" && !window.__apiFetchPatched) {
  window.__apiFetchPatched = true;
  const originalFetch = window.fetch;
  window.fetch = function (resource, config) {
    if (typeof resource === "string" && resource.startsWith("/") && !resource.startsWith("//")) {
      const baseUrl = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
      if (baseUrl) {
        resource = `${baseUrl}${resource}`;
      }
    }
    return originalFetch(resource, config);
  };
}
