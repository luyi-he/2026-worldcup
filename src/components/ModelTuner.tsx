import React from "react";
import { MatchFactors } from "../types";
import { Sliders, HelpCircle, RefreshCw } from "lucide-react";

interface ModelTunerProps {
  factors: MatchFactors;
  onChange: (newFactors: MatchFactors) => void;
  onReset: () => void;
}

export default function ModelTuner({ factors, onChange, onReset }: ModelTunerProps) {
  const handleSliderChange = (key: keyof MatchFactors, value: number) => {
    onChange({
      ...factors,
      [key]: value,
    });
  };

  const getWeightLabel = (val: number) => {
    if (val === 0) return "禁用";
    if (val < 0.3) return "轻微影响";
    if (val < 0.7) return "正常影响";
    if (val < 1.1) return "强力增强";
    return "主导地位";
  };

  return (
    <div className="neo-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <Sliders className="w-5 h-5 text-slate-900 stroke-[2.5]" id="icon-sliders" />
          <h2 className="text-lg font-black text-slate-900 font-display tracking-tight flex items-center gap-1">⚽ 模型核心因子调优</h2>
        </div>
        <button
          onClick={onReset}
          className="neo-btn px-3 py-1.5 text-xs flex items-center gap-1.5 active:translate-y-0.5"
          title="恢复系统默认因子推荐值"
          id="btn-reset-factors"
        >
          <RefreshCw className="w-3.5 h-3.5" id="icon-refresh" />
          默认推荐
        </button>
      </div>

      <p className="text-xs text-slate-500 mb-6 leading-relaxed font-bold">
        调整以下因子权重，即可实时改变数学预测仿真引擎中双泊松分布公式的参数 $\lambda_i$，即时呈现动态胜平负概率与推荐比分。
      </p>

      <div className="space-y-6">
        {/* Market Value Weight */}
        <div className="space-y-2.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              双方球员身价因子 (Market Value)
              <span className="group relative cursor-pointer">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400 hover:text-slate-650 transition-colors" id="help-mv" />
                <span className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 border-2 border-slate-950 text-slate-100 p-2.5 rounded text-[10px] w-64 leading-normal z-50 shadow-md">
                  换算主力11人及替补席德转累计身价之比。高身价意味着更高的底层射门控制精度与个人解围成功率。
                </span>
              </span>
            </span>
            <span className="font-mono text-yellow-400 bg-slate-900 border-2 border-slate-900 px-2 py-0.5 rounded-md text-[10px] font-black">
              x{(factors.marketValueWeight * 2).toFixed(1)} ({getWeightLabel(factors.marketValueWeight)})
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1.5"
            step="0.1"
            value={factors.marketValueWeight}
            onChange={(e) => handleSliderChange("marketValueWeight", parseFloat(e.target.value))}
            className="w-full"
            id="slider-mv"
          />
        </div>

        {/* Tactics Counter Weight */}
        <div className="space-y-2.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              战术克制与打法因子 (Tactics Match)
              <span className="group relative cursor-pointer">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400 hover:text-slate-655 transition-colors" id="help-tactics" />
                <span className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 border-2 border-slate-950 text-slate-100 p-2.5 rounded text-[10px] w-64 leading-normal z-50 shadow-md">
                  基于5大核心战术（传控、防反、前压、长传、边路过载）的克制机制。例如：低位防反克制全场控球、边路过载撕裂低位等。
                </span>
              </span>
            </span>
            <span className="font-mono text-yellow-400 bg-slate-900 border-2 border-slate-900 px-2 py-0.5 rounded-md text-[10px] font-black">
              +{Math.round(factors.tacticsCounterWeight * 100)}% 灵敏度 ({getWeightLabel(factors.tacticsCounterWeight)})
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1.5"
            step="0.1"
            value={factors.tacticsCounterWeight}
            onChange={(e) => handleSliderChange("tacticsCounterWeight", parseFloat(e.target.value))}
            className="w-full"
            id="slider-tactics"
          />
        </div>

        {/* FIFA Rank Weight */}
        <div className="space-y-2.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              国际排名与 ELO 因子 (FIFA & ELO)
              <span className="group relative cursor-pointer">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400 hover:text-slate-655 transition-colors" id="help-elo" />
                <span className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 border-2 border-slate-950 text-slate-100 p-2.5 rounded text-[10px] w-64 leading-normal z-50 shadow-md">
                  以国家队近三年官方FIFA排名与实时Elo积分表现差值为依据，量化其国际顶级赛事底层竞技底盘和心理基准线。
                </span>
              </span>
            </span>
            <span className="font-mono text-yellow-400 bg-slate-900 border-2 border-slate-900 px-2 py-0.5 rounded-md text-[10px] font-black">
              {factors.fifaRankWeight.toFixed(2)} 强敏系数 ({getWeightLabel(factors.fifaRankWeight)})
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1.5"
            step="0.1"
            value={factors.fifaRankWeight}
            onChange={(e) => handleSliderChange("fifaRankWeight", parseFloat(e.target.value))}
            className="w-full"
            id="slider-fifa"
          />
        </div>

        {/* External Factors Weight */}
        <div className="space-y-2.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              高原气候及跨洲客行因子 (Environment)
              <span className="group relative cursor-pointer">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400 hover:text-slate-655 transition-colors" id="help-ext" />
                <span className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 border-2 border-slate-950 text-slate-100 p-2.5 rounded text-[10px] w-64 leading-normal z-50 shadow-md">
                  包含高海拔低氧损耗、旅途飞行颠簸（如1.4万公里跨洲客行）、东道主主场优势及高强度燥热对体力敏感型打法的影响。
                </span>
              </span>
            </span>
            <span className="font-mono text-yellow-400 bg-slate-900 border-2 border-slate-900 px-2 py-0.5 rounded-md text-[10px] font-black">
              {(factors.externalFactorWeight * 100).toFixed(0)}% 修正度 ({getWeightLabel(factors.externalFactorWeight)})
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1.5"
            step="0.1"
            value={factors.externalFactorWeight}
            onChange={(e) => handleSliderChange("externalFactorWeight", parseFloat(e.target.value))}
            className="w-full"
            id="slider-external"
          />
        </div>

        {/* Form Weight */}
        <div className="space-y-2.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              过往战意及近况战力因子 (Recent Form)
              <span className="group relative cursor-pointer">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400 hover:text-slate-655 transition-colors" id="help-form" />
                <span className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 border-2 border-slate-950 text-slate-100 p-2.5 rounded text-[10px] w-64 leading-normal z-50 shadow-md">
                  控制球队近期过往比赛的净胜球率、锋线火力攻击Rating与防守容错率的缩放影响力。
                </span>
              </span>
            </span>
            <span className="font-mono text-yellow-400 bg-slate-900 border-2 border-slate-900 px-2 py-0.5 rounded-md text-[10px] font-black">
              {factors.formWeight.toFixed(2)}倍率弹性 ({getWeightLabel(factors.formWeight)})
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1.5"
            step="0.1"
            value={factors.formWeight}
            onChange={(e) => handleSliderChange("formWeight", parseFloat(e.target.value))}
            className="w-full"
            id="slider-form"
          />
        </div>
      </div>

      <div className="mt-6 pt-5 border-t-2 border-slate-900 flex items-center gap-2 text-[11px] text-slate-600 font-bold">
        <span className="inline-block w-2.5 h-2.5 rounded-full bg-slate-900 animate-ping"></span>
        {"公式：λ_home = base_Goals * MV_home(W_mv) * ELO_home(W_elo) * Tactic_Advantage(W_tac) * Env_Penalty"}
      </div>
    </div>
  );
}
