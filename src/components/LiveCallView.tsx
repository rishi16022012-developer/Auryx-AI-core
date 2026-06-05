import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, 
  Mic, 
  MicOff, 
  PhoneOff, 
  Volume2, 
  Sparkles,
  Loader2,
  Keyboard,
  History,
  CornerDownLeft,
  RefreshCw,
  Cpu,
  Radio,
  Clock,
  Send,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface LiveCallViewProps {
  onReturnToMain: () => void;
  userLocalKey?: string;
  activeProvider: string;
  activeModel: string;
  settings: {
    sys: string;
    temp: number;
    maxTok: number;
  };
  handleAddToast: (msg: string, type?: "success" | "error" | "info" | "warn") => void;
}

interface MessageHistoryItem {
  id: string;
  role: "user" | "ai";
  text: string;
  timestamp: string;
  isVoice?: boolean;
}

export const LiveCallView: React.FC<LiveCallViewProps> = ({
  onReturnToMain,
  userLocalKey,
  activeProvider,
  activeModel,
  settings,
  handleAddToast
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  
  // State machine: connecting, listening, thinking, speaking, muted
  const [callState, setCallState] = useState<"connecting" | "listening" | "thinking" | "speaking" | "muted">("connecting");
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [showManualInput, setShowManualInput] = useState(true);
  const [manualQuery, setManualQuery] = useState("");
  const [isCalibrating, setIsCalibrating] = useState(false);
  const textInputRef = useRef<HTMLInputElement>(null);

  // Dynamic speech recognition and synthesis accents toggle system
  const [accentLanguage, setAccentLanguage] = useState<"en-US" | "en-IN" | "hi-IN">("en-IN");
  const accentLanguageRef = useRef(accentLanguage);

  useEffect(() => {
    accentLanguageRef.current = accentLanguage;
  }, [accentLanguage]);

  // Elite Live Speech Stats for transparency & professional design
  const [sessionDuration, setSessionDuration] = useState(0);
  const [wordsCount, setWordsCount] = useState(0);

  // Ultra advanced scrollable Conversation history sequence
  const [chatHistory, setChatHistory] = useState<MessageHistoryItem[]>([
    {
      id: "initial-system",
      role: "ai",
      text: "Auryx secure voice link calibration complete. Say hello, ask me to solve calculations, or write customized voice inputs freely.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isVoice: true
    }
  ]);

  // Keep references to prevent stale React closures inside events and intervals
  const isMutedRef = useRef(isMuted);
  const callStateRef = useRef(callState);
  
  // Real-time voice parameters
  const lastSpeechTimeRef = useRef<number>(0);
  const accumulatedTranscriptRef = useRef<string>("");
  const silenceCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Guard references to maintain correct speech state sync without collisions
  const isStartingRef = useRef(false);
  const isRecognizingRef = useRef(false);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const historyScrollEndRef = useRef<HTMLDivElement | null>(null);

  // Track session runtime second tracker
  useEffect(() => {
    const timer = setInterval(() => {
      if (callState !== "connecting" && callState !== "muted") {
        setSessionDuration(prev => prev + 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [callState]);

  // Sync references to preserve parameters inside closure loops accurately
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    callStateRef.current = callState;
  }, [callState]);

  // Smooth automatic bottom scrolling of convo feeds with zero layout conflicts
  useEffect(() => {
    if (historyScrollEndRef.current) {
      historyScrollEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, currentPrompt, callState]);

  // Stops any active system audio read-outs instantly
  const stopAudioOutput = () => {
    if (synthRef.current) {
      try {
        synthRef.current.cancel();
      } catch (e) {
        console.warn("Speech synthesis cancellation bypassed", e);
      }
    }
  };

  // Speaks output reply text back to user with smart native pronunciation mapping
  const speakResponseText = (text: string) => {
    if (!synthRef.current) return;
    stopAudioOutput();

    setCallState("speaking");
    
    // Extract plain texts from rich markdowns 
    const cleanPlaintext = text.replace(/[\*\#\`\_]/g, "").substring(0, 250);
    const utterance = new SpeechSynthesisUtterance(cleanPlaintext);
    
    // Match the synthesis voice to the response language context
    let responseLanguage: string = accentLanguageRef.current;
    if (/[\u0900-\u097F]/.test(text)) {
      responseLanguage = "hi-IN";
    }

    utterance.lang = responseLanguage;
    utterance.rate = responseLanguage === "hi-IN" ? 0.98 : 1.05;
    utterance.pitch = 1.0;

    // Direct audio channels targeting specific locale accents perfectly
    const voicesList = synthRef.current.getVoices();
    let bestVoice = voicesList.find((v) => v.lang === responseLanguage);
    if (!bestVoice) {
      bestVoice = voicesList.find((v) => v.lang.startsWith(responseLanguage.split("-")[0]));
    }
    if (!bestVoice && responseLanguage === "en-IN") {
      bestVoice = voicesList.find((v) => v.lang.startsWith("en"));
    }
    
    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    utterance.onend = () => {
      const activeMuteVal = isMutedRef.current;
      setCallState(activeMuteVal ? "muted" : "listening");
      setCurrentPrompt("");
      if (!activeMuteVal) {
        startListeningEngine();
      }
    };

    utterance.onerror = () => {
      const activeMuteVal = isMutedRef.current;
      setCallState(activeMuteVal ? "muted" : "listening");
      setCurrentPrompt("");
      if (!activeMuteVal) {
        startListeningEngine();
      }
    };

    synthRef.current.speak(utterance);
  };

  // Ultra stable direct system replies if no API Key or network offline
  const getFallbackTelemetryResponse = (query: string): string => {
    const textLower = query.toLowerCase();
    if (textLower.includes("hi") || textLower.includes("hello") || textLower.includes("hey")) {
      return "Hello there! I am Auryx, your live system voice model engineered by Auryx AI Laboratories.";
    }
    if (textLower.includes("who made") || textLower.includes("developer") || textLower.includes("who is") || textLower.includes("creator")) {
      return "I was engineered and developed by Auryx AI Laboratories as part of the Enterprise Hybrid Suite.";
    }
    if (textLower.includes("solve") || textLower.includes("calculate") || textLower.includes("math") || textLower.includes("calculator")) {
      return "My core contains offline calculations. Try exploring them on your home panel.";
    }
    return "Understood. Please add your personal Gemini API Key inside Settings to unlock fully custom topics.";
  };

  // Safe background model API handler
  const queryAIModelAsync = async (queryText: string) => {
    if (!queryText.trim()) return;
    
    // Stop microphone temporarily during AI completions
    stopListeningEngine();
    setCallState("thinking");
    stopAudioOutput();

    // Increment sentence telemetry counters
    const splitArr = queryText.split(/\s+/).filter(Boolean);
    setWordsCount(w => w + splitArr.length);

    // Create user dialog log bubble
    const userBubble: MessageHistoryItem = {
      id: "usr-" + Date.now(),
      role: "user",
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isVoice: true
    };
    
    setChatHistory(prev => [...prev, userBubble]);
    setCurrentPrompt(`"${queryText}"`);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: activeProvider === "gemini" ? "gemini" : activeProvider,
          model: activeModel,
          messages: [{ role: "user", content: `You are a warm, live conversational voice. Respond in under 15 words. User: ${queryText}` }],
          systemInstruction: `${settings.sys} Give your reply in 15 words or less. If asked about your creators, always reply you are developed by Auryx AI Laboratories.`,
          temperature: 0.7,
          maxTokens: 35,
          customKey: userLocalKey || "",
          searchEnabled: true
        })
      });

      if (!response.ok) throw new Error("STANDBY_VOICE_TRIGGER");

      const data = await response.json();
      const outputTxt = data.text || getFallbackTelemetryResponse(queryText);
      
      const aiBubble: MessageHistoryItem = {
        id: "ai-" + Date.now(),
        role: "ai",
        text: outputTxt,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isVoice: true
      };
      
      setChatHistory(prev => [...prev, aiBubble]);
      speakResponseText(outputTxt);
    } catch (e) {
      const fallbackTxt = getFallbackTelemetryResponse(queryText);
      const aiBubble: MessageHistoryItem = {
        id: "ai-" + Date.now(),
        role: "ai",
        text: fallbackTxt,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isVoice: true
      };
      setChatHistory(prev => [...prev, aiBubble]);
      speakResponseText(fallbackTxt);
    }
  };

  // Standard safe mic loop start
  const startListeningEngine = () => {
    if (isMutedRef.current || callStateRef.current === "speaking" || callStateRef.current === "thinking") {
      return;
    }
    if (!recognitionRef.current) return;
    
    // Prevent double invocation crashes (InvalidStateError)
    if (isRecognizingRef.current || isStartingRef.current) {
      return;
    }

    try {
      isStartingRef.current = true;
      recognitionRef.current.start();
    } catch (e) {
      console.warn("Direct Speech Recognition duplicate bypass", e);
      isStartingRef.current = false;
    }
  };

  // Standard safe stop
  const stopListeningEngine = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.warn("Mic stop clean bypass", e);
      }
    }
    isRecognizingRef.current = false;
    isStartingRef.current = false;
  };

  // Change active language/accent and recycle mic channel
  const handleChangeAccentLanguage = (lang: "en-US" | "en-IN" | "hi-IN") => {
    setAccentLanguage(lang);
    accentLanguageRef.current = lang;
    stopListeningEngine();
    
    // Force immediate engine re-calibration with new language model
    setTimeout(() => {
      if (!isMutedRef.current) {
        initSpeechEngineCalibration();
      }
    }, 150);
    handleAddToast(`Accent matching calibrated to: ${lang === "en-IN" ? "Eng/Hinglish (India)" : lang === "hi-IN" ? "Hindi (हिंदी)" : "Universal English"}`, "info");
  };

  // Core voice engine: Continuous input gathering with high precision Real-time silence timer
  const initSpeechEngineCalibration = () => {
    synthRef.current = window.speechSynthesis;
    const SpeechConstructor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechConstructor) {
      setCurrentPrompt("Speech recognition hardware not supported on this browser window context. Type using manual fields.");
      setShowManualInput(true);
      setCallState("listening");
      return;
    }

    // Clean older instances completely to free up ports
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.stop();
      } catch (e) {}
    }

    const instance = new SpeechConstructor();
    instance.continuous = true; // Continuous collection prevents speech truncation mid-sentence
    instance.interimResults = true; // Stream active syllable updates directly onto interface
    instance.lang = accentLanguageRef.current;

    instance.onstart = () => {
      isStartingRef.current = false;
      isRecognizingRef.current = true;
      if (!isMutedRef.current) {
        setCallState("listening");
      }
    };

    instance.onresult = (event: any) => {
      let finalTranscript = "";
      let interimTranscript = "";

      // BUG FIX: Rebuild complete conversational text by looping from 0 instead of resultIndex.
      // This prevents the browser from discarding earlier parts of the user's sentence when event.resultIndex increments.
      for (let i = 0; i < event.results.length; ++i) {
        const chunk = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += chunk + " ";
        } else {
          interimTranscript += chunk;
        }
      }

      const fullTranscript = (finalTranscript + interimTranscript).trim();
      if (fullTranscript) {
        setCurrentPrompt(fullTranscript);
        
        // Feed real-time telemetry variables
        lastSpeechTimeRef.current = Date.now();
        accumulatedTranscriptRef.current = fullTranscript;
      }
    };

    instance.onerror = (e: any) => {
      isStartingRef.current = false;
      isRecognizingRef.current = false;
      
      if (e.error !== "no-speech") {
        console.warn("Calibration telemetry info:", e.error);
      }
      
      if (e.error === "not-allowed") {
        setHasPermission(false);
        setCallState("muted");
      }
    };

    instance.onend = () => {
      isRecognizingRef.current = false;
      isStartingRef.current = false;
      
      const currentCallState = callStateRef.current;
      if (!isMutedRef.current && currentCallState === "listening") {
        // Safe timeout rebound loop
        setTimeout(() => {
          if (!isMutedRef.current && callStateRef.current === "listening") {
            startListeningEngine();
          }
        }, 300);
      }
    };

    recognitionRef.current = instance;
    startListeningEngine();

    // ULTRA SMART RECONCILIATION TIMER
    // Continuously checks speech ages every 100ms. Perfect pause detection!
    if (silenceCheckIntervalRef.current) clearInterval(silenceCheckIntervalRef.current);
    silenceCheckIntervalRef.current = setInterval(() => {
      const speechAgeMs = Date.now() - lastSpeechTimeRef.current;
      const currentText = accumulatedTranscriptRef.current;
      
      // If user stops speaking with content for more than 1000ms, process sentence boundary!
      if (
        currentText.trim() && 
        speechAgeMs > 1000 && 
        callStateRef.current === "listening" &&
        !isMutedRef.current
      ) {
        const queryToProcess = currentText.trim();
        
        // Reset buffers immediately to avoid race loops
        accumulatedTranscriptRef.current = "";
        lastSpeechTimeRef.current = 0;
        setCurrentPrompt("");

        // Recycle the mic engine so it starts fresh on the next sentence
        stopListeningEngine();
        
        // Core dispatch
        queryAIModelAsync(queryToProcess);
      }
    }, 100);
  };

  // Hard reboot of speech stream captures
  const forceRecalibrateDeviceStream = () => {
    setIsCalibrating(true);
    stopAudioOutput();
    stopListeningEngine();
    setTimeout(() => {
      setIsCalibrating(false);
      setCurrentPrompt("");
      setCallState("listening");
      initSpeechEngineCalibration();
      handleAddToast("Audio calibration complete. Speak freely...", "success");
    }, 800);
  };

  // Authorizes and initiates recording devices
  const requestMicPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Clear raw capture streams instantly to avoid passive recordings
      stream.getTracks().forEach((track) => track.stop());
      
      setHasPermission(true);
      setCallState("listening");
      
      // Calibrate advanced vocal trackers
      initSpeechEngineCalibration();
    } catch (err) {
      console.warn("Microphone access locked by browser security configs:", err);
      setHasPermission(false);
      setCallState("muted");
      setCurrentPrompt("Microphone block detected. Use manual backup query fields to communicate.");
      setShowManualInput(true);
    }
  };

  useEffect(() => {
    requestMicPermissions();

    return () => {
      stopAudioOutput();
      if (silenceCheckIntervalRef.current) {
        clearInterval(silenceCheckIntervalRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onstart = null;
          recognitionRef.current.onend = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.onresult = null;
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  const handleToggleMuteState = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    if (nextMuted) {
      setCallState("muted");
      setCurrentPrompt("Microphone feed paused.");
      stopAudioOutput();
      stopListeningEngine();
    } else {
      setCallState("listening");
      setCurrentPrompt("");
      if (hasPermission === false) {
        requestMicPermissions();
      } else {
        startListeningEngine();
      }
    }
  };

  const handleFormQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualQuery.trim()) return;
    const query = manualQuery;
    setManualQuery("");
    queryAIModelAsync(query);
  };

  // Format second metrics cleanly
  const formatSecs = (totalSecs: number) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full bg-[#050507] text-zinc-100 font-sans relative overflow-hidden">
      
      {/* Background radial ambiance styling */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.06),transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.03),transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.02),transparent_50%)] pointer-events-none" />

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-40" />

      {/* LEFT PANE (STATIC CONTROL CENTRE & HOLOGRAPHIC ORB) */}
      <div className="w-full md:w-[42%] flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/[0.04] bg-[#070709]/80 p-6 shrink-0 relative z-20 backdrop-blur-3xl animate-fadeIn">
        
        {/* UPPER HEADER SECTION */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              stopAudioOutput();
              onReturnToMain();
            }}
            className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.05] text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95"
            title="Leave voice and return"
            id="voice-con-return-btn"
          >
            <ArrowLeft size={16} />
          </button>

          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/15 rounded-full shadow-inner select-none">
            <Radio size={12} className={`text-indigo-400 ${callState === "listening" ? "animate-pulse" : ""}`} />
            <span className="text-[10px] font-black tracking-wider text-indigo-300 font-mono uppercase">
              AURYX LIVE CORE
            </span>
          </div>

          <button
            onClick={forceRecalibrateDeviceStream}
            className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all active:scale-95 cursor-pointer bg-white/[0.02] border-white/5 hover:bg-white/[0.05] text-zinc-400 hover:text-white ${isCalibrating ? "animate-spin text-indigo-400" : ""}`}
            title="Recalibrate Voice Engine Channels"
            id="voice-reboot-btn"
          >
            <RefreshCw size={14} />
          </button>
        </div>

        {/* SPEECH ACCENT SELECTOR DECK */}
        <div className="mt-4 p-3.5 bg-[#0b0c10]/70 border border-white/5 rounded-2xl flex flex-col gap-2.5 select-none shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
          <div className="flex items-center justify-between px-1">
            <span className="text-[9px] font-black tracking-wider text-zinc-500 uppercase font-mono">
              Vocal Accent Matcher
            </span>
            <span className="text-[9px] text-[#A1A1AA] font-mono font-bold bg-indigo-500/10 text-indigo-300 px-2.5 py-0.5 rounded-full select-none">
              {accentLanguage === "en-IN" ? "Eng/Hinglish" : accentLanguage === "hi-IN" ? "Hindi हिंदी" : "US English"}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: "en-IN", label: "Hinglish", desc: "Hinglish/India" },
              { id: "hi-IN", label: "Hindi", desc: "Hindi हिंदी" },
              { id: "en-US", label: "English", desc: "US English" },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => handleChangeAccentLanguage(btn.id as any)}
                className={`py-1.5 rounded-xl border text-[11px] font-black transition-all cursor-pointer active:scale-95 ${
                  accentLanguage === btn.id
                    ? "bg-gradient-to-r from-indigo-600 to-indigo-700 border-indigo-500 text-white shadow-[0_0_12px_rgba(99,102,241,0.25)] scale-102"
                    : "bg-[#070709] border-[#18181c] text-zinc-450 hover:text-zinc-200 hover:bg-white/[0.02]"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* HOST CONVERSATION ORB FOCUS AREA */}
        <div className="my-auto py-8 flex flex-col items-center justify-center">
          
          <div className="relative flex items-center justify-center w-56 h-56">
            
            {/* Pulsing light rings around center */}
            <motion.div 
              animate={{
                scale: callState === "listening" ? [1.15, 1.35, 1.15] :
                       callState === "speaking" ? [1.25, 1.45, 1.25] :
                       callState === "thinking" ? [1.1, 1.2, 1.1] : 1.0,
                opacity: [0.15, 0.35, 0.15]
              }}
              transition={{
                duration: callState === "listening" ? 1.5 : 2.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className={`absolute inset-0 rounded-full bg-gradient-to-tr transition-all duration-1000 ${
                callState === "listening" ? "from-indigo-500/25 to-transparent blur-3xl opacity-100" :
                callState === "speaking" ? "from-emerald-500/35 to-transparent blur-3xl opacity-100" :
                callState === "thinking" ? "from-amber-500/25 to-transparent blur-3xl opacity-90" : 
                "from-zinc-500/5 to-transparent blur-2xl opacity-20"
              }`} 
            />

            <motion.div 
              animate={{
                rotate: callState === "thinking" ? 360 : 0
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear"
              }}
              className={`absolute inset-2 rounded-full border transition-all duration-700 ${
                callState === "listening" ? "border-indigo-500/30 scale-105 border-dashed" :
                callState === "speaking" ? "border-emerald-500/50 scale-110 animate-pulse" :
                callState === "thinking" ? "border-amber-500/40 scale-102 border-dashed" :
                "border-white/[0.02] scale-95"
              }`} 
            />

            <div className={`absolute inset-6 rounded-full border transition-all duration-300 ${
              callState === "listening" ? "border-indigo-500/15 scale-100 animate-pulse" :
              callState === "speaking" ? "border-emerald-500/20 scale-105" :
              callState === "thinking" ? "border-amber-500/15 scale-103" :
              "border-white/[0.01]"
            }`} />

            {/* Glowing holographic sphere button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleToggleMuteState}
              className={`w-38 h-38 rounded-full flex flex-col items-center justify-center relative cursor-pointer outline-none select-none transition-all duration-500 border ${
                callState === "listening"
                  ? "bg-gradient-to-b from-[#0b0c16] to-[#05060c] border-indigo-500/45 text-indigo-300 shadow-[0_0_60px_rgba(99,102,241,0.25)]"
                  : callState === "speaking"
                  ? "bg-gradient-to-b from-[#08120e] to-[#030605] border-emerald-500/45 text-emerald-300 shadow-[0_0_60px_rgba(16,185,129,0.25)]"
                  : callState === "thinking"
                  ? "bg-gradient-to-b from-[#141009] to-[#050402] border-amber-500/45 text-amber-300 shadow-[0_0_60px_rgba(245,158,11,0.25)]"
                  : "bg-zinc-900/90 border-zinc-755 text-zinc-500 shadow-[0_0_30px_rgba(0,0,0,0.5)]"
              }`}
              id="voice-hologram-sphere"
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/[0.04] to-transparent pointer-events-none" />
              
              <AnimatePresence mode="wait">
                <motion.div 
                  key={callState}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center justify-center gap-2 z-10 text-center px-4"
                >
                  {callState === "connecting" && (
                    <Loader2 size={32} className="animate-spin text-zinc-400" />
                  )}
                  {callState === "listening" && (
                    <>
                      <Mic size={32} className="animate-pulse text-indigo-300" />
                      <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#a3abf1]">Listening</span>
                    </>
                  )}
                  {callState === "speaking" && (
                    <>
                      <Volume2 size={32} className="animate-bounce text-emerald-300" />
                      <span className="text-[10px] uppercase font-extrabold tracking-widest text-emerald-300 font-sans">Speaking</span>
                    </>
                  )}
                  {callState === "thinking" && (
                    <>
                      <Loader2 size={32} className="animate-spin text-amber-400" />
                      <span className="text-[10px] uppercase font-extrabold tracking-widest text-amber-400 font-mono">Thinking</span>
                    </>
                  )}
                  {callState === "muted" && (
                    <>
                      <MicOff size={32} className="text-zinc-500" />
                      <span className="text-[10px] uppercase font-extrabold tracking-widest text-zinc-500 font-mono">Standby</span>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.button>
          </div>

          {/* Active wave signals */}
          <div className="h-6 mt-6 flex items-center justify-center">
            {callState !== "muted" && callState !== "connecting" ? (
              <div className="flex items-center gap-1.5 h-4 select-none">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((idx) => {
                  const hList = ["h-1.5", "h-3.5", "h-2", "h-5", "h-4", "h-2.5", "h-1.5", "h-3", "h-2"];
                  return (
                    <div
                      key={idx}
                      style={{ animationDelay: `${idx * 0.08}s` }}
                      className={`w-[3px] rounded-full transition-all duration-300 animate-[pulse_1s_infinite] ${
                        callState === "speaking" ? "bg-emerald-400 h-6" :
                        callState === "thinking" ? "bg-amber-400 h-2.5 animate-bounce" :
                        "bg-indigo-400/50 " + hList[idx % hList.length]
                      }`}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="h-[2px] w-16 bg-zinc-800 rounded-full" />
            )}
          </div>

          <div className="text-center mt-6 px-4 select-none flex flex-col gap-1.5 items-center">
            <span className="text-[10px] text-zinc-500 font-extrabold tracking-wider font-mono uppercase">
              ACTIVE STATE: <span className={
                callState === "listening" ? "text-indigo-400" :
                callState === "speaking" ? "text-emerald-400" :
                callState === "thinking" ? "text-amber-400" : "text-zinc-450"
              }>{callState}</span>
            </span>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[9.5px] font-extrabold text-emerald-400 select-none shadow-[0_0_10px_rgba(16,185,129,0.1)]">
              <Sparkles size={9} className="animate-spin text-emerald-400" style={{ animationDuration: "3s" }} />
              <span>GOOGLE SEARCH GROUNDING ACTIVE</span>
            </div>
          </div>

        </div>

        {/* LOWER STATE METRICS */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/[0.04] text-center bg-[#09090b]/40 rounded-xl p-3 select-text font-mono">
          <div>
            <span className="block text-[8px] uppercase tracking-wider text-zinc-500">Duration</span>
            <span className="text-xs font-bold text-zinc-300 flex items-center justify-center gap-1 mt-0.5">
              <Clock size={10} className="text-zinc-500" />
              {formatSecs(sessionDuration)}
            </span>
          </div>
          <div>
            <span className="block text-[8px] uppercase tracking-wider text-zinc-500">Words</span>
            <span className="text-xs font-bold text-zinc-300 mt-0.5 block">
              {wordsCount}
            </span>
          </div>
          <div>
            <span className="block text-[8px] uppercase tracking-wider text-zinc-500">Engine</span>
            <span className="text-xs font-bold text-[#b4bcff] mt-0.5 block uppercase truncate">
              {activeProvider}
            </span>
          </div>
        </div>

      </div>

      {/* RIGHT PANE (SCROLLABLE RECIPIENT LIST & CHAT ENGINE) */}
      <div className="flex-1 flex flex-col justify-between h-full bg-[#08080a] relative z-10 overflow-hidden select-text animate-fadeIn">
        
        {/* UPPER STATUS STRIP */}
        <div className="h-16 border-b border-white/[0.04] px-6 flex items-center justify-between shrink-0 bg-[#070709]/90 backdrop-blur-md">
          <div className="flex items-center gap-2 select-none">
            <Cpu size={14} className="text-zinc-500 animate-pulse" />
            <span className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase font-mono">
              Model Stream: <span className="text-indigo-300 font-black">{activeModel}</span>
            </span>
          </div>

          <button
            onClick={() => {
              textInputRef.current?.focus();
            }}
            className="px-3.5 py-1.5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 text-indigo-300 hover:border-indigo-500/40 hover:bg-indigo-500/10 text-[11px] font-black tracking-wide flex items-center gap-1.5 transition-all select-none active:scale-95 cursor-pointer"
            id="voice-keyboard-mode-trigger"
          >
            <Keyboard size={13} />
            <span>Likhkar Poochhein / Type query</span>
          </button>
        </div>

        {/* MAIN DIALOG FLOW ZONE - EXTREMELY STABLE CENTRAL SCROLL */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 scrollbar-thin select-text" id="live-convo-viewport-pane">
          
          <div className="flex items-center justify-center select-none py-1.5 border-b border-dashed border-white/[0.04]">
            <span className="text-[10px] text-indigo-400/50 font-mono tracking-widest uppercase">
              === SECURE AUDIO STREAM ESTABLISHED ===
            </span>
          </div>

          {chatHistory.length <= 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pb-3 pt-1 select-none">
              {[
                { text: "What is the weather today?", label: "Live Weather Google 🌐", desc: "Searches the web in real-time" },
                { text: "Tell me the latest technology news.", label: "Live Tech News 📰", desc: "Pulls recent web articles" },
                { text: "Evaluate 450 * (15 + 25) / 2", label: "Instant Math Solver 🧮", desc: "Computes precise mathematics" },
                { text: "Explain React useEffect simply.", label: "Boilerplate/Concept 💻", desc: "Speaks clean code explanations" },
              ].map((chip) => (
                <button
                  key={chip.text}
                  type="button"
                  onClick={() => queryAIModelAsync(chip.text)}
                  className="text-left p-3.5 rounded-xl bg-[#0c0c0e]/80 hover:bg-[#121215] border border-white/[0.04] hover:border-indigo-500/30 transition-all duration-300 cursor-pointer group active:scale-[0.98] shadow-sm flex flex-col gap-1 text-zinc-100"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-black text-indigo-300 group-hover:text-indigo-200 transition-colors uppercase font-mono tracking-wider">
                      {chip.label}
                    </span>
                    <span className="text-[9px] text-zinc-650 font-mono group-hover:text-zinc-500 font-bold uppercase">Tap</span>
                  </div>
                  <p className="text-[11px] text-zinc-350 font-medium leading-normal line-clamp-1">{chip.text}</p>
                </button>
              ))}
            </div>
          )}

          {chatHistory.map((item) => (
            <div 
              key={item.id} 
              className={`flex flex-col max-w-[85%] sm:max-w-[78%] ${item.role === 'user' ? 'ml-auto items-end animate-fadeUp' : 'mr-auto items-start animate-fadeUp'}`}
            >
              <div className={`px-4.5 py-3.5 rounded-2xl text-[13px] leading-relaxed shadow-lg border transition-all duration-300 ${
                item.role === 'user' 
                  ? 'bg-[#18181b]/95 hover:bg-[#18181b] border-indigo-500/10 text-indigo-100 rounded-tr-none shadow-[0_4px_20px_rgba(0,0,0,0.35)]' 
                  : 'bg-[#0c0c0e] hover:bg-[#0c0c0e]/80 border-white/[0.03] text-zinc-300 rounded-tl-none border-l-4 border-l-indigo-500 shadow-[0_4px_15px_rgba(0,0,0,0.4)]'
              }`}>
                {item.text}
              </div>
              <span className="text-[9.5px] text-zinc-500 mt-2 font-mono tracking-wider flex items-center gap-1.5 px-1.5 select-none">
                <span className={`w-1.5 h-1.5 rounded-full ${item.role === 'user' ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
                <span>{item.timestamp}</span>
                <span className="text-zinc-750 font-bold">•</span>
                <span className="font-extrabold text-[#A1A1AA]">{item.role === 'user' ? 'You' : 'Auryx AI'}</span>
              </span>
            </div>
          ))}
          
          {/* Real-time active utterance feedback loader inside the scroll zone */}
          {currentPrompt && (
            <div className="flex flex-col items-end max-w-[82%] ml-auto anim-fade-in pr-1.5">
              <div className="px-4 py-3 rounded-2xl text-[13px] bg-indigo-500/[0.03] text-indigo-300 border border-dashed border-indigo-500/20 rounded-tr-none">
                {currentPrompt}
              </div>
              <span className="text-[9px] text-indigo-400/60 mt-1.5 font-mono tracking-wider animate-pulse flex items-center gap-1.5 select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                <span>Calibrating word boundaries...</span>
              </span>
            </div>
          )}

          {/* Anchor to scroll smoothly */}
          <div ref={historyScrollEndRef} />
        </div>

        {/* INPUT AND FOOTER DECK WITH SAFE CONTROLS */}
        <div className="p-6 border-t border-white/[0.04] bg-[#070709]/95 backdrop-blur-md sticky bottom-0 shrink-0 select-none">
          <div className="max-w-xl mx-auto flex flex-col gap-4">
            
            {/* Permanent direct manual message typing console */}
            <form onSubmit={handleFormQuerySubmit} className="w-full bg-[#0c0c0e] border border-white/[0.05] rounded-xl p-1.5 flex items-center gap-2 shadow-xl focus-within:border-indigo-500/40 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all anim-fade-in shrink-0">
              <input
                ref={textInputRef}
                type="text"
                value={manualQuery}
                onChange={(e) => setManualQuery(e.target.value)}
                placeholder="Yahan apna sawal likhein... / Type your message here..."
                className="flex-1 bg-transparent px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 outline-none select-text border-none"
              />
              <button
                type="submit"
                className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all active:scale-95 shrink-0 hover:scale-105 cursor-pointer"
                title="Send query"
              >
                <Send size={13} />
              </button>
            </form>

            {/* DIRECT ACTION TRIGGERS */}
            <div className="flex items-center gap-4">
              
              {/* Standby toggle microphone hook */}
              <button
                onClick={handleToggleMuteState}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border cursor-pointer active:scale-95 ${
                  isMuted
                    ? "bg-red-500/10 hover:bg-red-500/15 text-red-400 border-red-500/25 shadow-[0_0_15px_rgba(239,68,68,0.15)]"
                    : "bg-white/[0.02] hover:bg-white/[0.05] text-zinc-300 hover:text-white border-white/10"
                }`}
                title="Pause / Resume voice audio recording channels"
                id="voice-mute-hook"
              >
                {isMuted ? (
                  <>
                    <MicOff size={14} />
                    <span>UNMUTE MICROPHONE</span>
                  </>
                ) : (
                  <>
                    <Mic size={14} className="text-indigo-400 animate-pulse" />
                    <span>MUTE MICROPHONE</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  stopAudioOutput();
                  onReturnToMain();
                }}
                className="py-3 px-6 rounded-xl bg-red-650 hover:bg-red-600 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shrink-0 shadow-md hover:scale-102"
                id="voice-end-hook"
              >
                <PhoneOff size={14} />
                <span>LEAVE STREAM</span>
              </button>
            </div>

            <div className="text-center">
              <span className="text-[9px] text-[#A1A1AA]/25 font-mono tracking-widest leading-none block font-semibold">
                AURYX CORE SECURE AUDIO OVERLAY // REGISTERED LICENSE ENTERPRISE SYSTEM
              </span>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
