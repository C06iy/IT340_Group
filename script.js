/* Dossier shared script. Each block runs only on the page that has its elements.
   Search still uses example profiles (the backend has no search endpoint yet). */

(function () {

  /* Where the backend lives.  */
  var API_BASE = 'http://localhost:3000';

  /* Same rules the backend enforces (routes/auth.js). Checking here gives instant
     feedback without a round trip. The server still re-checks everything, so these are only
     a convenience, never security. */
  var USERNAME_RE = /^[a-zA-Z0-9_]{4,15}$/;
  var PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,64}$/;

  /* HOW IT WORKS: escapes text before it goes into innerHTML so profile data can't inject HTML. */
  function esc(s) {
    return s.replace(/[&<>\"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;' }[c];
    });
  }

  /* HOW IT WORKS: writes a status line into a <p class="msg"> element and sets its color class. */
  function setMsg(el, text, kind) {
    el.textContent = text;
    el.className = 'msg' + (kind ? ' ' + kind : '');
  }

  /* login.html / register.html have no message element, so old
     `if (msg)` check silently showed nothing. This helper finds the element by id, and if the
     page doesn't have it, creates it at the bottom of the form. No HTML edits required. */
  function getMsgEl(form, id) {
    var el = document.getElementById(id);
    if (!el) {
      el = document.createElement('p');
      el.id = id;
      el.className = 'msg';
      el.setAttribute('role', 'status');
      form.appendChild(el);
    }
    return el;
  }

  /* One helper that sends JSON to the backend and always returns
     { ok, data } instead of throwing, so each form can handle it simply.*/
  function postJSON(path, body) {
    return fetch(API_BASE + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        return { ok: res.ok, status: res.status, data: data };
      });
    }).catch(function () {
      return { ok: false, status: 0, data: { message: "Can't reach the server. Is the backend running on " + (API_BASE || 'this site') + '?' } };
    });
  }

  /* The backend returns the user but no token
     localStorage. Wrapped in try/catch because storage can be blocked (private mode). */
  function saveUser(user) {
    try { localStorage.setItem('dossier_user', JSON.stringify(user)); } catch (e) { /* ignore */ }
  }

  /* Homepage: profile search; on typing/focus, filters the example profiles by the text and shows them
     in the dropdown list. Clicking elsewhere or pressing Escape closes it. */
  var input = document.getElementById('searchInput');
  var list = document.getElementById('results');
  var searchForm = document.getElementById('searchForm');

  if (input && list && searchForm) {
    var profiles = [
      { name: 'Alex Morgan', role: 'Software Engineer', location: 'New York' },
      { name: 'Jordan Lee', role: 'UX Designer', location: 'Seattle' },
      { name: 'Sam Rivera', role: 'Data Analyst', location: 'Chicago' }
    ];

    var closeResults = function () {
      list.hidden = true;
      input.setAttribute('aria-expanded', 'false');
    };

    var showResults = function () {
      var query = input.value.trim().toLowerCase();
      var matches = profiles.filter(function (profile) {
        return !query || (profile.name + ' ' + profile.role + ' ' + profile.location)
          .toLowerCase().includes(query);
      });

      
      if (!matches.length) {
        list.innerHTML = '<li class="none">No profiles found</li>';
      } else {
        list.innerHTML = matches.map(function (profile) {
          return '<li class="row"><div class="u">' + esc(profile.name) + '</div>' +
            '<div class="d">' + esc(profile.role) + ' (' + esc(profile.location) + ')</div></li>';
        }).join('');
      }

      list.hidden = false;
      input.setAttribute('aria-expanded', 'true');
    };

    input.addEventListener('input', showResults);
    input.addEventListener('focus', showResults);
    searchForm.addEventListener('submit', function (e) {
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
      var msg = getMsgEl(loginForm, 'loginMessage');

      var username = loginForm.elements['username'].value.trim();
      var password = loginForm.elements['password'].value;

      if (!username || !password) {
        setMsg(msg, 'Enter your username and password.', 'err');
        return;
      }

      var btn = loginForm.querySelector('button[type="submit"]');
      if (btn) btn.disabled = true;
      setMsg(msg, 'Signing in...', '');

      postJSON('/api/auth/login', { username: username, password: password }).then(function (r) {
        if (r.ok) {
          saveUser(r.data.user);
          setMsg(msg, 'Signed in. Taking you home...', 'ok');
          setTimeout(function () { window.location.href = 'index.html'; }, 600);
        } else {
          /* 400 missing fields, 401 wrong username/password, 429 rate limited, 500 server error */
          setMsg(msg, r.data.message || 'Login failed.', 'err');
          if (btn) btn.disabled = false;
        }
      });
    });
  }

  /* Register page */
  var registerForm = document.getElementById('registerForm');

  if (registerForm) {
    registerForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = getMsgEl(registerForm, 'registerMessage');

      var username = registerForm.elements['username'].value.trim();
      var email = registerForm.elements['email'].value.trim();
      var password = registerForm.elements['password'].value;

      if (!USERNAME_RE.test(username)) {
        setMsg(msg, 'Username must be 4-15 characters: letters, numbers or underscores.', 'err');
        return;
      }
      if (!email) {
        setMsg(msg, 'Enter your email.', 'err');
        return;
      }
      if (!PASSWORD_RE.test(password)) {
        setMsg(msg, 'Password must be 8-64 characters with an uppercase letter, a lowercase letter, a number and one of !@#$%^&*', 'err');
        return;
      }

      var btn = registerForm.querySelector('button[type="submit"]');
      if (btn) btn.disabled = true;
      setMsg(msg, 'Creating your site...', '');

      postJSON('/api/auth/register', { username: username, email: email, password: password }).then(function (r) {
        if (r.ok) {
          /* 201 Created */
          setMsg(msg, 'Account created! Taking you to sign in...', 'ok');
          setTimeout(function () { window.location.href = 'login.html'; }, 1000);
        } else {
          /* 400 validation failed, 409 username or email already taken, 500 server error */
          setMsg(msg, r.data.message || 'Registration failed.', 'err');
          if (btn) btn.disabled = false;
        }
      });
    });
  }
})();

