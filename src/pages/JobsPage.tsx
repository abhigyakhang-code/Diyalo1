import { useState, useCallback, useEffect, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { translations, formatNPR } from "../i18n/translations";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import {
  MapPin, Volume2, DollarSign, Clock, Star, Send,
  Search, SlidersHorizontal, X, ChevronDown, Briefcase,
} from "lucide-react";
import type { PaymentFrequency, Job } from "../types";

// ─── Types ───────────────────────────────────────────────────────────────────

type SortOption = "default" | "wage-asc" | "wage-desc" | "title-az";

// ─── Apply Modal ──────────────────────────────────────────────────────────────

interface ApplyModalProps {
  job: Job;
  language: "en" | "ne";
  onClose: () => void;
  onSubmit: (name: string, phone: string, message: string) => void;
}

function ApplyModal({ job, language, onClose, onSubmit }: ApplyModalProps) {
  const [name, setName]       = useState("");
  const [phone, setPhone]     = useState("");
  const [message, setMessage] = useState("");
  const isNe = language === "ne";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    onSubmit(name.trim(), phone.trim(), message.trim());
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        {/* Modal header */}
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {isNe ? "आवेदन दिनुहोस्" : "Apply for this job"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {job.title} &mdash; {job.company}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full name */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {isNe ? "पूरा नाम" : "Full name"} *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isNe ? "तपाईंको नाम" : "Your name"}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {isNe ? "फोन नम्बर" : "Phone number"} *
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={isNe ? "९८XXXXXXXX" : "98XXXXXXXX"}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {/* Optional message */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {isNe ? "थप सन्देश (वैकल्पिक)" : "Message (optional)"}
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                isNe
                  ? "आफूबारे छोटो जानकारी..."
                  : "Briefly describe your experience..."
              }
              className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {/* Wage reminder */}
          <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <span className="font-medium">
              {isNe ? "मासिक तलब:" : "Monthly wage:"}
            </span>{" "}
            {formatNPR(job.wageMonthly, language)}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              {isNe ? "रद्द गर्नुहोस्" : "Cancel"}
            </button>
            <button
              type="submit"
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
            >
              <Send className="h-4 w-4" />
              {isNe ? "पठाउनुहोस्" : "Submit application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── JobsPage ─────────────────────────────────────────────────────────────────

export function JobsPage() {
  const { language, addNotification, jobs } = useApp();
  const t = translations[language];
  const isNe = language === "ne";

  // ── State ──────────────────────────────────────────────────────────────────
  const [paymentFilter, setPaymentFilter] = useState<PaymentFrequency>("all");
  const [searchQuery, setSearchQuery]     = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [sortBy, setSortBy]               = useState<SortOption>("default");
  const [showFilters, setShowFilters]     = useState(false);
  const [speakingJobId, setSpeakingJobId] = useState<string | null>(null);
  const [applyJob, setApplyJob]           = useState<Job | null>(null);

  // Stop speech on unmount
  useEffect(() => {
    return () => { window.speechSynthesis?.cancel(); };
  }, []);

  // ── Derived filter data ────────────────────────────────────────────────────

  // Unique locations from all jobs
  const locationOptions = useMemo(() => {
    const locs = Array.from(new Set(jobs.map((j) => j.location))).sort();
    return locs;
  }, [jobs]);

  // Active filter count (excluding default sort)
  const activeFilterCount = [
    paymentFilter !== "all",
    locationFilter !== "all",
    searchQuery.trim() !== "",
    sortBy !== "default",
  ].filter(Boolean).length;

  // Filtered + sorted jobs
  const displayedJobs = useMemo(() => {
    let filtered = jobs.filter((j) => {
      const matchesPayment  = paymentFilter === "all" || j.paymentFreq === paymentFilter;
      const matchesLocation = locationFilter === "all" || j.location === locationFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch   = !q || [j.title, j.company, j.location, j.description]
        .some((field) => field.toLowerCase().includes(q));
      return matchesPayment && matchesLocation && matchesSearch;
    });

    switch (sortBy) {
      case "wage-asc":  filtered = [...filtered].sort((a, b) => a.wageMonthly - b.wageMonthly); break;
      case "wage-desc": filtered = [...filtered].sort((a, b) => b.wageMonthly - a.wageMonthly); break;
      case "title-az":  filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title)); break;
    }
    return filtered;
  }, [jobs, paymentFilter, locationFilter, searchQuery, sortBy]);

  const clearAllFilters = useCallback(() => {
    setPaymentFilter("all");
    setLocationFilter("all");
    setSearchQuery("");
    setSortBy("default");
  }, []);

  // ── Apply ──────────────────────────────────────────────────────────────────
  const handleApplySubmit = useCallback(
    (name: string, phone: string, message: string) => {
      console.log("Application submitted:", { job: applyJob?.id, name, phone, message });
      addNotification(
        isNe
          ? `${applyJob?.title} मा आवेदन पठाइयो!`
          : `Application sent for ${applyJob?.title}!`,
        "success"
      );
      setApplyJob(null);
    },
    [applyJob, addNotification, isNe]
  );

  // ── Text-to-speech ─────────────────────────────────────────────────────────
  const handleSpeak = useCallback(
    (job: Job) => {
      if (!window.speechSynthesis) return;
      if (speakingJobId === job.id) {
        window.speechSynthesis.cancel();
        setSpeakingJobId(null);
        return;
      }
      window.speechSynthesis.cancel();
      setSpeakingJobId(job.id);

      const text = isNe
        ? `${job.title}। कम्पनी: ${job.company}। स्थान: ${job.location}। दैनिक तलब: ${job.wageDaily} रुपैयाँ। मासिक: ${job.wageMonthly}। विवरण: ${job.description}`
        : `${job.title}. Company: ${job.company}. Location: ${job.location}. Daily wage: ${job.wageDaily} rupees. Monthly: ${job.wageMonthly}. ${job.description}`;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang    = isNe ? "ne-NP" : "en-US";
      utterance.rate    = 0.9;
      utterance.onend   = () => setSpeakingJobId(null);
      utterance.onerror = () => setSpeakingJobId(null);
      window.speechSynthesis.speak(utterance);
    },
    [speakingJobId, isNe]
  );

  // ── Filter / sort option lists ─────────────────────────────────────────────
  const paymentOptions: { value: PaymentFrequency; label: string }[] = [
    { value: "all",    label: t.all    },
    { value: "roj",    label: t.daily  },
    { value: "hapta",  label: t.weekly },
    { value: "mahina", label: t.monthly },
  ];

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "default",   label: isNe ? "पूर्वनिर्धारित"     : "Default"              },
    { value: "wage-desc", label: isNe ? "तलब: उच्चदेखि"     : "Wage: high to low"    },
    { value: "wage-asc",  label: isNe ? "तलब: न्युनदेखि"     : "Wage: low to high"    },
    { value: "title-az",  label: isNe ? "शीर्षक: A–Z"        : "Title: A–Z"           },
  ];

  return (
    <>
      {/* Apply modal */}
      {applyJob && (
        <ApplyModal
          job={applyJob}
          language={language}
          onClose={() => setApplyJob(null)}
          onSubmit={handleApplySubmit}
        />
      )}

      <div className="space-y-5">

        {/* ── Page header ── */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{t.findJobs}</h1>
          <p className="mt-1 text-slate-500">
            {isNe
              ? "आफूलाई मिल्ने जागिर खोज्नुहोस् र सिधै आवेदन दिनुहोस्"
              : "Search, filter and apply for jobs that match your skills"}
          </p>
        </div>

        {/* ── Search bar ── */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isNe ? "जागिर, कम्पनी वा स्थान खोज्नुहोस्..." : "Search job title, company or location..."}
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* ── Toolbar: payment tabs + filter toggle ── */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Payment frequency tabs */}
          <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
            {paymentOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setPaymentFilter(opt.value)}
                className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                  paymentFilter === opt.value
                    ? "bg-white text-emerald-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Filter toggle button */}
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`ml-auto flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-all ${
              showFilters
                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {isNe ? "फिल्टर" : "Filters"}
            {activeFilterCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-xs text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* ── Expanded filter panel ── */}
        {showFilters && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-wrap gap-4">
              {/* Location filter */}
              <div className="flex-1 min-w-[180px]">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {isNe ? "स्थान" : "Location"}
                </label>
                <div className="relative">
                  <select
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 pr-8 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  >
                    <option value="all">{isNe ? "सबै स्थान" : "All locations"}</option>
                    {locationOptions.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              {/* Sort */}
              <div className="flex-1 min-w-[180px]">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {isNe ? "क्रमबद्ध गर्नुहोस्" : "Sort by"}
                </label>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 pr-8 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  >
                    {sortOptions.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              {/* Clear button */}
              {activeFilterCount > 0 && (
                <div className="flex items-end">
                  <button
                    onClick={clearAllFilters}
                    className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition"
                  >
                    <X className="h-4 w-4" />
                    {isNe ? "सबै हटाउनुहोस्" : "Clear all"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Results count ── */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {isNe
              ? `${displayedJobs.length} जागिर भेटियो`
              : `${displayedJobs.length} job${displayedJobs.length !== 1 ? "s" : ""} found`}
          </p>
          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-xs font-medium text-emerald-600 hover:text-emerald-800 hover:underline"
            >
              {isNe ? "फिल्टर हटाउनुहोस्" : "Clear filters"}
            </button>
          )}
        </div>

        {/* ── Job grid ── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {displayedJobs.map((job) => {
            const isSpeaking = speakingJobId === job.id;

            return (
              <Card
                key={job.id}
                hover
                className={`relative overflow-hidden transition-all ${
                  isSpeaking ? "ring-2 ring-emerald-500 ring-offset-2" : ""
                }`}
              >
                {/* Image */}
                <div className="relative -mx-5 -mt-5 mb-4 h-44 overflow-hidden">
                  <img
                    src={job.imageUrl}
                    alt={job.title}
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

                  {/* Payment frequency badge */}
                  <div className="absolute left-3 top-3">
                    <Badge
                      variant={
                        job.paymentFreq === "roj" ? "warning"
                        : job.paymentFreq === "hapta" ? "info"
                        : "success"
                      }
                    >
                      {job.paymentFreq === "roj" ? t.daily
                        : job.paymentFreq === "hapta" ? t.weekly
                        : t.monthly}
                    </Badge>
                  </div>

                  {/* Speaking indicator */}
                  {isSpeaking && (
                    <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/75 px-4 py-1.5 text-xs font-semibold text-white">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                      {isNe ? "बोलिरहेको..." : "Speaking..."}
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="space-y-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{job.title}</h3>
                    <p className="text-sm text-slate-500">{job.company}</p>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin className="h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{job.location}</span>
                  </div>

                  {/* Wage chips */}
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      <DollarSign className="h-3.5 w-3.5" />
                      {t.daily}: {formatNPR(job.wageDaily, language)}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                      <Clock className="h-3.5 w-3.5" />
                      {t.weekly}: {formatNPR(job.wageWeekly, language)}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-lg bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700">
                      <Star className="h-3.5 w-3.5" />
                      {t.monthly}: {formatNPR(job.wageMonthly, language)}
                    </span>
                  </div>

                  <p className="text-sm leading-relaxed text-slate-600">{job.description}</p>

                  {/* Action buttons */}
                  <div className="flex gap-2 pt-1">
                    <Button
                      onClick={() => setApplyJob(job)}
                      leftIcon={<Send className="h-4 w-4" />}
                      className="flex-1"
                    >
                      {isNe ? "आवेदन दिनुहोस्" : "Apply"}
                    </Button>
                    <Button
                      variant={isSpeaking ? "danger" : "outline"}
                      onClick={() => handleSpeak(job)}
                      leftIcon={<Volume2 className="h-4 w-4" />}
                      className="flex-1"
                    >
                      {isSpeaking
                        ? (isNe ? "रोक्नुहोस्" : "Stop")
                        : t.listen}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* ── Empty state ── */}
        {displayedJobs.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <div className="rounded-full bg-slate-100 p-4">
              <Briefcase className="h-8 w-8 text-slate-400" />
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-700">
                {isNe ? "कुनै जागिर भेटिएन" : "No jobs found"}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                {isNe
                  ? "अर्को खोज वा फिल्टर प्रयास गर्नुहोस्"
                  : "Try a different search term or adjust your filters"}
              </p>
            </div>
            <button
              onClick={clearAllFilters}
              className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition"
            >
              {isNe ? "फिल्टर हटाउनुहोस्" : "Clear all filters"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}