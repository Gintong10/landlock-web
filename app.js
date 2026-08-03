(() => {
  "use strict";

  const PROVIDER_TOKEN = "";
  const APP_ID = "6789275579";
  const STORE_HTTPS = `https://apps.apple.com/us/app/landlock/id${APP_ID}`;

  const titleEl = document.getElementById("title");
  const subtitleEl = document.getElementById("subtitle");
  const storeLink = document.getElementById("store-link");
  const hintEl = document.querySelector(".hint");

  const params = new URLSearchParams(window.location.search);
  const ua = navigator.userAgent || "";

  const isIOS =
    /iPhone|iPad|iPod/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/i.test(ua);
  const isInstagram = /Instagram|Barcelona/i.test(ua);
  const isFacebook = /FBAN|FBAV|FB_IAB|Messenger/i.test(ua);
  const isTikTok = /TikTok|Bytedance|ByteLocale|musical_ly|TTWebView/i.test(ua);
  const isInApp = isInstagram || isFacebook || isTikTok;

  function campaignToken() {
    const raw =
      params.get("src") ||
      params.get("ct") ||
      params.get("c") ||
      (isTikTok ? "tiktok" : isInstagram ? "instagram_bio" : "web");
    return (
      String(raw)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_-]/g, "")
        .slice(0, 40) || "web"
    );
  }

  function storeUrl() {
    const url = new URL(STORE_HTTPS);
    url.searchParams.set("mt", "8");
    url.searchParams.set("ct", campaignToken());
    if (PROVIDER_TOKEN) url.searchParams.set("pt", PROVIDER_TOKEN);
    return url.toString();
  }

  const href = storeUrl();
  if (storeLink) storeLink.href = href;

  function showFallback(kind) {
    document.documentElement.classList.add("fallback");
    if (titleEl) {
      titleEl.innerHTML = 'Almost <span class="accent">there</span>';
    }
    if (subtitleEl) {
      subtitleEl.textContent =
        kind === "tiktok"
          ? "TikTok blocks auto-open. Tap below, or ••• → Open in Safari."
          : "Tap below to grab the app.";
    }
    if (hintEl && kind === "tiktok") {
      hintEl.textContent = "Or tap ••• and choose Open in Browser";
    }
  }

  function watchEscape(timeoutMs, kind) {
    let left = false;
    const markLeft = () => {
      left = true;
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") markLeft();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", markLeft);
    window.addEventListener("blur", markLeft);
    window.setTimeout(() => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", markLeft);
      window.removeEventListener("blur", markLeft);
      if (!left) showFallback(kind);
    }, timeoutMs);
  }

  function breakOutToStore() {
    if (isIOS && isInstagram) {
      window.location.href =
        "instagram://extbrowser/?url=" + encodeURIComponent(href);
      return true;
    }
    if (isIOS && isFacebook) {
      window.location.href = "x-safari-" + href;
      return true;
    }
    // TikTok / other iOS webviews: no reliable silent escape scheme.
    // A user tap on the store link is the path that works.
    if (isAndroid) {
      const bare = href.replace(/^https?:\/\//, "");
      window.location.href =
        "intent://" + bare + "#Intent;scheme=https;package=com.android.vending;end";
      return true;
    }
    return false;
  }

  if (storeLink) {
    storeLink.addEventListener("click", (event) => {
      if (isIOS && (isInstagram || isFacebook)) {
        event.preventDefault();
        breakOutToStore();
        watchEscape(1500, isInstagram ? "instagram" : "facebook");
      }
      // TikTok / Safari: let the normal https App Store link proceed.
    });
  }

  // Already redirected from the head script (Safari / Chrome).
  if (window.__LANDLOCK_REDIRECTED__) return;

  if (isIOS && isInstagram) {
    breakOutToStore();
    watchEscape(1800, "instagram");
    return;
  }

  if (isIOS && isFacebook) {
    breakOutToStore();
    watchEscape(1800, "facebook");
    return;
  }

  if (isTikTok) {
    // Try App Store HTTPS; TikTok often blocks this until the user taps.
    window.location.replace(href);
    watchEscape(1200, "tiktok");
    return;
  }

  if (isIOS || isAndroid) {
    window.location.replace(href);
    watchEscape(1800, "mobile");
    return;
  }

  showFallback("desktop");
})();
