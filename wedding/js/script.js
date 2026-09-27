/* =========================================================
   WEDDING INVITATION — script.js
   ========================================================= */

/* ============ KONFIGURASI — EDIT BAGIAN INI ============ */
const CONFIG = {
  // Tanggal & jam Akad Nikah (dipakai untuk hitung mundur)
  WEDDING_DATETIME: "2026-10-10T08:00:00+07:00",

  // Link Google Maps lokasi acara.
  // Cara ambil: buka Google Maps > cari lokasi > tombol "Bagikan" > "Salin link".
  MAPS_URL: "PASTE_GOOGLE_MAPS_LINK_DI_SINI",

  // URL Web App dari Google Apps Script (lihat backend/apps-script.gs & backend/README.md
  // untuk cara membuat & deploy-nya). Setelah deploy, tempel URL-nya di sini.
  GOOGLE_SCRIPT_URL: "PASTE_URL_GOOGLE_APPS_SCRIPT_DI_SINI",
};

/* ============ NAMA TAMU DARI URL ?to= ============ */
(function setGuestName(){
  const params = new URLSearchParams(window.location.search);
  const to = params.get("to");
  const el = document.getElementById("guestName");
  if (to && el) {
    el.textContent = decodeURIComponent(to.replace(/\+/g, " "));
  }
})();

/* ============ LINK LOKASI ============ */
(function setMapsLink(){
  const btn = document.getElementById("btnLokasi");
  if (btn) btn.href = CONFIG.MAPS_URL;
})();

/* ============ BUKA UNDANGAN + MUSIK ============ */
const audio = document.getElementById("bgMusic");
const musicBtn = document.getElementById("musicToggle");
const iconPlay = document.getElementById("iconPlay");
const iconPause = document.getElementById("iconPause");

function setMusicIcon(isPlaying){
  iconPlay.style.display = isPlaying ? "none" : "block";
  iconPause.style.display = isPlaying ? "block" : "none";
}

document.getElementById("openInvitation").addEventListener("click", () => {
  document.getElementById("cover").style.display = "none";
  const main = document.getElementById("mainContent");
  main.classList.add("show");
  document.body.style.overflowY = "auto";

  audio.play().then(() => setMusicIcon(true)).catch(() => setMusicIcon(false));

  initRevealObserver();
  startCountdown();
});

musicBtn.addEventListener("click", () => {
  if (audio.paused) {
    audio.play().then(() => setMusicIcon(true)).catch(()=>{});
  } else {
    audio.pause();
    setMusicIcon(false);
  }
});

/* ============ REVEAL ON SCROLL (soft entrance) ============ */
function initRevealObserver(){
  const items = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  items.forEach((item) => io.observe(item));
}

/* ============ COUNTDOWN ============ */
function startCountdown(){
  const target = new Date(CONFIG.WEDDING_DATETIME).getTime();

  function tick(){
    const now = Date.now();
    const diff = Math.max(0, target - now);

    const days = Math.floor(diff / (1000*60*60*24));
    const hours = Math.floor((diff / (1000*60*60)) % 24);
    const mins = Math.floor((diff / (1000*60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);

    document.getElementById("cd-days").textContent = String(days).padStart(2,"0");
    document.getElementById("cd-hours").textContent = String(hours).padStart(2,"0");
    document.getElementById("cd-mins").textContent = String(mins).padStart(2,"0");
    document.getElementById("cd-secs").textContent = String(secs).padStart(2,"0");
  }
  tick();
  setInterval(tick, 1000);
}

/* ============ COPY REKENING ============ */
document.getElementById("btnCopy").addEventListener("click", (e) => {
  const btn = e.currentTarget;
  const text = btn.getAttribute("data-copy");
  navigator.clipboard.writeText(text).then(() => {
    const original = btn.textContent;
    btn.textContent = "Tersalin!";
    btn.classList.add("copied");
    setTimeout(() => { btn.textContent = original; btn.classList.remove("copied"); }, 1800);
  });
});

/* ============ RSVP: KIRIM & TAMPILKAN UCAPAN ============
   Menyimpan RSVP ke Google Spreadsheet lewat Google Apps Script Web App.
   Lihat backend/README.md untuk panduan setup lengkap.
   Selama GOOGLE_SCRIPT_URL belum diisi, RSVP hanya disimpan sementara
   di browser (localStorage) sebagai mode demo.
============================================================= */
const isScriptConfigured = () =>
  CONFIG.GOOGLE_SCRIPT_URL && !CONFIG.GOOGLE_SCRIPT_URL.startsWith("PASTE_");

function renderWish(nama, kehadiran, ucapan, prepend = true){
  const list = document.getElementById("wishesList");
  const item = document.createElement("div");
  item.className = "wish-item";
  item.innerHTML = `
    <p class="wish-name">${escapeHtml(nama)}</p>
    <p class="wish-status">${escapeHtml(kehadiran)}</p>
    <p class="wish-text">${escapeHtml(ucapan)}</p>
  `;
  if (prepend) list.prepend(item); else list.appendChild(item);
}

function escapeHtml(str){
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function updateCounts(hadir, tidak){
  document.getElementById("countHadir").textContent = hadir;
  document.getElementById("countTidak").textContent = tidak;
}

async function loadWishes(){
  if (!isScriptConfigured()) {
    // mode demo: baca dari localStorage
    const data = JSON.parse(localStorage.getItem("rsvp_demo") || "[]");
    let hadir = 0, tidak = 0;
    data.slice().reverse().forEach((d) => {
      renderWish(d.nama, d.kehadiran, d.ucapan, false);
      if (d.kehadiran === "Hadir") hadir++; else tidak++;
    });
    updateCounts(hadir, tidak);
    return;
  }
  try {
    const res = await fetch(`${CONFIG.GOOGLE_SCRIPT_URL}?action=list`);
    const json = await res.json();
    let hadir = 0, tidak = 0;
    (json.data || []).forEach((d) => {
      renderWish(d.nama, d.kehadiran, d.ucapan, false);
      if (d.kehadiran === "Hadir") hadir++; else tidak++;
    });
    updateCounts(hadir, tidak);
  } catch (err) {
    console.warn("Gagal memuat ucapan dari spreadsheet:", err);
  }
}

document.getElementById("rsvpForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const nama = form.nama.value.trim();
  const kehadiran = form.kehadiran.value;
  const ucapan = form.ucapan.value.trim();
  if (!nama || !ucapan) return;

  const btn = document.getElementById("btnKirim");
  btn.disabled = true;
  btn.textContent = "Mengirim...";

  if (!isScriptConfigured()) {
    // mode demo
    const data = JSON.parse(localStorage.getItem("rsvp_demo") || "[]");
    data.push({ nama, kehadiran, ucapan, waktu: new Date().toISOString() });
    localStorage.setItem("rsvp_demo", JSON.stringify(data));
    renderWish(nama, kehadiran, ucapan, true);
    const hadirCount = data.filter(d=>d.kehadiran==="Hadir").length;
    updateCounts(hadirCount, data.length - hadirCount);
  } else {
    try {
      await fetch(CONFIG.GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" }, // hindari CORS preflight
        body: JSON.stringify({ nama, kehadiran, ucapan }),
      });
      renderWish(nama, kehadiran, ucapan, true);
      const hadirEl = document.getElementById("countHadir");
      const tidakEl = document.getElementById("countTidak");
      if (kehadiran === "Hadir") hadirEl.textContent = Number(hadirEl.textContent) + 1;
      else tidakEl.textContent = Number(tidakEl.textContent) + 1;
    } catch (err) {
      alert("Gagal mengirim ucapan. Silakan coba lagi.");
      console.error(err);
    }
  }

  form.reset();
  btn.disabled = false;
  btn.textContent = "Kirim";
});

loadWishes();
