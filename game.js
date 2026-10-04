(function (root) {
  'use strict';
  function validate(value) {
    // Validate before uppercase conversion: Unicode characters such as ß must never become SS.
    if (!/^[a-zA-Z]{5}$/.test(value)) return { error: 'Bitte genau 5 Buchstaben A–Z eingeben, ohne Leerzeichen, Umlaute oder ß.' };
    const word = value.toUpperCase();
    if (new Set(word).size !== 5) return { error: 'Jeder Buchstabe darf nur einmal vorkommen.' };
    return { word };
  }
  function score(secret, guess) {
    let exact = 0, misplaced = 0;
    for (let i = 0; i < 5; i++) {
      if (secret[i] === guess[i]) exact++;
      else if (secret.includes(guess[i])) misplaced++;
    }
    return `${exact}${misplaced}`;
  }
  function createGame(secretInput) {
    const checked = validate(secretInput);
    if (checked.error) throw new Error(checked.error);
    let secret = checked.word, count = 0, ended = false;
    return {
      guess(input) {
        if (ended) return { error: 'Das Spiel ist bereits beendet.' };
        const checkedGuess = validate(input);
        if (checkedGuess.error) return checkedGuess;
        const result = score(secret, checkedGuess.word);
        count++;
        ended = result === '50' || count === 10;
        const response = { word: checkedGuess.word, score: result, count, ended, won: result === '50' };
        if (ended) { response.secret = secret; secret = ''; }
        return response;
      }
    };
  }
  const api = { validate, score, createGame };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Memorium = api;
})(typeof globalThis !== 'undefined' ? globalThis : window);
