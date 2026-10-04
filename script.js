(() => {
  "use strict";

  // Broma visual: ningún window.open, ninguna descarga, ningún alert(),
  // ningún permiso, ningún fullscreen forzado y ningún bucle de historial.
  const YT_EMBED = "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1";
  const AUTO_MS = 11000;
  const SPAWN_MS = 480;
  const HOLD_MS = 5500;

  const hoy = document.getElementById("hoy");
  const searchForm = document.getElementById("search-form");
  const search = document.getElementById("q");
  const empty = document.getElementById("empty");
  const cards = Array.from(document.querySelectorAll(".card"));
  const chips = Array.from(document.querySelectorAll("[data-filter]"));
  const layer = document.getElementById("popup-layer");
  const glitch = document.querySelector(".glitch-overlay");
  const rick = document.getElementById("rickroll");
  const frame = document.getElementById("rick-frame");
  const liveCount = document.getElementById("live-count");

  const POPUPS = [
    {
      tone: "danger",
      title: "Seguridad de Windows",
      body: `
        <p class="warn">⚠️ VIRUS DETECTADO</p>
        <p>Amenaza: <strong>Trojan.RocketLeague.exe</strong></p>
        <p>Detectado en la descarga del mod. Nivel: crítico.</p>
      `,
      buttons: [
        ["Eliminar virus", true],
        ["Cerrar", false]
      ]
    },
    {
      tone: "",
      title: "Cifrado en curso",
      body: `
        <p class="warn">Tus archivos se están cifrando</p>
        <p>Replays, capturas y la carpeta de Rocket League.</p>
        <div class="bar" aria-hidden="true"><i data-bar></i></div>
        <p class="pct" data-pct>4%</p>
      `,
      buttons: [["Aceptar", true]]
    },
    {
      tone: "",
      title: "Borrado del sistema",
      body: `
        <p class="warn">Borrando System32…</p>
        <div class="bar" aria-hidden="true"><i data-bar></i></div>
        <p>No apagues el equipo. Progreso: <span data-pct>4%</span>.</p>
        <ul class="fake-log">
          <li>AlphaBoost.zip → en cuarentena</li>
          <li>octane.cfg → bloqueado</li>
          <li>replay_ranked.replay → cifrado</li>
        </ul>
      `,
      buttons: [["Detener borrado", true]]
    },
    {
      tone: "term",
      title: "Símbolo del sistema",
      body: `
        <ul class="fake-log">
          <li>&gt; Trojan.RocketLeague.exe</li>
          <li>&gt; cifrando replays…</li>
          <li>&gt; borrando System32…</li>
          <li>&gt; proceso en curso</li>
        </ul>
      `,
      buttons: [["Detener", true]]
    },
    {
      tone: "danger",
      title: "Infección en curso",
      body: `
        <p>Archivos infectados</p>
        <p class="count" data-count>128</p>
        <p>Y subiendo. Origen: AlphaBoost.zip.</p>
      `,
      buttons: [["Analizar ahora", true]]
    },
    {
      tone: "",
      title: "BakkesMod Plus",
      body: `
        <p class="warn">BakkesMod Plus ha dejado de responder</p>
        <p>El plugin ha bloqueado el overlay. Cierra el programa para continuar.</p>
      `,
      buttons: [
        ["Cerrar programa", true],
        ["Aceptar", false]
      ]
    }
  ];

  const sequence = [0, 1, 0, 2, 3, 4, 0, 5, 2, 1];

  let filter = "todos";
  let state = "browsing";
  let downloads = 12480;
  let infectedFiles = 128;
  let percent = 4;
  let spawnTimer = null;
  let countTimer = null;
  let endTimer = null;
  let liveTimer = null;
  let autoTimer = null;

  function formatEs(value) {
    return Math.floor(value).toLocaleString("es-ES");
  }

  if (hoy) {
    hoy.textContent = new Date().toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
    hoy.setAttribute("datetime", new Date().toISOString().slice(0, 10));
  }

  function fold(value) {
    return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  function applyFilter() {
    const query = fold(search.value.trim());
    let shown = 0;
    cards.forEach((card) => {
      const catOk = filter === "todos" || card.dataset.cat === filter;
      const textOk = !query || fold(card.dataset.search).includes(query);
      const visible = catOk && textOk;
      card.hidden = !visible;
      if (visible) shown += 1;
    });
    empty.hidden = shown !== 0;
    chips.forEach((chip) => {
      const on = chip.classList.contains("chip") && chip.dataset.filter === filter;
      chip.classList.toggle("is-on", on);
      if (chip.classList.contains("chip")) chip.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  searchForm.addEventListener("submit", (event) => event.preventDefault());
  search.addEventListener("input", applyFilter);

  document.addEventListener("click", (event) => {
    const jump = event.target.closest("[data-jump]");
    const filterButton = event.target.closest("[data-filter]");
    const download = event.target.closest(".btn-dl");

    if (download && state === "browsing" && !download.classList.contains("rick-fallback")) {
      state = "arming";
      clearTimeout(autoTimer);
      download.textContent = "Descargando…";
      window.setTimeout(startInfection, 420);
      return;
    }

    if (state !== "browsing") return;

    if (filterButton) {
      filter = filterButton.dataset.filter;
      applyFilter();
    }

    if (jump) {
      const target = document.getElementById(jump.dataset.jump);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  function spawnPopup(index) {
    const spec = POPUPS[sequence[index % sequence.length]];
    const win = document.createElement("article");
    win.className = "win" + (spec.tone ? " " + spec.tone : "");
    win.style.zIndex = String(10 + index);
    win.setAttribute("role", "dialog");
    win.setAttribute("aria-label", spec.title);

    const actions = spec.buttons
      .map(([label, primary]) => {
        return `<button type="button" class="win-btn${primary ? " primary" : ""}">${label}</button>`;
      })
      .join("");

    win.innerHTML = `
      <div class="win-bar">
        <span>${spec.title}</span>
        <button type="button" class="win-x popup-x" aria-label="Cerrar">×</button>
      </div>
      <div class="win-body">
        ${spec.body}
        <div class="win-actions">${actions}</div>
      </div>
    `;

    layer.appendChild(win);
    placePopup(win, index);
  }

  function placePopup(win, index) {
    const pad = 12;
    const maxLeft = Math.max(pad, layer.clientWidth - win.offsetWidth - pad);
    const maxTop = Math.max(pad, layer.clientHeight - win.offsetHeight - pad);
    const narrow = window.matchMedia("(max-width: 720px)").matches;

    if (narrow) {
      const step = 54;
      win.style.left = `${pad}px`;
      win.style.top = `${Math.min(pad + index * step, maxTop)}px`;
      return;
    }

    const cols = 3;
    const col = index % cols;
    const row = Math.floor(index / cols) % 4;
    const jitter = () => (Math.random() - 0.5) * 40;
    const x = pad + ((maxLeft - pad) * col) / (cols - 1) + jitter();
    const y = pad + ((maxTop - pad) * row) / 3 + jitter();
    win.style.left = `${Math.round(Math.min(maxLeft, Math.max(pad, x)))}px`;
    win.style.top = `${Math.round(Math.min(maxTop, Math.max(pad, y)))}px`;
  }

  function startInfection() {
    if (state === "done" || state === "infected") return;
    state = "infected";
    clearTimeout(autoTimer);
    clearInterval(liveTimer);
    document.documentElement.classList.add("infected");
    document.title = "⚠️ VIRUS DETECTADO";
    document.body.style.overflow = "hidden";
    glitch.hidden = false;
    layer.classList.add("on");

    const max = window.matchMedia("(max-width: 720px)").matches ? 6 : 10;
    let spawned = 0;

    const tick = () => {
      if (state !== "infected") return;
      spawnPopup(spawned);
      spawned += 1;
      if (spawned >= max) {
        clearInterval(spawnTimer);
        spawnTimer = null;
        endTimer = window.setTimeout(showRickroll, HOLD_MS);
      }
    };

    tick();
    spawnTimer = window.setInterval(tick, SPAWN_MS);

    countTimer = window.setInterval(() => {
      infectedFiles += 7 + Math.floor(Math.random() * 36);
      percent = Math.min(99, percent + Math.random() * 6);
      layer.querySelectorAll("[data-count]").forEach((node) => {
        node.textContent = formatEs(infectedFiles);
      });
      layer.querySelectorAll("[data-pct]").forEach((node) => {
        node.textContent = `${Math.floor(percent)}%`;
      });
      layer.querySelectorAll("[data-bar]").forEach((node) => {
        node.style.width = `${Math.floor(percent)}%`;
      });
    }, 180);
  }

  function showRickroll() {
    if (state === "done") return;
    state = "done";
    clearInterval(spawnTimer);
    clearInterval(countTimer);
    clearTimeout(endTimer);
    clearTimeout(autoTimer);
    document.documentElement.classList.remove("infected");
    glitch.hidden = true;
    layer.classList.remove("on");
    layer.replaceChildren();
    frame.src = YT_EMBED;
    rick.hidden = false;
    document.title = "TE HAN RICKROLLEADO 😂";
    document.body.style.overflow = "hidden";
    rick.scrollTop = 0;
  }

  layer.addEventListener("click", (event) => {
    if (event.target.closest(".win-btn, .popup-x")) showRickroll();
  });

  liveTimer = window.setInterval(() => {
    downloads += 1 + Math.floor(Math.random() * 3);
    liveCount.textContent = formatEs(downloads);
  }, 1400);

  autoTimer = window.setTimeout(startInfection, AUTO_MS);
  applyFilter();
})();
