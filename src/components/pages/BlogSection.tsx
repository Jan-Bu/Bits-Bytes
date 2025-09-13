// src/components/pages/BlogSection.tsx
import React, { useMemo, useState, useEffect } from "react";

/** Props z DesktopWindowManageru */
type Props = {
  t: (key: string) => string;
};

/* ===== Datové typy ===== */
export type BlogPost = {
  id: string;
  title: string;   // souborový název (např. PRVNI-ZAZNAM.TXT)
  date: string;    // ISO YYYY-MM-DD
  category: string;
  body: string;
  /** volitelný SEO popisek */
  description?: string;
};

type BlogJson = { items?: Array<Partial<BlogPost> & { seoDescription?: string }> };

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
  return (json?.items ?? []).map((p, idx) => {
    const id = p.id || `post-${idx + 1}`;
    const title = p.title || `UNTITLED-${idx + 1}.TXT`;
    const date = p.date || new Date().toISOString().slice(0, 10);
    const category = (p.category || "NOVINKY").toUpperCase();
    const body = p.body || "";
    const description = (p as any).description || (p as any).seoDescription || undefined;
    return { id, title, date, category, body, description };
  });
}

/** Převod souborového názvu na hezký nadpis (bez přípony, mezery, kapitalizace) */
function prettyTitle(fileName: string): string {
  const noExt = fileName.replace(/\.[^.]+$/i, "");
  return noExt
    .replace(/[-_]+/g, " ")
    .toLowerCase()
    .replace(/(^|\s)\S/g, (m) => m.toUpperCase());
}

/* ===== Notepad detail (externí okno přes DesktopWindowManager) ===== */
const NotepadModal: React.FC<{ t: (k: string) => string; post: BlogPost; onClose: () => void }> = ({ t, post, onClose }) => {
  // Titulek okna (zůstává souborový – kvůli Win95 feelingu)
  const windowTitle = `${t("blog95.notepadTitle") || "Poznámkový blok"} – ${post.title}`;

  // Vykreslit obsah článku – sémantika + „linky přes celou šířku“, text uprostřed
  const Inner: React.FC = () => {
    const iso = post.date;
    const displayDate = new Date(iso).toLocaleDateString();
    const lines = (post.body || "").split("\n");
    const url = window.location.origin + `/blog/${post.id}`;
    const URL_RE = /(https?:\/\/[^\s]+|www\.[^\s]+|mailto:[^\s]+)/i;
    const toHref = (u: string) =>
      /^https?:\/\//i.test(u) || u.startsWith("mailto:") ? u : `https://${u}`;

    const ROW_PX = 44;

    // Hezký H1 pro čtenáře + SEO
    const humanTitle = prettyTitle(post.title);

    // Popisek (fallback z textu)
    const fallbackDesc = lines.join(" ").replace(/\s+/g, " ").trim().slice(0, 160);
    const metaDesc = (post.description || fallbackDesc) || "";

    // Head meta + JSON-LD (při otevření článku; po zavření revert)
    useEffect(() => {
      const prevTitle = document.title;
      document.title = `${humanTitle} | Bits&Bytes Blog`;

      const restoreFns: Array<() => void> = [];

      const setMeta = (sel: { name?: string; property?: string }, content: string) => {
        const q = sel.name ? `meta[name="${sel.name}"]` : `meta[property="${sel.property}"]`;
        let el = document.head.querySelector<HTMLMetaElement>(q);
        if (el) {
          const prev = el.getAttribute("content") || "";
          el.setAttribute("content", content);
          restoreFns.push(() => el && el.setAttribute("content", prev));
        } else {
          el = document.createElement("meta");
          if (sel.name) el.name = sel.name;
          if (sel.property) el.setAttribute("property", sel.property);
          el.setAttribute("content", content);
          document.head.appendChild(el);
          restoreFns.push(() => el && el.remove());
        }
      };

      setMeta({ name: "description" }, metaDesc);
      setMeta({ property: "og:type" }, "article");
      setMeta({ property: "og:title" }, humanTitle);
      setMeta({ property: "og:description" }, metaDesc);
      setMeta({ property: "og:url" }, url);
      setMeta({ name: "twitter:card" }, "summary");

      // canonical
      let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      let prevCanon: string | null = null;
      if (link) {
        prevCanon = link.getAttribute("href");
        link.setAttribute("href", url);
      } else {
        link = document.createElement("link");
        link.rel = "canonical";
        link.href = url;
        document.head.appendChild(link);
      }
      const linkRef = link;
      restoreFns.push(() => {
        if (!linkRef) return;
        if (prevCanon === null) linkRef.remove();
        else linkRef.setAttribute("href", prevCanon);
      });

      // JSON-LD
      const ld = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": humanTitle,
        "datePublished": iso,
        "dateModified": iso,
        "articleSection": post.category || "Blog",
        "inLanguage": (t("lang") || "cs").toLowerCase(),
        "description": metaDesc,
        "author": { "@type": "Organization", "name": "Bits&Bytes" },
        "publisher": { "@type": "Organization", "name": "Bits&Bytes" },
        "mainEntityOfPage": { "@type": "WebPage", "@id": url }
      };
      const el = document.createElement("script");
      el.type = "application/ld+json";
      el.id = "bb-ld-blogpost";
      el.textContent = JSON.stringify(ld);
      document.head.appendChild(el);

      return () => {
        document.getElementById("bb-ld-blogpost")?.remove();
        restoreFns.reverse().forEach(fn => fn());
        document.title = prevTitle;
      };
    }, [post, t, humanTitle, metaDesc, url]);

    return (
      <article
        itemScope
        itemType="https://schema.org/BlogPosting"
        className="w-full h-full min-h-0 bg-[#FFF7C2] border border-black flex flex-col" // ← žlutý papír na CELÉM článku (včetně nadpisu)
      >
        {/* Hlavička */}
        <header className="px-4 pt-4 text-center">
          <h1 itemProp="headline" className="font-semibold text-base md:text-lg">
            {humanTitle}
          </h1>
          <div className="text-xs opacity-70 mt-1">
            <time itemProp="datePublished" dateTime={iso}>{displayDate}</time>
            <meta itemProp="dateModified" content={iso} />
            <meta itemProp="articleSection" content={post.category || "Blog"} />
            <meta itemProp="inLanguage" content={(t("lang") || "cs").toLowerCase()} />
          </div>
        </header>

        {/* Tělo článku – řádek = full-width border, jednotná výška; linky klikací přes celé okno */}
        <section
          itemProp="articleBody"
          className="flex-1 min-h-0 overflow-auto mt-3"
          style={{
            // jemné „notebook“ linky přes CELÉ okno
            backgroundImage: `repeating-linear-gradient(
      to bottom,
      rgba(0,0,0,0.12) 0px,
      rgba(0,0,0,0.12) 1px,
      transparent 1px,
      transparent ${ROW_PX}px
    )`,
            backgroundAttachment: "local",
          }}
        >
          {lines.map((ln, i) => {
            const text = ln.trim().length ? ln : "\u00A0";
            const m = URL_RE.exec(ln || "");

            const InnerRow = (isLink = false) => (
              <div className="mx-auto w-[min(740px,92%)] px-4 h-11 flex items-center justify-center text-center font-mono text-sm">
                {isLink ? <span className="underline">{text}</span> : text}
              </div>
            );

            return m ? (
              // klikací řádek přes celou šířku (bez borderu – čáru kreslí background)
              <a
                key={i}
                href={toHref(m[1])}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full"
              >
                {InnerRow(true)}
              </a>
            ) : (
              // neklikací řádek – stejná výška
              <div key={i} className="w-full">
                {InnerRow()}
              </div>
            );
          })}
        </section>

        {/* Stavový řádek */}
        <footer className="text-xs bg-[#C0C0C0] border-t border-black px-2 py-1 select-none text-center">
          {t("blog95.statusLine") || "Řádek 1, Sloupec 1 | Kódování: ANSI | Naposledy změněno:"} {displayDate}
        </footer>
      </article>
    );
  };

  useEffect(() => {
    // Otevři externí okno ve správci oken
    const node = <Inner />;
    window.dispatchEvent(new CustomEvent("BB_OPEN_BLOGPOST", { detail: { title: windowTitle, node } }));

    // Když se okno zavře z manageru (křížek / taskbar), zavřeme i náš lokální stav
    const handleClose = () => onClose?.();
    window.addEventListener("BB_CLOSE_BLOGPOST", handleClose as EventListener);

    return () => {
      window.removeEventListener("BB_CLOSE_BLOGPOST", handleClose as EventListener);
      // Pozn.: nevoláme onClose v cleanupu kvůli StrictMode (jinak by se okno hned zavřelo)
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Nic nevykresluj – okno rendruje DesktopWindowManager jako Win95Window
  return null;
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
                  <a
                    href={`/blog/${p.id}`}
                    onClick={(e) => { e.preventDefault(); setOpenPost(p); }}
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
                  </a>
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
          <ul className="max-h-[calc(100%-40px)] overflow-auto text-[15px] leading-6">
            {posts.map((p) => (
              <li key={p.id} className="hover:bg-[#E0E0E0]">
                <a
                  href={`/blog/${p.id}`}
                  onClick={(e) => { e.preventDefault(); setOpenPost(p); }}
                  className="grid grid-cols-3"
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
                </a>
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
