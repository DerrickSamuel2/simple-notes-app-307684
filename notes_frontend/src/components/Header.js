import React from "react";

// PUBLIC_INTERFACE
export function Header({ query, onQueryChange, apiBaseUrl }) {
  /** App header with search input and current API base URL indicator. */
  return (
    <div className="header">
      <div className="header-left">
        <div className="app-title">Notes</div>
        <div className="app-subtitle">Create, edit, and manage your notes</div>
      </div>

      <div className="header-right">
        <div className="search">
          <input
            className="input"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search by title…"
            aria-label="Search notes by title"
          />
        </div>

        <div className={`api-pill ${apiBaseUrl ? "ok" : "missing"}`} title={apiBaseUrl || "Missing base URL"}>
          API: {apiBaseUrl ? "configured" : "not set"}
        </div>
      </div>
    </div>
  );
}
