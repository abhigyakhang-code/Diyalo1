import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { ref, onValue, set, remove } from "firebase/database";
import { clearAuthSession } from "../hooks/useAuthRestore";
import type { 
  UserRole, UserProfile, NavModule, Notification, Language, CVData, Job, Training 
} from "../types";
import { MOCK_JOBS, MOCK_TRAININGS } from "../data/mockData";
import { generateId } from "../i18n/translations";
import { db } from "../firebase";

interface AppContextType {
  // Auth State
  role: UserRole;
  setRole: (role: UserRole) => void;
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
  isAuthenticated: boolean;
  
  // Navigation
  activeModule: NavModule;
  setActiveModule: (module: NavModule) => void;
  
  // Language
  language: Language;
  toggleLanguage: () => void;
  
  // Notifications
  notifications: Notification[];
  addNotification: (message: string, type?: "success" | "info" | "warning") => void;
  removeNotification: (id: string) => void;
  
  // UI State
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  
  // CV Data (persist across app)
  cvData: CVData;
  updateCVData: (data: Partial<CVData>) => void;
  // Jobs & Trainings
  jobs: Job[];
  trainings: Training[];
  addJob: (job: Job) => void;
  addTraining: (training: Training) => void;
  removeJob: (id: string) => void;
  removeTraining: (id: string) => void;
  
  // Actions
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // Auth State
  const [role, setRole] = useState<UserRole>("anonymous");
  const [userProfile, setUserProfile] = useState<UserProfile>({
    fullName: "",
    phone: "",
    email: "",
    companyName: ""
  });
  
  // Navigation
  const [activeModule, setActiveModule] = useState<NavModule>("jobs");
  
  // Language
  const [language, setLanguage] = useState<Language>("en");
  
  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // UI State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // CV Data
  const [cvData, setCvData] = useState<CVData>({
    name: "",
    phone: "",
    email: "",
    location: "",
    skills: [],
    experience: "",
    primarySkill: "",
    skillLevel: undefined,
    category: "",
    gender: "",
    education: "",
    objective: ""
  });

  // Jobs & Trainings (employer posts)
  const [jobs, setJobs] = useState<Job[]>(MOCK_JOBS);
  const [trainings, setTrainings] = useState<Training[]>(MOCK_TRAININGS);

  useEffect(() => {
    const jobsRef = ref(db, "jobs");
    const trainingsRef = ref(db, "trainings");

    const unsubscribeJobs = onValue(jobsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setJobs(MOCK_JOBS);
        return;
      }
      const loadedJobs = Object.entries(data).map(([id, item]) => ({
        id,
        ...(item as Omit<Job, "id">)
      }));
      setJobs([...MOCK_JOBS, ...(loadedJobs as Job[])]);
    });

    const unsubscribeTrainings = onValue(trainingsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setTrainings(MOCK_TRAININGS);
        return;
      }
      const loadedTrainings = Object.entries(data).map(([id, item]) => ({
        id,
        ...(item as Omit<Training, "id">)
      }));
      setTrainings([...MOCK_TRAININGS, ...(loadedTrainings as Training[])]);
    });

    return () => {
      unsubscribeJobs();
      unsubscribeTrainings();
    };
  }, []);

  const isAuthenticated = role !== "anonymous";

  const addNotification = useCallback((message: string, type: "success" | "info" | "warning" = "success") => {
    const id = generateId();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(prev => prev === "en" ? "ne" : "en");
  }, []);

  const updateCVData = useCallback((data: Partial<CVData>) => {
    setCvData(prev => ({ ...prev, ...data }));
  }, []);

  const logout = useCallback(() => {
    // Clear persisted session, reset app state and show login modal
    clearAuthSession();
    setRole("anonymous");
    setUserProfile({ fullName: "", phone: "", email: "", companyName: "" });
    setActiveModule("jobs");
    addNotification("Logged out successfully", "info");
    setShowAuthModal(true);
  }, [addNotification, setShowAuthModal]);

  const addJob = useCallback((job: Job) => {
    setJobs((prev) => [job, ...prev]);
    set(ref(db, `jobs/${job.id}`), job).catch(() => {
      addNotification("Unable to save job to Firebase", "warning");
    });
    addNotification("Job created", "success");
    setActiveModule("jobs");
  }, [addNotification, setActiveModule]);

  const addTraining = useCallback((training: Training) => {
    setTrainings((prev) => [training, ...prev]);
    set(ref(db, `trainings/${training.id}`), training).catch(() => {
      addNotification("Unable to save training to Firebase", "warning");
    });
    addNotification("Training created", "success");
    setActiveModule("training");
  }, [addNotification, setActiveModule]);

  const removeTraining = useCallback((id: string) => {
    setTrainings((prev) => prev.filter(t => t.id !== id));
    remove(ref(db, `trainings/${id}`)).catch(() => {
      addNotification("Unable to remove training from Firebase", "warning");
    });
  }, [addNotification]);

  const removeJob = useCallback((id: string) => {
    setJobs((prev) => prev.filter(j => j.id !== id));
    remove(ref(db, `jobs/${id}`)).catch(() => {
      addNotification("Unable to remove job from Firebase", "warning");
    });
  }, [addNotification]);

  const value: AppContextType = {
    role,
    setRole,
    userProfile,
    setUserProfile,
    isAuthenticated,
    activeModule,
    setActiveModule,
    language,
    toggleLanguage,
    notifications,
    addNotification,
    removeNotification,
    showAuthModal,
    setShowAuthModal,
    mobileMenuOpen,
    setMobileMenuOpen,
    cvData,
    updateCVData,
    jobs,
    trainings,
    addJob,
    addTraining,
    removeJob,
    removeTraining,
    logout
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
