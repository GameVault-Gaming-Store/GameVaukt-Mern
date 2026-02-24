// userDashboard.js
/*********************************************************
 * HELPERS
 *********************************************************/
function getEl(id){ return document.getElementById(id); }

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
  }[m]));
}

function money(n){ return `$${Number(n).toFixed(2)}`; }

/*********************************************************
 * SECTION SWITCHING LOGIC
 *********************************************************/
function showSection(sectionId, el) {
  document.querySelectorAll(".content-section").forEach(section => {
    section.classList.remove("active");
  });

  document.querySelectorAll(".menu li").forEach(item => {
    item.classList.remove("active");
  });

  const targetSection = document.getElementById(sectionId);
  if (targetSection) targetSection.classList.add("active");

  if (el) el.classList.add("active");
}

/*********************************************************
 * PAGE NAVIGATION
 *********************************************************/
function goToPage(path) {
  window.location.href = path;
}

/*********************************************************
 * LOGOUT
 *********************************************************/
function logout() {
  localStorage.removeItem("token");
  window.location.href = "../auth/login.html";
}

/*********************************************************
 * MOOD BASED GAME SUGGESTION
 *********************************************************/
function suggestGame() {
  const mood = document.getElementById("moodSelect").value;
  const result = document.getElementById("moodResult");

  if (!mood) {
    result.innerHTML = "⚠️ Please select a mood first";
    return;
  }

  let suggestion = "";
  if (mood === "relaxed") suggestion = "🎮 Try: Stardew Valley, Journey, Abzû";
  else if (mood === "excited") suggestion = "🔥 Try: Cyber Quest, Doom Eternal, Apex Legends";
  else if (mood === "competitive") suggestion = "⚔️ Try: Shadow Arena, Valorant, CS2";
  else if (mood === "sad") suggestion = "💙 Try: Life is Strange, Gris, Spiritfarer";

  result.innerHTML = suggestion;
}

/*********************************************************
 * NOTIFICATION SYSTEM
 *********************************************************/
let notifications = [];

function updateNotifCount() {
  const countEl = document.getElementById("notifCount");
  if (countEl) countEl.innerText = notifications.length;
}

function renderNotifications() {
  const list = document.getElementById("notifItems");
  if (!list) return;

  list.innerHTML = "";

  if (notifications.length === 0) {
    list.innerHTML = `<li class="notif-empty">No notifications yet.</li>`;
    updateNotifCount();
    return;
  }

  notifications.forEach(note => {
    list.innerHTML += `<li>🔔 ${escapeHtml(note)}</li>`;
  });

  updateNotifCount();
}

function addNotification(message) {
  notifications.unshift(message);
  renderNotifications();
}

/*********************************************************
 * ADVANCED GAME ASSISTANT
 *********************************************************/
const assistantGames = [
  { name: "Cyber Quest", genre: "action", playtime: "medium", rating: 4.5, price: 29.99, discount: 30, tags: ["sci-fi", "fast", "story"] },
  { name: "Shadow Arena", genre: "action", playtime: "long", rating: 4.8, price: 49.99, discount: 0, tags: ["competitive", "pvp", "ranked"] },
  { name: "Stardew Valley", genre: "simulation", playtime: "long", rating: 4.9, price: 14.99, discount: 0, tags: ["relax", "farm", "cozy"] },
  { name: "Gris", genre: "adventure", playtime: "short", rating: 4.7, price: 12.99, discount: 0, tags: ["sad", "art", "music"] },
  { name: "Spiritfarer", genre: "adventure", playtime: "long", rating: 4.6, price: 24.99, discount: 0, tags: ["emotional", "cozy", "story"] },
  { name: "Valorant", genre: "shooter", playtime: "long", rating: 4.6, price: 0, discount: 0, tags: ["competitive", "team", "ranked"] },
  { name: "CS2", genre: "shooter", playtime: "long", rating: 4.5, price: 0, discount: 0, tags: ["competitive", "fps", "ranked"] },
  { name: "Journey", genre: "adventure", playtime: "short", rating: 4.8, price: 14.99, discount: 0, tags: ["relax", "calm", "beautiful"] }
];

function addUserBubble(text) {
  const chat = document.getElementById("chatArea");
  if(!chat) return;
  chat.innerHTML += `<div class="user">🧑 ${escapeHtml(text)}</div>`;
  chat.scrollTop = chat.scrollHeight;
}

function addBotBubble(text) {
  const chat = document.getElementById("chatArea");
  if(!chat) return;
  chat.innerHTML += `<div class="bot">🤖 ${text}</div>`;
  chat.scrollTop = chat.scrollHeight;
}

function clearChat() {
  const chat = document.getElementById("chatArea");
  if(!chat) return;
  chat.innerHTML = `<div class="bot">👋 Hi! Ask me anything about games, deals, tips, or navigation.</div>
                    <div class="bot small">Try: <b>help</b>, <b>recommend action</b>, <b>best deals</b>, <b>go store</b>, <b>mood</b></div>`;
}

function pickTopGames(filterFn, limit = 3) {
  return assistantGames
    .filter(filterFn)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
}

function formatGame(g) {
  const discountTxt = g.discount ? ` | 🔥 ${g.discount}% OFF` : "";
  const priceTxt = g.price === 0 ? "Free" : `$${g.price}`;
  return `🎮 <b>${escapeHtml(g.name)}</b> (${escapeHtml(g.genre)}, ${escapeHtml(g.playtime)}) ⭐${g.rating} — ${escapeHtml(priceTxt)}${discountTxt}`;
}

function buildHelp() {
  return `
  <b>Commands:</b><br>
  • <b>recommend action</b> / <b>recommend shooter</b> / <b>recommend rpg</b><br>
  • <b>recommend short</b> / <b>recommend medium</b> / <b>recommend long</b><br>
  • <b>best deals</b> / <b>discounts</b><br>
  • <b>go dashboard</b>, <b>go store</b>, <b>go deals</b>, <b>go wishlist</b>, <b>go community</b>, <b>go profile</b><br>
  • <b>mood</b>, <b>tips</b>, <b>clear</b>
  `;
}

function normalize(text) { return text.toLowerCase().trim(); }
function includesAny(text, arr) { return arr.some(k => text.includes(k)); }

function navigateTo(section) {
  const liMap = { dashboard: 0, store: 1, discounts: 2, wishlist: 3, community: 4, profile: 5 };
  const idx = liMap[section];
  const menuItems = document.querySelectorAll(".menu-top li");
  if (menuItems[idx]) {
    showSection(section, menuItems[idx]);
    return true;
  }
  return false;
}

function getMoodSuggestionText() {
  const mood = document.getElementById("moodSelect")?.value || "";
  if (!mood) return "You didn’t select a mood yet. Select one in Dashboard → Mood box.";

  if (mood === "relaxed") return "Relaxed mood ✅ Try: Stardew Valley, Journey, Abzû";
  if (mood === "excited") return "Excited mood ✅ Try: Cyber Quest, Doom Eternal, Apex Legends";
  if (mood === "competitive") return "Competitive mood ✅ Try: Shadow Arena, Valorant, CS2";
  if (mood === "sad") return "Sad mood ✅ Try: Life is Strange, Gris, Spiritfarer";
  return "Mood noted ✅";
}

function sendMessage() {
  const input = document.getElementById("chatInput");
  if(!input) return;

  const raw = input.value;
  const msg = normalize(raw);
  if (!msg) return;

  addUserBubble(raw);
  input.value = "";

  if (msg === "clear" || msg === "/clear") { clearChat(); return; }
  if (msg === "help" || msg === "commands") { addBotBubble(buildHelp()); return; }

  if (includesAny(msg, ["hello", "hi", "hey", "assalam"])) {
    addBotBubble(`Hello Gamer 👾<br>${buildHelp()}`);
    return;
  }

  if (includesAny(msg, ["mood", "feeling", "sad", "relaxed", "excited", "competitive"])) {
    addBotBubble(getMoodSuggestionText());
    return;
  }

  if (msg.startsWith("go ")) {
    const target = msg.replace("go ", "").trim();
    const map = {
      "dashboard": "dashboard",
      "home": "dashboard",
      "store": "store",
      "game store": "store",
      "deals": "discounts",
      "discounts": "discounts",
      "wishlist": "wishlist",
      "community": "community",
      "profile": "profile"
    };
    const section = map[target];
    if (section && navigateTo(section)) {
      addBotBubble(`✅ Opened <b>${escapeHtml(section)}</b> section.`);
      return;
    }
    addBotBubble(`I couldn’t find that section. Try: <b>go store</b>, <b>go deals</b>, <b>go wishlist</b>.`);
    return;
  }

  if (includesAny(msg, ["deal", "deals", "discount", "discounts", "best deals", "sale"])) {
    const discounted = pickTopGames(g => g.discount && g.discount > 0, 5);
    if (discounted.length) {
      addBotBubble(`🔥 Current deals:<br>${discounted.map(formatGame).join("<br>")}<br><br>Type <b>go deals</b> to open Deals section.`);
    } else {
      addBotBubble(`No big deals right now, but you can check Deals: <b>go deals</b>.`);
    }
    return;
  }

  if (includesAny(msg, ["tips", "beginner", "guide", "improve"])) {
    addBotBubble(`🎯 Tips:<br>
      • Start with <b>medium</b> playtime games to learn mechanics.<br>
      • Competitive: warm up 10 minutes before ranked.<br>
      • Use Deals to buy story games cheaper.<br>
      Want recommendations? Try <b>recommend action</b> or <b>recommend short</b>.`);
    return;
  }

  if (includesAny(msg, ["recommend", "suggest"])) {
    const genreKeywords = ["action","rpg","strategy","shooter","adventure","simulation"];
    const playKeywords = ["short","medium","long"];
    const genre = genreKeywords.find(g => msg.includes(g)) || null;
    const playtime = playKeywords.find(p => msg.includes(p)) || null;

    const results = pickTopGames(g => {
      const okGenre = genre ? g.genre === genre : true;
      const okPlay = playtime ? g.playtime === playtime : true;
      return okGenre && okPlay;
    }, 4);

    if (!results.length) {
      addBotBubble(`No matches. Try: <b>recommend action</b>, <b>recommend shooter</b>, <b>recommend short</b>.`);
      return;
    }

    addBotBubble(`Here are recommendations:<br>${results.map(formatGame).join("<br>")}`);
    return;
  }

  addBotBubble(`🤔 I didn’t fully get that.<br>Try <b>help</b>, <b>best deals</b>, <b>recommend action</b>, <b>go store</b>.`);
}

/*********************************************************
 * PLACEHOLDER IMAGE (ONE GLOBAL)
 *********************************************************/
const PLACEHOLDER_IMG =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="340">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0ea5e9"/><stop offset="1" stop-color="#22c55e"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
    font-family="Arial" font-size="28" fill="rgba(0,0,0,0.45)">GameStore</text>
</svg>`);

/*********************************************************
 * STORE: GAME DATA (TEMPORARY – BACKEND LATER)
 *********************************************************/
const games = [
  {
    id: 1,
    name: "Cyber Quest",
    genre: "Action",
    price: 29.99,
    discount: 30,
    rating: 4.5,
    playtime: "Medium",
    tags: ["Beginner Friendly", "Story Driven"],
    img: "assets/games/cyber-quest.jpg"
  },
  {
    id: 2,
    name: "Shadow Arena",
    genre: "RPG",
    price: 49.99,
    discount: 0,
    rating: 4.8,
    playtime: "Long",
    tags: ["Hardcore", "Multiplayer"],
    img: "assets/games/shadow-arena.jpg"
  },
  {
    id: 3,
    name: "Pixel Runner",
    genre: "Strategy",
    price: 19.99,
    discount: 20,
    rating: 4.2,
    playtime: "Short",
    tags: ["Casual", "Fast Paced"],
    img: "assets/games/pixel-runner.jpg"
  }
];

/*********************************************************
 * STORE: GLOBAL STATE
 *********************************************************/
let compareList = JSON.parse(localStorage.getItem("compare")) || [];
let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
let lastRenderedList = [...games];

function finalPriceOf(game){
  if(!game.discount) return Number(game.price).toFixed(2);
  return (game.price - (game.price * game.discount)/100).toFixed(2);
}

function isEmbeddedInDashboard(){
  return !!getEl("storeEmbedded");
}

/*********************************************************
 * STORE: RENDER GAME CARDS
 *********************************************************/
function renderGames(gameList){
  const container = getEl("gameGrid");
  if(!container) return;

  lastRenderedList = [...gameList];
  container.innerHTML = "";

  if(gameList.length === 0){
    container.innerHTML = `<p style="color:#cbd5e1;">No games found.</p>`;
    updateCompareBar();
    return;
  }

  gameList.forEach(game=>{
    const selected = compareList.includes(game.id);

    const card = document.createElement("div");
    card.className = "game-card";

    card.innerHTML = `
      <img src="${game.img || PLACEHOLDER_IMG}"
           onerror="this.onerror=null;this.src='${PLACEHOLDER_IMG}'"
           alt="${escapeHtml(game.name)}" />
      <div class="content">
        <h3>${escapeHtml(game.name)}</h3>

        <div class="meta-row">
          <span class="badge">⭐ ${game.rating}</span>
          <span class="badge">⏱ ${escapeHtml(game.playtime)}</span>
          <span class="badge">${escapeHtml(game.genre)}</span>
          ${game.discount ? `<span class="badge">🔥 ${game.discount}% OFF</span>` : ``}
        </div>

        <div class="price-row">
          <div class="price">${money(finalPriceOf(game))}</div>
          ${game.discount ? `<div class="discount">-${game.discount}%</div>` : `<div style="opacity:.7;font-size:12px;color:#cbd5e1;">No discount</div>`}
        </div>

        <div class="card-actions">
          <button class="details-btn" onclick="viewDetails(${game.id})">View Details</button>
          <button class="compare-btn" onclick="toggleCompare(${game.id})">
            ${selected ? "Selected ✅" : "Compare"}
          </button>
        </div>

        <div class="card-actions" style="margin-top:10px;">
          <button class="details-btn" onclick="toggleWishlist(${game.id})">
            ${wishlist.includes(game.id) ? "❤️ Wishlisted" : "🤍 Wishlist"}
          </button>
          <button class="details-btn" onclick="quickNotify('${escapeHtml(game.name)}')">🔔 Notify</button>
        </div>
      </div>
    `;

    container.appendChild(card);
  });

  updateCompareBar();
}

