import { useState, useCallback, useRef } from "react";
import { useApp } from "../context/AppContext";
import { translations } from "../i18n/translations";
import { INTERVIEW_TRACKS } from "../data/mockData";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { 
  Mic, ChevronDown, Info, ArrowRight, RefreshCw, 
  CheckCircle2, Target, BookOpen, ThumbsUp, Eye 
} from "lucide-react";
import type { InterviewTrack } from "../types";

export function InterviewPage() {
  const { language, addNotification } = useApp();
  const t = translations[language];
  
  const [track, setTrack] = useState<InterviewTrack>("security");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  const currentTrack = INTERVIEW_TRACKS[track];
  const currentQuestion = currentTrack.questions[questionIndex];
  const isLastQuestion = questionIndex === currentTrack.questions.length - 1;

  const handleTrackChange = useCallback((newTrack: InterviewTrack) => {
    setTrack(newTrack);
    setQuestionIndex(0);
    setShowEvaluation(false);
    setIsRecording(false);
    setTranscript("");
  }, []);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      setShowEvaluation(true);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      addNotification(
        language === "ne"
          ? "यो ब्राउजरमा भ्वाइस सपोर्ट छैन। कृपया Chrome प्रयोग गर्नुहोस्।"
          : "Voice recognition not supported. Please use Chrome.",
        "error"
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === "ne" ? "ne-NP" : "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let text = "";
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }
      setTranscript(text);
    };

    recognition.onerror = (e: any) => {
      addNotification(
        (language === "ne" ? "माइक्रोफोन त्रुटि: " : "Mic error: ") + e.error,
        "error"
      );
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    setTranscript("");
    setShowEvaluation(false);
    recognition.start();
    setIsRecording(true);
  }, [isRecording, language, addNotification]);

  const handleNext = useCallback(() => {
    if (isLastQuestion) {
      addNotification(
        language === "ne" 
          ? "🎉 अन्तर्वार्ता अभ्यास समाप्त!" 
          : "🎉 Interview practice complete!",
        "success"
      );
      setQuestionIndex(0);
    } else {
      setQuestionIndex(prev => prev + 1);
    }
    setShowEvaluation(false);
    setIsRecording(false);
    setTranscript("");
  }, [isLastQuestion, addNotification, language]);

  const handleSkip = useCallback(() => {
    setShowEvaluation(true);
    setIsRecording(false);
  }, []);

  const trackOptions = [
    { value: "security" as InterviewTrack, label: language === "ne" ? "सुरक्षा गार्ड" : "Security Guard" },
    { value: "cashier" as InterviewTrack, label: language === "ne" ? "क्यासियर" : "Cashier" },
    { value: "driver" as InterviewTrack, label: language === "ne" ? "चालक" : "Driver" },
    { value: "cleaner" as InterviewTrack, label: language === "ne" ? "सरसफाइ कर्मचारी" : "Cleaner" }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{t.interviewCoach}</h1>
          <p className="text-slate-500 mt-1">
            {language === "ne" 
              ? "आवाज रेकर्डिङ प्रतिक्रियासहित अभ्यास गर्नुहोस्"
              : "Practice with voice recording feedback"}
          </p>
        </div>
        
        {/* Track Selector */}
        <div className="relative">
          <select
            value={track}
            onChange={e => handleTrackChange(e.target.value as InterviewTrack)}
            className="appearance-none w-full sm:w-48 rounded-xl border-2 border-slate-200 bg-white px-4 py-3 pr-10 text-sm font-bold text-slate-700 focus:outline-none focus:border-emerald-400 cursor-pointer min-h-[48px]"
          >
            {trackOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Question Card */}
      <Card className="space-y-6">
        <div className="flex items-center justify-between">
          <Badge variant="info">
            {t.question} {questionIndex + 1} / 5
          </Badge>
          <button 
            onClick={() => { setQuestionIndex(0); setShowEvaluation(false); setIsRecording(false); setTranscript(""); }}
            className="text-sm font-semibold text-slate-500 hover:text-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {language === "ne" ? "रिसेट" : "Reset"}
          </button>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold text-slate-900 leading-relaxed">
            {currentQuestion.q}
          </h3>
          
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
            <p className="text-sm text-amber-800 flex items-start gap-2">
              <Info className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                <strong>{t.hint}:</strong> {currentQuestion.hint}
              </span>
            </p>
          </div>
        </div>

        {/* Recording Button */}
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="relative">
            <button
              onClick={toggleRecording}
              className={`flex h-24 w-24 items-center justify-center rounded-full transition-all duration-300 ${
                isRecording
                  ? "bg-red-500 text-white shadow-xl shadow-red-300 scale-110"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 shadow-lg"
              }`}
            >
              <Mic className={`h-10 w-10 ${isRecording ? "animate-pulse" : ""}`} />
            </button>
            {isRecording && (
              <>
                <span className="absolute inset-0 rounded-full border-4 border-red-300 animate-[ping_1.5s_ease-out_infinite]" />
                <span className="absolute inset-0 rounded-full border-4 border-red-300 animate-[ping_2s_ease-out_infinite_0.3s]" />
              </>
            )}
          </div>
          <p className="text-sm font-semibold text-slate-600 text-center">
            {isRecording 
              ? t.stopRecording 
              : t.recordAnswer}
          </p>

          {/* Live transcript */}
          {(isRecording || transcript) && (
            <div className="w-full bg-slate-50 rounded-xl p-4 border border-slate-200 min-h-[60px]">
              <p className="text-xs font-semibold text-slate-400 mb-1">
                {language === "ne" ? "तपाईंको जवाफ:" : "Your answer:"}
              </p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">
                {transcript || (language === "ne" ? "सुन्दै..." : "Listening...")}
              </p>
            </div>
          )}
        </div>

        {/* Evaluation */}
        {showEvaluation && (
          <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Strengths */}
              <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-200">
                <h4 className="font-bold text-emerald-800 flex items-center gap-2 text-sm mb-4">
                  <ThumbsUp className="h-4 w-4" />
                  {t.strengths}
                </h4>
                <ul className="space-y-3 text-sm text-emerald-700">
                  {[
                    language === "ne" 
                      ? "तपाईंको आवाजमा स्पष्ट र आत्मविश्वासपूर्ण लय पहिचान गरियो"
                      : "Clear and confident tone detected in your voice",
                    language === "ne"
                      ? "भूमिका सम्बन्धी पेशेवर शब्दावलीको राम्रो प्रयोग"
                      : "Good use of professional terminology relevant to role",
                    language === "ne"
                      ? "उचित गति र बुझिने उच्चारण"
                      : "Appropriate pacing and understandable pronunciation"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Improvements */}
              <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
                <h4 className="font-bold text-amber-800 flex items-center gap-2 text-sm mb-4">
                  <Target className="h-4 w-4" />
                  {t.improve}
                </h4>
                <ul className="space-y-3 text-sm text-amber-700">
                  {[
                    language === "ne"
                      ? "आफ्नो अघिल्लो अनुभवबाट विशिष्ट उदाहरणहरू थप्नुहोस्"
                      : "Add specific examples from your past experience",
                    language === "ne"
                      ? "सुरक्षा जागरूकता उल्लेख गर्नुहोस् — नेपाली बजारमा अत्यधिक मूल्यवान्"
                      : "Mention safety awareness — highly valued in Nepali market",
                    language === "ne"
                      ? "काममा नयाँ प्रक्रियाहरू सिक्ने इच्छा व्यक्त गर्नुहोस्"
                      : "Express willingness to learn new procedures on the job"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <ArrowRight className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
              <p className="text-sm text-blue-800 font-semibold flex items-center gap-2 mb-2">
                <BookOpen className="h-4 w-4" />
                {language === "ne" ? "स्थानीय बजार जानकारी:" : "Local Market Insight:"}
              </p>
              <p className="text-sm text-blue-700 leading-relaxed">
                {language === "ne"
                  ? "नेपाली रोजगारदाताहरूले समयको पालना (punctuality), पदानुक्रमको आदर (respect for hierarchy), र लचिलो सिफ्टमा काम गर्ने इच्छालाई मूल्य दिन्छन्। आफ्नो उत्तरमा यी गुणहरू जोड्नुहोस्।"
                  : "Nepali employers value punctuality, respect for hierarchy, and willingness to work flexible shifts. Emphasize these traits in your answers."}
              </p>
            </div>

            <Button
              onClick={handleNext}
              fullWidth
              size="lg"
              rightIcon={<ArrowRight className="h-5 w-5" />}
            >
              {isLastQuestion 
                ? (language === "ne" ? "अभ्यास समाप्त" : "Finish Practice")
                : t.next}
            </Button>
          </div>
        )}

        {!showEvaluation && !isRecording && (
          <Button
            variant="outline"
            onClick={handleSkip}
            fullWidth
            leftIcon={<Eye className="h-5 w-5" />}
          >
            {language === "ne" ? "रेकर्डिङ बिना मूल्यांकन हेर्नुहोस्" : "Skip Recording & Evaluate"}
          </Button>
        )}
      </Card>
    </div>
  );
}