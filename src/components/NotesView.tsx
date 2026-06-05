import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AppNote } from "../types";
import { 
  Pin, 
  PinOff, 
  Plus, 
  FileText, 
  Trash2, 
  Search, 
  Eye, 
  Edit3, 
  BookOpen, 
  Clock, 
  FileEdit,
  Sparkles,
  ChevronRight,
  Maximize2
} from "lucide-react";

interface NotesViewProps {
  onAddToast: (msg: string, type?: "success" | "error" | "info" | "warn") => void;
}

export const NotesView: React.FC<NotesViewProps> = ({ onAddToast }) => {
  const [notes, setNotes] = useState<AppNote[]>(() => {
    try {
      const cached = localStorage.getItem("nx_notes_v3");
      return cached
        ? JSON.parse(cached)
        : [
            {
              id: "n-default",
              title: "Productivity Manifesto",
              content: "# Core Principles\n\n- Build high-density UI\n- Optimize for zero latency\n- Support keyboard controls\n\n> Work smarter, compile sharper.",
              createdAt: Date.now(),
              updatedAt: Date.now(),
              pinned: true,
            },
          ];
    } catch {
      return [];
    }
  });

  const [activeId, setActiveId] = useState<string | null>(notes.length > 0 ? notes[0].id : null);
  const [search, setSearch] = useState("");
  const [editorMode, setEditorMode] = useState<"write" | "preview">("write");

  // Sync state to local storage
  useEffect(() => {
    try {
      localStorage.setItem("nx_notes_v3", JSON.stringify(notes));
    } catch {
      // transient local fail
    }
  }, [notes]);

  const activeNote = notes.find((n) => n.id === activeId);

  const handleCreate = () => {
    const nextId = "note-" + Date.now();
    const newNote: AppNote = {
      id: nextId,
      title: "",
      content: "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      pinned: false,
    };
    setNotes((prev) => [newNote, ...prev]);
    setActiveId(nextId);
    setEditorMode("write");
    onAddToast("New note created successfully", "success");
  };

  const handleUpdate = (field: "title" | "content", val: string) => {
    if (!activeId) return;
    setNotes((prev) =>
      prev.map((n) =>
        n.id === activeId
          ? { ...n, [field]: val, updatedAt: Date.now() }
          : n
      )
    );
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (activeId === id) {
      const remaining = notes.filter((n) => n.id !== id);
      setActiveId(remaining.length > 0 ? remaining[0].id : null);
    }
    onAddToast("Note removed from notebook", "info");
  };

  const handlePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n))
    );
    onAddToast("Pin status updated", "success");
  };

  const countWords = (txt: string) => {
    const cleaned = txt.trim();
    return cleaned ? cleaned.split(/\s+/).length : 0;
  };

  const getReadingTime = (txt: string) => {
    const words = countWords(txt);
    return Math.max(1, Math.ceil(words / 200));
  };

  const injectMarkdown = (wrapperStart: string, wrapperEnd: string = "") => {
    const textarea = document.getElementById("note-editor-area") as HTMLTextAreaElement;
    if (!textarea || !activeNote) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const originalText = textarea.value;
    const selectedText = originalText.slice(start, end);

    const insertedText = wrapperStart + selectedText + wrapperEnd;
    const newText = originalText.slice(0, start) + insertedText + originalText.slice(end);

    handleUpdate("content", newText);

    // reset cursor positions
    setTimeout(() => {
      textarea.focus();
      const nextCursorPos = start + wrapperStart.length + selectedText.length;
      textarea.setSelectionRange(nextCursorPos, nextCursorPos);
    }, 20);
  };

  const filtered = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase())
  );

  const pinned = filtered.filter((n) => n.pinned);
  const regular = filtered.filter((n) => !n.pinned);

  // High-fidelity custom live Markdown renderer
  const renderMarkdownPreview = (text: string) => {
    if (!text.trim()) {
      return (
        <div className="flex flex-col items-center justify-center text-center py-24 text-zinc-500 font-sans">
          <BookOpen size={24} className="mb-2 opacity-30 text-[var(--accent)]" />
          <p className="text-xs italic">Nothing written yet. Write some markdown content to view interactive rendering.</p>
        </div>
      );
    }

    const lines = text.split("\n");
    let insideCodeBlock = false;
    let codeSnippet: string[] = [];

    return (
      <div className="prose prose-invert max-w-none text-zinc-300 font-sans space-y-3 leading-normal">
        {lines.map((line, idx) => {
          // Code block toggle
          if (line.trim().startsWith("```")) {
            if (insideCodeBlock) {
              insideCodeBlock = false;
              const codeText = codeSnippet.join("\n");
              codeSnippet = [];
              return (
                <div key={idx} className="relative group my-3">
                  <div className="absolute top-2.5 right-2 px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-[8.5px] text-zinc-400 font-mono select-none uppercase">
                    Code Buffer
                  </div>
                  <pre className="bg-[#0b0b0d] border border-white/5 p-4 rounded-xl font-mono text-[11px] text-emerald-400 overflow-x-auto leading-relaxed shadow-inner">
                    <code>{codeText}</code>
                  </pre>
                </div>
              );
            } else {
              insideCodeBlock = true;
              return null;
            }
          }

          if (insideCodeBlock) {
            codeSnippet.push(line);
            return null;
          }

          // Header levels
          if (line.startsWith("# ")) {
            return (
              <h1 key={idx} className="text-xl sm:text-2xl font-black text-white mt-5 mb-2.5 tracking-tight border-b border-white/5 pb-2">
                {line.slice(2)}
              </h1>
            );
          }
          if (line.startsWith("## ")) {
            return (
              <h2 key={idx} className="text-lg sm:text-xl font-extrabold text-white mt-4 mb-2 tracking-tight">
                {line.slice(3)}
              </h2>
            );
          }
          if (line.startsWith("### ")) {
            return (
              <h3 key={idx} className="text-sm sm:text-base font-bold text-zinc-100 mt-3 mb-1.5">
                {line.slice(4)}
              </h3>
            );
          }

          // Bullet points
          if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
            const content = line.trim().substring(2);
            return (
              <div key={idx} className="flex items-start gap-2.5 pl-2 my-1 text-zinc-300">
                <span className="text-[var(--accent)] text-xs mt-1 shrink-0 select-none">•</span>
                <span className="text-xs sm:text-sm">{content}</span>
              </div>
            );
          }

          // Blockquotes
          if (line.startsWith("> ")) {
            return (
              <blockquote key={idx} className="border-l-2 border-[var(--accent)] bg-white/[0.01] pl-4 py-2.5 my-3 rounded-r-xl text-zinc-300 italic text-[11px] sm:text-[12.5px]">
                {line.slice(2)}
              </blockquote>
            );
          }

          // Empty spacing
          if (!line.trim()) {
            return <div key={idx} className="h-2" />;
          }

          // Inline Bold parser
          const italicState = line.split("*");
          const finalPieces = italicState.map((italPart, iIdx) => {
            // Bold nested checking
            const parseBold = (str: string) => {
              const boldParts = str.split("**");
              return boldParts.map((boldPart, bIdx) => {
                if (bIdx % 2 === 1) {
                  return <strong key={bIdx} className="font-extrabold text-white">{boldPart}</strong>;
                }
                return boldPart;
              });
            };

            if (iIdx % 2 === 1) {
              return <em key={iIdx} className="text-zinc-200">{parseBold(italPart)}</em>;
            }
            return <React.Fragment key={iIdx}>{parseBold(italPart)}</React.Fragment>;
          });

          return (
            <p key={idx} className="text-xs sm:text-sm leading-relaxed mb-1.5 text-zinc-300">
              {finalPieces}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex-1 flex overflow-hidden font-sans border-t border-white/5 animate-fadeUp bg-[#0a0a0c]">
      
      {/* 📒 Left Sidebar notes ledger */}
      <div className="w-[240px] border-r border-white/5 flex flex-col bg-[#0b0b0e] flex-shrink-0 select-none">
        
        {/* Notebook top card header */}
        <div className="p-4 border-b border-white/5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 px-1.5 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] text-[10px] font-black uppercase tracking-wider">
                LEDGER
              </div>
              <span className="text-[12.5px] font-black text-white">Notebooks</span>
            </div>
            <button
              onClick={handleCreate}
              title="Create new note"
              className="w-7 h-7 rounded-lg bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 border border-[var(--accent)]/20 hover:border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)] transition-all cursor-pointer hover:scale-[1.03] active:scale-[0.97]"
            >
              <Plus size={14} strokeWidth={2.5} />
            </button>
          </div>

          {/* Clean Glassmorphic Search box */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.01] hover:bg-white/[0.03] focus-within:bg-white/[0.03] focus-within:ring-1 focus-within:ring-[var(--accent)]/30 border border-white/5 rounded-xl text-zinc-400 group transition-all">
            <Search size={11} className="text-zinc-500 group-focus-within:text-[var(--accent)] transition-colors shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter study entries..."
              className="w-full bg-transparent border-none outline-none font-sans text-[11px] text-[#FAFAFA] placeholder-zinc-600 font-medium"
            />
          </div>
        </div>

        {/* Catalog List section */}
        <div className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-1.5 scrollbar-thin">
          {filtered.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center justify-center gap-2 text-[#A1A1AA]/30">
              <FileText size={20} className="stroke-1 text-zinc-600" />
              <span className="text-[10px] font-medium tracking-wide">No ledger notes match</span>
            </div>
          ) : (
            <>
              {/* Pinned section layout */}
              {pinned.length > 0 && (
                <div className="flex flex-col gap-1">
                  <div className="px-2 py-1 text-[9px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Pin size={8.5} className="text-amber-500" />
                    <span>Pinned Shelf</span>
                  </div>
                  
                  {pinned.map((n) => (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ x: 2, scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setActiveId(n.id)}
                      className={`group relative p-3 rounded-xl cursor-pointer border transition-all ${
                        activeId === n.id
                          ? "bg-[var(--accent)]/10 border-[var(--accent)]/30 text-white"
                          : "bg-white/[0.01] border-transparent hover:bg-white/[0.03] hover:border-white/5 text-zinc-400 hover:text-white"
                      }`}
                    >
                      <div className="text-[12px] truncate font-bold pr-7 flex items-center gap-1.5">
                        <Pin size={10} className="text-amber-500 shrink-0 rotate-45" />
                        <span>{n.title || "Untitled draft"}</span>
                      </div>
                      
                      <p className="text-[10.5px] text-zinc-500 truncate mt-1 group-hover:text-zinc-400 font-medium leading-tight">
                        {n.content ? n.content.replace(/[#*`_>]/g, "").slice(0, 30) : "Empty study block"}
                      </p>

                      <div className="flex items-center gap-2 mt-2 font-mono text-[9px] text-zinc-600 uppercase">
                        <span>{getReadingTime(n.content)}m read</span>
                        <span>•</span>
                        <span>{countWords(n.content)} words</span>
                      </div>

                      {/* Quick action bar floaters */}
                      <div className="absolute right-2.5 top-2.5 opacity-0 group-hover:opacity-100 flex items-center gap-1 bg-zinc-950/90 border border-white/5 p-1 rounded-lg shadow-lg backdrop-blur transition-opacity z-10">
                        <button
                          onClick={(e) => handlePin(n.id, e)}
                          title="Unpin folder item"
                          className="p-1 rounded text-zinc-400 hover:text-amber-500 cursor-pointer transition-colors"
                        >
                          <PinOff size={11} />
                        </button>
                        <button
                          onClick={(e) => handleDelete(n.id, e)}
                          title="Delete document"
                          className="p-1 rounded text-zinc-400 hover:text-red-400 cursor-pointer transition-colors"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Regular general list */}
              {regular.length > 0 && (
                <div className="flex flex-col gap-1 mt-1">
                  {pinned.length > 0 && (
                    <div className="px-2 py-1 text-[9px] font-black text-zinc-500 uppercase tracking-widest mt-1">
                      All general files
                    </div>
                  )}
                  
                  {regular.map((n) => (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ x: 2, scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setActiveId(n.id)}
                      className={`group relative p-3 rounded-xl cursor-pointer border transition-all ${
                        activeId === n.id
                          ? "bg-[var(--accent)]/10 border-[var(--accent)]/30 text-white"
                          : "bg-white/[0.01] border-transparent hover:bg-white/[0.03] hover:border-white/5 text-zinc-400 hover:text-white"
                      }`}
                    >
                      <div className="text-[12px] truncate font-bold pr-7">
                        {n.title || "Untitled draft"}
                      </div>
                      
                      <p className="text-[10.5px] text-zinc-500 truncate mt-1 group-hover:text-zinc-400 font-medium leading-tight">
                        {n.content ? n.content.replace(/[#*`_>]/g, "").slice(0, 31) : "Empty study block"}
                      </p>

                      <div className="flex items-center gap-2 mt-2 font-mono text-[9px] text-zinc-600 uppercase">
                        <span>{getReadingTime(n.content)}m read</span>
                        <span>•</span>
                        <span>{countWords(n.content)} words</span>
                      </div>

                      {/* Quick action bar floaters */}
                      <div className="absolute right-2.5 top-2.5 opacity-0 group-hover:opacity-100 flex items-center gap-1 bg-zinc-950/90 border border-white/5 p-1 rounded-lg shadow-lg backdrop-blur transition-opacity z-10">
                        <button
                          onClick={(e) => handlePin(n.id, e)}
                          title="Pin paper"
                          className="p-1 rounded text-zinc-400 hover:text-white cursor-pointer transition-colors"
                        >
                          <Pin size={11} />
                        </button>
                        <button
                          onClick={(e) => handleDelete(n.id, e)}
                          title="Delete entries"
                          className="p-1 rounded text-zinc-400 hover:text-red-400 cursor-pointer transition-colors"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 📝 Right Canvas workspace block */}
      <div className="flex-1 flex flex-col bg-[#08080a] relative">
        {activeNote ? (
          <>
            {/* Top rich text option selection bar & mode controller tab */}
            <div className="h-11 px-4.5 border-b border-white/5 bg-zinc-950/50 flex items-center justify-between flex-shrink-0 z-10">
              
              {/* Left format tools group */}
              <div className="flex items-center gap-1">
                {editorMode === "write" ? (
                  <>
                    <button
                      onClick={() => injectMarkdown("**", "**")}
                      title="Bold markdown highlight"
                      className="w-7 h-7 rounded-lg hover:bg-white/5 flex items-center justify-center font-bold text-zinc-400 hover:text-white transition-all text-xs"
                    >
                      B
                    </button>
                    <button
                      onClick={() => injectMarkdown("*", "*")}
                      title="Italicise texts"
                      className="w-7 h-7 rounded-lg hover:bg-white/5 flex items-center justify-center italic text-zinc-400 hover:text-white transition-all text-xs"
                    >
                      I
                    </button>
                    <button
                      onClick={() => injectMarkdown("# ", "")}
                      title="Primary title"
                      className="px-2 h-7 rounded-lg hover:bg-white/5 text-[10.5px] font-extrabold text-zinc-400 hover:text-white transition-all"
                    >
                      H1
                    </button>
                    <button
                      onClick={() => injectMarkdown("## ", "")}
                      title="Subtitle context"
                      className="px-2 h-7 rounded-lg hover:bg-white/5 text-[10.5px] font-bold text-zinc-400 hover:text-white transition-all"
                    >
                      H2
                    </button>
                    <button
                      onClick={() => injectMarkdown("- ", "")}
                      title="Bullet point sequence"
                      className="w-7 h-7 rounded-lg hover:bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white pb-0.5 text-base"
                    >
                      •
                    </button>
                    <button
                      onClick={() => injectMarkdown("> ", "")}
                      title="Visual blockquote emphasis"
                      className="w-7 h-7 rounded-lg hover:bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white text-xs"
                    >
                      ❝
                    </button>
                    <button
                      onClick={() => injectMarkdown("```\n", "\n```")}
                      title="Insert coding script markdown"
                      className="px-2 h-7 rounded-lg hover:bg-white/5 text-[9.5px] font-mono text-zinc-400 hover:text-white flex items-center justify-center"
                    >
                      &lt;/&gt;
                    </button>
                  </>
                ) : (
                  <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 py-1 px-2 bg-white/5 rounded-md flex items-center gap-1.5">
                    <BookOpen size={10} className="text-[var(--accent)]" />
                    <span>Render view is active</span>
                  </span>
                )}
              </div>

              {/* Right view trigger tab triggers */}
              <div className="flex items-center gap-1">
                <div className="bg-[#141416]/90 p-0.5 border border-white/5 rounded-xl flex items-center select-none shadow">
                  <button
                    onClick={() => {
                      setEditorMode("write");
                      onAddToast("Write mode active", "info");
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      editorMode === "write"
                        ? "bg-[var(--accent)] text-white shadow-sm"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Edit3 size={11} />
                    <span>Write</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditorMode("preview");
                      onAddToast("Rendering markdown layout", "info");
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      editorMode === "preview"
                        ? "bg-[var(--accent)] text-white shadow-sm"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Eye size={11} />
                    <span>Preview</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Editor Workspace panels */}
            <div className="flex-1 flex flex-col p-6 overflow-y-auto max-w-3xl w-full mx-auto">
              
              {editorMode === "write" ? (
                <div className="flex-1 flex flex-col gap-4">
                  {/* Dynamic clean title field */}
                  <input
                    type="text"
                    value={activeNote.title}
                    onChange={(e) => handleUpdate("title", e.target.value)}
                    placeholder="Provide a conceptual title..."
                    className="w-full bg-transparent border-none outline-none font-bold text-xl sm:text-2xl text-[#FAFAFA] placeholder-zinc-700 tracking-tight"
                  />
                  
                  <div className="h-[1px] w-full bg-white/5" />

                  {/* Document Content text area */}
                  <textarea
                    id="note-editor-area"
                    value={activeNote.content}
                    onChange={(e) => handleUpdate("content", e.target.value)}
                    placeholder="Write beautiful study notes here in Markdown... (e.g. # Header, - point, > emphasis)"
                    className="flex-1 w-full bg-transparent border-none outline-none font-sans text-xs sm:text-sm text-[#FAFAFA] placeholder-zinc-600 resize-none leading-relaxed overflow-y-auto"
                  />
                </div>
              ) : (
                <div className="flex-1 space-y-4">
                  {/* Styled Title rendering */}
                  <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight">
                    {activeNote.title || <span className="text-zinc-600 italic">Untitled Document</span>}
                  </h1>
                  
                  <div className="h-[1px] w-full bg-white/5" />
                  
                  {/* Rendered content */}
                  <div className="pt-2 animate-fadeIn">
                    {renderMarkdownPreview(activeNote.content)}
                  </div>
                </div>
              )}
            </div>

            {/* Floating context drawer actions footer */}
            <div className="h-8.5 px-6 border-t border-white/5 bg-[#0b0b0e] flex items-center justify-between text-[10px] text-zinc-500 font-medium tracking-wide select-none flex-shrink-0">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Clock size={10} />
                  <span>{getReadingTime(activeNote.content)} min read</span>
                </span>
                <span>{countWords(activeNote.content)} words</span>
                <span>{activeNote.content.length} characters</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => handlePin(activeNote.id, e)}
                  className={`flex items-center gap-1 transition-colors cursor-pointer hover:text-white ${
                    activeNote.pinned ? "text-amber-500" : ""
                  }`}
                  title={activeNote.pinned ? "Unpin document" : "Pin document"}
                >
                  <Pin size={10} />
                  <span className="uppercase">{activeNote.pinned ? "Pinned" : "Pin Note"}</span>
                </button>
                
                <span>|</span>

                <button
                  onClick={(e) => handleDelete(activeNote.id, e)}
                  className="flex items-center gap-1 text-red-500 hover:text-red-400 transition-colors cursor-pointer"
                  title="Remove document"
                >
                  <Trash2 size={10} />
                  <span className="uppercase">Delete</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-zinc-600 font-sans p-6 animate-fadeIn">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.01] border border-white/5 flex items-center justify-center mb-4">
              <FileText size={24} className="stroke-1 text-zinc-500" />
            </div>
            <h3 className="text-sm font-bold text-zinc-300">No active note</h3>
            <p className="text-[11px] text-zinc-500 max-w-xs mt-1.5 leading-relaxed">
              Create a brand-new page study draft or select an existing ledger ledger entry from the left navigation tree to begin writing.
            </p>
            <button
              onClick={handleCreate}
              className="mt-4 px-4 py-2 bg-[var(--accent)] hover:brightness-115 text-white active:scale-[0.98] text-[11px] font-extrabold uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-lg shadow-[var(--accent-glow)]"
            >
              Start draft +
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
