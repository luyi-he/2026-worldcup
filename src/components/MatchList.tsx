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
  rightColHeight?: number;
}

export default function MatchList({
  matches,
  teams,
  selectedMatchId,
  onSelectMatch,
  factors,
  rightColHeight
}: MatchListProps) {
  const sortedMatches = [...matches].sort((a, b) => a.dateTime.localeCompare(b.dateTime));

  // State to check if desktop layout is active (lg breakpoint is 1024px)
  const [isDesktop, setIsDesktop] = React.useState(typeof window !== "undefined" ? window.innerWidth >= 1024 : true);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const dynamicStyle = isDesktop ? {} : { maxHeight: "600px" };

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
    <div 
      className="space-y-4 lg:space-y-0 lg:flex lg:flex-col lg:h-full"
      style={isDesktop && rightColHeight ? { height: `${rightColHeight}px` } : {}}
    >
      {/* Search Grounding or header info */}
      <div className="neo-card p-5 bg-white shrink-0 lg:mb-4">
        <span className="text-[9px] uppercase font-bold text-yellow-400 bg-slate-900 border-2 border-slate-900 rounded-md px-1.5 py-0.5 tracking-widest font-sans">⚽ WORLD CUP FORECAST ENGINE</span>
        <h1 className="text-lg font-black text-slate-900 font-display tracking-tight mb-2 mt-2">世界杯比分预测</h1>
        <p className="text-xs text-slate-600 leading-relaxed">
          用赔率后验、身价对比、首发战力、FIFA ELO及攻防克制模型，生成赛前一键可知的专业比分判断报告。
        </p>
        <div className="mt-3.5 pt-3.5 border-t-2 border-slate-900 mt-4 pt-4 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>{statusText}</span>
          <span className="bg-slate-900 border-2 border-slate-900 text-yellow-400 font-bold px-2 px-1.5 py-0.5 rounded font-mono font-bold text-[10px]">
            {dateBadge}
          </span>
        </div>
      </div>

      <div className="space-y-2.5 lg:flex-1 lg:flex lg:flex-col lg:min-h-0">
        <div className="flex items-center gap-1.5 px-1.5 text-xs font-bold text-slate-900 tracking-wider uppercase shrink-0">
          <Calendar className="w-3.5 h-3.5 text-slate-900 stroke-[2]" id="icon-calendar" />
          <span>⚽ 小组赛赛程与比分精测</span>
        </div>

        <div 
          className="space-y-3.5 overflow-y-auto pr-2 scroll-smooth lg:flex-1 lg:min-h-0"
          style={dynamicStyle}
        >
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
                className={`w-full text-left p-3.5 rounded-xl cursor-pointer flex items-center justify-between relative overflow-hidden transition-all duration-100 ${
                  isSelected
                    ? "bg-yellow-400 border-2 border-slate-900 text-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]"
                    : "bg-white hover:bg-slate-50 border-2 border-slate-900 text-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]"
                }`}
                id={`btn-match-${m.id}`}
              >
                <div className="space-y-2 flex-1 min-w-0 pr-2 pl-1">
                  <div className={`flex items-center gap-1.5 text-[9px] font-mono font-bold ${isSelected ? "text-slate-950" : "text-slate-400"}`}>
                    <span className="font-semibold">{dateDisplay}</span>
                    <span>•</span>
                    <span>{timeStr}</span>
                  </div>
 
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 text-[13px] text-slate-900 font-black font-sans">
                      <TeamFlag teamId={home.id} className="w-5 h-3.5 shadow-sm rounded-sm border border-slate-900/10" />
                      <span className="truncate max-w-[85px]">{home.name}</span>
                      <span className={`text-[10px] ${isSelected ? "text-slate-900" : "text-slate-400"} font-mono font-normal`}>VS</span>
                      <TeamFlag teamId={away.id} className="w-5 h-3.5 shadow-sm rounded-sm border border-slate-900/10" />
                      <span className="truncate max-w-[85px]">{away.name}</span>
                    </div>
                  </div>
                </div>
 
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    {m.actualScore ? (
                      <span className={`inline-block font-mono font-black text-xs px-2 py-1 rounded-md text-center border-2 border-slate-900 ${
                        isSelected
                          ? "bg-slate-900 text-yellow-400"
                          : "bg-yellow-400 text-slate-900"
                      }`}>
                        完 {m.actualScore.home}:{m.actualScore.away}
                      </span>
                    ) : (
                      <span className={`inline-block font-mono font-black text-xs px-2.5 py-1 rounded-md text-center border-2 border-slate-900 ${
                        isSelected
                          ? "bg-slate-900 text-yellow-400"
                          : "bg-slate-100 text-slate-900"
                      }`}>
                        {prediction.recommendedScores.primary}
                      </span>
                    )}
                    <div className={`text-[9px] ${isSelected ? "text-slate-900 font-bold" : "text-slate-400 font-semibold"} font-sans mt-1`} title={m.isKnockout ? "主队晋级期望率" : "主胜预期发生率"}>
                      {m.isKnockout ? "晋级" : "主胜"} {Math.round((m.isKnockout ? prediction.homeAdvanceProb : prediction.homeWinProb) * 100)}%
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform ${
                    isSelected ? "text-slate-950 translate-x-0.5" : "text-slate-400"
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
