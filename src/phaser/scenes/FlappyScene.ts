import Phaser from 'phaser';

type GameState = 'menu' | 'playing' | 'gameover' | 'leaderboard' | 'settings';

export class FlappyScene extends Phaser.Scene {
  constructor() {
    super('FlappyScene');
  }

  // Game objects
  private bird!: Phaser.GameObjects.Rectangle | Phaser.GameObjects.Sprite;
  private pipes!: Phaser.Physics.Arcade.Group;
  private ground!: Phaser.GameObjects.Rectangle;
  private scoreText!: Phaser.GameObjects.Text;
  private highScoreText!: Phaser.GameObjects.Text;
  private startText!: Phaser.GameObjects.Text;
  private gameOverText!: Phaser.GameObjects.Text;
  private newHighScoreText!: Phaser.GameObjects.Text;
  private leaderboardText!: Phaser.GameObjects.Text;
  private nameInputContainer?: Phaser.GameObjects.Container;
  private nameInputText?: Phaser.GameObjects.Text;
  private currentPlayerName = '';
  private isTop10 = false;
  private birdSprite?: Phaser.GameObjects.Sprite; // Reference pro sprite s animací
  private background!: Phaser.GameObjects.TileSprite; // Pozadí pro scrollování

  // Menu UI
  private menuContainer?: Phaser.GameObjects.Container;
  private settingsContainer?: Phaser.GameObjects.Container;
  private leaderboardContainer?: Phaser.GameObjects.Container;
  private musicVolume = 0.5; // Default music volume

  // Audio
  private currentMusic?: Phaser.Sound.BaseSound;
  private currentMusicLevel = 0;

  // Game state
  private gameState: GameState = 'menu';
  private score = 0;
  private highScore = 0;
  private pipeTimer?: Phaser.Time.TimerEvent;
  private lastPipeGapY?: number; // Pozice poslední mezery

  // Game settings
  private readonly GRAVITY = 800;
  private readonly JUMP_VELOCITY = -350;
  private readonly BASE_PIPE_SPEED = 200;
  private readonly PIPE_GAP = 180;
  private readonly BASE_PIPE_SPAWN_INTERVAL = 1800;
  private readonly MAX_PIPE_GAP_CHANGE = 150; // Maximální změna výšky mezi trubkami

  // Aktuální rychlost (bude se měnit s levelem)
  private currentPipeSpeed = 200;
  private currentSpawnInterval = 1800;

  preload() {
    // Načítání assetů
    this.load.image('pipe', '/pipe.png');
    this.load.image('background', '/bg_flappy.png');

    // Načtení static obrázku ptáčka (bez pohonu)
    this.load.image('bird_idle', '/bits_static_flappy.png');

    // Načtení sprite sheetu pro raketový pohon (6 framů, každý 400×208px)
    this.load.spritesheet('bird_thrust', '/bits_sprite_flappy.png', {
      frameWidth: 400,
      frameHeight: 208,
    });

    // Načtení zvuků
    this.load.audio('jump', '/sounds/jump.mp3');
    this.load.audio('hit', '/sounds/hit.mp3');
    this.load.audio('point', '/sounds/point.mp3');

    // Načtení hudby pro různé levely
    this.load.audio('music_lvl1', '/sounds/sound_lvl_1.mp3');
    this.load.audio('music_lvl2', '/sounds/sound_lvl_2.mp3');
    this.load.audio('music_lvl3', '/sounds/sound_lvl_3.mp3');
    this.load.audio('music_lvl4', '/sounds/sound_lvl_4.mp3');
  }

  create() {
    const { width, height } = this.scale;

    // Load music volume from localStorage
    const savedVolume = localStorage.getItem('flappyBitsMusicVolume');
    if (savedVolume) {
      this.musicVolume = parseFloat(savedVolume);
    }

    // Pozadí - tilující se horizontálně, roztažené vertikálně
    this.background = this.add.tileSprite(width / 2, height / 2, width, height, 'background');
    this.background.setTileScale(1, height / 512); // Roztáhnout na celou výšku (512px je velikost textury)

    // Ptáček - použít sprite pokud je načtený, jinak placeholder
    if (this.textures.exists('bird_idle') && this.textures.exists('bird_thrust')) {
      // Použít sprite z thrust sprite sheetu
      this.bird = this.physics.add.sprite(100, height / 2, 'bird_thrust', 0);
      this.birdSprite = this.bird as Phaser.GameObjects.Sprite;

      // Zmenšit na polovinu (400×208px → 200×104px)
      this.birdSprite.setScale(0.5);

      // Na začátku nastavit idle texturu
      this.birdSprite.setTexture('bird_idle');

      // Vytvořit animaci pro raketový pohon z sprite sheetu
      this.anims.create({
        key: 'thrust',
        frames: this.anims.generateFrameNumbers('bird_thrust', { start: 0, end: -1 }), // všechny framy
        frameRate: 15,
        repeat: -1, // Opakovat dokola
      });

      // Pro idle použít bird_idle texturu (přepneme texturu místo animace)
      // Idle se nastaví později přepnutím textury
    } else {
      // Fallback - žlutý čtverec jako placeholder
      this.bird = this.add.rectangle(100, height / 2, 40, 40, 0xFFFF00);
      this.physics.add.existing(this.bird);
    }

    const birdBody = this.bird.body as Phaser.Physics.Arcade.Body;
    birdBody.setGravityY(this.GRAVITY);
    birdBody.setCollideWorldBounds(true);

    // Nastavit přesnou collision box jen na viditelnou část panáčka
    // Kresleno ve 100×52px: panáček nahoře, pod tělem 18px prázdných → tělo 34px vysoké
    // Exportováno jako 400×208px: pod tělem 72px prázdných → tělo 136px vysoké
    // Po scale 0.5 (200×104px): tělo od vrchu, výška 68px
    if (this.birdSprite) {
      birdBody.setSize(40, 68); // Přesná velikost těla (šířka 40px, výška 68px)
      birdBody.setOffset(80, 0);  // Offset: (200-40)/2 horizontálně, 0px od vrchu (tělo je nahoře)
    }

    // Skupina pro pipes
    this.pipes = this.physics.add.group({
      allowGravity: false,
      immovable: true,
    });

    // Země (neviditelná collision zone místo zeleného obdélníku)
    this.ground = this.add.rectangle(0, height - 50, width * 2, 50, 0x000000, 0); // Alpha 0 = neviditelné
    this.ground.setOrigin(0, 0);
    this.physics.add.existing(this.ground, true);

    // Načíst high score z localStorage
    this.highScore = parseInt(localStorage.getItem('flappyBitsHighScore') || '0');

    // Score text
    this.scoreText = this.add.text(width / 2, 50, '0', {
      fontSize: '48px',
      color: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(100); // Nastavit vysoký depth aby byl nad pipes

    // High score text (vpravo nahoře)
    this.highScoreText = this.add.text(width - 20, 20, `Best: ${this.highScore}`, {
      fontSize: '24px',
      color: '#ffff00',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(1, 0).setDepth(100);

    // Start text
    this.startText = this.add.text(width / 2, height / 2 - 50, 'Click or Space to Start', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(100);

    // Game over text
    this.gameOverText = this.add.text(width / 2, height / 2 - 150, 'GAME OVER', {
      fontSize: '48px',
      color: '#ff0000',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4,
      align: 'center',
    }).setOrigin(0.5).setVisible(false).setDepth(100);

    // New high score text (zobrazí se jen když hráč je v top 10)
    this.newHighScoreText = this.add.text(width / 2, height / 2 - 90, 'NEW HIGH SCORE!', {
      fontSize: '32px',
      color: '#ffff00',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center',
    }).setOrigin(0.5).setVisible(false).setDepth(100);

    // Leaderboard text (zobrazí se při game over)
    this.leaderboardText = this.add.text(width / 2, height / 2 + 20, '', {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 2,
      align: 'center',
    }).setOrigin(0.5).setVisible(false).setDepth(100);

    // Input
    this.input.on('pointerdown', () => this.handleInput());
    this.input.keyboard?.on('keydown-SPACE', () => this.handleInput());

    // Kolize
    this.physics.add.collider(this.bird, this.ground, () => this.gameOver());
    this.physics.add.overlap(this.bird, this.pipes, () => this.gameOver());

    // Show main menu
    this.showMenu();
  }

  update() {
    // Scrollovat pozadí vždy (i když hra není playing)
    this.background.tilePositionX += 0.5; // Scrollovat doprava rychlostí 0.5px/frame

    if (this.gameState !== 'playing') return;

    const birdBody = this.bird.body as Phaser.Physics.Arcade.Body;

    // Kontrola animace raketového pohonu
    // Pokud ptáček klesá (není ve vzestupném pohybu), přepnout na idle
    if (this.birdSprite && birdBody.velocity.y > 0) {
      if (this.birdSprite.anims.currentAnim?.key === 'thrust') {
        // Zastavit thrust animaci, přepnout na idle texturu
        this.birdSprite.anims.stop();
        this.birdSprite.setTexture('bird_idle');
      }
    }

    // Kontrola, jestli ptáček proletěl pipe (zvýšení skóre)
    // Kontrolujeme jen pipes které mají scored property (horní pipes)
    this.pipes.children.entries.forEach((pipe) => {
      const pipeSprite = pipe as Phaser.GameObjects.Image & { scored?: boolean };

      // Pokud pipe nemá scored property, je to spodní pipe - přeskočit
      if (pipeSprite.scored === undefined) return;

      const pipeBody = pipeSprite.body as Phaser.Physics.Arcade.Body;

      if (!pipeSprite.scored && pipeBody.x + pipeBody.width / 2 < this.bird.x) {
        pipeSprite.scored = true;
        this.score++;
        this.scoreText.setText(this.score.toString());

        // Přehrát zvuk bodu
        this.sound.play('point', { volume: 1.8 });

        // Aktualizovat hudbu podle skóre
        this.updateMusicForScore();
      }
    });

    // Odstranění pipes mimo obrazovku
    this.pipes.children.entries.forEach((pipe) => {
      const pipeImg = pipe as Phaser.GameObjects.Image;
      const pipeBody = pipeImg.body as Phaser.Physics.Arcade.Body;
      if (pipeBody.right < 0) {
        pipe.destroy();
      }
    });

    // Game over když ptáček spadne mimo obrazovku
    if (this.bird.y > this.scale.height) {
      this.gameOver();
    }
  }

  private handleInput() {
    if (this.gameState === 'menu') {
      // Menu clicks are handled by button events
      return;
    } else if (this.gameState === 'playing') {
      this.jump();
    } else if (this.gameState === 'gameover') {
      this.restartGame();
    }
  }

  private startGame() {
    this.gameState = 'playing';
    this.startText.setVisible(false);
    this.scoreText.setVisible(true);

    // Povolit gravitaci zpět
    const birdBody = this.bird.body as Phaser.Physics.Arcade.Body;
    birdBody.setAllowGravity(true);

    // Spustit hudbu level 1 (nastaví rychlost a timer)
    this.playMusicForLevel(1);

    this.jump();
  }

  private jump() {
    if (this.gameState !== 'playing') return;

    const birdBody = this.bird.body as Phaser.Physics.Arcade.Body;
    birdBody.setVelocityY(this.JUMP_VELOCITY);

    // Spustit animaci raketového pohonu při skoku
    if (this.birdSprite) {
      // Zastavit idle, spustit thrust animaci
      this.birdSprite.anims.stop();
      this.birdSprite.play('thrust', true);
    }

    // Přehrát zvuk skoku
    this.sound.play('jump', { volume: 0.08 });
  }

  private spawnPipe() {
    const { width, height } = this.scale;

    // Výpočet výšky mezery s omezením změny oproti předchozí
    let gapY: number;

    if (this.lastPipeGapY === undefined) {
      // První trubka - umístit ji do středu
      gapY = height / 2 - this.PIPE_GAP / 2;
    } else {
      // Následující trubky - omezit změnu výšky
      const minY = Math.max(100, this.lastPipeGapY - this.MAX_PIPE_GAP_CHANGE);
      const maxY = Math.min(height - 150 - this.PIPE_GAP, this.lastPipeGapY + this.MAX_PIPE_GAP_CHANGE);
      gapY = Phaser.Math.Between(minY, maxY);
    }

    this.lastPipeGapY = gapY;

    // Horní pipe (obráceně)
    const topPipe = this.pipes.create(width, gapY, 'pipe') as Phaser.Physics.Arcade.Image & { scored?: boolean };
    topPipe.setOrigin(0.5, 1); // origin dole uprostřed
    topPipe.setFlipY(true); // otočit vzhůru nohama
    topPipe.setVelocityX(-this.currentPipeSpeed);
    topPipe.scored = false; // inicializace scoring flagu
    if (topPipe.body) {
      (topPipe.body as Phaser.Physics.Arcade.Body).setImmovable(true);
      (topPipe.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    }

    // Spodní pipe (normálně) - bez scoring flagu, pouze horní pipe počítá body
    const bottomPipe = this.pipes.create(width, gapY + this.PIPE_GAP, 'pipe') as Phaser.Physics.Arcade.Image;
    bottomPipe.setOrigin(0.5, 0); // origin nahoře uprostřed
    bottomPipe.setVelocityX(-this.currentPipeSpeed);
    if (bottomPipe.body) {
      (bottomPipe.body as Phaser.Physics.Arcade.Body).setImmovable(true);
      (bottomPipe.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    }
  }

  private gameOver() {
    if (this.gameState === 'gameover') return;

    this.gameState = 'gameover';

    // Zastavit timer
    this.pipeTimer?.destroy();

    // Zastavit pipes
    this.pipes.children.entries.forEach((pipe) => {
      const body = (pipe as Phaser.GameObjects.Image).body as Phaser.Physics.Arcade.Body;
      body.setVelocityX(0);
    });

    // Zastavit ptáčka
    const birdBody = this.bird.body as Phaser.Physics.Arcade.Body;
    birdBody.setVelocity(0, 0);
    birdBody.setAllowGravity(false);

    // Zastavit hudbu
    this.stopMusic();

    // Přehrát zvuk kolize
    this.sound.play('hit');

    // Uložit high score a aktualizovat žebříček
    this.updateHighScore();

    // Zobrazit game over screen
    this.showGameOverScreen();
  }

  private async updateHighScore() {
    // Pokud je současné skóre nové high score, uložit lokálně
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('flappyBitsHighScore', this.highScore.toString());
      this.highScoreText.setText(`Best: ${this.highScore}`);
    }
  }

  private async showGameOverScreen() {
    const { height } = this.scale;

    // Zobrazit GAME OVER
    this.gameOverText.setVisible(true);

    // Načíst globální žebříček ze serveru
    try {
      const response = await fetch('/.netlify/functions/leaderboard');

      if (!response.ok) {
        console.error('Leaderboard fetch failed:', response.status, response.statusText);
        throw new Error(`Server returned ${response.status}`);
      }

      const globalScores = await response.json();

      if (!Array.isArray(globalScores)) {
        console.error('Invalid leaderboard data:', globalScores);
        throw new Error('Leaderboard data is not an array');
      }

      // Zjistit jestli je hráč v top 10
      const topScores = globalScores.slice(0, 10);
      this.isTop10 = topScores.some((s: { score: number }) => s.score <= this.score);

      if (this.isTop10) {
        // Hráč je v top 10 - zobrazit NEW HIGH SCORE a input field
        this.newHighScoreText.setVisible(true);

        // Vytvořit input field pro jméno
        this.createNameInput();

        // Zobrazit žebříček s možností zapsat se
        let leaderboardStr = 'Enter your name (max 8 chars):\n\n';
        leaderboardStr += '--- TOP 10 ---\n';

        topScores.forEach((item: { score: number; name: string }, index: number) => {
          const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '  ';
          leaderboardStr += `${medal} ${index + 1}. ${item.name || 'Anonymous'} - ${item.score}\n`;
        });

        this.leaderboardText.setText(leaderboardStr);
        this.leaderboardText.setY(height / 2 + 80);
        this.leaderboardText.setVisible(true);
      } else {
        // Hráč není v top 10 - jen zobrazit žebříček
        let leaderboardStr = `Your Score: ${this.score}\n\n`;
        leaderboardStr += '--- TOP 10 ---\n';

        topScores.forEach((item: { score: number; name: string }, index: number) => {
          const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '  ';
          leaderboardStr += `${medal} ${index + 1}. ${item.name || 'Anonymous'} - ${item.score}\n`;
        });

        leaderboardStr += '\nClick to Restart';

        this.leaderboardText.setText(leaderboardStr);
        this.leaderboardText.setY(height / 2 - 30);
        this.leaderboardText.setVisible(true);
      }
    } catch (error) {
      console.error('Failed to load leaderboard:', error);

      // Fallback
      let leaderboardStr = `Your Score: ${this.score}\n`;
      leaderboardStr += '\nLeaderboard unavailable\nClick to Restart';

      this.leaderboardText.setText(leaderboardStr);
      this.leaderboardText.setVisible(true);
    }
  }

  private createNameInput() {
    const { width, height } = this.scale;

    // Vytvořit container pro input field
    this.nameInputContainer = this.add.container(width / 2, height / 2 - 30);
    this.nameInputContainer.setDepth(100);

    // Pozadí input fieldu
    const inputBg = this.add.rectangle(0, 0, 220, 50, 0x333333);
    inputBg.setStrokeStyle(3, 0xffffff);

    // Text pro zobrazení napsaného jména
    this.nameInputText = this.add.text(0, 0, '_', {
      fontSize: '28px',
      color: '#ffffff',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    this.nameInputContainer.add([inputBg, this.nameInputText]);

    // Přidat keyboard listener pro psaní jména
    this.input.keyboard?.on('keydown', this.handleNameInput, this);
  }

  private handleNameInput(event: KeyboardEvent) {
    if (!this.isTop10 || !this.nameInputText) return;

    if (event.key === 'Enter' && this.currentPlayerName.length > 0) {
      // Potvrdit jméno a odeslat skóre
      this.submitScore();
    } else if (event.key === 'Backspace') {
      // Smazat poslední znak
      this.currentPlayerName = this.currentPlayerName.slice(0, -1);
      this.nameInputText.setText(this.currentPlayerName || '_');
    } else if (event.key.length === 1 && this.currentPlayerName.length < 8) {
      // Přidat znak (jen alfanumerické znaky)
      if (/^[a-zA-Z0-9\s\-_]$/.test(event.key)) {
        this.currentPlayerName += event.key;
        this.nameInputText.setText(this.currentPlayerName);
      }
    }
  }

  private async submitScore() {
    if (!this.currentPlayerName) return;

    try {
      const response = await fetch('/.netlify/functions/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: this.score,
          name: this.currentPlayerName,
        }),
      });

      if (response.ok) {
        // Skóre úspěšně odesláno
        // Odstranit input field
        this.nameInputContainer?.destroy();
        this.nameInputContainer = undefined;
        this.input.keyboard?.off('keydown', this.handleNameInput, this);

        // Zobrazit potvrzení a aktualizovaný žebříček
        this.leaderboardText.setText('Score submitted!\n\nClick to Restart');
        this.leaderboardText.setY(this.scale.height / 2);
      }
    } catch (error) {
      console.error('Failed to submit score:', error);
    }
  }

  private restartGame() {
    this.score = 0;
    this.scoreText.setText('0');
    this.gameOverText.setVisible(false);
    this.newHighScoreText.setVisible(false);
    this.leaderboardText.setVisible(false);

    // Odstranit input field pokud existuje
    if (this.nameInputContainer) {
      this.nameInputContainer.destroy();
      this.nameInputContainer = undefined;
    }

    // Odstranit keyboard listener
    this.input.keyboard?.off('keydown', this.handleNameInput, this);

    // Reset name input state
    this.currentPlayerName = '';
    this.isTop10 = false;

    // Reset rychlosti na výchozí hodnoty
    this.currentPipeSpeed = this.BASE_PIPE_SPEED;
    this.currentSpawnInterval = this.BASE_PIPE_SPAWN_INTERVAL;
    this.currentMusicLevel = 0;

    // Reset ptáčka
    this.bird.setPosition(100, this.scale.height / 2);
    const birdBody = this.bird.body as Phaser.Physics.Arcade.Body;
    birdBody.setVelocity(0, 0);
    birdBody.setAllowGravity(true);

    // Odstranit všechny pipes
    this.pipes.clear(true, true);

    // Reset pozice trubek
    this.lastPipeGapY = undefined;

    // Reset stavu
    this.gameState = 'menu';
    this.showMenu();
  }

  // Hudební systém
  private playMusicForLevel(level: number) {
    // Pokud už tento level hraje, nic nedělat
    if (this.currentMusicLevel === level) return;

    // Aktualizovat rychlost hry podle levelu
    // Každý level = +10% rychlost
    const speedMultiplier = 1 + ((level - 1) * 0.1); // level 1 = 1.0x, level 2 = 1.1x, level 3 = 1.2x, level 4 = 1.3x
    this.currentPipeSpeed = this.BASE_PIPE_SPEED * speedMultiplier;
    this.currentSpawnInterval = this.BASE_PIPE_SPAWN_INTERVAL / speedMultiplier;

    // Aktualizovat spawn timer s novou rychlostí
    if (this.gameState === 'playing') {
      if (this.pipeTimer) {
        this.pipeTimer.destroy();
      }
      this.pipeTimer = this.time.addEvent({
        delay: this.currentSpawnInterval,
        callback: () => this.spawnPipe(),
        loop: true,
      });
    }

    // Aktualizovat rychlost všech existujících pipes
    this.pipes.children.entries.forEach((pipe) => {
      const pipeBody = (pipe as Phaser.GameObjects.Image).body as Phaser.Physics.Arcade.Body;
      pipeBody.setVelocityX(-this.currentPipeSpeed);
    });

    // Zastavit aktuální hudbu pokud hraje
    if (this.currentMusic) {
      this.currentMusic.stop();
      this.currentMusic.destroy();
      this.currentMusic = undefined;
    }

    // Určit kterou hudbu přehrát
    let musicKey: string;
    if (level === 1) {
      musicKey = 'music_lvl1';
    } else if (level === 2) {
      musicKey = 'music_lvl2';
    } else if (level === 3) {
      musicKey = 'music_lvl3';
    } else {
      musicKey = 'music_lvl4';
    }

    // Spustit novou hudbu ve smyčce s uloženou hlasitostí
    this.currentMusic = this.sound.add(musicKey, { loop: true, volume: this.musicVolume });
    this.currentMusic.play();
    this.currentMusicLevel = level;
  }

  private updateMusicForScore() {
    // Určit level podle skóre
    // 1-20: level 1, 21-40: level 2, 41-60: level 3, 61+: level 4
    let targetLevel: number;
    if (this.score >= 1 && this.score <= 20) {
      targetLevel = 1;
    } else if (this.score >= 21 && this.score <= 40) {
      targetLevel = 2;
    } else if (this.score >= 41 && this.score <= 60) {
      targetLevel = 3;
    } else if (this.score >= 61) {
      targetLevel = 4;
    } else {
      return; // score = 0, hudba už hraje z startGame
    }

    // Přepnout hudbu pokud se level změnil
    this.playMusicForLevel(targetLevel);
  }

  private stopMusic() {
    if (this.currentMusic) {
      this.currentMusic.stop();
      this.currentMusic.destroy();
      this.currentMusic = undefined;
      this.currentMusicLevel = 0;
    }
  }

  // Menu System
  private showMenu() {
    const { width, height } = this.scale;

    // Hide other UI
    this.startText.setVisible(false);
    this.gameOverText.setVisible(false);
    this.newHighScoreText.setVisible(false);
    this.leaderboardText.setVisible(false);
    this.scoreText.setVisible(false);

    // Destroy other containers if they exist
    this.settingsContainer?.destroy();
    this.settingsContainer = undefined;
    this.leaderboardContainer?.destroy();
    this.leaderboardContainer = undefined;

    // Reset bird to starting position and disable physics
    this.bird.setPosition(100, height / 2);
    const birdBody = this.bird.body as Phaser.Physics.Arcade.Body;
    birdBody.setVelocity(0, 0);
    birdBody.setAllowGravity(false);

    // Set bird to idle sprite
    if (this.birdSprite) {
      this.birdSprite.anims.stop();
      this.birdSprite.setTexture('bird_idle');
    }

    // Create menu container
    this.menuContainer = this.add.container(width / 2, height / 2);
    this.menuContainer.setDepth(100);

    // Title
    const title = this.add.text(0, -150, 'FLAPPY BITS', {
      fontSize: '64px',
      color: '#ffff00',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5);

    // Create buttons
    const buttonStyle = {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4,
    };

    // New Game button
    const newGameBg = this.add.rectangle(0, -20, 300, 60, 0x00aa00);
    newGameBg.setStrokeStyle(4, 0xffffff);
    newGameBg.setInteractive({ useHandCursor: true });
    const newGameText = this.add.text(0, -20, 'NEW GAME', buttonStyle).setOrigin(0.5);

    newGameBg.on('pointerdown', () => {
      this.menuContainer?.destroy();
      this.menuContainer = undefined;
      this.startGame();
    });

    newGameBg.on('pointerover', () => {
      newGameBg.setFillStyle(0x00cc00);
    });

    newGameBg.on('pointerout', () => {
      newGameBg.setFillStyle(0x00aa00);
    });

    // Leaderboard button
    const leaderboardBg = this.add.rectangle(0, 60, 300, 60, 0x0000aa);
    leaderboardBg.setStrokeStyle(4, 0xffffff);
    leaderboardBg.setInteractive({ useHandCursor: true });
    const leaderboardText = this.add.text(0, 60, 'LEADERBOARD', buttonStyle).setOrigin(0.5);

    leaderboardBg.on('pointerdown', () => {
      this.menuContainer?.destroy();
      this.menuContainer = undefined;
      this.showLeaderboard();
    });

    leaderboardBg.on('pointerover', () => {
      leaderboardBg.setFillStyle(0x0000cc);
    });

    leaderboardBg.on('pointerout', () => {
      leaderboardBg.setFillStyle(0x0000aa);
    });

    // Settings button
    const settingsBg = this.add.rectangle(0, 140, 300, 60, 0xaa6600);
    settingsBg.setStrokeStyle(4, 0xffffff);
    settingsBg.setInteractive({ useHandCursor: true });
    const settingsText = this.add.text(0, 140, 'SETTINGS', buttonStyle).setOrigin(0.5);

    settingsBg.on('pointerdown', () => {
      this.menuContainer?.destroy();
      this.menuContainer = undefined;
      this.showSettings();
    });

    settingsBg.on('pointerover', () => {
      settingsBg.setFillStyle(0xcc8800);
    });

    settingsBg.on('pointerout', () => {
      settingsBg.setFillStyle(0xaa6600);
    });

    this.menuContainer.add([
      title,
      newGameBg,
      newGameText,
      leaderboardBg,
      leaderboardText,
      settingsBg,
      settingsText,
    ]);
  }

  private async showLeaderboard() {
    const { width, height } = this.scale;

    this.gameState = 'leaderboard';

    // Create leaderboard container
    this.leaderboardContainer = this.add.container(width / 2, height / 2);
    this.leaderboardContainer.setDepth(100);

    // Title
    const title = this.add.text(0, -200, 'GLOBAL LEADERBOARD', {
      fontSize: '48px',
      color: '#ffff00',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Loading text
    const loadingText = this.add.text(0, 0, 'Loading...', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    this.leaderboardContainer.add([title, loadingText]);

    // Fetch leaderboard
    try {
      const response = await fetch('/.netlify/functions/leaderboard');

      if (!response.ok) {
        console.error('Leaderboard fetch failed:', response.status, response.statusText);
        throw new Error(`Server returned ${response.status}`);
      }

      const globalScores = await response.json();

      if (!Array.isArray(globalScores)) {
        console.error('Invalid leaderboard data:', globalScores);
        throw new Error('Leaderboard data is not an array');
      }

      const topScores = globalScores.slice(0, 10);

      // Remove loading text
      loadingText.destroy();

      // Display leaderboard
      let leaderboardStr = '';
      topScores.forEach((item: { score: number; name: string }, index: number) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '  ';
        leaderboardStr += `${medal} ${index + 1}. ${item.name || 'Anonymous'} - ${item.score}\n`;
      });

      const scoresText = this.add.text(0, -50, leaderboardStr, {
        fontSize: '20px',
        color: '#ffffff',
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeThickness: 2,
        align: 'center',
      }).setOrigin(0.5);

      this.leaderboardContainer.add(scoresText);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      loadingText.setText('Failed to load leaderboard');
    }

    // Back button
    const backBg = this.add.rectangle(0, 220, 200, 50, 0xaa0000);
    backBg.setStrokeStyle(3, 0xffffff);
    backBg.setInteractive({ useHandCursor: true });
    const backText = this.add.text(0, 220, 'BACK', {
      fontSize: '28px',
      color: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    backBg.on('pointerdown', () => {
      this.leaderboardContainer?.destroy();
      this.leaderboardContainer = undefined;
      this.gameState = 'menu';
      this.showMenu();
    });

    backBg.on('pointerover', () => {
      backBg.setFillStyle(0xcc0000);
    });

    backBg.on('pointerout', () => {
      backBg.setFillStyle(0xaa0000);
    });

    this.leaderboardContainer.add([backBg, backText]);
  }

  private showSettings() {
    const { width, height } = this.scale;

    this.gameState = 'settings';

    // Create settings container
    this.settingsContainer = this.add.container(width / 2, height / 2);
    this.settingsContainer.setDepth(100);

    // Title
    const title = this.add.text(0, -200, 'SETTINGS', {
      fontSize: '48px',
      color: '#ffff00',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Music volume label
    const volumeLabel = this.add.text(0, -80, 'Music Volume', {
      fontSize: '28px',
      color: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // Volume slider background
    const sliderBg = this.add.rectangle(0, -20, 400, 20, 0x333333);
    sliderBg.setStrokeStyle(2, 0xffffff);

    // Volume slider fill - always start from left edge
    const sliderFill = this.add.rectangle(-200, -20, this.musicVolume * 400, 20, 0x00aa00);
    sliderFill.setOrigin(0, 0.5);

    // Volume slider handle
    const sliderHandle = this.add.circle(-200 + (this.musicVolume * 400), -20, 15, 0xffffff);
    sliderHandle.setStrokeStyle(3, 0x000000);
    sliderHandle.setInteractive({ useHandCursor: true, draggable: true });

    // Volume percentage text
    const volumeText = this.add.text(0, 30, `${Math.round(this.musicVolume * 100)}%`, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    // Update volume function
    const updateVolume = (x: number) => {
      // Constrain to slider bounds
      const localX = x - width / 2;
      const clampedX = Phaser.Math.Clamp(localX, -200, 200);

      sliderHandle.setX(clampedX);

      // Update volume (0 to 1)
      this.musicVolume = (clampedX + 200) / 400;

      // Update fill - width changes, X stays at -200
      sliderFill.setDisplaySize(this.musicVolume * 400, 20);

      // Update text
      volumeText.setText(`${Math.round(this.musicVolume * 100)}%`);

      // Save to localStorage
      localStorage.setItem('flappyBitsMusicVolume', this.musicVolume.toString());

      // Update current music if playing (recreate with new volume)
      if (this.currentMusic && this.currentMusicLevel > 0) {
        const wasPlaying = this.currentMusic.isPlaying;
        const currentLevel = this.currentMusicLevel;
        this.currentMusic.stop();
        this.currentMusic.destroy();
        this.currentMusic = undefined;
        this.currentMusicLevel = 0;

        if (wasPlaying) {
          // Restart music with new volume
          let musicKey: string;
          if (currentLevel === 1) musicKey = 'music_lvl1';
          else if (currentLevel === 2) musicKey = 'music_lvl2';
          else if (currentLevel === 3) musicKey = 'music_lvl3';
          else musicKey = 'music_lvl4';

          this.currentMusic = this.sound.add(musicKey, { loop: true, volume: this.musicVolume });
          this.currentMusic.play();
          this.currentMusicLevel = currentLevel;
        }
      }
    };

    // Slider drag handler
    this.input.on('drag', (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject, dragX: number) => {
      if (gameObject !== sliderHandle) return;
      updateVolume(dragX);
    });

    // Click on slider background to jump to position
    sliderBg.setInteractive();
    sliderBg.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      updateVolume(pointer.x);
    });

    // Back button
    const backBg = this.add.rectangle(0, 150, 200, 50, 0xaa0000);
    backBg.setStrokeStyle(3, 0xffffff);
    backBg.setInteractive({ useHandCursor: true });
    const backText = this.add.text(0, 150, 'BACK', {
      fontSize: '28px',
      color: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    backBg.on('pointerdown', () => {
      this.settingsContainer?.destroy();
      this.settingsContainer = undefined;
      this.gameState = 'menu';
      this.showMenu();
    });

    backBg.on('pointerover', () => {
      backBg.setFillStyle(0xcc0000);
    });

    backBg.on('pointerout', () => {
      backBg.setFillStyle(0xaa0000);
    });

    this.settingsContainer.add([
      title,
      volumeLabel,
      sliderBg,
      sliderFill,
      sliderHandle,
      volumeText,
      backBg,
      backText,
    ]);
  }
}
