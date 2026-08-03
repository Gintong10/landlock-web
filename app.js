(() => {
  "use strict";

  // Keep in sync with PROVIDER_TOKEN in index.html
  const PROVIDER_TOKEN = "";
  const APP_ID = "6789275579";
  const STORE_HTTPS = `https://apps.apple.com/us/app/landlock/id${APP_ID}`;

  const params = new URLSearchParams(window.location.search);

  function campaignToken() {
    const raw =
      params.get("ct") ||
      params.get("utm_campaign") ||
      params.get("c") ||
      "instagram_bio";
    return (
      String(raw)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_-]/g, "")
        .slice(0, 40) || "instagram_bio"
    );
  }

  function httpsStoreUrl() {
    const url = new URL(STORE_HTTPS);
    url.searchParams.set("mt", "8");
    url.searchParams.set("ct", campaignToken());
    if (PROVIDER_TOKEN) url.searchParams.set("pt", PROVIDER_TOKEN);
    return url.toString();
  }

  const href = httpsStoreUrl();
  const storeLink = document.getElementById("store-link");
  const openLink = document.getElementById("open-link");
  if (storeLink) storeLink.href = href;
  if (openLink) openLink.href = href;
})();
