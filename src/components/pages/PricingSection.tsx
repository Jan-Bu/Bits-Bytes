import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";

interface PricingSectionProps {
  t: (key: string) => string;
}

/** Notepad ikona v Win95 stylu */
const NotepadIcon: React.FC = () => (
  <div
    className="w-4 h-4 bg-white border border-black relative"
    style={{ boxShadow: "inset 1px 1px #7B7B7B, inset -1px -1px #E6E6E6" }}
  >
    <div className="absolute -top-[2px] left-[2px] right-[2px] h-[3px] grid grid-cols-4 gap-[2px]">
      <div className="bg-black" /><div className="bg-black" />
      <div className="bg-black" /><div className="bg-black" />
    </div>
    <div className="absolute top-[5px] left-[2px] right-[2px] h-[1px] bg-black" />
    <div className="absolute top-[8px] left-[2px] right-[3px] h-[1px] bg-black" />
    <div className="absolute top-[11px] left-[2px] right-[5px] h-[1px] bg-black" />
  </div>
);

/** Window control buttons */
const WindowControls: React.FC = () => (
  <div className="flex gap-[2px]">
    {/* Minimize */}
    <button className="w-[16px] h-[14px] bg-[#bdbdbd] border border-black grid place-items-center hover:bg-[#a0a0a0]">
      <div className="w-[6px] h-[2px] bg-black" />
    </button>
    {/* Maximize */}
    <button className="w-[16px] h-[14px] bg-[#bdbdbd] border border-black grid place-items-center hover:bg-[#a0a0a0]">
      <div className="w-[8px] h-[6px] border border-black border-b-[2px]" />
    </button>
    {/* Close */}
    <button className="w-[16px] h-[14px] bg-[#bdbdbd] border border-black grid place-items-center hover:bg-[#a0a0a0]">
      <div className="relative w-[8px] h-[8px]">
        <div className="absolute inset-0 rotate-45 w-[2px] h-[8px] bg-black left-[3px]" />
        <div className="absolute inset-0 -rotate-45 w-[2px] h-[8px] bg-black left-[3px]" />
      </div>
    </button>
  </div>
);

const menuItems = [
  { label: "Home", to: "/" },
  { label: "About Us", to: "/about" },
  { label: "Services", to: "/services" },
  { label: "Contacts", to: "/contacts" },
  { label: "Blog", to: "/blog" },
  { label: "Terms", to: "/terms" },
  { label: "GDPR", to: "/gdpr" },
];

/** util: zvýrazní zadaná slova bez HTML v překladech */
function highlightWords(text: string, words: string[], className: string) {
  const escaped = [...words].sort((a, b) => b.length - a.length).map((w) =>
    w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  );
  const re = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(re);

  return parts.map((part, i) =>
    re.test(part) ? (
      <span key={i} className={className}>{part}</span>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
}

const PricingSection: React.FC<PricingSectionProps> = ({ t }) => {
  const [themeColor, setThemeColor] = useState("#253A8A"); // výchozí modrá

  const title = t("pricing.intro.title"); // "Pricing.txt"
  const text = t("pricing.text");

  const highlighted = useMemo(
    () => highlightWords(text, ["websites", "website"], "text-[var(--theme-color)]"),
    [text, themeColor]
  );

  return (
    <section
      className="min-h-screen w-full bg-[#bdbdbd] text-black select-none"
      style={{ ["--theme-color" as any]: themeColor }}
    >
      {/* Titlebar (větší text na větších šířkách) */}
      <div
        className="h-[22px] md:h-[24px] flex items-center justify-between px-2 text-white"
        style={{ backgroundColor: "var(--theme-color)" }}
      >
        <div className="flex items-center gap-2">
          <NotepadIcon />
          <span className="text-x sm:text-sm md:text-base font-bold">{title}</span>
        </div>
        <WindowControls />
      </div>

      {/* Menubar – na malých šířkách je horizontálně scrollovatelný */}
      <nav className="h-[22px] md:h-[25px] bg-[#bdbdbd] px-1 flex items-center gap-3 text-[12px] sm:text-[14px] md:text-[20px] leading-none overflow-x-auto whitespace-nowrap">
        {menuItems.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className="inline-block px-[3px] py-[1px] hover:bg-[var(--theme-color)] hover:text-white focus-visible:bg-[var(--theme-color)] focus-visible:text-white"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Main area */}
      <div className="relative h-[calc(100vh-47px)] md:h-[calc(100vh-49px)] flex">
        {/* Left sidebar (šířka roste s breakpointy) */}
        <div
          className="w-[16px] sm:w-[18px] md:w-[20px] bg-[#bdbdbd] relative"
          style={{ boxShadow: "inset -1px 0 #7B7B7B, inset 1px 0 #E6E6E6" }}
        />

        {/* Content area */}
        <div className="flex-1 relative">
          {/* White text area */}
          <div
            className="absolute top-0 left-0 right-[20px] bottom-[20px] bg-white border border-black"
            style={{ boxShadow: "inset 1px 1px #7B7B7B, inset -1px -1px #E6E6E6" }}
          />

          {/* Centered content overlay */}
          <div
            className={
              // přidán levý padding pro odsazení textu od palety (nejmenší nutná změna)
              "absolute top-0 left-0 right-[20px] bottom-[20px] flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-auto pl-10 sm:pl-14 md:pl-16"
            }
          >
            <div className="text-center max-w-3xl">
              <h1
                className="text-2xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 font-jersey"
                style={{ color: "var(--theme-color)" }}
              >
                {title}
              </h1>

              <p className="text-base sm:text-xl md:text-2xl lg:text-4xl leading-relaxed whitespace-pre-line font-jersey tracking-wide md:tracking-widest">
                {highlighted}
              </p>
            </div>
          </div>

          {/* PALETA – vlevo v obdélníku, centrovaná na výšku, velikost dle breakpointů */}
          <div className="absolute top-1/2 -translate-y-1/2 left-[4px] sm:left-[8px] md:left-[12px] z-50">
            <div
              className="flex flex-col gap-[3px] sm:gap-[4px] border border-black px-[3px] py-[2px] sm:px-[4px] sm:py-[3px] bg-[#bdbdbd]"
              style={{ boxShadow: "inset 1px 1px #FFFFFF, inset -1px -1px #7B7B7B" }}
            >
              {["#253A8A", "#0B6623", "#5A189A", "#C2571A"].map((c) => {
                const selected = c.toLowerCase() === themeColor.toLowerCase();
                return (
                  <button
                    key={c}
                    aria-label={`Set theme ${c}`}
                    onClick={() => setThemeColor(c)}
                    className="border border-black w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-8 lg:h-8"
                    style={{
                      backgroundColor: c,
                      boxShadow: selected ? "inset 0 0 0 2px #ffffff" : undefined,
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Vertical scrollbar (dekor) */}
          <div
            className="absolute top-0 right-0 bottom-[20px] w-[20px] bg-[#bdbdbd] flex flex-col"
            style={{ boxShadow: "inset 2px 0 #E6E6E6, inset -1px 0 #7B7B7B" }}
          >
            <button
              className="h-[18px] bg-[#bdbdbd] grid place-items-center hover:bg-[#d4d4d4] transition-colors border-b border-[#808080]"
              style={{ boxShadow: "inset 2px 2px #E6E6E6, inset -1px -1px #7B7B7B" }}
            >
              <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[5px] border-b-black" />
            </button>
            <div
              className="flex-1 relative bg-[#c0c0c0] overflow-hidden"
              style={{ boxShadow: "inset 1px 1px #7B7B7B, inset -1px -1px #E6E6E6" }}
            >
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(45deg, transparent, transparent 2px, #808080 2px, #808080 4px)",
                }}
              />
              <div
                className="absolute top-[10px] left-[1px] right-[1px] h-[50px] bg-[#bdbdbd]"
                style={{
                  boxShadow:
                    "2px 2px #7B7B7B, -1px -1px #E6E6E6, inset 1px 1px #FFFFFF",
                }}
              />
            </div>
            <button
              className="h-[18px] bg-[#bdbdbd] grid place-items-center hover:bg-[#d4d4d4] transition-colors border-t border-[#808080]"
              style={{ boxShadow: "inset 2px 2px #E6E6E6, inset -1px -1px #7B7B7B" }}
            >
              <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-black" />
            </button>
          </div>

          {/* Horizontal scrollbar (dekor) */}
          <div
            className="absolute left-0 right-[20px] bottom-0 h-[20px] bg-[#bdbdbd] flex"
            style={{ boxShadow: "inset 0 2px #E6E6E6, inset 0 -1px #7B7B7B" }}
          >
            <button
              className="w-[18px] bg-[#bdbdbd] grid place-items-center hover:bg-[#d4d4d4] transition-colors border-r border-[#808080]"
              style={{ boxShadow: "inset 2px 2px #E6E6E6, inset 0 -1px #7B7B7B" }}
            >
              <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-r-[5px] border-r-black" />
            </button>
            <div
              className="flex-1 relative bg-[#c0c0c0] overflow-hidden"
              style={{ boxShadow: "inset 1px 1px #7B7B7B, inset -1px -1px #E6E6E6" }}
            >
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(45deg, transparent, transparent 2px, #808080 2px, #808080 4px)",
                }}
              />
              <div
                className="absolute left-[10px] top-[1px] bottom-[1px] w-[80px] bg-[#bdbdbd]"
                style={{
                  boxShadow:
                    "2px 2px #7B7B7B, -1px -1px #E6E6E6, inset 1px 1px #FFFFFF",
                }}
              />
            </div>
            <button
              className="w-[18px] bg-[#bdbdbd] grid place-items-center hover:bg-[#d4d4d4] transition-colors border-l border-[#808080]"
              style={{ boxShadow: "inset 2px 2px #E6E6E6, inset -1px -1px #7B7B7B" }}
            >
              <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[5px] border-l-black" />
            </button>
          </div>

          {/* Corner grip */}
          <div
            className="absolute right-0 bottom-0 w-[20px] h-[20px] bg-[#bdbdbd] border-t border-l border-black"
            style={{
              boxShadow: "inset 1px 1px #E6E6E6, inset -1px -1px #7B7B7B",
              backgroundImage:
                "repeating-linear-gradient(135deg, #000 0, #000 1px, transparent 1px, transparent 3px)",
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
