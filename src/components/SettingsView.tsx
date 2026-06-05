import React, { useState } from "react";
import { AppSettings, ChatSession } from "../types";
import { 
  Sliders, 
  Palette, 
  Cpu, 
  Database, 
  Check, 
  Volume2, 
  Trash2, 
  RotateCcw, 
  Download, 
  Sparkles,
  Type,
  ChevronRight,
  Info
} from "lucide-react";

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (s: AppSettings) => void;
  chats: ChatSession[];
  onClearChats: () => void;
  onResetSettings: () => void;
  onAddToast: (msg: string, type?: "success" | "error" | "info" | "warn") => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  chats,
  onClearChats,
  onResetSettings,
  onAddToast,
}) => {
  const [activeTab, setActiveTab] = useState<"gen" | "app" | "ai" | "data">("gen");

  const updateKey = <K extends keyof AppSettings>(k: K, v: AppSettings[K]) => {
    onUpdateSettings({ ...settings, [k]: v });
  };

  const accents: Array<{ id: AppSettings["accent"]; col: string; name: string }> = [
    { id: "blue", col: "#3B82F6", name: "Sapphire Blue" },
    { id: "purple", col: "#A855F7", name: "Amethyst Purple" },
    { id: "green", col: "#10B981", name: "Emerald Green" },
    { id: "rose", col: "#F43F5E", name: "Ruby Rose" },
    { id: "amber", col: "#F59E0B", name: "Topaz Amber" },
    { id: "cyan", col: "#06B6D4", name: "Turquoise Cyan" },
  ];

  const handleExportData = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ settings, chats }));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `auryxai_export_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      onAddToast("Configuration and sessions exported!", "success");
    } catch {
      onAddToast("Export failed", "error");
    }
  };

  const toggleRow = (label: string, desc: string, k: keyof AppSettings, current: boolean) => (
    <div className="flex items-center justify-between p-4 bg-[#141416]/70 hover:bg-[#18181b]/70 border border-white/5 rounded-xl transition-all duration-250 hover:border-white/10 group">
      <div className="pr-4 flex-1">
        <div className="text-[12.5px] font-bold text-white group-hover:text-[var(--accent)] transition-colors flex items-center gap-2">
          {label}
        </div>
        <div className="text-[10.5px] text-zinc-400 mt-1 leading-relaxed max-w-md">{desc}</div>
      </div>

      <div
        onClick={() => updateKey(k, !current as any)}
        className={`w-10 h-5.5 rounded-full cursor-pointer relative flex-shrink-0 transition-all duration-300 ${
          current ? "bg-[var(--accent)] shadow-[0_0_12px_var(--accent-glow)]" : "bg-[#1f1f23] border border-white/10"
        }`}
      >
        <div
          className={`absolute w-4.5 h-4.5 rounded-full bg-white top-[2px] transition-all duration-300 shadow-md ${
            current ? "translate-x-4.5" : "translate-x-0.5"
          }`}
        />
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden font-sans bg-[#0c0c0e] animate-fadeUp">
      
      {/* Interactive Tabs Sidebar panel */}
      <div className="w-full md:w-[210px] border-b md:border-b-0 md:border-r border-white/5 flex flex-col bg-[#0f0f11] flex-shrink-0 select-none p-3 gap-2">
        <div className="hidden md:flex flex-col px-3 py-2 mb-2 leading-none">
          <span className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest">Workspace</span>
          <span className="text-[13px] font-extrabold text-[#fafafa] mt-1">Control Room</span>
        </div>

        <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-none">
          {[
            { id: "gen", label: "General Settings", desc: "Triggers & Actions", ico: <Sliders size={13} /> },
            { id: "app", label: "Layout & Accent", desc: "Visual Theme", ico: <Palette size={13} /> },
            { id: "ai", label: "Intelligence", desc: "Temperature & Rules", ico: <Cpu size={13} /> },
            { id: "data", label: "Data & Storage", desc: "Wipe & Export Tools", ico: <Database size={13} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-xs font-semibold border transition-all text-left whitespace-nowrap md:w-full ${
                activeTab === tab.id
                  ? "bg-white/5 text-[#FAFAFA] border-white/10 shadow-lg"
                  : "text-zinc-400 border-transparent hover:bg-white/[0.02] hover:text-white"
              }`}
            >
              <div className={`p-1.5 rounded-lg transition-colors ${
                activeTab === tab.id ? "bg-[var(--accent)]/10 text-[var(--accent)]" : "bg-white/5 text-zinc-500"
              }`}>
                {tab.ico}
              </div>
              <div className="flex flex-col leading-tight min-w-0">
                <span className="text-xs font-bold font-sans truncate">{tab.label}</span>
                <span className="text-[9px] text-zinc-500 font-normal truncate mt-0.5 hidden md:block">{tab.desc}</span>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Settings panel canvas */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 bg-[#0a0a0c]">
        <div className="p-1 max-w-2xl">
          
          {activeTab === "gen" && (
            <div className="flex flex-col gap-3.5 animate-fadeIn">
              <div className="pb-4 border-b border-white/5 mb-2">
                <h3 className="text-sm font-extrabold text-[#FAFAFA] tracking-tight flex items-center gap-2">
                  <Sliders size={14} className="text-[var(--accent)]" />
                  Workspace Interaction Preferences
                </h3>
                <p className="text-[10.5px] text-zinc-400 mt-1">Configure triggers, delivery feedback loops, and real-time conversation timestamps.</p>
              </div>
              
              {toggleRow(
                "Instantly Transmit on Enter Key", 
                "Pressing the Enter key triggers execution of prompts. Use Shift + Enter to split sentences with newlines.", 
                "enter", 
                settings.enter
              )}
              {toggleRow(
                "Enable API Key Vault Swapper Bar", 
                "Show an interactive Hot-Swap bar in the main chat view to switch models and API keys instantly.", 
                "showVaultSwapper", 
                settings.showVaultSwapper
              )}
              {toggleRow(
                "Enable Smart Dynamic Archives Autotext", 
                "When a fresh conversation is created, let our local AI assistant automatically summarize its index title.", 
                "autoTitle", 
                settings.autoTitle
              )}
              {toggleRow(
                "Display detailed UTC deliver time", 
                "Show small precise timelines underneath message bubbles referencing absolute system dispatch times.", 
                "ts", 
                settings.ts
              )}
              {toggleRow(
                "Notification audio bleeps", 
                "Emits low amplitude high-tech frequency cues whenever the AI begins or ends prompt rendering cycles.", 
                "sound", 
                settings.sound
              )}
            </div>
          )}

          {activeTab === "app" && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              <div className="pb-4 border-b border-white/5">
                <h3 className="text-sm font-extrabold text-[#FAFAFA] tracking-tight flex items-center gap-2">
                  <Palette size={14} className="text-[var(--accent)]" />
                  Appearance & Dynamic Styling
                </h3>
                <p className="text-[10.5px] text-zinc-400 mt-1">Personalize text typography dimensions, contrast values, and color palettes.</p>
              </div>

              {/* Theme Selector */}
              <div className="flex flex-col gap-2.5">
                <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                  <span>Base Theme Contrast</span>
                </label>
                <div className="flex gap-2 w-full max-w-sm">
                  <button
                    onClick={() => updateKey("theme", "dark")}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all active:scale-[0.98] cursor-pointer ${
                      settings.theme === "dark"
                        ? "bg-white/5 border-white/10 text-white shadow-md shadow-black/40"
                        : "bg-transparent border-white/5 text-zinc-400 hover:border-white/10 hover:text-white"
                    }`}
                  >
                    Dark Obsidian
                  </button>
                  <button
                    onClick={() => updateKey("theme", "light")}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all active:scale-[0.98] cursor-pointer ${
                      settings.theme === "light"
                        ? "bg-white/5 border-white/10 text-white"
                        : "bg-transparent border-white/5 text-zinc-400 hover:border-white/10 hover:text-white"
                    }`}
                  >
                    Midnight Graphite
                  </button>
                </div>
              </div>

              {/* Accent Color matrix */}
              <div className="flex flex-col gap-2.5">
                <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest">Highlight Palette Picker</label>
                <div className="grid grid-cols-6 gap-2 w-full max-w-xs">
                  {accents.map((acc) => {
                    const active = settings.accent === acc.id;
                    return (
                      <button
                        key={acc.id}
                        onClick={() => updateKey("accent", acc.id)}
                        style={{ backgroundColor: acc.col }}
                        title={acc.name}
                        className={`w-9 h-9 rounded-full cursor-pointer relative transition-all hover:scale-110 flex items-center justify-center border border-white/15 ${
                          active ? "shadow-[0_0_14px_-2px_var(--accent-glow)] scale-110 border-white" : "opacity-75 hover:opacity-100"
                        }`}
                      >
                        {active && (
                          <Check size={14} className="text-white drop-shadow font-black" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Chat font-size scaling */}
              <div className="flex flex-col gap-3.5 p-4 bg-[#141416]/70 border border-white/5 rounded-2xl">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Type size={14} className="text-[var(--accent)]" />
                    <span className="text-[12px] font-bold text-white">Chat Bubble Text Scale</span>
                  </div>
                  <span className="font-mono text-white text-xs font-bold px-2 py-0.5 bg-white/5 border border-white/5 rounded-lg">
                    {settings.fontSize}px
                  </span>
                </div>
                
                <input
                  type="range"
                  min="11"
                  max="17"
                  step="0.5"
                  value={settings.fontSize}
                  onChange={(e) => updateKey("fontSize", parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer outline-none accent-[var(--accent)]"
                />

                {/* Realtime aesthetic Live Text Scale Demo Box (Answers text size request instantly!) */}
                <div className="mt-2.5 p-3.5 bg-[#0a0a0c] border border-white/5 rounded-xl flex flex-col gap-2">
                  <span className="text-[9px] font-extrabold text-zinc-500 uppercase tracking-widest block leading-none">Live Chat Preview</span>
                  
                  <div className="flex flex-col gap-2 mt-1">
                    <div 
                      style={{ fontSize: `${settings.fontSize - 1.5}px` }} 
                      className="px-3 py-1.5 rounded-xl bg-[#2f2f32]/85 text-white/90 text-right font-medium self-end max-w-[85%] leading-relaxed font-sans shadow-sm"
                    >
                      Wait, the words used to look huge, can they look a bit smaller?
                    </div>

                    <div 
                      style={{ fontSize: `${settings.fontSize - 1.5}px` }} 
                      className="px-3 py-1.5 rounded-xl bg-[#18181b]/35 text-white/90 text-left self-start max-w-[85%] leading-relaxed font-sans border border-white/5"
                    >
                      Absolutely! Here is a live scaling test. You can dial this slide tool down to 12px or 13px directly inside this page!
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "ai" && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              <div className="pb-4 border-b border-white/5">
                <h3 className="text-sm font-extrabold text-[#FAFAFA] tracking-tight flex items-center gap-2">
                  <Cpu size={14} className="text-[var(--accent)]" />
                  AI Engine Tuning & Instructions
                </h3>
                <p className="text-[10.5px] text-zinc-400 mt-1">Instruct the underlying model on personality goals, context parameters, and formatting styles.</p>
              </div>

              {/* System Instructions block */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest">Base System Persona Instruction</label>
                <textarea
                  value={settings.sys}
                  onChange={(e) => updateKey("sys", e.target.value)}
                  placeholder="e.g. You are an enterprise code engine helper..."
                  rows={4}
                  className="p-3 bg-[#141416]/75 border border-white/5 rounded-xl text-xs text-[#FAFAFA] font-sans resize-none leading-relaxed outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all font-medium"
                />
              </div>

              {/* Temperature */}
              <div className="flex flex-col gap-3.5 p-4 bg-[#141416]/70 border border-white/5 rounded-2xl">
                <div className="flex justify-between items-center">
                  <span className="text-[12px] font-bold text-white">Temperature (Analytical vs Creative)</span>
                  <span className="font-mono text-white text-xs font-bold px-2 py-0.5 bg-white/5 rounded-lg">
                    {settings.temp}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1.2"
                  step="0.1"
                  value={settings.temp}
                  onChange={(e) => updateKey("temp", parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer outline-none accent-[var(--accent)]"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-0.5">
                  <span>Deterministic (Precise)</span>
                  <span>Creative (Imaginative)</span>
                </div>
              </div>

              {/* Max Outputs */}
              <div className="flex items-center justify-between p-4 bg-[#141416]/70 border border-white/5 rounded-2xl hover:border-white/10 hover:bg-[#18181b]/70 transition-all">
                <div className="leading-tight pr-4">
                  <div className="text-[12.5px] font-bold text-[#FAFAFA]">Maximum Completion Buffer Limit</div>
                  <span className="text-[10.5px] text-zinc-400 mt-1 block leading-relaxed">Limits response buffers to avoid wasteful tokens expenditure.</span>
                </div>
                <select
                  value={settings.maxTok}
                  onChange={(e) => updateKey("maxTok", parseInt(e.target.value))}
                  className="p-2 bg-[#0c0c0e] border border-white/10 rounded-xl text-xs font-bold text-white focus:border-[var(--accent)] outline-none cursor-pointer max-w-[130px]"
                >
                  {[512, 1024, 2048, 4096, 8192].map((tSz) => (
                    <option key={tSz} value={tSz}>
                      {tSz} words
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {activeTab === "data" && (
            <div className="flex flex-col gap-4 animate-fadeIn">
              <div className="pb-4 border-b border-white/5 mb-2">
                <h3 className="text-sm font-extrabold text-[#FAFAFA] tracking-tight flex items-center gap-2">
                  <Database size={14} className="text-[var(--accent)]" />
                  Cache Management & Utilities
                </h3>
                <p className="text-[10.5px] text-zinc-400 mt-1">Backup prompt threads, restore factory presets, and manage secure state containers.</p>
              </div>

              <div className="flex flex-col gap-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-[#141416]/70 border border-white/5 rounded-2xl hover:bg-[#18181b]/70 transition-all gap-4">
                  <div className="leading-tight">
                    <span className="text-[12.5px] font-bold text-white block">Download DB Backup File</span>
                    <span className="text-[10.5px] text-zinc-400 mt-1 block leading-relaxed">Save all customized instructions, colors, and histories to local storage.</span>
                  </div>
                  <button
                    onClick={handleExportData}
                    className="px-3.5 py-1.5 bg-white/5 text-white hover:bg-white/10 border border-white/10 hover:border-white/20 text-xs font-bold rounded-xl transition-all active:scale-[0.98] select-none cursor-pointer flex items-center gap-2"
                  >
                    <Download size={13} className="text-[var(--accent)]" />
                    <span>Backup Database</span>
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-[#141416]/70 border border-white/5 rounded-2xl hover:bg-[#18181b]/70 transition-all gap-4">
                  <div className="leading-tight">
                    <span className="text-[12.5px] font-bold text-white block">Flush Live Conversations</span>
                    <span className="text-[10.5px] text-zinc-400 mt-1 block leading-relaxed">This instantly removes and invalidates all cached AI chats ({chats.length} active).</span>
                  </div>
                  <button
                    onClick={onClearChats}
                    disabled={chats.length === 0}
                    className="px-3.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/15 text-xs font-bold rounded-xl transition-all active:scale-[0.98] disabled:opacity-20 disabled:pointer-events-none cursor-pointer flex items-center gap-2"
                  >
                    <Trash2 size={13} />
                    <span>Flush Threads</span>
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-[#141416]/70 border border-white/5 rounded-2xl hover:bg-[#18181b]/70 transition-all gap-4">
                  <div className="leading-tight">
                    <span className="text-[12.5px] font-bold text-white block">Full System Reset</span>
                    <span className="text-[10.5px] text-zinc-400 mt-1 block leading-relaxed">Restores all colors, instructions, font sizes, keys, and values to brand-new state.</span>
                  </div>
                  <button
                    onClick={onResetSettings}
                    className="px-3.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/15 text-xs font-bold rounded-xl transition-all active:scale-[0.98] cursor-pointer flex items-center gap-2"
                  >
                    <RotateCcw size={13} />
                    <span>Factory Reset</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
