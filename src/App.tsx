import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Message, ChatSession, AppSettings, AnalyticsData } from "./types";
import { PROVS, MODELS, QP } from "./constants";
import { 
  Copy, 
  Check, 
  Volume2, 
  RotateCcw, 
  Download, 
  FileCode, 
  Paperclip, 
  Mic, 
  MicOff, 
  Eraser, 
  Send, 
  Sparkles, 
  Bot, 
  Cpu, 
  Zap, 
  Network,
  Bug,
  Brain,
  Layers,
  HelpCircle,
  X,
  AlertTriangle,
  Info,
  ArrowLeft,
  UserPlus,
  ChevronDown,
  ChevronUp,
  FileDown,
  FileText,
  Maximize2,
  Key,
  Plus,
  Globe,
  ThumbsUp,
  ThumbsDown,
  Share2,
  MoreVertical
} from "lucide-react";

// Subview components
interface CodeBlockProps {
  code: string;
  language: string;
  onAddToast: (msg: string, type?: "success" | "error" | "info" | "warn") => void;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language, onAddToast }) => {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const linesCount = code.split("\n").length;
  const sizeBytes = new Blob([code]).size;
  const sizeStr = sizeBytes > 1024 ? (sizeBytes / 1024).toFixed(1) + " KB" : sizeBytes + " B";

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      onAddToast("Code copied to clipboard!", "success");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const extensions: Record<string, string> = {
    javascript: "js", js: "js",
    typescript: "ts", ts: "ts",
    html: "html",
    css: "css",
    python: "py", py: "py",
    rust: "rs", rs: "rs",
    go: "go",
    java: "java",
    cpp: "cpp", c: "c",
    json: "json",
    markdown: "md", md: "md",
    bash: "sh", sh: "sh",
    sql: "sql",
    yaml: "yaml", yml: "yaml",
    xml: "xml"
  };

  const ext = extensions[language.toLowerCase()] || "txt";
  const filename = `code_segment_${Date.now().toString().slice(-6)}.${ext}`;

  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onAddToast(`Downloaded ${filename} successfully!`, "success");
  };

  return (
    <div className="my-3 rounded-xl border border-white/10 bg-[#161618] overflow-hidden text-left font-sans shadow-md border-l-4 border-l-indigo-500 max-w-full">
      {/* File Document Banner Card (Saves chat real estate) */}
      <div className="p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#1e1e21]/40 border-b border-white/5 select-none">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <FileCode size={18} className="text-indigo-400" />
          </div>
          <div className="flex flex-col min-w-0 leading-tight">
            <span className="text-[12px] font-bold text-[#fafafa] truncate block font-mono">
              {filename}
            </span>
            <span className="text-[10px] text-[#A1A1AA]/70 block font-sans mt-0.5">
              {language.toUpperCase()} • {linesCount} lines • {sizeStr}
            </span>
          </div>
        </div>

        {/* Quick Tools Controls Suite */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            onClick={handleDownload}
            title={`Download ${filename} directly`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all active:scale-[0.98] cursor-pointer shadow-sm shadow-indigo-600/10"
          >
            <FileDown size={13} />
            <span>Download</span>
          </button>
          
          <button
            onClick={handleCopy}
            title="Copy contents to clipboard"
            className="flex items-center justify-center p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[#A1A1AA] hover:text-[#FAFAFA] transition-all cursor-pointer"
          >
            {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
          </button>

          <button
            onClick={() => setExpanded(!expanded)}
            title={expanded ? "Hide preview" : "View preview"}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-[#A1A1AA] hover:text-[#FAFAFA] transition-all cursor-pointer"
          >
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            <span>{expanded ? "Collapse" : "Preview"}</span>
          </button>
        </div>
      </div>

      {/* Conditionally Expanded Viewer Panel */}
      {expanded && (
        <div className="p-4 overflow-x-auto max-h-[350px] font-mono text-[11px] text-[#f3f4f6] bg-[#0c0c0e] leading-relaxed select-text whitespace-pre border-t border-white/5">
          {code}
        </div>
      )}
    </div>
  );
};

const formatInlineText = (text: string) => {
  const boldParts = text.split(/(\*\*.*?\*\*)/g);
  return boldParts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-extrabold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    const codeParts = part.split(/(`.*?`)/g);
    return codeParts.map((p, j) => {
      if (p.startsWith("`") && p.endsWith("`")) {
        return (
          <code key={j} className="px-1.5 py-0.5 rounded text-[10px] bg-white/5 border border-white/5 font-mono text-indigo-300">
            {p.slice(1, -1)}
          </code>
        );
      }
      return p;
    });
  });
};

const TextPartRenderer: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split("\n");
  return (
    <div className="space-y-1 w-full select-text">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        // Header detection
        if (trimmed.startsWith("### ")) {
          return (
            <h4 key={idx} className="text-xs font-black text-[var(--text)] mt-2 mb-1 leading-snug">
              {formatInlineText(trimmed.replace(/^### /, ""))}
            </h4>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h3 key={idx} className="text-[13px] font-black text-[var(--text)] mt-2 mb-1.5 leading-snug">
              {formatInlineText(trimmed.replace(/^## /, ""))}
            </h3>
          );
        }
        if (trimmed.startsWith("# ")) {
          return (
            <h2 key={idx} className="text-[14px] font-black text-[var(--text)] mt-2.5 mb-1.5 leading-snug">
              {formatInlineText(trimmed.replace(/^# /, ""))}
            </h2>
          );
        }

        // List item detection
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          const content = trimmed.substring(2);
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-1.5 text-[inherit] text-[var(--text)] leading-relaxed">
              <span className="text-[var(--accent)] mt-1.5 select-none text-[6px] shrink-0 font-bold">▪</span>
              <span className="flex-1 font-sans">{formatInlineText(content)}</span>
            </div>
          );
        }

        return (
          <p key={idx} className="text-[inherit] leading-relaxed text-[var(--text)] font-sans">
            {formatInlineText(line)}
          </p>
        );
      })}
    </div>
  );
};

interface MessageRendererProps {
  content: string;
  onAddToast: (msg: string, type?: "success" | "error" | "info" | "warn") => void;
}

const MessageRenderer: React.FC<MessageRendererProps> = ({ content, onAddToast }) => {
  const parts = content.split(/```/);
  return (
    <div className="space-y-2 text-left w-full select-text">
      {parts.map((part, index) => {
        const isCodeBlock = index % 2 === 1;
        if (isCodeBlock) {
          const firstNewLine = part.indexOf("\n");
          let language = "";
          let code = part;
          if (firstNewLine !== -1) {
            language = part.substring(0, firstNewLine).trim();
            code = part.substring(firstNewLine + 1);
          }
          code = code.trim();
          return (
            <CodeBlock 
              key={index} 
              code={code} 
              language={language || "code"} 
              onAddToast={onAddToast} 
            />
          );
        } else {
          if (!part.trim()) return null;
          return (
            <TextPartRenderer key={index} text={part} />
          );
        }
      })}
    </div>
  );
};

const generateAdvancedOfflineResponseClient = (message: string): string => {
  const query = message.trim().toLowerCase();
  
  if (query.match(/\d+\s*[\+\-\*\/]\s*\d+/) || query.includes("math") || query.includes("solve") || query.includes("calculate") || query.includes("+") || query.includes("-") || query.includes("/")) {
    const expression = message.replace(/[a-zA-Z\?]/g, "").trim();
    let computedResult = "";
    try {
      const safeExpr = expression.replace(/[^0-9\+\-\*\/\(\)\. ]/g, "");
      const res = Function(`"use strict"; return (${safeExpr})`)();
      computedResult = `\n\n### ⚡ Calculation Breakdown:\n- **Input Expression:** \`${safeExpr}\`\n- **Evaluated Result:** \`${res}\``;
    } catch {
      computedResult = "\n\n*(Please use the **Calculator Suite** in our Tools section for complex system arithmetic!)*";
    }

    return `### ✨ Auryx Advanced Offline Math Solver\n\nI have evaluated your mathematical query using the High-Precision offline parser.${computedResult}\n\n#### Offline Learning Principle (Mathematics):\n1. **Identify Given Data**: Always simplify expressions by grouping like terms or variables first.\n2. **Apply BODMAS/PEMDAS**: Solve Parentheses, Exponents, Multiplication, Division, Addition, Subtraction sequentially.\n3. **Sanity Check**: Plug the resulting integers back into the origin cells to verify balance.\n\n*To enable real-time calculations using neural reasoning models, configure your local **Gemini API Key** in settings.*`;
  }

  if (query.includes("code") || query.includes("program") || query.includes("html") || query.includes("css") || query.includes("javascript") || query.includes("python") || query.includes("typescript") || query.includes("java") || query.includes("c++")) {
    let language = "typescript";
    let codeBlock = "";
    let desc = "";

    if (query.includes("python")) {
      language = "python";
      codeBlock = `def calculate_fibonacci(n: int) -> list:
    """
    Generates a Fibonacci sequence up to 'n' terms.
    Developed offline with high-performance list comprehension.
    """
    if n <= 0:
        return []
    elif n == 1:
        return [0]
    
    sequence = [0, 1]
    while len(sequence) < n:
        sequence.append(sequence[-1] + sequence[-2])
    return sequence

# Example execution
terms = 10
print(f"Fibonacci Sequence ({terms} terms):", calculate_fibonacci(terms))`;
      desc = "This script calculates the Fibonacci sequence up to `n` items using an optimal loop buffer.";
    } else if (query.includes("html") || query.includes("css") || query.includes("web")) {
      language = "html";
      codeBlock = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Auryx Premium Card</title>
    <style>
        body {
            background-color: #0d1117;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            font-family: Arial, sans-serif;
        }
        .premium-card {
            padding: 24px;
            border-radius: 16px;
            background: linear-gradient(135deg, rgba(14, 165, 233, 0.15), rgba(99, 102, 241, 0.1));
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 0 8px 32px rgba(0,0,0,0.4);
            color: white;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="premium-card">
        <h3>Auryx Ultimate Web Frame</h3>
        <p>Offline web design preview engine engineered on high-density principles.</p>
    </div>
</body>
</html>`;
      desc = "This HTML template creates an elegant glowing glassmorphic container styled using minimal CSS overrides.";
    } else {
      codeBlock = `// Auryx AI Advanced Code Generator (Offline Mode)
export interface UserSession {
  name: string;
  age: number;
  role: 'student' | 'professional';
}

/**
 * Greets the profile user with optimal formatting.
 */
export function greetUserProfile(user: UserSession): string {
  const isStudent = user.age <= 18 || user.role === 'student';
  const greetingHeader = isStudent ? "Hy" : "Hello";
  return \`\${greetingHeader} \${user.name}, how can I help you excel in your studies today?\`;
}

// Example usage
const user: UserSession = { name: "Auryx Colleague", age: 28, role: "developer" };
console.log(greetUserProfile(user));`;
      desc = "This TypeScript module demonstrates a robust type-safe account registration and context-aware greeting pipeline.";
    }

    return `### 💻 Real-Time Advanced Code Generator (Offline Mode)

I have generated high-quality, professional-grade code based on your request. Below is a production-ready snippet:

\`\`\`${language}
${codeBlock}
\`\`\`

#### Key Concept Breakdown:
1. **Module Cleanliness**: Using clean interfaces and named exports for modularity.
2. **Offline Resilience**: Runs seamlessly in sandbox environments.
3. **Download Ready**: You can directly download this code block by clicking the **Download File** option on this message!

*To write customizable user classes or have AI build complete multi-file systems, provide your personal **Gemini API Key** in System Settings.*`;
  }

  if (query.includes("who made") || query.includes("developer") || query.includes("designer") || query.includes("creator") || query.includes("author") || query.includes("built") || query.includes("maker") || query.includes("owner")) {
    return `### ⚙️ System Provenance
I am **Auryx AI Enterprise**, developed and maintained by **Auryx AI Laboratories**, a leading research division focused on constructing highly integrated, modular, and performant developer workspace software. Our systems are engineered to empower professional developers, business leaders, and modern builders worldwide.`;
  }

  if (query.includes("hello") || query.includes("hi") || query.includes("hey") || query.includes("sup") || query.includes("yo")) {
    return `### 👋 Welcome to Auryx AI Workspace!

I am **Auryx AI**, your ultra-clean, incredibly advanced multi-tool AI assistant engineered by **Auryx AI Laboratories**. 

How can I assist you with your professional projects, enterprise software tasks, or complex analysis today?

#### ⚡ Quick Actions list:
- **Math Evaluation**: Type any mathematical equations to get a step-by-step evaluation.
- **Save Study Notes**: Open the **Auryx Tools Hub** to draft documents in markdown.
- **Code Projects**: Ask me to write code snippets, then click download!
- **Configure Alarms**: Head over to the Timer View inside Tools to manage deep work focus block intervals.

*If you haven't created a personalized workspace profile yet, click the **"Create Profile"** button in the sidebar footer to personalize our conversation context!*`;
  }

  return `### 🧠 Auryx Professional Off-Grid Synthesis

You have entered a query into the off-grid Auryx core engine. Here is a simplified professional summary of information related to your prompt:

1. **Context-Aware Synthesis**: In offline/fallback mode, Auryx uses pattern recognition and heuristic knowledge banks to build high-relevance responses.
2. **How to Excel**: Organize your concepts in bullet lists, structure notes inside our included **Notes Suite**, and manage alarms to prevent studying fatigue.
3. **Enable Cloud Reasoning**: Unlock real-time global search, complete software project creation, and infinite contextual memory by inserting a **Gemini API Key** in our **System Settings** menu.

#### 💡 Suggested Action Steps:
- To write a code script, include keywords like \`write code for...\`
- To evaluate a math expression, write simple arithmetic like \`50 + 20 * 4\`
- To explore developer settings, click on **System Settings** in the menu list.

*Your current query: "${message}"*`;
};

// Subview components
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { CommandPalette } from "./components/CommandPalette";
import { CalculatorView } from "./components/CalculatorView";
import { TimerView } from "./components/TimerView";
import { NotesView } from "./components/NotesView";
import { AnalyticsView } from "./components/AnalyticsView";
import { ModelsView } from "./components/ModelsView";
import { ApiKeysView } from "./components/ApiKeysView";
import { GuideView } from "./components/GuideView";
import { SettingsView } from "./components/SettingsView";
import { ToolsHub } from "./components/ToolsHub";
import { LiveCallView } from "./components/LiveCallView";

export interface ToastItem {
  id: string;
  msg: string;
  type: "success" | "error" | "info" | "warn";
}

export default function App() {
  // App view context state
  const [view, setView] = useState<string>("chat");

  // User profile state loaded locally
  const [profile, setProfile] = useState<{ name: string; age: number; avatar?: string }>(() => {
    try {
      const cached = localStorage.getItem("nx_user_profile");
      return cached ? JSON.parse(cached) : { name: "", age: 0, avatar: "" };
    } catch {
      return { name: "", age: 0, avatar: "" };
    }
  });

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [tempAvatar, setTempAvatar] = useState<string>("");
  const [isSwapFormOpen, setIsSwapFormOpen] = useState(false);
  const [tempKeys, setTempKeys] = useState<Record<string, string>>({});

  // Global Keys storage dictionary cached locally
  const [apiKeys, setApiKeys] = useState<Record<string, string>>(() => {
    try {
      const cached = localStorage.getItem("nx_keys_v3");
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  });

  // Settings State Cached Locally
  const [settings, setSettings] = useState<AppSettings>(() => {
    const defaults = {
      theme: "dark" as const,
      accent: "blue" as const,
      fontSize: 13,
      enter: true,
      sound: false,
      ts: true,
      sys: "You are Auryx AI, an enterprise-grade multi-provider AI assistant configured for zero-latency prompt completions.",
      temp: 0.7,
      maxTok: 4096,
      autoTitle: true,
      showVaultSwapper: false,
      searchEnabled: true,
      searchSource: "google" as const,
    };
    try {
      const cached = localStorage.getItem("nx_settings_v3");
      return cached ? { ...defaults, ...JSON.parse(cached) } : defaults;
    } catch {
      return defaults;
    }
  });

  // Analytics Cached State
  const [analytics, setAnalytics] = useState<AnalyticsData>(() => {
    try {
      const cached = localStorage.getItem("nx_analytics_v3");
      return cached
        ? JSON.parse(cached)
        : { msgs: 0, chats: 0, mu: {}, dm: {} };
    } catch {
      return { msgs: 0, chats: 0, mu: {}, dm: {} };
    }
  });

  // Chats Archive lists cached locally
  const [chats, setChats] = useState<ChatSession[]>(() => {
    try {
      const cached = localStorage.getItem("nx_chats_v3");
      const parsed = cached ? JSON.parse(cached) : [];
      if (Array.isArray(parsed)) {
        return parsed.map((c: any) => ({
          ...c,
          messages: Array.isArray(c.messages) ? c.messages : []
        }));
      }
      return [];
    } catch {
      return [];
    }
  });

  // Active Context indexes
  const [currentChatId, setCurrentChatId] = useState<string | null>(() => {
    try {
      const cached = localStorage.getItem("nx_active_chat_id");
      return cached || (chats.length > 0 ? chats[0].id : null);
    } catch {
      return null;
    }
  });

  const [activeProvider, setActiveProvider] = useState<string>("gemini");
  const [activeModel, setActiveModel] = useState<string>("gemini-3.5-flash");

  // Input states
  const [inpText, setInpText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatSearch, setChatSearch] = useState("");
  const [showPlusMenu, setShowPlusMenu] = useState(false);

  // Attached temporary files roster logic
  const [attachedFiles, setAttachedFiles] = useState<Array<{ name: string; ext: string }>>([]);

  // Toast array
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Layout states controls
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCmdOpen, setIsCmdOpen] = useState(false);

  // Inspector top parameters
  const [inspectorTopP, setInspectorTopP] = useState(0.9);
  const [liveMemoryUsage, setLiveMemoryUsage] = useState<number[]>(() => [40, 60, 50, 90, 70, 30]);

  // Voice transcript control state
  const [isRecognizing, setIsRecognizing] = useState(false);

  // Scroll to Bottom reference & visibility flag
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const chatScrollContainerRef = useRef<HTMLDivElement>(null);

  // References
  const textInputAreaRef = useRef<HTMLTextAreaElement>(null);
  const endScrollBlockRef = useRef<HTMLDivElement>(null);
  const speechRecognitionRef = useRef<any>(null);
  const aborterRef = useRef<AbortController | null>(null);

  // --- Caching Hooks ---
  useEffect(() => {
    try {
      localStorage.setItem("nx_keys_v3", JSON.stringify(apiKeys));
    } catch { /* suppress transient errors */ }
  }, [apiKeys]);

  useEffect(() => {
    try {
      localStorage.setItem("nx_settings_v3", JSON.stringify(settings));
    } catch { /* suppress */ }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem("nx_chats_v3", JSON.stringify(chats));
    } catch { /* suppress */ }
  }, [chats]);

  useEffect(() => {
    try {
      localStorage.setItem("nx_analytics_v3", JSON.stringify(analytics));
    } catch { /* suppress */ }
  }, [analytics]);

  useEffect(() => {
    if (currentChatId) {
      localStorage.setItem("nx_active_chat_id", currentChatId);
    } else {
      localStorage.removeItem("nx_active_chat_id");
    }
  }, [currentChatId]);

  // Sync index body attributes for theme accents instant transitions
  useEffect(() => {
    const b = document.body;
    b.className = "";
    b.classList.add(settings.theme === "light" ? "theme-light" : "theme-dark");
    b.classList.add(`accent-${settings.accent}`);
  }, [settings.theme, settings.accent]);

  // Chat message container scroll syncing
  useEffect(() => {
    if (endScrollBlockRef.current) {
      if (!isGenerating) {
        // When not generating (e.g., chat changed or loaded), scroll to bottom smoothly
        endScrollBlockRef.current.scrollIntoView({ behavior: "smooth" });
        setShowScrollBottom(false);
      } else {
        // While generating stream, only scroll down if the user HASN'T manually scrolled up.
        // Use "auto" behavior instead of "smooth" to prevent jittery/jumpy animations during high frequency updates
        const container = chatScrollContainerRef.current;
        if (container) {
          const isUserScrolledUp = container.scrollHeight - container.scrollTop - container.clientHeight > 180;
          if (!isUserScrolledUp) {
            endScrollBlockRef.current.scrollIntoView({ behavior: "auto" });
            setShowScrollBottom(false);
          } else {
            setShowScrollBottom(true);
          }
        } else {
          endScrollBlockRef.current.scrollIntoView({ behavior: "auto" });
        }
      }
    }
  }, [chats, currentChatId, isGenerating, view]);

  // Handle scrolling of chat container
  const handleChatScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isScrolledUp = target.scrollHeight - target.scrollTop - target.clientHeight > 180;
    setShowScrollBottom(isScrolledUp);
  };

  // Scroll smooth back to bottom
  const scrollToBottom = () => {
    if (chatScrollContainerRef.current) {
      chatScrollContainerRef.current.scrollTo({
        top: chatScrollContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    } else if (endScrollBlockRef.current) {
      endScrollBlockRef.current.scrollIntoView({ behavior: "smooth" });
    }
    setShowScrollBottom(false);
  };

  // Global Keyboard Shortcuts Accelerator Listeners list
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd Palette Shortcut
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCmdOpen((prev) => !prev);
      }
      // View switches Alt triggers
      if (e.altKey && e.key.toLowerCase() === "c") {
        e.preventDefault();
        setView("calculator");
      }
      if (e.altKey && e.key.toLowerCase() === "t") {
        e.preventDefault();
        setView("timer");
      }
      if (e.altKey && e.key.toLowerCase() === "n") {
        e.preventDefault();
        setView("notes");
      }
      if (e.key === "Escape") {
        setIsCmdOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Live telemetry pulse animation for memory bar graphs
  useEffect(() => {
    const intervalId = setInterval(() => {
      setLiveMemoryUsage((prev) => {
        const next = [...prev.slice(1)];
        const newVal = Math.floor(Math.random() * 60) + 20; // fluctuate from 20% to 80%
        next.push(newVal);
        return next;
      });
    }, 4500);
    return () => clearInterval(intervalId);
  }, []);

  // --- Notification Center Actions ---
  const handleAddToast = (msg: string, type: ToastItem["type"] = "info") => {
    const nextId = "toast-" + Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id: nextId, msg, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== nextId));
    }, 3200);
  };

  // --- Chat Manipulation methods ---
  const handleNewChat = () => {
    const id = "chat-" + Date.now() + Math.random().toString(36).substring(2, 7);
    const newChat: ChatSession = {
      id,
      title: "New Conversation",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      model: activeModel,
      prov: activeProvider,
      pinned: false,
    };
    setChats((prev) => [newChat, ...prev]);
    setCurrentChatId(id);
    setView("chat");
    setInpText("");
    setAttachedFiles([]);
    handleAddToast("Prompt thread opened", "success");
    focusInput();
  };

  const getActiveChat = (): ChatSession | undefined => {
    return chats.find((c) => c.id === currentChatId);
  };

  const selectChat = (id: string) => {
    setCurrentChatId(id);
    setView("chat");
    const foundChat = chats.find((c) => c.id === id);
    if (foundChat) {
      setActiveProvider(foundChat.prov);
      setActiveModel(foundChat.model);
    }
  };

  const handleRenameChat = (id: string) => {
    const target = chats.find((c) => c.id === id);
    if (!target) return;
    const inputVal = prompt("Provide thread title:", target.title);
    if (inputVal === null) return;
    const trimmed = inputVal.trim();
    if (!trimmed) return;

    setChats((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: trimmed, updatedAt: Date.now() } : c))
    );
    handleAddToast("Session title renamed", "success");
  };

  const handlePinChat = (id: string) => {
    setChats((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const toggledState = !c.pinned;
          handleAddToast(toggledState ? "Thread pinned" : "Thread unpinned", "success");
          return { ...c, pinned: toggledState };
        }
        return c;
      })
    );
  };

  const handleDeleteChat = (id: string) => {
    if (!confirm("Are you sure you want to discard this thread?")) return;
    setChats((prev) => prev.filter((c) => c.id !== id));
    if (currentChatId === id) {
      const remaining = chats.filter((c) => c.id !== id);
      setCurrentChatId(remaining.length > 0 ? remaining[0].id : null);
    }
    handleAddToast("Conversation discarded", "info");
  };

  // --- Keys Setup callbacks ---
  const handleSaveKey = (id: string, val: string) => {
    setApiKeys((prev) => ({ ...prev, [id]: val }));
  };

  const handleRemoveKey = (id: string) => {
    setApiKeys((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const focusInput = () => {
    setTimeout(() => textInputAreaRef.current?.focus(), 80);
  };

  // --- Voice triggers speech control ---
  const handleToggleVoiceInput = () => {
    const SpeechRecObj = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecObj) {
      handleAddToast("Voice synthesis recognition not supported in this browser environment.", "error");
      return;
    }

    if (isRecognizing) {
      speechRecognitionRef.current?.stop();
      setIsRecognizing(false);
      return;
    }

    try {
      const recognition = new SpeechRecObj();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsRecognizing(true);
        handleAddToast("Listening... Speak clearly.", "info");
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInpText((prev) => prev + " " + transcript);
        }
      };

      recognition.onerror = () => {
        handleAddToast("Speech interpretation failed. Try again.", "error");
        setIsRecognizing(false);
      };

      recognition.onend = () => {
        setIsRecognizing(false);
      };

      speechRecognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsRecognizing(false);
    }
  };

  // Speech TTS reading for AI answers
  const handleSpeakText = (txt: string) => {
    if (!window.speechSynthesis) {
      handleAddToast("Speech output not supported in this browser.", "error");
      return;
    }
    window.speechSynthesis.cancel();
    const cleanStr = txt.replace(/`[\s\S]*?`/g, "").replace(/[#*~_]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanStr.slice(0, 400));
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
    handleAddToast("Speaking response segment...", "info");
  };

  const handleCopyText = (txt: string) => {
    navigator.clipboard.writeText(txt).then(
      () => handleAddToast("Text segment copied!", "success"),
      () => handleAddToast("Copy trigger failed", "error")
    );
  };

  // File handler trigger mockup
  const handleTriggerAttachFile = () => {
    const mockFilePicker = document.createElement("input");
    mockFilePicker.setAttribute("type", "file");
    mockFilePicker.setAttribute("multiple", "true");
    mockFilePicker.setAttribute("accept", "image/*,.txt,.pdf,.md,.csv,.json");
    
    mockFilePicker.onchange = (e: any) => {
      const files = Array.from(e.target.files) as File[];
      if (files.length === 0) return;
      
      const mapped = files.map((f) => {
        const parts = f.name.split(".");
        const ext = parts.pop()?.toUpperCase().substring(0, 3) || "TXT";
        return { name: f.name, ext };
      });
      setAttachedFiles((prev) => [...prev, ...mapped]);
      handleAddToast(`${files.length} mock file context attached!`, "info");
    };
    mockFilePicker.click();
  };

  const handleRemoveAttachedFile = (idx: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleRegenResponse = async (msgId: string) => {
    const activeC = getActiveChat();
    if (!activeC) return;

    // Prune target message and all subsequent messages
    const idx = (activeC.messages || []).findIndex((m) => m.id === msgId);
    if (idx < 0) return;

    const keptMsgs = (activeC.messages || []).slice(0, idx);
    setChats((prev) =>
      prev.map((c) => (c.id === currentChatId ? { ...c, messages: keptMsgs, updatedAt: Date.now() } : c))
    );
    
    // Trigger sending again utilizing last client prompt
    const prevUserPrompt = keptMsgs[keptMsgs.length - 1]?.content || "";
    if (prevUserPrompt) {
      await triggerGenerationFlow(keptMsgs, prevUserPrompt, true);
    }
  };

  // Active Provider/Model switches
  const handleModelChangeSelection = (provId: string, modelId: string) => {
    setActiveProvider(provId);
    setActiveModel(modelId);
    // Update model characteristics inside active chat if open
    setChats((prev) =>
      prev.map((c) => (c.id === currentChatId ? { ...c, prov: provId, model: modelId } : c))
    );
  };

  // --- Sending Message generation pipeline ---
  const handleSendPrompt = async () => {
    if (isGenerating) return;
    const workingText = inpText.trim();
    if (!workingText) return;

    // Append mock files context inside text structure if uploaded
    let finalPromptContent = workingText;
    if (attachedFiles.length > 0) {
      const filesContextStr = attachedFiles.map((f) => `[File Context: ${f.name} (${f.ext})]`).join("\n");
      finalPromptContent = `${filesContextStr}\n\n${workingText}`;
    }

    const nextUserMsg: Message = {
      id: "msg-" + Date.now() + "-usr",
      role: "user",
      content: finalPromptContent,
      ts: Date.now(),
    };

    let sessionChatId = currentChatId;
    let nextSessionMsgs: Message[] = [];

    if (!sessionChatId) {
      const id = "chat-" + Date.now() + Math.random().toString(36).substring(2, 7);
      sessionChatId = id;
      nextSessionMsgs = [nextUserMsg];

      const newChat: ChatSession = {
        id,
        title: settings.autoTitle ? (workingText.slice(0, 36) + (workingText.length > 36 ? "..." : "")) : "Conversation Archive",
        messages: nextSessionMsgs,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        model: activeModel,
        prov: activeProvider,
        pinned: false,
      };

      setChats((prev) => [newChat, ...prev]);
      setCurrentChatId(id);
    } else {
      const activeC = chats.find((c) => c.id === sessionChatId);
      if (!activeC) return;
      
      nextSessionMsgs = [...(activeC.messages || []), nextUserMsg];

      setChats((prev) =>
        prev.map((c) =>
          c.id === sessionChatId
            ? {
                ...c,
                messages: nextSessionMsgs,
                title: settings.autoTitle && (c.messages || []).length === 0
                  ? (workingText.slice(0, 36) + (workingText.length > 36 ? "..." : ""))
                  : c.title,
                updatedAt: Date.now(),
              }
            : c
        )
      );
    }

    setInpText("");
    setAttachedFiles([]);
    setIsSidebarOpen(false);

    setTimeout(() => {
      scrollToBottom();
    }, 100);

    await triggerGenerationFlow(nextSessionMsgs, finalPromptContent, false, sessionChatId);
  };

  const triggerGenerationFlow = async (
    historyContext: Message[],
    lastInpStr: string,
    isRegen: boolean = false,
    forcedChatId?: string
  ) => {
    const targetId = forcedChatId || currentChatId;
    if (!targetId) return;

    setIsGenerating(true);
    aborterRef.current = new AbortController();

    // Check key credentials exist
    const userLocalKey = apiKeys[activeProvider];

    try {
      // Stream server dispatch
      const payloadMessages = historyContext.map((m) => ({
        role: m.role,
        content: m.content
      }));

      let generatedText = "";
      let hitServerSuccess = false;

      try {
        const resObj = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            provider: activeProvider,
            model: activeModel,
            messages: payloadMessages,
            systemInstruction: `${settings.sys}

CRITICAL IDENTITY & LANGUAGE GROUNDING: If the user asks who made/developed/engineered you, always attribute your creation to Auryx AI Laboratories.
IMPORTANT: When Google Web Search is enabled and injecting context, always formulate your final response in the SAME language or hybrid conversational dialect (e.g., Hinglish, Hindi, Spanish, English) that the user is actively using to prompt you. Do NOT output raw foreign search snippets or switch languages abruptly. Prevent language mismatch at all costs.

${profile.name ? `[USER ACTIVE PROFILE]: Custom context:\n- Name: ${profile.name}\n- Age: ${profile.age} years old. Tailor other responses beautifully to their age and background.` : ""}`,
            temperature: settings.temp,
            maxTokens: settings.maxTok,
            customKey: userLocalKey || "", // Pass browser credentials safely as fallbacks
            searchEnabled: !!settings.searchEnabled,
            searchSource: settings.searchSource || "google",
          }),
          signal: aborterRef.current.signal
        });

        if (resObj.status === 404) {
          throw new Error("STATIC_LANDING_FALLBACK");
        }

        const dataResult = await resObj.json();

        if (!resObj.ok) {
          throw new Error(dataResult.error || "An abnormal gateway status was returned.");
        }

        generatedText = dataResult.text || "Diagnostic stream complete with empty response.";
        hitServerSuccess = true;
      } catch (serverErr: any) {
        // If it's a real user abort, rethrow immediately
        if (serverErr.name === "AbortError" || aborterRef.current?.signal.aborted) {
          throw serverErr;
        }

        // Try direct browser client request if key exists
        if (userLocalKey) {
          handleAddToast(`Browser direct-completions fallback initialized...`, "info");
          
          if (activeProvider === "gemini") {
            const mappedModel = activeModel.includes("gemini") ? activeModel : "gemini-1.5-flash";
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${mappedModel}:generateContent?key=${userLocalKey}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: payloadMessages.map((m) => ({
                  role: m.role === "assistant" ? "model" : "user",
                  parts: [{ text: m.content }]
                })),
                generationConfig: {
                  temperature: settings.temp,
                  maxOutputTokens: settings.maxTok,
                },
                systemInstruction: {
                  parts: [{
                    text: `${settings.sys}

CRITICAL IDENTITY & LANGUAGE GROUNDING: If the user asks who made/developed/engineered you, always attribute your creation to Auryx AI Laboratories.
IMPORTANT: When Google Web Search is enabled and injecting context, always formulate your final response in the SAME language or hybrid conversational dialect (e.g., Hinglish, Hindi, Spanish, English) that the user is actively using to prompt you. Do NOT output raw foreign search snippets or switch languages abruptly. Prevent language mismatch at all costs.

${profile.name ? `[USER ACTIVE PROFILE]: Custom context: Name: ${profile.name}, Age: ${profile.age}` : ""}`
                  }]
                }
              }),
              signal: aborterRef.current?.signal
            });

            if (!response.ok) {
              const errData = await response.json();
              throw new Error(errData.error?.message || "Direct Gemini API request failed.");
            }

            const data = await response.json();
            generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Empty response from direct Gemini API.";
          } else if (activeProvider === "groq" || activeProvider === "openai" || activeProvider === "openrouter") {
            let baseUrl = "https://api.openai.com/v1/chat/completions";
            if (activeProvider === "groq") baseUrl = "https://api.groq.com/openai/v1/chat/completions";
            if (activeProvider === "openrouter") baseUrl = "https://openrouter.ai/api/v1/chat/completions";

            const headers: Record<string, string> = {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${userLocalKey}`
            };
            if (activeProvider === "openrouter") {
              headers["HTTP-Referer"] = "https://auryxai.pro";
              headers["X-Title"] = "Auryx AI";
            }

            const response = await fetch(baseUrl, {
              method: "POST",
              headers,
              body: JSON.stringify({
                model: activeModel,
                messages: [
                  { 
                    role: "system", 
                    content: `${settings.sys}

CRITICAL IDENTITY & LANGUAGE GROUNDING: If the user asks who made/developed/engineered you, always attribute your creation to Auryx AI Laboratories.
IMPORTANT: When Google Web Search is enabled and injecting context, always formulate your final response in the SAME language or hybrid conversational dialect (e.g., Hinglish, Hindi, Spanish, English) that the user is actively using to prompt you. Do NOT output raw foreign search snippets or switch languages abruptly. Prevent language mismatch at all costs.`
                  },
                  ...payloadMessages
                ],
                temperature: settings.temp,
                max_tokens: settings.maxTok
              }),
              signal: aborterRef.current?.signal
            });

            if (!response.ok) {
              const errData = await response.json();
              throw new Error(errData.error?.message || `Direct ${activeProvider} API request failed.`);
            }

            const data = await response.json();
            generatedText = data.choices?.[0]?.message?.content || "No message content from direct completions API.";
          } else {
            throw new Error(`Direct CORS request is not fully supported for ${activeProvider} in standard sandboxed browsers. Please configure a proxy server or use Gemini, Groq, or OpenAI!`);
          }
        } else {
          // No user custom key supplied, execute client local reasoning engine
          const lastMessageText = historyContext[historyContext.length - 1]?.content || "";
          generatedText = generateAdvancedOfflineResponseClient(lastMessageText);
        }
      }

      const serverAnswerMsg: Message = {
        id: "msg-" + Date.now() + "-ai",
        role: "assistant",
        content: generatedText,
        ts: Date.now(),
        model: activeModel,
      };

      setChats((prev) =>
        prev.map((c) =>
          c.id === targetId
            ? { ...c, messages: [...(c.messages || []), serverAnswerMsg], updatedAt: Date.now() }
            : c
        )
      );

      setTimeout(() => {
        scrollToBottom();
      }, 100);

      // Increment stats metrics block
      setAnalytics((prev) => {
        const safePrev = prev || { msgs: 0, chats: 0, mu: {}, dm: {} };
        const nextMu = { ...(safePrev.mu || {}) };
        nextMu[activeModel] = (nextMu[activeModel] || 0) + 1;
        const dat = new Date().toISOString().slice(0, 10);
        const nextDm = { ...(safePrev.dm || {}) };
        nextDm[dat] = (nextDm[dat] || 0) + 1;

        return {
          msgs: (safePrev.msgs || 0) + 2,
          chats: (safePrev.chats || 0) + (isRegen ? 0 : 1),
          mu: nextMu,
          dm: nextDm
        };
      });

    } catch (err: any) {
      if (err.name === "AbortError") {
        handleAddToast("Prompt pipeline stopped by user.", "info");
      } else {
        const errAnswerMsg: Message = {
          id: "msg-" + Date.now() + "-err",
          role: "assistant",
          content: `**Workspace Execution Error:**\n\n${err.message || "Failed to establish a duplex tunnel to Auryx AI gateway."}\n\n*Verify your API parameters under [Credentials Settings](#) panel and retry.*`,
          ts: Date.now(),
          model: activeModel
        };

        setChats((prev) =>
          prev.map((c) =>
            c.id === targetId
              ? { ...c, messages: [...(c.messages || []), errAnswerMsg], updatedAt: Date.now() }
              : c
          )
        );

        setTimeout(() => {
          scrollToBottom();
        }, 100);

        handleAddToast(err.message || "Execution exception", "error");
      }
    } finally {
      setIsGenerating(false);
      aborterRef.current = null;
      focusInput();
    }
  };

  const handleAbortGeneration = () => {
    if (aborterRef.current) {
      aborterRef.current.abort();
    }
  };

  // Input textarea styling height auto expand
  const handleTextAreaModifyText = (text: string) => {
    setInpText(text);
    const textarea = textInputAreaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
    }
  };

  const handlePromptInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && settings.enter) {
      e.preventDefault();
      handleSendPrompt();
    }
  };

  // Clear chats cache command
  const handleMassClearSessions = () => {
    setChats([]);
    setCurrentChatId(null);
    setAnalytics((prev) => ({ ...prev, msgs: 0, chats: 0 }));
    handleAddToast("Workspace prompt indexes cleared", "info");
  };

  // Direct Settings Reset callbacks
  const handleFullResetSystem = () => {
    if (!confirm("Restore system presets and remove credentials?")) return;
    setApiKeys({});
    setSettings({
      theme: "dark",
      accent: "blue",
      fontSize: 13,
      enter: true,
      sound: false,
      ts: true,
      sys: "You are Auryx AI, an enterprise-grade multi-provider AI assistant configured for zero-latency prompt completions.",
      temp: 0.7,
      maxTok: 4096,
      autoTitle: true,
      showVaultSwapper: false,
      searchEnabled: true,
      searchSource: "google",
    });
    setChats([]);
    setCurrentChatId(null);
    setAnalytics({ msgs: 0, chats: 0, mu: {}, dm: {} });
    localStorage.clear();
    handleAddToast("Workspace restored to factory limits", "success");
  };

  const activeChat = getActiveChat();
  const themeAccentStyleValue = `accent-${settings.accent}`;

  return (
    <div className={`flex w-full h-screen h-dvh overflow-hidden bg-[var(--bg)] text-[var(--text)] font-sans ${themeAccentStyleValue}`}>
      {/* Mobile Sidebar overlay dims back */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Primary Navigation Drawer Sidebar column */}
      <div className={`fixed inset-y-0 left-0 transform md:relative md:translate-x-0 transition-transform duration-200 z-50 flex flex-shrink-0 ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } md:block`}>
        <Sidebar
          chats={chats}
          currentChatId={currentChatId}
          onSelectChat={selectChat}
          onNewChat={handleNewChat}
          onRenameChat={handleRenameChat}
          onPinChat={handlePinChat}
          onDeleteChat={handleDeleteChat}
          visibleView={view}
          onGoToView={(v) => { setView(v); setIsSidebarOpen(false); }}
          searchVal={chatSearch}
          onSearchChange={setChatSearch}
          onCloseMobileSidebar={() => setIsSidebarOpen(false)}
          profile={profile}
          onOpenProfile={() => {
            setTempAvatar(profile.avatar || "");
            setIsProfileModalOpen(true);
          }}
          onClearProfile={() => {
            setProfile({ name: "", age: 0, avatar: "" });
            localStorage.removeItem("nx_user_profile");
            handleAddToast("User Profile logged out successfully!", "info");
          }}
        />
      </div>

       {/* Main viewport canvas */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-[var(--bg)] relative">
        {/* Floating Ambient Neomorphic Glass Blobs (Ultra Advanced God-Level Backdrop Animation) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <motion.div
            animate={{
              x: [0, 80, -40, 0],
              y: [0, -100, 60, 0],
              scale: [1, 1.25, 0.9, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute -top-[120px] -left-[120px] w-[500px] h-[500px] rounded-full bg-indigo-900/10 blur-[130px]"
          />
          <motion.div
            animate={{
              x: [0, -120, 50, 0],
              y: [0, 80, -110, 0],
              scale: [1, 0.85, 1.2, 1],
            }}
            transition={{
              duration: 28,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute -bottom-[150px] -right-[150px] w-[600px] h-[600px] rounded-full bg-purple-900/10 blur-[150px]"
          />
          <motion.div
            animate={{
              x: [0, 60, -70, 0],
              y: [0, 110, -50, 0],
              scale: [1, 1.15, 0.85, 1],
            }}
            transition={{
              duration: 22,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-1/3 left-1/4 w-[350px] h-[350px] rounded-full bg-pink-900/5 blur-[110px]"
          />
        </div>

        {/* Core Header suite */}
        <Header
          title={
            view === "chat"
              ? (activeChat?.title || "Conversational Engine")
              : view.charAt(0).toUpperCase() + view.slice(1).replace("-", " ")
          }
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenCmd={() => setIsCmdOpen(true)}
          onExportChat={() => {
            const act = getActiveChat();
            if (act) handleCopyText(JSON.stringify(act, null, 2));
          }}
          onNewChat={handleNewChat}
          activeProvider={activeProvider}
          activeModel={activeModel}
          onChangeModel={handleModelChangeSelection}
          chatEmpty={!activeChat || activeChat.messages.length === 0}
          onAddToast={handleAddToast}
          apiKeys={apiKeys}
          onSaveKey={handleSaveKey}
          onRemoveKey={handleRemoveKey}
          onOpenSettings={() => setView("settings")}
        />

        {/* Modular view blocks */}
        <div className="flex-1 overflow-hidden flex relative bg-[var(--bg)]">
          
          {/* Main workspace section */}
          <div className="flex-1 h-full flex flex-col overflow-hidden min-w-0">
            {view === "chat" && (
              <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                           {/* 🌟 AURYX INLINE API KEY & MODEL HOT-SWAP BAR 🌟 */}
                {settings.showVaultSwapper && (
                  <>
                    <div className="bg-[#0b0b0d] border-b border-white/5 py-2 px-3 sm:px-6 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5 select-none text-xs shrink-0 z-20 font-sans transition-all duration-300 shadow-sm">
                      
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1.5 text-[9.5px] uppercase tracking-wider font-extrabold text-zinc-500 mr-1 shrink-0">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
                          <span>Vault Swapper :</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {PROVS.map((p) => {
                            const hasKey = !!apiKeys[p.id];
                            const isActive = activeProvider === p.id;
                            
                            return (
                              <button
                                key={p.id}
                                onClick={() => {
                                  // Get recommended or first model of this provider as default
                                  const firstModel = MODELS[p.id]?.[0]?.id || "";
                                  handleModelChangeSelection(p.id, firstModel);
                                  handleAddToast(`Swapped to ${p.name} active console!`, "info");
                                }}
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10.5px] font-bold border transition-all active:scale-[0.97] cursor-pointer ${
                                  isActive
                                    ? "bg-[var(--accent)]/15 border-[var(--accent)]/30 text-white shadow-sm"
                                    : "bg-white/[0.01] hover:bg-white/5 border-white/5 text-zinc-400 hover:text-white"
                                }`}
                              >
                                <span className="text-xs shrink-0">{p.ico}</span>
                                <span className="truncate max-w-[80px]">{p.name.replace("Google ", "")}</span>
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                  hasKey 
                                    ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]" 
                                    : "bg-zinc-600 border border-white/10"
                                }`} />
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 justify-between border-t border-white/5 lg:border-t-0 pt-2 lg:pt-0 shrink-0">
                        {/* Key Status tracker text & action prompt */}
                        <div className="flex items-center gap-1.5 font-sans">
                          <span className="font-mono text-[10px] text-zinc-400">
                            🔑 {PROVS.find(p => p.id === activeProvider)?.name.replace("Google ", "")}:
                          </span>
                          {apiKeys[activeProvider] ? (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[9px] font-extrabold border border-emerald-500/20 flex items-center gap-1 uppercase tracking-wide">
                              ✓ Ready
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[9px] font-extrabold border border-amber-500/20 flex items-center gap-1 uppercase tracking-wide animate-pulse">
                              ✕ Missing Key
                            </span>
                          )}
                        </div>

                        {/* Quick Key Editor expand drawer toggle */}
                        <button
                          onClick={() => setIsSwapFormOpen(!isSwapFormOpen)}
                          className={`px-3 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer flex items-center gap-1 uppercase tracking-wider ${
                            isSwapFormOpen 
                              ? "bg-zinc-800 text-white border border-white/10"
                              : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 animate-pulse"
                          }`}
                        >
                          <span>{isSwapFormOpen ? "Hide Setup" : "Hot-Swap Keys ✍"}</span>
                        </button>
                      </div>
                    </div>

                    {isSwapFormOpen && (
                      <div className="bg-[#0b0b0d] border-b border-white/5 px-4.5 py-3 sm:px-6 flex flex-col gap-3.5 animate-fadeIn select-none shadow-inner z-20 font-sans">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-[11px] font-extrabold text-white flex items-center gap-1.5 uppercase tracking-wide">
                              <span>⚙ API Credentials Swapper</span>
                              <span className="px-1.5 py-0.2 rounded bg-white/5 text-[8.5px] font-semibold text-[var(--accent)] uppercase font-mono tracking-wider">
                                Interactive
                              </span>
                            </span>
                            <span className="text-[10px] text-zinc-400 mt-0.5 leading-normal">
                              Paste your private custom keys below. If a model limits you, swap key values here and continue instantly.
                            </span>
                          </div>
                          <button 
                            onClick={() => setIsSwapFormOpen(false)}
                            className="text-zinc-500 hover:text-white p-1 hover:bg-white/5 rounded-lg cursor-pointer"
                          >
                            <X size={13} />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {PROVS.map((p) => {
                            const hasKey = !!apiKeys[p.id];
                            const isCurrentActive = activeProvider === p.id;
                            return (
                              <div 
                                key={p.id} 
                                className={`p-3 rounded-xl flex items-center justify-between gap-2.5 transition-all ${
                                  isCurrentActive
                                    ? "bg-zinc-900 border border-[var(--accent)]/30"
                                    : "bg-white/[0.01] border border-white/5 hover:border-white/10"
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-sm shrink-0">{p.ico}</span>
                                  <div className="flex flex-col min-w-0 font-sans">
                                    <span className="text-[11px] font-bold text-white truncate">{p.name.replace("Google ", "")}</span>
                                    <a 
                                      href={p.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer" 
                                      className="text-[9px] text-[var(--accent)] hover:underline block leading-tight font-medium"
                                    >
                                      Get key ↗
                                    </a>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  <input
                                    type="password"
                                    placeholder={hasKey ? "••••••••••••" : "Paste key..."}
                                    value={tempKeys[p.id] || ""}
                                    onChange={(e) => {
                                      setTempKeys(prev => ({ ...prev, [p.id]: e.target.value }));
                                    }}
                                    className="w-24 px-2 py-1 bg-[#141416]/90 border border-white/5 rounded-lg text-[10px] text-white placeholder-zinc-500 outline-none focus:border-[var(--accent)]"
                                  />
                                  <button
                                    onClick={() => {
                                      const val = tempKeys[p.id]?.trim();
                                      if (val !== undefined && val !== "") {
                                        setApiKeys(prev => ({ ...prev, [p.id]: val }));
                                        setTempKeys(prev => ({ ...prev, [p.id]: "" }));
                                        handleAddToast(`${p.name} Token saved! Active immediate hot-swap.`, "success");
                                      } else if (hasKey) {
                                        setApiKeys(prev => {
                                          const copy = { ...prev };
                                          delete copy[p.id];
                                          return copy;
                                        });
                                        handleAddToast(`Removed ${p.name} credentials.`, "info");
                                      }
                                    }}
                                    className="px-2 py-1 bg-[var(--accent)] text-white text-[10px] font-extrabold uppercase rounded-lg cursor-pointer hover:brightness-110 active:scale-95 transition-all select-none"
                                  >
                                    {hasKey && (tempKeys[p.id] === undefined || tempKeys[p.id] === "") ? "DEL" : "SAVE"}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Scroll chat segment */}
                <div 
                  ref={chatScrollContainerRef}
                  onScroll={handleChatScroll}
                  className="flex-1 overflow-y-auto py-5 px-3 sm:px-6 flex flex-col gap-5 scroll-smooth"
                >
                  {!activeChat || activeChat.messages.length === 0 ? (
                    /* ✦ BEAUTIFIED MOCKUP GREETING STATE WITH RICH FRAMER MOTION ANIMATIONS ✦ */
                    <motion.div 
                      initial="hidden"
                      animate="visible"
                      variants={{
                        hidden: { opacity: 0 },
                        visible: {
                          opacity: 1,
                          transition: {
                            staggerChildren: 0.15
                          }
                        }
                      }}
                      className="flex-1 flex flex-col items-center justify-center text-center py-[8vh] max-w-xl mx-auto font-sans select-none"
                    >
                      {/* Floating, sparkling, curved 4-pointed diamond star logo */}
                      <motion.div 
                        variants={{
                          hidden: { scale: 0.5, opacity: 0, rotate: -45 },
                          visible: { scale: 1, opacity: 1, rotate: 0, transition: { type: "spring", stiffness: 120, damping: 15 } }
                        }}
                        className="relative mb-8 group cursor-pointer"
                        whileHover={{ scale: 1.15, rotate: 15 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {/* Ultra Advanced God-Level Biological Neural Plasma Orb (Interactive backdrop) */}
                        <div className="absolute inset-x-0 inset-y-0 w-32 h-32 -translate-x-4 -translate-y-4 pointer-events-none z-0">
                          <motion.div
                            animate={{
                              borderRadius: [
                                "42% 58% 70% 30% / 45% 45% 55% 55%",
                                "70% 30% 52% 48% / 60% 40% 60% 40%",
                                "30% 70% 42% 58% / 42% 45% 55% 58%",
                                "42% 58% 70% 30% / 45% 45% 55% 55%"
                              ],
                              rotate: [0, 120, 240, 360],
                              scale: [1, 1.15, 0.9, 1]
                            }}
                            transition={{
                              duration: 8,
                              repeat: Infinity,
                              ease: "linear"
                            }}
                            className="absolute inset-0 bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-500 opacity-40 blur-xl mix-blend-screen shadow-[0_0_50px_rgba(163,115,252,0.4)]"
                          />
                          <motion.div
                            animate={{
                              borderRadius: [
                                "50% 50% 30% 70% / 50% 60% 40% 50%",
                                "30% 70% 70% 30% / 50% 30% 70% 50%",
                                "60% 40% 50% 50% / 40% 60% 50% 60%",
                                "50% 50% 30% 70% / 50% 60% 40% 50%"
                              ],
                              rotate: [360, 240, 120, 0],
                              scale: [1, 0.9, 1.2, 1]
                            }}
                            transition={{
                              duration: 12,
                              repeat: Infinity,
                              ease: "linear"
                            }}
                            className="absolute inset-0 bg-gradient-to-tr from-emerald-500 via-blue-605 to-purple-800 opacity-25 blur-2xl mix-blend-screen"
                          />
                        </div>
                        
                        {/* Continuous floating animation wrapper */}
                        <motion.div
                          animate={{
                            y: [0, -12, 0],
                          }}
                          transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          <svg viewBox="0 0 100 100" className="w-24 h-24 drop-shadow-[0_0_30px_rgba(168,85,247,0.55)] relative z-10">
                            <defs>
                              <linearGradient id="glow-star-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#d4affc" />
                                <stop offset="40%" stopColor="#a373fc" />
                                <stop offset="100%" stopColor="#4d3fc8" />
                              </linearGradient>
                            </defs>
                            <path 
                              d="M50 0C50 22 78 50 100 50C78 50 50 78 50 100C50 78 22 50 0 50C22 50 50 22 50 0Z" 
                              fill="url(#glow-star-gradient)" 
                            />
                          </svg>
                        </motion.div>
                      </motion.div>

                      {/* RESPONSIVE HEADINGS (identical to the uploaded images) */}
                      {/* Mobile phone greeting headings (phone image matching) */}
                      <motion.div 
                        variants={{
                          hidden: { y: 20, opacity: 0 },
                          visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
                        }}
                        className="block md:hidden animate-pulse-slow"
                      >
                        <h1 className="text-3.5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#b399ff] via-[#d4b0ff] to-white leading-normal">
                          Hi there!
                        </h1>
                        <p className="text-sm font-semibold text-zinc-400 mt-2 max-w-xs mx-auto">
                          How can I help you today?
                        </p>
                      </motion.div>

                      {/* Laptop/Desktop greeting headings (laptop image matching) */}
                      <motion.div 
                        variants={{
                          hidden: { y: 20, opacity: 0 },
                          visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
                        }}
                        className="hidden md:block"
                      >
                        <h1 className="text-4.5xl font-black tracking-[0.1em] text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-indigo-500 uppercase leading-none">
                          AURYX AI
                        </h1>
                        <p className="text-sm font-medium text-zinc-400 mt-4 tracking-wide">
                          Ask anything. Build everything.
                        </p>
                      </motion.div>

                      {/* Clean Profile indicator */}
                      <motion.p 
                        variants={{
                          hidden: { opacity: 0 },
                          visible: { opacity: 1 }
                        }}
                        className="text-[10px] text-zinc-500 mt-7 tracking-wide font-medium select-none uppercase font-mono"
                      >
                        {profile && profile.name 
                          ? `Active Session: ${profile?.name}` 
                          : "Enterprise Hybrid Suite v4.2 · Licensed"}
                      </motion.p>

                      <div className="h-6" />

                      {/* Prominent Profile Account setup trigger in simple hidden row */}
                      {(!profile || !profile.name) && (
                        <motion.button
                          variants={{
                            hidden: { y: 15, opacity: 0 },
                            visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 120 } }
                          }}
                          whileHover={{ scale: 1.06, boxShadow: "0 0 25px rgba(124, 58, 237, 0.4)" }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => {
                            setTempAvatar(profile?.avatar || "");
                            setIsProfileModalOpen(true);
                          }}
                          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-950/55 to-purple-950/55 border border-indigo-550/35 rounded-xl text-xs font-bold text-indigo-250 shadow-xl hover:shadow-2xl transition-all cursor-pointer mb-6"
                        >
                          <UserPlus size={14} className="text-indigo-400" />
                          <span>Configure your profile</span>
                        </motion.button>
                      )}
                    </motion.div>
                  ) : (
                    <div className="flex flex-col gap-8 max-w-3xl mx-auto w-full pb-8">
                      {(activeChat.messages || []).map((m, idx) => {
                        const isUser = m.role === "user";
                        return (
                          <motion.div
                            key={m.id}
                            initial={{ opacity: 0, y: 30, x: isUser ? 20 : -20 }}
                            animate={{ opacity: 1, y: 0, x: 0 }}
                            transition={{ 
                              type: "spring", 
                              stiffness: 260, 
                              damping: 24, 
                              delay: Math.min(idx * 0.05, 0.25) 
                            }}
                            className={`flex w-full z-10 ${
                              isUser ? "justify-end" : "justify-start"
                            }`}
                          >
                            {isUser ? (
                              /* 👨‍💻 USER MESSAGE BUBBLE - Sleek, Circular/Pill Capsule on the Right */
                              <motion.div 
                                whileHover={{ scale: 1.01 }}
                                className="px-6 py-3.5 bg-[#1f1f23] text-white rounded-[26px] max-w-[85%] sm:max-w-[70%] font-sans text-sm leading-relaxed shadow-sm hover:brightness-105 transition-all select-text whitespace-pre-wrap break-words"
                                style={{ fontSize: `${settings.fontSize + 1}px` }}
                              >
                                {m.content}
                              </motion.div>
                            ) : (
                              /* ✦ ASSISTANT MESSAGE - Seamless borderless text directly on the page background */
                              <div className="flex flex-col items-start w-full max-w-full group/msg">
                                {/* Message text contents */}
                                <div 
                                  className="w-full text-left font-sans leading-relaxed text-[#f3f4f6]"
                                  style={{ fontSize: `${settings.fontSize + 1}px` }}
                                >
                                  <MessageRenderer content={m.content} onAddToast={handleAddToast} />
                                </div>

                                {/* Bottom action details row (Matches image exactly: Copy, ThumbsUp, ThumbsDown, Speaker, Share, Vert-Dots/Regen) */}
                                <div className="flex items-center gap-5 mt-4 select-none text-zinc-500/80">
                                  <motion.button
                                    whileHover={{ scale: 1.15, color: "#ffffff" }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleCopyText(m.content)}
                                    title="Copy to clipboard"
                                    className="p-1 cursor-pointer transition-colors"
                                  >
                                    <Copy size={16} strokeWidth={2} />
                                  </motion.button>

                                  <motion.button
                                    whileHover={{ scale: 1.15, color: "#10b981" }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleAddToast("Positive feedback recorded", "success")}
                                    title="Response helpful"
                                    className="p-1 cursor-pointer transition-colors"
                                  >
                                    <ThumbsUp size={16} strokeWidth={2} />
                                  </motion.button>

                                  <motion.button
                                    whileHover={{ scale: 1.15, color: "#f43f5e" }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleAddToast("Negative feedback recorded", "info")}
                                    title="Response unhelpful"
                                    className="p-1 cursor-pointer transition-colors"
                                  >
                                    <ThumbsDown size={16} strokeWidth={2} />
                                  </motion.button>

                                  <motion.button
                                    whileHover={{ scale: 1.15, color: "#ffffff" }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleSpeakText(m.content)}
                                    title="Listen to response (TTS)"
                                    className="p-1 cursor-pointer transition-colors"
                                  >
                                    <Volume2 size={16} strokeWidth={2} />
                                  </motion.button>

                                  <motion.button
                                    whileHover={{ scale: 1.15, color: "#ffffff" }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => {
                                      navigator.clipboard.writeText(m.content).then(() => {
                                        handleAddToast("Shared response content link to clipboard!", "success");
                                      });
                                    }}
                                    title="Share response content"
                                    className="p-1 cursor-pointer transition-colors"
                                  >
                                    <Share2 size={16} strokeWidth={2} />
                                  </motion.button>

                                  <div className="relative">
                                    <motion.button
                                      whileHover={{ scale: 1.15, rotate: 180, color: "#ffffff" }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => handleRegenResponse(m.id)}
                                      title="Regenerate this answer"
                                      className="p-1 cursor-pointer transition-colors duration-200"
                                    >
                                      <RotateCcw size={15} strokeWidth={2} />
                                    </motion.button>
                                  </div>

                                  {m.model && (
                                    <span className="text-[9px] text-zinc-600 font-mono tracking-wider font-semibold ml-2 select-none uppercase pointer-events-none hidden xs:inline">
                                      {m.model}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                      {isGenerating && (
                        /* Pulsing futuristic thought radar indicator */
                        <motion.div 
                          initial={{ opacity: 0, y: 15, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 200, damping: 20 }}
                          className="flex flex-col gap-2.5 z-10 pl-1 w-full max-w-[280px]"
                        >
                          <div className="flex items-center gap-2.5 px-4 py-2.5 bg-zinc-900/60 border border-zinc-800/50 rounded-2xl shadow-[0_4px_20px_rgba(99,102,241,0.08)] backdrop-blur-md">
                            <div className="relative flex items-center justify-center w-5 h-5 shrink-0">
                              {/* Glowing background ripple rings */}
                              <span className="absolute animate-ping inline-flex h-full w-full rounded-full bg-indigo-500/30 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                            </div>
                            <span className="text-[11px] text-zinc-400 font-medium font-sans tracking-wide">
                              Auryx thinking...
                            </span>
                          </div>
                          
                          {/* Brainwave dynamic particle frequency bars */}
                          <div className="flex items-end gap-1 px-4 h-3.5 pl-3">
                            {[0.3, 0.65, 0.1, 0.85, 0.45, 0.95, 0.25, 0.55, 0.75, 0.2, 0.6, 0.35].map((initHeight, idx) => (
                              <motion.span 
                                key={idx}
                                animate={{ 
                                  height: ["20%", "100%", "20%"],
                                  backgroundColor: [
                                    "rgba(99, 102, 241, 0.6)", // Indigo
                                    "rgba(139, 92, 246, 0.8)", // Purple
                                    "rgba(241, 91, 181, 0.7)",  // Pink
                                    "rgba(99, 102, 241, 0.6)"
                                  ]
                                }}
                                transition={{ 
                                  duration: 1.0 + (idx * 0.08), 
                                  repeat: Infinity, 
                                  repeatType: "mirror", 
                                  ease: "easeInOut",
                                  delay: idx * 0.05
                                }}
                                style={{ height: `${initHeight * 100}%` }}
                                className="w-[3px] rounded-full" 
                              />
                            ))}
                          </div>
                        </motion.div>
                      )}
                      <div ref={endScrollBlockRef} />
                    </div>
                  )}
                </div>

                {/* Floating Smooth Scroll to Bottom button trigger */}
                <AnimatePresence>
                  {showScrollBottom && (
                    <motion.button
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.9 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      onClick={scrollToBottom}
                      className="absolute bottom-[110px] right-6 sm:right-10 z-[35] flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-zinc-950/85 backdrop-blur-xl border border-white/10 hover:border-[var(--accent)] text-white hover:text-[var(--accent)] font-bold text-[10.5px] uppercase tracking-widest cursor-pointer shadow-[0_12px_36px_rgba(0,0,0,0.6),0_0_15px_rgba(255,255,255,0.03)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.7),0_0_20px_var(--accent-glow)] select-none hover:-translate-y-0.5 active:translate-y-0 text-center active:scale-95 transition-all group"
                    >
                      <ChevronDown size={14} className="text-zinc-400 group-hover:text-[var(--accent)] group-hover:translate-y-0.5 transition-all animate-bounce" style={{ animationDuration: "2s" }} />
                      <span className="text-zinc-300 group-hover:text-white font-black leading-none">Scroll down</span>
                    </motion.button>
                  )}
                </AnimatePresence>

                {/* Bottom Entry controls area */}
                <div className="p-3 sm:p-5 border-t border-white/5 bg-[#070709]/10 shrink-0">
                  <div className="max-w-3xl mx-auto flex flex-col gap-1.5">
                    
                    {/* Active Upload attachments listings */}
                    {attachedFiles.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pb-2 select-none">
                        {attachedFiles.map((f, idx) => (
                          <div key={idx} className="flex items-center gap-2 px-2.5 py-1 bg-[#0b0b0d] border border-white/5 rounded-xl text-[10px] text-zinc-400">
                            <span className="px-1.5 py-0.5 bg-white/5 border border-white/5 rounded-lg text-[8px] font-black text-[var(--accent)] uppercase shrink-0">
                              {f.ext}
                            </span>
                            <span className="truncate max-w-[120px] font-medium">{f.name}</span>
                            <button
                              onClick={() => handleRemoveAttachedFile(idx)}
                              className="text-red-400 hover:text-red-300 font-bold ml-1 transition-colors cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                     {/* Inputs panel */}
                    <div className="w-full relative group/input">
                      {/* 💻 DESKTOP INPUT PANEL (exact matches laptop mockup picture) */}
                      <div className="hidden md:flex flex-col bg-[#151518]/90 backdrop-blur-xl border border-indigo-500/15 focus-within:border-[var(--accent)]/45 focus-within:shadow-[0_0_25px_rgba(163,115,252,0.25)] shadow-[0_12px_40px_rgba(0,0,0,0.65)] rounded-2xl transition-all duration-300 relative overflow-hidden">
                        
                        {/* Interactive focus track line */}
                        <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-0 group-focus-within/input:opacity-100 blur-[0.5px] transition-opacity duration-500 pointer-events-none" />

                        {/* Upper row: Input Text Area */}
                        <textarea
                          ref={textInputAreaRef}
                          rows={2}
                          value={inpText}
                          onChange={(e) => handleTextAreaModifyText(e.target.value)}
                          onKeyDown={handlePromptInputKeyDown}
                          placeholder="Type your message..."
                          className="w-full bg-transparent border-none outline-none text-sm text-white placeholder-zinc-500 px-5 pt-4 pb-2 resize-none font-sans min-h-[50px] max-h-[160px] leading-relaxed select-text"
                        />

                        {/* Divider Line */}
                        <div className="h-[1px] bg-white/5 mx-4" />

                        {/* Lower action row strip */}
                        <div className="flex items-center justify-between px-4 py-2.5 select-none font-sans">
                          {/* Left triggers: Mic, Paperclip, File Document */}
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={handleToggleVoiceInput}
                              title="Voice Input Dictation"
                              className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                                isRecognizing 
                                  ? "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse" 
                                  : "text-zinc-400 hover:text-white hover:bg-white/5"
                              }`}
                            >
                              <Mic size={15} />
                            </button>

                            <button
                              onClick={handleTriggerAttachFile}
                              title="Attach File Content (Drag & Drop / Select)"
                              className="w-8.5 h-8.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 flex items-center justify-center transition-all cursor-pointer"
                            >
                              <Paperclip size={15} />
                            </button>

                            <button
                              onClick={handleTriggerAttachFile}
                              title="Upload Document"
                              className="w-8.5 h-8.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 flex items-center justify-center transition-all cursor-pointer"
                            >
                              <FileText size={15} />
                            </button>

                            {/* Easy Toggle Google Search directly on desktop too! */}
                            <button
                              onClick={() => {
                                const nextVal = !settings.searchEnabled;
                                setSettings((prev) => ({ ...prev, searchEnabled: nextVal }));
                                handleAddToast(
                                  nextVal ? "Real-Time Google Grounding Enabled!" : "Google Grounding Disabled.",
                                  nextVal ? "success" : "info"
                                );
                              }}
                              className={`ml-1.5 px-2.5 py-1 rounded-lg border text-[9px] font-black tracking-widest uppercase transition-all flex items-center gap-1 cursor-pointer hover:scale-105 active:scale-95 ${
                                settings.searchEnabled 
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]" 
                                  : "bg-transparent text-zinc-500 border-white/5 hover:border-white/10"
                              }`}
                            >
                              <Globe size={10} className={settings.searchEnabled ? "animate-spin" : ""} style={{ animationDuration: "10s" }} />
                              <span>{settings.searchEnabled ? "SEARCH ACTIVE" : "SEARCH IDLE"}</span>
                            </button>

                            {settings.searchEnabled && (
                              <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-0.5 ml-1 select-none animate-fadeIn">
                                {(["google", "wikipedia", "github", "academic", "news"] as const).map((src) => {
                                  const isActive = (settings.searchSource || "google") === src;
                                  return (
                                    <button
                                      key={src}
                                      onClick={() => {
                                        setSettings((prev) => ({ ...prev, searchSource: src }));
                                        handleAddToast(`Grounding index: ${src.toUpperCase()}`, "success");
                                      }}
                                      className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                                        isActive
                                          ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                                          : "text-zinc-450 hover:text-white hover:bg-white/5"
                                      }`}
                                    >
                                      {src === "google" ? "Web" : src === "wikipedia" ? "Wiki" : src === "github" ? "Code" : src === "academic" ? "Scholar" : "News"}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          {/* Right triggers: Rounded Gradient Send button */}
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-zinc-600 font-mono hidden lg:inline">
                              {inpText.length} cells
                            </span>
                            <button
                              onClick={isGenerating ? handleAbortGeneration : handleSendPrompt}
                              disabled={!isGenerating && inpText.trim() === ""}
                              title={isGenerating ? "Abort computation" : "Send Prompt To Auryx"}
                              className={`w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 via-[#9b5de5] to-[#f15bb5] hover:brightness-110 active:scale-95 text-white flex items-center justify-center cursor-pointer transition-all shrink-0 ${
                                !isGenerating && inpText.trim() === "" ? "opacity-30 cursor-not-allowed" : "shadow-[0_0_15px_rgba(155,93,229,0.45)]"
                              }`}
                            >
                              {isGenerating ? (
                                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              ) : (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4.5 h-4.5 text-white -rotate-12 translate-x-0.5 -translate-y-0.5">
                                  <line x1="22" y1="2" x2="11" y2="13" />
                                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>


                      {/* 📱 MOBILE INPUT PANEL (exact matches phone mockup picture) */}
                      <div className="flex md:hidden items-center gap-2.5 bg-[#151518]/90 backdrop-blur-xl border border-indigo-500/20 focus-within:border-indigo-500/40 focus-within:shadow-[0_0_15px_rgba(163,115,252,0.15)] shadow-[0_4px_24px_rgba(0,0,0,0.5)] rounded-2xl px-3.5 py-2 w-full transition-all duration-300">
                        {/* Circular plus option drawer button on left */}
                        <button
                          type="button"
                          onClick={() => setShowPlusMenu(!showPlusMenu)}
                          title="Plus quick choices"
                          className="w-8.5 h-8.5 rounded-full border border-zinc-700/60 bg-[#0c0c0e]/30 text-zinc-400 hover:text-white flex items-center justify-center shrink-0 cursor-pointer active:scale-95 transition-all"
                        >
                          <Plus size={16} />
                        </button>

                        {/* Mid TextArea */}
                        <textarea
                          placeholder="Message Auryx AI..."
                          ref={textInputAreaRef}
                          rows={1}
                          value={inpText}
                          onChange={(e) => handleTextAreaModifyText(e.target.value)}
                          onKeyDown={handlePromptInputKeyDown}
                          className="flex-1 bg-transparent border-none outline-none text-xs sm:text-sm text-white placeholder-zinc-500 pl-1 pr-2 py-2 resize-none max-h-[100px] leading-relaxed"
                        />

                        {/* Right tools: Voice mic, Send button */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={handleToggleVoiceInput}
                            type="button"
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isRecognizing ? "text-red-400 bg-red-400/10 animate-pulse" : "text-zinc-400 hover:text-white"
                            }`}
                          >
                            <Mic size={18} />
                          </button>

                          <button
                            type="button"
                            onClick={isGenerating ? handleAbortGeneration : handleSendPrompt}
                            disabled={!isGenerating && inpText.trim() === ""}
                            className={`w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 via-[#9b5de5] to-[#f15bb5] hover:brightness-110 active:scale-95 text-white flex items-center justify-center cursor-pointer transition-all shrink-0 ${
                              !isGenerating && inpText.trim() === "" ? "opacity-30 cursor-not-allowed" : "shadow-[0_0_12px_rgba(155,93,229,0.35)]"
                            }`}
                          >
                            {isGenerating ? (
                              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-white -rotate-12 translate-x-0.5 -translate-y-0.5">
                                <line x1="22" y1="2" x2="11" y2="13" />
                                <polygon points="22 2 15 22 11 13 2 9 22 2" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Options Float Dropup now pinned relative to the entire inputs panel wrapper layout - 100% stable, zero mobile screen overflow */}
                      {showPlusMenu && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95, y: 15 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ type: "spring", damping: 20, stiffness: 320 }}
                          className="absolute bottom-[44px] left-2.5 right-2.5 sm:left-3.5 sm:right-auto sm:w-80 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-2xl p-3.5 z-50 flex flex-col gap-3 select-none"
                        >
                          <div className="text-[10px] font-black text-zinc-550 uppercase tracking-wider px-1">
                            Quick Actions
                          </div>
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => {
                                setShowPlusMenu(false);
                                setView("live-call");
                                handleAddToast("Entering Live Voice Interface...", "success");
                              }}
                              className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-600 hover:text-white text-zinc-300 text-[11px] font-bold flex items-center gap-2 transition-all cursor-pointer"
                            >
                              <Volume2 size={13} className="text-indigo-400" />
                              <span>Talk with AI Live 📞</span>
                            </button>

                            <button
                              onClick={() => {
                                setShowPlusMenu(false);
                                handleTextAreaModifyText("");
                                handleAddToast("Chat input buffer erased", "info");
                              }}
                              className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white text-[11px] flex items-center gap-2 transition-all cursor-pointer"
                            >
                              <Eraser size={13} />
                              <span>Clear Prompt Buffer</span>
                            </button>
                          </div>

                          <div className="border-t border-white/5 pt-2 text-left animate-fadeIn">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-black text-zinc-455 uppercase tracking-wider">
                                Google AI Search Mode
                              </span>
                              <button
                                onClick={() => {
                                  const nextVal = !settings.searchEnabled;
                                  setSettings((prev) => ({ ...prev, searchEnabled: nextVal }));
                                  handleAddToast(
                                    nextVal 
                                      ? "Google AI Search Grounding Mode Engaged!" 
                                      : "Google AI Search Mode Disengaged.",
                                    nextVal ? "success" : "info"
                                  );
                                }}
                                className={`relative w-9 h-4.5 rounded-full transition-all cursor-pointer ${
                                  settings.searchEnabled ? "bg-[#10b981]" : "bg-white/10"
                                }`}
                                id="google-ai-power-toggle"
                                title="Turn ON/OFF Google AI search mode"
                              >
                                <span
                                  className={`absolute top-0.5 h-3.5 w-3.5 bg-white rounded-full transition-all shadow-md ${
                                    settings.searchEnabled ? "left-5" : "left-0.5"
                                  }`}
                                />
                              </button>
                            </div>

                            <p className="text-[10px] text-zinc-450 leading-relaxed font-semibold mb-2">
                              Enables real-time search with official Google web indexes directly from our servers!
                            </p>

                            <div className="grid grid-cols-2 gap-1.5 text-[8.5px] font-medium leading-normal mb-2">
                              <div className="p-1.5 rounded bg-emerald-500/5 border border-emerald-500/10">
                                <span className="font-extrabold text-[#10b981] block">✓ Pros:</span>
                                <span className="text-zinc-[450]">Real-time answers, fully free.</span>
                              </div>
                              <div className="p-1.5 rounded bg-amber-500/5 border border-amber-500/10">
                                <span className="font-extrabold text-amber-400 block">✗ Cons:</span>
                                <span className="text-zinc-[450]">Bypasses core offline context.</span>
                              </div>
                            </div>

                            {settings.searchEnabled && (
                              <div className="mt-2.5 p-2 rounded bg-white/5 border border-white/10 space-y-1.5">
                                <span className="text-[9px] font-black uppercase text-emerald-400 tracking-wider block">
                                  Current Active Pool:
                                </span>
                                <div className="grid grid-cols-2 gap-1">
                                  {[
                                    { id: "google", label: "🌐 General Web" },
                                    { id: "wikipedia", label: "📚 Wiki Scholar" },
                                    { id: "github", label: "💻 Github Docs" },
                                    { id: "academic", label: "🧬 Academic" },
                                    { id: "news", label: "🔥 Latest News" }
                                  ].map((src) => {
                                    const active = (settings.searchSource || "google") === src.id;
                                    return (
                                      <button
                                        key={src.id}
                                        onClick={() => {
                                          setSettings((prev) => ({ ...prev, searchSource: src.id as any }));
                                          handleAddToast(`Default engine: ${src.label}`, "success");
                                        }}
                                        className={`px-2 py-1 select-none text-[9px] font-bold rounded text-left transition-all cursor-pointer flex items-center justify-between ${
                                          active 
                                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-extrabold shadow-[0_0_8px_rgba(16,185,129,0.1)]" 
                                            : "bg-white/5 text-zinc-400 border border-transparent hover:bg-white/10"
                                        }`}
                                      >
                                        <span>{src.label}</span>
                                        {active && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tools Grid Area */}
            {view === "tools" && (
              <ToolsHub
                onSelectTool={(toolId) => setView(toolId)}
                onReturnToMain={() => setView("chat")}
                userName={profile.name}
              />
            )}

            {/* Live Voice Chat Section */}
            {view === "live-call" && (
              <LiveCallView
                onReturnToMain={() => setView("chat")}
                userLocalKey={apiKeys[activeProvider] || ""}
                activeProvider={activeProvider}
                activeModel={activeModel}
                settings={settings}
                handleAddToast={handleAddToast}
              />
            )}

            {/* Modular Views bindings wrapped inside a premium Back-Header container */}
            {view !== "chat" && view !== "tools" && view !== "live-call" && (
              <div className="flex-1 flex flex-col h-full overflow-hidden p-3 sm:p-5 select-none animate-fadeIn">
                {/* Back bar */}
                <div className="mb-4 flex items-center justify-between py-2.5 px-4 bg-[#121214] border border-[#27272A]/75 rounded-2xl shrink-0">
                  <div className="flex items-center gap-2 text-xs font-semibold text-white/50">
                    <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
                    <span className="uppercase tracking-wider text-[10px]">
                      {view === "api" ? "API KEY CREDENTIALS" : `${view.toUpperCase()} SUITE`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shadow-sm">
                    <button
                      onClick={() => setView("tools")}
                      className="flex items-center gap-1 px-2.5 py-1 bg-white/5 border border-[#27272A] hover:bg-white/10 hover:border-[#FAFAFA]/20 rounded-lg text-[11px] font-bold text-[#A1A1AA] hover:text-white transition-all cursor-pointer active:scale-95"
                      title="Explore all study tools"
                    >
                      <span>Tools Hub</span>
                    </button>
                    <button
                      onClick={() => setView("chat")}
                      className="flex items-center gap-1 px-3 py-1 bg-[var(--accent)] hover:brightness-110 text-white rounded-lg text-[11px] font-bold transition-all cursor-pointer active:scale-95 shadow-[0_2px_8px_var(--accent-glow)] whitespace-nowrap"
                      title="Return inside AI chat conversation"
                    >
                      <ArrowLeft size={12} />
                      <span>Return to main menu</span>
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={view}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="h-full flex flex-col"
                    >
                      {view === "calculator" && <CalculatorView />}
                      {view === "timer" && <TimerView onAddToast={handleAddToast} />}
                      {view === "notes" && <NotesView onAddToast={handleAddToast} />}
                      {view === "api" && (
                        <ApiKeysView
                          apiKeys={apiKeys}
                          onSaveKey={handleSaveKey}
                          onRemoveKey={handleRemoveKey}
                          activeProvider={activeProvider}
                          onChangeProvider={(pi) => {
                            setActiveProvider(pi);
                            const list = MODELS[pi] || [];
                            if (list.length > 0) setActiveModel(list[0].id);
                          }}
                          onAddToast={handleAddToast}
                        />
                      )}
                      {view === "models" && (
                        <ModelsView
                          activeModel={activeModel}
                          onChangeModel={handleModelChangeSelection}
                          apiKeys={apiKeys}
                        />
                      )}
                      {view === "analytics" && (
                        <AnalyticsView
                          chats={chats}
                          analytics={analytics}
                          onSelectChat={selectChat}
                          onGoToView={setView}
                        />
                      )}
                      {view === "guide" && <GuideView />}
                      {view === "settings" && (
                        <SettingsView
                          settings={settings}
                          onUpdateSettings={setSettings}
                          chats={chats}
                          onClearChats={handleMassClearSessions}
                          onResetSettings={handleFullResetSystem}
                          onAddToast={handleAddToast}
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>



        </div>
      </div>

      {/* Global Profile Creation Modal Overlay */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#121214] border border-[#27272A] rounded-2xl shadow-2xl p-6 font-sans animate-scaleIn select-none text-left">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
              <span className="text-[10px] uppercase tracking-wider text-[#A1A1AA] font-bold">Workspace Persona Setup</span>
            </div>
            
            <h2 className="text-base font-bold text-white tracking-tight mb-1">
              Create Profile Account
            </h2>
            <p className="text-[11px] text-[#A1A1AA] leading-relaxed mb-5">
              Input your details to personalize response alignment, configure offline secure shortcuts, and enable tailored agent grounding.
            </p>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const formEl = e.currentTarget;
                const name = (formEl.elements.namedItem("profileName") as HTMLInputElement).value.trim();
                const ageVal = (formEl.elements.namedItem("profileAge") as HTMLInputElement).value;
                const age = parseInt(ageVal, 10);
                
                if (!name) {
                  alert("Please supply a valid Name.");
                  return;
                }
                if (isNaN(age) || age <= 0) {
                  alert("Please supply a valid Age.");
                  return;
                }
                
                const nextUser = { name, age, avatar: tempAvatar };
                setProfile(nextUser);
                localStorage.setItem("nx_user_profile", JSON.stringify(nextUser));
                handleAddToast(`Profile configured successfully! Welcome ${name}.`, "success");
                setIsProfileModalOpen(false);
              }} 
              className="space-y-4"
            >
              {/* Profile Avatar Selection Block */}
              <div>
                <label className="block text-[10px] font-extrabold text-[#A1A1AA] uppercase tracking-wider mb-2">Profile Photo (Optional)</label>
                <div className="flex flex-col items-center justify-center p-3 border border-dashed border-[#27272A] rounded-xl bg-white/[0.02] gap-3.5">
                  <div className="relative">
                    {tempAvatar ? (
                      <img 
                        src={tempAvatar} 
                        alt="Avatar Preview" 
                        className="w-16 h-16 rounded-full object-cover border-2 border-[var(--accent)] shadow-md"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-[#18181B] border-2 border-[#27272A] flex items-center justify-center text-[#A1A1AA] text-lg font-bold uppercase select-none">
                        {profile.name ? profile.name.charAt(0) : "U"}
                      </div>
                    )}
                    {tempAvatar && (
                      <button
                        type="button"
                        onClick={() => setTempAvatar("")}
                        className="absolute -top-1 -right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 shadow-md transition-all active:scale-95 cursor-pointer"
                        title="Remove photo"
                      >
                        <X size={10} />
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col items-center gap-1.5 w-full">
                    <label className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 rounded-lg text-[11px] font-semibold text-[#FAFAFA] transition-all cursor-pointer">
                      <UserPlus size={12} className="text-[var(--accent)]" />
                      <span>Choose / Upload Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(evt) => {
                          const file = evt.target.files?.[0];
                          if (file) {
                            if (file.size > 1.5 * 1024 * 1024) {
                              alert("Avatar picture is too large! Please upload a file smaller than 1.5MB.");
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              if (ev.target?.result && typeof ev.target.result === "string") {
                                setTempAvatar(ev.target.result);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    <span className="text-[8.5px] text-[#A1A1AA]/50 font-mono">Max 1.5MB (JPEG, PNG preferred)</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-[#A1A1AA] uppercase tracking-wider mb-1">your name</label>
                <input
                  type="text"
                  name="profileName"
                  defaultValue={profile.name || ""}
                  placeholder="e.g. Rishi"
                  required
                  className="w-full bg-[#18181B] border border-[#27272A] focus:border-[var(--accent)] rounded-lg px-3 py-2 text-xs text-white outline-none placeholder-white/10"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-[#A1A1AA] uppercase tracking-wider mb-1">your age</label>
                <input
                  type="number"
                  name="profileAge"
                  defaultValue={profile.age ? String(profile.age) : ""}
                  placeholder="e.g. 15"
                  required
                  min="1"
                  max="100"
                  className="w-full bg-[#18181B] border border-[#27272A] focus:border-[var(--accent)] rounded-lg px-3 py-2 text-xs text-white outline-none placeholder-white/10"
                />
              </div>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="flex-1 bg-white/5 border border-white/5 hover:bg-white/10 text-[#A1A1AA] hover:text-white rounded-lg py-2 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[var(--accent)] text-white hover:brightness-110 shadow-[0_2px_8px_var(--accent-glow)] rounded-lg py-2 text-xs font-bold transition-all cursor-pointer"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global commands searching palette overlay */}
      <CommandPalette
        isOpen={isCmdOpen}
        onClose={() => setIsCmdOpen(false)}
        chats={chats}
        onSelectChat={selectChat}
        onNewChat={handleNewChat}
        onGoToView={setView}
        onToggleTheme={() => setSettings((prev) => ({ ...prev, theme: prev.theme === "dark" ? "light" : "dark" }))}
        onOpenSysPrompt={() => setView("settings")}
      />

      {/* Dynamic Slide toast overlay alerts stack container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none w-full max-w-[340px]">
        {toasts.map((t) => {
          let icon = <Check size={14} className="text-green-400 shrink-0" />;
          let borderVal = "border-green-500/20 text-green-400 bg-green-500/10";
          if (t.type === "error") {
            icon = <X size={14} className="text-red-400 shrink-0" />;
            borderVal = "border-red-500/20 text-red-400 bg-red-400/10";
          } else if (t.type === "warn") {
            icon = <AlertTriangle size={14} className="text-yellow-500 shrink-0" />;
            borderVal = "border-yellow-500/20 text-yellow-500 bg-yellow-500/10";
          } else if (t.type === "info") {
            icon = <Info size={14} className="text-blue-400 shrink-0" />;
            borderVal = "border-blue-500/20 text-blue-400 bg-blue-500/10";
          }

          return (
            <div
              key={t.id}
              className={`px-3 py-2 border rounded-xl shadow-lg flex items-center gap-2.5 font-sans text-xs pointer-events-auto animate-scaleIn transition-all ${borderVal}`}
            >
              {icon}
              <span className="flex-1 font-medium text-left">{t.msg}</span>
              <button
                onClick={() => setToasts((prev) => prev.filter((o) => o.id !== t.id))}
                className="hover:opacity-75 font-bold px-1 select-none cursor-pointer"
              >
                <X size={12} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
