import React from "react";
import { Team, Match, MatchFactors, PredictionResult, ExpertReview } from "../types";
import { Shield, Sparkles, RefreshCw, Trophy, Skull } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ExpertReadProps {
  home: Team;
  away: Team;
  match: Match;
  prediction: PredictionResult;
  factors: MatchFactors;
  review: ExpertReview | null;
  loading: boolean;
  onRefreshReview: () => void;
  isCustomized: boolean; // Has the user customized values?
}

export default function ExpertRead({
  home,
  away,
  match,
  prediction,
  factors,
  review,
  loading,
  onRefreshReview,
  isCustomized
}: ExpertReadProps) {
  return (
    <div className="space-y-6">
      {/* Upper header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm">
        <div>
          <span className="text-[10px] bg-emerald-50 text-emerald-800 font-extrabold uppercase px-1.5 py-0.5 rounded font-mono border border-emerald-200">
            Model Spec Version
          </span>
          <h3 className="text-sm font-bold text-slate-800 font-mono mt-1">public-v2-market-poisson-deep</h3>
        </div>
        <button
          onClick={onRefreshReview}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-300 disabled:bg-slate-100 disabled:text-slate-400 rounded-lg transition-colors cursor-pointer border border-emerald-200"
          id="btn-re-evaluate-tactics"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} id="icon-re-evaluate" />
          {isCustomized ? "加入模型参数重新评估" : "重新评估模型解读"}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Skeleton Loading Card */}
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white/80 p-5 rounded-xl border border-slate-200/60 space-y-3 shadow-sm animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                <div className="space-y-2">
                  <div className="h-3.5 bg-slate-100 rounded w-full"></div>
                  <div className="h-3.5 bg-slate-100 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </motion.div>
        ) : review ? (
          <motion.div
            key="review-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Tactical Counter Analysis Block */}
            <div className="glass-panel p-5 rounded-2xl shadow-sm space-y-2 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" id="icon-sparkles-counter" />
                <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">攻防克制分析</h4>
              </div>
              <p className="text-[13px] text-slate-700 leading-relaxed font-sans">{review.tacticalCounter}</p>
            </div>

            {/* Squad status and players */}
            <div className="glass-panel p-5 rounded-2xl shadow-sm space-y-2 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600" id="icon-shield-squad" />
                <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">伤病与阵容推演</h4>
              </div>
              <p className="text-[13px] text-slate-700 leading-relaxed font-sans">{review.squadCondition}</p>
            </div>

            {/* Path and Promotion analysis */}
            <div className="glass-panel p-5 rounded-2xl shadow-sm space-y-2 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-indigo-600" id="icon-trophy-path" />
                <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">环境、战意与晋级走向</h4>
              </div>
              <p className="text-[13px] text-slate-700 leading-relaxed font-sans">{review.pathAndTrend}</p>
            </div>

            {/* Model primary summary */}
            <div className="bg-emerald-50/75 p-5 rounded-2xl border border-emerald-600/15 shadow-sm space-y-2 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-600"></div>
              <div className="flex items-center gap-2">
                <Skull className="w-4 h-4 text-emerald-700" id="icon-skull-judg" />
                <h4 className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider">核心模型首要判断</h4>
              </div>
              <p className="text-[13.5px] text-slate-900 font-extrabold leading-relaxed font-sans">{review.primaryJudgment}</p>
            </div>
          </motion.div>
        ) : (
          <div className="bg-slate-50 p-8 rounded-xl border border-slate-200 text-center space-y-3">
            <p className="text-sm text-slate-500">未获取到专家模型评估，请点击右上角重新评估生成报告。</p>
            <button
              onClick={onRefreshReview}
              className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 transition-colors rounded-lg text-xs font-semibold cursor-pointer"
            >
              一键生成专业战术报告
            </button>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
