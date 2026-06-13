import React, { useState, useEffect } from "react";
import { Team, Match, MatchFactors, PredictionResult, ExpertReview } from "../types";
import { Shield, Sparkles, RefreshCw, Trophy, Skull, Key, Send, Trash2, Bot, User, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import TeamFlag from "./TeamFlag";

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

interface ChatMessage {
  role: "user" | "model";
  text: string;
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
  // 1. API Key State
  const [apiKeyInput, setApiKeyInput] = useState<string>("");
  const [savedApiKey, setSavedApiKey] = useState<string>("");
  const [showKeyInput, setShowKeyInput] = useState<boolean>(false);

  // 2. AGI Analysis States
  const [agiReview, setAgiReview] = useState<ExpertReview | null>(null);
  const [agiLoading, setAgiLoading] = useState<boolean>(false);
  const [agiError, setAgiError] = useState<string>("");

  // 3. AGI Chat States
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState<string>("");
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const [chatError, setChatError] = useState<string>("");

  // Load API Key from localStorage
  useEffect(() => {
    const key = localStorage.getItem("gemini_api_key") || "";
    setSavedApiKey(key);
    if (key) {
      setApiKeyInput(key);
    }
  }, []);

  // Reset local AGI states when the active match, tuner weights, or team strengths change
  useEffect(() => {
    setAgiReview(null);
    setChatMessages([]);
    setChatError("");
    setAgiError("");
  }, [match.id, JSON.stringify(factors), home.marketValue, away.marketValue, home.elo, away.elo]);

  // Handle saving API key
  const handleSaveApiKey = () => {
    const trimmed = apiKeyInput.trim();
    localStorage.setItem("gemini_api_key", trimmed);
    setSavedApiKey(trimmed);
    setShowKeyInput(false);
  };

  // Handle clearing API key
  const handleClearApiKey = () => {
    localStorage.removeItem("gemini_api_key");
    setSavedApiKey("");
    setApiKeyInput("");
    setAgiReview(null);
    setChatMessages([]);
  };

  // Generate AGI Tactical Report via client-side Gemini API
  const generateAgiReport = async () => {
    if (!savedApiKey) return;
    setAgiLoading(true);
    setAgiError("");

    const systemPrompt = `你是一位世界顶级的足球战术解说大师和量化分析专家。
请为本场2026年世界杯小组赛撰写一份深度专业战术预测报告：
主队：${home.name} (身价: €${home.marketValue}m, FIFA排名: ${home.fifaRank}, ELO评分: ${home.elo}, 战术打法: ${home.tacticsName} - ${home.tacticsDescription})
客队：${away.name} (身价: €${away.marketValue}m, FIFA排名: ${away.fifaRank}, ELO评分: ${away.elo}, 战术打法: ${away.tacticsName} - ${away.tacticsDescription})
赛事信息：时间: ${match.dateTime}, 场地: ${match.venue}, 海拔: ${match.altitude}m, 天气: ${match.weather}。
当前数学模型预测胜率：主队胜 ${(prediction.homeWinProb * 100).toFixed(0)}%, 平局 ${(prediction.drawProb * 100).toFixed(0)}%, 客队胜 ${(prediction.awayWinProb * 100).toFixed(0)}%。
模型进球期望 (xG)：主队 ${prediction.homeExpectedGoals} vs 客队 ${prediction.awayExpectedGoals}。
模型主推比分: ${prediction.recommendedScores.primary}, 稳健比分: ${prediction.recommendedScores.stable}, 进取比分: ${prediction.recommendedScores.aggressive}。

请生成一个 JSON 对象，必须精确包含以下四个字段（只需纯 JSON 文本，确保可以被客户端安全解析，不要用 Markdown 的 \`\`\`json 标记包裹）：
{
  "tacticalCounter": "攻防克制分析内容（包括两队战术打法的博弈克制、气候高海拔对体能和防线前插的影响、旅行距离造成的疲劳差对技战术发挥的具体影响，要求在200字以内，专业透彻）",
  "squadCondition": "伤病与阵容推演内容（结合双方主推主力球员，分析两队的核心对战博弈，比如关键防守落位、爆点突破等，要求在150字以内，符合实战解说语气）",
  "pathAndTrend": "环境与晋级走向（分析本场比赛对各自小组出线形势的关键战术价值、战意影响以及出线大势，在150字以内）",
  "primaryJudgment": "核心模型首要研判（结合泊松比分推荐，给出一份简练、一针见血的终极投注或比分预测推荐，在100字以内，语气要果断、专业）"
}
`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${savedApiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: systemPrompt }]
              }
            ],
            generationConfig: {
              responseMimeType: "application/json"
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error(`API 请求失败，状态码: ${response.status}`);
      }

      const resData = await response.json();
      const text = resData.candidates?.[0]?.content?.parts?.[0]?.text || "";
      
      // Clean up markdown block if model outputted it despite instructions
      let jsonText = text.trim();
      if (jsonText.startsWith("```json")) {
        jsonText = jsonText.substring(7);
      }
      if (jsonText.endsWith("```")) {
        jsonText = jsonText.substring(0, jsonText.length - 3);
      }
      jsonText = jsonText.trim();

      const parsed: ExpertReview = JSON.parse(jsonText);
      setAgiReview(parsed);
    } catch (err: any) {
      console.error("Gemini API Error:", err);
      setAgiError(err.message || "请求 Gemini 接口时发生错误，请检查网络或您的 API Key。");
    } finally {
      setAgiLoading(false);
    }
  };

  // Handle sending a chat message to the AGI analyst
  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || !savedApiKey || chatLoading) return;

    const userText = chatInput.trim();
    const updatedMessages = [...chatMessages, { role: "user", text: userText } as ChatMessage];
    setChatMessages(updatedMessages);
    setChatInput("");
    setChatLoading(true);
    setChatError("");

    const systemInstruction = `你是一位资深的足球战术解说大师和世界杯量化分析专家。
用户正在与你讨论以下这场 2026 年世界杯小组赛：
主队：${home.name} (身价: €${home.marketValue}m, FIFA排名: ${home.fifaRank}, ELO: ${home.elo}, 战术: ${home.tacticsName})
客队：${away.name} (身价: €${away.marketValue}m, FIFA排名: ${away.fifaRank}, ELO: ${away.elo}, 战术: ${away.tacticsName})
场地：${match.venue} (海拔: ${match.altitude}m, 天气: ${match.weather})
模型预测：胜率 [主胜 ${(prediction.homeWinProb * 100).toFixed(0)}% | 平局 ${(prediction.drawProb * 100).toFixed(0)}% | 客胜 ${(prediction.awayWinProb * 100).toFixed(0)}%]
期望进球值 xG：[${prediction.homeExpectedGoals} : ${prediction.awayExpectedGoals}]
推荐比分：核心主推 ${prediction.recommendedScores.primary}，稳健防守 ${prediction.recommendedScores.stable}。
本场真实赛果：${match.actualScore ? `完赛比分 ${match.actualScore.home}:${match.actualScore.away}` : "尚未开赛"}

请结合上述战术打法、环境制约以及数据模型，回答用户的提问。
请保持口吻专业、透彻且风趣，就像解说界的大师。字数尽量控制在 200 字以内，直击要害。`;

    try {
      // Build history contents alternating roles
      const contents = updatedMessages.map(msg => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.text }]
      }));

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${savedApiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemInstruction }]
            },
            contents: contents
          })
        }
      );

      if (!response.ok) {
        throw new Error(`发送失败，状态码: ${response.status}`);
      }

      const resData = await response.json();
      const responseText = resData.candidates?.[0]?.content?.parts?.[0]?.text || "抱歉，我无法生成回答。";
      
      setChatMessages([...updatedMessages, { role: "model", text: responseText }]);
    } catch (err: any) {
      console.error("Chat Gemini API Error:", err);
      setChatError("AI 战术大师暂时掉线，请检查网络或重试。");
    } finally {
      chatLoading && setChatLoading(false);
    }
  };

  // Determine which review to show: AGI review if generated, otherwise fallback to offline review
  const displayReview = agiReview || review;
  const isAgiActive = !!agiReview;

  return (
    <div className="space-y-6">
      {/* 1. API Key Control Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <Key className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-extrabold text-slate-800">AGI 智能解读引擎</h4>
              {savedApiKey ? (
                <span className="text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-1 py-0.2 rounded font-bold">
                  🟢 Gemini 已锁定
                </span>
              ) : (
                <span className="text-[9px] bg-slate-100 text-slate-500 border border-slate-200 px-1 py-0.2 rounded font-bold">
                  ⚪ 离线模拟模式
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {savedApiKey 
                ? "使用 Google Gemini AGI 引擎对战术进行实时深度智能解读与咨询" 
                : "可配置 Gemini API Key 以激活 AGI 高级功能（离线模式将采用规则拟合）"}
            </p>
          </div>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          {savedApiKey ? (
            <>
              <button
                onClick={handleClearApiKey}
                className="px-2.5 py-1.5 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200 cursor-pointer flex-1 md:flex-none"
              >
                清除 Key
              </button>
              <button
                onClick={() => setShowKeyInput(!showKeyInput)}
                className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 cursor-pointer flex-1 md:flex-none"
              >
                修改 Key
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowKeyInput(!showKeyInput)}
              className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200 cursor-pointer w-full md:w-auto"
            >
              🔑 配置 API Key
            </button>
          )}
        </div>
      </div>

      {/* API Key Input Dialog */}
      {showKeyInput && (
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl shadow-inner space-y-3 animate-fade-in">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">输入您的 Gemini API Key：</label>
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="请输入以 AIzaSy 开头的 Gemini API Key"
              className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              注意：API Key 仅安全保存在您的本地浏览器中（LocalStorage），请求直接发往 Google 官方，不经过任何中间服务器。
            </span>
          </div>
          <div className="flex justify-end gap-2 text-xs">
            <button
              onClick={() => setShowKeyInput(false)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-600 transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              onClick={handleSaveApiKey}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold transition-colors cursor-pointer"
            >
              保存并锁固
            </button>
          </div>
        </div>
      )}

      {/* 2. Tactical Analysis Action Bar */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm">
        <div>
          <span className="text-[10px] bg-slate-100 text-slate-600 font-extrabold uppercase px-1.5 py-0.5 rounded font-mono border border-slate-200">
            {savedApiKey ? "Google Gemini AGI Engine" : "Local Logic Fitting Engine"}
          </span>
          <h3 className="text-xs font-bold text-slate-800 font-mono mt-1">
            {savedApiKey ? "gemini-2.5-flash (Real-Time AGI)" : "public-v2-market-poisson-deep"}
          </h3>
        </div>
        
        {savedApiKey ? (
          <button
            onClick={generateAgiReport}
            disabled={agiLoading}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-400 disabled:to-slate-500 rounded-lg transition-all cursor-pointer shadow-sm shadow-emerald-500/10"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${agiLoading ? "animate-spin" : ""}`} />
            {agiLoading ? "AI 深度计算中..." : "⚡ 生成 Gemini AGI 智能报告"}
          </button>
        ) : (
          <button
            onClick={onRefreshReview}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-300 disabled:bg-slate-100 disabled:text-slate-400 rounded-lg transition-colors cursor-pointer border border-emerald-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            {isCustomized ? "加入模型参数重新评估" : "重新评估模型解读"}
          </button>
        )}
      </div>

      {agiError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl text-xs">
          <strong>接口错误：</strong> {agiError}
        </div>
      )}

      {/* 3. Tactical Report Panels */}
      <AnimatePresence mode="wait">
        {(loading || agiLoading) ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
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
        ) : displayReview ? (
          <motion.div
            key="review-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Tag displaying AGI active status */}
            {isAgiActive && (
              <div className="px-1 py-0.5 text-[10px] text-emerald-800 font-bold flex items-center gap-1.5 bg-emerald-50 rounded-lg w-max border border-emerald-200 animate-pulse">
                <Sparkles className="w-3 h-3" />
                <span>实时 Google Gemini AGI 生成报告</span>
              </div>
            )}

            {/* Tactical Counter Analysis Block */}
            <div className="glass-panel p-5 rounded-2xl shadow-sm space-y-2 relative overflow-hidden bg-white border border-slate-200/50">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">攻防克制分析</h4>
              </div>
              <p className="text-[13px] text-slate-700 leading-relaxed font-sans">{displayReview.tacticalCounter}</p>
            </div>

            {/* Squad status and players */}
            <div className="glass-panel p-5 rounded-2xl shadow-sm space-y-2 relative overflow-hidden bg-white border border-slate-200/50">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">伤病与阵容推演</h4>
              </div>
              <p className="text-[13px] text-slate-700 leading-relaxed font-sans">{displayReview.squadCondition}</p>
            </div>

            {/* Path and Promotion analysis */}
            <div className="glass-panel p-5 rounded-2xl shadow-sm space-y-2 relative overflow-hidden bg-white border border-slate-200/50">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">环境、战意与出线走向</h4>
              </div>
              <p className="text-[13px] text-slate-700 leading-relaxed font-sans">{displayReview.pathAndTrend}</p>
            </div>

            {/* Model primary summary */}
            <div className="bg-emerald-50/75 p-5 rounded-2xl border border-emerald-600/15 shadow-sm space-y-2 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-600"></div>
              <div className="flex items-center gap-2">
                <Skull className="w-4 h-4 text-emerald-700" />
                <h4 className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider">核心模型首要判断</h4>
              </div>
              <p className="text-[13.5px] text-slate-900 font-extrabold leading-relaxed font-sans">{displayReview.primaryJudgment}</p>
            </div>
          </motion.div>
        ) : (
          <div className="bg-slate-50 p-8 rounded-xl border border-slate-200 text-center space-y-3">
            <p className="text-sm text-slate-500">未获取到专家模型评估，请点击按钮生成报告。</p>
            {savedApiKey ? (
              <button
                onClick={generateAgiReport}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white transition-colors rounded-lg text-xs font-semibold cursor-pointer"
              >
                生成 Gemini AGI 智能深度分析报告
              </button>
            ) : (
              <button
                onClick={onRefreshReview}
                className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 transition-colors rounded-lg text-xs font-semibold cursor-pointer"
              >
                一键生成专业战术报告
              </button>
            )}
          </div>
        )}
      </AnimatePresence>

      {/* 4. AGI Chat Window Panel */}
      {savedApiKey && (
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col mt-6">
          {/* Chat Header */}
          <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-800">AI 战术大师实时对谈</h4>
                <p className="text-[9px] text-slate-400 mt-0.5">针对本场赛事，与 AI 解说大师进行深度战术讨论</p>
              </div>
            </div>
            {chatMessages.length > 0 && (
              <button
                onClick={() => setChatMessages([])}
                className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                title="清空聊天记录"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Chat Messages Body */}
          <div className="p-4 min-h-[160px] max-h-[320px] overflow-y-auto space-y-3.5 bg-slate-50/40">
            {chatMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-2.5">
                <HelpCircle className="w-7 h-7 text-slate-300" />
                <div>
                  <p className="text-xs text-slate-600 font-bold">开始关于本赛事的战术探讨</p>
                  <p className="text-[10px] text-slate-400 mt-1 max-w-[280px]">
                    您可以提问类似：“下雨对哪方更有利？”、“${home.name}如何防守${away.name}的${away.tacticsName}打法？”等深度细节。
                  </p>
                </div>
              </div>
            ) : (
              chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "model" && (
                    <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div
                    className={`p-3 rounded-2xl max-w-[85%] text-[12.5px] leading-relaxed shadow-sm font-sans ${
                      msg.role === "user"
                        ? "bg-emerald-600 text-white rounded-tr-none"
                        : "bg-white text-slate-800 border border-slate-200/50 rounded-tl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 shrink-0 mt-0.5 font-bold text-[10px]">
                      U
                    </div>
                  )}
                </div>
              ))
            )}

            {chatLoading && (
              <div className="flex gap-2.5 justify-start animate-pulse">
                <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="p-3 bg-white text-slate-500 border border-slate-200/50 rounded-2xl rounded-tl-none text-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce delay-75"></span>
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce delay-150"></span>
                  <span>AI 战术大师正在思考中...</span>
                </div>
              </div>
            )}

            {chatError && (
              <div className="p-2 text-center text-[10px] text-rose-700 bg-rose-50 border border-rose-100 rounded-lg">
                {chatError}
              </div>
            )}
          </div>

          {/* Chat Footer Input */}
          <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendChatMessage()}
              placeholder={`向战术大师提问关于本场对阵的技战术细节...`}
              disabled={chatLoading}
              className="flex-1 p-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <button
              onClick={handleSendChatMessage}
              disabled={chatLoading || !chatInput.trim()}
              className="p-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl transition-all cursor-pointer shadow-sm shadow-emerald-500/10 flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
