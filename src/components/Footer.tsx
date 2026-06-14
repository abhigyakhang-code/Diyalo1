import { useApp } from "../context/AppContext";
import { translations } from "../i18n/translations";

export function Footer() {
  const { language } = useApp();
  const t = translations[language];

  return (
    <footer className="border-t border-slate-200 bg-white mt-12">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold">
              {language === "ne" ? "दी" : "D"}
            </div>
            <div>
              <span className="font-bold text-slate-900">{t.appName}</span>
              <p className="text-xs text-slate-500">
                {language === "ne" 
                  ? "नेपालको अदक्ष जागिर नेटवर्क" 
                  : "Nepal's Unskilled Job Network"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span>{t.partner}</span>
            <span>·</span>
            <span>{language === "ne" ? "श्रम विभाग दर्ता" : "Department of Labor Registered"}</span>
            <span>·</span>
            <span>{t.freeForAll}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
