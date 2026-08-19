
document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     BASIC DATA
  ========================= */

  let categories = [
    "Comedy",
    "Movies",
    "Shorts",
    "Trending"
  ];

  let videos = [];

  let users = [];

  let currentPage = "dashboard";


  /* =========================
     ELEMENTS
  ========================= */

  const pages = document.querySelectorAll(".page");
  const menuItems = document.querySelectorAll(".menu-item");

  const toast = document.getElementById("toast");

  const sidebar = document.querySelector(".sidebar");
  const mobileMenu = document.getElementById("mobileMenu");


  /* =========================
     TOAST
  ========================= */

  function showToast(message) {

    if (!toast) return;

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
    }, 2500);
  }


  /* =========================
     PAGE NAVIGATION
  ========================= */

  function openPage(pageName) {

    currentPage = pageName;

    pages.forEach(page => {
      page.classList.remove("active-page");
    });

    const target = document.getElementById(pageName);

    if (target) {
      target.classList.add("active-page");
    }

    menuItems.forEach(item => {

      item.classList.remove("active");

      if (item.dataset.page === pageName) {
        item.classList.add("active");
      }

    });

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

    if (sidebar) {
      sidebar.classList.remove("open");
    }

    refreshPage();
  }


  menuItems.forEach(item => {

    item.addEventListener("click", () => {

      const page = item.dataset.page;

      if (page) {
        openPage(page);
      }

    });

  });


  document.querySelectorAll("[data-page-target]").forEach(button => {

    button.addEventListener("click", () => {

      const page = button.dataset.pageTarget;

      if (page) {
        openPage(page);
      }

    });

  });


  /* =========================
     MOBILE MENU
  ========================= */

  if (mobileMenu) {

    mobileMenu.addEventListener("click", () => {

      sidebar.classList.toggle("open");

    });

  }


  /* =========================
     CATEGORY SYSTEM
  ========================= */

  const categoryModal =
    document.getElementById("categoryModal");

  const categoryForm =
    document.getElementById("categoryForm");

  const categoryName =
    document.getElementById("categoryName");

  const addCategoryBtn =
    document.getElementById("addCategoryBtn");


  function openCategoryModal() {

    if (!categoryModal) return;

    categoryModal.classList.add("show");

    if (categoryName) {
      categoryName.focus();
    }

  }


  function closeModal(id) {

    const modal = document.getElementById(id);

    if (modal) {
      modal.classList.remove("show");
    }

  }


  if (addCategoryBtn) {

    addCategoryBtn.addEventListener(
      "click",
      openCategoryModal
    );

  }


  document.querySelectorAll(".close-modal").forEach(button => {

    button.addEventListener("click", () => {

      closeModal(button.dataset.close);

    });

  });


  if (categoryForm) {

    categoryForm.addEventListener("submit", event => {

      event.preventDefault();

      const name =
        categoryName.value.trim();

      if (!name) {

        showToast(
          "Please enter a category name."
        );

        return;
      }


      const exists =
        categories.some(
          category =>
            category.toLowerCase() ===
            name.toLowerCase()
        );


      if (exists) {

        showToast(
          "This category already exists."
        );

        return;
      }


      categories.push(name);

      categoryName.value = "";

      closeModal("categoryModal");

      renderCategories();

      updateCategorySelects();

      showToast(
        "Category created successfully."
      );

    });

  }


  function renderCategories() {

    const container =
      document.getElementById("categoryList");

    if (!container) return;


    if (categories.length === 0) {

      container.innerHTML = `
        <div class="empty-state">
          <div>📂</div>
          <strong>No categories yet</strong>
          <p>Create your first category.</p>
        </div>
      `;

      return;
    }


    container.innerHTML =
      categories.map(
        (category, index) => {

          const videoCount =
            videos.filter(
              video =>
                video.category === category
            ).length;


          return `
            <div class="category-item">

              <strong>📂 ${escapeHTML(category)}</strong>

              <small>
                ${videoCount} video(s)
              </small>

              <div class="category-actions">

                <button
                  onclick="editCategory(${index})">
                  ✏️ Edit
                </button>

                <button
                  onclick="deleteCategory(${index})">
                  🗑️ Delete
                </button>

              </div>

            </div>
          `;

        }
      ).join("");

  }


  window.editCategory = function(index) {

    const oldName =
      categories[index];

    const newName =
      prompt(
        "Enter new category name:",
        oldName
      );


    if (!newName) return;


    const name =
      newName.trim();


    if (!name) return;


    categories[index] = name;


    videos.forEach(video => {

      if (video.category === oldName) {
        video.category = name;
      }

    });


    renderCategories();

    updateCategorySelects();

    renderVideos();

    showToast(
      "Category updated."
    );

  };


  window.deleteCategory = function(index) {

    const name =
      categories[index];


    const used =
      videos.some(
        video =>
          video.category === name
      );


    if (used) {

      showToast(
        "This category contains videos."
      );

      return;
    }


    const confirmDelete =
      confirm(
        `Delete "${name}" category?`
      );


    if (!confirmDelete) return;


    categories.splice(index, 1);

    renderCategories();

    updateCategorySelects();

    showToast(
      "Category deleted."
    );

  };


  /* =========================
     VIDEO UPLOAD UI
  ========================= */

  const uploadModal =
    document.getElementById("uploadModal");

  const openUpload =
    document.getElementById("openUpload");

  const uploadForm =
    document.getElementById("uploadForm");


  if (openUpload) {

    openUpload.addEventListener(
      "click",
      () => {

        updateCategorySelects();

        uploadModal.classList.add("show");

      }
    );

  }


  if (uploadForm) {

    uploadForm.addEventListener(
      "submit",
      event => {

        event.preventDefault();


        const title =
          document.getElementById(
            "videoTitle"
          ).value.trim();


        const category =
          document.getElementById(
            "videoCategory"
          ).value;


        const videoFile =
          document.getElementById(
            "videoFile"
          ).files[0];


        const thumbnailFile =
          document.getElementById(
            "videoThumbnail"
          ).files[0];


        const publish =
          document.getElementById(
            "publishVideo"
          ).checked;


        if (!title) {

          showToast(
            "Enter video title."
          );

          return;
        }


        if (!videoFile) {

          showToast(
            "Select a video file."
          );

          return;
        }


        if (!category) {

          showToast(
            "Select a category."
          );

          return;
        }


        const newVideo = {

          id:
            Date.now(),

          title,

          category,

          status:
            publish
              ? "published"
              : "draft",

          views: 0,

          watchTime: 0,

          thumbnail:
            thumbnailFile
              ? thumbnailFile.name
              : "",

          video:
            videoFile.name,

          createdAt:
            new Date().toISOString()

        };


        videos.unshift(
          newVideo
        );


        uploadForm.reset();

        closeModal(
          "uploadModal"
        );


        renderVideos();

        updateDashboard();

        showToast(
          "Video added successfully."
        );

      }
    );

  }


  /* =========================
     VIDEO RENDER
  ========================= */

  function renderVideos() {

    const container =
      document.getElementById(
        "videoTable"
      );


    if (!container) return;


    if (videos.length === 0) {

      container.innerHTML = `
        <div class="empty-state">
          <div>🎬</div>
          <strong>No videos found</strong>
          <p>Upload your first video.</p>
        </div>
      `;

      return;
    }


    container.innerHTML = `

      <table class="table">

        <thead>

          <tr>

            <th>Video</th>
            <th>Category</th>
            <th>Views</th>
            <th>Status</th>
            <th>Action</th>

          </tr>

        </thead>

        <tbody>

          ${videos.map(video => `

            <tr>

              <td>

                <strong>
                  ${escapeHTML(video.title)}
                </strong>

                <br>

                <small>
                  ${escapeHTML(video.video)}
                </small>

              </td>


              <td>
                ${escapeHTML(video.category)}
              </td>


              <td>
                ${video.views}
              </td>


              <td>

                <span class="status-badge">

                  ${video.status}

                </span>

              </td>


              <td>

                <button
                  class="small-btn"
                  onclick="deleteVideo(${video.id})">

                  🗑️ Delete

                </button>

              </td>

            </tr>

          `).join("")}

        </tbody>

      </table>

    `;

  }


  window.deleteVideo = function(id) {

    const confirmDelete =
      confirm(
        "Delete this video?"
      );


    if (!confirmDelete) return;


    videos =
      videos.filter(
        video =>
          video.id !== id
      );


    renderVideos();

    renderCategories();

    updateDashboard();

    showToast(
      "Video deleted."
    );

  };


  /* =========================
     CATEGORY SELECTS
  ========================= */

  function updateCategorySelects() {

    const selects = [

      document.getElementById(
        "videoCategory"
      ),

      document.getElementById(
        "videoCategoryFilter"
      )

    ];


    selects.forEach(select => {

      if (!select) return;


      const current =
        select.value;


      if (
        select.id ===
        "videoCategoryFilter"
      ) {

        select.innerHTML = `
          <option value="all">
            All Categories
          </option>
        `;

      } else {

        select.innerHTML = `
          <option value="">
            Select category
          </option>
        `;

      }


      categories.forEach(
        category => {

          const option =
            document.createElement(
              "option"
            );

          option.value =
            category;

          option.textContent =
            category;

          select.appendChild(
            option
          );

        }
      );


      if (current) {
        select.value =
          current;
      }

    });

  }


  /* =========================
     DASHBOARD
  ========================= */

  function updateDashboard() {

    const totalVideos =
      document.getElementById(
        "totalVideos"
      );

    const totalViews =
      document.getElementById(
        "totalViews"
      );


    if (totalVideos) {

      totalVideos.textContent =
        videos.length;

    }


    if (totalViews) {

      const views =
        videos.reduce(
          (total, video) =>
            total +
            Number(video.views || 0),
          0
        );


      totalViews.textContent =
        formatNumber(views);

    }


    const totalUsers =
      document.getElementById(
        "totalUsers"
      );


    const activeUsers =
      document.getElementById(
        "activeUsers"
      );


    if (totalUsers) {

      totalUsers.textContent =
        users.length;

    }


    if (activeUsers) {

      activeUsers.textContent =
        users.filter(
          user =>
            user.active
        ).length;

    }


    const registeredUsers =
      document.getElementById(
        "registeredUsers"
      );


    const onlineUsers =
      document.getElementById(
        "onlineUsers"
      );


    if (registeredUsers) {

      registeredUsers.textContent =
        users.length;

    }


    if (onlineUsers) {

      onlineUsers.textContent =
        users.filter(
          user =>
            user.active
        ).length;

    }


    renderTrending();

  }


  function renderTrending() {

    const container =
      document.getElementById(
        "trendingList"
      );


    if (!container) return;


    const trending =
      [...videos]
        .sort(
          (a,b) =>
            b.views -
            a.views
        )
        .slice(0,5);


    if (trending.length === 0) {

      container.innerHTML = `
        <div class="empty-state">
          <div>🎬</div>
          <strong>No videos yet</strong>
          <p>Upload videos to see analytics.</p>
        </div>
      `;

      return;
    }


    container.innerHTML =
      trending.map(
        video => `

          <div class="live-user">

            <div class="avatar">
              🎬
            </div>

            <div class="live-user-info">

              <strong>
                ${escapeHTML(video.title)}
              </strong>

              <small>
                👁 ${video.views} views
              </small>

            </div>

          </div>

        `
      ).join("");

  }


  /* =========================
     NOTIFICATIONS
  ========================= */

  const sendNotification =
    document.getElementById(
      "sendNotification"
    );


  if (sendNotification) {

    sendNotification.addEventListener(
      "click",
      () => {

        const title =
          document.getElementById(
            "notificationTitle"
          ).value.trim();


        const message =
          document.getElementById(
            "notificationMessage"
          ).value.trim();


        if (!title || !message) {

          showToast(
            "Enter title and message."
          );

          return;
        }


        /*
          BACKEND CONNECTION WILL SEND
          THE REAL TELEGRAM MESSAGE.
        */

        showToast(
          "Notification prepared. Telegram backend will send it after connection."
        );

      }
    );

  }


  /* =========================
     SETTINGS
  ========================= */

  const saveSettings =
    document.getElementById(
      "saveSettings"
    );


  if (saveSettings) {

    saveSettings.addEventListener(
      "click",
      () => {

        showToast(
          "Settings saved locally. Backend connection comes next."
        );

      }
    );

  }


  /* =========================
     LOGOUT
  ========================= */

  const logoutBtn =
    document.getElementById(
      "logoutBtn"
    );


  if (logoutBtn) {

    logoutBtn.addEventListener(
      "click",
      () => {

        const answer =
          confirm(
            "Do you want to logout?"
          );


        if (!answer) return;


        showToast(
          "Admin logout will be connected to secure authentication."
        );

      }
    );

  }


  /* =========================
     NOTIFICATION BUTTON
  ========================= */

  const notificationButton =
    document.getElementById(
      "notificationButton"
    );


  if (notificationButton) {

    notificationButton.addEventListener(
      "click",
      () => {

        openPage(
          "notifications"
        );

      }
    );

  }


  /* =========================
     CLOSE MODALS
  ========================= */

  document.querySelectorAll(
    ".modal"
  ).forEach(modal => {

    modal.addEventListener(
      "click",
      event => {

        if (
          event.target ===
          modal
        ) {

          modal.classList.remove(
            "show"
          );

        }

      }
    );

  });


  /* =========================
     HELPERS
  ========================= */

  function escapeHTML(value) {

    return String(value)
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


  function formatNumber(number) {

    return Number(number)
      .toLocaleString();

  }


  /* =========================
     INITIALIZE
  ========================= */

  renderCategories();

  updateCategorySelects();

  renderVideos();

  updateDashboard();

});
