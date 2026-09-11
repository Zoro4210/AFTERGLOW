const header = document.querySelector("[data-header]");
const progress = document.querySelector(".scroll-progress span");
const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".site-nav");
const dialog = document.querySelector("[data-guest-dialog]");
const form = document.querySelector("[data-guest-form]");
const success = document.querySelector("[data-dialog-success]");
const eventSelect = document.querySelector("[data-event-select]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const musicToggle = document.querySelector("[data-music-toggle]");
const backgroundAudio = document.querySelector("[data-background-audio]");
const musicBars = musicToggle ? [...musicToggle.querySelectorAll(".music-waveform i")] : [];
let waveformTimer = null;

document.querySelector("[data-year]").textContent = new Date().getFullYear();

const settleWaveform = () => {
  musicBars.forEach((bar) => {
    bar.style.height = "4px";
  });
};

const animateWaveform = () => {
  musicBars.forEach((bar) => {
    bar.style.height = `${Math.round(Math.random() * 12 + 4)}px`;
  });
};

const updateMusicState = (isPlaying) => {
  musicToggle?.classList.toggle("is-playing", isPlaying);
  musicToggle?.setAttribute("aria-pressed", String(isPlaying));
  musicToggle?.setAttribute(
    "aria-label",
    isPlaying ? "Pause background music" : "Play background music",
  );
  if (waveformTimer) {
    window.clearInterval(waveformTimer);
    waveformTimer = null;
  }

  if (isPlaying && !reduceMotion) {
    animateWaveform();
    waveformTimer = window.setInterval(animateWaveform, 110);
  } else {
    settleWaveform();
  }
};

if (musicToggle && backgroundAudio) {
  musicToggle.addEventListener("click", async () => {
    if (!backgroundAudio.paused) {
      backgroundAudio.pause();
      return;
    }

    try {
      await backgroundAudio.play();
    } catch {
      updateMusicState(false);
    }
  });

  backgroundAudio.addEventListener("play", () => updateMusicState(true));
  backgroundAudio.addEventListener("pause", () => updateMusicState(false));
  backgroundAudio.addEventListener("ended", () => updateMusicState(false));
  backgroundAudio.addEventListener("error", () => updateMusicState(false));
  settleWaveform();
}

const closeMenu = () => {
  menuToggle.setAttribute("aria-expanded", "false");
  navigation.classList.remove("open");
  document.body.classList.remove("menu-open");
};

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  navigation.classList.toggle("open", !isOpen);
  document.body.classList.toggle("menu-open", !isOpen);
});

navigation.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

const updateScroll = () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
  progress.style.transform = `scaleX(${ratio})`;
  header.classList.toggle("scrolled", window.scrollY > 24);

  if (!reduceMotion && window.scrollY < window.innerHeight * 1.2) {
    document.documentElement.style.setProperty("--hero-shift", `${window.scrollY * 0.16}px`);
  }
};

updateScroll();
window.addEventListener("scroll", updateScroll, { passive: true });

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -6%" },
);

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

const detailGrid = document.querySelector("[data-highlight-grid]");
const detailHighlight = document.querySelector("[data-room-highlight]");
const detailCards = detailGrid ? [...detailGrid.querySelectorAll(".detail-card")] : [];
let activeDetailCard = detailCards[0] || null;

const moveDetailHighlight = (card, immediate = false) => {
  if (!detailGrid || !detailHighlight || !card) return;

  const cardRect = card.getBoundingClientRect();
  const gridRect = detailGrid.getBoundingClientRect();

  if (immediate) detailHighlight.style.transitionDuration = "0ms";
  detailHighlight.style.width = `${cardRect.width}px`;
  detailHighlight.style.height = `${cardRect.height}px`;
  detailHighlight.style.transform = `translate3d(${cardRect.left - gridRect.left}px, ${cardRect.top - gridRect.top}px, 0)`;
  detailHighlight.style.backgroundColor = card.dataset.highlightColor;

  detailCards.forEach((item) => item.classList.toggle("is-active", item === card));
  activeDetailCard = card;

  if (immediate) {
    requestAnimationFrame(() => {
      detailHighlight.style.transitionDuration = "360ms";
    });
  }
};

if (activeDetailCard) {
  requestAnimationFrame(() => moveDetailHighlight(activeDetailCard, true));

  detailCards.forEach((card) => {
    card.addEventListener("pointerenter", () => moveDetailHighlight(card));
    card.addEventListener("pointerdown", () => moveDetailHighlight(card));
    card.addEventListener("transitionend", (event) => {
      if (event.propertyName === "transform" && card === activeDetailCard) {
        moveDetailHighlight(card, true);
      }
    });
  });

  const realignDetailHighlight = () => moveDetailHighlight(activeDetailCard, true);
  const detailResizeObserver = new ResizeObserver(realignDetailHighlight);
  detailResizeObserver.observe(detailGrid);
  window.addEventListener("resize", realignDetailHighlight);
}

const openDialog = (eventName = "") => {
  form.hidden = false;
  success.hidden = true;
  form.reset();
  if (eventName) eventSelect.value = eventName;
  if (typeof dialog.showModal === "function") dialog.showModal();
};

document.querySelectorAll("[data-open-guest-list]").forEach((button) => {
  button.addEventListener("click", () => openDialog());
});

document.querySelectorAll("[data-event]").forEach((button) => {
  button.addEventListener("click", () => openDialog(button.dataset.event));
});

document.querySelectorAll("[data-close-dialog]").forEach((button) => {
  button.addEventListener("click", () => dialog.close());
});

dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  form.hidden = true;
  success.hidden = false;
});
