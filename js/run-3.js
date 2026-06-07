const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');

const keys = { left: false, right: false, jump: false };
const player = { lane: 1, y: 0, vy: 0, ground: true };
const laneOffsets = [-140, 0, 140];
const horizonY = 120;
const horizonX = 450;
const floorY = 445;
const holes = [];
const blocks = [];
let speed = 0.029;
let dist = 0;
let over = false;
const spawnZ = 5.5;
const hitNearZ = 1.08;
const hitFarZ = 0.72;

addEventListener('keydown', e => {
  if (e.code === 'ArrowLeft') keys.left = true;
  if (e.code === 'ArrowRight') keys.right = true;
  if (e.code === 'ArrowUp' || e.code === 'Space') keys.jump = true;
  if (over && e.code === 'KeyR') reset();
});

function reset() {
  player.lane = 1;
  player.y = 0;
  player.vy = 0;
  player.ground = true;
  holes.length = 0;
  blocks.length = 0;
  dist = 0;
  speed = 0.029;
  over = false;
}

function spawn() {
  if (Math.random() < 0.32) holes.push({ lane: Math.floor(Math.random() * 3), z: spawnZ });
  if (Math.random() < 0.34) blocks.push({ lane: Math.floor(Math.random() * 3), z: spawnZ, h: 54 + Math.random() * 26 });
}

function project(lane, z) {
  const depth = Math.max(0, Math.min(1, (spawnZ - z) / (spawnZ - 0.1)));
  const s = 0.18 + depth * 1.12;
  return {
    x: horizonX + laneOffsets[lane] * depth,
    y: horizonY + (floorY - horizonY) * depth,
    s
  };
}

function drawTunnel() {
  const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bg.addColorStop(0, '#2f1736');
  bg.addColorStop(1, '#0f0b12');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 46; i++) {
    const z = i / 45;
    const y = 480 - z * 360;
    ctx.strokeStyle = `rgba(255,176,95,${0.1 + z * 0.5})`;
    ctx.beginPath();
    ctx.moveTo(130 + z * 300, y);
    ctx.lineTo(770 - z * 300, y);
    ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(255,220,185,0.35)';
  ctx.beginPath();
  ctx.moveTo(430, horizonY);
  ctx.lineTo(470, horizonY);
  ctx.stroke();
}

function updatePlayer() {
  if (keys.left) { player.lane = Math.max(0, player.lane - 1); keys.left = false; }
  if (keys.right) { player.lane = Math.min(2, player.lane + 1); keys.right = false; }
  if (keys.jump && player.ground) { player.vy = -10.5; player.ground = false; }
  keys.jump = false;

  player.vy += 0.5;
  player.y += player.vy;
  if (player.y > 0) { player.y = 0; player.vy = 0; player.ground = true; }
}

function loop() {
  drawTunnel();

  if (!over) {
    updatePlayer();
    speed += 0.000014;
    dist += speed * 60;
    if (Math.random() < 0.045) spawn();

    holes.forEach(h => h.z -= speed);
    blocks.forEach(b => b.z -= speed);

    for (const h of holes) {
      if (h.lane === player.lane && player.ground && h.z <= hitNearZ && h.z >= hitFarZ) {
        over = true;
      }
    }

    for (const b of blocks) {
      if (b.lane === player.lane && b.z <= hitNearZ && b.z >= hitFarZ && player.y > -42) {
        over = true;
      }
    }

    for (let i = holes.length - 1; i >= 0; i--) if (holes[i].z < 0.09) holes.splice(i, 1);
    for (let i = blocks.length - 1; i >= 0; i--) if (blocks[i].z < 0.09) blocks.splice(i, 1);
  }

  for (const h of holes) {
    const p = project(h.lane, h.z);
    const w = 96 * p.s;
    ctx.fillStyle = '#050507';
    ctx.fillRect(p.x - w / 2, p.y - 7 * p.s, w, 14 * p.s);
    ctx.strokeStyle = '#ff9f4d';
    ctx.strokeRect(p.x - w / 2, p.y - 7 * p.s, w, 14 * p.s);
  }

  for (const b of blocks) {
    const p = project(b.lane, b.z);
    const w = 68 * p.s;
    const h = b.h * p.s;
    ctx.fillStyle = '#ffb86f';
    ctx.fillRect(p.x - w / 2, p.y - h, w, h);
  }

  const px = horizonX + laneOffsets[player.lane];
  ctx.fillStyle = '#f2f3ff';
  ctx.beginPath();
  ctx.arc(px, 432 + player.y, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ff8a47';
  ctx.fillRect(px - 12, 440 + player.y, 24, 20);

  scoreEl.textContent = `Distance: ${Math.floor(dist)}`;

  if (over) {
    ctx.fillStyle = '#0000008f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffe9c8';
    ctx.font = '44px Racing Sans One';
    ctx.fillText('DRIFT LOST', 320, 222);
    ctx.font = '22px Barlow';
    ctx.fillText('Press R to retry', 362, 260);
  }

  requestAnimationFrame(loop);
}

reset();
loop();
