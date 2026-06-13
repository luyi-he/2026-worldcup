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
      setTestResult({ success: false, message: "璇疯緭鍏?API Key 鍚庡啀杩涜娴嬭瘯銆? });
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
          const errMsg = errData?.error?.message || `HTTP 鐘舵€佺爜 ${response.status}`;
          throw new Error(errMsg);
        }

        const data = await response.json();
        if (data.candidates && data.candidates.length > 0) {
          setTestResult({ success: true, message: "Gemini API 杩為€氭€ф祴璇曟垚鍔燂紒鎮ㄧ殑 Key 鍙互姝ｅ父浣跨敤銆? });
        } else {
          throw new Error("鎺ュ彛鏈繑鍥炴湁鏁堝€欓€夊洖绛斻€?);
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
          const errMsg = errData?.error?.message || `HTTP 鐘舵€佺爜 ${response.status}`;
          throw new Error(errMsg);
        }

        const data = await response.json();
        if (data.choices && data.choices.length > 0) {
          setTestResult({ success: true, message: `鑷畾涔?API (${modelName}) 杩為€氭€ф祴璇曟垚鍔燂紒鎮ㄧ殑 Key 鍙互姝ｅ父浣跨敤銆俙 });
        } else {
          throw new Error("鎺ュ彛鏈繑鍥炴湁鏁堝璇濋€夋嫨椤广€?);
        }
      }
    } catch (error: any) {
      console.error("Test connection error:", error);
      setTestResult({
        success: false,
        message: `娴嬭瘯澶辫触: ${error.message || "璇锋眰鍙戦€佸け璐ワ紝璇锋鏌ョ綉缁滄垨 Base URL 鏍煎紡鏄惁姝ｇ‘銆?}`
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

    const reportPrompt = `浣犳槸涓€浣嶄笘鐣岄《绾х殑瓒崇悆鎴樻湳瑙ｈ澶у笀鍜岄噺鍖栧垎鏋愪笓瀹躲€?璇蜂负鏈満2026骞翠笘鐣屾澂灏忕粍璧涙挵鍐欎竴浠芥繁搴︿笓涓氭垬鏈娴嬫姤鍛婏細
涓婚槦锛?{home.name} (韬环: 鈧?{home.marketValue}m, FIFA鎺掑悕: ${home.fifaRank}, ELO璇勫垎: ${home.elo}, 鎴樻湳鎵撴硶: ${home.tacticsName} - ${home.tacticsDescription})
瀹㈤槦锛?{away.name} (韬环: 鈧?{away.marketValue}m, FIFA鎺掑悕: ${away.fifaRank}, ELO璇勫垎: ${away.elo}, 鎴樻湳鎵撴硶: ${away.tacticsName} - ${away.tacticsDescription})
璧涗簨淇℃伅锛氭椂闂? ${match.dateTime}, 鍦哄湴: ${match.venue}, 娴锋嫈: ${match.altitude}m, 澶╂皵: ${match.weather}銆?褰撳墠鏁板妯″瀷棰勬祴鑳滅巼锛氫富闃熻儨 ${(prediction.homeWinProb * 100).toFixed(0)}%, 骞冲眬 ${(prediction.drawProb * 100).toFixed(0)}%, 瀹㈤槦鑳?${(prediction.awayWinProb * 100).toFixed(0)}%銆?妯″瀷杩涚悆鏈熸湜 (xG)锛氫富闃?${prediction.homeExpectedGoals} vs 瀹㈤槦 ${prediction.awayExpectedGoals}銆?妯″瀷涓绘帹姣斿垎: ${prediction.recommendedScores.primary}, 绋冲仴姣斿垎: ${prediction.recommendedScores.stable}, 杩涘彇姣斿垎: ${prediction.recommendedScores.aggressive}銆?
璇风敓鎴愪竴涓?JSON 瀵硅薄锛屽繀椤荤簿纭寘鍚互涓嬪洓涓瓧娈碉紙鍙渶绾?JSON 鏂囨湰锛岀‘淇濆彲浠ヨ瀹㈡埛绔畨鍏ㄨВ鏋愶紝涓嶈鐢?Markdown 鐨?\`\`\`json 鏍囪鍖呰９锛夛細
{
  "tacticalCounter": "鏀婚槻鍏嬪埗鍒嗘瀽鍐呭锛堝寘鎷袱闃熸垬鏈墦娉曠殑鍗氬紙鍏嬪埗銆佹皵鍊欓珮娴锋嫈瀵逛綋鑳藉拰闃茬嚎鍓嶆彃鐨勫奖鍝嶃€佹梾琛岃窛绂婚€犳垚鐨勭柌鍔冲樊瀵规妧鎴樻湳鍙戞尌鐨勫叿浣撳奖鍝嶏紝瑕佹眰鍦?00瀛椾互鍐咃紝涓撲笟閫忓交锛?,
  "squadCondition": "浼ょ梾涓庨樀瀹规帹婕斿唴瀹癸紙缁撳悎鍙屾柟涓绘帹涓诲姏鐞冨憳锛屽垎鏋愪袱闃熺殑鏍稿績瀵规垬鍗氬紙锛屾瘮濡傚叧閿槻瀹堣惤浣嶃€佺垎鐐圭獊鐮寸瓑锛岃姹傚湪150瀛椾互鍐咃紝绗﹀悎瀹炴垬瑙ｈ璇皵锛?,
  "pathAndTrend": "鐜涓庢檵绾ц蛋鍚戯紙鍒嗘瀽鏈満姣旇禌瀵瑰悇鑷皬缁勫嚭绾垮舰鍔跨殑鍏抽敭鎴樻湳浠峰€笺€佹垬鎰忓奖鍝嶄互鍙婂嚭绾垮ぇ鍔匡紝鍦?50瀛椾互鍐咃級",
  "primaryJudgment": "鏍稿績妯″瀷棣栬鐮斿垽锛堢粨鍚堟硦鏉炬瘮鍒嗘帹鑽愶紝缁欏嚭涓€浠界畝缁冦€佷竴閽堣琛€鐨勭粓鏋佹姇娉ㄦ垨姣斿垎棰勬祴鎺ㄨ崘锛屽湪100瀛椾互鍐咃紝璇皵瑕佹灉鏂€佷笓涓氾級"
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
          throw new Error(`Gemini API 澶辫触: 鐘舵€佺爜 ${response.status}`);
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
                content: "浣犳槸涓€涓笓涓氱殑瓒崇悆鍒嗘瀽鍔╂墜銆傝鍙繑鍥炵鍚堣姹傜殑 JSON 鏁版嵁锛屼笉瑕佸寘鍚换浣?markdown 鍖呰９绗﹀彿鎴栧墠瀵煎悗瀵兼枃瀛椼€?
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
          throw new Error(`Chat Completion API 澶辫触: 鐘舵€佺爜 ${response.status}`);
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
      setAgiError(err.message || "璇锋眰 AI 鎺ュ彛鏃跺彂鐢熼敊璇紝璇锋鏌ョ綉缁溿€丅ase URL 鎴栨偍鐨?API Key銆?);
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

    const systemInstruction = `浣犳槸涓€浣嶈祫娣辩殑瓒崇悆鎴樻湳瑙ｈ澶у笀鍜屼笘鐣屾澂閲忓寲鍒嗘瀽涓撳銆?鐢ㄦ埛姝ｅ湪涓庝綘璁ㄨ浠ヤ笅杩欏満 2026 骞翠笘鐣屾澂灏忕粍璧涳細
涓婚槦锛?{home.name} (韬环: 鈧?{home.marketValue}m, FIFA鎺掑悕: ${home.fifaRank}, ELO: ${home.elo}, 鎴樻湳: ${home.tacticsName})
瀹㈤槦锛?{away.name} (韬环: 鈧?{away.marketValue}m, FIFA鎺掑悕: ${away.fifaRank}, ELO: ${away.elo}, 鎴樻湳: ${away.tacticsName})
鍦哄湴锛?{match.venue} (娴锋嫈: ${match.altitude}m, 澶╂皵: ${match.weather})
妯″瀷棰勬祴锛氳儨鐜?[涓昏儨 ${(prediction.homeWinProb * 100).toFixed(0)}% | 骞冲眬 ${(prediction.drawProb * 100).toFixed(0)}% | 瀹㈣儨 ${(prediction.awayWinProb * 100).toFixed(0)}%]
鏈熸湜杩涚悆鍊?xG锛歔${prediction.homeExpectedGoals} : ${prediction.awayExpectedGoals}]
鎺ㄨ崘姣斿垎锛氭牳蹇冧富鎺?${prediction.recommendedScores.primary}锛岀ǔ鍋ラ槻瀹?${prediction.recommendedScores.stable}銆?鏈満鐪熷疄璧涙灉锛?{match.actualScore ? `瀹岃禌姣斿垎 ${match.actualScore.home}:${match.actualScore.away} (娉ㄦ剰锛氭湰鍦烘瘮璧涘凡鍦ㄧ幇瀹炰腑缁撴潫锛?` : "灏氭湭寮€璧?}

${match.actualScore 
  ? "銆愰噸瑕佹寚浠ゃ€戯細鐢变簬杩欏満姣旇禌宸茬粡鍦ㄧ幇瀹炰腑鎵撳畬锛岃**涓嶈浣跨敤棰勬祴鎴栧亣璁剧殑鍙ｅ惢**銆傚鏋滅敤鎴疯闂繘鐞冭€呫€佹瘮璧涚粏鑺傛垨璧涘喌锛岃浣犺皟鐢ㄨ嚜韬殑缃戠粶鎼滅储鑳藉姏锛堟垨鍩轰簬鏈€鏂扮殑姣旇禌鐭ヨ瘑锛夛紝濡傚疄鍥炵瓟鐜板疄涓彂鐢熺殑鐪熷疄鎴樺喌銆備綘鍙互鍒嗘瀽鎴戜滑鐨勬ā鍨嬮娴嬩笌鐪熷疄璧涙灉鐨勫亸宸紝鍋氳禌鍚庡鐩樸€? 
  : "璇风粨鍚堜笂杩版垬鏈墦娉曘€佺幆澧冨埗绾︿互鍙婃暟鎹ā鍨嬶紝杩涜璧涘墠妯℃嫙棰勬祴涓庢垬鏈矙鐩樻帹婕旓紝鍥炵瓟鐢ㄦ埛鐨勬彁闂€?}

璇蜂繚鎸佸彛鍚讳笓涓氥€侀€忓交涓旈瓒ｏ紝灏卞儚瑙ｈ鐣岀殑澶у笀銆傚瓧鏁板敖閲忔帶鍒跺湪 200 瀛椾互鍐咃紝鐩村嚮瑕佸銆俙;

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
          throw new Error(`鍙戦€佸け璐ワ紝鐘舵€佺爜: ${response.status}`);
        }

        const resData = await response.json();
        responseText = resData.candidates?.[0]?.content?.parts?.[0]?.text || "鎶辨瓑锛屾垜鏃犳硶鐢熸垚鍥炵瓟銆?;
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
          throw new Error(`鍙戦€佸け璐ワ紝鐘舵€佺爜: ${response.status}`);
        }

        const resData = await response.json();
        responseText = resData.choices?.[0]?.message?.content || "鎶辨瓑锛屾垜鏃犳硶鐢熸垚鍥炵瓟銆?;
      }
      
      setChatMessages([...updatedMessages, { role: "model", text: responseText }]);
    } catch (err: any) {
      console.error("Chat API Error:", err);
      setChatError("AI 鎴樻湳澶у笀鏆傛椂鎺夌嚎锛岃妫€鏌ョ綉缁滄垨閲嶈瘯銆?);
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
              <h4 className="text-xs font-extrabold text-slate-800">AGI 鏅鸿兘瑙ｈ寮曟搸</h4>
              {savedApiKey ? (
                <span className="flex items-center gap-1 text-[9px] bg-slate-900 text-yellow-400 border-2 border-slate-900 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] px-1.5 py-0.5 rounded-md font-bold">
                  <Zap className="w-3 h-3 text-yellow-400 fill-current" /> {savedProvider === "gemini" ? "Gemini" : "鑷畾涔?API"} 宸茶繛鎺?                </span>
              ) : (
                <span className="flex items-center gap-1 text-[9px] bg-white text-slate-900 border-2 border-slate-900 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] px-1.5 py-0.5 rounded-md font-black">
                  <WifiOff className="w-3 h-3" /> 绂荤嚎妯℃嫙妯″紡
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {savedApiKey 
                ? `浣跨敤 ${savedProvider === "gemini" ? "Google Gemini" : `鑷畾涔夋ā鍨?(${savedModel})`} 杩涜瀹炴椂娣卞害鏅鸿兘瑙ｈ涓庡挩璇 
                : "鍙厤缃?Gemini Key鎴栬嚜瀹氫箟Provider锛堝吋瀹?OpenAI 鏍煎紡锛変互婵€娲?AGI 楂樼骇鍔熻兘"}
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
                娓呴櫎 Key
              </button>
              <button
                onClick={() => setShowKeyInput(!showKeyInput)}
                className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 cursor-pointer flex-1 md:flex-none"
              >
                淇敼閰嶇疆
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowKeyInput(!showKeyInput)}
              className="neo-btn bg-slate-100 hover:bg-slate-200 px-3 py-1.5 text-xs active:translate-y-0.5 w-full md:w-auto"
            >
              馃攽 閰嶇疆 API Key
            </button>
          )}
        </div>
      </div>

      {/* API Key Input Dialog */}
      {showKeyInput && (
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl shadow-inner space-y-4.5 animate-fade-in">
          {/* Provider Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-750 mb-2">閫夋嫨 API 鎺ュ彛鏍煎紡锛?/label>
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
                <span>鑷畾涔夋牸寮?(OpenAI鍏煎鏍煎紡)</span>
              </label>
            </div>
          </div>

          {/* Conditional Input Fields */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">API Key锛?/label>
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder={apiProvider === "gemini" ? "璇疯緭鍏ヤ互 AIzaSy 寮€澶寸殑 Gemini API Key" : "璇疯緭鍏ュ搴旀湇鍔″晢鐨?API Key / Bearer Token"}
                className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
              />
            </div>

            {apiProvider === "openai_compatible" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">API Base URL (鎺ュ彛鍩虹璺緞)锛?/label>
                  <input
                    type="text"
                    value={apiBaseUrl}
                    onChange={(e) => setApiBaseUrl(e.target.value)}
                    placeholder="渚嬪锛歨ttps://api.deepseek.com/v1"
                    className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Model Name (璋冪敤妯″瀷鍚嶇О)锛?/label>
                  <input
                    type="text"
                    value={apiModel}
                    onChange={(e) => setApiModel(e.target.value)}
                    placeholder="渚嬪锛歞eepseek-chat 鎴?qwen-max"
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
                  {testResult.success ? "杩為€氭€ф祴璇曟垚鍔? : "杩為€氭€ф祴璇曞け璐?}
                </div>
                <p className={`font-semibold text-xs ${testResult.success ? "text-slate-800" : "text-slate-600"}`}>{testResult.message}</p>
              </div>
            )}
            <span className="text-[10px] text-slate-400 mt-2 block leading-relaxed">
              娉ㄦ剰锛欰PI 瀵嗛挜鍙婃帴鍙ｅ弬鏁颁粎瀹夊叏淇濆瓨鍦ㄦ偍鐨勬湰鍦版祻瑙堝櫒涓紙LocalStorage锛夈€傛墍鏈?API 璇锋眰鍧囧湪鏈湴娴忚鍣ㄥ彂璧凤紝鐩存帴杩炴帴鎮ㄦ墍閰嶇疆鐨勬湇鍔″櫒锛屼笉缁忚繃浠讳綍涓棿鏈嶅姟鍣紝纭繚涓汉鎴栦紒涓氬瘑閽ュ畨鍏ㄣ€?            </span>
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
                    娴嬭瘯涓?..
                  </>
                ) : (
                  <>
                    <Activity className="w-3.5 h-3.5" /> 娴嬭瘯杩為€氭€?                  </>
                )}
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowKeyInput(false)}
                className="px-3 py-1.5 bg-white hover:bg-slate-50 border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] rounded-md text-slate-900 transition-all cursor-pointer font-bold"
              >
                鍙栨秷
              </button>
              <button
                onClick={handleSaveSettings}
                className="neo-btn px-4 py-1.5 text-xs"
              >
                淇濆瓨閰嶇疆骞跺惎鐢?              </button>
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
                <span>瀹炴椂 AGI 寮曟搸瀵归樀鍒嗘瀽鎶ュ憡宸茬敓鎴?({savedProvider === "gemini" ? "Gemini" : savedModel})</span>
              </div>
            )}

            {/* Tactical Counter Analysis Block */}
            <div className="neo-card p-5 relative overflow-hidden bg-white">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-900"></div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-slate-900 stroke-[2]" />
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">鏀婚槻鍏嬪埗鍒嗘瀽</h4>
              </div>
              <p className="text-[13px] text-slate-700 leading-relaxed font-bold font-sans">{displayReview.tacticalCounter}</p>
            </div>

            {/* Squad status and players */}
            <div className="neo-card p-5 relative overflow-hidden bg-white">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-yellow-400"></div>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-yellow-600 stroke-[2]" />
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">浼ょ梾涓庨樀瀹规帹婕?/h4>
              </div>
              <p className="text-[13px] text-slate-700 leading-relaxed font-bold font-sans">{displayReview.squadCondition}</p>
            </div>

            {/* Path and Promotion analysis */}
            <div className="neo-card p-5 relative overflow-hidden bg-white">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-900"></div>
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-4 h-4 text-slate-900 stroke-[2]" />
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">鐜銆佹垬鎰忎笌鍑虹嚎璧板悜</h4>
              </div>
              <p className="text-[13px] text-slate-700 leading-relaxed font-bold font-sans">{displayReview.pathAndTrend}</p>
            </div>

            {/* Model primary summary */}
            <div className="neo-card p-5 relative overflow-hidden bg-white">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-yellow-400"></div>
              <div className="flex items-center gap-2 mb-2">
                <Skull className="w-4 h-4 text-slate-900 stroke-[2]" />
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">鏍稿績妯″瀷棣栬鍒ゆ柇</h4>
              </div>
              <p className="text-[13.5px] text-slate-900 font-black leading-relaxed font-sans">{displayReview.primaryJudgment}</p>
            </div>
          </motion.div>
        ) : (
          <div className="neo-card p-8 text-center space-y-4 bg-slate-50">
            <p className="text-xs font-bold text-slate-600">鏈幏鍙栧埌涓撳妯″瀷璇勪及锛岃鐐瑰嚮鎸夐挳鐢熸垚鎶ュ憡銆?/p>
            {savedApiKey ? (
              <button
                onClick={generateAgiReport}
                className="neo-btn bg-slate-900 hover:bg-slate-950 px-4 py-2 text-xs cursor-pointer active:translate-y-0.5"
              >
                鐢熸垚 AGI 鏅鸿兘娣卞害鍒嗘瀽鎶ュ憡
              </button>
            ) : (
              <button
                onClick={onRefreshReview}
                className="neo-btn px-4 py-2 text-xs cursor-pointer active:translate-y-0.5"
              >
                涓€閿敓鎴愪笓涓氭垬鏈姤鍛?              </button>
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
              <h4 className="text-xs font-black text-slate-900">AI 鎴樻湳澶у笀瀹炴椂瀵硅皥</h4>
              <p className="text-[9px] text-slate-500 mt-0.5">閽堝鏈満璧涗簨锛屼笌 AI 瑙ｈ澶у笀杩涜娣卞害鎴樻湳璁ㄨ</p>
            </div>
          </div>
          {savedApiKey && chatMessages.length > 0 && (
            <button
              onClick={() => setChatMessages([])}
              className="p-1 text-slate-400 hover:text-rose-450 rounded transition-colors cursor-pointer"
              title="娓呯┖鑱婂ぉ璁板綍"
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
                <p className="text-xs text-slate-900 font-black">AI 鎴樻湳澶у笀鏈縺娲?/p>
                <p className="text-[10px] text-slate-500 max-w-[340px] leading-relaxed font-bold">
                  璇峰厛鍦ㄩ〉闈㈤《閮ㄩ厤缃偍鐨?**Gemini API Key** 鎴?**鑷畾涔夊ぇ妯″瀷 API Key (濡?DeepSeek銆侀€氫箟绛?**銆傛縺娲诲悗锛屽嵆鍙湪姝ゅ鍚?AI 鎻愰棶浠讳綍鏈夊叧 2026 涓栫晫鏉殑鍒嗘瀽銆佽鍒欐垨鎴樻湳鎺㈣銆?                </p>
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
                绔嬪嵆閰嶇疆 API Key
              </button>
            </div>
          ) : chatMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-2.5">
              <HelpCircle className="w-7 h-7 text-slate-400" />
              <div>
                <p className="text-xs text-slate-700 font-black">寮€濮嬪叧浜庢湰璧涗簨鐨勬垬鏈帰璁?/p>
                <p className="text-[10px] text-slate-500 mt-1 max-w-[280px] font-bold">
                  鎮ㄥ彲浠ユ彁闂换浣曚笘鐣屾澂鐩稿叧闂锛屼緥濡傦細鈥滀笅闆ㄥ鍝柟鏇存湁鍒╋紵鈥濄€佲€?{home.name}濡備綍闃插畧${away.name}鐨?{away.tacticsName}鎵撴硶锛熲€濈瓑銆?                </p>
              </div>
            </div>
          ) : (
            chatMessages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "model" && (
                  <div className="w-7 h-7 rounded-lg bg-slate-900 border-2 border-slate-900 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]">
                    <Bot className="w-3.5 h-3.5" />
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
                  <div className="w-7 h-7 rounded-lg bg-yellow-400 border-2 border-slate-900 flex items-center justify-center text-slate-950 shrink-0 mt-0.5 font-black text-[10px] shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]">
                    U
                  </div>
                )}
              </div>
            ))
          )}
          {chatLoading && (
            <div className="flex gap-2.5 justify-start animate-pulse">
              <div className="w-7 h-7 rounded-lg bg-slate-900 border-2 border-slate-900 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="p-3 bg-white text-slate-900 border-2 border-slate-900 rounded-xl rounded-tl-none text-xs flex items-center gap-1.5 font-bold shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                <span className="w-1.5 h-1.5 bg-slate-900 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-slate-900 rounded-full animate-bounce delay-75"></span>
                <span className="w-1.5 h-1.5 bg-slate-900 rounded-full animate-bounce delay-150"></span>
                <span>AI 鎴樻湳澶у笀姝ｅ湪鎬濊€冧腑...</span>
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
            placeholder={savedApiKey ? `鍚戞垬鏈ぇ甯堟彁闂叧浜庢湰鍦哄鎴樼殑鎶€鎴樻湳缁嗚妭...` : "璇峰厛閰嶇疆 API Key 浠ュ紑鍚璇?.."}
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

