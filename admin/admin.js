"use strict";

/*
=========================================================
 ADMIN PANEL - SUPABASE CONNECTED JAVASCRIPT
=========================================================
 IMPORTANT:
 - Publishable key only.
 - Never put service_role/secret key here.
=========================================================
*/

const SUPABASE_URL = "https://ounhudbdznqgfwmvpczk.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_2xAQFQ3_oNhVEdard3MJtA_YoRX5Ish";

const DEFAULT_CONFIG = {
  coins: {
    watchAdEnabled: true,
    adReward: 25,
    dailyAdLimit: 20,
    videoClaimCost: 50,
    dailyRewardEnabled: true,
    dailyRewards: [25, 50, 75, 100, 125, 150, 600],
    dailyClaimAdEnabled: true,
    dailyClaimAdUrl: "",
    referralEnabled: true,
    referrerReward: 100,
    newUserBonus: 50
  },

  ads: {
    bannerEnabled: false,
    bannerCode: "",
    directLinkEnabled: false,
    directLinkUrl: "",
    popunderEnabled: false,
    popunderCode: "",
    socialBarEnabled: false,
    socialBarCode: "",
    videoEnabled: false,
    videoCode: "",
    videoDelay: 30,
    interstitialEnabled: false,
    interstitialCode: "",
    customEnabled: false,
    customCode: ""
  },

  homepage: {
    websiteName: "",
    welcomeTitle: "",
    welcomeDescription: "",
    announcement: "",
    featuredTitle: "",
    categoryTitle: "",
    telegramButtonText: "",
    telegramLink: "",
    footerText: ""
  },

  settings: {
    siteStatus: "online",
    adminEmail: "",
    sessionTimeout: 30
  }
};

const STORAGE_KEYS = {
  config: "adminPanelConfig",
  videos: "adminVideos",
  categories: "adminCategories",
  notifications: "adminNotifications"
};

let config = loadConfig();

/* =======================================================
   SUPABASE
======================================================= */

async function supabaseRequest(endpoint, options = {}) {

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/${endpoint}`,
    {
      ...options,

      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_PUBLISHABLE_KEY,
        "Authorization": `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
        ...(options.headers || {})
      }
    }
  );

  const text = await response.text();

  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {

    console.error(
      "Supabase error:",
      response.status,
      data
    );

    throw new Error(
      data?.message ||
      data?.hint ||
      `Supabase request failed (${response.status})`
    );
  }

  return data;
}


/* =======================================================
   HOMEPAGE - LOAD FROM SUPABASE
======================================================= */

async function loadHomepageFromSupabase() {

  try {

    const data = await supabaseRequest(
      "site_settings?select=*&id=eq.homepage&limit=1"
    );

    if (!Array.isArray(data) || !data.length) {

      return null;

    }

    return data[0];

  } catch (error) {

    console.error(
      "Could not load homepage settings:",
      error
    );

    return null;

  }

}


/* =======================================================
   HOMEPAGE - SAVE TO SUPABASE
======================================================= */

async function saveHomepageToSupabase(homepage) {

  const payload = {

    id: "homepage",

    website_name:
      homepage.websiteName || "",

    welcome_title:
      homepage.welcomeTitle || "",

    welcome_description:
      homepage.welcomeDescription || "",

    announcement:
      homepage.announcement || "",

    featured_title:
      homepage.featuredTitle || "",

    category_title:
      homepage.categoryTitle || "",

    telegram_button_text:
      homepage.telegramButtonText || "",

    telegram_link:
      homepage.telegramLink || "",

    footer_text:
      homepage.footerText || "",

    updated_at:
      new Date().toISOString()

  };

  return await supabaseRequest(
    "site_settings?on_conflict=id",
    {
      method: "POST",

      headers: {
        "Prefer": "resolution=merge-duplicates,return=representation"
      },

      body: JSON.stringify(payload)
    }
  );

}


/* =======================================================
   HELPERS
======================================================= */

function cloneDefaultConfig() {

  return JSON.parse(
    JSON.stringify(DEFAULT_CONFIG)
  );

}


function mergeObjects(base, extra) {

  const result = {
    ...base
  };

  Object.keys(extra || {}).forEach(key => {

    if (
      extra[key] &&
      typeof extra[key] === "object" &&
      !Array.isArray(extra[key]) &&
      typeof base[key] === "object" &&
      base[key] !== null
    ) {

      result[key] = mergeObjects(
        base[key],
        extra[key]
      );

    } else {

      result[key] = extra[key];

    }

  });

  return result;

}


function loadConfig() {

  try {

    const saved =
      localStorage.getItem(
        STORAGE_KEYS.config
      );

    if (!saved) {

      return cloneDefaultConfig();

    }

    return mergeObjects(
      cloneDefaultConfig(),
      JSON.parse(saved)
    );

  } catch (error) {

    console.error(
      "Could not load configuration:",
      error
    );

    return cloneDefaultConfig();

  }

}


function saveConfig() {

  localStorage.setItem(
    STORAGE_KEYS.config,
    JSON.stringify(config)
  );

}


function getElement(id) {

  return document.getElementById(id);

}


function setValue(id, value) {

  const element =
    getElement(id);

  if (!element) return;

  element.value =
    value === undefined ||
    value === null
      ? ""
      : value;

}


function setChecked(id, value) {

  const element =
    getElement(id);

  if (!element) return;

  element.checked =
    Boolean(value);

}


function getNumber(id, fallback = 0) {

  const element =
    getElement(id);

  if (!element)
    return fallback;

  const value =
    Number(element.value);

  return Number.isFinite(value)
    ? value
    : fallback;

}


function getText(id) {

  const element =
    getElement(id);

  return element
    ? element.value.trim()
    : "";

}


function showToast(
  message,
  type = "success"
) {

  const toast =
    getElement("toast");

  if (!toast) {

    alert(message);

    return;

  }

  toast.textContent =
    message;

  toast.dataset.type =
    type;

  toast.classList.add(
    "show"
  );

  clearTimeout(
    showToast.timer
  );

  showToast.timer =
    setTimeout(() => {

      toast.classList.remove(
        "show"
      );

    }, 3000);

}


/* =======================================================
   NAVIGATION
======================================================= */

function showPage(pageId) {

  document
    .querySelectorAll(".page")
    .forEach(page => {

      page.classList.remove(
        "active-page"
      );

    });

  const target =
    getElement(pageId);

  if (target) {

    target.classList.add(
      "active-page"
    );

  }

  document
    .querySelectorAll(".menu-item")
    .forEach(item => {

      item.classList.toggle(
        "active",
        item.dataset.page === pageId
      );

    });

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


function setupNavigation() {

  document
    .querySelectorAll(".menu-item")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const page =
            button.dataset.page;

          if (page) {

            showPage(page);

          }

        }
      );

    });

  document
    .querySelectorAll(
      "[data-page-target]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const page =
            button.dataset.pageTarget;

          if (page) {

            showPage(page);

          }

        }
      );

    });

}


/* =======================================================
   MOBILE MENU
======================================================= */

function setupMobileMenu() {

  const button =
    getElement("mobileMenu");

  const sidebar =
    document.querySelector(
      ".sidebar"
    );

  if (!button || !sidebar)
    return;

  button.addEventListener(
    "click",
    () => {

      sidebar.classList.toggle(
        "open"
      );

    }
  );

  document
    .querySelectorAll(".menu-item")
    .forEach(item => {

      item.addEventListener(
        "click",
        () => {

          sidebar.classList.remove(
            "open"
          );

        }
      );

    });

}


/* =======================================================
   COINS
======================================================= */

function loadCoinSettings() {

  const coins =
    config.coins;

  setChecked(
    "watchAdRewardEnabled",
    coins.watchAdEnabled
  );

  setValue(
    "adRewardCoins",
    coins.adReward
  );

  setValue(
    "dailyAdLimit",
    coins.dailyAdLimit
  );

  setValue(
    "videoClaimCost",
    coins.videoClaimCost
  );

  setChecked(
    "dailyRewardEnabled",
    coins.dailyRewardEnabled
  );

  setChecked(
    "dailyClaimAdEnabled",
    coins.dailyClaimAdEnabled
  );

  setValue(
    "dailyClaimAdUrl",
    coins.dailyClaimAdUrl
  );

  setChecked(
    "referralEnabled",
    coins.referralEnabled
  );

  setValue(
    "referrerReward",
    coins.referrerReward
  );

  setValue(
    "newUserBonus",
    coins.newUserBonus
  );

}


function saveCoinSettings() {

  config.coins.watchAdEnabled =
    Boolean(
      getElement(
        "watchAdRewardEnabled"
      )?.checked
    );

  config.coins.adReward =
    Math.max(
      1,
      getNumber(
        "adRewardCoins",
        25
      )
    );

  config.coins.dailyAdLimit =
    Math.max(
      1,
      getNumber(
        "dailyAdLimit",
        20
      )
    );

  config.coins.videoClaimCost =
    Math.max(
      0,
      getNumber(
        "videoClaimCost",
        50
      )
    );

  config.coins.dailyRewardEnabled =
    Boolean(
      getElement(
        "dailyRewardEnabled"
      )?.checked
    );

  config.coins.dailyClaimAdEnabled =
    Boolean(
      getElement(
        "dailyClaimAdEnabled"
      )?.checked
    );

  config.coins.dailyClaimAdUrl =
    getText(
      "dailyClaimAdUrl"
    );

  config.coins.referralEnabled =
    Boolean(
      getElement(
        "referralEnabled"
      )?.checked
    );

  config.coins.referrerReward =
    Math.max(
      0,
      getNumber(
        "referrerReward",
        100
      )
    );

  config.coins.newUserBonus =
    Math.max(
      0,
      getNumber(
        "newUserBonus",
        50
      )
    );

  config.coins.dailyRewards = [
    25,
    50,
    75,
    100,
    125,
    150,
    600
  ];

  saveConfig();

  showToast(
    "Coin settings saved successfully."
  );

}


/* =======================================================
   ADS
======================================================= */

function loadAdSettings() {

  const ads =
    config.ads;

  setChecked(
    "bannerAdEnabled",
    ads.bannerEnabled
  );

  setValue(
    "bannerAdCode",
    ads.bannerCode
  );

  setChecked(
    "directLinkEnabled",
    ads.directLinkEnabled
  );

  setValue(
    "directLinkUrl",
    ads.directLinkUrl
  );

  setChecked(
    "popunderEnabled",
    ads.popunderEnabled
  );

  setValue(
    "popunderCode",
    ads.popunderCode
  );

  setChecked(
    "socialBarEnabled",
    ads.socialBarEnabled
  );

  setValue(
    "socialBarCode",
    ads.socialBarCode
  );

  setChecked(
    "videoAdEnabled",
    ads.videoEnabled
  );

  setValue(
    "videoAdCode",
    ads.videoCode
  );

  setValue(
    "videoAdDelay",
    ads.videoDelay
  );

  setChecked(
    "interstitialEnabled",
    ads.interstitialEnabled
  );

  setValue(
    "interstitialCode",
    ads.interstitialCode
  );

  setChecked(
    "customAdEnabled",
    ads.customEnabled
  );

  setValue(
    "customAdCode",
    ads.customCode
  );

}


function saveAdSettings() {

  config.ads.bannerEnabled =
    Boolean(
      getElement(
        "bannerAdEnabled"
      )?.checked
    );

  config.ads.bannerCode =
    getText(
      "bannerAdCode"
    );

  config.ads.directLinkEnabled =
    Boolean(
      getElement(
        "directLinkEnabled"
      )?.checked
    );

  config.ads.directLinkUrl =
    getText(
      "directLinkUrl"
    );

  config.ads.popunderEnabled =
    Boolean(
      getElement(
        "popunderEnabled"
      )?.checked
    );

  config.ads.popunderCode =
    getText(
      "popunderCode"
    );

  config.ads.socialBarEnabled =
    Boolean(
      getElement(
        "socialBarEnabled"
      )?.checked
    );

  config.ads.socialBarCode =
    getText(
      "socialBarCode"
    );

  config.ads.videoEnabled =
    Boolean(
      getElement(
        "videoAdEnabled"
      )?.checked
    );

  config.ads.videoCode =
    getText(
      "videoAdCode"
    );

  config.ads.videoDelay =
    Math.max(
      1,
      getNumber(
        "videoAdDelay",
        30
      )
    );

  config.ads.interstitialEnabled =
    Boolean(
      getElement(
        "interstitialEnabled"
      )?.checked
    );

  config.ads.interstitialCode =
    getText(
      "interstitialCode"
    );

  config.ads.customEnabled =
    Boolean(
      getElement(
        "customAdEnabled"
      )?.checked
    );

  config.ads.customCode =
    getText(
      "customAdCode"
    );

  saveConfig();

  showToast(
    "Ad settings saved successfully."
  );

}


/* =======================================================
   HOMEPAGE
======================================================= */

function loadHomepageSettings() {

  const home =
    config.homepage;

  setValue(
    "websiteName",
    home.websiteName
  );

  setValue(
    "welcomeTitle",
    home.welcomeTitle
  );

  setValue(
    "welcomeDescription",
    home.welcomeDescription
  );

  setValue(
    "announcement",
    home.announcement
  );

  setValue(
    "featuredTitle",
    home.featuredTitle
  );

  setValue(
    "categoryTitle",
    home.categoryTitle
  );

  setValue(
    "telegramButtonText",
    home.telegramButtonText
  );

  setValue(
    "telegramLink",
    home.telegramLink
  );

  setValue(
    "footerText",
    home.footerText
  );

}


async function loadHomepageSettingsFromServer() {

  const remote =
    await loadHomepageFromSupabase();

  if (!remote)
    return;

  config.homepage = {

    websiteName:
      remote.website_name || "",

    welcomeTitle:
      remote.welcome_title || "",

    welcomeDescription:
      remote.welcome_description || "",

    announcement:
      remote.announcement || "",

    featuredTitle:
      remote.featured_title || "",

    categoryTitle:
      remote.category_title || "",

    telegramButtonText:
      remote.telegram_button_text || "",

    telegramLink:
      remote.telegram_link || "",

    footerText:
      remote.footer_text || ""

  };

  saveConfig();

  loadHomepageSettings();

}


async function saveHomepageSettings() {

  config.homepage.websiteName =
    getText(
      "websiteName"
    );

  config.homepage.welcomeTitle =
    getText(
      "welcomeTitle"
    );

  config.homepage.welcomeDescription =
    getText(
      "welcomeDescription"
    );

  config.homepage.announcement =
    getText(
      "announcement"
    );

  config.homepage.featuredTitle =
    getText(
      "featuredTitle"
    );

  config.homepage.categoryTitle =
    getText(
      "categoryTitle"
    );

  config.homepage.telegramButtonText =
    getText(
      "telegramButtonText"
    );

  config.homepage.telegramLink =
    getText(
      "telegramLink"
    );

  config.homepage.footerText =
    getText(
      "footerText"
    );

  try {

    await saveHomepageToSupabase(
      config.homepage
    );

    saveConfig();

    showToast(
      "Homepage settings published successfully."
    );

  } catch (error) {

    console.error(error);

    showToast(
      "Homepage save failed. Check Supabase table/RLS.",
      "error"
    );

  }

}


/* =======================================================
   GENERAL SETTINGS
======================================================= */

function loadGeneralSettings() {

  const settings =
    config.settings;

  setValue(
    "siteStatus",
    settings.siteStatus
  );

  setValue(
    "adminEmail",
    settings.adminEmail
  );

  setValue(
    "adminSessionTimeout",
    settings.sessionTimeout
  );

}


function saveGeneralSettings() {

  config.settings.siteStatus =
    getText(
      "siteStatus"
    ) || "online";

  config.settings.adminEmail =
    getText(
      "adminEmail"
    );

  config.settings.sessionTimeout =
    Math.max(
      5,
      getNumber(
        "adminSessionTimeout",
        30
      )
    );

  saveConfig();

  showToast(
    "General settings saved."
  );

}


/* =======================================================
   CATEGORIES
======================================================= */

function loadCategories() {

  try {

    const saved =
      localStorage.getItem(
        STORAGE_KEYS.categories
      );

    return saved
      ? JSON.parse(saved)
      : [];

  } catch {

    return [];

  }

}


function saveCategories(categories) {

  localStorage.setItem(
    STORAGE_KEYS.categories,
    JSON.stringify(categories)
  );

}


function renderCategories() {

  const container =
    getElement(
      "categoryList"
    );

  if (!container)
    return;

  const categories =
    loadCategories();

  if (!categories.length) {

    container.innerHTML = `
      <div class="empty-state">
        <div>📂</div>
        <strong>No Categories Yet</strong>
        <p>Create your first video category.</p>
      </div>
    `;

    return;

  }

  container.innerHTML =
    categories
      .map(
        (category, index) => {

          return `
            <div class="list-row">

              <div>
                <strong>
                  ${escapeHtml(category.name)}
                </strong>
              </div>

              <button
                class="danger-btn"
                type="button"
                data-delete-category="${index}"
              >
                Delete
              </button>

            </div>
          `;

        }
      )
      .join("");

  container
    .querySelectorAll(
      "[data-delete-category]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          deleteCategory(
            Number(
              button.dataset.deleteCategory
            )
          );

        }
      );

    });

}


function deleteCategory(index) {

  const categories =
    loadCategories();

  if (!categories[index])
    return;

  if (
    !window.confirm(
      `Delete "${categories[index].name}"?`
    )
  )
    return;

  categories.splice(
    index,
    1
  );

  saveCategories(
    categories
  );

  renderCategories();
  populateCategorySelect();

  showToast(
    "Category deleted."
  );

}


function openCategoryModal() {

  const modal =
    getElement(
      "categoryModal"
    );

  if (modal) {

    modal.classList.add(
      "open"
    );

  }

}


function closeModal(id) {

  const modal =
    getElement(id);

  if (modal) {

    modal.classList.remove(
      "open"
    );

  }

}


function setupCategoryForm() {

  const form =
    getElement(
      "categoryForm"
    );

  if (!form)
    return;

  form.addEventListener(
    "submit",
    event => {

      event.preventDefault();

      const input =
        getElement(
          "categoryName"
        );

      const name =
        input?.value.trim();

      if (!name) {

        showToast(
          "Enter a category name.",
          "error"
        );

        return;

      }

      const categories =
        loadCategories();

      const exists =
        categories.some(
          category =>
            category.name
              .toLowerCase() ===
            name.toLowerCase()
        );

      if (exists) {

        showToast(
          "This category already exists.",
          "error"
        );

        return;

      }

      categories.push({

        id:
          Date.now().toString(),

        name

      });

      saveCategories(
        categories
      );

      renderCategories();
      populateCategorySelect();

      input.value = "";

      closeModal(
        "categoryModal"
      );

      showToast(
        "Category created."
      );

    }
  );

}


function populateCategorySelect() {

  const select =
    getElement(
      "videoCategory"
    );

  if (!select)
    return;

  const categories =
    loadCategories();

  select.innerHTML =
    `<option value="">Select category</option>`;

  categories.forEach(
    category => {

      const option =
        document.createElement(
          "option"
        );

      option.value =
        category.id;

      option.textContent =
        category.name;

      select.appendChild(
        option
      );

    }
  );

}


/* =======================================================
   VIDEOS
======================================================= */

function loadVideos() {

  try {

    const saved =
      localStorage.getItem(
        STORAGE_KEYS.videos
      );

    return saved
      ? JSON.parse(saved)
      : [];

  } catch {

    return [];

  }

}


function saveVideos(videos) {

  localStorage.setItem(
    STORAGE_KEYS.videos,
    JSON.stringify(videos)
  );

}


function renderVideos() {

  const container =
    getElement(
      "videoTable"
    );

  if (!container)
    return;

  const videos =
    loadVideos();

  if (!videos.length) {

    container.innerHTML = `
      <div class="empty-state">
        <div>🎬</div>
        <strong>No Videos Yet</strong>
        <p>Upload your first video.</p>
      </div>
    `;

    updateDashboard();

    return;

  }

  container.innerHTML =
    videos
      .map(
        (video, index) => {

          return `
            <div class="list-row">

              <div>

                <strong>
                  ${escapeHtml(video.title)}
                </strong>

                <small>
                  ${escapeHtml(
                    video.categoryName ||
                    "Uncategorized"
                  )}
                </small>

              </div>

              <button
                type="button"
                class="danger-btn"
                data-delete-video="${index}"
              >
                Delete
              </button>

            </div>
          `;

        }
      )
      .join("");

  container
    .querySelectorAll(
      "[data-delete-video]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          deleteVideo(
            Number(
              button.dataset.deleteVideo
            )
          );

        }
      );

    });

  updateDashboard();

}


function deleteVideo(index) {

  const videos =
    loadVideos();

  if (!videos[index])
    return;

  if (
    !window.confirm(
      "Delete this video?"
    )
  )
    return;

  videos.splice(
    index,
    1
  );

  saveVideos(
    videos
  );

  renderVideos();

  showToast(
    "Video deleted."
  );

}


function openUploadModal() {

  const modal =
    getElement(
      "uploadModal"
    );

  if (modal) {

    modal.classList.add(
      "open"
    );

  }

}


function setupUploadForm() {

  const form =
    getElement(
      "uploadForm"
    );

  if (!form)
    return;

  form.addEventListener(
    "submit",
    event => {

      event.preventDefault();

      const title =
        getText(
          "videoTitle"
        );

      const description =
        getText(
          "videoDescription"
        );

      const categorySelect =
        getElement(
          "videoCategory"
        );

      const file =
        getElement(
          "videoFile"
        )?.files?.[0];

      const thumbnail =
        getElement(
          "videoThumbnail"
        )?.files?.[0];

      if (!title) {

        showToast(
          "Video title is required.",
          "error"
        );

        return;

      }

      if (!file) {

        showToast(
          "Select a video file.",
          "error"
        );

        return;

      }

      const categoryId =
        categorySelect?.value || "";

      const category =
        loadCategories()
          .find(
            item =>
              item.id ===
              categoryId
          );

      const videos =
        loadVideos();

      videos.push({

        id:
          Date.now().toString(),

        title,

        description,

        categoryId,

        categoryName:
          category?.name ||
          "Uncategorized",

        fileName:
          file.name,

        thumbnailName:
          thumbnail
            ? thumbnail.name
            : "",

        published:
          Boolean(
            getElement(
              "publishVideo"
            )?.checked
          ),

        views: 0,

        createdAt:
          new Date()
            .toISOString()

      });

      saveVideos(
        videos
      );

      form.reset();

      closeModal(
        "uploadModal"
      );

      renderVideos();

      showToast(
        "Video added successfully."
      );

    }
  );

}


/* =======================================================
   DASHBOARD
======================================================= */

function updateDashboard() {

  const videos =
    loadVideos();

  setTextContent(
    "totalVideos",
    videos.length
  );

  const totalViews =
    videos.reduce(
      (sum, video) =>
        sum +
        Number(
          video.views || 0
        ),
      0
    );

  setTextContent(
    "totalViews",
    totalViews
  );

  const totalUsers =
    Number(
      localStorage.getItem(
        "totalUsers"
      ) || 0
    );

  setTextContent(
    "totalUsers",
    totalUsers
  );

  setTextContent(
    "registeredUsers",
    totalUsers
  );

  const activeUsers =
    Number(
      localStorage.getItem(
        "activeUsers"
      ) || 0
    );

  setTextContent(
    "activeUsers",
    activeUsers
  );

  setTextContent(
    "onlineUsers",
    activeUsers
  );

  renderTrendingVideos(
    videos
  );

}


function setTextContent(
  id,
  value
) {

  const element =
    getElement(id);

  if (element) {

    element.textContent =
      String(value);

  }

}


function renderTrendingVideos(
  videos
) {

  const container =
    getElement(
      "trendingList"
    );

  if (!container)
    return;

  const sorted =
    [...videos]
      .sort(
        (a, b) =>
          Number(
            b.views || 0
          ) -
          Number(
            a.views || 0
          )
      )
      .slice(0, 5);

  if (!sorted.length) {

    container.innerHTML = `
      <div class="empty-state">
        <div>🎬</div>
        <strong>No videos yet</strong>
      </div>
    `;

    return;

  }

  container.innerHTML =
    sorted
      .map(video => {

        return `
          <div class="list-row">

            <div>

              <strong>
                ${escapeHtml(
                  video.title
                )}
              </strong>

              <small>
                ${Number(
                  video.views || 0
                )} views
              </small>

            </div>

          </div>
        `;

      })
      .join("");

}


/* =======================================================
   NOTIFICATIONS
======================================================= */

function setupNotifications() {

  const button =
    getElement(
      "sendNotification"
    );

  if (!button)
    return;

  button.addEventListener(
    "click",
    () => {

      const title =
        getText(
          "notificationTitle"
        );

      const message =
        getText(
          "notificationMessage"
        );

      if (!title || !message) {

        showToast(
          "Enter both title and message.",
          "error"
        );

        return;

      }

      let notifications = [];

      try {

        notifications =
          JSON.parse(
            localStorage.getItem(
              STORAGE_KEYS.notifications
            ) || "[]"
          );

      } catch {

        notifications = [];

      }

      notifications.push({

        id:
          Date.now().toString(),

        title,

        message,

        createdAt:
          new Date()
            .toISOString()

      });

      localStorage.setItem(
        STORAGE_KEYS.notifications,
        JSON.stringify(
          notifications
        )
      );

      setValue(
        "notificationTitle",
        ""
      );

      setValue(
        "notificationMessage",
        ""
      );

      showToast(
        "Notification saved."
      );

    }
  );

}


/* =======================================================
   MODALS
======================================================= */

function setupModals() {

  document
    .querySelectorAll(
      "[data-close]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          closeModal(
            button.dataset.close
          );

        }
      );

    });

  document
    .querySelectorAll(".modal")
    .forEach(modal => {

      modal.addEventListener(
        "click",
        event => {

          if (
            event.target ===
            modal
          ) {

            modal.classList.remove(
              "open"
            );

          }

        }
      );

    });

}


/* =======================================================
   LOGOUT
======================================================= */

function setupLogout() {

  const button =
    getElement(
      "logoutBtn"
    );

  if (!button)
    return;

  button.addEventListener(
    "click",
    () => {

      sessionStorage.removeItem(
        "adminSession"
      );

      showToast(
        "Admin session ended."
      );

      setTimeout(
        () => {

          window.location.reload();

        },
        700
      );

    }
  );

}


/* =======================================================
   ESCAPE HTML
======================================================= */

function escapeHtml(value) {

  return String(
    value ?? ""
  )
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


/* =======================================================
   BUTTON EVENTS
======================================================= */

function setupButtons() {

  const upload =
    getElement(
      "openUpload"
    );

  if (upload) {

    upload.addEventListener(
      "click",
      openUploadModal
    );

  }

  const category =
    getElement(
      "addCategoryBtn"
    );

  if (category) {

    category.addEventListener(
      "click",
      openCategoryModal
    );

  }

  const saveCoins =
    getElement(
      "saveCoinSettings"
    );

  if (saveCoins) {

    saveCoins.addEventListener(
      "click",
      saveCoinSettings
    );

  }

  const saveAds =
    getElement(
      "saveAdSettings"
    );

  if (saveAds) {

    saveAds.addEventListener(
      "click",
      saveAdSettings
    );

  }

  const saveHome =
    getElement(
      "saveHomepageSettings"
    );

  if (saveHome) {

    saveHome.addEventListener(
      "click",
      saveHomepageSettings
    );

  }

  const saveSettings =
    getElement(
      "saveSettings"
    );

  if (saveSettings) {

    saveSettings.addEventListener(
      "click",
      saveGeneralSettings
    );

  }

}


/* =======================================================
   INITIALIZE
======================================================= */

async function initializeAdminPanel() {

  setupNavigation();

  setupMobileMenu();

  setupButtons();

  setupModals();

  setupCategoryForm();

  setupUploadForm();

  setupNotifications();

  setupLogout();

  loadCoinSettings();

  loadAdSettings();

  loadHomepageSettings();

  loadGeneralSettings();

  renderCategories();

  populateCategorySelect();

  renderVideos();

  updateDashboard();

  /*
   * Load latest Homepage data
   * from Supabase after UI starts.
   */

  await loadHomepageSettingsFromServer();

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
    initializeAdminPanel
  );

} else {

  initializeAdminPanel();

}
