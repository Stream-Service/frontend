// Left sidebar navbar


class MyNavbar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <nav>
        <a href="./feed.html"><i class="fas fa-home"></i></a>
        <a href="./profile.html"><i class="fas fa-user"></i></a>
        <a href="./videos.html"><i class="fas fa-cog"></i></a>
        <a href="./search.html"><i class="fas fa-search"></i></a>
        <a href="#" id="uploadTrigger"><i class="fas fa-upload"></i></a>
        <a href="./posts.html"><i class="fas fa-bell"></i></a>
      </nav>
    `;

    const current_path = window.location.pathname.split("/").pop();
    const path2 = "./" + current_path;

    const links = this.querySelectorAll("a");
    links.forEach(element => {
      if (element.getAttribute("href") === path2) {
        element.classList.add("active");
      }
    });

    // Handle upload trigger click - open upload overlay
    const uploadTrigger = this.querySelector("#uploadTrigger");
    if (uploadTrigger) {
      uploadTrigger.addEventListener("click", (e) => {
        e.preventDefault();
        const overlay = document.getElementById("uploadOverlay");
        if (overlay) overlay.style.display = "flex";
      });
    }
  }
}
customElements.define("my-navbar", MyNavbar);

class BottomNavbar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="bottom-navbar">
        <button class="plus-btn" id="uploadPlus">
          <i class="fas fa-plus"></i>
        </button>
      </div>
    `;

    // Handle opening the overlay
    
    const plusBtn = this.querySelector("#uploadPlus");
    plusBtn.addEventListener("click", () => {
      const overlay = document.getElementById("uploadOverlay2");
      if (overlay) overlay.style.display = "flex";
    });

    // Attach submit handler to the upload form
    
  }
}
 
 
customElements.define("bottom-navbar", BottomNavbar);
const currentUserId = localStorage.getItem("user_id");
const token = localStorage.getItem("access_token");
const posting_service=CONFIG.posting_service
 
const compression_service=CONFIG.compression_service
 

class MyTopbar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <header class="skyline-bar">
        <div class="brand-badge">
          <i class="fas fa-rocket"></i> <span>SocialStream</span>
        </div>
        <div class="logout-badge" id="logout_button">
          <a href="#"><i class="fas fa-sign-out-alt"></i></a>
        </div>
      </header>
    `;

    const logg_butt = this.querySelector("#logout_button");
    if (logg_butt) {
      logg_butt.addEventListener("click", (e) => {
        e.preventDefault(); // stop <a href=""> reload

        // Clear local storage/session
        localStorage.clear();
        sessionStorage.clear();

        // Navigate manually
        window.location.href = "/index.html";
      });
    }
  }
}

customElements.define("my-topbar", MyTopbar);
 
 
window.post= window.CONFIG.post;
 
class PostCard extends HTMLElement {
  connectedCallback() {
    const post = JSON.parse(this.getAttribute("data-post"));
    const currentUserId = this.getAttribute("current-user-id");
    const showDelete = String(post.user_id) === String(currentUserId);
 
    this.innerHTML = `
      <div class="post-card">
        <div class="post_header">
          <div class="user-info">
            <img src="${window.post}/auth/users/${post.user_id}/profile-pic"
                 alt="err" class="user-pic" id="popp" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27%23d80921%27%3E%3Cpath d=%27M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z%27/%3E%3C/svg%3E'">
            <span class="username">${post.username || "User"}</span>
          </div>
          ${showDelete ? `
            <div class="menu">
              <button class="optionsBtn">⋮</button>
              <div class="dropdown" style="display:none">
                <ul><li class="deleteOption">🗑️ Delete</li></ul>
              </div>
            </div>
          ` : ""}
        </div>
 
        <div class="thumbnail_section">
          <img src="${post.thumbnail_url || ""}" class="thumbnail">
        </div>
 
        <div class="description_section">
          <h3>${post.title}</h3>
          <p>${post.content}</p>
          <span>Views: ${post.views}</span>
        </div>
 
        <div class="button_section">
          <button class="likeBtn">👍 Like ${post.likes}</button>
          <button class="dislikeBtn">👎 Dislike ${post.dislikes}</button>
        </div>
 
        <div class="comments_section">
          <div class="comments_list"></div>
          <div class="comment-input-row">
            <input type="text" class="commentInput" placeholder="Add a comment...">
            <button class="commentSubmit">Post</button>
          </div>
        </div>
 
      </div>
    `;
 
    // Profile pic click
    const userPic = this.querySelector("#popp");
    if (userPic) {
      userPic.setAttribute("draggable", "false");
      userPic.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (typeof openProfileModal === 'function') {
          openProfileModal(post.user_id);
        } else {
          window.location.href = `./popup.html?id=${encodeURIComponent(post.user_id)}`;
        }
        return false;
      });
      userPic.addEventListener("mousedown", (e) => e.preventDefault());
    }
 
    // Like / Dislike
    const likeBtn = this.querySelector(".likeBtn");
    likeBtn.onclick = () => handleLike(post.post_id, likeBtn);
 
    const dislikeBtn = this.querySelector(".dislikeBtn");
    dislikeBtn.onclick = () => handleDislike(post.post_id, dislikeBtn);
 
    // Comment
    const commentBtn = this.querySelector(".commentSubmit");
    const commentInput = this.querySelector(".commentInput");
    const commentsContainer = this.querySelector(".comments_list");
 
    commentBtn.onclick = () => {
      if (commentInput.value.trim()) {
        handleComment(post.user_id, post.post_id, commentInput.value, commentsContainer);
        commentInput.value = "";
      }
    };
 
    // Delete (owner only)
    if (showDelete) {
      const optionsBtn = this.querySelector(".optionsBtn");
      const dropdown = this.querySelector(".dropdown");
 
      optionsBtn.onclick = (e) => {
        e.stopPropagation();
        dropdown.style.display = dropdown.style.display === "none" ? "block" : "none";
      };
 
      dropdown.querySelector(".deleteOption").onclick = async () => {
        if (confirm("Delete this post?")) {
          const postUrl = window.post;
          const res = await fetch(`${postUrl}/posting/posts/${post.post_id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
          });
          if (res.ok) this.remove();
        }
      };
 
      document.addEventListener("click", (event) => {
        if (!this.contains(event.target)) dropdown.style.display = "none";
      });
    }
  }
}
 
customElements.define("post-card", PostCard);


async function openVideo(videoId, videoUrl) {
    CURRENT_VIDEO_ID = videoId;

    // Get the correct video modal
    const videoModal = document.getElementById("videoModal");
    const videoPlayer = document.getElementById("videoPlayer");

    if (!videoModal || !videoPlayer) {
        console.error("Video modal or player not found");
        return;
    }

    // UI Updates
    videoModal.style.display = 'flex';
    videoPlayer.pause();

    // 🔹 NEW INJECTION: Fetch real like and dislike counts immediately on video load
    try {
        // Replace this path string if your video interactions endpoint points elsewhere
        const interactionRes = await fetch(`${post}/posting/videos/interactions/${videoId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (interactionRes.ok) {
            const counts = await interactionRes.json();
            // Dynamically updates UI text counters before user needs to click anything
            if (document.getElementById("likeCount")) {
                document.getElementById("likeCount").innerText = counts.likes ?? 0;
            }
            if (document.getElementById("dislikeCount")) {
                document.getElementById("dislikeCount").innerText = counts.dislikes ?? 0;
            }
        }
    } catch (err) {
        console.error("Error running initial like/dislike fetch on openVideo:", err);
    }

    // Important: Clear the player properly before loading new source
    videoPlayer.src = ''; 

    if (Hls.isSupported()) {
        // If an old HLS instance exists, destroy it first to prevent memory leaks
        if (window.hls) { 
            window.hls.destroy(); 
        }
        
        // Initialize HLS with a custom XHR setup to fix Netlify proxy paths
        window.hls = new Hls({
            xhrSetup: function (xhr, url) {
                // Check if the URL is missing the /api/stream prefix
                // This happens when the manifest uses relative paths like 'chunk_000.ts'
                if (url.includes(window.location.origin) && !url.includes('/api/stream')) {
                    // Rewrite the URL to use the Netlify bridge
                    const secureUrl = url.replace(window.location.origin, window.location.origin + '/api/stream');
                    xhr.open('GET', secureUrl, true);
                }
            }
        });
        
        window.hls.loadSource(videoUrl); 
        window.hls.attachMedia(videoPlayer);
        
        window.hls.on(Hls.Events.MANIFEST_PARSED, function() {
            videoPlayer.play().catch(e => console.log("Auto-play blocked, user must click play."));
        });

        // Error handling for HLS
        window.hls.on(Hls.Events.ERROR, function (event, data) {
            if (data.fatal) {
                console.error("HLS Fatal Error:", data.type);
            }
        });

    } else if (videoPlayer.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari Fallback - Safari handles the pathing internally, 
        // but it must be passed the full secure URL from the start.
        videoPlayer.src = videoUrl;
        videoPlayer.addEventListener('loadedmetadata', function() {
            videoPlayer.play();
        });
    }

    loadComments(CURRENT_VIDEO_ID);
}

const stream_service=CONFIG.stream_service
const post_servbice=CONFIG.posting_service
async function loadComments(video_id) {
   
  const commentsContainer = document.getElementById("commentsContainer");
  if (!commentsContainer) {
    console.error("Comments container not found");
    return;
  }
  commentsContainer.innerHTML = "Loading comments...";

  try {
     

    const response = await fetch(`${post}/posting/videos/comments1/${video_id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    

    if (response.status === 401) {
      commentsContainer.innerHTML = "<p style='color:red;'>Please login to view comments</p>";
      return;
    }

    if (!response.ok) throw new Error("Failed to fetch comments");

    const comments = await response.json();
     

    // Clear container
    commentsContainer.innerHTML = "";

    if (!comments || comments.length === 0) {
      commentsContainer.innerHTML = "<p style='color:gray; padding:10px; text-align:center;'>No comments yet</p>";
      return;
    }

    // Build HTML asynchronously to resolve user profiles sequentially
    let html = "";
    
    // Changing to a traditional for...of loop to cleanly support await operations inside
    for (const c of comments) {
      const date = new Date(c.created_at).toLocaleString();
      const username = c.user && c.user.username ? c.user.username : "User";
      
      // 🔹 Default fallback value for the new secondary user endpoint name
      let dynamicUsername = "Fetching...";

      // 🔹 Call user endpoint using the comment's user_id
      if (c.user_id) {
        try {
          // Fixed: Added headers block with authorization token here
          const userRes = await fetch(`${post}/auth/users/get_data/${c.user_id}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            }
          });
          if (userRes.ok) {
            const userData = await userRes.json();
            dynamicUsername = userData.firstname || "Unknown";
          } else {
            dynamicUsername = "Unknown";
          }
        } catch (fetchErr) {
          console.error(`Error resolving user profile data for id ${c.user_id}:`, fetchErr);
          dynamicUsername = "Error";
        }
      } else {
        dynamicUsername = "No ID";
      }

      // Appending both username variants right next to each other as requested
      html += `
        <div class="comment" style="padding:12px; background:#fff; border-radius:8px; margin-bottom:10px; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          <strong style="color:#d80921;">${username} (${dynamicUsername})</strong>
          <span style="color:gray;font-size:11px; margin-left:8px;">${date}</span>
          <p style="margin:8px 0 0 0; color:#333;">${c.content}</p>
        </div>
      `;
    }

    commentsContainer.innerHTML = html;

    // Force reflow to ensure rendering
    void commentsContainer.offsetHeight;

  } catch (err) {
    console.error("Error loading comments:", err);
    commentsContainer.innerHTML = `<p style='color:red;'>Error: ${err.message}</p>`;
  }
}
// Profile popup loader
async function openPopup(userId) {
  console.log("rrrrrrrr",userId)
  const modal = document.getElementById("popup_container");
  const body = document.getElementById("profileBody");
  if (!modal || !body) return;

  modal.style.display = "flex";
   

  // try {
  //   // Example: fetch JSON data from API
  //   const response = await fetch(`http://127.0.0.1:8000/pop/${userId}`);
  //   if (!response.ok) throw new Error("Failed to load profile");
  //   const data = await response.json();

    // Build HTML fragment dynamically
    body.innerHTML = `
      <div class="crush_intro">
    <div class="crush_intro-left">
      <img src="" alt="crush_Profile Picture" class="crush_popup-profile-pic" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27%23d80921%27%3E%3Cpath d=%27M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z%27/%3E%3C/svg%3E'">
      <button class="crush_subscribe-btn">Subscribe</button>
    </div>
     
    <div class="crush_intro-right">
  <h3>About</h3>
   
  <p>My goal is to build a community where learning and inspiration go hand in hand. Whether you’re here to pick up new skills, explore fresh ideas, or just enjoy some entertaining content, you’ll find something that sparks your curiosity.</p>

  <p>📌 What you’ll find here:
    <ul>
      <li>🎥 Videos: Tutorials, reviews, and behind-the-scenes content</li>
      <li>📝 Posts: Quick updates, thoughts, and written guides</li>
      <li>ℹ️ About: Insights into my journey and future plans</li>
    </ul>
  </p>

  <p>Thanks for stopping by — don’t forget to hit Subscribe so you can join me on this journey!</p>
</div>

      
  </div>

  <!-- Navigation links -->
  <div class="crush_nav-links">
    <a id="crush_videoLink">Video</a>
    <a id="crush_postLink" class="active">Post</a>
    <a id="crush_aboutLink">About</a>
  </div>

  <!-- Content section -->
  <div class="crush_profile_content">
  <div id="crush_videoSection" class="video active">
    <h3>Videos</h3>
    <div id="crush_videoGrid"></div>
  </div>

  <div id="crush_postSection" class="post">
    <h3>Posts</h3>
    <div id="crush_postsGrid"></div>
  </div>

  <div id="crush_aboutSection" class="about">
      
  </div>
</div>
    `;

    // Optionally populate videoGrid/postsGrid with more API calls
    loadUserVideos(userId);
    loadUserPosts(userId);

}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}
 

// Call this when a video card is clicked
async function checkFollowState(following_id) {
  try {
    const res = await fetch(
      `${post}/following/is-following?follower_id=${currentUserId}&following_id=${following_id}`
    );
    const data = await res.json();
    isFollowing = data.is_following;

    if (isFollowing) {
      subsbutton.textContent = "✓ Following";
      subsbutton.style.backgroundColor = "#555";
    } else {
      subsbutton.textContent = "Subscribe";
      subsbutton.style.backgroundColor = "";
    }
  } catch (err) {
    isFollowing = false;
    subsbutton.textContent = "Subscribe";
    subsbutton.style.backgroundColor = "";
  }
}
 
async function handleLike(postId, likeBtn) {
  try {
    const res = await fetch(`${post}/posting/posts/like/${postId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    if (!res.ok) throw new Error("Failed to add likes");
    await res.json();
    let currentCount = parseInt(likeBtn.textContent.replace(/\D/g, "")) || 0;
    likeBtn.textContent = `👍 Like ${currentCount + 1}`;
  } catch (err) {
    alert("Try again");
  }
}

async function handleDislike(postId, dislikeBtn) {
  try {
    const res = await fetch(`${post}/posting/posts/dislike/${postId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    if (!res.ok) throw new Error("Failed to add dislikes");
    await res.json();
    let currentCount = parseInt(dislikeBtn.textContent.replace(/\D/g, "")) || 0;
    dislikeBtn.textContent = `👎 Dislike ${currentCount + 1}`;
  } catch (err) {
    alert("Try again");
  }
}

async function handleComment(usser_id,postId, commentText, commentsContainer) {
  try {
    const res = await fetch(`${post}/posting/posts/comment/${postId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: usser_id ,content: commentText })
    });
    if (!res.ok) throw new Error("Failed to add comment");
    const newComment = await res.json();
    const div = document.createElement("div");
    div.className = "comment";
    div.textContent = `${newComment.usser_id}: ${newComment.commentText}`;
    commentsContainer.appendChild(div);
  } catch (err) {
    alert("Error adding comment");
  }
}

async function uploadVideo(token) {
  const fileInput = document.getElementById("videoInput");
  const title = document.getElementById("videoTitle").value;
  const description = document.getElementById("videoDescription").value;
  const status = document.getElementById("status");

  if (!fileInput.files.length) {
    status.innerText = "Please select a video file.";
    return;
  }

  const file = fileInput.files[0];
  const chunkSize = 2 * 1024 * 1024;
  const videoId = crypto.randomUUID();

  status.innerText = "Uploading...";

  // 1️⃣ Upload chunks
  try {
    for (let start = 0, index = 0; start < file.size; start += chunkSize, index++) {
      const chunk = file.slice(start, start + chunkSize);
      const response = await fetch(`${post}/compress/upload-chunk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream",
          "X-Video-ID": videoId,
          "X-Chunk-Index": index.toString(),
          "Authorization": `Bearer ${token}`
        },
         
        body: chunk
      });

      if (response.status === 401) {
        window.location.href = ""; // redirect placeholder
        return;
      }

      if (!response.ok) {
        status.innerText = `Error uploading chunk ${index + 1}: ${response.statusText}`;
        return;
      }

      status.innerText = `Uploaded chunk ${index + 1}`;
    }
  } catch (err) {
    status.innerText = `Error uploading chunks: ${err}`;
    return;
  }

  // 2️⃣ Finalize upload
  try {
    const response = await fetch(`${post}/compress/finalize-upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
       
      body: JSON.stringify({
        user_id: currentUserId,
        video_id: videoId,
        title: title,
        description: description
      })
    });

    if (response.status === 401) {
      window.location.href = ""; // redirect placeholder
      return;
    }

    if (!response.ok) {
      status.innerText = `❌ Error finalizing upload: ${response.statusText}`;
      return;
    }

    status.innerText = "✅ Upload complete and finalized!";
  } catch (err) {
    status.innerText = `❌ Network error during finalize: ${err}`;
    return;
  }

  // 3️⃣ Save metadata
  try {
    const response = await fetch(`${post}/posting/add_video_metadata`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        user_id: currentUserId,
        video_id: videoId,
        title: title,
        description: description,
        video_url: "https://cdn.example.com/videos/abc123.mp4",
        thumbnail: "https://cdn.example.com/thumbnails/abc123.jpg"
      })
    });

    if (response.status === 401) {
      window.location.href = ""; // redirect placeholder
      return;
    }

    if (!response.ok) {
      status.innerText = `❌ Metadata save failed: ${response.statusText}`;
      return;
    }

    status.innerText += "\n✅ Metadata saved successfully!";
  } catch (err) {
    status.innerText = `❌ Metadata save failed: ${err}`;
    return;
  }

  // 4️⃣ Extra block (final step, e.g. notify user or refresh UI)
  try {
      const res_data= fetch (`${post}/posting/add_count/video`,{
        method:"POST",
        headers:{"Content-Type":"application/json",
                "Authorization": `Bearer ${token}`
        }

      })
    // Example: refresh video list or redirect
    console.log("All steps done, you can refresh UI here.");
  } catch (err) {
    console.error("❌ Error in final step:", err);
    window.location.href = ""; // redirect placeholder
  }
}
async function openProfileModal(userId) {
  const profileModal = document.getElementById("profileModal");
  profileModal.classList.add("active");

  const profileModalPic = document.getElementById("profileModalPic");
  profileModalPic.src = `${post}/auth/users/${userId}/profile-pic`;
  profileModalPic.onerror = function () {
    this.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23d80921'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";
  };

  try {
    // Fixed: Added headers block with authorization token here
    const descResponse = await fetch(`${post}/auth/users/${userId}/description`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });
    const descData = descResponse.ok ? await descResponse.json() : { description: "No description" };
    document.getElementById("profileModalDesc").textContent = descData.description || "No description";
  } catch (err) {
    document.getElementById("profileModalDesc").textContent = "No description";
  }

  // ✅ Check follow state once here — works for ALL pages
  const subscribeBtn = document.getElementById("profileSubscribeBtn");
  try {
    const res = await fetch(
      `${post}/following/is-following?follower_id=${currentUserId}&following_id=${userId}`
    );
    const data = await res.json();
    subscribeBtn.dataset.following = data.is_following;
    
    // 🌟 CHANGED HERE: Displays "✓ Subscribed" when following instead of "✓ Following"
    subscribeBtn.textContent = data.is_following ? "✓ Subscribed" : "Subscribe";
    subscribeBtn.style.backgroundColor = data.is_following ? "#555" : "";
  } catch (err) {
    subscribeBtn.dataset.following = "false";
    subscribeBtn.textContent = "Subscribe";
    subscribeBtn.style.backgroundColor = "";
  }

  setupProfileTabs(userId);
  document.getElementById("profilePostLink").click();
}

// DOMContentLoaded ensures elements exist
document.addEventListener("DOMContentLoaded", () => {

  // token is now defined at top level
   

  const uploadForm_ = document.getElementById("uploadForm2");
    if (uploadForm_) {
      uploadForm_.addEventListener("submit", (e) => {
        e.preventDefault();
        console.log("yhygie",token) // prevent page reload
        uploadVideo(token);      // call your async function
      });
    }


  

  const closeBtn = document.getElementById("popup_closeProfile");
  const modal = document.getElementById("popup_container");

  if (closeBtn && modal) {
    closeBtn.onclick = () => {
      modal.style.display = "none";
    };
  }

  window.onclick = (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  };

  // Upload form submission handler
  const uploadForm = document.getElementById("uploadForm");
  const overlay = document.getElementById("uploadOverlay");
  if (uploadForm && overlay) {
    uploadForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const post_title = document.getElementById("title").value;
      const post_description = document.getElementById("description").value;
      const post_file = document.getElementById("image").files[0];
      const form_data = new FormData();
      form_data.append("title", post_title);
      form_data.append("content", post_description);
      form_data.append("image", post_file);

      try {
        const response = await fetch(`${post}/posting/posts`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` },
          body: form_data,
        });

        if (!response.ok) throw new Error("Failed to upload");

        const result = await response.json();
        console.log("Upload success:", result);
        alert("✅ IMAGE UPLOADED");
        overlay.style.display = "none";
      } catch (err) {
        console.error(err);
        alert("❌ Error uploading image");
      }

      try {
        const response2 = await fetch(`${post}/posting/add_count/post`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
        });

        if (!response2.ok) throw new Error("Failed to add count");

        const metaResult = await response2.json();
        console.log("Metadata saved:", metaResult);
        alert("✅ Metadata saved successfully!");
      } catch (err) {
        console.error(err);
        alert("❌ Error saving metadata");
      }
    });
  }

  // Upload overlay close handler (click outside to close)
  const uploadOverlayEl = document.getElementById("uploadOverlay");
  if (uploadOverlayEl) {
    uploadOverlayEl.addEventListener("click", (e) => {
      if (e.target.id === "uploadOverlay") {
        uploadOverlayEl.style.display = "none";
      }
    });
  }

  // Video upload popup close handlers
  const uploadOverlay2 = document.getElementById("uploadOverlay2");
  const closeUpload2 = document.getElementById("closeUpload2");

  if (closeUpload2) {
    closeUpload2.addEventListener("click", () => {
      if (uploadOverlay2) uploadOverlay2.style.display = "none";
    });
  }

  if (uploadOverlay2) {
    uploadOverlay2.addEventListener("click", (e) => {
      if (e.target.id === "uploadOverlay2") {
        uploadOverlay2.style.display = "none";
      }
    });
  }
});