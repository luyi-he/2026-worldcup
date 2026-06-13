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
      <div className="neo-card p-6 bg-white">
        <div className="flex items-center gap-2 mb-4">
          <Grid3X3 className="w-5 h-5 text-slate-900 stroke-[2.5]" id="icon-grid3" />
          <h2 className="text-sm font-black text-slate-900 font-sans uppercase tracking-wider">
            双泊松比分交叉概率矩阵 ($P(x,y)$)
          </h2>
        </div>

        <p className="text-xs text-slate-600 mb-5 leading-relaxed font-bold">
          下方网格中，行代表主队 <strong>{home.name}</strong> 进球数（0至4球），列代表客队 <strong>{away.name}</strong> 进球数（0至4球）。各格百分比代表精确比分出现的数学期望比率。
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse text-xs font-mono bg-white border-2 border-slate-900 rounded-lg overflow-hidden shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
            <thead>
              <tr className="bg-slate-100 border-b-2 border-slate-900">
                <th className="p-3 text-slate-900 font-black bg-slate-100 border-r-2 border-slate-900">
                  {home.name} \ {away.name}
                </th>
                {[0, 1, 2, 3, 4].map((g) => (
                  <th key={g} className="p-3 text-slate-900 font-black border-r-2 border-slate-900 last:border-r-0">
                    {g} 球 (客)
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-900">
              {[0, 1, 2, 3, 4].map((hGoals) => (
                <tr key={hGoals} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-black bg-slate-100 border-r-2 border-slate-900 text-slate-900">
                    {hGoals} 球 (主)
                  </td>
                  {[0, 1, 2, 3, 4].map((aGoals) => {
                    const prob = grid[hGoals][aGoals];
                    const isHighest =
                      prediction.recommendedScores.primary === `${hGoals}-${aGoals}`;

                    return (
                      <td
                        key={aGoals}
                        className={`p-3 relative font-black transition-all border-r-2 border-slate-900 last:border-r-0 ${
                          isHighest
                            ? "bg-yellow-400 text-slate-950 border-2 border-slate-900"
                            : "text-slate-800"
                        }`}
                      >
                        {(prob * 100).toFixed(2)}%
                        {isHighest && (
                          <span className="absolute bottom-0.5 right-0.5 text-[8px] bg-slate-900 text-white font-sans font-black px-1.5 py-0.5 rounded border border-slate-900 scale-90">
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
      <div className="neo-card p-6 bg-white">
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-5 h-5 text-slate-900 stroke-[2.5]" id="icon-database" />
          <h2 className="text-sm font-black text-slate-900 font-sans uppercase tracking-wider">
            全部模拟国家队核心底层参数表 (2026版)
          </h2>
        </div>

        <p className="text-xs text-slate-600 mb-5 leading-relaxed font-bold">
          模型底层包含以下核心国家队的常态配置（如积分、基础进攻/防守Rating），修改主界面的局部身价值也将会实时更新下表数据：
        </p>

        <div className="overflow-x-auto rounded-lg border-2 border-slate-900 bg-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
          <table className="w-full text-left text-xs text-slate-800">
            <thead className="bg-slate-100 text-slate-900 font-black uppercase text-[10px] tracking-wider border-b-2 border-slate-900">
              <tr>
                <th className="p-3 border-r border-slate-205">国家/地区</th>
                <th className="p-3 border-r border-slate-205">小组</th>
                <th className="p-3 text-right border-r border-slate-205">FIFA排名</th>
                <th className="p-3 text-right border-r border-slate-205">ELO积分</th>
                <th className="p-3 text-right border-r border-slate-205">身价累加</th>
                <th className="p-3 border-r border-slate-205">默认王牌战术</th>
                <th className="p-3 text-right border-r border-slate-205">常态进攻R</th>
                <th className="p-3 text-right">常态防守R</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {Object.values(teams).map((team) => {
                const isActiveInCurrent = team.id === home.id || team.id === away.id;

                return (
                  <tr
                    key={team.id}
                    className={`transition-colors ${
                      isActiveInCurrent
                        ? "bg-yellow-100 font-black text-slate-950 border-y-2 border-slate-900"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <td className="p-3 flex items-center gap-2 border-r border-slate-205">
                      <TeamFlag teamId={team.id} className="w-5 h-3.5 shadow-sm rounded-sm" />
                      <span className="font-bold">{team.name}</span>
                    </td>
                    <td className="p-3 font-mono border-r border-slate-205">{team.group}</td>
                    <td className="p-3 text-right font-mono font-bold border-r border-slate-205">
                      #{team.fifaRank}
                    </td>
                    <td className="p-3 text-right font-mono border-r border-slate-205">
                      {team.elo}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900 border-r border-slate-205">
                      €{team.marketValue.toFixed(1)}m
                    </td>
                    <td className="p-3 text-[11px] border-r border-slate-205">
                      <span className="bg-slate-900 text-white border border-slate-900 px-2 py-0.5 rounded font-black text-[9px]">
                        {team.tacticsName}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-800 border-r border-slate-205">
                      {team.attackingRating}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-800">
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
