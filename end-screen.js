const END_STR = {
  ko: { gameOver:'게임 종료!', again:'다시 하기', win:'🎉 승리!', lose:'😢 아쉬워요', draw:'🤝 무승부' },
  en: { gameOver:'Game Over', again:'Play Again', win:'🎉 You Win!', lose:'😢 So close!', draw:'🤝 Draw' }
};

function showEndOverlay({ lang='ko', result, title, scoreText, onRestart }) {
  const s = END_STR[lang];
  const box = document.createElement('div');
  box.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;z-index:9999';
  box.innerHTML = `<div style="background:#fff;border-radius:16px;padding:24px 32px;text-align:center;max-width:80vw">
    <div style="color:#888">${s.gameOver}</div>
    <div style="font-size:1.8em;margin:8px 0">${title || s[result]}</div>
    <div style="margin-bottom:16px">${scoreText}</div>
    <button id="endAgainBtn" style="font-size:1.1em;padding:10px 24px;border-radius:10px;border:0;background:#ffd54f">${s.again}</button></div>`;
  document.body.appendChild(box);
  box.querySelector('#endAgainBtn').onclick = () => { box.remove(); (onRestart || (() => location.reload()))(); };
  if (result === 'win') launchConfetti();
}

// 라이브러리를 자동으로 불러오기 (게임 HTML에 CDN 줄을 따로 안 넣어도 돼요)
(function () {
  if (typeof confetti === 'function') return;
  const s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js';
  document.head.appendChild(s);
})();

function launchConfetti(count = 80) {
  if (typeof confetti !== 'function') return;   // 아직 로딩 전이거나 실패하면 조용히 건너뜀
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:99999;pointer-events:none;';
  document.body.appendChild(canvas);
  const myConfetti = confetti.create(canvas, { resize: true });
  myConfetti({ particleCount: count, angle: 60,  spread: 70, origin: { x: 0, y: 0.7 } });
  myConfetti({ particleCount: count, angle: 120, spread: 70, origin: { x: 1, y: 0.7 } });
  setTimeout(() => canvas.remove(), 4000);
}
}
