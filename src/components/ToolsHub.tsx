import React from "react";
import { motion } from "motion/react";
import { 
  Calculator, 
  Clock, 
  FileText, 
  Bot, 
  Key, 
  BarChart3, 
  HelpCircle,
  Sparkles,
  ArrowLeft,
  ChevronRight
} from "lucide-react";

interface ToolsHubProps {
  onSelectTool: (toolId: string) => void;
  onReturnToMain: () => void;
  userName?: string;
}

export const ToolsHub: React.FC<ToolsHubProps> = ({
  onSelectTool,
  onReturnToMain,
  userName
}) => {
  const tools = [
    {
      id: "calculator",
      title: "Calculator Suite",
      desc: "Scientific math calculators and custom equation solvers designed for students and professionals.",
      icon: <Calculator size={20} className="text-blue-400 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300" />,
      color: "from-blue-500/10 to-indigo-500/[0.02] hover:border-blue-500/30 hover:shadow-[0_8px_30px_rgba(59,130,246,0.1)]",
      accent: "text-blue-400 font-mono",
      badge: "Math & Physics"
    },
    {
      id: "timer",
      title: "Timer & Watch Room",
      desc: "An elegant workspace clock, high-precision lap stopwatch, countdown and configured study alarms.",
      icon: <Clock size={20} className="text-purple-400 group-hover:scale-110 transition-transform duration-300" />,
      color: "from-purple-500/10 to-fuchsia-500/[0.02] hover:border-purple-500/30 hover:shadow-[0_8px_30px_rgba(168,85,247,0.1)]",
      accent: "text-purple-400 font-sans",
      badge: "Focus Study"
    },
    {
      id: "notes",
      title: "Notes Laboratory",
      desc: "A markdown-supported writing suite to outline essays, save prompt outputs, and log classroom homework.",
      icon: <FileText size={20} className="text-emerald-400 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300" />,
      color: "from-emerald-500/10 to-teal-500/[0.02] hover:border-emerald-500/30 hover:shadow-[0_8px_30px_rgba(16,185,129,0.1)]",
      accent: "text-emerald-400 font-sans",
      badge: "Reports"
    },
    {
      id: "models",
      title: "Models Dials",
      desc: "Compare speed, cost and intelligence across major multi-provider neural networks.",
      icon: <Bot size={20} className="text-amber-400 group-hover:scale-110 transition-transform duration-300" />,
      color: "from-amber-500/10 to-orange-500/[0.02] hover:border-amber-500/30 hover:shadow-[0_8px_30px_rgba(245,158,11,0.1)]",
      accent: "text-amber-400 font-mono",
      badge: "AI Engines"
    },
    {
      id: "api",
      title: "API Keys Vault",
      desc: "Bypass demo limits. Connect your personal Gemini or third-party server keys safely.",
      icon: <Key size={20} className="text-cyan-400 group-hover:scale-110 transition-transform duration-300" />,
      color: "from-cyan-500/10 to-blue-500/[0.02] hover:border-cyan-500/30 hover:shadow-[0_8px_30px_rgba(6,182,212,0.1)]",
      accent: "text-cyan-400 font-sans",
      badge: "Secure credentials"
    },
    {
      id: "analytics",
      title: "Usage Metrics",
      desc: "Visualize your prompt density loads, historic chat speeds, and custom analytics graphs.",
      icon: <BarChart3 size={20} className="text-rose-400 group-hover:scale-110 transition-transform duration-300" />,
      color: "from-rose-500/10 to-pink-500/[0.02] hover:border-rose-500/30 hover:shadow-[0_8px_30px_rgba(244,63,94,0.1)]",
      accent: "text-rose-400 font-mono",
      badge: "Load charts"
    },
    {
      id: "guide",
      title: "Protocols Setup Guide",
      desc: "Step-by-step documentation, shortcuts list and student optimization handbook.",
      icon: <HelpCircle size={20} className="text-teal-400 group-hover:scale-110 transition-transform duration-300" />,
      color: "from-teal-500/10 to-emerald-500/[0.02] hover:border-teal-500/30 hover:shadow-[0_8px_30px_rgba(20,184,166,0.1)]",
      accent: "text-teal-400 font-sans",
      badge: "Instructions"
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 flex flex-col font-sans max-w-4xl mx-auto w-full animate-fadeUp select-none">
      
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between mb-8 pb-5 border-b border-[var(--border)]">
        <button
          onClick={onReturnToMain}
          className="group flex items-center gap-2 text-xs font-semibold text-[var(--text-dim)] hover:text-[var(--text)] transition-all cursor-pointer py-1.5 px-3 bg-white/[0.02] hover:bg-white/5 hover:theme-light:bg-black/5 border border-[var(--border)] rounded-xl active:scale-[0.98] shadow-sm"
        >
          <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>Return to Chat Menu</span>
        </button>
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-dim)]/60 font-medium">
          <Sparkles size={11} className="text-[var(--accent)]" />
          <span>Auryx Workspace Suite</span>
        </div>
      </div>

      {/* Hero Welcome */}
      <div className="text-center sm:text-left mb-8">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text)] flex items-center gap-2.5 justify-center sm:justify-start">
          <span>Auryx Utilities Suite</span>
          <span className="hidden sm:inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/15 shrink-0 font-mono">
            7 active modules
          </span>
        </h2>
        <p className="text-xs text-[var(--text-dim)] max-w-xl mt-1.5 leading-relaxed font-semibold">
          {userName ? `Welcome, ${userName}. ` : ""}Click on any premium workspace utility below to open it instantly. Slide back to your AI dialogue assistant anytime.
        </p>
      </div>

      {/* Bento Grid layout with gorgeous stagger-linked spring card entrance animations */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.08
            }
          }
        }}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mb-10"
      >
        {tools.map((t) => (
          <motion.div
            key={t.id}
            variants={{
              hidden: { opacity: 0, scale: 0.94, y: 25 },
              visible: { 
                opacity: 1, 
                scale: 1, 
                y: 0,
                transition: { type: "spring", stiffness: 180, damping: 18 } 
              }
            }}
            whileHover={{ 
              y: -5, 
              scale: 1.025,
              borderColor: "rgba(124, 58, 237, 0.35)", 
              boxShadow: "0 12px 30px rgba(124, 58, 237, 0.08)" 
            }}
            whileTap={{ scale: 0.985 }}
            onClick={() => onSelectTool(t.id)}
            className={`group flex flex-col bg-[var(--surface)] border border-[var(--border)] p-5.5 rounded-2xl relative overflow-hidden transition-colors duration-300 cursor-pointer hover:bg-white/[0.01] hover:theme-light:bg-black/[0.01] shadow-sm`}
          >
            {/* Top Row with Icon & Badge */}
            <div className="flex items-center justify-between mb-4.5">
              <div className="p-2 bg-white/[0.02] theme-light:bg-black/[0.02] border border-[var(--border)] rounded-xl shrink-0 group-hover:bg-[#1f1a30] transition-colors duration-300">
                {t.icon}
              </div>
              <span className="text-[8px] font-bold tracking-widest uppercase px-2 py-0.6 bg-white/[0.02] theme-light:bg-black/[0.02] border border-[var(--border)] text-[var(--text-dim)]/70 rounded-full">
                {t.badge}
              </span>
            </div>

            {/* Title & Description */}
            <h3 className="text-[13px] font-semibold text-[var(--text)] mb-1.5 group-hover:text-[var(--accent)] transition-colors tracking-tight font-sans">
              {t.title}
            </h3>
            <p className="text-[11px] text-[var(--text-dim)]/80 font-medium leading-relaxed mb-6 flex-1">
              {t.desc}
            </p>

            {/* Footer Row */}
            <div className="flex items-center justify-between text-[10px] font-bold border-t border-[var(--border)] pt-3 mt-auto uppercase tracking-wider">
              <span className={t.accent}>Launch</span>
              <div className="w-5 h-5 rounded-lg bg-white/5 hover:theme-light:bg-black/5 group-hover:bg-[var(--accent)]/15 group-hover:text-white transition-all flex items-center justify-center shrink-0">
                <ChevronRight size={11} className="text-[var(--text-dim)] group-hover:translate-x-0.2 group-hover:text-[var(--accent)] transition-all" />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Info Card footer */}
      <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-2xl flex items-center gap-3.5 select-none text-left shadow-md">
        <div className="w-9 h-9 rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)] flex-shrink-0 animate-pulse">
          <Sparkles size={14} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-bold text-[var(--text)] uppercase tracking-wider leading-none">
            Designed & Developed by Auryx AI Laboratories
          </div>
          <p className="text-[10px] text-[var(--text-dim)]/70 font-medium whitespace-nowrap overflow-hidden text-ellipsis mt-1">
            Crafting beautiful intelligence workspaces tailored for serious developers and enterprises worldwide.
          </p>
        </div>
      </div>

    </div>
  );
};
