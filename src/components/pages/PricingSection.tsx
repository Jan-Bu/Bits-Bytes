// src/components/pricing/PricingSection.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";

interface PricingSectionProps {
  t: (key: string) => string;
  embedded?: boolean;
}

/** zvýraznění slov */
function highlightWords(text: string, words: string[], className: string) {
  const escaped = [...words]
    .sort((a, b) => b.length - a.length)
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const splitRe = new RegExp(`(${escaped.join("|")})`, "gi");
  const isHitRe = new RegExp(`^(?:${escaped.join("|")})$`, "i");

  return text.split(splitRe).map((part, i) =>
    isHitRe.test(part)
      ? <span key={i} className={className}>{part}</span>
      : <React.Fragment key={i}>{part}</React.Fragment>
  );
}

/** Hook pro fit scale */
function useFitScale(
  parentRef: React.RefObject<HTMLElement>,
  contentRef: React.RefObject<HTMLElement>,
  deps: React.DependencyList = []
) {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const parent = parentRef.current, content = contentRef.current;
    if (!parent || !content) return;
    const compute = () => {
      const prev = content.style.transform;
      content.style.transform = "scale(1)";
      const pr = parent.getBoundingClientRect();
      const cr = content.getBoundingClientRect();
      const s = Math.min(1, pr.width / cr.width, pr.height / cr.height);
      content.style.transform = prev;
      setScale(s);
    };
    const ro = new ResizeObserver(compute);
    ro.observe(parent); ro.observe(content);
    compute();
    window.addEventListener("resize", compute);
    return () => { ro.disconnect(); window.removeEventListener("resize", compute); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return scale;
}

const PricingSection: React.FC<PricingSectionProps> = ({ t, embedded = true }) => {
  const [themeColor, setThemeColor] = useState("#253A8A");
  const title = t("pricing.intro.title");
  const text = t("pricing.text");
  const highlighted = useMemo(
    () => highlightWords(text, ["unique", "custom", "unikátní", "na míru"], "text-[var(--theme-color)]"),
    [text, themeColor]
  );

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const scale = useFitScale(viewportRef, contentRef, [title, text]);

  return (
    <section
      className="w-full h-full text-black select-none bg-[#bdbdbd]"
      style={{ ["--theme-color" as string]: themeColor } as React.CSSProperties}
    >
      <div className="relative w-full h-full">
        {/* Horní šedá lišta */}
        <div
          className="h-[20px] w-full bg-[#bdbdbd]"
          style={{ boxShadow: " inset 0 -1px #7B7B7B" }}
        />

        {/* Záplata pro roh */}
        <div className="absolute top-0 left-0 w-[20px] h-[20px] bg-[#bdbdbd] z-20" />

        {/* Flex řádek */}
        <div className="relative w-full h-[calc(100%-20px)] flex">
          {/* Levý sloupek */}
          <div
            className="w-[16px] sm:w-[18px] md:w-[20px] bg-[#bdbdbd] relative z-10"
            style={{ boxShadow: "inset -1px 0 #7B7B7B" }}
          />

          {/* Pravý panel */}
          <div className="flex-1 relative">
            {/* bílý viewport */}
            <div
              className="absolute top-0 left-0 right-[20px] bottom-[20px] bg-white border border-black overflow-hidden"
              style={{ boxShadow: "inset 1px 1px #7B7B7B, inset -1px -1px #E6E6E6" }}
              ref={viewportRef}
            />

            {/* obsah */}
            <div className="absolute top-0 left-0 right-[20px] bottom-[20px] flex items-center justify-center">
              <div
                ref={contentRef}
                className="text-center max-w-3xl px-4 sm:px-6 md:px-8"
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: "center center",
                  transition: "transform 120ms ease-out",
                }}
              >
                <h1
                  className="font-jersey font-bold mb-4 sm:mb-6"
                  style={{ color: "var(--theme-color)", fontSize: "clamp(20px, 5.5vw, 64px)" }}
                >
                  {title}
                </h1>
                <p
                  className="font-jersey tracking-wide md:tracking-widest"
                  style={{ fontSize: "clamp(14px, 2.3vw, 40px)", lineHeight: 1.25, whiteSpace: "pre-line" }}
                >
                  {highlighted}
                </p>
              </div>
            </div>

            {/* Paleta barev */}
            <div className="absolute top-2 sm:top-1/2 sm:-translate-y-1/2 left-[4px] sm:left-[8px] md:left-[12px] z-50">
              <div
                className="flex flex-col gap-[3px] sm:gap-[4px] border border-black px-[3px] py-[2px] bg-[#bdbdbd]"
                style={{ boxShadow: "inset 1px 1px #fff, inset -1px -1px #7B7B7B" }}
              >
                {["#253A8A", "#0B6623", "#5A189A", "#C2571A"].map((c) => {
                  const selected = c.toLowerCase() === themeColor.toLowerCase();
                  return (
                    <button
                      key={c}
                      onClick={() => setThemeColor(c)}
                      className="border border-black w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6"
                      style={{
                        backgroundColor: c,
                        boxShadow: selected
                          ? "inset 0 0 0 2px #fff, inset 2px 2px 3px rgba(0,0,0,0.6)"
                          : "inset 2px 2px 3px rgba(0,0,0,0.6)",
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Scroll bary */}
            {/* Vertikální */}
            <div
              className="absolute right-0 top-0 bottom-[20px] w-[20px] bg-[#bdbdbd] flex flex-col"
              style={{ boxShadow: "inset 2px 0 #E6E6E6, inset -1px 0 #7B7B7B" }}
            >
              {/* Up arrow */}
              <div
                className="grid place-items-center h-[18px] bg-[#bdbdbd] border-b border-[#808080]"
                style={{ boxShadow: "inset 2px 2px #E6E6E6, inset -1px -1px #7B7B7B" }}
              >
                <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[5px] border-b-black" />
              </div>
              <div className="flex-1 relative bg-[#c0c0c0]" />
              {/* Down arrow */}
              <div
                className="grid place-items-center h-[18px] bg-[#bdbdbd] border-t border-[#808080]"
                style={{ boxShadow: "inset 2px 2px #E6E6E6, inset -1px -1px #7B7B7B" }}
              >
                <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-black" />
              </div>
            </div>

            {/* Horizontální */}
            <div
              className="absolute left-0 right-[20px] bottom-0 h-[20px] bg-[#bdbdbd] flex"
              style={{ boxShadow: "inset 0 2px #E6E6E6, inset 0 -1px #7B7B7B" }}
            >
              {/* Left arrow */}
              <div
                className="grid place-items-center w-[18px] bg-[#bdbdbd] border-r border-[#808080]"
                style={{ boxShadow: "inset 2px 2px #E6E6E6, inset 0 -1px #7B7B7B" }}
              >
                <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-r-[5px] border-r-black" />
              </div>
              <div className="flex-1 relative bg-[#c0c0c0]" />
              {/* Right arrow */}
              <div
                className="grid place-items-center w-[18px] bg-[#bdbdbd] border-l border-[#808080]"
                style={{ boxShadow: "inset 2px 2px #E6E6E6, inset -1px -1px #7B7B7B" }}
              >
                <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[5px] border-l-black" />
              </div>
            </div>

            {/* Grip */}
            <div
              className="absolute right-0 bottom-0 w-[20px] h-[20px] bg-[#bdbdbd]"
              style={{
                borderTop: "1px solid black",
                borderLeft: "1px solid black",
                boxShadow: "inset 1px 1px #E6E6E6, inset -1px -1px #7B7B7B",
                backgroundImage:
                  "repeating-linear-gradient(135deg, #000 0, #000 1px, transparent 1px, transparent 3px)",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
