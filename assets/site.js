// Shared behaviour for the home page and the project detail pages.
// Every feature checks for its elements first, so each page only runs what it has.
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var ADDR = "vipul21435@iiitd.ac.in";
  function byId(id) { return document.getElementById(id); }

  // Header: solid background once the page scrolls, and the mobile menu.
  var bar = byId("bar");
  var menuBtn = byId("menuBtn");
  var toTop = byId("toTop");
  function setMenu(open) {
    bar.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.textContent = open ? "Close" : "Menu";
  }
  if (bar && menuBtn) {
    menuBtn.addEventListener("click", function () { setMenu(!bar.classList.contains("open")); });
    document.querySelectorAll(".nav a").forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && bar.classList.contains("open")) { setMenu(false); menuBtn.focus(); }
    });
  }

  // Scroll: header state, the back-to-top button and the home hero parallax.
  var heroInner = byId("heroInner");
  var mountains = byId("mountains");
  var ticking = false;
  function onScroll() {
    var y = window.scrollY;
    if (bar) bar.classList.toggle("scrolled", y > 40);
    if (toTop) toTop.hidden = y < 700;
    if (!reduce && heroInner && mountains && y < 1000) {
      heroInner.style.transform = "translateY(" + (y * 0.35) + "px)";
      heroInner.style.opacity = String(Math.max(0, 1 - y / 650));
      mountains.style.transform = "translateY(" + (y * -0.12) + "px)";
    }
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  // Highlight the in-page nav link for the section in view.
  var links = {};
  document.querySelectorAll('.nav a[href^="#"]').forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
  if ("IntersectionObserver" in window && Object.keys(links).length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting || !links[en.target.id]) return;
        Object.keys(links).forEach(function (k) { links[k].removeAttribute("aria-current"); });
        links[en.target.id].setAttribute("aria-current", "true");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(links).forEach(function (id) {
      var s = byId(id);
      if (s) spy.observe(s);
    });
  }

  // Typed roles in the home hero.
  var typed = byId("typed");
  if (typed && !reduce) {
    var roles = [
      "AI Data Engineer at Handshake",
      "Shipped 11,000+ hours with a squad of 35",
      "Builder of evaluation environments",
      "Codeforces Specialist, 1485"
    ];
    var r = 0, c = roles[0].length, deleting = true;
    setTimeout(function tick() {
      if (deleting) {
        c--;
        typed.textContent = roles[r].slice(0, c);
        if (c === 0) { deleting = false; r = (r + 1) % roles.length; }
        setTimeout(tick, 35);
      } else {
        c++;
        typed.textContent = roles[r].slice(0, c);
        if (c === roles[r].length) { deleting = true; setTimeout(tick, 2200); }
        else setTimeout(tick, 70);
      }
    }, 2400);
  }

  // Skills: cycle through each list and light up the matching chip.
  var rows = Array.prototype.slice.call(document.querySelectorAll("[data-rotate]"));
  if (rows.length && !reduce) {
    var step = 0;
    var spin = function () {
      rows.forEach(function (row) {
        var items = row.querySelectorAll(".chips li");
        var i = step % items.length;
        items.forEach(function (li, j) { li.classList.toggle("on", j === i); });
        row.querySelector(".rot").textContent = items[i].textContent;
      });
      step++;
    };
    spin();
    setInterval(spin, 2200);
  }

  // Project filters.
  var grid = byId("grid");
  var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll(".card")) : [];
  var filterStatus = byId("filterStatus");
  if (grid && filterStatus) {
    var names = { work: "professional", oss: "open-source", ai: "AI and data", web: "web app" };
    document.querySelectorAll(".filters button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var f = btn.getAttribute("data-filter");
        document.querySelectorAll(".filters button").forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
        var n = 0;
        cards.forEach(function (card) {
          var show = f === "all" || card.getAttribute("data-tags").split(" ").indexOf(f) > -1;
          card.hidden = !show;
          if (show) n++;
        });
        filterStatus.textContent = f === "all" ? "Showing all " + n + " projects" : "Showing " + n + " " + names[f] + " projects";
      });
    });
  }

  // 3D tilt on project cards for mouse users.
  if (cards.length && !reduce && finePointer) {
    cards.forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5, y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = "perspective(900px) rotateY(" + (x * 7) + "deg) rotateX(" + (y * -7) + "deg) translateY(-4px)";
      });
      card.addEventListener("pointerleave", function () { card.style.transform = ""; });
    });
  }

  // Contact form. FormSubmit relays each message to my inbox. If the relay
  // refuses or the network fails, the visitor gets ready-made Gmail, Outlook
  // and mail-app links carrying the same message, so it can still reach me.
  function composeLinks(subject, body) {
    var to = encodeURIComponent(ADDR), s = encodeURIComponent(subject), b = encodeURIComponent(body);
    return {
      gmail: "https://mail.google.com/mail/?view=cm&fs=1&to=" + to + "&su=" + s + "&body=" + b,
      outlook: "https://outlook.office.com/mail/deeplink/compose?to=" + to + "&subject=" + s + "&body=" + b,
      app: "mailto:" + ADDR + "?subject=" + s + "&body=" + b
    };
  }
  var form = byId("mailForm");
  if (form) {
    var sendBtn = byId("sendBtn");
    var formStatus = byId("formStatus");
    var fallback = byId("fallback");
    var say = function (kind, text) {
      formStatus.className = "form-status " + kind;
      formStatus.textContent = text;
    };
    var offerFallback = function (subject, body) {
      var l = composeLinks(subject, body);
      byId("fbGmail").href = l.gmail;
      byId("fbOutlook").href = l.outlook;
      byId("fbApp").href = l.app;
      fallback.hidden = false;
      byId("fbGmail").focus();
    };
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = byId("fName").value.trim();
      var emailEl = byId("fEmail");
      var email = emailEl.value.trim();
      var msg = byId("fMsg").value.trim();
      fallback.hidden = true;
      if (!name || !msg || !email || !emailEl.checkValidity()) {
        say("err", "Please add your name, a valid email address and a message.");
        return;
      }
      var subject = "Portfolio message from " + name;
      var body = msg + "\n\n" + name + "\n" + email;
      if (form.querySelector("[name=_honey]").value) { say("ok", "Thanks, your message is on its way."); return; }
      sendBtn.disabled = true;
      sendBtn.textContent = "Sending...";
      say("", "");
      fetch("https://formsubmit.co/ajax/" + ADDR, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ name: name, email: email, message: msg, _subject: subject, _replyto: email, _template: "table" })
      }).then(function (res) {
        return res.json().then(function (data) {
          if (!res.ok || String(data.success) !== "true") throw new Error(data.message || "failed");
        });
      }).then(function () {
        form.reset();
        say("ok", "Thanks, your message is in my inbox. I will reply to the address you gave.");
      }).catch(function () {
        say("err", "The form could not deliver your message just now.");
        offerFallback(subject, body);
      }).then(function () {
        sendBtn.disabled = false;
        sendBtn.textContent = "Send message";
      });
    });
  }

  // Copy the email address.
  var copyBtn = byId("copyMail");
  if (copyBtn) {
    var copyStatus = byId("copyStatus");
    var copied = function () {
      copyBtn.textContent = "Copied";
      copyStatus.textContent = "Email address copied";
      setTimeout(function () { copyBtn.textContent = "Copy"; copyStatus.textContent = ""; }, 2000);
    };
    var selectAddr = function () {
      var range = document.createRange();
      range.selectNodeContents(byId("mailAddr"));
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    };
    copyBtn.addEventListener("click", function () {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(ADDR).then(copied, selectAddr);
      } else {
        selectAddr();
      }
    });
  }

  // The photo tilts toward the pointer, like the 3D shape behind it.
  var photo = document.querySelector(".portrait img");
  if (photo && !reduce && finePointer) {
    window.addEventListener("pointermove", function (e) {
      var x = e.clientX / window.innerWidth - 0.5, y = e.clientY / window.innerHeight - 0.5;
      photo.style.transform = "perspective(900px) rotateY(" + (x * 12) + "deg) rotateX(" + (y * -12) + "deg)";
    }, { passive: true });
  }

  // 3D: a wireframe icosahedron and a ring of points turning behind the photo.
  function scene3d(canvas) {
    if (!window.THREE || !canvas) return;
    var T = window.THREE, renderer;
    try { renderer = new T.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true }); } catch (err) { return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    var scene = new T.Scene();
    var camera = new T.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.z = 9;
    var group = new T.Group();
    scene.add(group);

    var ico = new T.IcosahedronGeometry(2.9, 1);
    group.add(new T.LineSegments(new T.WireframeGeometry(ico), new T.LineBasicMaterial({ color: 0x8a8a94, transparent: true, opacity: 0.55 })));
    group.add(new T.Points(ico, new T.PointsMaterial({ color: 0xf0f0f2, size: 0.09 })));

    var n = 260, pos = new Float32Array(n * 3);
    for (var i = 0; i < n; i++) {
      var a = (i / n) * Math.PI * 2, rad = 3.15 + (Math.random() - 0.5) * 0.2;
      pos[i * 3] = Math.cos(a) * rad;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.12;
      pos[i * 3 + 2] = Math.sin(a) * rad;
    }
    var ringGeo = new T.BufferGeometry();
    ringGeo.setAttribute("position", new T.BufferAttribute(pos, 3));
    var ring = new T.Points(ringGeo, new T.PointsMaterial({ color: 0xc8c8cf, size: 0.05, transparent: true, opacity: 0.85 }));
    ring.rotation.x = 1.15;
    ring.rotation.y = 0.35;
    scene.add(ring);

    var tx = 0, ty = 0, running = false;
    function size() {
      var s = canvas.clientWidth || 1;
      renderer.setSize(s, s, false);
      camera.aspect = 1;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    }
    function frame() {
      group.rotation.y += 0.0035;
      group.rotation.x += (ty * 0.5 - group.rotation.x) * 0.05;
      group.rotation.z += (tx * 0.3 - group.rotation.z) * 0.05;
      ring.rotation.z += 0.0025;
      renderer.render(scene, camera);
      if (running) requestAnimationFrame(frame);
    }
    group.rotation.set(0.35, 0.6, 0);
    size();
    window.addEventListener("resize", size);
    if (reduce) return;
    window.addEventListener("pointermove", function (e) {
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        var vis = entries[0].isIntersecting;
        if (vis && !running) { running = true; requestAnimationFrame(frame); }
        if (!vis) running = false;
      }).observe(canvas);
    } else {
      running = true;
      requestAnimationFrame(frame);
    }
  }
  scene3d(byId("hero3d"));

  // Particle fields behind the heroes and the contact section.
  function field(canvas, count) {
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    var pts = [], w = 0, h = 0, running = false, raf = 0;
    function size() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(count * Math.min(1, w / 1200));
      pts = [];
      for (var i = 0; i < n; i++) {
        pts.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35, r: Math.random() * 1.6 + 0.6 });
      }
      draw();
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        for (var j = i + 1; j < pts.length; j++) {
          var q = pts[j], dx = p.x - q.x, dy = p.y - q.y, d = dx * dx + dy * dy;
          if (d < 12000) {
            ctx.strokeStyle = "rgba(200, 200, 210," + (0.16 * (1 - d / 12000)) + ")";
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
      }
      ctx.fillStyle = "rgba(240, 240, 242, 0.55)";
      for (var k = 0; k < pts.length; k++) {
        ctx.beginPath(); ctx.arc(pts[k].x, pts[k].y, pts[k].r, 0, 6.2832); ctx.fill();
      }
    }
    function frame() {
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      }
      draw();
      if (running) raf = requestAnimationFrame(frame);
    }
    size();
    window.addEventListener("resize", size);
    if (reduce || !("IntersectionObserver" in window)) return;
    new IntersectionObserver(function (entries) {
      var vis = entries[0].isIntersecting;
      if (vis && !running) { running = true; raf = requestAnimationFrame(frame); }
      if (!vis) { running = false; cancelAnimationFrame(raf); }
    }).observe(canvas);
  }
  document.querySelectorAll("canvas[data-particles]").forEach(function (cv) {
    field(cv, Number(cv.getAttribute("data-particles")) || 60);
  });
})();
