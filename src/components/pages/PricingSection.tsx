import React from "react";

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

const PricingSection: React.FC<PricingSectionProps> = ({ t }) => {
  const title = t("pricing.intro.title"); // např. "Pricing.txt"
  const text = t("pricing.text");         // vícero odstavců s \n\n

  return (
    <section className="min-h-screen w-full bg-[#bdbdbd] text-black select-none">
      {/* Titlebar */}
      <div className="h-[18px] bg-[#253A8A] flex items-center justify-between px-1 text-white text-[11px] font-bold">
        <div className="flex items-center gap-1">
          <NotepadIcon />
          <span>{title}</span>
        </div>
        <WindowControls />
      </div>

      {/* Menubar */}
      <nav className="h-[20px] bg-[#bdbdbd] px-1 flex items-center gap-3 text-[11px]">
        {["File", "Edit", "Search", "Help"].map((m) => (
          <button
            key={m}
            className="px-1 py-0 hover:bg-[#0080ff] hover:text-white focus:outline-none"
          >
            {m}
          </button>
        ))}
      </nav>

      {/* Main area */}
      <div className="relative h-[calc(100vh-38px)] flex">
        {/* Left sidebar */}
        <div
          className="w-[20px] bg-[#bdbdbd]"
          style={{ boxShadow: "inset -1px 0 #7B7B7B, inset 1px 0 #E6E6E6" }}
        />

        {/* Content area */}
        <div className="flex-1 relative">
          {/* White text area (pozadí) */}
          <div
            className="absolute top-0 left-0 right-[20px] bottom-[20px] bg-white border border-black"
            style={{ boxShadow: "inset 1px 1px #7B7B7B, inset -1px -1px #E6E6E6" }}
          />

          {/* Centered content overlay */}
          <div className="absolute top-0 left-0 right-[20px] bottom-[20px] flex items-center justify-center p-8 overflow-auto">
            <div className="text-center max-w-3xl">
              <h1 className="text-3xl md:text-6xl font-bold mb-6 text-yellow-500 font-jersey">
                {title}
              </h1>
              <p className="text-lg md:text-4xl leading-relaxed whitespace-pre-line font-jersey tracking-wide md:tracking-widest">
                {text}
              </p>
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
