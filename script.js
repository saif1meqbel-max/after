/* ============================================================
   After — site interactions
   ============================================================ */
(function () {
  "use strict";

  /* ---------- year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- hero rotating words ---------- */
  (function rotator() {
    var prefersReduced = window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return; // leave the first words in place

    function spin(id, words, interval) {
      var el = document.getElementById(id);
      if (!el) return;
      var i = 0;
      setInterval(function () {
        el.classList.add("is-out"); // fade current word up & out
        setTimeout(function () {
          i = (i + 1) % words.length;
          el.textContent = words[i];
          el.classList.remove("is-out");
          el.classList.add("is-in"); // set start position below
          requestAnimationFrame(function () {
            requestAnimationFrame(function () { el.classList.remove("is-in"); });
          });
        }, 500);
      }, interval);
    }

    spin("rotatorDrink", ["coffee", "matcha", "shake"], 2200);
    spin("rotatorWord", ["work", "class", "the gym", "lectures", "hours"], 2600);
    spin("rotatorPlace", ["school", "university", "gym", "library", "office", "workspace"], 2400);
  })();

  /* ---------- mobile video autoplay (no manual play) ---------- */
  (function mobileVideoAutoplay() {
    var mq = window.matchMedia("(max-width: 940px)");
    if (!mq.matches) return;

    var videos = document.querySelectorAll("video");

    function primeVideo(vid) {
      vid.muted = true;
      vid.defaultMuted = true;
      vid.setAttribute("muted", "");
      vid.setAttribute("playsinline", "");
      vid.setAttribute("webkit-playsinline", "");
      vid.playsInline = true;
      vid.autoplay = true;
      vid.loop = true;
      vid.removeAttribute("controls");
      vid.preload = "auto";
      vid.removeAttribute("poster");
    }

    function playVideo(vid) {
      if (!vid) return;
      primeVideo(vid);
      var attempt = vid.play();
      if (attempt && attempt.catch) {
        attempt.catch(function () { /* retry on next event */ });
      }
    }

    videos.forEach(function (vid) {
      playVideo(vid);
      ["loadeddata", "canplay", "loadedmetadata"].forEach(function (evt) {
        vid.addEventListener(evt, function () { playVideo(vid); }, { passive: true });
      });
      if ("IntersectionObserver" in window) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) playVideo(e.target);
          });
        }, { threshold: 0.08 });
        io.observe(vid);
      }
    });

    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) videos.forEach(playVideo);
    });
    window.addEventListener("pageshow", function () { videos.forEach(playVideo); });
  })();

  /* ---------- showcase video sound toggle ---------- */
  (function videoSound() {
    var btn = document.getElementById("soundToggle");
    var vid = document.querySelector(".showcase__video");
    if (!btn || !vid) return;
    var txt = btn.querySelector(".showcase__sound-txt");
    btn.addEventListener("click", function () {
      vid.muted = !vid.muted;
      if (!vid.muted) { var p = vid.play(); if (p && p.catch) p.catch(function () {}); }
      btn.setAttribute("aria-pressed", String(!vid.muted));
      btn.classList.toggle("is-on", !vid.muted);
      if (txt) txt.textContent = vid.muted ? "Sound on" : "Sound off";
    });
  })();

  /* ---------- nav scroll state ---------- */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (window.scrollY > 24) nav.classList.add("is-scrolled");
    else nav.classList.remove("is-scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  var burger = document.getElementById("burger");
  var mobilemenu = document.getElementById("mobilemenu");
  function toggleMenu(open) {
    var isOpen = open != null ? open : !mobilemenu.classList.contains("is-open");
    mobilemenu.classList.toggle("is-open", isOpen);
    burger.classList.toggle("is-open", isOpen);
    burger.setAttribute("aria-expanded", String(isOpen));
    mobilemenu.setAttribute("aria-hidden", String(!isOpen));
  }
  burger.addEventListener("click", function () { toggleMenu(); });
  mobilemenu.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () { toggleMenu(false); });
  });

  /* ---------- reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ============================================================
     QUOTE MODAL
     ============================================================ */
  var modal = document.getElementById("quoteModal");
  var formWrap = document.getElementById("quoteFormWrap");
  var successWrap = document.getElementById("quoteSuccess");
  var form = document.getElementById("quoteForm");
  var lastFocused = null;

  function openQuote() {
    if (!modal) return;
    lastFocused = document.activeElement;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    toggleMenu(false);
    // reset to form view
    formWrap.hidden = false;
    successWrap.hidden = true;
    var first = document.getElementById("q_name");
    if (first) setTimeout(function () { first.focus(); }, 60);
  }
  function closeQuote() {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  }

  document.querySelectorAll("[data-open-quote]").forEach(function (btn) {
    btn.addEventListener("click", openQuote);
  });
  document.querySelectorAll("[data-close-quote]").forEach(function (btn) {
    btn.addEventListener("click", closeQuote);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal.classList.contains("is-open")) closeQuote();
  });

  /* ---------- form submit ---------- */
  if (form) form.addEventListener("submit", function (e) {
    e.preventDefault();
    var valid = true;
    form.querySelectorAll("[required]").forEach(function (field) {
      var wrap = field.closest(".field");
      var ok = field.value && field.value.trim() !== "";
      if (field.type === "email") ok = ok && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);
      wrap.classList.toggle("is-invalid", !ok);
      if (!ok) valid = false;
    });
    if (!valid) {
      var firstBad = form.querySelector(".is-invalid input, .is-invalid select");
      if (firstBad) firstBad.focus();
      return;
    }

    var data = {
      name: form.name.value.trim(),
      company: form.company.value.trim(),
      email: form.email.value.trim(),
      spaceType: form.spaceType.value,
      location: form.location.value.trim(),
      people: form.people.value || "Not specified",
      notes: form.notes.value.trim() || "—"
    };

    // Compose a mailto so the enquiry can actually be sent (static site, no backend)
    var subject = "After tap enquiry — " + data.company;
    var body =
      "New quote request from the After website\n" +
      "----------------------------------------\n" +
      "Name: " + data.name + "\n" +
      "Company: " + data.company + "\n" +
      "Email: " + data.email + "\n" +
      "Type of space: " + data.spaceType + "\n" +
      "Location: " + data.location + "\n" +
      "People on site: " + data.people + "\n" +
      "Notes: " + data.notes + "\n";
    var mailto =
      "mailto:feyzagulturkerr@gmail.com" +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(body);

    document.getElementById("successMsg").textContent =
      "Thank you, " + data.name.split(" ")[0] +
      ". We’ll review your space and reply to " + data.email + " within two business days.";

    // swap to success view
    formWrap.hidden = true;
    successWrap.hidden = false;
    form.reset();

    // open the user's mail client with the details prefilled
    try { window.location.href = mailto; } catch (err) { /* no-op */ }
  });

  if (form) form.querySelectorAll("input, select, textarea").forEach(function (f) {
    f.addEventListener("input", function () {
      var wrap = f.closest(".field");
      if (wrap) wrap.classList.remove("is-invalid");
    });
  });

  /* ============================================================
     LOCATOR MAP (Leaflet)
     ============================================================ */
  var LOCATIONS = [
    { name: "Middlesex University", area: "Hendon, London", type: "Campus", status: "soon", lat: 51.5898, lng: -0.2296 },
    { name: "University College London", area: "Bloomsbury, London", type: "Library", status: "soon", lat: 51.5246, lng: -0.1340 },
    { name: "King’s College London", area: "Strand, London", type: "Campus", status: "soon", lat: 51.5115, lng: -0.1160 },
    { name: "Canary Wharf Tower", area: "Canary Wharf, London", type: "Office", status: "soon", lat: 51.5054, lng: -0.0235 },
    { name: "Shoreditch Works", area: "Shoreditch, London", type: "Office", status: "soon", lat: 51.5264, lng: -0.0776 },
    { name: "Imperial College", area: "South Kensington, London", type: "Campus", status: "soon", lat: 51.4988, lng: -0.1749 },
    { name: "The British Library", area: "St Pancras, London", type: "Library", status: "soon", lat: 51.5299, lng: -0.1276 }
  ];

  var mapEl = document.getElementById("map");
  var listEl = document.getElementById("locatorList");
  var map, markers = [], items = [];

  function makeIcon(loc, active) {
    return L.divIcon({
      className: "",
      html: '<div class="after-pin ' + (loc.status === "soon" ? "soon " : "") + (active ? "is-active" : "") + '"><span></span></div>',
      iconSize: [22, 22],
      iconAnchor: [11, 11],
      popupAnchor: [0, -12]
    });
  }

  function setActive(index) {
    items.forEach(function (it, i) { it.classList.toggle("is-active", i === index); });
    markers.forEach(function (m, i) { m.setIcon(makeIcon(LOCATIONS[i], i === index)); });
    if (markers[index]) {
      map.flyTo([LOCATIONS[index].lat, LOCATIONS[index].lng], 13, { duration: 0.8 });
      markers[index].openPopup();
    }
  }

  function buildList() {
    if (!listEl) return;
    LOCATIONS.forEach(function (loc, i) {
      var btn = document.createElement("button");
      btn.className = "locitem";
      btn.type = "button";
      var statusLabel = loc.status === "live" ? "Now pouring" : "Coming soon";
      var dotClass = loc.status === "live" ? "dot" : "dot dot--soon";
      btn.innerHTML =
        '<span class="locitem__name">' + loc.name + "</span>" +
        '<span class="locitem__meta">' + loc.type + " · " + loc.area + "</span>" +
        '<span class="locitem__status"><i class="' + dotClass + '"></i>' + statusLabel + "</span>";
      btn.addEventListener("click", function () { setActive(i); });
      listEl.appendChild(btn);
      items.push(btn);
    });
  }

  function initMap() {
    if (!mapEl || typeof L === "undefined") return;
    map = L.map(mapEl, {
      scrollWheelZoom: false,
      zoomControl: true,
      attributionControl: true
    }).setView([51.5136, -0.13], 11);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      subdomains: "abcd",
      maxZoom: 19
    }).addTo(map);

    LOCATIONS.forEach(function (loc, i) {
      var m = L.marker([loc.lat, loc.lng], { icon: makeIcon(loc, false) }).addTo(map);
      var statusLabel = loc.status === "live" ? "Now pouring" : "Coming soon";
      m.bindPopup(
        "<b>" + loc.name + "</b><br>" + loc.type + " · " + loc.area +
        '<br><span style="font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;color:#6f6f6f">' +
        statusLabel + "</span>"
      );
      m.on("click", function () { setActive(i); });
      markers.push(m);
    });

    // enable wheel zoom only after the user clicks into the map
    map.on("click", function () { map.scrollWheelZoom.enable(); });
    map.on("mouseout", function () { map.scrollWheelZoom.disable(); });
  }

  buildList();
  // init map after leaflet is ready
  if (document.readyState === "complete") initMap();
  else window.addEventListener("load", initMap);
})();
