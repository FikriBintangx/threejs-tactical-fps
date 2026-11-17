// Tactical DOM HUD: Counter-Strike style round timer, economy balance, 5v5 team alive counters, bomb indicator
const COPY = {
  start: {
    title: 'StrikeCraft Tactical FPS v4',
    copy: 'Round-Based Defusal Shooter (5v5 Bots & Economy). Plant or defuse C4 at Site A/B.',
    action: 'Enter Combat (Buy Phase)',
  },
  paused: {
    title: 'Game Paused',
    copy: 'Match paused. Click resume to rejoin active firefight.',
    action: 'Resume Firefight',
  },
  end: {
    title: 'Round Complete',
    copy: 'Objective accomplished.',
    action: 'Next Round',
  },
};

export function createHud() {
  const overlay = document.getElementById('overlay');
  const title = document.getElementById('overlay-title');
  const copy = document.getElementById('overlay-copy');
  const play = document.getElementById('play');
  const ammoMag = document.getElementById('ammo-mag');
  const ammoReserve = document.getElementById('ammo-reserve');
  const scoreValue = document.getElementById('score-value');
  const hitmarker = document.getElementById('hitmarker');
  const timerDisplay = document.getElementById('round-timer');
  const moneyDisplay = document.getElementById('player-money');
  const teamScoreDisplay = document.getElementById('team-score');

  let hitTimer = 0;

  return {
    setAmmo(mag, reserve) {
      ammoMag.textContent = String(mag);
      ammoReserve.textContent = `/ ${reserve}`;
    },
    setScore(value) {
      if (scoreValue) scoreValue.textContent = String(value);
    },
    setMatchState(timeSec, money, tWins, ctWins, bombPlanted) {
      if (timerDisplay) {
        const m = Math.floor(timeSec / 60);
        const s = Math.floor(timeSec % 60).toString().padStart(2, '0');
        timerDisplay.textContent = bombPlanted ? `💣 ${s}` : `${m}:${s}`;
        timerDisplay.style.color = bombPlanted ? '#ff3344' : '#e9e6df';
      }
      if (moneyDisplay) {
        moneyDisplay.textContent = `$${money}`;
      }
      if (teamScoreDisplay) {
        teamScoreDisplay.textContent = `CT ${ctWins} : ${tWins} T`;
      }
    },
    hitMarker(killed, holdMs = 90) {
      hitmarker.classList.add('on');
      hitmarker.style.transform = killed ? 'translate(-50%, -50%) rotate(45deg) scale(1.3)' : '';
      clearTimeout(hitTimer);
      hitTimer = setTimeout(() => {
        hitmarker.classList.remove('on');
        hitmarker.style.transform = '';
      }, holdMs);
    },
    showOverlay(mode, score) {
      const text = COPY[mode] || COPY.start;
      title.textContent = text.title;
      copy.textContent = mode === 'end' ? `${text.copy} Final Score: ${score}` : text.copy;
      play.textContent = text.action;
      overlay.hidden = false;
      play.focus();
    },
    hideOverlay() {
      overlay.hidden = true;
    },
    onPlay(handler) {
      play.addEventListener('click', handler);
    },
  };
}
