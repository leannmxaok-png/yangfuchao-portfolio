/* 杨富超 · 个人网站 · 交互脚本 */
(function () {
  "use strict";

  /* ---------- 移动端导航 ---------- */
  var head = document.querySelector(".site-head");
  var toggle = document.querySelector(".nav-toggle");
  if (head && toggle) {
    toggle.addEventListener("click", function () {
      var open = head.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.addEventListener("click", function (e) {
      if (!head.contains(e.target)) {
        head.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- 筛选 ---------- */
  document.querySelectorAll("[data-filter-group]").forEach(function (group) {
    var listSel = group.getAttribute("data-filter-group");
    var list = document.querySelectorAll(listSel + " [data-cat]");
    group.querySelectorAll(".chip").forEach(function (chip) {
      chip.addEventListener("click", function () {
        group.querySelectorAll(".chip").forEach(function (c) {
          c.classList.remove("is-active");
          c.setAttribute("aria-pressed", "false");
        });
        chip.classList.add("is-active");
        chip.setAttribute("aria-pressed", "true");
        var key = chip.getAttribute("data-key");
        list.forEach(function (item) {
          var hit = key === "all" || item.getAttribute("data-cat") === key;
          item.style.display = hit ? "" : "none";
        });
        /* 时间轴：筛完把空掉的年份章节一起收起 */
        var groups = document.querySelectorAll(listSel + " [data-year-group]");
        Array.prototype.forEach.call(groups, function (g) {
          var any = false;
          var el = g.nextElementSibling;
          while (el && !el.hasAttribute("data-year-group")) {
            if (el.hasAttribute("data-cat") && el.style.display !== "none") any = true;
            el = el.nextElementSibling;
          }
          g.style.display = any ? "" : "none";
        });
        /* 作品页：标题旁的件数跟着筛选走 */
        var cnt = document.querySelector('[data-count-for="' + listSel + '"]');
        if (cnt) {
          var n = 0;
          list.forEach(function (item) {
            if (item.style.display !== "none") n++;
          });
          cnt.textContent = (n < 10 ? "0" : "") + n;
        }
      });
    });
  });

  /* ---------- 复制邮箱 ---------- */
  var toast = document.querySelector(".toast");
  var toastTimer;
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("is-on");
    }, 1800);
  }

  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy");
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(
          function () {
            showToast("邮箱已复制：" + text);
          },
          function () {
            showToast("复制失败，请手动选择");
          }
        );
      } else {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try {
          document.execCommand("copy");
          showToast("邮箱已复制：" + text);
        } catch (e) {
          showToast("复制失败，请手动选择");
        }
        document.body.removeChild(ta);
      }
    });
  });

  /* ---------- 当前年份 ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();

/* ==========================================================================
   动效层：阅读进度 / 光标氛围 / 首屏视差 / 滚动揭示 / 数字滚动 / 对比条
   —— 全部围绕"入场"这一个动作，不改变任何内容
   ========================================================================== */
(function () {
  "use strict";

  var root = document.documentElement;
  var body = document.body;
  var reduce =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var touch =
    (window.matchMedia && window.matchMedia("(hover: none)").matches) ||
    "ontouchstart" in window;

  /* ---------- 顶部阅读进度 ---------- */
  var readbar = document.createElement("div");
  readbar.className = "readbar";
  readbar.innerHTML = "<i></i>";
  body.appendChild(readbar);
  var readFill = readbar.firstChild;

  /* ---------- 滚动：进度条 + 首屏视差 + 头部状态 ---------- */
  var heroPhoto = document.querySelector(".hero__photo");
  var head = document.querySelector(".site-head");
  var ticking = false;

  function frame() {
    ticking = false;
    var y = window.pageYOffset || root.scrollTop;
    var max = root.scrollHeight - window.innerHeight;
    readFill.style.transform = "scaleX(" + (max > 0 ? Math.min(1, y / max) : 0) + ")";

    if (heroPhoto && !reduce) {
      var off = Math.min(y * 0.16, 44);
      heroPhoto.style.transform =
        "translate3d(0," + off.toFixed(1) + "px,0) scale(1.06)";
    }
    if (head) head.classList.toggle("is-stuck", y > 10);
  }

  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(frame);
      }
    },
    { passive: true }
  );
  window.addEventListener("resize", frame, { passive: true });
  frame();

  /* ---------- 数字滚动 ---------- */
  function group(n) {
    var s = String(n);
    var dot = s.indexOf(".");
    var int = dot < 0 ? s : s.slice(0, dot);
    var dec = dot < 0 ? "" : s.slice(dot);
    return int.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + dec;
  }

  function countUp(el) {
    if (el.getAttribute("data-done") === "1") return;
    el.setAttribute("data-done", "1");
    var to = parseFloat(el.getAttribute("data-count")) || 0;
    var dec = parseInt(el.getAttribute("data-dec") || "0", 10);
    var dur = parseInt(el.getAttribute("data-dur") || "1600", 10);
    var put = function (v) {
      el.textContent = dec ? v.toFixed(dec) : group(Math.round(v));
    };
    if (reduce) {
      put(to);
      return;
    }
    var t0 = null;
    var done = false;
    var step = function (t) {
      if (t0 === null) t0 = t;
      var k = Math.min(1, (t - t0) / dur);
      var e = 1 - Math.pow(1 - k, 3);
      put(to * e);
      if (k < 1) {
        requestAnimationFrame(step);
      } else {
        done = true;
        put(to);
      }
    };
    requestAnimationFrame(step);
    /* 兜底：标签页被挂起或 rAF 被限流时，别让数字停在 0 */
    setTimeout(function () {
      if (!done) put(to);
    }, dur + 900);
  }

  /* ---------- 揭示 / 数字 / 对比条 ---------- */
  var targets = document.querySelectorAll(
    "[data-reveal],[data-reveal-group],[data-count],[data-bar]"
  );

  document.querySelectorAll("[data-reveal-group]").forEach(function (g) {
    Array.prototype.forEach.call(g.children, function (c, i) {
      c.style.setProperty("--d", i * 80 + "ms");
    });
  });

  function activate(el) {
    el.classList.add("is-in");
    if (el.hasAttribute("data-bar")) {
      el.style.setProperty("--p", el.getAttribute("data-bar"));
      el.classList.add("is-in");
    }
    if (el.hasAttribute("data-count")) countUp(el);
    el.querySelectorAll("[data-bar]").forEach(function (b) {
      b.style.setProperty("--p", b.getAttribute("data-bar"));
      b.classList.add("is-in");
    });
    el.querySelectorAll("[data-count]").forEach(countUp);
  }

  if ("IntersectionObserver" in window && !reduce && targets.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          activate(en.target);
          io.unobserve(en.target);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -8% 0px" }
    );
    Array.prototype.forEach.call(targets, function (el) {
      io.observe(el);
    });
  } else {
    Array.prototype.forEach.call(targets, activate);
  }

  /* ---------- 卡片光斑跟随 ---------- */
  if (!touch) {
    body.addEventListener(
      "pointermove",
      function (e) {
        var t = e.target.closest ? e.target.closest(".stat,.cap") : null;
        if (!t) return;
        var r = t.getBoundingClientRect();
        t.style.setProperty(
          "--mx",
          (((e.clientX - r.left) / r.width) * 100).toFixed(1) + "%"
        );
        t.style.setProperty(
          "--my",
          (((e.clientY - r.top) / r.height) * 100).toFixed(1) + "%"
        );
      },
      { passive: true }
    );
  }
})();

/* ==========================================================================
   证书环绕：3D 环形排布，从左到右依次转过前台
   窄屏 / 无 JS 时退化成横向滑动条
   ========================================================================== */
(function () {
  "use strict";

  var sect = document.querySelector("[data-cert-ring]");
  if (!sect) return;

  var ring = sect.querySelector("[data-ring]");
  var stage = sect.querySelector("[data-ring-stage]");
  var cards = Array.prototype.slice.call(ring.querySelectorAll(".ring__card"));
  var n = cards.length;
  if (!n) return;

  var step = 360 / n;
  var dotsBox = sect.querySelector("[data-ring-dots]");
  var btnPrev = sect.querySelector("[data-ring-prev]");
  var btnNext = sect.querySelector("[data-ring-next]");
  var box = document.querySelector("[data-lightbox]");
  var boxImg = document.querySelector("[data-lightbox-img]");
  var reduce =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var i = 0;
  var radius = 420;
  var timer = null;
  var isRing = false;
  var inView = true;

  var countEl = sect.querySelector("[data-ring-count]");

  /* 给每张证的图框铺一层同图模糊底 */
  cards.forEach(function (c) {
    var img = c.querySelector("img");
    var box = c.querySelector(".ring__img");
    if (img && box) {
      box.style.setProperty(
        "--bg",
        'url("' + img.getAttribute("src") + '")'
      );
    }
  });

  function pad(v) {
    return (v < 10 ? "0" : "") + v;
  }

  var dots = cards.map(function (c, k) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "ring-dot";
    b.setAttribute("aria-label", "第 " + (k + 1) + " 张");
    b.addEventListener("click", function () {
      go(k, true);
    });
    if (dotsBox) dotsBox.appendChild(b);
    return b;
  });

  function measure() {
    var w = cards[0].offsetWidth || 320;
    radius = Math.round(w / 2 / Math.tan(Math.PI / n)) + 6;
  }

  function place(front) {
    if (!isRing) return;
    cards.forEach(function (c, k) {
      var lift = k === front ? 26 : 0;
      c.style.transform =
        "rotateY(" +
        -k * step +
        "deg) translateZ(" +
        (radius + lift) +
        "px)";
      c.classList.toggle("is-on", k === front);
    });
  }

  function render() {
    var front = ((i % n) + n) % n;
    ring.style.transform =
      "translateZ(" + -radius + "px) rotateY(" + i * step + "deg)";
    place(front);
    dots.forEach(function (d, k) {
      d.classList.toggle("is-on", k === front);
    });
    if (countEl) {
      countEl.innerHTML = "<b>" + pad(front + 1) + "</b> / " + pad(n);
    }
  }

  function go(k, user) {
    i = k;
    if (i > 900 || i < -900) {
      i = ((i % n) + n) % n;
      ring.style.transition = "none";
      render();
      requestAnimationFrame(function () {
        ring.style.transition = "";
      });
    } else {
      render();
    }
    if (window.__sfx) window.__sfx.play("page");
    if (user) restart();
  }

  function start() {
    if (reduce || !isRing || !inView || timer) return;
    timer = setInterval(function () {
      go(i + 1);
    }, 4200);
  }

  function stop() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function restart() {
    stop();
    start();
  }

  function enable() {
    isRing = true;
    sect.classList.add("is-ring");
    measure();
    render();
    start();
  }

  function disable() {
    isRing = false;
    sect.classList.remove("is-ring");
    stop();
    ring.style.transform = "";
    cards.forEach(function (c) {
      c.style.transform = "";
      c.classList.remove("is-on");
    });
  }

  function sync() {
    var wide = window.innerWidth > 900;
    if (wide && !isRing) enable();
    else if (!wide && isRing) disable();
    else if (isRing) {
      measure();
      render();
    }
  }

  /* 拖动 / 轻扫 */
  var dragging = false;
  var sx = 0;
  var lx = 0;
  var moved = false;

  stage.addEventListener("pointerdown", function (e) {
    if (!isRing) return;
    dragging = true;
    moved = false;
    sx = lx = e.clientX;
    sect.classList.add("is-dragging");
    stop();
  });

  window.addEventListener(
    "pointermove",
    function (e) {
      if (!dragging) return;
      lx = e.clientX;
      var dx = lx - sx;
      if (Math.abs(dx) > 6) moved = true;
      ring.style.transform =
        "translateZ(" +
        -radius +
        "px) rotateY(" +
        (i * step + dx * 0.2) +
        "deg)";
    },
    { passive: true }
  );

  window.addEventListener("pointerup", function () {
    if (!dragging) return;
    dragging = false;
    sect.classList.remove("is-dragging");
    var dx = lx - sx;
    if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1));
    else render();
    start();
  });

  /* 点卡片：中间的看大图，两侧的转过去 */
  cards.forEach(function (c, k) {
    c.addEventListener("click", function () {
      if (moved) return;
      /* 窄屏是横排，点哪张就看哪张 */
      if (!isRing) {
        openBox(c);
        return;
      }
      var front = ((i % n) + n) % n;
      if (k === front) {
        openBox(c);
        return;
      }
      var diff = (((k - i) % n) + n) % n;
      go(diff <= n / 2 ? i + diff : i - (n - diff), true);
    });
  });

  if (btnNext)
    btnNext.addEventListener("click", function () {
      go(i + 1, true);
    });
  if (btnPrev)
    btnPrev.addEventListener("click", function () {
      go(i - 1, true);
    });

  sect.addEventListener("mouseenter", stop);
  sect.addEventListener("mouseleave", function () {
    if (!dragging) start();
  });

  document.addEventListener("keydown", function (e) {
    /* 大图打开时左右键归大图用，别顺手把环也转了 */
    if (!isRing || !inView || document.querySelector(".lightbox.is-on")) return;
    if (e.key === "ArrowRight") go(i + 1, true);
    if (e.key === "ArrowLeft") go(i - 1, true);
  });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      function (en) {
        inView = en[0].isIntersecting;
        if (inView) start();
        else stop();
      },
      { threshold: 0.15 }
    ).observe(sect);
  }

  /* 大图 */
  function openBox(card) {
    var img = card.querySelector("img");
    if (!box || !img) return;
    boxImg.src = img.getAttribute("src");
    boxImg.alt = img.getAttribute("alt") || "";
    box.classList.add("is-on");
    box.setAttribute("aria-hidden", "false");
    stop();
  }
  function closeBox() {
    box.classList.remove("is-on");
    box.setAttribute("aria-hidden", "true");
    start();
  }
  if (box) {
    box.addEventListener("click", function (e) {
      if (e.target === box || e.target.hasAttribute("data-lightbox-close")) {
        closeBox();
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeBox();
    });
  }

  window.addEventListener("resize", sync, { passive: true });
  sync();
})();

/* ==========================================================================
   时光轴：红线跟着滚动长出来，读到哪一年哪一年就亮
   ========================================================================== */
(function () {
  "use strict";

  var wrap = document.querySelector("[data-timeline]");
  if (!wrap) return;

  var reduce =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var years = wrap.querySelectorAll("[data-year-group]");

  function paint() {
    if (reduce) {
      wrap.style.setProperty("--tl-p", "1");
      wrap.classList.add("is-full");
      Array.prototype.forEach.call(years, function (y) {
        y.classList.add("is-live");
        y.classList.remove("is-past");
      });
      return;
    }
    var r = wrap.getBoundingClientRect();
    var anchor = window.innerHeight * 0.58;
    var p = (anchor - r.top) / r.height;
    p = Math.max(0, Math.min(1, p));
    wrap.style.setProperty("--tl-p", p.toFixed(4));
    wrap.classList.toggle("is-full", p > 0.995);
    wrap.classList.toggle("is-start", p < 0.004);

    /* 已经翻到视口中线以上的最后一年，就是当前这一章 */
    var line = window.innerHeight * 0.66;
    var at = -1;
    Array.prototype.forEach.call(years, function (y, i) {
      if (y.getBoundingClientRect().top < line) at = i;
    });
    Array.prototype.forEach.call(years, function (y, i) {
      y.classList.toggle("is-live", i === at);
      y.classList.toggle("is-past", i < at);
    });
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      paint();
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  paint();

})();

/* ==========================================================================
   精选大屏轮播：自动走片、进度条、点标签/箭头/键盘/滑动都能切
   ========================================================================== */
(function () {
  "use strict";

  var stage = document.querySelector("[data-stage]");
  if (!stage) return;

  var slides = stage.querySelectorAll("[data-slide]");
  var tabs = stage.querySelectorAll(".stage__tab");
  if (slides.length < 2) return;

  var vp = stage.querySelector(".stage__vp");
  var reduce =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var DUR = 6800;
  var idx = 0;
  var raf = 0;
  var el = 0; /* 已经走过的毫秒，暂停时不清零 */
  var last = 0;
  var paused = false;

  function paintTabs() {
    Array.prototype.forEach.call(tabs, function (t, i) {
      var on = i === idx;
      t.classList.toggle("is-on", on);
      t.setAttribute("aria-pressed", on ? "true" : "false");
      t.style.setProperty("--stage-p", on ? (reduce ? "1" : "0") : "0");
    });
  }

  function halt() {
    cancelAnimationFrame(raf);
    last = 0;
  }

  function kick() {
    halt();
    if (reduce || paused || document.hidden) return;
    raf = requestAnimationFrame(frame);
  }

  function frame(now) {
    if (!last) last = now;
    el += now - last;
    last = now;
    var t = Math.min(1, el / DUR);
    if (tabs[idx]) tabs[idx].style.setProperty("--stage-p", t.toFixed(4));
    if (t >= 1) {
      go(idx + 1);
      return;
    }
    raf = requestAnimationFrame(frame);
  }

  function go(n) {
    idx = (n + slides.length) % slides.length;
    Array.prototype.forEach.call(slides, function (s, i) {
      s.classList.toggle("is-on", i === idx);
      s.setAttribute("aria-hidden", i === idx ? "false" : "true");
    });
    paintTabs();
    el = 0;
    kick();
  }

  /* 手动操作后重新计时 */
  Array.prototype.forEach.call(tabs, function (t) {
    t.addEventListener("click", function () {
      var n = parseInt(t.getAttribute("data-go"), 10) || 0;
      if (n !== idx) go(n);
    });
  });

  var prev = stage.querySelector("[data-prev]");
  var next = stage.querySelector("[data-next]");
  if (prev) prev.addEventListener("click", function () { go(idx - 1); });
  if (next) next.addEventListener("click", function () { go(idx + 1); });

  /* 悬停 / 聚焦时停下，别在用户看字的时候偷偷换页。
     触屏没有 hover，绑了就会因 focus 卡在暂停态，所以只在鼠标环境启用 */
  var fine = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (fine) {
    stage.addEventListener("mouseenter", function () {
      paused = true;
      halt();
    });
    stage.addEventListener("mouseleave", function () {
      paused = false;
      kick();
    });
    stage.addEventListener("focusin", function () {
      paused = true;
      halt();
    });
    stage.addEventListener("focusout", function (e) {
      if (stage.contains(e.relatedTarget)) return;
      paused = false;
      kick();
    });
  }

  /* 键盘左右切换 */
  if (vp) {
    vp.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(idx - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        go(idx + 1);
      }
    });
  }

  /* 手机上左右滑 */
  var fromX = null;
  if (vp) {
    vp.addEventListener("pointerdown", function (e) {
      fromX = e.clientX;
    });
    vp.addEventListener("pointerup", function (e) {
      if (fromX === null) return;
      var dx = e.clientX - fromX;
      fromX = null;
      if (Math.abs(dx) > 44) go(dx < 0 ? idx + 1 : idx - 1);
    });
    vp.addEventListener("pointercancel", function () {
      fromX = null;
    });
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) halt();
    else kick();
  });

  /* 切走再回来，不要接着算走了一半的那张 */
  window.addEventListener("blur", halt);
  window.addEventListener("focus", kick);

  paintTabs();
  go(0);
})();

/* ==========================================================================
   死党页照片墙：点开大图，左右键/箭头翻页，Esc 关闭
   ========================================================================== */
(function () {
  "use strict";

  var wall = document.querySelector("[data-life-wall]");
  if (!wall) return;

  var box = document.querySelector("[data-life-box]");
  if (!box) return;

  var img = box.querySelector("[data-life-img]");
  var cnt = box.querySelector("[data-life-count]");
  var cap = box.querySelector("[data-life-cap]");
  var cards = Array.prototype.slice.call(wall.querySelectorAll(".life-card"));
  var list = [];
  var at = 0;

  function pad(v) {
    return (v < 10 ? "0" : "") + v;
  }

  function visible() {
    return cards.filter(function (c) {
      return c.style.display !== "none";
    });
  }

  function show(k) {
    if (!list.length) return;
    at = ((k % list.length) + list.length) % list.length;
    var im = list[at].querySelector("img");
    if (!im || !img) return;
    img.src = im.getAttribute("src");
    img.alt = im.getAttribute("alt") || "";
    if (cnt) cnt.textContent = pad(at + 1) + " / " + pad(list.length);
    if (cap) cap.textContent = im.getAttribute("alt") || "";
  }

  function open(card) {
    list = visible();
    var k = list.indexOf(card);
    show(k < 0 ? 0 : k);
    box.classList.add("is-on");
    box.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function close() {
    box.classList.remove("is-on");
    box.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  cards.forEach(function (c) {
    var btn = c.querySelector("[data-life-open]");
    if (!btn) return;
    btn.addEventListener("click", function () {
      open(c);
    });
  });

  box.addEventListener("click", function (e) {
    if (e.target === box) return close();
    if (e.target.hasAttribute("data-life-close")) return close();
    if (e.target.closest("[data-life-prev]")) return show(at - 1);
    if (e.target.closest("[data-life-next]")) return show(at + 1);
  });

  document.addEventListener("keydown", function (e) {
    if (!box.classList.contains("is-on")) return;
    if (e.key === "Escape") {
      close();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      show(at - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      show(at + 1);
    }
  });
})();

/* ==========================================================================
   死党页照片墙：分列瀑布流
   css 多列是「填满一列再换下一列」，22 张排下来编号会跳读；
   这里按「当前最矮的一列」投递，第一排才会是 01 02 03 04。
   图片带了 width/height，没下载完也能算准高度，不会跳。
   ========================================================================== */
(function () {
  "use strict";

  var wall = document.querySelector("[data-life-wall]");
  if (!wall) return;

  var cards = Array.prototype.slice.call(wall.querySelectorAll(".life-card"));
  if (!cards.length) return;

  var cols = [];

  function colCount() {
    if (innerWidth <= 860) return 2;
    if (innerWidth <= 1240) return 3;
    return 4;
  }

  function flatten() {
    cols.forEach(function (col) {
      while (col.firstChild) wall.appendChild(col.firstChild);
      wall.removeChild(col);
    });
    cols = [];
  }

  /* 高度按宽高比算，不读 offsetHeight：刚挂上去的节点量出来是 0，
     整批都会挤到第一列去 */
  function cardHeight(card, colW, gap) {
    var im = card.querySelector("img");
    var w = im ? Number(im.getAttribute("width")) : 0;
    var h = im ? Number(im.getAttribute("height")) : 0;
    var ratio = w && h ? h / w : 0.75;
    return (colW - 2) * ratio + 2 + gap; /* 2px 上下边框 */
  }

  function layout() {
    var n = colCount();
    flatten();

    for (var i = 0; i < n; i++) {
      var d = document.createElement("div");
      d.className = "life-col";
      wall.appendChild(d);
      cols.push(d);
    }
    wall.classList.add("is-mason");

    var gap = n === 2 ? 12 : 16;
    var colW = (wall.clientWidth - gap * (n - 1)) / n;
    var heights = [];
    for (var k = 0; k < n; k++) heights.push(0);

    cards.forEach(function (card) {
      if (card.style.display === "none") return;
      var best = 0;
      for (var j = 1; j < n; j++) {
        if (heights[j] < heights[best] - 0.5) best = j;
      }
      heights[best] += cardHeight(card, colW, gap);
      cols[best].appendChild(card);
    });
  }

  layout();

  /* 筛选之后重新分列，否则空出来的位置会留着 */
  var filters = document.querySelector('.filters[data-filter-group=".life-wall"]');
  if (filters) {
    filters.addEventListener("click", function () {
      setTimeout(layout, 0);
    });
  }

  var timer;
  addEventListener("resize", function () {
    clearTimeout(timer);
    timer = setTimeout(layout, 160);
  });
})();

/* ==========================================================================
   成片播放：轮播里的按钮、作品封面都走这一套
   视频源写在自己页面里，脚本只负责打开 / 关闭 / 暂停。
   ========================================================================== */
(function () {
  "use strict";

  var triggers = Array.prototype.slice.call(document.querySelectorAll("[data-video]"));
  var box = document.querySelector("[data-video-box]");
  if (!triggers.length || !box) return;

  var vid = box.querySelector("[data-video-el]");
  var title = box.querySelector("[data-video-title]");
  var cur = "";

  function open(src, poster, name) {
    if (!vid) return;
    if (cur !== src) {
      cur = src;
      vid.setAttribute("poster", poster || "");
      vid.src = src;
      vid.load();
    }
    if (title) title.textContent = name || "";
    box.classList.add("is-on");
    box.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    var p = vid.play();
    if (p && p.catch) p.catch(function () {});
  }

  function close() {
    box.classList.remove("is-on");
    box.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (vid) vid.pause();
  }

  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-video]");
    if (t) {
      open(
        t.getAttribute("data-video"),
        t.getAttribute("data-video-poster"),
        t.getAttribute("data-video-title")
      );
      return;
    }
    if (e.target.closest("[data-video-close]")) return close();
    if (e.target === box) return close();
  });

  document.addEventListener("keydown", function (e) {
    if (!box.classList.contains("is-on")) return;
    if (e.key === "Escape") close();
  });
})();

/* ==========================================================================
   荣誉页：鼠标停在哪条，右边就换成哪张证书
   窄屏没有 hover，点了直接开大图灯箱
   ========================================================================== */
(function () {
  "use strict";

  var list = document.querySelector("[data-cert-list]");
  var panel = document.querySelector("[data-cert-panel]");
  if (!list || !panel) return;

  var img = panel.querySelector("[data-cert-img]");
  var frame = panel.querySelector(".cert");
  var empty = panel.querySelector("[data-cert-empty]");
  var cap = panel.querySelector("[data-cert-cap]");
  var items = Array.prototype.slice.call(list.children);
  var cur = null;
  var box = document.querySelector("[data-lightbox]");
  var boxImg = document.querySelector("[data-lightbox-img]");

  function isNarrow() {
    return window.matchMedia && window.matchMedia("(max-width: 1000px)").matches;
  }

  function openBox(src, name) {
    if (!box || !boxImg || !src) return;
    boxImg.src = src;
    boxImg.alt = name + " 证书";
    box.classList.add("is-on");
    box.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function show(li) {
    if (li === cur) return;
    cur = li;

    var src = li.getAttribute("data-cert");
    var name = li.getAttribute("data-name") || "";

    items.forEach(function (x) {
      x.classList.toggle("is-on", x === li);
    });
    if (cap) cap.textContent = name;

    if (!src) {
      frame.classList.add("is-empty");
      return;
    }
    frame.classList.remove("is-empty");
    if (img.getAttribute("src") === src) return;

    img.classList.add("is-fade");
    setTimeout(function () {
      img.src = src;
      img.alt = name + " 证书";
      img.classList.remove("is-fade");
    }, 130);
  }

  items.forEach(function (li) {
    li.tabIndex = 0;
    li.addEventListener("mouseenter", function () {
      if (!isNarrow()) show(li);
    });
    li.addEventListener("focus", function () {
      if (!isNarrow()) show(li);
    });
    li.addEventListener("click", function () {
      if (isNarrow()) {
        openBox(li.getAttribute("data-cert"), li.getAttribute("data-name"));
      } else {
        show(li);
      }
    });
  });
})();

/* ==========================================================================
   时间轴：滚动时离视口中心最近的那条高亮，字放大、圆点亮起来
   ========================================================================== */
(function () {
  "use strict";

  var items = Array.prototype.slice.call(document.querySelectorAll(".tl__item"));
  if (!items.length) return;

  var active = null;
  var ticking = false;

  function update() {
    ticking = false;
    var mid = window.innerHeight * 0.46;
    var best = null;
    var bestD = 1e9;

    items.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      var d = Math.abs(r.top + r.height / 2 - mid);
      if (d < bestD) {
        bestD = d;
        best = el;
      }
    });

    if (best === active) return;
    if (active) active.classList.remove("is-focus");
    if (best) best.classList.add("is-focus");
    active = best;
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  update();
})();

/* ==========================================================================
   技能树：进到这一屏时，一个光点顺着主干滑下来，枝条一节节长出来
   ========================================================================== */
(function () {
  "use strict";

  var tree = document.querySelector(".tree");
  if (!tree) return;

  var leaves = tree.querySelectorAll(".tree__leaf li");
  Array.prototype.forEach.call(leaves, function (li, i) {
    li.style.setProperty("--d", 1750 + i * 45 + "ms");
  });

  if (!("IntersectionObserver" in window)) {
    tree.classList.add("is-play");
    return;
  }

  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        tree.classList.add("is-play");
        if (window.__sfx) {
          window.__sfx.play("spark");
          /* 枝条长出来后，叶子每三个响一下，别吵成连珠炮 */
          Array.prototype.forEach.call(leaves, function (li, i) {
            if (i % 3 !== 0) return;
            setTimeout(function () {
              window.__sfx.play("leaf");
            }, 1750 + i * 45);
          });
        }
        io.disconnect();
      });
    },
    { threshold: 0.2 }
  );
  io.observe(tree);
})();

/* ==========================================================================
   交互音效：默认关闭，右下角喇叭开关，开了才响
   声音全部用 Web Audio 现场合成，不加载任何音频文件
   ========================================================================== */
(function () {
  "use strict";

  var KEY = "yfc-sfx";
  var on = true;
  try {
    var saved = localStorage.getItem(KEY);
    on = saved === null ? true : saved === "1";
  } catch (e) {}
  var ctx = null;
  var btn = null;
  var bgm = null;
  var bgmWanted = false;
  var volLevel = 0.32;
  try {
    var sv = localStorage.getItem("yfc-vol");
    if (sv !== null) volLevel = Math.max(0, Math.min(1, parseFloat(sv)));
  } catch (e) {}
  /* 换页时接着上一页的进度播 */
  var resumeAt = 0;
  try {
    resumeAt = parseFloat(sessionStorage.getItem("yfc-bgm-t") || "0") || 0;
  } catch (e) {}

  /* 背景音乐：默认开，但要等用户第一次动手（浏览器策略）才真正播 */
  function bgmEl() {
    if (bgm) return bgm;
    bgm = new Audio("assets/audio/bgm.mp3");
    bgm.loop = true;
    bgm.preload = "none";
    bgm.volume = 0;
    return bgm;
  }

  function fadeBgm(to, ms) {
    var a = bgmEl();
    var from = a.volume;
    var t0 = performance.now();
    function step(now) {
      var k = Math.min(1, (now - t0) / ms);
      a.volume = from + (to - from) * k;
      if (k < 1) requestAnimationFrame(step);
      else if (to === 0) a.pause();
    }
    requestAnimationFrame(step);
  }

  function startBgm() {
    if (!on) return;
    var a = bgmEl();
    bgmWanted = true;
    var p = a.play();
    var after = function () {
      if (resumeAt > 0) {
        try {
          a.currentTime = resumeAt;
        } catch (e) {}
      }
      fadeBgm(volLevel, 1400);
    };
    if (p && p.then) p.then(after).catch(function () { bgmWanted = false; });
    else after();
  }

  function stopBgm() {
    bgmWanted = false;
    if (bgm) fadeBgm(0, 500);
  }

  /* 视频一播，先让音乐让路 */
  document.addEventListener("click", function (e) {
    if (!e.target.closest) return;
    if (e.target.closest("[data-video], .stage__play, .vstrip__poster, .duo__play")) stopBgm();
  }, true);
  document.addEventListener("click", function (e) {
    if (!e.target.closest) return;
    if (e.target.closest("[data-video-close], .lightbox__x")) {
      if (on && bgmWanted) startBgm();
    }
  }, true);

  function audio() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  /* 对外暴露：window.__sfx.play('click' | 'page' | 'leaf' | 'spark') */
  window.__sfx = {
    get on() {
      return on;
    },
    play: function (kind) {
      if (!on) return;
      if (kind === "page") {
        blip(880, 0.05, 0.04, "triangle");
        setTimeout(function () {
          blip(660, 0.06, 0.03, "triangle");
        }, 45);
      } else if (kind === "leaf") {
        blip(1480, 0.025, 0.011, "triangle");
      } else if (kind === "spark") {
        blip(260, 0.16, 0.03, "sine", 180);
      } else if (kind === "open") {
        blip(620, 0.1, 0.045, "sine", 900);
      } else {
        blip(560, 0.085, 0.05, "sine", 372);
      }
    }
  };

  function blip(freq, dur, vol, type, slideTo) {
    if (!on) return;
    var ac = audio();
    if (!ac) return;
    var t = ac.currentTime;
    var osc = ac.createOscillator();
    var gain = ac.createGain();
    osc.type = type || "sine";
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(t);
    osc.stop(t + dur + 0.03);
  }

  function paint() {
    if (!btn) return;
    btn.classList.toggle("is-on", on);
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    btn.setAttribute("aria-label", on ? "关闭音效" : "打开音效");
  }

  function makeBtn() {
    btn = document.createElement("button");
    btn.type = "button";
    btn.className = "sfx-toggle";
    btn.innerHTML =
      '<svg viewBox="0 0 18 18" aria-hidden="true">' +
      '<path d="M2.6 6.4 H5.2 L8.6 3.4 V14.6 L5.2 11.6 H2.6 Z"/>' +
      '<path class="sfx-wave" d="M11.4 6.2 A3 3 0 0 1 11.4 11.8"/>' +
      '<path class="sfx-wave" d="M13.2 4.4 A5.4 5.4 0 0 1 13.2 13.6"/>' +
      '<path class="sfx-slash" d="M3 15 L15 3"/>' +
      "</svg>";
    document.body.appendChild(btn);
    paint();

    /* 音量滑块：开声音后浮在开关左边 */
    var volBox = document.createElement("div");
    volBox.className = "vol";
    volBox.innerHTML =
      '<input type="range" min="0" max="100" step="1" aria-label="背景音乐音量" value="' +
      Math.round(volLevel * 100) +
      '" />';
    document.body.appendChild(volBox);
    var slider = volBox.querySelector("input");
    slider.addEventListener("input", function () {
      volLevel = slider.value / 100;
      try {
        localStorage.setItem("yfc-vol", String(volLevel));
      } catch (e) {}
      if (bgm && !bgm.paused) {
        bgm.volume = volLevel;
      }
    });

    btn.addEventListener("click", function () {
      on = !on;
      try {
        localStorage.setItem(KEY, on ? "1" : "0");
      } catch (e) {}
      paint();
      if (on) {
        blip(760, 0.13, 0.055, "sine", 1040);
        startBgm();
      } else {
        stopBgm();
      }
    });
  }

  /* 悬停：极轻的一下，只在高价值元素上响 */
  document.addEventListener(
    "pointerover",
    function (e) {
      if (!on || !e.target.closest) return;
      var el = e.target.closest(
        "a, button, .work, .cap, .proj, .film, .dir, .stat, .slice, .life-card, .tree__branch, .award-list li"
      );
      if (!el || el.__sfxOn) return;
      el.__sfxOn = 1;
      setTimeout(function () {
        el.__sfxOn = 0;
      }, 420);
      blip(1320, 0.03, 0.014, "triangle");
    },
    true
  );

  /* 点击：一声短促的"嗒" */
  document.addEventListener(
    "click",
    function (e) {
      if (!on || !e.target.closest) return;
      if (!e.target.closest("a, button, .work__cover, .life-card")) return;
      blip(560, 0.085, 0.05, "sine", 372);
    },
    true
  );

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", makeBtn);
  } else {
    makeBtn();
  }

  /* 浏览器不允许无交互自动播放，等第一次点击/按键就起 */
  function firstTouch(e) {
    /* 第一次就点视频的话别起音乐，等下一次真实交互 */
    var t = e && e.target;
    if (t && t.closest && t.closest("[data-video], .stage__play, .vstrip__poster, .duo__play")) return;
    if (on) startBgm();
    document.removeEventListener("pointerdown", firstTouch);
    document.removeEventListener("keydown", firstTouch);
  }
  document.addEventListener("pointerdown", firstTouch, { passive: true });
  document.addEventListener("keydown", firstTouch);

  /* 离开页面前把播放进度记下来 */
  function saveBgm() {
    try {
      if (bgm) sessionStorage.setItem("yfc-bgm-t", String(bgm.currentTime));
      sessionStorage.setItem("yfc-bgm-play", bgmWanted ? "1" : "0");
    } catch (e) {}
  }
  window.addEventListener("pagehide", saveBgm);
  window.addEventListener("beforeunload", saveBgm);
})();

/* ==========================================================================
   文案热更新：读 content/site.json，把带 data-t 的元素覆盖掉
   JSON 读不到就保持 HTML 里的原文，不影响访问
   ========================================================================== */
(function () {
  "use strict";

  if (location.protocol === "file:") return; /* 本地直接开文件时不折腾 */

  var nodes = document.querySelectorAll("[data-t]");
  if (!nodes.length || !window.fetch) return;

  function pick(obj, path) {
    return path.split(".").reduce(function (o, k) {
      return o && typeof o === "object" ? o[k] : undefined;
    }, obj);
  }

  fetch("content/site.json", { cache: "no-cache" })
    .then(function (r) {
      return r.ok ? r.json() : null;
    })
    .then(function (data) {
      if (!data) return;
      Array.prototype.forEach.call(nodes, function (el) {
        var v = pick(data, el.getAttribute("data-t"));
        if (typeof v === "string" && v.trim()) el.innerHTML = v;
      });
    })
    .catch(function () {});
})();

/* ==========================================================================
   大段文字入场：从上往下逐行滑入（data-rise 的数字就是出场顺序）
   ========================================================================== */
(function () {
  "use strict";

  var els = Array.prototype.slice.call(document.querySelectorAll("[data-rise]"));
  if (!els.length) return;

  function show(el) {
    var i = parseInt(el.getAttribute("data-rise"), 10) || 0;
    el.style.setProperty("--rd", i * 115 + "ms");
    el.classList.add("is-rise");
  }

  if (!("IntersectionObserver" in window)) {
    els.forEach(show);
    return;
  }

  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        show(en.target);
        io.unobserve(en.target);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -6% 0px" }
  );

  els.forEach(function (el) {
    io.observe(el);
  });
})();

/* ==========================================================================
   顶部小字扫描：进页面时一道光从左边扫到右边，字跟着亮起来
   ========================================================================== */
(function () {
  "use strict";

  var els = Array.prototype.slice.call(document.querySelectorAll("[data-sweep]"));
  if (!els.length) return;

  function run(el) {
    if (el.classList.contains("is-swept")) return;
    var spark = el.querySelector(".hero__spark");
    if (spark) {
      el.style.setProperty("--spark-w", el.offsetWidth + "px");
    }
    /* 先让它以半透明状态出现，再扫 */
    el.classList.add("is-swept");
    var big = el.classList.contains("hero__title") || el.classList.contains("page-title");
    setTimeout(function () {
      el.classList.add("is-done");
    }, big ? 1900 : 1650);
  }

  if (!("IntersectionObserver" in window)) {
    els.forEach(run);
    return;
  }

  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        /* data-sweep 的值就是延迟毫秒数，让标题等 hero 的入场动画先走完 */
        var d = parseInt(en.target.getAttribute("data-sweep"), 10);
        setTimeout(function () {
          run(en.target);
        }, isNaN(d) ? 260 : d);
        io.unobserve(en.target);
      });
    },
    { threshold: 0.4 }
  );

  els.forEach(function (el) {
    io.observe(el);
  });
})();
