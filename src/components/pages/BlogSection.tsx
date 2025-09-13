// src/components/pages/BlogSection.tsx
import React, { useMemo, useState, useEffect } from "react";

/** Props z DesktopWindowManageru */
type Props = {
  t: (key: string) => string;
  embedded?: boolean;           // injektuje DesktopWindowManager
  onRequestClose?: () => void;  // injektuje DesktopWindowManager
};

/* ===== Datové typy ===== */
export type BlogPost = {
  id: string;
  title: string;
  date: string;     // ISO YYYY-MM-DD
  category: string;
  body: string;
};

type BlogJson = { items?: BlogPost[] };

/* ===== Fallback demo příspěvky ===== */
const FALLBACK_POSTS: BlogPost[] = [
  {
    id: "hello-1999",
    title: "PRVNI-ZAZNAM.TXT",
    date: "1999-08-28",
    category: "NOVINKY",
    body:
      "Ahoj světe!\n\nTohle je náš retro blog ve stylu Windows 95.\nText je prostý, čitelný a bez zbytečných vrstev.\n\n— Bits&Bytes",
  },
  {
    id: "geocities",
    title: "GEO-CITIES.TXT",
    date: "1998-05-12",
    category: "WEBDESIGN",
    body:
      "Pamatujete na blikající gify a guestbook?\nDnes jen čistý text v poznámkovém bloku.\n\nTip: Nechte obsah vést, design jen rámuje zážitek.",
  },
  {
    id: "bbs-term",
    title: "BBS-NOSTALGIE.TXT",
    date: "1997-11-03",
    category: "GRAFIKA",
    body:
      "BBS, telnet a šum modemu.\nČlánky jako soubory, složky jako kategorie.\n\nENTER: otevřít, ESC: zavřít.",
  },
];

/* ===== Pomocné funkce ===== */
function detectLang(t: (k: string) => string): "cs" | "en" {
  const val = (t("lang") || "").toLowerCase();
  return val === "en" ? "en" : "cs";
}

function normalizeItems(json: BlogJson | undefined): BlogPost[] {
  return (json?.items ?? []).map((p, idx) => ({
    id: p.id || `post-${idx + 1}`,
    title: p.title || `UNTITLED-${idx + 1}.TXT`,
    date: p.date || new Date().toISOString().slice(0, 10),
    category: (p.category || "NOVINKY").toUpperCase(),
    body: p.body || "",
  }));
}

/* ===== Win95 mini okno pro Notepad modal ===== */
const Win95ModalFrame: React.FC<{
  title: string;
  onClose?: () => void;
  children: React.ReactNode;
  className?: string;
}> = ({ title, onClose, children, className }) => (
  <div
    className={[
      "relative border border-black bg-[#C0C0C0]",
      "shadow-[inset_-1px_-1px_0_#808080,inset_1px_1px_0_#ffffff]",
      className || "",
    ].join(" ")}
    role="dialog"
    aria-label={title}
  >
    <div className="flex items-center justify-between bg-[#000080] text-white px-2 py-1 select-none">
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 bg-white border border-black" aria-hidden />
        <span className="text-sm font-bold tracking-tight">{title}</span>
      </div>
      <div className="flex items-center gap-2">
        <button className="w-6 h-6 bg-[#C0C0C0] border border-black" title="Minimalizovat">–</button>
        <button className="w-6 h-6 bg-[#C0C0C0] border border-black" title="Maximalizovat">□</button>
        <button onClick={onClose} className="w-6 h-6 bg-[#C0C0C0] border border-black" title="Zavřít">×</button>
      </div>
    </div>
    <div className="p-3">{children}</div>
  </div>
);

/* ===== Notepad detail ===== */
const NotepadModal: React.FC<{ t: (k: string) => string; post: BlogPost; onClose: () => void }> = ({ t, post, onClose }) => {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  const title = `${t("blog95.notepadTitle") || "Poznámkový blok"} – ${post.title}`;
  const changed = new Date(post.date).toLocaleDateString();

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/30" aria-modal role="dialog">
      <div
        className="relative border border-black bg-[#C0C0C0]"
        style={{
          width: isMaximized ? "90%" : "100%",
          height: isMaximized ? "90%" : "auto",
          maxWidth: isMaximized ? "95%" : "48rem",
          maxHeight: isMaximized ? "90%" : "65vh",
        }}
      >
        {/* Titlebar (stejné jako parent okno) */}
        <div
          className="flex items-center justify-between text-white px-2 h-6 select-none"
          style={{ background: "#253A8A" }}
        >
          <span className="font-bold text-sm tracking-wide">{title}</span>
          <div className="flex gap-[3px]">
            {/* Minimize = prostě zavřít */}
            <button
              onClick={onClose}
              className="w-7 h-5 grid place-items-center bg-[#bdbdbd] border border-black hover:bg-[#a0a0a0]"
            >
              –
            </button>
            {/* Maximize / Restore */}
            <button
              onClick={() => setIsMaximized(!isMaximized)}
              className="w-7 h-5 grid place-items-center bg-[#bdbdbd] border border-black hover:bg-[#a0a0a0]"
            >
              {isMaximized ? "❐" : "□"}
            </button>
            {/* Close */}
            <button
              onClick={onClose}
              className="w-7 h-5 grid place-items-center bg-[#bdbdbd] border border-black hover:bg-[#a0a0a0]"
            >
              ×
            </button>
          </div>
        </div>

        {/* Obsah */}
        <div className="bg-white border border-black p-2 overflow-auto" style={{ height: isMaximized ? "calc(100% - 2rem)" : "auto" }}>
          <pre className="whitespace-pre-wrap font-mono text-sm leading-6">{post.body}</pre>
        </div>
        <div className="mt-1 text-xs bg-[#C0C0C0] border-t border-black px-2 py-1 select-none">
          {t("blog95.statusLine") || "Řádek 1, Sloupec 1 | Kódování: ANSI | Naposledy změněno:"} {changed}
        </div>
      </div>
    </div>
  );
};

/* ===== Hlavní sekce ===== */
const BlogSection: React.FC<Props> = ({ t }) => {
  const lang = useMemo(() => detectLang(t), [t]);
  const [posts, setPosts] = useState<BlogPost[]>(FALLBACK_POSTS);

  // Dynamický import podle jazyka
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const mod: BlogJson =
          lang === "cs"
            ? await import("../../data/i18n/cs.blog.json")
            : await import("../../data/i18n/en.blog.json");
        if (active) {
          const items = normalizeItems(mod);
          setPosts((items.length ? items : FALLBACK_POSTS).sort(
            (a, b) => +new Date(b.date) - +new Date(a.date)
          ));
        }
      } catch {
        if (active) setPosts(FALLBACK_POSTS);
      }
    }
    load();
    return () => { active = false; };
  }, [lang]);

  const [openPost, setOpenPost] = useState<BlogPost | null>(null);

  return (
    <div className="w-full h-full p-3">
      <div className="w-full h-full flex flex-col md:flex-row gap-3">
        {/* VLEVO: Ikony */}
        <aside className="md:w-64 bg-[#C0C0C0] border border-black p-2 select-none">
          <div className="h-full overflow-auto">
            <ul className="flex flex-col items-center gap-4">
              {posts.map((p) => (
                <li key={p.id} className="w-full flex justify-center">
                  <button
                    onClick={() => setOpenPost(p)}
                    title={p.title}
                    aria-label={`Otevřít ${p.title}`}
                    className="group flex flex-col items-center focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <span
                      className="relative w-12 h-12 bg-white border border-black shadow-[inset_-1px_-1px_0_#808080,inset_1px_1px_0_#ffffff] group-hover:translate-y-[-1px] transition-transform"
                      aria-hidden
                    >
                      <span className="absolute inset-x-0 top-0 h-2 bg-[#0000AA]" />
                      <span className="absolute left-1 right-1 top-3 h-px bg-black/20" />
                      <span className="absolute left-1 right-1 top-[18px] h-px bg-black/20" />
                      <span className="absolute left-1 right-1 top-[24px] h-px bg-black/20" />
                      <span className="absolute left-1 right-1 top-[30px] h-px bg-black/20" />
                    </span>
                    <span className="mt-1 w-[92px] text-[11px] leading-4 text-center whitespace-normal break-words group-hover:bg-[#E0E0E0] border border-transparent group-hover:border-black px-1 py-0.5">
                      {p.title}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* VPRAVO: Tabulka */}
        <section className="flex-1 bg-white border border-black overflow-hidden">
          <div className="grid grid-cols-3 text-sm font-bold bg-[#C0C0C0] border-b border-black">
            <div className="px-3 py-2">{t("blog95.col.name") || "Název"}</div>
            <div className="px-3 py-2">{t("blog95.col.modified") || "Datum změny"}</div>
            <div className="px-3 py-2">{t("blog95.col.category") || "Kategorie"}</div>
          </div>
          <ul className="divide-y divide-black/20 max-h-[calc(100%-40px)] overflow-auto text-[15px] leading-6">
            {posts.map((p) => (
              <li
                key={p.id}
                tabIndex={0}
                className="grid grid-cols-3 hover:bg-[#E0E0E0] cursor-pointer"
                onClick={() => setOpenPost(p)}
                onKeyDown={(e) => e.key === "Enter" && setOpenPost(p)}
                role="button"
                aria-label={`Otevřít ${p.title}`}
              >
                <div className="px-3 py-2 flex items-center gap-2">
                  <span className="relative w-4 h-4 bg-white border border-black">
                    <span className="absolute inset-x-0 top-0 h-1 bg-[#0000AA]" />
                  </span>
                  <span className="truncate">{p.title}</span>
                </div>
                <div className="px-3 py-2">{new Date(p.date).toLocaleDateString()}</div>
                <div className="px-3 py-2">{(p.category || "").toUpperCase()}</div>
              </li>
            ))}
            {posts.length === 0 && (
              <li className="px-3 py-3 text-sm italic text-black/70">
                {t("blog95.empty") || "Žádné články."}
              </li>
            )}
          </ul>
        </section>
      </div>

      {openPost && <NotepadModal t={t} post={openPost} onClose={() => setOpenPost(null)} />}
    </div>
  );
};

export default BlogSection;
