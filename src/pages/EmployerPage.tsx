import { useCallback, useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import { translations } from "../i18n/translations";
import { MOCK_GRADUATES } from "../data/mockData";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Users, Shield, Award, MapPin, Phone, PenTool, Building2, CheckCircle, Briefcase, GraduationCap, Trash } from "lucide-react";
import type { Job, PaymentFrequency, Training, TrainingAuthority, TrainingCategory } from "../types";

type JobFormData = {
  title: string;
  company: string;
  location: string;
  // single price shown to employer
  price: string;
  priceUnit: Exclude<PaymentFrequency, "all">;
  description: string;
  phone: string;
  imageUrl: string;
};

type TrainingFormData = {
  title: string;
  category: Exclude<TrainingCategory, "all">;
  provider: string;
  duration: string;
  authority: TrainingAuthority;
  location: string;
  seats: string;
  description: string;
};

const initialJobForm: JobFormData = {
  title: "",
  company: "",
  location: "",
  price: "",
  priceUnit: "roj",
  description: "",
  phone: "",
  imageUrl: ""
};

const initialTrainingForm: TrainingFormData = {
  title: "",
  category: "plumbing",
  provider: "",
  duration: "",
  authority: "CTEVT Verified",
  location: "",
  seats: "12",
  description: ""
};

export function EmployerPage() {
  const { language, addNotification, addJob, addTraining, jobs, trainings, userProfile, removeJob, removeTraining } = useApp();
  const t = translations[language];
  const isNe = language === "ne";

  const [showHireModal, setShowHireModal] = useState(false);
  const [hireType, setHireType] = useState<"job" | "training">("job");
  const [jobForm, setJobForm] = useState<JobFormData>(initialJobForm);
  const [trainingForm, setTrainingForm] = useState<TrainingFormData>(initialTrainingForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForms = useCallback(() => {
    setJobForm(initialJobForm);
    setTrainingForm(initialTrainingForm);
    setErrors({});
  }, []);

  const openHireModal = useCallback(() => {
    resetForms();
    setShowHireModal(true);
  }, [resetForms]);

  const validateJobForm = useCallback(() => {
    const nextErrors: Record<string, string> = {};
    if (!jobForm.title.trim()) nextErrors.title = isNe ? "शीर्षक आवश्यक छ" : "Job title is required";
    if (!jobForm.company.trim()) nextErrors.company = isNe ? "कम्पनी आवश्यक छ" : "Company is required";
    if (!jobForm.location.trim()) nextErrors.location = isNe ? "स्थान आवश्यक छ" : "Location is required";
    if (!jobForm.phone.trim()) nextErrors.phone = isNe ? "फोन नम्बर आवश्यक छ" : "Phone number is required";
    if (!jobForm.price.trim() || Number(jobForm.price) <= 0) nextErrors.price = isNe ? "मूल्य आवश्यक छ" : "Price is required";
    if (!jobForm.description.trim()) nextErrors.description = isNe ? "विवरण आवश्यक छ" : "Job description is required";
    return nextErrors;
  }, [jobForm, isNe]);

  const validateTrainingForm = useCallback(() => {
    const nextErrors: Record<string, string> = {};
    if (!trainingForm.title.trim()) nextErrors.title = isNe ? "शीर्षक आवश्यक छ" : "Training title is required";
    if (!trainingForm.provider.trim()) nextErrors.provider = isNe ? "प्रदायक आवश्यक छ" : "Provider is required";
    if (!trainingForm.location.trim()) nextErrors.location = isNe ? "स्थान आवश्यक छ" : "Location is required";
    if (!trainingForm.duration.trim()) nextErrors.duration = isNe ? "अवधि आवश्यक छ" : "Duration is required";
    if (!trainingForm.seats.trim() || Number(trainingForm.seats) <= 0) nextErrors.seats = isNe ? "सही सीट संख्या आवश्यक छ" : "Seats must be a positive number";
    if (!trainingForm.description.trim()) nextErrors.description = isNe ? "विवरण आवश्यक छ" : "Training description is required";
    return nextErrors;
  }, [trainingForm, isNe]);

  const handleCreate = useCallback(() => {
    const nextErrors = hireType === "job" ? validateJobForm() : validateTrainingForm();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const id = Date.now().toString();

    if (hireType === "job") {
      // map single price + unit into wage fields
      const priceNum = Number(jobForm.price) || 0;
      const wageDaily = jobForm.priceUnit === "roj" ? priceNum : 0;
      const wageWeekly = jobForm.priceUnit === "hapta" ? priceNum : 0;
      const wageMonthly = jobForm.priceUnit === "mahina" ? priceNum : 0;

      const ownerId = userProfile?.companyName?.trim() || userProfile?.phone?.trim() || "unknown";

      const job: Job = {
        id,
        title: jobForm.title.trim(),
        company: jobForm.company.trim(),
        location: jobForm.location.trim(),
        wageDaily,
        wageWeekly,
        wageMonthly,
        paymentFreq: jobForm.priceUnit,
        description: jobForm.description.trim(),
        phone: jobForm.phone.trim(),
        imageUrl: jobForm.imageUrl.trim(),
        owner: ownerId
      };
      addJob(job);
      addNotification(isNe ? "जागिर सफलतापूर्वक पोस्ट भयो" : "Job posted successfully", "success");
    } else {
      const ownerId = userProfile?.companyName?.trim() || userProfile?.phone?.trim() || "unknown";
      const training: Training = {
        id,
        title: trainingForm.title.trim(),
        category: trainingForm.category,
        provider: trainingForm.provider.trim(),
        duration: trainingForm.duration.trim(),
        authority: trainingForm.authority,
        location: trainingForm.location.trim(),
        seats: Number(trainingForm.seats),
        description: trainingForm.description.trim(),
        owner: ownerId
      };
      addTraining(training);
      addNotification(isNe ? "तालिम सफलतापूर्वक पोस्ट भयो" : "Training posted successfully", "success");
    }

    setShowHireModal(false);
    resetForms();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [hireType, validateJobForm, validateTrainingForm, jobForm, trainingForm, addJob, addTraining, addNotification, isNe, resetForms]);

  const handleInitiateContract = useCallback((name: string, phone: string) => {
    addNotification(
      isNe
        ? `${name} को लागि करार प्रस्ताव सुरु भयो। एचआरले ${phone} मा सम्पर्क गर्नेछ।`
        : `Contract offer initiated for ${name}. HR will contact ${phone}.`,
      "success"
    );
  }, [addNotification, isNe]);

  const handleDeleteJob = useCallback((id: string) => {
    if (!confirm(isNe ? "के तपाइँ यो पोस्ट हटाउन निश्चित हुनुहुन्छ?" : "Are you sure you want to delete this post?")) return;
    removeJob(id);
    addNotification(isNe ? "पोष्ट हटाइयो" : "Post removed", "info");
  }, [removeJob, addNotification, isNe]);

  const handleDeleteTraining = useCallback((id: string) => {
    if (!confirm(isNe ? "के तपाइँ यो पोस्ट हटाउन निश्चित हुनुहुन्छ?" : "Are you sure you want to delete this post?")) return;
    removeTraining(id);
    addNotification(isNe ? "पोष्ट हटाइयो" : "Post removed", "info");
  }, [removeTraining, addNotification, isNe]);

  const latestJobs = useMemo(() => jobs, [jobs]);
  const latestTrainings = useMemo(() => trainings, [trainings]);
  const ownerId = userProfile?.companyName?.trim() || userProfile?.phone?.trim() || "unknown";
  const myJobs = useMemo(() => jobs.filter(j => j.owner === ownerId), [jobs, ownerId]);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-6 text-white">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
              <Building2 className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">{t.commandCenter}</h1>
              <p className="text-emerald-100 mt-1 max-w-2xl">
                {isNe
                  ? "प्रमाणित स्नातकहरू ब्राउज गर्नुहोस् र सिधै करार प्रस्ताव सुरु गर्नुहोस्"
                  : "Browse certified graduates and initiate direct contract offers."}
              </p>
            </div>
          </div>
          <div className="ml-auto">
            <Button onClick={openHireModal} leftIcon={<PenTool className="h-4 w-4" />}>
              {isNe ? "पोस्ट गर्नुहोस्" : "Post New Listing"}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { value: `${jobs.length}`, label: isNe ? "कुल पोस्ट" : "Total Posts", icon: Briefcase },
          { value: `${trainings.length}`, label: isNe ? "कुल तालिम" : "Total Trainings", icon: GraduationCap },
          { value: "100%", label: isNe ? "प्रमाणित" : "Verified", icon: Shield },
          { value: "24h", label: isNe ? "औसत प्रतिक्रिया" : "Avg Response", icon: Users }
        ].map((stat, idx) => (
          <Card key={idx} className="text-center p-4">
            <div className="flex justify-center mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-xs text-slate-500">{stat.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-emerald-600" />
              {t.certifiedGraduates}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {MOCK_GRADUATES.map((grad) => (
                <Card key={grad.id} hover>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white font-bold text-lg">
                        {grad.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{grad.name}</h3>
                        <Badge variant="success" size="sm">
                          <Shield className="h-3 w-3" />
                          {t.verified}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-slate-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span className="font-medium">{t.primarySkill}:</span>
                      <span>{grad.skill}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>{grad.course}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span className="text-xs font-mono text-slate-500">{grad.certificateId}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>{grad.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>{grad.phone}</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleInitiateContract(grad.name, grad.phone)}
                    fullWidth
                    leftIcon={<PenTool className="h-5 w-5" />}
                  >
                    {t.initiateContract}
                  </Button>
                </Card>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card hover>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">{isNe ? "नवीनतम जागिर" : "Latest Jobs"}</p>
                  <p className="text-2xl font-bold text-slate-900">{latestJobs.length}</p>
                </div>
                <Briefcase className="h-7 w-7 text-emerald-600" />
              </div>
            </Card>
            <Card hover>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">{isNe ? "नवीनतम तालिम" : "Latest Trainings"}</p>
                  <p className="text-2xl font-bold text-slate-900">{latestTrainings.length}</p>
                </div>
                <GraduationCap className="h-7 w-7 text-emerald-600" />
              </div>
            </Card>
          </div>
        </div>

        <div className="space-y-4">
          <Card className="space-y-4 p-6" hover>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500">{isNe ? "पोस्टिङ गाइड" : "Posting guide"}</p>
                <h3 className="text-lg font-bold text-slate-900">{isNe ? "विश्वसनीय रोजगारी बनाउनुहोस्" : "Publish trusted hires"}</h3>
              </div>
            </div>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-600" />
                {isNe ? "स्पष्ट स्थान र तलब उल्लेख गर्नुहोस्" : "Include clear location and pay details."}
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-600" />
                {isNe ? "सम्पर्क फोन तुरुन्त उपलब्ध राख्नुहोस्" : "Keep contact phone available."}
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-600" />
                {isNe ? "तालिम भए प्रमाणपत्र र सीट जानकारी अनिवार्य" : "For training, include seats and certification info."}
              </li>
            </ul>
          </Card>

          <Card className="space-y-4 p-6" hover>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500">{isNe ? "अहिले सम्मको पोष्ट" : "Recent listings"}</p>
                <h3 className="text-lg font-bold text-slate-900">{isNe ? "Employer feed" : "Employer feed"}</h3>
              </div>
              <Badge variant="info" size="sm">
                {jobs.length + trainings.length}
              </Badge>
            </div>
            <div className="space-y-3">
              {latestJobs.map((job) => (
                <div key={job.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{job.title}</p>
                    <p className="text-xs text-slate-500">{job.company}</p>
                  </div>
                  {job.owner === ownerId && (
                    <button onClick={() => handleDeleteJob(job.id)} className="text-red-600 hover:text-red-800 ml-2">
                      <Trash className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              {latestTrainings.map((training) => (
                <div key={training.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{training.title}</p>
                    <p className="text-xs text-slate-500">{training.provider}</p>
                  </div>
                  {training.owner === ownerId && (
                    <button onClick={() => handleDeleteTraining(training.id)} className="text-red-600 hover:text-red-800 ml-2">
                      <Trash className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {showHireModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowHireModal(false)}>
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-slate-100 bg-slate-50 px-6 py-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {isNe ? "रोजगारी पोस्ट बनाउनुहोस्" : "Create a job or training post"}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {isNe
                      ? "साफ विवरण, ठेगाना र सम्पर्क दिएर आकर्षक पोस्ट बनाउनुहोस्।"
                      : "Publish a listing with clear requirements, location and contact info."}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant={hireType === "job" ? "primary" : "outline"} size="sm" onClick={() => setHireType("job")}>{isNe ? "जागिर" : "Job"}</Button>
                  <Button variant={hireType === "training" ? "primary" : "outline"} size="sm" onClick={() => setHireType("training")}>{isNe ? "तालिम" : "Training"}</Button>
                </div>
              </div>
            </div>

            <div className="grid gap-4 p-6 sm:grid-cols-2">
              {hireType === "job" ? (
                <>
                  <Input
                    label={isNe ? "जागिरको शीर्षक" : "Job title"}
                    placeholder={isNe ? "उदा. फिटर" : "Ex. Helper / Fitter"}
                    value={jobForm.title}
                    error={errors.title}
                    onChange={(e) => setJobForm((s) => ({ ...s, title: e.target.value }))}
                  />
                  <Input
                    label={isNe ? "कम्पनी / रोजगारदाताको नाम" : "Company / Employer"}
                    placeholder={isNe ? "कम्पनीको नाम" : "Company name"}
                    value={jobForm.company}
                    error={errors.company}
                    onChange={(e) => setJobForm((s) => ({ ...s, company: e.target.value }))}
                  />
                  <Input
                    label={isNe ? "स्थान" : "Location"}
                    placeholder={isNe ? "काठमाडौँ" : "Kathmandu"}
                    value={jobForm.location}
                    error={errors.location}
                    onChange={(e) => setJobForm((s) => ({ ...s, location: e.target.value }))}
                  />
                  <Input
                    label={isNe ? "सम्पर्क फोन" : "Contact phone"}
                    placeholder={isNe ? "९८XXXXXXXX" : "98XXXXXXXX"}
                    value={jobForm.phone}
                    error={errors.phone}
                    onChange={(e) => setJobForm((s) => ({ ...s, phone: e.target.value }))}
                  />
                  <Input
                    label={isNe ? "दर (प्रति)" : "Price (per)"}
                    placeholder={isNe ? "२०००" : "2000"}
                    type="number"
                    value={jobForm.price}
                    error={errors.price}
                    onChange={(e) => setJobForm((s) => ({ ...s, price: e.target.value }))}
                  />
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700">
                      {isNe ? "इकाई" : "Unit"}
                    </label>
                    <select
                      value={jobForm.priceUnit}
                      onChange={(e) => setJobForm((s) => ({ ...s, priceUnit: e.target.value as Exclude<PaymentFrequency, "all"> }))}
                      className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-base text-slate-900 focus:outline-none focus:border-emerald-400"
                    >
                      <option value="roj">{isNe ? "प्रति दिन" : "per day"}</option>
                      <option value="hapta">{isNe ? "प्रति हप्ता" : "per week"}</option>
                      <option value="mahina">{isNe ? "प्रति महिना" : "per month"}</option>
                    </select>
                  </div>
                  <Input
                    label={isNe ? "इमेज URL" : "Image URL"}
                    placeholder="https://"
                    value={jobForm.imageUrl}
                    onChange={(e) => setJobForm((s) => ({ ...s, imageUrl: e.target.value }))}
                  />
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      {isNe ? "विवरण" : "Job description"}
                    </label>
                    <textarea
                      rows={4}
                      value={jobForm.description}
                      onChange={(e) => setJobForm((s) => ({ ...s, description: e.target.value }))}
                      className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-base text-slate-900 outline-none focus:border-emerald-400"
                      placeholder={isNe ? "कामको जिम्मेवारी र न्यूनतम योग्यता उल्लेख गर्नुहोस्..." : "Describe responsibilities and required qualifications..."}
                    />
                    {errors.description && <p className="mt-2 text-sm text-red-600">{errors.description}</p>}
                  </div>
                </>
              ) : (
                <>
                  <Input
                    label={isNe ? "तालिमको शीर्षक" : "Training title"}
                    placeholder={isNe ? "उदा. इलेक्ट्रिक प्यानल मर्मत" : "Ex. Electric panel repair"}
                    value={trainingForm.title}
                    error={errors.title}
                    onChange={(e) => setTrainingForm((s) => ({ ...s, title: e.target.value }))}
                  />
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700">
                      {isNe ? "पाठ्यक्रम" : "Category"}
                    </label>
                    <select
                      value={trainingForm.category}
                      onChange={(e) => setTrainingForm((s) => ({ ...s, category: e.target.value as Exclude<TrainingCategory, "all"> }))}
                      className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-base text-slate-900 focus:outline-none focus:border-emerald-400"
                    >
                      <option value="plumbing">{isNe ? "प्लम्बिङ" : "Plumbing"}</option>
                      <option value="electrician">{isNe ? "इलेक्ट्रिसियन" : "Electrician"}</option>
                      <option value="driving">{isNe ? "ड्राइभिङ" : "Driving"}</option>
                      <option value="tailoring">{isNe ? "सिलाइ" : "Tailoring"}</option>
                    </select>
                  </div>
                  <Input
                    label={isNe ? "प्रदायक" : "Provider"}
                    placeholder={isNe ? "प्रतिष्ठान / कम्पनी" : "Institute / company"}
                    value={trainingForm.provider}
                    error={errors.provider}
                    onChange={(e) => setTrainingForm((s) => ({ ...s, provider: e.target.value }))}
                  />
                  <Input
                    label={isNe ? "स्थान" : "Location"}
                    placeholder={isNe ? "काठमाडौँ" : "Kathmandu"}
                    value={trainingForm.location}
                    error={errors.location}
                    onChange={(e) => setTrainingForm((s) => ({ ...s, location: e.target.value }))}
                  />
                  <Input
                    label={isNe ? "अवधि" : "Duration"}
                    placeholder={isNe ? "२ हप्ता" : "2 weeks"}
                    value={trainingForm.duration}
                    error={errors.duration}
                    onChange={(e) => setTrainingForm((s) => ({ ...s, duration: e.target.value }))}
                  />
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700">
                      {isNe ? "प्रमाण/अधिकार" : "Authority"}
                    </label>
                    <select
                      value={trainingForm.authority}
                      onChange={(e) => setTrainingForm((s) => ({ ...s, authority: e.target.value as TrainingAuthority }))}
                      className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-base text-slate-900 focus:outline-none focus:border-emerald-400"
                    >
                      <option>CTEVT Verified</option>
                      <option>Ward Office Authorized</option>
                      <option>Department of Labor Approved</option>
                    </select>
                  </div>
                  <Input
                    label={isNe ? "सीट संख्या" : "Seats available"}
                    placeholder={isNe ? "१२" : "12"}
                    type="number"
                    value={trainingForm.seats}
                    error={errors.seats}
                    onChange={(e) => setTrainingForm((s) => ({ ...s, seats: e.target.value }))}
                  />
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      {isNe ? "विवरण" : "Training description"}
                    </label>
                    <textarea
                      rows={4}
                      value={trainingForm.description}
                      onChange={(e) => setTrainingForm((s) => ({ ...s, description: e.target.value }))}
                      className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-base text-slate-900 outline-none focus:border-emerald-400"
                      placeholder={isNe ? "तालिममा के सिकाइनेछ र प्रमाणपत्र के हुनेछ..." : "Explain what trainees will learn and certification details..."}
                    />
                    {errors.description && <p className="mt-2 text-sm text-red-600">{errors.description}</p>}
                  </div>
                </>
              )}
            </div>

            <div className="border-t border-slate-100 bg-slate-50 px-6 py-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                  <CheckCircle className="h-4 w-4" />
                  {isNe ? "सुरक्षित पोस्टिङ" : "Verified posting"}
                </div>
                <p className="max-w-2xl text-sm text-slate-600">
                  {isNe
                    ? "पोस्ट प्रकाशित भएपछि यो Jobs वा Training मा तुरुन्त देखिन्छ। आवेदन प्रक्रियालाई पारदर्शी र भरपर्दो राख्नुहोस्।"
                    : "Your listing goes live instantly in Jobs or Training. Keep hiring transparent and reliable."}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 p-6 sm:flex-row">
              <Button variant="outline" onClick={() => setShowHireModal(false)} className="w-full sm:w-auto">
                {t.cancel}
              </Button>
              <Button onClick={handleCreate} className="w-full sm:w-auto sm:ml-auto">
                {isNe
                  ? hireType === "job"
                    ? "जागिर पोस्ट गर्नुहोस्"
                    : "तालिम पोस्ट गर्नुहोस्"
                  : hireType === "job"
                    ? "Publish Job"
                    : "Publish Training"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
