import React from "react";
import { Match, Team, MatchFactors, PredictionResult } from "../types";
import { PRESET_MATCHES, runMatchPrediction } from "../data";
import { Calendar, Compass, Star, ChevronRight } from "lucide-react";
import TeamFlag from "./TeamFlag";

interface MatchListProps {
  matches: Match[];
  teams: Record<string, Team>;
  selectedMatchId: string;
  onSelectMatch: (matchId: string) => void;
  factors: MatchFactors;
}

export default function MatchList({
  matches,
  teams,
  selectedMatchId,
  onSelectMatch,
  factors
}: MatchListProps) {
  const sortedMatches = [...matches].sort((a, b) => a.dateTime.localeCompare(b.dateTime));

  // Determine dynamic schedule status based on current local date
  const now = new Date();
  const year = now.getFullYear();
  const monthStr = String(now.getMonth() + 1).padStart(2, "0");
  const dateStr = String(now.getDate()).padStart(2, "0");
  const todayDateString = `${year}-${monthStr}-${dateStr}`;

  const todayMatches = matches.filter(m => m.dateTime.startsWith(todayDateString));

  let statusText = "";
  let dateBadge = "";

  if (todayMatches.length > 0) {
    statusText = `今日赛程已开启，共 ${todayMatches.length} 场精彩对决`;
    dateBadge = todayDateString;
  } else {
    // Find the next upcoming match day
    const upcomingMatches = [...matches]
      .filter(m => m.dateTime.split(" ")[0].localeCompare(todayDateString) > 0)
      .sort((a, b) => a.dateTime.localeCompare(b.dateTime));

    if (upcomingMatches.length > 0) {
      statusText = "今日暂无比赛，展示下一场";
      dateBadge = upcomingMatches[0].dateTime.split(" ")[0];
    } else {
      statusText = "全部小组赛程已结束";
      dateBadge = todayDateString;
    }
  }

  return (
    <div className="space-y-4">
      {/* Search Grounding or header info */}
      <div className="glass-panel rounded-2xl p-4 shadow-sm">
        <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">WORLD CUP FORECAST ENGINE</span>
        <h1 className="text-lg font-bold text-slate-900 font-sans tracking-tight mb-2 mt-1">世界杯比分预测</h1>
        <p className="text-xs text-slate-600 leading-relaxed">
          用赔率后验、身价对比、首发战力、FIFA ELO及攻防克制模型，生成赛前一键可知的专业比分判断报告。
        </p>
        <div className="mt-3.5 pt-3.5 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
          <span>{statusText}</span>
          <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded font-mono font-bold text-[10px]">
            {dateBadge}
          </span>
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5 px-1 text-xs font-semibold text-slate-500">
          <Calendar className="w-3.5 h-3.5 text-slate-450" id="icon-calendar" />
          <span>小组赛赛程与比分精测</span>
        </div>

        <div className="space-y-2 max-h-[600px] lg:max-h-[800px] overflow-y-auto pr-1.5 scroll-smooth">
          {sortedMatches.map((m) => {
            const home = teams[m.homeTeamId];
            const away = teams[m.awayTeamId];
            if (!home || !away) return null;
 
            // Run prediction dynamically based on active factors for the sidebar preview
            const prediction: PredictionResult = runMatchPrediction(home, away, m, factors);
            const isSelected = m.id === selectedMatchId;
 
            // Format match day
            const dateObj = new Date(m.dateTime.replace(" ", "T"));
            const month = dateObj.getMonth() + 1;
            const dateVal = dateObj.getDate();
            const dayStr = "周" + ["日", "一", "二", "三", "四", "五", "六"][dateObj.getDay()];
            const timeStr = m.dateTime.split(" ")[1];
            const dateDisplay = `${month}月${dateVal}日 (${dayStr})`;
 
            return (
              <button
                key={m.id}
                onClick={() => onSelectMatch(m.id)}
                className={`w-full text-left p-3.5 rounded-xl transition-all duration-300 border cursor-pointer group flex items-center justify-between ${
                  isSelected
                    ? "bg-emerald-500/10 border-emerald-500/40 shadow-sm shadow-emerald-500/5 text-slate-900"
                    : "bg-white hover:bg-slate-50 border-slate-200/80 hover:border-slate-300"
                }`}
                id={`btn-match-${m.id}`}
              >
                <div className="space-y-1.5 flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                    <span className="font-semibold text-slate-500">{dateDisplay}</span>
                    <span>•</span>
                    <span>{timeStr}</span>
                  </div>
 
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-700 font-medium group-hover:text-slate-950 transition-colors">
                      <TeamFlag teamId={home.id} className="w-5.5 h-3.5 shadow-sm" />
                      <span className="truncate max-w-[100px] font-semibold">{home.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">VS</span>
                      <TeamFlag teamId={away.id} className="w-5.5 h-3.5 shadow-sm" />
                      <span className="truncate max-w-[100px] font-semibold">{away.name}</span>
                    </div>
                  </div>
                </div>
 
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    {m.actualScore ? (
                      <span className={`inline-block font-mono font-bold text-xs px-2 py-1 rounded-md text-center border ${
                        isSelected
                          ? "bg-amber-500/20 text-amber-800 border-amber-500/25"
                          : "bg-amber-500/5 text-amber-700 border-amber-300/30"
                      }`}>
                        完 {m.actualScore.home}:{m.actualScore.away}
                      </span>
                    ) : (
                      <span className={`inline-block font-mono font-bold text-xs px-2.5 py-1 rounded-md text-center border ${
                        isSelected
                          ? "bg-emerald-500/20 text-emerald-800 border-emerald-500/25"
                          : "bg-slate-100 text-slate-600 border-slate-200/50"
                      }`}>
                        {prediction.recommendedScores.primary}
                      </span>
                    )}
                    <div className="text-[9px] text-slate-450 font-medium font-sans mt-0.5" title="主胜预期发生率">
                      主胜 {Math.round(prediction.homeWinProb * 100)}%
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all ${
                    isSelected ? "text-emerald-600 translate-x-0.5" : ""
                  }`} id={`chevron-${m.id}`} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
