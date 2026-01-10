// loan-application/api.ts
async function jsonFetch<T = any>(url: string, opts: RequestInit = {}) {
  const headers: any = opts.headers || {};
  if (!(opts.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
//   headers["Authorization"] = `Bearer ${localStorage.getItem("sessionId") || ""}`;
  const res = await fetch(`${url}`, { ...opts, headers });
  if (!res.ok) {
    const text = await res.text();
    try {
      const parsed = JSON.parse(text);
      throw parsed;
    } catch {
      throw new Error(text || "API error");
    }
  }
  // If no content
  if (res.status === 204) return null as unknown as T;
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return (await res.json()) as T;
  return (await res.text()) as unknown as T;
}

export default {
  get: <T = any>(path: string) => jsonFetch<T>(path, { method: "GET" }),
  put: <T = any>(path: string, body?: any, opts: RequestInit = {}) =>
    jsonFetch<T>(path, { method: "PUT", body: body instanceof FormData ? body : JSON.stringify(body) ,...opts}),
  post: <T = any>(path: string, body?: any, opts: RequestInit = {}) =>
    jsonFetch<T>(path, { method: "POST", body: body instanceof FormData ? body : JSON.stringify(body), ...opts }),
  del: <T = any>(path: string) => jsonFetch<T>(path, { method: "DELETE" }),
};
