(() => {
  const EVENT_DATE = "2026-07-17T10:00:00-03:00";
  const eventTime = new Date(EVENT_DATE).getTime();
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const bootScreen = document.querySelector("#bootScreen");
  const skipIntro = document.querySelector("#skipIntro");
  const hudStatus = document.querySelector("#hudStatus");
  const hudCountdown = document.querySelector("#hudCountdown");
  const countDays = document.querySelector("#countDays");
  const countHours = document.querySelector("#countHours");
  const countMin = document.querySelector("#countMin");
  const countSec = document.querySelector("#countSec");
  const fighterChoices = [...document.querySelectorAll(".fighter-choice")];
  const selectionStatus = document.querySelector("#selectionStatus");
  const selectionDetail = document.querySelector("#selectionDetail");
  const changeFighter = document.querySelector("#changeFighter");
  const soundToggle = document.querySelector(".sound-toggle");
  const dialogueStage = document.querySelector("#dialogueStage");
  const dialogueNext = document.querySelector("#dialogueNext");
  const dialogueName = document.querySelector("#dialogueName");
  const dialogueQuote = document.querySelector("#dialogueQuote");
  const p1Cursor = document.querySelector(".p1-cursor");
  const betForm = document.querySelector("#betForm");
  const betName = document.querySelector("#betName");
  const betFighter = document.querySelector("#betFighter");
  const betAmount = document.querySelector("#betAmount");
  const betMessage = document.querySelector("#betMessage");
  const betStatus = document.querySelector("#betStatus");
  const barbaPickCount = document.querySelector("#barbaPickCount");
  const cabeloPickCount = document.querySelector("#cabeloPickCount");
  const barbaPickAmount = document.querySelector("#barbaPickAmount");
  const cabeloPickAmount = document.querySelector("#cabeloPickAmount");
  const totalPicks = document.querySelector("#totalPicks");
  const picksFeed = document.querySelector("#picksFeed");

  const fighters = {
    barba: {
      label: "BARBA",
      selected: "YOU CHOSE BARBA",
      quote: '"ALÉM DELE NÃO TER CABELO, NÃO SABE NEM FALAR LAYOUT. VOU ACABAR COM ELE"',
    },
    cabelo: {
      label: "CABELO",
      selected: "YOU CHOSE CABELO",
      quote: '"JOÃO NUNCA TOCOU EM OUTRO SER HUMANO KKKKK E EU NÃO VOU SER O PRIMEIRO."',
    },
  };

  let audioEnabled = false;
  let audioContext;

  function getAudioContext() {
    if (!audioContext) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;
      audioContext = new AudioContextClass();
    }

    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    return audioContext;
  }

  function playTone(frequency, startTime, duration, type = "square", volume = 0.035) {
    if (!audioEnabled) return;
    const context = getAudioContext();
    if (!context) return;

    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startTime);
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.02);
  }

  function playSound(soundName) {
    if (!audioEnabled) return;
    const context = getAudioContext();
    if (!context) return;

    const now = context.currentTime;

    if (soundName === "select") {
      playTone(220, now, 0.055);
      playTone(440, now + 0.055, 0.075);
      return;
    }

    if (soundName === "confirm") {
      playTone(330, now, 0.06, "square", 0.04);
      playTone(660, now + 0.065, 0.09, "square", 0.04);
      playTone(990, now + 0.13, 0.08, "triangle", 0.03);
      return;
    }

    if (soundName === "dialogue") {
      playTone(180, now, 0.045, "sawtooth", 0.025);
      return;
    }

    if (soundName === "error") {
      playTone(140, now, 0.08, "sawtooth", 0.03);
      playTone(110, now + 0.075, 0.08, "sawtooth", 0.03);
    }
  }

  function hideIntro() {
    if (!bootScreen) return;
    bootScreen.classList.add("is-hidden");
    bootScreen.setAttribute("aria-hidden", "true");
    sessionStorage.setItem("nomadIntroSeen", "true");
  }

  function setupIntro() {
    if (!bootScreen) return;

    if (reducedMotion || sessionStorage.getItem("nomadIntroSeen") === "true") {
      hideIntro();
      return;
    }

    const introTimer = window.setTimeout(hideIntro, 5200);
    skipIntro?.addEventListener("click", () => {
      window.clearTimeout(introTimer);
      hideIntro();
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        window.clearTimeout(introTimer);
        hideIntro();
      }
    });
  }

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function updateCountdown() {
    const now = Date.now();
    const diff = Math.max(0, eventTime - now);
    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (countDays) countDays.textContent = pad(days);
    if (countHours) countHours.textContent = pad(hours);
    if (countMin) countMin.textContent = pad(minutes);
    if (countSec) countSec.textContent = pad(seconds);

    const eventDate = new Date(EVENT_DATE);
    const sameDay = new Date(now).toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" })
      === eventDate.toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });

    if (diff <= 0) {
      if (hudStatus) hudStatus.textContent = "MATCH STARTED";
      if (hudCountdown) hudCountdown.textContent = "00:00:00";
      return;
    }

    if (sameDay) {
      if (hudStatus) hudStatus.textContent = "FIGHT DAY";
    } else if (hudStatus) {
      hudStatus.textContent = `D-${pad(days)}`;
    }

    if (hudCountdown) {
      hudCountdown.textContent = days > 0
        ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
        : `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
  }

  function scrollToBetForm() {
    if (!betForm) return;
    betForm.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center" });
    window.setTimeout(() => {
      betName?.focus({ preventScroll: true });
    }, reducedMotion ? 0 : 420);
  }

  function setSelectedFighter(fighterKey, persist = true, goToForm = false) {
    const fighter = fighters[fighterKey];
    if (!fighter) return;

    fighterChoices.forEach((choice) => {
      const selected = choice.dataset.fighter === fighterKey;
      choice.classList.toggle("is-selected", selected);
      choice.setAttribute("aria-pressed", String(selected));
    });

    if (selectionStatus) selectionStatus.textContent = "PLAYER 1 SELECTED";
    if (selectionDetail) selectionDetail.textContent = fighter.selected;
    if (changeFighter) changeFighter.hidden = false;
    if (betFighter) betFighter.value = fighterKey;

    if (dialogueName) dialogueName.textContent = fighter.label;
    if (dialogueQuote) dialogueQuote.textContent = fighter.quote;

    if (persist) {
      localStorage.setItem("nomadSelectedFighter", fighterKey);
    }

    playSound("select");

    if (goToForm) {
      scrollToBetForm();
    }
  }

  function clearSelectedFighter() {
    fighterChoices.forEach((choice) => {
      choice.classList.remove("is-selected");
      choice.setAttribute("aria-pressed", "false");
    });
    localStorage.removeItem("nomadSelectedFighter");
    if (selectionStatus) selectionStatus.textContent = "PLAYER 1 AWAITING INPUT";
    if (selectionDetail) selectionDetail.textContent = "GOLPES ESPECIAIS PURAMENTE FICTÍCIOS.";
    if (changeFighter) changeFighter.hidden = true;
    if (betFighter) betFighter.value = "";
  }

  function setupSelection() {
    fighterChoices.forEach((choice) => {
      choice.addEventListener("click", () => setSelectedFighter(choice.dataset.fighter, true, true));
    });

    changeFighter?.addEventListener("click", clearSelectedFighter);
  }

  function setupDialogue() {
    let current = "barba";

    function nextDialogue() {
      current = current === "barba" ? "cabelo" : "barba";
      if (dialogueName) dialogueName.textContent = fighters[current].label;
      if (dialogueQuote) dialogueQuote.textContent = fighters[current].quote;
      playSound("dialogue");
    }

    dialogueNext?.addEventListener("click", nextDialogue);
    dialogueStage?.addEventListener("click", (event) => {
      if (!dialogueNext?.contains(event.target)) nextDialogue();
    });
    dialogueStage?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") nextDialogue();
    });
  }

  function setupSoundToggle() {
    soundToggle?.addEventListener("click", () => {
      audioEnabled = !audioEnabled;
      soundToggle.setAttribute("aria-pressed", String(audioEnabled));
      soundToggle.textContent = audioEnabled ? "SOUND ON" : "SOUND OFF";

      if (audioEnabled) {
        getAudioContext();
        playSound("confirm");
      }
    });
  }

  function setupCursorTag() {
    if (!p1Cursor || reducedMotion || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const selectables = document.querySelectorAll(".fighter-choice, .hero-copy a");

    selectables.forEach((item) => {
      item.addEventListener("pointerenter", () => p1Cursor.classList.add("is-active"));
      item.addEventListener("pointerleave", () => p1Cursor.classList.remove("is-active"));
    });

    window.addEventListener("pointermove", (event) => {
      p1Cursor.style.transform = `translate(${event.clientX + 18}px, ${event.clientY + 18}px)`;
    });
  }

  function getSupabaseSettings() {
    const settings = window.NOMAD_BETS_SUPABASE || {};
    return {
      url: String(settings.url || "").replace(/\/$/, ""),
      anonKey: String(settings.anonKey || ""),
    };
  }

  function hasSupabaseSettings(settings) {
    return settings.url.startsWith("http") && settings.anonKey.length > 20;
  }

  function getSupabaseHeaders(prefer) {
    const settings = getSupabaseSettings();
    const headers = {
      apikey: settings.anonKey,
      Authorization: `Bearer ${settings.anonKey}`,
      "Content-Type": "application/json",
    };

    if (prefer) {
      headers.Prefer = prefer;
    }

    return headers;
  }

  function formatMoney(value) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);
  }

  function setBetStatus(message) {
    if (betStatus) betStatus.textContent = message;
  }

  function setBetFormDisabled(disabled) {
    if (!betForm) return;
    betForm.querySelectorAll("input, select, button").forEach((field) => {
      field.disabled = disabled;
    });
  }

  function normalizeAmount(value) {
    const amount = Number(String(value || "0").replace(",", "."));
    if (!Number.isFinite(amount) || amount < 0) return 0;
    return Math.min(amount, 10000);
  }

  function renderPicks(picks) {
    const totals = picks.reduce((acc, pick) => {
      const fighter = pick.fighter === "cabelo" ? "cabelo" : "barba";
      acc[fighter].count += 1;
      acc[fighter].amount += Number(pick.symbolic_amount) || 0;
      return acc;
    }, {
      barba: { count: 0, amount: 0 },
      cabelo: { count: 0, amount: 0 },
    });

    if (barbaPickCount) barbaPickCount.textContent = totals.barba.count;
    if (cabeloPickCount) cabeloPickCount.textContent = totals.cabelo.count;
    if (barbaPickAmount) barbaPickAmount.textContent = formatMoney(totals.barba.amount);
    if (cabeloPickAmount) cabeloPickAmount.textContent = formatMoney(totals.cabelo.amount);
    if (totalPicks) totalPicks.textContent = `${picks.length} PLAYERS LOCKED IN`;

    if (!picksFeed) return;
    picksFeed.replaceChildren();

    if (!picks.length) {
      const emptyItem = document.createElement("li");
      emptyItem.textContent = "WAITING FOR FIRST PLAYER...";
      picksFeed.append(emptyItem);
      return;
    }

    picks.slice(0, 12).forEach((pick) => {
      const item = document.createElement("li");
      item.className = pick.fighter === "cabelo" ? "is-cabelo-pick" : "is-barba-pick";

      const name = document.createElement("strong");
      name.textContent = pick.player_name;

      const choice = document.createElement("span");
      choice.textContent = `LOCKED ${pick.fighter === "cabelo" ? "CABELO" : "BARBA"}`;

      const amount = document.createElement("em");
      amount.textContent = formatMoney(pick.symbolic_amount);

      item.append(name, choice, amount);

      if (pick.message) {
        const message = document.createElement("p");
        message.textContent = pick.message;
        item.append(message);
      }

      picksFeed.append(item);
    });
  }

  async function loadPicks() {
    const settings = getSupabaseSettings();
    if (!hasSupabaseSettings(settings)) return;

    const url = `${settings.url}/rest/v1/fight_picks?select=id,created_at,player_name,fighter,symbolic_amount,message&order=created_at.desc&limit=80`;
    const response = await fetch(url, {
      headers: getSupabaseHeaders(),
    });

    if (!response.ok) {
      throw new Error("Could not load picks");
    }

    const picks = await response.json();
    renderPicks(picks);
  }

  async function submitPick(event) {
    event.preventDefault();
    const settings = getSupabaseSettings();
    if (!hasSupabaseSettings(settings)) return;

    const payload = {
      player_name: betName.value.trim(),
      fighter: betFighter.value,
      symbolic_amount: normalizeAmount(betAmount.value),
      message: betMessage.value.trim() || null,
    };

    if (!payload.player_name || !payload.fighter) {
      setBetStatus("CHOOSE A NAME AND FIGHTER FIRST.");
      playSound("error");
      return;
    }

    setBetFormDisabled(true);
    setBetStatus("SENDING PICK...");

    try {
      const response = await fetch(`${settings.url}/rest/v1/fight_picks`, {
        method: "POST",
        headers: getSupabaseHeaders("return=minimal"),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Could not save pick");
      }

      localStorage.setItem("nomadPlayerName", payload.player_name);
      localStorage.setItem("nomadSelectedFighter", payload.fighter);
      setSelectedFighter(payload.fighter, false, false);
      betMessage.value = "";
      setBetStatus("PICK CONFIRMED. SCOREBOARD UPDATED.");
      playSound("confirm");
      await loadPicks();
    } catch (error) {
      setBetStatus("ONLINE SCOREBOARD ERROR. CHECK SUPABASE CONFIG.");
      playSound("error");
    } finally {
      setBetFormDisabled(false);
    }
  }

  function setupOnlinePicks() {
    if (!betForm) return;

    const storedName = localStorage.getItem("nomadPlayerName");

    if (storedName && betName) betName.value = storedName;

    const settings = getSupabaseSettings();
    if (!hasSupabaseSettings(settings)) {
      setBetFormDisabled(true);
      setBetStatus("CONFIGURE public/assets/js/bets-config.js TO ENABLE ONLINE PICKS.");
      return;
    }

    setBetStatus("ONLINE SCOREBOARD READY.");
    betForm.addEventListener("submit", submitPick);
    loadPicks().catch(() => setBetStatus("ONLINE SCOREBOARD ERROR. CHECK SUPABASE CONFIG."));
    window.setInterval(() => {
      loadPicks().catch(() => setBetStatus("ONLINE SCOREBOARD ERROR. CHECK SUPABASE CONFIG."));
    }, 10000);
  }

  setupIntro();
  updateCountdown();
  window.setInterval(updateCountdown, 1000);
  setupSelection();
  setupDialogue();
  setupSoundToggle();
  setupCursorTag();
  setupOnlinePicks();
})();
