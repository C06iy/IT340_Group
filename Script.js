/* Dossier shared script. Each block runs only on the page that has its elements.
   Nothing is sent to a server: search uses example profiles, forms only validate. */
(function () {
  function esc(s) {
    return s.replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function setMsg(el, text, kind) {
    el.textContent = text;
    el.className = 'msg' + (kind ? ' ' + kind : '');
  }
 
  /* Homepage: profile search */
  var input = document.getElementById('searchInput');
  var list = document.getElementById('results');
  if (input && list) {
    var PROFILES = [
      { u: 'marisol', d: 'Illustration portfolio and print shop' },
      { u: 'tobiasreed', d: 'Resume, talks and conference slides' },
      { u: 'nightshift-radio', d: 'Gig posters and a live set archive' },
      { u: 'ines.writes', d: 'Essays, short fiction and a reading list' },
      { u: 'kwamefilms', d: 'Short films and a photo series' }
    ];
    var closeResults = function () {
      list.hidden = true;
      input.setAttribute('aria-expanded', 'false');
    };
    var showResults = function () {
      var q = input.value.trim().toLowerCase();
      if (!q) { closeResults(); return; }
      var hits = PROFILES.filter(function (p) {
        return p.u.toLowerCase().indexOf(q) > -1 || p.d.toLowerCase().indexOf(q) > -1;
      });
      var html = '<li class="hd">Example profiles</li>';
      if (hits.length) {
        html += hits.map(function (p) {
          return '<li class="row"><div class="u">' + esc(p.u) + '.dossier.org</div><div class="d">' + esc(p.d) + '</div></li>';
        }).join('');
      } else {
        html += '<li class="none">No profiles match &ldquo;' + esc(input.value.trim()) + '&rdquo;.</li>';
      }
      list.innerHTML = html;
      list.hidden = false;
      input.setAttribute('aria-expanded', 'true');
    };
    input.addEventListener('input', showResults);
    input.addEventListener('focus', showResults);
    document.getElementById('searchForm').addEventListener('submit', function (e) {
      e.preventDefault();
      showResults();
    });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('#searchForm')) closeResults();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeResults();
    });
  }
 
  /* Login page */
  var loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = document.getElementById('loginMsg');
      var user = document.getElementById('loginUser').value.trim().toLowerCase();
      var pass = document.getElementById('loginPass').value;
      if (!user) return setMsg(msg, 'Enter your username.', 'err');
      if (!pass) return setMsg(msg, 'Enter your password.', 'err');
      setMsg(msg, 'Sign-in is not connected to a server yet, so ' + user + '.dossier.org was not opened.', 'ok');
    });
  }
 
  /* Register page */
  var registerForm = document.getElementById('registerForm');
  if (registerForm) {
    var NAME_RE = /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])$/;
    registerForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = document.getElementById('regMsg');
      var user = document.getElementById('regUser').value.trim().toLowerCase();
      var pass = document.getElementById('regPass').value;
      var email = document.getElementById('regEmail').value.trim();
      if (!NAME_RE.test(user)) {
        return setMsg(msg, 'Use 3 to 30 letters, numbers or hyphens. Start and end with a letter or number.', 'err');
      }
      if (pass.length < 8) return setMsg(msg, 'Choose a password with at least 8 characters.', 'err');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setMsg(msg, 'Enter a valid email address.', 'err');
      setMsg(msg, user + '.dossier.org is a valid name. Registration is not connected to a server yet, so no site was created.', 'ok');
    });
  }
})();
 