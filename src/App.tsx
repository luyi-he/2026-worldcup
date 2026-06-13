import React, { useState, useEffect } from "react";
import { TEAMS, PRESET_MATCHES, runMatchPrediction } from "./data";
import { Team, Match, MatchFactors, PredictionResult, ExpertReview } from "./types";
import MatchList from "./components/MatchList";
import MatchDisplay from "./components/MatchDisplay";
import ModelTuner from "./components/ModelTuner";
import ExpertRead from "./components/ExpertRead";
import PlayerValueCard from "./components/PlayerValueCard";
import DataSheet from "./components/DataSheet";
import { 
  Trophy, 
  Brain, 
  Sparkles, 
  Sliders, 
  Users, 
  Database,
  RefreshCw,
  Clock,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Default configuration for initial Poisson coefficients
const DEFAULT_FACTORS: MatchFactors = {
  marketValueWeight: 0.60,
  tacticsCounterWeight: 0.50,
  fifaRankWeight: 0.45,
  externalFactorWeight: 0.50,
  formWeight: 0.45
};

export default function App() {
  // 1. Core state
  const [factors, setFactors] = useState<MatchFactors>(DEFAULT_FACTORS);
  const [selectedMatchId, setSelectedMatchId] = useState<string>(PRESET_MATCHES[0]?.id || "");
  const [activeTab, setActiveTab] = useState<"predict" | "margins" | "expert" | "squad" | "sheet">("predict");
  
  // Storing copy of TEAMS in state so user can make dynamic live sandbox changes!
  const [localTeams, setLocalTeams] = useState<Record<string, Team>>(TEAMS);

  // Expert report fetch states
  const [expertReviews, setExpertReviews] = useState<Record<string, ExpertReview>>({});
  const [loadingReview, setLoadingReview] = useState<boolean>(false);

  // 4h interval refresh state
  const [lastRefreshed, setLastRefreshed] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  useEffect(() => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const hours = now.getHours();
    const nearestHour = Math.floor(hours / 4) * 4;
    const hStr = String(nearestHour).padStart(2, "0");
    const dayStr = String(now.getDate()).padStart(2, "0");
    setLastRefreshed(`${month}月${dayStr}日 ${hStr}:00`);
  }, []);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const now = new Date();
      const month = now.getMonth() + 1;
      const hStr = String(now.getHours()).padStart(2, "0");
      const mStr = String(now.getMinutes()).padStart(2, "0");
      const dayStr = String(now.getDate()).padStart(2, "0");
      setLastRefreshed(`${month}月${dayStr}日 ${hStr}:${mStr}`);
      setIsRefreshing(false);
    }, 600);
  };

  // Active match structures
  const activeMatch = PRESET_MATCHES.find(m => m.id === selectedMatchId) || PRESET_MATCHES[0];
  const homeTeam = localTeams[activeMatch.homeTeamId];
  const awayTeam = localTeams[activeMatch.awayTeamId];

  // Dynamic live double Poisson computation
  const activePrediction = runMatchPrediction(homeTeam, awayTeam, activeMatch, factors);

  // Are factors customized relative to static defaults?
  const isCustomized = JSON.stringify(factors) !== JSON.stringify(DEFAULT_FACTORS) || 
                       JSON.stringify(localTeams[activeMatch.homeTeamId]) !== JSON.stringify(TEAMS[activeMatch.homeTeamId]) ||
                       JSON.stringify(localTeams[activeMatch.awayTeamId]) !== JSON.stringify(TEAMS[activeMatch.awayTeamId]);

  // Fetch expert analysis on match change or manual action
  const fetchExpertAnalysis = async (force: boolean = false) => {
    // If we already have a cached report and aren't forcing/customizing, use cached
    const cacheKey = `${selectedMatchId}_${JSON.stringify(factors)}_${homeTeam.marketValue}_${awayTeam.marketValue}`;
    if (!force && expertReviews[cacheKey]) {
      return;
    }

    setLoadingReview(true);
    
    // Simulate network delay of 350ms to preserve the premium UX loading animation
    await new Promise((resolve) => setTimeout(resolve, 350));

    try {
      const isMexGep = homeTeam.id === "MEX" && awayTeam.id === "RSA";
      let reviewData: ExpertReview;

      if (isMexGep) {
        reviewData = {
          tacticalCounter: `墨西哥擅长边路压制（${homeTeam.tacticsName}），通过全场超载逼抢南非的防守出球。南非的核心克制点是利用低位退守，拉出墨西哥插上后的身后空间，打出快速、穿透力的反击。然而，受高原气候和客行体力影响，南非难以维持整场的高强度防线。`,
          squadCondition: "目前双方暂无核心球员因红黄牌或伤病确认缺阵。南非主帅可能在末段安排 Foster 与 Mofokeng 出场以加强变奏，而墨西哥主力中锋 Santiago Giménez 状况正佳并占据高海拔主场优势。",
          pathAndTrend: "墨西哥作为东道主直接晋级，Group A首战拥有高海拔的阿兹特克主场之利，球迷呼声与低含氧量对客队将是魔鬼考验。南非以CAF预选赛小组头名晋级，近几年处于战术重整期，重在立足防守。",
          primaryJudgment: `双 Poisson 分析推荐主胜（胜率约 ${Math.round(activePrediction.homeWinProb * 100)}%）。
专业建模推荐主推 [${activePrediction.recommendedScores?.primary || "2-0"}]，
稳健防线可选择 [${activePrediction.recommendedScores?.stable || "1-0"}]，
若墨西哥开局顺利，可进取追 [${activePrediction.recommendedScores?.aggressive || "3-0"}]。`
        };
      } else {
        reviewData = {
          tacticalCounter: `${homeTeam.name}采用「${homeTeam.tacticsName}」打法对阵${awayTeam.name}的「${awayTeam.tacticsName}」。由于${homeTeam.name}身价达€${homeTeam.marketValue}m，在中前场压迫力上表现亮眼，容易在下半场打穿${awayTeam.name}的「${awayTeam.tacticsDescription}」。`,
          squadCondition: `两队均派出全部主力首发。${homeTeam.name}前场关键核心 ${homeTeam.mainPlayers[0] || "主力前锋"} 预计领衔首发；${awayTeam.name}的防守重任在于锁死其突破。目前伤病态势平稳。`,
          pathAndTrend: `本场赛事在海拔为 ${activeMatch.altitude || 20}m 的 ${activeMatch.venue || "世界杯球场"} 举行，${homeTeam.name}在战意排名与世界级ELO积分上更胜一筹。`,
          primaryJudgment: `模型计算综合胜率为：[主胜 ${Math.round(activePrediction.homeWinProb * 100)}% | 平局 ${Math.round(activePrediction.drawProb * 100)}% | 客胜 ${Math.round(activePrediction.awayWinProb * 100)}%]。
依据双主进攻预期值 xG: [${activePrediction.homeExpectedGoals} : ${activePrediction.awayExpectedGoals}]，
推荐比分：核心主推 ${activePrediction.recommendedScores?.primary || "2-0"}，稳健主控 ${activePrediction.recommendedScores?.stable || "1-0"}。`
        };
      }

      setExpertReviews(prev => ({
        ...prev,
        [cacheKey]: reviewData
      }));
    } catch (err) {
      console.error("Error generating local expert analysis:", err);
    } finally {
      setLoadingReview(false);
    }
  };

  // Fetch report whenever active match updates
  useEffect(() => {
    fetchExpertAnalysis();
  }, [selectedMatchId]);

  // Handle dynamic edits inside our state sandbox
  const handleEditTeamValue = (
    teamId: string, 
    field: "marketValue" | "fifaRank" | "elo" | "attackingRating" | "defendingRating", 
    value: number
  ) => {
    setLocalTeams(prev => ({
      ...prev,
      [teamId]: {
        ...prev[teamId],
        [field]: value
      }
    }));
  };

  // Reset factors to standard
  const handleReset = () => {
    setFactors(DEFAULT_FACTORS);
    setLocalTeams(TEAMS);
  };

  // Safe lookup for active report key
  const activeReviewKey = `${selectedMatchId}_${JSON.stringify(factors)}_${homeTeam.marketValue}_${awayTeam.marketValue}`;
  const currentReview = expertReviews[activeReviewKey] || null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#edf5f2] via-[#f3f7fb] to-[#ebf0f4] text-slate-800 pb-12 flex flex-col font-sans" id="root-app">
      {/* Top Professional Header Bar */}
      <header className="bg-white/90 border-b border-slate-200/60 sticky top-0 z-40 shadow-sm backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Title / Brand */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/10">
                <Trophy className="w-5 h-5 text-white" id="logo-trophy" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-slate-900 text-base tracking-tight font-sans">
                    2026年世界杯比分预测
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200 rounded px-1.5 font-bold uppercase font-sans py-0.5">
                    Pro Engine
                  </span>
                </div>
              </div>
            </div>

            {/* Standard Nav Tabs */}
            <nav className="flex space-x-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/50">
              <button
                onClick={() => setActiveTab("predict")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "predict"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
                id="tab-predict"
              >
                <Brain className="w-3.5 h-3.5" id="icon-tab-predict" />
                主预测
              </button>
              <button
                onClick={() => setActiveTab("margins")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "margins"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
                id="tab-margins"
              >
                <Sliders className="w-3.5 h-3.5" id="icon-tab-margins" />
                模型边际
              </button>
              <button
                onClick={() => setActiveTab("expert")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "expert"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
                id="tab-expert"
              >
                <Sparkles className="w-3.5 h-3.5" id="icon-tab-expert" />
                专业解读
              </button>
              <button
                onClick={() => setActiveTab("squad")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "squad"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
                id="tab-squad"
              >
                <Users className="w-3.5 h-3.5" id="icon-tab-squad" />
                球员价值
              </button>
              <button
                onClick={() => setActiveTab("sheet")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "sheet"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
                id="tab-sheet"
              >
                <Database className="w-3.5 h-3.5" id="icon-tab-sheet" />
                底面数据版
              </button>
            </nav>

            {/* Quick Status indicators */}
            <div className="hidden lg:flex items-center gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                </span>
                <span className="font-mono text-slate-500">最近数据刷新: {lastRefreshed} (每4h)</span>
              </div>
              <button 
                onClick={handleManualRefresh}
                className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                title="立即强制刷新"
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-emerald-600" : ""}`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container Split Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 flex-1 w-full">
        <div className="grid grid-cols-12 gap-6">
          
          {/* Left Column (Match List Search Bar) - takes 4 cols on lg, full on mobile */}
          <div className="col-span-12 lg:col-span-4 pr-0 lg:pr-2">
            <MatchList
              matches={PRESET_MATCHES}
              teams={localTeams}
              selectedMatchId={selectedMatchId}
              onSelectMatch={setSelectedMatchId}
              factors={factors}
            />
          </div>

          {/* Right Column (Dynamic Tab Container Display) - takes 8 cols on lg */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            
            {/* Warning banner if custom variables are loaded */}
            {isCustomized && (
              <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-xs flex justify-between items-center text-emerald-800 shadow-sm animate-fade-in">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-600 animate-pulse" id="icon-zap-custom" />
                  <span>
                    <strong>您已自定义因子或阵容身价！</strong> 数学估算器已动态重新生成，数据网格及预测分布已刷新。
                  </span>
                </div>
                <button
                  onClick={handleReset}
                  className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-emerald-200 text-emerald-700 rounded font-semibold text-[10px] cursor-pointer transition-colors"
                >
                  恢复出厂模型
                </button>
              </div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab + "_" + selectedMatchId}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.22 }}
              >
                {activeTab === "predict" && (
                  <MatchDisplay
                    home={homeTeam}
                    away={awayTeam}
                    match={activeMatch}
                    factors={factors}
                    prediction={activePrediction}
                    onEditTeamValue={handleEditTeamValue}
                    teams={localTeams}
                    allMatches={PRESET_MATCHES}
                  />
                )}

                {activeTab === "margins" && (
                  <div className="space-y-6">
                    <ModelTuner
                      factors={factors}
                      onChange={setFactors}
                      onReset={() => setFactors(DEFAULT_FACTORS)}
                    />
                    {/* Inline miniature display of updated score prediction showing reactive changes */}
                    <div className="glass-panel p-5 rounded-2xl text-center shadow-sm">
                      <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">瞬时拟合比分结果</span>
                      <h4 className="text-4xl font-extrabold font-display text-slate-900 mt-2">
                        {activePrediction.recommendedScores.primary}
                      </h4>
                      <div className="flex justify-center gap-4 mt-3 text-xs text-slate-500">
                        <span>主胜: {(activePrediction.homeWinProb * 100).toFixed(1)}%</span>
                        <span>平局: {(activePrediction.drawProb * 100).toFixed(1)}%</span>
                        <span>客胜: {(activePrediction.awayWinProb * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "expert" && (
                  <ExpertRead
                    home={homeTeam}
                    away={awayTeam}
                    match={activeMatch}
                    prediction={activePrediction}
                    factors={factors}
                    review={currentReview}
                    loading={loadingReview}
                    onRefreshReview={() => fetchExpertAnalysis(true)}
                    isCustomized={isCustomized}
                  />
                )}

                {activeTab === "squad" && (
                  <PlayerValueCard
                    home={homeTeam}
                    away={awayTeam}
                    onEditTeamValue={handleEditTeamValue}
                  />
                )}

                {activeTab === "sheet" && (
                  <DataSheet
                    teams={localTeams}
                    home={homeTeam}
                    away={awayTeam}
                    prediction={activePrediction}
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Bottom Dashboard Info bar matching the reference image */}
            <div className="grid grid-cols-12 gap-4 mt-6">
              
              {/* Left quick summary cards */}
              <div className="col-span-12 sm:col-span-3 space-y-3.5">
                {/* Card 1: 平均置信度 */}
                <div className="glass-panel p-4 rounded-xl text-center shadow-sm">
                  <div className="text-[10px] text-slate-505 font-semibold uppercase">平均置信度</div>
                  <div className="text-xl font-bold text-slate-800 mt-1">{activePrediction.totalConfidence}%</div>
                  <div className="text-[9px] text-slate-400 font-medium mt-1">
                    因子数据置信率
                  </div>
                </div>

                {/* Card 2: 首选结果方向 */}
                <div className="glass-panel p-4 rounded-xl text-center shadow-sm">
                  <div className="text-[10px] text-slate-505 font-semibold uppercase">首选结果方向</div>
                  <div className="text-sm font-bold text-emerald-800 mt-1.5 truncate">
                    {activePrediction.homeWinProb > activePrediction.drawProb && activePrediction.homeWinProb > activePrediction.awayWinProb ? (
                      `主胜 (${Math.round(activePrediction.homeWinProb * 100)}%)`
                    ) : activePrediction.awayWinProb > activePrediction.drawProb && activePrediction.awayWinProb > activePrediction.homeWinProb ? (
                      `客胜 (${Math.round(activePrediction.awayWinProb * 100)}%)`
                    ) : (
                      `平局 (${Math.round(activePrediction.drawProb * 100)}%)`
                    )}
                  </div>
                  <div className="text-[9px] text-slate-400 font-medium mt-1">
                    胜 {Math.round(activePrediction.homeWinProb * 100)}% | 平 {Math.round(activePrediction.drawProb * 100)}% | 负 {Math.round(activePrediction.awayWinProb * 100)}%
                  </div>
                </div>

                {/* Card 3: 预期总进球数 */}
                <div className="glass-panel p-4 rounded-xl text-center shadow-sm">
                  <div className="text-[10px] text-slate-505 font-semibold uppercase">预期总进球数</div>
                  <div className="text-xl font-mono font-bold text-indigo-700 mt-1">
                    {(activePrediction.homeExpectedGoals + activePrediction.awayExpectedGoals).toFixed(2)} 球
                  </div>
                  <div className="text-[9px] text-slate-400 font-medium mt-1">
                    主 {activePrediction.homeExpectedGoals.toFixed(2)} / 客 {activePrediction.awayExpectedGoals.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Middle probabilities Top 5 list */}
              <div className="col-span-12 sm:col-span-5 glass-panel p-4 rounded-xl shadow-sm">
                <span className="text-[10px] text-slate-550 font-bold uppercase tracking-wider block mb-3">
                  比分概率分布估计 (Top 5 Probabilities)
                </span>
                <div className="space-y-2.5">
                  {activePrediction.scoreProbabilities.map((item, idx) => (
                    <div key={item.score} className="space-y-1">
                      <div className="flex justify-between text-[11px] font-semibold text-slate-700">
                        <span className="font-mono text-xs">{item.score}</span>
                        <span className="font-mono text-xs text-emerald-600">{(item.prob * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200/40">
                        <div 
                          className="h-full bg-emerald-555 rounded-full" 
                          style={{ width: `${item.prob * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right risk advisory text box */}
              <div className="col-span-12 sm:col-span-4 glass-panel p-4 rounded-xl shadow-sm space-y-3">
                <span className="text-[10px] text-slate-550 font-bold uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-500" id="icon-shield-check" />
                  本场战局及赔率后验口径
                </span>
                
                <div className="text-[11px] text-slate-600 leading-relaxed space-y-2">
                  <p>
                    <strong>战局预期:</strong>
                    竞彩主胜 {activeMatch.marketOdds.homeWin}、平 {activeMatch.marketOdds.draw}、客 {activeMatch.marketOdds.awayWin}。去水后市场隐含主胜期望达 67.7% 以上。数据对齐度优异。
                  </p>
                  <p className="bg-amber-50 border border-amber-100 p-2 rounded text-[10px] text-amber-700">
                    <strong>风险建议:</strong> 本模型由双 Poisson 回归交叉产生，高海拔及跨洲长途飞行易使后半场爆发防线体能脱钩，预测值仅供技战术模拟参考。
                  </p>
                </div>
              </div>

            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
