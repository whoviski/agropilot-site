(() => {
  const KEY = 'agropilot-consent';
  const YEAR_MS = 365 * 24 * 60 * 60 * 1000;
  // Optional third-party scripts. The list is empty: the site does not ship any.
  // A script placed here loads only after a saved choice allows its category.
  const OPTIONAL_SCRIPTS = [];

  const memory = { current: null };

  const read = () => {
    if (memory.current && memory.current.expires > Date.now()) return memory.current;
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data || data.necessary !== true || typeof data.expires !== 'number' || data.expires < Date.now()) {
        localStorage.removeItem(KEY);
        return null;
      }
      memory.current = data;
      return data;
    } catch (error) {
      return null;
    }
  };

  const apply = (choice) => {
    OPTIONAL_SCRIPTS.forEach((item) => {
      if (!choice[item.category]) return;
      if (document.querySelector('script[data-consent-src="' + item.src + '"]')) return;
      const script = document.createElement('script');
      script.src = item.src;
      script.async = true;
      script.dataset.consentSrc = item.src;
      document.head.appendChild(script);
    });
  };

  const write = (functional, analytics) => {
    const data = {
      necessary: true,
      functional: !!functional,
      analytics: !!analytics,
      expires: Date.now() + YEAR_MS
    };
    memory.current = data;
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (error) {
      /* Private mode can block storage. The choice still applies for this page view. */
    }
    apply(data);
    return data;
  };

  const banner = document.createElement('div');
  banner.id = 'cookie-banner';
  banner.className = 'cookie-banner';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-labelledby', 'cookie-title');
  banner.setAttribute('aria-describedby', 'cookie-desc');
  banner.hidden = true;
  banner.innerHTML = '<h2 id="cookie-title">Файлы cookie</h2>'
    + '<p id="cookie-desc">Сайт запоминает только ваш выбор категорий. Он не подключает аналитику, рекламу и другие сторонние скрипты. Подробности — в <a href="cookies.html">Политике cookie</a> и <a href="privacy.html">Политике конфиденциальности</a>.</p>'
    + '<div class="cookie-actions">'
    + '<button type="button" class="is-primary" data-consent="all">Принять все</button>'
    + '<button type="button" data-consent="necessary">Только необходимые</button>'
    + '<button type="button" data-consent="settings">Настроить</button>'
    + '</div>';

  const overlay = document.createElement('div');
  overlay.id = 'cookie-settings';
  overlay.className = 'cookie-overlay';
  overlay.hidden = true;
  overlay.innerHTML = '<div class="cookie-panel" role="dialog" aria-modal="true" aria-labelledby="cookie-settings-title">'
    + '<h2 id="cookie-settings-title">Настройки cookie</h2>'
    + '<p>Необязательные категории сейчас никуда не отправляют данные: отдельных скриптов для них в коде нет. Галочка сохраняется в браузере на случай, если такие скрипты появятся, и сама по себе их не включает.</p>'
    + '<label class="cookie-option"><input type="checkbox" checked disabled><div><strong>Строго необходимые</strong><span>Одна запись localStorage с ключом agropilot-consent. Без неё выбор не запоминается. Отключить нельзя.</span></div></label>'
    + '<label class="cookie-option"><input type="checkbox" id="cookie-functional"><div><strong>Функциональные</strong><span>Сейчас не используются: других ключей localStorage, sessionStorage и cookie код не создаёт.</span></div></label>'
    + '<label class="cookie-option"><input type="checkbox" id="cookie-analytics"><div><strong>Аналитические</strong><span>Сейчас не используются: счётчики и рекламные пиксели не подключаются.</span></div></label>'
    + '<div class="cookie-actions">'
    + '<button type="button" class="is-primary" id="cookie-save">Сохранить</button>'
    + '<button type="button" id="cookie-all">Принять все</button>'
    + '<button type="button" id="cookie-necessary">Только необходимые</button>'
    + '</div></div>';

  document.body.append(banner, overlay);
  const panel = overlay.querySelector('.cookie-panel');
  const functionalInput = overlay.querySelector('#cookie-functional');
  const analyticsInput = overlay.querySelector('#cookie-analytics');
  let returnFocus = null;

  const showBanner = () => { banner.hidden = false; };
  const hideBanner = () => { banner.hidden = true; };

  const syncInputs = (choice) => {
    functionalInput.checked = !!(choice && choice.functional);
    analyticsInput.checked = !!(choice && choice.analytics);
  };

  const closeSettings = () => {
    overlay.hidden = true;
    banner.removeAttribute('aria-hidden');
    document.body.classList.remove('cookie-lock');
    if (returnFocus && returnFocus.offsetParent !== null) returnFocus.focus();
  };

  const openSettings = (opener) => {
    returnFocus = opener || document.activeElement;
    syncInputs(read());
    banner.setAttribute('aria-hidden', 'true');
    overlay.hidden = false;
    document.body.classList.add('cookie-lock');
    functionalInput.focus();
  };

  const finish = (functional, analytics) => {
    write(functional, analytics);
    hideBanner();
    closeSettings();
  };

  banner.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.dataset.consent === 'all') finish(true, true);
    else if (button.dataset.consent === 'necessary') finish(false, false);
    else openSettings(button);
  });

  overlay.querySelector('#cookie-save').addEventListener('click', () => {
    finish(functionalInput.checked, analyticsInput.checked);
  });
  overlay.querySelector('#cookie-all').addEventListener('click', () => finish(true, true));
  overlay.querySelector('#cookie-necessary').addEventListener('click', () => finish(false, false));

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) closeSettings();
  });

  document.addEventListener('click', (event) => {
    const opener = event.target.closest('[data-cookie-settings]');
    if (opener) openSettings(opener);
  });

  document.addEventListener('keydown', (event) => {
    if (overlay.hidden) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeSettings();
      return;
    }
    if (event.key !== 'Tab') return;
    const items = [...panel.querySelectorAll('a, button, input')].filter((item) => !item.disabled);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  const saved = read();
  if (saved) apply(saved);
  else showBanner();
})();
