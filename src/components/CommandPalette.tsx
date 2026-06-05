import React, { useState, useEffect, useRef } from "react";
import { ChatSession } from "../types";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  chats: ChatSession[];
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onGoToView: (view: any) => void;
  onToggleTheme: () => void;
  onOpenSysPrompt: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  chats,
  onSelectChat,
  onNewChat,
  onGoToView,
  onToggleTheme,
  onOpenSysPrompt,
}) => {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Define commands list
  const getCommands = () => [
    { cat: "Navigate", ico: "💬", n: "Chat Workspace", d: "Open AI conversation", action: () => onGoToView("chat") },
    { cat: "Navigate", ico: "🧮", n: "Scientific Calculator", d: "Basic, Sci, and Programmer solver", action: () => onGoToView("calculator") },
    { cat: "Navigate", ico: "⏱", n: "Timer & Clock suite", d: "Stopwatch, alarms, world clock", action: () => onGoToView("timer") },
    { cat: "Navigate", ico: "📝", n: "Markdown Notes", d: "Edit, pin, and count workspace notes", action: () => onGoToView("notes") },
    { cat: "Navigate", ico: "🔑", n: "Manage API Keys", d: "Set credentials safely", action: () => onGoToView("api") },
    { cat: "Navigate", ico: "🤖", n: "Model Dials & Specs", d: "Explore speeds and metadata", action: () => onGoToView("models") },
    { cat: "Navigate", ico: "📊", n: "Usage Analytics", d: "Statistics, chats counters, history", action: () => onGoToView("analytics") },
    { cat: "Navigate", ico: "⚙️", n: "Workspace Settings", d: "Configure accents and typography", action: () => onGoToView("settings") },
    { cat: "Navigate", ico: "❓", n: "Setup Guide", d: "How-tos & shortcuts card", action: () => onGoToView("guide") },
    { cat: "Actions", ico: "➕", n: "Create New Chat", d: "Open fresh dialogue", action: onNewChat },
    { cat: "Actions", ico: "🎨", n: "Toggle Theme Mode", d: "Light/Dark styles transition", action: onToggleTheme },
    { cat: "Actions", ico: "✏️", n: "System Prompt Dialog", d: "Fine-tune AI persona globally", action: onOpenSysPrompt },
    ...chats.slice(0, 10).map((c) => ({
      cat: "Recent Conversations",
      ico: "💬",
      n: c.title || "Untitled Chat",
      d: `${(c.messages || []).length} messages · ${new Date(c.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      action: () => onSelectChat(c.id),
    }))
  ];

  const commands = getCommands();
  const filtered = query
    ? commands.filter(
        (c) =>
          c.n.toLowerCase().includes(query.toLowerCase()) ||
          c.d.toLowerCase().includes(query.toLowerCase()) ||
          c.cat.toLowerCase().includes(query.toLowerCase())
      )
    : commands;

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].action();
          onClose();
        }
      } else if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-md z-[500] flex items-start justify-center pt-[10dvh]"
      onClick={onClose}
    >
      <div
        className="w-[580px] max-w-[92vw] bg-[#0d1117] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5 bg-[#161b22]/50">
          <svg
            className="text-white/40 flex-shrink-0"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search commands, widgets, and recent chats..."
            className="flex-1 bg-transparent border-none outline-none font-sans text-sm text-[#e6edf3] placeholder-white/30"
          />
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-[10px] text-white/40 font-mono">
            ESC
          </kbd>
        </div>

        {/* List items */}
        <div className="max-h-[360px] overflow-y-auto px-2 py-3 flex flex-col gap-0.5">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-white/30">
              No results found for "{query}"
            </div>
          ) : (
            (() => {
              // Group elements by category dynamically
              const rendered: React.ReactNode[] = [];
              let lastGroup = "";

              filtered.forEach((cmd, idx) => {
                if (cmd.cat !== lastGroup) {
                  lastGroup = cmd.cat;
                  rendered.push(
                    <div
                      key={"group-" + cmd.cat}
                      className="px-3 pt-3 pb-1 text-[10px] font-bold tracking-widest text-white/30 uppercase font-sans"
                    >
                      {cmd.cat}
                    </div>
                  );
                }

                const active = idx === selectedIndex;
                rendered.push(
                  <div
                    key={"cmd-" + idx}
                    className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-150 border-l-[3px] ${
                      active
                        ? "bg-[hsl(210,100%,60%,0.12)] border-[hsl(210,100%,60%)]"
                        : "border-transparent hover:bg-white/5"
                    }`}
                    onClick={() => {
                      cmd.action();
                      onClose();
                    }}
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#21262d] flex items-center justify-center text-lg shadow-inner">
                      {cmd.ico}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-sm font-medium ${
                          active ? "text-[hsl(210,100%,60%)]" : "text-[#e6edf3]"
                        }`}
                      >
                        {cmd.n}
                      </div>
                      <div className="text-xs text-white/40 truncate">
                        {cmd.d}
                      </div>
                    </div>
                  </div>
                );
              });
              return rendered;
            })()
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center gap-4 px-5 py-3.5 border-t border-white/5 bg-[#161b22]/30 text-xs text-white/30 font-sans">
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded border border-white/10 bg-white/5 text-[9px] font-mono">
              ↑↓
            </kbd>{" "}
            Navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded border border-white/10 bg-white/5 text-[9px] font-mono">
              Enter
            </kbd>{" "}
            Select
          </span>
          <span className="flex items-center gap-1 ml-auto">
            Ctrl + K to open
          </span>
        </div>
      </div>
    </div>
  );
};
