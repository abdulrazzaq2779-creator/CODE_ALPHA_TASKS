"use strict";
 
/* ── LOADER ── */
window.addEventListener("load", () => {
  setTimeout(() => {
    document.getElementById("loader").classList.add("gone");
  }, 1500);
});
 
/* ── CURSOR ── */
const cur  = document.getElementById("cursor");
const curR = document.getElementById("cursor-ring");
let mx = 0, my = 0, rx = 0, ry = 0;
document.addEventListener("mousemove", e => {
  mx = e.clientX; my = e.clientY;
  cur.style.left = mx + "px"; cur.style.top = my + "px";
});
(function animCursor() {
  rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
  curR.style.left = rx + "px"; curR.style.top = ry + "px";
  requestAnimationFrame(animCursor);
})();
 
/* ── SCROLL PROGRESS ── */
window.addEventListener("scroll", () => {
  const s  = document.documentElement.scrollTop;
  const h  = document.documentElement.scrollHeight - window.innerHeight;
  const pct = h > 0 ? (s / h) * 100 : 0;
  document.getElementById("scroll-bar").style.width = pct + "%";
  document.getElementById("nav").classList.toggle("scrolled", s > 40);
});
 
/* ── MOBILE MENU ── */
let mobOpen = false;
function toggleMob() {
  mobOpen = !mobOpen;
  document.getElementById("mob-nav").classList.toggle("open", mobOpen);
  const spans = document.querySelectorAll(".ham span");
  if (mobOpen) {
    spans[0].style.transform = "rotate(45deg) translate(4px,5px)";
    spans[1].style.opacity   = "0";
    spans[2].style.transform = "rotate(-45deg) translate(4px,-5px)";
  } else {
    spans.forEach(s => { s.style.transform = ""; s.style.opacity = ""; });
  }
}
function closeMob() {
  mobOpen = false;
  document.getElementById("mob-nav").classList.remove("open");
  document.querySelectorAll(".ham span").forEach(s => { s.style.transform = ""; s.style.opacity = ""; });
}
 
/* ── SCROLL REVEAL ── */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add("visible");
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));
 
/* ── ACTIVE NAV HIGHLIGHT ── */
const sections = document.querySelectorAll("section[id], div[id='hero']");
const navAs    = document.querySelectorAll(".nav-links a");
window.addEventListener("scroll", () => {
  let current = "";
  sections.forEach(s => { if (window.scrollY >= s.offsetTop - 180) current = s.id; });
  navAs.forEach(a => {
    a.style.color = a.getAttribute("href") === "#" + current ? "var(--ink)" : "";
  });
});
 
/* ── CONTACT FORM ── */
function sendForm(e) {
  e.preventDefault();
  const btn = document.getElementById("send-btn");
  btn.textContent = "Sent ✓";
  btn.style.background = "var(--teal)";
  setTimeout(() => {
    btn.innerHTML = 'Send Message <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
    btn.style.background = "";
    e.target.reset();
  }, 3000);
}
 
/* ── TYPING EFFECT in hero subtitle ── */
const roles = ["Full Stack Developer", "Problem Solver", "Web Builder", "CSE Student"];
let ri = 0, ci = 0, deleting = false;
const roleEl = document.querySelector(".role-badge.solid");
if (roleEl) {
  function type() {
    const word = roles[ri];
    roleEl.textContent = deleting ? word.slice(0, ci - 1) : word.slice(0, ci + 1);
    deleting ? ci-- : ci++;
    if (!deleting && ci === word.length) { deleting = true; setTimeout(type, 1800); return; }
    if (deleting && ci === 0)           { deleting = false; ri = (ri + 1) % roles.length; }
    setTimeout(type, deleting ? 55 : 85);
  }
  setTimeout(type, 2800);
}
