// Use global variables from base.js: post, token, currentUserId

const modal = document.getElementById("videoModal");
const closeBtn = document.getElementById("closePopup");
const videoPlayer = document.getElementById("videoPlayer");
const commentsContainer = document.getElementById("commentsContainer");
const likeBtn = document.getElementById("likeBtn");
const dislikeBtn = document.getElementById("dislikeBtn");
const subsbutton = document.getElementById("Subscribe");
const likeCountEl = document.getElementById("likeCount");
const dislikeCountEl = document.getElementById("dislikeCount");
const submitCommentBtn = document.getElementById("submitComment");
const newCommentInput = document.getElementById("newComment");

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("Your_videos");
  loadVideoListme(container);
});async function loadVideoListme(container) {
  try {
    const response = await fetch(`${post}/posting/api/videos/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("access_token")}`
      }
    });
    if (!response.ok) throw new Error("Failed to fetch videos");
    const videos = await response.json();

    // Clear container to strip layout spacing side effects / text tokens
    container.innerHTML = "";

    // 🔹 Verify if array metadata or layout streams returned empty
    if (!videos || videos.length === 0) {
      const noVideosMsg = document.createElement("div");
      noVideosMsg.style.gridColumn = "1 / -1";
      noVideosMsg.style.textAlign = "center";
      noVideosMsg.style.color = "#666";
      noVideosMsg.style.fontSize = "1.3em";
      noVideosMsg.style.fontWeight = "600";
      noVideosMsg.style.padding = "60px 20px";
      noVideosMsg.innerText = "No videos available";
      
      container.appendChild(noVideosMsg);
      return; 
    }

    // 🌟 FIX: Using traditional for...of loop so 'await' works correctly inside iteration
    for (const v of videos) {
      const div_card = document.createElement("div");
      div_card.className = "video-card";

      const Thumbnail = document.createElement("div");
      Thumbnail.className = "thumbnail_section";

      const img = document.createElement("img");
      img.src = `${post}` + v.thumbnail_url;
      img.alt = v.title;
      img.className = "thumbnail";
      Thumbnail.appendChild(img);
      
      const description_div = document.createElement("div");
      description_div.className = "description_section";

      const left_div = document.createElement("div");
      left_div.className = "left_description_section";

      const right_div = document.createElement("div");
      right_div.className = "right_description_section";

      const span_div1 = document.createElement("span");
      span_div1.innerText = v.title;

      const span_div = document.createElement("span");
      span_div.innerText = v.views;

      const user_info_div = document.createElement("div");
      user_info_div.className = "user-info";

      const imgg = document.createElement("img");
      imgg.src = `${post}/auth/users/${v.user_id}/profile-pic`;
      imgg.alt = "err";
      imgg.className = "user-pic";
      imgg.onerror = function() {
        this.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23d80921'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";
      };

      imgg.onclick = (e) => {
        e.stopPropagation();
        openProfileModal(v.user_id);
      };

      const span = document.createElement("span");
      span.className = "username";

      if (v.user_id) {
        try {
          const userRes = await fetch(`${post}/auth/users/get_data/${v.user_id}`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
          
          if (userRes.ok) {
            const userData = await userRes.json();
            // Bind the dynamic username string to UI element
            span.innerText = userData.firstname || "User";
          } else {
            span.innerText = "Unknown User";
          }
        } catch (fetchErr) {
          console.error(`Error loading creator details for user id ${v.user_id}:`, fetchErr);
          span.innerText = "Error Loading";
        }
      } else {
        span.innerText = "Anonymous";
      }

      user_info_div.appendChild(imgg);
      user_info_div.appendChild(span);

      right_div.appendChild(span_div1);
      right_div.appendChild(span_div);
      left_div.appendChild(user_info_div);

      description_div.appendChild(left_div);
      description_div.appendChild(right_div);

      div_card.appendChild(Thumbnail);
      div_card.appendChild(description_div);

      img.onclick = () => openVideo(v.video_id, `${post}` + v.manifest_url);

      // Add three-dot menu in top-right
      const menu_div = document.createElement("div");
      menu_div.className = "menu";

      const menu_btn = document.createElement("button");
      menu_btn.className = "menu-btn";
      menu_btn.innerHTML = "&#8942;"; // ⋮

      const dropdown = document.createElement("div");
      dropdown.className = "dropdown hidden";

      const delete_btn = document.createElement("button");
      delete_btn.className = "delete-btn";
      delete_btn.innerText = "Delete";

      delete_btn.onclick = () => {
        if (confirm("Are you sure you want to delete this video?")) {
          // Fallback authorization token parsing
          const activeToken = token || localStorage.getItem("access_token");
          fetch(`${post}/posting/deletevideo/${v.video_id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${activeToken}` }
          }).then(res => {
            if (res.ok) {
              div_card.remove(); 
              // 🔹 Check if container is completely empty after deleting this specific video
              if (container.children.length === 0) {
                loadVideoListme(container); 
              }
            } else {
              alert("Failed to delete video");
            }
          });
        }
      };

      menu_btn.onclick = () => {
        dropdown.classList.toggle("hidden");
      };

      dropdown.appendChild(delete_btn);
      menu_div.appendChild(menu_btn);
      menu_div.appendChild(dropdown);

      div_card.appendChild(menu_div);
      container.appendChild(div_card);
    }

  } catch (err) {
    console.error("❌ Error loading video list:", err);
    container.innerHTML = "<p style='color: #d80921; text-align: center; padding: 40px;'>Error loading videos. Please try again later.</p>";
  }
}

closeBtn.onclick = () => { modal.style.display = "none"; };
window.onclick = (event) => { if (event.target === modal) modal.style.display = "none"; };

// Profile Modal Functions
async function openProfileModal(userId) {
  const profileModal = document.getElementById("profileModal");
  profileModal.classList.add("active");

  const profileModalPic = document.getElementById("profileModalPic");
  profileModalPic.src = `${post}/auth/users/${userId}/profile-pic`;
  profileModalPic.onerror = function() {
    this.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23d80921'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";
  };

  try {
    const descResponse = await fetch(`${post}/auth/users/${userId}/description`);
    const descData = descResponse.ok ? await descResponse.json() : { description: "No description" };
    document.getElementById("profileModalDesc").textContent = descData.description || "No description";
  } catch (err) {
    document.getElementById("profileModalDesc").textContent = "No description";
  }

  setupProfileTabs(userId);
  document.getElementById("profilePostLink").click();
}

function setupProfileTabs(userId) {
  const videoLink = document.getElementById("profileVideoLink");
  const postLink = document.getElementById("profilePostLink");
  const aboutLink = document.getElementById("profileAboutLink");
  const videoSection = document.getElementById("profileVideoSection");
  const postSection = document.getElementById("profilePostSection");
  const aboutSection = document.getElementById("profileAboutSection");
  const subscribeBtn = document.getElementById("profileSubscribeBtn");

  function clearActive() {
    videoSection.classList.remove("profile-section-active");
    videoSection.classList.add("profile-section");
    postSection.classList.remove("profile-section-active");
    postSection.classList.add("profile-section");
    aboutSection.classList.remove("profile-section-active");
    aboutSection.classList.add("profile-section");
    videoLink.classList.remove("profile-nav-active");
    postLink.classList.remove("profile-nav-active");
    aboutLink.classList.remove("profile-nav-active");
  }

  videoLink.onclick = () => {
    clearActive();
    videoSection.classList.remove("profile-section");
    videoSection.classList.add("profile-section-active");
    videoLink.classList.add("profile-nav-active");
    loadProfileVideos(userId);
  };

  postLink.onclick = () => {
    clearActive();
    postSection.classList.remove("profile-section");
    postSection.classList.add("profile-section-active");
    postLink.classList.add("profile-nav-active");
    loadProfilePosts(userId);
  };

  aboutLink.onclick = () => {
    clearActive();
    aboutSection.classList.remove("profile-section");
    aboutSection.classList.add("profile-section-active");
    aboutLink.classList.add("profile-nav-active");
    loadProfileAbout(userId);
  };

  subscribeBtn.onclick = async () => {
    try {
      const formData = new FormData();
      formData.append("follower_id", currentUserId);
      formData.append("following_id", userId);

      const response = await fetch(`${post}/following/follow`, {
        method: "POST",
        body: formData
      });

      if (response.status === 201) {
        alert("You are now following this user!");
        subscribeBtn.textContent = "Following";
        subscribeBtn.disabled = true;
      } else {
        alert("Failed to follow");
      }
    } catch (err) {
      console.error("Error following:", err);
    }
  };
}

async function loadProfileVideos(userId) {
  const videoGrid = document.getElementById("profileVideoGrid");
  videoGrid.innerHTML = "<p>Loading videos...</p>";

  try {
    const response = await fetch(`${post}/posting/api/videos?user_id=${userId}&page=0&limit=10`);
    if (!response.ok) throw new Error("Failed to fetch videos");
    const videos = await response.json();

    videoGrid.innerHTML = "";
    if (videos.length === 0) {
      videoGrid.innerHTML = "<p style='color:#999; grid-column:1/-1; text-align:center;'>No videos yet</p>";
      return;
    }

    videos.forEach(v => {
      const videoCard = document.createElement("div");
      videoCard.className = "crush_pop_video-card";
      videoCard.innerHTML = `
        <img src="${post}${v.thumbnail_url}" class="crush_pop_video_thumbnail" alt="${v.title}">
        <div class="crush_description_section">
          <span class="video-title">${v.title}</span>
        </div>
      `;
      videoCard.onclick = () => openVideo(v.video_id, `${post}${v.manifest_url}`);
      videoGrid.appendChild(videoCard);
    });
  } catch (err) {
    videoGrid.innerHTML = "<p style='color:#d80921;'>Error loading videos</p>";
    console.error("Error loading videos:", err);
  }
}

async function loadProfilePosts(userId) {
  const postsGrid = document.getElementById("profilePostsGrid");
  postsGrid.innerHTML = "<p>Loading posts...</p>";

  try {
    const response = await fetch(`${post}/posting/getposts/${userId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });
    if (!response.ok) throw new Error("Failed to fetch posts");
    const posts = await response.json();

    postsGrid.innerHTML = "";
    if (posts.length === 0) {
      postsGrid.innerHTML = "<p style='color:#999; grid-column:1/-1; text-align:center;'>No posts yet</p>";
      return;
    }

    for (const p of posts) {
      let thumbUrl = "";
      try {
        const res = await fetch(`${post}/streaming/posts?user_id=${p.user_id}&post_id=${p.post_id}`);
        const data = await res.json();
        thumbUrl = data.url || "";
      } catch (err) {
        console.error("Error fetching presigned URL:", err);
      }

      const postCard = document.createElement("div");
      postCard.className = "pop_post_card";
      postCard.innerHTML = `<img src="${thumbUrl}" class="pop_post_thumbnail" alt="Post">`;
      postsGrid.appendChild(postCard);
    }
  } catch (err) {
    postsGrid.innerHTML = "<p style='color:#d80921;'>Error loading posts</p>";
    console.error("Error loading posts:", err);
  }
}

function loadProfileAbout(userId) {
  const aboutSection = document.getElementById("profileAboutSection");
  aboutSection.innerHTML = `
    <h3>About</h3>
    <p><strong>User ID:</strong> ${userId}</p>
    <p><strong>Joined:</strong> 2025</p>
    <p><strong>Country:</strong> India</p>
  `;
}

// Close profile modal Setup
document.addEventListener("DOMContentLoaded", () => {
  const closeProfileModal = document.getElementById("closeProfileModal");
  const profileModal = document.getElementById("profileModal");
  if (closeProfileModal) {
    closeProfileModal.onclick = () => profileModal.classList.remove("active");
  }
  if (profileModal) {
    profileModal.onclick = (event) => {
      if (event.target === profileModal) profileModal.classList.remove("active");
    };
  }
});

// Make functions globally accessible
window.openProfileModal = openProfileModal;