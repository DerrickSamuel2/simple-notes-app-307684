import React, { useEffect } from "react";

/**
 * Toast message component.
 * Controlled by parent; can auto-dismiss.
 */

// PUBLIC_INTERFACE
export function Toast({ toast, onDismiss }) {
  /** Renders a toast message (success/error/info). */
  useEffect(() => {
    if (!toast) return undefined;
    if (!toast.autoCloseMs) return undefined;

    const id = window.setTimeout(() => {
      onDismiss?.();
    }, toast.autoCloseMs);

    return () => window.clearTimeout(id);
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <div className={`toast toast-${toast.type || "info"}`} role="status" aria-live="polite">
      <div className="toast-content">
        <div className="toast-title">{toast.title}</div>
        {toast.message ? <div className="toast-message">{toast.message}</div> : null}
      </div>
      <button className="icon-btn" onClick={onDismiss} aria-label="Dismiss">
        ✕
      </button>
    </div>
  );
}
