import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PROVS, MODELS } from "../constants";
import { 
  Sparkles, 
  Zap, 
  Network, 
  Bot, 
  Brain, 
  Plus, 
  Search, 
  Download, 
  Maximize2,
  Minimize2,
  Sliders,
  Menu,
  ChevronRight,
  ChevronDown,
  Globe,
  Trash2,
  Key,
  Check,
  X
} from "lucide-react";

interface HeaderProps {
  title: string;
  onToggleSidebar: () => void;
  onOpenCmd: () => void;
  onExportChat: () => void;
  onNewChat: () => void;
  activeProvider: string;
  activeModel: string;
  onChangeModel: (prov: string, model: string) => void;
  chatEmpty: boolean;
  onAddToast: (msg: string, type?: "success" | "error" | "info" | "warn") => void;
  apiKeys: Record<string, string>;
  onSaveKey: (id: string, val: string) => void;
  onRemoveKey: (id: string) => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onToggleSidebar,
  onOpenCmd,
  onExportChat,
  onNewChat,
  activeProvider,
  activeModel,
  onChangeModel,
  chatEmpty,
  onAddToast,
  apiKeys,
  onSaveKey,
  onRemoveKey,
  onOpenSettings
}) => {
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [keysDropdownOpen, setKeysDropdownOpen] = useState(false);
  const [headerInputKey, setHeaderInputKey] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const modelDropdownRef = useRef<HTMLDivElement>(null);
  const keysDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    document.addEventListener("webkitfullscreenchange", handleFsChange);
    document.addEventListener("mozfullscreenchange", handleFsChange);
    document.addEventListener("MSFullscreenChange", handleFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFsChange);
      document.removeEventListener("webkitfullscreenchange", handleFsChange);
      document.removeEventListener("mozfullscreenchange", handleFsChange);
      document.removeEventListener("MSFullscreenChange", handleFsChange);
    };
  }, []);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  // Synchronize key input with active provider key
  useEffect(() => {
    setHeaderInputKey(apiKeys[activeProvider] || "");
  }, [activeProvider, apiKeys]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(e.target as Node)) {
        setModelDropdownOpen(false);
      }
      if (keysDropdownRef.current && !keysDropdownRef.current.contains(e.target as Node)) {
        setKeysDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const activeModelDetails = MODELS[activeProvider]?.find((m) => m.id === activeModel);

  const providerIconMap: Record<string, React.ReactNode> = {
    gemini: <Sparkles size={11} className="text-blue-400" />,
    groq: <Zap size={11} className="text-orange-500" />,
    openrouter: <Network size={11} className="text-purple-400" />,
    openai: <Bot size={11} className="text-teal-400" />,
    anthropic: <Brain size={11} className="text-[#CC785C]" />,
    cohere: <Bot size={11} className="text-emerald-500" />,
  };

  const handleSaveActiveKey = () => {
    const clean = headerInputKey.trim();
    if (clean) {
      onSaveKey(activeProvider, clean);
      const provName = PROVS.find((p) => p.id === activeProvider)?.name || activeProvider;
      onAddToast(`Key saved for ${provName}`, "success");
    } else {
      onRemoveKey(activeProvider);
      const provName = PROVS.find((p) => p.id === activeProvider)?.name || activeProvider;
      onAddToast(`Key removed for ${provName}`, "info");
    }
  };

  return (
    <div className="w-full shrink-0 flex flex-col bg-[#0d0d0e] border-b border-[#1d1d21] z-40 select-none">
      {/* 💻 LAPTOP HEADER VIEW (hidden on mobile, styled to pixel-perfection) */}
      <header className="hidden md:flex h-16 items-center px-6 justify-between gap-4">
        {/* Brand/Logo Area */}
        <div className="flex items-center gap-2.5">
          <motion.svg 
            viewBox="0 0 100 100" 
            className="w-8 h-8 drop-shadow-[0_0_12px_rgba(168,85,247,0.55)] cursor-pointer"
            whileHover={{ scale: 1.15, rotate: 180 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 220, damping: 15 }}
          >
            <defs>
              <linearGradient id="header-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c084fc" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
            <path 
              d="M50 0C50 22 78 50 100 50C78 50 50 78 50 100C50 78 22 50 0 50C22 50 50 22 50 0Z" 
              fill="url(#header-logo-grad)" 
            />
          </motion.svg>
          <div className="flex items-center gap-1.5 select-none">
            <span className="font-sans font-black text-sm tracking-[0.06em] text-white uppercase bg-gradient-to-r from-white via-[#e2e2e9] to-[#9a9ab0] bg-clip-text">
              AURYX AI
            </span>
            <motion.button
              whileHover={{ scale: 1.2, color: "#a5b4fc", backgroundColor: "rgba(255,255,255,0.06)" }}
              whileTap={{ scale: 0.88 }}
              onClick={handleToggleFullscreen}
              title={isFullscreen ? "Exit Fullscreen Mode" : "Enter Fullscreen Mode"}
              className="p-1.5 text-zinc-500 hover:text-indigo-300 rounded-lg transition-colors cursor-pointer flex items-center justify-center outline-none"
            >
              {isFullscreen ? <Minimize2 size={13} strokeWidth={2.5} /> : <Maximize2 size={13} strokeWidth={2.5} />}
            </motion.button>
          </div>
        </div>

        {/* Mid segment: Model selector directly adjacent */}
        <div className="flex-1 max-w-xs ml-4 relative" ref={modelDropdownRef}>
          <button
            onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
            className="flex items-center justify-between w-full px-3.5 py-1.5 bg-[#151518] border border-[#1d1d21] rounded-xl text-xs font-semibold text-[#e3e3e3] hover:border-[#2a2a32] hover:bg-[#18181c] transition-all cursor-pointer select-none"
          >
            <div className="flex items-center gap-2">
              <Sparkles size={13} className="text-indigo-400 animate-pulse" />
              <span className="text-[#a0a0aa] font-medium">Model:</span>
              <span className="truncate max-w-[130px]">
                {activeModelDetails ? activeModelDetails.n : activeModel}
              </span>
            </div>
            <ChevronDown size={12} className="text-zinc-500" />
          </button>

          {/* Model selection dropdown */}
          <AnimatePresence>
            {modelDropdownOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute left-0 mt-2 w-[240px] max-h-[350px] overflow-y-auto bg-[#151518] border border-[#1d1d21] rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.65)] p-2 z-50 overflow-x-hidden"
              >
                {PROVS.map((prov) => {
                  const modelsList = MODELS[prov.id] || [];
                  return (
                    <div key={prov.id} className="mb-2 last:mb-0">
                      <div className="px-2.5 py-1 text-[9.5px] uppercase font-extrabold tracking-wider text-zinc-500 flex items-center gap-1.5 border-b border-[#1d1d21]/30 pb-0.5 mb-1 select-none">
                        <span>{providerIconMap[prov.id] || <Bot size={11} />}</span>
                        <span>{prov.name}</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        {modelsList.map((m) => {
                          const isSelected = activeProvider === prov.id && activeModel === m.id;
                          return (
                            <button
                              key={m.id}
                              onClick={() => {
                                onChangeModel(prov.id, m.id);
                                setModelDropdownOpen(false);
                              }}
                              className={`w-full flex items-center justify-between text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                                isSelected
                                  ? "bg-indigo-500/10 text-indigo-400 font-bold"
                                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
                              }`}
                            >
                              <span className="truncate pr-1">{m.n}</span>
                              {m.tag && (
                                <span className="px-1 py-0.2 rounded text-[7.5px] font-black uppercase tracking-widest bg-zinc-800 text-zinc-500">
                                  {m.tag}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Segment: API Multi key management & Save button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#151518] border border-[#1d1d21] rounded-xl px-1.5 py-1 gap-2 relative" ref={keysDropdownRef}>
            {/* Popover trigger label */}
            <button
              onClick={() => setKeysDropdownOpen(!keysDropdownOpen)}
              className="flex items-center gap-1.5 px-2 py-1 bg-transparent text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer select-none"
              title="Manage API keys for Gemini, OpenAI, Groq, Anthropic, OpenRouter, and Cohere on the same board!"
            >
              <Globe size={13} className="text-[#10a37f]" />
              <span>API Key</span>
              <ChevronDown size={11} className="text-zinc-500 ml-0.5" />
            </button>

            {/* Inline active key entry fields */}
            <input
              type="password"
              placeholder={`Enter code key for ${PROVS.find((p) => p.id === activeProvider)?.name.replace("Google ", "") || activeProvider}...`}
              value={headerInputKey}
              onChange={(e) => setHeaderInputKey(e.target.value)}
              className="px-2.5 py-1 bg-[#0d0d0e] border border-[#1d1d21] rounded-lg text-xs text-white placeholder-zinc-600 w-44 outline-none focus:border-indigo-500/50"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveActiveKey();
              }}
            />

            <motion.button
              whileHover={{ scale: 1.05, filter: "brightness(1.15)" }}
              whileTap={{ scale: 0.94 }}
              onClick={handleSaveActiveKey}
              className="px-3.5 py-1 bg-gradient-to-r from-[#9b5de5] to-[#f15bb5] text-black font-black text-xs rounded-lg shadow-[0_0_12px_rgba(155,93,229,0.35)] cursor-pointer transition-all outline-none"
            >
              Save
            </motion.button>

            {/* Keys dropdown popover - Multi key manager right in the bar! */}
            <AnimatePresence>
              {keysDropdownOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 top-11 w-[320px] bg-[#151518] border border-[#1d1d21] rounded-2xl shadow-[0_12px_45px_rgba(0,0,0,0.7)] p-4.5 z-50 font-sans"
                >
                  <div className="flex items-center justify-between border-b border-[#1d1d21] pb-2 mb-3">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-white uppercase tracking-wider">Multi API Workspace</span>
                      <span className="text-[10px] text-zinc-500 mt-0.5 leading-normal">Configure and key in all your developer models.</span>
                    </div>
                    <X size={14} className="text-zinc-500 hover:text-white cursor-pointer" onClick={() => setKeysDropdownOpen(false)} />
                  </div>
  
                  <div className="flex flex-col gap-3">
                    {PROVS.map((p) => {
                      const hasKey = !!apiKeys[p.id];
                      return (
                        <div key={p.id} className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-zinc-300 flex items-center gap-1.5">
                              <span className="text-xs">{p.ico}</span>
                              <span>{p.name.replace("Google ", "")}</span>
                            </span>
                            <span className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded ${
                              hasKey ? "bg-green-500/10 text-green-400" : "bg-zinc-800 text-zinc-500"
                            }`}>
                              {hasKey ? "Set" : "Empty"}
                            </span>
                          </div>
                          <div className="flex gap-1.5">
                            <input
                              type="password"
                              placeholder={hasKey ? "••••••••••••" : "Paste credentials..."}
                              onChange={(e) => {
                                const v = e.target.value.trim();
                                if (v) {
                                  onSaveKey(p.id, v);
                                }
                              }}
                              className="flex-1 px-2.5 py-1 bg-[#0d0d0e] border border-[#1d1d21] rounded-lg text-xs hover:border-[#1d1d21] text-white font-mono outline-none focus:border-indigo-500/40"
                            />
                            {hasKey && (
                              <button
                                onClick={() => {
                                  onRemoveKey(p.id);
                                  onAddToast(`Removed Key for ${p.name}`, "info");
                                }}
                                className="p-1 px-1.5 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 cursor-pointer active:scale-95 transition-all"
                                title="Delete Saved Key"
                              >
                                <Trash2 size={11} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Export & New Chat mini buttons */}
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.06)", color: "#ffffff" }}
            whileTap={{ scale: 0.92 }}
            onClick={onNewChat}
            title="Fresh Conversation"
            className="p-2 bg-[#151518] border border-[#1d1d21] text-zinc-400 rounded-xl cursor-pointer transition-all outline-none"
          >
            <Plus size={14} />
          </motion.button>

          {/* Toggle Sidebar Action burger on the desktop side */}
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.06)", color: "#ffffff" }}
            whileTap={{ scale: 0.92 }}
            onClick={onToggleSidebar}
            title="Toggle File History Drawer"
            className="p-2 bg-[#151518] border border-[#1d1d21] text-zinc-400 rounded-xl cursor-pointer transition-all outline-none"
          >
            <Menu size={14} />
          </motion.button>
        </div>
      </header>


      {/* 📱 PHONE HEADER VIEW (exactly same as given in picture) */}
      <div className="flex md:hidden flex-col w-full bg-[#0d0d0e]">
        {/* Core Top Bar */}
        <div className="h-14 flex items-center justify-between px-4.5">
          {/* Hamburger Menu on left */}
          <button
            onClick={onToggleSidebar}
            className="p-1 text-zinc-400 hover:text-white transition-all cursor-pointer"
          >
            <Menu size={20} />
          </button>

          {/* Center Brand Group: ✦ AURYX AI */}
          <div className="flex items-center gap-1.5">
            <motion.svg 
              viewBox="0 0 100 100" 
              className="w-5.5 h-5.5 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)] cursor-pointer"
              whileHover={{ rotate: 180, scale: 1.12 }}
              whileTap={{ scale: 0.9 }}
            >
              <defs>
                <linearGradient id="mobile-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#c084fc" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
              <path 
                d="M50 0C50 22 78 50 100 50C78 50 50 78 50 100C50 78 22 50 0 50C22 50 50 22 50 0Z" 
                fill="url(#mobile-logo-grad)" 
              />
            </motion.svg>
            <span className="font-sans font-black text-[13.5px] tracking-[0.08em] uppercase bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent select-none">
              AURYX AI
            </span>
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={handleToggleFullscreen}
              className="p-1 text-zinc-500 hover:text-white rounded-lg transition-all cursor-pointer flex items-center justify-center outline-none ml-0.5"
            >
              {isFullscreen ? <Minimize2 size={13} strokeWidth={2.5} /> : <Maximize2 size={13} strokeWidth={2.5} />}
            </motion.button>
          </div>

          {/* Right: Sliders Configuration filter icon */}
          <button
            onClick={onOpenSettings}
            className="p-1 text-zinc-400 hover:text-white transition-all cursor-pointer"
            title="Open Configurations Suite"
          >
            <Sliders size={18} />
          </button>
        </div>

        {/* Sub-header row pill selectors (exact phone screen mockup layout) */}
        <div className="px-4.5 pb-3">
          <div className="grid grid-cols-2 bg-[#151518]/60 border border-[#1d1d21]/80 rounded-2xl p-1 gap-1">
            {/* Left Pill: API Key > */}
            <div className="relative" ref={keysDropdownRef}>
              <button
                onClick={() => setKeysDropdownOpen(!keysDropdownOpen)}
                className="flex items-center justify-center gap-1.5 w-full py-2 px-2 hover:bg-white/5 rounded-xl text-xs font-semibold text-zinc-300 transition-colors cursor-pointer select-none"
              >
                <Globe size={12} className="text-[#10a37f]" />
                <span className="truncate">API Key</span>
                <ChevronRight size={11} className="text-zinc-500 opacity-60 ml-0.5" />
              </button>

              {/* Mobile Keys dropdown */}
              <AnimatePresence>
                {keysDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute left-0 mt-2 w-[280px] bg-[#151518] border border-[#1d1d21] rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.8)] p-4 z-50 select-text"
                  >
                    <div className="flex items-center justify-between border-b border-[#1d1d21] pb-1.5 mb-3">
                      <span className="text-[10.5px] font-black uppercase text-white tracking-widest">Workspace Keys</span>
                      <X size={12} className="text-zinc-500 cursor-pointer" onClick={() => setKeysDropdownOpen(false)} />
                    </div>

                    <div className="flex flex-col gap-3">
                      {PROVS.map((p) => {
                        const hasKey = !!apiKeys[p.id];
                        return (
                          <div key={p.id} className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10.5px] font-bold text-zinc-300 leading-none">{p.name.replace("Google ", "")}</span>
                              <span className={`text-[7.5px] font-black uppercase px-1 rounded ${
                                hasKey ? "bg-green-500/10 text-green-400" : "bg-zinc-800 text-zinc-650"
                              }`}>
                                {hasKey ? "✓" : "✕"}
                              </span>
                            </div>
                            <div className="flex gap-1 border-0">
                              <input
                                type="password"
                                placeholder={hasKey ? "••••••••••••" : "Type api credentials..."}
                                onChange={(e) => {
                                  const v = e.target.value.trim();
                                  if (v) onSaveKey(p.id, v);
                                }}
                                className="flex-1 px-2 py-0.8 bg-[#0d0d0e] border border-[#1d1d21] rounded-lg text-xs text-white outline-none"
                              />
                              {hasKey && (
                                <button
                                  onClick={() => {
                                    onRemoveKey(p.id);
                                    onAddToast(`Removed Key for ${p.name}`, "info");
                                  }}
                                  className="p-1 px-1.5 bg-red-900/20 text-red-400 rounded-lg cursor-pointer text-[9px]"
                                >
                                  Del
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Pill: Model: GPT-4o v */}
            <div className="relative" ref={modelDropdownRef}>
              <button
                onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
                className="flex items-center justify-center gap-1.5 w-full py-2 px-2 hover:bg-white/5 rounded-xl text-xs font-semibold text-zinc-300 transition-colors cursor-pointer select-none"
              >
                <Sparkles size={12} className="text-indigo-400" />
                <span className="truncate max-w-[80px]">
                  {activeModelDetails ? activeModelDetails.n : activeModel}
                </span>
                <ChevronDown size={11} className="text-zinc-500 ml-0.5" />
              </button>

              {/* Mobile Model Selection panel */}
              <AnimatePresence>
                {modelDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute right-0 mt-2 w-[260px] max-h-[300px] overflow-y-auto bg-[#151518] border border-[#1d1d21] rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.8)] p-2.5 z-50"
                  >
                    {PROVS.map((prov) => {
                      const list = MODELS[prov.id] || [];
                      return (
                        <div key={prov.id} className="mb-2 last:mb-0">
                          <div className="px-2 py-0.5 text-[8.5px] uppercase font-black tracking-widest text-[#10a37f] mb-1 select-none">
                            {prov.name}
                          </div>
                          {list.map((m) => {
                            const isSelected = activeProvider === prov.id && activeModel === m.id;
                            return (
                              <button
                                key={m.id}
                                onClick={() => {
                                  onChangeModel(prov.id, m.id);
                                  setModelDropdownOpen(false);
                                }}
                                className={`w-full text-left px-2 py-1.5 rounded-lg text-xs cursor-pointer ${
                                  isSelected ? "bg-indigo-500/10 text-indigo-400 font-bold" : "text-zinc-400 hover:text-white"
                                }`}
                              >
                                {m.n}
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
