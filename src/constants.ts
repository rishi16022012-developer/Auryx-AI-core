import { AIProvider, AIModel } from "./types";

export const PROVS: AIProvider[] = [
  { id: "gemini", name: "Google Gemini", ico: "🔮", col: "#4285F4", url: "https://aistudio.google.com/app/apikey", desc: "Original Gemini models" },
  { id: "groq", name: "Groq", ico: "⚡", col: "#F55036", url: "https://console.groq.com/keys", desc: "Ultra-fast custom engine" },
  { id: "openrouter", name: "OpenRouter", ico: "🔀", col: "#7B68EE", url: "https://openrouter.ai/keys", desc: "100+ standard models" },
  { id: "openai", name: "OpenAI", ico: "🤖", col: "#10A37F", url: "https://platform.openai.com/api-keys", desc: "GPT-4o series models" },
  { id: "anthropic", name: "Anthropic", ico: "🧠", col: "#CC785C", url: "https://console.anthropic.com/settings/keys", desc: "Claude models" },
  { id: "cohere", name: "Cohere", ico: "💡", col: "#39594D", url: "https://dashboard.cohere.com/api-keys", desc: "Command intelligence" },
];

export const MODELS: Record<string, AIModel[]> = {
  gemini: [
    { id: "gemini-3.5-flash", n: "Gemini 3.5 Flash", sp: 95, iq: 88, cost: "Free", ctx: "1M", tag: "Recommended" },
    { id: "gemini-3.1-pro-preview", n: "Gemini 3.1 Pro", sp: 78, iq: 97, cost: "Paid", ctx: "2M", tag: "Smartest" },
    { id: "gemini-3.1-flash-lite", n: "Gemini 3.1 Lite", sp: 98, iq: 82, cost: "Free", ctx: "1M", tag: "Fastest" }
  ],
  groq: [
    { id: "deepseek-r1-distill-llama-70b", n: "DeepSeek R1 70B", sp: 96, iq: 93, cost: "Free", ctx: "128K", tag: "Reasoning" },
    { id: "qwen-qwq-32b", n: "QwQ 32B dist", sp: 90, iq: 89, cost: "Free", ctx: "128K", tag: "Solving" },
    { id: "llama-3.3-70b-versatile", n: "Llama 3.3 70B", sp: 94, iq: 88, cost: "Free", ctx: "128K", tag: "Standard" }
  ],
  openrouter: [
    { id: "openrouter/auto", n: "Auto Best Choice", sp: 70, iq: 90, cost: "Varies", ctx: "Var", tag: "Dynamic" },
    { id: "mistralai/mistral-7b-instruct:free", n: "Mistral 7B", sp: 85, iq: 75, cost: "Free", ctx: "32K", tag: "Free" },
    { id: "meta-llama/llama-3.2-11b-vision-instruct:free", n: "Llama 3.2 Vision", sp: 80, iq: 79, cost: "Free", ctx: "128K", tag: "Free" }
  ],
  openai: [
    { id: "gpt-4o", n: "GPT-4o Focus", sp: 82, iq: 97, cost: "Paid", ctx: "128K", tag: "Flagship" },
    { id: "gpt-4o-mini", n: "GPT-4o Mini", sp: 92, iq: 87, cost: "Paid", ctx: "128K", tag: "Optimized" }
  ],
  anthropic: [
    { id: "claude-3-7-sonnet-20250219", n: "Claude 3.7 Sonnet", sp: 80, iq: 97, cost: "Paid", ctx: "200K", tag: "Top Tier" },
    { id: "claude-3-5-haiku-20241022", n: "Claude 3.5 Haiku", sp: 95, iq: 85, cost: "Paid", ctx: "200K", tag: "Rapid" }
  ],
  cohere: [
    { id: "command-r-plus", n: "Command R+", sp: 72, iq: 88, cost: "Paid", ctx: "128K", tag: "RAG" },
    { id: "command-r", n: "Command R", sp: 83, iq: 80, cost: "Paid", ctx: "128K", tag: "Enterprise" }
  ]
};

export const QP = [
  { ico: "💡", t: "Explain quantum computing", d: "Deep dive mechanics", p: "In simple terms with a clear analogy, explain how quantum computing functions." },
  { ico: "💻", t: "Build custom hook", d: "Clean typescript standard", p: "Write a high-performance React hook for robust debouncing, fully typed." },
  { ico: "📊", t: "Design business plan", d: "Structuring SaaS project", p: "Draft a modern bento grid structural landing page content map for a SaaS." },
  { ico: "✨", t: "Creative short story", d: "Deep cybernetic lore", p: "Write a short narrative about an AI finding consciousness in a terminal console." },
  { ico: "🌍", t: "Write professional pitch", d: "Clear marketing script", p: "Compose an email pitching a multi-provider workspace tool to a tech officer." },
  { ico: "🧮", t: "Debug rendering loop", d: "React best practices", p: "Explain why infinite re-renders happen in useEffect dependencies with objects." }
];
