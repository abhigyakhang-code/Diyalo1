import { useState, useCallback, useRef } from "react";
import { useApp } from "../context/AppContext";
import { translations } from "../i18n/translations";
import { SKILL_SUGGESTIONS } from "../data/mockData";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";
import jsPDF from "jspdf";
import { Sparkles, Send, Download, Plus, X, FileText, User, Briefcase, Star } from "lucide-react";

const STEP_ORDER = [
  { field: "skillLevel", icon: Star, placeholder: "Skilled or Unskilled" },
  { field: "category", icon: Briefcase, placeholder: "Driving, Plumbing, Tailoring..." },
  { field: "gender", icon: User, placeholder: "Male, Female, Other" },
  { field: "education", icon: User, placeholder: "High school, Technical training..." },
  { field: "objective", icon: User, placeholder: "Short goal for the job you want" },
  { field: "name", icon: User, placeholder: "Ram Bahadur Tamang" },
  { field: "phone", icon: User, placeholder: "98XXXXXXXX" },
  { field: "email", icon: User, placeholder: "email@example.com" },
  { field: "location", icon: User, placeholder: "Kathmandu, Nepal" },
  { field: "experience", icon: Briefcase, placeholder: "2 years as delivery rider at Foodmandu" },
  { field: "primarySkill", icon: Star, placeholder: "Plumbing, Driving, Electrician..." }
] as const;

function getSuggestedSkills(category: string, skillLevel?: string) {
  const lower = category.toLowerCase();
  if (skillLevel === "unskilled") {
    return [
      "Punctuality",
      "Safety awareness",
      "Teamwork",
      "Hardworking",
      "Following instructions"
    ];
  }

  if (lower in SKILL_SUGGESTIONS) {
    return SKILL_SUGGESTIONS[lower as keyof typeof SKILL_SUGGESTIONS];
  }

  return [
    "Attention to detail",
    "Time management",
    "Teamwork",
    "Adaptability",
    "Customer service"
  ];
}

export function CVBuilderPage() {
  const { language, addNotification, cvData, updateCVData } = useApp();
  const t = translations[language];
  const previewRef = useRef<HTMLDivElement | null>(null);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [input, setInput] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  const handleBack = useCallback(() => {
    if (currentStep <= 0) return;
    setCurrentStep(currentStep - 1);
    setInput("");
  }, [currentStep]);

  const buildSummaryText = useCallback(() => {
    const category = cvData.category || (language === "ne" ? "समयमै काम गर्न सक्ने" : "reliable worker");
    const skillLevel = cvData.skillLevel === "skilled"
      ? (language === "ne" ? "दक्ष" : "skilled")
      : cvData.skillLevel === "unskilled"
      ? (language === "ne" ? "अदक्ष" : "unskilled")
      : (language === "ne" ? "मजबुत प्रेरणादायी" : "motivated");
    const education = cvData.education || (language === "ne" ? "आधुनिक तालिम" : "relevant training");
    const primarySkill = cvData.primarySkill || (language === "ne" ? "आफ्नो मुख्य सिप" : "primary skill");
    const gender = cvData.gender || (language === "ne" ? "उनी" : "they");

    if (cvData.objective.trim()) {
      return cvData.objective;
    }

    return language === "ne"
      ? `${gender} ${education} प्राप्त, ${category} क्षेत्रमा काम गर्न चाहने ${skillLevel} उमेद्वारले टीमवर्क, समय प्रबंधन र ग्राहक केन्द्रित सेवा दिन तयार छ।`
      : `A ${skillLevel} candidate with ${education} and hands-on experience in ${category}, ready to contribute strong teamwork, time management, and customer-focused service to your organization.`;
  }, [cvData.category, cvData.gender, cvData.objective, cvData.primarySkill, cvData.education, cvData.skillLevel, language]);

  const handleNext = useCallback(() => {
    if (!input.trim()) return;

    const step = STEP_ORDER[currentStep];
    if (step.field === "name") {
      updateCVData({ name: input });
    } else if (step.field === "experience") {
      updateCVData({ experience: input });
    } else if (step.field === "primarySkill") {
      updateCVData({ primarySkill: input });
    } else if (step.field === "skillLevel") {
      updateCVData({ skillLevel: input.toLowerCase().startsWith("sk") ? "skilled" : "unskilled" });
    } else if (step.field === "category") {
      updateCVData({ category: input });
    } else if (step.field === "objective") {
      updateCVData({ objective: input });
    } else if (step.field === "gender") {
      updateCVData({ gender: input });
    } else if (step.field === "education") {
      updateCVData({ education: input });
    } else if (step.field === "phone") {
      updateCVData({ phone: input });
    } else if (step.field === "email") {
      updateCVData({ email: input });
    } else if (step.field === "location") {
      updateCVData({ location: input });
    }

    const nextStep = currentStep + 1;
    if (step.field === "category" || step.field === "skillLevel") {
      const category = step.field === "category" ? input : cvData.category;
      const skillLevel = step.field === "skillLevel" ? (input.toLowerCase().startsWith("sk") ? "skilled" : "unskilled") : cvData.skillLevel;
      setAiSuggestions(getSuggestedSkills(category, skillLevel));
    }

    setInput("");
    setCurrentStep(nextStep);
  }, [currentStep, input, updateCVData, cvData.category, cvData.skillLevel]);

  const addSkill = useCallback((skill: string) => {
    if (!cvData.skills.includes(skill)) {
      updateCVData({ skills: [...cvData.skills, skill] });
      addNotification(
        language === "ne" ? `"${skill}" सिप थपियो` : `Skill "${skill}" added`,
        "success"
      );
    }
  }, [cvData.skills, updateCVData, addNotification, language]);

  const removeSkill = useCallback((skill: string) => {
    updateCVData({ skills: cvData.skills.filter(s => s !== skill) });
  }, [cvData.skills, updateCVData]);

  const handleDownload = useCallback(() => {
    try {
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const margin = 15;
      const width = 210 - margin * 2;
      let y = 18;
      const accentColor = [16, 86, 74];
      const safeText = (text: string) => text.replace(/\s+/g, " ").trim();
      const sectionHeader = (label: string) => {
        pdf.setFontSize(11);
        pdf.setTextColor(...accentColor);
        pdf.setFont("times", "bold");
        pdf.text(label, margin, y);
        y += 6;
        pdf.setDrawColor(...accentColor);
        pdf.setLineWidth(0.6);
        pdf.line(margin, y, margin + 35, y);
        y += 8;
      };

      // Header banner
      pdf.setFillColor(...accentColor);
      pdf.rect(0, 0, 210, 28, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont("times", "bold");
      pdf.text(safeText(cvData.name || (language === "ne" ? "तपाईंको नाम" : "Your Name")), margin, 16);

      pdf.setFontSize(10);
      pdf.setFont("times", "normal");
      pdf.text(safeText(cvData.category || (language === "ne" ? "कामको वर्ग" : "Job Category")), margin, 23);
      pdf.setTextColor(255, 255, 255);
      pdf.text(`${language === "ne" ? "स्तर" : "Skill Level"}: ${cvData.skillLevel === "skilled"
        ? (language === "ne" ? "दक्ष" : "Skilled")
        : cvData.skillLevel === "unskilled"
        ? (language === "ne" ? "अदक्ष" : "Unskilled")
        : (language === "ne" ? "सिप स्तर" : "Skill Level")}`, 140, 23);

      y = 38;
      pdf.setTextColor(34, 34, 34);
      pdf.setFontSize(10);
      pdf.setFont("times", "normal");
      pdf.text(`${language === "ne" ? "फोन" : "Phone"}: ${safeText(cvData.phone || "98XXXXXXXX")}`, margin, y);
      pdf.text(`${language === "ne" ? "इमेल" : "Email"}: ${safeText(cvData.email || "email@example.com")}`, margin, y + 5);
      pdf.text(`${language === "ne" ? "स्थान" : "Location"}: ${safeText(cvData.location || (language === "ne" ? "काठमाडौ, नेपाल" : "Kathmandu, Nepal"))}`, margin, y + 10);
      pdf.text(`${language === "ne" ? "लिंग" : "Gender"}: ${safeText(cvData.gender || (language === "ne" ? "लिंग उल्लेख गर्नुहोस्" : "Specify gender"))}`, margin + 105, y);
      pdf.text(`${language === "ne" ? "शिक्षा" : "Education"}: ${safeText(cvData.education || (language === "ne" ? "शिक्षा विवरण यहाँ देखा पर्नेछ" : "Education details will appear here"))}`, margin + 105, y + 5);
      y += 20;

      // Summary section
      sectionHeader(language === "ne" ? "व्यावसायिक सार" : "Professional Summary");
      pdf.setTextColor(60, 60, 60);
      pdf.setFontSize(10);
      pdf.setFont("times", "normal");
      const summaryText = buildSummaryText();
      pdf.text(safeText(summaryText), margin, y, { maxWidth: width });
      y += pdf.getTextDimensions(safeText(summaryText), { maxWidth: width }).h + 8;

      // Skills section
      sectionHeader(language === "ne" ? "सिपहरू" : "Skills");
      pdf.setTextColor(60, 60, 60);
      pdf.setFontSize(10);
      const skillsText = cvData.skills.length > 0 ? cvData.skills.join(", ") : (language === "ne" ? "सिपहरू यहाँ देखा पर्नेछन्" : "Skills will appear here");
      pdf.text(safeText(skillsText), margin, y, { maxWidth: width });
      y += pdf.getTextDimensions(safeText(skillsText), { maxWidth: width }).h + 8;

      // Experience section
      sectionHeader(language === "ne" ? "अनुभव" : "Experience");
      pdf.setTextColor(60, 60, 60);
      pdf.setFontSize(10);
      pdf.text(safeText(cvData.experience || (language === "ne" ? "अनुभव विवरण यहाँ देखा पर्नेछ" : "Experience details will appear here")), margin, y, { maxWidth: width });
      y += pdf.getTextDimensions(safeText(cvData.experience || (language === "ne" ? "अनुभव विवरण यहाँ देखा पर्नेछ" : "Experience details will appear here")), { maxWidth: width }).h + 8;

      // Primary skill line
      sectionHeader(language === "ne" ? "मुख्य सिप" : "Primary Skill");
      pdf.setTextColor(60, 60, 60);
      pdf.setFontSize(10);
      pdf.text(safeText(cvData.primarySkill || (language === "ne" ? "मुख्य सिप यहाँ लेख्नुहोस्" : "Your primary skill goes here")), margin, y, { maxWidth: width });

      pdf.save(`Diyalo-CV-${cvData.name || "resume"}.pdf`);
      addNotification(
        language === "ne" ? "सीभी पीडीएफ डाउनलोड भयो!" : "CV downloaded as PDF!",
        "success"
      );
    } catch (error) {
      console.error(error);
      addNotification(
        language === "ne" ? "पीडीएफ निर्माणमा असफल भयो" : "Failed to generate PDF",
        "warning"
      );
    }
  }, [addNotification, cvData, language]);

  const handleSend = useCallback(() => {
    addNotification(
      language === "ne" ? "स्थानीय रोजगारदातालाई पठाइयो!" : "Sent to local employers!",
      "success"
    );
  }, [addNotification, language]);

  const stepLabels: Record<string, { q: string; qNe: string }> = {
    skillLevel: {
      q: "Are you skilled or unskilled?",
      qNe: "तपाईं अदक्ष हो या दक्ष?"
    },
    category: {
      q: "Which job category are you targeting?",
      qNe: "कुन कामको वर्गतर्फ तपाइँ जान चाहनुहुन्छ?"
    },
    objective: {
      q: "What is your job objective?",
      qNe: "तपाईंको काम उद्देश्य के हो?"
    },
    gender: {
      q: "What is your gender?",
      qNe: "तपाईंको लिंग के हो?"
    },
    education: {
      q: "What is your education background?",
      qNe: "तपाईंको शैक्षिक पृष्ठभूमि के हो?"
    },
    name: { 
      q: "What is your full name?", 
      qNe: "तपाईंको पूरा नाम के हो?" 
    },
    phone: {
      q: "What is your phone number?",
      qNe: "तपाईंको फोन नम्बर के हो?"
    },
    email: {
      q: "What is your email address?",
      qNe: "तपाईंको इमेल ठेगाना के हो?"
    },
    location: {
      q: "What is your location?",
      qNe: "तपाईं कहाँ बस्नुहुन्छ?"
    },
    experience: { 
      q: "What is your work experience?", 
      qNe: "तपाईंको कामको अनुभव के हो?" 
    },
    primarySkill: { 
      q: "What is your primary skill?", 
      qNe: "तपाईंको मुख्य सिप के हो?" 
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{t.buildResume}</h1>
        <p className="text-slate-500 mt-1">
          {language === "ne" 
            ? "एआई सुझावहरूसँग कुराकानीद्वारा आफ्नो सीभी बनाउनुहोस्"
            : "Build your resume conversationally with AI suggestions"}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Chat Side */}
        <Card className="bg-gradient-to-b from-white to-slate-50">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold text-slate-900">Diyalo CV Assistant</p>
              <p className="text-xs text-slate-500">
                {language === "ne" ? "चरण" : "Step"} {Math.min(currentStep + 1, STEP_ORDER.length)} / {STEP_ORDER.length}
              </p>
            </div>
          </div>

          {currentStep < STEP_ORDER.length && (
            <div className="mt-4 space-y-4">
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                <p className="font-semibold text-emerald-800">
                  {language === "ne" 
                    ? stepLabels[STEP_ORDER[currentStep].field].qNe 
                    : stepLabels[STEP_ORDER[currentStep].field].q}
                </p>
              </div>
              
              <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleNext()}
                  placeholder={STEP_ORDER[currentStep].placeholder}
                  className="flex-1"
                />
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Button 
                    onClick={handleBack}
                    disabled={currentStep === 0}
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    {language === "ne" ? "पछाडि" : "Back"}
                  </Button>
                  <Button 
                    onClick={handleNext}
                    disabled={!input.trim()}
                    leftIcon={<Send className="h-5 w-5" />}
                    className="w-full sm:w-auto"
                  >
                    {language === "ne" ? "पठाउनुहोस्" : "Send"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {currentStep >= STEP_ORDER.length && (
            <div className="mt-4 space-y-4">
              {aiSuggestions.length > 0 && (
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200">
                  <p className="text-sm font-bold text-emerald-800 mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    {t.aiSuggestions} {cvData.category ? `(${cvData.category})` : ""}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {aiSuggestions.map(skill => (
                      <button
                        key={skill}
                        onClick={() => addSkill(skill)}
                        disabled={cvData.skills.includes(skill)}
                        className={`rounded-lg px-3 py-2 text-xs font-bold transition-all flex items-center gap-1 ${
                          cvData.skills.includes(skill)
                            ? "bg-emerald-200 text-emerald-800 cursor-default"
                            : "bg-white text-emerald-700 border border-emerald-300 hover:bg-emerald-100"
                        }`}
                      >
                        {!cvData.skills.includes(skill) && <Plus className="h-3 w-3" />}
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm font-semibold text-slate-700 mb-2">{t.yourSkills}:</p>
                <div className="flex flex-wrap gap-2">
                  {cvData.skills.map(skill => (
                    <span 
                      key={skill} 
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-3 py-1.5 text-sm font-semibold text-emerald-800"
                    >
                      {skill}
                      <button 
                        onClick={() => removeSkill(skill)}
                        className="text-emerald-600 hover:text-red-500 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                  {cvData.skills.length === 0 && (
                    <span className="text-sm text-slate-400 italic">
                      {language === "ne" ? "अझै कुनै सिप थपिएको छैन" : "No skills added yet"}
                    </span>
                  )}
                </div>
              </div>

              <Button 
                variant="outline" 
                onClick={() => { setCurrentStep(0); setAiSuggestions([]); }}
                className="w-full"
                leftIcon={<span className="text-lg">↺</span>}
              >
                {language === "ne" ? "पुन: सुरु गर्नुहोस्" : "Start Over"}
              </Button>
            </div>
          )}
        </Card>

        {/* Preview Side */}
        <Card>
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-600" />
            {t.livePreview}
          </h3>
          
          <div ref={previewRef} className="border-2 border-slate-100 rounded-xl p-6 bg-gradient-to-b from-white to-slate-50 min-h-[400px]">
            {/* Header */}
            <div className="text-center pb-5 border-b-2 border-emerald-100">
              <h2 className="text-2xl font-bold text-slate-900">
                {cvData.name || (language === "ne" ? "तपाईंको नाम" : "Your Name")}
              </h2>
              <p className="text-emerald-700 font-medium mt-1">
                {cvData.category || (language === "ne" ? "कामको वर्ग" : "Job Category")}
              </p>
              <p className="text-slate-600 text-sm mt-1">
                {cvData.gender || (language === "ne" ? "लिंग" : "Gender")} · {cvData.skillLevel === "skilled"
                  ? (language === "ne" ? "दक्ष" : "Skilled")
                  : cvData.skillLevel === "unskilled"
                  ? (language === "ne" ? "अदक्ष" : "Unskilled")
                  : (language === "ne" ? "सिप स्तर" : "Skill Level")}
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 items-center justify-center mt-3 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="text-emerald-500">📞</span>
                  {cvData.phone || "98XXXXXXXX"}
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-emerald-500">✉️</span>
                  {cvData.email || "email@example.com"}
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-emerald-500">📍</span>
                  {cvData.location || (language === "ne" ? "काठमाडौ, नेपाल" : "Kathmandu, Nepal")}
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-emerald-500">🎓</span>
                  {cvData.education || (language === "ne" ? "शिक्षा विवरण" : "Education")}
                </span>
              </div>
            </div>

            {/* Professional Summary */}
            <div className="py-5 border-b border-slate-100">
              <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-3">
                {language === "ne" ? "व्यावसायिक सार" : "Professional Summary"}
              </h4>
              <p className="text-sm text-slate-700 leading-relaxed">
                {buildSummaryText()}
              </p>
            </div>

            {/* Skills */}
            <div className="py-5 border-b border-slate-100">
              <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-3">
                {t.yourSkills}
              </h4>
              <div className="flex flex-wrap gap-2">
                {cvData.skills.length > 0 ? cvData.skills.map(s => (
                  <span key={s} className="rounded-md bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-800 border border-emerald-100">
                    {s}
                  </span>
                )) : (
                  <span className="text-sm text-slate-400 italic">
                    {language === "ne" ? "सिपहरू यहाँ देखा पर्नेछन्" : "Skills will appear here"}
                  </span>
                )}
              </div>
            </div>

            {/* Experience */}
            <div className="py-5">
              <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-3">
                {t.experience}
              </h4>
              <p className="text-sm text-slate-700 leading-relaxed">
                {cvData.experience || (language === "ne" ? "अनुभव विवरण यहाँ देखा पर्नेछ" : "Experience details will appear here")}
              </p>
            </div>

            {/* Objective */}
            <div className="py-5 border-t border-slate-100">
              <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-3">
                {t.objective}
              </h4>
              <p className="text-sm text-slate-700 leading-relaxed">
                {cvData.objective || (language === "ne" ? "तपाईंको लक्ष्य यहाँ देखा पर्नेछ" : "Your objective will appear here")}
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <Button 
              onClick={handleDownload}
              fullWidth
              leftIcon={<Download className="h-5 w-5" />}
            >
              {t.download}
            </Button>
            <Button 
              variant="outline"
              onClick={handleSend}
              fullWidth
              leftIcon={<Send className="h-5 w-5" />}
            >
              {language === "ne" ? "रोजगारदातालाई पठाउनुहोस्" : "Send to Employers"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
