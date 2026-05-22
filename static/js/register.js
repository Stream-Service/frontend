document.addEventListener("DOMContentLoaded", () => {
  const sendOtpButton = document.getElementById("send_otp_button");
  const firstname = document.getElementById("firstname");
  const lastname = document.getElementById("lastname");
  const email = document.getElementById("email");
  const phone = document.getElementById("phone");
  const password = document.getElementById("pass");

  sendOtpButton.addEventListener("click", async function(event) {
    event.preventDefault();

    const first_name = firstname.value;
    const last_name = lastname.value;
    const email_ = email.value;
    const phone_ = phone.value;
    const password_ = password.value;

    if (!first_name || !last_name || !email_ || !password_) {
      alert("Please fill in all required fields");
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email_)) {
      alert("Please enter a valid email address");
      return;
    }

    // Validate password
    if (password_.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    // Store form data in localStorage for OTP verification page
    localStorage.setItem("registration_data", JSON.stringify({
      firstname: first_name,
      lastname: last_name,
      email: email_,
      phone: phone_,
      password: password_
    }));

    sendOtpButton.disabled = true;
    sendOtpButton.textContent = "Sending OTP...";

    try {
      // Send OTP with full user details to backend
      const response = await fetch(`${post}/auth/users/auth/register/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstname: first_name,
          lastname: last_name,
          email: email_,
          phone: phone_ || null,
          password: password_
        })
      });

      const result = await response.json();

      if (response.ok || response.status === 200) {
      
        // Redirect to OTP verification page
        window.location.href = `./register-otp.html?email=${encodeURIComponent(email_)}`;
      } else {
        alert(result.detail || result.error || "Failed to send OTP. Please try again.");
        sendOtpButton.disabled = false;
        sendOtpButton.textContent = "Send OTP";
      }
    } catch (err) {
      console.error("Error sending OTP:", err);
      alert("Failed to send OTP. Please try again.");
      sendOtpButton.disabled = false;
      sendOtpButton.textContent = "Send OTP";
    }
  });
});