import React, { useState } from "react";

interface HistoryItem {
  e: string;
  r: string;
}

export const CalculatorView: React.FC = () => {
  const [m, setM] = useState<"basic" | "sci" | "prog">("basic");
  const [expr, setExpr] = useState("");
  const [res, setRes] = useState("0");
  const [hist, setHist] = useState<HistoryItem[]>([]);

  const basicKeys = [
    ["C", "←", "%", "÷"],
    ["7", "8", "9", "×"],
    ["4", "5", "6", "−"],
    ["1", "2", "3", "+"],
    ["±", "0", ".", "="]
  ];

  const sciKeys = [
    ["sin", "cos", "tan", "π"],
    ["log", "ln", "√", "x²"],
    ["C", "←", "%", "÷"],
    ["7", "8", "9", "×"],
    ["4", "5", "6", "−"],
    ["1", "2", "3", "+"],
    ["(", "0", ".", "="]
  ];

  const progKeys = [
    ["AND", "OR", "XOR", "NOT"],
    ["C", "←", "%", "÷"],
    ["7", "8", "9", "×"],
    ["4", "5", "6", "−"],
    ["1", "2", "3", "+"],
    ["0", "00", ".", "="]
  ];

  const currentLayout = m === "basic" ? basicKeys : m === "sci" ? sciKeys : progKeys;

  const sanitizeEval = (expression: string) => {
    return expression
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/−/g, "-")
      .replace(/AND/g, "&")
      .replace(/OR/g, "|")
      .replace(/XOR/g, "^")
      .replace(/[^0-9+\-*/.()%&|^~<>]/g, ""); // strictly allow calculator values to avoid insecurity
  };

  const safeEval = (expression: string): number => {
    const clean = expression.replace(/\s+/g, "");
    let pos = 0;

    const parseExpr = (): number => {
      return parseBitwiseOrXor();
    };

    const parseBitwiseOrXor = (): number => {
      let value = parseBitwiseAnd();
      while (pos < clean.length) {
        const op = clean[pos];
        if (op === "|" || op === "^") {
          pos++;
          const nextVal = parseBitwiseAnd();
          value = op === "|" ? (value | nextVal) : (value ^ nextVal);
        } else {
          break;
        }
      }
      return value;
    };

    const parseBitwiseAnd = (): number => {
      let value = parseAddSub();
      while (pos < clean.length) {
        const op = clean[pos];
        if (op === "&") {
          pos++;
          const nextVal = parseAddSub();
          value = value & nextVal;
        } else {
          break;
        }
      }
      return value;
    };

    const parseAddSub = (): number => {
      let value = parseMulDiv();
      while (pos < clean.length) {
        const op = clean[pos];
        if (op === "+" || op === "-") {
          pos++;
          const nextVal = parseMulDiv();
          value = op === "+" ? value + nextVal : value - nextVal;
        } else {
          break;
        }
      }
      return value;
    };

    const parseMulDiv = (): number => {
      let value = parseFactor();
      while (pos < clean.length) {
        const op = clean[pos];
        if (op === "*" || op === "/") {
          pos++;
          const nextVal = parseFactor();
          if (nextVal === 0 && op === "/") throw new Error("Division by zero");
          value = op === "*" ? value * nextVal : value / nextVal;
        } else {
          break;
        }
      }
      return value;
    };

    const parseFactor = (): number => {
      if (pos >= clean.length) return 0;

      if (clean[pos] === "(") {
        pos++; // consume "("
        const val = parseExpr();
        if (clean[pos] === ")") {
          pos++; // consume ")"
        }
        return val;
      }

      let negate = 1;
      if (clean[pos] === "-") {
        negate = -1;
        pos++;
      } else if (clean[pos] === "+") {
        pos++;
      }

      let numStr = "";
      while (pos < clean.length && /[0-9.]/.test(clean[pos])) {
        numStr += clean[pos];
        pos++;
      }

      if (numStr === "") {
        return 0;
      }

      return parseFloat(numStr) * negate;
    };

    try {
      return parseExpr();
    } catch {
      throw new Error("Invalid Expression");
    }
  };

  const formatNum = (n: number): string => {
    if (!isFinite(n)) return "Error";
    return Number.isInteger(n) ? n.toString() : parseFloat(n.toFixed(10)).toString();
  };

  const executeFn = (fnName: string) => {
    try {
      const currentVal = parseFloat(res);
      if (isNaN(currentVal)) return;

      let calculatedValue = 0;
      switch (fnName) {
        case "sin":
          calculatedValue = Math.sin(currentVal);
          break;
        case "cos":
          calculatedValue = Math.cos(currentVal);
          break;
        case "tan":
          calculatedValue = Math.tan(currentVal);
          break;
        case "log":
          calculatedValue = Math.log10(currentVal);
          break;
        case "ln":
          calculatedValue = Math.log(currentVal);
          break;
        case "√":
          calculatedValue = Math.sqrt(currentVal);
          break;
        case "x²":
          calculatedValue = currentVal * currentVal;
          break;
        default:
          return;
      }

      const formatted = formatNum(calculatedValue);
      setHist((prev) => [{ e: `${fnName}(${currentVal})`, r: formatted }, ...prev].slice(0, 20));
      setRes(formatted);
      setExpr("");
    } catch {
      setRes("Error");
    }
  };

  const handlePress = (k: string) => {
    if (k === "C") {
      setExpr("");
      setRes("0");
    } else if (k === "←") {
      const trimmed = expr.slice(0, -1);
      setExpr(trimmed);
      if (!trimmed) setRes("0");
    } else if (k === "=") {
      if (!expr) return;
      try {
        const clean = sanitizeEval(expr);
        const r = safeEval(clean);
        const formatted = formatNum(r);
        setHist((prev) => [{ e: expr, r: formatted }, ...prev].slice(0, 20));
        setRes(formatted);
        setExpr("");
      } catch {
        setRes("Error");
      }
    } else if (k === "±") {
      if (res !== "0" && res !== "Error") {
        setRes((prev) => (parseFloat(prev) * -1).toString());
      }
    } else if (k === "π") {
      setExpr((prev) => prev + "3.14159265359");
    } else if (["sin", "cos", "tan", "log", "ln", "√", "x²"].includes(k)) {
      executeFn(k);
    } else if (k === "%") {
      try {
        const clean = sanitizeEval(expr || res);
        const r = safeEval(clean) / 100;
        setRes(formatNum(r));
        setExpr("");
      } catch {
        setRes("Error");
      }
    } else if (k === "NOT") {
      try {
        const currentVal = parseInt(res);
        if (!isNaN(currentVal)) {
          const bitwiseInverted = (~currentVal).toString();
          setHist((prev) => [{ e: `NOT(${currentVal})`, r: bitwiseInverted }, ...prev].slice(0, 20));
          setRes(bitwiseInverted);
          setExpr("");
        }
      } catch {
        setRes("Error");
      }
    } else {
      const mappedOpMap: Record<string, string> = { "×": "*", "÷": "/", "−": "-" };
      const nextChar = mappedOpMap[k] || k;
      const combined = expr + nextChar;
      setExpr(combined);

      // Instant live evaluation if trailing element is a number
      try {
        const clean = sanitizeEval(combined);
        if (clean && /[0-9)%]$/.test(clean)) {
          const liveVal = safeEval(clean);
          if (isFinite(liveVal)) {
            setRes(formatNum(liveVal));
          }
        }
      } catch {
        // quiet fail on live calculation
      }
    }
  };

  const ops = new Set([
    "+", "-", "×", "÷", "−", "%", "±", "sin", "cos", "tan", "log", "ln", "√", "x²", "π", "AND", "OR", "XOR", "NOT", "("
  ]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 flex flex-col font-sans max-w-xl mx-auto w-full animate-fadeUp select-none">
      {/* Mode Switches */}
      <div className="flex bg-[#0a0a0d] p-0.5 border border-white/5 rounded-xl mb-5 text-xs font-semibold self-center w-full">
        <button
          onClick={() => setM("basic")}
          className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
            m === "basic" ? "bg-white/5 text-white border border-white/5 shadow-sm" : "text-zinc-500 hover:text-white"
          }`}
        >
          Basic
        </button>
        <button
          onClick={() => setM("sci")}
          className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
            m === "sci" ? "bg-white/5 text-white border border-white/5 shadow-sm" : "text-zinc-500 hover:text-white"
          }`}
        >
          Scientific
        </button>
        <button
          onClick={() => setM("prog")}
          className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
            m === "prog" ? "bg-white/5 text-white border border-white/5 shadow-sm" : "text-zinc-500 hover:text-white"
          }`}
        >
          Programmer
        </button>
      </div>

      {/* Screen layout */}
      <div className="bg-[#060608] border border-white/5 rounded-2xl p-5 mb-4.5 flex flex-col items-end min-h-[105px] justify-end shadow-inner select-all relative overflow-hidden group">
        <div className="text-[11px] font-bold text-zinc-500 tracking-wider font-mono h-5 overflow-x-auto overflow-y-hidden text-right w-full whitespace-nowrap scrollbar-none">
          {expr || "\u00a0"}
        </div>
        <div className="text-3xl font-light font-mono text-white overflow-hidden text-ellipsis whitespace-nowrap w-full text-right leading-none mt-1">
          {res}
        </div>
        {/* subtle corner light decoration */}
        <div className="absolute top-0 right-0 w-[60px] h-[60px] bg-gradient-to-br from-[var(--accent)]/[0.04] to-transparent blur-md pointer-events-none" />
      </div>

      {/* Grid Keyboard Layout */}
      <div className="grid grid-cols-4 gap-2 w-full">
        {currentLayout.map((row, rIdx) =>
          row.map((btn, bIdx) => {
            const isEq = btn === "=";
            const isCl = btn === "C";
            const isOp = ops.has(btn);

            let bgClass = "bg-[#0b0b0d] hover:bg-[#121216] text-[#FAFAFA] border border-white/5";
            if (isCl) bgClass = "bg-red-500/10 hover:bg-red-500/15 text-red-400 border border-red-500/15";
            else if (isEq) bgClass = "bg-[var(--accent)] hover:brightness-110 text-white font-extrabold border-transparent shadow-md shadow-[var(--accent-glow)]";
            else if (isOp) bgClass = "bg-[#101014]/80 hover:bg-[#16161b] text-[var(--accent)] border border-white/5";

            const fontClass = btn.length > 2 ? "text-[10.5px] font-extrabold tracking-tight" : "text-[13.5px] font-bold";

            return (
              <button
                key={`${rIdx}-${bIdx}`}
                onClick={() => handlePress(btn)}
                className={`py-4 rounded-xl active:scale-[0.96] transition-all outline-none cursor-pointer ${bgClass} ${fontClass}`}
              >
                {btn}
              </button>
            );
          })
        )}
      </div>

      {/* Ribbon History Tape */}
      <div className="mt-7 flex-1 min-h-[140px] flex flex-col">
        <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2 select-none">
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Computation Tape</span>
          {hist.length > 0 && (
            <button
              onClick={() => setHist([])}
              className="text-[10px] font-extrabold text-red-400 hover:text-red-300 transition-colors uppercase tracking-wider cursor-pointer"
            >
              Clear Tape
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 max-h-[220px] scrollbar-thin">
          {hist.length === 0 ? (
            <div className="text-center text-xs text-zinc-600/60 py-10 font-medium select-none">
              No entries in formula cache
            </div>
          ) : (
            hist.map((h, index) => (
              <div
                key={index}
                onClick={() => {
                  setRes(h.r);
                  setExpr("");
                }}
                className="flex items-center justify-between py-2 px-3 hover:bg-white/[0.02] border border-transparent hover:border-white/5 rounded-xl cursor-pointer transition-all text-xs font-mono"
              >
                <span className="text-zinc-500 truncate max-w-[70%] font-medium">{h.e}</span>
                <span className="text-[var(--accent)] font-bold">= {h.r}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
