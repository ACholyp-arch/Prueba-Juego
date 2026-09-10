const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startScreen = document.getElementById("startScreen");
const upgradeScreen = document.getElementById("upgradeScreen");
const endScreen = document.getElementById("endScreen");
const upgradeCards = document.getElementById("upgradeCards");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

const attentionText = document.getElementById("attentionText");
const waveText = document.getElementById("waveText");
const focusText = document.getElementById("focusText");
const fatigueText = document.getElementById("fatigueText");

const abilityFocus = document.getElementById("abilityFocus");
const abilityPause = document.getElementById("abilityPause");
const abilityAirplane = document.getElementById("abilityAirplane");

const W = canvas.width;
const H = canvas.height;

let state;
let keys = {};
let mouse = { x: 740, y: 260, down: false };
let lastTime = 0;
let animationId = null;

const enemyBlueprints = {
  reel: {
    label: "Reel veloz",
    emoji: "📱",
    hp: 42,
    speed: 52,
    damage: 8,
    reward: 8,
    color: "#69b7ff"
  },
  notify: {
    label: "Notificación roja",
    emoji: "🔔",
    hp: 30,
    speed: 88,
    damage: 10,
    reward: 10,
    color: "#ff4f5e"
  },
  sludge: {
    label: "Sludge content",
    emoji: "🧩",
    hp: 72,
    speed: 38,
    damage: 14,
    reward: 14,
    color: "#b79dff"
  },
  ad: {
    label: "Anuncio disfrazado",
    emoji: "🎯",
    hp: 58,
    speed: 48,
    damage: 12,
    reward: 12,
    color: "#ffd166"
  },
  boss: {
    label: "Infinite Scroll",
    emoji: "♾️",
    hp: 430,
    speed: 22,
    damage: 28,
    reward: 60,
    color: "#ff8fab"
  }
};

const upgrades = [
  {
    emoji: "🎯",
    title: "Atención sostenida",
    text: "+8 de daño base. Tus disparos de foco duelen más.",
    apply: () => state.player.damage += 8
  },
  {
    emoji: "🧠",
    title: "Memoria de trabajo",
    text: "+22 de vida máxima y curación inmediata.",
    apply: () => {
      state.player.maxHp += 22;
      state.player.hp = Math.min(state.player.maxHp, state.player.hp + 36);
    }
  },
  {
    emoji: "🛡️",
    title: "Control inhibitorio",
    text: "+8% de crítico. Más probabilidad de ignorar estímulos basura.",
    apply: () => state.player.crit += 0.08
  },
  {
    emoji: "🌬️",
    title: "Respiración 4-7-8",
    text: "-25% de fatiga mental acumulada.",
    apply: () => state.player.fatigue = Math.max(0, state.player.fatigue - 25)
  },
  {
    emoji: "⚡",
    title: "Procesamiento rápido",
    text: "Disparas más rápido, pero ganas un poco de fatiga.",
    apply: () => {
      state.player.fireRate = Math.max(0.17, state.player.fireRate - 0.05);
      state.player.fatigue = Math.min(100, state.player.fatigue + 8);
    }
  },
  {
    emoji: "📵",
    title: "Ambiente sin interrupciones",
    text: "Las notificaciones aparecen con menos vida.",
    apply: () => state.mods.weakNotifications += 10
  },
  {
    emoji: "📚",
    title: "Lectura profunda",
    text: "+10% de precisión y menos dispersión del disparo.",
    apply: () => state.player.accuracy = Math.min(0.98, state.player.accuracy + 0.1)
  },
  {
    emoji: "🍵",
    title: "Descanso visual",
    text: "Recuperas 18 de vida y reduces 12 de fatiga.",
    apply: () => {
      state.player.hp = Math.min(state.player.maxHp, state.player.hp + 18);
      state.player.fatigue = Math.max(0, state.player.fatigue - 12);
    }
  }
];

function resetGame() {
  state = {
    running: false,
    pausedForUpgrade: false,
    gameOver: false,
    victory: false,
    wave: 1,
    maxWave: 5,
    score: 0,
    coins: 0,
    time: 0,
    spawnTimer: 0,
    enemiesToSpawn: 0,
    currentWaveSpawned: 0,
    waveMessageTimer: 2.3,
    particles: [],
    bullets: [],
    enemies: [],
    floatingTexts: [],
    player: {
      x: 118,
      y: H / 2 + 20,
      radius: 42,
      hp: 110,
      maxHp: 110,
      damage: 24,
      crit: 0.12,
      accuracy: 0.86,
      fireRate: 0.43,
      fireTimer: 0,
      fatigue: 0
    },
    skills: {
      focus: { ready: true, active: false, timer: 0, cooldown: 0 },
      pause: { ready: true, active: false, timer: 0, cooldown: 0 },
      airplane: { ready: true, active: false, cooldown: 0 }
    },
    mods: {
      weakNotifications: 0
    }
  };

  prepareWave();
  updateHUD();
}

function prepareWave() {
  state.enemiesToSpawn = 5 + state.wave * 3;
  state.currentWaveSpawned = 0;
  state.spawnTimer = 0.6;
  state.waveMessageTimer = 2.2;
}

function startGame() {
  resetGame();
  state.running = true;
  startScreen.classList.add("hidden");
  upgradeScreen.classList.add("hidden");
  endScreen.classList.add("hidden");
  lastTime = performance.now();

  if (animationId) {
    cancelAnimationFrame(animationId);
  }

  animationId = requestAnimationFrame(loop);
}

function loop(now) {
  const dt = Math.min(0.033, (now - lastTime) / 1000 || 0);
  lastTime = now;

  if (state.running && !state.pausedForUpgrade && !state.gameOver) {
    update(dt);
  }

  render();

  if (!state.gameOver) {
    animationId = requestAnimationFrame(loop);
  }
}

function update(dt) {
  state.time += dt;
  state.player.fireTimer -= dt;
  state.waveMessageTimer -= dt;

  updateSkills(dt);
  spawnEnemies(dt);
  updateEnemies(dt);
  updateBullets(dt);
  updateParticles(dt);
  updateFloatingTexts(dt);

  if (state.enemies.length === 0 && state.currentWaveSpawned >= state.enemiesToSpawn) {
    if (state.wave >= state.maxWave) {
      winGame();
    } else {
      openUpgradeScreen();
    }
  }

  if (state.player.hp <= 0) {
    loseGame();
  }

  const nearest = getNearestEnemy();

  if (nearest && state.player.fireTimer <= 0) {
    shootAt(nearest.x, nearest.y);
    state.player.fireTimer = state.player.fireRate + state.player.fatigue * 0.0014;
  }

  updateHUD();
}

function updateSkills(dt) {
  for (const skill of Object.values(state.skills)) {
    if (skill.cooldown > 0) {
      skill.cooldown -= dt;

      if (skill.cooldown <= 0) {
        skill.cooldown = 0;
        skill.ready = true;
      }
    }
  }

  const focus = state.skills.focus;

  if (focus.active) {
    focus.timer -= dt;

    if (focus.timer <= 0) {
      focus.active = false;
    }
  }

  const pause = state.skills.pause;

  if (pause.active) {
    pause.timer -= dt;

    if (pause.timer <= 0) {
      pause.active = false;
    }
  }

  abilityFocus.disabled = !state.skills.focus.ready;
  abilityPause.disabled = !state.skills.pause.ready;
  abilityAirplane.disabled = !state.skills.airplane.ready;
}

function spawnEnemies(dt) {
  state.spawnTimer -= dt;

  if (state.spawnTimer > 0 || state.currentWaveSpawned >= state.enemiesToSpawn) {
    return;
  }

  const type = chooseEnemyType();

  spawnEnemy(type);
  state.currentWaveSpawned++;

  const baseDelay = Math.max(0.42, 1.05 - state.wave * 0.09);
  state.spawnTimer = baseDelay + Math.random() * 0.45;
}

function chooseEnemyType() {
  if (state.wave === state.maxWave && state.currentWaveSpawned === state.enemiesToSpawn - 1) {
    return "boss";
  }

  const pool = ["reel", "reel", "reel"];

  if (state.wave >= 2) {
    pool.push("notify", "notify");
  }

  if (state.wave >= 3) {
    pool.push("sludge");
  }

  if (state.wave >= 4) {
    pool.push("ad", "ad");
  }

  return pool[Math.floor(Math.random() * pool.length)];
}

function spawnEnemy(type) {
  const bp = enemyBlueprints[type];
  const scale = 1 + (state.wave - 1) * 0.16;
  const isBoss = type === "boss";

  const hpBonus = type === "notify" ? -state.mods.weakNotifications : 0;

  const enemy = {
    type,
    label: bp.label,
    emoji: bp.emoji,
    x: W + (isBoss ? 90 : 40),
    y: 108 + Math.random() * 326,
    radius: isBoss ? 52 : 30 + Math.random() * 8,
    hp: Math.max(12, bp.hp * scale + hpBonus),
    maxHp: Math.max(12, bp.hp * scale + hpBonus),
    speed: bp.speed * (1 + (state.wave - 1) * 0.08),
    damage: bp.damage,
    reward: bp.reward,
    color: bp.color,
    wobble: Math.random() * Math.PI * 2,
    disguised: type === "ad"
  };

  state.enemies.push(enemy);
}

function updateEnemies(dt) {
  const pauseFactor = state.skills.pause.active ? 0.08 : 1;

  for (let i = state.enemies.length - 1; i >= 0; i--) {
    const e = state.enemies[i];

    e.wobble += dt * 4;
    e.x -= e.speed * dt * pauseFactor;
    e.y += Math.sin(e.wobble) * dt * 12;

    if (e.type === "boss" && Math.random() < dt * 0.55) {
      const mini = Math.random() < 0.6 ? "reel" : "notify";
      spawnEnemy(mini);
      state.enemies[state.enemies.length - 1].x = e.x + 40;
      state.enemies[state.enemies.length - 1].y = e.y + randomRange(-80, 80);
    }

    if (e.x < state.player.x + state.player.radius) {
      state.player.hp -= e.damage;
      state.player.fatigue = Math.min(100, state.player.fatigue + 6);
      burst(e.x, e.y, e.color, 14);
      addFloatingText(`-${e.damage} atención`, state.player.x + 20, state.player.y - 70, "#ff4f5e");
      state.enemies.splice(i, 1);
    }
  }
}

function updateBullets(dt) {
  for (let i = state.bullets.length - 1; i >= 0; i--) {
    const b = state.bullets[i];

    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.life -= dt;

    if (b.life <= 0 || b.x > W + 60 || b.y < -60 || b.y > H + 60) {
      state.bullets.splice(i, 1);
      continue;
    }

    for (let j = state.enemies.length - 1; j >= 0; j--) {
      const e = state.enemies[j];
      const d = distance(b.x, b.y, e.x, e.y);

      if (d < e.radius + b.radius) {
        e.hp -= b.damage;
        burst(b.x, b.y, b.color, b.crit ? 18 : 8);
        addFloatingText(
          b.crit ? "CRIT" : Math.round(b.damage),
          e.x,
          e.y - e.radius,
          b.crit ? "#ff4f5e" : "#17302c"
        );

        state.bullets.splice(i, 1);

        if (e.hp <= 0) {
          state.score += e.reward;
          state.coins += e.reward;
          state.player.fatigue = Math.min(
            100,
            state.player.fatigue + (e.type === "sludge" ? 2.8 : 1.2)
          );

          burst(e.x, e.y, e.color, 28);
          addFloatingText("+foco", e.x, e.y, "#257260");
          state.enemies.splice(j, 1);
        }

        break;
      }
    }
  }
}

function updateParticles(dt) {
  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p = state.particles[i];

    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 40 * dt;
    p.life -= dt;

    if (p.life <= 0) {
      state.particles.splice(i, 1);
    }
  }
}

function updateFloatingTexts(dt) {
  for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
    const f = state.floatingTexts[i];

    f.y -= 34 * dt;
    f.life -= dt;

    if (f.life <= 0) {
      state.floatingTexts.splice(i, 1);
    }
  }
}

function shootAt(tx, ty) {
  const p = state.player;
  const focusBoost = state.skills.focus.active ? 2 : 1;
  const missed = Math.random() > p.accuracy;
  const crit = Math.random() < p.crit;
  const damage = p.damage * focusBoost * (crit ? 1.8 : 1);

  const startX = p.x + 38;
  const startY = p.y - 4;
  const spread = missed ? randomRange(-180, 180) : randomRange(-24, 24);
  const angle = Math.atan2(ty + spread - startY, tx - startX);
  const speed = missed ? 520 : 660;

  state.bullets.push({
    x: startX,
    y: startY,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    radius: crit ? 8 : 6,
    damage,
    crit,
    color: crit ? "#ff4f5e" : "#69b7ff",
    life: 1.3
  });
}

function getNearestEnemy() {
  let nearest = null;
  let best = Infinity;

  for (const e of state.enemies) {
    const d = e.x - state.player.x;

    if (d > 0 && d < best) {
      best = d;
      nearest = e;
    }
  }

  return nearest;
}

function useSkill(name) {
  if (!state || !state.running || state.pausedForUpgrade || state.gameOver) {
    return;
  }

  const skill = state.skills[name];

  if (!skill || !skill.ready) {
    return;
  }

  if (name === "focus") {
    skill.active = true;
    skill.timer = 6;
    skill.cooldown = 18;
    addFloatingText("MODO FOCUS", state.player.x + 80, state.player.y - 80, "#69b7ff");
  }

  if (name === "pause") {
    skill.active = true;
    skill.timer = 4;
    skill.cooldown = 20;
    addFloatingText("PAUSA CONSCIENTE", state.player.x + 80, state.player.y - 110, "#b79dff");
  }

  if (name === "airplane") {
    for (let i = state.enemies.length - 1; i >= 0; i--) {
      if (state.enemies[i].type === "notify") {
        burst(state.enemies[i].x, state.enemies[i].y, "#ff4f5e", 20);
        state.enemies.splice(i, 1);
      }
    }

    skill.cooldown = 22;
    addFloatingText("MODO AVIÓN", state.player.x + 90, state.player.y - 50, "#257260");
  }

  skill.ready = false;
}

function openUpgradeScreen() {
  state.pausedForUpgrade = true;
  state.running = false;
  upgradeCards.innerHTML = "";

  const chosen = shuffle([...upgrades]).slice(0, 3);

  for (const up of chosen) {
    const btn = document.createElement("button");
    btn.className = "card-btn";
    btn.innerHTML = `
      <span class="emoji">${up.emoji}</span>
      <strong>${up.title}</strong>
      <small>${up.text}</small>
    `;

    btn.addEventListener("click", () => {
      up.apply();
      state.wave++;
      prepareWave();
      state.running = true;
      state.pausedForUpgrade = false;
      upgradeScreen.classList.add("hidden");
      lastTime = performance.now();
      animationId = requestAnimationFrame(loop);
    });

    upgradeCards.appendChild(btn);
  }

  upgradeScreen.classList.remove("hidden");
}

function winGame() {
  state.gameOver = true;
  state.victory = true;

  endGame(
    "✨",
    "Recuperaste tu atención",
    `Sobreviviste al Infinite Scroll con ${Math.round(state.player.hp)} puntos de atención. Puntaje: ${state.score}.`
  );
}

function loseGame() {
  state.gameOver = true;
  state.victory = false;

  endGame(
    "📱",
    "El algoritmo te capturó",
    `Tu atención llegó a cero en la Wave ${state.wave}. Puntaje: ${state.score}. Respira, ajusta y vuelve.`
  );
}

function endGame(icon, title, text) {
  document.getElementById("endIcon").textContent = icon;
  document.getElementById("endTitle").textContent = title;
  document.getElementById("endText").textContent = text;
  endScreen.classList.remove("hidden");
  updateHUD();
}

function updateHUD() {
  if (!state) {
    return;
  }

  attentionText.textContent = `${Math.max(0, Math.round(state.player.hp))}/${state.player.maxHp}`;
  waveText.textContent = `${state.wave}/${state.maxWave}`;
  focusText.textContent = state.score;
  fatigueText.textContent = `${Math.round(state.player.fatigue)}%`;
}

function render() {
  drawBackground();
  drawSafeZone();
  drawEnemyZone();
  drawPlayer();
  drawBullets();
  drawEnemies();
  drawParticles();
  drawFloatingTexts();
  drawTopHud();

  if (state && state.waveMessageTimer > 0 && !state.pausedForUpgrade) {
    drawWaveMessage();
  }

  if (state && state.skills.pause.active) {
    drawFreezeOverlay();
  }

  if (state && state.skills.focus.active) {
    drawFocusAura();
  }
}

function drawBackground() {
  ctx.clearRect(0, 0, W, H);

  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, "#d7f3cf");
  sky.addColorStop(0.55, "#fff4bf");
  sky.addColorStop(1, "#db896d");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  drawCloud(190, 76, 1);
  drawCloud(780, 94, 0.8);

  ctx.fillStyle = "#6dbb8f";
  drawPine(70, 122, 1.2);
  drawPine(128, 108, 1.55);
  drawPine(870, 120, 1.25);

  ctx.fillStyle = "#8f553e";
  ctx.beginPath();
  ctx.moveTo(0, 406);
  ctx.bezierCurveTo(210, 390, 278, 442, 474, 410);
  ctx.bezierCurveTo(662, 382, 760, 432, 960, 394);
  ctx.lineTo(960, 540);
  ctx.lineTo(0, 540);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgba(87, 44, 34, 0.28)";
  ctx.fillRect(0, 488, W, 52);
}

function drawCloud(x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = "rgba(255, 255, 255, 0.48)";
  ctx.beginPath();
  ctx.arc(-38, 10, 26, 0, Math.PI * 2);
  ctx.arc(-10, 0, 34, 0, Math.PI * 2);
  ctx.arc(28, 12, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPine(x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = "#2d6f5d";
  ctx.beginPath();
  ctx.moveTo(0, -70);
  ctx.lineTo(-48, 16);
  ctx.lineTo(-20, 10);
  ctx.lineTo(-60, 74);
  ctx.lineTo(60, 74);
  ctx.lineTo(20, 10);
  ctx.lineTo(48, 16);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#6f4a2d";
  ctx.fillRect(-8, 60, 16, 46);
  ctx.restore();
}

function drawSafeZone() {
  ctx.fillStyle = "rgba(223, 255, 213, 0.52)";
  ctx.fillRect(0, 0, 276, H);

  ctx.strokeStyle = "rgba(23, 48, 44, 0.16)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(276, 0);
  ctx.lineTo(276, H);
  ctx.stroke();
}

function drawEnemyZone() {
  ctx.fillStyle = "rgba(255, 79, 94, 0.78)";
  roundRect(ctx, 650, 118, 275, 236, 26, true, false);
  ctx.fillStyle = "rgba(170, 26, 41, 0.25)";
  ctx.fillRect(650, 305, 275, 49);
}

function drawPlayer() {
  if (!state) {
    return;
  }

  const p = state.player;

  ctx.save();
  ctx.translate(p.x, p.y);

  ctx.fillStyle = "rgba(20, 34, 32, 0.25)";
  ctx.beginPath();
  ctx.ellipse(0, 55, 54, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#fff2ca";
  ctx.strokeStyle = "#17302c";
  ctx.lineWidth = 5;

  ctx.beginPath();
  ctx.roundRect(-42, -72, 84, 128, 42);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#fff2ca";
  ctx.beginPath();
  ctx.moveTo(-28, -62);
  ctx.lineTo(-42, -94);
  ctx.lineTo(-10, -70);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(28, -62);
  ctx.lineTo(42, -94);
  ctx.lineTo(10, -70);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#18342f";
  ctx.beginPath();
  ctx.arc(-16, -20, 5, 0, Math.PI * 2);
  ctx.arc(16, -20, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#18342f";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, -4, 13, 0.18, Math.PI - 0.18);
  ctx.stroke();

  ctx.fillStyle = "#69b7ff";
  ctx.strokeStyle = "#17302c";
  ctx.lineWidth = 4;
  roundRect(ctx, -34, -42, 68, 20, 10, true, true);

  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.fillRect(-23, -38, 22, 6);

  drawBlaster(38, -4);

  ctx.restore();

  drawHpBar(p.x - 52, p.y - 100, 104, 15, p.hp, p.maxHp, "#63d99d");
}

function drawBlaster(x, y) {
  ctx.save();
  ctx.translate(x, y);

  ctx.fillStyle = "#302b2d";
  ctx.strokeStyle = "#17302c";
  ctx.lineWidth = 4;
  roundRect(ctx, 0, -14, 94, 24, 8, true, true);

  ctx.fillStyle = "#8c6b4a";
  roundRect(ctx, 14, -20, 50, 16, 7, true, true);

  ctx.fillStyle = "#ff4f5e";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-52, -24);
  ctx.lineTo(-50, 26);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#17302c";
  roundRect(ctx, 20, 9, 16, 46, 5, true, true);
  roundRect(ctx, 74, 5, 16, 34, 5, true, true);

  ctx.fillStyle = "#d6c09a";
  roundRect(ctx, 90, -18, 100, 14, 6, true, true);

  ctx.restore();
}

function drawEnemies() {
  if (!state) {
    return;
  }

  for (const e of state.enemies) {
    ctx.save();
    ctx.translate(e.x, e.y);

    ctx.fillStyle = "rgba(20, 34, 32, 0.22)";
    ctx.beginPath();
    ctx.ellipse(0, e.radius + 14, e.radius * 1.12, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = e.color;
    ctx.strokeStyle = "#17302c";
    ctx.lineWidth = 4;
    roundRect(ctx, -e.radius, -e.radius, e.radius * 2, e.radius * 2, 18, true, true);

    ctx.font = `${e.type === "boss" ? 46 : 30}px system-ui`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(e.emoji, 0, 0);

    if (e.type === "sludge") {
      ctx.strokeStyle = "rgba(255,255,255,0.7)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-e.radius + 10, 0);
      ctx.lineTo(e.radius - 10, 0);
      ctx.stroke();

      ctx.font = "11px Nunito";
      ctx.fillStyle = "#17302c";
      ctx.fillText("GAMEPLAY", 0, e.radius * 0.45);
    }

    if (e.type === "ad" && e.x < 760) {
      ctx.font = "900 13px Nunito";
      ctx.fillStyle = "#17302c";
      ctx.fillText("AD", 0, e.radius + 18);
    }

    ctx.restore();

    drawHpBar(e.x - e.radius, e.y - e.radius - 18, e.radius * 2, 10, e.hp, e.maxHp, e.color);
  }
}

function drawBullets() {
  if (!state) {
    return;
  }

  for (const b of state.bullets) {
    ctx.fillStyle = b.color;
    ctx.strokeStyle = "#17302c";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.globalAlpha = 0.25;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius * 2.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function drawParticles() {
  if (!state) {
    return;
  }

  for (const p of state.particles) {
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function drawFloatingTexts() {
  if (!state) {
    return;
  }

  for (const f of state.floatingTexts) {
    ctx.globalAlpha = Math.max(0, f.life);
    ctx.font = "900 20px Baloo 2";
    ctx.textAlign = "center";
    ctx.lineWidth = 5;
    ctx.strokeStyle = "white";
    ctx.strokeText(f.text, f.x, f.y);
    ctx.fillStyle = f.color;
    ctx.fillText(f.text, f.x, f.y);
    ctx.globalAlpha = 1;
  }
}

function drawTopHud() {
  if (!state) {
    return;
  }

  ctx.save();
  ctx.fillStyle = "rgba(255, 251, 231, 0.86)";
  ctx.strokeStyle = "rgba(23,48,44,0.18)";
  ctx.lineWidth = 4;
  roundRect(ctx, 300, 20, 360, 64, 24, true, true);

  const stats = [
    { icon: "🎯", label: Math.round(state.player.damage), x: 350 },
    { icon: "◎", label: `${Math.round(state.player.accuracy * 100)}%`, x: 430 },
    { icon: "CRIT", label: `${Math.round(state.player.crit * 100)}%`, x: 512 },
    { icon: "🔥", label: state.skills.focus.active ? "200%" : "100%", x: 592 }
  ];

  for (const s of stats) {
    ctx.textAlign = "center";
    ctx.fillStyle = "#257260";
    ctx.font = s.icon === "CRIT" ? "900 16px Nunito" : "24px system-ui";
    ctx.fillText(s.icon, s.x, 45);
    ctx.font = "900 18px Nunito";
    ctx.fillText(s.label, s.x, 68);
  }

  ctx.restore();
}

function drawWaveMessage() {
  const names = [
    "",
    "Wave 1: Curiosidad",
    "Wave 2: Solo un video más",
    "Wave 3: Dopamine Loop",
    "Wave 4: Sludge Storm",
    "Wave 5: Infinite Scroll"
  ];

  ctx.save();
  ctx.textAlign = "center";
  ctx.font = "900 48px Baloo 2";
  ctx.lineWidth = 8;
  ctx.strokeStyle = "white";
  ctx.fillStyle = "#17302c";
  ctx.strokeText(names[state.wave] || `Wave ${state.wave}`, W / 2, 132);
  ctx.fillText(names[state.wave] || `Wave ${state.wave}`, W / 2, 132);
  ctx.restore();
}

function drawFreezeOverlay() {
  ctx.save();
  ctx.fillStyle = "rgba(183, 157, 255, 0.18)";
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "rgba(255,255,255,0.45)";
  ctx.lineWidth = 3;

  for (let i = 0; i < 18; i++) {
    const x = (i * 89 + state.time * 25) % W;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x - 80, H);
    ctx.stroke();
  }

  ctx.restore();
}

function drawFocusAura() {
  const p = state.player;

  ctx.save();
  ctx.globalAlpha = 0.32 + Math.sin(state.time * 8) * 0.08;
  ctx.fillStyle = "#69b7ff";
  ctx.beginPath();
  ctx.arc(p.x, p.y, 72, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawHpBar(x, y, width, height, hp, maxHp, color) {
  ctx.save();

  ctx.fillStyle = "#17302c";
  roundRect(ctx, x, y, width, height, 4, true, false);

  ctx.fillStyle = "#fffbe7";
  roundRect(ctx, x + 2, y + 2, width - 4, height - 4, 3, true, false);

  ctx.fillStyle = color;
  const pct = Math.max(0, Math.min(1, hp / maxHp));
  roundRect(ctx, x + 2, y + 2, (width - 4) * pct, height - 4, 3, true, false);

  ctx.restore();
}

function burst(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = randomRange(40, 190);

    state.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: randomRange(2, 6),
      color,
      life: randomRange(0.35, 0.9)
    });
  }
}

function addFloatingText(text, x, y, color) {
  state.floatingTexts.push({
    text,
    x,
    y,
    color,
    life: 1
  });
}

function roundRect(context, x, y, width, height, radius, fill, stroke) {
  if (context.roundRect) {
    context.beginPath();
    context.roundRect(x, y, width, height, radius);

    if (fill) {
      context.fill();
    }

    if (stroke) {
      context.stroke();
    }

    return;
  }

  const r = Math.min(radius, width / 2, height / 2);

  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.arcTo(x, y, x + width, y, r);
  context.closePath();

  if (fill) {
    context.fill();
  }

  if (stroke) {
    context.stroke();
  }
}

function distance(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}

function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}

canvas.addEventListener("pointermove", (event) => {
  const rect = canvas.getBoundingClientRect();

  mouse.x = ((event.clientX - rect.left) / rect.width) * W;
  mouse.y = ((event.clientY - rect.top) / rect.height) * H;
});

canvas.addEventListener("pointerdown", (event) => {
  const rect = canvas.getBoundingClientRect();

  mouse.x = ((event.clientX - rect.left) / rect.width) * W;
  mouse.y = ((event.clientY - rect.top) / rect.height) * H;
  mouse.down = true;

  if (state && state.running && !state.pausedForUpgrade) {
    shootAt(mouse.x, mouse.y);
  }
});

canvas.addEventListener("pointerup", () => {
  mouse.down = false;
});

window.addEventListener("keydown", (event) => {
  keys[event.key] = true;

  if (event.key === "1") {
    useSkill("focus");
  }

  if (event.key === "2") {
    useSkill("pause");
  }

  if (event.key === "3") {
    useSkill("airplane");
  }
});

window.addEventListener("keyup", (event) => {
  keys[event.key] = false;
});

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);
abilityFocus.addEventListener("click", () => useSkill("focus"));
abilityPause.addEventListener("click", () => useSkill("pause"));
abilityAirplane.addEventListener("click", () => useSkill("airplane"));

resetGame();
render();
