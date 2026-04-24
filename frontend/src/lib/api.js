const DEFAULT_API_URL = "http://localhost:8000";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || DEFAULT_API_URL;

function buildUrl(path) {
  return `${API_BASE_URL}${path}`;
}

function formatErrorDetail(detail) {
  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        if (item && typeof item === "object") {
          const location = Array.isArray(item.loc) ? item.loc.join(" > ") : "field";
          const message = item.msg || "Invalid value";
          return `${location}: ${message}`;
        }

        return "Request failed";
      })
      .join(" | ");
  }

  if (detail && typeof detail === "object") {
    return detail.message || JSON.stringify(detail);
  }

  return "Request failed";
}

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const detail =
      typeof data === "object" && data !== null && "detail" in data
        ? formatErrorDetail(data.detail)
        : "Request failed";
    throw new Error(detail);
  }

  return data;
}

export async function apiFetch(path, options = {}) {
  const response = await fetch(buildUrl(path), {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  return parseResponse(response);
}

export async function loginRequest(email, password) {
  const body = new URLSearchParams();
  body.append("username", email);
  body.append("password", password);

  const response = await fetch(buildUrl("/api/v1/auth/login"), {
    method: "POST",
    body,
  });

  return parseResponse(response);
}
