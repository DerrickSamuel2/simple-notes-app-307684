import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import { createNote, deleteNote, getApiBaseUrl, listNotes, updateNote } from "./api/notesApi";
import { Header } from "./components/Header";
import { NoteEditor } from "./components/NoteEditor";
import { NotesList } from "./components/NotesList";
import { Toast } from "./components/Toast";

/**
 * Notes app entry.
 * Assumes backend REST routes:
 *  - GET    /notes
 *  - POST   /notes
 *  - PUT    /notes/:id
 *  - DELETE /notes/:id
 */

// PUBLIC_INTERFACE
function App() {
  /** Main app component rendering notes list and editor. */
  const apiBaseUrl = getApiBaseUrl();
  const apiMissing = !apiBaseUrl;

  const [query, setQuery] = useState("");
  const [notes, setNotes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [editorMode, setEditorMode] = useState("create"); // create | edit
  const [isSaving, setIsSaving] = useState(false);

  const [toast, setToast] = useState(null);

  const selectedNote = useMemo(() => notes.find((n) => String(n.id) === String(selectedId)) || null, [notes, selectedId]);

  const filteredNotes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter((n) => String(n.title || "").toLowerCase().includes(q));
  }, [notes, query]);

  const showToast = (t) => {
    setToast({
      type: t.type || "info",
      title: t.title || "",
      message: t.message || "",
      autoCloseMs: t.autoCloseMs ?? 2500,
    });
  };

  const load = async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const data = await listNotes();

      // Be tolerant of backend response shapes: either array directly or {items: []}
      const items = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
      setNotes(items);

      // Select first note by default (if none selected)
      if (items.length > 0 && selectedId == null) {
        setSelectedId(items[0].id);
        setEditorMode("edit");
      }
      if (items.length === 0) {
        setSelectedId(null);
        setEditorMode("create");
      }
    } catch (e) {
      setLoadError(e?.message || "Failed to load notes.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (apiMissing) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBaseUrl]);

  const handleSelect = (note) => {
    setSelectedId(note.id);
    setEditorMode("edit");
  };

  const handleCreateNew = () => {
    setSelectedId(null);
    setEditorMode("create");
  };

  const handleSave = async ({ title, content }) => {
    if (apiMissing) return;

    setIsSaving(true);
    try {
      if (editorMode === "edit" && selectedNote) {
        const updated = await updateNote(selectedNote.id, { title, content });
        const updatedNote = updated?.id != null ? updated : { ...selectedNote, title, content };

        setNotes((prev) => prev.map((n) => (String(n.id) === String(selectedNote.id) ? updatedNote : n)));
        showToast({ type: "success", title: "Saved", message: "Your changes were saved." });
      } else {
        const created = await createNote({ title, content });

        // If backend returns created note, use it; else fallback to reloading.
        if (created && created.id != null) {
          setNotes((prev) => [created, ...prev]);
          setSelectedId(created.id);
          setEditorMode("edit");
        } else {
          await load();
        }
        showToast({ type: "success", title: "Created", message: "New note created." });
      }
    } catch (e) {
      showToast({ type: "error", title: "Save failed", message: e?.message || "Could not save note." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (note) => {
    if (apiMissing) return;

    const ok = window.confirm(`Delete "${note.title || "Untitled"}"? This cannot be undone.`);
    if (!ok) return;

    try {
      await deleteNote(note.id);
      setNotes((prev) => prev.filter((n) => String(n.id) !== String(note.id)));

      // Update selection after delete
      if (String(selectedId) === String(note.id)) {
        const remaining = notes.filter((n) => String(n.id) !== String(note.id));
        if (remaining.length > 0) {
          setSelectedId(remaining[0].id);
          setEditorMode("edit");
        } else {
          setSelectedId(null);
          setEditorMode("create");
        }
      }

      showToast({ type: "success", title: "Deleted", message: "Note deleted." });
    } catch (e) {
      showToast({ type: "error", title: "Delete failed", message: e?.message || "Could not delete note." });
    }
  };

  return (
    <div className="App">
      <div className="app-shell">
        <Header query={query} onQueryChange={setQuery} apiBaseUrl={apiBaseUrl} />

        {apiMissing ? (
          <div className="setup-notice">
            <div className="alert alert-error">
              <div className="alert-title">Backend URL missing</div>
              <div className="alert-message">
                Set <code>REACT_APP_API_BASE</code> (preferred) or <code>REACT_APP_BACKEND_URL</code> to your backend base
                URL (example: <code>http://localhost:8000</code>), then restart <code>npm start</code>.
              </div>
            </div>
          </div>
        ) : null}

        <div className="content">
          <NotesList
            notes={filteredNotes}
            selectedId={selectedId}
            onSelect={handleSelect}
            onCreateNew={handleCreateNew}
            onDelete={handleDelete}
            isLoading={isLoading}
            error={loadError}
            onRetry={load}
          />

          <NoteEditor
            mode={editorMode}
            note={selectedNote}
            onCancel={handleCreateNew}
            onSave={handleSave}
            isSaving={isSaving}
            apiMissing={apiMissing}
          />
        </div>

        <Toast toast={toast} onDismiss={() => setToast(null)} />
      </div>
    </div>
  );
}

export default App;
