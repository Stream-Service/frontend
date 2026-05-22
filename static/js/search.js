 


const post = window.CONFIG.post;
const SEARCH_API_URL = `${post}/searching/users/search`;
 
function debounce(fn, delay = 300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

function escapeHTML(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getInitials(name) {
  return name ? name.charAt(0).toUpperCase() : "?";
}

let currentController = null;
const inputEl = document.getElementById("searchInput");
const statusEl = document.getElementById("status");
const resultsEl = document.getElementById("results");
const clearBtn = document.getElementById("clearSearch");

// 🔹 New Tab Button Selectors
 
const tabFollowers = document.getElementById("tabFollowers");
const tabFollowing = document.getElementById("tabFollowing");

function setStatus(message, isLoading = false) {
  if (isLoading) {
    statusEl.innerHTML = '<i class="fas fa-spinner"></i> Searching...';
  } else {
    statusEl.textContent = message || "";
  }
}

function renderLoading() {
  resultsEl.innerHTML = '<div class="loading"><i class="fas fa-spinner"></i><p>Searching...</p></div>';
}

function renderEmpty() {
  resultsEl.innerHTML = '<div class="empty-state"><i class="fas fa-search"></i><h3>No results found</h3><p>Try searching with different keywords</p></div>';
}

function renderError(message) {
  resultsEl.innerHTML = `<div class="error-state"><i class="fas fa-exclamation-triangle"></i><h3>Oops!</h3><p>${escapeHTML(message)}</p></div>`;
}

function renderResults(items) {
  if (!items || items.length === 0) {
    renderEmpty();
    return;
  }
  const html = items
    .map((user) => {
      const name = escapeHTML(user.username ?? user.name ?? "Unknown");
      const subtitle = "Your User";
      const avatar = escapeHTML(user.avatarUrl ?? "");

      return `
        <div class="result-item" data-id="${escapeHTML(user.id ?? "")}">
          <div class="avatar">
            ${avatar ? `<img src="${avatar}" alt="" onerror="this.style.display='none'; this.parentElement.textContent='${getInitials(name)}'" />` : getInitials(name)}
          </div>
          <div class="item-content">
            <div class="item-title">${name}</div>
            <div class="item-subtitle"><i class="fas fa-user"></i> ${subtitle}</div>
          </div>
          <i class="fas fa-chevron-right" style="color: var(--muted);"></i>
        </div>
      `;
    })
    .join("");
  resultsEl.innerHTML = html;
}

// 🔹 New Isolated Renderer for Followers and Following Relationships
function renderFollowResults(items, typeLabel) {
  if (!items || items.length === 0) {
    renderEmpty();
    return;
  }
  const html = items
    .map((user) => {
      const targetId = user.id ?? "";
      const name = escapeHTML(user.username ?? `User ID: ${targetId}`);
      const avatar = ""; 

      return `
        <div class="result-item" data-id="${escapeHTML(targetId)}">
          <div class="avatar">
            ${getInitials(name)}
          </div>
          <div class="item-content">
            <div class="item-title">${name}</div>
            <div class="item-subtitle"><i class="fas fa-user"></i> ${typeLabel}</div>
          </div>
          <i class="fas fa-chevron-right" style="color: var(--muted);"></i>
        </div>
      `;
    })
    .join("");
  resultsEl.innerHTML = html;
}

async function search(query) {
  if (currentController) currentController.abort();
  currentController = new AbortController();

  if (!query || query.trim().length < 1) {
    setStatus("");
    resultsEl.innerHTML = "";
    return;
  }

  setStatus("", true);
  renderLoading();

  try {
    const url = new URL(SEARCH_API_URL);
    url.searchParams.set("q", query.trim());

    const res = await fetch(url.toString(), {
      method: "GET",
      signal: currentController.signal,
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("HTTP " + res.status);

    const data = await res.json();
    renderResults(Array.isArray(data) ? data : data.results || []);
    setStatus("");
  } catch (err) {
    if (err.name === "AbortError") return;
    renderEmpty();
    setStatus("");
  }
}

// 🔹 New Followers API Implementation
async function loadFollowersTab() {
  renderLoading();
  try {
    const res = await fetch(`${post}/following/followers/${currentUserId}`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to fetch followers");
    const data = await res.json();
    
    // Normalize data structure handles arrays of objects or raw ID strings seamlessly
    const rawFollowers = data.followers || [];
    const normalizedList = rawFollowers.map(item => {
      if (typeof item === 'object' && item !== null) {
        return { id: item.follower_id ?? item.id ?? item.username, username: item.username };
      }
      return { id: item, username: `User ID: ${item}` };
    });

    renderFollowResults(normalizedList, "Follower");
  } catch (err) {
    renderError(err.message);
  }
}

// 🔹 New Following API Implementation
async function loadFollowingTab() {
  renderLoading();
  try {
    const res = await fetch(`${post}/following/followings/${currentUserId}`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to fetch followings");
    const data = await res.json();
    
    // Normalize data structure handles arrays of objects or raw ID strings seamlessly
    const rawFollowings = data.followings || [];
    const normalizedList = rawFollowings.map(item => {
      if (typeof item === 'object' && item !== null) {
        return { id: item.following_id ?? item.id ?? item.username, username: item.username };
      }
      return { id: item, username: `User ID: ${item}` };
    });

    renderFollowResults(normalizedList, "Following");
  } catch (err) {
    renderError(err.message);
  }
}

// 🔹 New Tab Orchestrator Switch logic
function handleTabToggle(activeButton) {
  [tabFollowers, tabFollowing].forEach(btn => {
    if(btn) btn.classList.remove("tab-active");
  });
  if(activeButton) activeButton.classList.add("tab-active");
  resultsEl.innerHTML = "";
  inputEl.value = "";
  setStatus("");
}

 
if (tabFollowers) {
  tabFollowers.onclick = () => {
    handleTabToggle(tabFollowers);
    loadFollowersTab();
  };
}
if (tabFollowing) {
  tabFollowing.onclick = () => {
    handleTabToggle(tabFollowing);
    loadFollowingTab();
  };
}

const debouncedSearch = debounce(search, 250);
inputEl.addEventListener("input", (e) => {
  // ✅ Deactivate follower/following tabs when user types in search bar
  [tabFollowers, tabFollowing].forEach(btn => {
    if(btn) btn.classList.remove("tab-active");
  });
  debouncedSearch(e.target.value);
});

if (clearBtn) {
  clearBtn.addEventListener("click", () => {
    inputEl.value = "";
    resultsEl.innerHTML = "";
    setStatus("");
    handleTabToggle(tabGlobalSearch);
  });
}

resultsEl.addEventListener("click", (e) => {
  const item = e.target.closest(".result-item");
  if (!item) return;
  const id = item.getAttribute("data-id");
  if (id) {
    openProfileModal(id);
  }
});
 

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
        body: formData,
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

    videos.forEach((v) => {
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
      headers: { "Content-Type": "application/json" },
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

function openVideo(videoId, manifestUrl) {
  console.log("Open video:", videoId, manifestUrl);
}

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