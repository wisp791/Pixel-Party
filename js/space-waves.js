const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');

let press = false;
const activeControls = new Set();
let score = 0;
let best = 0;
let over = false;
let tick = 0;

const player = {
  worldX: 0,
  y: 250,
  r: 9,
  dir: -1,
  verticalStep: 6.2,
  forwardSpeed: 6.2,
  color: '#7fefff'
};

const walls = [];
const trail = [];

addEventListener('keydown', e => {
  if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
    activeControls.add(e.code);
    press = true;
  }
  if (e.code === 'KeyR' && over) reset();
});
addEventListener('keyup', e => {
  if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
    activeControls.delete(e.code);
    press = activeControls.size > 0;
  }
});
addEventListener('mousedown', e => {
  if (e.button === 0) {
    activeControls.add('MouseLeft');
    press = true;
  }
});
addEventListener('mouseup', e => {
  if (e.button === 0) {
    activeControls.delete('MouseLeft');
    press = activeControls.size > 0;
  }
});

function reset() {
  player.worldX = 0;
  player.y = canvas.height * 0.5;
  player.dir = -1;
  activeControls.clear();
  press = false;
  score = 0;
  over = false;
  walls.length = 0;
  trail.length = 0;
  tick = 0;
}

function centerLine(worldX) {
  const a = Math.sin((worldX + tick * 2.5) * 0.009) * 70;
  const b = Math.sin((worldX + tick * 1.5) * 0.02) * 34;
  return canvas.height * 0.5 + a + b;
}

function spawnWall() {
  const worldX = player.worldX + canvas.width + 120;
  const c = centerLine(worldX);
  const gap = 132 - Math.min(45, score / 150);
  walls.push({ worldX, w: 46, top: c - gap * 0.5, bottom: c + gap * 0.5 });
}

function drawTrail(cameraX) {
  if (trail.length < 2) return;

  ctx.strokeStyle = 'rgba(255,255,255,0.92)';
  ctx.lineWidth = 5;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.beginPath();
  let started = false;

  for (let i = 0; i < trail.length; i++) {
    const p = trail[i];
    const sx = p.worldX - cameraX;
    if (sx < -80 || sx > canvas.width + 40) continue;
    if (!started) {
      ctx.moveTo(sx, p.y);
      started = true;
    } else {
      ctx.lineTo(sx, p.y);
    }
  }
  if (started) ctx.stroke();

  ctx.strokeStyle = 'rgba(127,239,255,0.95)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  started = false;
  for (let i = 0; i < trail.length; i++) {
    const p = trail[i];
    const sx = p.worldX - cameraX;
    if (sx < -80 || sx > canvas.width + 40) continue;
    if (!started) {
      ctx.moveTo(sx, p.y);
      started = true;
    } else {
      ctx.lineTo(sx, p.y);
    }
  }
  if (started) ctx.stroke();
}

function drawPlayer(screenX) {
  ctx.save();
  ctx.translate(screenX, player.y);
  ctx.rotate(player.dir * Math.PI / 4);
  ctx.fillStyle = '#8bf8ff';
  ctx.beginPath();
  ctx.moveTo(-10, -7);
  ctx.lineTo(12, 0);
  ctx.lineTo(-10, 7);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.fillRect(-13, -2, 5, 4);
  ctx.restore();
}

function drawBackground(cameraX) {
  const g = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  g.addColorStop(0, '#021229');
  g.addColorStop(1, '#1f0e3f');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 110; i++) {
    const wx = i * 95 + Math.floor(cameraX * 0.35);
    const sx = (wx % (canvas.width + 60)) - 30;
    const sy = (i * 71 + tick * 0.9) % canvas.height;
    ctx.fillStyle = `rgba(179,222,255,${0.15 + (i % 8) * 0.08})`;
    ctx.fillRect(sx, sy, 1.8, 1.8);
  }

  ctx.strokeStyle = 'rgba(96,210,255,0.25)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 0; x < canvas.width; x += 12) {
    const y = centerLine(cameraX + x);
    if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

function drawWalls(cameraX) {
  for (const w of walls) {
    const sx = w.worldX - cameraX;
    if (sx > canvas.width + 70 || sx < -70) continue;
    ctx.fillStyle = '#56e7ff';
    ctx.fillRect(sx, 0, w.w, w.top);
    ctx.fillRect(sx, w.bottom, w.w, canvas.height - w.bottom);
    ctx.fillStyle = '#1ac2ff';
    ctx.fillRect(sx + w.w - 6, 0, 6, w.top);
    ctx.fillRect(sx + w.w - 6, w.bottom, 6, canvas.height - w.bottom);
  }
}

function collide(screenX, cameraX) {
  for (const w of walls) {
    const sx = w.worldX - cameraX;
    const hitX = screenX + player.r > sx && screenX - player.r < sx + w.w;
    const hitY = player.y - player.r < w.top || player.y + player.r > w.bottom;
    if (hitX && hitY) return true;
  }
  return false;
}

function loop() {
  tick++;
  const screenX = 175;
  let cameraX = player.worldX - screenX;

  if (!over) {
    player.dir = press ? -1 : 1;
    player.y += player.verticalStep * player.dir;
    player.worldX += player.forwardSpeed;
    cameraX = player.worldX - screenX;

    trail.unshift({ worldX: player.worldX, y: player.y });
    if (trail.length > 120) trail.pop();

    if (tick % 48 === 0) spawnWall();

    if (collide(screenX, cameraX)) over = true;

    while (walls.length && walls[0].worldX < cameraX - 90) {
      walls.shift();
      score += 10;
    }

    if (player.y < 0 || player.y > canvas.height) over = true;
  }

  drawBackground(cameraX);
  drawWalls(cameraX);
  drawTrail(cameraX);
  drawPlayer(screenX);

  best = Math.max(best, score);
  scoreEl.textContent = `Score: ${score} | Best: ${best}`;

  if (over) {
    ctx.fillStyle = '#00000090';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = '700 40px Orbitron';
    ctx.textAlign = 'center';
    ctx.fillText('WAVE CRASH', canvas.width * 0.5, 225);
    ctx.font = '700 20px Exo 2';
    ctx.fillText('Press R to restart', canvas.width * 0.5, 260);
    ctx.textAlign = 'start';
  }

  requestAnimationFrame(loop);
}

reset();
loop();
