import React from "react";

// PUBLIC_INTERFACE
export function NotesList({
  notes,
  selectedId,
  onSelect,
  onCreateNew,
  onDelete,
  isLoading,
  error,
  onRetry,
}) {
  /** Left panel list of notes with selection, create, and delete actions. */
  return (
    <div className="panel panel-left">
      <div className="panel-header">
        <div className="panel-title">Your notes</div>
        <button className="btn btn-primary" onClick={onCreateNew}>
          + New
        </button>
      </div>

      {isLoading ? (
        <div className="panel-body">
          <div className="skeleton" />
          <div className="skeleton" />
          <div className="skeleton" />
        </div>
      ) : error ? (
        <div className="panel-body">
          <div className="alert alert-error">
            <div className="alert-title">Couldn’t load notes</div>
            <div className="alert-message">{error}</div>
            <button className="btn btn-ghost" onClick={onRetry}>
              Retry
            </button>
          </div>
        </div>
      ) : notes.length === 0 ? (
        <div className="panel-body">
          <div className="empty">
            <div className="empty-title">No notes yet</div>
            <div className="empty-message">Create your first note to get started.</div>
            <button className="btn btn-primary" onClick={onCreateNew}>
              Create a note
            </button>
          </div>
        </div>
      ) : (
        <div className="panel-body notes-list" role="list">
          {notes.map((n) => (
            <NoteItem
              key={String(n.id)}
              note={n}
              isSelected={String(n.id) === String(selectedId)}
              onSelect={() => onSelect(n)}
              onDelete={() => onDelete(n)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function NoteItem({ note, isSelected, onSelect, onDelete }) {
  return (
    <div className={`note-item ${isSelected ? "selected" : ""}`} role="listitem">
      <button className="note-item-main" onClick={onSelect} aria-label={`Open note ${note.title || "Untitled"}`}>
        <div className="note-title">{note.title || "Untitled"}</div>
        <div className="note-preview">{(note.content || "").slice(0, 80) || "No content"}</div>
      </button>
      <button className="icon-btn danger" onClick={onDelete} aria-label={`Delete note ${note.title || "Untitled"}`}>
        🗑
      </button>
    </div>
  );
}
