// /frontend/auth/login.js
(function () {
  const form = document.getElementById("loginForm");
  const errorEl = document.getElementById("error");
  const fillDemoBtn = document.getElementById("fillDemo");

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

  function findCustomer(email) {
    const users = getUsers();
    return users.find(u => normalizeEmail(u.email) === normalizeEmail(email));
  }

  function saveSession(session) {
    localStorage.setItem("gv_session", JSON.stringify(session));
  }

  async function urlExists(url) {
    try {
      const r = await fetch(url, { method: "HEAD" });
      return r.ok;
    } catch {
      return false;
    }
  }

  async function goRoleHome(role) {
    const routes = {
      admin: [
        "../admin/adminDashboard.html",
        "../admin/admin.html",
        "../admin/index.html"
      ],
      staff: [
        "../staff/staffDashboard.html",
        "../staff/staff.html",
        "../staff/index.html"
      ],
      customer: [
        "../customer/userDashboard.html",
        "../customer/userDashboard.html",
        "../customer/index.html"
      ],
    };

    const list = routes[role] || routes.customer;

    for (let i = 0; i < list.length; i++) {
      const ok = await urlExists(list[i]);
      if (ok) {
        window.location.href = list[i];
        return;
      }
    }

    // fallback (still try first)
    window.location.href = list[0];
  }

  // Demo fill button
  fillDemoBtn.addEventListener("click", function () {
    document.getElementById("email").value = "demo@gamevault.com";
    document.getElementById("password").value = "demo123";
    document.getElementById("role").value = "customer";
    setError("");
  });

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    setError("");

    const email = normalizeEmail(document.getElementById("email").value);
    const password = document.getElementById("password").value || "";
    const role = document.getElementById("role").value;
    const rememberMe = document.getElementById("rememberMe").checked;

    if (!email || !password) {
      setError("All fields are required!");
      return;
    }

    // Demo credentials (staff/admin)
    const DEMO = {
      admin: { email: "admin@gamevault.com", password: "admin123" },
      staff: { email: "staff@gamevault.com", password: "staff123" },
      customer: { email: "demo@gamevault.com", password: "demo123" },
    };

    // Customer: check registered users OR demo
    if (role === "customer") {
      const customer = findCustomer(email);
      const demoOk = (email === DEMO.customer.email && password === DEMO.customer.password);

      if (!customer && !demoOk) {
        setError("No customer account found. Please register first.");
        return;
      }
      if (customer && customer.password !== password) {
        setError("Wrong password for this customer account.");
        return;
      }

      const user = customer || { username: "Demo User", email: DEMO.customer.email };
      const session = {
        role: "customer",
        username: user.username || "Customer",
        email: user.email || email,
        loginAt: Date.now()
      };

      saveSession(session);

      if (rememberMe) {
        localStorage.setItem("gv_remember_email", email);
      } else {
        localStorage.removeItem("gv_remember_email");
      }

      await goRoleHome("customer");
      return;
    }

    // Staff / Admin: demo login only for now
    if (role === "admin") {
      if (email !== DEMO.admin.email || password !== DEMO.admin.password) {
        setError("Invalid admin credentials (demo: admin@gamevault.com / admin123).");
        return;
      }
      saveSession({ role: "admin", username: "Admin", email, loginAt: Date.now() });
      await goRoleHome("admin");
      return;
    }

    if (role === "staff") {
      if (email !== DEMO.staff.email || password !== DEMO.staff.password) {
        setError("Invalid staff credentials (demo: staff@gamevault.com / staff123).");
        return;
      }
      saveSession({ role: "staff", username: "Staff", email, loginAt: Date.now() });
      await goRoleHome("staff");
      return;
    }

    await goRoleHome("customer");
  });

  // Autofill remembered email
  const remembered = localStorage.getItem("gv_remember_email");
  if (remembered) {
    document.getElementById("email").value = remembered;
    document.getElementById("rememberMe").checked = true;
  }
})();
