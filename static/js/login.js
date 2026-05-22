document.addEventListener("DOMContentLoaded", () => {
  const login_button    = document.getElementById("login_button");
  const login_useremail = document.getElementById("login_username");
  const login_password  = document.getElementById("login_pass");
  const errorPopup      = document.getElementById("errorPopup");
  const errorMessage    = document.getElementById("errorMessage");
  const closeErrorBtn   = document.getElementById("closeErrorPopup");
  const post2= window.CONFIG.post;

  function showError(message) {
    if (errorPopup && errorMessage) {
      errorMessage.textContent = message;
      errorPopup.classList.add("show");
    } else {
      alert(message);
    }
  }

  if (closeErrorBtn) {
    closeErrorBtn.addEventListener("click", () => {
      errorPopup.classList.remove("show");
    });
  }

  if (errorPopup) {
    errorPopup.addEventListener("click", (e) => {
      if (e.target === errorPopup) errorPopup.classList.remove("show");
    });
  }

  if (login_button) {
    login_button.addEventListener("click", async (event) => {
      event.preventDefault();

      const userName = login_useremail.value.trim();
      const passWord = login_password.value;

      if (!userName || !passWord) {
        showError("Please enter your email and password.");
        return;
      }

      const postUrl = window.post;
      const Login_form_data = new URLSearchParams();
      Login_form_data.append("username", userName);
      Login_form_data.append("password", passWord);

      try {
        const response = await fetch(`${post}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: Login_form_data.toString(),
        });

        const result = await response.json();

        if (response.ok && result.access_token) {
          localStorage.setItem("access_token", result.access_token);
          if (result.refresh_token) localStorage.setItem("refresh_token", result.refresh_token);
          if (result.user_id)       localStorage.setItem("user_id", result.user_id);
          localStorage.setItem("user_email", result.email || userName);
          sessionStorage.setItem("access_token", result.access_token);
          window.location.href = "./templates/feed.html";
        } else {
          showError(result.detail || "Invalid credentials. Please check your email and password.");
        }

      } catch (err) {
        console.error("Login error:", err);
        showError("Login failed. Please check your connection and try again.");
      }
    });
  }
});