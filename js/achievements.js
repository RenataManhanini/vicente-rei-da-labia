/**
 * Vicente: O Rei da Lábia
 * achievements.js - Sistema de Conquistas / Troféus
 *
 * Gerencia o desbloqueio de troféus, notificações visuais (pop-up dourado),
 * reprodução de áudios de conquistas e determinação do tipo de final.
 *
 * Estilo visual: Humor ácido recortado estilo South Park.
 */

(function () {
  'use strict';

  // Chave utilizada no LocalStorage
  const STORAGE_KEY = 'vicente_achievements';

  // Configurações de tempo da animação do pop-up (em segundos)
  const POPUP_SLIDE_IN = 0.3;
  const POPUP_VISIBLE = 3.5;
  const POPUP_SLIDE_OUT = 0.3;
  const POPUP_TOTAL_TIME = POPUP_SLIDE_IN + POPUP_VISIBLE + POPUP_SLIDE_OUT; // 4.1 segundos

  /**
   * Lista oficial de conquistas do jogo
   */
  const ACHIEVEMENTS = [
    {
      id: 'papa_anjo',
      name: 'Papa-Anjo',
      description: 'Conquistou 3 Novinhas do TikTok',
      icon: '👼',
      audio: 'conquista_papa_anjo.mp3',
      condition: (stats) => (stats.conquered.novinha_tiktok || 0) >= 3
    },
    {
      id: 'pega_veia',
      name: 'Pega Véia',
      description: 'Conquistou 2 Vovózinhas da Praça',
      icon: '👵',
      audio: 'conquista_pega_veia.mp3',
      condition: (stats) => (stats.conquered.vovozinha || 0) >= 2
    },
    {
      id: 'prefeitura',
      name: 'Quem Ignora Buraco é Prefeitura',
      description: 'Conquistou a Feia com Força e a Cracuda',
      icon: '🏚️',
      audio: 'conquista_prefeitura.mp3',
      condition: (stats) => (stats.conquered.feia_forca || 0) >= 1 && (stats.conquered.cracuda || 0) >= 1
    },
    {
      id: 'padrasto',
      name: 'Padrasto do Ano',
      description: 'Conquistou a Mãe Solteira de 4 Filhos',
      icon: '👨‍👧‍👦',
      audio: 'conquista_padrasto.mp3',
      condition: (stats) => (stats.conquered.mae_4_filhos || 0) >= 1
    },
    {
      id: 'perigo',
      name: 'Perigo é o Meu Sobrenome',
      description: 'Conquistou a Mulher do Preso, do Policial e do Agiota',
      icon: '💀',
      audio: 'conquista_perigo.mp3',
      condition: (stats) =>
        (stats.conquered.mulher_preso || 0) >= 1 &&
        (stats.conquered.mulher_policial || 0) >= 1 &&
        (stats.conquered.mulher_agiota || 0) >= 1
    },
    {
      id: 'salto',
      name: 'Salto Ornamental',
      description: 'Conquistou a Vizinha Casada na Janela',
      icon: '🪟',
      audio: 'conquista_salto.mp3',
      condition: (stats) => (stats.conquered.vizinha_casada || 0) >= 1
    },
    {
      id: 'fogo_amigo',
      name: 'Fogo Amigo',
      description: 'Caiu em 2 armadilhas na mesma partida',
      icon: '🔥',
      audio: 'conquista_fogo_amigo.mp3',
      condition: (stats) => (stats.trapsFallen || 0) >= 2
    }
  ];

  /**
   * Função auxiliar para desenhar retângulos com cantos arredondados
   */
  function drawRoundedRect(ctx, x, y, width, height, radius) {
    if (typeof ctx.roundRect === 'function') {
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, radius);
      return;
    }
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arcTo(x + width, y, x + width, y + radius, radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    ctx.lineTo(x + radius, y + height);
    ctx.arcTo(x, y + height, x, y + height - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
  }

  /**
   * Módulo principal exportado em window.Achievements
   */
  const Achievements = {
    // Referência à lista de definições
    ACHIEVEMENTS: ACHIEVEMENTS,

    // Estados da sessão e histórico
    unlockedThisGame: [], // Array de IDs desbloqueados na partida atual
    allTimeUnlocked: [], // Carregado do localStorage
    pendingPopups: [], // Fila de conquistas aguardando exibição
    currentPopup: null, // Conquista sendo exibida atualmente
    popupTimer: 0, // Tempo restante de exibição do pop-up atual (em segundos)

    // Estatísticas da partida em andamento
    stats: {
      conquered: {}, // { npc_id: count }
      trapsFallen: 0,
      riskConquered: [], // IDs de NPCs de risco conquistados
      totalPoints: 0
    },

    /**
     * Inicializa o sistema: carrega histórico do LocalStorage e reseta partida
     */
    init() {
      this.load();
      this.reset();
    },

    /**
     * Reseta estatísticas e pop-ups para uma nova partida mantendo allTimeUnlocked
     */
    reset() {
      this.stats = {
        conquered: {},
        trapsFallen: 0,
        riskConquered: [],
        totalPoints: 0
      };
      this.unlockedThisGame = [];
      this.pendingPopups = [];
      this.currentPopup = null;
      this.popupTimer = 0;
    },

    /**
     * Registra uma conquista amorosa de NPC e avalia troféus
     * @param {string} npcId - Identificador do NPC conquistado
     */
    recordConquest(npcId) {
      if (!npcId) return;

      this.stats.conquered[npcId] = (this.stats.conquered[npcId] || 0) + 1;

      // NPCs de risco contabilizados para o desfecho 'fuga'
      const riskIds = ['mulher_preso', 'mulher_policial', 'mulher_agiota', 'vizinha_casada'];
      if (riskIds.includes(npcId) && !this.stats.riskConquered.includes(npcId)) {
        this.stats.riskConquered.push(npcId);
      }

      this.checkAchievements();
    },

    /**
     * Registra armadilha sofrida pelo jogador e avalia troféus
     */
    recordTrap() {
      this.stats.trapsFallen = (this.stats.trapsFallen || 0) + 1;
      this.checkAchievements();
    },

    /**
     * Registra especificamente conquista de NPC de alto risco
     * @param {string} npcId - Identificador do NPC de risco
     */
    recordRiskConquest(npcId) {
      if (!npcId) return;

      if (!this.stats.riskConquered.includes(npcId)) {
        this.stats.riskConquered.push(npcId);
      }
      this.stats.conquered[npcId] = (this.stats.conquered[npcId] || 0) + 1;
      this.checkAchievements();
    },

    /**
     * Atualiza ou incrementa pontos do jogador nas estatísticas
     * @param {number} points - Pontuação a somar
     */
    recordPoints(points) {
      if (typeof points === 'number') {
        this.stats.totalPoints = (this.stats.totalPoints || 0) + points;
      }
    },

    /**
     * Define a pontuação total do jogador diretamente
     * @param {number} points - Pontuação final
     */
    setPoints(points) {
      if (typeof points === 'number') {
        this.stats.totalPoints = points;
      }
    },

    /**
     * Verifica todas as condições de conquistas e dispara novos desbloqueios
     */
    checkAchievements() {
      for (let i = 0; i < ACHIEVEMENTS.length; i++) {
        const ach = ACHIEVEMENTS[i];

        // Ignora caso já tenha sido liberada nesta sessão
        if (this.unlockedThisGame.includes(ach.id)) {
          continue;
        }

        try {
          if (typeof ach.condition === 'function' && ach.condition(this.stats)) {
            // Desbloqueia na partida atual
            this.unlockedThisGame.push(ach.id);

            // Se for inédita em todo o histórico, salva no LocalStorage
            if (!this.allTimeUnlocked.includes(ach.id)) {
              this.allTimeUnlocked.push(ach.id);
              this.save();
            }

            // Dispara banner e áudio
            this.triggerAchievement(ach);
          }
        } catch (err) {
          console.error(`[Achievements] Erro ao validar condição da conquista "${ach.id}":`, err);
        }
      }
    },

    /**
     * Enfileira a conquista para exibição e aciona áudio
     * @param {Object} achievement - Objeto da conquista
     */
    triggerAchievement(achievement) {
      if (!achievement) return;

      // Adiciona à fila de exibição
      this.pendingPopups.push(achievement);

      // Caso não haja pop-up ativo no momento, inicia a exibição imediatamente
      if (!this.currentPopup) {
        this.showNextPopup();
      }
    },

    /**
     * Inicia a exibição do próximo pop-up da fila e reproduz seu áudio
     */
    showNextPopup() {
      if (this.pendingPopups.length === 0) {
        this.currentPopup = null;
        this.popupTimer = 0;
        return;
      }

      this.currentPopup = this.pendingPopups.shift();
      this.popupTimer = POPUP_TOTAL_TIME;

      // Reproduz o áudio correspondente via AudioManager no momento em que o pop-up entra na tela
      if (this.currentPopup && this.currentPopup.audio) {
        this.playAchievementAudio(this.currentPopup.audio);
      }
    },

    /**
     * Reproduz o arquivo sonoro da conquista
     * Prioriza window.AudioManager com fallbacks compatíveis
     * @param {string} audioFile - Nome do arquivo de áudio (ex: 'conquista_papa_anjo.mp3')
     */
    playAchievementAudio(audioFile) {
      if (!audioFile) return;

      try {
        if (window.AudioManager) {
          if (typeof window.AudioManager.play === 'function') {
            window.AudioManager.play(audioFile);
            return;
          }
          if (typeof window.AudioManager.playSound === 'function') {
            window.AudioManager.playSound(audioFile);
            return;
          }
          if (typeof window.AudioManager.playSfx === 'function') {
            window.AudioManager.playSfx(audioFile);
            return;
          }
          if (typeof window.AudioManager.playAchievement === 'function') {
            window.AudioManager.playAchievement(audioFile);
            return;
          }
        }

        // Fallback nativo usando HTML5 Audio caso AudioManager ainda não tenha sido carregado
        if (typeof Audio !== 'undefined') {
          const audioPath = audioFile.startsWith('assets/') || audioFile.startsWith('/')
            ? audioFile
            : 'assets/audio/' + audioFile;

          const sfx = new Audio(audioPath);
          sfx.volume = 0.9;
          const playPromise = sfx.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {
              // Silencia bloqueio de autoplay sem interação prévia
            });
          }
        }
      } catch (err) {
        console.warn('[Achievements] Falha ao tocar áudio:', audioFile, err);
      }
    },

    /**
     * Atualiza os timers da animação do pop-up
     * @param {number} dt - Tempo decorrido (em segundos ou milissegundos)
     */
    update(dt) {
      if (typeof dt !== 'number' || dt <= 0) return;

      // Normaliza dt: se for maior que 10, assume que foi passado em milissegundos (ex: 16.6ms)
      const dtSec = dt > 10 ? dt / 1000 : dt;

      // Se nenhum pop-up estiver ativo mas existirem itens na fila, inicia o próximo
      if (!this.currentPopup && this.pendingPopups.length > 0) {
        this.showNextPopup();
      }

      if (this.currentPopup) {
        this.popupTimer -= dtSec;

        if (this.popupTimer <= 0) {
          this.currentPopup = null;
          this.popupTimer = 0;

          // Se há mais itens na fila, ativa o próximo
          if (this.pendingPopups.length > 0) {
            this.showNextPopup();
          }
        }
      }
    },

    /**
     * Desenha o pop-up de troféu no topo central do Canvas
     * @param {CanvasRenderingContext2D} ctx - Contexto 2D do Canvas
     * @param {number} [canvasWidth] - Largura do Canvas
     */
    drawPopup(ctx, canvasWidth) {
      if (!this.currentPopup || !ctx) return;

      const effectiveWidth = canvasWidth || (ctx.canvas ? ctx.canvas.width : 800);
      const bannerWidth = Math.min(480, effectiveWidth - 30);
      const bannerHeight = 74;
      const x = (effectiveWidth - bannerWidth) / 2;

      // Cálculo da transição de animação
      const elapsed = POPUP_TOTAL_TIME - this.popupTimer;
      let slideProgress = 0;

      if (elapsed < POPUP_SLIDE_IN) {
        // Desliza para baixo com efeito elástico / cutout (ease-out overshoot)
        const t = Math.max(0, Math.min(1, elapsed / POPUP_SLIDE_IN));
        const c1 = 1.35;
        const c3 = c1 + 1;
        slideProgress = 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
      } else if (elapsed <= POPUP_SLIDE_IN + POPUP_VISIBLE) {
        // Fixado no topo visível por 3.5 segundos
        slideProgress = 1;
      } else {
        // Desliza subindo de volta (slide-out 0.3s)
        const t = Math.max(0, Math.min(1, (POPUP_TOTAL_TIME - elapsed) / POPUP_SLIDE_OUT));
        slideProgress = t * t;
      }

      const targetY = 18;
      const hiddenY = -bannerHeight - 25;
      const currentY = hiddenY + (targetY - hiddenY) * slideProgress;

      // Se estiver totalmente fora da tela acima, não renderiza
      if (currentY + bannerHeight <= 0) return;

      ctx.save();

      // Brilho pulsante dourado na borda
      const pulse = 0.55 + 0.45 * Math.sin(Date.now() / 150);
      ctx.shadowColor = `rgba(255, 215, 0, ${pulse.toFixed(2)})`;
      ctx.shadowBlur = 12 + 10 * pulse;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 3;

      // Gradiente dourado (#FFD700 a #FFA500)
      const goldGradient = ctx.createLinearGradient(x, currentY, x, currentY + bannerHeight);
      goldGradient.addColorStop(0, '#FFE866');
      goldGradient.addColorStop(0.2, '#FFD700');
      goldGradient.addColorStop(0.8, '#FFA500');
      goldGradient.addColorStop(1, '#D97700');

      // Desenha corpo do banner
      drawRoundedRect(ctx, x, currentY, bannerWidth, bannerHeight, 14);
      ctx.fillStyle = goldGradient;
      ctx.fill();

      // Borda preta estilo desenho recortado de South Park
      ctx.strokeStyle = '#111111';
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // Reseta sombra para renderizar elementos internos com nitidez
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      // Linha de reflexo / contorno interno brilhante
      drawRoundedRect(ctx, x + 3, currentY + 3, bannerWidth - 6, bannerHeight - 6, 11);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Área circular do ícone à esquerda
      const iconRadius = 24;
      const iconCenterX = x + 16 + iconRadius;
      const iconCenterY = currentY + bannerHeight / 2;

      // Círculo escuro de destaque para o emoji
      ctx.beginPath();
      ctx.arc(iconCenterX, iconCenterY, iconRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#261600';
      ctx.fill();
      ctx.strokeStyle = '#FFE066';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Ícone (emoji)
      ctx.font = '28px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(this.currentPopup.icon || '🏆', iconCenterX, iconCenterY + 1);

      // Textos no lado direito
      const textStartX = iconCenterX + iconRadius + 14;
      const textMaxWidth = bannerWidth - (textStartX - x) - 16;

      // Mini-faixa superior: "★ CONQUISTA DESBLOQUEADA! ★"
      ctx.font = '900 10px "Impact", "Arial Black", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillStyle = '#4A2800';
      ctx.fillText('★ CONQUISTA DESBLOQUEADA! ★', textStartX, currentY + 11, textMaxWidth);

      // Nome da conquista: Negrito, branco com contorno preto grosso
      ctx.font = '900 17px "Impact", "Arial Black", sans-serif';
      ctx.textBaseline = 'middle';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3.5;
      ctx.strokeText(this.currentPopup.name, textStartX, currentY + 33, textMaxWidth);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(this.currentPopup.name, textStartX, currentY + 33, textMaxWidth);

      // Descrição: menor, amarela com contorno sutil para legibilidade no dourado
      ctx.font = 'bold 12px "Segoe UI", Arial, sans-serif';
      ctx.textBaseline = 'bottom';
      ctx.strokeStyle = 'rgba(30, 15, 0, 0.9)';
      ctx.lineWidth = 2.5;
      ctx.strokeText(this.currentPopup.description, textStartX, currentY + bannerHeight - 10, textMaxWidth);
      ctx.fillStyle = '#FFF8D0';
      ctx.fillText(this.currentPopup.description, textStartX, currentY + bannerHeight - 10, textMaxWidth);

      ctx.restore();
    },

    /**
     * Determina o tipo de final da partida com base nas estatísticas
     * @param {number} [finalScore] - Pontuação final opcional
     * @returns {'fuga'|'bom'|'zoado'} Tipo do desfecho
     */
    getEndingType(finalScore) {
      if (typeof finalScore === 'number') {
        this.stats.totalPoints = finalScore;
      }

      const riskList = ['mulher_preso', 'mulher_policial', 'mulher_agiota', 'vizinha_casada'];

      // Filtra e conta NPCs de risco únicos conquistados
      const riskCount = (this.stats.riskConquered || []).filter(
        (id, index, self) => riskList.includes(id) && self.indexOf(id) === index
      ).length;

      // Final 'fuga': conquistou 2 ou mais das mulheres perigosas
      if (riskCount >= 2) {
        return 'fuga';
      }

      // Final 'bom': 4000+ pontos e menos de 3 armadilhas
      if ((this.stats.totalPoints || 0) >= 4000 && (this.stats.trapsFallen || 0) < 3) {
        return 'bom';
      }

      // Final 'zoado': pontuação baixa ou muitas armadilhas
      return 'zoado';
    },

    /**
     * Retorna a mensagem de compartilhamento para WhatsApp
     * @param {number} [finalScore] - Pontuação final
     * @param {string} [endingType] - Tipo de final ('fuga', 'bom', 'zoado')
     * @returns {string} Texto pronto para compartilhamento
     */
    getShareText(finalScore, endingType) {
      const score = typeof finalScore === 'number' ? finalScore : this.stats.totalPoints || 0;
      const ending = endingType || this.getEndingType(score);

      const endingNames = {
        fuga: 'Deu Ruim! Fuga Desesperada 🏃‍♂️💨',
        bom: 'O Rei da Lábia! 😎👑',
        zoado: 'Pagou Mico! 🤡🤦‍♂️'
      };
      const endingName = endingNames[ending] || ending;

      // Utiliza conquistas desbloqueadas nesta partida ou todas acumuladas
      const trophiesToDisplay =
        this.unlockedThisGame.length > 0 ? this.unlockedThisGame : this.allTimeUnlocked;

      let trophyListStr = 'Nenhum ainda 😢';
      if (trophiesToDisplay.length > 0) {
        trophyListStr = trophiesToDisplay
          .map((id) => {
            const ach = ACHIEVEMENTS.find((a) => a.id === id);
            return ach ? `${ach.icon} ${ach.name}` : id;
          })
          .join(', ');
      }

      return (
        `🎮 Joguei Vicente: O Rei da Lábia!\n` +
        `🏆 Pontuação: ${score} pts\n` +
        `🎬 Final: ${endingName}\n` +
        `🏅 Troféus: ${trophyListStr}\n` +
        `👉 Jogue também: https://renatamanhanini.github.io/vicente-rei-da-labia/`
      );
    },

    /**
     * Salva a lista de conquistas allTimeUnlocked no LocalStorage
     */
    save() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.allTimeUnlocked));
      } catch (err) {
        console.error('[Achievements] Erro ao salvar conquistas no LocalStorage:', err);
      }
    },

    /**
     * Carrega a lista de conquistas allTimeUnlocked do LocalStorage
     */
    load() {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            this.allTimeUnlocked = parsed;
          }
        }
      } catch (err) {
        console.error('[Achievements] Erro ao carregar conquistas do LocalStorage:', err);
        this.allTimeUnlocked = [];
      }
    }
  };

  // Exportação global
  window.Achievements = Achievements;
})();
