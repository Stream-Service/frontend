document.addEventListener("DOMContentLoaded", () => {
  const verifyOtpButton = document.getElementById("verify_otp_button");
  const otpInput = document.getElementById("otp");
  const userEmailDisplay = document.getElementById("userEmail");
  const resendLink = document.getElementById("resendLink");

  // Get email from URL
  const urlParams = new URLSearchParams(window.location.search);
  const email = urlParams.get("email");

  if (!email) {
    alert("No email found. Please register again.");
    window.location.href = "./register.html";
    return;
  }

  userEmailDisplay.textContent = email;

  // Handle OTP verification
  verifyOtpButton.addEventListener("click", async function(event) {
    event.preventDefault();

    const otp = otpInput.value.trim();

    if (!otp || otp.length < 4) {
      alert("Please enter a valid OTP");
      return;
    }

    // Get stored registration data
    const storedData = localStorage.getItem("registration_data");
    if (!storedData) {
      alert("Registration data not found. Please register again.");
      window.location.href = "./register.html";
      return;
    }

    verifyOtpButton.disabled = true;
    verifyOtpButton.textContent = "Verifying...";

    try {
      // Verify OTP and create user
      const response = await fetch(`${post}/auth/users/auth/register/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, otp: otp })
      });

      const result = await response.json();

      if (response.status === 201) {
        console.log("User created:", result);

        // Clear registration data
        localStorage.removeItem("registration_data");

         
        window.location.href = "./login.html";

      } else {
        alert(result.detail || result.error || "Invalid OTP or something went wrong. Please try again.");
        verifyOtpButton.disabled = false;
        verifyOtpButton.textContent = "Verify & Register";
      }

    } catch (err) {
      console.error("Error verifying OTP:", err);
      alert("Verification failed. Please try again.");
      verifyOtpButton.disabled = false;
      verifyOtpButton.textContent = "Verify & Register";
    }
  });

  // Handle resend OTP
  resendLink.addEventListener("click", async function(event) {
    event.preventDefault();

    const storedData = localStorage.getItem("registration_data");
    if (!storedData) {
      alert("Registration data expired. Please register again.");
      window.location.href = "./register.html";
      return;
    }

    const registrationData = JSON.parse(storedData);

    resendLink.textContent = "Sending...";
    resendLink.style.pointerEvents = "none";

    try {
      const response = await fetch(`${window.post}/auth/register/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstname: registrationData.firstname,
          lastname: registrationData.lastname,
          email: registrationData.email,
          phone: registrationData.phone || null,
          password: registrationData.password
        })
      });

      const result = await response.json();

      if (response.ok || response.status === 200) {
        alert("OTP resent successfully!");
      } else {
        alert(result.detail || result.error || "Failed to resend OTP");
      }
    } catch (err) {
      console.error("Error resending OTP:", err);
      alert("Failed to resend OTP. Please try again.");
    }

    resendLink.textContent = "Resend";
    resendLink.style.pointerEvents = "auto";
  });

  // Auto-focus OTP input
  otpInput.focus();
});