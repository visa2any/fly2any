"use client";

// components/agent/AgentRegistrationForm.tsx
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  User, Building2, Award, FileText, CreditCard, CheckCircle,
  ChevronRight, ChevronLeft, Globe, Phone,
  Mail, MapPin, Upload, Shield, RefreshCw, AlertCircle,
  Briefcase, Hash, Lock, Smartphone, CheckCircle2, X,
} from "lucide-react";

interface Props {
  user: { id?: string; name?: string | null; email?: string | null };
}

const STEPS = [
  { id: 1, title: "Personal",    icon: User,       desc: "Your details"   },
  { id: 2, title: "Business",    icon: Building2,  desc: "Company info"   },
  { id: 3, title: "Credentials", icon: Award,      desc: "IATA / ARC"     },
  { id: 4, title: "Tax & ID",    icon: FileText,   desc: "Documents"      },
  { id: 5, title: "Payment",     icon: CreditCard, desc: "Billing"        },
  { id: 6, title: "Review",      icon: CheckCircle,desc: "Confirm & send" },
];

const SPECS = [
  "Luxury Travel","Honeymoons","Family Travel","Adventure",
  "Business Travel","Group Travel","Cruises","All-Inclusive",
  "European Travel","Asian Travel","Caribbean","Weddings",
];

const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
  "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
  "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada",
  "New Hampshire","New Jersey","New Mexico","New York","North Carolina",
  "North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island",
  "South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont",
  "Virginia","Washington","West Virginia","Wisconsin","Wyoming",
];

export default function AgentRegistrationForm({ user }: Props) {
  const router = useRouter();
  const idFileRef   = useRef<HTMLInputElement>(null);
  const einFileRef  = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadingId, setUploadingId]   = useState(false);
  const [uploadingEin, setUploadingEin] = useState(false);
  const [dragId,  setDragId]  = useState(false);
  const [dragEin, setDragEin] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [mobileSessionId] = useState(() =>
    typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).slice(2)
  );
  const [mobilePolling, setMobilePolling] = useState(false);

  const [f, setF] = useState({
    firstName: user.name?.split(" ")[0] || "",
    lastName:  user.name?.split(" ").slice(1).join(" ") || "",
    phone: "", workPhone: "", address: "", city: "", state: "", zipCode: "",
    country: "United States",
    workEmail: "",
    businessName: "", businessDba: "", businessType: "INDIVIDUAL",
    businessAddress: "", businessCity: "", businessState: "", businessZip: "",
    businessEmail: "", businessPhone: "",
    website: "",
    yearsExperience: "", specializations: [] as string[], bio: "",
    credentialType: "none" as "none"|"iata"|"arc"|"both",
    iataNumber: "", arcNumber: "",
    ssnOrItin: "", ein: "",
    idDocumentType: "drivers_license" as "drivers_license"|"passport"|"state_id",
    idDocumentUrl: "", idDocumentName: "",
    einLetterUrl: "", einLetterName: "",
    hasPaymentMethod: false,
    cardNumber: "", cardExpiry: "", cardCvc: "", cardName: "",
    termsAccepted: false, privacyAccepted: false,
  });

  const upd = (k: string, v: any) => setF((p) => ({ ...p, [k]: v }));
  const toggleSpec = (s: string) => upd("specializations",
    f.specializations.includes(s) ? f.specializations.filter((x) => x !== s) : [...f.specializations, s]
  );

  const fmtSSN  = (v: string) => { const c=v.replace(/\D/g,"").slice(0,9); return c.length<=3?c:c.length<=5?`${c.slice(0,3)}-${c.slice(3)}`:`${c.slice(0,3)}-${c.slice(3,5)}-${c.slice(5)}`; };
  const fmtEIN  = (v: string) => { const c=v.replace(/\D/g,"").slice(0,9); return c.length<=2?c:`${c.slice(0,2)}-${c.slice(2)}`; };
  const fmtCard = (v: string) => v.replace(/\D/g,"").slice(0,16).replace(/(.{4})/g,"$1 ").trim();
  const fmtExp  = (v: string) => { const c=v.replace(/\D/g,"").slice(0,4); return c.length<=2?c:`${c.slice(0,2)}/${c.slice(2)}`; };

  // Generate QR when entering step 4
  useEffect(() => {
    if (step !== 4) return;
    const url = `${window.location.origin}/agent/upload-mobile?session=${mobileSessionId}`;
    import('qrcode').then(QRCode =>
      QRCode.toDataURL(url, { width: 180, margin: 1, color: { dark: '#0A0A0A', light: '#FAFAFA' } })
        .then(setQrDataUrl)
    );
  }, [step, mobileSessionId]);

  // Poll mobile session for uploads
  const pollMobileSession = useCallback(async () => {
    setMobilePolling(true);
    try {
      const res = await fetch(`/api/agent/upload-session?id=${mobileSessionId}`);
      const { files } = await res.json();
      if (files.idDocumentUrl) { upd("idDocumentUrl", files.idDocumentUrl); upd("idDocumentName", files.idDocumentName || "Mobile upload"); }
      if (files.einLetterUrl)  { upd("einLetterUrl",  files.einLetterUrl);  upd("einLetterName",  files.einLetterName  || "EIN letter"); }
      if (files.idDocumentUrl || files.einLetterUrl) toast.success("Documents received from mobile!");
      else toast("No uploads found yet. Try again in a moment.", { icon: "📱" });
    } catch { toast.error("Could not check mobile uploads"); }
    finally { setMobilePolling(false); }
  }, [mobileSessionId]);

  const handleUploadFile = async (
    file: File,
    type: "agent_id_document" | "agent_ein_letter",
    setUploading: (v: boolean) => void,
    urlKey: string, nameKey: string
  ) => {
    if (!["image/jpeg","image/png","image/webp","application/pdf"].includes(file.type)) { toast.error("Upload a valid image or PDF"); return; }
    if (file.size > 10*1024*1024) { toast.error("Max 10MB"); return; }
    setUploading(true);
    try {
      const fd = new FormData(); fd.append("file", file); fd.append("type", type);
      const res = await fetch("/api/upload",{method:"POST",body:fd});
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      upd(urlKey, url); upd(nameKey, file.name);
      toast.success("Document uploaded");
    } catch { toast.error("Upload failed. Try again."); }
    finally { setUploading(false); }
  };

  const handleIdUpload  = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; e.target.value = '';
    if (file) handleUploadFile(file, "agent_id_document", setUploadingId, "idDocumentUrl", "idDocumentName");
  };
  const handleEinUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; e.target.value = '';
    if (file) handleUploadFile(file, "agent_ein_letter", setUploadingEin, "einLetterUrl", "einLetterName");
  };

  const handleDrop = (e: React.DragEvent, type: "id" | "ein") => {
    e.preventDefault();
    if (type === "id") { setDragId(false); const file = e.dataTransfer.files?.[0]; if (file) handleUploadFile(file, "agent_id_document", setUploadingId, "idDocumentUrl", "idDocumentName"); }
    else               { setDragEin(false); const file = e.dataTransfer.files?.[0]; if (file) handleUploadFile(file, "agent_ein_letter", setUploadingEin, "einLetterUrl", "einLetterName"); }
  };

  const canNext = () => {
    if (step===1) return !!(f.firstName && f.lastName && f.phone && f.address && f.city);
    if (step===2) return !!(f.businessName && f.businessAddress && f.businessCity && f.businessEmail && f.businessPhone);
    if (step===3) {
      if (f.credentialType==="iata" && !f.iataNumber) return false;
      if (f.credentialType==="arc"  && !f.arcNumber)  return false;
      if (f.credentialType==="both" && (!f.iataNumber||!f.arcNumber)) return false;
      return true;
    }
    if (step===4) return f.ssnOrItin.length>=11 && !!f.idDocumentUrl;
    if (step===5) return !f.hasPaymentMethod || (f.cardNumber.length>=19 && f.cardExpiry.length===5 && f.cardCvc.length>=3 && !!f.cardName);
    if (step===6) return f.termsAccepted && f.privacyAccepted;
    return true;
  };

  const submit = async () => {
    setLoading(true);
    try {
      const body = {...f, cardLastFour: f.cardNumber?f.cardNumber.slice(-4):undefined, cardNumber:undefined, cardExpiry:undefined, cardCvc:undefined};
      const res = await fetch("/api/agents/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
      if (!res.ok) { const d=await res.json(); throw new Error(d.error||"Registration failed"); }
      toast.success("Application submitted! We'll review it within 24–48 hours.");
      router.push("/agent");
    } catch (e:any) { toast.error(e.message||"Registration failed. Please try again."); }
    finally { setLoading(false); }
  };

  // Compact shared classes
  const inp = "w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all";
  const lbl = "block text-xs font-semibold text-gray-600 mb-1";
  const icoWrap = "absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400";

  const CurrentIcon = STEPS[step-1].icon;

  return (
    <div className="h-full flex flex-col gap-2.5 min-h-0">

      {/* ── Step progress bar ── */}
      <div className="bg-white rounded-xl border border-gray-100 px-4 py-2.5 flex-shrink-0 shadow-sm">
        {/* Progress track */}
        <div className="relative flex items-center justify-between">
          {/* Background line */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-gray-100 z-0" />
          {/* Active line */}
          <motion.div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-primary-400 z-0 origin-left"
            animate={{ width: `${((step-1)/(STEPS.length-1))*100}%` }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          />
          {STEPS.map((s) => {
            const Icon = s.icon;
            const done = step > s.id;
            const active = step === s.id;
            return (
              <div key={s.id} className="flex flex-col items-center z-10">
                <motion.div
                  animate={{ scale: active ? 1.15 : 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                    done   ? "bg-emerald-500 text-white shadow-sm" :
                    active ? "bg-primary-500 text-white shadow-md shadow-primary-500/30" :
                             "bg-gray-100 text-gray-400"
                  }`}
                >
                  {done ? <CheckCircle className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                </motion.div>
                <span className={`text-[9px] mt-0.5 font-semibold whitespace-nowrap ${
                  active ? "text-primary-600" : done ? "text-emerald-600" : "text-gray-400"
                }`}>
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Form card — fills remaining height ── */}
      <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-0">

        {/* Card header — compact */}
        <div className="flex items-center gap-2.5 px-5 py-3 border-b border-gray-100 bg-gray-50/60 flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
            <CurrentIcon className="w-3.5 h-3.5 text-primary-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-primary-600 uppercase tracking-wider leading-none">
              Step {step} of {STEPS.length}
            </p>
            <p className="text-sm font-bold text-gray-900 leading-tight mt-0.5">{STEPS[step-1].desc}</p>
          </div>
        </div>

        {/* Scrollable field area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.18 }}
            className="flex-1 overflow-y-auto px-5 py-4 min-h-0 flex flex-col"
          >

            {/* ── STEP 1: Personal ── */}
            {step === 1 && (
              <div className="flex-1 flex flex-col justify-between gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lbl}>First Name <span className="text-primary-500">*</span></label>
                    <input type="text" value={f.firstName} onChange={(e)=>upd("firstName",e.target.value)} className={inp} placeholder="John" />
                  </div>
                  <div>
                    <label className={lbl}>Last Name <span className="text-primary-500">*</span></label>
                    <input type="text" value={f.lastName} onChange={(e)=>upd("lastName",e.target.value)} className={inp} placeholder="Doe" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lbl}>Personal Email</label>
                    <div className="relative">
                      <Mail className={icoWrap} />
                      <input type="email" value={user.email||""} disabled className={`${inp} pl-8 bg-gray-50 text-gray-400 cursor-not-allowed`} />
                    </div>
                  </div>
                  <div>
                    <label className={lbl}>Work Email <span className="text-gray-400 font-normal">(optional)</span></label>
                    <div className="relative">
                      <Mail className={icoWrap} />
                      <input type="email" value={f.workEmail} onChange={(e)=>upd("workEmail",e.target.value)} placeholder="work@agency.com" className={`${inp} pl-8`} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lbl}>Mobile Phone <span className="text-primary-500">*</span></label>
                    <div className="relative">
                      <Phone className={icoWrap} />
                      <input type="tel" value={f.phone} onChange={(e)=>upd("phone",e.target.value)} placeholder="+1 (555) 000-0000" className={`${inp} pl-8`} />
                    </div>
                  </div>
                  <div>
                    <label className={lbl}>Work Phone <span className="text-gray-400 font-normal">(optional)</span></label>
                    <div className="relative">
                      <Phone className={icoWrap} />
                      <input type="tel" value={f.workPhone} onChange={(e)=>upd("workPhone",e.target.value)} placeholder="+1 (555) 000-0000" className={`${inp} pl-8`} />
                    </div>
                  </div>
                </div>
                <div>
                  <label className={lbl}>Street Address <span className="text-primary-500">*</span></label>
                  <div className="relative">
                    <MapPin className={icoWrap} />
                    <input type="text" value={f.address} onChange={(e)=>upd("address",e.target.value)} placeholder="123 Main Street" className={`${inp} pl-8`} />
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-2.5">
                  <div className="col-span-2">
                    <label className={lbl}>City <span className="text-primary-500">*</span></label>
                    <input type="text" value={f.city} onChange={(e)=>upd("city",e.target.value)} className={inp} />
                  </div>
                  <div className="col-span-2">
                    <label className={lbl}>State</label>
                    <select value={f.state} onChange={(e)=>upd("state",e.target.value)} className={inp}>
                      <option value="">—</option>
                      {US_STATES.map((st)=><option key={st} value={st}>{st}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={lbl}>ZIP</label>
                    <input type="text" value={f.zipCode} onChange={(e)=>upd("zipCode",e.target.value)} className={inp} maxLength={10} />
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 2: Business ── */}
            {step === 2 && (
              <div className="flex-1 flex flex-col justify-between gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lbl}>Legal Business Name <span className="text-primary-500">*</span></label>
                    <div className="relative">
                      <Building2 className={icoWrap} />
                      <input type="text" value={f.businessName} onChange={(e)=>upd("businessName",e.target.value)} placeholder="Fly2Any Travel LLC" className={`${inp} pl-8`} />
                    </div>
                  </div>
                  <div>
                    <label className={lbl}>Trade Name <span className="text-gray-400 font-normal">(DBA, if different)</span></label>
                    <input type="text" value={f.businessDba} onChange={(e)=>upd("businessDba",e.target.value)} placeholder="e.g. My Travel Co." className={inp} />
                  </div>
                </div>
                <div>
                  <label className={lbl}>Business Type</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      {v:"INDIVIDUAL",l:"Independent"},
                      {v:"AGENCY",l:"Agency"},
                      {v:"TOUR_OPERATOR",l:"Tour Operator"},
                      {v:"OTHER",l:"Other"},
                    ].map(({v,l})=>(
                      <button key={v} type="button" onClick={()=>upd("businessType",v)}
                        className={`py-2 px-2 rounded-lg border text-xs font-semibold transition-all ${f.businessType===v?"border-primary-500 bg-primary-50 text-primary-700":"border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={lbl}>Business Address <span className="text-primary-500">*</span></label>
                  <div className="relative">
                    <MapPin className={icoWrap} />
                    <input type="text" value={f.businessAddress} onChange={(e)=>upd("businessAddress",e.target.value)} placeholder="123 Business Ave" className={`${inp} pl-8`} />
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-2.5">
                  <div className="col-span-2">
                    <label className={lbl}>City <span className="text-primary-500">*</span></label>
                    <input type="text" value={f.businessCity} onChange={(e)=>upd("businessCity",e.target.value)} className={inp} />
                  </div>
                  <div className="col-span-2">
                    <label className={lbl}>State</label>
                    <select value={f.businessState} onChange={(e)=>upd("businessState",e.target.value)} className={inp}>
                      <option value="">—</option>
                      {US_STATES.map((st)=><option key={st} value={st}>{st}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={lbl}>ZIP</label>
                    <input type="text" value={f.businessZip} onChange={(e)=>upd("businessZip",e.target.value)} className={inp} maxLength={10} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lbl}>Business Email <span className="text-primary-500">*</span></label>
                    <div className="relative">
                      <Mail className={icoWrap} />
                      <input type="email" value={f.businessEmail} onChange={(e)=>upd("businessEmail",e.target.value)} placeholder="info@agency.com" className={`${inp} pl-8`} />
                    </div>
                  </div>
                  <div>
                    <label className={lbl}>Business Phone <span className="text-primary-500">*</span></label>
                    <div className="relative">
                      <Phone className={icoWrap} />
                      <input type="tel" value={f.businessPhone} onChange={(e)=>upd("businessPhone",e.target.value)} placeholder="+1 (555) 000-0000" className={`${inp} pl-8`} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lbl}>Website <span className="text-gray-400 font-normal">(optional)</span></label>
                    <div className="relative">
                      <Globe className={icoWrap} />
                      <input type="url" value={f.website} onChange={(e)=>upd("website",e.target.value)} placeholder="https://..." className={`${inp} pl-8`} />
                    </div>
                  </div>
                  <div>
                    <label className={lbl}>Years of Experience</label>
                    <select value={f.yearsExperience} onChange={(e)=>upd("yearsExperience",e.target.value)} className={inp}>
                      <option value="">Select...</option>
                      <option value="0-1">{'< 1 year'}</option>
                      <option value="1-3">1–3 years</option>
                      <option value="3-5">3–5 years</option>
                      <option value="5-10">5–10 years</option>
                      <option value="10+">10+ years</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className={lbl}>Specializations <span className="text-gray-400 font-normal">(optional)</span></label>
                  <div className="flex flex-wrap gap-1.5">
                    {SPECS.map((s)=>(
                      <button key={s} type="button" onClick={()=>toggleSpec(s)}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${f.specializations.includes(s)?"bg-primary-500 text-white border-primary-500":"bg-white text-gray-600 border-gray-200 hover:border-primary-300 hover:text-primary-600"}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 3: Credentials ── */}
            {step === 3 && (
              <div className="flex-1 flex flex-col justify-between gap-3">
                <p className="text-xs text-gray-500">Select your accreditation status. This helps us verify your professional standing.</p>
                <div>
                  <label className={lbl}>Accreditation Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {v:"none",l:"None",d:"No IATA/ARC credentials"},
                      {v:"iata",l:"IATA Only",d:"International Air Transport"},
                      {v:"arc", l:"ARC Only", d:"Airlines Reporting Corp."},
                      {v:"both",l:"Both",     d:"IATA and ARC accredited"},
                    ].map(({v,l,d})=>(
                      <button key={v} type="button" onClick={()=>upd("credentialType",v)}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${f.credentialType===v?"border-primary-500 bg-primary-50":"border-gray-200 hover:border-gray-300"}`}>
                        <p className={`text-xs font-bold ${f.credentialType===v?"text-primary-700":"text-gray-900"}`}>{l}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{d}</p>
                      </button>
                    ))}
                  </div>
                </div>
                {(f.credentialType==="iata"||f.credentialType==="both") && (
                  <div>
                    <label className={lbl}>IATA Number <span className="text-primary-500">*</span></label>
                    <div className="relative"><Hash className={icoWrap} />
                      <input type="text" value={f.iataNumber} onChange={(e)=>upd("iataNumber",e.target.value)} placeholder="Enter your IATA number" className={`${inp} pl-8`} />
                    </div>
                  </div>
                )}
                {(f.credentialType==="arc"||f.credentialType==="both") && (
                  <div>
                    <label className={lbl}>ARC Number <span className="text-primary-500">*</span></label>
                    <div className="relative"><Hash className={icoWrap} />
                      <input type="text" value={f.arcNumber} onChange={(e)=>upd("arcNumber",e.target.value)} placeholder="Enter your ARC number" className={`${inp} pl-8`} />
                    </div>
                  </div>
                )}
                {f.credentialType==="none" && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-amber-800">No credentials? No problem!</p>
                      <p className="text-[11px] text-amber-700 mt-0.5">You can join as an independent agent. We offer training and resources to help you get started.</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── STEP 4: Tax & ID ── */}
            {step === 4 && (
              <div className="flex-1 flex flex-col gap-3">
                <p className="text-xs text-gray-500">Required for commission payments and tax reporting (1099-NEC).</p>

                {/* Tax Numbers */}
                <div>
                  <label className={lbl}>SSN or ITIN <span className="text-primary-500">*</span> <span className="text-gray-400 font-normal">(for 1099)</span></label>
                  <div className="relative"><Lock className={icoWrap} />
                    <input type="text" value={f.ssnOrItin} onChange={(e)=>upd("ssnOrItin",fmtSSN(e.target.value))}
                      placeholder="XXX-XX-XXXX" className={`${inp} pl-8 font-mono tracking-wider`} maxLength={11} />
                  </div>
                  <p className="flex items-center gap-1 text-[10px] text-gray-400 mt-1"><Shield className="w-2.5 h-2.5" />Encrypted · Never shared</p>
                </div>
                <div>
                  <label className={lbl}>EIN <span className="text-gray-400 font-normal">(optional — LLCs / corps)</span></label>
                  <div className="relative"><Briefcase className={icoWrap} />
                    <input type="text" value={f.ein} onChange={(e)=>upd("ein",fmtEIN(e.target.value))}
                      placeholder="XX-XXXXXXX" className={`${inp} pl-8 font-mono tracking-wider`} maxLength={10} />
                  </div>
                </div>

                {/* Documents Section */}
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 px-3 py-2 border-b border-gray-100 flex items-center justify-between">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Document Uploads</p>
                    <span className="text-[10px] text-gray-400">JPG · PNG · PDF · Max 10MB</span>
                  </div>

                  <div className="p-3 space-y-2.5">
                    {/* ID Document */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className={`${lbl} mb-0`}>Government-Issued ID <span className="text-primary-500">*</span></label>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 mb-2">
                        {[{v:"drivers_license",l:"Driver's License"},{v:"passport",l:"Passport"},{v:"state_id",l:"State ID"}].map(({v,l})=>(
                          <button key={v} type="button" onClick={()=>upd("idDocumentType",v)}
                            className={`py-1 px-1.5 rounded-lg border text-[10px] font-bold transition-all ${f.idDocumentType===v?"border-primary-500 bg-primary-50 text-primary-700":"border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                            {l}
                          </button>
                        ))}
                      </div>
                      <input type="file" ref={idFileRef} onChange={handleIdUpload} accept="image/*,.pdf" className="hidden" />
                      {f.idDocumentUrl ? (
                        <div className="flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0"><p className="text-[11px] font-bold text-emerald-800 truncate">{f.idDocumentName}</p></div>
                          <button type="button" onClick={()=>{ upd("idDocumentUrl",""); upd("idDocumentName",""); }}
                            className="text-emerald-600 hover:text-red-500 transition-colors"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      ) : (
                        <div
                          onDragOver={(e)=>{e.preventDefault();setDragId(true);}}
                          onDragLeave={()=>setDragId(false)}
                          onDrop={(e)=>handleDrop(e,"id")}
                          onClick={()=>idFileRef.current?.click()}
                          className={`w-full p-3 border-2 border-dashed rounded-xl cursor-pointer transition-all ${dragId?"border-primary-400 bg-primary-50":"border-gray-200 hover:border-primary-300 hover:bg-primary-50/20"}`}>
                          {uploadingId
                            ? <div className="flex items-center justify-center gap-2"><RefreshCw className="w-4 h-4 text-primary-500 animate-spin" /><span className="text-xs text-primary-600 font-semibold">Uploading...</span></div>
                            : <div className="text-center">
                                <Upload className={`w-5 h-5 mx-auto mb-1 ${dragId?"text-primary-500":"text-gray-300"}`} />
                                <p className="text-xs font-semibold text-gray-500">{dragId?"Drop to upload":"Drag & drop or click to upload"}</p>
                              </div>
                          }
                        </div>
                      )}
                    </div>

                    <div className="border-t border-gray-100" />

                    {/* EIN Letter */}
                    <div>
                      <label className={`${lbl} mb-1.5`}>EIN Letter <span className="text-gray-400 font-normal">(optional — IRS confirmation letter)</span></label>
                      <input type="file" ref={einFileRef} onChange={handleEinUpload} accept="image/*,.pdf" className="hidden" />
                      {f.einLetterUrl ? (
                        <div className="flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0"><p className="text-[11px] font-bold text-emerald-800 truncate">{f.einLetterName}</p></div>
                          <button type="button" onClick={()=>{ upd("einLetterUrl",""); upd("einLetterName",""); }}
                            className="text-emerald-600 hover:text-red-500 transition-colors"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      ) : (
                        <div
                          onDragOver={(e)=>{e.preventDefault();setDragEin(true);}}
                          onDragLeave={()=>setDragEin(false)}
                          onDrop={(e)=>handleDrop(e,"ein")}
                          onClick={()=>einFileRef.current?.click()}
                          className={`w-full p-3 border-2 border-dashed rounded-xl cursor-pointer transition-all ${dragEin?"border-primary-400 bg-primary-50":"border-gray-200 hover:border-primary-300 hover:bg-primary-50/20"}`}>
                          {uploadingEin
                            ? <div className="flex items-center justify-center gap-2"><RefreshCw className="w-4 h-4 text-primary-500 animate-spin" /><span className="text-xs text-primary-600 font-semibold">Uploading...</span></div>
                            : <div className="text-center">
                                <FileText className={`w-5 h-5 mx-auto mb-1 ${dragEin?"text-primary-500":"text-gray-300"}`} />
                                <p className="text-xs font-semibold text-gray-500">{dragEin?"Drop to upload":"Drag & drop or click to upload"}</p>
                              </div>
                          }
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* QR Code — Mobile Upload */}
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 px-3 py-2 border-b border-gray-100 flex items-center gap-2">
                    <Smartphone className="w-3.5 h-3.5 text-gray-400" />
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Upload from Phone</p>
                  </div>
                  <div className="p-3 flex gap-3 items-start">
                    {/* QR */}
                    <div className="flex-shrink-0">
                      {qrDataUrl
                        ? <img src={qrDataUrl} alt="QR Code" className="w-20 h-20 rounded-lg border border-gray-200" />
                        : <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center"><RefreshCw className="w-5 h-5 text-gray-300 animate-spin" /></div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-800 mb-0.5">Scan to upload with your phone</p>
                      <p className="text-[10px] text-gray-500 leading-relaxed">Scan the QR code to open a secure upload page on your phone. Use your camera to take photos of all your documents — ID and EIN letter — then check below.</p>
                      <button
                        type="button"
                        onClick={pollMobileSession}
                        disabled={mobilePolling}
                        className="mt-2 flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 hover:bg-primary-100 border border-primary-200 rounded-lg text-[11px] font-bold text-primary-700 transition-all disabled:opacity-50"
                      >
                        {mobilePolling ? <RefreshCw className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                        {mobilePolling ? "Checking..." : "Check for mobile uploads"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 5: Payment ── */}
            {step === 5 && (
              <div className="flex-1 flex flex-col justify-between gap-3">
                <p className="text-xs text-gray-500">Add a card for platform fees. You can also skip and add it later.</p>
                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                  <input type="checkbox" checked={f.hasPaymentMethod} onChange={(e)=>upd("hasPaymentMethod",e.target.checked)}
                    className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500" />
                  <div>
                    <p className="text-xs font-bold text-gray-900">Add payment method now</p>
                    <p className="text-[10px] text-gray-500">You can also add this later from your dashboard</p>
                  </div>
                </label>
                {f.hasPaymentMethod && (
                  <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} className="space-y-3 overflow-hidden">
                    <div>
                      <label className={lbl}>Cardholder Name <span className="text-primary-500">*</span></label>
                      <input type="text" value={f.cardName} onChange={(e)=>upd("cardName",e.target.value)} placeholder="Name on card" className={inp} />
                    </div>
                    <div>
                      <label className={lbl}>Card Number <span className="text-primary-500">*</span></label>
                      <div className="relative"><CreditCard className={icoWrap} />
                        <input type="text" value={f.cardNumber} onChange={(e)=>upd("cardNumber",fmtCard(e.target.value))}
                          placeholder="1234 5678 9012 3456" className={`${inp} pl-8 font-mono`} maxLength={19} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={lbl}>Expiry <span className="text-primary-500">*</span></label>
                        <input type="text" value={f.cardExpiry} onChange={(e)=>upd("cardExpiry",fmtExp(e.target.value))} placeholder="MM/YY" className={`${inp} font-mono`} maxLength={5} />
                      </div>
                      <div>
                        <label className={lbl}>CVC <span className="text-primary-500">*</span></label>
                        <input type="text" value={f.cardCvc} onChange={(e)=>upd("cardCvc",e.target.value.replace(/\D/g,"").slice(0,4))} placeholder="123" className={`${inp} font-mono`} maxLength={4} />
                      </div>
                    </div>
                    <p className="flex items-center gap-1 text-[10px] text-gray-400"><Shield className="w-2.5 h-2.5" />Encrypted and processed securely via Stripe.</p>
                  </motion.div>
                )}
                {!f.hasPaymentMethod && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-xs text-blue-700"><strong>No payment required now.</strong> Add a payment method later when you make your first booking.</p>
                  </div>
                )}
              </div>
            )}

            {/* ── STEP 6: Review ── */}
            {step === 6 && (
              <div className="flex-1 flex flex-col justify-between gap-3">
                <div className="grid gap-2">
                  {[
                    { label:"Personal",    lines:[`${f.firstName} ${f.lastName}`, `${user.email}${f.phone?` · ${f.phone}`:""}`, f.city?`${f.city}${f.state?`, ${f.state}`:""}`:""].filter(Boolean) },
                    { label:"Business",    lines:[f.businessName, f.businessDba?`DBA: ${f.businessDba}`:null, `${f.businessType}${f.yearsExperience?` · ${f.yearsExperience} exp`:""}`, f.businessCity?`${f.businessCity}${f.businessState?`, ${f.businessState}`:""}`:""].filter(Boolean) as string[] },
                    { label:"Credentials", lines:[f.credentialType==="none"?"No IATA/ARC":f.credentialType==="both"?"IATA & ARC":f.credentialType.toUpperCase(), f.iataNumber?`IATA: ${f.iataNumber}`:null, f.arcNumber?`ARC: ${f.arcNumber}`:null].filter(Boolean) as string[] },
                  ].map(({label,lines})=>(
                    <div key={label} className="p-3 bg-gray-50 rounded-xl">
                      <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold mb-1">{label}</p>
                      {lines.map((l,i)=>(
                        <p key={i} className={`text-xs ${i===0?"font-bold text-gray-900":"text-gray-500 mt-0.5"}`}>{l}</p>
                      ))}
                    </div>
                  ))}
                  {f.specializations.length>0 && (
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold mb-1.5">Specializations</p>
                      <div className="flex flex-wrap gap-1.5">
                        {f.specializations.map((s)=>(
                          <span key={s} className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-[10px] font-bold">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="border-t border-gray-100 pt-3 space-y-2.5">
                  <label className="flex items-start gap-2.5 cursor-pointer group">
                    <input type="checkbox" checked={f.termsAccepted} onChange={(e)=>upd("termsAccepted",e.target.checked)} className="mt-0.5 w-3.5 h-3.5 text-primary-600 rounded border-gray-300 focus:ring-primary-500" />
                    <span className="text-xs text-gray-600">
                      I agree to the <a href="/terms" target="_blank" className="text-primary-600 font-semibold hover:underline">Terms of Service</a> and <a href="/agent-agreement" target="_blank" className="text-primary-600 font-semibold hover:underline">Agent Agreement</a>
                    </span>
                  </label>
                  <label className="flex items-start gap-2.5 cursor-pointer group">
                    <input type="checkbox" checked={f.privacyAccepted} onChange={(e)=>upd("privacyAccepted",e.target.checked)} className="mt-0.5 w-3.5 h-3.5 text-primary-600 rounded border-gray-300 focus:ring-primary-500" />
                    <span className="text-xs text-gray-600">
                      I acknowledge the <a href="/privacy" target="_blank" className="text-primary-600 font-semibold hover:underline">Privacy Policy</a> and consent to processing my data
                    </span>
                  </label>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <p className="text-xs font-bold text-emerald-800 mb-0.5">What happens next?</p>
                  <p className="text-[11px] text-emerald-700">Our team reviews your application within 24–48 hours. You'll receive an email once approved and can start booking immediately.</p>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>

        {/* ── Navigation — always visible at bottom ── */}
        <div className="flex-shrink-0 px-5 py-3 bg-white border-t border-gray-100 flex items-center justify-between">
          <button onClick={()=>setStep((s)=>s-1)} disabled={step===1}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-gray-100">
            <ChevronLeft className="w-3.5 h-3.5" />Back
          </button>

          <div className="flex items-center gap-3">
            {/* Dot indicators */}
            <div className="flex gap-1">
              {STEPS.map((s)=>(
                <div key={s.id} className={`rounded-full transition-all ${
                  step===s.id?"w-4 h-1.5 bg-primary-500":
                  step>s.id ?"w-1.5 h-1.5 bg-emerald-400":"w-1.5 h-1.5 bg-gray-200"
                }`} />
              ))}
            </div>

            {step < 6 ? (
              <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.98}}
                onClick={()=>setStep((s)=>s+1)} disabled={!canNext()}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold rounded-xl shadow-md shadow-primary-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                Continue<ChevronRight className="w-3.5 h-3.5" />
              </motion.button>
            ) : (
              <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.98}}
                onClick={submit} disabled={loading||!canNext()}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                {loading?<RefreshCw className="w-3.5 h-3.5 animate-spin" />:<CheckCircle className="w-3.5 h-3.5" />}
                {loading?"Submitting...":"Submit Application"}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
