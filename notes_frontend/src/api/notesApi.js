const DEFAULT_TIMEOUT_MS = 15000;

function normalizeBaseUrl(raw) {
  if (!raw) return "";
  // Support values like "localhost:8000" by adding protocol
  const trimmed = String(raw).trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed.replace(/\/+$/, "");
  return `http://${trimmed.replace(/\/+$/, "")}`;
}

// PUBLIC_INTERFACE
export function getApiBaseUrl() {
  /**
   * Reads the backend base URL from env variables.
   * Preference: REACT_APP_API_BASE, then REACT_APP_BACKEND_URL
   */
  const base =
    process.env.REACT_APP_API_BASE ||
    process.env.REACT_APP_BACKEND_URL ||
    "";
  return normalizeBaseUrl(base);
}

async function fetchJson(path, options = {}) {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    const err = new Error(
      "Missing API base URL. Set REACT_APP_API_BASE or REACT_APP_BACKEND_URL."
    );
    err.code = "NO_BASE_URL";
    throw err;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const res = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      signal: controller.signal,
    });

    const contentType = res.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");

    if (!res.ok) {
      let detail = "";
      try {
        const body = isJson ? await res.json() : await res.text();
        detail = typeof body === "string" ? body : JSON.stringify(body);
      } catch {
        // ignore
      }
      const err = new Error(
        detail || `Request failed with status ${res.status}`
      );
      err.status = res.status;
      throw err;
    }

    if (res.status === 204) return null;
    return isJson ? res.json() : res.text();
  } catch (e) {
    if (e && e.name === "AbortError") {
      const err = new Error("Request timed out. Please try again.");
      err.code = "TIMEOUT";
      throw err;
    }
    throw e;
  } finally {
    clearTimeout(timeoutId);
  }
}

// PUBLIC_INTERFACE
export async function listNotes() {
  /** Fetch all notes. */
  return fetchJson("/notes", { method: "GET" });
}

// PUBLIC_INTERFACE
export async function createNote(payload) {
  /** Create a new note. Expects {title, content}. */
  return fetchJson("/notes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// PUBLIC_INTERFACE
export async function updateNote(id, payload) {
  /** Update an existing note. Expects {title, content}. */
  return fetchJson(`/notes/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// PUBLIC_INTERFACE
export async function deleteNote(id) {
  /** Delete a note by id. */
  return fetchJson(`/notes/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
