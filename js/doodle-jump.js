const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');

const keys = { l: false, r: false };
const player = { x: 220, y: 510, w: 34, h: 34, vx: 0, vy: -11 };
const platforms = [];
const springs = [];
let cam = 0;
let score = 0;
let over = false;

for (let i = 0; i < 12; i++) {
  platforms.push({ x: Math.random() * 390, y: 620 - i * 58, w: 80 + Math.random() * 45, moving: Math.random() < 0.28, dx: Math.random() < 0.5 ? 1 : -1, broken: false, used: false });
}

springs.push({ x: 210, y: 560, active: true });

addEventListener('keydown', e => {
  if (e.code === 'ArrowLeft') keys.l = true;
  if (e.code === 'ArrowRight') keys.r = true;
  if (e.code === 'KeyR' && over) reset();
});
addEventListener('keyup', e => {
  if (e.code === 'ArrowLeft') keys.l = false;
  if (e.code === 'ArrowRight') keys.r = false;
});

function reset() {
  player.x = 220;
  player.y = 510;
  player.vx = 0;
  player.vy = -11;
  cam = 0;
  score = 0;
  over = false;
  platforms.forEach((p, i) => {
    p.x = Math.random() * 390;
    p.y = 620 - i * 58;
    p.w = 80 + Math.random() * 45;
    p.moving = Math.random() < 0.28;
    p.dx = Math.random() < 0.5 ? 1 : -1;
    p.broken = Math.random() < 0.12;
    p.used = false;
  });
  springs.length = 0;
  springs.push({ x: 180 + Math.random() * 120, y: 520, active: true });
}

function drawBg() {
  ctx.fillStyle = '#fffdf5';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < 34; i++) {
    const y = (i * 38 + cam * 0.45) % 640;
    ctx.strokeStyle = '#cfd8e5';
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

function step() {
  if (over) return;

  player.vx = (keys.r - keys.l) * 4.4;
  player.x += player.vx;
  if (player.x > canvas.width) player.x = -player.w;
  if (player.x < -player.w) player.x = canvas.width;

  player.vy += 0.34;
  player.y += player.vy;

  for (const p of platforms) {
    if (p.moving) {
      p.x += p.dx * 1.2;
      if (p.x < 0 || p.x + p.w > canvas.width) p.dx *= -1;
    }

    const landing = player.vy > 0 && player.x + player.w > p.x && player.x < p.x + p.w && player.y + player.h > p.y && player.y + player.h < p.y + 14;
    if (landing && !(p.broken && p.used)) {
      player.vy = -11.3;
      if (p.broken) p.used = true;
    }
  }

  for (const s of springs) {
    if (!s.active) continue;
    const hit = player.vy > 0 && player.x + player.w > s.x && player.x < s.x + 28 && player.y + player.h > s.y && player.y + player.h < s.y + 20;
    if (hit) {
      player.vy = -16.5;
      s.active = false;
    }
  }

  if (player.y < 260) {
    const shift = 260 - player.y;
    player.y = 260;
    cam += shift;
    platforms.forEach(p => p.y += shift);
    springs.forEach(s => s.y += shift);
  }

  for (const p of platforms) {
    if (p.y > 670) {
      p.y = -18;
      p.x = Math.random() * 390;
      p.w = 80 + Math.random() * 45;
      p.moving = Math.random() < 0.28;
      p.dx = Math.random() < 0.5 ? 1 : -1;
      p.broken = Math.random() < 0.14;
      p.used = false;
      if (Math.random() < 0.12) springs.push({ x: p.x + p.w * 0.45, y: p.y - 18, active: true });
    }
  }

  while (springs.length > 9) springs.shift();

  score = Math.max(score, Math.floor(cam * 0.5));
  scoreEl.textContent = `Height: ${score}`;

  if (player.y > canvas.height + 40) over = true;
}

function draw() {
  drawBg();

  for (const p of platforms) {
    if (p.broken && p.used) continue;
    ctx.fillStyle = p.broken ? '#d8a55b' : '#67d98f';
    ctx.fillRect(p.x, p.y, p.w, 12);
    ctx.strokeStyle = '#19380f';
    ctx.strokeRect(p.x, p.y, p.w, 12);
  }

  ctx.fillStyle = '#ff6c6c';
  for (const s of springs) {
    if (!s.active) continue;
    ctx.fillRect(s.x, s.y, 28, 7);
    ctx.fillRect(s.x + 10, s.y - 12, 8, 12);
  }

  ctx.fillStyle = '#ffd24d';
  ctx.fillRect(player.x, player.y, player.w, player.h);
  ctx.fillStyle = '#20243b';
  ctx.fillRect(player.x + 7, player.y + 10, 6, 6);
  ctx.fillRect(player.x + 21, player.y + 10, 6, 6);

  if (over) {
    ctx.fillStyle = '#000000a8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = '44px Permanent Marker';
    ctx.fillText('SPLAT!', 170, 250);
    ctx.font = '22px Nunito';
    ctx.fillText('Press R to jump again', 132, 290);
  }
}

function loop() {
  step();
  draw();
  requestAnimationFrame(loop);
}

reset();
loop();
