import { AppProvider, useApp } from "./context/AppContext";
import { useAuthRestore } from "./hooks/useAuthRestore";
import { Navbar } from "./components/Navbar";
import { Notifications } from "./components/Notifications";
import { AuthModal } from "./components/AuthModal";
import { Footer } from "./components/Footer";
import { useEffect } from "react";
import { JobsPage } from "./pages/JobsPage";
import { TrainingPage } from "./pages/TrainingPage";
import { CareerAIPage } from "./pages/CareerAIPage";
import { CVBuilderPage } from "./pages/CVBuilderPage";
import { InterviewPage } from "./pages/InterviewPage";
import { EmployerPage } from "./pages/EmployerPage";
import type { NavModule } from "./types";

function AppContent() {
  const { activeModule, role } = useApp();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeModule]);

  const pages: Record<NavModule, React.ReactNode> = {
    jobs: <JobsPage />,
    training: <TrainingPage />,
    "career-ai": <CareerAIPage />,
    "cv-builder": <CVBuilderPage />,
    interview: <InterviewPage />,
    employer: <EmployerPage />
  };

  if (role === "dealer") {
    const allowed: NavModule[] = ["jobs", "training", "employer"];
    if (!allowed.includes(activeModule)) {
      return <JobsPage />;
    }
  }

  return pages[activeModule] || <JobsPage />;
}

// Mount auth restore inside the provider so session is restored on app load
function AuthRestoreMount() {
  useAuthRestore();
  return null;
}

function App() {
  return (
    <AppProvider>
      <AuthRestoreMount />
      <div className="min-h-screen bg-slate-50 flex flex-col">
        {/* Global Notifications */}
        <Notifications />
        
        {/* Navigation */}
        <Navbar />
        
        {/* Auth Modal */}
        <AuthModal />
        
        {/* Main Content */}
        <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6">
          <AppContent />
        </main>
        
        {/* Footer */}
        <Footer />
      </div>
      
      {/* Global Animations */}
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes ping {
          0% { transform: scale(1); opacity: 1; }
          75%, 100% { transform: scale(1.8); opacity: 0; }
        }
      `}</style>
    </AppProvider>
  );
}

export default App;
