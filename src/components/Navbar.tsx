import { useApp } from "../context/AppContext";
import { translations } from "../i18n/translations";
import { Button } from "./ui/Button";
import { 
  Briefcase, GraduationCap, Sparkles, FileText, Mic, Users, 
  Menu, X, User, LogOut, Globe 
} from "lucide-react";
import type { NavModule } from "../types";

const commonNavItems: { id: NavModule; icon: typeof Briefcase }[] = [
  { id: "jobs", icon: Briefcase },
  { id: "training", icon: GraduationCap }
];

const userNavItems: { id: NavModule; icon: typeof Briefcase }[] = [
  ...commonNavItems,
  { id: "career-ai", icon: Sparkles },
  { id: "cv-builder", icon: FileText },
  { id: "interview", icon: Mic }
];

const dealerNavItems: { id: NavModule; icon: typeof Briefcase }[] = [
  ...commonNavItems,
  { id: "employer" as NavModule, icon: Users }
];

export function Navbar() {
  const { 
    role, userProfile, isAuthenticated, activeModule, setActiveModule,
    setShowAuthModal, mobileMenuOpen, setMobileMenuOpen,
    language, toggleLanguage, logout
  } = useApp();
  
  const t = translations[language];

  const displayNavItems = role === "dealer" 
    ? dealerNavItems
    : userNavItems;

  const navLabels: Record<NavModule, string> = {
    jobs: t.jobs,
    training: t.training,
    "career-ai": t.aiGuide,
    "cv-builder": t.cvMaker,
    interview: t.interview,
    employer: t.hire
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white font-bold text-lg shadow-lg shadow-emerald-200">
              {language === "ne" ? "दी" : "D"}
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-700 to-emerald-500 bg-clip-text text-transparent hidden sm:block">
              {t.appName}
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {displayNavItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
                  activeModule === item.id 
                    ? "bg-emerald-50 text-emerald-700 shadow-sm" 
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span className="hidden lg:inline">{navLabels[item.id]}</span>
              </button>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <Globe className="h-4 w-4" />
              <span className="uppercase">{language}</span>
            </button>

            {/* Auth Section */}
            {!isAuthenticated ? (
              <Button 
                onClick={() => setShowAuthModal(true)}
                size="sm"
                leftIcon={<User className="h-4 w-4" />}
              >
                <span className="hidden sm:inline">{t.login}</span>
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="hidden lg:inline text-sm font-semibold text-slate-700 max-w-[180px] truncate">
                  {language === "ne" ? "नमस्ते, " : "Hi, "}
                  {userProfile.fullName.split(" ")[0]}
                  <span className="text-slate-400 ml-1">
                    ({role === "dealer" ? t.kamDine : t.kamKhojne})
                  </span>
                </span>
                <button 
                  onClick={logout}
                  className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden rounded-lg p-2 hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-slate-700" />
              ) : (
                <Menu className="h-6 w-6 text-slate-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-slate-200 space-y-1">
            {displayNavItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveModule(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-base font-bold transition-colors ${
                  activeModule === item.id 
                    ? "bg-emerald-50 text-emerald-700" 
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {navLabels[item.id]}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
