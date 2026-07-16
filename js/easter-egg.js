// easter-egg.js — Konami code → 404 page
// Sequence: ↑ ↑ ↓ ↓ ← → B A Enter

(function () {

  const SEQUENCE = [
    'ArrowUp','ArrowUp','ArrowDown','ArrowDown',
    'ArrowLeft','ArrowRight',
    'b','a','Enter',
  ];

  let pos = 0;

  document.addEventListener('keydown', e => {
    if (e.key === SEQUENCE[pos]) {
      pos++;
      if (pos === SEQUENCE.length) {
        pos = 0;
        window.location.href = '404.html';
      }
    } else {
      // Restart but check if this key begins a new sequence
      pos = e.key === SEQUENCE[0] ? 1 : 0;
    }
  });

})();
