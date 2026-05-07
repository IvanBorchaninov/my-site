(() => {
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Year in footer
  const yearEl = qs("[data-year]");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Mobile nav toggle
  const nav = qs("[data-nav]");
  const toggle = qs("[data-nav-toggle]");
  if (nav && toggle) {
    const setOpen = (open) => {
      nav.dataset.open = open ? "true" : "false";
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    };

    setOpen(false);

    toggle.addEventListener("click", () => {
      const open = nav.dataset.open !== "true";
      setOpen(open);
    });

    // Close on link click
    qsa("a[href^=\"#\"]", nav).forEach((a) => {
      a.addEventListener("click", () => setOpen(false));
    });

    // Close on outside click (mobile)
    document.addEventListener("click", (e) => {
      if (nav.dataset.open !== "true") return;
      if (nav.contains(e.target) || toggle.contains(e.target)) return;
      setOpen(false);
    });
  }

  // Smooth scroll for in-page anchors
  qsa("a[href^=\"#\"]").forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href || href === "#") return;
      const target = qs(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.pushState(null, "", href);
    });
  });

  // Demo: prevent form submission (no backend)
  const form = qs("[data-contact-form]");
  const hint = qs("[data-form-hint]");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (hint) hint.textContent = "Готово: это демо-форма (данные никуда не отправляются).";
    });
  }

  // Filters: range + number inputs sync and reset
  const rangeEl = qs('.price-range__input');
  const inputMin = qs('.price-input--min');
  const inputMax = qs('.price-input--max');
  const resetBtn = qs('.filters__btn--ghost');

  // Helper to clamp values
  const clamp = (v, a, b) => Math.min(b, Math.max(a, Number(v) || 0));

  if (rangeEl && inputMin && inputMax) {
    const minAllowed = Number(rangeEl.min);
    const maxAllowed = Number(rangeEl.max);

    // moving the single slider will change the "maximum" value (right field)
    rangeEl.addEventListener('input', () => {
      const v = clamp(rangeEl.value, minAllowed, maxAllowed);
      // according to your instruction: slider controls left field — interpret as minimum
      // user requested: "ползунок изменяет только левое поле" -> change inputMin
      inputMin.value = v;
    });

    // sync number fields to slider when changed
    inputMin.addEventListener('change', () => {
      const v = clamp(inputMin.value, minAllowed, maxAllowed);
      inputMin.value = v;
      // reflect in slider
      rangeEl.value = v;
    });

    inputMax.addEventListener('change', () => {
      const v = clamp(inputMax.value, minAllowed, maxAllowed);
      inputMax.value = v;
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (rangeEl && inputMin && inputMax) {
        const minAllowed = Number(rangeEl.min);
        const maxAllowed = Number(rangeEl.max);
        rangeEl.value = minAllowed;
        inputMin.value = minAllowed;
        inputMax.value = maxAllowed;
      }
      qsa('.filters__list input[type="checkbox"]').forEach(cb => cb.checked = false);
    });
  }

  // Demo account (login/profile) on account.html
  const accountRoot = qs("[data-account-root]");
  if (accountRoot) {
    const KEY = "detailpro_demo_auth";
    const loginPanel = qs("[data-account-login]", accountRoot);
    const profilePanel = qs("[data-account-profile]", accountRoot);
    const loginForm = qs("[data-login-form]", accountRoot);
    const logoutBtn = qs("[data-logout]", accountRoot);
    const nameEl = qs("[data-profile-name]", accountRoot);
    const emailEl = qs("[data-profile-email]", accountRoot);
    const loginHint = qs("[data-login-hint]", accountRoot);

    const readAuth = () => {
      try {
        return JSON.parse(localStorage.getItem(KEY) || "null");
      } catch {
        return null;
      }
    };

    const writeAuth = (value) => {
      localStorage.setItem(KEY, JSON.stringify(value));
    };

    const setMode = (mode, auth) => {
      if (loginPanel) loginPanel.hidden = mode !== "login";
      if (profilePanel) profilePanel.hidden = mode !== "profile";
      if (mode === "profile" && auth) {
        if (nameEl) nameEl.textContent = auth.name || "Пользователь";
        if (emailEl) emailEl.textContent = auth.email || "—";
      }
    };

    const auth = readAuth();
    setMode(auth ? "profile" : "login", auth);

    if (loginForm) {
      loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const fd = new FormData(loginForm);
        const email = String(fd.get("email") || "").trim();
        const name = email ? email.split("@")[0] : "Пользователь";
        const data = { email, name };
        writeAuth(data);
        if (loginHint) loginHint.textContent = "Вход выполнен (демо).";
        setMode("profile", data);
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        localStorage.removeItem(KEY);
        setMode("login", null);
      });
    }
  }
})();
