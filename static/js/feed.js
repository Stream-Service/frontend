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
const videoList = document.getElementById("videos");
videoList.innerHTML = "";
let CURRENT_VIDEO_OWNER_ID = null;
let isFollowing = false;

let CURRENT_VIDEO_ID = null;
async function loadVideoList() {
  try {
    const response = await fetch(`${post}/posting/api/videos/random`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error("Failed to fetch videos");
    const videos = await response.json();

     
    
    // 🔹 UPDATED: Swapped .forEach for a for...of loop to cleanly handle 'await' for each user info request
    for (const v of videos) {
      const div_card = document.createElement("div");
      div_card.className = "video-card";

      // Thumbnail
      const Thumbnail = document.createElement("div");
      Thumbnail.className = "thumbnail_section";

      const img = document.createElement("img");
      img.src = `${post}` + v.thumbnail_url;
      img.alt = v.title;
      img.className = "thumbnail";
      Thumbnail.appendChild(img);

      // Description
      const description_div = document.createElement("div");
      description_div.className = "description_section";

      const left_div = document.createElement("div");
      left_div.className = "left_description_section";

      const right_div = document.createElement("div");
      right_div.className = "right_description_section";

      // Title
      const span_div1 = document.createElement("span");
      span_div1.innerText = v.title;

      // User info
      const user_div = document.createElement("div");
      user_div.className = "user-info";

      const imgg = document.createElement("img");
      imgg.src = `${post}/auth/users/${v.user_id}/profile-pic`;
      imgg.alt = "err";
      imgg.className = "user-pic";
      imgg.setAttribute("draggable", "false");
      imgg.onerror = function() {
        this.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23d80921'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";
      };

      // Profile pic click — open profile modal
      imgg.addEventListener("click", (e) => {
        e.stopImmediatePropagation();
        e.preventDefault();
        openProfileModal(v.user_id);
      });

      imgg.addEventListener("mousedown", (e) => {
        e.stopImmediatePropagation();
        e.preventDefault();
      });

      const span = document.createElement("span");
      span.className = "username";
      
      // 🔹 NEW INJECTION: Set default loading placeholder
      span.innerText = "Loading...";

      // 🔹 NEW INJECTION: Fetch user information using the absolute path structure bypassing your Ingress issues
      if (v.user_id) {
        try {
          // Adjust this URL path to match your exact working user-data endpoint structure (Query param vs Path param)
          const userRes = await fetch(`${post}/auth/users/get_data/${v.user_id}`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
          
          if (userRes.ok) {
            const userData = await userRes.json();
           
            // Bind the response attribute to your UI innerText counter
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

      user_div.appendChild(imgg);
      user_div.appendChild(span);

      right_div.appendChild(span_div1);
      left_div.appendChild(user_div);

      description_div.appendChild(left_div);
      description_div.appendChild(right_div);

      // Build card
      div_card.appendChild(Thumbnail);
      div_card.appendChild(description_div);

      // Open video on card click — but ignore if profile pic was clicked
      div_card.addEventListener("click", (e) => {
        if (e.target === imgg) return;
        const manifestPath = v.manifest_url.startsWith('/') ? v.manifest_url : '/' + v.manifest_url;
        const secureUrl = `${post}` + manifestPath;
        CURRENT_VIDEO_OWNER_ID = v.user_id;
        openVideo(v.video_id, secureUrl);
        setTimeout(() => checkFollowState(v.user_id), 300);
      });

      videoList.appendChild(div_card);
    }

  } catch (err) {
    console.error("❌ Error loading video list:", err);
  }
}

closeBtn.onclick = () => { modal.style.display = "none"; };
window.onclick = (event) => { if (event.target === modal) modal.style.display = "none"; };

// loadComments is defined in base.js

async function handleLikevideo(currentUserId, video_id) {
  try {
    const response = await fetch(`${post}/posting/videos/like/${video_id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: currentUserId })
    });
    if (!response.ok) throw new Error("Failed to like video");
    const result = await response.json();
    likeCountEl.innerText = result.likes;
  } catch (err) {
    alert(`❌ Error: ${err}`);
  }
}

async function handleDislikevideo(user_id, video_id) {
  try {
    const response = await fetch(`${post}/posting/videos/dislike/${video_id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user_id })
    });
    if (!response.ok) throw new Error("Failed to dislike video");
    const result = await response.json();
    dislikeCountEl.innerText = result.dislikes;
  } catch (err) {
    alert(`❌ Error: ${err}`);
  }
}

async function addCommentvideo(user_id, video_id) {
  const content = newCommentInput.value.trim();
  if (!content) {
    alert("Please enter a comment");
    return;
  }
  try {
    const response = await fetch(`${post}/posting/videos/comment/${video_id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        user_id: user_id,
        video_id: video_id,
        content: content
      })
    });
    if (!response.ok) throw new Error("Failed to add comment");
    newCommentInput.value = "";
    await loadComments(CURRENT_VIDEO_ID);
  } catch (err) {
    alert(`❌ Error adding comment: ${err}`);
  }
}

const follow_service = CONFIG.follow_service;
// Track follow state


async function Subscribe(follower_id, following_id) {
  try {
    const formData = new FormData();
    formData.append("follower_id", follower_id);
    formData.append("following_id", following_id);

    // ✅ Toggle between follow and unfollow URL
    const url = isFollowing
      ? `${post}/following/unfollow`
      : `${post}/following/follow`;

    const response = await fetch(url, {
      method: "POST",
      body: formData
    });

    if (!response.ok) throw new Error("Failed");

    // ✅ Toggle state and update button
    isFollowing = !isFollowing;

    if (isFollowing) {
      subsbutton.textContent = "✓ Following";
      subsbutton.style.backgroundColor = "#555";
    } else {
      subsbutton.textContent = "Subscribe";
      subsbutton.style.backgroundColor = "";
    }

  } catch (err) {
    alert(`❌ Error: ${err}`);
  }
}

likeBtn.onclick = () => handleLikevideo(currentUserId, CURRENT_VIDEO_ID);
dislikeBtn.onclick = () => handleDislikevideo(currentUserId, CURRENT_VIDEO_ID);
submitCommentBtn.onclick = () => addCommentvideo(currentUserId, CURRENT_VIDEO_ID);
subsbutton.onclick = () => Subscribe(currentUserId, CURRENT_VIDEO_OWNER_ID);

document.addEventListener("DOMContentLoaded", () => {
  loadVideoList();
   

  // Profile modal handlers
  const profileModal = document.getElementById("profileModal");
  const closeProfileModal = document.getElementById("closeProfileModal");

  if (closeProfileModal) {
    closeProfileModal.onclick = () => {
      profileModal.classList.remove("active");
    };
  }

  if (profileModal) {
    profileModal.onclick = (event) => {
      if (event.target === profileModal) {
        profileModal.classList.remove("active");
      }
    };
  }
});


// Setup profile modal tabs
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

  // Subscribe button
  // Subscribe button
  subscribeBtn.onclick = async () => {
  try {
    const formData = new FormData();
    formData.append("follower_id", currentUserId);
    formData.append("following_id", userId);

    const isAlreadyFollowing = subscribeBtn.dataset.following === "true";
    const url = isAlreadyFollowing
      ? `${post}/following/unfollow`
      : `${post}/following/follow`;

    const response = await fetch(url, { method: "POST", body: formData });

    if (response.ok || response.status === 201) {
      const nowFollowing = !isAlreadyFollowing;
      subscribeBtn.dataset.following = nowFollowing;
      subscribeBtn.textContent = nowFollowing ? "✓ Following" : "Subscribe";
      subscribeBtn.style.backgroundColor = nowFollowing ? "#555" : "";
    }
  } catch (err) {
    console.error("Error:", err);
  }
};
}

// Load videos in profile modal
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

// Load posts in profile modal
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

// Load about section in profile modal
function loadProfileAbout(userId) {
  const aboutSection = document.getElementById("profileAboutSection");
  aboutSection.innerHTML = `
    <h3>About</h3>
    <p><strong>User ID:</strong> ${userId}</p>
    <p><strong>Joined:</strong> 2025</p>
    <p><strong>Country:</strong> India</p>
  `;
}