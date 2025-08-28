// src/phaser/scenes/MainScene.ts
import Phaser from 'phaser';

type MenuSection =
  | 'about' | 'services' | 'pricing' | 'blog'
  | 'contact' | 'terms' | 'gdpr' | 'home';

const BASE_W = 2560;
const BASE_H = 1440;
const DISK_PX = 200;

// stejný odstín jako glow u diskety "home"
const GLOW_COLOR_HEX = 0x7df9ff;
const GLOW_COLOR_CSS = '#7df9ff';

export class MainScene extends Phaser.Scene {
  constructor() { super('MainScene'); }

  private bg!: Phaser.GameObjects.Image;
  private disks: Partial<Record<MenuSection, Phaser.GameObjects.Image>> = {};
  private baseY: Partial<Record<MenuSection, number>> = {};

  // Labely + jejich relativní offset k disketám
  private labels: Partial<Record<MenuSection, Phaser.GameObjects.Text>> = {};
  private labelOffsetY: Partial<Record<MenuSection, number>> = {};

  private led!: Phaser.GameObjects.Rectangle;
  private screenOverlay!: Phaser.GameObjects.Rectangle;
  private screenText!: Phaser.GameObjects.Text;
  private screenTextTitle!: Phaser.GameObjects.Text;  // rotující titulky
  private screenTextHint!: Phaser.GameObjects.Text;   // INSERT DISK
  private slot!: { x: number; y: number };
  private isBusy = false;

  preload() {
    const isTall = window.innerHeight > window.innerWidth;
    const mapFile = isTall ? '/scene_land_height.json' : '/scene_land.json';
    const bgFile = isTall ? '/background_height.png' : '/background_main.png';

    this.load.tilemapTiledJSON('map', mapFile);
    this.load.image('bg', bgFile);

    this.load.image('disk_about', '/disk_about.png');
    this.load.image('disk_services', '/disk_services.png');
    this.load.image('disk_pricing', '/disk_pricing.png');
    this.load.image('disk_blog', '/disk_blog.png');
    this.load.image('disk_contact', '/disk_contact.png');
    this.load.image('disk_terms', '/disk_terms.png');
    this.load.image('disk_gdpr', '/disk_gdpr.png');
    this.load.image('disk_home', '/disk_home.png');
  }

  create() {
    this.textures.getTextureKeys().forEach(k =>
      this.textures.get(k)?.setFilter(Phaser.Textures.FilterMode.NEAREST)
    );

    const map = this.make.tilemap({ key: 'map' });
    const ents = this.readEntities(map, 'entities');

    const bgImg = this.textures.get('bg').getSourceImage() as HTMLImageElement;
    const worldW = (bgImg as any).naturalWidth || bgImg.width;
    const worldH = (bgImg as any).naturalHeight || bgImg.height;

    this.cameras.main.setBounds(0, 0, worldW, worldH);
    this.cameras.main.setRoundPixels(true);

    this.bg = this.add.image(0, 0, 'bg').setOrigin(0);
    this.bg.setDisplaySize(worldW, worldH);

    this.led = this.add.rectangle(ents.led.x, ents.led.y, 8, 8, 0xff2e2e).setVisible(false);

    const cx = ents.screen.x + ents.screen.w / 2;
    const cy = ents.screen.y + ents.screen.h / 2;

    this.screenOverlay = this.add.rectangle(cx, cy, ents.screen.w, ents.screen.h, 0xffffff, 0.18)
      .setBlendMode(Phaser.BlendModes.SCREEN)
      .setVisible(false);

    const base = Math.min(ents.screen.w, ents.screen.h);
    const fontSize = Math.round(base * 0.18);
    const dpr = Math.min(3, Math.max(1, window.devicePixelRatio || 1));

    // LOADING (schovaný dokud se neklikne na disketu)
    this.screenText = this.add.text(cx, cy, 'LOADING…', {
      fontFamily: 'jersey25, monospace',
      fontSize: `${fontSize}px`,
      color: '#9effa6',
      align: 'center',
      resolution: dpr,
    }).setOrigin(0.5).setVisible(false);

    // --- perma texty ---
    const titleSize = Math.round(base * 0.18);
    const hintSize = Math.round(base * 0.18);

    const titleY = ents.screen.y + ents.screen.h * 0.35;
    const hintY = ents.screen.y + ents.screen.h * 0.65;

    const titles = ["WEBDESIGN", "SEO", "BRANDING", "COPYWRITING"];
    let titleIndex = 0;

    this.screenTextTitle = this.add.text(cx, titleY, titles[titleIndex], {
      fontFamily: 'jersey25, monospace',
      fontSize: `${titleSize}px`,
      color: '#9effa6',
      align: 'center',
      resolution: dpr,
    })
      .setOrigin(0.5)
      .setVisible(true);

    // --- CRT scanline pomocná funkce ---
    const flashScanline = () => {
      const line = this.add.rectangle(
        cx, ents.screen.y,
        ents.screen.w, 2, 0xffffff, 0.22
      )
        .setBlendMode(Phaser.BlendModes.SCREEN)
        .setAlpha(0)
        .setDepth(900);

      this.tweens.add({
        targets: line,
        alpha: { from: 0, to: 0.5 },
        y: ents.screen.y + ents.screen.h,
        duration: 180,
        ease: 'Quad.easeIn',
        onComplete: () => line.destroy()
      });
    };

    // --- retro přepnutí titulku ---
    const retroSwap = async (nextText: string) => {
      const t = this.screenTextTitle;

      // mikro-jitter
      this.tweens.add({
        targets: t,
        y: { from: t.y, to: t.y - 2 },
        duration: 28,
        yoyo: true,
        repeat: 3,
        ease: 'Sine.easeInOut'
      });

      flashScanline();
      await this.tween({
        targets: t,
        alpha: { from: 1, to: 0 },
        scaleX: { from: 1.00, to: 1.04 },
        scaleY: { from: 1.00, to: 0.96 },
        duration: 120,
        ease: 'Quad.easeIn'
      });

      t.setText(nextText);
      t.setScale(1.06, 0.94);

      await this.tween({
        targets: t,
        alpha: { from: 0, to: 1 },
        scaleX: { from: 1.06, to: 1.00 },
        scaleY: { from: 0.94, to: 1.00 },
        duration: 220,
        ease: 'Cubic.easeOut'
      });

      this.tweens.add({
        targets: t,
        alpha: { from: 1, to: 0.9 },
        duration: 260,
        yoyo: true,
        repeat: 0,
        ease: 'Sine.easeInOut',
        delay: 40
      });
    };

    this.time.addEvent({
      delay: 2200,
      loop: true,
      callback: () => {
        titleIndex = (titleIndex + 1) % titles.length;
        retroSwap(titles[titleIndex]);
      }
    });

    this.screenTextHint = this.add.text(cx, hintY, 'INSERT DISK', {
      fontFamily: 'jersey25, monospace',
      fontSize: `${hintSize}px`,
      color: '#9effa6',
      align: 'center',
      resolution: 3,
    }).setOrigin(0.5).setVisible(true);

    this.tweens.add({
      targets: this.screenTextHint,
      alpha: { from: 1, to: 0.3 },
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // === disky + NÁZVY NAD NIMI (stejná barva + glow/puls jako home) ===
    (Object.keys(ents.disks) as MenuSection[]).forEach((name) => {
      const p = ents.disks[name]!;
      const key = `disk_${name}`;

      const img = this.add.image(Math.round(p.x), Math.round(p.y), key)
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      const tex = this.textures.get(key).getSourceImage() as HTMLImageElement;
      const scale = DISK_PX / tex.width;
      img.setScale(scale);

      this.baseY[name] = img.y;

      // Label (název) — stejná barva jako glow + stejné pulzování
      const labelFontPx = Math.round(DISK_PX * 0.14); // cca 44 px při DISK_PX=200
      const labelGap = Math.round(DISK_PX * 0.45);    // vzdálenost nad disketou

      const label = this.add.text(img.x, img.y - labelGap, this.getLabel(name), {
        fontFamily: 'jersey25, monospace',
        fontSize: `${labelFontPx}px`,
        color: GLOW_COLOR_CSS,
        align: 'center',
        resolution: Math.min(3, Math.max(1, window.devicePixelRatio || 1)),
      }).setOrigin(0.5);

      // stejné pulzující glow jako u „home“ (postFX, pokud je k dispozici)
      this.applyGlowPulse(label, { weak: true });

      // uložíme si rel. offset, aby při hoveru držel rozestup
      this.labels[name] = label;
      this.labelOffsetY[name] = label.y - img.y;

      // hover animace: disketu i label posunu spolu
      img.on('pointerover', () => {
        const baseImgY = this.baseY[name] ?? img.y;
        const targetImgY = Math.round(baseImgY - 8);
        const off = this.labelOffsetY[name] ?? -labelGap;
        const targetLabelY = targetImgY + off;

        this.tweens.killTweensOf(img);
        this.tweens.killTweensOf(label);

        this.tweens.add({ targets: img, y: targetImgY, duration: 140, ease: 'Quad.easeOut' });
        this.tweens.add({ targets: label, y: targetLabelY, duration: 140, ease: 'Quad.easeOut' });
      });

      img.on('pointerout', () => {
        const baseImgY = Math.round(this.baseY[name] ?? img.y);
        const off = this.labelOffsetY[name] ?? -labelGap;
        const baseLabelY = baseImgY + off;

        this.tweens.killTweensOf(img);
        this.tweens.killTweensOf(label);

        this.tweens.add({ targets: img, y: baseImgY, duration: 160, ease: 'Quad.easeIn' });
        this.tweens.add({ targets: label, y: baseLabelY, duration: 160, ease: 'Quad.easeIn' });
      });

      img.on('pointerup', () => this.insertDisk(name));

      // ponechám i původní glow na „home“, ale sjednotím způsob voláním helperu
      if (name === 'home') {
        this.applyGlowPulse(img);
      }

      this.disks[name] = img;
    });

    this.slot = ents.slot;
  }

  // ===== helpers =====

  // Aplikuje na GameObject stejný glow/puls jako používáš u „home“ (pokud je k dispozici postFX).
  private applyGlowPulse(
    go: Phaser.GameObjects.GameObject,
    opts?: { weak?: boolean }   // weak = pro text
  ) {
    const isWeak = !!opts?.weak;

    // když je k dispozici postFX glow
    const anyGo = go as any;
    if (anyGo.postFX && typeof anyGo.postFX.addGlow === 'function') {
      // disketám necháme původní sílu, textům výrazně ztlumíme
      const start = isWeak ? 0.4 : 4;
      const end = isWeak ? 1.0 : 10;

      const fx = anyGo.postFX.addGlow(0x7df9ff, start, 0, false);
      this.tweens.add({
        targets: fx,
        outerStrength: { from: start, to: end },
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
      return;
    }

    // Fallback (kdyby Text neměl postFX): velmi jemné „dýchání“
    this.tweens.add({
      targets: go,
      alpha: isWeak ? { from: 1, to: 0.96 } : { from: 1, to: 0.88 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  // překládací helper: vezme window.t('nav.xxx') nebo window.translations[..].nav[..], jinak fallback
  private getLabel(section: MenuSection): string {
    const w = window as any;
    if (typeof w.t === 'function') {
      try {
        const s = w.t(`nav.${section}`);
        if (s && typeof s === 'string') return s;
      } catch { /* noop */ }
    }
    const lang = w.currentLang || w.lang || 'en';
    const fromDict = w.translations?.[lang]?.nav?.[section];
    return (typeof fromDict === 'string' && fromDict) ? fromDict : section.toUpperCase();
  }

  private centerOf(obj: any) {
    if (!obj.width && !obj.height) return { x: Math.round(obj.x), y: Math.round(obj.y) };
    return {
      x: Math.round((obj.x ?? 0) + (obj.width ?? 0) / 2),
      y: Math.round((obj.y ?? 0) + (obj.height ?? 0) / 2),
    };
  }

  private readEntities(map: Phaser.Tilemaps.Tilemap, layerName: string) {
    const layer = map.getObjectLayer(layerName);
    if (!layer) throw new Error(`Missing object layer "${layerName}" in Tiled JSON`);

    const disks: Partial<Record<MenuSection, { x: number; y: number }>> = {};
    let slot = { x: 0, y: 0 };
    let led = { x: 0, y: 0 };
    let screen = { x: 0, y: 0, w: 0, h: 0 };

    for (const raw of layer.objects) {
      const name = (raw.name || '').toLowerCase();

      if (['about', 'services', 'pricing', 'blog', 'contact', 'terms', 'gdpr', 'home'].includes(name)) {
        const c = this.centerOf(raw);
        (disks as any)[name] = c;
      } else if (name === 'slot') {
        slot = this.centerOf(raw);
      } else if (name === 'led') {
        led = this.centerOf(raw);
      } else if (name === 'screen') {
        screen = {
          x: Math.round(raw.x ?? 0),
          y: Math.round(raw.y ?? 0),
          w: Math.round(raw.width ?? 0),
          h: Math.round(raw.height ?? 0),
        };
      }
    }
    return { disks, slot, led, screen };
  }

  private tween(cfg: Phaser.Types.Tweens.TweenBuilderConfig) {
    return new Promise<void>((resolve) => {
      this.tweens.add({ ...cfg, onComplete: () => resolve(), onCompleteScope: this });
    });
  }
  private wait(ms: number) { return new Promise<void>((r) => this.time.delayedCall(ms, r)); }

  private async insertDisk(section: MenuSection) {
    if (this.isBusy) return;
    this.isBusy = true;

    const src = this.disks[section]!;
    if (!src) { this.isBusy = false; return; }

    // --- laditelné konstanty ---
    const STAGE_MARGIN = 150;     // čím VĚTŠÍ číslo, tím VÝŠ nad spodkem se zastaví mezipozice
    const FINAL_INSET = 22;       // o kolik px se má „zasunout dovnitř“ v závěru
    const PERSPECTIVE = 0.98;     // jemné zmenšení při zasunutí (1 = vypnout)

    // Připravíme „létající“ kopii
    src.disableInteractive();
    src.setAlpha(0.001);

    const flying = this.add.image(Math.round(src.x), Math.round(src.y), src.texture.key)
      .setOrigin(0.5)
      .setDepth(1000)
      .setScale(src.scaleX);

    // 1) mezizastávka u spodního okraje aktuálního VIEWPORTU
    const view = this.cameras.main.worldView;
    const stageX = this.slot.x;
    const stageY = Math.round(view.y + view.height - STAGE_MARGIN);

    await this.tween({
      targets: flying,
      x: stageX,
      y: stageY,
      duration: 520,
      ease: 'Cubic.easeInOut'
    });

    // 2) kolmo nahoru k úrovni slotu
    await this.tween({
      targets: flying,
      x: stageX,
      y: this.slot.y,
      duration: 640,
      ease: 'Cubic.easeInOut'
    });

    // 2b) poslední kousek „dovnitř“ + úplné zmizení + jemná perspektiva
    await this.tween({
      targets: flying,
      y: this.slot.y - FINAL_INSET,
      alpha: { from: 1, to: 0 },
      scale: { from: flying.scaleX, to: flying.scaleX * PERSPECTIVE },
      duration: 180,
      ease: 'Cubic.easeIn'
    });

    // --- zbytek beze změny ---
    this.screenTextTitle.setVisible(false);
    this.screenTextHint.setVisible(false);

    this.led.setVisible(true); await this.wait(220); this.led.setVisible(false);
    this.screenOverlay.setVisible(true);
    this.screenText.setVisible(true);

    await this.wait(900);

    flying.destroy();
    this.screenOverlay.setVisible(false);
    this.screenText.setVisible(false);

    this.game.events.emit('navigate', section);
    this.isBusy = false;
  }
}
