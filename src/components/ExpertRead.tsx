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
  // 1. API Configuration States
  const [apiProvider, setApiProvider] = useState<"gemini" | "openai_compatible">("gemini");
  const [apiKeyInput, setApiKeyInput] = useState<string>("");
  const [apiBaseUrl, setApiBaseUrl] = useState<string>("");
  const [apiModel, setApiModel] = useState<string>("");

  const [savedProvider, setSavedProvider] = useState<"gemini" | "openai_compatible">("gemini");
  const [savedApiKey, setSavedApiKey] = useState<string>("");
  const [savedBaseUrl, setSavedBaseUrl] = useState<string>("");
  const [savedModel, setSavedModel] = useState<string>("");

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

  // Load API Configuration from localStorage
  useEffect(() => {
    const provider = (localStorage.getItem("agi_provider") as "gemini" | "openai_compatible") || "gemini";
    const key = localStorage.getItem("agi_api_key") || "";
    const url = localStorage.getItem("agi_base_url") || "";
    const model = localStorage.getItem("agi_model") || "";

    setApiProvider(provider);
    setSavedProvider(provider);
    setSavedApiKey(key);
    setApiKeyInput(key);
    setApiBaseUrl(url);
    setSavedBaseUrl(url);
    setApiModel(model);
    setSavedModel(model);
  }, []);

  // Reset local AGI states when the active match, tuner weights, or team strengths change
  useEffect(() => {
    setAgiReview(null);
    setChatMessages([]);
    setChatError("");
    setAgiError("");
  }, [match.id, JSON.stringify(factors), home.marketValue, away.marketValue, home.elo, away.elo]);

  // Handle saving API configuration
  const handleSaveSettings = () => {
    const trimmedKey = apiKeyInput.trim();
    const trimmedUrl = apiBaseUrl.trim();
    const trimmedModel = apiModel.trim();

    localStorage.setItem("agi_provider", apiProvider);
    localStorage.setItem("agi_api_key", trimmedKey);
    localStorage.setItem("agi_base_url", trimmedUrl);
    localStorage.setItem("agi_model", trimmedModel);

    setSavedProvider(apiProvider);
    setSavedApiKey(trimmedKey);
    setSavedBaseUrl(trimmedUrl);
    setSavedModel(trimmedModel);
    setShowKeyInput(false);
  };

  // Handle clearing API configuration
  const handleClearSettings = () => {
    localStorage.removeItem("agi_provider");
    localStorage.removeItem("agi_api_key");
    localStorage.removeItem("agi_base_url");
    localStorage.removeItem("agi_model");

    setSavedProvider("gemini");
    setApiProvider("gemini");
    setSavedApiKey("");
    setApiKeyInput("");
    setApiBaseUrl("");
    setSavedBaseUrl("");
    setApiModel("");
    setSavedModel("");
    setAgiReview(null);
    setChatMessages([]);
  };

  // Generate AGI Tactical Report via selected API Provider
  const generateAgiReport = async () => {
    if (!savedApiKey) return;
    setAgiLoading(true);
    setAgiError("");

    const reportPrompt = `你是一位世界顶级的足球战术解说大师和量化分析专家。
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
      let responseText = "";

      if (savedProvider === "gemini") {
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
                  parts: [{ text: reportPrompt }]
                }
              ],
              generationConfig: {
                responseMimeType: "application/json"
              }
            })
          }
        );

        if (!response.ok) {
          throw new Error(`Gemini API 失败: 状态码 ${response.status}`);
        }

        const resData = await response.json();
        responseText = resData.candidates?.[0]?.content?.parts?.[0]?.text || "";
      } else {
        // OpenAI Compatible Endpoint (e.g. DeepSeek)
        const baseUrl = savedBaseUrl || "https://api.deepseek.com/v1";
        const modelName = savedModel || "deepseek-chat";
        const url = `${baseUrl}/chat/completions`;

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${savedApiKey}`
          },
          body: JSON.stringify({
            model: modelName,
            messages: [
              {
                role: "system",
                content: "你是一个专业的足球分析助手。请只返回符合要求的 JSON 数据，不要包含任何 markdown 包裹符号或前导后导文字。"
              },
              {
                role: "user",
                content: reportPrompt
              }
            ],
            response_format: { type: "json_object" }
          })
        });

        if (!response.ok) {
          throw new Error(`Chat Completion API 失败: 状态码 ${response.status}`);
        }

        const resData = await response.json();
        responseText = resData.choices?.[0]?.message?.content || "";
      }

      // Clean up markdown block if model outputted it despite instructions
      let jsonText = responseText.trim();
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
      console.error("AGI API Error:", err);
      setAgiError(err.message || "请求 AI 接口时发生错误，请检查网络、Base URL 或您的 API Key。");
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
      let responseText = "";

      if (savedProvider === "gemini") {
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
        responseText = resData.candidates?.[0]?.content?.parts?.[0]?.text || "抱歉，我无法生成回答。";
      } else {
        // OpenAI Compatible format
        const baseUrl = savedBaseUrl || "https://api.deepseek.com/v1";
        const modelName = savedModel || "deepseek-chat";
        const url = `${baseUrl}/chat/completions`;

        const messages = [
          { role: "system", content: systemInstruction },
          ...updatedMessages.map(msg => ({
            role: msg.role === "user" ? "user" : "assistant",
            content: msg.text
          }))
        ];

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${savedApiKey}`
          },
          body: JSON.stringify({
            model: modelName,
            messages: messages
          })
        });

        if (!response.ok) {
          throw new Error(`发送失败，状态码: ${response.status}`);
        }

        const resData = await response.json();
        responseText = resData.choices?.[0]?.message?.content || "抱歉，我无法生成回答。";
      }
      
      setChatMessages([...updatedMessages, { role: "model", text: responseText }]);
    } catch (err: any) {
      console.error("Chat API Error:", err);
      setChatError("AI 战术大师暂时掉线，请检查网络或重试。");
    } finally {
      setChatLoading(false);
    }
  };

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
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="text-xs font-extrabold text-slate-800">AGI 智能解读引擎</h4>
              {savedApiKey ? (
                <span className="text-[9px] bg-emerald-105 bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.2 rounded font-bold">
                  🟢 {savedProvider === "gemini" ? "Gemini" : "自定义 API"} 已连接
                </span>
              ) : (
                <span className="text-[9px] bg-slate-105 bg-slate-50 text-slate-500 border border-slate-200 px-1.5 py-0.2 rounded font-bold">
                  ⚪ 离线模拟模式
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {savedApiKey 
                ? `使用 ${savedProvider === "gemini" ? "Google Gemini" : `自定义模型 (${savedModel})`} 进行实时深度智能解读与咨询` 
                : "可配置 Gemini 或兼容 OpenAI 格式（如 DeepSeek、通义等）的 API Key 以激活 AGI 高级功能"}
            </p>
          </div>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          {savedApiKey ? (
            <>
              <button
                onClick={handleClearSettings}
                className="px-2.5 py-1.5 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200 cursor-pointer flex-1 md:flex-none"
              >
                清除 Key
              </button>
              <button
                onClick={() => setShowKeyInput(!showKeyInput)}
                className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 cursor-pointer flex-1 md:flex-none"
              >
                修改配置
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
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl shadow-inner space-y-4.5 animate-fade-in">
          {/* Provider Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-750 mb-2">选择 API 接口格式：</label>
            <div className="flex gap-4 border-b border-slate-200 pb-2.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="apiProvider"
                  checked={apiProvider === "gemini"}
                  onChange={() => setApiProvider("gemini")}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <span>Google Gemini API</span>
              </label>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="apiProvider"
                  checked={apiProvider === "openai_compatible"}
                  onChange={() => setApiProvider("openai_compatible")}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <span>自定义格式 (如 DeepSeek, 阿里通义, OpenAI)</span>
              </label>
            </div>
          </div>

          {/* Conditional Input Fields */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">API Key：</label>
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder={apiProvider === "gemini" ? "请输入以 AIzaSy 开头的 Gemini API Key" : "请输入对应服务商的 API Key / Bearer Token"}
                className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              />
            </div>

            {apiProvider === "openai_compatible" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">API Base URL (接口基础路径)：</label>
                  <input
                    type="text"
                    value={apiBaseUrl}
                    onChange={(e) => setApiBaseUrl(e.target.value)}
                    placeholder="例如：https://api.deepseek.com/v1"
                    className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Model Name (调用模型名称)：</label>
                  <input
                    type="text"
                    value={apiModel}
                    onChange={(e) => setApiModel(e.target.value)}
                    placeholder="例如：deepseek-chat 或 qwen-max"
                    className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>
            )}
            
            <span className="text-[10px] text-slate-400 mt-1 block leading-relaxed">
              注意：API 密钥及接口参数仅安全保存在您的本地浏览器中（LocalStorage）。所有 API 请求均在本地浏览器发起，直接连接您所配置的服务器，不经过任何中间服务器，确保个人或企业密钥安全。
            </span>
          </div>

          <div className="flex justify-end gap-2 text-xs">
            <button
              onClick={() => setShowKeyInput(false)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-600 transition-colors cursor-pointer font-semibold"
            >
              取消
            </button>
            <button
              onClick={handleSaveSettings}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold transition-colors cursor-pointer"
            >
              保存配置并启用
            </button>
          </div>
        </div>
      )}

      {/* 2. Tactical Analysis Action Bar */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm">
        <div>
          <span className="text-[10px] bg-slate-100 text-slate-600 font-extrabold uppercase px-1.5 py-0.5 rounded font-mono border border-slate-200">
            {savedApiKey ? (savedProvider === "gemini" ? "Google Gemini AGI" : "Custom OpenAI-compatible") : "Local Logic Fitting Engine"}
          </span>
          <h3 className="text-xs font-bold text-slate-800 font-mono mt-1">
            {savedApiKey 
              ? (savedProvider === "gemini" ? "gemini-2.5-flash (AGI)" : `${savedModel || "deepseek-chat"} (AGI)`) 
              : "public-v2-market-poisson-deep"}
          </h3>
        </div>
        
        {savedApiKey ? (
          <button
            onClick={generateAgiReport}
            disabled={agiLoading}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-400 disabled:to-slate-500 rounded-lg transition-all cursor-pointer shadow-sm shadow-emerald-500/10"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${agiLoading ? "animate-spin" : ""}`} />
            {agiLoading ? "AI 深度计算中..." : "⚡ 生成 AGI 智能报告"}
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
              <div className="px-1.5 py-0.5 text-[10px] text-emerald-800 font-bold flex items-center gap-1.5 bg-emerald-50 rounded-lg w-max border border-emerald-200 animate-pulse">
                <Sparkles className="w-3 h-3" />
                <span>实时 AGI 引擎对阵分析报告已生成 ({savedProvider === "gemini" ? "Gemini" : savedModel})</span>
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
                生成 AGI 智能深度分析报告
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
          {savedApiKey && chatMessages.length > 0 && (
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
          {!savedApiKey ? (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <Key className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-700 font-bold">AI 战术大师未激活</p>
                <p className="text-[10px] text-slate-400 max-w-[340px] leading-relaxed">
                  请先在页面顶部配置您的 **Gemini API Key** 或 **自定义大模型 API Key (如 DeepSeek、通义等)**。激活后，即可在此处向 AI 提问任何有关 2026 世界杯的分析、规则或战术探讨。
                </p>
              </div>
              <button
                onClick={() => setShowKeyInput(true)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10.5px] font-bold transition-colors cursor-pointer"
              >
                立即配置 API Key
              </button>
            </div>
          ) : chatMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-2.5">
              <HelpCircle className="w-7 h-7 text-slate-300" />
              <div>
                <p className="text-xs text-slate-600 font-bold">开始关于本赛事的战术探讨</p>
                <p className="text-[10px] text-slate-400 mt-1 max-w-[280px]">
                  您可以提问任何世界杯相关问题，例如：“下雨对哪方更有利？”、“${home.name}如何防守${away.name}的${away.tacticsName}打法？”等。
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
            placeholder={savedApiKey ? `向战术大师提问关于本场对战的技战术细节...` : "请先配置 API Key 以开启对话..."}
            disabled={chatLoading || !savedApiKey}
            className="flex-1 p-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50"
          />
          <button
            onClick={handleSendChatMessage}
            disabled={chatLoading || !chatInput.trim() || !savedApiKey}
            className="p-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl transition-all cursor-pointer shadow-sm shadow-emerald-500/10 flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
