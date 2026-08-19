
const videos = [
  {
    title: "Amazing New Video",
    views: "125K",
    duration: "02:45",
    icon: "🎬"
  },
  {
    title: "Funny Moments 😂",
    views: "98K",
    duration: "01:38",
    icon: "😂"
  },
  {
    title: "Trending Video Today",
    views: "245K",
    duration: "03:21",
    icon: "🔥"
  },
  {
    title: "Best Short Video",
    views: "76K",
    duration: "00:59",
    icon: "⚡"
  },
  {
    title: "Comedy Collection",
    views: "154K",
    duration: "04:10",
    icon: "🤣"
  },
  {
    title: "Action Highlights",
    views: "187K",
    duration: "02:58",
    icon: "💥"
  },
  {
    title: "Entertainment Video",
    views: "64K",
    duration: "01:47",
    icon: "⭐"
  },
  {
    title: "Viral Video",
    views: "321K",
    duration: "03:05",
    icon: "🚀"
  }
];

const videoGrid = document.getElementById("videoGrid");

function loadVideos() {

  videoGrid.innerHTML = "";

  videos.forEach((video, index) => {

    const card = document.createElement("article");

    card.className = "video-card";

    card.innerHTML = `
      <div class="thumbnail">

        <div class="thumbnail-icon">
          ${video.icon}
        </div>

        <span class="duration">
          ${video.duration}
        </span>

      </div>

      <div class="video-info">

        <div class="video-title">
          ${video.title}
        </div>

        <div class="video-meta">
          👁 ${video.views} views
        </div>

        <button
          class="watch-button"
          onclick="openVideo(${index})">
          ▶ Watch Video
        </button>

      </div>
    `;

    videoGrid.appendChild(card);

  });

}

function openVideo(index) {

  const video = videos[index];

  document.getElementById("modalTitle").textContent =
    video.title;

  document.getElementById("modalInfo").textContent =
    `👁 ${video.views} views • ${video.duration}`;

  document.getElementById("videoModal")
    .classList.add("show");

}

function closeVideo() {

  document.getElementById("videoModal")
    .classList.remove("show");

}

function openNotifications() {

  document.getElementById("notificationModal")
    .classList.add("show");

}

function closeNotifications() {

  document.getElementById("notificationModal")
    .classList.remove("show");

}

function showAllVideos() {

  alert("All Videos section will be connected next.");

}

/* Category buttons */

document.querySelectorAll(".category").forEach(button => {

  button.addEventListener("click", () => {

    document
      .querySelectorAll(".category")
      .forEach(item => item.classList.remove("active"));

    button.classList.add("active");

  });

});


/* Telegram Mini App support */

if (window.Telegram && window.Telegram.WebApp) {

  window.Telegram.WebApp.ready();

  window.Telegram.WebApp.expand();

}


/* Start */

loadVideos();
