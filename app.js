"use strict";

/*
=========================================================
 VIDEO HUB - USER APP
=========================================================

Important:
- Published data comes from the backend.
- User cannot change coin balance from this JS.
- Premium status must be verified server-side.
- Do not put service-role/secret keys here.
=========================================================
*/


const CONFIG =
  window.VIDEO_HUB_CONFIG || {};

const API_URL =
  CONFIG.API_URL || "";


let siteData = {
  settings: {},
  categories: [],
  videos: [],
  ads: [],
  premiumPlans: []
};


let currentVideo = null;

let currentPremiumPlan = null;

let userProfile = null;


/* =======================================================
   HELPERS
======================================================= */


function $(id) {
  return document.getElementById(id);
}


function escapeHtml(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


function getAuthToken() {

  /*
    Your authentication layer should store the
    current access token after successful login.

    Example:
      sessionStorage.setItem(
        "videoHubAccessToken",
        session.access_token
      );
  */

  return sessionStorage.getItem(
    "videoHubAccessToken"
  );

}


async function apiFetch(
  path,
  options = {}
) {

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };


  const token =
    getAuthToken();


  if (token) {

    headers.Authorization =
      `Bearer ${token}`;

  }


  const response =
    await fetch(
      `${API_URL}${path}`,
      {
        ...options,
        headers
      }
    );


  let data = null;


  try {

    data =
      await response.json();

  } catch {

    data = null;

  }


  if (!response.ok) {

    throw new Error(
      data?.error ||
      "Request failed."
    );

  }


  return data;

}


/* =======================================================
   LOAD PUBLISHED WEBSITE
======================================================= */


async function loadSite() {

  try {

    const data =
      await apiFetch(
        "/public/home"
      );


    siteData =
      data || siteData;


    renderSite();

    renderCategories();

    renderVideos();

    renderPremiumPlans();

    renderAds();


    await loadCurrentUser();


  } catch (error) {

    console.error(
      "Site loading failed:",
      error
    );


    /*
      Keep the page usable if backend is temporarily
      unavailable.
    */

    renderFallback();

  }

}


/* =======================================================
   SITE CONTENT
======================================================= */


function renderSite() {

  const settings =
    siteData.settings || {};


  if (
    $("siteName") &&
    settings.website_name
  ) {

    $("siteName").textContent =
      settings.website_name;

  }


  if (
    $("welcomeTitle") &&
    settings.welcome_title
  ) {

    $("welcomeTitle").textContent =
      settings.welcome_title;

  }


  if (
    $("welcomeDescription") &&
    settings.welcome_description
  ) {

    $("welcomeDescription").textContent =
      settings.welcome_description;

  }


  if (
    $("featuredTitle") &&
    settings.featured_title
  ) {

    $("featuredTitle").textContent =
      `🔥 ${settings.featured_title}`;

  }

}


/* =======================================================
   CATEGORIES
======================================================= */


function renderCategories() {

  const container =
    $("categories");


  if (!container) return;


  const categories =
    siteData.categories || [];


  container.innerHTML = "";


  const allButton =
    document.createElement("button");


  allButton.className =
    "category active";


  allButton.textContent =
    "All";


  allButton.onclick = () => {

    setActiveCategory(
      allButton
    );

    renderVideos();

  };


  container.appendChild(
    allButton
  );


  categories.forEach(
    category => {

      const button =
        document.createElement(
          "button"
        );


      button.className =
        "category";


      button.textContent =
        `${category.icon || "🎬"} ${category.name}`;


      button.onclick = () => {

        setActiveCategory(
          button
        );


        renderVideos(
          category.id
        );

      };


      container.appendChild(
        button
      );

    }
  );

}


function setActiveCategory(
  active
) {

  document
    .querySelectorAll(
      ".category"
    )
    .forEach(
      item =>
        item.classList.remove(
          "active"
        )
    );


  active.classList.add(
    "active"
  );

}


/* =======================================================
   VIDEOS
======================================================= */


function renderVideos(
  categoryId = null
) {

  const grid =
    $("videoGrid");


  if (!grid) return;


  let videos =
    [...(
      siteData.videos || []
    )];


  if (categoryId) {

    videos =
      videos.filter(
        video =>
          video.category_id ===
          categoryId
      );

  }


  videos.sort(
    (a, b) =>
      Number(b.views || 0) -
      Number(a.views || 0)
  );


  grid.innerHTML = "";


  if (!videos.length) {

    grid.innerHTML = `
      <div
        style="
          grid-column:1/-1;
          padding:35px;
          text-align:center;
          color:#858d9b;
        "
      >
        🎬 No published videos yet.
      </div>
    `;

    return;

  }


  videos.forEach(
    video => {

      const card =
        document.createElement(
          "article"
        );


      card.className =
        "video-card";


      const duration =
        formatDuration(
          video.duration_seconds
        );


      card.innerHTML = `

        <div
          class="thumbnail"
          ${
            video.thumbnail_url
              ? `style="
                  background-image:
                    url('${escapeHtml(video.thumbnail_url)}');
                  background-size:cover;
                  background-position:center;
                "`
              : ""
          }
        >

          ${
            video.thumbnail_url
              ? ""
              : `
                <div class="thumbnail-icon">
                  🎬
                </div>
              `
          }

          <span class="duration">
            ${escapeHtml(duration)}
          </span>

        </div>


        <div class="video-info">

          <div class="video-title">
            ${escapeHtml(video.title)}
          </div>


          <div class="video-meta">
            👁
            ${formatNumber(video.views)}
            views
          </div>


          <button
            class="watch-button"
            type="button"
            onclick="openVideo('${video.id}')"
          >
            ▶ Watch Video
          </button>

        </div>

      `;


      grid.appendChild(
        card
      );

    }
  );

}


function formatDuration(
  seconds
) {

  const value =
    Number(seconds || 0);


  if (!value) {
    return "00:00";
  }


  const minutes =
    Math.floor(
      value / 60
    );


  const remaining =
    value % 60;


  return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;

}


function formatNumber(
  value
) {

  const number =
    Number(value || 0);


  return number.toLocaleString();

}


/* =======================================================
   VIDEO OPEN
======================================================= */


function openVideo(
  videoId
) {

  const video =
    siteData.videos.find(
      item =>
        item.id === videoId
    );


  if (!video) return;


  currentVideo =
    video;


  if ($("modalTitle")) {

    $("modalTitle").textContent =
      video.title;

  }


  if ($("modalInfo")) {

    $("modalInfo").textContent =
      `👁 ${formatNumber(video.views)} views • ${formatDuration(video.duration_seconds)}`;

  }


  const premium =
    isPremiumUser();


  const notice =
    $("videoAdNotice");


  if (premium) {

    if (notice) {

      notice.style.display =
        "block";

      notice.textContent =
        "👑 Premium: Ad-free video.";

    }

  } else {

    if (notice) {

      notice.style.display =
        "block";

      notice.textContent =
        "Advertisement may appear while watching this video.";

    }

  }


  $("videoModal")
    ?.classList.add("show");

}


function closeVideo() {

  $("videoModal")
    ?.classList.remove(
      "show"
    );


  currentVideo =
    null;

}


/* =======================================================
   START WATCHING
======================================================= */


async function startWatching() {

  if (!currentVideo) return;


  const premium =
    isPremiumUser();


  /*
    Premium:
      video starts immediately
      no ad flow
  */

  if (premium) {

    launchVideo(
      currentVideo
    );


    return;

  }


  /*
    Free user:
      start ad → video
      mid/end ad can be handled by
      the published ad configuration.
  */

  await showStartAd();


  launchVideo(
    currentVideo
  );


  /*
    Increment view on server.
  */

  try {

    await apiFetch(
      `/videos/${currentVideo.id}/view`,
      {
        method: "POST"
      }
    );

  } catch (error) {

    console.warn(
      "View count update failed:",
      error
    );

  }

}


/* =======================================================
   VIDEO PLAYER
======================================================= */


function launchVideo(
  video
) {

  const player =
    $("videoPlayerArea");


  if (!player) return;


  if (!video.video_url) {

    player.innerHTML = `
      <div
        style="
          text-align:center;
          color:#8f97a5;
          padding:20px;
        "
      >
        Video file is not available yet.
      </div>
    `;

    return;

  }


  player.innerHTML = `

    <video
      id="mainVideo"
      controls
      playsinline
      preload="metadata"
      style="
        width:100%;
        height:100%;
        object-fit:contain;
        background:#000;
        border-radius:12px;
      "
    >

      <source
        src="${escapeHtml(video.video_url)}"
      >

      Your browser does not support video playback.

    </video>

  `;


  const element =
    $("mainVideo");


  /*
    Free-user mid/end ad hooks.

    Premium users bypass these completely.
  */

  if (!isPremiumUser()) {

    setupVideoAdSchedule(
      element,
      video
    );

  }


  element.play()
    .catch(
      () => {}
    );

}


/* =======================================================
   AD SCHEDULE
======================================================= */


function setupVideoAdSchedule(
  videoElement,
  video
) {

  if (!videoElement) return;


  let midShown =
    false;


  let endShown =
    false;


  videoElement.addEventListener(
    "timeupdate",
    async () => {

      const duration =
        Number(
          videoElement.duration || 0
        );


      const current =
        Number(
          videoElement.currentTime || 0
        );


      /*
        Minimum two ad opportunities:
          one at start
          one at end

        Long videos:
          mid ad
      */

      if (
        duration >= 180 &&
        !midShown &&
        current >= duration / 2
      ) {

        midShown = true;


        await showMidAd();

      }


      if (
        duration > 0 &&
        !endShown &&
        current >= duration - 2
      ) {

        endShown = true;


        await showEndAd();

      }

    }
  );

}


/* =======================================================
   AD HELPERS
======================================================= */


function getDirectLinkAd() {

  return (
    siteData.ads || []
  ).find(
    ad =>
      ad.type ===
        "direct_link" &&
      ad.url
  );

}


async function showStartAd() {

  if (isPremiumUser()) {
    return;
  }


  const ad =
    getDirectLinkAd();


  if (!ad) {
    return;
  }


  showAdOverlay(
    ad,
    "Starting video..."
  );

}


async function showMidAd() {

  if (isPremiumUser()) {
    return;
  }


  const ad =
    getDirectLinkAd();


  if (!ad) {
    return;
  }


  showAdOverlay(
    ad,
    "Video advertisement"
  );

}


async function showEndAd() {

  if (isPremiumUser()) {
    return;
  }


  const ad =
    getDirectLinkAd();


  if (!ad) {
    return;
  }


  showAdOverlay(
    ad,
    "Advertisement"
  );

}


function showAdOverlay(
  ad,
  label
) {

  /*
    This is intentionally a user-visible
    ad overlay with a clear close/continue
    action.

    Do not hide ad links or simulate clicks.
  */

  const overlay =
    document.createElement(
      "div"
    );


  overlay.id =
    "temporaryAdOverlay";


  overlay.style.cssText = `
    position:fixed;
    inset:0;
    z-index:9999;
    display:flex;
    align-items:center;
    justify-content:center;
    padding:20px;
    background:rgba(0,0,0,.86);
  `;


  overlay.innerHTML = `

    <div
      style="
        width:100%;
        max-width:420px;
        padding:22px;
        border-radius:18px;
        background:#151922;
        text-align:center;
      "
    >

      <div
        style="
          color:#8f97a5;
          font-size:11px;
        "
      >
        Advertisement
      </div>


      <h3
        style="
          margin-top:8px;
        "
      >
        ${escapeHtml(label)}
      </h3>


      <p
        style="
          margin-top:8px;
          color:#929aaa;
          font-size:11px;
        "
      >
        Continue after viewing the advertisement.
      </p>


      <a
        href="${escapeHtml(ad.url)}"
        target="_blank"
        rel="noopener noreferrer"
        style="
          display:block;
          margin-top:16px;
          padding:12px;
          border-radius:10px;
          background:#fff;
          color:#000;
          font-weight:bold;
          font-size:12px;
        "
      >
        Open Advertisement
      </a>


      <button
        id="closeAdOverlay"
        style="
          width:100%;
          margin-top:9px;
          padding:11px;
          border:0;
          border-radius:10px;
          background:#292f3a;
          color:#fff;
          font-weight:bold;
        "
      >
        Continue
      </button>

    </div>

  `;


  document.body.appendChild(
    overlay
  );


  $("closeAdOverlay")
    ?.addEventListener(
      "click",
      () => {

        overlay.remove();

      }
    );

}


/* =======================================================
   REWARDED AD → COINS
======================================================= */


async function watchRewardedAd() {

  if (isPremiumUser()) {

    alert(
      "Premium members do not need to watch ads."
    );


    return;

  }


  const button =
    $("watchAdButton");


  if (button) {

    button.disabled =
      true;

  }


  try {

    /*
      IMPORTANT:
      Actual coin credit must be performed
      by a secure backend transaction.

      The frontend should never send:
        "give me 25 coins"

      It should send a verified ad completion
      token/event to the backend.
    */


    const ad =
      getRewardedAd();


    if (!ad) {

      alert(
        "No rewarded advertisement is available right now."
      );


      return;

    }


    await showRewardedAd(
      ad
    );


    /*
      The final backend endpoint should verify
      the ad completion and atomically add the
      configured reward.
    */

    alert(
      "Advertisement completed. Reward is being verified."
    );


  } catch (error) {

    console.error(
      error
    );


    alert(
      error.message ||
      "Advertisement could not be completed."
    );

  } finally {

    if (button) {

      button.disabled =
        false;

    }

  }

}


function getRewardedAd() {

  return (
    siteData.ads || []
  ).find(
    ad =>
      ad.enabled !== false &&
      ad.reward_enabled === true
  );

}


async function showRewardedAd(
  ad
) {

  return new Promise(
    resolve => {

      const overlay =
        document.createElement(
          "div"
        );


      overlay.style.cssText = `
        position:fixed;
        inset:0;
        z-index:10000;
        display:flex;
        align-items:center;
        justify-content:center;
        background:rgba(0,0,0,.9);
        padding:20px;
      `;


      let seconds =
        10;


      overlay.innerHTML = `

        <div
          style="
            width:100%;
            max-width:400px;
            padding:22px;
            border-radius:18px;
            background:#151922;
            text-align:center;
          "
        >

          <div
            style="
              font-size:11px;
              color:#8f97a5;
            "
          >
            Rewarded Advertisement
          </div>


          <div
            id="rewardAdTimer"
            style="
              margin-top:15px;
              font-size:30px;
              font-weight:bold;
            "
          >
            ${seconds}
          </div>


          <p
            style="
              margin-top:7px;
              color:#929aaa;
              font-size:11px;
            "
          >
            Please watch the advertisement.
          </p>


          <a
            href="${escapeHtml(ad.url || "#")}"
            target="_blank"
            rel="noopener noreferrer"
            style="
              display:block;
              margin-top:16px;
              padding:12px;
              border-radius:10px;
              background:#fff;
              color:#000;
              font-weight:bold;
            "
          >
            View Ad
          </a>

        </div>

      `;


      document.body.appendChild(
        overlay
      );


      const timer =
        setInterval(
          () => {

            seconds -= 1;


            const element =
              overlay.querySelector(
                "#rewardAdTimer"
              );


            if (element) {

              element.textContent =
                String(seconds);

            }


            if (seconds <= 0) {

              clearInterval(
                timer
              );


              overlay.remove();


              resolve();

            }

          },
          1000
        );

    }
  );

}


/* =======================================================
   USER PROFILE / COINS
======================================================= */


async function loadCurrentUser() {

  const token =
    getAuthToken();


  if (!token) {

    renderLoggedOutState();

    return;

  }


  try {

    const data =
      await apiFetch(
        "/me"
      );


    userProfile =
      data.profile;


    updateCoinDisplay();

    renderPremiumStatus();


  } catch (error) {

    console.warn(
      "Could not load user:",
      error
    );

  }

}


function updateCoinDisplay() {

  const coins =
    Number(
      userProfile?.coins || 0
    );


  if ($("coinBalance")) {

    $("coinBalance").textContent =
      formatNumber(coins);

  }


  if ($("coinBalanceLarge")) {

    $("coinBalanceLarge").textContent =
      `${formatNumber(coins)} 🪙`;

  }

}


/* =======================================================
   PREMIUM
======================================================= */


function isPremiumUser() {

  /*
    IMPORTANT:
    This value is only a UI helper.

    Real Premium authorization must be checked
    by the backend before ads/content are served.
  */

  return Boolean(
    userProfile?.premium_active
  );

}


function renderPremiumStatus() {

  const premiumCard =
    $("premiumCard");


  const coinArea =
    $("coinArea");


  const purchase =
    $("premiumPurchase");


  if (
    isPremiumUser()
  ) {

    if (premiumCard) {

      premiumCard.style.display =
        "block";

    }


    if (coinArea) {

      coinArea.style.display =
        "none";

    }


    if (purchase) {

      purchase.style.display =
        "none";

    }


    if ($("premiumInfo")) {

      const plan =
        userProfile?.premium_plan_name ||
        "Premium";


      const expires =
        userProfile?.premium_expires_at
          ? new Date(
              userProfile.premium_expires_at
            ).toLocaleDateString()
          : "Active";


      $("premiumInfo").textContent =
        `Plan: ${plan} • Expires: ${expires}`;

    }

  } else {

    if (premiumCard) {

      premiumCard.style.display =
        "none";

    }


    if (coinArea) {

      coinArea.style.display =
        "block";

    }


    if (purchase) {

      purchase.style.display =
        "block";

    }

  }

}


/* =======================================================
   PREMIUM PLANS
======================================================= */


function renderPremiumPlans() {

  const container =
    $("premiumPlans");


  if (!container) return;


  const plans =
    siteData.premiumPlans || [];


  container.innerHTML = "";


  if (!plans.length) {

    container.innerHTML = `
      <div
        style="
          padding:15px;
          border-radius:12px;
          background:#202630;
          color:#8f97a5;
          font-size:11px;
        "
      >
        Premium plans are currently unavailable.
      </div>
    `;

    return;

  }


  plans.forEach(
    plan => {

      const card =
        document.createElement(
          "div"
        );


      card.style.cssText = `
        padding:15px;
        border-radius:14px;
        background:#202630;
        border:1px solid #2c3440;
      `;


      const features =
        Array.isArray(
          plan.features
        )
          ? plan.features
          : [];


      card.innerHTML = `

        <strong>
          👑 ${escapeHtml(plan.name)}
        </strong>


        <div
          style="
            margin-top:7px;
            font-size:18px;
            font-weight:bold;
          "
        >
          ${escapeHtml(plan.price)}
        </div>


        <div
          style="
            margin-top:4px;
            color:#8f97a5;
            font-size:11px;
          "
        >
          ${escapeHtml(plan.duration_days)}
          days
        </div>


        <div
          style="
            margin-top:10px;
            color:#b5bdca;
            font-size:11px;
            line-height:1.7;
          "
        >
          ${
            features.length
              ? features
                  .map(
                    item =>
                      `✅ ${escapeHtml(item)}`
                  )
                  .join("<br>")
              : "✅ Ad-Free Video Watching"
          }
        </div>


        <button
          class="watch-button"
          style="
            margin-top:12px;
          "
          type="button"
        >
          💎 Purchase Premium
        </button>

      `;


      card
        .querySelector(
          "button"
        )
        .addEventListener(
          "click",
          () =>
            openPremiumPayment(
              plan
            )
        );


      container.appendChild(
        card
      );

    }
  );

}


/* =======================================================
   PREMIUM PAYMENT
======================================================= */


function openPremiumPayment(
  plan
) {

  currentPremiumPlan =
    plan;


  const target =
    $("selectedPremiumPlan");


  if (target) {

    target.innerHTML = `

      <strong>
        👑 ${escapeHtml(plan.name)}
      </strong>

      <div
        style="
          margin-top:7px;
          font-size:17px;
          font-weight:bold;
        "
      >
        ${escapeHtml(plan.price)}
      </div>

      <div
        style="
          margin-top:4px;
          color:#8f97a5;
          font-size:11px;
        "
      >
        ${escapeHtml(plan.duration_days)}
        days Premium
      </div>

    `;

  }


  setupPaymentLinks();


  $("premiumPaymentModal")
    ?.classList.add(
      "show"
    );

}


function closePremiumPayment() {

  $("premiumPaymentModal")
    ?.classList.remove(
      "show"
    );


  currentPremiumPlan =
    null;

}


function setupPaymentLinks() {

  const settings =
    siteData.settings || {};


  const paymentNumber =
    settings.premium_payment_number ||
    "";


  const telegram =
    settings.premium_telegram_link ||
    settings.telegram_link ||
    "";


  const whatsapp =
    settings.premium_whatsapp_link ||
    "";


  const bkash =
    $("bkashButton");


  const nagad =
    $("nagadButton");


  const telegramButton =
    $("telegramPurchaseButton");


  const whatsappButton =
    $("whatsappPurchaseButton");


  if (bkash) {

    bkash.onclick = () => {

      if (!paymentNumber) {

        alert(
          "bKash payment information is not configured yet."
        );


        return;

      }


      alert(
        `bKash payment number:\n${paymentNumber}\n\nAfter payment, contact the administrator with your payment screenshot.`
      );

    };

  }


  if (nagad) {

    nagad.onclick = () => {

      if (!paymentNumber) {

        alert(
          "Nagad payment information is not configured yet."
        );


        return;

      }


      alert(
        `Nagad payment number:\n${paymentNumber}\n\nAfter payment, contact the administrator with your payment screenshot.`
      );

    };

  }


  if (telegramButton) {

    telegramButton.onclick = () => {

      if (telegram) {

        window.open(
          telegram,
          "_blank",
          "noopener,noreferrer"
        );

      } else {

        alert(
          "Telegram contact is not configured yet."
        );

      }

    };

  }


  if (whatsappButton) {

    whatsappButton.onclick = () => {

      if (whatsapp) {

        window.open(
          whatsapp,
          "_blank",
          "noopener,noreferrer"
        );

      } else {

        alert(
          "WhatsApp contact is not configured yet."
        );

      }

    };

  }

}


/* =======================================================
   DAILY CLAIM
======================================================= */


function openDailyClaim() {

  if (isPremiumUser()) {

    alert(
      "Premium members do not need daily advertisement steps."
    );


    return;

  }


  const modal =
    $("dailyClaimModal");


  if (!modal) return;


  renderDailyRewards();


  modal.classList.add(
    "show"
  );

}


function closeDailyClaim() {

  $("dailyClaimModal")
    ?.classList.remove(
      "show"
    );

}


function renderDailyRewards() {

  const rewards = [
    25,
    50,
    75,
    100,
    125,
    150,
    600
  ];


  const container =
    $("dailyRewards");


  if (!container) return;


  container.innerHTML =
    rewards
      .map(
        (coins, index) => `

          <div
            style="
              display:flex;
              align-items:center;
              justify-content:space-between;
              padding:11px;
              border-radius:10px;
              background:#202630;
            "
          >

            <span>
              Day ${index + 1}
            </span>

            <strong>
              ${coins} 🪙
            </strong>

          </div>

        `
      )
      .join("");

}


async function claimDailyReward() {

  if (isPremiumUser()) {

    alert(
      "Premium members do not need to claim ad-based rewards."
    );


    return;

  }


  /*
    Final secure implementation:
      POST /coins/daily-claim

    Server validates:
      - logged-in user
      - current day
      - cooldown
      - required ad completion
      - reward amount
      - atomic balance update
  */

  try {

    const result =
      await apiFetch(
        "/coins/daily-claim",
        {
          method: "POST"
        }
      );


    if (
      result?.profile
    ) {

      userProfile =
        result.profile;

      updateCoinDisplay();

    }


    alert(
      result?.message ||
      "Daily reward claimed successfully."
    );


    closeDailyClaim();


  } catch (error) {

    alert(
      error.message ||
      "Daily claim is not available."
    );

  }

}


/* =======================================================
   NOTIFICATIONS
======================================================= */


function openNotifications() {

  $("notificationModal")
    ?.classList.add(
      "show"
    );

}


function closeNotifications() {

  $("notificationModal")
    ?.classList.remove(
      "show"
    );

}


/* =======================================================
   NAVIGATION
======================================================= */


function showHome() {

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


function showAllVideos() {

  const grid =
    $("videoGrid");


  if (grid) {

    grid.scrollIntoView({
      behavior: "smooth"
    });

  }

}


function showTrending() {

  showAllVideos();

}


function scrollToCoins() {

  const area =
    $("coinArea");


  if (area) {

    area.scrollIntoView({
      behavior: "smooth"
    });

  }

}


function openProfile() {

  /*
    Profile page will be connected to
    the authentication/profile module.
  */

  alert(
    "Profile section will use your authenticated account."
  );

}


/* =======================================================
   FALLBACK
======================================================= */


function renderFallback() {

  if ($("videoGrid")) {

    $("videoGrid").innerHTML = `

      <div
        style="
          grid-column:1/-1;
          padding:35px;
          text-align:center;
          color:#858d9b;
        "
      >

        <div
          style="
            font-size:30px;
            margin-bottom:10px;
          "
        >
          📡
        </div>

        Website data is temporarily unavailable.

      </div>

    `;

  }

}


/* =======================================================
   LOGGED OUT
======================================================= */


function renderLoggedOutState() {

  if ($("coinBalance")) {

    $("coinBalance").textContent =
      "0";

  }


  if ($("coinBalanceLarge")) {

    $("coinBalanceLarge").textContent =
      "0 🪙";

  }

}


/* =======================================================
   ADS RENDER
======================================================= */


function renderAds() {

  /*
    Banner placement can be added to the
    published homepage based on the admin
    ad configuration.

    Premium users must never receive ads.
  */

}


/* =======================================================
   TELEGRAM MINI APP
======================================================= */


if (
  window.Telegram &&
  window.Telegram.WebApp
) {

  window.Telegram.WebApp.ready();

  window.Telegram.WebApp.expand();

}


/* =======================================================
   START
======================================================= */


if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    loadSite
  );

} else {

  loadSite();

}
