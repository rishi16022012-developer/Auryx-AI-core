export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  ts: number;
  model?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  model: string;
  prov: string;
  pinned: boolean;
}

export interface AppSettings {
  theme: "dark" | "light";
  accent: "blue" | "purple" | "green" | "rose" | "amber" | "cyan";
  fontSize: number;
  enter: boolean;
  sound: boolean;
  ts: boolean;
  sys: string;
  temp: number;
  maxTok: number;
  autoTitle: boolean;
  showVaultSwapper: boolean;
  searchEnabled?: boolean;
  searchSource?: "google" | "wikipedia" | "github" | "academic" | "news";
}

export interface AnalyticsData {
  msgs: number;
  chats: number;
  mu: Record<string, number>;
  dm: Record<string, number>;
}

export interface AppNote {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  pinned: boolean;
}

export interface PrebuiltAlarm {
  time: string;
  label: string;
  days: string;
  on: boolean;
}

export interface AIProvider {
  id: string;
  name: string;
  ico: string;
  col: string;
  url: string;
  desc: string;
}

export interface AIModel {
  id: string;
  n: string;
  sp: number;
  iq: number;
  cost: "Free" | "Paid" | "Varies";
  ctx: string;
  tag: string;
}
