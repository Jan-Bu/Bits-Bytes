// src/data/translations.ts
import enBlog from './i18n/en.blog.json';
import csBlog from './i18n/cs.blog.json';

import { Translations } from '../types';

function mapBlogArrayToItems(arr: Array<any>) {
  const out: Record<string, any> = {};
  arr.forEach((post, idx) => { out[`i${idx + 1}`] = post; });
  return out;
}

export const translations: Translations = {
  en: {
    /* ===== Common (globální krátké texty) ===== */
    common: {
      actions: {
        ok: 'OK',
        cancel: 'Cancel',
        save: 'Save',
        close: 'Close',
        back: 'Back',
        next: 'Next',
        retry: 'Retry',
        more: 'More',
        open: 'Open',
        copy: 'Copy',
        copied: 'Copied!',
        search: 'Search',
      },
      states: {
        loading: 'Loading…',
        processing: 'Working on it…',
        empty: 'Nothing to show here.',
        error: 'Something went wrong.',
      },
      date: {
        today: 'Today',
        yesterday: 'Yesterday',
      },
    },

    clippy: {
      label: "Not Clippy",
      tips: {
        0: "Click on me for more tips!",
        1: "You can drag icons on the desktop.",
        2: "Click me again for another tip.",
      },
    },

    /* ===== Desktop (ikonky, lišta, okna) ===== */
    desktop: {
      icons: {
        about: 'About Us',
        services: 'Our Services',
        pricing: 'Pricing',
        blog: 'Blog',
        contact: 'Contact',
        terms: 'Terms',
        gdpr: 'GDPR',
      },
      taskbar: {
        start: 'Start',
        showDesktop: 'Show Desktop',
        clockTooltip: 'Current time',
      },
      window: {
        titles: {
          about: 'About – Bits&Bytes',
          services: 'Services – Bits&Bytes',
          pricing: 'Pricing – Bits&Bytes',
          blog: 'Blog – Bits&Bytes',
          contact: 'Contact – Bits&Bytes',
          terms: 'Terms & Conditions',
          gdpr: 'GDPR & Privacy Policy',
          webview: 'Internal Browser',
        },
        controls: {
          minimize: 'Minimize',
          maximize: 'Maximize',
          restore: 'Restore',
          close: 'Close',
        },
        menu: {
          file: 'File',
          edit: 'Edit',
          view: 'View',
          help: 'Help',
        },
      },
      dialogs: {
        readOnly: 'This document is read-only.',
        notSaved: 'You have unsaved changes. Close anyway?',
      },
    },

    nav: {
      about: 'About Us',
      services: 'Our Services',
      pricing: 'Pricing',
      blog: 'Blog',
      contact: 'Contact',
      terms: 'Terms',
      gdpr: 'GDPR',
      home: 'Home',
    },
    hero: {
      headline: 'We build websites and branding that stand out.',
      menu: 'MENU',
    },

    about: {
      menu: {
        closeGame: 'Close the game',
      },
      intro: {
        title: 'About Us',
        content: `We’re Bits&Bytes, a duo that gives brands both a face and a life.

We create graphics, websites, and full visual identities – from logos to complete brand presentations.

We also handle the print side: business cards, flyers, posters, stickers, banners, packaging, catalogs, and more.

We work simply, honestly, and with a focus on results that make sense and work in the real world.`,
      },
      services: {
        web: {
          title: 'Web Development',
          description: `Custom-made websites from sketch to launch.
Already have a design? Great. Need one? We’ve got you covered.
Whether it’s a clear plan or a rough idea, we turn it into a working website.`,
        },
        branding: {
          title: 'Branding',
          description: `We build brands from the ground up.
From logo and colors to fonts and full brand manuals.
We also design printed materials like catalogs, banners, or packaging — and get them printed too.`,
        },
        copywriting: {
          title: 'Copywriting',
          description: `Need a voice for your brand?
We write everything — from snappy headlines and Instagram captions to full websites.
Always in your tone, always with meaning.`,
        },
        seo: {
          title: 'SEO',
          description: `Top-tier SEO that brings your website to life in search engines.
We make sure you’re visible, fast, and found — without the buzzwords or tricks.
Just real results.`,
        },
      },
      skills: {
        title: 'What We Offer',
        content: `Your idea. Our design. Your success.
From logo to print, everything under one roof, with sense and style.

No endless back-and-forth between designer, developer, and printer.
With us, you get everything from one place – fast, smooth, and without wasted energy.
Less time, more results.`,
        anvil: '3D Model',
        seo: 'SEO',
      },
      mission: {
        title: 'Our Mission',
        content: `Bit draws. Byte codes. Together, they help brands look the way they deserve to.

We create visual identities from logo to website. They do not only look good but also work in real life.
We do not use templates. We do not make excuses. We avoid unnecessary complexity.
We understand the world of small businesses. Time and budget are always limited.
That is why we design solutions that bring joy and deliver results.

We speak like humans. We work like robots. Carefully, reliably and with full focus.`,
      },
      vision: {
        title: 'Our Vision',
        content: `Bit wants websites to stop being ugly. Byte wants them to make sense. We want both.

We believe even the smallest brand deserves to look great. No agency clutter, no templates, no inflated egos.

Design should be functional, clear and personal.
That is why we do not mass-produce our work. We build everything from scratch. 

Thoughtfully, carefully and with a human touch.
Every project deserves a bit of Bit’s precision and a byte of Byte’s creativity.`,
      },
      team: {
        title: 'Our Team',
        bits: 'Bits – Design, frontend',
        bytes: 'Bytes – Communication, backend',
      },
      button: {
        back: 'TO HOME PAGE',
        contact: 'CONTACT US',
      },
    },

    services: {
      title: 'Our Services',
      web: {
        title: 'Web Development',
        description:
          'Custom websites built with the latest technologies and optimized for performance.',
      },
      branding: {
        title: 'Brand Identity',
        description: "Unique visual identities that capture your brand's essence and personality.",
      },
      design: {
        title: 'UI/UX Design',
        description: 'User-centered design that creates engaging and intuitive digital experiences.',
      },
    },

    pricing: {
      intro: {
        title: 'Pricing.txt',
      },
      text:
        "At our studio, you won’t find standard packages or fixed prices. Every project is unique and deserves an individual approach.\n\n We design websites, graphics, branding, and print materials fully tailored to your needs. Whether you’re looking for a simple website, a complete brand identity, or custom print solutions, we make sure everything fits your vision.\n\n Before we start, we always agree on the details, so you know exactly what to expect, with no unpleasant surprises.",
    },

    /* ===== Blog (Win95 styl) ===== */
    blog95: {
      windowTitle: "Explorer – BLOG",
      notepadTitle: "Notepad",
      statusLine: "Line 1, Col 1 | Encoding: ANSI | Last modified:",
      folders: "Folders",
      readonly: "Read-only",
      toolbar: {
        refresh: 'Refresh',
        view: 'View',
        list: 'List',
        grid: 'Grid',
        sortBy: 'Sort by',
        filter: 'Filter',
        searchPh: 'Search posts…',
        openInNotepad: 'Open in Notepad',
      },
      cat: {
        news: "NEWS",
        web: "WEBDESIGN",
        graphics: "GRAPHICS",
        brand: "BRANDING",
        print: "PRINT",
        all: "ALL",
      },
      col: {
        name: "Name",
        modified: "Modified",
        category: "Category",
      },
      empty: "No posts in this folder.",
      items: mapBlogArrayToItems(enBlog.items),
    },

    /* ===== Contact ===== */
    contact: {
      title: 'Contact',
      description: "Ready to bring your project to life? Get in touch and let's make it happen.",
      tabs: { email: 'E-mail', phone: 'Phone', info: 'Info' },

      form: {
        to: 'To:',
        from: 'From:',
        fromPh: 'your e-mail address',
        reason: {
          label: 'Reason:',
          choose: 'Choose a reason…',
          web: 'Website / Development',
          branding: 'Branding / Design',
          seo: 'SEO / Marketing',
          print: 'Print / Packaging',
          other: 'Other',
        },
        subject: 'Subject:',
        subjectPh: 'Short subject',
        messagePh: 'Write your message here…',
        send: 'Send',
        altMail: 'Open default mail client',
        useMailer: 'or use your mail client',
        sentToast: 'Thanks! Your message is ready to be sent.',
        tooltips: {
          copyAddress: 'Copy e-mail address',
          openClient: 'Open your e-mail client',
        },
      },

      phone: {
        call: 'Call',
        direct: 'Direct line',
        tip: 'Tip: Click the number to call, or use “Copy” to put it into the clipboard.',
        bits: {
          title: 'Bits',
          name: 'Jan Bubeníček',
          hours: 'Availability: 09:00–22:00',
        },
        bytes: {
          title: 'Bytes',
          name: 'Alan Matoušek',
          hours: 'Availability: 08:00–18:00',
        },
        tooltips: {
          callNow: 'Call now',
          copyNumber: 'Copy phone number',
        },
      },

      status: {
        online: 'Online',
        offline: 'Offline',
      },

      info: {
        email: {
          label: 'E-mail:',
          value: 'studio.bitsbytes@gmail.com',
          note: 'Inbox monitored daily',
        },
        location: {
          label: 'Location:',
          value: 'Prague, Czech Republic',
          note: 'Visits by appointment',
          openMap: 'Open map',
        },
        footerTip: 'Prefer calling? Check the Phone tab.',
      },
    },

    terms: {
      title: 'Terms & Conditions',
      meta: {
        version: 'Version: 1.0',
        updated: 'Last updated: 9 Sep 2025',
      },
      intro: {
        title: 'Scope & Acceptance',
        body:
          'These Terms govern the provision of services by Bits & Bytes (web development, branding, logo design, and print). By placing an order or using our services, you agree to these Terms.',
      },
      s1: {
        title: 'Definitions',
        body: 'For clarity within these Terms:',
        l1: '“Studio” means Bits & Bytes, Alan Matoušek based in Prague, Czech Republic (Company ID: 01110713).',
        l2: '“Client” means a natural or legal person ordering our services.',
        l3: '“Deliverables” means outputs such as design files, websites, source files, or printed materials.',
      },
      s2: {
        title: 'Scope of Services',
        body:
          'We provide website development, graphic design, branding, logo creation, print design and production, and related consulting.',
        l1: 'The exact scope is defined in a written offer or order confirmation.',
        l2: 'Deadlines depend on timely cooperation and approvals by the Client.',
        l3: 'Third-party costs (fonts, photos, hosting, print) are quoted separately when applicable.',
      },
      s3: {
        title: 'Orders & Process',
        body:
          'Orders are accepted via email, phone, or the contact form. A project starts after written confirmation of scope and price.',
        l1: 'We may request needed access (hosting, domains, analytics, etc.).',
        l2: 'Milestones and approvals may be set for larger projects.',
        l3: 'Change requests after approval may affect price and timeline.',
      },
      s4: {
        title: 'Pricing & Payment',
        body:
          'The website price list is indicative only. The final price is confirmed in writing for each project.',
        l1: 'Unless agreed otherwise, payment is due after delivery by bank transfer.',
        l2: 'Prices exclude taxes and third-party fees, unless stated.',
        l3: 'Late payments may suspend work until settlement.',
      },
      s5: {
        title: 'Delivery & Acceptance',
        body:
          'Deliverables are handed over electronically (files, links, credentials) or physically for printed goods.',
        l1: 'Acceptance occurs upon Client approval or by going live/using the Deliverables.',
        l2: 'Any issues must be reported without undue delay after delivery.',
        l3: 'For printed production, minor color/finish deviations are industry-standard.',
      },
      s6: {
        title: 'Revisions & Warranty',
        body:
          'Within 14 days of delivery, we fix minor defects free of charge. Further changes are billed according to the current price list.',
        l1: 'Warranty excludes changes by third parties or misuse.',
        l2: 'We do not warrant third-party services (hosting, CMS, plugins).',
        l3: 'Security patches or updates can be arranged as a separate service.',
      },
      s7: {
        title: 'Liability',
        body:
          'We are not liable for indirect or consequential damages, lost profits, or downtime. Our total liability is limited to the price paid for the affected Deliverables.',
        l1: 'Client is responsible for content legality and necessary rights.',
        l2: 'We are not liable for delays caused by missing cooperation from the Client.',
        l3: 'Force majeure events suspend obligations for the duration of the event.',
      },
      s8: {
        title: 'Intellectual Property',
        body:
          'Unless agreed otherwise in writing, copyrights remain with the Studio. The Client receives a non-exclusive right to use the Deliverables for the agreed purpose.',
        l1: 'Open-source or licensed assets remain subject to their respective licenses.',
        l2: 'We may showcase anonymized work in our portfolio unless you opt out in writing.',
        l3: 'Editable/source files are provided when included in the offer.',
      },
      s9: {
        title: 'Termination',
        body:
          'Either party may terminate a project for material breach after a written notice and reasonable cure period.',
        l1: 'Upon termination, completed work to date is invoiced.',
        l2: 'Access provided by the Client should be revoked after termination.',
        l3: 'Deposits (if any) may be non-refundable if stated in the offer.',
      },
      s10: {
        title: 'Complaints & Disputes',
        body:
          'We aim to resolve complaints amicably. If unresolved, disputes are governed by Czech law.',
        l1: 'Primary venue: courts in Prague, Czech Republic.',
        l2: 'Consumer rights remain unaffected where applicable.',
        l3: 'Out-of-court resolution options may be available under Czech law.',
      },
      s11: {
        title: 'Governing Law',
        body: 'These Terms are governed by the laws of the Czech Republic and EU law, where applicable.',
      },
      s12: {
        title: 'Changes to Terms',
        body:
          'We may update these Terms. The current version is always published on our website with the effective date.',
      },
      s13: {
        title: 'Contact',
        body:
          'Bits & Bytes, Company ID: 01110713, Prague, Czech Republic — E-mail: studio.bitsbytes@gmail.com',
      },
    },

    gdpr: {
      title: 'GDPR & Privacy Policy',
      intro: {
        title: 'Your Privacy Matters',
        body:
          'This Policy explains how Bits & Bytes (Company ID: 01110713, Prague) processes personal data in line with EU GDPR and Czech law.',
      },
      s1: {
        title: 'What Data We Collect',
        body: 'We process only the data necessary for our services:',
        l1: 'Contact details (name, email, phone) submitted via forms or email.',
        l2: 'Billing details required by law for invoicing and accounting.',
        l3: 'Analytics data (Google Analytics) — page views, device info, approximate location; stored in aggregated/anonymous form where possible.',
      },
      s2: {
        title: 'Why We Use the Data',
        body: 'Legal bases: performance of a contract, legal obligations, and legitimate interests.',
        l1: 'Handling inquiries, project communication, and delivery of services.',
        l2: 'Fulfilling legal duties (tax, accounting).',
        l3: 'Measuring and improving our website using analytics.',
      },
      s3: {
        title: 'How We Protect Data',
        body: 'We apply adequate technical and organizational measures:',
        l1: 'Secure servers and limited access for authorized persons only.',
        l2: 'Encryption in transit and regular updates.',
        l3: 'Data minimization and retention limits.',
      },
      s4: {
        title: 'Your Rights',
        body: 'Under GDPR you can:',
        l1: 'Access, rectify, or erase your personal data.',
        l2: 'Restrict or object to processing; portability where applicable.',
        l3: 'Withdraw consent (for optional cookies/analytics) without affecting prior processing.',
        l4: 'Lodge a complaint with the Czech supervisory authority (ÚOOÚ).',
      },
      contact: {
        title: 'Contact & Controller',
        body:
          'Controller: Alan Matoušek (Company ID: 01110713), Prague, Czech Republic. E-mail: studio.bitsbytes@gmail.com',
      },
      changes: {
        title: 'Changes',
        body:
          'We may update this Policy. The current version is published on our website with the effective date.',
      },
    },

    cookies: {
      title: 'Cookie Preferences',
      description: 'We use cookies to enhance your browsing experience and analyze our traffic.',
      accept: 'Accept All',
      decline: 'Decline',
      customize: 'Customize',
      necessary: 'Necessary Cookies',
      analytics: 'Analytics Cookies',
      marketing: 'Marketing Cookies',
      save: 'Save Preferences',
    },

    /* --- Services Page content --- */
    ServicesSection: {
      hero: {
        title: 'Services.txt',
        headline: 'Webs that work. Brands that stick.',
        sub: 'From concept to code and all the print you need.',
      },
      menu: {
        web: 'Web Development',
        seo: 'SEO',
        branding: 'Brand Identity',
        print: 'Print & Production',
      },
      web: {
        title: 'Web Development',
        lead:
          "Custom-made websites from sketch to launch. Already have a design? Great. Need one? We've got you covered. Whether it's a clear plan or a rough idea, we turn it into a working website.",
        bullets: {
          i1: 'Custom design or bring your own',
          i2: 'From rough idea to working website',
          i3: 'Responsive, fast, and SEO-ready',
          i4: 'One place for design and development',
        },
        showcaseTitle: 'Selected Work',
        showcase: {
          s1: {
            title: 'Pragoline.cz',
            note: 'Packaging & printing company, with dynamic SEO and custom animations',
            href: 'https://pragoline.cz',
            preview: '/previews/pragoline.webp',
          },
          s2: {
            title: 'Decor Art Studio',
            note: 'Decorative plasters, website with simple content management and gallery',
            href: 'https://decorartstudio.netlify.app',
            preview: '/previews/decorart.webp',
          },
          s3: {
            title: 'Hawks Security',
            note: 'Security company, clean B2B landing with lead capture',
            href: 'https://hawks-security.com',
            preview: '/previews/hawks.webp',
          },
          s4: {
            title: 'Falafelova',
            note: 'Food service, one-pager with menu and order buttons',
            href: 'https://falafe-lova.cz',
            preview: '/previews/falafelova.webp',
          },
          s5: {
            title: 'Movi-n',
            note: 'Moving services, modern website with custom price configurator',
            href: 'https://movi-n.cz/',
            preview: '/previews/movin.webp',
          },
        },
        cta: "Want a web that actually converts? Let's talk.",
      },
      seo: {
        title: 'SEO',
        lead:
          "Top-tier SEO that brings your website to life in search engines. We make sure you're visible, fast, and found — without the buzzwords or tricks. Just real results.",
        bullets: {
          i1: 'Visible in search engines',
          i2: 'Fast websites that rank',
          i3: 'No buzzwords, just results',
          i4: 'Technical health + content strategy',
        },
        cta: "We'll find quick wins and plan the long game.",
      },
      branding: {
        title: 'Brand Identity',
        lead:
          'We build brands from the ground up. From logo and colors to fonts and full brand manuals. We also design printed materials like catalogs, banners, or packaging — and get them printed too.',
        bullets: {
          i1: 'Logo to full brand manual',
          i2: 'Colors, fonts, and style guides',
          i3: 'Print materials design',
          i4: 'We can print it too',
        },
        cta: 'Start with a mini-identity or go full brand manual.',
      },
      print: {
        title: 'Print & Production',
        lead:
          'We handle the print side: business cards, flyers, posters, stickers, banners, packaging, catalogs, and more. Design and printing under one roof.',
        bullets: {
          i1: 'Business cards to banners',
          i2: 'Catalogs, flyers, packaging',
          i3: 'Design and printing together',
          i4: 'From file to finished product',
        },
        cta: "Send specs or just the goal — we'll prep, print, and deliver.",
      },
    },
  },

  cs: {
    /* ===== Common (globální krátké texty) ===== */
    common: {
      actions: {
        ok: 'OK',
        cancel: 'Zrušit',
        save: 'Uložit',
        close: 'Zavřít',
        back: 'Zpět',
        next: 'Další',
        retry: 'Zkusit znovu',
        more: 'Více',
        open: 'Otevřít',
        copy: 'Kopírovat',
        copied: 'Zkopírováno!',
        search: 'Hledat',
      },
      states: {
        loading: 'Načítám…',
        processing: 'Pracuji na tom…',
        empty: 'Zde zatím nic není.',
        error: 'Něco se pokazilo.',
      },
      date: {
        today: 'Dnes',
        yesterday: 'Včera',
      },
    },

    clippy: {
      label: "Not Clippy",
      tips: {
        0: "Klikni na mě pro další tip!",
        1: "Ikony můžeš přetahovat po ploše.",
        2: "Klikni na mě znovu pro další tip.",
      },
    },

    /* ===== Desktop ===== */
    desktop: {
      icons: {
        about: 'O nás',
        services: 'Naše služby',
        pricing: 'Ceník',
        blog: 'Blog',
        contact: 'Kontakt',
        terms: 'Obchodní podmínky',
        gdpr: 'GDPR',
      },
      taskbar: {
        start: 'Start',
        showDesktop: 'Zobrazit plochu',
        clockTooltip: 'Aktuální čas',
      },
      window: {
        titles: {
          about: 'O nás – Bits&Bytes',
          services: 'Služby – Bits&Bytes',
          pricing: 'Ceník – Bits&Bytes',
          blog: 'Blog – Bits&Bytes',
          contact: 'Kontakt – Bits&Bytes',
          terms: 'Obchodní podmínky',
          gdpr: 'GDPR a Zásady',
          webview: 'Vnitřní prohlížeč',
        },
        controls: {
          minimize: 'Minimalizovat',
          maximize: 'Maximalizovat',
          restore: 'Obnovit',
          close: 'Zavřít',
        },
        menu: {
          file: 'Soubor',
          edit: 'Úpravy',
          view: 'Zobrazení',
          help: 'Nápověda',
        },
      },
      dialogs: {
        readOnly: 'Tento dokument je jen pro čtení.',
        notSaved: 'Máte neuložené změny. Přesto zavřít?',
      },
    },

    nav: {
      about: 'O nás',
      services: 'Naše služby',
      pricing: 'Ceník',
      blog: 'Blog',
      contact: 'Kontakt',
      terms: 'Obchodní podmínky',
      gdpr: 'GDPR',
      home: 'Domů',
    },
    hero: {
      headline: 'Vytváříme webové stránky a branding, které vynikají.',
      menu: 'MENU',
    },

    about: {
      menu: {
        closeGame: 'Ukončit hru',
      },
      intro: {
        title: 'O nás',
        content: `Jsme Bits&Bytes, dvojice, která dává značkám tvář i život.
Vytváříme grafiku, weby a celé vizuální identity – od loga až po kompletní prezentace.
Zvládáme i tisk: vizitky, letáky, plakáty, samolepky, bannery, obaly, katalogy a další.
Pracujeme jednoduše, upřímně a s důrazem na výsledek, který má smysl a funguje v reálném světě.`,
      },
      services: {
        web: {
          title: 'Tvorba webu',
          description: `Weby na míru od návrhu po spuštění.
Máte vlastní grafiku? Super. Nemáte? Vymyslíme ji s vámi.
Ať už přijdete s jasným plánem nebo jen nápadem, postavíme vám funkční web.`,
        },
        branding: {
          title: 'Branding',
          description: `Navrhujeme značky od loga po katalog.
Vybereme barvy, písmo i styl, vytvoříme brand manuál i tiskoviny.
A pokud budete chtít, rovnou je i vytiskneme.`,
        },
        copywriting: {
          title: 'Copywriting',
          description: `Vaše značka potřebuje hlas?
Píšeme vše — od příspěvků na sítě až po celý web.
Srozumitelně, osobitě a přesně pro vás.`,
        },
        seo: {
          title: 'SEO',
          description: `Špičkové SEO, které vás dostane nahoru.
Bez kouzel a triků — jen rychlý web a výsledky ve vyhledávání.
Aby vás našli ti, co vás hledají.`,
        },
      },
      skills: {
        title: 'Co umíme',
        content: `Váš nápad. Náš design. Váš úspěch.
Od loga po tisk – vše pod jednou střechou, s rozumem i stylem.

Žádné nekonečné předávání mezi grafikem, vývojářem a tiskařem.
U nás dostanete vše z jednoho místa – rychle, hladce a bez zbytečné ztráty energie.
Méně času, více výsledků.`,
        anvil: '3D model',
        seo: 'SEO',
      },
      mission: {
        title: 'Naše mise',
        content: `Bit kreslí. Byte kóduje. Společně pomáháme značkám vypadat tak, jak si zaslouží.
Tvoříme vizuální identity od loga po web. Nejenže dobře vypadají, ale také fungují v praxi.
Nepoužíváme šablony. Nevymlouváme se. Nepřiděláváme složitost tam, kde není třeba.
Rozumíme malým firmám. Čas i rozpočet jsou vždy omezené.
Proto navrhujeme řešení, která přinášejí radost a výsledky.
Mluvíme jako lidé. Pracujeme jako roboti. Pečlivě, spolehlivě a naplno.`,
      },
      vision: {
        title: 'Naše vize',
        content: `Bit chce, aby weby přestaly být ošklivé. Byte chce, aby dávaly smysl. My chceme obojí.
Věříme, že i nejmenší značka si zaslouží vypadat skvěle. Bez agenturních složitostí, šablon a nafoukanosti.
Design má být funkční, srozumitelný a osobní.
Proto žádnou práci nevyrábíme sériově. Stavíme vše od základu – promyšleně, pečlivě a s lidským přístupem.
Každý projekt si zaslouží trochu Bitovy preciznosti a Byteovy kreativity.`,
      },
      team: {
        title: 'Náš tým',
        bits: 'Bits – Design, frontend',
        bytes: 'Bytes – Komunikace, backend',
      },
      button: {
        back: 'NA DOMOVSKOU STRÁNKU',
        contact: 'KONTAKTUJTE NÁS',
      },
    },

    services: {
      title: 'Naše služby',
      web: {
        title: 'Vývoj webů',
        description:
          'Webové stránky na míru postavené na nejnovějších technologiích a optimalizované pro výkon.',
      },
      branding: {
        title: 'Brand identita',
        description: 'Jedinečné vizuální identity, které zachycují podstatu a osobnost vaší značky.',
      },
      design: {
        title: 'UI/UX Design',
        description: 'Uživatelsky orientovaný design, který vytváří poutavé a intuitivní digitální zážitky.',
      },
    },

    pricing: {
      intro: {
        title: 'Ceník.txt',
      },
      text:
        'U nás nenajdete univerzální balíčky ani pevné ceny. Každý projekt je unikátní a zaslouží si individuální přístup.\n\n Navrhujeme weby, grafiku, branding i tiskové materiály přesně na míru vašim potřebám. Ať hledáte jednoduchý web, kompletní identitu, nebo tiskové řešení, postaráme se, aby vše sedělo vaší vizi.\n\n Ještě před začátkem si vyjasníme detaily, abyste přesně věděli, co dostanete — bez nepříjemných překvapení.',
    },

    blog95: {
      windowTitle: "Průzkumník – BLOG",
      notepadTitle: "Poznámkový blok",
      statusLine: "Řádek 1, Sloupec 1 | Kódování: ANSI | Naposledy změněno:",
      folders: "Složky",
      readonly: "Jen pro čtení",
      toolbar: {
        refresh: 'Obnovit',
        view: 'Zobrazení',
        list: 'Seznam',
        grid: 'Mřížka',
        sortBy: 'Řadit podle',
        filter: 'Filtrovat',
        searchPh: 'Hledat články…',
        openInNotepad: 'Otevřít v Poznámkovém bloku',
      },
      cat: {
        news: "NOVINKY",
        web: "WEBDESIGN",
        graphics: "GRAFIKA",
        brand: "BRANDING",
        print: "TISK",
        all: "VŠE",
      },
      col: {
        name: "Název",
        modified: "Datum změny",
        category: "Kategorie",
      },
      empty: "Žádné články v této složce.",
      items: mapBlogArrayToItems(csBlog.items),
    },

    contact: {
      title: 'Kontakt',
      description: 'Jste připraveni uvést váš projekt do života? Spojte se s námi a udělejme to společně.',
      tabs: { email: 'E-mail', phone: 'Telefon', info: 'Informace' },

      form: {
        to: 'Komu:',
        from: 'Od:',
        fromPh: 'vaše e-mailová adresa',
        reason: {
          label: 'Důvod:',
          choose: 'Vyberte důvod…',
          web: 'Web / vývoj',
          branding: 'Branding / design',
          seo: 'SEO / marketing',
          print: 'Tisk / obaly',
          other: 'Jiné',
        },
        subject: 'Předmět:',
        subjectPh: 'Stručný předmět zprávy',
        messagePh: 'Sem napište svou zprávu…',
        send: 'Odeslat',
        altMail: 'Otevřít výchozího e-mailového klienta',
        useMailer: 'nebo použít e-mailového klienta',
        sentToast: 'Díky! Zpráva byla připravena k odeslání.',
        tooltips: {
          copyAddress: 'Zkopírovat e-mailovou adresu',
          openClient: 'Otevřít e-mailového klienta',
        },
      },

      phone: {
        call: 'Zavolat',
        direct: 'Přímá linka',
        tip: 'Tip: Kliknutím na číslo voláte, tlačítkem „Kopírovat“ vložíte číslo do schránky.',
        bits: {
          title: 'Bits',
          name: 'Jan Bubeníček',
          hours: 'Dostupnost: 09:00–22:00',
        },
        bytes: {
          title: 'Bytes',
          name: 'Alan Matoušek',
          hours: 'Dostupnost: 08:00–18:00',
        },
        tooltips: {
          callNow: 'Volat nyní',
          copyNumber: 'Zkopírovat číslo',
        },
      },

      status: {
        online: 'Online',
        offline: 'Offline',
      },

      info: {
        email: {
          label: 'E-mail:',
          value: 'studio.bitsbytes@gmail.com',
          note: 'Schránku kontrolujeme denně',
        },
        location: {
          label: 'Sídlo:',
          value: 'Praha, Česká republika',
          note: 'Návštěvy po předchozí domluvě',
          openMap: 'Otevřít mapu',
        },
        footerTip: 'Preferujete telefon? Podívejte se na záložku Telefon.',
      },
    },

    terms: {
      title: 'Obchodní podmínky',
      meta: {
        version: 'Verze: 1.0',
        updated: 'Poslední aktualizace: 9. 9. 2025',
      },
      intro: {
        title: 'Předmět a přijetí',
        body:
          'Tyto Podmínky upravují poskytování služeb studiem Bits & Bytes (tvorba webů, branding, loga a tisk). Odesláním poptávky či využitím služeb s nimi souhlasíte.',
      },
      s1: {
        title: 'Vymezení pojmů',
        body: 'Pro účely těchto Podmínek:',
        l1: '„Studio“ je Bits & Bytes, fyzická osoba Alan Matoušek se sídlem v Praze, IČO: 01110713.',
        l2: '„Klient“ je fyzická nebo právnická osoba objednávající služby.',
        l3: '„Dílo“ jsou výstupy jako grafické podklady, weby, zdrojové soubory či tiskoviny.',
      },
      s2: {
        title: 'Rozsah služeb',
        body:
          'Poskytujeme vývoj webových stránek, grafický design, branding, tvorbu loga, návrhy a výrobu tiskovin a související poradenství.',
        l1: 'Konkrétní rozsah je uveden v písemné nabídce nebo potvrzení objednávky.',
        l2: 'Termíny závisejí na součinnosti a schvalování ze strany Klienta.',
        l3: 'Náklady třetích stran (písmo, fotografie, hosting, tisk) účtujeme zvlášť, pokud je to relevantní.',
      },
      s3: {
        title: 'Objednávka a průběh',
        body:
          'Objednávky přijímáme e-mailem, telefonicky nebo přes formulář. Projekt začíná po písemném potvrzení rozsahu a ceny.',
        l1: 'Můžeme vyžádat potřebné přístupy (hosting, domény, analytika ap.).',
        l2: 'U větších projektů stanovujeme milníky a schvalování.',
        l3: 'Změny po schválení mohou ovlivnit cenu i harmonogram.',
      },
      s4: {
        title: 'Ceny a platby',
        body:
          'Ceník na webu je orientační. Konečná cena je vždy potvrzena písemně pro daný projekt.',
        l1: 'Není-li ujednáno jinak, platba po předání díla převodem.',
        l2: 'Ceny jsou bez daní a poplatků třetích stran, pokud není uvedeno jinak.',
        l3: 'Při prodlení s úhradou si vyhrazujeme právo práce pozastavit.',
      },
      s5: {
        title: 'Předání a převzetí',
        body:
          'Dílo předáváme elektronicky (soubory, odkazy, přístupy) nebo fyzicky u tiskovin.',
        l1: 'Převzetí nastává schválením Klientem nebo uvedením do provozu/užívání.',
        l2: 'Případné vady je třeba nahlásit bez zbytečného odkladu po předání.',
        l3: 'U tisku jsou drobné odchylky barev a povrchů obvyklé a přijatelné.',
      },
      s6: {
        title: 'Opravy a záruka',
        body:
          'Do 14 dnů od předání opravíme drobné nedostatky zdarma. Další úpravy účtujeme dle aktuálního ceníku.',
        l1: 'Záruka se nevztahuje na zásahy třetích osob nebo nesprávné užití.',
        l2: 'Za služby třetích stran (hosting, CMS, pluginy) neručíme.',
        l3: 'Bezpečnostní aktualizace lze sjednat jako samostatnou službu.',
      },
      s7: {
        title: 'Odpovědnost',
        body:
          'Neodpovídáme za nepřímé či následné škody, ušlý zisk ani výpadky. Celková odpovědnost je omezena cenou zaplacenou za dotčené dílo.',
        l1: 'Za zákonnost obsahu a potřebná práva odpovídá Klient.',
        l2: 'Za prodlení způsobené nesoučinností Klienta neneseme odpovědnost.',
        l3: 'Při zásahu vyšší moci se plnění přiměřeně pozastavuje.',
      },
      s8: {
        title: 'Duševní vlastnictví',
        body:
          'Není-li písemně dohodnuto jinak, autorská práva k dílu náleží Studiu. Klient získává nevýhradní právo užití pro sjednaný účel.',
        l1: 'Open-source/licencované části se řídí příslušnými licencemi.',
        l2: 'Anonymizované ukázky můžeme zveřejnit v portfoliu, pokud se písemně neodhlásíte.',
        l3: 'Editovatelné/zdrojové soubory poskytujeme, pokud jsou součástí nabídky.',
      },
      s9: {
        title: 'Ukončení',
        body:
          'Smluvní strana může projekt ukončit pro podstatné porušení po písemném upozornění a přiměřené lhůtě k nápravě.',
        l1: 'Při ukončení se vyúčtuje dosud provedená práce.',
        l2: 'Klient po ukončení zruší poskytnuté přístupy.',
        l3: 'Zálohy (jsou-li sjednány) mohou být nevratné dle nabídky.',
      },
      s10: {
        title: 'Reklamace a spory',
        body:
          'Reklamace řešíme přednostně dohodou. Nedošlo-li k dohodě, spory se řídí právem ČR.',
        l1: 'Místně příslušné jsou soudy v Praze.',
        l2: 'Práva spotřebitelů zůstávají nedotčena, pokud se uplatní.',
        l3: 'Mimosoudní řešení může být dostupné dle právních předpisů.',
      },
      s11: {
        title: 'Rozhodné právo',
        body: 'Tyto Podmínky se řídí právem České republiky a přímo použitelným právem EU.',
      },
      s12: {
        title: 'Změny podmínek',
        body:
          'Podmínky můžeme aktualizovat. Aktuální znění vždy zveřejňujeme na webu s uvedením účinnosti.',
      },
      s13: {
        title: 'Kontakt',
        body:
          'Alan Matoušek, IČO: 01110713, Praha, Česká republika — E-mail: studio.bitsbytes@gmail.com',
      },
    },

    gdpr: {
      title: 'GDPR a Zásady ochrany osobních údajů',
      intro: {
        title: 'Na vašem soukromí záleží',
        body:
          'Tato Zásada popisuje, jak Bits & Bytes (IČO: 01110713, Praha) zpracovává osobní údaje v souladu s GDPR a právem ČR.',
      },
      s1: {
        title: 'Jaké údaje sbíráme',
        body: 'Zpracováváme pouze údaje nezbytné pro poskytování služeb:',
        l1: 'Kontaktní údaje (jméno, e-mail, telefon) z formulářů či e-mailu.',
        l2: 'Fakturační údaje vyžadované právem pro účetnictví.',
        l3: 'Analytická data (Google Analytics) — zobrazení stránek, zařízení, přibližná poloha; pokud lze, v agregované/anonymizované podobě.',
      },
      s2: {
        title: 'Proč údaje používáme',
        body: 'Právní základy: plnění smlouvy, zákonné povinnosti a oprávněný zájem.',
        l1: 'Vyřízení poptávky, komunikace a realizace zakázek.',
        l2: 'Splnění zákonných povinností (daně, účetnictví).',
        l3: 'Měření a zlepšování webu pomocí analytiky.',
      },
      s3: {
        title: 'Jak údaje chráníme',
        body: 'Provádíme vhodná technická a organizační opatření:',
        l1: 'Zabezpečené servery a omezený přístup pouze pro pověřené osoby.',
        l2: 'Šifrování při přenosu a pravidelné aktualizace.',
        l3: 'Minimalizace dat a omezení doby uchování.',
      },
      s4: {
        title: 'Vaše práva',
        body: 'Podle GDPR můžete:',
        l1: 'Získat přístup, požádat o opravu nebo výmaz osobních údajů.',
        l2: 'Omezit zpracování či vznést námitku; přenositelnost, kde je to aplikovatelné.',
        l3: 'Odvolat souhlas (u volitelných cookies/analytiky) bez vlivu na dřívější zpracování.',
        l4: 'Podat stížnost u dozorového úřadu (ÚOOÚ).',
      },
      contact: {
        title: 'Kontakt a správce',
        body:
          'Správce: Alan Matoušek (IČO: 01110713), Praha, Česká republika. E-mail: studio.bitsbytes@gmail.com',
      },
      changes: {
        title: 'Změny',
        body:
          'Tyto Zásady můžeme aktualizovat. Aktuální verze je vždy na webu s uvedením účinnosti.',
      },
    },

    cookies: {
      title: 'Nastavení cookies',
      description: 'Používáme cookies pro zlepšení vašeho prohlížení a analýzu našeho provozu.',
      accept: 'Přijmout vše',
      decline: 'Odmítnout',
      customize: 'Přizpůsobit',
      necessary: 'Nezbytné cookies',
      analytics: 'Analytické cookies',
      marketing: 'Marketingové cookies',
      save: 'Uložit předvolby',
    },

    /* --- Stránka Služby --- */
    ServicesSection: {
      hero: {
        title: 'Sluzby.txt',
        headline: 'Weby, co fungují. Značky, co se zapamatují.',
        sub: 'Od nápadu přes kód až k tisku, vše co budete potřebovat.',
      },
      menu: {
        web: 'Tvorba webu',
        seo: 'SEO',
        branding: 'Brand identita',
        print: 'Tisk & Produkce',
      },
      web: {
        title: 'Tvorba webu',
        lead:
          'Weby na míru od návrhu po spuštění. Máte vlastní grafiku? Super. Nemáte? Vymyslíme ji s vámi. Ať už přijdete s jasným plánem nebo jen nápadem, postavíme vám funkční web.',
        bullets: {
          i1: 'Vlastní design nebo přineste svůj',
          i2: 'Od nápadu k funkčnímu webu',
          i3: 'Responzivní, rychlý, SEO-ready',
          i4: 'Design i vývoj na jednom místě',
        },
        showcaseTitle: 'Vybrané projekty',
        showcase: {
          s1: {
            title: 'Pragoline',
            note: 'Tiskárna a obalová výroba, s dynamickým SEO a custom animacemi',
            href: 'https://pragoline.cz',
            preview: '/previews/pragoline.webp',
          },
          s2: {
            title: 'Decor Art Studio',
            note: 'Moderní povrchy, web s jednoduchou administrací obsahu a galerií',
            href: 'https://decorartstudio.netlify.app',
            preview: '/previews/decorart.webp',
          },
          s3: {
            title: 'Hawks Security',
            note: 'Bezpečnostní firma, čistý B2B landing s lead capture',
            href: 'https://hawks-security.com',
            preview: '/previews/hawks.webp',
          },
          s4: {
            title: 'Falafelova',
            note: 'Street food restaurace, jednostránkový web s menu a objednávkovými tlačítky',
            href: 'https://falafe-lova.cz',
            preview: '/previews/falafelova.webp',
          },
          s5: {
            title: 'Movi-n',
            note: 'Stěhovací služby, moderní web s konfigurátorem cen na míru',
            href: 'https://movi-n.cz/',
            preview: '/previews/movin.webp',
          },
        },
        cta: 'Chcete web, který opravdu konvertuje? Napište nám.',
      },
      seo: {
        title: 'SEO',
        lead:
          'Špičkové SEO, které vás dostane nahoru. Bez kouzel a triků — jen rychlý web a výsledky ve vyhledávání. Aby vás našli ti, co vás hledají.',
        bullets: {
          i1: 'Viditelnost ve vyhledávačích',
          i2: 'Rychlé weby, které se najdou',
          i3: 'Bez keců, jen výsledky',
          i4: 'Technický základ + strategie obsahu',
        },
        cta: 'Najdeme rychlá zlepšení a postavíme dlouhodobý plán.',
      },
      branding: {
        title: 'Brand identita',
        lead:
          'Navrhujeme značky od loga po katalog. Vybereme barvy, písmo i styl, vytvoříme brand manuál i tiskoviny. A pokud budete chtít, rovnou je i vytiskneme.',
        bullets: {
          i1: 'Od loga po kompletní manuál',
          i2: 'Barvy, písmo a stylové směrnice',
          i3: 'Design tiskových materiálů',
          i4: 'Rovnou to i vytiskneme',
        },
        cta: 'Začněme mini identitou, nebo rovnou celým manuálem.',
      },
      print: {
        title: 'Tisk & Produkce',
        lead:
          'Zvládáme i tisk: vizitky, letáky, plakáty, samolepky, bannery, obaly, katalogy a další. Design i tisk na jednom místě.',
        bullets: {
          i1: 'Od vizitek po bannery',
          i2: 'Katalogy, letáky, obaly',
          i3: 'Design i tisk pohromadě',
          i4: 'Od souboru k hotovému produktu',
        },
        cta: 'Pošlete podklady nebo cíl — připravíme, vytiskneme, doručíme.',
      },
    },
  },
};
