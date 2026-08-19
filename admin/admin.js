"use strict";

/*
=========================================================
 ADMIN PANEL - MAIN JAVASCRIPT
 API CONNECTED VERSION
=========================================================

🔴 গুরুত্বপূর্ণ:
1. নিচের API_BASE_URL-এ তোমার Backend/API URL বসাও।
2. API key / secret এই ফাইলে বসাবে না।
3. API key/secret Backend/Server-side-এ থাকবে।
4. API endpoint তোমার Database/Backend অনুযায়ী হতে হবে.
=========================================================
*/


/* =======================================================
   🔴 API CONNECTION
======================================================= */

// 🔴 এখানে তোমার API / Backend URL বসাও
const API_BASE_URL = "sb_publishable_2xAQFQ3_oNhVEdard3MJtA_YoRX5Ish";


/*
 * API request helper
 *
 * উদাহরণ:
 * apiRequest("/config")
 * apiRequest("/videos")
 */

async function apiRequest(endpoint, options = {}) {

  if (
    !API_BASE_URL ||
    API_BASE_URL === "https://ounhudbdznqgfwmvpczk.supabase.co"
  ) {

    throw new Error(
      "https://ounhudbdznqgfwmvpczk.supabase.co"
    );

  }


  const url =
    `${API_BASE_URL.replace(/\/+$/, "")}/${endpoint.replace(/^\/+/, "")}`;


  const defaultHeaders = {

    "Content-Type":
      "application/json"

  };


  const response =
    await fetch(
      url,
      {
        ...options,

        headers: {
          ...defaultHeaders,
          ...(options.headers || {})
        }
      }
    );


  if (!response.ok) {

    let message =
      `API Error: ${response.status}`;

    try {

      const errorData =
        await response.json();

      if (errorData?.message) {

        message =
          errorData.message;

      }

    } catch {
      // Ignore invalid JSON response
    }


    throw new Error(message);

  }


  const contentType =
    response.headers.get(
      "content-type"
    );


  if (
    contentType &&
    contentType.includes(
      "application/json"
    )
  ) {

    return response.json();

  }


  return response.text();

}


/* =======================================================
   DEFAULT CONFIG
======================================================= */

const DEFAULT_CONFIG = {

  coins: {

    watchAdEnabled: true,

    adReward: 25,

    dailyAdLimit: 20,

    videoClaimCost: 50,

    dailyRewardEnabled: true,

    dailyRewards: [
      25,
      50,
      75,
      100,
      125,
      150,
      600
    ],

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


/* =======================================================
   STORAGE KEYS
======================================================= */

const STORAGE_KEYS = {

  config:
    "adminPanelConfig",

  videos:
    "adminVideos",

  categories:
    "adminCategories",

  notifications:
    "adminNotifications"

};


/* =======================================================
   HELPERS
======================================================= */

function cloneDefaultConfig() {

  return JSON.parse(
    JSON.stringify(
      DEFAULT_CONFIG
    )
  );

}


function mergeObjects(base, extra) {

  const result = {
    ...base
  };


  Object.keys(extra || {})
    .forEach(key => {

      if (

        extra[key] &&

        typeof extra[key] === "object" &&

        !Array.isArray(extra[key]) &&

        typeof base[key] === "object" &&

        base[key] !== null

      ) {

        result[key] =
          mergeObjects(
            base[key],
            extra[key]
          );

      } else {

        result[key] =
          extra[key];

      }

    });


  return result;

}


let config =
  cloneDefaultConfig();


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

  if (!element) return fallback;


  const value =
    Number(
      element.value
    );


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
    setTimeout(
      () => {

        toast.classList.remove(
          "show"
        );

      },
      3000
    );

}


/* =======================================================
   LOAD CONFIG FROM API
======================================================= */

async function loadConfigFromAPI() {

  try {

    const data =
      await apiRequest(
        "/config",
        {
          method: "GET"
        }
      );


    if (data) {

      config =
        mergeObjects(
          cloneDefaultConfig(),
          data
        );

    }


    return config;

  } catch (error) {

    console.warn(
      "API config load failed:",
      error
    );


    /*
     * API এখনো কানেক্ট না থাকলেও
     * Admin Panel যাতে সম্পূর্ণ বন্ধ না হয়ে যায়,
     * তাই default configuration ব্যবহার করা হচ্ছে।
     */

    config =
      cloneDefaultConfig();


    return config;

  }

}


/* =======================================================
   SAVE CONFIG TO API
======================================================= */

async function saveConfig() {

  try {

    await apiRequest(
      "/config",
      {
        method: "PUT",

        body:
          JSON.stringify(
            config
          )
      }
    );


    showToast(
      "Settings saved successfully."
    );


    return true;

  } catch (error) {

    console.error(
      "Config save failed:",
      error
    );


    showToast(
      "API save failed: " +
      error.message,
      "error"
    );


    return false;

  }

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
    getElement(
      "mobileMenu"
    );


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
   COINS SETTINGS
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


async function saveCoinSettings() {

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


  await saveConfig();

}


/* =======================================================
   ADS SETTINGS
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


async function saveAdSettings() {

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


  await saveConfig();

}


/* =======================================================
   HOMEPAGE SETTINGS
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


  await saveConfig();

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


async function saveGeneralSettings() {

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


  await saveConfig();

}


/* =======================================================
   CATEGORIES
======================================================= */

async function loadCategories() {

  try {

    const data =
      await apiRequest(
        "/categories",
        {
          method: "GET"
        }
      );


    return Array.isArray(data)
      ? data
      : [];

  } catch (error) {

    console.error(
      "Could not load categories:",
      error
    );


    return [];

  }

}


async function saveCategories(
  categories
) {

  return apiRequest(
    "/categories",
    {
      method: "PUT",

      body:
        JSON.stringify(
          categories
        )
    }
  );

}


async function renderCategories() {

  const container =
    getElement(
      "categoryList"
    );


  if (!container)
    return;


  const categories =
    await loadCategories();


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
                  ${escapeHtml(
                    category.name
                  )}
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
        async () => {

          const index =
            Number(
              button.dataset
                .deleteCategory
            );


          await deleteCategory(
            index
          );

        }
      );

    });

}


async function deleteCategory(
  index
) {

  const categories =
    await loadCategories();


  if (!categories[index])
    return;


  const confirmed =
    window.confirm(
      `Delete "${categories[index].name}"?`
    );


  if (!confirmed)
    return;


  categories.splice(
    index,
    1
  );


  try {

    await saveCategories(
      categories
    );


    await renderCategories();

    await populateCategorySelect();


    showToast(
      "Category deleted."
    );

  } catch (error) {

    showToast(
      "Category delete failed: " +
      error.message,
      "error"
    );

  }

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
    async event => {

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
        await loadCategories();


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


      try {

        await saveCategories(
          categories
        );


        await renderCategories();

        await populateCategorySelect();


        input.value = "";


        closeModal(
          "categoryModal"
        );


        showToast(
          "Category created."
        );

      } catch (error) {

        showToast(
          "Category save failed: " +
          error.message,
          "error"
        );

      }

    }
  );

}


async function populateCategorySelect() {

  const select =
    getElement(
      "videoCategory"
    );


  if (!select)
    return;


  const categories =
    await loadCategories();


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

async function loadVideos() {

  try {

    const data =
      await apiRequest(
        "/videos",
        {
          method: "GET"
        }
      );


    return Array.isArray(data)
      ? data
      : [];

  } catch (error) {

    console.error(
      "Could not load videos:",
      error
    );


    return [];

  }

}


async function renderVideos() {

  const container =
    getElement(
      "videoTable"
    );


  if (!container)
    return;


  const videos =
    await loadVideos();


  if (!videos.length) {

    container.innerHTML = `
      <div class="empty-state">
        <div>🎬</div>
        <strong>No Videos Yet</strong>
        <p>Upload your first video.</p>
      </div>
    `;


    updateDashboard(
      videos
    );


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
                  ${escapeHtml(
                    video.title
                  )}
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
        async () => {

          const index =
            Number(
              button.dataset
                .deleteVideo
            );


          await deleteVideo(
            index
          );

        }
      );

    });


  updateDashboard(
    videos
  );

}


async function deleteVideo(
  index
) {

  const videos =
    await loadVideos();


  if (!videos[index])
    return;


  if (
    !window.confirm(
      "Delete this video?"
    )
  ) {

    return;

  }


  const video =
    videos[index];


  try {

    await apiRequest(
      `/videos/${encodeURIComponent(
        video.id
      )}`,
      {
        method: "DELETE"
      }
    );


    await renderVideos();


    showToast(
      "Video deleted."
    );

  } catch (error) {

    showToast(
      "Video delete failed: " +
      error.message,
      "error"
    );

  }

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
    async event => {

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
        categorySelect?.value ||
        "";


      const categories =
        await loadCategories();


      const category =
        categories.find(
          item =>
            item.id ===
            categoryId
        );


      /*
       * 🔴 IMPORTANT
       *
       * Video file সরাসরি API upload endpoint-এ
       * পাঠানো হচ্ছে।
       *
       * Backend-এ /videos endpoint-এ
       * multipart/form-data গ্রহণ করতে হবে।
       */


      const formData =
        new FormData();


      formData.append(
        "title",
        title
      );


      formData.append(
        "description",
        description
      );


      formData.append(
        "categoryId",
        categoryId
      );


      formData.append(
        "categoryName",
        category?.name ||
        "Uncategorized"
      );


      formData.append(
        "published",
        String(
          Boolean(
            getElement(
              "publishVideo"
            )?.checked
          )
        )
      );


      formData.append(
        "video",
        file
      );


      if (thumbnail) {

        formData.append(
          "thumbnail",
          thumbnail
        );

      }


      try {

        await apiRequest(
          "/videos",
          {
            method: "POST",

            /*
             * এখানে Content-Type নিজে
             * সেট করা যাবে না।
             * Browser boundary তৈরি করবে।
             */

            headers: {},

            body: formData
          }
        );


        form.reset();


        closeModal(
          "uploadModal"
        );


        await renderVideos();


        showToast(
          "Video uploaded successfully."
        );

      } catch (error) {

        console.error(
          "Video upload failed:",
          error
        );


        showToast(
          "Video upload failed: " +
          error.message,
          "error"
        );

      }

    }
  );

}


/* =======================================================
   DASHBOARD
======================================================= */

async function updateDashboard(
  suppliedVideos = null
) {

  const videos =
    suppliedVideos ||
    await loadVideos();


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


  /*
   * User statistics backend থেকে নেওয়া উচিত।
   */

  try {

    const stats =
      await apiRequest(
        "/stats",
        {
          method: "GET"
        }
      );


    if (stats) {

      setTextContent(
        "totalUsers",
        Number(
          stats.totalUsers || 0
        )
      );


      setTextContent(
        "registeredUsers",
        Number(
          stats.registeredUsers ||
          stats.totalUsers ||
          0
        )
      );


      setTextContent(
        "activeUsers",
        Number(
          stats.activeUsers ||
          0
        )
      );


      setTextContent(
        "onlineUsers",
        Number(
          stats.onlineUsers ||
          stats.activeUsers ||
          0
        )
      );

    }

  } catch (error) {

    console.warn(
      "Could not load dashboard stats:",
      error
    );

  }


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
          Number(b.views || 0) -
          Number(a.views || 0)
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
      .map(
        video => {

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

        }
      )
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
    async () => {

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


      try {

        await apiRequest(
          "/notifications",
          {
            method: "POST",

            body:
              JSON.stringify({
                title,
                message
              })
          }
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
          "Notification sent successfully."
        );

      } catch (error) {

        showToast(
          "Notification failed: " +
          error.message,
          "error"
        );

      }

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
    async () => {

      try {

        await apiRequest(
          "/auth/logout",
          {
            method: "POST"
          }
        );

      } catch (error) {

        console.warn(
          "Backend logout failed:",
          error
        );

      }


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


  /*
   * প্রথমে API থেকে config load হবে।
   */

  await loadConfigFromAPI();


  loadCoinSettings();

  loadAdSettings();

  loadHomepageSettings();

  loadGeneralSettings();


  await renderCategories();

  await populateCategorySelect();

  await renderVideos();

  await updateDashboard();

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
