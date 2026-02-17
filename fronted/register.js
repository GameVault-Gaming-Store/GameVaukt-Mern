// /frontend/auth/register.js
(function () {
  const form = document.getElementById("registerForm");
  const errorEl = document.getElementById("error");

  function setError(msg) {
    errorEl.innerText = msg || "";
  }

  function normalizeEmail(v) {
    return String(v || "").trim().toLowerCase();
  }

  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem("gv_users") || "[]");
    } catch {
      return [];
    }
  }

  function saveUsers(users) {
    localStorage.setItem("gv_users", JSON.stringify(users));
  }

  function emailExists(email) {
    const users = getUsers();
    return users.some(u => normalizeEmail(u.email) === normalizeEmail(email));
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    setError("");

    const username = String(document.getElementById("username").value || "").trim();
    const email = normalizeEmail(document.getElementById("email").value);
    const password = document.getElementById("password").value || "";
    const confirmPassword = document.getElementById("confirmPassword").value || "";

    if (!username || !email || !password || !confirmPassword) {
      setError("All fields are required!");
      return;
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters!");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters!");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (emailExists(email)) {
      setError("This email is already registered. Please login.");
      return;
    }

    const users = getUsers();
    users.push({
      username,
      email,
      password,       // demo only (backend later)
      role: "customer",
      createdAt: Date.now()
    });
    saveUsers(users);

    alert("Registration successful! Please login.");
    window.location.href = "login.html";
  });
})();
