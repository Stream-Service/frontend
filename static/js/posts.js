 
// Use global variables from base.js: post, token, currentUserId

async function load_postsme(curr,token) {
  const posts_grid = document.getElementById("posts_grid");

  posts_grid.innerHTML = "<p>Loading posts...</p>";
  try {
    const response = await fetch(`${post}/posting/getposts/${curr}`, {
      method: "GET",
      headers: {
         
        "Authorization": `Bearer ${token}`
      }
    });
     
    if (!response.ok) throw new Error("Failed to fetch posts");
    const posts = await response.json();

    if (!posts || posts.length === 0) {
      posts_grid.innerHTML = `
        <div style="text-align: center; padding: 20px; color: #666; grid-column: 1 / -1;">
          <h3>No posts found</h3>
          <p>It looks like there's nothing here yet.</p>
        </div>`;
      return; // Stop execution here
    }

    posts_grid.innerHTML = "";
    for (const p of posts) {
      // fetch thumbnail URL
      let thumbUrl = "";
      try {
        const res = await fetch(
          `${post}/streaming/posts?user_id=${p.user_id}&post_id=${p.post_id}`
        );
        const data = await res.json();
        thumbUrl = data.url || "";
      } catch (err) {
        console.error("Error fetching presigned URL:", err);
      }

      const postData = {
        post_id: p.post.post_id,
        user_id: p.user_id,
        username: p.username || "User",
        title: p.post.title,
        content: p.post.content,
        views: p.post.views,
        likes: p.post.likes,
        dislikes: p.post.dislikes,
        thumbnail_url: thumbUrl
      };

      // 🔹 Create a <post-card> element
      const card = document.createElement("post-card");
      card.setAttribute("data-post", JSON.stringify(postData));
      card.setAttribute("current-user-id", currentUserId); // so delete shows only for owner
       
      posts_grid.appendChild(card);
    }
  } catch (err) {
    alert("Error: " + err);
  }

}


document.addEventListener("DOMContentLoaded", () => {
  load_postsme(currentUserId,token);

  // Close profile modal
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

// Make functions globally accessible
window.openProfileModal = openProfileModal;
