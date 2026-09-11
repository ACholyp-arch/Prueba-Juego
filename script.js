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
const killsText = document.getElementById("killsText");
const focusText = document.getElementById("focusText");

const dopamineText = document.getElementById("dopamineText");
const dopamineBar = document.getElementById("dopamineBar");
const dopamineStatus = document.getElementById("dopamineStatus");

const fatigueText = document.getElementById("fatigueText");
const fatigueBar = document.getElementById("fatigueBar");
const fatigueStatus = document.getElementById("fatigueStatus");

const abilityDopamine = document.getElementById("abilityDopamine");
const abilityMindfulness = document.getElementById("abilityMindfulness");
const abilitySelective = document.getElementById("abilitySelective");

const W = canvas.width;
const H = canvas.height;

const waveTargets = [20, 25, 30, 35, 50];

let state;
let lastTime = 0;
let animationId = null;

const scenes = [
  {
    name: "Curiosidad",
    sky: ["#d7f3cf", "#fff4bf", "#db896d"],
    ground: "#8f553e",
    zone: "rgba(255, 79, 94, 0.72)",
    props: "forest"
  },
  {
    name: "Solo un video más",
    sky: ["#b9d7ff", "#f9d6ff", "#2d325f"],
    ground: "#50334f",
    zone: "rgba(183, 157, 255, 0.74)",
    props: "bedroom"
  },
  {
    name: "Dopamine Loop",
    sky: ["#c2f5ff", "#fff1c4", "#ffb48f"],
    ground: "#7f5a36",
    zone: "rgba(255, 159, 28, 0.76)",
    props: "campus"
  },
  {
    name: "Sludge Storm",
    sky: ["#e7f0ff", "#d8c2ff", "#593b7a"],
    ground: "#4b355f",
    zone: "rgba(105, 183, 255, 0.76)",
    props: "neon"
  },
  {
    name: "Infinite Scroll",
    sky: ["#1b203a", "#4b2b6f", "#ff4f5e"],
    ground: "#251d2b",
    zone: "rgba(255, 79, 94, 0.82)",
    props: "glitch"
  }
];

const enemyTypes = {
  reel: {
    label: "Reel veloz",
    emoji: "📱",
    hp: 34,
    speed: 54,
    damage: 8,
    reward: 6,
    dopamine: 5,
    color: "#69b7ff"
  },
  notify: {
    label: "Notificación",
    emoji: "🔔",
    hp: 28,
    speed: 90,
    damage: 10,
    reward: 7,
    dopamine: 7,
    color: "#ff4f5e"
  },
  sludge: {
    label: "Sludge content",
    emoji: "🧩",
    hp: 68,
    speed: 38,
    damage: 15,
    reward: 12,
    dopamine: 10,
    color: "#b79dff"
  },
  ad: {
    label: "Anuncio disfrazado",
    emoji: "🎯",
    hp: 54,
    speed: 48,
    damage: 13,
    reward: 10,
    dopamine: 9,
    color: "#ffd166"
  },
  doomscroll: {
    label: "Doomscroll",
    emoji: "🌀",
    hp: 82,
    speed: 34,
    damage: 18,
    reward: 14,
    dopamine: 12,
    color: "#ff8fab"
  },
  boss: {
    label: "Infinite Scroll",
    emoji: "♾️",
    hp: 520,
    speed: 20,
    damage: 34,
    reward: 80,
    dopamine: 18,
    color: "#ff8fab"
  }
};

const upgrades = [
  {
    emoji: "🎯",
    title: "Atención selectiva",
    text: "+10% precisión y +5% crítico.",
    apply: () => {
      state.player.accuracy = Math.min(0.98, state.player.accuracy + 0.1);
      state.player.crit = Math.min(0.55, state.player.crit + 0.05);
    }
  },
  {
    emoji: "🛑",
    title: "Control inhibitorio",
    text: "Ralentiza enemigos y reduce daño de notificaciones.",
    apply: () => {
      state.mods.enemySlow += 0.07;
      state.mods.notificationDamageReduction += 2;
    }
  },
  {
    emoji: "🧠",
    title: "Memoria de trabajo",
    text: "+18 atención máxima y curación parcial.",
    apply: () => {
      state.player.maxHp += 18;
      state.player.hp = Math.min(state.player.maxHp, state.player.hp + 24);
    }
  },
  {
    emoji: "🌬️",
    title: "Mindfulness",
    text: "-28 fatiga y más resistencia al bajón.",
    apply: () => {
      state.player.fatigue = Math.max(0, state.player.fatigue - 28);
      state.mods.fatigueResistance += 0.08;
    }
  },
  {
    emoji: "📵",
    title: "Higiene digital",
    text: "Menos notificaciones y anuncios.",
    apply: () => {
      state.mods.cleanFeed += 1;
    }
  },
  {
    emoji: "🍃",
    title: "Descanso visual",
    text: "Recupera atención, baja fatiga y estabiliza dopamina.",
    apply: () => {
      state.player.hp = Math.min(state.player.maxHp, state.player.hp + 22);
      state.player.fatigue = Math.max(0, state.player.fatigue - 18);
      state.player.dopamine = Math.max(0, state.player.dopamine - 20);
    }
  },
  {
    emoji: "⚡",
    title: "Burst de dopamina",
    text: "Más daño y disparo rápido, pero sube el riesgo de bajón.",
    apply: () => {
      state.player.damage += 5;
      state.player.dopamine = Math.min(100, state.player.dopamine + 25);
      triggerDopamineRush(3.2, true);
    }
  },
  {
    emoji: "💤",
    title: "Sueño REM",
    text: "Reduce fatiga y mejora recuperación.",
    apply: () => {
      state.player.fatigue = Math.max(0, state.player.fatigue - 34);
      state.mods.recovery += 0.04;
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
    score: 0,
    time: 0,
    spawnTimer: 0,
    spawnedThisWave: 0,
    killedThisWave: 0,
    waveMessageTimer: 2.4,
    bullets: [],
    enemies: [],
    particles: [],
    floatingTexts: [],
    consumables: [],
    consumableTimer: 4,
    delayedFatigue: [],
    player: {
      x: 118,
      y: H / 2 + 24,
      radius: 42,
      hp: 115,
      maxHp: 115,
      damage: 24,
      crit: 0.12,
      accuracy: 0.84,
      baseFireRate: 0.52,
      fireCooldown: 0,
      dopamine: 0,
      dopamineRushTimer: 0,
      dopamineCrashTimer: 0,
      fatigue: 0
    },
    skills: {
      dopamine: { ready: true, active: false, timer: 0, cooldown: 0 },
      mindfulness: { ready: true, active: false, timer: 0, cooldown: 0 },
      selective: { ready: true, active: false, timer: 0, cooldown: 0 }
    },
    mods: {
      enemySlow: 0,
      notificationDamageReduction: 0,
      fatigueResistance: 0,
      cleanFeed: 0,
      recovery: 0
    }
  };

  updateHUD();
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
  state.spawnTimer -= dt;
  state.waveMessageTimer -= dt;
  state.player.fireCooldown -= dt;

  updateSkills(dt);
  updateDopamineAndFatigue(dt);
  updateDelayedFatigue(dt);
  spawnEnemies(dt);
  updateEnemies(dt);
  updateBullets(dt);
  updateConsumables(dt);
  updateParticles(dt);
  updateFloatingTexts(dt);

  if (state.killedThisWave >= getWaveTarget()) {
    clearWave();
  }

  if (state.player.hp <= 0) {
    loseGame("Tu atención llegó a cero.");
  }

  if (state.player.fatigue >= 100) {
    loseGame("La fatiga mental llegó al tope.");
  }

  updateHUD();
}

function clearWave() {
  state.enemies = [];
  state.bullets = [];
  state.consumables = [];

  if (state.wave >= waveTargets.length) {
    winGame();
    return;
  }

  openUpgradeScreen();
}

function getWaveTarget() {
  return waveTargets[state.wave - 1];
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

    if (skill.active) {
      skill.timer -= dt;

      if (skill.timer <= 0) {
        skill.active = false;
      }
    }
  }

  abilityDopamine.disabled = !state.skills.dopamine.ready;
  abilityMindfulness.disabled = !state.skills.mindfulness.ready;
  abilitySelective.disabled = !state.skills.selective.ready;
}

function updateDopamineAndFatigue(dt) {
  const p = state.player;
  const resistance = Math.min(0.45, state.mods.fatigueResistance);

  if (p.dopamineRushTimer > 0) {
    p.dopamineRushTimer -= dt;
    p.dopamine = Math.max(0, p.dopamine - 4 * dt);

    const fatigueGain = (2.8 + p.dopamine * 0.022) * (1 - resistance);
    p.fatigue = Math.min(100, p.fatigue + fatigueGain * dt);

    if (p.dopamineRushTimer <= 0) {
      p.dopamineCrashTimer = Math.max(p.dopamineCrashTimer, 4.2);
      queueFatigue(14, 1.4, "bajón dopaminérgico");
    }
  } else if (p.dopamineCrashTimer > 0) {
    p.dopamineCrashTimer -= dt;
    p.dopamine = Math.max(0, p.dopamine - 9 * dt);
    p.fatigue = Math.min(100, p.fatigue + 1.8 * (1 - resistance) * dt);
  } else {
    p.dopamine = Math.max(0, p.dopamine - 7 * dt);
    p.fatigue = Math.max(0, p.fatigue - (0.55 + state.mods.recovery) * dt);
  }

  if (p.dopamine >= 72 && p.dopamineRushTimer <= 0 && p.dopamineCrashTimer <= 0) {
    triggerDopamineRush(4.8, false);
  }
}

function updateDelayedFatigue(dt) {
  for (let i = state.delayedFatigue.length - 1; i >= 0; i--) {
    const item = state.delayedFatigue[i];
    item.timer -= dt;

    if (item.timer <= 0) {
      state.player.fatigue = Math.min(100, state.player.fatigue + item.amount);
      addFloatingText(`+${item.amount} fatiga: ${item.label}`, state.player.x + 120, state.player.y - 88, "#ff4f5e");
      state.delayedFatigue.splice(i, 1);
    }
  }
}

function queueFatigue(amount, timer, label) {
  state.delayedFatigue.push({ amount, timer, label });
}

function triggerDopamineRush(seconds, forced) {
  state.player.dopamineCrashTimer = 0;
  state.player.dopamineRushTimer = Math.max(state.player.dopamineRushTimer, seconds);

  if (forced) {
    addFloatingText("BURST DE DOPAMINA", state.player.x + 120, state.player.y - 80, "#ff9f1c");
  } else {
    addFloatingText("DOPAMINA ALTA", state.player.x + 120, state.player.y - 80, "#ff9f1c");
  }
}

function spawnEnemies(dt) {
  if (state.spawnedThisWave >= getWaveTarget()) {
    return;
  }

  if (state.spawnTimer > 0) {
    return;
  }

  const type = chooseEnemyType();
  spawnEnemy(type);
  state.spawnedThisWave++;

  const baseDelay = Math.max(0.28, 0.9 - state.wave * 0.06);
  state.spawnTimer = baseDelay + Math.random() * 0.35;
}

function chooseEnemyType() {
  const wave = state.wave;

  if (wave === 5 && state.spawnedThisWave === getWaveTarget() - 1) {
    return "boss";
  }

  const pool = ["reel", "reel", "reel"];

  if (wave >= 2 && state.mods.cleanFeed < 2) {
    pool.push("notify", "notify");
  } else if (wave >= 2) {
    pool.push("notify");
  }

  if (wave >= 3) {
    pool.push("sludge");
  }

  if (wave >= 4 && state.mods.cleanFeed < 1) {
    pool.push("ad", "ad");
  } else if (wave >= 4) {
    pool.push("ad");
  }

  if (wave >= 5) {
    pool.push("doomscroll", "doomscroll");
  }

  return pool[Math.floor(Math.random() * pool.length)];
}

function spawnEnemy(type) {
  const base = enemyTypes[type];
  const scale = 1 + (state.wave - 1) * 0.17;
  const isBoss = type === "boss";

  const enemy = {
    type,
    label: base.label,
    emoji: base.emoji,
    x: W + (isBoss ? 90 : 40),
    y: 112 + Math.random() * 318,
    radius: isBoss ? 54 : 29 + Math.random() * 8,
    hp: base.hp * scale,
    maxHp: base.hp * scale,
    speed: base.speed * (1 + (state.wave - 1) * 0.075),
    damage: Math.max(2, base.damage - (type === "notify" ? state.mods.notificationDamageReduction : 0)),
    reward: base.reward,
    dopamine: base.dopamine,
    color: base.color,
    wobble: Math.random() * Math.PI * 2
  };

  state.enemies.push(enemy);
}

function updateEnemies(dt) {
  const mindfulnessSlow = state.skills.mindfulness.active ? 0.62 : 1;
  const slow = Math.max(0.45, 1 - state.mods.enemySlow) * mindfulnessSlow;

  for (let i = state.enemies.length - 1; i >= 0; i--) {
    const e = state.enemies[i];

    e.wobble += dt * 4;
    e.x -= e.speed * slow * dt;
    e.y += Math.sin(e.wobble) * dt * 12;

    if (e.x < state.player.x + state.player.radius) {
      state.player.hp -= e.damage;
      state.player.fatigue = Math.min(100, state.player.fatigue + 7);
      state.spawnedThisWave = Math.max(0, state.spawnedThisWave - 1);
      burst(e.x, e.y, e.color, 14);
      addFloatingText(`-${e.damage} atención`, state.player.x + 20, state.player.y - 72, "#ff4f5e");
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

    if (b.life <= 0 || b.x > W + 70 || b.y < -70 || b.y > H + 70) {
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
          defeatEnemy(e, j);
        }

        break;
      }
    }
  }
}

function defeatEnemy(enemy, index) {
  state.score += enemy.reward;
  state.killedThisWave = Math.min(getWaveTarget(), state.killedThisWave + 1);
  state.player.dopamine = Math.min(100, state.player.dopamine + enemy.dopamine);
  state.player.fatigue = Math.min(
    100,
    state.player.fatigue + (enemy.type === "sludge" ? 1.8 : 0.8)
  );

  burst(enemy.x, enemy.y, enemy.color, 28);
  addFloatingText(`${state.killedThisWave}/${getWaveTarget()}`, enemy.x, enemy.y, "#257260");
  state.enemies.splice(index, 1);
}

function updateConsumables(dt) {
  state.consumableTimer -= dt;

  if (state.consumableTimer <= 0) {
    spawnConsumable();
    state.consumableTimer = randomRange(7, 12);
  }

  for (let i = state.consumables.length - 1; i >= 0; i--) {
    const c = state.consumables[i];
    c.life -= dt;
    c.float += dt;

    if (c.life <= 0) {
      state.consumables.splice(i, 1);
    }
  }
}

function spawnConsumable() {
  if (state.consumables.length >= 3) {
    return;
  }

  const isCoffee = Math.random() < 0.58;

  state.consumables.push({
    type: isCoffee ? "coffee" : "redbull",
    emoji: isCoffee ? "☕" : "🥤",
    label: isCoffee ? "Café" : "Red Bull",
    x: randomRange(330, 800),
    y: randomRange(92, 408),
    radius: isCoffee ? 28 : 31,
    life: isCoffee ? 8 : 7,
    float: Math.random() * Math.PI * 2
  });
}

function consumeAt(x, y) {
  for (let i = state.consumables.length - 1; i >= 0; i--) {
    const c = state.consumables[i];

    if (distance(x, y, c.x, c.y) <= c.radius + 10) {
      if (c.type === "coffee") {
        state.player.fatigue = Math.max(0, state.player.fatigue - 18);
        state.player.dopamine = Math.min(100, state.player.dopamine + 6);
        queueFatigue(8, 7, "café");
        addFloatingText("☕ -18 fatiga", c.x, c.y - 30, "#257260");
      } else {
        state.player.fatigue = Math.max(0, state.player.fatigue - 30);
        state.player.dopamine = Math.min(100, state.player.dopamine + 22);
        triggerDopamineRush(2.8, true);
        queueFatigue(18, 8.5, "Red Bull");
        addFloatingText("🥤 -30 fatiga", c.x, c.y - 30, "#257260");
      }

      burst(c.x, c.y, c.type === "coffee" ? "#8f553e" : "#69b7ff", 22);
      state.consumables.splice(i, 1);
      return true;
    }
  }

  return false;
}

function tryShoot(tx, ty) {
  if (!state || !state.running || state.pausedForUpgrade || state.gameOver) {
    return;
  }

  if (consumeAt(tx, ty)) {
    return;
  }

  if (state.player.fireCooldown > 0) {
    addFloatingText("espera", state.player.x + 88, state.player.y - 58, "#3f625a");
    return;
  }

  shootAt(tx, ty);
  state.player.fireCooldown = getFireInterval();
}

function getFireInterval() {
  const p = state.player;
  let interval = p.baseFireRate;

  if (p.dopamineRushTimer > 0) {
    interval *= 0.52;
  }

  if (p.dopamineCrashTimer > 0) {
    interval *= 1.65;
  }

  if (state.skills.selective.active) {
    interval *= 0.82;
  }

  return Math.max(0.16, interval);
}

function shootAt(tx, ty) {
  const p = state.player;
  const selective = state.skills.selective.active;
  const dopamineBoost = p.dopamineRushTimer > 0 ? 1.35 : 1;
  const damage = p.damage * dopamineBoost * (selective ? 1.18 : 1);
  const accuracy = Math.min(0.99, p.accuracy + (selective ? 0.12 : 0));
  const missed = Math.random() > accuracy;
  const critChance = Math.min(0.75, p.crit + (selective ? 0.15 : 0));
  const crit = Math.random() < critChance;
  const finalDamage = damage * (crit ? 1.85 : 1);

  const startX = p.x + 38;
  const startY = p.y - 4;
  const spread = missed ? randomRange(-190, 190) : randomRange(-20, 20);
  const angle = Math.atan2(ty + spread - startY, tx - startX);
  const speed = missed ? 520 : 680;

  state.bullets.push({
    x: startX,
    y: startY,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    radius: crit ? 8 : 6,
    damage: finalDamage,
    crit,
    color: crit ? "#ff4f5e" : "#69b7ff",
    life: 1.3
  });
}

function useSkill(name) {
  if (!state || !state.running || state.pausedForUpgrade || state.gameOver) {
    return;
  }

  const skill = state.skills[name];

  if (!skill || !skill.ready) {
    return;
  }

  if (name === "dopamine") {
    skill.active = true;
    skill.timer = 4.5;
    skill.cooldown = 20;
    state.player.dopamine = Math.min(100, state.player.dopamine + 42);
    triggerDopamineRush(4.5, true);
    queueFatigue(18, 5.7, "Burst de dopamina");
  }

  if (name === "mindfulness") {
    skill.active = true;
    skill.timer = 5;
    skill.cooldown = 19;
    state.player.fatigue = Math.max(0, state.player.fatigue - 24);
    state.player.dopamine = Math.max(0, state.player.dopamine - 18);
    addFloatingText("MINDFULNESS", state.player.x + 100, state.player.y - 86, "#63d99d");
  }

  if (name === "selective") {
    skill.active = true;
    skill.timer = 6;
    skill.cooldown = 18;
    addFloatingText("ATENCIÓN SELECTIVA", state.player.x + 130, state.player.y - 60, "#69b7ff");
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
      state.spawnedThisWave = 0;
      state.killedThisWave = 0;
      state.spawnTimer = 0.5;
      state.waveMessageTimer = 2.4;
      state.running = true;
      state.pausedForUpgrade = false;
      upgradeScreen.classList.add("hidden");
      lastTime = performance.now();
      animationId = requestAnimationFrame(loop);
    });

    upgradeCards.appendChild(btn);
  }

  updateHUD();
  upgradeScreen.classList.remove("hidden");
}

function winGame() {
  state.gameOver = true;
  state.victory = true;

  endGame(
    "✨",
    "Recuperaste tu atención",
    `Superaste las 5 oleadas del Neuroscrolling. Puntaje final: ${state.score}.`
  );
}

function loseGame(reason) {
  if (state.gameOver) {
    return;
  }

  state.gameOver = true;
  state.victory = false;

  endGame(
    "📱",
    "Game Over",
    `${reason} Llegaste a la oleada ${state.wave} con ${state.killedThisWave}/${getWaveTarget()} estímulos eliminados. Puntaje: ${state.score}.`
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

  const p = state.player;

  attentionText.textContent = `${Math.max(0, Math.round(p.hp))}/${p.maxHp}`;
  waveText.textContent = `${state.wave}/${waveTargets.length}`;
  killsText.textContent = `${state.killedThisWave}/${getWaveTarget()}`;
  focusText.textContent = state.score;

  dopamineText.textContent = `${Math.round(p.dopamine)}%`;
  fatigueText.textContent = `${Math.round(p.fatigue)}%`;

  dopamineBar.style.width = `${clamp(p.dopamine, 0, 100)}%`;
  fatigueBar.style.width = `${clamp(p.fatigue, 0, 100)}%`;

  if (p.dopamineRushTimer > 0) {
    dopamineStatus.textContent = "Pico: disparo rápido";
  } else if (p.dopamineCrashTimer > 0) {
    dopamineStatus.textContent = "Bajón: disparo lento";
  } else {
    dopamineStatus.textContent = "Estable";
  }

  if (p.fatigue >= 80) {
    fatigueStatus.textContent = "Riesgo alto";
  } else if (p.fatigue >= 55) {
    fatigueStatus.textContent = "Sobrecarga";
  } else {
    fatigueStatus.textContent = "Controlada";
  }
}

function render() {
  drawBackground();
  drawSafeZone();
  drawEnemyZone();
  drawPlayer();
  drawBullets();
  drawEnemies();
  drawConsumables();
  drawParticles();
  drawFloatingTexts();
  drawCanvasHud();

  if (state && state.waveMessageTimer > 0 && !state.pausedForUpgrade) {
    drawWaveMessage();
  }

  if (state && state.skills.mindfulness.active) {
    drawMindfulnessOverlay();
  }

  if (state && state.skills.selective.active) {
    drawSelectiveOverlay();
  }

  if (state && state.player.dopamineRushTimer > 0) {
    drawDopamineAura();
  }

  if (state && state.player.dopamineCrashTimer > 0) {
    drawCrashOverlay();
  }
}

function drawBackground() {
  const scene = scenes[(state?.wave || 1) - 1] || scenes[0];

  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, scene.sky[0]);
  sky.addColorStop(0.55, scene.sky[1]);
  sky.addColorStop(1, scene.sky[2]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  if (scene.props === "forest") {
    drawCloud(190, 76, 1);
    drawCloud(780, 94, 0.8);
    drawPine(70, 122, 1.2);
    drawPine(128, 108, 1.55);
    drawPine(870, 120, 1.25);
  }

  if (scene.props === "bedroom") {
    drawMoon(810, 80);
    drawBed(680, 330);
    drawStars();
  }

  if (scene.props === "campus") {
    drawCloud(170, 75, 1);
    drawCampus(710, 280);
  }

  if (scene.props === "neon") {
    drawNeonGrid();
  }

  if (scene.props === "glitch") {
    drawGlitches();
  }

  ctx.fillStyle = scene.ground;
  ctx.beginPath();
  ctx.moveTo(0, 406);
  ctx.bezierCurveTo(210, 390, 278, 442, 474, 410);
  ctx.bezierCurveTo(662, 382, 760, 432, 960, 394);
  ctx.lineTo(960, 540);
  ctx.lineTo(0, 540);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgba(20, 20, 20, 0.2)";
  ctx.fillRect(0, 488, W, 52);
}

function drawCloud(x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
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

function drawMoon(x, y) {
  ctx.fillStyle = "rgba(255,255,220,0.85)";
  ctx.beginPath();
  ctx.arc(x, y, 36, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(185,215,255,0.9)";
  ctx.beginPath();
  ctx.arc(x + 14, y - 7, 34, 0, Math.PI * 2);
  ctx.fill();
}

function drawStars() {
  ctx.fillStyle = "rgba(255,255,255,0.85)";

  for (let i = 0; i < 26; i++) {
    const x = (i * 73) % W;
    const y = 26 + ((i * 41) % 160);
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBed(x, y) {
  ctx.fillStyle = "rgba(255, 251, 231, 0.85)";
  roundRect(ctx, x, y, 190, 68, 18, true, false);

  ctx.fillStyle = "#69b7ff";
  roundRect(ctx, x + 12, y + 10, 72, 34, 14, true, false);

  ctx.fillStyle = "#18342f";
  ctx.fillRect(x - 4, y + 58, 204, 12);
}

function drawCampus(x, y) {
  ctx.fillStyle = "rgba(255,251,231,0.85)";
  roundRect(ctx, x, y, 190, 104, 12, true, false);

  ctx.fillStyle = "#ff9f1c";
  ctx.beginPath();
  ctx.moveTo(x - 8, y);
  ctx.lineTo(x + 95, y - 54);
  ctx.lineTo(x + 198, y);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#18342f";

  for (let i = 0; i < 4; i++) {
    ctx.fillRect(x + 26 + i * 38, y + 32, 18, 34);
  }
}

function drawNeonGrid() {
  ctx.strokeStyle = "rgba(105,183,255,0.28)";
  ctx.lineWidth = 2;

  for (let x = 320; x < W; x += 52) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x - 130, H);
    ctx.stroke();
  }

  for (let y = 80; y < H; y += 46) {
    ctx.beginPath();
    ctx.moveTo(280, y);
    ctx.lineTo(W, y + 20);
    ctx.stroke();
  }
}

function drawGlitches() {
  for (let i = 0; i < 24; i++) {
    ctx.fillStyle = i % 2 === 0 ? "rgba(255,79,94,0.26)" : "rgba(105,183,255,0.22)";
    ctx.fillRect((i * 91) % W, 40 + ((i * 53) % 280), randomRange(40, 110), 7);
  }
}

function drawSafeZone() {
  ctx.fillStyle = "rgba(223, 255, 213, 0.5)";
  ctx.fillRect(0, 0, 276, H);

  ctx.strokeStyle = "rgba(23, 48, 44, 0.16)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(276, 0);
  ctx.lineTo(276, H);
  ctx.stroke();
}

function drawEnemyZone() {
  const scene = scenes[(state?.wave || 1) - 1] || scenes[0];

  ctx.fillStyle = scene.zone;
  roundRect(ctx, 650, 118, 275, 236, 26, true, false);

  ctx.fillStyle = "rgba(0, 0, 0, 0.16)";
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

  roundRect(ctx, -42, -72, 84, 128, 42, true, true);

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

      ctx.font = "900 10px Nunito";
      ctx.fillStyle = "#17302c";
      ctx.fillText("GAMEPLAY", 0, e.radius * 0.48);
    }

    if (e.type === "ad" && e.x < 780) {
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

function drawConsumables() {
  if (!state) {
    return;
  }

  for (const c of state.consumables) {
    const bob = Math.sin(c.float * 4) * 4;

    ctx.save();
    ctx.translate(c.x, c.y + bob);

    ctx.fillStyle = "rgba(255,255,255,0.82)";
    ctx.strokeStyle = "#17302c";
    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.arc(0, 0, c.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.font = `${c.type === "coffee" ? 28 : 30}px system-ui`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(c.emoji, 0, 0);

    ctx.font = "900 12px Nunito";
    ctx.fillStyle = "#17302c";
    ctx.fillText(c.label, 0, c.radius + 18);

    ctx.restore();
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

function drawCanvasHud() {
  if (!state) {
    return;
  }

  ctx.save();

  ctx.fillStyle = "rgba(255, 251, 231, 0.88)";
  ctx.strokeStyle = "rgba(23,48,44,0.2)";
  ctx.lineWidth = 4;
  roundRect(ctx, 300, 20, 390, 66, 24, true, true);

  const cooldown = Math.max(0, state.player.fireCooldown);
  const interval = getFireInterval();
  const readyPct = 1 - clamp(cooldown / interval, 0, 1);

  const stats = [
    { icon: "🎯", label: Math.round(state.player.damage), x: 346 },
    { icon: "◎", label: `${Math.round(state.player.accuracy * 100)}%`, x: 426 },
    { icon: "CRIT", label: `${Math.round(state.player.crit * 100)}%`, x: 510 },
    { icon: "⏱", label: readyPct >= 1 ? "Listo" : `${Math.round(readyPct * 100)}%`, x: 604 }
  ];

  for (const s of stats) {
    ctx.textAlign = "center";
    ctx.fillStyle = "#257260";
    ctx.font = s.icon === "CRIT" ? "900 16px Nunito" : "24px system-ui";
    ctx.fillText(s.icon, s.x, 45);

    ctx.font = "900 17px Nunito";
    ctx.fillText(s.label, s.x, 68);
  }

  ctx.restore();
}

function drawWaveMessage() {
  const scene = scenes[state.wave - 1];

  ctx.save();
  ctx.textAlign = "center";
  ctx.font = "900 47px Baloo 2";
  ctx.lineWidth = 8;
  ctx.strokeStyle = "white";
  ctx.fillStyle = "#17302c";
  ctx.strokeText(`Wave ${state.wave}: ${scene.name}`, W / 2, 132);
  ctx.fillText(`Wave ${state.wave}: ${scene.name}`, W / 2, 132);

  ctx.font = "900 24px Baloo 2";
  ctx.strokeText(`${state.killedThisWave}/${getWaveTarget()} estímulos`, W / 2, 165);
  ctx.fillText(`${state.killedThisWave}/${getWaveTarget()} estímulos`, W / 2, 165);
  ctx.restore();
}

function drawMindfulnessOverlay() {
  ctx.save();
  ctx.fillStyle = "rgba(99, 217, 157, 0.14)";
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "rgba(255,255,255,0.45)";
  ctx.lineWidth = 3;

  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.arc(state.player.x, state.player.y, 82 + i * 32 + Math.sin(state.time * 3) * 4, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

function drawSelectiveOverlay() {
  ctx.save();
  ctx.strokeStyle = "rgba(105,183,255,0.36)";
  ctx.lineWidth = 3;

  for (const e of state.enemies) {
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.radius + 8 + Math.sin(state.time * 8) * 3, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

function drawDopamineAura() {
  const p = state.player;

  ctx.save();
  ctx.globalAlpha = 0.32 + Math.sin(state.time * 8) * 0.08;
  ctx.fillStyle = "#ff9f1c";

  ctx.beginPath();
  ctx.arc(p.x, p.y, 72, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawCrashOverlay() {
  ctx.save();
  ctx.fillStyle = "rgba(40, 40, 55, 0.16)";
  ctx.fillRect(0, 0, W, H);
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

function addFloatingText(text, x, y, color) {
  state.floatingTexts.push({
    text,
    x,
    y,
    color,
    life: 1
  });
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

function getCanvasPoint(event) {
  const rect = canvas.getBoundingClientRect();

  return {
    x: ((event.clientX - rect.left) / rect.width) * W,
    y: ((event.clientY - rect.top) / rect.height) * H
  };
}

function distance(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}

function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}

canvas.addEventListener("pointerdown", (event) => {
  const point = getCanvasPoint(event);
  tryShoot(point.x, point.y);
});

window.addEventListener("keydown", (event) => {
  if (event.key === "1") {
    useSkill("dopamine");
  }

  if (event.key === "2") {
    useSkill("mindfulness");
  }

  if (event.key === "3") {
    useSkill("selective");
  }
});

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);
abilityDopamine.addEventListener("click", () => useSkill("dopamine"));
abilityMindfulness.addEventListener("click", () => useSkill("mindfulness"));
abilitySelective.addEventListener("click", () => useSkill("selective"));

resetGame();
render();
