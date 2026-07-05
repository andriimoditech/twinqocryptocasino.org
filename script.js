// ============ uzuplay theme — vanilla JS ============
document.addEventListener("DOMContentLoaded", function () {
  // ---- star ratings ----
  var FULL = "★", HALF = "★", EMPTY = "☆";
  document.querySelectorAll(".stars").forEach(function (el) {
    var rating = parseFloat(el.getAttribute("data-rating")) || 0;
    if (rating > 5) rating = 5;
    if (rating < 0) rating = 0;
    var full = Math.floor(rating);
    var hasHalf = rating - full >= 0.25 && rating - full < 0.75;
    if (rating - full >= 0.75) full += 1;
    var html = "";
    for (var i = 0; i < full; i++) html += '<span class="full">' + FULL + "</span>";
    if (hasHalf && full < 5) html += '<span class="half">' + HALF + "</span>";
    var used = full + (hasHalf && full < 5 ? 1 : 0);
    for (var j = used; j < 5; j++) html += '<span class="empty">' + EMPTY + "</span>";
    el.innerHTML = html;
    el.setAttribute("aria-label", rating + " out of 5");
  });

  // ---- mobile burger nav toggle ----
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".nav");
  if (toggle && nav) {
    var setNav = function (open) {
      nav.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "✕" : "☰";
    };
    toggle.addEventListener("click", function () {
      setNav(!nav.classList.contains("open"));
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") setNav(false);
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 768 && nav.classList.contains("open")) setNav(false);
    });
  }

  // ---- scroll reveal ----
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -10% 0px" });
    reveals.forEach(function (el) { revealObserver.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  // ---- countdown timer ----
  var timer = document.querySelector(".countdown-timer");
  if (timer) {
    var hours = parseInt(timer.getAttribute("data-countdown-hours"), 10);
    if (!hours || hours < 0) hours = 24;
    var durationMs = hours * 3600 * 1000;
    var storeKey = "uzuplay_countdown_" + hours;
    var now = Date.now();
    var deadline = parseInt(localStorage.getItem(storeKey), 10);
    if (!deadline || isNaN(deadline) || deadline <= now) {
      deadline = now + durationMs;
      try { localStorage.setItem(storeKey, String(deadline)); } catch (e) {}
    }
    var cells = {
      days: timer.querySelector('[data-unit="days"]'),
      hours: timer.querySelector('[data-unit="hours"]'),
      minutes: timer.querySelector('[data-unit="minutes"]'),
      seconds: timer.querySelector('[data-unit="seconds"]')
    };
    var pad = function (n) { return n < 10 ? "0" + n : String(n); };
    var render = function () {
      var diff = deadline - Date.now();
      if (diff <= 0) {
        deadline = Date.now() + durationMs;
        try { localStorage.setItem(storeKey, String(deadline)); } catch (e) {}
        diff = durationMs;
      }
      var totalSec = Math.floor(diff / 1000);
      var d = Math.floor(totalSec / 86400);
      var h = Math.floor((totalSec % 86400) / 3600);
      var m = Math.floor((totalSec % 3600) / 60);
      var s = totalSec % 60;
      if (cells.days) cells.days.textContent = pad(d);
      if (cells.hours) cells.hours.textContent = pad(h);
      if (cells.minutes) cells.minutes.textContent = pad(m);
      if (cells.seconds) cells.seconds.textContent = pad(s);
    };
    render();
    setInterval(render, 1000);
  }

  // ---- smooth scroll for in-page anchors ----
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // ---- CTA click debug hook ----
  document.querySelectorAll('a[target="_blank"]').forEach(function (cta) {
    cta.addEventListener("click", function () {
      console.debug("CTA click:", cta.getAttribute("href"));
    });
  });

  // ---- sticky mobile CTA bar ----
  var stickyCta = document.querySelector(".sticky-cta");
  if (stickyCta) {
    var hero = document.querySelector(".hero");
    var footer = document.querySelector(".site-footer");
    var footerVisible = false;

    var getHeroHeight = function () {
      return (hero && hero.offsetHeight) ? hero.offsetHeight : 400;
    };

    var updateSticky = function () {
      var pastHero = window.scrollY > getHeroHeight();
      if (pastHero && !footerVisible) {
        stickyCta.classList.add("show");
      } else {
        stickyCta.classList.remove("show");
      }
    };

    if (footer && "IntersectionObserver" in window) {
      var footerObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          footerVisible = entry.isIntersecting;
        });
        updateSticky();
      }, { threshold: 0 });
      footerObserver.observe(footer);
    }

    window.addEventListener("scroll", updateSticky, { passive: true });
    window.addEventListener("resize", updateSticky);
    updateSticky();
  }

  // ---- single-open accordion (details are native; sync behavior) ----
  var items = document.querySelectorAll(".faq-item");
  items.forEach(function (item) {
    item.addEventListener("toggle", function () {
      if (item.open) {
        items.forEach(function (other) {
          if (other !== item) other.open = false;
        });
      }
    });
  });
});
