import React, { useState, useEffect } from "react";
import { Team, Match, MatchFactors, PredictionResult, ExpertReview } from "../types";
import { Shield, Sparkles, RefreshCw, Trophy, Skull, Key, Send, Trash2, Bot, User, HelpCircle, WifiOff, Activity, Zap } from "lucide-react";
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
  const configRef = React.useRef<HTMLDivElement>(null);

  // Connection testing states
  const [testLoading, setTestLoading] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

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

  // Clear test connection states on config panel toggle or input change
  useEffect(() => {
    setTestResult(null);
    setTestLoading(false);
  }, [showKeyInput]);

  useEffect(() => {
    setTestResult(null);
  }, [apiKeyInput, apiProvider, apiBaseUrl, apiModel]);

  // Test connection to the selected API provider using current input values
  const handleTestConnection = async () => {
    if (!apiKeyInput.trim()) {
      setTestResult({ success: false, message: "请输入 API Key 后再进行测试。" });
      return;
    }
    setTestLoading(true);
    setTestResult(null);

    try {
      if (apiProvider === "gemini") {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKeyInput.trim()}`;
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "ping" }] }]
          })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          const errMsg = errData?.error?.message || `HTTP 状态码 ${response.status}`;
          throw new Error(errMsg);
        }

        const data = await response.json();
        if (data.candidates && data.candidates.length > 0) {
          setTestResult({ success: true, message: "Gemini API 连通性测试成功！您的 Key 可以正常使用。" });
        } else {
          throw new Error("接口未返回有效候选回答。");
        }
      } else {
        const baseUrl = apiBaseUrl.trim() || "https://api.deepseek.com/v1";
        const modelName = apiModel.trim() || "deepseek-chat";
        const url = `${baseUrl}/chat/completions`;

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKeyInput.trim()}`
          },
          body: JSON.stringify({
            model: modelName,
            messages: [{ role: "user", content: "ping" }],
            max_tokens: 5
          })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          const errMsg = errData?.error?.message || `HTTP 状态码 ${response.status}`;
          throw new Error(errMsg);
        }

        const data = await response.json();
        if (data.choices && data.choices.length > 0) {
          setTestResult({ success: true, message: `自定义 API (${modelName}) 连通性测试成功！您的 Key 可以正常使用。` });
        } else {
          throw new Error("接口未返回有效对话选择项。");
        }
      }
    } catch (error: any) {
      console.error("Test connection error:", error);
      setTestResult({
        success: false,
        message: `测试失败: ${error.message || "请求发送失败，请检查网络或 Base URL 格式是否正确。"}`
      });
    } finally {
      setTestLoading(false);
    }
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
本场真实赛果：${match.actualScore ? `完赛比分 ${match.actualScore.home}:${match.actualScore.away} (注意：本场比赛已在现实中结束！)` : "尚未开赛"}

${match.actualScore 
  ? "【重要指令】：由于这场比赛已经在现实中打完，请**不要使用预测或假设的口吻**。如果用户询问进球者、比赛细节或赛况，请你调用自身的网络搜索能力（或基于最新的比赛知识），如实回答现实中发生的真实战况。你可以分析我们的模型预测与真实赛果的偏差，做赛后复盘。" 
  : "请结合上述战术打法、环境制约以及数据模型，进行赛前模拟预测与战术沙盘推演，回答用户的提问。"}

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
      <div 
        ref={configRef}
        className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-900 flex items-center justify-center text-yellow-400 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]">
            <Key className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="text-xs font-extrabold text-slate-800">AGI 智能解读引擎</h4>
              {savedApiKey ? (
                <span className="flex items-center gap-1 text-[9px] bg-slate-900 text-yellow-400 border-2 border-slate-900 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] px-1.5 py-0.5 rounded-md font-bold">
                  <Zap className="w-3 h-3 text-yellow-400 fill-current" /> {savedProvider === "gemini" ? "Gemini" : "自定义 API"} 已连接
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[9px] bg-white text-slate-900 border-2 border-slate-900 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] px-1.5 py-0.5 rounded-md font-black">
                  <WifiOff className="w-3 h-3" /> 离线模拟模式
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {savedApiKey 
                ? `使用 ${savedProvider === "gemini" ? "Google Gemini" : `自定义模型 (${savedModel})`} 进行实时深度智能解读与咨询` 
                : "可配置 Gemini Key或自定义Provider（兼容 OpenAI 格式）以激活 AGI 高级功能"}
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
              className="neo-btn bg-slate-100 hover:bg-slate-200 px-3 py-1.5 text-xs active:translate-y-0.5 w-full md:w-auto"
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
                  className="text-slate-900 focus:ring-slate-900"
                />
                <span>Google Gemini API</span>
              </label>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="apiProvider"
                  checked={apiProvider === "openai_compatible"}
                  onChange={() => setApiProvider("openai_compatible")}
                  className="text-slate-900 focus:ring-slate-900"
                />
                <span>自定义格式 (OpenAI兼容格式)</span>
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
                className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
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
                    className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Model Name (调用模型名称)：</label>
                  <input
                    type="text"
                    value={apiModel}
                    onChange={(e) => setApiModel(e.target.value)}
                    placeholder="例如：deepseek-chat 或 qwen-max"
                    className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                  />
                </div>
              </div>
            )}
            
            {testResult && (
              <div className={`text-xs p-3 rounded-md border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] ${
                testResult.success 
                  ? "bg-yellow-400 text-slate-900" 
                  : "bg-white text-rose-600"
              } font-sans leading-relaxed mt-2 animate-fade-in flex flex-col gap-1`}>
                <div className="flex items-center gap-1.5 font-black text-sm">
                  {testResult.success ? <Zap className="w-4 h-4 fill-current" /> : <WifiOff className="w-4 h-4" />}
                  {testResult.success ? "连通性测试成功" : "连通性测试失败"}
                </div>
                <p className={`font-semibold text-xs ${testResult.success ? "text-slate-800" : "text-slate-600"}`}>{testResult.message}</p>
              </div>
            )}
            <span className="text-[10px] text-slate-400 mt-2 block leading-relaxed">
              注意：API 密钥及接口参数仅安全保存在您的本地浏览器中（LocalStorage）。所有 API 请求均在本地浏览器发起，直接连接您所配置的服务器，不经过任何中间服务器，确保个人或企业密钥安全。
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <div>
              <button
                onClick={handleTestConnection}
                disabled={testLoading || !apiKeyInput.trim()}
                className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 disabled:bg-slate-100 disabled:text-slate-500 text-slate-900 border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] rounded-md font-black transition-all cursor-pointer flex items-center gap-1.5"
              >
                {testLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-900" />
                    测试中...
                  </>
                ) : (
                  <>
                    <Activity className="w-3.5 h-3.5" /> 测试连通性
                  </>
                )}
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowKeyInput(false)}
                className="px-3 py-1.5 bg-white hover:bg-slate-50 border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] rounded-md text-slate-900 transition-all cursor-pointer font-bold"
              >
                取消
              </button>
              <button
                onClick={handleSaveSettings}
                className="neo-btn px-4 py-1.5 text-xs"
              >
                保存配置并启用
              </button>
            </div>
          </div>
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
              <div key={i} className="neo-card p-5 space-y-3 animate-pulse">
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
              <div className="px-2 py-0.5 text-[10px] text-slate-900 font-black flex items-center gap-1.5 bg-yellow-400 border-2 border-slate-900 rounded-lg w-max shadow-[1px_1px_0px_rgba(15,23,42,1)]">
                <Sparkles className="w-3 h-3 text-slate-950" />
                <span>实时 AGI 引擎对阵分析报告已生成 ({savedProvider === "gemini" ? "Gemini" : savedModel})</span>
              </div>
            )}

            {/* Tactical Counter Analysis Block */}
            <div className="neo-card p-5 relative overflow-hidden bg-white">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-900"></div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-slate-900 stroke-[2]" />
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">攻防克制分析</h4>
              </div>
              <p className="text-[13px] text-slate-700 leading-relaxed font-bold font-sans">{displayReview.tacticalCounter}</p>
            </div>

            {/* Squad status and players */}
            <div className="neo-card p-5 relative overflow-hidden bg-white">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-yellow-400"></div>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-yellow-600 stroke-[2]" />
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">伤病与阵容推演</h4>
              </div>
              <p className="text-[13px] text-slate-700 leading-relaxed font-bold font-sans">{displayReview.squadCondition}</p>
            </div>

            {/* Path and Promotion analysis */}
            <div className="neo-card p-5 relative overflow-hidden bg-white">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-900"></div>
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-4 h-4 text-slate-900 stroke-[2]" />
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">环境、战意与出线走向</h4>
              </div>
              <p className="text-[13px] text-slate-700 leading-relaxed font-bold font-sans">{displayReview.pathAndTrend}</p>
            </div>

            {/* Model primary summary */}
            <div className="neo-card p-5 relative overflow-hidden bg-white">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-yellow-400"></div>
              <div className="flex items-center gap-2 mb-2">
                <Skull className="w-4 h-4 text-slate-900 stroke-[2]" />
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">核心模型首要判断</h4>
              </div>
              <p className="text-[13.5px] text-slate-900 font-black leading-relaxed font-sans">{displayReview.primaryJudgment}</p>
            </div>
          </motion.div>
        ) : (
          <div className="neo-card p-8 text-center space-y-4 bg-slate-50">
            <p className="text-xs font-bold text-slate-600">未获取到专家模型评估，请点击按钮生成报告。</p>
            {savedApiKey ? (
              <button
                onClick={generateAgiReport}
                className="neo-btn bg-slate-900 hover:bg-slate-950 px-4 py-2 text-xs cursor-pointer active:translate-y-0.5"
              >
                生成 AGI 智能深度分析报告
              </button>
            ) : (
              <button
                onClick={onRefreshReview}
                className="neo-btn px-4 py-2 text-xs cursor-pointer active:translate-y-0.5"
              >
                一键生成专业战术报告
              </button>
            )}
          </div>
        )}
      </AnimatePresence>

      {/* 4. AGI Chat Window Panel */}
      <div className="bg-white rounded-xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] overflow-hidden flex flex-col mt-6">
        {/* Chat Header */}
        <div className="bg-white border-b-2 border-slate-200 p-4 flex items-center justify-between text-slate-900">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-yellow-400 border border-slate-900 flex items-center justify-center text-slate-950">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900">AI 战术大师实时对谈</h4>
              <p className="text-[9px] text-slate-500 mt-0.5">针对本场赛事，与 AI 解说大师进行深度战术讨论</p>
            </div>
          </div>
          {savedApiKey && chatMessages.length > 0 && (
            <button
              onClick={() => setChatMessages([])}
              className="p-1 text-slate-400 hover:text-rose-450 rounded transition-colors cursor-pointer"
              title="清空聊天记录"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Chat Messages Body */}
        <div className="p-4 min-h-[160px] max-h-[320px] overflow-y-auto space-y-4 bg-slate-50">
          {!savedApiKey ? (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
              <div className="w-10 h-10 rounded-lg bg-white border-2 border-slate-900 flex items-center justify-center text-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                <Key className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-900 font-black">AI 战术大师未激活</p>
                <p className="text-[10px] text-slate-500 max-w-[340px] leading-relaxed font-bold">
                  请先在页面顶部配置您的 **Gemini API Key** 或 **自定义大模型 API Key (如 DeepSeek、通义等)**。激活后，即可在此处向 AI 提问任何有关 2026 世界杯的分析、规则或战术探讨。
                </p>
              </div>
              <button
                onClick={() => {
                  setShowKeyInput(true);
                  setTimeout(() => {
                    configRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }, 100);
                }}
                className="neo-btn bg-yellow-400 hover:bg-yellow-500 text-slate-900 px-3.5 py-1.5 text-[10.5px] cursor-pointer"
              >
                立即配置 API Key
              </button>
            </div>
          ) : chatMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-2.5">
              <HelpCircle className="w-7 h-7 text-slate-400" />
              <div>
                <p className="text-xs text-slate-700 font-black">开始关于本赛事的战术探讨</p>
                <p className="text-[10px] text-slate-500 mt-1 max-w-[280px] font-bold">
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
                  <div className="w-7 h-7 rounded-lg bg-[#d97757] border-2 border-slate-900 flex items-center justify-center shrink-0 mt-0.5 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] overflow-hidden p-0.5">
                    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="white">
                      <path d="m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z"/>
                    </svg>
                  </div>
                )}
                <div
                  className={`p-3 rounded-xl max-w-[85%] text-[12.5px] leading-relaxed font-sans font-bold border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] ${
                    msg.role === "user"
                      ? "bg-slate-900 text-white rounded-tr-none"
                      : "bg-white text-slate-900 rounded-tl-none"
                  }`}
                >
                  {msg.text}
                </div>
                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-lg bg-yellow-400 border-2 border-slate-900 flex items-center justify-center shrink-0 mt-0.5 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] overflow-hidden">
                    <svg width="22" height="22" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
                      {/* head */}
                      <rect x="4" y="1" width="8" height="7" fill="#1e293b"/>
                      {/* round top of head */}
                      <rect x="5" y="0" width="6" height="1" fill="#1e293b"/>
                      {/* eyes white */}
                      <rect x="5" y="3" width="2" height="2" fill="#facc15"/>
                      <rect x="9" y="3" width="2" height="2" fill="#facc15"/>
                      {/* pupils */}
                      <rect x="6" y="4" width="1" height="1" fill="#1e293b"/>
                      <rect x="10" y="4" width="1" height="1" fill="#1e293b"/>
                      {/* smile */}
                      <rect x="5" y="7" width="1" height="1" fill="#facc15"/>
                      <rect x="6" y="8" width="4" height="1" fill="#facc15"/>
                      <rect x="10" y="7" width="1" height="1" fill="#facc15"/>
                      {/* neck */}
                      <rect x="6" y="9" width="4" height="1" fill="#1e293b"/>
                      {/* body */}
                      <rect x="4" y="10" width="8" height="4" fill="#1e293b"/>
                      {/* arms */}
                      <rect x="2" y="10" width="2" height="3" fill="#1e293b"/>
                      <rect x="12" y="10" width="2" height="3" fill="#1e293b"/>
                      {/* legs */}
                      <rect x="4" y="14" width="3" height="2" fill="#1e293b"/>
                      <rect x="9" y="14" width="3" height="2" fill="#1e293b"/>
                    </svg>
                  </div>
                )}
              </div>
            ))
          )}
          {chatLoading && (
            <div className="flex gap-2.5 justify-start animate-pulse">
              <div className="w-7 h-7 rounded-lg bg-[#d97757] border-2 border-slate-900 flex items-center justify-center shrink-0 mt-0.5 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] overflow-hidden p-0.5">
                <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="white">
                  <path d="m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z"/>
                </svg>
              </div>
              <div className="p-3 bg-white text-slate-900 border-2 border-slate-900 rounded-xl rounded-tl-none text-xs flex items-center gap-1.5 font-bold shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                <span className="w-1.5 h-1.5 bg-slate-900 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-slate-900 rounded-full animate-bounce delay-75"></span>
                <span className="w-1.5 h-1.5 bg-slate-900 rounded-full animate-bounce delay-150"></span>
                <span>AI 战术大师正在思考中...</span>
              </div>
            </div>
          )}

          {chatError && (
            <div className="p-2 text-center text-[10px] text-rose-900 bg-rose-50 border-2 border-slate-900 rounded-lg font-bold">
              {chatError}
            </div>
          )}
        </div>

        {/* Chat Footer Input */}
        <div className="p-3 bg-slate-100 border-t-2 border-slate-900 flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendChatMessage()}
            placeholder={savedApiKey ? `向战术大师提问关于本场对战的技战术细节...` : "请先配置 API Key 以开启对话..."}
            disabled={chatLoading || !savedApiKey}
            className="flex-1 p-2.5 text-xs border-2 border-slate-900 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-bold disabled:opacity-50"
          />
          <button
            onClick={handleSendChatMessage}
            disabled={chatLoading || !chatInput.trim() || !savedApiKey}
            className="p-2.5 bg-yellow-400 hover:bg-yellow-500 disabled:bg-slate-200 disabled:text-slate-400 disabled:border-slate-350 disabled:shadow-none text-slate-900 border-2 border-slate-900 rounded-lg shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] transition-all cursor-pointer flex items-center justify-center shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
