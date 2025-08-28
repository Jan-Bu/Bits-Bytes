// src/phaser/scenes/MainScene.ts
import Phaser from 'phaser';

type MenuSection =
  | 'about' | 'services' | 'pricing' | 'blog'
  | 'contact' | 'terms' | 'gdpr' | 'home';

const BASE_W = 2560;
const BASE_H = 1440;
const DISK_PX = 200;

export class MainScene extends Phaser.Scene {
  constructor() { super('MainScene'); }

  private bg!: Phaser.GameObjects.Image;
  private disks: Partial<Record<MenuSection, Phaser.GameObjects.Image>> = {};
  private baseY: Partial<Record<MenuSection, number>> = {};
  private led!: Phaser.GameObjects.Rectangle;
  private screenOverlay!: Phaser.GameObjects.Rectangle;
  private screenText!: Phaser.GameObjects.Text;
  private screenTextTitle!: Phaser.GameObjects.Text;  // WEBDESIGN
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

    // LOADING text (schovaný dokud se neklikne na disketu)
    this.screenText = this.add.text(cx, cy, 'LOADING…', {
      fontFamily: 'monospace',
      fontSize: `${fontSize}px`,
      color: '#9effa6',
      align: 'center',
      resolution: dpr,
    }).setOrigin(0.5).setVisible(false);

    // --- nové perma texty ---
    const titleSize = Math.round(base * 0.18); // větší font než LOADING
    const hintSize = Math.round(base * 0.14);

    const titleY = ents.screen.y + ents.screen.h * 0.35;
    const hintY = ents.screen.y + ents.screen.h * 0.65;

    this.screenTextTitle = this.add.text(cx, titleY, 'WEBDESIGN', {
      fontFamily: 'jersey25, monospace',
      fontSize: `${titleSize}px`,
      color: '#9effa6',
      align: 'center',
      resolution: dpr,
    }).setOrigin(0.5).setVisible(true);

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

    // disky
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

      img.on('pointerover', () => {
        this.tweens.killTweensOf(img);
        this.tweens.add({
          targets: img,
          y: Math.round((this.baseY[name] ?? img.y) - 8),
          duration: 140,
          ease: 'Quad.easeOut',
        });
      });

      img.on('pointerout', () => {
        this.tweens.killTweensOf(img);
        this.tweens.add({
          targets: img,
          y: Math.round(this.baseY[name] ?? img.y),
          duration: 160,
          ease: 'Quad.easeIn',
        });
      });

      img.on('pointerup', () => this.insertDisk(name));

      if (name === 'home' && (img as any).postFX) {
        const fx = (img as any).postFX.addGlow(0x7df9ff, 4, 0, false);
        this.tweens.add({
          targets: fx,
          outerStrength: { from: 4, to: 10 },
          duration: 1500,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
      }

      this.disks[name] = img;
    });

    this.slot = ents.slot;
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

    src.disableInteractive();
    src.setAlpha(0.001);

    const flying = this.add.image(Math.round(src.x), Math.round(src.y), src.texture.key)
      .setOrigin(0.5)
      .setDepth(1000)
      .setScale(src.scaleX);

    await this.tween({ targets: flying, x: this.slot.x, y: this.slot.y, duration: 700, ease: 'Cubic.easeInOut' });

    // skryj perma texty, ukaž LOADING
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
