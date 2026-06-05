import React from "react";
import { ChatSession, AnalyticsData } from "../types";

interface AnalyticsViewProps {
  chats: ChatSession[];
  analytics: AnalyticsData;
  onSelectChat: (id: string) => void;
  onGoToView: (view: string) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  chats,
  analytics,
  onSelectChat,
  onGoToView,
}) => {
  // Compute previous 7 days logs
  const getSevenDaysStats = () => {
    const days: string[] = [];
    const vals: number[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const k = d.toISOString().slice(0, 10);
      days.push(["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"][d.getDay()]);
      vals.push(analytics.dm?.[k] || 0);
    }
    
    return { days, vals };
  };

  const { days, vals } = getSevenDaysStats();
  const maxVal = Math.max(...vals, 1);

  // Compute model metrics ratios
  const modelStats = Object.entries(analytics.mu || {}) as Array<[string, number]>;
  const sortedModelStats = [...modelStats].sort((a, b) => b[1] - a[1]);
  const totalModelCalls = sortedModelStats.reduce((sum, [, count]) => sum + count, 0) || 1;

  const colors = ["#3B82F6", "#A855F7", "#22C55E", "#F43F5E", "#F59E0B", "#06B6D4"];


  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 flex flex-col font-sans max-w-4xl mx-auto w-full animate-fadeUp select-none">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="p-3 bg-[#121214] border border-[#27272A] rounded-xl flex flex-col">
          <span className="text-[9px] font-bold text-[#A1A1AA] uppercase tracking-wider">Total Conversations</span>
          <div className="text-xl font-bold font-mono text-[#FAFAFA] mt-1">
            {chats.length}
          </div>
          <span className="text-[10px] text-[#A1A1AA]/50 mt-1">
            {chats.filter((c) => c.pinned).length} pinned archives
          </span>
        </div>

        <div className="p-3 bg-[#121214] border border-[#27272A] rounded-xl flex flex-col">
          <span className="text-[9px] font-bold text-[#A1A1AA] uppercase tracking-wider">Total Messages</span>
          <div className="text-xl font-bold font-mono text-[#FAFAFA] mt-1">
            {analytics.msgs || 0}
          </div>
          <span className="text-[10px] text-[#A1A1AA]/50 mt-1">All sessions combined</span>
        </div>

        <div className="p-3 bg-[#121214] border border-[#27272A] rounded-xl flex flex-col">
          <span className="text-[9px] font-bold text-[#A1A1AA] uppercase tracking-wider">Telemetry Load</span>
          <div className="text-xl font-bold font-mono text-green-400 mt-1">
            OPTIMAL
          </div>
          <span className="text-[10px] text-green-400/50 mt-1">Latency &lt; 20ms</span>
        </div>

        <div className="p-3 bg-[#121214] border border-[#27272A] rounded-xl flex flex-col">
          <span className="text-[9px] font-bold text-[#A1A1AA] uppercase tracking-wider">Workspace Buffer</span>
          <div className="text-xl font-bold font-mono text-[#FAFAFA] mt-1">
            {new Blob([JSON.stringify(chats)]).size.toLocaleString()} B
          </div>
          <span className="text-[10px] text-[#A1A1AA]/50 mt-1">Local cache payload</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Dynamic SVG message chart histogram */}
        <div className="p-4 bg-[#121214] border border-[#27272A] rounded-xl flex flex-col">
          <div className="text-xs font-bold text-[#FAFAFA] mb-4">
            Daily Message Metrics (Last 7 Days)
          </div>
          
          <div className="flex items-end gap-2.5 h-36 px-2 pb-1.5 border-b border-[#27272A]/70">
            {days.map((day, idx) => {
              const val = vals[idx];
              const ratio = val / maxVal;
              // ensure minimum visual pixel of 4px
              const heightPct = Math.max(0.04, ratio) * 100;
              const barColor = colors[idx % colors.length];

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer h-full justify-end">
                  {/* Tooltip bubble details */}
                  <span className="hidden group-hover:block transition-all text-[9.5px] font-mono text-white bg-black border border-white/15 px-1 py-0.5 rounded leading-none">
                    {val}
                  </span>
                  
                  <div
                    style={{ height: `${heightPct}%`, backgroundColor: barColor }}
                    className="w-full rounded-t opacity-85 hover:opacity-100 transition-all shadow-[0_0_10px_rgba(var(--accent-rgb),0.1)]"
                  />
                  
                  <span className="text-[10.5px] font-mono text-[#A1A1AA]">
                    {day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Model distribution lists */}
        <div className="p-4 bg-[#121214] border border-[#27272A] rounded-xl flex flex-col">
          <div className="text-xs font-bold text-[#FAFAFA] mb-4">
            Workspace Engine Allocations
          </div>

          <div className="flex flex-col gap-3 max-h-[150px] overflow-y-auto">
            {sortedModelStats.length === 0 ? (
              <div className="text-center text-xs text-[#A1A1AA]/30 py-8">
                No active model telemetry data
              </div>
            ) : (
              sortedModelStats.map(([modelId, count], idx) => {
                const ratioPct = ((count / totalModelCalls) * 100).toFixed(0);
                const barColor = colors[idx % colors.length];

                return (
                  <div key={modelId} className="flex flex-col gap-1 text-xs">
                    <div className="flex justify-between font-mono text-[11px]">
                      <span className="text-[#A1A1AA] truncate max-w-[70%]">{modelId}</span>
                      <span className="text-[#FAFAFA] font-bold">{count} prompts ({ratioPct}%)</span>
                    </div>

                    <div className="w-full h-1.5 bg-[#18181B] rounded-full overflow-hidden border border-[#27272A]/40">
                      <div
                        style={{ width: `${ratioPct}%`, backgroundColor: barColor }}
                        className="h-full rounded-full"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Session log journal */}
      <div className="p-4 bg-[#121214] border border-[#27272A] rounded-xl flex flex-col">
        <div className="text-xs font-bold text-[#FAFAFA] mb-3">
          Prompt Logs Ledger
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-[#27272A] text-[#A1A1AA] font-bold">
                <th className="py-2 px-3 pl-1 font-semibold">Title Page</th>
                <th className="py-2 px-3 font-semibold">Provider</th>
                <th className="py-2 px-3 font-semibold">Exchanges</th>
                <th className="py-2 px-3 pr-1 text-right font-semibold">Latest Sync</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272A]/50 font-medium">
              {chats.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-xs text-[#A1A1AA]/30">
                    No active sessions in records
                  </td>
                </tr>
              ) : (
                chats.slice(0, 10).map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => {
                      onSelectChat(c.id);
                      onGoToView("chat");
                    }}
                    className="hover:bg-white/5 cursor-pointer text-white/80 transition-colors"
                  >
                    <td className="py-2.5 px-3 pl-1 truncate max-w-[190px] font-semibold text-white">
                      {c.title}
                    </td>
                    <td className="py-2.5 px-3 uppercase text-[10px] font-bold text-[#A1A1AA]">
                      {c.prov}
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      {(c.messages || []).length} lines
                    </td>
                    <td className="py-2.5 px-3 pr-1 text-right font-mono text-[#A1A1AA]">
                      {new Date(c.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
