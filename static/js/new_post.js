// new_post.js - Load and display user's posts

// Use global variables from base.js: post, token, currentUserId

console.log("new_post.js loaded");
console.log("token:", token);
console.log("currentUserId:", currentUserId);

// Redirect to login if not authenticated
if (!token || !currentUserId) {
    window.location.href = "/templates/login.html";
}

async function loadMyPosts() {
    const posts_grid = document.getElementById("posts_grid");

    posts_grid.innerHTML = "<p>Loading posts...</p>";
    console.log("Fetching from:", `${post}/posting/getposts/${currentUserId}`);
    try {
        const response = await fetch(`${post}/posting/getposts/${currentUserId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            window.location.href = "/templates/login.html";
            return;
        }

        if (!response.ok) throw new Error("Failed to fetch posts: " + response.status);
        const posts = await response.json();
        console.log("Posts response:", posts);

        if (!posts || posts.length === 0) {
            posts_grid.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666; grid-column: 1 / -1;">
                    <h3>No posts found</h3>
                    <p>You haven't created any posts yet.</p>
                    <a href="/templates/posts.html" style="color: #d80921; text-decoration: none; font-weight: 600;">
                        Create your first post →
                    </a>
                </div>`;
            return;
        }

        posts_grid.innerHTML = "";
        console.log("Processing", posts.length, "posts");
        for (const p of posts) {
            // Fetch thumbnail URL
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

            // Create a <post-card> element (reusable template from base.js)
            const card = document.createElement("post-card");
            card.setAttribute("data-post", JSON.stringify(postData));
            card.setAttribute("current-user-id", currentUserId);

            posts_grid.appendChild(card);
        }
    } catch (err) {
        console.error("Error loading posts:", err);
        alert("Error loading posts: " + err.message);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("post-card defined?", customElements.get("post-card"));
    loadMyPosts();
});