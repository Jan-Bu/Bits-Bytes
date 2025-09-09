// src/components/pages/ContactSection.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Mail, Phone, Info, Send, PhoneCall, User, Copy, MapPin } from "lucide-react";

type Props = { t: (key: string) => string; embedded?: boolean };
type Tab = "email" | "phone" | "info";

const WIN95 = { face: "#c0c0c0", light: "#ffffff", dark: "#7b7b7b", title: "#253A8A" };
const bevelOut = `inset 1px 1px ${WIN95.light}, inset -1px -1px ${WIN95.dark}`;
const bevelIn  = `inset 1px 1px ${WIN95.dark}, inset -1px -1px ${WIN95.light}`;

const ToolbarBtn: React.FC<
  React.PropsWithChildren<{ active?: boolean; title?: string; onClick?: () => void }>
> = ({ active, title, onClick, children }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className="h-7 px-3 text-sm inline-flex items-center gap-2"
    style={{ background: WIN95.face, border: `1px solid ${WIN95.dark}`, boxShadow: active ? bevelIn : bevelOut, cursor: "pointer" }}
  >
    {children}
  </button>
);

const Row: React.FC<React.PropsWithChildren<{ label: string }>> = ({ label, children }) => (
  <div className="grid items-center gap-2" style={{ gridTemplateColumns: "120px 1fr" }}>
    <div className="text-sm select-none">{label}</div>
    {children}
  </div>
);

const Input = (p: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...p} className="w-full px-2 py-1 text-sm outline-none" style={{ background: "#fff", border: `1px solid ${WIN95.dark}`, boxShadow: bevelIn }} />
);
const Select = (p: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select {...p} className="w-full px-2 py-1 text-sm outline-none" style={{ background: "#fff", border: `1px solid ${WIN95.dark}`, boxShadow: bevelIn }} />
);
const Textarea = (p: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea {...p} className="w-full h-full px-2 py-2 text-sm leading-6 outline-none resize-none" style={{ background: "#fff", border: `1px solid ${WIN95.dark}`, boxShadow: bevelIn }} />
);

/** Malá Win95 karta s bevel rámečkem */
const Card95: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <div className={className} style={{ background: "#fff", border: `1px solid ${WIN95.dark}`, boxShadow: bevelIn }}>
    {children}
  </div>
);

function copy(text: string, t: (k: string) => string) {
  try {
    navigator.clipboard?.writeText(text);
    alert(t("common.copied"));
  } catch {}
}

/** Status helper: online pokud currentHour je v [start, end) */
function useOnlineStatus(startHour: number, endHour: number) {
  const [online, setOnline] = useState(() => isWithinWindow(new Date(), startHour, endHour));
  useEffect(() => {
    const id = window.setInterval(() => setOnline(isWithinWindow(new Date(), startHour, endHour)), 60 * 1000);
    return () => clearInterval(id);
  }, [startHour, endHour]);
  return online;
}
function isWithinWindow(now: Date, start: number, end: number) {
  const h = now.getHours();
  return start <= end ? (h >= start && h < end) : (h >= start || h < end);
}

const ContactSection: React.FC<Props> = ({ t }) => {
  const [tab, setTab] = useState<Tab>("email");
  const toEmail = useMemo(() => t("contact.info.email.value"), [t]);

  // Online okna: Jan 9–22, Alan 8–18 (lokální čas zařízení)
  const janOnline = useOnlineStatus(9, 22);
  const alanOnline = useOnlineStatus(8, 18);

  function handleSend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const subject = String(fd.get("subject") || "");
    const body = [
      `${t("contact.form.from")}: ${fd.get("from") || ""}`,
      `${t("contact.form.reason.label")} ${fd.get("reason") || ""}`,
      "",
      String(fd.get("message") || ""),
    ].join("\n");
    window.location.href = `mailto:${encodeURIComponent(toEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  const StatusPill: React.FC<{ online: boolean; hoursKey: string }> = ({ online, hoursKey }) => (
    <div className="mt-3 h-6 flex items-center gap-2 px-2 text-[11px]" style={{ background: WIN95.face, border: `1px solid ${WIN95.dark}`, boxShadow: bevelIn }}>
      <span
        aria-label={online ? t("contact.status.online") : t("contact.status.offline")}
        title={online ? t("contact.status.online") : t("contact.status.offline")}
        className="inline-block w-2 h-2 rounded-full"
        style={{ background: online ? "#16a34a" : "#dc2626" }}
      />
      <span className="font-semibold">{online ? t("contact.status.online") : t("contact.status.offline")}</span>
      <span className="opacity-70">• {t(hoursKey)}</span>
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col" style={{ background: WIN95.face }} role="document" aria-label={t("contact.title")}>
      {/* TOOLBAR */}
      <div className="flex items-center gap-2 p-2" style={{ background: WIN95.face, borderBottom: `1px solid ${WIN95.dark}`, boxShadow: bevelOut }}>
        <ToolbarBtn active={tab === "email"} title={t("contact.tabs.email")} onClick={() => setTab("email")}>
          <Mail size={16} /><span>{t("contact.tabs.email")}</span>
        </ToolbarBtn>
        <ToolbarBtn active={tab === "phone"} title={t("contact.tabs.phone")} onClick={() => setTab("phone")}>
          <Phone size={16} /><span>{t("contact.tabs.phone")}</span>
        </ToolbarBtn>
        <ToolbarBtn active={tab === "info"} title={t("contact.tabs.info")} onClick={() => setTab("info")}>
          <Info size={16} /><span>{t("contact.tabs.info")}</span>
        </ToolbarBtn>
      </div>

      {/* WORK AREA */}
      <div className="flex-1 p-2">
        <div className="w-full h-full" style={{ background: WIN95.face, border: `1px solid ${WIN95.dark}`, boxShadow: bevelOut }}>
          <div className="w-full h-full bg-white overflow-hidden" style={{ boxShadow: bevelIn }}>
            {/* EMAIL (beze změn) */}
            {tab === "email" && (
              <form onSubmit={handleSend} className="w-full h-full flex flex-col">
                <div className="p-3 space-y-2 border-b" style={{ borderColor: WIN95.dark }}>
                  <Row label={t("contact.form.to")}><Input name="to" defaultValue={toEmail} readOnly /></Row>
                  <Row label={t("contact.form.from")}><Input name="from" type="email" placeholder={t("contact.form.fromPh")} required /></Row>
                  <Row label={t("contact.form.reason.label")}>
                    <Select name="reason" defaultValue="">
                      <option value="" disabled>{t("contact.form.reason.choose")}</option>
                      <option value="web">{t("contact.form.reason.web")}</option>
                      <option value="branding">{t("contact.form.reason.branding")}</option>
                      <option value="seo">{t("contact.form.reason.seo")}</option>
                      <option value="print">{t("contact.form.reason.print")}</option>
                      <option value="other">{t("contact.form.reason.other")}</option>
                    </Select>
                  </Row>
                  <Row label={t("contact.form.subject")}><Input name="subject" placeholder={t("contact.form.subjectPh")} required /></Row>
                </div>
                <div className="flex-1 p-3"><div className="w-full h-full"><Textarea name="message" placeholder={t("contact.form.messagePh")} required /></div></div>
                <div className="p-2 flex items-center gap-3 justify-end border-t" style={{ borderColor: WIN95.dark }}>
                  <button type="submit" className="px-4 h-8 inline-flex items-center gap-2 text-sm" style={{ background: WIN95.face, border: `1px solid ${WIN95.dark}`, boxShadow: bevelOut, cursor: "pointer" }}>
                    <Send size={16} /><span>{t("contact.form.send")}</span>
                  </button>
                  <a href={`mailto:${toEmail}`} className="text-sm underline">{t("contact.form.useMailer")}</a>
                </div>
              </form>
            )}

            {/* PHONE – karty s akcemi + status */}
            {tab === "phone" && (
              <div className="w-full h-full p-3 overflow-auto">
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Bits / Jan */}
                  <Card95 className="p-3">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 grid place-items-center" style={{ background: WIN95.face, border: `1px solid ${WIN95.dark}`, boxShadow: bevelOut }}>
                        <User size={18} />
                      </div>
                      <div className="leading-tight">
                        <div className="text-sm font-semibold">{t("contact.phone.bits.title")} — {t("contact.phone.bits.name")}</div>
                        <div className="text-[11px] opacity-70">{t("contact.phone.direct")}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <a className="text-sm underline" href="tel:+420724366911" title={t("contact.phone.call")}>
                        +420&nbsp;724&nbsp;366&nbsp;911
                      </a>
                      <div className="flex items-center gap-2">
                        <a href="tel:+420724366911" className="h-7 px-3 text-sm inline-flex items-center gap-2" style={{ background: WIN95.face, border: `1px solid ${WIN95.dark}`, boxShadow: bevelOut }}>
                          <PhoneCall size={16} /><span>{t("contact.phone.call")}</span>
                        </a>
                        <button type="button" onClick={() => copy("+420724366911", t)} className="h-7 px-2 inline-flex items-center" style={{ background: WIN95.face, border: `1px solid ${WIN95.dark}`, boxShadow: bevelOut, cursor: "pointer" }} title={t("common.copy")}>
                          <Copy size={14} />
                        </button>
                      </div>
                    </div>

                    <StatusPill online={janOnline} hoursKey="contact.phone.bits.hours" />
                  </Card95>

                  {/* Bytes / Alan */}
                  <Card95 className="p-3">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 grid place-items-center" style={{ background: WIN95.face, border: `1px solid ${WIN95.dark}`, boxShadow: bevelOut }}>
                        <User size={18} />
                      </div>
                      <div className="leading-tight">
                        <div className="text-sm font-semibold">{t("contact.phone.bytes.title")} — {t("contact.phone.bytes.name")}</div>
                        <div className="text-[11px] opacity-70">{t("contact.phone.direct")}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <a className="text-sm underline" href="tel:+420777535749" title={t("contact.phone.call")}>
                        +420&nbsp;777&nbsp;535&nbsp;749
                      </a>
                      <div className="flex items-center gap-2">
                        <a href="tel:+420777535749" className="h-7 px-3 text-sm inline-flex items-center gap-2" style={{ background: WIN95.face, border: `1px solid ${WIN95.dark}`, boxShadow: bevelOut }}>
                          <PhoneCall size={16} /><span>{t("contact.phone.call")}</span>
                        </a>
                        <button type="button" onClick={() => copy("+420777535749", t)} className="h-7 px-2 inline-flex items-center" style={{ background: WIN95.face, border: `1px solid ${WIN95.dark}`, boxShadow: bevelOut, cursor: "pointer" }} title={t("common.copy")}>
                          <Copy size={14} />
                        </button>
                      </div>
                    </div>

                    <StatusPill online={alanOnline} hoursKey="contact.phone.bytes.hours" />
                  </Card95>
                </div>

                <div className="mt-4 p-2 text-[11px] flex items-center gap-2" style={{ background: WIN95.face, border: `1px solid ${WIN95.dark}`, boxShadow: bevelIn }}>
                  {t("contact.phone.tip")}
                </div>
              </div>
            )}

            {/* INFO – e-mail + sídlo (bez NDA) */}
            {tab === "info" && (
              <div className="w-full h-full p-3 overflow-auto">
                <div className="grid gap-4 md:grid-cols-2">
                  {/* E-mail */}
                  <Card95 className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Mail size={16} />
                      <div className="text-sm font-semibold">{t("contact.info.email.label")}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <a className="underline text-sm" href="mailto:studio.bitsbytes@gmail.com">{t("contact.info.email.value")}</a>
                      <div className="flex items-center gap-2">
                        <a href="mailto:studio.bitsbytes@gmail.com" className="h-7 px-3 text-sm inline-flex items-center gap-2" style={{ background: WIN95.face, border: `1px solid ${WIN95.dark}`, boxShadow: bevelOut }}>
                          <Mail size={14} /><span>{t("common.open")}</span>
                        </a>
                        <button type="button" onClick={() => copy("studio.bitsbytes@gmail.com", t)} className="h-7 px-2 inline-flex items-center" style={{ background: WIN95.face, border: `1px solid ${WIN95.dark}`, boxShadow: bevelOut, cursor: "pointer" }} title={t("common.copy")}>
                          <Copy size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 h-6 flex items-center px-2 text-[11px]" style={{ background: WIN95.face, border: `1px solid ${WIN95.dark}`, boxShadow: bevelIn }}>
                      {t("contact.info.email.note")}
                    </div>
                  </Card95>

                  {/* Sídlo */}
                  <Card95 className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin size={16} />
                      <div className="text-sm font-semibold">{t("contact.info.location.label")}</div>
                    </div>
                    <div className="text-sm mb-3">{t("contact.info.location.value")}</div>
                    <div className="w-full h-28 relative overflow-hidden" style={{ background: WIN95.face, border: `1px solid ${WIN95.dark}`, boxShadow: bevelOut }}>
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundImage:
                            "repeating-linear-gradient(90deg, rgba(0,0,0,0.06) 0 1px, transparent 1px 6px), repeating-linear-gradient(0deg, rgba(0,0,0,0.06) 0 1px, transparent 1px 6px)",
                        }}
                      />
                      <div className="absolute right-2 bottom-2 text-[10px] opacity-70">Prague • CZ</div>
                    </div>
                    <div className="mt-3 h-6 flex items-center px-2 text-[11px]" style={{ background: WIN95.face, border: `1px solid ${WIN95.dark}`, boxShadow: bevelIn }}>
                      {t("contact.info.location.note")}
                    </div>
                  </Card95>
                </div>

                <div className="mt-4 p-2 text-[11px]" style={{ background: WIN95.face, border: `1px solid ${WIN95.dark}`, boxShadow: bevelIn }}>
                  {t("contact.info.footerTip")}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSection;
