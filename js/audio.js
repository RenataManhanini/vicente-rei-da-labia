/**
 * ============================================================================
 * Vicente: O Rei da Lábia - Módulo de Áudio (audio.js)
 * ============================================================================
 * Estilo: Humor South Park / Arcade Brasileiro / Brega Romântico dos Anos 80
 *
 * Gerencia todo o áudio do jogo:
 *  - Vozes do Vicente em MP3 (cantadas, erros, conquistas e finais)
 *  - Trilha sonora sintetizada via Web Audio API (Brega arcade contagiante)
 *  - Efeitos sonoros sintetizados (pontos, combos, erros, UI e sirene de fuga)
 *  - Controle de prioridades de fala e mixagem independente de volumes
 * ============================================================================
 */

(function () {
  'use strict';

  // Tabela de frequências das notas musicais para o sintetizador brega
  const FREQS = {
    C2: 65.41, D2: 73.42, E2: 82.41, F2: 87.31, Fs2: 92.50, G2: 98.00, A2: 110.00, B2: 123.47,
    C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
    C6: 1046.50
  };

  // Mapeamento de conquistas para os respectivos arquivos MP3
  const CONQUISTAS_MAP = {
    papa_anjo: 'conquista_papa_anjo.mp3',
    pega_veia: 'conquista_pega_veia.mp3',
    prefeitura: 'conquista_prefeitura.mp3',
    padrasto: 'conquista_padrasto.mp3',
    perigo: 'conquista_perigo.mp3',
    salto: 'conquista_salto.mp3',
    fogo_amigo: 'conquista_fogo_amigo.mp3'
  };

  // Níveis de prioridade de voz: achievement > final > cantada > erro
  const PRIORIDADES = {
    erro: 1,
    cantada: 2,
    final: 3,
    achievement: 4
  };

  // Mapeamento temático de cantadas padrão por tipo/estilo de NPC
  const NPC_CANTADAS_DEFAULT = {
    novinha: [1, 2, 3, 4],
    pega_veia: [5, 6, 7],
    dona_lurdes: [5, 6, 7],
    prefeitura: [8, 9, 10],
    gotica: [11, 12, 13],
    crente: [14, 15],
    marombeira: [16, 17],
    tia_merenda: [18, 19],
    padrasto: [20]
  };

  window.AudioManager = {
    // ------------------------------------------------------------------------
    // Propriedades Públicas do Sistema de Áudio
    // ------------------------------------------------------------------------
    ctx: null,                   // Contexto Web Audio API principal
    masterGainNode: null,        // Ganho geral (mutar tudo instantaneamente)
    musicGainNode: null,         // Ganho da trilha sonora sintetizada
    sfxGainNode: null,           // Ganho dos efeitos sonoros sintetizados
    noiseBuffer: null,           // Buffer de ruído branco para percussão sintetizada

    muted: false,                // Flag mudo global
    musicVolume: 0.15,           // Volume da música brega (15-20% para não mascarar vozes)
    sfxVolume: 0.4,              // Volume dos efeitos sonoros
    voiceVolume: 0.8,            // Volume das falas do Vicente

    currentVoice: null,          // Instância atual de HTMLAudioElement tocando voz
    currentPriority: 0,          // Nível de prioridade da fala atual em execução
    bgMusicNode: null,           // Referência pública ao canal de música de fundo
    isFugaMode: false,           // Flag de modo fuga (tempo acelerado + sirene)

    // Estruturas Internas
    audioCache: {},              // Cache de instâncias HTMLAudioElement
    audioBasePath: 'assets/audio/',
    sirenNodes: null,            // Nós de oscilador e LFO da sirene de viatura
    isPlayingMusic: false,       // Estado de execução da música brega
    musicIntervalId: null,       // Timer do scheduler de compassos da música
    currentStep: 0,              // Passo atual do sequenciador (0 a 63, 4 compassos de 16 semicolcheias)
    nextStepTime: 0,             // Momento de disparo da próxima nota no relógio do Web Audio
    scheduleAheadTime: 0.12,     // Janela de antecipação do scheduler (segundos)

    // ------------------------------------------------------------------------
    // 1. Inicialização e Controle de Dispositivo
    // ------------------------------------------------------------------------

    /**
     * Inicializa o AudioContext e os nós mestres de ganho.
     * Pode ser chamado no primeiro clique do jogador para liberar o áudio no navegador.
     */
    init() {
      if (this.ctx) {
        if (this.ctx.state === 'suspended') {
          this.ctx.resume().catch((err) => console.warn('Aviso: Falha ao retomar AudioContext:', err));
        }
        return this.ctx;
      }

      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) {
          console.warn('Web Audio API não é suportada neste navegador.');
          return null;
        }

        this.ctx = new AudioContextClass();

        // Criação da árvore de nós de ganho
        this.masterGainNode = this.ctx.createGain();
        this.masterGainNode.gain.setValueAtTime(this.muted ? 0 : 1.0, this.ctx.currentTime);
        this.masterGainNode.connect(this.ctx.destination);

        this.musicGainNode = this.ctx.createGain();
        this.musicGainNode.gain.setValueAtTime(this.muted ? 0 : this.musicVolume, this.ctx.currentTime);
        this.musicGainNode.connect(this.masterGainNode);

        this.sfxGainNode = this.ctx.createGain();
        this.sfxGainNode.gain.setValueAtTime(this.muted ? 0 : this.sfxVolume, this.ctx.currentTime);
        this.sfxGainNode.connect(this.masterGainNode);

        this.bgMusicNode = this.musicGainNode;

        // Pré-gera 1 segundo de ruído branco para caixas e pratos analógicos bregas
        this._criarNoiseBuffer();

        // Destravamento automático em caso de política rígida de autoplay
        const unlockAudio = () => {
          if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().then(() => {
              window.removeEventListener('click', unlockAudio);
              window.removeEventListener('keydown', unlockAudio);
              window.removeEventListener('touchstart', unlockAudio);
            }).catch(() => {});
          }
        };

        window.addEventListener('click', unlockAudio, { passive: true });
        window.addEventListener('keydown', unlockAudio, { passive: true });
        window.addEventListener('touchstart', unlockAudio, { passive: true });

        // Aquece o cache dos arquivos de voz
        this.preloadAll();
      } catch (err) {
        console.error('Erro crítico ao inicializar AudioManager:', err);
      }

      return this.ctx;
    },

    /**
     * Alterna o estado de mudo geral do jogo.
     * Pausa falas ativas e zera ganhos. Ao desmutar restaura níveis originais.
     * @returns {boolean} Novo estado de mudo (true = mudo, false = audível)
     */
    toggleMute() {
      this.muted = !this.muted;

      if (this.muted) {
        // Pausa qualquer voz de MP3 tocando no momento
        if (this.currentVoice && !this.currentVoice.paused) {
          try {
            this.currentVoice.pause();
          } catch (_) {}
        }

        // Corta volume nos nós de saída de áudio
        if (this.masterGainNode && this.ctx) {
          this.masterGainNode.gain.setValueAtTime(0, this.ctx.currentTime);
        }
      } else {
        // Restaura níveis de ganho originais
        if (this.masterGainNode && this.ctx) {
          this.masterGainNode.gain.setValueAtTime(1.0, this.ctx.currentTime);
        }
        if (this.musicGainNode && this.ctx) {
          this.musicGainNode.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
        }
        if (this.sfxGainNode && this.ctx) {
          this.sfxGainNode.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
        }

        // Retoma AudioContext se estiver suspenso
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
      }

      return this.muted;
    },

    /**
     * Ajusta volume da trilha musical (0.0 a 1.0)
     */
    setMusicVolume(volume) {
      this.musicVolume = Math.max(0, Math.min(1, volume));
      if (!this.muted && this.musicGainNode && this.ctx) {
        this.musicGainNode.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
      }
    },

    /**
     * Ajusta volume dos efeitos sonoros sintetizados (0.0 a 1.0)
     */
    setSfxVolume(volume) {
      this.sfxVolume = Math.max(0, Math.min(1, volume));
      if (!this.muted && this.sfxGainNode && this.ctx) {
        this.sfxGainNode.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
      }
    },

    /**
     * Ajusta volume das falas do Vicente (0.0 a 1.0)
     */
    setVoiceVolume(volume) {
      this.voiceVolume = Math.max(0, Math.min(1, volume));
      if (this.currentVoice && !this.muted) {
        this.currentVoice.volume = this.voiceVolume;
      }
    },

    // ------------------------------------------------------------------------
    // 2. Gerenciamento de Vozes e MP3 (Vicente e Conquistas)
    // ------------------------------------------------------------------------

    /**
     * Reproduz um arquivo de voz MP3 respeitando hierarquia de prioridade.
     * Interrompe vozes anteriores de menor ou igual prioridade.
     *
     * @param {string} filename Nome do arquivo ou caminho (ex: 'cantada1.mp3')
     * @param {string} type Tipo da fala ('achievement', 'final', 'cantada', 'erro')
     * @returns {HTMLAudioElement|null} Elemento de áudio ou null em caso de bloqueio
     */
    playVoice(filename, type = 'cantada') {
      if (!filename) return null;

      const priority = PRIORIDADES[type] || 1;

      // Se já houver uma fala tocando com prioridade estritamente superior, não interrompe
      if (this.currentVoice && !this.currentVoice.paused && !this.currentVoice.ended) {
        if (priority < this.currentPriority) {
          return null;
        }
        // Interrompe imediatamente a fala anterior
        this.stopVoice();
      }

      // Normaliza o caminho do arquivo
      let fullPath = filename;
      if (!fullPath.startsWith('assets/audio/') && !fullPath.startsWith('http')) {
        fullPath = this.audioBasePath + fullPath;
      }
      if (!fullPath.endsWith('.mp3')) {
        fullPath += '.mp3';
      }

      try {
        let audio = this.audioCache[fullPath];
        if (!audio) {
          audio = new Audio(fullPath);
          this.audioCache[fullPath] = audio;
        } else {
          try {
            audio.currentTime = 0;
          } catch (_) {}
        }

        audio.volume = this.muted ? 0 : this.voiceVolume;
        this.currentVoice = audio;
        this.currentPriority = priority;

        audio.onended = () => {
          if (this.currentVoice === audio) {
            this.currentVoice = null;
            this.currentPriority = 0;
          }
        };

        audio.onerror = (e) => {
          console.warn('Erro ao carregar arquivo de voz:', fullPath, e);
          if (this.currentVoice === audio) {
            this.currentVoice = null;
            this.currentPriority = 0;
          }
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            // Autoplay bloqueado até interação do usuário
            console.warn('Execução de voz aguardando interação do usuário:', fullPath, err.message);
          });
        }

        return audio;
      } catch (err) {
        console.warn('Falha na tentativa de reproduzir voz:', fullPath, err);
        return null;
      }
    },

    /**
     * Toca uma cantada do Vicente (aleatória ou preferencial por NPC).
     * @param {string|null} npcId Identificador do NPC (opcional)
     * @param {Array<number|string>|null} preferredList Lista de cantadas preferenciais
     */
    playCantada(npcId = null, preferredList = null) {
      let selectedNumber = null;

      if (Array.isArray(preferredList) && preferredList.length > 0) {
        selectedNumber = preferredList[Math.floor(Math.random() * preferredList.length)];
      } else if (npcId && NPC_CANTADAS_DEFAULT[npcId]) {
        const list = NPC_CANTADAS_DEFAULT[npcId];
        selectedNumber = list[Math.floor(Math.random() * list.length)];
      } else {
        // Sorteia uma cantada entre 1 e 20
        selectedNumber = Math.floor(Math.random() * 20) + 1;
      }

      // Normaliza para cantadaX.mp3
      let clean = String(selectedNumber).replace(/\.mp3$/, '');
      if (!clean.startsWith('cantada')) {
        clean = 'cantada' + clean;
      }

      return this.playVoice(clean + '.mp3', 'cantada');
    },

    /**
     * Toca uma reação de erro ou fora do Vicente (erro1 a erro7).
     */
    playErro() {
      const num = Math.floor(Math.random() * 7) + 1;
      return this.playVoice(`erro${num}.mp3`, 'erro');
    },

    /**
     * Toca o áudio de uma conquista desbloqueada.
     * @param {string} achievementId Chave da conquista (ex: 'papa_anjo', 'salto', etc.)
     */
    playConquista(achievementId) {
      if (!achievementId) return null;

      const cleanKey = String(achievementId).replace(/^conquista_/, '').replace(/\.mp3$/, '');
      const filename = CONQUISTAS_MAP[cleanKey] || `conquista_${cleanKey}.mp3`;

      // Toca também a fanfarra sintetizada para dar impacto festivo
      this.playAchievementSound();

      return this.playVoice(filename, 'achievement');
    },

    /**
     * Toca o áudio narrativo do desfecho final da partida.
     * @param {'bom'|'fuga'|'zoado'} type Tipo do final atingido
     */
    playFinal(type = 'bom') {
      const cleanType = String(type).replace(/^final_/, '').replace(/\.mp3$/, '');
      const valid = ['bom', 'fuga', 'zoado'];
      const finalType = valid.includes(cleanType) ? cleanType : 'bom';

      return this.playVoice(`final_${finalType}.mp3`, 'final');
    },

    /**
     * Interrompe qualquer fala em execução imediatamente.
     */
    stopVoice() {
      if (this.currentVoice) {
        try {
          const audio = this.currentVoice;
          this.currentVoice = null;
          this.currentPriority = 0;
          audio.pause();
          audio.currentTime = 0;
          audio.onended = null;
        } catch (e) {
          console.warn('Erro ao silenciar voz ativa:', e);
        }
      }
    },

    /**
     * Pré-carrega todos os arquivos de áudio do jogo para o cache do navegador.
     */
    preloadAll() {
      const arquivos = [
        // 20 cantadas
        ...Array.from({ length: 20 }, (_, i) => `cantada${i + 1}.mp3`),
        // 7 erros
        ...Array.from({ length: 7 }, (_, i) => `erro${i + 1}.mp3`),
        // 7 conquistas
        'conquista_papa_anjo.mp3',
        'conquista_pega_veia.mp3',
        'conquista_prefeitura.mp3',
        'conquista_padrasto.mp3',
        'conquista_perigo.mp3',
        'conquista_salto.mp3',
        'conquista_fogo_amigo.mp3',
        // 3 finais
        'final_bom.mp3',
        'final_fuga.mp3',
        'final_zoado.mp3'
      ];

      arquivos.forEach((file) => {
        const fullPath = this.audioBasePath + file;
        if (!this.audioCache[fullPath]) {
          try {
            const el = new Audio();
            el.preload = 'auto';
            el.src = fullPath;
            this.audioCache[fullPath] = el;
          } catch (e) {
            console.warn('Aviso: Falha no pré-carregamento de áudio:', fullPath, e);
          }
        }
      });
    },

    // ------------------------------------------------------------------------
    // 3. Trilha Sonora Sintetizada (Estilo Brega Arcade em Loop)
    // ------------------------------------------------------------------------

    /**
     * Inicia a trilha sonora brega sintetizada via Web Audio API.
     */
    startMusic() {
      if (!this.ctx) this.init();

      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      if (this.isPlayingMusic) return;

      this.isPlayingMusic = true;
      this.currentStep = 0;
      this.nextStepTime = this.ctx ? this.ctx.currentTime + 0.05 : 0;

      if (this.musicIntervalId) {
        clearInterval(this.musicIntervalId);
      }

      // Intervalo preciso de agendamento de compassos (Lookahead Scheduler)
      this.musicIntervalId = setInterval(() => {
        if (!this.isPlayingMusic || !this.ctx) return;
        this._schedulerLoop();
      }, 25);
    },

    /**
     * Interrompe a trilha sonora brega e desativa eventuais efeitos de fuga.
     */
    stopMusic() {
      this.isPlayingMusic = false;
      if (this.musicIntervalId) {
        clearInterval(this.musicIntervalId);
        this.musicIntervalId = null;
      }
      if (this.isFugaMode) {
        this.deactivateFugaMode();
      }
    },

    /**
     * Ativa o modo Fuga: acelera a trilha brega para 160 BPM e liga a sirene da polícia.
     */
    activateFugaMode() {
      this.isFugaMode = true;
      this._startSiren();
    },

    /**
     * Desativa o modo Fuga: retorna o tempo para 120 BPM e desliga a sirene.
     */
    deactivateFugaMode() {
      this.isFugaMode = false;
      this._stopSiren();
    },

    // ------------------------------------------------------------------------
    // 4. Efeitos Sonoros Sintetizados (Web Audio API)
    // ------------------------------------------------------------------------

    /**
     * Efeito "Plim": bip agudo curto e brilhante ao marcar pontos ou flertes de sucesso.
     */
    playPointSound() {
      if (!this.ctx) this.init();
      if (this.muted || !this.ctx) return;

      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(987.77, now); // B5
        osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.06); // E6

        gain.gain.setValueAtTime(this.sfxVolume * 0.7, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

        osc.connect(gain);
        gain.connect(this.sfxGainNode);

        osc.start(now);
        osc.stop(now + 0.15);

        osc.onended = () => {
          osc.disconnect();
          gain.disconnect();
        };
      } catch (e) {
        console.warn('Erro ao tocar pointSound:', e);
      }
    },

    /**
     * Fanfarra curta ascendente de conquista (Dó-Mi-Sol-Dó agudo em ~0.5s).
     */
    playAchievementSound() {
      if (!this.ctx) this.init();
      if (this.muted || !this.ctx) return;

      try {
        const now = this.ctx.currentTime;
        const notasFanfarra = [
          { freq: FREQS.C5, time: 0, dur: 0.10 },
          { freq: FREQS.E5, time: 0.10, dur: 0.10 },
          { freq: FREQS.G5, time: 0.20, dur: 0.12 },
          { freq: FREQS.C6, time: 0.32, dur: 0.28 }
        ];

        notasFanfarra.forEach((item) => {
          const t = now + item.time;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(item.freq, t);

          gain.gain.setValueAtTime(0.001, t);
          gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.75, t + 0.015);
          gain.gain.exponentialRampToValueAtTime(0.001, t + item.dur);

          osc.connect(gain);
          gain.connect(this.sfxGainNode);

          osc.start(t);
          osc.stop(t + item.dur + 0.02);

          osc.onended = () => {
            osc.disconnect();
            gain.disconnect();
          };
        });
      } catch (e) {
        console.warn('Erro ao tocar achievementSound:', e);
      }
    },

    /**
     * Buzzer grave com tom descendente para tocos, foras e armadilhas (~0.3s).
     */
    playErrorSound() {
      if (!this.ctx) this.init();
      if (this.muted || !this.ctx) return;

      try {
        const now = this.ctx.currentTime;
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'sawtooth';
        osc2.type = 'sawtooth';

        // Dois osciladores com leve batimento para efeito cômico de falha
        osc1.frequency.setValueAtTime(155, now);
        osc1.frequency.linearRampToValueAtTime(70, now + 0.28);

        osc2.frequency.setValueAtTime(162, now);
        osc2.frequency.linearRampToValueAtTime(74, now + 0.28);

        gain.gain.setValueAtTime(this.sfxVolume * 0.65, now);
        gain.gain.setValueAtTime(this.sfxVolume * 0.65, now + 0.14);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.30);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.sfxGainNode);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.31);
        osc2.stop(now + 0.31);

        osc1.onended = () => {
          osc1.disconnect();
          osc2.disconnect();
          gain.disconnect();
        };
      } catch (e) {
        console.warn('Erro ao tocar errorSound:', e);
      }
    },

    /**
     * Clique discreto e seco para botões e interações de interface (~0.05s).
     */
    playClickSound() {
      if (!this.ctx) this.init();
      if (this.muted || !this.ctx) return;

      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(850, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.04);

        gain.gain.setValueAtTime(this.sfxVolume * 0.45, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

        osc.connect(gain);
        gain.connect(this.sfxGainNode);

        osc.start(now);
        osc.stop(now + 0.05);

        osc.onended = () => {
          osc.disconnect();
          gain.disconnect();
        };
      } catch (e) {
        console.warn('Erro ao tocar clickSound:', e);
      }
    },

    /**
     * Som de combo com afinação progressiva quanto maior o combo do jogador.
     * @param {number} combo Quantidade de acertos seguidos
     */
    playComboSound(combo = 1) {
      if (!this.ctx) this.init();
      if (this.muted || !this.ctx) return;

      try {
        const now = this.ctx.currentTime;
        const nivel = Math.min(Math.max(Number(combo) || 1, 1), 12);
        // Progressão harmônica ascendente baseada no nível do combo
        const baseFreq = 587.33 * Math.pow(1.08, nivel - 1); // Parte de Ré5

        // Nota 1: Fundamento
        const osc1 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(baseFreq, now);

        gain1.gain.setValueAtTime(this.sfxVolume * 0.7, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

        osc1.connect(gain1);
        gain1.connect(this.sfxGainNode);
        osc1.start(now);
        osc1.stop(now + 0.10);

        // Nota 2: Arpejo reluzente ligeiramente acima
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(baseFreq * 1.333, now + 0.04);

        gain2.gain.setValueAtTime(0.001, now + 0.04);
        gain2.gain.linearRampToValueAtTime(this.sfxVolume * 0.8, now + 0.05);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

        osc2.connect(gain2);
        gain2.connect(this.sfxGainNode);
        osc2.start(now + 0.04);
        osc2.stop(now + 0.17);

        osc1.onended = () => {
          osc1.disconnect();
          gain1.disconnect();
        };
        osc2.onended = () => {
          osc2.disconnect();
          gain2.disconnect();
        };
      } catch (e) {
        console.warn('Erro ao tocar comboSound:', e);
      }
    },

    // ------------------------------------------------------------------------
    // 5. Rotinas Internas do Sintetizador Brega & Modo Fuga
    // ------------------------------------------------------------------------

    /**
     * Criação de buffer estático de ruído branco para a percussão arcade.
     * @private
     */
    _criarNoiseBuffer() {
      if (!this.ctx) return;
      try {
        const bufferSize = this.ctx.sampleRate * 1.0;
        this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = this.noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }
      } catch (e) {
        console.warn('Aviso: Falha ao gerar buffer de ruído:', e);
      }
    },

    /**
     * Loop principal de agendamento de notas musicais bregas com lookahead.
     * @private
     */
    _schedulerLoop() {
      // Proteção contra suspensão de abas ou perda de sincronia do relógio
      if (this.nextStepTime < this.ctx.currentTime) {
        this.nextStepTime = this.ctx.currentTime + 0.02;
      }

      while (this.nextStepTime < this.ctx.currentTime + this.scheduleAheadTime) {
        this._tocarPassoBrega(this.currentStep, this.nextStepTime);
        this._avancarPasso();
      }
    },

    /**
     * Avança para a próxima semicolcheia respeitando o BPM atual.
     * @private
     */
    _avancarPasso() {
      const bpm = this.isFugaMode ? 160 : 120;
      const segundosPorBatida = 60.0 / bpm;
      const segundosPorPasso = segundosPorBatida / 4; // 16 passos por compasso
      this.nextStepTime += segundosPorPasso;
      this.currentStep = (this.currentStep + 1) % 64; // Loop de 4 compassos (64 passos)
    },

    /**
     * Toca os instrumentos cabíveis no passo atual do arranjo brega.
     * Estrutura harmônica: Compasso 1: Dó Maior | Compasso 2: Lá Menor | Compasso 3: Fá Maior | Compasso 4: Sol Maior
     * @private
     */
    _tocarPassoBrega(step, time) {
      if (this.muted || !this.ctx) return;

      const compasso = Math.floor(step / 16);
      const passoNoCompasso = step % 16;

      // 1. Linha de Baixo Brega (Gingado sincopado com onda triangular aveludada)
      this._tocarBaixo(compasso, passoNoCompasso, time);

      // 2. Acordes Rítmicos (Teclado brega "Tcha-tcha" nos contratempos)
      this._tocarTecladoRitmo(compasso, passoNoCompasso, time);

      // 3. Melodia Principal (Lead de sintetizador brega/arcade nostálgico)
      this._tocarMelodia(step, time);

      // 4. Percussão Brega Sintetizada (Bumbo, caixa e prato)
      this._tocarBateria(step, passoNoCompasso, time);
    },

    /**
     * Linha de contrabaixo brega elétrico / sintetizado.
     * @private
     */
    _tocarBaixo(compasso, subStep, time) {
      let freq = null;
      let dur = 0.12;

      // Padrão clássico brega: fundamental na cabeça, quinta no meio e condução no final
      if (compasso === 0) { // Dó Maior
        if (subStep === 0) freq = FREQS.C2;
        else if (subStep === 3) freq = FREQS.C2;
        else if (subStep === 6) freq = FREQS.G2;
        else if (subStep === 8) freq = FREQS.G2;
        else if (subStep === 11) freq = FREQS.C3;
        else if (subStep === 14) freq = FREQS.B2; // Condução para Lá
      } else if (compasso === 1) { // Lá Menor
        if (subStep === 0) freq = FREQS.A2;
        else if (subStep === 3) freq = FREQS.A2;
        else if (subStep === 6) freq = FREQS.E2;
        else if (subStep === 8) freq = FREQS.E2;
        else if (subStep === 11) freq = FREQS.A2;
        else if (subStep === 14) freq = FREQS.G2; // Condução para Fá
      } else if (compasso === 2) { // Fá Maior
        if (subStep === 0) freq = FREQS.F2;
        else if (subStep === 3) freq = FREQS.F2;
        else if (subStep === 6) freq = FREQS.C3;
        else if (subStep === 8) freq = FREQS.C3;
        else if (subStep === 11) freq = FREQS.F2;
        else if (subStep === 14) freq = FREQS.Fs2; // Condução cromática para Sol
      } else if (compasso === 3) { // Sol Maior
        if (subStep === 0) freq = FREQS.G2;
        else if (subStep === 3) freq = FREQS.G2;
        else if (subStep === 6) freq = FREQS.D3;
        else if (subStep === 8) freq = FREQS.D3;
        else if (subStep === 11) freq = FREQS.G2;
        else if (subStep === 14) freq = FREQS.B2; // Condução de volta para Dó
      }

      if (freq) {
        try {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const filter = this.ctx.createBiquadFilter();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, time);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(380, time);

          gain.gain.setValueAtTime(0.001, time);
          gain.gain.linearRampToValueAtTime(0.65, time + 0.008);
          gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.musicGainNode);

          osc.start(time);
          osc.stop(time + dur + 0.02);

          osc.onended = () => {
            osc.disconnect();
            filter.disconnect();
            gain.disconnect();
          };
        } catch (_) {}
      }
    },

    /**
     * Stabs de teclado nos contratempos (característico de lambada/brega).
     * @private
     */
    _tocarTecladoRitmo(compasso, subStep, time) {
      // Toca nos contratempos: passos 2, 6, 10, 14
      if (subStep !== 2 && subStep !== 6 && subStep !== 10 && subStep !== 14) {
        return;
      }

      let triade = [];
      if (compasso === 0) triade = [FREQS.C4, FREQS.E4, FREQS.G4]; // C
      else if (compasso === 1) triade = [FREQS.A3, FREQS.C4, FREQS.E4]; // Am
      else if (compasso === 2) triade = [FREQS.F3, FREQS.A3, FREQS.C4]; // F
      else if (compasso === 3) triade = [FREQS.G3, FREQS.B3, FREQS.D4]; // G

      const dur = 0.065;
      triade.forEach((f) => {
        try {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const filter = this.ctx.createBiquadFilter();

          osc.type = 'square';
          osc.frequency.setValueAtTime(f, time);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(1400, time);
          filter.Q.setValueAtTime(1.5, time);

          gain.gain.setValueAtTime(0.001, time);
          gain.gain.linearRampToValueAtTime(0.18, time + 0.005);
          gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.musicGainNode);

          osc.start(time);
          osc.stop(time + dur + 0.02);

          osc.onended = () => {
            osc.disconnect();
            filter.disconnect();
            gain.disconnect();
          };
        } catch (_) {}
      });
    },

    /**
     * Melodia principal brega alegre e cômica (Sawtooth filtrado arcade).
     * @private
     */
    _tocarMelodia(step, time) {
      const melodia = {
        // Compasso 1 (Dó Maior)
        0: { freq: FREQS.G4, dur: 0.22 },
        4: { freq: FREQS.E4, dur: 0.14 },
        6: { freq: FREQS.G4, dur: 0.14 },
        8: { freq: FREQS.C5, dur: 0.38 },
        12: { freq: FREQS.B4, dur: 0.20 },

        // Compasso 2 (Lá Menor)
        16: { freq: FREQS.A4, dur: 0.24 },
        20: { freq: FREQS.C5, dur: 0.14 },
        22: { freq: FREQS.B4, dur: 0.14 },
        24: { freq: FREQS.A4, dur: 0.35 },
        28: { freq: FREQS.E4, dur: 0.18 },

        // Compasso 3 (Fá Maior)
        32: { freq: FREQS.F4, dur: 0.15 },
        34: { freq: FREQS.A4, dur: 0.15 },
        36: { freq: FREQS.C5, dur: 0.22 },
        40: { freq: FREQS.D5, dur: 0.22 },
        44: { freq: FREQS.C5, dur: 0.20 },

        // Compasso 4 (Sol Maior - finalização e chamada para reinício)
        48: { freq: FREQS.B4, dur: 0.20 },
        52: { freq: FREQS.G4, dur: 0.15 },
        56: { freq: FREQS.A4, dur: 0.12 },
        58: { freq: FREQS.B4, dur: 0.12 },
        60: { freq: FREQS.D5, dur: 0.18 },
        62: { freq: FREQS.B4, dur: 0.14 }
      };

      const nota = melodia[step];
      if (!nota) return;

      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(nota.freq, time);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2200, time);
        filter.Q.setValueAtTime(2.0, time);

        gain.gain.setValueAtTime(0.001, time);
        gain.gain.linearRampToValueAtTime(0.24, time + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.001, time + nota.dur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGainNode);

        osc.start(time);
        osc.stop(time + nota.dur + 0.03);

        osc.onended = () => {
          osc.disconnect();
          filter.disconnect();
          gain.disconnect();
        };
      } catch (_) {}
    },

    /**
     * Percussão sintetizada da batida brega/arcade.
     * @private
     */
    _tocarBateria(step, subStep, time) {
      // 1. Bumbo (Kick)
      const isBumbo = this.isFugaMode
        ? (subStep % 4 === 0) // No modo fuga o bumbo bate em todas as semínimas (four-on-the-floor)
        : (subStep === 0 || subStep === 8);

      if (isBumbo) {
        try {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(130, time);
          osc.frequency.exponentialRampToValueAtTime(38, time + 0.07);

          gain.gain.setValueAtTime(0.65, time);
          gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

          osc.connect(gain);
          gain.connect(this.musicGainNode);

          osc.start(time);
          osc.stop(time + 0.09);

          osc.onended = () => {
            osc.disconnect();
            gain.disconnect();
          };
        } catch (_) {}
      }

      // 2. Caixa / Palmas (Snare sintetizado com ruído filtrado)
      if (subStep === 4 || subStep === 12) {
        if (this.noiseBuffer) {
          try {
            const noise = this.ctx.createBufferSource();
            noise.buffer = this.noiseBuffer;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1100, time);
            filter.Q.setValueAtTime(1.2, time);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.35, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.075);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.musicGainNode);

            noise.start(time);
            noise.stop(time + 0.085);

            noise.onended = () => {
              noise.disconnect();
              filter.disconnect();
              gain.disconnect();
            };
          } catch (_) {}
        }
      }

      // 3. Prato / Chimbau (Hi-Hat em colcheias)
      const isPrato = this.isFugaMode ? (subStep % 2 === 0) : (subStep % 4 === 2);
      if (isPrato && this.noiseBuffer) {
        try {
          const noise = this.ctx.createBufferSource();
          noise.buffer = this.noiseBuffer;

          const filter = this.ctx.createBiquadFilter();
          filter.type = 'highpass';
          filter.frequency.setValueAtTime(6500, time);

          const gain = this.ctx.createGain();
          gain.gain.setValueAtTime(0.18, time);
          gain.gain.exponentialRampToValueAtTime(0.001, time + 0.035);

          noise.connect(filter);
          filter.connect(gain);
          gain.connect(this.musicGainNode);

          noise.start(time);
          noise.stop(time + 0.045);

          noise.onended = () => {
            noise.disconnect();
            filter.disconnect();
            gain.disconnect();
          };
        } catch (_) {}
      }
    },

    /**
     * Inicia a sirene de viatura policial durante o Modo Fuga.
     * Oscilação senoidal entre 600Hz e 900Hz via LFO dedicado.
     * @private
     */
    _startSiren() {
      if (this.sirenNodes || !this.ctx) return;

      try {
        const osc = this.ctx.createOscillator();
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        const sirenGain = this.ctx.createGain();

        // Tom central da sirene: 750 Hz
        osc.type = 'sine';
        osc.frequency.setValueAtTime(750, this.ctx.currentTime);

        // LFO senoidal modulando ±150 Hz a 1.6 Hz (variação contínua entre 600 Hz e 900 Hz)
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(1.6, this.ctx.currentTime);
        lfoGain.gain.setValueAtTime(150, this.ctx.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);

        // Volume moderado para não encobrir as cantadas nem a música
        const targetVol = this.muted ? 0 : this.sfxVolume * 0.35;
        sirenGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        sirenGain.gain.linearRampToValueAtTime(targetVol, this.ctx.currentTime + 0.3);

        osc.connect(sirenGain);
        sirenGain.connect(this.sfxGainNode);

        osc.start();
        lfo.start();

        this.sirenNodes = { osc, lfo, lfoGain, sirenGain };
      } catch (e) {
        console.warn('Erro ao inicializar sirene policial:', e);
      }
    },

    /**
     * Desliga suavemente a sirene policial com rampa de fade-out.
     * @private
     */
    _stopSiren() {
      if (!this.sirenNodes) return;

      try {
        const { osc, lfo, lfoGain, sirenGain } = this.sirenNodes;
        this.sirenNodes = null;

        if (this.ctx) {
          sirenGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
          setTimeout(() => {
            try {
              osc.stop();
              lfo.stop();
              osc.disconnect();
              lfo.disconnect();
              lfoGain.disconnect();
              sirenGain.disconnect();
            } catch (_) {}
          }, 220);
        } else {
          osc.stop();
          lfo.stop();
        }
      } catch (e) {
        console.warn('Erro ao desativar sirene policial:', e);
        this.sirenNodes = null;
      }
    }
  };
})();
