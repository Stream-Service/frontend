document.addEventListener("DOMContentLoaded", async () => {
  const userId = localStorage.getItem("user_id");
  const token = localStorage.getItem("access_token");
  const portrait = document.getElementById("roundPortrait");
  const editIcon = document.getElementById("editIcon");
  const fileInput = document.getElementById("fileInput");
  const bioParagraph = document.getElementById("bioText");
  const bioEditIcon = document.getElementById("bioEditIcon");
  const bioTextarea = document.getElementById("bioTextarea");
  const saveBioBtn = document.getElementById("saveBioBtn");
  const b3 = document.getElementById("usr-id");
  const email_tah = document.getElementById("email");
  const userEmail = localStorage.getItem("user_email") || "No email available";
  email_tah.innerText = `Email: ${userEmail}`;
  const post1 = window.CONFIG.post;
  b3.innerText = `User-ID: ${userId}`;

   

  portrait.src = `${post1}/auth/users/${userId}/profile-pic`;
  portrait.onerror = function () {
    this.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23d80921'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";
  };

  try {
    const res = await fetch(`${post1}/posting/users/stats`, {
      method: "GET",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      document.getElementById("videoCount").textContent = data.total_videos ?? 0;
      document.getElementById("postCount").textContent = data.total_posts ?? 0;
      document.getElementById("viewCount").textContent = data.total_views ?? 0;
    }
  } catch (err) {
    console.error("Failed to fetch stats:", err);
  }

  try {
    const res = await fetch(`${post1}/auth/users/${userId}/description`, {
      method: "GET",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      bioParagraph.textContent = data.description || "No description available.";
    }
  } catch (err) {
    console.error("Failed to fetch description:", err);
  }

  editIcon.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", async () => {
    if (!fileInput.files.length) return;
    const file = fileInput.files[0];

    const reader = new FileReader();
    reader.onload = (e) => {
      portrait.src = e.target.result;
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(`${post1}/posting/upload/profile/${userId}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) {
        alert("Failed to upload profile picture");
      } else {
        portrait.src = `${post1}/auth/users/${userId}/profile-pic`;
      }
    } catch (err) {
      console.error("Upload error:", err);
    }
  });

  bioEditIcon.addEventListener("click", () => {
    bioTextarea.style.display = "block";
    saveBioBtn.style.display = "inline-block";
    bioTextarea.value = bioParagraph.textContent;
  });

  saveBioBtn.addEventListener("click", async () => {
    const newText = bioTextarea.value;
    try {
      const res = await fetch(`${post1}/auth/users/${userId}/description`, {
        method: "PUT",
        headers: { "Content-Type": "application/json","Authorization": `Bearer ${token}` },
        body: JSON.stringify({ description: newText }),
      });
      if (res.ok) {
        const data = await res.json();
        bioParagraph.textContent = data.description;
        bioTextarea.style.display = "none";
        saveBioBtn.style.display = "none";
      }
    } catch (err) {
      console.error("Failed to update description:", err);
    }
  });
});