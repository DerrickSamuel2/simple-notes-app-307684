import React, { useEffect, useMemo, useState } from "react";

// PUBLIC_INTERFACE
export function NoteEditor({
  mode, // "create" | "edit"
  note,
  onCancel,
  onSave,
  isSaving,
  apiMissing,
}) {
  /** Editor form for creating/updating a note (title required). */
  const initial = useMemo(() => {
    if (mode === "edit" && note) {
      return { title: note.title || "", content: note.content || "" };
    }
    return { title: "", content: "" };
  }, [mode, note]);

  const [title, setTitle] = useState(initial.title);
  const [content, setContent] = useState(initial.content);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    setTitle(initial.title);
    setContent(initial.content);
    setTouched(false);
  }, [initial.title, initial.content]);

  const titleError = touched && title.trim().length === 0 ? "Title is required." : "";

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (title.trim().length === 0) return;
    onSave({ title: title.trim(), content });
  };

  return (
    <div className="panel panel-right">
      <div className="panel-header">
        <div className="panel-title">{mode === "edit" ? "Edit note" : "New note"}</div>
        <div className="panel-actions">
          <button className="btn btn-ghost" onClick={onCancel} disabled={isSaving}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={isSaving || apiMissing}>
            {isSaving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      <div className="panel-body">
        {apiMissing ? (
          <div className="alert alert-error">
            <div className="alert-title">API base URL is not configured</div>
            <div className="alert-message">
              Set <code>REACT_APP_API_BASE</code> (preferred) or <code>REACT_APP_BACKEND_URL</code>, then restart the dev
              server.
            </div>
          </div>
        ) : null}

        <form className="form" onSubmit={handleSubmit}>
          <label className="label">
            Title <span className="required">*</span>
          </label>
          <input
            className={`input ${titleError ? "input-error" : ""}`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="e.g. Grocery list"
            aria-invalid={Boolean(titleError)}
          />
          {titleError ? <div className="field-error">{titleError}</div> : null}

          <label className="label">Content</label>
          <textarea
            className="textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your note…"
            rows={12}
          />

          <div className="hint">
            Tip: Use the list on the left to switch between notes. Deleting asks for confirmation.
          </div>
        </form>
      </div>
    </div>
  );
}
