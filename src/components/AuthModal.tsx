import { useState, useEffect, type FormEvent } from "react";
import { useApp } from "../context/AppContext";
import { translations } from "../i18n/translations";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { X, User, Building2, ShieldCheck, ArrowRight, KeyRound, LogIn, UserPlus } from "lucide-react";
import type { UserRole, UserProfile } from "../types";
import { saveAuthSession } from "../hooks/useAuthRestore";

const FIREBASE_URL = "https://khnag-1c2c9-default-rtdb.firebaseio.com";

// "view" controls which top-level screen is shown
type AuthView = "login" | "register" | "forgot";
// "step" controls the sub-step within register/forgot (otp verification etc.)
type AuthStep = "form" | "otp" | "reset";

function emailKey(email: string) {
  // Firebase keys can't contain '.', '#', '$', '[', ']', '/'
  return email.trim().toLowerCase().replace(/[.#$\[\]\/]/g, "_");
}

async function sendOtpEmail(email: string, otp: string) {
  const response = await fetch("http://localhost:5000/api/send-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to_email: email, otp })
  });
  if (!response.ok) throw new Error("Failed to send OTP");
}

export function AuthModal() {
  const { showAuthModal, setShowAuthModal, setRole, setUserProfile, addNotification, language } = useApp();
  const t = translations[language];

  const [view, setView] = useState<AuthView>("login");
  const [step, setStep] = useState<AuthStep>("form");
  const [authTab, setAuthTab] = useState<UserRole>("user");

  const [generatedOtp, setGeneratedOtp] = useState("");
  const [userEnteredOtp, setUserEnteredOtp] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    companyName: "",
    password: "",
    confirmPassword: "",
    newPassword: "",
    confirmNewPassword: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isNe = language === "ne";
  const msg = {
    fullNameReq: isNe ? "पूरा नाम आवश्यक छ" : "Full name is required",
    phoneReq: isNe ? "१० अंकको वैध फोन आवश्यक छ" : "Valid 10-digit phone required",
    emailReq: isNe ? "वैध इमेल आवश्यक छ" : "Valid email required",
    companyReq: isNe ? "कम्पनीको नाम आवश्यक छ" : "Company name is required",
    passwordReq: isNe ? "कम्तिमा ६ अक्षरको पासवर्ड आवश्यक छ" : "Password must be at least 6 characters",
    passwordMismatch: isNe ? "पासवर्ड मिलेन" : "Passwords do not match",
    emailExists: isNe ? "यो इमेल पहिले नै दर्ता भएको छ। कृपया लग इन गर्नुहोस्।" : "This email is already registered. Please log in instead.",
    emailNotFound: isNe ? "यो इमेलसँग कुनै खाता फेला परेन" : "No account found with this email",
    invalidCreds: isNe ? "इमेल वा पासवर्ड मिलेन" : "Invalid email or password",
    invalidOtp: isNe ? "गलत OTP कोड!" : "Invalid OTP code!",
    otpSent: isNe ? "OTP इमेलमा पठाइयो!" : "OTP sent to your email!",
    serverError: isNe ? "सर्भरमा समस्या भयो।" : "Server error.",
    regSuccess: isNe ? "सफल दर्ता!" : "Registration successful!",
    loginSuccess: isNe ? "सफलतापूर्वक लग इन भयो!" : "Logged in successfully!",
    resetSuccess: isNe ? "पासवर्ड सफलतापूर्वक परिवर्तन भयो! कृपया लग इन गर्नुहोस्।" : "Password reset successfully! Please log in.",
  };

  const resetState = (nextView: AuthView) => {
    setView(nextView);
    setStep("form");
    setErrors({});
    setUserEnteredOtp("");
    setGeneratedOtp("");
    setForm({
      fullName: "", phone: "", email: "", companyName: "",
      password: "", confirmPassword: "", newPassword: "", confirmNewPassword: ""
    });
  };

  useEffect(() => {
    if (showAuthModal) {
      resetState("login");
    }
  }, [showAuthModal]);

  if (!showAuthModal) return null;

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [field]: e.target.value }));

  // ---------- LOGIN ----------
  const validateLogin = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = msg.emailReq;
    if (!form.password) newErrors.password = msg.passwordReq;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateLogin()) return;
    setIsSubmitting(true);
    try {
      const key = emailKey(form.email);
      const res = await fetch(`${FIREBASE_URL}/users/${key}.json`);
      const data = await res.json();

      if (!data) {
        setErrors({ email: msg.emailNotFound });
        return;
      }
      if (data.password !== form.password) {
        setErrors({ password: msg.invalidCreds });
        return;
      }

      const profile: UserProfile = {
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        companyName: data.companyName || ""
      };
      saveAuthSession(data.role as UserRole, profile);

      setRole(data.role as UserRole);
      setUserProfile(profile);
      setShowAuthModal(false);
      addNotification(msg.loginSuccess, "success");
    } catch (err) {
      addNotification(msg.serverError, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------- REGISTER ----------
  const validateRegister = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.fullName.trim()) newErrors.fullName = msg.fullNameReq;
    if (!form.phone.trim() || form.phone.replace(/\D/g, "").length < 10) newErrors.phone = msg.phoneReq;
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = msg.emailReq;
    if (authTab === "dealer" && !form.companyName.trim()) newErrors.companyName = msg.companyReq;
    if (!form.password || form.password.length < 6) newErrors.password = msg.passwordReq;
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = msg.passwordMismatch;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendRegisterOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateRegister()) return;
    setIsSubmitting(true);

    try {
      const key = emailKey(form.email);

      // Check email not already registered (1 email = 1 account)
      const existingRes = await fetch(`${FIREBASE_URL}/users/${key}.json`);
      const existing = await existingRes.json();
      if (existing) {
        setErrors({ email: msg.emailExists });
        setIsSubmitting(false);
        return;
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(otp);

      await sendOtpEmail(form.email, otp);

      setStep("otp");
      addNotification(msg.otpSent, "success");
    } catch (err) {
      addNotification(msg.serverError, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyRegisterOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (userEnteredOtp !== generatedOtp) {
      setErrors({ otp: msg.invalidOtp });
      return;
    }
    setIsSubmitting(true);
    try {
      const key = emailKey(form.email);

      // Double-check no account was created in the meantime (1 email = 1 account)
      const existingRes = await fetch(`${FIREBASE_URL}/users/${key}.json`);
      const existing = await existingRes.json();
      if (existing) {
        setErrors({ otp: msg.emailExists });
        setStep("form");
        setIsSubmitting(false);
        return;
      }

      const userData = {
        fullName: form.fullName,
        phone: form.phone,
        email: form.email,
        password: form.password,
        role: authTab,
        companyName: authTab === "dealer" ? form.companyName : "",
        createdAt: new Date().toISOString()
      };

      const putRes = await fetch(`${FIREBASE_URL}/users/${key}.json`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
      });
      if (!putRes.ok) throw new Error("Failed to save user");

      addNotification(
  isNe
    ? "दर्ता सफल भयो! कृपया लग इन गर्नुहोस्।"
    : "Registration successful! Please log in.",
  "success"
);

resetState("login");
    } catch (err) {
      addNotification(msg.serverError, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------- FORGOT PASSWORD ----------
  const validateForgotEmail = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = msg.emailReq;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendForgotOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForgotEmail()) return;
    setIsSubmitting(true);
    try {
      const key = emailKey(form.email);
      const res = await fetch(`${FIREBASE_URL}/users/${key}.json`);
      const data = await res.json();
      if (!data) {
        setErrors({ email: msg.emailNotFound });
        setIsSubmitting(false);
        return;
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(otp);
      await sendOtpEmail(form.email, otp);

      setStep("otp");
      addNotification(msg.otpSent, "success");
    } catch (err) {
      addNotification(msg.serverError, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyForgotOtp = (e: FormEvent) => {
    e.preventDefault();
    if (userEnteredOtp !== generatedOtp) {
      setErrors({ otp: msg.invalidOtp });
      return;
    }
    setErrors({});
    setStep("reset");
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!form.newPassword || form.newPassword.length < 6) newErrors.newPassword = msg.passwordReq;
    if (form.newPassword !== form.confirmNewPassword) newErrors.confirmNewPassword = msg.passwordMismatch;
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const key = emailKey(form.email);
      const patchRes = await fetch(`${FIREBASE_URL}/users/${key}.json`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: form.newPassword })
      });
      if (!patchRes.ok) throw new Error("Failed to reset password");

      addNotification(msg.resetSuccess, "success");
      resetState("login");
    } catch (err) {
      addNotification(msg.serverError, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------- UI HELPERS ----------
  const headerTitle = () => {
    if (view === "login") return isNe ? "लग इन गर्नुहोस्" : "Log In";
    if (view === "forgot") {
      if (step === "form") return isNe ? "पासवर्ड बिर्सनुभयो?" : "Forgot Password";
      if (step === "otp") return isNe ? "प्रमाणीकरण" : "Verification";
      return isNe ? "नयाँ पासवर्ड सेट गर्नुहोस्" : "Set New Password";
    }
    // register
    if (step === "otp") return isNe ? "प्रमाणीकरण" : "Verification";
    return isNe ? "खाता सिर्जना गर्नुहोस्" : "Create Account";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setShowAuthModal(false)}>
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-emerald-600 px-6 py-5 text-white flex justify-between items-center">
          <h2 className="text-xl font-bold">{headerTitle()}</h2>
          <button onClick={() => setShowAuthModal(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors"><X className="h-5 w-5" /></button>
        </div>

        {/* ================= LOGIN ================= */}
        {view === "login" && (
          <form onSubmit={handleLogin} className="p-6 space-y-4">
            <Input label={t.emailAddress} type="email" value={form.email} onChange={update("email")} error={errors.email} />
            <Input label={isNe ? "पासवर्ड" : "Password"} type="password" value={form.password} onChange={update("password")} error={errors.password} />
            <div className="text-right">
              <button type="button" onClick={() => resetState("forgot")} className="text-sm font-semibold text-emerald-600 hover:underline">
                {isNe ? "पासवर्ड बिर्सनुभयो?" : "Forgot password?"}
              </button>
            </div>
            <Button type="submit" fullWidth size="lg" isLoading={isSubmitting} rightIcon={<LogIn className="h-4 w-4" />}>
              {isNe ? "लग इन गर्नुहोस्" : "Log In"}
            </Button>
            <p className="text-center text-sm text-slate-500">
              {isNe ? "खाता छैन?" : "Don't have an account?"}{" "}
              <button type="button" onClick={() => resetState("register")} className="font-semibold text-emerald-600 hover:underline">
                {isNe ? "दर्ता गर्नुहोस्" : "Register"}
              </button>
            </p>
          </form>
        )}

        {/* ================= REGISTER ================= */}
        {view === "register" && step === "form" && (
          <>
            <div className="flex border-b border-slate-100 bg-slate-50">
              <button onClick={() => setAuthTab("user")} className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${authTab === "user" ? "text-emerald-700 border-b-2 border-emerald-600 bg-white" : "text-slate-500"}`}>
                <User className="h-4 w-4" /> {t.userSignup}
              </button>
              <button onClick={() => setAuthTab("dealer")} className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${authTab === "dealer" ? "text-emerald-700 border-b-2 border-emerald-600 bg-white" : "text-slate-500"}`}>
                <Building2 className="h-4 w-4" /> {t.dealerSignup}
              </button>
            </div>
            <form onSubmit={handleSendRegisterOtp} className="p-6 space-y-4">
              <Input label={t.fullName} value={form.fullName} onChange={update("fullName")} error={errors.fullName} />
              <Input label={t.phoneNumber} value={form.phone} onChange={update("phone")} error={errors.phone} />
              <Input label={t.emailAddress} type="email" value={form.email} onChange={update("email")} error={errors.email} />
              {authTab === "dealer" && (
                <Input label={t.companyName} value={form.companyName} onChange={update("companyName")} error={errors.companyName} />
              )}
              <Input label={isNe ? "पासवर्ड" : "Password"} type="password" value={form.password} onChange={update("password")} error={errors.password} />
              <Input label={isNe ? "पासवर्ड पुष्टि गर्नुहोस्" : "Confirm Password"} type="password" value={form.confirmPassword} onChange={update("confirmPassword")} error={errors.confirmPassword} />
              <Button type="submit" fullWidth size="lg" isLoading={isSubmitting} rightIcon={<ArrowRight className="h-4 w-4" />}>
                {isNe ? "OTP पठाउनुहोस्" : "Send OTP"}
              </Button>
              <p className="text-center text-sm text-slate-500">
                {isNe ? "खाता छ?" : "Already have an account?"}{" "}
                <button type="button" onClick={() => resetState("login")} className="font-semibold text-emerald-600 hover:underline">
                  {isNe ? "लग इन" : "Log In"}
                </button>
              </p>
            </form>
          </>
        )}

        {view === "register" && step === "otp" && (
          <form onSubmit={handleVerifyRegisterOtp} className="p-6 space-y-6">
            <div className="text-center space-y-2">
              <div className="bg-emerald-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-emerald-600"><ShieldCheck className="h-8 w-8" /></div>
              <p className="text-sm text-slate-500">
                {isNe ? "तपाईंको इमेलमा पठाइएको ६ अंकको कोड प्रविष्ट गर्नुहोस्" : "Enter the 6-digit code sent to your email"}
              </p>
            </div>
            <Input label={isNe ? "OTP कोड" : "OTP Code"} value={userEnteredOtp} onChange={e => setUserEnteredOtp(e.target.value)} error={errors.otp} className="text-center text-2xl tracking-widest" />
            <Button type="submit" fullWidth size="lg" isLoading={isSubmitting} className="bg-emerald-600">
              {isNe ? "प्रमाणित गर्नुहोस्" : "Verify"}
            </Button>
            <button type="button" onClick={() => setStep("form")} className="w-full text-center text-sm text-slate-500 hover:underline">
              {isNe ? "← फिर्ता जानुहोस्" : "← Go back"}
            </button>
          </form>
        )}

        {/* ================= FORGOT PASSWORD ================= */}
        {view === "forgot" && step === "form" && (
          <form onSubmit={handleSendForgotOtp} className="p-6 space-y-6">
            <div className="text-center space-y-2">
              <div className="bg-emerald-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-emerald-600"><KeyRound className="h-8 w-8" /></div>
              <p className="text-sm text-slate-500">
                {isNe ? "आफ्नो इमेल प्रविष्ट गर्नुहोस्, हामी तपाईंलाई OTP पठाउनेछौं" : "Enter your email and we'll send you an OTP"}
              </p>
            </div>
            <Input label={t.emailAddress} type="email" value={form.email} onChange={update("email")} error={errors.email} />
            <Button type="submit" fullWidth size="lg" isLoading={isSubmitting} rightIcon={<ArrowRight className="h-4 w-4" />}>
              {isNe ? "OTP पठाउनुहोस्" : "Send OTP"}
            </Button>
            <button type="button" onClick={() => resetState("login")} className="w-full text-center text-sm text-slate-500 hover:underline">
              {isNe ? "← लग इनमा फिर्ता" : "← Back to Log In"}
            </button>
          </form>
        )}

        {view === "forgot" && step === "otp" && (
          <form onSubmit={handleVerifyForgotOtp} className="p-6 space-y-6">
            <div className="text-center space-y-2">
              <div className="bg-emerald-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-emerald-600"><ShieldCheck className="h-8 w-8" /></div>
              <p className="text-sm text-slate-500">
                {isNe ? "तपाईंको इमेलमा पठाइएको ६ अंकको कोड प्रविष्ट गर्नुहोस्" : "Enter the 6-digit code sent to your email"}
              </p>
            </div>
            <Input label={isNe ? "OTP कोड" : "OTP Code"} value={userEnteredOtp} onChange={e => setUserEnteredOtp(e.target.value)} error={errors.otp} className="text-center text-2xl tracking-widest" />
            <Button type="submit" fullWidth size="lg" className="bg-emerald-600">
              {isNe ? "प्रमाणित गर्नुहोस्" : "Verify"}
            </Button>
          </form>
        )}

        {view === "forgot" && step === "reset" && (
          <form onSubmit={handleResetPassword} className="p-6 space-y-4">
            <div className="text-center space-y-2 mb-2">
              <div className="bg-emerald-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-emerald-600"><KeyRound className="h-8 w-8" /></div>
              <p className="text-sm text-slate-500">
                {isNe ? "आफ्नो नयाँ पासवर्ड सेट गर्नुहोस्" : "Set your new password"}
              </p>
            </div>
            <Input label={isNe ? "नयाँ पासवर्ड" : "New Password"} type="password" value={form.newPassword} onChange={update("newPassword")} error={errors.newPassword} />
            <Input label={isNe ? "नयाँ पासवर्ड पुष्टि गर्नुहोस्" : "Confirm New Password"} type="password" value={form.confirmNewPassword} onChange={update("confirmNewPassword")} error={errors.confirmNewPassword} />
            <Button type="submit" fullWidth size="lg" isLoading={isSubmitting} className="bg-emerald-600">
              {isNe ? "पासवर्ड परिवर्तन गर्नुहोस्" : "Reset Password"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}