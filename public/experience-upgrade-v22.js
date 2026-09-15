(() => {
  if (window.__birthdayMessageV22Loaded) return;
  window.__birthdayMessageV22Loaded = true;

  const html = `
    <em>Oh, it's "potentially" your birthday today, but I suppose the world can survive someone who believes there's always another level to unlock. 100 ke baad 101 bhi toh hai na.</em><br><br>
    <em>May you keep building, exploring the unexplored, questioning like 0!=1?, and yeah, being "self-obsessed" too. Hope 18 gives you more reasons to be proud and remember.</em><br><br>
    <em>Hope this was something unique that you haven't received or made. Ab "same" mat bolna lol T_T</em><br><br>
    <em>Btw, Ch(atgpt) = Ch(inmay) = Ch + preposition + gpt/may. Illogical logic, ik. 💀</em><br><br>
    <em>Had 17 more ideas, but calling it done before this becomes a post. And the dice idea? Nah. You don't need to roll - you're winning anyway. Heads/tail logic, iykyk.</em> <em>(lol, better way of telling ki feature aa nahi raha tha)...</em><br><br>
    <em>BGM ke liye YT coz I didn't wanna andazi your favourite. 3 unique sites hi banai hain total, in life, so manage the bugs lol.</em>
  `;

  function apply() {
    const msg = document.getElementById('pwMsg');
    if (!msg) return false;
    const p = msg.querySelector('p');
    if (!p) return false;
    p.innerHTML = html;
    return true;
  }

  if (apply()) return;
  let tries = 0;
  const timer = setInterval(() => {
    if (apply() || ++tries >= 80) clearInterval(timer);
  }, 100);

  // Final interaction repair is loaded last, after every legacy upgrade has run.
  const repair = document.createElement('script');
  repair.src = '/experience-upgrade-v45.js?v=20260915-interaction-fix';
  repair.async = false;
  document.body.appendChild(repair);
})();
