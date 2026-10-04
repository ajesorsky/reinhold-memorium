(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  let game = null, ended = false;
  const showError = (id, input, message) => {
    $(id).textContent = message || '';
    $(input).setAttribute('aria-invalid', message ? 'true' : 'false');
    if (message) $(input).focus();
  };
  $('reveal').addEventListener('click', () => {
    const visible = $('secret').type === 'password';
    $('secret').type = visible ? 'text' : 'password';
    $('reveal').textContent = visible ? 'Verbergen' : 'Anzeigen';
    $('reveal').setAttribute('aria-pressed', String(visible));
  });
  $('setup-form').addEventListener('submit', event => {
    event.preventDefault();
    const checked = Memorium.validate($('secret').value);
    showError('setup-error', 'secret', checked.error);
    if (checked.error) return;
    game = Memorium.createGame(checked.word);
    $('secret').value = '';
    $('secret').type = 'password';
    $('reveal').textContent = 'Anzeigen';
    $('reveal').setAttribute('aria-pressed', 'false');
    $('setup').hidden = true;
    $('play').hidden = false;
    $('guess').focus();
  });
  $('guess-form').addEventListener('submit', event => {
    event.preventDefault();
    if (!game || ended) return;
    const result = game.guess($('guess').value);
    showError('guess-error', 'guess', result.error);
    if (result.error) return;
    const row = document.createElement('tr');
    for (const value of [result.count, result.word]) {
      const cell = document.createElement('td'); cell.textContent = value; row.appendChild(cell);
    }
    const cell = document.createElement('td'), score = document.createElement('span');
    score.className = 'score'; score.textContent = result.score;
    score.setAttribute('aria-label', `${result.score[0]} an richtiger Position, ${result.score[1]} an anderer Position`);
    cell.appendChild(score); row.appendChild(cell);
    if (result.won) row.className = 'win';
    $('attempts').prepend(row);
    $('history').hidden = false;
    $('counter').textContent = `${result.count} / 10`;
    $('guess').value = '';
    $('status').textContent = `Versuch ${result.count}: ${result.word}. ${result.score[0]} richtig platziert, ${result.score[1]} an anderer Position. Noch ${10 - result.count} Versuche.`;
    ended = result.ended;
    if (ended) {
      $('guess-form').hidden = true;
      $('result').hidden = false;
      $('result-title').textContent = result.won ? 'Das Wort ist gefunden!' : 'Zehn Versuche – aufgelöst.';
      $('result-text').textContent = `Das Hauptwort war ${result.secret}.` + (result.won ? ` Gelöst in ${result.count} ${result.count === 1 ? 'Versuch' : 'Versuchen'}.` : ' Mit einem neuen Wort geht es weiter.');
      $('status').textContent = 'Das Spiel ist beendet.';
      $('result-title').focus();
      game = null;
    } else $('guess').focus();
  });
  function reset() {
    game = null; ended = false;
    $('attempts').replaceChildren();
    $('setup-form').reset(); $('guess-form').reset();
    $('play').hidden = true; $('setup').hidden = false;
    $('result').hidden = true; $('history').hidden = true;
    $('guess-form').hidden = false; $('restart-confirm').hidden = true;
    $('restart').hidden = false;
    $('result-text').textContent = ''; $('result-title').textContent = '';
    $('counter').textContent = '0 / 10';
    $('status').textContent = 'Das Hauptwort ist verborgen. Gib das Gerät jetzt weiter.';
    showError('guess-error', 'guess', ''); showError('setup-error', 'secret', '');
    $('secret').focus();
  }
  $('restart').addEventListener('click', () => {
    if (ended) return reset();
    $('restart-confirm').hidden = false; $('restart').hidden = true; $('restart-no').focus();
  });
  $('restart-yes').addEventListener('click', reset);
  $('restart-no').addEventListener('click', () => {
    $('restart-confirm').hidden = true; $('restart').hidden = false; $('guess').focus();
  });
  // Never restore a secret or old board from the browser back/forward cache.
  window.addEventListener('pageshow', event => { if (event.persisted) reset(); });
  let installPrompt;
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault(); installPrompt = event; $('install').hidden = false;
  });
  $('install').addEventListener('click', async () => {
    if (!installPrompt) return;
    await installPrompt.prompt(); installPrompt = null; $('install').hidden = true;
  });
  window.addEventListener('appinstalled', () => { $('install').hidden = true; installPrompt = null; });
  if ('serviceWorker' in navigator && ['https:', 'http:'].includes(location.protocol) && window.isSecureContext) {
    navigator.serviceWorker.register('./sw.js').then(() => navigator.serviceWorker.ready).then(() => {
      $('offline-status').textContent = 'Die App-Dateien sind für die Offline-Nutzung bereit. Spielstände und Wörter werden nicht gespeichert.';
    }).catch(() => {
      $('offline-status').textContent = 'Das Spiel funktioniert. Der Offline-Cache ist in diesem Browser derzeit nicht verfügbar.';
    });
  }
})();
