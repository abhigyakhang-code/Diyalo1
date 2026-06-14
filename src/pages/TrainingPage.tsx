import { useState, useCallback } from "react";
import { useApp } from "../context/AppContext";
import { translations } from "../i18n/translations";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { 
  Wrench, Zap, Car, Scissors, Layers, Building2, MapPin, 
  Clock, Users, Send, Shield, Award, Heart
} from "lucide-react";
import type { TrainingCategory, Training } from "../types";

export function TrainingPage() {
  const { language, addNotification, isAuthenticated, userProfile, trainings } = useApp();
  const t = translations[language];
  
  const [category, setCategory] = useState<TrainingCategory>("all");
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const filteredTrainings = trainings.filter(t => 
    category === "all" ? true : t.category === category
  );

  const handleApply = useCallback((training: Training) => {
    setSelectedTraining(training);
  }, []);

  const confirmApply = useCallback(async () => {
    if (!selectedTraining) return;
    
    setIsApplying(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const msg = language === "ne"
      ? `"${selectedTraining.title}" को लागि आवेदन सफलतापूर्वक पठाइयो!`
      : `Application for "${selectedTraining.title}" submitted successfully!`;
    
    addNotification(msg, "success");
    setSelectedTraining(null);
    setIsApplying(false);
  }, [selectedTraining, addNotification, language]);

  const categoryOptions: { value: TrainingCategory; label: string; icon: typeof Wrench }[] = [
    { value: "all", label: t.all, icon: Layers },
    { value: "plumbing", label: t.plumbing, icon: Wrench },
    { value: "electrician", label: t.electrician, icon: Zap },
    { value: "driving", label: t.driving, icon: Car },
    { value: "tailoring", label: t.tailoring, icon: Scissors }
  ];

  const getAuthorityIcon = (authority: Training["authority"]) => {
    switch (authority) {
      case "CTEVT Verified": return <Shield className="h-3.5 w-3.5" />;
      case "Department of Labor Approved": return <Award className="h-3.5 w-3.5" />;
      default: return <Heart className="h-3.5 w-3.5" />;
    }
  };

  const getAuthorityVariant = (authority: Training["authority"]): "success" | "info" | "warning" => {
    switch (authority) {
      case "CTEVT Verified": return "success";
      case "Department of Labor Approved": return "info";
      default: return "warning";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{t.freeTraining}</h1>
        <p className="text-slate-500 mt-1">
          {language === "ne" 
            ? "सीटीईभीटी, वडा कार्यालय र श्रम विभागद्वारा प्रमाणित कार्यक्रमहरू" 
            : "CTEVT, Ward Office & Department of Labor verified programs"}
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categoryOptions.map(opt => (
          <button
            key={opt.value}
            onClick={() => setCategory(opt.value)}
            className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all min-h-[48px] ${
              category === opt.value
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <opt.icon className="h-5 w-5" />
            {opt.label}
          </button>
        ))}
      </div>

      {/* Training Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTrainings.map(training => (
          <Card key={training.id} hover>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${
                  training.category === "plumbing" ? "bg-blue-100 text-blue-700" :
                  training.category === "electrician" ? "bg-amber-100 text-amber-700" :
                  training.category === "driving" ? "bg-emerald-100 text-emerald-700" :
                  "bg-pink-100 text-pink-700"
                }`}>
                  {training.category === "plumbing" && <Wrench className="h-7 w-7" />}
                  {training.category === "electrician" && <Zap className="h-7 w-7" />}
                  {training.category === "driving" && <Car className="h-7 w-7" />}
                  {training.category === "tailoring" && <Scissors className="h-7 w-7" />}
                </div>
                <Badge variant={getAuthorityVariant(training.authority)}>
                  {getAuthorityIcon(training.authority)}
                  {training.authority}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <CardTitle>{training.title}</CardTitle>
              </div>

              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{training.provider}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{training.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">{training.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{training.seats} {t.seatsAvailable}</span>
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">{training.description}</p>

              <Button
                onClick={() => handleApply(training)}
                fullWidth
                leftIcon={<Send className="h-5 w-5" />}
              >
                {language === "ne" ? "निःशुल्क आवेदन दिनुहोस्" : "Apply for Free"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Apply Modal */}
      {selectedTraining && (
        <div 
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setSelectedTraining(null)}
        >
          <div 
            className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-6 space-y-4 animate-[scaleIn_0.2s_ease-out]"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 mb-4">
                <Send className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                {language === "ne" ? "आवेदन पुष्टि गर्नुहोस्" : "Confirm Application"}
              </h3>
            </div>

            <div className="bg-emerald-50 rounded-xl p-4 space-y-2">
              <p className="font-bold text-emerald-800">{selectedTraining.title}</p>
              <p className="text-sm text-emerald-700">{selectedTraining.provider}</p>
              <p className="text-sm text-emerald-600">
                {selectedTraining.duration} · {selectedTraining.seats} {t.seatsAvailable}
              </p>
            </div>

            {isAuthenticated && (
              <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 space-y-1">
                <p><span className="font-semibold">{t.fullName}:</span> {userProfile.fullName}</p>
                <p><span className="font-semibold">{t.phoneNumber}:</span> {userProfile.phone}</p>
                <p><span className="font-semibold">{t.emailAddress}:</span> {userProfile.email}</p>
              </div>
            )}

            {!isAuthenticated && (
              <p className="text-sm text-amber-600 bg-amber-50 rounded-xl p-3 flex items-center gap-2">
                <span className="text-lg">ℹ️</span>
                {language === "ne" 
                  ? "विवरण स्वत: भर्न लगइन गर्नुहोस्" 
                  : "Login to auto-fill your details"}
              </p>
            )}

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setSelectedTraining(null)}
                className="flex-1"
              >
                {t.cancel}
              </Button>
              <Button 
                onClick={confirmApply}
                isLoading={isApplying}
                className="flex-1"
              >
                {t.confirm}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
