import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Pause, RotateCcw, Plus, Clock, Timer, Bell, Trash2 } from "lucide-react";

interface LapItem {
  id: number;
  total: number;
  split: number;
}

interface AlarmItem {
  time: string;
  label: string;
  days: string;
  on: boolean;
}

interface TimerViewProps {
  onAddToast: (msg: string, type?: "success" | "error" | "info" | "warn") => void;
}

export const TimerView: React.FC<TimerViewProps> = ({ onAddToast }) => {
  const [tab, setTab] = useState<"sw" | "cd" | "al" | "wc">("sw");

  // --- Stopwatch ---
  const [swRun, setSwRun] = useState(false);
  const [swEl, setSwEl] = useState(0);
  const [swLaps, setSwLaps] = useState<LapItem[]>([]);
  const swStartTimeRef = useRef(0);
  const swTimerIdRef = useRef<number | null>(null);

  // --- Countdown Timer ---
  const [cdRun, setCdRun] = useState(false);
  const [cdTot, setCdTot] = useState(0); // in ms
  const [cdRem, setCdRem] = useState(0); // in ms
  const [cdMinInp, setCdMinInp] = useState("");
  const [cdSecInp, setCdSecInp] = useState("");
  const cdTimerIdRef = useRef<number | null>(null);
  const cdStartTimeRef = useRef(0);

  // --- Alarms ---
  const [alarms, setAlarms] = useState<AlarmItem[]>(() => {
    try {
      const cached = localStorage.getItem("nx_alarms_v3");
      return cached ? JSON.parse(cached) : [
        { time: "07:00", label: "Morning Grind", days: "Weekdays", on: true },
        { time: "22:00", label: "Cool Down", days: "Every day", on: false }
      ];
    } catch {
      return [];
    }
  });
  const [showAlModal, setShowAlModal] = useState(false);
  const [newAlTime, setNewAlTime] = useState("");
  const [newAlLabel, setNewAlLabel] = useState("");
  const [newAlDays, setNewAlDays] = useState("Once");

  // --- World Clock Tick ---
  const [wcTick, setWcTick] = useState(Date.now());

  // Cached Alarm Persistence Handler
  useEffect(() => {
    try {
      localStorage.setItem("nx_alarms_v3", JSON.stringify(alarms));
    } catch {
      // transient fail
    }
  }, [alarms]);

  // World clock trigger
  useEffect(() => {
    const id = setInterval(() => setWcTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Beeper Synthesizer Utility
  const playBuzzer = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      // Play 3 rapid clear beeps
      const now = ctx.currentTime;
      [0, 0.2, 0.4].forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, now + delay);
        gain.gain.setValueAtTime(0.2, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.15);
        
        osc.start(now + delay);
        osc.stop(now + delay + 0.15);
      });
    } catch {
      // browser blocked audio or not supported
    }
  };

  // Cron Check for active Alarms (checks once a minute)
  useEffect(() => {
    const checkAlarms = () => {
      const d = new Date();
      const currentHrMin = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
      
      alarms.forEach((al) => {
        if (al.on && al.time === currentHrMin) {
          onAddToast(`🔔 Alarm: ${al.label}!`, "info");
          playBuzzer();
        }
      });
    };

    const d = new Date();
    const msToNextMin = (60 - d.getSeconds()) * 1000 - d.getMilliseconds();
    
    let subTimeoutId = setTimeout(() => {
      checkAlarms();
      const minIntervalId = setInterval(checkAlarms, 60000);
      return () => clearInterval(minIntervalId);
    }, msToNextMin);

    return () => clearTimeout(subTimeoutId);
  }, [alarms, onAddToast]);

  // Stopwatch timer controller
  useEffect(() => {
    if (swRun) {
      swStartTimeRef.current = Date.now() - swEl;
      const runStopwatch = () => {
        setSwEl(Date.now() - swStartTimeRef.current);
        swTimerIdRef.current = requestAnimationFrame(runStopwatch);
      };
      swTimerIdRef.current = requestAnimationFrame(runStopwatch);
    } else {
      if (swTimerIdRef.current !== null) {
        cancelAnimationFrame(swTimerIdRef.current);
        swTimerIdRef.current = null;
      }
    }
    return () => {
      if (swTimerIdRef.current !== null) {
        cancelAnimationFrame(swTimerIdRef.current);
      }
    };
  }, [swRun]);

  // Countdown controller
  useEffect(() => {
    if (cdRun && cdRem > 0) {
      cdStartTimeRef.current = Date.now();
      const currentRemaining = cdRem;
      
      cdTimerIdRef.current = window.setInterval(() => {
        const delta = Date.now() - cdStartTimeRef.current;
        const newRem = Math.max(0, currentRemaining - delta);
        setCdRem(newRem);
        
        if (newRem <= 0) {
          setCdRun(false);
          if (cdTimerIdRef.current !== null) {
            clearInterval(cdTimerIdRef.current);
            cdTimerIdRef.current = null;
          }
          onAddToast("⏳ Countdown Alarm Reached!", "success");
          playBuzzer();
        }
      }, 100);
    } else {
      if (cdTimerIdRef.current !== null) {
        clearInterval(cdTimerIdRef.current);
        cdTimerIdRef.current = null;
      }
    }
    return () => {
      if (cdTimerIdRef.current !== null) {
        clearInterval(cdTimerIdRef.current);
      }
    };
  }, [cdRun, cdRem]);

  // --- Stopwatch Methods ---
  const handleSwStart = () => setSwRun(true);
  const handleSwPause = () => setSwRun(false);
  const handleSwReset = () => {
    setSwRun(false);
    setSwEl(0);
    setSwLaps([]);
  };
  const handleSwLap = () => {
    const currentTot = swEl;
    const lastLapTot = swLaps.length > 0 ? swLaps[0].total : 0;
    const newLap: LapItem = {
      id: swLaps.length + 1,
      total: currentTot,
      split: currentTot - lastLapTot
    };
    setSwLaps((prev) => [newLap, ...prev]);
  };

  const formatStopwatch = (ms: number) => {
    const hrs = ~~(ms / 3600000);
    const mins = ~~((ms % 3600000) / 60000);
    const secs = ~~((ms % 60000) / 1000);
    const centis = ~~((ms % 1000) / 10);
    
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${centis.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${centis.toString().padStart(2, "0")}`;
  };

  // --- Countdown Methods ---
  const handleCdSetPres = (minutes: number) => {
    setCdRun(false);
    const ms = minutes * 60000;
    setCdTot(ms);
    setCdRem(ms);
  };

  const handleCdStart = () => {
    if (!cdRun && cdRem === 0) {
      const mVal = parseInt(cdMinInp) || 0;
      const sVal = parseInt(cdSecInp) || 0;
      const ms = (mVal * 60 + sVal) * 1000;
      if (ms > 0) {
        setCdTot(ms);
        setCdRem(ms);
        setCdRun(true);
      }
    } else if (cdRem > 0) {
      setCdRun(true);
    }
  };

  const handleCdPause = () => setCdRun(false);
  const handleCdReset = () => {
    setCdRun(false);
    setCdRem(cdTot);
  };

  const formatCountdown = (ms: number) => {
    const mins = ~~(ms / 60000);
    const secs = ~~((ms % 60000) / 1000);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // --- Alarm Methods ---
  const handleAddAlarm = () => {
    if (!newAlTime) {
      onAddToast("Please provide a valid time", "warn");
      return;
    }
    const nextArr: AlarmItem = {
      time: newAlTime,
      label: newAlLabel.trim() || "Workspace Alarm",
      days: newAlDays,
      on: true
    };
    setAlarms((prev) => [...prev, nextArr]);
    setShowAlModal(false);
    setNewAlTime("");
    setNewAlLabel("");
    onAddToast(`Alarm set for ${newAlTime}`, "success");
  };

  const toggleAlarmStatus = (index: number) => {
    setAlarms((prev) => {
      const copy = [...prev];
      if (copy[index]) {
        copy[index].on = !copy[index].on;
      }
      return copy;
    });
  };

  const deleteAlarm = (index: number) => {
    setAlarms((prev) => prev.filter((_, idx) => idx !== index));
    onAddToast("Alarm removed", "info");
  };

  // --- World Clock Formatting Helpers ---
  const getWorldClockValues = () => {
    const cities = [
      { name: "New York", icon: <span className="px-2 py-0.5 rounded text-[8.5px] font-mono font-black bg-blue-500/10 text-blue-400 border border-blue-500/15">NYC</span>, tz: "America/New_York" },
      { name: "London", icon: <span className="px-2 py-0.5 rounded text-[8.5px] font-mono font-black bg-purple-500/10 text-purple-400 border border-purple-500/15">LON</span>, tz: "Europe/London" },
      { name: "Paris", icon: <span className="px-2 py-0.5 rounded text-[8.5px] font-mono font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/15">PAR</span>, tz: "Europe/Paris" },
      { name: "Dubai", icon: <span className="px-2 py-0.5 rounded text-[8.5px] font-mono font-black bg-red-500/10 text-red-500 border border-red-500/15">DXB</span>, tz: "Asia/Dubai" },
      { name: "Mumbai", icon: <span className="px-2 py-0.5 rounded text-[8.5px] font-mono font-black bg-teal-500/10 text-teal-400 border border-teal-500/15">BOM</span>, tz: "Asia/Kolkata" },
      { name: "Tokyo", icon: <span className="px-2 py-0.5 rounded text-[8.5px] font-mono font-black bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/15">TYO</span>, tz: "Asia/Tokyo" },
      { name: "Sydney", icon: <span className="px-2 py-0.5 rounded text-[8.5px] font-mono font-black bg-amber-500/10 text-amber-500 border border-amber-500/15">SYD</span>, tz: "Australia/Sydney" },
      { name: "Los Angeles", icon: <span className="px-2 py-0.5 rounded text-[8.5px] font-mono font-black bg-cyan-500/10 text-cyan-400 border border-cyan-500/15">LAX</span>, tz: "America/Los_Angeles" },
    ];

    return cities.map((c) => {
      let timeStr = "--:--:--";
      let dateStr = "Loading";
      try {
        timeStr = new Date(wcTick).toLocaleTimeString("en-US", {
          timeZone: c.tz,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false
        });
        dateStr = new Date(wcTick).toLocaleDateString("en-US", {
          timeZone: c.tz,
          weekday: "short",
          month: "short",
          day: "numeric"
        });
      } catch {
        // error formatting timezone
      }
      return { ...c, timeStr, dateStr };
    });
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 flex flex-col font-sans max-w-xl mx-auto w-full animate-fadeUp select-none">
      {/* Tab Selectors */}
      <div className="flex bg-[#0a0a0d] border border-white/5 p-0.5 rounded-xl mb-6 text-xs font-semibold w-full font-sans">
        <button
          onClick={() => setTab("sw")}
          className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            tab === "sw" ? "bg-white/5 text-white border border-white/5 shadow-sm" : "text-zinc-500 hover:text-white"
          }`}
        >
          <Timer size={13} />
          <span>Stopwatch</span>
        </button>
        <button
          onClick={() => setTab("cd")}
          className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            tab === "cd" ? "bg-white/5 text-white border border-white/5 shadow-sm" : "text-zinc-500 hover:text-white"
          }`}
        >
          <Clock size={13} />
          <span>Countdown</span>
        </button>
        <button
          onClick={() => setTab("al")}
          className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            tab === "al" ? "bg-white/5 text-white border border-white/5 shadow-sm" : "text-zinc-500 hover:text-white"
          }`}
        >
          <Bell size={13} />
          <span>Alarms</span>
        </button>
        <button
          onClick={() => setTab("wc")}
          className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            tab === "wc" ? "bg-white/5 text-white border border-white/5 shadow-sm" : "text-zinc-500 hover:text-white"
          }`}
        >
          <Clock size={13} />
          <span>World Clock</span>
        </button>
      </div>

      {/* Wrap tab components in AnimatePresence for state-shifting choreography */}
      <AnimatePresence mode="wait">
        {/* stopwatch mode view */}
        {tab === "sw" && (
          <motion.div
            key="sw"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="flex flex-col items-center w-full"
          >
            <div className={`text-5xl font-extralight font-mono tracking-tight my-8 ${swRun ? "text-[var(--accent)]" : "text-white"}`}>
              {formatStopwatch(swEl)}
            </div>

            <div className="flex gap-2.5 justify-center w-full mb-6 font-sans">
              <button
                onClick={swRun ? handleSwPause : handleSwStart}
                className={`flex-1 py-12 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  swRun
                    ? "bg-transparent text-white border-white/5 hover:bg-white/5 shadow-sm"
                    : "bg-[var(--accent)] text-white border-transparent hover:brightness-110 shadow-md shadow-[var(--accent-glow)]"
                }`}
                style={{ padding: "10px" }}
              >
                {swRun ? <Pause size={12} /> : <Play size={12} />}
                <span>{swRun ? "Pause" : "Start"}</span>
              </button>
              <button
                onClick={handleSwLap}
                disabled={!swRun}
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-transparent text-white border border-white/5 hover:bg-white/5 disabled:opacity-20 disabled:pointer-events-none transition-all cursor-pointer"
              >
                Lap
              </button>
              <button
                onClick={handleSwReset}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-transparent text-red-400 border border-red-500/10 hover:bg-red-500/5 transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            </div>

            {/* stopwatch Lap Feed */}
            <div className="w-full border border-white/5 rounded-2xl overflow-hidden bg-[#0a0a0d]">
              <div className="px-4 py-3 bg-[#0c0c0f] border-b border-white/5 text-[9px] font-black text-zinc-500 uppercase tracking-widest flex justify-between">
                <span>Lap</span>
                <span>Split Time</span>
                <span>Aggregate Total</span>
              </div>
              <div className="max-h-[220px] overflow-y-auto divide-y divide-white/5 scrollbar-thin">
                {swLaps.length === 0 ? (
                  <div className="py-10 text-center text-xs text-zinc-650 italic text-zinc-600 font-medium">
                    No registered lap times
                  </div>
                ) : (
                  <AnimatePresence>
                    {swLaps.map((l) => (
                      <motion.div 
                        key={l.id} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 350, damping: 25 }}
                        className="px-4 py-2.5 flex justify-between items-center text-xs font-mono hover:bg-white/[0.01] transition-colors"
                      >
                        <span className="text-zinc-500 font-bold">Lap {l.id}</span>
                        <span className="text-[#FAFAFA]">{formatStopwatch(l.split)}</span>
                        <span className="text-[var(--accent)] font-bold">{formatStopwatch(l.total)}</span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* countdown mode view */}
        {tab === "cd" && (
          <motion.div
            key="cd"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="flex flex-col items-center w-full"
          >
            {/* Quick timing triggers */}
            <div className="flex flex-wrap gap-1.5 justify-center mb-6">
              {[1, 3, 5, 10, 15, 25, 30, 45, 60].map((mVal) => (
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.94 }}
                  key={mVal}
                  onClick={() => handleCdSetPres(mVal)}
                  className="px-3 py-1 rounded-full border border-white/5 bg-[#0a0a0d] hover:bg-[#121216] hover:border-[var(--accent)]/40 text-zinc-400 hover:text-[var(--accent)] transition-all text-[11px] font-mono cursor-pointer font-bold"
                >
                  {mVal}m
                </motion.button>
              ))}
            </div>

            {/* Visual vector circular remaining path ring with interactive spring pulsing */}
            <motion.div 
              animate={{ scale: cdRun ? [1, 1.015, 1] : 1 }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="relative w-44 h-44 mb-6"
            >
              <svg className="transform -rotate-90" width="176" height="176" viewBox="0 0 176 176">
                <circle className="stroke-white/5" strokeWidth="5" fill="transparent" cx="88" cy="88" r="80" />
                <circle
                  className="stroke-[var(--accent)] transition-all duration-300"
                  strokeWidth="5"
                  strokeDasharray={2 * Math.PI * 80}
                  // SVG Progress Percentage representation
                  strokeDashoffset={
                    2 * Math.PI * 80 * (cdTot > 0 ? 1 - cdRem / cdTot : 0)
                  }
                  strokeLinecap="round"
                  fill="transparent"
                  cx="88"
                  cy="88"
                  r="80"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-3xl font-light font-mono text-white">
                  {formatCountdown(cdRem)}
                </div>
                <span className="text-[8px] text-[var(--accent)] uppercase font-black tracking-widest mt-1.5">
                  {cdRun ? "Active" : cdRem === 0 && cdTot > 0 ? "Complete" : "Pending"}
                </span>
              </div>
            </motion.div>

            {/* Controls line */}
            <div className="flex gap-2 items-center justify-center mb-6 w-full max-w-[280px]">
              <input
                type="number"
                value={cdMinInp}
                onChange={(e) => {
                  setCdMinInp(e.target.value);
                  setCdTot(0);
                  setCdRem(0);
                }}
                placeholder="Min"
                className="w-16 p-2 text-center bg-[#0a0a0d] border border-white/5 rounded-xl text-sm text-white font-sans outline-none focus:border-[var(--accent)] shrink-0 font-bold"
              />
              <span className="text-lg text-zinc-600 font-mono">:</span>
              <input
                type="number"
                value={cdSecInp}
                onChange={(e) => {
                  setCdSecInp(e.target.value);
                  setCdTot(0);
                  setCdRem(0);
                }}
                placeholder="Sec"
                className="w-16 p-2 text-center bg-[#0a0a0d] border border-white/5 rounded-xl text-sm text-white font-sans outline-none focus:border-[var(--accent)] shrink-0 font-bold"
                min="0"
                max="59"
              />
            </div>

            <div className="flex gap-2.5 justify-center w-full font-sans">
              <button
                onClick={cdRun ? handleCdPause : handleCdStart}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  cdRun
                    ? "bg-transparent text-white border-white/5 hover:bg-white/5 shadow-sm"
                    : "bg-[var(--accent)] text-white border-transparent hover:brightness-110 shadow-md shadow-[var(--accent-glow)]"
                }`}
              >
                {cdRun ? <Pause size={12} /> : <Play size={12} />}
                <span>{cdRun ? "Pause" : "Start"}</span>
              </button>
              <button
                onClick={handleCdReset}
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-transparent text-white border border-white/5 hover:bg-white/5 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Alarm Schedules tab */}
        {tab === "al" && (
          <motion.div
            key="al"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="flex flex-col flex-1 font-sans w-full"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4 select-none">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Configured Timers</span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAlModal(true)}
                className="px-3 py-1.5 bg-[var(--accent)] text-white text-[11px] font-bold rounded-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
              >
                <Plus size={12} />
                <span>Add Alarm</span>
              </motion.button>
            </div>

            <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[300px] scrollbar-thin">
              {alarms.length === 0 ? (
                <div className="text-center text-xs text-zinc-600/60 py-12 italic">
                  No active alarm triggers configured
                </div>
              ) : (
                <AnimatePresence>
                  {alarms.map((al, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, height: 0, overflow: "hidden" }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-4 p-3.5 bg-[#0c0c0f]/80 border border-white/5 rounded-xl shadow-md transition-all hover:border-[var(--accent)]/20"
                    >
                      <div className="text-2xl font-light font-mono text-white leading-none">
                        {al.time}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-white truncate">
                          {al.label}
                        </div>
                        <div className="text-[10.5px] text-zinc-500 mt-0.5 font-medium">
                          {al.days}
                        </div>
                      </div>

                      {/* Slider styled toggle */}
                      <div
                        onClick={() => toggleAlarmStatus(idx)}
                        className={`w-9 h-5 rounded-full cursor-pointer relative border transition-colors ${
                          al.on
                            ? "bg-[var(--accent)] border-[var(--accent)]"
                            : "bg-zinc-900 border-white/5"
                        }`}
                      >
                        <motion.div
                          layout
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                          className={`absolute w-3.5 h-3.5 rounded-full bg-white top-[2px] ${
                            al.on ? "right-[2px]" : "left-[2px]"
                          }`}
                        />
                      </div>

                      {/* Removing block */}
                      <button
                        onClick={() => deleteAlarm(idx)}
                        className="p-1.5 hover:bg-red-500/10 rounded-lg text-red-400 hover:text-red-300 transition-colors flex items-center justify-center cursor-pointer"
                        title="Remove alarm"
                      >
                        <Trash2 size={13} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Alarm modal helper */}
            <AnimatePresence>
              {showAlModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1000] flex items-center justify-center px-4">
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 355, damping: 26 }}
                    className="w-full max-w-[340px] p-5 bg-[#0e0e11] border border-white/5 rounded-2xl shadow-2xl flex flex-col gap-4 font-sans"
                  >
                    <div className="text-xs font-extrabold text-white border-b border-white/5 pb-2.5 uppercase tracking-wider">
                      Create New Cron Alarm
                    </div>

                    <div className="flex flex-col gap-3.5 text-xs">
                      <div>
                        <label className="text-zinc-500 font-bold block mb-1">Trigger Alarm Time</label>
                        <input
                          type="time"
                          value={newAlTime}
                          onChange={(e) => setNewAlTime(e.target.value)}
                          className="w-full p-2 bg-zinc-950/60 border border-white/5 rounded-lg text-white font-sans outline-none focus:border-[var(--accent)] text-sm shrink-0"
                        />
                      </div>

                      <div>
                        <label className="text-zinc-500 font-bold block mb-1">Brief Label</label>
                        <input
                          type="text"
                          value={newAlLabel}
                          onChange={(e) => setNewAlLabel(e.target.value)}
                          placeholder="e.g. Daily Study Grind"
                          className="w-full p-2 bg-zinc-950/60 border border-white/5 rounded-lg text-white font-sans outline-none focus:border-[var(--accent)] text-sm shrink-0 font-medium"
                        />
                      </div>

                      <div>
                        <label className="text-zinc-500 font-bold block mb-1">Repeat Cadence</label>
                        <select
                          value={newAlDays}
                          onChange={(e) => setNewAlDays(e.target.value)}
                          className="w-full p-2 bg-zinc-900 border border-white/5 rounded-lg text-white font-sans outline-none focus:border-[var(--accent)] text-[12px] bg-[rgba(24,24,27,1)] cursor-pointer"
                        >
                          <option>Once</option>
                          <option>Every day</option>
                          <option>Weekdays</option>
                          <option>Weekends</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        onClick={() => setShowAlModal(false)}
                        className="px-3.5 py-1.5 rounded-lg text-xs bg-transparent text-zinc-400 hover:text-white transition-colors cursor-pointer font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddAlarm}
                        className="px-4.5 py-1.5 bg-[var(--accent)] text-white text-xs font-bold rounded-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-md shadow-[var(--accent-glow)]"
                      >
                        Set Trigger
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* World Clock dials */}
        {tab === "wc" && (
          <motion.div
            key="wc"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.05 }
              }
            }}
            className="grid grid-cols-2 gap-3.5 flex-1 max-h-[360px] overflow-y-auto font-sans scrollbar-thin w-full"
          >
            {getWorldClockValues().map((w) => (
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 15, scale: 0.96 },
                  visible: { 
                    opacity: 1, 
                    y: 0, 
                    scale: 1,
                    transition: { type: "spring", stiffness: 180, damping: 18 }
                  }
                }}
                whileHover={{ scale: 1.02, borderColor: "rgba(255, 255, 255, 0.15)" }}
                key={w.name}
                className="p-4 bg-[#0c0c0f]/80 border border-white/5 rounded-2xl flex flex-col items-center justify-center text-center hover:border-white/10 transition-colors shadow-sm cursor-pointer"
              >
                <div className="mb-2 select-none shrink-0">{w.icon}</div>
                <div className="text-[12.5px] font-bold text-white mb-1 tracking-tight">{w.name}</div>
                <div className="text-base font-bold font-mono text-[var(--accent)] mb-0.5 leading-none mt-0.5">
                  {w.timeStr}
                </div>
                <span className="text-[9px] text-zinc-500 font-sans uppercase tracking-widest font-black leading-none mt-1.5">
                  {w.dateStr}
                </span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
