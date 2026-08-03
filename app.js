(() => {
  "use strict";

  const PROVIDER_TOKEN = "";
  const APP_ID = "6789275579";
  const STORE_HTTPS = `https://apps.apple.com/us/app/landlock/id${APP_ID}`;

  const titleEl = document.getElementById("title");
  const subtitleEl = document.getElementById("subtitle");
  const storeLink = document.getElementById("store-link");

  const params = new URLSearchParams(window.location.search);
  const src = (params.get("src") || params.get("ct") || params.get("c") || "instagram_bio")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 40) || "instagram_bio";

  function storeUrl() {
    const url = new URL(STORE_HTTPS);
    url.searchParams.set("mt", "8");
    url.searchParams.set("ct", src);
    if (PROVIDER_TOKEN) url.searchParams.set("pt", PROVIDER_TOKEN);
    const medium = params.get("utm_medium");
    const campaign = params.get("utm_campaign");
    if (params.get("utm_source")) url.searchParams.set("utm_source", params.get("utm_source"));
    if (medium) url.searchParams.set("utm_medium", medium);
    if (campaign) url.searchParams.set("utm_campaign", campaign);
    return url.toString();
  }

  const ua = navigator.userAgent || "";
  const isIOS =
    /iPhone|iPad|iPod/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/i.test(ua);
  const isInstagram = /Instagram|Barcelona/i.test(ua);
  const isFacebook = /FBAN|FBAV|FB_IAB|Messenger/i.test(ua);
  const href = storeUrl();

  if (storeLink) storeLink.href = href;

  function showFallback() {
    document.documentElement.classList.add("fallback");
    if (titleEl) {
      titleEl.innerHTML = 'Almost <span class="accent">there</span>';
    }
    if (subtitleEl) {
      subtitleEl.textContent = "Tap below to grab the app.";
    }
  }

  function watchEscape(timeoutMs) {
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
      if (!left) showFallback();
    }, timeoutMs);
  }

  // Cloey-style Instagram breakout: ask Instagram to open Safari with the
  // App Store URL. That avoids the blank white in-app browser page.
  function breakOutToStore() {
    if (isIOS && isInstagram) {
      window.location.href =
        "instagram://extbrowser/?url=" + encodeURIComponent(href);
      return true;
    }
    if (isIOS && isFacebook) {
      window.open("x-safari-" + href, "_blank");
      return true;
    }
    if (isAndroid) {
      const bare = href.replace(/^https?:\/\//, "");
      window.location.href = `intent://${bare}#Intent;scheme=https;end`;
      return true;
    }
    return false;
  }

  if (storeLink) {
    storeLink.addEventListener("click", (event) => {
      if (!isInstagram && !isFacebook) return;
      event.preventDefault();
      breakOutToStore();
      watchEscape(1500);
    });
  }

  if (isIOS && isInstagram) {
    breakOutToStore();
    watchEscape(1800);
    return;
  }

  if (isIOS || isAndroid) {
    window.location.replace(href);
    watchEscape(1800);
    return;
  }

  // Desktop: keep the landing page visible with the store button.
  showFallback();
})();
