import React from "react";
import { Team, Match, PredictionResult } from "../types";
import { Table, AreaChart, Grid3X3, Database } from "lucide-react";
import TeamFlag from "./TeamFlag";

interface DataSheetProps {
  teams: Record<string, Team>;
  home: Team;
  away: Team;
  prediction: PredictionResult;
}

export default function DataSheet({ teams, home, away, prediction }: DataSheetProps) {
  // Compute Poisson point probability grid based on homeLambda and awayLambda
  const homeLambda = prediction.homeExpectedGoals;
  const awayLambda = prediction.awayExpectedGoals;

  const poissonProb = (k: number, lambda: number): number => {
    let factorial = 1;
    for (let i = 1; i <= k; i++) factorial *= i;
    return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial;
  };

  const maxGoals = 4; // Display a 5x5 grid (0 to 4 goals)
  const grid: number[][] = Array(maxGoals + 1).fill(0).map(() => Array(maxGoals + 1).fill(0));

  let sum = 0;
  for (let h = 0; h <= maxGoals; h++) {
    for (let a = 0; a <= maxGoals; a++) {
      const p = poissonProb(h, homeLambda) * poissonProb(a, awayLambda);
      grid[h][a] = p;
      sum += p;
    }
  }

  // Normalize grid
  if (sum > 0) {
    for (let h = 0; h <= maxGoals; h++) {
      for (let a = 0; a <= maxGoals; a++) {
        grid[h][a] /= sum;
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Poisson Probability Matrix Grid */}
      <div className="glass-panel rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Grid3X3 className="w-5 h-5 text-emerald-600" id="icon-grid3" />
          <h2 className="text-lg font-semibold text-slate-900 font-sans tracking-tight">
            双泊松比分交叉概率矩阵 ($P(x,y)$)
          </h2>
        </div>

        <p className="text-xs text-slate-500 mb-5 leading-relaxed font-sans">
          下方网格中，行代表主队 <strong>{home.name}</strong> 进球数（0至4球），列代表客队 <strong>{away.name}</strong> 进球数（0至4球）。各格百分比代表精确比分出现的数学期望比率。
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse text-xs font-mono bg-white/70 border border-slate-200/80 rounded-xl overflow-hidden shadow-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-205">
                <th className="p-3 text-slate-500 font-bold bg-slate-50">
                  {home.name} \ {away.name}
                </th>
                {[0, 1, 2, 3, 4].map((g) => (
                  <th key={g} className="p-3 text-slate-700 font-bold border-l border-slate-100">
                    {g} 球 (客)
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[0, 1, 2, 3, 4].map((hGoals) => (
                <tr key={hGoals} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-3 font-bold bg-slate-50 border-r border-slate-200 text-slate-700">
                    {hGoals} 球 (主)
                  </td>
                  {[0, 1, 2, 3, 4].map((aGoals) => {
                    const prob = grid[hGoals][aGoals];
                    const isHighest =
                      prediction.recommendedScores.primary === `${hGoals}-${aGoals}`;

                    return (
                      <td
                        key={aGoals}
                        className={`p-3 relative font-bold transition-all border-l border-slate-100 ${
                          isHighest
                            ? "bg-emerald-500/10 text-emerald-800 border-x-2 border-emerald-500/15"
                            : "text-slate-700"
                        }`}
                      >
                        {(prob * 105).toFixed(2)}%
                        {isHighest && (
                          <span className="absolute bottom-1 right-1 text-[8px] bg-emerald-600 text-white font-sans font-semibold px-1 py-0.5 rounded scale-90">
                            主推
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Complete Teams Database Attributes */}
      <div className="glass-panel rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-5 h-5 text-emerald-600" id="icon-database" />
          <h2 className="text-lg font-semibold text-slate-900 font-sans tracking-tight">
            全部模拟国家队核心底层参数表 (2026版)
          </h2>
        </div>

        <p className="text-xs text-slate-500 mb-5 leading-relaxed font-sans">
          模型底层包含以下核心国家队的常态配置（如积分、基础进攻/防守Rating），修改主界面的局部身价值也将会实时更新下表数据：
        </p>

        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white/70 shadow-sm">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="p-3">国家/地区</th>
                <th className="p-3">小组</th>
                <th className="p-3 text-right">FIFA排名</th>
                <th className="p-3 text-right">ELO积分</th>
                <th className="p-3 text-right">身价累加</th>
                <th className="p-3">默认王牌战术</th>
                <th className="p-3 text-right">常态进攻R</th>
                <th className="p-3 text-right">常态防守R</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Object.values(teams).map((team) => {
                const isActiveInCurrent = team.id === home.id || team.id === away.id;

                return (
                  <tr
                    key={team.id}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      isActiveInCurrent ? "bg-emerald-500/10 font-bold text-slate-950" : ""
                    }`}
                  >
                    <td className="p-3 flex items-center gap-2">
                      <TeamFlag teamId={team.id} className="w-5 h-3.5 shadow-sm rounded-sm" />
                      <span className="text-slate-800 font-bold">{team.name}</span>
                    </td>
                    <td className="p-3 font-mono text-slate-500">{team.group}</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-700">
                      #{team.fifaRank}
                    </td>
                    <td className="p-3 text-right font-mono text-slate-600">
                      {team.elo}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-800">
                      €{team.marketValue.toFixed(1)}m
                    </td>
                    <td className="p-3 text-[11px]">
                      <span className="bg-slate-100 text-slate-700 border border-slate-200/80 px-1.5 py-0.5 rounded font-semibold font-sans">
                        {team.tacticsName}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-800">
                      {team.attackingRating}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-indigo-700">
                      {team.defendingRating}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
