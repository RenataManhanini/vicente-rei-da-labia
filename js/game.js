/**
 * Vicente: O Rei da Lábia - game.js
 * Motor principal do jogo (HTML5 Canvas + Beat 'em up 2.5D + Estilo South Park)
 */

(function () {
  'use strict';

  // Frases dos balões de quadrinhos
  const CANTADA_TEXTS = [
    'Ei gata, você é WiFi? Conexão total!',
    'Seu pai é mecânico? Porque você é um avião!',
    'Gata, me chama de tabela do INSS que eu te seguro!',
    'Se beleza desse cadeia, você pegava perpétua!',
    'Você não é GPS, mas me perdi no seu olhar!',
    'Você tem um mapa? Me perdi nos seus olhos!',
    'Gata, seu pai é padeiro? Que sonho de mulher!',
    'Gata, você não é Wi-Fi, mas sinto uma rede!',
    'Você acredita em amor à primeira vista ou passo de novo?',
    'Seu nome é Google? Você tem tudo que eu procuro!',
    'Gata, não sou manteiga, mas me derreto por você!',
    'Você é tão linda que até o Photoshop tem inveja!',
    'Gata, você não é café, mas me deixa acordado!',
    'Eu não sou banco, mas invisto tudo em você!',
    'Tem uma colher aí? Tô dando sopa pra você!',
    'Me chama de ladrão de coração!',
    'Seu beijo cura até ressaca de Corote!'
  ];

  const ERRO_TEXTS = [
    'AAAH! CILADA BINO!!',
    'ERA UM HOMEM?! QUE SUSTO!',
    'PERAÍ, ESSA CARA TEM BARBA!',
    'MEU DEUS DO CÉU, FUI ENGANADO!',
    'SOCORRO! NÃO ERA O QUE PARECIA!',
    'EITA PREGO! OLHA O BIGODE!'
  ];

  const Game = {
    // Canvas & Contexto
    canvas: null,
    ctx: null,
    width: 0,
    height: 0,
    dpr: 1,

    // Estados
    state: 'menu', // 'menu', 'playing', 'ended'
    score: 0,
    highScore: 0,
    timeLeft: 90,
    elapsedTime: 0,
    combo: 0,
    comboTimer: 0,
    isFugaMode: false,
    endingType: 'zoado',

    // Câmera e Mundo
    cameraX: 0,
    worldWidth: 2400,

    // Vicente (Jogador)
    vicente: {
      x: 300,
      y: 0,
      w: 48,
      h: 96,
      speed: 4.2,
      facing: 1, // 1: direita, -1: esquerda
      state: 'normal', // 'normal', 'galanteador', 'ostentacao', 'susto'
      stateTimer: 0,
      animFrame: 0,
      animTimer: 0,
      isSlowed: false,
      slowTimer: 0,
      speedBoost: false,
      speedBoostTimer: 0,
      knockbackX: 0,
      cantadaCooldown: 0,
      speechBubble: null, // { text, timer, maxTimer, isError }
      headImages: {
        normal: null,
        galanteador: null,
        ostentacao: null,
        susto: null
      }
    },

    // Entidades
    activeNPCs: [],
    spawnTimer: 0,
    effects: [], // corações flutuantes, textos de pontos, confetes
    chasers: [], // maridos furiosos no modo fuga

    // Cenário (Prédios de fundo estilo South Park)
    buildings: [],

    // Inputs
    keys: {},
    touchDirs: { up: false, down: false, left: false, right: false },

    // Elementos do DOM
    dom: {},

    // ------------------------------------------------------------------------
    // INICIALIZAÇÃO
    // ------------------------------------------------------------------------
    init() {
      this.cacheDOM();
      this.setupCanvas();
      this.loadHighScore();
      this.loadImages();
      this.generateBuildings();
      this.bindEvents();
      this.detectTouchDevice();

      // Inicializa módulos dependentes
      if (window.Achievements) {
        window.Achievements.init();
      }

      // Loop de renderização
      let lastTime = performance.now();
      const loop = (currentTime) => {
        const dt = Math.min((currentTime - lastTime) / 1000, 0.05); // cap de 50ms
        lastTime = currentTime;

        this.update(dt);
        this.render();

        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    },

    cacheDOM() {
      this.canvas = document.getElementById('gameCanvas');
      this.ctx = this.canvas.getContext('2d');

      this.dom = {
        container: document.getElementById('game-container'),
        hud: document.getElementById('hud'),
        scoreVal: document.getElementById('score-value'),
        timerVal: document.getElementById('timer-value'),
        timerDisplay: document.getElementById('timer-display'),
        comboFill: document.getElementById('combo-fill'),
        comboText: document.getElementById('combo-text'),
        muteBtn: document.getElementById('mute-btn'),

        startScreen: document.getElementById('start-screen'),
        startBtn: document.getElementById('start-btn'),
        recordVal: document.getElementById('record-value'),

        endScreen: document.getElementById('end-screen'),
        endTitle: document.getElementById('end-title'),
        endVicente: document.getElementById('end-vicente'),
        endMessage: document.getElementById('end-message'),
        finalScore: document.getElementById('final-score'),
        finalRecord: document.getElementById('final-record'),
        trophiesGrid: document.getElementById('trophies-grid'),
        restartBtn: document.getElementById('restart-btn'),
        shareBtn: document.getElementById('share-btn'),

        mobileControls: document.getElementById('mobile-controls'),
        btnUp: document.getElementById('btn-up'),
        btnDown: document.getElementById('btn-down'),
        btnLeft: document.getElementById('btn-left'),
        btnRight: document.getElementById('btn-right'),
        btnCantada: document.getElementById('btn-cantada')
      };
    },

    setupCanvas() {
      const resize = () => {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.dpr = Math.min(window.devicePixelRatio || 1, 2);

        this.canvas.width = this.width * this.dpr;
        this.canvas.height = this.height * this.dpr;
        this.canvas.style.width = this.width + 'px';
        this.canvas.style.height = this.height + 'px';
        this.ctx.scale(this.dpr, this.dpr);

        // Reposiciona o Vicente na calçada
        if (this.vicente.y === 0) {
          this.vicente.y = this.getSidewalkYRange().centerY;
        }
      };

      window.addEventListener('resize', resize);
      resize();
    },

    getSidewalkYRange() {
      const minY = this.height * 0.58;
      const maxY = this.height * 0.88 - this.vicente.h;
      return {
        minY,
        maxY,
        centerY: minY + (maxY - minY) * 0.5
      };
    },

    loadHighScore() {
      try {
        const saved = localStorage.getItem('vicente_high_score');
        this.highScore = saved ? parseInt(saved, 10) || 0 : 0;
      } catch (e) {
        this.highScore = 0;
      }
      if (this.dom.recordVal) this.dom.recordVal.textContent = this.highScore;
    },

    saveHighScore(score) {
      if (score > this.highScore) {
        this.highScore = score;
        try {
          localStorage.setItem('vicente_high_score', this.highScore.toString());
        } catch (e) {}
        if (this.dom.recordVal) this.dom.recordVal.textContent = this.highScore;
      }
    },

    loadImages() {
      const heads = {
        normal: 'assets/img/vicente_normal.png',
        galanteador: 'assets/img/vicente_galanteador.png',
        ostentacao: 'assets/img/vicente_ostentacao.png',
        susto: 'assets/img/vicente_susto.png'
      };

      for (const [key, src] of Object.entries(heads)) {
        const img = new Image();
        img.src = src;
        this.vicente.headImages[key] = img;
      }
    },

    generateBuildings() {
      this.buildings = [];
      const colors = ['#f5f5f5', '#efebe9', '#e0f2f1', '#fff9c4', '#ede7f6', '#e8f5e9'];
      let curX = 0;
      let bIndex = 0;

      while (curX < this.worldWidth + 400) {
        const w = 180 + Math.floor(Math.random() * 120);
        const h = 220 + Math.floor(Math.random() * 140);
        const color = colors[bIndex % colors.length];
        const isSpecialWindow = bIndex === 4; // Um prédio dedicado à Vizinha Casada na Janela

        this.buildings.push({
          x: curX,
          w: w,
          h: h,
          color: color,
          hasWindowTarget: isSpecialWindow,
          windowTargetX: curX + w * 0.5,
          windowTargetY: 0
        });

        curX += w + 20;
        bIndex++;
      }
    },

    detectTouchDevice() {
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      if (isTouch && this.dom.mobileControls) {
        this.dom.mobileControls.classList.remove('hidden');
      }
    },

    // ------------------------------------------------------------------------
    // EVENTOS E ENTRADA
    // ------------------------------------------------------------------------
    bindEvents() {
      // Teclado
      window.addEventListener('keydown', (e) => {
        this.keys[e.key.toLowerCase()] = true;
        this.keys[e.code] = true;

        if (e.code === 'Space') {
          e.preventDefault();
          if (this.state === 'playing') {
            this.tryCantada();
          }
        }
      });

      window.addEventListener('keyup', (e) => {
        this.keys[e.key.toLowerCase()] = false;
        this.keys[e.code] = false;
      });

      // Botão Iniciar
      this.dom.startBtn.addEventListener('click', () => {
        this.startGame();
      });

      // Botão Reiniciar
      this.dom.restartBtn.addEventListener('click', () => {
        this.restartGame();
      });

      // Botão Compartilhar WhatsApp
      this.dom.shareBtn.addEventListener('click', () => {
        this.shareWhatsApp();
      });

      // Botão Mudo
      this.dom.muteBtn.addEventListener('click', () => {
        if (window.AudioManager) {
          const isMuted = window.AudioManager.toggleMute();
          this.dom.muteBtn.textContent = isMuted ? '🔇' : '🔊';
        }
      });

      // Controles Móveis (Touch)
      const bindTouchDir = (btn, dir) => {
        if (!btn) return;
        const setDir = (active, ev) => {
          if (ev) ev.preventDefault();
          this.touchDirs[dir] = active;
        };

        btn.addEventListener('touchstart', (e) => setDir(true, e), { passive: false });
        btn.addEventListener('touchend', (e) => setDir(false, e), { passive: false });
        btn.addEventListener('touchcancel', (e) => setDir(false, e), { passive: false });
        btn.addEventListener('mousedown', (e) => setDir(true, e));
        btn.addEventListener('mouseup', (e) => setDir(false, e));
        btn.addEventListener('mouseleave', (e) => setDir(false, e));
      };

      bindTouchDir(this.dom.btnUp, 'up');
      bindTouchDir(this.dom.btnDown, 'down');
      bindTouchDir(this.dom.btnLeft, 'left');
      bindTouchDir(this.dom.btnRight, 'right');

      if (this.dom.btnCantada) {
        const triggerCantada = (e) => {
          if (e) e.preventDefault();
          if (this.state === 'playing') {
            this.tryCantada();
          }
        };
        this.dom.btnCantada.addEventListener('touchstart', triggerCantada, { passive: false });
        this.dom.btnCantada.addEventListener('mousedown', triggerCantada);
      }
    },

    // ------------------------------------------------------------------------
    // FLUXO DO JOGO
    // ------------------------------------------------------------------------
    startGame() {
      // Destrava o áudio no primeiro clique
      if (window.AudioManager) {
        window.AudioManager.init();
        window.AudioManager.startMusic();
        window.AudioManager.playClickSound();
        window.AudioManager.preloadAll();
      }

      if (window.Achievements) {
        window.Achievements.reset();
      }

      this.score = 0;
      this.timeLeft = 90;
      this.elapsedTime = 0;
      this.combo = 0;
      this.comboTimer = 0;
      this.isFugaMode = false;
      this.state = 'playing';

      this.vicente.x = 200;
      this.vicente.y = this.getSidewalkYRange().centerY;
      this.vicente.state = 'normal';
      this.vicente.speechBubble = null;
      this.vicente.isSlowed = false;
      this.vicente.speedBoost = false;
      this.vicente.knockbackX = 0;

      this.activeNPCs = [];
      this.effects = [];
      this.chasers = [];
      this.spawnTimer = 0;

      // HUD
      this.dom.startScreen.classList.add('hidden');
      this.dom.endScreen.classList.add('hidden');
      this.dom.hud.classList.remove('hidden');
      this.updateHUD();

      // Spawna os primeiros NPCs
      this.spawnNPC();
      this.spawnNPC();
      this.spawnWindowNPC();
    },

    restartGame() {
      if (window.AudioManager) {
        window.AudioManager.deactivateFugaMode();
        window.AudioManager.playClickSound();
      }
      this.startGame();
    },

    endGame() {
      this.state = 'ended';

      if (window.AudioManager) {
        window.AudioManager.stopMusic();
        window.AudioManager.deactivateFugaMode();
      }

      // Salva recorde
      this.saveHighScore(this.score);

      // Determina o tipo de final via Achievements
      let ending = 'zoado';
      if (window.Achievements) {
        ending = window.Achievements.getEndingType(this.score);
      }
      this.endingType = ending;

      // Toca áudio correspondente
      if (window.AudioManager) {
        window.AudioManager.playFinal(ending);
      }

      // Configura tela final
      this.setupEndScreen(ending);

      this.dom.hud.classList.add('hidden');
      this.dom.endScreen.classList.remove('hidden');
    },

    setupEndScreen(ending) {
      this.dom.finalScore.textContent = this.score;
      this.dom.finalRecord.textContent = this.highScore;

      if (ending === 'bom') {
        this.dom.endTitle.textContent = '👑 REI DO BAILE! 👑';
        this.dom.endVicente.src = 'assets/img/vicente_ostentacao.png';
        this.dom.endMessage.innerHTML =
          '<strong>MANCHETE URGENTE:</strong><br>"Vicente esgota o estoque de solteiras da cidade e é declarado patrimônio cultural da lábia!"';
        this.spawnConfettiBurst();
      } else if (ending === 'fuga') {
        this.dom.endTitle.textContent = '🏃 FUGA ALUCINADA! 🚨';
        this.dom.endVicente.src = 'assets/img/vicente_susto.png';
        this.dom.endMessage.innerHTML =
          '<strong>DEU RUIM TOTAL:</strong><br>Vicente mexeu com a mulher do policial, do agiota e do preso ao mesmo tempo! Está correndo a 120km/h na Av. Brasil!';
      } else {
        this.dom.endTitle.textContent = '🤡 DERROTA ZOADA! 😂';
        this.dom.endVicente.src = 'assets/img/vicente_susto.png';
        this.dom.endMessage.innerHTML =
          '<strong>PAGOU MICO:</strong><br>Vicente tomou mais fora que goleiro de várzea e ainda caiu em várias ciladas. Volte para o curso de sedução!';
      }

      // Preenche lista de troféus
      if (this.dom.trophiesGrid && window.Achievements) {
        this.dom.trophiesGrid.innerHTML = '';
        const allUnlocked = window.Achievements.allTimeUnlocked || [];
        const thisGame = window.Achievements.unlockedThisGame || [];

        // Conquistas conhecidas
        const list = [
          { id: 'papa_anjo', name: 'Papa-Anjo', icon: '👼' },
          { id: 'pega_veia', name: 'Pega Véia', icon: '👵' },
          { id: 'prefeitura', name: 'Prefeitura', icon: '🏚️' },
          { id: 'padrasto', name: 'Padrasto do Ano', icon: '👨‍👧‍👦' },
          { id: 'perigo', name: 'Perigo Sobrenome', icon: '💀' },
          { id: 'salto', name: 'Salto Ornamental', icon: '🪟' },
          { id: 'fogo_amigo', name: 'Fogo Amigo', icon: '🔥' }
        ];

        list.forEach((t) => {
          const item = document.createElement('div');
          const isUnlocked = allUnlocked.includes(t.id);
          const isNew = thisGame.includes(t.id);

          item.className = 'trophy-item' + (isUnlocked ? ' unlocked' : ' locked');
          item.innerHTML = `
            <div class="trophy-icon">${t.icon}</div>
            <div class="trophy-name">${t.name}</div>
            ${isNew ? '<span class="trophy-badge">NOVO!</span>' : ''}
          `;
          this.dom.trophiesGrid.appendChild(item);
        });
      }
    },

    shareWhatsApp() {
      let shareMsg = '';
      if (window.Achievements) {
        shareMsg = window.Achievements.getShareText(this.score, this.endingType);
      } else {
        shareMsg = `🎮 Joguei Vicente: O Rei da Lábia e fiz ${this.score} pontos! https://renatamanhanini.github.io/vicente-rei-da-labia/`;
      }
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMsg)}`;
      window.open(url, '_blank');
    },

    // ------------------------------------------------------------------------
    // ATUALIZAÇÃO (UPDATE)
    // ------------------------------------------------------------------------
    update(dt) {
      if (this.state !== 'playing') {
        this.updateEffects(dt);
        return;
      }

      this.elapsedTime += dt;
      this.timeLeft = Math.max(0, this.timeLeft - dt);

      // Atualiza Timer na HUD
      const secs = Math.ceil(this.timeLeft);
      this.dom.timerVal.textContent = secs;

      // Alerta nos últimos 15 segundos
      if (this.timeLeft <= 15) {
        this.dom.timerDisplay.classList.add('timer-warning');

        // Modo Fuga: Ativa se conquistou 2+ alvos de risco
        if (!this.isFugaMode && window.Achievements) {
          const riskCount = (window.Achievements.stats.riskConquered || []).length;
          if (riskCount >= 2) {
            this.activateFugaMode();
          }
        }
      } else {
        this.dom.timerDisplay.classList.remove('timer-warning');
      }

      // Fim do tempo
      if (this.timeLeft <= 0) {
        this.endGame();
        return;
      }

      // Atualiza Vicente
      this.updateVicente(dt);

      // Atualiza NPCs e Spawns
      this.updateNPCs(dt);
      this.checkSpawns(dt);

      // Atualiza Chasers (no modo fuga)
      if (this.isFugaMode) {
        this.updateChasers(dt);
      }

      // Atualiza Combo
      this.updateCombo(dt);

      // Atualiza Efeitos
      this.updateEffects(dt);

      // Atualiza Achievements
      if (window.Achievements) {
        window.Achievements.update(dt);
      }

      // Atualiza Câmera para seguir o Vicente
      const targetCamX = this.vicente.x - this.width * 0.4;
      this.cameraX += (targetCamX - this.cameraX) * 0.1;
      this.cameraX = Math.max(0, Math.min(this.cameraX, this.worldWidth - this.width));
    },

    updateVicente(dt) {
      const v = this.vicente;

      // Timers de estado e efeitos temporários
      if (v.stateTimer > 0) {
        v.stateTimer -= dt;
        if (v.stateTimer <= 0) {
          v.state = 'normal';
        }
      }

      if (v.cantadaCooldown > 0) {
        v.cantadaCooldown -= dt;
      }

      if (v.slowTimer > 0) {
        v.slowTimer -= dt;
        if (v.slowTimer <= 0) v.isSlowed = false;
      }

      if (v.speedBoostTimer > 0) {
        v.speedBoostTimer -= dt;
        if (v.speedBoostTimer <= 0) v.speedBoost = false;
      }

      // Balão de fala
      if (v.speechBubble) {
        v.speechBubble.timer -= dt;
        if (v.speechBubble.timer <= 0) {
          v.speechBubble = null;
        }
      }

      // Knockback ao cair em armadilha
      if (Math.abs(v.knockbackX) > 0.1) {
        v.x += v.knockbackX;
        v.knockbackX *= 0.88;
      } else {
        v.knockbackX = 0;
      }

      // Velocidade do Vicente
      let currentSpeed = v.speed;
      if (v.isSlowed) currentSpeed *= 0.5;
      if (v.speedBoost) currentSpeed *= 1.45;
      if (this.isFugaMode) currentSpeed *= 1.3;

      // Vetor de movimento
      let dx = 0;
      let dy = 0;

      // Inputs Teclado (Setas ou WASD)
      if (this.keys['arrowleft'] || this.keys['keya'] || this.touchDirs.left) dx -= 1;
      if (this.keys['arrowright'] || this.keys['keyd'] || this.touchDirs.right) dx += 1;
      if (this.keys['arrowup'] || this.keys['keyw'] || this.touchDirs.up) dy -= 1;
      if (this.keys['arrowdown'] || this.keys['keys'] || this.touchDirs.down) dy += 1;

      // Normaliza movimento diagonal
      if (dx !== 0 && dy !== 0) {
        const factor = 1 / Math.sqrt(2);
        dx *= factor;
        dy *= factor;
      }

      // Aplica movimento
      if (dx !== 0 || dy !== 0) {
        v.x += dx * currentSpeed;
        v.y += dy * currentSpeed;

        if (dx !== 0) {
          v.facing = dx > 0 ? 1 : -1;
        }

        // Animação de caminhada
        v.animTimer += dt;
        if (v.animTimer > 0.12) {
          v.animTimer = 0;
          v.animFrame = (v.animFrame + 1) % 4;
        }
      } else {
        v.animFrame = 0;
      }

      // Limites de movimentação (Calçada estilo Beat 'em Up)
      const range = this.getSidewalkYRange();
      v.x = Math.max(20, Math.min(v.x, this.worldWidth - v.w - 20));
      v.y = Math.max(range.minY, Math.min(v.y, range.maxY));
    },

    updateNPCs(dt) {
      const range = this.getSidewalkYRange();

      for (let i = this.activeNPCs.length - 1; i >= 0; i--) {
        const npc = this.activeNPCs[i];

        // Animação de caminhada
        npc.animTimer = (npc.animTimer || 0) + dt;
        if (npc.animTimer > 0.15) {
          npc.animTimer = 0;
          npc.animFrame = ((npc.animFrame || 0) + 1) % 4;
        }

        // NPCs estacionários (Ex: Vizinha na Janela)
        if (npc.isStationary) {
          continue;
        }

        // Movimento horizontal
        const speed = npc.speed * 1.5;
        npc.x += npc.direction * speed;

        // Se for a Ex-Namorada Tóxica, verifica proximidade com o Vicente
        if (npc.id === 'ex_toxica') {
          const dist = Math.hypot(this.vicente.x - npc.x, this.vicente.y - npc.y);
          if (dist < 85) {
            this.vicente.isSlowed = true;
            this.vicente.slowTimer = 4.0;
            this.vicente.state = 'susto';
            this.vicente.stateTimer = 1.0;
            this.showSpeechBubble('A EX ME PEGOU! QUE LENTIDÃO!', true);
          }
        }

        // Remove se saiu dos limites do mundo
        if (npc.x < -100 || npc.x > this.worldWidth + 100) {
          this.activeNPCs.splice(i, 1);
        }
      }
    },

    checkSpawns(dt) {
      this.spawnTimer += dt;

      // Obtém configurações de spawn do módulo npcs.js
      let config = { minSpawnInterval: 2.0, maxSpawnInterval: 3.5, maxOnScreen: 6 };
      if (window.NPCData && typeof window.NPCData.getSpawnConfig === 'function') {
        config = window.NPCData.getSpawnConfig(this.elapsedTime, 90);
      }

      const currentNPCsCount = this.activeNPCs.filter((n) => !n.isWindowNPC).length;

      if (this.spawnTimer >= config.minSpawnInterval && currentNPCsCount < config.maxOnScreen) {
        this.spawnNPC(config.candidates);
        this.spawnTimer = 0;
      }

      // Garante que a Vizinha Casada na Janela esteja presente
      const hasWindowNPC = this.activeNPCs.some((n) => n.isWindowNPC);
      if (!hasWindowNPC && Math.random() < 0.3) {
        this.spawnWindowNPC();
      }
    },

    spawnNPC(candidatesList) {
      if (!window.NPCData || !window.NPCData.list) return;

      const candidates = candidatesList || window.NPCData.list.filter((n) => !n.isWindowNPC);
      if (candidates.length === 0) return;

      const proto = candidates[Math.floor(Math.random() * candidates.length)];
      if (proto.isWindowNPC) return;

      const fromLeft = Math.random() < 0.5;
      const range = this.getSidewalkYRange();
      const spawnY = range.minY + Math.random() * (range.maxY - range.minY);

      const npcInstance = {
        ...proto,
        x: fromLeft ? this.cameraX - 60 : this.cameraX + this.width + 60,
        y: spawnY,
        direction: fromLeft ? 1 : -1,
        facing: fromLeft ? 1 : -1,
        currentHits: 0,
        revealed: false,
        animFrame: 0,
        animTimer: 0
      };

      this.activeNPCs.push(npcInstance);
    },

    spawnWindowNPC() {
      if (!window.NPCData) return;
      const vizinhaProto = window.NPCData.getById('vizinha_casada');
      if (!vizinhaProto) return;

      // Procura o prédio com a janela especial
      const targetBuilding = this.buildings.find((b) => b.hasWindowTarget);
      if (!targetBuilding) return;

      const sidewalk = this.getSidewalkYRange();
      const windowY = sidewalk.minY - 100; // Altura da janela no 1º andar do prédio

      const windowInstance = {
        ...vizinhaProto,
        x: targetBuilding.windowTargetX,
        y: windowY,
        direction: 0,
        facing: 1,
        currentHits: 0,
        revealed: false,
        isStationary: true,
        isWindowNPC: true,
        animFrame: 0,
        animTimer: 0
      };

      this.activeNPCs.push(windowInstance);
    },

    // ------------------------------------------------------------------------
    // AÇÃO DE MANDAR CANTADA
    // ------------------------------------------------------------------------
    tryCantada() {
      const v = this.vicente;

      if (v.cantadaCooldown > 0) return;
      v.cantadaCooldown = 0.55; // tempo de recarga

      // Procura o NPC mais próximo dentro do raio de alcance
      let closest = null;
      let closestDist = Infinity;
      const reachRadius = 110;

      for (let i = 0; i < this.activeNPCs.length; i++) {
        const npc = this.activeNPCs[i];
        const dist = Math.hypot(v.x - npc.x, v.y - npc.y);

        if (dist < reachRadius && dist < closestDist) {
          closest = npc;
          closestDist = dist;
        }
      }

      // Se não houver ninguém por perto
      if (!closest) {
        v.state = 'galanteador';
        v.stateTimer = 0.6;
        this.showSpeechBubble(this.getRandomCantadaText(), false);
        if (window.AudioManager) {
          window.AudioManager.playCantada(null);
        }
        return;
      }

      // Se for uma ARMADILHA (TRAP)
      if (closest.isTrap) {
        this.triggerTrap(closest);
        return;
      }

      // NPC NORMAL - Acerto de cantada
      closest.currentHits = (closest.currentHits || 0) + 1;
      const neededHits = closest.requiredHits || 1;

      if (closest.currentHits >= neededHits) {
        // Conquistado com sucesso!
        this.conquerNPC(closest);
      } else {
        // Exige mais cantadas (ex: Gordinha Empoderada)
        v.state = 'galanteador';
        v.stateTimer = 0.7;
        if (window.AudioManager) {
          window.AudioManager.playCantada(closest.id, closest.preferredCantadas);
          window.AudioManager.playPointSound();
        }
        this.showSpeechBubble('Quase lá gata! Mais um elogio!', false);
        this.spawnHeart(closest.x, closest.y - 40);
        this.spawnScoreEffect(closest.x, closest.y - 30, '+Quase lá!', '#ff80ab');
      }
    },

    conquerNPC(npc) {
      const v = this.vicente;

      // Remove NPC da tela
      const index = this.activeNPCs.indexOf(npc);
      if (index !== -1) {
        this.activeNPCs.splice(index, 1);
      }

      // Incrementa Combo e Multiplicador
      this.combo++;
      this.comboTimer = 5.0; // 5 segundos para manter o combo
      const comboMultiplier = 1 + Math.min(this.combo - 1, 10) * 0.15;
      const earnedPoints = Math.round(npc.points * comboMultiplier);

      this.score += earnedPoints;

      // Estado do Vicente
      v.state = this.combo >= 5 || npc.specialEffect === 'ostentation' ? 'ostentacao' : 'galanteador';
      v.stateTimer = 0.8;

      // Áudios
      if (window.AudioManager) {
        window.AudioManager.playCantada(npc.id, npc.preferredCantadas);
        window.AudioManager.playPointSound();
        window.AudioManager.playComboSound(this.combo);
      }

      // Efeitos Visuais
      this.showSpeechBubble(this.getRandomCantadaText(), false);
      this.spawnHeartBurst(npc.x, npc.y - 40);
      this.spawnScoreEffect(npc.x, npc.y - 30, `+${earnedPoints} pts!`, '#ffd700');

      if (this.combo >= 3) {
        this.spawnScoreEffect(v.x, v.y - 70, `COMBO x${this.combo}! 🔥`, '#ff4081');
      }

      // Registra estatísticas e conquistas
      if (window.Achievements) {
        window.Achievements.recordConquest(npc.id);
        if (npc.isRisk) {
          window.Achievements.recordRiskConquest(npc.id);
        }
      }

      // Efeitos especiais de NPCs
      if (npc.specialEffect === 'speedBoost') {
        v.speedBoost = true;
        v.speedBoostTimer = 6.0;
        this.spawnScoreEffect(v.x, v.y - 50, 'TURBO DO ZAP! ⚡', '#69f0ae');
      } else if (npc.specialEffect === 'ostentation') {
        v.state = 'ostentacao';
        v.stateTimer = 4.0;
        this.spawnScoreEffect(v.x, v.y - 50, 'MODO OSTENTAÇÃO! 💎', '#ffd700');
        this.spawnConfettiBurst();
      }

      this.updateHUD();
    },

    triggerTrap(trapNPC) {
      const v = this.vicente;

      // Revela o NPC de armadilha
      trapNPC.revealed = true;

      // Vicente toma susto e é empurrado para trás
      v.state = 'susto';
      v.stateTimer = 1.4;
      v.knockbackX = -v.facing * 12;

      // Zera o combo e perde pontos
      this.combo = 0;
      this.comboTimer = 0;
      const penalty = Math.abs(trapNPC.points || 300);
      this.score = Math.max(0, this.score - penalty);

      // Áudio de erro / susto
      if (window.AudioManager) {
        window.AudioManager.playErro();
        window.AudioManager.playErrorSound();
      }

      // Balão de fala de susto
      this.showSpeechBubble(this.getRandomErroText(), true);
      this.spawnScoreEffect(trapNPC.x, trapNPC.y - 30, `-${penalty} pts! 😱`, '#ff1744');

      // Registra armadilha nas conquistas
      if (window.Achievements) {
        window.Achievements.recordTrap();
      }

      this.updateHUD();

      // O NPC revelado sai correndo da tela
      trapNPC.direction = -v.facing;
      trapNPC.facing = -v.facing;
      trapNPC.speed = 2.5;
    },

    activateFugaMode() {
      this.isFugaMode = true;
      if (window.AudioManager) {
        window.AudioManager.activateFugaMode();
      }
      this.showSpeechBubble('DEU RUIM! OS MARIDOS TÃO VINDO! FUGAA!!', true);
      this.spawnScoreEffect(this.vicente.x, this.vicente.y - 60, '🚨 MODO FUGA ATIVADO! 🚨', '#ff1744');

      // Cria 2 maridos perseguidores
      this.chasers = [
        { x: this.vicente.x - 220, y: this.vicente.y - 10, speed: 3.5, type: 'policial' },
        { x: this.vicente.x - 300, y: this.vicente.y + 15, speed: 3.2, type: 'marido' }
      ];
    },

    updateChasers(dt) {
      for (const chaser of this.chasers) {
        if (chaser.x < this.vicente.x) {
          chaser.x += chaser.speed;
        } else {
          chaser.x -= chaser.speed;
        }
        if (chaser.y < this.vicente.y) {
          chaser.y += chaser.speed * 0.4;
        } else {
          chaser.y -= chaser.speed * 0.4;
        }
      }
    },

    updateCombo(dt) {
      if (this.comboTimer > 0) {
        this.comboTimer -= dt;
        const pct = (this.comboTimer / 5.0) * 100;
        this.dom.comboFill.style.width = pct + '%';
        this.dom.comboText.textContent = this.combo > 1 ? `x${this.combo} Combo!` : '';

        if (this.comboTimer <= 0) {
          this.combo = 0;
          this.dom.comboFill.style.width = '0%';
          this.dom.comboText.textContent = '';
        }
      }
    },

    updateHUD() {
      this.dom.scoreVal.textContent = this.score;
    },

    showSpeechBubble(text, isError) {
      this.vicente.speechBubble = {
        text: text,
        timer: 2.2,
        maxTimer: 2.2,
        isError: isError
      };
    },

    getRandomCantadaText() {
      return CANTADA_TEXTS[Math.floor(Math.random() * CANTADA_TEXTS.length)];
    },

    getRandomErroText() {
      return ERRO_TEXTS[Math.floor(Math.random() * ERRO_TEXTS.length)];
    },

    // ------------------------------------------------------------------------
    // SISTEMA DE EFEITOS (Hearts, Score Popups, Confetti)
    // ------------------------------------------------------------------------
    spawnHeart(x, y) {
      this.effects.push({
        type: 'heart',
        x: x + (Math.random() * 20 - 10),
        y: y,
        vy: -1.8 - Math.random() * 1.5,
        alpha: 1.0,
        size: 14 + Math.random() * 10
      });
    },

    spawnHeartBurst(x, y) {
      for (let i = 0; i < 6; i++) {
        this.effects.push({
          type: 'heart',
          x: x + (Math.random() * 30 - 15),
          y: y + (Math.random() * 20 - 10),
          vx: (Math.random() - 0.5) * 3,
          vy: -2 - Math.random() * 2.5,
          alpha: 1.0,
          size: 16 + Math.random() * 12
        });
      }
    },

    spawnScoreEffect(x, y, text, color) {
      this.effects.push({
        type: 'text',
        x: x,
        y: y,
        vy: -1.6,
        text: text,
        color: color || '#FFD700',
        alpha: 1.0
      });
    },

    spawnConfettiBurst() {
      const colors = ['#f44336', '#e91e63', '#9c27b0', '#2196f3', '#4caf50', '#ffeb3b', '#ff9800'];
      for (let i = 0; i < 60; i++) {
        this.effects.push({
          type: 'confetti',
          x: this.vicente.x + (Math.random() * 400 - 200),
          y: this.vicente.y - 120 + Math.random() * 60,
          vx: (Math.random() - 0.5) * 6,
          vy: -3 + Math.random() * 6,
          size: 6 + Math.random() * 6,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1.0,
          rotation: Math.random() * Math.PI * 2
        });
      }
    },

    updateEffects(dt) {
      for (let i = this.effects.length - 1; i >= 0; i--) {
        const ef = this.effects[i];

        if (ef.type === 'heart') {
          ef.x += (ef.vx || 0);
          ef.y += ef.vy;
          ef.alpha -= dt * 0.9;
        } else if (ef.type === 'text') {
          ef.y += ef.vy;
          ef.alpha -= dt * 0.8;
        } else if (ef.type === 'confetti') {
          ef.x += ef.vx;
          ef.y += ef.vy;
          ef.vy += 4.5 * dt; // gravidade
          ef.rotation += 0.1;
          ef.alpha -= dt * 0.4;
        }

        if (ef.alpha <= 0) {
          this.effects.splice(i, 1);
        }
      }
    },

    // ------------------------------------------------------------------------
    // RENDERIZAÇÃO
    // ------------------------------------------------------------------------
    render() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.width, this.height);

      ctx.save();
      // Aplica offset de câmera
      ctx.translate(-this.cameraX, 0);

      // Cenário
      this.drawBackground(ctx);

      // NPCs
      this.drawNPCs(ctx);

      // Perseguidores do Modo Fuga
      if (this.isFugaMode) {
        this.drawChasers(ctx);
      }

      // Vicente
      this.drawVicente(ctx);

      // Efeitos de partículas e números
      this.drawEffects(ctx);

      ctx.restore();

      // Vinheta vermelha piscante no Modo Fuga
      if (this.isFugaMode) {
        this.drawFugaVignette(ctx);
      }

      // Notificação de Conquista (Banner Dourado no topo)
      if (window.Achievements && typeof window.Achievements.drawPopup === 'function') {
        window.Achievements.drawPopup(ctx, this.width);
      }
    },

    drawBackground(ctx) {
      const w = this.worldWidth;
      const h = this.height;

      // 1. Céu estilo South Park
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.6);
      skyGrad.addColorStop(0, '#5cb3ff');
      skyGrad.addColorStop(1, '#d4ecff');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h * 0.6);

      // Nuvens simples de papel recortado
      ctx.fillStyle = '#ffffff';
      for (let c = 80; c < w; c += 350) {
        ctx.beginPath();
        ctx.arc(c, 70, 28, 0, Math.PI * 2);
        ctx.arc(c + 25, 60, 36, 0, Math.PI * 2);
        ctx.arc(c + 55, 70, 26, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Prédios da Cidade Brasileira
      for (const b of this.buildings) {
        const by = h * 0.58 - b.h;

        // Corpo do prédio
        ctx.fillStyle = b.color;
        ctx.strokeStyle = '#212121';
        ctx.lineWidth = 2.5;
        ctx.fillRect(b.x, by, b.w, b.h);
        ctx.strokeRect(b.x, by, b.w, b.h);

        // Telhado / Antenas
        ctx.fillStyle = '#37474f';
        ctx.fillRect(b.x + b.w * 0.3, by - 12, b.w * 0.4, 12);
        ctx.strokeStyle = '#455a64';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(b.x + b.w * 0.5, by - 12);
        ctx.lineTo(b.x + b.w * 0.5, by - 35);
        ctx.stroke();

        // Janelas em grade
        const winCols = Math.floor((b.w - 20) / 30);
        const winRows = Math.floor((b.h - 30) / 40);

        for (let row = 0; row < winRows; row++) {
          for (let col = 0; col < winCols; col++) {
            const wx = b.x + 15 + col * 30;
            const wy = by + 20 + row * 40;

            // Se for a janela especial da vizinha, pula desenho comum
            if (b.hasWindowTarget && row === winRows - 1 && col === Math.floor(winCols / 2)) {
              continue;
            }

            ctx.fillStyle = (row + col) % 3 === 0 ? '#ffea00' : '#b0bec5';
            ctx.strokeStyle = '#37474f';
            ctx.lineWidth = 1.5;
            ctx.fillRect(wx, wy, 18, 22);
            ctx.strokeRect(wx, wy, 18, 22);
          }
        }
      }

      // 3. Calçada (Área jogável)
      const sidewalkY = h * 0.58;
      const sidewalkH = h * 0.28;

      ctx.fillStyle = '#e0e0e0';
      ctx.fillRect(0, sidewalkY, w, sidewalkH);

      // Meio-fio e rachaduras
      ctx.strokeStyle = '#9e9e9e';
      ctx.lineWidth = 3;
      ctx.strokeRect(0, sidewalkY, w, sidewalkH);

      // Linhas da calçada
      ctx.strokeStyle = '#bdbdbd';
      ctx.lineWidth = 1.5;
      for (let lx = 0; lx < w; lx += 90) {
        ctx.beginPath();
        ctx.moveTo(lx, sidewalkY);
        ctx.lineTo(lx, sidewalkY + sidewalkH);
        ctx.stroke();
      }

      // Postes de luz de rua
      ctx.strokeStyle = '#263238';
      ctx.lineWidth = 4;
      for (let px = 150; px < w; px += 450) {
        ctx.beginPath();
        ctx.moveTo(px, sidewalkY + 20);
        ctx.lineTo(px, sidewalkY - 80);
        ctx.lineTo(px + 25, sidewalkY - 85);
        ctx.stroke();

        // Cúpula da lâmpada
        ctx.fillStyle = '#ffee58';
        ctx.beginPath();
        ctx.arc(px + 25, sidewalkY - 80, 8, 0, Math.PI);
        ctx.fill();
      }

      // 4. Asfalto da rua
      const streetY = sidewalkY + sidewalkH;
      const streetH = h - streetY;
      ctx.fillStyle = '#263238';
      ctx.fillRect(0, streetY, w, streetH);

      // Faixa tracejada amarela de trânsito
      ctx.strokeStyle = '#fbc02d';
      ctx.lineWidth = 5;
      ctx.setLineDash([30, 25]);
      ctx.beginPath();
      ctx.moveTo(0, streetY + streetH * 0.5);
      ctx.lineTo(w, streetY + streetH * 0.5);
      ctx.stroke();
      ctx.setLineDash([]); // restaura
    },

    drawVicente(ctx) {
      const v = this.vicente;
      ctx.save();
      ctx.translate(v.x, v.y);
      ctx.scale(v.facing, 1);

      const bob = Math.sin(v.animFrame * Math.PI) * 2.5;

      // Sombra projetada no chão
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.beginPath();
      ctx.ellipse(0, v.h - 4, 22, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pernas recortadas estilo South Park (calça jeans azul)
      const legSwing = Math.sin(v.animFrame * Math.PI) * 8;
      ctx.fillStyle = '#1565c0';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;

      // Perna esquerda
      ctx.fillRect(-12 + legSwing, v.h - 32, 10, 30);
      ctx.strokeRect(-12 + legSwing, v.h - 32, 10, 30);
      // Perna direita
      ctx.fillRect(2 - legSwing, v.h - 32, 10, 30);
      ctx.strokeRect(2 - legSwing, v.h - 32, 10, 30);

      // Sapatos marrons
      ctx.fillStyle = '#4e342e';
      ctx.fillRect(-15 + legSwing, v.h - 6, 15, 6);
      ctx.fillRect(0 - legSwing, v.h - 6, 15, 6);

      // Torso / Camiseta (Polo vermelha marcante)
      ctx.fillStyle = '#d32f2f';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2.5;
      ctx.fillRect(-16, v.h - 62 + bob, 32, 34);
      ctx.strokeRect(-16, v.h - 62 + bob, 32, 34);

      // Gola da camisa
      ctx.fillStyle = '#b71c1c';
      ctx.beginPath();
      ctx.moveTo(-8, v.h - 62 + bob);
      ctx.lineTo(0, v.h - 52 + bob);
      ctx.lineTo(8, v.h - 62 + bob);
      ctx.fill();

      // Braços
      ctx.fillStyle = '#ffcca5';
      if (v.state === 'galanteador') {
        // Braço esticado mandando beijo / apontando
        ctx.fillRect(10, v.h - 56 + bob, 22, 9);
        ctx.strokeRect(10, v.h - 56 + bob, 22, 9);
        // Beijo na ponta dos dedos
        ctx.fillStyle = '#ff4081';
        ctx.beginPath();
        ctx.arc(34, v.h - 52 + bob, 4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Braços laterais balançando
        ctx.fillRect(-22, v.h - 58 + bob, 8, 22);
        ctx.strokeRect(-22, v.h - 58 + bob, 8, 22);
        ctx.fillRect(14, v.h - 58 + bob, 8, 22);
        ctx.strokeRect(14, v.h - 58 + bob, 8, 22);
      }

      // Cabeça Real Recortada (PNG transparente)
      const headImg = v.headImages[v.state] || v.headImages.normal;
      if (headImg && headImg.complete && headImg.naturalWidth > 0) {
        const headW = 44;
        const headH = (headImg.naturalHeight / headImg.naturalWidth) * headW;
        const headX = -headW * 0.5;
        const headY = v.h - 60 - headH + bob;

        ctx.drawImage(headImg, headX, headY, headW, headH);
      }

      ctx.restore();

      // Balão de fala estilo gibi HQ
      if (v.speechBubble) {
        this.drawSpeechBubble(ctx, v.x, v.y + bob - 15, v.speechBubble);
      }
    },

    drawSpeechBubble(ctx, x, y, bubble) {
      ctx.save();
      ctx.font = 'bold 12px "Impact", "Arial Black", sans-serif';
      const text = bubble.text;
      const textW = ctx.measureText(text).width;
      const bw = Math.max(textW + 24, 130);
      const bh = 34;
      const bx = x - bw * 0.5;
      const by = y - bh - 65;

      // Fundo branco com borda preta grossa
      ctx.fillStyle = bubble.isError ? '#ffebee' : '#ffffff';
      ctx.strokeStyle = bubble.isError ? '#d50000' : '#000000';
      ctx.lineWidth = 2.5;

      // Retângulo com cantos levemente arredondados
      ctx.beginPath();
      ctx.roundRect(bx, by, bw, bh, 8);
      ctx.fill();
      ctx.stroke();

      // Rabicho triangular apontando pra cabeça
      ctx.beginPath();
      ctx.moveTo(x - 6, by + bh);
      ctx.lineTo(x, by + bh + 10);
      ctx.lineTo(x + 6, by + bh);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Texto
      ctx.fillStyle = bubble.isError ? '#b71c1c' : '#212121';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, x, by + bh * 0.5);

      ctx.restore();
    },

    drawNPCs(ctx) {
      // Ordena por coordenada Y para profundidade 2.5D (quem tá mais abaixo desenha por cima)
      const sorted = [...this.activeNPCs].sort((a, b) => a.y - b.y);

      for (const npc of sorted) {
        if (typeof npc.draw === 'function') {
          npc.draw(
            ctx,
            npc.x,
            npc.y,
            npc.width,
            npc.height,
            npc.facing || 1,
            npc.animFrame || 0,
            npc.revealed,
            npc.currentHits || 0
          );
        }
      }
    },

    drawChasers(ctx) {
      for (const c of this.chasers) {
        ctx.save();
        ctx.translate(c.x, c.y);

        // Homem furioso correndo atrás do Vicente
        ctx.fillStyle = c.type === 'policial' ? '#0d47a1' : '#b71c1c';
        ctx.fillRect(-12, 10, 24, 30);

        // Cabeça
        ctx.fillStyle = '#ffcca5';
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.stroke();

        // Pedaço de pau / cassetete erguido
        ctx.fillStyle = '#8d6e63';
        ctx.fillRect(8, -18, 6, 24);

        // Plaquinha de perigo
        ctx.font = 'bold 10px Arial';
        ctx.fillStyle = '#ff1744';
        ctx.fillText('MARIDO FURIOSO! 💢', -35, -25);

        ctx.restore();
      }
    },

    drawEffects(ctx) {
      for (const ef of this.effects) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, ef.alpha);

        if (ef.type === 'heart') {
          ctx.fillStyle = '#ff1744';
          ctx.font = `${ef.size}px Arial`;
          ctx.textAlign = 'center';
          ctx.fillText('💋', ef.x, ef.y);
        } else if (ef.type === 'text') {
          ctx.font = '900 16px "Impact", "Arial Black", sans-serif';
          ctx.textAlign = 'center';
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 3;
          ctx.strokeText(ef.text, ef.x, ef.y);
          ctx.fillStyle = ef.color || '#ffd700';
          ctx.fillText(ef.text, ef.x, ef.y);
        } else if (ef.type === 'confetti') {
          ctx.translate(ef.x, ef.y);
          ctx.rotate(ef.rotation || 0);
          ctx.fillStyle = ef.color;
          ctx.fillRect(-ef.size / 2, -ef.size / 2, ef.size, ef.size * 1.5);
        }

        ctx.restore();
      }
    },

    drawFugaVignette(ctx) {
      // Brilho / vinheta vermelha piscando na borda da tela
      const pulse = 0.3 + Math.sin(performance.now() * 0.008) * 0.2;
      ctx.save();
      ctx.fillStyle = `rgba(255, 0, 0, ${pulse})`;
      ctx.fillRect(0, 0, this.width, 10);
      ctx.fillRect(0, this.height - 10, this.width, 10);
      ctx.fillRect(0, 0, 10, this.height);
      ctx.fillRect(this.width - 10, 0, 10, this.height);
      ctx.restore();
    }
  };

  // Inicia o jogo quando o DOM carregar
  window.addEventListener('DOMContentLoaded', () => {
    Game.init();
    window.Game = Game;
  });
})();
