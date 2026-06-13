import React, { useState } from "react";
import { Team } from "../types";
import { DollarSign, Plus, Edit2, Users, Save, Check } from "lucide-react";
import TeamFlag from "./TeamFlag";

interface PlayerValueCardProps {
  home: Team;
  away: Team;
  onEditTeamValue: (teamId: string, field: "marketValue", value: number) => void;
}

interface PlayerMock {
  name: string;
  position: string;
  value: number; // in Millions
  age: number;
}

export default function PlayerValueCard({ home, away, onEditTeamValue }: PlayerValueCardProps) {
  // We'll generate realistic squads dynamically for the display, allowing users to tweak individual values
  // We can also let changes sync back to the team cumulative value!
  const getMockList = (team: Team): PlayerMock[] => {
    if (team.id === "MEX") {
      return [
        { name: "Santiago Giménez", position: "前锋 (CF)", value: 45.0, age: 25 },
        { name: "Edson Álvarez", position: "后腰 (DM)", value: 35.0, age: 28 },
        { name: "Luis Chávez", position: "中场 (CM)", value: 14.5, age: 30 },
        { name: "Johan Vásquez", position: "后卫 (CB)", value: 15.0, age: 27 },
        { name: "Julián Quiñones", position: "翅翼 (LW)", value: 13.0, age: 29 },
        { name: "Érick Sánchez", position: "中场 (AM)", value: 10.0, age: 26 },
        { name: "César Montes", position: "后卫 (CB)", value: 9.0, age: 29 },
        { name: "Kevin Álvarez", position: "右翼卫 (RB)", value: 7.0, age: 27 },
        { name: "Malagón", position: "门将 (GK)", value: 6.5, age: 29 },
        { name: "Orbelín Pineda", position: "中场 (CM)", value: 6.0, age: 30 },
      ];
    }
    if (team.id === "RSA") {
      return [
        { name: "Teboho Mokoena", position: "中场 (CM)", value: 8.5, age: 29 },
        { name: "Evidence Makgopa", position: "前锋 (CF)", value: 4.5, age: 26 },
        { name: "Ronwen Williams", position: "门将 (GK)", value: 3.5, age: 34 },
        { name: "Khuliso Mudau", position: "后卫 (RB)", value: 3.0, age: 31 },
        { name: "Aubrey Modiba", position: "后卫 (LB)", value: 2.8, age: 30 },
        { name: "Sphephelo Sithole", position: "后腰 (DM)", value: 2.5, age: 27 },
        { name: "Mothobi Mvala", position: "后卫 (CB)", value: 2.2, age: 32 },
        { name: "Percy Tau", position: "边锋 (RW)", value: 2.0, age: 32 },
        { name: "Themba Zwane", position: "前腰 (AM)", value: 1.5, age: 36 },
        { name: "Oswin Appollis", position: "边锋 (LW)", value: 1.2, age: 24 },
      ];
    }
    if (team.id === "USA") {
      return [
        { name: "Christian Pulisic", position: "边锋 (LW)", value: 50.0, age: 27 },
        { name: "Folarin Balogun", position: "前锋 (CF)", value: 30.0, age: 24 },
        { name: "Weston McKennie", position: "中场 (CM)", value: 28.0, age: 27 },
        { name: "Antonee Robinson", position: "后卫 (LB)", value: 25.0, age: 28 },
        { name: "Tyler Adams", position: "后腰 (DM)", value: 20.0, age: 27 },
        { name: "Yunus Musah", position: "中场 (CM)", value: 18.0, age: 23 },
        { name: "Sergiño Dest", position: "后卫 (RB)", value: 15.0, age: 25 },
        { name: "Chris Richards", position: "后卫 (CB)", value: 14.0, age: 26 },
        { name: "Gio Reyna", position: "前腰 (AM)", value: 12.0, age: 23 },
        { name: "Matt Turner", position: "门将 (GK)", value: 5.0, age: 31 },
      ];
    }
    if (team.id === "PAR") {
      return [
        { name: "Julio Enciso", position: "前卫 (AM)", value: 22.0, age: 22 },
        { name: "Miguel Almirón", position: "边锋 (RW)", value: 20.0, age: 32 },
        { name: "Ramón Sosa", position: "边锋 (LW)", value: 13.0, age: 26 },
        { name: "Mathías Villasanti", position: "后腰 (DM)", value: 10.0, age: 29 },
        { name: "Diego Gómez", position: "中场 (CM)", value: 8.5, age: 23 },
        { name: "Omar Alderete", position: "后卫 (CB)", value: 5.0, age: 29 },
        { name: "Gustavo Gómez", position: "后卫 (CB)", value: 8.5, age: 33 },
        { name: "Júnior Alonso", position: "后卫 (LB)", value: 3.5, age: 33 },
        { name: "Carlos Coronel", position: "门将 (GK)", value: 2.0, age: 29 },
        { name: "Alex Arce", position: "前锋 (CF)", value: 4.0, age: 31 },
      ];
    }
    // Standard mock list for other teams
    const basicValue = team.marketValue / 11;
    return [
      { name: `${team.mainPlayers[0] || "主力一号"}`, position: "前锋 (CF)", value: basicValue * 2, age: 25 },
      { name: `${team.mainPlayers[1] || "主力二号"}`, position: "中场 (CM)", value: basicValue * 1.5, age: 28 },
      { name: `${team.mainPlayers[2] || "主力三号"}`, position: "后卫 (CB)", value: basicValue * 1.2, age: 29 },
      { name: "队员D", position: "边锋 (RW)", value: basicValue * 1.1, age: 24 },
      { name: "队员E", position: "后卫 (LB)", value: basicValue * 0.9, age: 26 },
      { name: "队员F", position: "中场 (DM)", value: basicValue * 0.8, age: 27 },
      { name: "队员G", position: "后卫 (RB)", value: basicValue * 0.8, age: 25 },
      { name: "队员H", position: "门将 (GK)", value: basicValue * 0.6, age: 30 },
      { name: "替补一", position: "中场 (CM)", value: basicValue * 0.5, age: 22 },
      { name: "替补二", position: "前锋 (CF)", value: basicValue * 0.5, age: 21 },
    ];
  };

  const [activeTeam, setActiveTeam] = useState<"home" | "away">("home");
  const selectedTeam = activeTeam === "home" ? home : away;
  const originalPlayers = getMockList(selectedTeam);

  const [customPlayersMap, setCustomPlayersMap] = useState<Record<string, PlayerMock[]>>({});

  const currentPlayers = customPlayersMap[selectedTeam.id] || originalPlayers;

  const handlePlayerValueChange = (index: number, newValStr: string) => {
    const val = parseFloat(newValStr) || 0;
    const copied = [...currentPlayers];
    copied[index] = { ...copied[index], value: val };

    // Calculate sum and update parent
    const totalTeamValue = copied.reduce((sum, p) => sum + p.value, 0);

    setCustomPlayersMap({
      ...customPlayersMap,
      [selectedTeam.id]: copied
    });

    onEditTeamValue(selectedTeam.id, "marketValue", Number(totalTeamValue.toFixed(2)));
  };

  return (
    <div className="neo-card p-6 bg-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-slate-900 stroke-[2.5]" id="icon-users-value" />
          <h2 className="text-sm font-black text-slate-900 font-sans uppercase tracking-wider">首发阵容身价配置</h2>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
          <button
            onClick={() => setActiveTeam("home")}
            className={`px-3 py-1 text-xs font-black rounded transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTeam === "home"
                ? "bg-yellow-400 text-slate-950 border-2 border-slate-900 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]"
                : "text-slate-600 hover:text-slate-900"
            }`}
            id="tab-edit-home"
          >
            <TeamFlag teamId={home.id} className="w-4 h-3 rounded-sm shadow-sm" />
            <span>{home.name}</span>
          </button>
          <button
            onClick={() => setActiveTeam("away")}
            className={`px-3 py-1 text-xs font-black rounded transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTeam === "away"
                ? "bg-yellow-400 text-slate-950 border-2 border-slate-900 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]"
                : "text-slate-600 hover:text-slate-900"
            }`}
            id="tab-edit-away"
          >
            <TeamFlag teamId={away.id} className="w-4 h-3 rounded-sm shadow-sm" />
            <span>{away.name}</span>
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-600 mb-5 leading-relaxed font-bold">
        调整下方队员的估算德转身价，系统将实时触发上方球队总身价重新折算、累积，并将结果代入双泊松预测模型！
      </p>

      {/* Players List Table */}
      <div className="overflow-x-auto border-2 border-slate-900 rounded-lg bg-white">
        <table className="w-full text-left text-xs text-slate-800">
          <thead className="bg-slate-100 text-slate-900 font-black uppercase text-[10px] tracking-wider border-b-2 border-slate-900">
            <tr>
              <th className="p-3">姓名</th>
              <th className="p-3">场上位置</th>
              <th className="p-3">年龄</th>
              <th className="p-3 text-right">德转估计身价</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-slate-100">
            {currentPlayers.map((player, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                <td className="p-3 font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="text-[10px]">⚽</span>
                  {player.name}
                </td>
                <td className="p-3">
                  <span className="bg-slate-900 text-white border border-slate-900 px-2 py-0.5 rounded font-black text-[9px]">
                    {player.position}
                  </span>
                </td>
                <td className="p-3 font-mono text-slate-800 font-bold">{player.age} 岁</td>
                <td className="p-3 text-right">
                  <div className="inline-flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-500 font-bold font-mono">€</span>
                    <input
                      type="number"
                      step="0.5"
                      min="0.1"
                      value={player.value}
                      onChange={(e) => handlePlayerValueChange(idx, e.target.value)}
                      className="w-20 h-7 px-1.5 py-0.5 text-right font-mono font-black text-slate-900 bg-white border-2 border-slate-900 rounded focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                    <span className="text-[10px] text-slate-500 font-bold font-mono">m</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 bg-yellow-400 border-2 border-slate-900 p-4 rounded-lg flex items-center justify-between shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-slate-950 font-black animate-bounce" id="icon-dollar-pulse" />
          <span className="text-xs text-slate-950 font-black font-sans">
            {selectedTeam.name}首发德转累加总身价：
          </span>
        </div>
        <span className="font-mono font-black text-lg text-slate-950">
          €{selectedTeam.marketValue.toFixed(2)}m
        </span>
      </div>
    </div>
  );
}
