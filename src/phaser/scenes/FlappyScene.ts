import Phaser from 'phaser';

type GameState = 'start' | 'playing' | 'gameover';

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

  // Game state
  private gameState: GameState = 'start';
  private score = 0;
  private highScore = 0;
  private pipeTimer?: Phaser.Time.TimerEvent;
  private lastPipeGapY?: number; // Pozice poslední mezery

  // Game settings
  private readonly GRAVITY = 800;
  private readonly JUMP_VELOCITY = -350;
  private readonly PIPE_SPEED = 200;
  private readonly PIPE_GAP = 180;
  private readonly PIPE_SPAWN_INTERVAL = 1800;
  private readonly MAX_PIPE_GAP_CHANGE = 150; // Maximální změna výšky mezi trubkami

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

    // Budoucí assety:
    // this.load.audio('jump', '/assets/jump.mp3');
    // this.load.audio('hit', '/assets/hit.mp3');
    // this.load.audio('point', '/assets/point.mp3');
  }

  create() {
    const { width, height } = this.scale;

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
        // Zde by se přehrál zvuk: this.sound.play('point');
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
    if (this.gameState === 'start') {
      this.startGame();
    } else if (this.gameState === 'playing') {
      this.jump();
    } else if (this.gameState === 'gameover') {
      this.restartGame();
    }
  }

  private startGame() {
    this.gameState = 'playing';
    this.startText.setVisible(false);
    this.jump();

    // Spawnování pipes
    this.pipeTimer = this.time.addEvent({
      delay: this.PIPE_SPAWN_INTERVAL,
      callback: () => this.spawnPipe(),
      loop: true,
    });
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

    // Zde by se přehrál zvuk: this.sound.play('jump');
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
    topPipe.setVelocityX(-this.PIPE_SPEED);
    topPipe.scored = false; // inicializace scoring flagu
    if (topPipe.body) {
      (topPipe.body as Phaser.Physics.Arcade.Body).setImmovable(true);
      (topPipe.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    }

    // Spodní pipe (normálně) - bez scoring flagu, pouze horní pipe počítá body
    const bottomPipe = this.pipes.create(width, gapY + this.PIPE_GAP, 'pipe') as Phaser.Physics.Arcade.Image;
    bottomPipe.setOrigin(0.5, 0); // origin nahoře uprostřed
    bottomPipe.setVelocityX(-this.PIPE_SPEED);
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

    // Uložit high score a aktualizovat žebříček
    this.updateHighScore();

    // Zobrazit game over screen
    this.showGameOverScreen();

    // Zde by se přehrál zvuk: this.sound.play('hit');
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
      const globalScores = await response.json();

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
    this.gameState = 'start';
    this.startText.setVisible(true);
  }
}
