/* =========================================================
   USER PANEL - VIDEO APP
   Updated version
   ========================================================= */

"use strict";

/* ---------------------------------------------------------
   API CONFIG
   --------------------------------------------------------- */

const API_BASE_URL = window.APP_API_URL || "/api";

/*
  Backend থেকে published data নেওয়া হবে:

  GET  /api/videos
  GET  /api/categories
  GET  /api/settings
  GET  /api/ads
  GET  /api/coins

  Backend এখনো connect না থাকলে নিচের demo data fallback
  হিসেবে ব্যবহার হবে।
*/

/* ---------------------------------------------------------
   FALLBACK VIDEO DATA
   --------------------------------------------------------- */

const fallbackVideos = [
  {
    id: "demo-1",
    title: "Amazing New Video",
    views: "125K",
    duration: "02:45",
    icon: "🎬",
    thumbnail: "",
    category: "Trending",
    videoUrl: ""
  },
  {
    id: "demo-2",
    title: "Funny Moments 😂",
    views: "98K",
    duration: "01:38",
    icon: "😂",
    thumbnail: "",
    category: "Comedy",
    videoUrl: ""
  },
  {
    id: "demo-3",
    title: "Trending Video Today",
    views: "245K",
    duration: "03:21",
    icon: "🔥",
    category: "Trending",
    videoUrl: ""
  },
  {
    id: "demo-4",
    title: "Best Short Video",
    views: "76K",
    duration: "00:59",
    icon: "⚡",
    category: "Short",
    videoUrl: ""
  },
  {
    id: "demo-5",
    title: "Comedy Collection",
    views: "154K",
    duration: "04:10",
    icon: "🤣",
    category: "Comedy",
    videoUrl: ""
  },
  {
    id: "demo-6",
    title: "Action Highlights",
    views: "187K",
    duration: "02:58",
    icon: "💥",
    category: "Action",
    videoUrl: ""
  },
  {
    id: "demo-7",
    title: "Entertainment Video",
    views: "64K",
    duration: "01:47",
    icon: "⭐",
    category: "Entertainment",
    videoUrl: ""
  },
  {
    id: "demo-8",
    title: "Viral Video",
    views: "321K",
    duration: "03:05",
    icon: "🚀",
    category: "Viral",
    videoUrl: ""
  }
];

/* ---------------------------------------------------------
   STATE
   --------------------------------------------------------- */

let videos = [];
let categories = [];
let currentCategory = "All";
let currentVideo = null;

let siteSettings = {
  siteName: "Video Platform",
  bannerEnabled: true,
  videoStartAdEnabled: true,
  videoMidAdEnabled: true,
  videoEndAdEnabled: true,
  adSkipSeconds: 10,
  watchAdReward: 25,
  videoClaimCost: 50
};

let adSettings = {
  directLink: "",
  bannerCode: "",
  enabled: true
};

let coinSettings = {
  watchAdReward: 25,
  videoClaimCost: 50,
  dailyClaim: [25, 50, 75, 100, 125, 150, 600]
};

/* ---------------------------------------------------------
   API HELPER
   --------------------------------------------------------- */

async function apiRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      },
      ...options
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return await response.json();

  } catch (error) {
    console.warn("API request failed:", endpoint, error);
    return null;
  }
}

/* ---------------------------------------------------------
   LOAD PUBLISHED DATA
   --------------------------------------------------------- */

async function loadPublishedData() {

  const [
    publishedVideos,
    publishedCategories,
    publishedSettings,
    publishedAds,
    publishedCoins
  ] = await Promise.all([
    apiRequest("/videos"),
    apiRequest("/categories"),
    apiRequest("/settings"),
    apiRequest("/ads"),
    apiRequest("/coins")
  ]);

  /* Videos */

  if (Array.isArray(publishedVideos)) {
    videos = publishedVideos;
  } else {
    videos = [...fallbackVideos];
  }

  /* Categories */

  if (Array.isArray(publishedCategories)) {
    categories = publishedCategories;
  } else {
    categories = [
      "All",
      "Trending",
      "Comedy",
      "Short",
      "Action",
      "Entertainment",
      "Viral"
    ];
  }

  /* Site settings */

  if (publishedSettings && typeof publishedSettings === "object") {
    siteSettings = {
      ...siteSettings,
      ...publishedSettings
    };
  }

  /* Ads */

  if (publishedAds && typeof publishedAds === "object") {
    adSettings = {
      ...adSettings,
      ...publishedAds
    };
  }

  /* Coins */

  if (publishedCoins && typeof publishedCoins === "object") {
    coinSettings = {
      ...coinSettings,
      ...publishedCoins
    };
  }

  renderCategories();
  loadVideos();
  applyPublishedSettings();
}

/* ---------------------------------------------------------
   APPLY ADMIN SETTINGS
   --------------------------------------------------------- */

function applyPublishedSettings() {

  /* Site name */

  if (siteSettings.siteName) {

    document
      .querySelectorAll("[data-site-name]")
      .forEach(element => {
        element.textContent = siteSettings.siteName;
      });

    if (document.title) {
      document.title = siteSettings.siteName;
    }
  }

  /* Banner */

  const banner = document.querySelector(
    "#bannerAd, .banner-ad, [data-banner-ad]"
  );

  if (banner) {

    if (siteSettings.bannerEnabled === false) {
      banner.style.display = "none";
    } else {
      banner.style.display = "";
    }
  }
}

/* ---------------------------------------------------------
   VIDEO GRID
   --------------------------------------------------------- */

const videoGrid = document.getElementById("videoGrid");

function loadVideos() {

  if (!videoGrid) return;

  videoGrid.innerHTML = "";

  let filteredVideos = videos;

  if (currentCategory !== "All") {

    filteredVideos = videos.filter(video =>
      String(video.category || "").toLowerCase() ===
      String(currentCategory).toLowerCase()
    );

  }

  if (!filteredVideos.length) {

    videoGrid.innerHTML = `
      <div class="empty-videos">
        <div class="empty-icon">🎬</div>
        <h3>No videos available</h3>
        <p>New videos will appear here after publishing.</p>
      </div>
    `;

    return;
  }

  filteredVideos.forEach((video, index) => {

    const card = document.createElement("article");

    card.className = "video-card";

    const thumbnail = video.thumbnail
      ? `
        <img
          src="${escapeHTML(video.thumbnail)}"
          alt="${escapeHTML(video.title || "Video")}"
          class="video-thumbnail-image"
          loading="lazy"
        >
      `
      : `
        <div class="thumbnail-icon">
          ${escapeHTML(video.icon || "🎬")}
        </div>
      `;

    card.innerHTML = `
      <div class="thumbnail">

        ${thumbnail}

        <span class="duration">
          ${escapeHTML(video.duration || "00:00")}
        </span>

        <div class="thumbnail-play">
          ▶
        </div>

      </div>

      <div class="video-info">

        <div class="video-title">
          ${escapeHTML(video.title || "Untitled Video")}
        </div>

        <div class="video-meta">
          👁 ${escapeHTML(video.views || "0")} views
        </div>

        ${
          video.category
            ? `<div class="video-category">
                ${escapeHTML(video.category)}
              </div>`
            : ""
        }

        <button
          class="watch-button"
          data-video-index="${index}">
          ▶ Watch Video
        </button>

      </div>
    `;

    const watchButton = card.querySelector(".watch-button");

    if (watchButton) {

      watchButton.addEventListener("click", () => {

        const actualVideo = filteredVideos[index];

        openVideo(actualVideo);

      });

    }

    videoGrid.appendChild(card);

  });
}

/* ---------------------------------------------------------
   OPEN VIDEO
   --------------------------------------------------------- */

function openVideo(video) {

  if (!video) return;

  currentVideo = video;

  const modalTitle = document.getElementById("modalTitle");
  const modalInfo = document.getElementById("modalInfo");
  const videoModal = document.getElementById("videoModal");

  if (modalTitle) {
    modalTitle.textContent =
      video.title || "Video";
  }

  if (modalInfo) {
    modalInfo.textContent =
      `👁 ${video.views || "0"} views • ${video.duration || "00:00"}`;
  }

  if (videoModal) {
    videoModal.classList.add("show");
  }

  /*
    Video দেখতে Coin লাগবে না।

    Published Ad settings অনুযায়ী
    start ad দেখানো হবে।
  */

  if (
    siteSettings.videoStartAdEnabled !== false &&
    adSettings.enabled !== false
  ) {

    showDirectLinkAd("start");

  }

}

/* ---------------------------------------------------------
   CLOSE VIDEO
   --------------------------------------------------------- */

function closeVideo() {

  const videoModal =
    document.getElementById("videoModal");

  if (videoModal) {
    videoModal.classList.remove("show");
  }

  currentVideo = null;
}

/* ---------------------------------------------------------
   DIRECT LINK AD
   --------------------------------------------------------- */

function showDirectLinkAd(position = "start") {

  if (!adSettings.enabled) return;

  const directLink =
    adSettings.directLink;

  if (!directLink) {
    console.warn("Direct-Link Ad is not configured.");
    return;
  }

  /*
    User-এর কাছে Ad network/configuration দেখানো হবে না।
    শুধু published ad flow চালু হবে।
  */

  const adModal =
    document.getElementById("adModal");

  const adFrame =
    document.getElementById("adFrame");

  if (adModal && adFrame) {

    adFrame.src = directLink;

    adModal.classList.add("show");

    startAdSkipTimer(position);

  } else {

    /*
      Fallback:
      যদি আপনার HTML-এ ad modal এখনো না থাকে,
      নতুন tab-এ direct link open হবে।
    */

    window.open(
      directLink,
      "_blank",
      "noopener,noreferrer"
    );
  }
}

/* ---------------------------------------------------------
   AD SKIP TIMER
   --------------------------------------------------------- */

let adTimer = null;

function startAdSkipTimer(position) {

  clearTimeout(adTimer);

  const skipSeconds =
    Number(siteSettings.adSkipSeconds || 10);

  const skipButton =
    document.getElementById("skipAdButton");

  if (skipButton) {

    skipButton.disabled = true;

    let remaining = skipSeconds;

    skipButton.textContent =
      `Skip in ${remaining}s`;

    const interval =
      setInterval(() => {

        remaining--;

        if (remaining <= 0) {

          clearInterval(interval);

          skipButton.disabled = false;
          skipButton.textContent = "Skip Ad";

        } else {

          skipButton.textContent =
            `Skip in ${remaining}s`;

        }

      }, 1000);

  }

  adTimer = setTimeout(() => {

    closeAd();

  }, skipSeconds * 1000);

}

/* ---------------------------------------------------------
   CLOSE AD
   --------------------------------------------------------- */

function closeAd() {

  clearTimeout(adTimer);

  const adModal =
    document.getElementById("adModal");

  const adFrame =
    document.getElementById("adFrame");

  if (adFrame) {
    adFrame.src = "about:blank";
  }

  if (adModal) {
    adModal.classList.remove("show");
  }
}

/* ---------------------------------------------------------
   VIDEO MID / END ADS
   --------------------------------------------------------- */

function showMidRollAd() {

  if (
    siteSettings.videoMidAdEnabled !== false &&
    adSettings.enabled !== false
  ) {

    showDirectLinkAd("mid");

  }

}

function showEndRollAd() {

  if (
    siteSettings.videoEndAdEnabled !== false &&
    adSettings.enabled !== false
  ) {

    showDirectLinkAd("end");

  }

}

/* ---------------------------------------------------------
   NOTIFICATIONS
   --------------------------------------------------------- */

function openNotifications() {

  const modal =
    document.getElementById("notificationModal");

  if (modal) {
    modal.classList.add("show");
  }

}

function closeNotifications() {

  const modal =
    document.getElementById("notificationModal");

  if (modal) {
    modal.classList.remove("show");
  }

}

/* ---------------------------------------------------------
   ALL VIDEOS
   --------------------------------------------------------- */

function showAllVideos() {

  currentCategory = "All";

  document
    .querySelectorAll(".category")
    .forEach(item =>
      item.classList.remove("active")
    );

  const allButton =
    document.querySelector(
      '.category[data-category="All"]'
    );

  if (allButton) {
    allButton.classList.add("active");
  }

  loadVideos();

}

/* ---------------------------------------------------------
   CATEGORIES
   --------------------------------------------------------- */

function renderCategories() {

  const categoryButtons =
    document.querySelectorAll(".category");

  if (!categoryButtons.length) return;

  categoryButtons.forEach(button => {

    const categoryName =
      button.dataset.category ||
      button.textContent.trim();

    button.addEventListener("click", () => {

      document
        .querySelectorAll(".category")
        .forEach(item =>
          item.classList.remove("active")
        );

      button.classList.add("active");

      currentCategory =
        categoryName || "All";

      loadVideos();

    });

  });

}

/* ---------------------------------------------------------
   HTML ESCAPE
   --------------------------------------------------------- */

function escapeHTML(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}

/* ---------------------------------------------------------
   TELEGRAM MINI APP
   --------------------------------------------------------- */

if (
  window.Telegram &&
  window.Telegram.WebApp
) {

  window.Telegram.WebApp.ready();

  window.Telegram.WebApp.expand();

}

/* ---------------------------------------------------------
   AUTO REFRESH
   --------------------------------------------------------- */

/*
  Admin থেকে Publish করার পরে User Panel যেন
  নতুন published data পেতে পারে।
*/

async function refreshPublishedData() {

  await loadPublishedData();

}

/*
  প্রতি 60 সেকেন্ডে published data check করবে।
*/

setInterval(
  refreshPublishedData,
  60 * 1000
);

/* ---------------------------------------------------------
   START
   --------------------------------------------------------- */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    loadPublishedData();

  }
);
