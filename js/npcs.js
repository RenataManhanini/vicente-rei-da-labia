/**
 * Vicente: O Rei da Lábia - npcs.js
 * Definições visuais e mecânicas dos 30 NPCs em estilo South Park (recorte de papel 2D).
 */

(function () {
  'use strict';

  // Helper de desenho South Park
  function drawRoundedRect(ctx, x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawSouthParkEyes(ctx, x, y, eyeR, pupilR, shocked) {
    ctx.save();
    // Olhos brancos ovais juntos
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.8;

    // Olho esquerdo
    ctx.beginPath();
    ctx.ellipse(x - eyeR * 0.9, y, eyeR * 0.9, eyeR * 1.1, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Olho direito
    ctx.beginPath();
    ctx.ellipse(x + eyeR * 0.9, y, eyeR * 0.9, eyeR * 1.1, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Pupilas
    ctx.fillStyle = '#000000';
    const pupilY = shocked ? y : y + 1;
    ctx.beginPath();
    ctx.arc(x - eyeR * 0.7, pupilY, pupilR, 0, Math.PI * 2);
    ctx.arc(x + eyeR * 0.7, pupilY, pupilR, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawLabel(ctx, text, x, y, color) {
    ctx.save();
    ctx.font = 'bold 10px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    const padding = 3;
    const textWidth = ctx.measureText(text).width;
    
    // Tarja de fundo
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(x - textWidth / 2 - padding, y - 14, textWidth + padding * 2, 14);
    ctx.strokeStyle = color || '#FFD700';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - textWidth / 2 - padding, y - 14, textWidth + padding * 2, 14);

    // Texto
    ctx.fillStyle = color || '#FFFFFF';
    ctx.fillText(text, x, y - 3);
    ctx.restore();
  }

  // Lista dos 30 NPCs
  const NPCS = [
    // =========================================================================
    // NÍVEL 1 (100 a 300 pts)
    // =========================================================================
    {
      id: 'novinha_tiktok',
      name: 'Novinha do TikTok',
      points: 100,
      level: 1,
      speed: 1.1,
      width: 36,
      height: 68,
      requiredHits: 1,
      spawnWeight: 10,
      preferredCantadas: [1, 2, 3],
      draw(ctx, x, y, w, h, facing, animFrame) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(facing, 1);
        const bob = Math.sin(animFrame * Math.PI) * 2;

        // Pernas (shorts jeans e pernas finas)
        ctx.fillStyle = '#4a75a0';
        ctx.fillRect(-10, h - 22, 20, 10);
        ctx.fillStyle = '#ffdfc4';
        ctx.fillRect(-8, h - 12, 6, 12);
        ctx.fillRect(2, h - 12, 6, 12);

        // Tronco (Top rosa cropped)
        ctx.fillStyle = '#ff4081';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        drawRoundedRect(ctx, -12, h - 42 + bob, 24, 20, 4);
        ctx.fill();
        ctx.stroke();

        // Celular na mão fazendo selfie
        ctx.fillStyle = '#222222';
        ctx.fillRect(10, h - 36 + bob, 8, 14);
        ctx.fillStyle = '#64b5f6';
        ctx.fillRect(11, h - 35 + bob, 6, 12);

        // Cabeça
        ctx.fillStyle = '#ffdfc4';
        ctx.beginPath();
        ctx.arc(0, h - 52 + bob, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Cabelo comprido castanho
        ctx.fillStyle = '#4e342e';
        ctx.beginPath();
        ctx.arc(0, h - 56 + bob, 16, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(-16, h - 56 + bob, 8, 24);
        ctx.fillRect(8, h - 56 + bob, 8, 24);

        // Rosto
        drawSouthParkEyes(ctx, 2, h - 52 + bob, 4.5, 1.8, false);
        ctx.restore();
        drawLabel(ctx, 'Novinha TikTok', x, y + 10, '#ff80ab');
      }
    },
    {
      id: 'universitaria_federal',
      name: 'Universitária de Federal',
      points: 150,
      level: 1,
      speed: 1.0,
      width: 36,
      height: 70,
      requiredHits: 1,
      spawnWeight: 9,
      preferredCantadas: [4, 5],
      draw(ctx, x, y, w, h, facing, animFrame) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(facing, 1);
        const bob = Math.sin(animFrame * Math.PI) * 2;

        // Mochila atrás
        ctx.fillStyle = '#c2185b';
        ctx.fillRect(-18, h - 44 + bob, 8, 22);

        // Calça jeans
        ctx.fillStyle = '#37474f';
        ctx.fillRect(-9, h - 22, 7, 22);
        ctx.fillRect(2, h - 22, 7, 22);

        // Casaco / moletom azul
        ctx.fillStyle = '#1e88e5';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        drawRoundedRect(ctx, -12, h - 44 + bob, 24, 22, 4);
        ctx.fill();
        ctx.stroke();

        // Livro no braço
        ctx.fillStyle = '#fbc02d';
        ctx.fillRect(6, h - 34 + bob, 10, 12);

        // Cabeça
        ctx.fillStyle = '#ffd6ba';
        ctx.beginPath();
        ctx.arc(0, h - 54 + bob, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Cabelo preto
        ctx.fillStyle = '#212121';
        ctx.beginPath();
        ctx.arc(0, h - 57 + bob, 16, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(-15, h - 56 + bob, 6, 20);

        // Óculos de armação grossa
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(-8, h - 58 + bob, 7, 7);
        ctx.strokeRect(1, h - 58 + bob, 7, 7);
        drawSouthParkEyes(ctx, 0, h - 54 + bob, 4, 1.6, false);
        ctx.restore();
        drawLabel(ctx, 'Universitária', x, y + 10, '#90caf9');
      }
    },
    {
      id: 'blogueira_fitness',
      name: 'Blogueira Fitness',
      points: 200,
      level: 1,
      speed: 1.25,
      width: 36,
      height: 72,
      requiredHits: 1,
      spawnWeight: 8,
      preferredCantadas: [6, 7],
      draw(ctx, x, y, w, h, facing, animFrame) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(facing, 1);
        const bob = Math.sin(animFrame * Math.PI) * 3;

        // Legging verde neon
        ctx.fillStyle = '#76ff03';
        ctx.fillRect(-9, h - 26, 7, 26);
        ctx.fillRect(2, h - 26, 7, 26);
        // Tênis branco
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-10, h - 5, 8, 5);
        ctx.fillRect(2, h - 5, 8, 5);

        // Top preto
        ctx.fillStyle = '#212121';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        drawRoundedRect(ctx, -11, h - 48 + bob, 22, 22, 3);
        ctx.fill();
        ctx.stroke();

        // Garrafinha de água rosa
        ctx.fillStyle = '#ff4081';
        ctx.fillRect(9, h - 38 + bob, 5, 12);

        // Cabeça
        ctx.fillStyle = '#ffcca5';
        ctx.beginPath();
        ctx.arc(0, h - 57 + bob, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Rabo de cavalo loiro
        ctx.fillStyle = '#ffd54f';
        ctx.beginPath();
        ctx.arc(0, h - 60 + bob, 16, Math.PI, Math.PI * 2);
        ctx.fill();
        // Rabo balançando
        ctx.fillRect(-22, h - 66 + bob, 10, 14);

        // Fone bluetooth nos ouvidos
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-16, h - 58 + bob, 3, 6);

        drawSouthParkEyes(ctx, 2, h - 57 + bob, 4.5, 1.8, false);
        ctx.restore();
        drawLabel(ctx, 'Fitness', x, y + 10, '#76ff03');
      }
    },
    {
      id: 'turista_perdida',
      name: 'Turista Perdida',
      points: 150,
      level: 1,
      speed: 0.9,
      width: 38,
      height: 70,
      requiredHits: 1,
      spawnWeight: 8,
      preferredCantadas: [1, 8],
      draw(ctx, x, y, w, h, facing, animFrame) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(facing, 1);
        const bob = Math.sin(animFrame * Math.PI) * 2;

        // Bermuda caqui
        ctx.fillStyle = '#d7ccc8';
        ctx.fillRect(-10, h - 22, 20, 10);
        ctx.fillStyle = '#ffcca5';
        ctx.fillRect(-8, h - 12, 6, 12);
        ctx.fillRect(2, h - 12, 6, 12);

        // Camisa florida amarela
        ctx.fillStyle = '#ffee58';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        drawRoundedRect(ctx, -13, h - 44 + bob, 26, 22, 4);
        ctx.fill();
        ctx.stroke();

        // Mapa aberto
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#e65100';
        ctx.strokeRect(6, h - 36 + bob, 14, 10);
        ctx.fillRect(6, h - 36 + bob, 14, 10);

        // Cabeça
        ctx.fillStyle = '#ffcca5';
        ctx.beginPath();
        ctx.arc(0, h - 54 + bob, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Chapéu de palha grande
        ctx.fillStyle = '#d7ccc8';
        ctx.beginPath();
        ctx.ellipse(0, h - 63 + bob, 24, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Câmera pendurada no pescoço
        ctx.fillStyle = '#37474f';
        ctx.fillRect(-4, h - 40 + bob, 8, 6);

        drawSouthParkEyes(ctx, 2, h - 54 + bob, 4, 1.6, false);
        ctx.restore();
        drawLabel(ctx, 'Turista Perdida', x, y + 10, '#ffee58');
      }
    },
    {
      id: 'atendente_telemarketing',
      name: 'Atendente de Telemarketing',
      points: 200,
      level: 1,
      speed: 1.0,
      width: 36,
      height: 70,
      requiredHits: 1,
      spawnWeight: 8,
      preferredCantadas: [9, 10],
      draw(ctx, x, y, w, h, facing, animFrame) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(facing, 1);
        const bob = Math.sin(animFrame * Math.PI) * 2;

        // Calça social preta
        ctx.fillStyle = '#212121';
        ctx.fillRect(-9, h - 24, 7, 24);
        ctx.fillRect(2, h - 24, 7, 24);

        // Camisa branca social com crachá
        ctx.fillStyle = '#eceff1';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        drawRoundedRect(ctx, -12, h - 46 + bob, 24, 22, 3);
        ctx.fill();
        ctx.stroke();
        // Crachá azul
        ctx.fillStyle = '#0288d1';
        ctx.fillRect(-8, h - 36 + bob, 5, 8);

        // Cabeça
        ctx.fillStyle = '#ffe0b2';
        ctx.beginPath();
        ctx.arc(0, h - 56 + bob, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Cabelo preso coque
        ctx.fillStyle = '#5d4037';
        ctx.beginPath();
        ctx.arc(0, h - 59 + bob, 15, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.arc(-8, h - 68 + bob, 6, 0, Math.PI * 2);
        ctx.fill();

        // Headset com microfone
        ctx.strokeStyle = '#263238';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, h - 57 + bob, 16, Math.PI * 1.1, Math.PI * 1.9);
        ctx.stroke();
        // Fone na orelha e haste pro microfone
        ctx.fillStyle = '#263238';
        ctx.fillRect(-17, h - 58 + bob, 4, 7);
        ctx.beginPath();
        ctx.moveTo(-15, h - 54 + bob);
        ctx.lineTo(-4, h - 50 + bob);
        ctx.stroke();

        drawSouthParkEyes(ctx, 1, h - 56 + bob, 4, 1.6, false);
        ctx.restore();
        drawLabel(ctx, 'Telemarketing', x, y + 10, '#b0bec5');
      }
    },
    {
      id: 'patricinha_shopping',
      name: 'Patricinha do Shopping',
      points: 250,
      level: 1,
      speed: 1.05,
      width: 38,
      height: 72,
      requiredHits: 1,
      spawnWeight: 7,
      preferredCantadas: [1, 11],
      draw(ctx, x, y, w, h, facing, animFrame) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(facing, 1);
        const bob = Math.sin(animFrame * Math.PI) * 2;

        // Botas salto alto
        ctx.fillStyle = '#d81b60';
        ctx.fillRect(-8, h - 20, 6, 20);
        ctx.fillRect(2, h - 20, 6, 20);

        // Vestido rosa brilhante
        ctx.fillStyle = '#f06292';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        drawRoundedRect(ctx, -13, h - 48 + bob, 26, 28, 5);
        ctx.fill();
        ctx.stroke();

        // Sacolas de compras
        ctx.fillStyle = '#ffeb3b';
        ctx.fillRect(12, h - 32 + bob, 10, 16);
        ctx.fillStyle = '#ab47bc';
        ctx.fillRect(14, h - 28 + bob, 10, 14);

        // Cabeça
        ctx.fillStyle = '#ffcca5';
        ctx.beginPath();
        ctx.arc(0, h - 58 + bob, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Cabelo loiro volumoso
        ctx.fillStyle = '#ffee58';
        ctx.beginPath();
        ctx.arc(0, h - 61 + bob, 18, Math.PI * 0.9, Math.PI * 2.1);
        ctx.fill();
        ctx.fillRect(-17, h - 60 + bob, 8, 25);
        ctx.fillRect(9, h - 60 + bob, 8, 25);

        // Óculos escuros grandes redondos
        ctx.fillStyle = '#212121';
        ctx.beginPath();
        ctx.arc(-5, h - 58 + bob, 6, 0, Math.PI * 2);
        ctx.arc(5, h - 58 + bob, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.restore();
        drawLabel(ctx, 'Patricinha', x, y + 10, '#f48fb1');
      }
    },
    {
      id: 'gotica_suave',
      name: 'Gótica Suave',
      points: 200,
      level: 1,
      speed: 0.95,
      width: 36,
      height: 70,
      requiredHits: 1,
      spawnWeight: 8,
      preferredCantadas: [11, 12, 13],
      draw(ctx, x, y, w, h, facing, animFrame) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(facing, 1);
        const bob = Math.sin(animFrame * Math.PI) * 2;

        // Meia arrastão preta e coturno
        ctx.fillStyle = '#111111';
        ctx.fillRect(-9, h - 22, 7, 22);
        ctx.fillRect(2, h - 22, 7, 22);

        // Vestido preto rodado
        ctx.fillStyle = '#212121';
        ctx.strokeStyle = '#7b1fa2';
        ctx.lineWidth = 2;
        drawRoundedRect(ctx, -13, h - 46 + bob, 26, 24, 4);
        ctx.fill();
        ctx.stroke();

        // Gargantilha choker com cruz
        ctx.fillStyle = '#7b1fa2';
        ctx.fillRect(-6, h - 47 + bob, 12, 3);

        // Cabeça bem pálida
        ctx.fillStyle = '#f5f5f5';
        ctx.beginPath();
        ctx.arc(0, h - 56 + bob, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Cabelo preto com mechas roxas
        ctx.fillStyle = '#111111';
        ctx.beginPath();
        ctx.arc(0, h - 59 + bob, 16, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(-15, h - 58 + bob, 6, 26);
        ctx.fillStyle = '#ba68c8';
        ctx.fillRect(9, h - 58 + bob, 6, 26);

        // Maquiagem escura nos olhos e batom roxo
        ctx.fillStyle = '#4a148c';
        ctx.fillRect(-3, h - 49 + bob, 6, 2);
        drawSouthParkEyes(ctx, 1, h - 56 + bob, 4.2, 1.8, false);

        ctx.restore();
        drawLabel(ctx, 'Gótica Suave', x, y + 10, '#ce93d8');
      }
    },
    {
      id: 'cosplayer',
      name: 'Cosplayer',
      points: 300,
      level: 1,
      speed: 1.1,
      width: 36,
      height: 72,
      requiredHits: 1,
      spawnWeight: 7,
      preferredCantadas: [1, 3],
      draw(ctx, x, y, w, h, facing, animFrame) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(facing, 1);
        const bob = Math.sin(animFrame * Math.PI) * 2;

        // Saia colegial azul e meias 5/8
        ctx.fillStyle = '#1565c0';
        ctx.fillRect(-12, h - 24, 24, 10);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-8, h - 14, 6, 14);
        ctx.fillRect(2, h - 14, 6, 14);

        // Blusa anime com lacinho vermelho
        ctx.fillStyle = '#e3f2fd';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        drawRoundedRect(ctx, -12, h - 46 + bob, 24, 22, 4);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#d32f2f';
        ctx.fillRect(-4, h - 44 + bob, 8, 6);

        // Rabinho de raposa atrás
        ctx.fillStyle = '#ff9800';
        ctx.beginPath();
        ctx.ellipse(-18, h - 28 + bob, 8, 14, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();

        // Cabeça
        ctx.fillStyle = '#ffcca5';
        ctx.beginPath();
        ctx.arc(0, h - 56 + bob, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Cabelo azul turquesa brilhante
        ctx.fillStyle = '#00bcd4';
        ctx.beginPath();
        ctx.arc(0, h - 59 + bob, 17, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(-17, h - 58 + bob, 6, 26);
        ctx.fillRect(11, h - 58 + bob, 6, 26);

        // Orelhas de gato rosa
        ctx.fillStyle = '#ff4081';
        ctx.beginPath();
        ctx.moveTo(-14, h - 68 + bob);
        ctx.lineTo(-6, h - 77 + bob);
        ctx.lineTo(-2, h - 68 + bob);
        ctx.fill();
        ctx.moveTo(2, h - 68 + bob);
        ctx.lineTo(6, h - 77 + bob);
        ctx.lineTo(14, h - 68 + bob);
        ctx.fill();

        drawSouthParkEyes(ctx, 2, h - 56 + bob, 4.5, 1.8, false);
        ctx.restore();
        drawLabel(ctx, 'Cosplayer', x, y + 10, '#00e5ff');
      }
    },

    // =========================================================================
    // NÍVEL 2 (400 a 700 pts)
    // =========================================================================
    {
      id: 'gordinha_empoderada',
      name: 'Gordinha Empoderada',
      points: 500,
      level: 2,
      speed: 0.95,
      width: 52,
      height: 72,
      requiredHits: 2, // Exige 2 cantadas!
      spawnWeight: 7,
      preferredCantadas: [14, 15, 16],
      draw(ctx, x, y, w, h, facing, animFrame, revealed, hits) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(facing, 1);
        const bob = Math.sin(animFrame * Math.PI) * 2;

        // Pernas mais grossas
        ctx.fillStyle = '#d81b60';
        ctx.fillRect(-14, h - 20, 12, 20);
        ctx.fillRect(2, h - 20, 12, 20);

        // Corpo bem largo e arredondado (estilo South Park)
        ctx.fillStyle = '#e91e63';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(0, h - 38 + bob, 24, 22, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Cabeça redonda
        ctx.fillStyle = '#ffcca5';
        ctx.beginPath();
        ctx.arc(0, h - 58 + bob, 17, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Cabelo cacheado volumoso
        ctx.fillStyle = '#3e2723';
        for (let a = 0; a < Math.PI * 2; a += 0.8) {
          ctx.beginPath();
          ctx.arc(Math.cos(a) * 19, h - 60 + bob + Math.sin(a) * 14, 8, 0, Math.PI * 2);
          ctx.fill();
        }

        // Brincos de argola dourada
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(-16, h - 56 + bob, 4, 0, Math.PI * 2);
        ctx.stroke();

        drawSouthParkEyes(ctx, 2, h - 58 + bob, 4.5, 1.8, false);

        // Sorriso confiante
        ctx.strokeStyle = '#d81b60';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(2, h - 53 + bob, 5, 0.2, Math.PI - 0.2);
        ctx.stroke();

        ctx.restore();
        const labelText = (hits && hits >= 1) ? 'Empoderada (1/2)' : 'Empoderada (2x)';
        drawLabel(ctx, labelText, x, y + 10, '#ff4081');
      }
    },
    {
      id: 'cadeirante_veloz',
      name: 'Cadeirante Veloz',
      points: 400,
      level: 2,
      speed: 1.5, // Anda rápido
      width: 44,
      height: 64,
      requiredHits: 1,
      spawnWeight: 6,
      preferredCantadas: [1, 2],
      draw(ctx, x, y, w, h, facing, animFrame) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(facing, 1);

        // Roda grande da cadeira girando
        const wheelAngle = animFrame * Math.PI;
        ctx.strokeStyle = '#37474f';
        ctx.lineWidth = 4;
        ctx.fillStyle = 'rgba(200, 200, 200, 0.4)';
        ctx.beginPath();
        ctx.arc(-4, h - 18, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Raios da roda
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-4 + Math.cos(wheelAngle) * 16, h - 18 + Math.sin(wheelAngle) * 16);
        ctx.lineTo(-4 - Math.cos(wheelAngle) * 16, h - 18 - Math.sin(wheelAngle) * 16);
        ctx.moveTo(-4 + Math.cos(wheelAngle + Math.PI / 2) * 16, h - 18 + Math.sin(wheelAngle + Math.PI / 2) * 16);
        ctx.lineTo(-4 - Math.cos(wheelAngle + Math.PI / 2) * 16, h - 18 - Math.sin(wheelAngle + Math.PI / 2) * 16);
        ctx.stroke();

        // Estrutura da cadeira (azul metálico)
        ctx.strokeStyle = '#0288d1';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-14, h - 35);
        ctx.lineTo(-4, h - 18);
        ctx.lineTo(10, h - 18);
        ctx.stroke();

        // Corpo sentado
        ctx.fillStyle = '#ab47bc';
        drawRoundedRect(ctx, -8, h - 42, 18, 20, 4);
        ctx.fill();

        // Cabeça
        ctx.fillStyle = '#ffcca5';
        ctx.beginPath();
        ctx.arc(0, h - 52, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Cabelo castanho preso com laço
        ctx.fillStyle = '#5d4037';
        ctx.beginPath();
        ctx.arc(0, h - 55, 15, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffeb3b';
        ctx.fillRect(-4, h - 65, 8, 6);

        drawSouthParkEyes(ctx, 3, h - 52, 4, 1.8, false);
        ctx.restore();
        drawLabel(ctx, 'Cadeirante ⚡', x, y + 10, '#29b6f6');
      }
    },
    {
      id: 'alta_195',
      name: 'Alta de 1,95m',
      points: 400,
      level: 2,
      speed: 1.0,
      width: 38,
      height: 94, // Bem alta!
      requiredHits: 1,
      spawnWeight: 6,
      preferredCantadas: [6, 17],
      draw(ctx, x, y, w, h, facing, animFrame) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(facing, 1);
        const bob = Math.sin(animFrame * Math.PI) * 2;

        // Pernas muito longas
        ctx.fillStyle = '#303f9f';
        ctx.fillRect(-10, h - 44, 8, 44);
        ctx.fillRect(2, h - 44, 8, 44);

        // Tronco comprido amarelo
        ctx.fillStyle = '#fbc02d';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        drawRoundedRect(ctx, -12, h - 70 + bob, 24, 26, 4);
        ctx.fill();
        ctx.stroke();

        // Cabeça lá no alto
        ctx.fillStyle = '#ffcca5';
        ctx.beginPath();
        ctx.arc(0, h - 80 + bob, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Cabelo curto elegante
        ctx.fillStyle = '#212121';
        ctx.beginPath();
        ctx.arc(0, h - 83 + bob, 15, Math.PI, Math.PI * 2);
        ctx.fill();

        drawSouthParkEyes(ctx, 2, h - 80 + bob, 4, 1.7, false);
        ctx.restore();
        drawLabel(ctx, 'Alta 1,95m 🦒', x, y + 10, '#fbc02d');
      }
    },
    {
      id: 'baixinha_brava',
      name: 'Baixinha Brava',
      points: 500,
      level: 2,
      speed: 1.15,
      width: 34,
      height: 48, // Baixinha!
      requiredHits: 1,
      spawnWeight: 6,
      preferredCantadas: [18, 19],
      draw(ctx, x, y, w, h, facing, animFrame) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(facing, 1);
        const bob = Math.sin(animFrame * Math.PI) * 3;

        // Perninhas curtas
        ctx.fillStyle = '#b71c1c';
        ctx.fillRect(-8, h - 14, 6, 14);
        ctx.fillRect(2, h - 14, 6, 14);

        // Camisa vermelha de brava
        ctx.fillStyle = '#d32f2f';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        drawRoundedRect(ctx, -11, h - 30 + bob, 22, 16, 3);
        ctx.fill();
        ctx.stroke();

        // Punhos fechados levantados
        ctx.fillStyle = '#ffcca5';
        ctx.beginPath();
        ctx.arc(10, h - 28 + bob, 4, 0, Math.PI * 2);
        ctx.arc(-10, h - 28 + bob, 4, 0, Math.PI * 2);
        ctx.fill();

        // Cabeça proporcionalmente grande
        ctx.beginPath();
        ctx.arc(0, h - 38 + bob, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Cabelo vermelho / ruivo espetado
        ctx.fillStyle = '#d84315';
        ctx.beginPath();
        ctx.arc(0, h - 42 + bob, 15, Math.PI, Math.PI * 2);
        ctx.fill();

        // Sobrancelhas bravas em V
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-6, h - 42 + bob);
        ctx.lineTo(-2, h - 39 + bob);
        ctx.moveTo(6, h - 42 + bob);
        ctx.lineTo(2, h - 39 + bob);
        ctx.stroke();

        drawSouthParkEyes(ctx, 0, h - 37 + bob, 3.5, 1.5, true);
        ctx.restore();
        drawLabel(ctx, 'Baixinha Brava 💢', x, y + 10, '#ff5252');
      }
    },
    {
      id: 'mae_1_filho',
      name: 'Mãe Solteira de 1 Filho',
      points: 400,
      level: 2,
      speed: 0.95,
      width: 44,
      height: 70,
      children: 1,
      spawnWeight: 6,
      preferredCantadas: [20],
      draw(ctx, x, y, w, h, facing, animFrame) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(facing, 1);
        const bob = Math.sin(animFrame * Math.PI) * 2;

        // Mãe
        ctx.fillStyle = '#5c6bc0';
        ctx.fillRect(-8, h - 22, 6, 22);
        ctx.fillRect(2, h - 22, 6, 22);
        ctx.fillStyle = '#26a69a';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        drawRoundedRect(ctx, -12, h - 44 + bob, 24, 22, 4);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#ffcca5';
        ctx.beginPath();
        ctx.arc(0, h - 54 + bob, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#4e342e';
        ctx.beginPath();
        ctx.arc(0, h - 57 + bob, 15, Math.PI, Math.PI * 2);
        ctx.fill();
        drawSouthParkEyes(ctx, 2, h - 54 + bob, 4, 1.6, false);

        // 1 mini-filho seguindo logo atrás
        const kidX = -22;
        const kidBob = Math.sin((animFrame + 0.5) * Math.PI) * 2;
        ctx.fillStyle = '#f44336';
        ctx.fillRect(kidX - 5, h - 16 + kidBob, 10, 10);
        ctx.fillStyle = '#ffcca5';
        ctx.beginPath();
        ctx.arc(kidX, h - 22 + kidBob, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#212121';
        ctx.beginPath();
        ctx.arc(kidX, h - 24 + kidBob, 8, Math.PI, Math.PI * 2);
        ctx.fill();
        drawSouthParkEyes(ctx, kidX, h - 22 + kidBob, 2.5, 1, false);

        ctx.restore();
        drawLabel(ctx, 'Mãe + 1 Filho', x, y + 10, '#80cbc4');
      }
    },
    {
      id: 'tia_do_zap',
      name: 'Tia do Zap',
      points: 450,
      level: 2,
      speed: 1.0,
      width: 40,
      height: 68,
      specialEffect: 'speedBoost', // Dá bônus de velocidade
      spawnWeight: 6,
      preferredCantadas: [5, 6],
      draw(ctx, x, y, w, h, facing, animFrame) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(facing, 1);
        const bob = Math.sin(animFrame * Math.PI) * 2;

        // Vestido florido verde e amarelo
        ctx.fillStyle = '#43a047';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        drawRoundedRect(ctx, -13, h - 44 + bob, 26, 32, 5);
        ctx.fill();
        ctx.stroke();
        // Flores no vestido
        ctx.fillStyle = '#ffeb3b';
        ctx.beginPath();
        ctx.arc(-5, h - 32 + bob, 3, 0, Math.PI * 2);
        ctx.arc(6, h - 24 + bob, 3, 0, Math.PI * 2);
        ctx.fill();

        // Segurando celular verde do WhatsApp
        ctx.fillStyle = '#25d366';
        ctx.fillRect(10, h - 34 + bob, 8, 12);

        // Cabeça
        ctx.fillStyle = '#ffcca5';
        ctx.beginPath();
        ctx.arc(0, h - 53 + bob, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Cabelo castanho permanente com bobs
        ctx.fillStyle = '#6d4c41';
        ctx.beginPath();
        ctx.arc(0, h - 56 + bob, 17, Math.PI * 0.9, Math.PI * 2.1);
        ctx.fill();
        // Bobs coloridos no cabelo
        ctx.fillStyle = '#e91e63';
        ctx.fillRect(-10, h - 68 + bob, 5, 4);
        ctx.fillStyle = '#00bcd4';
        ctx.fillRect(4, h - 68 + bob, 5, 4);

        // Óculos na ponta do nariz
        ctx.strokeStyle = '#d32f2f';
        ctx.lineWidth = 1.8;
        ctx.strokeRect(-6, h - 53 + bob, 5, 4);
        ctx.strokeRect(1, h - 53 + bob, 5, 4);

        drawSouthParkEyes(ctx, 1, h - 54 + bob, 4, 1.6, false);
        ctx.restore();
        drawLabel(ctx, 'Tia do Zap 📲', x, y + 10, '#69f0ae');
      }
    },
    {
      id: 'vovozinha',
      name: 'Vovózinha da Praça',
      points: 700,
      level: 2,
      speed: 0.7,
      width: 36,
      height: 64,
      spawnWeight: 5,
      preferredCantadas: [5, 6, 7],
      draw(ctx, x, y, w, h, facing, animFrame) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(facing, 1);
        const bob = Math.sin(animFrame * Math.PI) * 1.5;

        // Saia longa cinza
        ctx.fillStyle = '#9e9e9e';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        drawRoundedRect(ctx, -12, h - 40 + bob, 24, 30, 4);
        ctx.fill();
        ctx.stroke();

        // Casaquinho de tricô lilás
        ctx.fillStyle = '#ce93d8';
        drawRoundedRect(ctx, -11, h - 44 + bob, 22, 14, 3);
        ctx.fill();

        // Bengala na mão
        ctx.strokeStyle = '#8d6e63';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(12, h - 30 + bob);
        ctx.lineTo(12, h - 4);
        ctx.arc(10, h - 32 + bob, 3, 0, Math.PI, true);
        ctx.stroke();

        // Cabeça enrugada
        ctx.fillStyle = '#ffcca5';
        ctx.beginPath();
        ctx.arc(0, h - 52 + bob, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Cabelo branco com coque atrás
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#bdbdbd';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, h - 55 + bob, 15, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(-10, h - 60 + bob, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Óculos redondos de vovó
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(-5, h - 52 + bob, 4.5, 0, Math.PI * 2);
        ctx.arc(4, h - 52 + bob, 4.5, 0, Math.PI * 2);
        ctx.stroke();

        drawSouthParkEyes(ctx, 0, h - 52 + bob, 3.5, 1.5, false);
        ctx.restore();
        drawLabel(ctx, 'Vovózinha 👵 (700)', x, y + 10, '#e1bee7');
      }
    },
    {
      id: 'feia_arrumada',
      name: 'Feia Arrumada',
      points: 600,
      level: 2,
      speed: 1.0,
      width: 38,
      height: 70,
      spawnWeight: 5,
      preferredCantadas: [8, 9, 10],
      draw(ctx, x, y, w, h, facing, animFrame) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(facing, 1);
        const bob = Math.sin(animFrame * Math.PI) * 2;

        // Vestido dourado chiquérrimo
        ctx.fillStyle = '#ffd54f';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        drawRoundedRect(ctx, -12, h - 46 + bob, 24, 30, 4);
        ctx.fill();
        ctx.stroke();

        // Colar de brilhantes
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, h - 44 + bob, 6, 0, Math.PI);
        ctx.stroke();

        // Cabeça
        ctx.fillStyle = '#ffcca5';
        ctx.beginPath();
        ctx.arc(0, h - 56 + bob, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Cabelo penteado mas bufante
        ctx.fillStyle = '#4e342e';
        ctx.beginPath();
        ctx.arc(0, h - 60 + bob, 18, Math.PI * 0.9, Math.PI * 2.1);
        ctx.fill();

        // Nariz grande caricato
        ctx.fillStyle = '#ffab91';
        ctx.beginPath();
        ctx.ellipse(3, h - 55 + bob, 6, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Dentes para fora com batom vermelho
        ctx.fillStyle = '#d50000';
        ctx.fillRect(-4, h - 49 + bob, 9, 4);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-2, h - 48 + bob, 5, 4); // Dentão

        drawSouthParkEyes(ctx, 1, h - 58 + bob, 4, 1.8, false);
        ctx.restore();
        drawLabel(ctx, 'Feia Arrumada 💅', x, y + 10, '#ffd54f');
      }
    },

    // =========================================================================
    // NÍVEL 3 (800 a 1.500 pts)
    // =========================================================================
    {
      id: 'mae_4_filhos',
      name: 'Mãe Solteira de 4 Filhos',
      points: 800,
      level: 3,
      speed: 0.9,
      width: 70, // Mais larga pelo combo de crianças
      height: 72,
      children: 4,
      spawnWeight: 4,
      preferredCantadas: [20],
      draw(ctx, x, y, w, h, facing, animFrame) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(facing, 1);
        const bob = Math.sin(animFrame * Math.PI) * 2;

        // Mãe cansada
        ctx.fillStyle = '#616161';
        ctx.fillRect(-8, h - 22, 6, 22);
        ctx.fillRect(2, h - 22, 6, 22);
        ctx.fillStyle = '#81c784';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        drawRoundedRect(ctx, -12, h - 46 + bob, 24, 24, 4);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#ffcca5';
        ctx.beginPath();
        ctx.arc(0, h - 56 + bob, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#3e2723';
        ctx.beginPath();
        ctx.arc(0, h - 59 + bob, 15, Math.PI, Math.PI * 2);
        ctx.fill();
        drawSouthParkEyes(ctx, 2, h - 56 + bob, 4, 1.5, false);

        // 4 filhinhos em fila indiana atrás
        const kidColors = ['#f44336', '#ff9800', '#2196f3', '#4caf50'];
        for (let i = 1; i <= 4; i++) {
          const kX = -14 - i * 14;
          const kBob = Math.sin((animFrame + i * 0.4) * Math.PI) * 2;
          ctx.fillStyle = kidColors[i - 1];
          ctx.fillRect(kX - 4, h - 14 + kBob, 8, 8);
          ctx.fillStyle = '#ffcca5';
          ctx.beginPath();
          ctx.arc(kX, h - 19 + kBob, 5.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#212121';
          ctx.beginPath();
          ctx.arc(kX, h - 21 + kBob, 6, Math.PI, Math.PI * 2);
          ctx.fill();
          drawSouthParkEyes(ctx, kX, h - 19 + kBob, 2, 0.9, false);
        }

        ctx.restore();
        drawLabel(ctx, 'Mãe + 4 Filhos 👨‍👩‍👧‍👦', x, y + 10, '#a5d6a7');
      }
    },
    {
      id: 'mulher_preso',
      name: 'Mulher do Marido Preso',
      points: 1000,
      level: 3,
      speed: 1.05,
      width: 38,
      height: 70,
      isRisk: true,
      spawnWeight: 4,
      preferredCantadas: [1, 14],
      draw(ctx, x, y, w, h, facing, animFrame) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(facing, 1);
        const bob = Math.sin(animFrame * Math.PI) * 2;

        // Shorts jeans rasgado
        ctx.fillStyle = '#1e88e5';
        ctx.fillRect(-10, h - 22, 20, 10);
        ctx.fillStyle = '#ffcca5';
        ctx.fillRect(-8, h - 12, 6, 12);
        ctx.fillRect(2, h - 12, 6, 12);

        // Regata laranja
        ctx.fillStyle = '#ff9800';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        drawRoundedRect(ctx, -12, h - 44 + bob, 24, 22, 3);
        ctx.fill();
        ctx.stroke();

        // Tatuagem no braço
        ctx.fillStyle = '#263238';
        ctx.fillRect(-13, h - 38 + bob, 3, 10);

        // Cabeça
        ctx.fillStyle = '#ffcca5';
        ctx.beginPath();
        ctx.arc(0, h - 54 + bob, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Cabelo preto liso longo
        ctx.fillStyle = '#212121';
        ctx.beginPath();
        ctx.arc(0, h - 57 + bob, 16, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(-16, h - 56 + bob, 6, 26);
        ctx.fillRect(10, h - 56 + bob, 6, 26);

        // Brincos de argola gigantes
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(-16, h - 52 + bob, 5, 0, Math.PI * 2);
        ctx.stroke();

        drawSouthParkEyes(ctx, 2, h - 54 + bob, 4.5, 1.8, false);
        ctx.restore();
        drawLabel(ctx, 'Mulher do Preso ⚠️ (1000)', x, y + 10, '#ffa726');
      }
    },
    {
      id: 'vizinha_casada',
      name: 'Vizinha Casada na Janela',
      points: 1200,
      level: 3,
      speed: 0, // Fica na janela
      isStationary: true,
      isWindowNPC: true,
      isRisk: true,
      width: 44,
      height: 52,
      spawnWeight: 4,
      preferredCantadas: [1, 2, 7],
      draw(ctx, x, y, w, h, facing, animFrame) {
        ctx.save();
        ctx.translate(x, y);

        // Moldura da janela do prédio
        ctx.fillStyle = '#3e2723';
        ctx.fillRect(-22, h - 48, 44, 48);
        ctx.fillStyle = '#fffde7'; // Luz de dentro do quarto
        ctx.fillRect(-18, h - 44, 36, 40);

        // Cortininha rosa
        ctx.fillStyle = '#f48fb1';
        ctx.fillRect(-18, h - 44, 10, 36);
        ctx.fillRect(8, h - 44, 10, 36);

        // Parapeito da janela
        ctx.fillStyle = '#795548';
        ctx.fillRect(-24, h - 8, 48, 8);

        // Vizinha debruçada na janela de roupão
        ctx.fillStyle = '#e91e63';
        drawRoundedRect(ctx, -12, h - 26, 24, 18, 4);
        ctx.fill();

        // Cabeça com bobs de cabelo
        ctx.fillStyle = '#ffcca5';
        ctx.beginPath();
        ctx.arc(0, h - 34, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Cabelo com bobs coloridos
        ctx.fillStyle = '#795548';
        ctx.beginPath();
        ctx.arc(0, h - 36, 13, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#00e5ff';
        ctx.fillRect(-8, h - 44, 5, 4);
        ctx.fillStyle = '#ffea00';
        ctx.fillRect(3, h - 44, 5, 4);

        drawSouthParkEyes(ctx, 0, h - 34, 3.5, 1.5, false);

        ctx.restore();
        drawLabel(ctx, 'Vizinha na Janela 🪟 (1200)', x, y + 10, '#ff4081');
      }
    },
    {
      id: 'mulher_policial',
      name: 'Mulher do Policial',
      points: 1300,
      level: 3,
      speed: 1.0,
      width: 38,
      height: 72,
      isRisk: true,
      spawnWeight: 4,
      preferredCantadas: [2, 14],
      draw(ctx, x, y, w, h, facing, animFrame) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(facing, 1);
        const bob = Math.sin(animFrame * Math.PI) * 2;

        // Calça azul marinho
        ctx.fillStyle = '#0d47a1';
        ctx.fillRect(-9, h - 24, 7, 24);
        ctx.fillRect(2, h - 24, 7, 24);

        // Blusa elegante azul
        ctx.fillStyle = '#1565c0';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        drawRoundedRect(ctx, -12, h - 46 + bob, 24, 22, 4);
        ctx.fill();
        ctx.stroke();

        // Pingente com distintivo dourado da polícia
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(0, h - 36 + bob, 4, 0, Math.PI * 2);
        ctx.fill();

        // Cabeça
        ctx.fillStyle = '#ffcca5';
        ctx.beginPath();
        ctx.arc(0, h - 56 + bob, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Cabelo castanho escuro arrumado
        ctx.fillStyle = '#212121';
        ctx.beginPath();
        ctx.arc(0, h - 59 + bob, 16, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(-16, h - 58 + bob, 6, 20);

        drawSouthParkEyes(ctx, 2, h - 56 + bob, 4.2, 1.8, false);
        ctx.restore();
        drawLabel(ctx, 'Mulher do Policial 👮‍♀️ (1300)', x, y + 10, '#42a5f5');
      }
    },
    {
      id: 'mulher_agiota',
      name: 'Mulher do Agiota',
      points: 1400,
      level: 3,
      speed: 1.0,
      width: 40,
      height: 72,
      isRisk: true,
      spawnWeight: 3,
      preferredCantadas: [1, 16],
      draw(ctx, x, y, w, h, facing, animFrame) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(facing, 1);
        const bob = Math.sin(animFrame * Math.PI) * 2;

        // Calça animal print / dourada
        ctx.fillStyle = '#ffb300';
        ctx.fillRect(-9, h - 24, 7, 24);
        ctx.fillRect(2, h - 24, 7, 24);

        // Blusa verde esmeralda com joias
        ctx.fillStyle = '#00897b';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        drawRoundedRect(ctx, -13, h - 48 + bob, 26, 24, 4);
        ctx.fill();
        ctx.stroke();

        // Bolsa cheia de notas de 100 saindo
        ctx.fillStyle = '#5d4037';
        ctx.fillRect(11, h - 36 + bob, 10, 14);
        ctx.fillStyle = '#00e676';
        ctx.fillRect(13, h - 40 + bob, 7, 5);

        // Cabeça
        ctx.fillStyle = '#ffcca5';
        ctx.beginPath();
        ctx.arc(0, h - 58 + bob, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Cabelo preto com luzes douradas
        ctx.fillStyle = '#37474f';
        ctx.beginPath();
        ctx.arc(0, h - 61 + bob, 17, Math.PI, Math.PI * 2);
        ctx.fill();

        // Correntes e brincos de ouro maciço
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, h - 48 + bob, 7, 0, Math.PI);
        ctx.stroke();

        drawSouthParkEyes(ctx, 2, h - 58 + bob, 4.5, 1.8, false);
        ctx.restore();
        drawLabel(ctx, 'Mulher do Agiota 💰 (1400)', x, y + 10, '#ffd700');
      }
    },
    {
      id: 'ex_toxica',
      name: 'Ex-Namorada Tóxica',
      points: 900,
      level: 3,
      speed: 1.1,
      width: 38,
      height: 70,
      specialEffect: 'slow', // Deixa o Vicente lento por 4s
      spawnWeight: 4,
      preferredCantadas: [1, 14],
      draw(ctx, x, y, w, h, facing, animFrame) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(facing, 1);
        const bob = Math.sin(animFrame * Math.PI) * 2;

        // Calça preta
        ctx.fillStyle = '#212121';
        ctx.fillRect(-9, h - 22, 7, 22);
        ctx.fillRect(2, h - 22, 7, 22);

        // Blusa vermelha com braços cruzados
        ctx.fillStyle = '#c62828';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        drawRoundedRect(ctx, -12, h - 46 + bob, 24, 24, 4);
        ctx.fill();
        ctx.stroke();
        // Braços cruzados
        ctx.fillStyle = '#ffcca5';
        ctx.fillRect(-10, h - 34 + bob, 20, 6);

        // Cabeça
        ctx.fillStyle = '#ffcca5';
        ctx.beginPath();
        ctx.arc(0, h - 56 + bob, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Cabelo preto chanel curto
        ctx.fillStyle = '#111111';
        ctx.beginPath();
        ctx.arc(0, h - 59 + bob, 16, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(-16, h - 58 + bob, 6, 18);
        ctx.fillRect(10, h - 58 + bob, 6, 18);

        // Olhar julgador bravo
        drawSouthParkEyes(ctx, 2, h - 56 + bob, 4, 1.8, true);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-5, h - 60 + bob);
        ctx.lineTo(0, h - 57 + bob);
        ctx.moveTo(5, h - 60 + bob);
        ctx.lineTo(0, h - 57 + bob);
        ctx.stroke();

        ctx.restore();
        drawLabel(ctx, 'Ex Tóxica ⚠️ (Lento)', x, y + 10, '#ef5350');
      }
    },
    {
      id: 'noiva_fuga',
      name: 'Noiva em Fuga',
      points: 1500,
      level: 3,
      speed: 2.0, // Corre muito rápido!
      width: 44,
      height: 72,
      spawnWeight: 3,
      preferredCantadas: [1, 2],
      draw(ctx, x, y, w, h, facing, animFrame) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(facing, 1);
        const bob = Math.sin(animFrame * Math.PI) * 4;

        // Véu voando atrás
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.moveTo(-6, h - 60 + bob);
        ctx.lineTo(-35, h - 68 + bob);
        ctx.lineTo(-30, h - 45 + bob);
        ctx.closePath();
        ctx.fill();

        // Vestido longo de noiva esvoaçante
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#bdbdbd';
        ctx.lineWidth = 2;
        drawRoundedRect(ctx, -14, h - 48 + bob, 28, 38, 6);
        ctx.fill();
        ctx.stroke();

        // Buquê de flores na mão
        ctx.fillStyle = '#e91e63';
        ctx.beginPath();
        ctx.arc(14, h - 36 + bob, 5, 0, Math.PI * 2);
        ctx.fill();

        // Cabeça
        ctx.fillStyle = '#ffcca5';
        ctx.beginPath();
        ctx.arc(0, h - 58 + bob, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.stroke();

        // Cabelo loiro com grinalda
        ctx.fillStyle = '#ffd54f';
        ctx.beginPath();
        ctx.arc(0, h - 61 + bob, 16, Math.PI, Math.PI * 2);
        ctx.fill();
        // Grinalda de florzinhas
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-6, h - 68 + bob, 3, 0, Math.PI * 2);
        ctx.arc(0, h - 70 + bob, 3, 0, Math.PI * 2);
        ctx.arc(6, h - 68 + bob, 3, 0, Math.PI * 2);
        ctx.fill();

        drawSouthParkEyes(ctx, 3, h - 58 + bob, 4.5, 1.8, true);
        ctx.restore();
        drawLabel(ctx, 'Noiva em Fuga 🏃‍♀️ (1500)', x, y + 10, '#ffffff');
      }
    },

    // =========================================================================
    // NÍVEL 4 (2.000 a 3.500 pts)
    // =========================================================================
    {
      id: 'cracuda',
      name: 'Cracuda da Esquina',
      points: 2000,
      level: 4,
      speed: 0.85,
      width: 36,
      height: 68,
      spawnWeight: 3,
      preferredCantadas: [8, 9, 10],
      draw(ctx, x, y, w, h, facing, animFrame) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(facing, 1);
        // Andar bem torto
        const wobble = Math.sin(animFrame * Math.PI * 2) * 4;
        const bob = Math.sin(animFrame * Math.PI) * 2;

        ctx.rotate((wobble * Math.PI) / 180);

        // Pernas muito finas
        ctx.fillStyle = '#424242';
        ctx.fillRect(-7, h - 22, 4, 22);
        ctx.fillRect(3, h - 22, 4, 22);

        // Roupa toda rasgada e encardida
        ctx.fillStyle = '#795548';
        ctx.strokeStyle = '#3e2723';
        ctx.lineWidth = 1.8;
        drawRoundedRect(ctx, -10, h - 44 + bob, 20, 22, 2);
        ctx.fill();
        ctx.stroke();

        // Cabeça cadavérica
        ctx.fillStyle = '#e0d5c1';
        ctx.beginPath();
        ctx.arc(0, h - 54 + bob, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.stroke();

        // Cabelo espetado e bagunçado
        ctx.fillStyle = '#3e2723';
        ctx.beginPath();
        ctx.moveTo(-12, h - 58 + bob);
        ctx.lineTo(-18, h - 70 + bob);
        ctx.lineTo(-8, h - 64 + bob);
        ctx.lineTo(0, h - 74 + bob);
        ctx.lineTo(8, h - 64 + bob);
        ctx.lineTo(18, h - 68 + bob);
        ctx.lineTo(12, h - 58 + bob);
        ctx.closePath();
        ctx.fill();

        // Olheiras fundas arroxeadas
        ctx.fillStyle = '#4a148c';
        ctx.beginPath();
        ctx.ellipse(-4, h - 52 + bob, 5, 4, 0, 0, Math.PI * 2);
        ctx.ellipse(4, h - 52 + bob, 5, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Olhos esbugalhados
        drawSouthParkEyes(ctx, 0, h - 53 + bob, 3.2, 1.2, true);

        ctx.restore();
        drawLabel(ctx, 'Cracuda 🧟‍♀️ (2000)', x, y + 10, '#bcaaa4');
      }
    },
    {
      id: 'velhinha_rica',
      name: 'Velhinha Rica da Lancha',
      points: 2500,
      level: 4,
      speed: 0.8,
      width: 40,
      height: 70,
      specialEffect: 'ostentation', // Ativa modo ostentação!
      spawnWeight: 2,
      preferredCantadas: [5, 6, 7],
      draw(ctx, x, y, w, h, facing, animFrame) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(facing, 1);
        const bob = Math.sin(animFrame * Math.PI) * 1.5;

        // Casaco de pele branco refinado
        ctx.fillStyle = '#f5f5f5';
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2.5;
        drawRoundedRect(ctx, -14, h - 46 + bob, 28, 34, 6);
        ctx.fill();
        ctx.stroke();

        // Colar de pérolas triplo
        ctx.fillStyle = '#ffffff';
        for (let p = -8; p <= 8; p += 4) {
          ctx.beginPath();
          ctx.arc(p, h - 42 + bob, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Cachorrinho poodle rosa no colo
        ctx.fillStyle = '#f8bbd0';
        ctx.beginPath();
        ctx.arc(10, h - 34 + bob, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.arc(14, h - 38 + bob, 4, 0, Math.PI * 2);
        ctx.fill();

        // Cabeça
        ctx.fillStyle = '#ffcca5';
        ctx.beginPath();
        ctx.arc(0, h - 56 + bob, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.stroke();

        // Penteado refinado alto branco com tiara
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, h - 62 + bob, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(-8, h - 72 + bob, 16, 4);

        // Óculos escuros chiques gatinho
        ctx.fillStyle = '#212121';
        ctx.beginPath();
        ctx.moveTo(-10, h - 60 + bob);
        ctx.lineTo(-2, h - 56 + bob);
        ctx.lineTo(-10, h - 54 + bob);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(10, h - 60 + bob);
        ctx.lineTo(2, h - 56 + bob);
        ctx.lineTo(10, h - 54 + bob);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
        drawLabel(ctx, 'Velha da Lancha 🛥️ (2500)', x, y + 10, '#ffd700');
      }
    },
    {
      id: 'a_sogra',
      name: 'A Sogra',
      points: 3000,
      level: 4,
      speed: 0.9,
      width: 44,
      height: 74,
      spawnWeight: 2,
      preferredCantadas: [5, 14],
      draw(ctx, x, y, w, h, facing, animFrame) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(facing, 1);
        const bob = Math.sin(animFrame * Math.PI) * 2;

        // Avental de cozinha marrom
        ctx.fillStyle = '#5d4037';
        ctx.fillRect(-12, h - 46 + bob, 24, 34);

        // Rolo de macarrão na mão ameaçadoramente erguido
        ctx.fillStyle = '#d7ccc8';
        ctx.strokeStyle = '#8d6e63';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.rect(10, h - 52 + bob, 6, 26);
        ctx.fill();
        ctx.stroke();

        // Cabeça intimidadora
        ctx.fillStyle = '#ffcca5';
        ctx.beginPath();
        ctx.arc(0, h - 58 + bob, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Bobs vermelhos gigantes no cabelo
        ctx.fillStyle = '#e53935';
        ctx.beginPath();
        ctx.arc(-10, h - 70 + bob, 5, 0, Math.PI * 2);
        ctx.arc(0, h - 74 + bob, 5, 0, Math.PI * 2);
        ctx.arc(10, h - 70 + bob, 5, 0, Math.PI * 2);
        ctx.fill();

        // Sobrancelhas de fúria
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-8, h - 63 + bob);
        ctx.lineTo(-2, h - 59 + bob);
        ctx.moveTo(8, h - 63 + bob);
        ctx.lineTo(2, h - 59 + bob);
        ctx.stroke();

        drawSouthParkEyes(ctx, 0, h - 58 + bob, 4.5, 2, true);
        ctx.restore();
        drawLabel(ctx, 'A SOGRA 🪓 (3000)', x, y + 10, '#ff1744');
      }
    },
    {
      id: 'feia_forca',
      name: 'Feia com Força',
      points: 3500,
      level: 4,
      speed: 1.0,
      width: 44,
      height: 74,
      spawnWeight: 2,
      preferredCantadas: [8, 9, 10],
      draw(ctx, x, y, w, h, facing, animFrame) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(facing, 1);
        const bob = Math.sin(animFrame * Math.PI) * 2;

        // Vestidinho verde com estampa bizarra
        ctx.fillStyle = '#558b2f';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2.5;
        drawRoundedRect(ctx, -13, h - 48 + bob, 26, 32, 4);
        ctx.fill();
        ctx.stroke();

        // Braços fortes peludos
        ctx.fillStyle = '#ffab91';
        ctx.fillRect(-18, h - 44 + bob, 5, 18);
        ctx.fillRect(13, h - 44 + bob, 5, 18);

        // Cabeça caricata com queixo gigante quadrado
        ctx.fillStyle = '#ffab91';
        ctx.fillRect(-12, h - 54 + bob, 24, 16);
        ctx.beginPath();
        ctx.arc(0, h - 58 + bob, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Cabelo desgrenhado
        ctx.fillStyle = '#212121';
        ctx.fillRect(-16, h - 70 + bob, 32, 10);
        ctx.fillRect(-18, h - 68 + bob, 6, 24);

        // Monocelha grossa contínua
        ctx.fillStyle = '#000000';
        ctx.fillRect(-9, h - 63 + bob, 18, 4);

        // Dentes tortos e verruga no nariz
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-5, h - 47 + bob, 4, 6);
        ctx.fillRect(1, h - 46 + bob, 4, 7);

        // Verruga
        ctx.fillStyle = '#3e2723';
        ctx.beginPath();
        ctx.arc(4, h - 54 + bob, 2, 0, Math.PI * 2);
        ctx.fill();

        drawSouthParkEyes(ctx, 0, h - 58 + bob, 4, 1.8, false);

        ctx.restore();
        drawLabel(ctx, 'Feia com Força 👑 (3500)', x, y + 10, '#c6ff00');
      }
    },

    // =========================================================================
    // ARMADILHAS (TRAPS) - Perde pontos, vira e ativa susto!
    // =========================================================================
    {
      id: 'trap_metaleiro',
      name: 'Metaleiro Cabeludo',
      points: -300,
      level: 'trap',
      speed: 1.0,
      isTrap: true,
      width: 40,
      height: 72,
      spawnWeight: 5,
      revealed: false,
      draw(ctx, x, y, w, h, facing, animFrame, revealed) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(facing, 1);
        const bob = Math.sin(animFrame * Math.PI) * 2;

        if (!revealed) {
          // DE COSTAS: Parece mulher com lindo cabelo longo preto
          ctx.fillStyle = '#212121';
          ctx.fillRect(-9, h - 22, 7, 22);
          ctx.fillRect(2, h - 22, 7, 22);

          // Jaqueta de couro preta
          ctx.fillStyle = '#111111';
          drawRoundedRect(ctx, -12, h - 46 + bob, 24, 24, 4);
          ctx.fill();

          // Cabelão longo cobrindo todas as costas
          ctx.fillStyle = '#1a1a1a';
          ctx.beginPath();
          ctx.arc(0, h - 56 + bob, 15, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillRect(-14, h - 56 + bob, 28, 30);
          ctx.fillStyle = '#333333';
          ctx.fillRect(-8, h - 50 + bob, 2, 24);
          ctx.fillRect(6, h - 50 + bob, 2, 24);
        } else {
          // REVELADO DE FRENTE: Barbudo do Rock com cara feia!
          ctx.fillStyle = '#212121';
          ctx.fillRect(-9, h - 22, 7, 22);
          ctx.fillRect(2, h - 22, 7, 22);

          // Camiseta Iron Maiden
          ctx.fillStyle = '#000000';
          drawRoundedRect(ctx, -12, h - 46 + bob, 24, 24, 4);
          ctx.fill();
          ctx.fillStyle = '#ff1744';
          ctx.fillRect(-6, h - 40 + bob, 12, 6);

          // Cabeça
          ctx.fillStyle = '#ffcca5';
          ctx.beginPath();
          ctx.arc(0, h - 56 + bob, 15, 0, Math.PI * 2);
          ctx.fill();

          // Barba preta grossa cheia
          ctx.fillStyle = '#111111';
          ctx.beginPath();
          ctx.arc(0, h - 50 + bob, 13, 0, Math.PI);
          ctx.fill();

          // Cabelão escorrido dos lados
          ctx.fillRect(-17, h - 60 + bob, 6, 32);
          ctx.fillRect(11, h - 60 + bob, 6, 32);

          drawSouthParkEyes(ctx, 0, h - 58 + bob, 4.5, 2, true);
        }

        ctx.restore();
        const label = revealed ? 'É O METALEIRO! 🎸' : 'Cabeluda Linda?';
        drawLabel(ctx, label, x, y + 10, revealed ? '#ff1744' : '#e0e0e0');
      }
    },
    {
      id: 'trap_cilada',
      name: '"Cilada" Disfarçada',
      points: -500,
      level: 'trap',
      speed: 1.05,
      isTrap: true,
      width: 38,
      height: 72,
      spawnWeight: 5,
      revealed: false,
      draw(ctx, x, y, w, h, facing, animFrame, revealed) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(facing, 1);
        const bob = Math.sin(animFrame * Math.PI) * 2;

        if (!revealed) {
          // DE COSTAS: Vestido vermelho justo atraente, pernas bonitas
          ctx.fillStyle = '#ffcca5';
          ctx.fillRect(-7, h - 18, 5, 18);
          ctx.fillRect(2, h - 18, 5, 18);

          // Vestidinho vermelho
          ctx.fillStyle = '#d50000';
          drawRoundedRect(ctx, -12, h - 46 + bob, 24, 28, 5);
          ctx.fill();

          // Peruca loira sedosa pelas costas
          ctx.fillStyle = '#ffd54f';
          ctx.beginPath();
          ctx.arc(0, h - 56 + bob, 15, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillRect(-14, h - 56 + bob, 28, 26);
        } else {
          // REVELADO DE FRENTE: Cara com sombra de barba de 3 dias e queixo quadrado!
          ctx.fillStyle = '#ffcca5';
          ctx.fillRect(-7, h - 18, 5, 18);
          ctx.fillRect(2, h - 18, 5, 18);

          ctx.fillStyle = '#d50000';
          drawRoundedRect(ctx, -12, h - 46 + bob, 24, 28, 5);
          ctx.fill();

          // Cabeça com queixo quadrado
          ctx.fillStyle = '#ffcca5';
          ctx.beginPath();
          ctx.arc(0, h - 56 + bob, 15, 0, Math.PI * 2);
          ctx.fill();

          // Barba por fazer (pontinhos cinzas)
          ctx.fillStyle = '#78909c';
          ctx.beginPath();
          ctx.arc(0, h - 50 + bob, 12, 0, Math.PI);
          ctx.fill();

          // Peruca meio torta
          ctx.fillStyle = '#ffd54f';
          ctx.fillRect(-15, h - 68 + bob, 30, 10);

          drawSouthParkEyes(ctx, 0, h - 56 + bob, 4.5, 2, true);
        }

        ctx.restore();
        const label = revealed ? 'É CILADA BINO! 💥' : 'Gatinha de Vermelho?';
        drawLabel(ctx, label, x, y + 10, revealed ? '#ff1744' : '#ff8a80');
      }
    },
    {
      id: 'trap_bone',
      name: 'Cara de Boné e Short',
      points: -400,
      level: 'trap',
      speed: 1.1,
      isTrap: true,
      width: 40,
      height: 72,
      spawnWeight: 5,
      revealed: false,
      draw(ctx, x, y, w, h, facing, animFrame, revealed) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(facing, 1);
        const bob = Math.sin(animFrame * Math.PI) * 2;

        if (!revealed) {
          // DE COSTAS: Boné para trás, regata branca, cabelo comprido saindo
          ctx.fillStyle = '#1e88e5'; // Short jeans
          ctx.fillRect(-10, h - 22, 20, 10);
          ctx.fillStyle = '#ffcca5';
          ctx.fillRect(-8, h - 12, 6, 12);
          ctx.fillRect(2, h - 12, 6, 12);

          // Regata branca
          ctx.fillStyle = '#ffffff';
          drawRoundedRect(ctx, -11, h - 44 + bob, 22, 22, 3);
          ctx.fill();

          // Cabelo comprido escapando
          ctx.fillStyle = '#5d4037';
          ctx.fillRect(-12, h - 54 + bob, 24, 20);

          // Boné de costas
          ctx.fillStyle = '#d32f2f';
          ctx.beginPath();
          ctx.arc(0, h - 58 + bob, 14, Math.PI, Math.PI * 2);
          ctx.fill();
          ctx.fillRect(-14, h - 58 + bob, 10, 4); // Aba para trás
        } else {
          // REVELADO DE FRENTE: Um marmanjo de bigode!
          ctx.fillStyle = '#1e88e5';
          ctx.fillRect(-10, h - 22, 20, 10);
          ctx.fillStyle = '#ffcca5';
          ctx.fillRect(-8, h - 12, 6, 12);
          ctx.fillRect(2, h - 12, 6, 12);

          ctx.fillStyle = '#ffffff';
          drawRoundedRect(ctx, -11, h - 44 + bob, 22, 22, 3);
          ctx.fill();

          // Cabeça
          ctx.fillStyle = '#ffcca5';
          ctx.beginPath();
          ctx.arc(0, h - 56 + bob, 15, 0, Math.PI * 2);
          ctx.fill();

          // Bigodão grosso
          ctx.fillStyle = '#212121';
          ctx.fillRect(-6, h - 50 + bob, 12, 4);

          // Boné reto
          ctx.fillStyle = '#d32f2f';
          ctx.fillRect(-14, h - 68 + bob, 28, 8);
          ctx.fillRect(2, h - 63 + bob, 18, 4); // Aba reta

          drawSouthParkEyes(ctx, 0, h - 56 + bob, 4.2, 1.8, true);
        }

        ctx.restore();
        const label = revealed ? 'ERA UM MANO! 🧢' : 'Estilo Descolada?';
        drawLabel(ctx, label, x, y + 10, revealed ? '#ff1744' : '#90caf9');
      }
    }
  ];

  // Helper de gerenciamento de Spawn
  window.NPCData = {
    list: NPCS,

    getById(id) {
      return NPCS.find((npc) => npc.id === id) || null;
    },

    /**
     * Retorna a lista de candidatos e taxa de spawn com base no tempo decorrido
     * @param {number} elapsedSeconds - Segundos jogados (0 a 90)
     * @param {number} totalTime - Duração total (90)
     */
    getSpawnConfig(elapsedSeconds, totalTime) {
      const progress = Math.min(1, elapsedSeconds / (totalTime || 90));
      let candidateLevels = [1];
      let trapChance = 0.15;

      if (progress < 0.33) {
        // Primeiros 30s: Nível 1 dominante com leve chance de Nível 2
        candidateLevels = [1, 1, 1, 2];
        trapChance = 0.12;
      } else if (progress < 0.66) {
        // 30s a 60s: Mix de Nível 1, 2 e alguns do Nível 3
        candidateLevels = [1, 2, 2, 3];
        trapChance = 0.22;
      } else if (progress < 0.83) {
        // 60s a 75s: Foco em Nível 2, 3 e Nível 4
        candidateLevels = [2, 3, 3, 4];
        trapChance = 0.28;
      } else {
        // Últimos 15s (Reta final): Risco alto, Nível 3 e 4, muitas armadilhas
        candidateLevels = [3, 4, 4];
        trapChance = 0.35;
      }

      // Filtra candidatos pelos níveis permitidos
      const candidates = NPCS.filter((npc) => {
        if (npc.isTrap) {
          return Math.random() < trapChance;
        }
        return candidateLevels.includes(npc.level);
      });

      return {
        candidates: candidates.length > 0 ? candidates : NPCS,
        maxOnScreen: 6,
        minSpawnInterval: 1.8,
        maxSpawnInterval: 3.2
      };
    }
  };
})();
