// src/components/BlogSection.tsx
import React, { useMemo, useState, useEffect } from "react";

/* ===== Typy ===== */
export type BlogPost = {
  id: string;
  title: string;
  date: string;       // ISO YYYY-MM-DD
  category: string;   // např. WEBDESIGN, GRAFIKA, BRANDING, TISK
  body: string;
};

type BlogSectionProps = {
  posts?: BlogPost[];          // volitelné externí předání
  title?: string;
  initialCategory?: string;
  onNavigate?: (path: string) => void;
};

const LS_KEY = "bbs_posts_v1";

/* ===== Kategorie & NOVINKY ===== */
const CATEGORY_LIST = ["NOVINKY", "WEBDESIGN", "GRAFIKA", "BRANDING", "TISK", "VŠE"] as const;
const NEWS_DAYS = 30;
const isWithinDays = (isoDate: string, days: number) => {
  const t = new Date(isoDate).getTime();
  return Date.now() - t <= days * 24 * 60 * 60 * 1000;
};

/* ===== Mock data (fallback) ===== */
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

/* =========================================================
   Win95 IKONY – inline SVG
   ========================================================= */
type IconProps = { className?: string };
const pixelSvg = { width: 48, height: 48, viewBox: "0 0 24 24", shapeRendering: "crispEdges" as const };

const W95MyComputerIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...pixelSvg} className={className}>
    <rect x="3" y="4" width="18" height="12" fill="#C0C0C0" stroke="#000" />
    <rect x="5" y="6" width="14" height="8" fill="#000080" stroke="#000080" />
    <rect x="8" y="17" width="8" height="2" fill="#808080" stroke="#000" />
    <rect x="7" y="19" width="10" height="2" fill="#C0C0C0" stroke="#000" />
  </svg>
);
const W95NetworkIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...pixelSvg} className={className}>
    <rect x="4" y="4" width="16" height="16" fill="#C0C0C0" stroke="#000" />
    <circle cx="12" cy="12" r="6" fill="#008080" stroke="#000" />
    <rect x="6" y="11" width="12" height="2" fill="#ffffff" />
    <rect x="11" y="6" width="2" height="12" fill="#ffffff" />
  </svg>
);
const W95InboxIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...pixelSvg} className={className}>
    <rect x="3" y="6" width="18" height="12" fill="#C0C0C0" stroke="#000" />
    <polygon points="3,12 9,12 12,15 15,12 21,12 21,18 3,18" fill="#E6E6E6" stroke="#000" />
    <rect x="5" y="7" width="14" height="3" fill="#808080" />
  </svg>
);
const W95BriefcaseIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...pixelSvg} className={className}>
    <rect x="5" y="8" width="14" height="10" fill="#A0522D" stroke="#000" />
    <rect x="9" y="6" width="6" height="2" fill="#C0C0C0" stroke="#000" />
    <rect x="11" y="12" width="2" height="2" fill="#C0C0C0" stroke="#000" />
  </svg>
);
const W95MsnIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...pixelSvg} className={className}>
    <rect x="3" y="4" width="18" height="14" fill="#C0C0C0" stroke="#000" />
    <rect x="5" y="6" width="14" height="8" fill="#FFFFFF" stroke="#000" />
    <polygon points="8,18 10,14 14,14" fill="#C0C0C0" stroke="#000" />
    <rect x="7" y="8" width="10" height="1" fill="#000" />
    <rect x="7" y="10" width="7" height="1" fill="#000" />
  </svg>
);
const W95RecycleIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...pixelSvg} className={className}>
    <rect x="7" y="5" width="10" height="2" fill="#C0C0C0" stroke="#000" />
    <rect x="6" y="7" width="12" height="12" fill="#E6E6E6" stroke="#000" />
    <polygon points="10,10 12,8 14,10 13,10 13,12 11,12 11,10" fill="#008000" />
    <polygon points="14,14 12,16 10,14 11,14 11,12 13,12 13,14" fill="#008000" />
  </svg>
);
const W95FolderIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...pixelSvg} className={className}>
    <polygon points="3,8 9,8 10,6 21,6 21,18 3,18" fill="#FFD37F" stroke="#000" />
    <rect x="3" y="9" width="18" height="9" fill="#FFCC66" stroke="#000" />
  </svg>
);
const W95TextDocIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...pixelSvg} className={className}>
    <rect x="5" y="3" width="14" height="18" fill="#FFFFFF" stroke="#000" />
    <rect x="6" y="6" width="12" height="1" fill="#000080" />
    <rect x="6" y="9" width="10" height="1" fill="#000" />
    <rect x="6" y="12" width="8" height="1" fill="#000" />
    <rect x="6" y="15" width="9" height="1" fill="#000" />
  </svg>
);

/* ===== Win95 okno ===== */
const W95Window: React.FC<{
  title: string;
  onClose?: () => void;
  children: React.ReactNode;
  className?: string;
  rightControls?: React.ReactNode;
}> = ({ title, onClose, children, className, rightControls }) => (
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
        {rightControls}
        <button className="w-6 h-6 bg-[#C0C0C0] border border-black" title="Minimalizovat">–</button>
        <button className="w-6 h-6 bg-[#C0C0C0] border border-black" title="Maximalizovat">□</button>
        <button onClick={onClose} className="w-6 h-6 bg-[#C0C0C0] border border-black" title="Zavřít">×</button>
      </div>
    </div>
    <div className="p-3">{children}</div>
  </div>
);

/* ===== Hodiny ===== */
const Clock: React.FC = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="px-3 py-1 bg-white border border-black text-sm">
      {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
    </div>
  );
};

/* ===== Ikona na ploše ===== */
type DesktopIconProps = {
  label: string;
  Icon: React.FC<IconProps>;
  active?: boolean;
  onClick?: () => void;
};
const DesktopIcon: React.FC<DesktopIconProps> = ({ label, Icon, active, onClick }) => (
  <button onClick={onClick} className="group flex flex-col items-center gap-1 w-24 outline-none focus:outline-none" title={label}>
    <Icon className="w-12 h-12" />
    <span
      className={["px-1 text-[11px] leading-tight text-white text-center", active ? "bg-[#000080]" : ""].join(" ")}
      style={{ textShadow: "1px 1px 0 #000" }}
    >
      {label}
    </span>
  </button>
);

/* ===== Horní menu ===== */
const TOP_ICONS = [
  { label: "HOME",     path: "/",        Icon: W95MyComputerIcon },
  { label: "ABOUT",    path: "/about",   Icon: W95NetworkIcon },
  { label: "SERVICES", path: "/services",Icon: W95InboxIcon },
  { label: "PRICING",  path: "/pricing", Icon: W95BriefcaseIcon },
  { label: "BLOG",     path: "/blog",    Icon: W95MsnIcon },
  { label: "CONTACT",  path: "/contact", Icon: W95RecycleIcon },
  { label: "GDPR",     path: "/gdpr",    Icon: W95FolderIcon },
  { label: "TERMS",    path: "/terms",   Icon: W95TextDocIcon },
] as const;

const DesktopTopMenu: React.FC<{ activePath?: string; onNavigate?: (path: string) => void; }> = ({ activePath = "/blog", onNavigate }) => (
  <div className="absolute left-0 right-0 top-2 z-30 flex justify-center gap-8">
    {TOP_ICONS.map((it) => (
      <DesktopIcon key={it.path} label={it.label} Icon={it.Icon} active={it.path === activePath} onClick={() => onNavigate?.(it.path)} />
    ))}
  </div>
);

/* ===== Notepad detail ===== */
const NotepadModal: React.FC<{ post: BlogPost; onClose: () => void }> = ({ post, onClose }) => {
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/30" aria-modal role="dialog">
      <W95Window title={`Poznámkový blok – ${post.title}`} onClose={onClose} className="w-full max-w-3xl">
        <div className="bg-white border border-black p-2 max-h-[65vh] overflow-auto">
          <pre className="whitespace-pre-wrap font-mono text-sm leading-6">{post.body}</pre>
        </div>
        <div className="mt-2 text-xs bg-[#C0C0C0] border border-black px-2 py-1 select-none">
          Řádek 1, Sloupec 1 | Kódování: ANSI | Naposledy změněno: {new Date(post.date).toLocaleDateString()}
        </div>
      </W95Window>
    </div>
  );
};

/* ===== Jednoduchý editor ===== */
const EditorModal: React.FC<{
  initial?: BlogPost | null;
  onSave: (post: BlogPost) => void;
  onCancel: () => void;
}> = ({ initial, onSave, onCancel }) => {
  const [form, setForm] = useState<BlogPost>(
    initial ?? { id: "", title: "", date: new Date().toISOString().slice(0, 10), category: "", body: "" }
  );
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/30" aria-modal role="dialog">
      <W95Window title={initial ? "Upravit článek" : "Nový článek"} onClose={onCancel} className="w-full max-w-2xl">
        <div className="bg-white border border-black p-3 space-y-2">
          <label className="block text-sm">ID (slug)
            <input className="w-full border border-black px-2 py-1" value={form.id}
              onChange={(e) => setForm({ ...form, id: e.target.value })} placeholder="hello-1999" />
          </label>
          <label className="block text-sm">Název
            <input className="w-full border border-black px-2 py-1" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </label>
          <label className="block text-sm">Datum (YYYY-MM-DD)
            <input type="date" className="border border-black px-2 py-1" value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </label>
          <label className="block text-sm">Kategorie (WEBDESIGN/GRAFIKA/BRANDING/TISK)
            <input className="w-full border border-black px-2 py-1" value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value.toUpperCase() })} placeholder="WEBDESIGN" />
          </label>
          <label className="block text-sm">Text
            <textarea className="w-full h-48 border border-black px-2 py-1 font-mono"
              value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
          </label>
          <div className="flex gap-2 justify-end">
            <button onClick={onCancel} className="px-3 py-1 bg-[#C0C0C0] border border-black">Zrušit</button>
            <button
              onClick={() => onSave(form)}
              className="px-3 py-1 bg-[#C0C0C0] border border-black font-bold"
              disabled={!form.id || !form.title}
              title={!form.id || !form.title ? "Vyplň ID i Název" : ""}
            >
              Uložit
            </button>
          </div>
        </div>
      </W95Window>
    </div>
  );
};

/* ===== Hlavní sekce ===== */
const BlogSection: React.FC<BlogSectionProps> = ({
  posts,
  title = "Průzkumník – BLOG",
  initialCategory,
  onNavigate,
}) => {
  // 1) Načti z localStorage
  const [storePosts, setStorePosts] = useState<BlogPost[] | null>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setStorePosts(JSON.parse(raw));
    } catch {}
  }, []);
  const persist = (next: BlogPost[]) => {
    setStorePosts(next);
    try { localStorage.setItem(LS_KEY, JSON.stringify(next)); } catch {}
  };

  // 2) Zdroje dat: externě předané → localStorage → fallback
  const safePosts = posts ?? storePosts ?? FALLBACK_POSTS;

  // 3) UI stavy
  const [openPost, setOpenPost] = useState<BlogPost | null>(null);
  const categories = CATEGORY_LIST; // pevné pořadí
  const [activeCat, setActiveCat] = useState<string | "VŠE">(
    initialCategory && (categories as readonly string[]).includes(initialCategory.toUpperCase())
      ? initialCategory.toUpperCase()
      : "NOVINKY"
  );

  // 4) Filtr a řazení
  const list = useMemo(() => {
    let base = safePosts;
    if (activeCat === "NOVINKY") {
      base = base.filter(p => isWithinDays(p.date, NEWS_DAYS));
    } else if (activeCat !== "VŠE") {
      base = base.filter(p => (p.category || "").toUpperCase() === activeCat);
    }
    return [...base].sort((a, b) => +new Date(b.date) - +new Date(a.date));
  }, [safePosts, activeCat]);

  // 5) Editor
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "e") {
        e.preventDefault();
        setEditorOpen(v => !v);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const onCreate = () => { setEditing(null); setEditorOpen(true); };
  const onEdit = (p: BlogPost) => { setEditing(p); setEditorOpen(true); };
  const onDelete = (id: string) => {
    if (!confirm("Opravdu smazat tento článek?")) return;
    const next = safePosts.filter((p) => p.id !== id);
    persist(next);
  };
  const onSave = (post: BlogPost) => {
    const exists = safePosts.some((p) => p.id === post.id);
    const next = exists ? safePosts.map((p) => (p.id === post.id ? post : p)) : [...safePosts, post];
    persist(next);
    setEditorOpen(false);
  };

  // Export / Import
  const exportJson = () => {
    const blob = new Blob([JSON.stringify(safePosts, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "posts-export.json"; a.click();
    URL.revokeObjectURL(url);
  };
  const importJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const arr = JSON.parse(String(reader.result)) as BlogPost[];
        if (!Array.isArray(arr)) throw new Error("Invalid JSON");
        persist(arr);
        alert("Import hotov.");
      } catch {
        alert("Chybný JSON.");
      }
    };
    reader.readAsText(file);
  };

  const rightControls = (
    <div className="flex items-center gap-2">
      <button onClick={onCreate} className="px-2 py-0.5 text-xs bg-[#C0C0C0] border border-black">Nový</button>
      <button onClick={() => setEditorOpen(v => !v)} className="px-2 py-0.5 text-xs bg-[#C0C0C0] border border-black">
        {editorOpen ? "Hotovo" : "Edit"}
      </button>
      <button onClick={exportJson} className="px-2 py-0.5 text-xs bg-[#C0C0C0] border border-black">Export</button>
      <label className="px-2 py-0.5 text-xs bg-[#C0C0C0] border border-black cursor-pointer">
        Import
        <input type="file" accept="application/json" className="hidden" onChange={(e) => {
          const f = e.target.files?.[0]; if (f) importJson(f);
          e.currentTarget.value = "";
        }} />
      </label>
      <button
        onClick={() => { if (confirm("Obnovit výchozí příklady?")) { persist(FALLBACK_POSTS); } }}
        className="px-2 py-0.5 text-xs bg-[#C0C0C0] border border-black"
        title="Reset na zabudované ukázky"
      >
        Reset
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-[#008080] flex flex-col">
      {/* Horní ikony */}
      <DesktopTopMenu
        activePath="/blog"
        onNavigate={(path) => { onNavigate ? onNavigate(path) : console.log("navigate to", path); }}
      />

      {/* Plocha + okno s blogem */}
      <div className="flex-1 grid place-items-center p-4 overflow-auto">
        <W95Window
          title={title}
          className="w-full max-w-[1400px] md:max-w-[1600px] max-h-[82vh]"
          rightControls={rightControls}
        >
          <div className="flex flex-col md:flex-row gap-3">
            {/* Složky vlevo */}
            <aside className="md:w-64 bg-[#C0C0C0] border border-black p-2 select-none">
              <div className="font-bold mb-2">Složky</div>
              {categories.map((c) => {
                const src = safePosts;
                const count =
                  c === "NOVINKY" ? src.filter(p => isWithinDays(p.date, NEWS_DAYS)).length :
                  c === "VŠE"     ? src.length :
                  src.filter(p => (p.category || "").toUpperCase() === c).length;

                return (
                  <button
                    key={c}
                    className={`w-full text-left px-2 py-1 flex items-center justify-between gap-2 ${activeCat === c ? "bg-[#E0E0E0]" : "hover:bg-[#EAEAEA]"}`}
                    onClick={() => setActiveCat(c)}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-3 bg-yellow-300 border border-black" />
                      <span className="text-sm">{c}</span>
                    </span>
                    <span className="text-[11px] px-1 border border-black bg-white">{count}</span>
                  </button>
                );
              })}
            </aside>

            {/* Seznam souborů */}
            <section className="flex-1 bg-white border border-black overflow-hidden">
              <div className="grid grid-cols-3 text-sm font-bold bg-[#C0C0C0] border-b border-black">
                <div className="px-3 py-2">Název</div>
                <div className="px-3 py-2">Datum změny</div>
                <div className="px-3 py-2">Kategorie</div>
              </div>
              <ul className="divide-y divide-black/20 max-h-[60vh] overflow-auto text-[15px] leading-6">
                {list.map((p) => (
                  <li
                    key={p.id}
                    tabIndex={0}
                    className={`grid grid-cols-3 ${editorOpen ? "bg-[#FFF]" : "hover:bg-[#E0E0E0]"} cursor-pointer`}
                    onClick={() => (editorOpen ? onEdit(p) : setOpenPost(p))}
                    onKeyDown={(e) => e.key === "Enter" && (editorOpen ? onEdit(p) : setOpenPost(p))}
                    role="button"
                    aria-label={`Otevřít ${p.title}`}
                  >
                    <div className="px-3 py-2 flex items-center gap-2">
                      <span className="w-4 h-4 bg-white border border-black" />
                      <span className="truncate">{p.title}</span>
                    </div>
                    <div className="px-3 py-2">{new Date(p.date).toLocaleDateString()}</div>
                    <div className="px-3 py-2 flex items-center justify-between">
                      <span>{(p.category || "").toUpperCase()}</span>
                      {editorOpen && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onDelete(p.id); }}
                          className="ml-2 px-2 py-0.5 text-xs bg-[#C0C0C0] border border-black"
                          title="Smazat"
                        >
                          Smazat
                        </button>
                      )}
                    </div>
                  </li>
                ))}
                {list.length === 0 && (
                  <li className="px-3 py-3 text-sm italic text-black/70">Žádné články v této složce.</li>
                )}
              </ul>
            </section>
          </div>
        </W95Window>
      </div>

      {/* Spodní lišta */}
      <div className="h-10 bg-[#C0C0C0] border-t border-black flex items-center">
        <button className="ml-2 px-3 py-1 text-sm bg-[#C0C0C0] border border-black shadow-[inset_-1px_-1px_0_#808080,inset_1px_1px_0_#ffffff]">
          Start
        </button>
        <div className="ml-auto mr-2">
          <Clock />
        </div>
      </div>

      {openPost && <NotepadModal post={openPost} onClose={() => setOpenPost(null)} />}
      {editorOpen && (
        <EditorModal
          initial={editing}
          onSave={onSave}
          onCancel={() => { setEditorOpen(false); setEditing(null); }}
        />
      )}
    </div>
  );
};

export default BlogSection;
