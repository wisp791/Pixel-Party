const cards = document.querySelectorAll('.game-card');
cards.forEach((card, i) => {
  card.style.animation = `cardIntro .5s ease ${i * 0.08}s both`;
});

const style = document.createElement('style');
style.textContent = `
@keyframes cardIntro {
  from { opacity: 0; transform: translateY(18px) scale(.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}`;
document.head.appendChild(style);
