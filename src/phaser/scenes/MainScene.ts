// src/phaser/scenes/MainScene.ts
import Phaser from 'phaser';

/**
 * Do této scény při startu posíláme z Reactu:
 *  - navigate(path: string)
 *  - getLang(): 'cs' | 'en'
 *  - setLang(l: 'cs' | 'en')
 *
 * Viz React wrapper:
 *   game.scene.start('MainScene', { navigate, getLang: () => lang, setLang })
 */

const BASE_W = 2560;
const BASE_H = 1440;

type SceneData = {
  navigate: (path: string) => void;
  getLang: () => 'cs' | 'en';
  setLang: (l: 'cs' | 'en') => void;
};

type Entities = {
  screen: { x: number; y: number; w: number; h: number };
  flag: { x: number; y: number };
};

export class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
  }

  private navigate!: (path: string) => void;
  private getLang!: () => 'cs' | 'en';
  private setLang!: (l: 'cs' | 'en') => void;

  private bg!: Phaser.GameObjects.Image;
  private screenZone!: Phaser.GameObjects.Zone;
  private flag!: Phaser.GameObjects.Sprite;
  private clickHere!: Phaser.GameObjects.Text;

  private chosenBgKey: 'bg_day' | 'bg_night' | 'bg_height' = 'bg_day';

  // i18n watcher
  private lastLang: 'cs' | 'en' = 'en';

  // flip guard
  private flagFlipping = false;

  init(data: SceneData) {
    this.navigate = data.navigate;
    this.getLang = data.getLang;
    this.setLang = data.setLang;
  }

  preload() {
    // 1) Rozhodnutí, kterou mapu/pozadí použít
    const isTall = window.innerHeight > window.innerWidth; // mobilní/vertikální
    const prefersDark =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;

    // mapy z Tiled
    this.load.tilemapTiledJSON(
      'map',
      isTall
        ? '/scene_land_height.json'
        : prefersDark
        ? '/scene_land_night.json'
        : '/scene_land_day.json'
    );

    // pozadí (obrázky)
    this.load.image('bg_day', '/background_main_day_v2.pixil.png');
    this.load.image('bg_night', '/background_main_v2_night.png');
    this.load.image('bg_height', '/background_height_v4.png');

    // vlajky
    this.load.image('flag_cz', '/czech_flag.png');
    this.load.image('flag_en', '/british_flag.png');

    // zvolíme klíč bg pro create()
    this.chosenBgKey = isTall ? 'bg_height' : prefersDark ? 'bg_night' : 'bg_day';
  }

  create() {
    // ostré vykreslení
    this.textures.getTextureKeys().forEach((k) => {
      this.textures.get(k)?.setFilter(Phaser.Textures.FilterMode.NEAREST);
    });

    // Načíst mapu a entity
    const map = this.make.tilemap({ key: 'map' });
    const ents = this.readEntities(map, 'entities');

    // Vykreslit pozadí přesně na jeho nativní velikost a nastavit bounds
    const bgImg = this.textures.get(this.chosenBgKey).getSourceImage() as HTMLImageElement;
    const worldW = (bgImg as any).naturalWidth || bgImg.width || BASE_W;
    const worldH = (bgImg as any).naturalHeight || bgImg.height || BASE_H;

    this.cameras.main.setBounds(0, 0, worldW, worldH);
    this.cameras.main.setRoundPixels(true);

    this.bg = this.add.image(0, 0, this.chosenBgKey).setOrigin(0);
    this.bg.setDisplaySize(worldW, worldH);

    // --- CLICK HERE / KLIKNI ZDE text uvnitř obrazovky
    const cx = ents.screen.x + ents.screen.w / 2;
    const cy = ents.screen.y + ents.screen.h / 2;

    const base = Math.min(ents.screen.w, ents.screen.h);
    const fontSize = Math.round(base * 0.18);
    const dpr = Math.min(3, Math.max(1, window.devicePixelRatio || 1));

    this.clickHere = this.add
      .text(cx, cy, '', {
        fontFamily: 'jersey25, monospace',
        fontSize: `${fontSize}px`,
        color: '#9effa6',
        align: 'center',
        resolution: dpr,
      })
      .setOrigin(0.5);

    // jemné blikání
    this.tweens.add({
      targets: this.clickHere,
      alpha: { from: 1, to: 0.35 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Init text podle jazyka + watcher
    this.updateTexts();
    this.time.addEvent({
      delay: 300,
      loop: true,
      callback: () => {
        const cur = this.getLang();
        if (cur !== this.lastLang) this.updateTexts();
      },
    });

    // --- Klikací zóna na monitoru (entity "screen" z mapy)
    this.screenZone = this.add
      .zone(ents.screen.x, ents.screen.y, ents.screen.w, ents.screen.h)
      .setOrigin(0)
      .setInteractive({ cursor: 'pointer' });

    this.screenZone.on('pointerup', () => {
      this.navigate('/desktop');
    });

    // --- Vlajka (entity "flag" z mapy)
    // Logika: když je VIDĚT CZ → app je EN (po kliknutí přepneme na CS)
    const startLang = this.getLang();
    const shownKey = startLang === 'en' ? 'flag_cz' : 'flag_en';

    this.flag = this.add.sprite(ents.flag.x, ents.flag.y, shownKey).setOrigin(0.5, 0.5);
    this.flag.setInteractive({ cursor: 'pointer' });

    // lehce zmenšit (ať sedí na pixel-art)
    const baseScale = 0.6;
    this.flag.setScale(baseScale);

    // hover efekt (nerušit během flipu)
    this.flag.on('pointerover', () => {
      if (this.flagFlipping) return;
      this.tweens.add({ targets: this.flag, scale: baseScale * 1.05, duration: 100, ease: 'Quad.easeOut' });
    });
    this.flag.on('pointerout', () => {
      if (this.flagFlipping) return;
      this.tweens.add({ targets: this.flag, scale: baseScale, duration: 120, ease: 'Quad.easeIn' });
    });

    // klik → FLIP animace + přepnout jazyk + texturu + přepsat text
    this.flag.on('pointerup', async () => {
      if (this.flagFlipping) return;
      this.flagFlipping = true;
      this.flag.disableInteractive();

      // 1) stáhnout do „hrany“ (flip-in)
      await this.tweenAsync({
        targets: this.flag,
        scaleX: 0,
        // volitelné 3D „cvaknutí“
        scaleY: baseScale * 0.96,
        duration: 120,
        ease: 'Cubic.easeIn',
      });

      // 2) přepnout jazyk + texturu v nejtenčím bodě
      {
        const cur = this.getLang();
        const next: 'cs' | 'en' = cur === 'en' ? 'cs' : 'en';
        this.setLang(next);

        const nextShown = next === 'en' ? 'flag_cz' : 'flag_en';
        this.flag.setTexture(nextShown);

        this.updateTexts(); // okamžitý přepis nápisu
      }

      // 3) rozšířit zpět (flip-out)
      await this.tweenAsync({
        targets: this.flag,
        scaleX: baseScale,
        scaleY: baseScale,
        duration: 140,
        ease: 'Cubic.easeOut',
      });

      this.flag.setInteractive({ cursor: 'pointer' });
      this.flagFlipping = false;
    });

    // Reakce na resize (u nás jen škáluje kamera+bg, entity v mapě jsou v px – drží pozici)
    this.scale.on('resize', () => {
      // nic speciálního – kamera je RESIZE mode v configu Reactu
    });
  }

  // ===== helpers =====

  private updateTexts() {
    const lang = this.getLang();
    this.lastLang = lang;
    const label = lang === 'cs' ? 'KLIKNI ZDE' : 'CLICK HERE';
    if (this.clickHere) this.clickHere.setText(label);
  }

  private tweenAsync(cfg: Phaser.Types.Tweens.TweenBuilderConfig) {
    return new Promise<void>((resolve) => {
      this.tweens.add({
        ...cfg,
        onComplete: () => resolve(),
      });
    });
  }

  private readEntities(map: Phaser.Tilemaps.Tilemap, layerName: string): Entities {
    const layer = map.getObjectLayer(layerName);
    if (!layer) throw new Error(`Missing object layer "${layerName}" in Tiled JSON`);

    let screen = { x: 0, y: 0, w: 0, h: 0 };
    let flag = { x: 0, y: 0 };

    for (const raw of layer.objects) {
      const name = (raw.name || '').toLowerCase();
      if (name === 'screen') {
        screen = {
          x: Math.round(raw.x ?? 0),
          y: Math.round(raw.y ?? 0),
          w: Math.round(raw.width ?? 0),
          h: Math.round(raw.height ?? 0),
        };
      } else if (name === 'flag') {
        // vezmeme střed objektu, aby to sedělo i pro rectangle/point
        const fx = Math.round((raw.x ?? 0) + (raw.width ?? 0) / 2);
        const fy = Math.round((raw.y ?? 0) + (raw.height ?? 0) / 2);
        flag = { x: fx, y: fy };
      }
    }

    if (!screen.w || !screen.h) {
      throw new Error('Entity "screen" not found or has zero size in Tiled map.');
    }
    if (!flag.x && !flag.y) {
      // Vlajka není povinná (ale očekáváme ji) – kdyby chyběla, dáme ji do pravého horního rohu
      flag = { x: Math.round((this.game.config.width as number) - 32), y: 32 };
    }

    return { screen, flag };
  }
}
