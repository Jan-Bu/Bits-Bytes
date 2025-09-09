// src/components/pages/GDPRSection.tsx
import React from "react";
import { Database, Target, Shield, UserCheck, Mail, RefreshCw } from "lucide-react";

type Props = {
  t: (key: string) => string;
  embedded?: boolean;           // injektuje DesktopWindowManager
  onRequestClose?: () => void;  // injektuje DesktopWindowManager
};

const H3: React.FC<{ icon: React.ReactNode; children: React.ReactNode }> = ({ icon, children }) => (
  <div className="mt-6 mb-2 flex items-center justify-center gap-3">
    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#253A8A]/10 text-[#253A8A]">
      {icon}
    </div>
    <h3 className="text-[20px] text-[#253A8A] font-semibold tracking-wide">{children}</h3>
  </div>
);

const GDPRSection: React.FC<Props> = ({ t, embedded }) => {
  return (
    <div
      className="w-full h-full overflow-auto bg-white"
      role="document"
      aria-label={t("gdpr.title")}
    >
      {/* lokální titlebar jen mimo embedded režim (ponecháno pro případ použití mimo okno) */}
      {!embedded && (
        <div className="px-4 py-2 border-b border-neutral-300 bg-[#c0c0c0] text-[#253A8A] font-bold">
          {t("gdpr.title")}
        </div>
      )}

      <div className="max-w-[1100px] mx-auto px-8 py-8 text-[20px] leading-[2.8] text-neutral-900 text-center">
        {/* Úvod */}
        <h2 className="text-[28px] font-semibold text-[#253A8A] tracking-wide mb-2">
          {t("gdpr.intro.title")}
        </h2>
        <p className="mb-4">{t("gdpr.intro.body")}</p>

        <hr className="my-5 border-t border-dashed border-neutral-300" />

        {/* 1) Jaké údaje sbíráme */}
        <H3 icon={<Database size={18} />}>{t("gdpr.s1.title")}</H3>
        <p className="mb-2">{t("gdpr.s1.body")}</p>
        <ul className="list-none space-y-1">
          <li>{t("gdpr.s1.l1")}</li>
          <li>{t("gdpr.s1.l2")}</li>
          <li>{t("gdpr.s1.l3")}</li>
        </ul>

        {/* 2) Proč je používáme */}
        <H3 icon={<Target size={18} />}>{t("gdpr.s2.title")}</H3>
        <p className="mb-2">{t("gdpr.s2.body")}</p>
        <ul className="list-none space-y-1">
          <li>{t("gdpr.s2.l1")}</li>
          <li>{t("gdpr.s2.l2")}</li>
          <li>{t("gdpr.s2.l3")}</li>
        </ul>

        {/* 3) Jak je chráníme */}
        <H3 icon={<Shield size={18} />}>{t("gdpr.s3.title")}</H3>
        <p className="mb-2">{t("gdpr.s3.body")}</p>
        <ul className="list-none space-y-1">
          <li>{t("gdpr.s3.l1")}</li>
          <li>{t("gdpr.s3.l2")}</li>
          <li>{t("gdpr.s3.l3")}</li>
        </ul>

        {/* 4) Vaše práva */}
        <H3 icon={<UserCheck size={18} />}>{t("gdpr.s4.title")}</H3>
        <p className="mb-2">{t("gdpr.s4.body")}</p>
        <ul className="list-none space-y-1">
          <li>{t("gdpr.s4.l1")}</li>
          <li>{t("gdpr.s4.l2")}</li>
          <li>{t("gdpr.s4.l3")}</li>
          <li>{t("gdpr.s4.l4")}</li>
        </ul>

        {/* Kontakt / správce */}
        <H3 icon={<Mail size={18} />}>{t("gdpr.contact.title")}</H3>
        <p className="mb-2">{t("gdpr.contact.body")}</p>

        {/* Změny */}
        <H3 icon={<RefreshCw size={18} />}>{t("gdpr.changes.title")}</H3>
        <p className="mb-2">{t("gdpr.changes.body")}</p>

        <div className="h-2" />
      </div>
    </div>
  );
};

export default GDPRSection;
