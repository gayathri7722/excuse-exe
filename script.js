/* =========================================================================
   EXCUSE.EXE — script.js
   Everything the site needs to run lives here: the excuse database, the
   generator logic, the rating system, localStorage saves, and the small
   UI behaviors (nav, cards, loading sequence, copy/share).

   NOTE ON DATA: the same excuses also live in /data/excuses.json so a
   future Flask backend (see README) has a clean source file to read from.
   The copy below is kept inline so the site works by just opening the
   HTML file — browsers block fetch() of local JSON over file:// in a lot
   of setups, and this project is meant to run with zero setup.
   ========================================================================= */

// -------------------------------------------------------------------------
// 1. THE EXCUSE DATABASE
// Organized by situation, then by style (normal / funny / savage).
// 9 situations x 3 styles x 2 excuses each = 54 excuses total.
// -------------------------------------------------------------------------
const EXCUSES = {
  wakeup: {
    label: "I woke up late",
    emoji: "😴",
    normal: [
      "My alarm went off, but I genuinely don't remember turning it off.",
      "I stayed up finishing something important and my body vetoed the morning."
    ],
    funny: [
      "My alarm and I had a disagreement. The alarm won, but I still didn't wake up.",
      "I was having a very productive dream and refused to log off."
    ],
    savage: [
      "Mornings and I are not on speaking terms. Haven't been for years.",
      "I woke up on time. I simply chose violence and went back to sleep."
    ]
  },
  assignment: {
    label: "I didn't complete my assignment",
    emoji: "📚",
    normal: [
      "I had a technical problem while completing the assignment.",
      "I ran out of time after some things came up that I couldn't move."
    ],
    funny: [
      "My laptop was working perfectly, but unfortunately I wasn't.",
      "I completed the assignment mentally. Unfortunately, my laptop didn't receive the information."
    ],
    savage: [
      "I planned to finish it yesterday. Yesterday me had other plans.",
      "The assignment and my motivation never actually met each other."
    ]
  },
  lateClass: {
    label: "I am late to class",
    emoji: "🏫",
    normal: [
      "There was more traffic than usual on the way here.",
      "I got held up right as I was about to leave."
    ],
    funny: [
      "I was on time in a parallel universe. This is just not that one.",
      "My feet started walking here, my brain stayed in bed. We're not synced yet."
    ],
    savage: [
      "Punctuality and I broke up a while ago. It's amicable.",
      "I arrive when I arrive. Today that happens to be now-ish."
    ]
  },
  noReply: {
    label: "I didn't reply to my friend",
    emoji: "📱",
    normal: [
      "I saw the message and meant to reply, then completely lost track of time.",
      "My phone was on silent and I genuinely didn't notice it come in."
    ],
    funny: [
      "I read it, mentally replied a great response, and never actually typed it.",
      "Your text is currently trapped in my draft folder, which is basically a black hole."
    ],
    savage: [
      "I don't reply fast. I reply eventually. There's a difference.",
      "Read receipts are a trap I refuse to fall into on principle."
    ]
  },
  projectUnfinished: {
    label: "My project isn't finished",
    emoji: "💻",
    normal: [
      "I hit a technical issue late in the process that set me back.",
      "A key part took longer to figure out than I expected."
    ],
    funny: [
      "The project is 90% done. Unfortunately the last 10% is 90% of the work.",
      "It compiles in my head perfectly. The computer just refuses to agree."
    ],
    savage: [
      "Deadlines are more of a suggestion in my creative process.",
      "The project isn't late. It's just running on its own schedule."
    ]
  },
  missedMeeting: {
    label: "I missed a meeting",
    emoji: "🤝",
    normal: [
      "I had a scheduling mix-up and completely missed the invite.",
      "Something urgent came up right before it started."
    ],
    funny: [
      "The meeting was on my calendar. My calendar and I don't talk much.",
      "I was mentally present. Physically, I was somewhere else entirely."
    ],
    savage: [
      "If it could've been an email, I already knew that before it started.",
      "I attend meetings selectively. This one didn't make the cut."
    ]
  },
  forgotSomething: {
    label: "I forgot something important",
    emoji: "📝",
    normal: [
      "It slipped my mind with everything else going on today.",
      "I meant to write it down and then completely forgot to."
    ],
    funny: [
      "My memory works on a first-in, first-out basis, and that got pushed out.",
      "I remembered everything except the one thing that actually mattered."
    ],
    savage: [
      "My brain has limited storage and it made an executive decision.",
      "I didn't forget. I deprioritized it without telling you."
    ]
  },
  leaveEarly: {
    label: "I need to leave early",
    emoji: "🚶",
    normal: [
      "Something came up that I need to take care of.",
      "I have somewhere else I need to be shortly."
    ],
    funny: [
      "My legs made the decision to leave before my brain approved it.",
      "I'm not leaving early, I'm just arriving early somewhere else."
    ],
    savage: [
      "I've mentally left already. My body is just catching up.",
      "I gave this exactly as much time as I intended to."
    ]
  },
  failedTest: {
    label: "I failed a test",
    emoji: "😭",
    normal: [
      "I studied the wrong material and it didn't line up with the test.",
      "I ran out of time on the sections I actually knew well."
    ],
    funny: [
      "The test and I had very different ideas about what the material was.",
      "I passed the vibe check. The actual test, less so."
    ],
    savage: [
      "The test failed to capture my full potential. That's on the test.",
      "I don't fail tests, I just collect unconventional results."
    ]
  }
};

const SITUATION_KEYS = Object.keys(EXCUSES);
const STYLES = ["normal", "funny", "savage"];

const STYLE_META = {
  normal: { emoji: "😇", label: "Normal" },
  funny: { emoji: "😂", label: "Funny" },
  savage: { emoji: "💀", label: "Savage" }
};

// -------------------------------------------------------------------------
// 2. RATING SYSTEM
// Each style has a baseline for creativity / believability / danger,
// with a little randomness mixed in so results aren't identical every time.
// -------------------------------------------------------------------------
const RATING_BASELINES = {
  normal: { creativity: 2, believability: 5, danger: 1 },
  funny: { creativity: 4, believability: 3, danger: 3 },
  savage: { creativity: 5, believability: 2, danger: 5 }
};

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function jitter(base) {
  // nudges a 1-5 baseline by -1, 0, or +1, staying inside 1-5
  const offset = Math.floor(Math.random() * 3) - 1;
  return clamp(base + offset, 1, 5);
}

function buildRatings(style) {
  const base = RATING_BASELINES[style];
  return {
    creativity: jitter(base.creativity),
    believability: jitter(base.believability),
    danger: jitter(base.danger)
  };
}

function starString(count, full, empty) {
  return full.repeat(count) + empty.repeat(5 - count);
}

function finalVerdict(ratings) {
  // Picks a closing line based on how risky the excuse is overall.
  if (ratings.believability >= 4 && ratings.danger <= 2) {
    return "Teacher may actually believe this. Proceed carefully. 😇";
  }
  if (ratings.danger >= 4) {
    return "Use this excuse only if you're feeling brave. 💀";
  }
  if (ratings.believability <= 2) {
    return "There is a 0% chance this will work. 😂";
  }
  return "A respectable, middle-of-the-road excuse. Solid choice. 🤝";
}

// -------------------------------------------------------------------------
// 3. GENERATOR CORE
// Pure function: given a situation key + style, returns one full result.
// -------------------------------------------------------------------------
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateExcuse(situationKey, style) {
  const resolvedSituation =
    situationKey === "random" ? pickRandom(SITUATION_KEYS) : situationKey;
  const resolvedStyle = style === "random" ? pickRandom(STYLES) : style;

  const bank = EXCUSES[resolvedSituation][resolvedStyle];
  const text = pickRandom(bank);
  const ratings = buildRatings(resolvedStyle);

  return {
    id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    situation: resolvedSituation,
    situationLabel: EXCUSES[resolvedSituation].label,
    situationEmoji: EXCUSES[resolvedSituation].emoji,
    style: resolvedStyle,
    styleLabel: STYLE_META[resolvedStyle].label,
    styleEmoji: STYLE_META[resolvedStyle].emoji,
    text,
    ratings,
    verdict: finalVerdict(ratings)
  };
}

// Deterministic "excuse of the day" — same seed all day, changes at midnight.
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateExcuseOfTheDay() {
  const today = new Date();
  const seed =
    today.getFullYear() * 372 + (today.getMonth() + 1) * 31 + today.getDate();
  const situationIndex = Math.floor(seededRandom(seed) * SITUATION_KEYS.length);
  const styleIndex = Math.floor(seededRandom(seed + 1) * STYLES.length);
  const situationKey = SITUATION_KEYS[situationIndex];
  const style = STYLES[styleIndex];
  const bank = EXCUSES[situationKey][style];
  const textIndex = Math.floor(seededRandom(seed + 2) * bank.length);

  return {
    situationLabel: EXCUSES[situationKey].label,
    situationEmoji: EXCUSES[situationKey].emoji,
    text: bank[textIndex]
  };
}

// -------------------------------------------------------------------------
// 4. LOCALSTORAGE — "My Excuses"
// -------------------------------------------------------------------------
const STORAGE_KEY = "excuseExeSaved";

function getSavedExcuses() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveExcuse(excuse) {
  const saved = getSavedExcuses();
  // avoid saving an exact duplicate twice
  if (saved.some((e) => e.text === excuse.text)) return saved;
  saved.unshift({ ...excuse, savedAt: new Date().toISOString() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  return saved;
}

function deleteSavedExcuse(id) {
  const saved = getSavedExcuses().filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  return saved;
}

// -------------------------------------------------------------------------
// 5. SHARE / COPY HELPERS
// -------------------------------------------------------------------------
function shareText(excuse) {
  return `"${excuse.text}"\n\nCheck out the excuse I generated on Excuse.exe 😂`;
}

async function copyExcuse(excuse, onDone) {
  try {
    await navigator.clipboard.writeText(shareText(excuse));
    onDone(true);
  } catch (e) {
    onDone(false);
  }
}

async function shareExcuse(excuse, onNoSupport) {
  const text = shareText(excuse);
  if (navigator.share) {
    try {
      await navigator.share({ text, title: "Excuse.exe" });
    } catch (e) {
      /* user cancelled share sheet — nothing to do */
    }
  } else {
    onNoSupport(text);
  }
}

// -------------------------------------------------------------------------
// 6. SHARED UI: nav hamburger + active link (runs on every page)
// -------------------------------------------------------------------------
function initNav() {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const isOpen = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
    links.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => links.classList.remove("is-open"))
    );
  }

  const currentPage = document.body.dataset.page;
  document.querySelectorAll(".nav-links a[data-page]").forEach((a) => {
    if (a.dataset.page === currentPage) a.classList.add("is-active");
  });
}

// -------------------------------------------------------------------------
// 7. HOMEPAGE behavior: excuse-of-the-day + animated stat counters
// -------------------------------------------------------------------------
function initHomepage() {
  const dayCard = document.querySelector("[data-excuse-of-day]");
  if (dayCard) {
    const eod = generateExcuseOfTheDay();
    dayCard.querySelector(".eod-emoji").textContent = eod.situationEmoji;
    dayCard.querySelector(".eod-situation").textContent = eod.situationLabel;
    dayCard.querySelector(".eod-text").textContent = `"${eod.text}"`;

    const copyBtn = dayCard.querySelector("[data-eod-copy]");
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(`"${eod.text}"`);
        flashButton(copyBtn, "Copied! ✅");
      } catch (e) {
        flashButton(copyBtn, "Couldn't copy 😬");
      }
    });
  }

  // Count up the demo stats once, when they scroll into view.
  const statEls = document.querySelectorAll("[data-count-to]");
  if (statEls.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    statEls.forEach((el) => observer.observe(el));
  }
}

function animateCount(el) {
  const target = parseInt(el.dataset.countTo, 10);
  const duration = 1200;
  const start = performance.now();

  function tick(now) {
    const progress = clamp((now - start) / duration, 0, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.round(target * eased).toLocaleString();
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function flashButton(button, message) {
  const original = button.textContent;
  button.textContent = message;
  button.classList.add("is-flashed");
  setTimeout(() => {
    button.textContent = original;
    button.classList.remove("is-flashed");
  }, 1800);
}

// -------------------------------------------------------------------------
// 8. GENERATOR PAGE behavior
// -------------------------------------------------------------------------
function initGenerator() {
  const situationGrid = document.querySelector("[data-situation-grid]");
  const styleGrid = document.querySelector("[data-style-grid]");
  const generateBtn = document.querySelector("[data-generate-btn]");
  const errorBox = document.querySelector("[data-form-error]");
  const loadingBox = document.querySelector("[data-loading]");
  const resultBox = document.querySelector("[data-result]");
  const chaosBtn = document.querySelector("[data-chaos-btn]");

  if (!situationGrid || !styleGrid || !generateBtn) return; // not on this page

  let selectedSituation = null;
  let selectedStyle = null;

  situationGrid.querySelectorAll(".choice-card").forEach((card) => {
    card.addEventListener("click", () => {
      situationGrid
        .querySelectorAll(".choice-card")
        .forEach((c) => c.classList.remove("is-selected"));
      card.classList.add("is-selected");
      selectedSituation = card.dataset.situation;
      errorBox.hidden = true;
    });
  });

  styleGrid.querySelectorAll(".choice-card").forEach((card) => {
    card.addEventListener("click", () => {
      styleGrid
        .querySelectorAll(".choice-card")
        .forEach((c) => c.classList.remove("is-selected"));
      card.classList.add("is-selected");
      selectedStyle = card.dataset.style;
      errorBox.hidden = true;
    });
  });

  generateBtn.addEventListener("click", () => {
    if (!selectedSituation || !selectedStyle) {
      errorBox.hidden = false;
      errorBox.textContent =
        "Whoa! Even excuses need some information. 😂 Please choose your options.";
      errorBox.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    runGenerationSequence(selectedSituation, selectedStyle);
  });

  if (chaosBtn) {
    chaosBtn.addEventListener("click", () => {
      runGenerationSequence("random", "random");
    });
  }

  function runGenerationSequence(situationKey, style) {
    resultBox.hidden = true;
    errorBox.hidden = true;
    loadingBox.hidden = false;

    const lines = [
      "Consulting the excuse department... 🤖",
      "Searching for creativity... 🔍",
      "Almost there... 😂"
    ];
    const lineEl = loadingBox.querySelector(".loading-line");
    let i = 0;
    lineEl.textContent = lines[0];

    const interval = setInterval(() => {
      i++;
      if (i < lines.length) {
        lineEl.textContent = lines[i];
      }
    }, 550);

    setTimeout(() => {
      clearInterval(interval);
      loadingBox.hidden = true;
      const excuse = generateExcuse(situationKey, style);
      renderResult(excuse);
    }, 550 * lines.length + 200);
  }

  function renderResult(excuse) {
    resultBox.hidden = false;
    resultBox.classList.remove("result-enter");
    void resultBox.offsetWidth; // restart animation
    resultBox.classList.add("result-enter");

    resultBox.querySelector("[data-result-tag]").textContent =
      `${excuse.situationEmoji} ${excuse.situationLabel} · ${excuse.styleEmoji} ${excuse.styleLabel}`;
    resultBox.querySelector("[data-result-text]").textContent = excuse.text;
    resultBox.querySelector("[data-result-creativity]").textContent =
      starString(excuse.ratings.creativity, "⭐", "☆");
    resultBox.querySelector("[data-result-believability]").textContent =
      starString(excuse.ratings.believability, "⭐", "☆");
    resultBox.querySelector("[data-result-danger]").textContent =
      starString(excuse.ratings.danger, "🔥", "▫");
    resultBox.querySelector("[data-result-verdict]").textContent = excuse.verdict;

    const copyBtn = resultBox.querySelector("[data-copy-btn]");
    const retryBtn = resultBox.querySelector("[data-retry-btn]");
    const saveBtn = resultBox.querySelector("[data-save-btn]");
    const shareBtn = resultBox.querySelector("[data-share-btn]");
    const copyStatus = resultBox.querySelector("[data-copy-status]");

    copyBtn.onclick = () => {
      copyExcuse(excuse, (ok) => {
        copyStatus.hidden = false;
        copyStatus.textContent = ok
          ? "Copied! Now go and face the consequences. 😂"
          : "Couldn't copy — your browser blocked it. 😬";
        setTimeout(() => (copyStatus.hidden = true), 2400);
      });
    };

    retryBtn.onclick = () => runGenerationSequence(excuse.situation, excuse.style);

    saveBtn.onclick = () => {
      saveExcuse(excuse);
      flashButton(saveBtn, "❤️ Saved!");
      refreshSavedList();
    };

    shareBtn.onclick = () => {
      shareExcuse(excuse, (text) => {
        navigator.clipboard.writeText(text).catch(() => {});
        copyStatus.hidden = false;
        copyStatus.textContent = "Sharing isn't supported here — copied instead! 📋";
        setTimeout(() => (copyStatus.hidden = true), 2400);
      });
    };

    resultBox.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

// -------------------------------------------------------------------------
// 9. "MY EXCUSES" (saved list) — shown on generator.html
// -------------------------------------------------------------------------
function refreshSavedList() {
  const list = document.querySelector("[data-saved-list]");
  const empty = document.querySelector("[data-saved-empty]");
  if (!list) return;

  const saved = getSavedExcuses();
  list.innerHTML = "";

  if (!saved.length) {
    if (empty) empty.hidden = false;
    return;
  }
  if (empty) empty.hidden = true;

  saved.forEach((excuse) => {
    const item = document.createElement("li");
    item.className = "saved-item";
    item.innerHTML = `
      <div class="saved-item-meta">${excuse.situationEmoji} ${excuse.situationLabel} · ${excuse.styleEmoji} ${excuse.styleLabel}</div>
      <p class="saved-item-text">"${excuse.text}"</p>
      <button class="btn btn-ghost btn-small" type="button" aria-label="Delete saved excuse">🗑️ Delete</button>
    `;
    item.querySelector("button").addEventListener("click", () => {
      deleteSavedExcuse(excuse.id);
      refreshSavedList();
    });
    list.appendChild(item);
  });
}

function initTabs() {
  const tabButtons = document.querySelectorAll("[data-tab-target]");
  const panels = document.querySelectorAll("[data-tab-panel]");
  if (!tabButtons.length) return;

  function activate(name) {
    tabButtons.forEach((b) =>
      b.classList.toggle("is-active", b.dataset.tabTarget === name)
    );
    panels.forEach((p) => (p.hidden = p.dataset.tabPanel !== name));
    if (name === "saved") refreshSavedList();
  }

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      activate(btn.dataset.tabTarget);
      history.replaceState(null, "", `#${btn.dataset.tabTarget}`);
    });
  });

  const hash = window.location.hash.replace("#", "");
  const validTabs = [...tabButtons].map((b) => b.dataset.tabTarget);
  activate(validTabs.includes(hash) ? hash : "generator");

  if (hash === "chaos") {
    const chaosSection = document.getElementById("chaos");
    if (chaosSection) {
      setTimeout(() => chaosSection.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
    }
  }
}

// -------------------------------------------------------------------------
// 10. BOOT
// -------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initHomepage();
  initGenerator();
  initTabs();
});
