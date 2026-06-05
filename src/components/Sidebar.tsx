import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChatSession } from "../types";
import { 
  Calculator, 
  Timer, 
  FileText, 
  Bot, 
  Key, 
  BarChart3, 
  HelpCircle, 
  Settings, 
  Plus, 
  Search, 
  Pin, 
  PinOff, 
  Edit2, 
  Trash2, 
  MessageSquare,
  Sparkles,
  LayoutGrid,
  User,
  LogOut
} from "lucide-react";

interface SidebarProps {
  chats: ChatSession[];
  currentChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onRenameChat: (id: string) => void;
  onPinChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  visibleView: string;
  onGoToView: (view: string) => void;
  searchVal: string;
  onSearchChange: (val: string) => void;
  onCloseMobileSidebar?: () => void;
  profile: { name: string; age: number; avatar?: string };
  onOpenProfile: () => void;
  onClearProfile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  chats,
  currentChatId,
  onSelectChat,
  onNewChat,
  onRenameChat,
  onPinChat,
  onDeleteChat,
  visibleView,
  onGoToView,
  searchVal,
  onSearchChange,
  onCloseMobileSidebar,
  profile,
  onOpenProfile,
  onClearProfile,
}) => {
  const filtered = chats.filter(
    (c) =>
      c.title.toLowerCase().includes(searchVal.toLowerCase()) ||
      (c.messages || []).some((m) => m.content.toLowerCase().includes(searchVal.toLowerCase()))
  );

  const pinnedChats = filtered.filter((c) => c.pinned);
  const regularChats = filtered.filter((c) => !c.pinned);

  const renderRelativeTime = (ts: number) => {
    const elapsed = Date.now() - ts;
    if (elapsed < 60000) return "now";
    if (elapsed < 3600000) return `${~~(elapsed / 60000)}m`;
    if (elapsed < 86400000) return `${~~(elapsed / 3600000)}h`;
    return `${~~(elapsed / 86400000)}d`;
  };

  const navItems = [
    { id: "chat", label: "AI Chat Room" },
    { id: "tools", label: "Auryx Tools Hub" },
    { id: "api", label: "API Keys Vault" },
    { id: "guide", label: "API Setup Guide" },
    { id: "settings", label: "System Settings" },
  ];

  const navItemIcons: Record<string, React.ReactNode> = {
    chat: <MessageSquare size={13} />,
    tools: <LayoutGrid size={13} />,
    api: <Key size={13} className="text-cyan-400" />,
    guide: <HelpCircle size={13} className="text-teal-400" />,
    settings: <Settings size={13} />,
  };

  return (
    <div className="w-[260px] h-full flex flex-col bg-[var(--sidebar)] border-r border-[var(--border)] font-sans z-50 transition-colors duration-200">
      {/* Brand Header */}
      <div className="h-14 px-4.5 border-b border-[var(--border)] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2 text-left">
          <div className="w-6.5 h-6.5 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center shrink-0">
            <Sparkles size={12} className="text-[var(--accent)] animate-pulse" />
          </div>
          <div className="flex flex-col leading-none">
            <div className="flex items-center gap-1.5">
              <span className="font-sans font-bold text-xs tracking-tight text-[var(--text)]">Auryx AI</span>
              <span className="px-1 py-0.2 text-[7px] font-bold uppercase bg-[var(--accent)]/10 text-[var(--accent)] tracking-wider rounded">
                PRO
              </span>
            </div>
            <span className="text-[8px] font-medium text-[var(--text-dim)]/70 mt-0.5">
              Enterprise Suite v4.2
            </span>
          </div>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="p-3.5 flex flex-col gap-2 flex-shrink-0">
        <button
          onClick={() => {
            onNewChat();
            if (onCloseMobileSidebar) onCloseMobileSidebar();
          }}
          className="w-full h-9 flex items-center justify-between px-3 bg-[var(--accent)] hover:brightness-110 active:scale-[0.98] text-white rounded-lg text-xs font-semibold transition-all shadow-[0_2px_10px_var(--accent-glow)] select-none cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Plus size={13} strokeWidth={2.5} />
            <span>New Chat</span>
          </span>
          <span className="px-1 py-0.5 text-[8px] font-mono tracking-tighter bg-white/10 rounded select-none opacity-80">
            Ctrl+P
          </span>
        </button>

        {/* Local Search Input */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.02] theme-light:bg-black/[0.02] border border-[var(--border)] rounded-lg text-[var(--text-dim)]">
          <Search size={12} className="flex-shrink-0 opacity-60" />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search chats..."
            className="w-full bg-transparent border-none outline-none font-sans text-xs text-[var(--text)] placeholder-[var(--text-dim)]/40 text-left"
          />
        </div>
      </div>

      {/* Scrollable Conversation Archives List */}
      <div className="flex-1 overflow-y-auto px-2 select-none">
        {chats.length === 0 ? (
          <div className="py-12 text-center text-xs text-white/20">
            No active prompt threads yet
          </div>
        ) : (
          <>
            {/* Pinned Section */}
            {pinnedChats.length > 0 && (
              <div className="mb-4">
                <div className="px-3 py-1 text-[9px] font-semibold text-[var(--text-dim)]/40 uppercase tracking-widest">
                  Pinned Threads
                </div>
                <motion.div 
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { staggerChildren: 0.04 }
                    }
                  }}
                  className="flex flex-col gap-0.5 mt-1 animate-fadeIn"
                >
                  <AnimatePresence mode="popLayout">
                    {pinnedChats.map((c) => (
                      <motion.div
                        key={c.id}
                        variants={{
                          hidden: { opacity: 0, x: -12, scale: 0.96 },
                          visible: { 
                            opacity: 1, 
                            x: 0, 
                            scale: 1, 
                            transition: { type: "spring", stiffness: 200, damping: 20 } 
                          },
                          exit: { opacity: 0, x: -12, scale: 0.95, transition: { duration: 0.15 } }
                        }}
                        whileHover={{ scale: 1.015, x: 2 }}
                        whileTap={{ scale: 0.985 }}
                        onClick={() => {
                          onSelectChat(c.id);
                          if (onCloseMobileSidebar) onCloseMobileSidebar();
                        }}
                        className={`group relative flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer border border-transparent transition-all ${
                          currentChatId === c.id && visibleView === "chat"
                            ? "bg-[var(--accent)]/10 border-[var(--accent)]/20 shadow-[0_4px_12px_rgba(124,58,237,0.04)]"
                            : "hover:bg-white/5 hover:theme-light:bg-black/5"
                        }`}
                      >
                        <Pin size={11} className="text-[var(--accent)] shrink-0" />
                        <span className={`text-xs flex-1 truncate ${
                          currentChatId === c.id && visibleView === "chat"
                            ? "text-[var(--accent)] font-semibold"
                            : "text-[var(--text)]/80"
                        }`}>
                          {c.title}
                        </span>
                        <span className="text-[9px] text-[var(--text-dim)]/40 group-hover:hidden flex-shrink-0">
                          {renderRelativeTime(c.updatedAt)}
                        </span>

                        {/* Tool Actions */}
                        <div className="hidden group-hover:flex items-center gap-1 flex-shrink-0 z-10">
                          <button
                            onClick={(e) => { e.stopPropagation(); onRenameChat(c.id); }}
                            title="Rename"
                            className="p-1 hover:bg-white/10 hover:theme-light:bg-black/10 rounded text-[var(--text-dim)] hover:text-[var(--text)] transition-all cursor-pointer"
                          >
                            <Edit2 size={10} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); onPinChat(c.id); }}
                            title="Unpin"
                            className="p-1 hover:bg-white/10 hover:theme-light:bg-black/10 rounded text-[var(--text-dim)] hover:text-[var(--text)] transition-all cursor-pointer"
                          >
                            <PinOff size={10} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); onDeleteChat(c.id); }}
                            title="Delete"
                            className="p-1 hover:bg-red-500/20 rounded text-red-400 hover:text-red-300 transition-all cursor-pointer"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </div>
            )}

            {/* Recent Section */}
            {regularChats.length > 0 && (
              <div>
                <div className="px-3 py-1 text-[9px] font-semibold text-[var(--text-dim)]/40 uppercase tracking-widest font-sans">
                  Recent Threads
                </div>
                <motion.div 
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { staggerChildren: 0.03 }
                    }
                  }}
                  className="flex flex-col gap-0.5 mt-1 font-sans"
                >
                  <AnimatePresence mode="popLayout">
                    {regularChats.map((c) => (
                      <motion.div
                        key={c.id}
                        variants={{
                          hidden: { opacity: 0, x: -12, scale: 0.96 },
                          visible: { 
                            opacity: 1, 
                            x: 0, 
                            scale: 1, 
                            transition: { type: "spring", stiffness: 200, damping: 20 } 
                          },
                          exit: { opacity: 0, x: -12, scale: 0.95, transition: { duration: 0.15 } }
                        }}
                        whileHover={{ scale: 1.015, x: 2 }}
                        whileTap={{ scale: 0.985 }}
                        onClick={() => {
                          onSelectChat(c.id);
                          if (onCloseMobileSidebar) onCloseMobileSidebar();
                        }}
                        className={`group relative flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer border border-transparent transition-all ${
                          currentChatId === c.id && visibleView === "chat"
                            ? "bg-[var(--accent)]/10 border-[var(--accent)]/20 shadow-[0_4px_12px_rgba(124,58,237,0.04)]"
                            : "hover:bg-white/5 hover:theme-light:bg-black/5"
                        }`}
                      >
                        <MessageSquare size={11} className="text-[var(--text-dim)]/40 shrink-0" />
                        <span className={`text-xs flex-1 truncate ${
                          currentChatId === c.id && visibleView === "chat"
                            ? "text-[var(--accent)] font-semibold"
                            : "text-[var(--text)]/80"
                        }`}>
                          {c.title}
                        </span>
                        <span className="text-[9px] text-[var(--text-dim)]/40 group-hover:hidden flex-shrink-0">
                          {renderRelativeTime(c.updatedAt)}
                        </span>

                        {/* Tool Actions */}
                        <div className="hidden group-hover:flex items-center gap-1 flex-shrink-0 z-10">
                          <button
                            onClick={(e) => { e.stopPropagation(); onRenameChat(c.id); }}
                            title="Rename"
                            className="p-1 hover:bg-white/10 hover:theme-light:bg-black/10 rounded text-[var(--text-dim)] hover:text-[var(--text)] transition-all cursor-pointer"
                          >
                            <Edit2 size={10} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); onPinChat(c.id); }}
                            title="Pin"
                            className="p-1 hover:bg-white/10 hover:theme-light:bg-black/10 rounded text-[var(--text-dim)] hover:text-[var(--text)] transition-all cursor-pointer"
                          >
                            <Pin size={10} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); onDeleteChat(c.id); }}
                            title="Delete"
                            className="p-1 hover:bg-red-500/20 rounded text-red-400 hover:text-red-300 transition-all cursor-pointer"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Navigations Footer with high-fidelity animated active capsule slide indicator */}
      <nav className="p-2 border-t border-[var(--border)] bg-black/[0.1] flex flex-col gap-0.5 flex-shrink-0 font-sans">
        {navItems.map((n) => {
          const isActive = visibleView === n.id;
          return (
            <motion.div
              key={n.id}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                onGoToView(n.id);
                if (onCloseMobileSidebar) onCloseMobileSidebar();
              }}
              className={`relative flex items-center gap-2.5 px-3 py-1.5 rounded-lg cursor-pointer text-xs font-medium border border-transparent transition-all duration-200 group ${
                isActive
                  ? "text-[var(--accent)] font-semibold"
                  : "text-[var(--text-dim)] hover:text-[var(--text)]"
              }`}
            >
              {/* Sliding glowing background capsule */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-tab-back"
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  className="absolute inset-0 bg-[var(--accent)]/[0.08] border-l-2 border-[var(--accent)] rounded-lg z-0"
                />
              )}
              
              <span className="relative z-10 flex-shrink-0 text-[var(--text-dim)]/65 group-hover:text-[var(--text)] transition-colors">
                {navItemIcons[n.id]}
              </span>
              <span className="relative z-10 truncate">{n.label}</span>
            </motion.div>
          );
        })}
      </nav>

      {/* User Profile Slot -- Polished Account Creator */}
      <div className="p-3 border-t border-[var(--border)] bg-black/[0.15]">
        {profile && profile.name ? (
          <div className="flex items-center justify-between gap-1">
            <div 
              onClick={onOpenProfile}
              className="flex items-center gap-2.5 flex-1 min-w-0 hover:bg-white/5 hover:theme-light:bg-black/5 p-1.5 rounded-lg transition-colors cursor-pointer"
              title="Personalize profile"
            >
              {profile.avatar ? (
                <img 
                  src={profile.avatar} 
                  alt="Avatar" 
                  className="w-8.5 h-8.5 rounded-full object-cover shrink-0 shadow-md border border-[var(--border)]"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8.5 h-8.5 rounded-full bg-[var(--accent)]/15 border border-[var(--accent)]/20 text-[var(--accent)] font-bold flex items-center justify-center text-xs shadow-sm shrink-0 uppercase select-none">
                  {profile.name.charAt(0)}
                </div>
              )}
              <div className="flex flex-col min-w-0 text-left leading-tight">
                <span className="text-[12px] font-semibold text-[var(--text)] truncate">
                  {profile.name}
                </span>
                <span className="text-[10px] text-[var(--text-dim)]/70 block mt-0.5 truncate">
                  Age: {profile.age} (Active)
                </span>
              </div>
            </div>
            {onClearProfile && (
              <button
                onClick={onClearProfile}
                title="Log out profile"
                className="p-1.5 hover:bg-red-500/10 hover:text-red-400 text-[var(--text-dim)] rounded-lg transition-colors cursor-pointer shrink-0"
              >
                <LogOut size={13} />
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenProfile}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 border border-dashed border-[var(--border)] hover:border-[var(--accent)] rounded-lg text-xs font-semibold text-[var(--text-dim)] hover:text-[var(--text)] hover:bg-white/5 hover:theme-light:bg-black/5 transition-all active:scale-[0.98] cursor-pointer"
          >
            <User size={13} className="text-[var(--accent)]" />
            <span>Create Profile Account</span>
          </button>
        )}
      </div>
    </div>
  );
};
