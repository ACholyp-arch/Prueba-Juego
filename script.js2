@import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700;800&family=Nunito:wght@500;700;900&display=swap');

:root {
  --ink: #17302c;
  --soft-ink: #3f625a;
  --cream: #fffbe7;
  --red: #ff4f5e;
  --orange: #ff9f1c;
  --green: #63d99d;
  --blue: #69b7ff;
  --purple: #b79dff;
  --shadow: rgba(25, 47, 45, 0.24);
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100svh;
  color: var(--ink);
  font-family: "Nunito", system-ui, sans-serif;
  background:
    radial-gradient(circle at 20% 10%, #ffe9a6 0 10rem, transparent 11rem),
    radial-gradient(circle at 84% 14%, #c2f5ff 0 9rem, transparent 10rem),
    linear-gradient(135deg, #e8ffe8, #fff1c4 45%, #cbeef7);
  display: grid;
  place-items: center;
  padding: 16px;
}

.game-shell {
  width: min(1040px, 100%);
}

.hero-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  border: 4px solid rgba(23, 48, 44, 0.12);
  border-radius: 28px;
  background: rgba(255, 251, 231, 0.88);
  box-shadow: 0 14px 0 rgba(23, 48, 44, 0.08), 0 24px 48px var(--shadow);
  backdrop-filter: blur(10px);
  margin-bottom: 14px;
}

.eyebrow {
  margin: 0 0 4px;
  color: #257260;
  text-transform: uppercase;
  font-weight: 900;
  letter-spacing: 0.08em;
  font-size: 0.76rem;
}

h1,
h2 {
  font-family: "Baloo 2", system-ui, sans-serif;
  line-height: 0.95;
  margin: 0;
}

h1 {
  font-size: clamp(2rem, 5.6vw, 4.7rem);
  letter-spacing: -0.04em;
}

h2 {
  font-size: clamp(1.8rem, 4vw, 3.4rem);
}

.subtitle {
  margin: 8px 0 0;
  color: var(--soft-ink);
  font-size: 1rem;
}

.brain-badge {
  width: 76px;
  height: 76px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  font-size: 3rem;
  border-radius: 26px;
  background: #ffffffaa;
  box-shadow: inset 0 -8px 0 rgba(23, 48, 44, 0.08);
}

.canvas-wrap {
  position: relative;
  border: 5px solid #18342f;
  border-radius: 30px;
  overflow: hidden;
  background: #dff7d0;
  box-shadow: 0 14px 0 #18342f, 0 26px 56px var(--shadow);
}

canvas {
  display: block;
  width: 100%;
  height: auto;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
}

.overlay {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 18px;
  background: rgba(24, 44, 40, 0.34);
  backdrop-filter: blur(4px);
}

.overlay.hidden {
  display: none;
}

.panel {
  width: min(520px, 96%);
  text-align: center;
  padding: 24px;
  border: 5px solid #18342f;
  border-radius: 30px;
  background: var(--cream);
  box-shadow: 0 12px 0 #18342f, 0 22px 50px var(--shadow);
}

.panel.wide {
  width: min(820px, 96%);
}

.big-icon {
  font-size: 3.6rem;
  margin-bottom: 6px;
}

.panel p {
  color: var(--soft-ink);
}

.how-to {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 9px;
  margin: 16px 0;
}

.how-to span {
  padding: 10px;
  border: 2px solid rgba(23, 48, 44, 0.14);
  border-radius: 16px;
  background: #fff7d7;
  font-size: 0.88rem;
}

.primary-btn,
.card-btn,
.ability-btn {
  border: 0;
  font-family: "Nunito", system-ui, sans-serif;
  font-weight: 900;
  cursor: pointer;
}

.primary-btn {
  min-width: 180px;
  padding: 14px 22px;
  border-radius: 18px;
  color: white;
  background: var(--red);
  font-size: 1.12rem;
  box-shadow: 0 8px 0 #b52c38;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}

.primary-btn:hover,
.card-btn:hover,
.ability-btn:hover {
  transform: translateY(-2px);
}

.primary-btn:active {
  transform: translateY(6px);
  box-shadow: 0 2px 0 #b52c38;
}

.meter-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 22px;
}

.meter-card,
.stat-card,
.ability-btn {
  border: 3px solid rgba(23, 48, 44, 0.14);
  border-radius: 20px;
  background: rgba(255, 251, 231, 0.92);
  box-shadow: 0 8px 0 rgba(23, 48, 44, 0.08);
}

.meter-card {
  padding: 12px 14px;
}

.meter-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.meter-label span {
  color: var(--soft-ink);
  font-weight: 900;
}

.meter-label strong {
  font-family: "Baloo 2", system-ui, sans-serif;
  font-size: 1.55rem;
  line-height: 1;
}

.meter {
  height: 16px;
  border: 3px solid #18342f;
  border-radius: 999px;
  background: #fff7d7;
  overflow: hidden;
}

.meter-fill {
  width: 0%;
  height: 100%;
  border-radius: 999px;
  transition: width 0.18s ease;
}

.meter-fill.dopamine {
  background: linear-gradient(90deg, #69b7ff, #b79dff, #ff9f1c);
}

.meter-fill.fatigue {
  background: linear-gradient(90deg, #63d99d, #ffd166, #ff4f5e);
}

.meter-card small {
  display: block;
  margin-top: 6px;
  color: var(--soft-ink);
  font-weight: 900;
}

.hud {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-top: 12px;
}

.stat-card {
  padding: 12px 14px;
}

.stat-card span {
  display: block;
  color: var(--soft-ink);
  font-size: 0.82rem;
  font-weight: 900;
}

.stat-card strong {
  display: block;
  font-family: "Baloo 2", system-ui, sans-serif;
  font-size: 1.6rem;
  line-height: 1;
}

.abilities {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 14px;
}

.ability-btn {
  position: relative;
  text-align: left;
  padding: 14px 14px 14px 50px;
  color: var(--ink);
}

.ability-btn[disabled] {
  opacity: 0.45;
  filter: grayscale(0.5);
  cursor: not-allowed;
}

.ability-btn strong,
.ability-btn small {
  display: block;
}

.ability-btn small {
  color: var(--soft-ink);
}

.key {
  position: absolute;
  left: 12px;
  top: 50%;
  translate: 0 -50%;
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  color: white;
  background: #18342f;
  font-weight: 900;
}

.upgrade-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-top: 18px;
}

.card-btn {
  min-height: 174px;
  padding: 16px;
  text-align: left;
  border: 4px solid #18342f;
  border-radius: 24px;
  background: #fff7d7;
  box-shadow: 0 10px 0 #18342f;
  transition: transform 0.12s ease;
}

.card-btn .emoji {
  display: block;
  font-size: 2.3rem;
  margin-bottom: 8px;
}

.card-btn strong {
  display: block;
  font-size: 1.05rem;
  margin-bottom: 6px;
}

.card-btn small {
  color: var(--soft-ink);
  font-weight: 800;
}

@media (max-width: 780px) {
  body {
    display: block;
    padding: 8px;
  }

  .game-shell {
    width: 100%;
  }

  .hero-card {
    padding: 12px 14px;
    border-radius: 22px;
    margin-bottom: 10px;
    box-shadow: 0 8px 0 rgba(23, 48, 44, 0.08), 0 16px 34px var(--shadow);
  }

  .subtitle {
    font-size: 0.9rem;
  }

  .brain-badge {
    width: 56px;
    height: 56px;
    font-size: 2.1rem;
    border-radius: 18px;
  }

  .canvas-wrap {
    border-width: 4px;
    border-radius: 22px;
    box-shadow: 0 9px 0 #18342f, 0 18px 38px var(--shadow);
  }

  .overlay {
    padding: 10px;
  }

  .panel {
    width: 96%;
    padding: 16px;
    border-width: 4px;
    border-radius: 24px;
    box-shadow: 0 8px 0 #18342f, 0 18px 36px var(--shadow);
  }

  .big-icon {
    font-size: 2.8rem;
  }

  .how-to {
    grid-template-columns: 1fr;
    gap: 7px;
    margin: 12px 0;
  }

  .how-to span {
    padding: 8px;
  }

  .meter-row {
    grid-template-columns: 1fr;
    gap: 8px;
    margin-top: 16px;
  }

  .hud {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    margin-top: 8px;
  }

  .meter-card,
  .stat-card {
    padding: 9px 10px;
    border-radius: 16px;
  }

  .stat-card strong,
  .meter-label strong {
    font-size: 1.3rem;
  }

  .abilities {
    grid-template-columns: 1fr;
    gap: 8px;
    margin-top: 10px;
    padding-bottom: env(safe-area-inset-bottom);
  }

  .ability-btn {
    min-height: 54px;
    padding-top: 10px;
    padding-bottom: 10px;
    border-radius: 16px;
  }

  .upgrade-grid {
    grid-template-columns: 1fr;
    max-height: 52svh;
    overflow-y: auto;
    padding-bottom: 10px;
  }

  .card-btn {
    min-height: auto;
  }
}

@media (max-width: 430px) {
  h1 {
    font-size: 2rem;
  }

  .eyebrow {
    font-size: 0.68rem;
  }

  .subtitle {
    display: none;
  }

  .hero-card {
    align-items: center;
  }
}
