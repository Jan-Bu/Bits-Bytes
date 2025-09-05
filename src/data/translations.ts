import { Translations } from '../types';

export const translations: Translations = {
  en: {
    /* ===== Desktop (ikonky na ploše) ===== */
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
      /* ⬇️ doplněno menu pro zavření hry */
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
    blog: {
      title: 'Latest Blog Posts',
      post1: {
        title: 'The Future of Web Design',
        excerpt: 'Exploring upcoming trends and technologies shaping the digital landscape.',
        date: 'March 15, 2025',
      },
      post2: {
        title: 'Retro Gaming UI in Modern Web',
        excerpt: 'How to incorporate nostalgic gaming elements into contemporary web design.',
        date: 'March 10, 2025',
      },
      post3: {
        title: 'Performance Optimization Tips',
        excerpt: 'Essential techniques to make your website lightning fast.',
        date: 'March 5, 2025',
      },
    },
    contact: {
      title: 'Get In Touch',
      name: 'Name',
      email: 'Email',
      message: 'Message',
      send: 'Send Message',
      info: "Ready to start your project? Drop us a line and let's create something amazing together.",
    },
    terms: {
      title: 'Terms & Conditions',
      content:
        'These terms and conditions outline the rules and regulations for the use of Bits&Bytes services. By accessing and using our services, you accept these terms and conditions in full...',
    },
    gdpr: {
      title: 'GDPR & Privacy Policy',
      content:
        'We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data and your privacy rights...',
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
          'Custom websites with clean code, fast load, and a design that fits your brand — not the other way around.',
        bullets: {
          i1: 'React/TypeScript front-ends with pixel-perfect details',
          i2: 'Responsive by default, accessible by design',
          i3: 'Performance first: image strategy, lazy-loading, code-splitting',
          i4: "CMS or headless hookup when you need it, not when you don't",
        },
        showcaseTitle: 'Selected Work',
        showcase: {
          s1: {
            title: 'Pragoline.cz',
            note: 'Packaging & printing company, with dynamic SEO and custom animations',
            href: 'https://pragoline.cz',
            preview: '/public/previews/pragoline.webp',
          },
          s2: {
            title: 'Decor Art Studio',
            note: 'Decorative plasters, website with simple content management and gallery',
            href: 'https://decorartstudio.netlify.app',
            preview: '/public/previews/decorart.webp',
          },
          s3: {
            title: 'Hawks Security',
            note: 'Security company, clean B2B landing with lead capture',
            href: 'https://hawks-security.com',
            preview: '/public/previews/hawks.webp',
          },
          s4: {
            title: 'Falafelova',
            note: 'Food service, one-pager with menu and order buttons',
            href: 'https://falafe-lova.cz',
            preview: '/public/previews/falafelova.webp',
          },
        },
        seo: {
          title: 'SEO',
          lead:
            'Real-world SEO without buzzwords — technical health, content that makes sense, and pages that get found.',
          bullets: {
            i1: 'Technical SEO: structure, meta, schema, sitemap, Core Web Vitals',
            i2: 'On-page: content hierarchy, internal links, intent-driven copy',
            i3: 'Performance: lighthouse-friendly build, caching & CDN',
            i4: 'Analytics: privacy-minded tracking and clear reporting',
          },
          cta: 'We’ll find quick wins and plan the long game.',
        },
        branding: {
          title: 'Brand Identity',
          lead:
            'From logo and colors to full brand manual. One look. One voice. Everywhere.',
          bullets: {
            i1: 'Logo systems (primary/secondary/mark)',
            i2: 'Color & type scales that survive the real world',
            i3: 'UI kits for web & socials',
            i4: 'Brand guide you’ll actually use',
          },
          cta: 'Start with a mini-identity or go full brand manual.',
        },
        print: {
          title: 'Print & Production',
          lead:
            'Design and printing under one roof — from business cards to banners and packaging.',
          bullets: {
            i1: 'Business cards, flyers, stickers, posters, roll-ups',
            i2: 'Catalogs, brochures, booklets',
            i3: 'Packaging mockups and production files',
            i4: 'Large-format & outdoor ads',
          },
          cta: 'Send specs or just the goal — we’ll prep, print, and deliver.',
        },
      },
    },
  },

  cs: {
    /* ===== Desktop (ikonky na ploše) ===== */
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
      /* ⬇️ doplněno menu pro zavření hry */
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
    blog: {
      title: 'Nejnovější příspěvky',
      post1: {
        title: 'Budoucnost webového designu',
        excerpt: 'Zkoumání nadcházejících trendů a technologií, které formují digitální prostředí.',
        date: '15. března 2025',
      },
      post2: {
        title: 'Retro herní UI v moderním webu',
        excerpt: 'Jak začlenit nostalgické herní prvky do současného webového designu.',
        date: '10. března 2025',
      },
      post3: {
        title: 'Tipy pro optimalizaci výkonu',
        excerpt: 'Základní techniky pro vytvoření bleskově rychlých webových stránek.',
        date: '5. března 2025',
      },
    },
    contact: {
      title: 'Kontaktujte nás',
      name: 'Jméno',
      email: 'Email',
      message: 'Zpráva',
      send: 'Odeslat zprávu',
      info: 'Jste připraveni začít svůj projekt? Napište nám a společně vytvoříme něco úžasného.',
    },
    terms: {
      title: 'Obchodní podmínky',
      content:
        'Tyto obchodní podmínky stanovují pravidla a předpisy pro používání služeb Bits&Bytes. Přístupem a používáním našich služeb přijímáte tyto obchodní podmínky v plném rozsahu...',
    },
    gdpr: {
      title: 'GDPR a Zásady ochrany osobních údajů',
      content:
        'Respektujeme vaše soukromí a zavázali jsme se chránit vaše osobní údaje. Tyto zásady ochrany osobních údajů vás informují o tom, jak se staráme o vaše osobní údaje a vaše práva na ochranu soukromí...',
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
        sub: 'Od nápadu po kód — a vše k tisku, co budete potřebovat.',
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
          'Weby na míru s čistým kódem, rychlým načítáním a designem, který sedí vaší značce — ne naopak.',
        bullets: {
          i1: 'Front-end v React/TypeScript s pixel-precizností',
          i2: 'Responzivně od základu, přístupnost jako standard',
          i3: 'Výkon na prvním místě: obrázky, lazy-loading, code-split',
          i4: 'Napojení na CMS/headless, když to dává smysl',
        },
        showcaseTitle: 'Vybrané projekty',
        showcase: {
          s1: {
            title: 'Pragoline.cz',
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
          cta: 'Chcete web, který opravdu konvertuje? Napište nám.',
        },
      },
      seo: {
        title: 'SEO',
        lead:
          'SEO do praxe — technický stav, smysluplný obsah a stránky, které lidé najdou.',
        bullets: {
          i1: 'Technické SEO: struktura, meta, schema, sitemap, Vitals',
          i2: 'On-page: hierarchie obsahu, interní prolinkování, záměr',
          i3: 'Výkon: lighthouse-friendly build, cache & CDN',
          i4: 'Analytika: respekt k soukromí a srozumitelné reporty',
        },
        cta: 'Najdeme rychlá zlepšení a postavíme dlouhodobý plán.',
      },
      branding: {
        title: 'Brand identita',
        lead:
          'Od loga a barev po kompletní manuál. Jeden vzhled. Jeden hlas. Všude.',
        bullets: {
          i1: 'Logo systémy (primární/sekundární/znak)',
          i2: 'Barevnost a písmo, které přežijí realitu',
          i3: 'UI kity pro web i sítě',
          i4: 'Brand manuál, který budete používat',
        },
        cta: 'Začněme mini identitou, nebo rovnou celým manuálem.',
      },
      print: {
        title: 'Tisk & Produkce',
        lead:
          'Design i tisk na jednom místě — od vizitek po bannery a obaly.',
        bullets: {
          i1: 'Vizitky, letáky, samolepky, plakáty, roll-upy',
          i2: 'Katalogy, brožury, sešity',
          i3: 'Obalové návrhy a podklady pro výrobu',
          i4: 'Velkoformát & outdoor',
        },
        cta: 'Pošlete podklady nebo cíl — připravíme, vytiskneme, doručíme.',
      },
    },
  },
};
