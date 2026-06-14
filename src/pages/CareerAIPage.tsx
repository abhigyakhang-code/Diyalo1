import { useState, useEffect, useCallback } from "react";
import { useApp } from "../context/AppContext";
import { translations } from "../i18n/translations";
import { ROADMAP_DATA } from "../data/mockData";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { RefreshCw, TrendingUp, Sparkles } from "lucide-react";
import { generateId } from "../i18n/translations";
import type { ChatMessage, ChatOption } from "../types";

const QUESTIONS: { 
  id: number; 
  text: string; 
  textNe: string;
  options: ChatOption[];
}[] = [
  {
    id: 1,
    text: "Do you prefer hands-on work or computer work?",
    textNe: "तपाईंलाई हातले गर्ने काम मन पर्छ कि कम्प्युटरको काम?",
    options: [
      { value: "hands_on", label: "Hands-on / हातको काम" },
      { value: "computer", label: "Computer / कम्प्युटरको काम" }
    ]
  },
  {
    id: 2,
    text: "Do you prefer indoor work or outdoor work?",
    textNe: "तपाईंलाई भित्रको काम मन पर्छ कि बाहिरको काम?",
    options: [
      { value: "indoor", label: "Indoor / भित्र" },
      { value: "outdoor", label: "Outdoor / बाहिर" }
    ]
  },
  {
    id: 3,
    text: "Where do you prefer to work? City or village?",
    textNe: "तपाईं कहाँ काम गर्न रुचाउनुहुन्छ? सहर वा गाउँ?",
    options: [
      { value: "city", label: "City / सहर" },
      { value: "village", label: "Village / गाउँ" }
    ]
  }
];

export function CareerAIPage() {
  const { language, addNotification } = useApp();
  const t = translations[language];
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [mode, setMode] = useState<"survey" | "chat">("survey");

  useEffect(() => {
    if (messages.length === 0) {
      if (mode === "survey") {
        const firstQuestion = QUESTIONS[0];
        setMessages([{
          id: generateId(),
          sender: "ai",
          text: language === "ne" ? firstQuestion.textNe : firstQuestion.text,
          options: firstQuestion.options
        }]);
      } else {
        setMessages([{
          id: generateId(),
          sender: "ai",
          text: language === "ne"
            ? "एआई करियर बोटमा स्वागत छ! तपाईं कुनै पनि करियर सम्बन्धी प्रश्न सोध्न सक्नुहुन्छ।"
            : "Welcome to the AI Career Bot! Ask any career-related question to get started."
        }]);
      }
    }
  }, [messages.length, language, mode]);

  const handleOptionSelect = useCallback(async (_: string, optionLabel: string) => {
    const userMsg: ChatMessage = {
      id: generateId(),
      sender: "user",
      text: optionLabel
    };
    setMessages(prev => [...prev, userMsg]);

    const nextStep = currentStep + 1;

    if (nextStep < QUESTIONS.length) {
      const nextQuestion = QUESTIONS[nextStep];
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: generateId(),
          sender: "ai",
          text: language === "ne" ? nextQuestion.textNe : nextQuestion.text,
          options: nextQuestion.options
        }]);
      }, 300);
      setCurrentStep(nextStep);
      return;
    }

    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: generateId(),
        sender: "ai",
        text: language === "ne" 
          ? "🎉 बधाई छ! तपाईंको व्यक्तिगत करियर योजना यहाँ छ:"
          : "🎉 Congratulations! Here is your personalized career roadmap:"
      }]);
      setShowRoadmap(true);
      addNotification(
        language === "ne" 
          ? "करियर योजना तयार भयो! अनुमानित आम्दानी: रु २५,०००/महिना"
          : "Career roadmap generated! Est. Income: NPR 25,000/month",
        "success"
      );
    }, 300);

    setCurrentStep(nextStep);
  }, [currentStep, language, addNotification]);

  const handleSendMessage = useCallback(async () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = {
      id: generateId(),
      sender: "user",
      text: trimmed
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsSending(true);

    try {
      const response = await fetch("/api/career-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, language })
      });

      const data = await response.json();
      const aiText = typeof data?.text === "string"
        ? data.text
        : typeof data?.error === "string"
          ? data.error
          : data?.error?.message
            ? data.error.message
            : JSON.stringify(data?.error) || "Sorry, the AI did not respond.";

      setMessages(prev => [...prev, {
        id: generateId(),
        sender: "ai",
        text: aiText
      }] );
    } catch (error) {
      setMessages(prev => [...prev, {
        id: generateId(),
        sender: "ai",
        text: language === "ne" ? "सर्भरमा समस्या भयो। पुन: प्रयास गर्नुहोस्।" : "Server error, please try again."
      }] );
    } finally {
      setIsSending(false);
    }
  }, [inputText, language]);

  const handleModeChange = useCallback((selectedMode: "survey" | "chat") => {
    setMode(selectedMode);
    setMessages([]);
    setCurrentStep(0);
    setShowRoadmap(false);
    setInputText("");
  }, []);

  const handleReset = useCallback(() => {
    setMessages([]);
    setCurrentStep(0);
    setShowRoadmap(false);
    setInputText("");
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{t.careerGuide}</h1>
        <div className="mt-4 inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => handleModeChange("survey")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${mode === "survey" ? "bg-emerald-600 text-white" : "text-slate-600 hover:text-slate-900"}`}
          >
            {language === "ne" ? "अप्सन मोड" : "Options"}
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("chat")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${mode === "chat" ? "bg-emerald-600 text-white" : "text-slate-600 hover:text-slate-900"}`}
          >
            {language === "ne" ? "च्याट मोड" : "Chat"}
          </button>
        </div>
        <p className="text-slate-500 mt-2">
          {mode === "survey"
            ? language === "ne"
              ? "केही विकल्प चयन गरेर करियर सल्लाह पाउनुहोस्।"
              : "Select options to get guided career advice."
            : language === "ne"
              ? "सोध्न चाहनुभएको करियर प्रश्न यहाँ टाइप गर्नुहोस्।"
              : "Type your career question here."}
        </p>
      </div>

      {/* Chat Container */}
      <Card className="bg-gradient-to-b from-white to-slate-50">
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
          {messages.map((msg, idx) => (
            <div 
              key={msg.id}
              className={`flex ${msg.sender === "ai" ? "justify-start" : "justify-end"} animate-[fadeIn_0.3s_ease-out]`}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className={`max-w-[85%] rounded-2xl px-5 py-3.5 ${
                msg.sender === "ai"
                  ? "bg-white border-2 border-slate-200 rounded-tl-sm shadow-sm"
                  : "bg-emerald-600 text-white rounded-tr-sm"
              }`}>
                <p className="text-xs font-semibold opacity-70 mb-1">
                  {msg.sender === "ai" ? "🤖 Diyalo AI" : "👤 You"}
                </p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                
                {msg.options && currentStep < QUESTIONS.length && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {msg.options.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => handleOptionSelect(opt.value, opt.label)}
                        className="rounded-xl bg-emerald-50 border-2 border-emerald-200 px-4 py-2.5 text-sm font-bold text-emerald-700 hover:bg-emerald-100 hover:border-emerald-400 transition-all"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Roadmap */}
        {showRoadmap && (
          <div className="mt-6 pt-6 border-t border-slate-200 animate-[fadeIn_0.5s_ease-out]">
            <h3 className="text-lg font-bold text-slate-900 text-center mb-6 flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              {t.careerRoadmap}
            </h3>
            
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-1 bg-emerald-200 rounded-full" />
              
              {ROADMAP_DATA.map((step, idx) => (
                <div key={idx} className="relative flex gap-4 pb-6 last:pb-0">
                  <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white text-xl shadow-lg shadow-emerald-200">
                    {step.icon}
                  </div>
                  <div className="flex-1 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                        {t.step} {step.step}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">{step.duration}</span>
                    </div>
                    <h4 className="font-bold text-slate-900">{step.title}</h4>
                    <p className="text-sm text-slate-500 mt-1">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-4 text-white text-center">
              <p className="text-emerald-100 text-sm font-medium mb-1">{t.estimatedYield}</p>
              <p className="text-2xl font-bold flex items-center justify-center gap-2">
                <TrendingUp className="h-6 w-6" />
                NPR 25,000 / {language === "ne" ? "महिना" : "month"}
              </p>
            </div>
          </div>
        )}
      </Card>

      <div className="mt-4 flex items-center gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder={language === "ne" ? "तपाईंको प्रश्न लेख्नुहोस्..." : "Ask your career question..."}
          className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          disabled={isSending}
        />
        <Button onClick={handleSendMessage} disabled={isSending}>
          {isSending ? (language === "ne" ? "पठाइरहनु भएको" : "Sending...") : (language === "ne" ? "पठाउनुहोस्" : "Send")}
        </Button>
      </div>

      {showRoadmap && (
        <Button
          variant="outline"
          onClick={handleReset}
          className="mx-auto flex"
          leftIcon={<RefreshCw className="h-4 w-4" />}
        >
          {language === "ne" ? "पुन: सुरु गर्नुहोस्" : "Start Over"}
        </Button>
      )}
    </div>
  );
}
