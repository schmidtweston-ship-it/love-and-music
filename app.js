(function () {
  "use strict";

  var SHELF = [
    { title: "Fishing in the Dark", note: "Nitty Gritty Dirt Band · Mom and Dad", file: null },
    { title: "Sugaree", note: "Jerry Garcia Band · note for note", file: null },
    { title: "Soft Mom overnight", note: "When she sends them", file: null }
  ];

  var REQ_KEY = "love-and-music-requests-v1";
  var timer = null;
  var step = 0;
  var selected = null;

  var $ = function (id) { return document.getElementById(id); };
  var pulse = $("pulse");
  var countEls = document.querySelectorAll("#count li");
  var player = $("player");

  function setStep(n) {
    step = n;
    for (var i = 0; i < countEls.length; i++) {
      countEls[i].classList.toggle("active", i === n - 1);
    }
    pulse.classList.toggle("on", n > 0);
  }

  function stopCount() {
    if (timer) clearInterval(timer);
    timer = null;
    setStep(0);
    $("btn-stop").hidden = true;
    $("btn-count").textContent = "Start count";
  }

  function startCount() {
    stopCount();
    var n = 0;
    $("btn-stop").hidden = false;
    $("btn-count").textContent = "Restart";
    setStep(1);
    timer = setInterval(function () {
      n = (n % 4) + 1;
      setStep(n);
    }, 900);
  }

  function loadRequests() {
    try {
      return JSON.parse(localStorage.getItem(REQ_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }

  function saveRequests(list) {
    localStorage.setItem(REQ_KEY, JSON.stringify(list.slice(0, 40)));
  }

  function renderRequests() {
    var list = loadRequests();
    var el = $("request-list");
    el.innerHTML = "";
    for (var i = 0; i < list.length; i++) {
      var li = document.createElement("li");
      li.innerHTML = "<span>" + list[i].title + '</span><span class="meta">' + list[i].when + "</span>";
      el.appendChild(li);
    }
  }

  function renderSongs() {
    var el = $("song-list");
    el.innerHTML = "";
    for (var i = 0; i < SHELF.length; i++) {
      (function (song, idx) {
        var li = document.createElement("li");
        var left = document.createElement("div");
        left.innerHTML = "<strong>" + song.title + '</strong><div class="meta">' + song.note + "</div>";
        var btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = song.file ? "Select" : "Shelf";
        btn.addEventListener("click", function () {
          selected = song;
          $("btn-play").disabled = !song.file;
          $("play-status").textContent = song.file
            ? ("Ready: " + song.title)
            : (song.title + " — name on shelf. Drop MP3 in tracks/ to play.");
        });
        li.appendChild(left);
        li.appendChild(btn);
        el.appendChild(li);
      })(SHELF[i], i);
    }
  }

  $("btn-count").addEventListener("click", startCount);
  $("btn-stop").addEventListener("click", stopCount);

  $("btn-request").addEventListener("click", function () {
    $("request-form").hidden = !$("request-form").hidden;
  });

  $("request-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var title = ($("req-title").value || "").trim();
    if (!title) return;
    var list = loadRequests();
    list.unshift({ title: title, when: new Date().toLocaleString() });
    saveRequests(list);
    $("req-title").value = "";
    $("request-form").hidden = true;
    renderRequests();
  });

  $("btn-play").addEventListener("click", function () {
    if (!selected || !selected.file) return;
    player.src = selected.file;
    player.play().catch(function () {
      $("play-status").textContent = "Tap again after a user gesture if play blocked.";
    });
  });

  // Optional local tracks: tracks/manifest.json [{title, note, file}]
  fetch("tracks/manifest.json")
    .then(function (r) { return r.ok ? r.json() : []; })
    .then(function (extra) {
      if (Array.isArray(extra)) {
        for (var i = 0; i < extra.length; i++) SHELF.push(extra[i]);
      }
      renderSongs();
    })
    .catch(function () { renderSongs(); });

  renderRequests();
})();
