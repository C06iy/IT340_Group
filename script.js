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
    var closeResults = function () {
      list.hidden = true;
      input.setAttribute('aria-expanded', 'false');
    };
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
  /* Register page */
  var registerForm = document.getElementById('registerForm');

