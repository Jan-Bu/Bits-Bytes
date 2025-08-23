// src/phaser/scenes/MainScene.ts
import Phaser from 'phaser';

type MenuSection =
  | 'about' | 'services' | 'pricing' | 'blog'
  | 'contact' | 'terms' | 'gdpr' | 'home';

const BASE_W = 2560;
const BASE_H = 1440;
const DISK_PX = 200; // cílová šířka v px (např. zdroj 400px => scale 0.5)

export class MainScene extends Phaser.Scene {
  constructor() { super('MainScene'); }

  private bg!: Phaser.GameObjects.Image;
  private worldUnderlay!: Phaser.GameObjects.Rectangle;        // 🔳 černé pozadí pod světem

  private disks: Partial<Record<MenuSection, Phaser.GameObjects.Image>> = {};
  private baseY: Partial<Record<MenuSection, number>> = {};    // uložíme si „původní Y“

  private led!: Phaser.GameObjects.Rectangle;
  private screenOverlay!: Phaser.GameObjects.Rectangle;
  private screenText!: Phaser.GameObjects.Text;
  private slot!: { x: number; y: number };

  private isBusy = false;

  // 📱 overlay pro otočení zařízení (pixel-art rotate.png)
  private rotateOverlay!: Phaser.GameObjects.Container;
  private rotateShade!: Phaser.GameObjects.Rectangle;           // černé (neprůhledné) pozadí overlaye
  private rotateIcon!: Phaser.GameObjects.Image;                // tvoje /ui/rotate.png
  private isHandheld = false;

  preload() {
    // ⬇️ Rozhodnutí podle poměru stran v okamžiku načítání hry
    const { width, height } = this.scale.gameSize;
    const isWidescreen = width >= height;
    const mapFile = isWidescreen ? '/scene_land.json' : '/scene_land_height.json';

    this.load.tilemapTiledJSON('map', mapFile);
    this.load.image('bg', '/background_main.png');

    this.load.image('disk_about', '/disk_about.png');
    this.load.image('disk_services', '/disk_services.png');
    this.load.image('disk_pricing', '/disk_pricing.png');
    this.load.image('disk_blog', '/disk_blog.png');
    this.load.image('disk_contact', '/disk_contact.png');
    this.load.image('disk_terms', '/disk_terms.png');
    this.load.image('disk_gdpr', '/disk_gdpr.png');
    this.load.image('disk_home', '/disk_home.png');

    // 🔔 tvoje pixel-art ikona
    this.load.image('rotate_hint', '/ui/rotate.png');
  }

  create() {
    // ostré textury
    this.textures.getTextureKeys().forEach(k => this.textures.get(k)?.setFilter(Phaser.Textures.FilterMode.NEAREST));

    // 🔳 Černý podklad za normálním backgroundem (uvnitř herního světa)
    this.worldUnderlay = this.add
      .rectangle(0, 0, BASE_W, BASE_H, 0x000000, 1)
      .setOrigin(0)
      .setDepth(-1000); // úplně vzadu

    // pozadí + kamera
    this.bg = this.add.image(0, 0, 'bg').setOrigin(0);
    this.cameras.main.setBounds(0, 0, BASE_W, BASE_H);
    this.cameras.main.setRoundPixels(true);

    // načíst Tiled + entities
    const map = this.make.tilemap({ key: 'map' });
    const ents = this.readEntities(map, 'entities');

    // LED + overlay
    this.led = this.add.rectangle(ents.led.x, ents.led.y, 8, 8, 0xff2e2e).setVisible(false);

    const cx = ents.screen.x + ents.screen.w / 2;
    const cy = ents.screen.y + ents.screen.h / 2;
    this.screenOverlay = this.add.rectangle(cx, cy, ents.screen.w, ents.screen.h, 0xffffff, 0.18)
      .setBlendMode(Phaser.BlendModes.SCREEN)
      .setVisible(false);
    this.screenText = this.add.text(cx, cy, 'LOADING…', {
      fontFamily: 'monospace',
      fontSize: `${Math.round(Math.min(ents.screen.w, ents.screen.h) * 0.12)}px`,
      color: '#9effa6',
      align: 'center',
    }).setOrigin(0.5).setVisible(false);

    // diskety
    (Object.keys(ents.disks) as MenuSection[]).forEach((name) => {
      const p = ents.disks[name]!;
      const key = `disk_${name}`;

      const img = this.add.image(Math.round(p.x), Math.round(p.y), key)
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      const tex = this.textures.get(key).getSourceImage() as HTMLImageElement;
      const scale = DISK_PX / tex.width; // např. 400 -> 200 => 0.5
      img.setScale(scale);

      // uložíme „původní Y“
      this.baseY[name] = img.y;

      // HOVER: drž pozici výš po dobu hoveru (žádné yoyo, žádné světlo)
      img.on('pointerover', () => {
        this.tweens.killTweensOf(img);
        this.tweens.add({
          targets: img,
          y: Math.round((this.baseY[name] ?? img.y) - 8),
          duration: 140,
          ease: 'Quad.easeOut'
        });
      });

      img.on('pointerout', () => {
        this.tweens.killTweensOf(img);
        this.tweens.add({
          targets: img,
          y: Math.round(this.baseY[name] ?? img.y),
          duration: 160,
          ease: 'Quad.easeIn'
        });
      });

      img.on('pointerup', () => this.insertDisk(name));

      // Aktivní HOME: jemný pulz (ostatní bez světla)
      if (name === 'home' && (img as any).postFX) {
        const fx = (img as any).postFX.addGlow(0x7df9ff, 4, 0, false);
        this.tweens.add({
          targets: fx,
          outerStrength: { from: 4, to: 10 },
          duration: 1500,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }

      this.disks[name] = img;
    });

    this.slot = ents.slot;

    // 📱 Overlay pro otočení – jen pro handheld zařízení
    this.isHandheld = !this.sys.game.device.os.desktop;
    this.createRotateHint();
    this.updateRotateHint();

    // reaguj na otočení/resize
    this.scale.on(Phaser.Scale.Events.ORIENTATION_CHANGE, this.updateRotateHint, this);
    this.scale.on(Phaser.Scale.Events.RESIZE, this.updateRotateHint, this);

    // úklid listenerů při ukončení scény
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.ORIENTATION_CHANGE, this.updateRotateHint, this);
      this.scale.off(Phaser.Scale.Events.RESIZE, this.updateRotateHint, this);
    });
  }

  // ===== helpers =====
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

  // ===== overlay s rotate ikonou =====
  private createRotateHint() {
    const w = this.scale.width;
    const h = this.scale.height;

    this.rotateOverlay = this.add.container(0, 0)
      .setDepth(10_000)
      .setScrollFactor(0)
      .setVisible(false);

    // 🔳 černé NEPRŮHLEDNÉ pozadí, blokuje kliky
    this.rotateShade = this.add.rectangle(0, 0, w, h, 0x000000, 1)
      .setOrigin(0)
      .setInteractive();
    this.rotateOverlay.add(this.rotateShade);

    // ikona (pixel-art)
    this.textures.get('rotate_hint')?.setFilter(Phaser.Textures.FilterMode.NEAREST);
    this.rotateIcon = this.add.image(w / 2, h / 2, 'rotate_hint').setOrigin(0.5);
    this.rotateOverlay.add(this.rotateIcon);
  }

  private updateRotateHint = () => {
    const w = this.scale.width;
    const h = this.scale.height;

    this.rotateShade.setSize(w, h);

    const src = this.textures.get('rotate_hint').getSourceImage() as HTMLImageElement;
    const target = Math.min(w, h) * 0.28;
    const floatScale = target / src.width;
    const intScale = Math.max(1, Math.floor(floatScale));
    this.rotateIcon.setScale(intScale).setPosition(Math.round(w / 2), Math.round(h / 2));

    // ⬇️ PŮVODNĚ (vyhoď)
    // const isPortrait = this.scale.orientation === Phaser.Scale.PORTRAIT || w < h;

    // ✅ NEJJEDNODUŠŠÍ A SPOLEHLIVÉ
    const isPortrait = h > w;

    this.rotateOverlay.setVisible(this.isHandheld && isPortrait);
  };

  // ===== vkládání diskety + navigace =====
  private async insertDisk(section: MenuSection) {
    if (this.isBusy) return;
    this.isBusy = true;

    const src = this.disks[section]!;
    if (!src) { this.isBusy = false; return; }

    // zneaktivni a skryj zdroj, ať nejde klikat opakovaně
    src.disableInteractive();
    const originalAlpha = src.alpha;
    src.setAlpha(0.001);

    // klon pro let
    const flying = this.add.image(Math.round(src.x), Math.round(src.y), src.texture.key)
      .setOrigin(0.5)
      .setDepth(1000)
      .setScale(src.scaleX);

    await this.tween({ targets: flying, x: this.slot.x, y: this.slot.y, duration: 700, ease: 'Cubic.easeInOut' });

    // LED + overlay
    this.led.setVisible(true); await this.wait(220); this.led.setVisible(false);
    this.screenOverlay.setVisible(true); this.screenText.setVisible(true);
    await this.wait(900);

    flying.destroy();
    this.screenOverlay.setVisible(false); this.screenText.setVisible(false);

    // emit pro React wrapper
    this.game.events.emit('navigate', section);

    // (pokud bys na scéně zůstal, vrátíš interakci a alpha zpět:)
    // src.setAlpha(originalAlpha).setInteractive();

    this.isBusy = false;
  }
}
