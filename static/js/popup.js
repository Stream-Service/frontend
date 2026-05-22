
const modal = document.getElementById("videoModal");
 


const videoLink = document.getElementById("crush_videoLink");
const imgg = document.getElementById("imgg");
const postLink = document.getElementById("crush_postLink");
const aboutLink = document.getElementById("crush_aboutLink");
const subscribeBtn=document.getElementsByClassName("crush_subscribe-btn")[0]
const params = new URLSearchParams(window.location.search);
 
// Use global variables from base.js: post, token, currentUserId, streaming_service

 
 
const crush_id = params.get("id")

imgg.src=`${post}/auth/users/${crush_id}/profile-pic`
 
console.log("Crush ID:", crush_id);
  const videoSection = document.getElementById("crush_videoSection");
const postSection = document.getElementById("crush_postSection");
const aboutSection = document.getElementById("crush_aboutSection");


loadDescription(crush_id);
 

// Load comments

  function clearActive() {
    videoSection.classList.remove("active");
    postSection.classList.remove("active");
    aboutSection.classList.remove("active");
    videoLink.classList.remove("active");
    postLink.classList.remove("active");
    aboutLink.classList.remove("active");
  }
  async function loadDescription(userId) {
    try {
      const response = await fetch(`${post}/auth/users/${userId}/description`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();

      // Assuming the endpoint returns something like { "description": "..." }
      document.getElementById("disp").textContent = data.description;
    } catch (error) {
      console.error("Error fetching description:", error);
    }
  }
  // Empty function stubs you can fill later
  async function onVideoClick(crush_id) {
    try {
    const response = await fetch(`${post}/posting/api/videos?user_id=${crush_id}&page=0&limit=10`);
    if (!response.ok) throw new Error("Failed to fetch videos");
    const videos = await response.json();

    const videoList = document.getElementById("crush_videoGrid");
    videoList.innerHTML = "";

    videos.forEach(v => {

        const video_div_card= document.createElement("div");
        video_div_card.className = "crush_pop_video-card";

// Header with title + menu dots
        const video_left = document.createElement("div");
        video_left.className = "crush_pop_left_side";

        const video_right = document.createElement("div");
        video_right.className = "crush_pop_right_side";
         
          // hidden by default
        const img = document.createElement("img");
        img.src = `${post}`+ v.thumbnail_url;
        img.onclick = () => openVideo(v.video_id, v.manifest_url); 
        img.className = "crush_pop_video_thumbnail";

// Description section
        const description_div = document.createElement("div");
        description_div.className = "crush_description_section";
        description_div.innerHTML = `
        
        <span class="video-title">${v.title}</span>
         `;

// Build card
        video_left.appendChild(img);
        
        video_right.appendChild(description_div);
        video_div_card.appendChild(video_left);
        video_div_card.appendChild(video_right);
        
        videoList.appendChild(video_div_card);
         
       
    });
  } catch (err) {
    console.error("❌ Error loading video list:", err);
  }
}
    // TODO: add logic when Video tab is clicked
  

  async function onPostClick(crush_id) {
     
  try {
    const response_posts = await fetch(`${post}/posting/getposts/${crush_id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });

    if (!response_posts.ok) throw new Error("Failed to fetch posts");

    const posts = await response_posts.json();
    const posts_grid = document.getElementById("crush_postsGrid");
    posts_grid.innerHTML = "";
     

    for (const p of posts) {
      const post_div_post = document.createElement("div");
      post_div_post.className = "pop_post_card";

      // Thumbnail
      const thumbnail_div = document.createElement("div");
      thumbnail_div.className = "pop_post_thumbnail_section";
      const img = document.createElement("img");

      try {
         
        const res = await fetch(`${post}/streaming/posts?user_id=${p.user_id}&post_id=${p.post_id}`);
        const data = await res.json();
        img.src = data.url || "";
      } catch (err) {
        console.error("Error fetching presigned URL:", err);
      }

      img.className = "pop_post_thumbnail";
      thumbnail_div.appendChild(img);
      post_div_post.appendChild(thumbnail_div);
     

      posts_grid.appendChild(post_div_post);
      

       
       
       
    }
    postSection.appendChild(posts_grid);
  } catch (err) {
    alert("Error n : " + err);
  }

    // TODO: add logic when Post tab is clicked
  }

 


  function onAboutClick(crush_id) {
    const ele=document.getElementById("crush_aboutSection")
    const info=document.createElement("div");
    info.innerHTML=`
    <h3>Country:India</h3>
    <h3>Joined At: 2025</h3>`;

    ele.appendChild(info)

    // TODO: add logic when About tab is clicked
  }

  videoLink.onclick = () => {
    clearActive();
    videoSection.classList.add("active");
    videoLink.classList.add("active");
    onVideoClick(crush_id);   // call stub
  };

  postLink.onclick = () => {
    clearActive();
    postSection.classList.add("active");
    postLink.classList.add("active");
    onPostClick(crush_id);    // call stub
  };

  aboutLink.onclick = () => {
    clearActive();
    aboutSection.classList.add("active");
    aboutLink.classList.add("active");
    onAboutClick(crush_id);   // call stub
  };
 


 

// Assume you already know the logged-in user_id (from session, localStorage, etc.)
 // or however you store it
subscribeBtn.addEventListener("click", async () => {
  try {
    const formData = new FormData();
    formData.append("follower_id", currentUserId);
    formData.append("following_id", crush_id);

    const response = await fetch(`${post}/following/follow`, {
      method: "POST",
      body: formData
    });

    let result;
    try {
      result = await response.json();
      console.log("Response body:", result);
    } catch {
      result = await response.text(); // fallback if not JSON
    }

    console.log("Response status:", response.status);
    console.log("Response body:", result);

    if (response.status == 201) {
      alert("✅ Subscribed!");
      console.log("Follow response:", result);
      // Optional: disable button after success
      subscribeBtn.disabled = true;
      subscribeBtn.textContent = "Subscribed";
    } else {
      alert("❌ Failed to follow: " + (result.error || "Unknown error"));
      console.error("Follow error:", result);
    }
  } catch (err) {
    console.error("Network error:", err);
    alert("Could not reach follow API.");
  }
});
