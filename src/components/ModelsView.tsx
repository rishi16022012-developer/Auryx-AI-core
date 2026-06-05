import React from "react";
import { PROVS, MODELS } from "../constants";

interface ModelsViewProps {
  activeModel: string;
  onChangeModel: (prov: string, model: string) => void;
  apiKeys: Record<string, string>;
}

export const ModelsView: React.FC<ModelsViewProps> = ({
  activeModel,
  onChangeModel,
  apiKeys,
}) => {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 flex flex-col font-sans max-w-4xl mx-auto w-full animate-fadeUp select-none">
      <div className="flex flex-col gap-5">
        {PROVS.map((prov) => {
          const modelsList = MODELS[prov.id] || [];
          const keyProvided = !!apiKeys[prov.id];

          return (
            <div key={prov.id} className="border border-[#27272A] rounded-xl bg-[#121214]/60 p-4 shadow-sm flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-[#27272A]/50 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{prov.ico}</span>
                  <span className="text-sm font-bold text-[#FAFAFA] font-sans">{prov.name}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide ${
                  keyProvided ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                }`}>
                  {keyProvided ? "✓ ACTIVE KEY" : "✕ KEY MISSING"}
                </span>
              </div>

              {/* Models grid in provider */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-1">
                {modelsList.map((m) => {
                  const active = activeModel === m.id;

                  return (
                    <div
                      key={m.id}
                      onClick={() => onChangeModel(prov.id, m.id)}
                      className={`p-3.5 border rounded-xl cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                        active
                          ? "bg-[rgba(100,200,255,0.06)] border-[var(--accent)]"
                          : "bg-[#18181B]/50 border-[#27272A] hover:border-white/10"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className={`text-xs font-bold leading-tight ${active ? "text-[var(--accent)]" : "text-[#FAFAFA]"}`}>
                            {m.n}
                          </div>
                          <span className="text-[10px] text-[#A1A1AA] font-mono block mt-1">
                            Context: {m.ctx} · Cost: {m.cost}
                          </span>
                        </div>
                        {m.tag && (
                          <span className="px-1.5 py-0.5 rounded text-[8.5px] font-bold bg-[#121214] text-white/50 tracking-wide leading-none">
                            {m.tag}
                          </span>
                        )}
                      </div>

                      {/* Speed Metrics sliders */}
                      <div className="flex flex-col gap-1.5 pt-1 border-t border-[#27272A]/40">
                        <div className="flex items-center justify-between text-[10px] text-[#A1A1AA] font-mono leading-none">
                          <span>Speed</span>
                          <span className="text-[#FAFAFA]">{m.sp}/100</span>
                        </div>
                        <div className="w-full h-1 bg-[#121214] rounded-full overflow-hidden">
                          <div
                            style={{ width: `${m.sp}%` }}
                            className="bg-green-400 h-full rounded-full"
                          />
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-[#A1A1AA] font-mono leading-none mt-1">
                          <span>Quality</span>
                          <span className="text-[#FAFAFA]">{m.iq}/100</span>
                        </div>
                        <div className="w-full h-1 bg-[#121214] rounded-full overflow-hidden">
                          <div
                            style={{ width: `${m.iq}%` }}
                            className="bg-[var(--accent)] h-full rounded-full"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
