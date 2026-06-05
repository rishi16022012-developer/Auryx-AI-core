import React, { useState } from "react";
import { PROVS } from "../constants";

interface ApiKeysViewProps {
  apiKeys: Record<string, string>;
  onSaveKey: (id: string, val: string) => void;
  onRemoveKey: (id: string) => void;
  activeProvider: string;
  onChangeProvider: (prov: string) => void;
  onAddToast: (msg: string, type?: "success" | "error" | "info" | "warn") => void;
}

export const ApiKeysView: React.FC<ApiKeysViewProps> = ({
  apiKeys,
  onSaveKey,
  onRemoveKey,
  activeProvider,
  onChangeProvider,
  onAddToast,
}) => {
  const [inputs, setInputs] = useState<Record<string, string>>({});

  const handleTextChange = (id: string, text: string) => {
    setInputs((prev) => ({ ...prev, [id]: text }));
  };

  const handleSave = (id: string) => {
    const rawVal = inputs[id];
    if (rawVal === undefined) return;
    const cleanVal = rawVal.trim();
    if (cleanVal) {
      onSaveKey(id, cleanVal);
      onAddToast(`Key saved for ${PROVS.find((p) => p.id === id)?.name}`, "success");
    } else {
      onRemoveKey(id);
      onAddToast(`Key removed for ${PROVS.find((p) => p.id === id)?.name}`, "info");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 flex flex-col font-sans max-w-2xl mx-auto w-full animate-fadeUp">
      <div className="text-xs text-[#A1A1AA] leading-relaxed mb-5 select-none">
        All programmatic variables are cached locally in your browser workspace. They are never sent/transferred to any external analytics database.
      </div>

      <div className="flex flex-col gap-3">
        {PROVS.map((p) => {
          const has = !!apiKeys[p.id];
          const currentInpValue = inputs[p.id] !== undefined ? inputs[p.id] : (apiKeys[p.id] || "");

          return (
            <div
              key={p.id}
              className="p-4 bg-[#121214] border border-[#27272A] rounded-xl flex flex-col gap-3 shadow-sm"
            >
              <div className="flex items-center justify-between select-none">
                <div className="flex items-center gap-2.5">
                  <div
                    style={{ backgroundColor: `${p.col}15` }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
                  >
                    {p.ico}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#FAFAFA]">{p.name}</div>
                    <span className="text-[10px] text-[#A1A1AA]">{p.desc}</span>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded text-[8.5px] font-bold ${
                  has ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                }`}>
                  {has ? "✓ Set" : "✕ Not Set"}
                </span>
              </div>

              {/* Password credentials block */}
              <div className="flex gap-2">
                <input
                  type="password"
                  value={currentInpValue}
                  onChange={(e) => handleTextChange(p.id, e.target.value)}
                  placeholder="Paste your private API key..."
                  className="flex-1 px-3 py-2 bg-[#18181B] border border-[#27272A] rounded-lg text-xs hover:border-[#38383a] text-white font-sans outline-none focus:border-[var(--accent)]"
                />
                <button
                  onClick={() => handleSave(p.id)}
                  className="px-3.5 py-1 bg-[var(--accent)] text-white text-xs font-bold rounded-lg hover:brightness-110 active:scale-95 transition-all select-none"
                >
                  Save
                </button>
                {has && (
                  <button
                    onClick={() => {
                      onRemoveKey(p.id);
                      setInputs((prev) => ({ ...prev, [p.id]: "" }));
                      onAddToast(`Key removed for ${p.name}`, "info");
                    }}
                    className="px-3 py-1 bg-red-500/10 hover:bg-red-500/15 text-red-400 border border-red-500/20 text-xs font-bold rounded-lg active:scale-95 transition-all select-none"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="flex justify-between items-center text-[10.5px] select-none">
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--accent)] hover:underline flex items-center gap-1 leading-none font-medium"
                >
                  Retrieve {p.name} key here ↗
                </a>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 border-t border-[#27272A] pt-4 select-none">
        <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider block mb-2">
          Active Provider
        </label>
        <div className="flex flex-wrap gap-2">
          {PROVS.map((p) => {
            const isSelected = activeProvider === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onChangeProvider(p.id)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold tracking-tight transition-all active:scale-95 ${
                  isSelected
                    ? "bg-[rgba(100,200,255,0.06)] border-[var(--accent)] text-[var(--accent)]"
                    : "bg-[#121214] border-[#27272A] text-white/75 hover:border-white/10"
                }`}
              >
                {p.ico} {p.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
