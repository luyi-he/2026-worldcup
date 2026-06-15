import React from "react";
import { Team, Match, MatchFactors, PredictionResult } from "../types";
import { TrendingUp, Compass, CheckCircle2, XCircle, Target, ShieldCheck, LineChart } from "lucide-react";
import { motion } from "motion/react";
import TeamFlag from "./TeamFlag";
import { runMatchPrediction, PRESET_MATCHES, TEAMS } from "../data";

interface MatchDisplayProps {
  home: Team;
  away: Team;
  match: Match;
  factors: MatchFactors;
  prediction: PredictionResult;
  onEditTeamValue: (teamId: string, field: "marketValue" | "fifaRank" | "elo" | "attackingRating" | "defendingRating", value: number) => void;
  teams?: Record<string, Team>;
  allMatches?: Match[];
  onToggleKnockout?: (matchId: string) => void;
}

export default function MatchDisplay({
  home,
  away,
  match,
  factors,
  prediction,
  onEditTeamValue,
  teams,
  allMatches,
  onToggleKnockout
}: MatchDisplayProps) {
  const formatMillionEuro = (val: number) => {
    return `€${val.toFixed(2)}m`;
  };

  const totalMargin = (
    prediction.factorContributions.marketValue +
    prediction.factorContributions.lineupStrength +
    prediction.factorContributions.fifaRank +
    prediction.factorContributions.tactics +
    prediction.factorContributions.external
  ).toFixed(3);

  const totalMarginNum = parseFloat(totalMargin);

  // Format match day nicely
  const dateObj = new Date(match.dateTime.replace(" ", "T"));
  const month = dateObj.getMonth() + 1;
  const dateVal = dateObj.getDate();
  const dayStr = "周" + ["日", "一", "二", "三", "四", "五", "六"][dateObj.getDay()];
  const timeStr = match.dateTime.split(" ")[1];
  const formattedDateTime = `${month}月${dateVal}日 (${dayStr}) ${timeStr}`;

  return (
    <div className="space-y-6">
      {/* 1. Header Information Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/80 border border-slate-200/60 p-4 rounded-xl gap-2 text-xs shadow-sm">
        <div className="flex items-center gap-1.5 text-slate-550 font-medium">
          <span className="bg-slate-900 text-yellow-400 px-2 py-0.5 rounded-md font-mono font-bold uppercase border-2 border-slate-900">
            {match.isKnockout ? "世界杯淘汰赛" : "世界杯小组赛"}
          </span>
          <span className="text-slate-350">|</span>
          <span className="font-mono text-slate-600 font-medium">{formattedDateTime}</span>
        </div>
        <div className="flex items-center gap-3 text-slate-550 flex-wrap">
          <button
            onClick={() => onToggleKnockout && onToggleKnockout(match.id)}
            className={`px-2 py-0.5 rounded font-black border-2 text-[10px] cursor-pointer transition-all active:translate-y-0.5 ${
              match.isKnockout 
                ? "bg-slate-900 text-yellow-400 border-slate-900 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]" 
                : "bg-white text-slate-700 border-slate-200 hover:border-slate-450 shadow-[1px_1px_0px_0px_rgba(226,232,240,1)]"
            }`}
            title="点击切换小组赛/淘汰赛阶段"
          >
            {match.isKnockout ? "⚔️ 切换为小组赛" : "🏆 切换为淘汰赛"}
          </button>
          <span className="text-slate-350">|</span>
          <div className="flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-slate-400" id="icon-compass" />
            <span>球场行军: </span>
            <span className="font-mono text-slate-800 font-semibold bg-slate-100 border border-slate-200/60 px-2 py-0.5 rounded">
              {match.venue}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Primary Match Card (Flags, Score, Conf) */}
      <div className="neo-card p-6 md:p-8 bg-white relative overflow-hidden">
        <div className="grid grid-cols-12 items-center gap-4">
          {/* Home Team Column */}
          <div className="col-span-12 md:col-span-4 text-center space-y-3.5 order-1">
            <motion.div 
               key={home.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center"
            >
              <div className="w-20 h-13 flex items-center justify-center select-none filter drop-shadow-sm transition-transform hover:scale-105 duration-350 mb-1">
                <TeamFlag teamId={home.id} className="w-full h-full shadow-md rounded-lg border border-slate-200/80" />
              </div>
              <span className="text-slate-900 uppercase font-black text-[10px] tracking-wider mt-1 block">
                HOME
              </span>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{home.name}</h3>
              <p className="text-sm font-black font-mono text-slate-900 mt-1">{formatMillionEuro(home.marketValue)}</p>
            </motion.div>

            {/* Quick Interactive Adjuster inside the main card */}
            <div className="bg-slate-50 border border-slate-205 p-2.5 rounded-xl max-w-[170px] mx-auto text-left space-y-2 shadow-sm">
              <span className="text-[9px] uppercase font-bold text-slate-500 block tracking-wider text-center">实时修改属性</span>
              <div className="flex items-center justify-between text-[11px] text-slate-600">
                <span>德转身价:</span>
                <input
                  type="number"
                  value={home.marketValue}
                  onChange={(e) => onEditTeamValue(home.id, "marketValue", parseFloat(e.target.value) || 0)}
                  className="w-16 h-6 px-1.5 text-xs bg-white border-2 border-slate-900 rounded font-black text-right text-slate-900 focus:outline-none focus:border-slate-600"
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-600">
                <span>FIFA排名:</span>
                <input
                  type="number"
                  value={home.fifaRank}
                  onChange={(e) => onEditTeamValue(home.id, "fifaRank", parseInt(e.target.value) || 1)}
                  className="w-16 h-5 px-1 text-[10px] bg-white border border-slate-300 rounded font-semibold text-right text-slate-700 focus:outline-none focus:border-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Core Score/Prediction Column */}
          <div className="col-span-12 md:col-span-4 text-center space-y-4 order-2 py-4 md:py-0 border-y md:border-y-0 md:border-x border-slate-200/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">预测比分</span>
            
            <motion.div 
              key={prediction.recommendedScores.primary}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100 }}
              className="text-6xl font-black font-display text-slate-900 tracking-tighter"
            >
              {prediction.recommendedScores.primary}
            </motion.div>

            <div>
              <span className="inline-block bg-yellow-400 text-slate-950 border-2 border-slate-900 font-black px-2.5 py-1 rounded-md text-xs shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]">
                {(() => {
                  const [hG, aG] = prediction.recommendedScores.primary.split("-").map(Number);
                  if (match.isKnockout) {
                    return hG > aG ? "主队晋级" : "客队晋级";
                  }
                  return hG > aG ? "主胜" : hG < aG ? "客胜" : "平局";
                })()} • {prediction.totalConfidence}% 置信度
              </span>
            </div>

            <div className="text-[10px] text-slate-500 max-w-[150px] mx-auto leading-relaxed">
            </div>
          </div>

          {/* Away Team Column */}
          <div className="col-span-12 md:col-span-4 text-center space-y-3.5 order-3">
            <motion.div 
              key={away.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center"
            >
              <div className="w-20 h-13 flex items-center justify-center select-none filter drop-shadow-sm transition-transform hover:scale-105 duration-350 mb-1">
                <TeamFlag teamId={away.id} className="w-full h-full shadow-md rounded-lg border border-slate-200/80" />
              </div>
              <span className="text-slate-950 font-black uppercase font-extrabold text-[10px] tracking-wider mt-1 block">
                AWAY
              </span>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{away.name}</h3>
              <p className="text-sm font-semibold font-mono text-slate-900 font-black mt-1">{formatMillionEuro(away.marketValue)}</p>
            </motion.div>

            {/* Quick Interactive Adjuster inside the main card */}
            <div className="bg-slate-50 border border-slate-205 p-2.5 rounded-xl max-w-[170px] mx-auto text-left space-y-2 shadow-sm">
              <span className="text-[9px] uppercase font-bold text-slate-500 block tracking-wider text-center">实时修改属性</span>
              <div className="flex items-center justify-between text-[11px] text-slate-600">
                <span>德转身价:</span>
                <input
                  type="number"
                  value={away.marketValue}
                  onChange={(e) => onEditTeamValue(away.id, "marketValue", parseFloat(e.target.value) || 0)}
                  className="w-16 h-5 px-1 text-[10px] bg-white border border-slate-300 rounded font-semibold text-right text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-600">
                <span>FIFA排名:</span>
                <input
                  type="number"
                  value={away.fifaRank}
                  onChange={(e) => onEditTeamValue(away.id, "fifaRank", parseInt(e.target.value) || 1)}
                  className="w-16 h-5 px-1 text-[10px] bg-white border border-slate-300 rounded font-semibold text-right text-slate-700 focus:outline-none focus:border-slate-900"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Winning Percentages & xG Breakdown Row */}
      <div className="grid grid-cols-12 gap-4">
        {/* Home win % */}
        <div className="col-span-12 sm:col-span-3 glass-panel p-4 rounded-xl flex flex-col justify-between shadow-sm">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <TeamFlag teamId={home.id} className="w-5 h-3.5 shadow-sm rounded-sm" /> {match.isKnockout ? "主队晋级率" : "主胜概率"}
          </span>
          <span className="text-2xl font-extrabold text-slate-800 font-display mt-2">
            {((match.isKnockout ? prediction.homeAdvanceProb : prediction.homeWinProb) * 100).toFixed(1)}%
          </span>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden border border-slate-200/40">
            <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${(match.isKnockout ? prediction.homeAdvanceProb : prediction.homeWinProb) * 100}%` }}></div>
          </div>
        </div>

        {/* Draw win % */}
        <div className="col-span-12 sm:col-span-3 glass-panel p-4 rounded-xl flex flex-col justify-between shadow-sm">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">🤝 {match.isKnockout ? "90分钟平局率" : "平局概率"}</span>
          <span className="text-2xl font-extrabold text-slate-600 font-display mt-2">{(prediction.drawProb * 100).toFixed(1)}%</span>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden border border-slate-200/40">
            <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${prediction.drawProb * 100}%` }}></div>
          </div>
        </div>

        {/* Away win % */}
        <div className="col-span-12 sm:col-span-3 glass-panel p-4 rounded-xl flex flex-col justify-between shadow-sm">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <TeamFlag teamId={away.id} className="w-5 h-3.5 shadow-sm rounded-sm" /> {match.isKnockout ? "客队晋级率" : "客胜概率"}
          </span>
          <span className="text-2xl font-extrabold text-slate-800 font-display mt-2">
            {((match.isKnockout ? prediction.awayAdvanceProb : prediction.awayWinProb) * 100).toFixed(1)}%
          </span>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden border border-slate-200/40">
            <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${(match.isKnockout ? prediction.awayAdvanceProb : prediction.awayWinProb) * 100}%` }}></div>
          </div>
        </div>

        {/* Expected goals (xG) ratio */}
        <div className="col-span-12 sm:col-span-3 glass-panel p-4 rounded-xl flex flex-col justify-between relative overflow-hidden shadow-sm">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider flex items-center justify-between">
            xG 预期值比 ({home.id} vs {away.id})
            <TrendingUp className="w-3.5 h-3.5 text-slate-400" id="icon-trending" />
          </span>
          <span className="text-2xl font-black text-slate-800 font-display mt-2">
            {prediction.homeExpectedGoals} : {prediction.awayExpectedGoals}
          </span>
          <span className="text-[9px] text-slate-450 mt-2.5 font-medium leading-none">
            基于打法与高原等因素最终拟合指数
          </span>
        </div>
      </div>

      {/* 4. Recommend Tiers (Three options: Primary, Stable, Aggressive) */}
      <div className="grid grid-cols-12 gap-4">
        {/* Primary Recommended */}
        <div className="col-span-12 sm:col-span-4 bg-white p-4 rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]">
          <div className="flex justify-center">
            <span className="text-[9px] tracking-wide font-black text-slate-900 bg-yellow-400 rounded-md px-2 py-0.5 border-2 border-slate-900 uppercase">
              主推选项 (PRIMARY)
            </span>
          </div>
          <div className="text-center text-3xl font-black text-slate-900 my-2.5 font-display">
            {prediction.recommendedScores.primary}
          </div>
          <div className="flex justify-center">
            <span className="text-[10px] font-black text-slate-900 bg-white border-2 border-slate-900 px-2.5 py-0.5 rounded shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]">
              首推高概率
            </span>
          </div>
        </div>

        {/* Stable Conservative Recommended */}
        <div className="col-span-12 sm:col-span-4 bg-white p-4 rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]">
          <div className="flex justify-center">
            <span className="text-[9px] tracking-wide font-black text-slate-900 bg-yellow-400 rounded-md px-2 py-0.5 border-2 border-slate-900 uppercase">
              稳健策略 (STABLE)
            </span>
          </div>
          <div className="text-center text-3xl font-black text-slate-900 my-2.5 font-display">
            {prediction.recommendedScores.stable}
          </div>
          <div className="flex justify-center">
            <span className="text-[10px] font-black text-slate-900 bg-white border-2 border-slate-900 px-2.5 py-0.5 rounded shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]">
              防冷偏向值
            </span>
          </div>
        </div>

        {/* Aggressive Progressive Recommended */}
        <div className="col-span-12 sm:col-span-4 bg-white p-4 rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]">
          <div className="flex justify-center">
            <span className="text-[9px] tracking-wide font-black text-slate-900 bg-yellow-400 rounded-md px-2 py-0.5 border-2 border-slate-900 uppercase">
              进取玩法 (AGGRESSIVE)
            </span>
          </div>
          <div className="text-center text-3xl font-black text-slate-900 my-2.5 font-display">
            {prediction.recommendedScores.aggressive}
          </div>
          <div className="flex justify-center">
            <span className="text-[10px] font-black text-slate-900 bg-white border-2 border-slate-900 px-2.5 py-0.5 rounded shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]">
              博单高回报
            </span>
          </div>
        </div>
      </div>

      {/* 5. Custom Factors Table Margin */}
      <div className="glass-panel rounded-2xl p-5 shadow-sm bg-white/30 border border-white">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold text-slate-800">模型拟合累积边际值 (主队加权)</h4>
          <span className={`text-xs font-bold font-mono px-2.5 py-0.5 rounded-md ${
            totalMarginNum >= 0 ? "bg-yellow-105 text-slate-950 border-2 border-slate-900 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]" : "bg-white text-slate-900 border-2 border-slate-900 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]"
          }`}>
            总边际 {totalMarginNum >= 0 ? "+" : ""}{totalMargin}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 text-center">
          {/* MV contribution */}
          <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-200/50">
            <div className="text-[10px] text-slate-500 font-medium font-sans">球员身价边际</div>
            <div className={`mt-1 font-mono font-bold text-sm ${prediction.factorContributions.marketValue >= 0 ? "text-slate-900" : "text-slate-500"}`}>
              {prediction.factorContributions.marketValue >= 0 ? "+" : ""}{prediction.factorContributions.marketValue}
            </div>
            <div className="text-[9px] text-slate-500 font-semibold font-sans select-none mt-0.5 bg-white border border-slate-100 rounded py-0.5">
              身价占比因子
            </div>
          </div>

          {/* Attacking/Defending form contribution */}
          <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-200/50">
            <div className="text-[10px] text-slate-500 font-medium font-sans">阵容首发实力</div>
            <div className={`mt-1 font-mono font-bold text-sm ${prediction.factorContributions.lineupStrength >= 0 ? "text-slate-900" : "text-slate-500"}`}>
              {prediction.factorContributions.lineupStrength >= 0 ? "+" : ""}{prediction.factorContributions.lineupStrength}
            </div>
            <div className="text-[9px] text-slate-500 font-semibold font-sans select-none mt-0.5 bg-white border border-slate-100 rounded py-0.5">
              攻守Rating差
            </div>
          </div>

          {/* FIFA/ELO contribution */}
          <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-200/50">
            <div className="text-[10px] text-slate-500 font-medium font-sans">排名过往表现</div>
            <div className={`mt-1 font-mono font-bold text-sm ${prediction.factorContributions.fifaRank >= 0 ? "text-slate-900" : "text-slate-500"}`}>
              {prediction.factorContributions.fifaRank >= 0 ? "+" : ""}{prediction.factorContributions.fifaRank}
            </div>
            <div className="text-[9px] text-slate-500 font-semibold font-sans select-none mt-0.5 bg-white border border-slate-100 rounded py-0.5">
              ELO积分权数
            </div>
          </div>

          {/* Tactical Counter */}
          <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-200/50">
            <div className="text-[10px] text-slate-500 font-medium font-sans">攻防打法克制</div>
            <div className={`mt-1 font-mono font-bold text-sm ${prediction.factorContributions.tactics >= 0 ? "text-slate-900" : "text-slate-500"}`}>
              {prediction.factorContributions.tactics >= 0 ? "+" : ""}{prediction.factorContributions.tactics}
            </div>
            <div className="text-[9px] text-slate-500 font-semibold font-sans select-none mt-0.5 bg-white border border-slate-100 rounded py-0.5">
              战术克制系数
            </div>
          </div>

          {/* External Environment */}
          <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-200/50 col-span-2 sm:col-span-1">
            <div className="text-[10px] text-slate-500 font-medium font-sans">地理高原客行</div>
            <div className={`mt-1 font-mono font-bold text-sm ${prediction.factorContributions.external >= 0 ? "text-slate-900" : "text-slate-500"}`}>
              {prediction.factorContributions.external >= 0 ? "+" : ""}{prediction.factorContributions.external}
            </div>
            <div className="text-[9px] text-slate-500 font-semibold font-sans select-none mt-0.5 bg-white border border-slate-100 rounded py-0.5">
              海拔/东道主/距离
            </div>
          </div>
        </div>
      </div>

      {/* 6. Post-Match Live Review and Accuracy backtesting */}
      {(() => {
        const completedMatches = (allMatches || PRESET_MATCHES).filter(m => m.actualScore && m.isCompleted !== false);

        const stats = completedMatches.map(m => {
          const hT = (teams || TEAMS)[m.homeTeamId];
          const aT = (teams || TEAMS)[m.awayTeamId];
          if (!hT || !aT) return null;
          
          const pred = runMatchPrediction(hT, aT, m, factors);

          const actualDiff = m.actualScore!.home - m.actualScore!.away;
          const actualResult = actualDiff > 0 ? "home" : actualDiff === 0 ? "draw" : "away";

          const [predHomeGoals, predAwayGoals] = pred.recommendedScores.primary.split("-").map(Number);
          const predScoreResult = predHomeGoals > predAwayGoals
            ? "home"
            : predHomeGoals === predAwayGoals
              ? "draw"
              : "away";

          // Calculate predicted direction class from outcome probabilities
          const probResult = pred.homeWinProb > pred.drawProb && pred.homeWinProb > pred.awayWinProb
            ? "home"
            : pred.awayWinProb > pred.drawProb && pred.awayWinProb > pred.homeWinProb
              ? "away"
              : "draw";

          const actualScoreStr = `${m.actualScore!.home}-${m.actualScore!.away}`;
          // Correct if the primary recommended score direction matches the actual result direction
          const isDirectionCorrect = actualResult === predScoreResult;
          
          // Use the predicted score result as the predResult
          const predResult = predScoreResult;
          const isExactHit = pred.recommendedScores.primary === actualScoreStr;
          const isStableHit = pred.recommendedScores.stable === actualScoreStr;
          const isAggressiveHit = pred.recommendedScores.aggressive === actualScoreStr;
          const isAnyScoreHit = isExactHit || isStableHit || isAggressiveHit;

          return {
            match: m,
            home: hT,
            away: aT,
            prediction: pred,
            isDirectionCorrect,
            isExactHit,
            isAnyScoreHit,
            actualScoreStr,
            actualResult,
            predResult
          };
        }).filter(Boolean) as {
          match: Match;
          home: Team;
          away: Team;
          prediction: PredictionResult;
          isDirectionCorrect: boolean;
          isExactHit: boolean;
          isAnyScoreHit: boolean;
          actualScoreStr: string;
          actualResult: string;
          predResult: string;
        }[];

        const totalCompleted = stats.length;
        const directionCorrectCount = stats.filter(s => s.isDirectionCorrect).length;
        const exactHitCount = stats.filter(s => s.isExactHit).length;
        const anyScoreHitCount = stats.filter(s => s.isAnyScoreHit).length;

        const directionAccuracy = totalCompleted > 0 ? (directionCorrectCount / totalCompleted) * 100 : 0;
        const exactAccuracy = totalCompleted > 0 ? (exactHitCount / totalCompleted) * 100 : 0;
        const anyScoreAccuracy = totalCompleted > 0 ? (anyScoreHitCount / totalCompleted) * 100 : 0;

        return (
          <div className="glass-panel rounded-2xl p-6 shadow-md bg-white border border-slate-200/60 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-555/10 flex items-center justify-center text-amber-600">
                  <Target className="w-5 h-5 text-amber-650" id="icon-target-verif" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-800">赛后实况比分复核与模型胜率回测</h4>
                  <p className="text-[10.5px] text-slate-450 mt-0.5">自动抓取已完场的世界杯真实战报，并与当前参数下模型的拟合方向及比分作动态精度比对</p>
                </div>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full font-mono">
                已核发数据: {totalCompleted} 场
              </span>
            </div>

            {/* Accuracy Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/50 text-center shadow-sm">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">已复核场次</span>
                <div className="text-2xl font-black text-slate-800 mt-1 font-mono">{totalCompleted} <span className="text-xs font-normal text-slate-500">场</span></div>
                <p className="text-[9px] text-slate-450 mt-1">自动统计历史完赛记录</p>
              </div>

              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/50 text-center shadow-sm">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">胜平负方向准确率</span>
                <div className="text-2xl font-black text-slate-900 mt-1 font-mono">{directionAccuracy.toFixed(1)}%</div>
                <div className="text-[9px] text-slate-450 mt-1">
                  预测胜/平/负方向命中率 (<span className="font-semibold text-slate-900">{directionCorrectCount}</span>/{totalCompleted})
                </div>
              </div>

              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/50 text-center shadow-sm">
                <span className="text-[10px] text-slate-505 font-bold uppercase tracking-wider block">首选比分直中率</span>
                <div className="text-2xl font-black text-slate-900 mt-1 font-mono">{exactAccuracy.toFixed(1)}%</div>
                <div className="text-[9px] text-slate-450 mt-1">
                  主推精确比分命中率 (<span className="font-semibold text-slate-900">{exactHitCount}</span>/{totalCompleted})
                </div>
              </div>

              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/50 text-center shadow-sm">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">三档策略覆盖率</span>
                <div className="text-2xl font-black text-slate-900 mt-1 font-mono">{anyScoreAccuracy.toFixed(1)}%</div>
                <div className="text-[9px] text-slate-450 mt-1">
                  首选+稳健+博单命中率 (<span className="font-semibold text-slate-900">{anyScoreHitCount}</span>/{totalCompleted})
                </div>
              </div>
            </div>

            {/* Detailed Game Review List — fixed height, scrollable */}
            <div className="overflow-y-auto max-h-[680px] space-y-3 pr-1">
              {stats.map(({ match: m, home: h, away: a, prediction: pred, isDirectionCorrect, isExactHit, isAnyScoreHit, actualScoreStr }) => {
                const isStableHit = pred.recommendedScores.stable === actualScoreStr;
                const isAggressiveHit = pred.recommendedScores.aggressive === actualScoreStr;
                const dateObj = new Date(m.dateTime.replace(" ", "T"));
                const month = dateObj.getMonth() + 1;
                const dateVal = dateObj.getDate();
                const dateDisplay = `${month}月${dateVal}日`;

                return (
                  <div
                    key={m.id}
                    className="flex flex-col p-4 bg-white border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] rounded-xl hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all gap-3.5"
                  >
                    {/* Top row: Date, Teams and Status Banner */}
                    <div className="flex items-center justify-between w-full">
                      {/* Date */}
                      <div className="text-center font-mono shrink-0 border-r-2 border-slate-900 pr-3">
                        <span className="text-[11px] text-slate-900 font-black whitespace-nowrap">{dateDisplay} {m.dateTime.split(" ")[1]}</span>
                      </div>
                      
                      {/* Teams (Centered and Aligned) */}
                      <div className="flex-1 flex items-center px-2 overflow-hidden">
                        {/* Home Team (Right Aligned) */}
                        <div className="flex-1 flex items-center justify-end gap-2 text-sm text-slate-900 font-black min-w-0">
                          <span className="truncate max-w-[85px] text-right">{h.name}</span>
                          <TeamFlag teamId={h.id} className="w-5.5 h-3.5 shadow-sm rounded-sm shrink-0" />
                        </div>
                        
                        {/* Score Badge (Exactly Centered) */}
                        <div className="w-20 flex justify-center shrink-0">
                          <span className="text-xs px-2.5 py-1 rounded-sm bg-yellow-400 text-slate-900 font-mono font-black border-2 border-slate-900 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]">
                            {m.actualScore!.home} : {m.actualScore!.away}
                          </span>
                        </div>

                        {/* Away Team (Left Aligned) */}
                        <div className="flex-1 flex items-center justify-start gap-2 text-sm text-slate-900 font-black min-w-0">
                          <TeamFlag teamId={a.id} className="w-5.5 h-3.5 shadow-sm rounded-sm shrink-0" />
                          <span className="truncate max-w-[85px] text-left">{a.name}</span>
                        </div>
                      </div>

                      {/* Right side check status banner */}
                      <div className="shrink-0 pl-2">
                        <div className={`flex items-center gap-1.5 text-[10px] px-2 py-1 rounded font-black border-2 ${
                          isDirectionCorrect 
                            ? "bg-yellow-400 text-slate-900 border-slate-900 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]" 
                            : "bg-slate-50 text-slate-400 border-slate-200"
                        }`}>
                          {isDirectionCorrect ? "胜负预测正确" : "胜负预测偏差"}
                        </div>
                      </div>
                    </div>

                    <div className="w-full h-0 border-t-2 border-dashed border-slate-900/20"></div>

                    {/* Bottom row: Predictions & Odds */}
                    <div className="flex flex-row w-full text-left text-xs gap-3 md:gap-6 justify-between items-center pl-2">
                      <div className="flex-1 shrink-0">
                        <span className="text-[10px] text-slate-500 block font-bold">方向判断</span>
                        <div className="flex items-center gap-1.5 font-semibold mt-0.5">
                          {isDirectionCorrect ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-slate-900 shrink-0" />
                              <span className="text-slate-900 font-extrabold whitespace-nowrap">命中首推方向</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 text-slate-400 shrink-0" />
                              <span className="text-slate-500 font-semibold text-[11px] whitespace-nowrap">方向偏差</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex-1 shrink-0">
                        <span className="text-[10px] text-slate-500 block font-bold">主推比分</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`font-mono font-bold px-1.5 py-0.5 rounded leading-none shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] whitespace-nowrap transition-all ${
                            isExactHit 
                              ? "bg-yellow-400 text-slate-900 border-2 border-slate-900 font-black" 
                              : "bg-white text-slate-900 border border-slate-900"
                          }`}>
                            {pred.recommendedScores.primary}
                          </span>
                          {isExactHit ? (
                            <span className="text-[9.5px] font-black text-slate-900 bg-yellow-400 border border-slate-900 px-1 py-0.5 rounded leading-none shrink-0 animate-pulse shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] whitespace-nowrap">比分直中!</span>
                          ) : isAnyScoreHit ? (
                            <span className="text-[9.5px] font-bold text-slate-900 bg-slate-50 border border-slate-900 px-1 py-0.5 rounded leading-none shrink-0 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] whitespace-nowrap">策略补防中</span>
                          ) : (
                            <span className="text-[9.5px] font-medium text-slate-400 bg-slate-50 border border-slate-200 px-1 py-0.5 rounded leading-none shrink-0 shadow-[1px_1px_0px_0px_rgba(15,23,42,0.15)] whitespace-nowrap">未中</span>
                          )}
                        </div>
                      </div>

                      <div className="flex-1 shrink-0">
                        <span className="text-[10px] text-slate-500 block font-bold">策略支持集</span>
                        <div className="flex items-center gap-1.5 mt-0.5 font-mono text-[9.5px] whitespace-nowrap">
                          <span className={`px-1.5 py-0.5 rounded font-bold border transition-all ${
                            isStableHit 
                              ? "bg-yellow-400 text-slate-900 border-slate-900 font-black shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]" 
                              : "bg-slate-50 border-slate-200 text-slate-700 font-semibold"
                          }`}>稳:{pred.recommendedScores.stable}</span>
                          <span>•</span>
                          <span className={`px-1.5 py-0.5 rounded font-bold border transition-all ${
                            isAggressiveHit 
                              ? "bg-yellow-400 text-slate-900 border-slate-900 font-black shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]" 
                              : "bg-slate-50 border-slate-200 text-slate-700 font-semibold"
                          }`}>博:{pred.recommendedScores.aggressive}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
