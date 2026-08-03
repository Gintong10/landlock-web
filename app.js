(() => {
  "use strict";

  const storeLink = document.getElementById("store-link");
  const hint = document.getElementById("hint");
  const href =
    window.__LANDLOCK_STORE_URL__ ||
    "https://apps.apple.com/us/app/landlock/id6789275579?mt=8&ct=instagram_bio";

  if (storeLink) storeLink.href = href;

  if (document.documentElement.classList.contains("in-app") && hint) {
    hint.textContent = "Tap Get the app to open the App Store";
  }
})();
