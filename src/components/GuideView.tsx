import React, { useState } from "react";
import { PROVS } from "../constants";
import { Download, Github, Globe, Terminal, FileCode, Check, Copy, Info, Sparkles, Server } from "lucide-react";

export const GuideView: React.FC = () => {
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  const copyToClipboard = (text: string, stepId: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepId);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const gitCommands = `git init
git add .
git commit -m "feat: initial commit for auryx workspace"
git branch -M main
git remote add origin https://github.com/your-username/auryx-assistant.git
git push -u origin main`;

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 flex flex-col font-sans max-w-3xl mx-auto w-full animate-fadeUp select-text pb-12">
      <div className="flex flex-col gap-8">
        
        {/* Advanced Introduction Card */}
        <div className="relative p-6 rounded-2xl bg-gradient-to-br from-[#121215] to-[#18181c] border border-white/5 shadow-xl overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-2.5 mb-2.5">
            <span className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Sparkles size={16} className="text-indigo-400" />
            </span>
            <span className="text-[14px] font-black tracking-tight text-white uppercase font-mono">
              Auryx AI Webapp Deployment Manual
            </span>
          </div>
          <p className="text-[12px] text-[#A1A1AA] leading-relaxed">
            Congratulations on choosing **Auryx AI**! This workspace is engineered with an advanced offline-first hybrid engine. Whether you are running on our high-performance Node/Express backend or publishing it as a completely static page on **GitHub Pages**, our system adapts dynamically to deliver zero-latency experiences.
          </p>
        </div>

        {/* GUIDANCE 1: How to Download the Standalone / Hybrid File */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-bold text-[#fafafa] flex items-center gap-2 font-mono uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            1. How to download the offline AI file
          </h3>
          <p className="text-[11.5px] text-[#A1A1AA] leading-relaxed">
            The standalone workbook is bundled into a single file called <code className="text-amber-400 font-mono text-[10.5px] bg-[#1a1a1c] px-1.5 py-0.5 rounded border border-white/5">auryx-standalone.html</code>. It delivers the complete interactive UI, notes system, focus pomodoro timer, and calculator, requiring **absolutely zero server hosting or installation**!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div className="p-4 rounded-xl bg-[#121215] border border-white/5 flex flex-col justify-between">
              <div>
                <h4 className="text-[11.5px] font-bold text-white flex items-center gap-1.5 mb-1.5">
                  <Download size={13} className="text-indigo-400" />
                  Method A: One-Click Header Download
                </h4>
                <p className="text-[10.5px] text-[#A1A1AA] leading-relaxed">
                  Look at the right side of the main desktop header. Simply click the <strong className="text-white">"Download Full AI 💾"</strong> badge. It fetches the standalone HTML bundle directly from our active server to your computer instantly.
                </p>
              </div>
              <a
                href="/api/download"
                download="auryx_ai_assistant.html"
                className="mt-4 py-2 px-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] text-center transition-all select-none duration-150 shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download size={13} />
                Download Standalone HTML File
              </a>
            </div>

            <div className="p-4 rounded-xl bg-[#121215] border border-white/5 flex flex-col justify-between">
              <div>
                <h4 className="text-[11.5px] font-bold text-white flex items-center gap-1.5 mb-1.5">
                  <Terminal size={13} className="text-emerald-400" />
                  How to Use Offline in any Browser
                </h4>
                <p className="text-[10.5px] text-[#A1A1AA] leading-relaxed">
                  Once downloaded, go to your downloads directory, double-click the <strong className="text-white">auryx_ai_assistant.html</strong> file, and it will boot normally in Google Chrome, Safari, or Firefox! Plug in your API keys in the settings panel to enable actual chat functions.
                </p>
              </div>
              <div className="mt-4 px-3 py-2 bg-zinc-950/40 border border-white/5 rounded-lg flex items-center gap-2 text-[10px] text-[#A1A1AA]">
                <Info size={12} className="text-emerald-400 shrink-0" />
                <span>Stores configuration and chats securely in your browser's private local state.</span>
              </div>
            </div>
          </div>
        </div>

        {/* GUIDANCE 2: Publishing to GitHub Step-by-Step */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-bold text-[#fafafa] flex items-center gap-2 font-mono uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
            2. Codebase GitHub Publication and Deployment
          </h3>
          <p className="text-[11.5px] text-[#A1A1AA] leading-relaxed">
            Ready to upload the workspace code to your own GitHub profile? Follow these simple terminal commands to create a repository and publish your code like a professional developer:
          </p>

          <div className="p-4 rounded-xl bg-[#0e0e11] border border-white/5 flex flex-col gap-3 relative overflow-hidden mt-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#A1A1AA] flex items-center gap-1.5 font-mono">
                <Github size={13} className="text-indigo-400" />
                Initialize git & push code
              </span>
              <button
                onClick={() => copyToClipboard(gitCommands, 1)}
                className="text-[10.5px] text-zinc-400 hover:text-white flex items-center gap-1 px-2 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/5 transition-all cursor-pointer"
              >
                {copiedStep === 1 ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
                <span>{copiedStep === 1 ? "Copied!" : "Copy Snippet"}</span>
              </button>
            </div>
            <pre className="p-3 bg-black/60 border border-white/5 rounded-lg text-[10px] text-zinc-300 font-mono overflow-x-auto whitespace-pre leading-relaxed select-text">
              {gitCommands}
            </pre>
          </div>

          <div className="p-4 rounded-xl bg-[#121215] border border-[#27272A] flex flex-col gap-3">
            <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
              <Globe size={13} className="text-indigo-400" />
              Setting up GitHub Pages (Run in Browser Normally)
            </span>
            <ol className="list-decimal pl-4.5 text-[10.5px] text-[#A1A1AA] space-y-2 leading-relaxed">
              <li>
                Create a repository on your GitHub account (e.g., <code className="text-white font-mono bg-white/5 px-1 rounded">your-username.github.io</code> or a custom workspace name).
              </li>
              <li>
                In your local project folder, make sure the build files are ready. Run <code className="text-white font-mono bg-white/5 px-1 rounded">npm run build</code> to bundle the React application.
              </li>
              <li>
                Go to the **Settings** tab in your GitHub repository, search for the **Pages** menu inside the sidebar.
              </li>
              <li>
                Under "Build and deployment", set source to <strong className="text-white">Deploy from a branch</strong>, choose the <strong className="text-indigo-400">main</strong> branch, and choose the root directory <strong className="text-white">/ (root)</strong> (if deploying the standalone HTML) or publish your <strong className="text-white">dist/</strong> bundle.
              </li>
              <li>
                Click save! Within 2 minutes, GitHub will generate a live HTTPS url (e.g. <code className="text-emerald-400 hover:underline">https://your-username.github.io/repository-name</code>) where your workspace loads beautifully on any phone or desktop!
              </li>
            </ol>
          </div>
        </div>

        {/* GUIDANCE 3: Static Fail-safe / How API calls execute without server */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0c0c0e] to-[#121215] border border-indigo-500/10 flex flex-col gap-3">
          <div className="flex gap-2.5 items-start">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center shrink-0">
              <Server size={14} className="text-indigo-400 animate-pulse-slow" />
            </div>
            <div>
              <h4 className="text-[11.5px] font-bold text-[#fafafa] font-sans flex items-center gap-1.5">
                Advanced Browser Client-Side Key Fallback
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-mono px-1.5 py-0.2 text-[8px] font-black uppercase">Active</span>
              </h4>
              <p className="text-[10.5px] text-[#A1A1AA] leading-relaxed mt-1">
                When you deploy to a static platform like <strong className="text-white">GitHub Pages</strong>, you won't have a backend running. We built a custom **Smart Client-Side Fallback** directly inside Auryx's core:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-1">
            <div className="p-3 bg-black/30 rounded-xl border border-white/5">
              <span className="text-[10.5px] font-bold text-white flex items-center gap-1 mt-0.5">
                🌐 Backend Connection Mode
              </span>
              <p className="text-[9.5px] text-[#A1A1AA] leading-relaxed mt-1">
                If hosted on Cloud Run or locally (using <code className="text-zinc-200 font-mono">npm run dev</code>), requests are proxied securely to protect developer secrets on the server.
              </p>
            </div>

            <div className="p-3 bg-[#19191d]/30 rounded-xl border border-indigo-500/15">
              <span className="text-[10.5px] font-bold text-indigo-300 flex items-center gap-1 mt-0.5">
                ⚙️ Direct Browser/Static Mode
              </span>
              <p className="text-[9.5px] text-[#A1A1AA]/90 leading-relaxed mt-1">
                If hosted on GitHub Pages or double-clicked offline, the app detects the absence of the backend automatically and routes chats **directly from your browser** securely to the provider's API endpoints using your custom-entered keys!
              </p>
            </div>
          </div>
        </div>

        {/* Interactive keys setup quick view */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-bold text-[#fafafa] flex items-center gap-2 font-mono uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block"></span>
            3. Supported AI Providers Configuration URL links
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-1">
            {PROVS.map((p) => (
              <a
                key={p.id}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 rounded-xl bg-[#121215] border border-white/5 hover:border-white/10 hover:bg-[#151518] transition-all flex flex-col gap-1.5 text-left group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">{p.ico}</span>
                  <span className="text-[8px] text-zinc-500 group-hover:text-[var(--accent)] font-bold transition-all uppercase select-none">Config ↗</span>
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-[11px] font-bold text-white truncate block">{p.name}</span>
                  <span className="text-[9px] text-[#A1A1AA] truncate block mt-0.5">{p.desc}</span>
                </div>
              </a>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
