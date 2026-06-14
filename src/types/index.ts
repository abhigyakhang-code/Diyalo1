// User & Authentication Types
export type UserRole = "anonymous" | "user" | "dealer";

export interface UserProfile {
  fullName: string;
  phone: string;
  email: string;
  companyName: string;
}

// Navigation Types
export type NavModule = 
  | "jobs" 
  | "training" 
  | "career-ai" 
  | "cv-builder" 
  | "interview" 
  | "employer";

// Job Types
export type PaymentFrequency = "roj" | "hapta" | "mahina" | "all";

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  wageDaily: number;
  wageWeekly: number;
  wageMonthly: number;
  paymentFreq: Exclude<PaymentFrequency, "all">;
  description: string;
  phone: string;
  imageUrl: string;
  owner?: string;
}

// Training Types
export type TrainingCategory = "all" | "plumbing" | "electrician" | "driving" | "tailoring";

export type TrainingAuthority = 
  | "CTEVT Verified" 
  | "Ward Office Authorized" 
  | "Department of Labor Approved";

export interface Training {
  id: string;
  title: string;
  category: Exclude<TrainingCategory, "all">;
  provider: string;
  duration: string;
  authority: TrainingAuthority;
  location: string;
  seats: number;
  description: string;
  owner?: string;
}

// AI Career Chat Types
export interface ChatMessage {
  id: string;
  sender: "ai" | "user";
  text: string;
  options?: ChatOption[];
}

export interface ChatOption {
  value: string;
  label: string;
}

export interface RoadmapStep {
  step: number;
  title: string;
  duration: string;
  detail: string;
  icon: string;
}

// Interview Types
export type InterviewTrack = "security" | "cashier" | "driver" | "cleaner";

export interface InterviewQuestion {
  q: string;
  hint: string;
}

// CV Builder Types
export interface CVData {
  name: string;
  phone: string;
  email: string;
  location: string;
  skills: string[];
  experience: string;
  primarySkill: string;
  skillLevel?: "skilled" | "unskilled";
  category?: string;
  gender?: string;
  education?: string;
  objective?: string;
}

// Employer Types
export interface Graduate {
  id: string;
  name: string;
  skill: string;
  course: string;
  certificateId: string;
  phone: string;
  location: string;
  verifiedAt: string;
}

// Notification Type
export interface Notification {
  id: string;
  message: string;
  type: "success" | "info" | "warning";
}

// Translation Types
export type Language = "en" | "ne";

export interface TranslationKeys {
  // Common
  appName: string;
  login: string;
  signup: string;
  logout: string;
  submit: string;
  cancel: string;
  confirm: string;
  search: string;
  filter: string;
  apply: string;
  download: string;
  send: string;
  next: string;
  previous: string;
  loading: string;
  error: string;
  success: string;
  
  // Auth
  fullName: string;
  phoneNumber: string;
  emailAddress: string;
  companyName: string;
  userSignup: string;
  dealerSignup: string;
  kamKhojne: string;
  kamDine: string;
  
  // Navigation
  jobs: string;
  training: string;
  aiGuide: string;
  cvMaker: string;
  interview: string;
  employer: string;
  hire: string;
  
  // Jobs
  findJobs: string;
  daily: string;
  weekly: string;
  monthly: string;
  all: string;
  call: string;
  listen: string;
  smsAlerts: string;
  wages: string;
  location: string;
  
  // Training
  freeTraining: string;
  plumbing: string;
  electrician: string;
  driving: string;
  tailoring: string;
  seatsAvailable: string;
  duration: string;
  provider: string;
  
  // AI Career
  careerGuide: string;
  careerRoadmap: string;
  estimatedYield: string;
  step: string;
  
  // CV Builder
  buildResume: string;
  yourSkills: string;
  experience: string;
  primarySkill: string;
  aiSuggestions: string;
  livePreview: string;
  skillLevel: string;
  category: string;
  objective: string;
  pdfReady: string;
  answerQuestion: string;
  unskilled: string;
  skilled: string;
  categoryPlaceholder: string;
  objectivePlaceholder: string;
  questionStep: string;
  questionHint: string;
  answered: string;
  startFromScratch: string;
  
  // Interview
  interviewCoach: string;
  question: string;
  hint: string;
  recordAnswer: string;
  stopRecording: string;
  strengths: string;
  improve: string;
  
  // Employer
  commandCenter: string;
  certifiedGraduates: string;
  initiateContract: string;
  verified: string;
  
  // Footer
  partner: string;
  freeForAll: string;
}
