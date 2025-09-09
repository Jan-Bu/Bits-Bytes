import React from "react";

type Props = {
  t: (key: string) => string;
  embedded?: boolean;           // injektuje DesktopWindowManager
  onRequestClose?: () => void;  // injektuje DesktopWindowManager
};

const TermsSection: React.FC<Props> = ({ t, embedded }) => {
  return (
    <div
      className="w-full h-full overflow-auto bg-white"
      role="document"
      aria-label={t("terms.title")}
    >

      <div className="max-w-[1100px] mx-auto px-8 py-8 text-[20px] leading-[2.8] text-neutral-900 text-center">
        {/* meta řádek */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-600 mb-4">
          <span>{t("terms.meta.version")}</span>
          <span className="opacity-60">•</span>
          <span>{t("terms.meta.updated")}</span>
        </div>

        {/* úvod */}
        <h2 className="text-[28px] font-semibold text-[#253A8A] tracking-wide mb-2">
          {t("terms.intro.title")}
        </h2>
        <p className="mb-4">{t("terms.intro.body")}</p>

        <hr className="my-5 border-t border-dashed border-neutral-300" />

        {/* 1 */}
        <h3 className="mt-6 mb-2 text-[20px] text-[#253A8A] font-semibold tracking-wide">{t("terms.s1.title")}</h3>
        <p className="mb-2">{t("terms.s1.body")}</p>
        <ul className="list-none pl-5 space-y-1 marker:text-neutral-500">
          <li>{t("terms.s1.l1")}</li>
          <li>{t("terms.s1.l2")}</li>
          <li>{t("terms.s1.l3")}</li>
        </ul>

        {/* 2 */}
        <h3 className="mt-6 mb-2 text-[20px] text-[#253A8A] font-semibold tracking-wide">{t("terms.s2.title")}</h3>
        <p className="mb-2">{t("terms.s2.body")}</p>
        <ul className="list-none pl-5 space-y-1 marker:text-neutral-500">
          <li>{t("terms.s2.l1")}</li>
          <li>{t("terms.s2.l2")}</li>
          <li>{t("terms.s2.l3")}</li>
        </ul>

        {/* 3 */}
        <h3 className="mt-6 mb-2 text-[20px] text-[#253A8A] font-semibold tracking-wide">{t("terms.s3.title")}</h3>
        <p className="mb-2">{t("terms.s3.body")}</p>
        <ul className="list-none pl-5 space-y-1 marker:text-neutral-500">
          <li>{t("terms.s3.l1")}</li>
          <li>{t("terms.s3.l2")}</li>
          <li>{t("terms.s3.l3")}</li>
        </ul>

        {/* 4 */}
        <h3 className="mt-6 mb-2 text-[20px] text-[#253A8A] font-semibold tracking-wide">{t("terms.s4.title")}</h3>
        <p className="mb-2">{t("terms.s4.body")}</p>
        <ul className="list-none pl-5 space-y-1 marker:text-neutral-500">
          <li>{t("terms.s4.l1")}</li>
          <li>{t("terms.s4.l2")}</li>
          <li>{t("terms.s4.l3")}</li>
        </ul>

        {/* 5 */}
        <h3 className="mt-6 mb-2 text-[20px] text-[#253A8A] font-semibold tracking-wide">{t("terms.s5.title")}</h3>
        <p className="mb-2">{t("terms.s5.body")}</p>
        <ul className="list-none pl-5 space-y-1 marker:text-neutral-500">
          <li>{t("terms.s5.l1")}</li>
          <li>{t("terms.s5.l2")}</li>
          <li>{t("terms.s5.l3")}</li>
        </ul>

        {/* 6 */}
        <h3 className="mt-6 mb-2 text-[20px] text-[#253A8A] font-semibold tracking-wide">{t("terms.s6.title")}</h3>
        <p className="mb-2">{t("terms.s6.body")}</p>
        <ul className="list-none pl-5 space-y-1 marker:text-neutral-500">
          <li>{t("terms.s6.l1")}</li>
          <li>{t("terms.s6.l2")}</li>
          <li>{t("terms.s6.l3")}</li>
        </ul>

        {/* 7 */}
        <h3 className="mt-6 mb-2 text-[20px] text-[#253A8A] font-semibold tracking-wide">{t("terms.s7.title")}</h3>
        <p className="mb-2">{t("terms.s7.body")}</p>
        <ul className="list-none pl-5 space-y-1 marker:text-neutral-500">
          <li>{t("terms.s7.l1")}</li>
          <li>{t("terms.s7.l2")}</li>
          <li>{t("terms.s7.l3")}</li>
        </ul>

        {/* 8 */}
        <h3 className="mt-6 mb-2 text-[20px] text-[#253A8A] font-semibold tracking-wide">{t("terms.s8.title")}</h3>
        <p className="mb-2">{t("terms.s8.body")}</p>
        <ul className="list-none pl-5 space-y-1 marker:text-neutral-500">
          <li>{t("terms.s8.l1")}</li>
          <li>{t("terms.s8.l2")}</li>
          <li>{t("terms.s8.l3")}</li>
        </ul>

        {/* 9 */}
        <h3 className="mt-6 mb-2 text-[20px] text-[#253A8A] font-semibold tracking-wide">{t("terms.s9.title")}</h3>
        <p className="mb-2">{t("terms.s9.body")}</p>
        <ul className="list-none pl-5 space-y-1 marker:text-neutral-500">
          <li>{t("terms.s9.l1")}</li>
          <li>{t("terms.s9.l2")}</li>
          <li>{t("terms.s9.l3")}</li>
        </ul>

        {/* 10 */}
        <h3 className="mt-6 mb-2 text-[20px] text-[#253A8A] font-semibold tracking-wide">{t("terms.s10.title")}</h3>
        <p className="mb-2">{t("terms.s10.body")}</p>
        <ul className="list-none pl-5 space-y-1 marker:text-neutral-500">
          <li>{t("terms.s10.l1")}</li>
          <li>{t("terms.s10.l2")}</li>
          <li>{t("terms.s10.l3")}</li>
        </ul>

        {/* 11 */}
        <h3 className="mt-6 mb-2 text-[20px] text-[#253A8A] font-semibold tracking-wide">{t("terms.s11.title")}</h3>
        <p className="mb-2">{t("terms.s11.body")}</p>

        {/* 12 */}
        <h3 className="mt-6 mb-2 text-[20px] text-[#253A8A] font-semibold tracking-wide">{t("terms.s12.title")}</h3>
        <p className="mb-2">{t("terms.s12.body")}</p>

        {/* 13 */}
        <h3 className="mt-6 mb-2 text-[20px] text-[#253A8A] font-semibold tracking-wide">{t("terms.s13.title")}</h3>
        <p className="mb-2">{t("terms.s13.body")}</p>

        {/* spodek dokumentu */}
        <div className="h-2" />
      </div>
    </div>
  );
};

export default TermsSection;
