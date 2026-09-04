/*
 * QingYan Studio Portfolio v1.0 — Main Logic (v2)
 * ============================================================
 * 职责：
 *   1. 导航（滚动状态 / 移动菜单）
 *   2. Media Slot 替换（从 site-data.js 读取，替换占位符）
 *   3. Hero Media Slot（video / poster / cinematic scene 回退链 + reduced-motion）
 *   4. Section Reveal 动画
 *   5. 九州演示视频：视口播放（IO threshold 0.5）+ SVG 喇叭 overlay
 *   6. Film Modal（单实例 Lightbox，事件委托 [data-film]）
 *
 * 注意：所有页面内容已写在静态 HTML 中（保证 no-JS 可读 + 截图可拍）。
 * 本文件只负责增强交互和素材替换。
 *
 * ============================================================
 * HERO MEDIA SLOT 架构（One-pass Code Fix 后）
 * ============================================================
 * Hero 容器分层（index.html）：
 *   .hero__container
 *     ├─ .hero__media            ← 唯一可替换区（scene / video / poster）
 *     ├─ .hero__media-noise      ← 长期电影质感层，替换 video 时永久保留
 *     ├─ .hero__media-vignette   ← 长期电影质感层，替换 video 时永久保留
 *     ├─ .hero__overlay
 *     ├─ .hero__content
 *     ├─ .hero__card-bl-ambient
 *     └─ .hero__cutout
 *
 * 回退链：video → poster → cinematic scene（绝不黑屏）
 * ============================================================
 */

(function () {
  "use strict";

  // Enable reveal animation (CSS hides .reveal when .js-loaded is on <html>)
  document.documentElement.classList.add("js-loaded");

  // prefers-reduced-motion 媒体查询（模块级单例）
  const reducedMotionMQ = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ========================================
   * 1. NAVIGATION
   * ======================================== */

  const nav = document.querySelector(".nav");
  const navToggle = document.querySelector(".nav__toggle");
  const mobileMenu = document.querySelector(".mobile-menu");

  // Nav scrolled state
  function updateNav() {
    if (!nav) return;
    if (window.scrollY > 8) {
      nav.classList.add("is-scrolled");
    } else {
      nav.classList.remove("is-scrolled");
    }
  }
  window.addEventListener("scroll", updateNav, { passive: true });
  updateNav();

  // Mobile menu
  function toggleMenu(forceOpen) {
    if (!navToggle || !mobileMenu) return;
    const isOpen =
      typeof forceOpen === "boolean"
        ? forceOpen
        : !mobileMenu.classList.contains("is-open");
    navToggle.classList.toggle("is-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    mobileMenu.classList.toggle("is-open", isOpen);
    document.body.style.overflow = isOpen ? "hidden" : "";
  }

  if (navToggle && mobileMenu) {
    navToggle.addEventListener("click", () => toggleMenu());
    navToggle.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleMenu();
      }
    });
    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => toggleMenu(false));
    });
  }

  // Close mobile menu on resize to desktop
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 860 && mobileMenu && mobileMenu.classList.contains("is-open")) {
      toggleMenu(false);
    }
  });


  /* ========================================
   * 2. HERO MEDIA SLOT
   * ======================================== */

  /**
   * 根据 src 后缀推断 MIME（仅用于未显式声明 type 的单 src 场景）
   */
  function mimeFromSrc(src) {
    const ext = String(src || "").split(".").pop().toLowerCase();
    if (ext === "webm") return "video/webm";
    if (ext === "ogg" || ext === "ogv") return "video/ogg";
    return "video/mp4";
  }

  /**
   * 构造 Hero 背景 video 元素
   * 内置：autoplay / muted / loop / playsinline / preload="metadata" / poster
   * 支持单 src 或多 source（srcs 数组，WebM + MP4 fallback）
   */
  function createHeroVideo(media) {
    const video = document.createElement("video");
    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.preload = media.preload || "metadata";
    video.setAttribute("aria-hidden", "true");
    video.setAttribute("tabindex", "-1");
    if (media.poster) video.poster = media.poster;

    const sources =
      media.srcs && media.srcs.length
        ? media.srcs
        : media.src
          ? [{ src: media.src, type: media.mime || mimeFromSrc(media.src) }]
          : [];

    sources.forEach((s) => {
      const source = document.createElement("source");
      source.src = s.src;
      if (s.type) source.type = s.type;
      video.appendChild(source);
    });

    return video;
  }

  /**
   * 把 objectPosition 配置注入为 CSS 变量（桌面 / 移动各一条，不绑定具体素材）
   */
  function applyObjectPosition(heroMediaEl, media) {
    if (media.objectPosition) {
      heroMediaEl.style.setProperty("--hero-media-pos", media.objectPosition);
    }
    if (media.objectPositionMobile) {
      heroMediaEl.style.setProperty("--hero-media-pos-mobile", media.objectPositionMobile);
    }
  }

  /**
   * reduced-motion：命中时暂停视频、保留静态 poster；解除后恢复播放
   */
  function bindReducedMotion(video) {
    const apply = () => {
      if (!video) return;
      if (reducedMotionMQ.matches) {
        video.autoplay = false;
        video.pause();
      } else {
        video.autoplay = true;
        if (!video.paused) return;
        const p = video.play();
        if (p && p.catch) p.catch(() => {});
      }
    };
    apply();
    if (typeof reducedMotionMQ.addEventListener === "function") {
      reducedMotionMQ.addEventListener("change", apply);
    } else if (typeof reducedMotionMQ.addListener === "function") {
      reducedMotionMQ.addListener(apply);
    }
  }

  function renderHeroMedia() {
    const heroMediaEl = document.querySelector(".hero__media");
    if (!heroMediaEl) return;

    // Check if site-data.js is loaded.
    // 注意: classic 脚本顶层 const 不会挂到 window，必须用直接引用（同 script 作用域）。
    const D = typeof SITE_DATA !== "undefined" ? SITE_DATA : null;
    const heroMedia = D && D.media && D.media["hero-background"];

    // If no data or still placeholder → keep the cinematic scene (already in static HTML)
    if (!heroMedia || heroMedia.type === "placeholder") {
      return;
    }

    // 保存 placeholder 节点（scene + label）引用，用于 video 失败时恢复
    const placeholderNodes = Array.from(heroMediaEl.children);

    // Real media — replace only the media slot content.
    // noise / vignette 位于 .hero__container 层，不在 .hero__media 内，不会被清空。
    heroMediaEl.innerHTML = "";

    applyObjectPosition(heroMediaEl, heroMedia);

    if (heroMedia.type === "video") {
      const video = createHeroVideo(heroMedia);
      let settled = false;
      let watchdog = null;

      // video 加载失败 → poster → cinematic scene（绝不黑屏）
      const fallback = () => {
        if (settled) return;
        settled = true;
        if (watchdog) clearTimeout(watchdog);
        const poster = heroMedia.poster;
        if (poster) {
          const img = document.createElement("img");
          img.src = poster;
          img.alt = heroMedia.alt || "Hero background poster";
          img.setAttribute("aria-hidden", "true");
          img.addEventListener("error", () => {
            // 双重校验：图片已成功解码（naturalWidth > 0）时忽略伪 error，
            // 避免 headless/异常环境下偶发 error 误触发回退
            if (img.complete && img.naturalWidth > 0) return;
            restoreHeroPlaceholder(heroMediaEl, placeholderNodes);
          });
          heroMediaEl.innerHTML = "";
          heroMediaEl.classList.remove("is-filled");
          heroMediaEl.appendChild(img);
          return;
        }
        restoreHeroPlaceholder(heroMediaEl, placeholderNodes);
      };

      // 成功信号：已加载到元数据或可播放 → 取消 watchdog
      const success = () => {
        if (settled) return;
        settled = true;
        if (watchdog) clearTimeout(watchdog);
      };
      video.addEventListener("loadeddata", success);
      video.addEventListener("canplay", success);

      // 注意: <source> 子元素加载失败时 error 事件不冒泡（Chromium 已知行为，
      // video.error 可能为 null 且 video 自身不补发 error）。因此：
      // 1) error 用 capture 监听（能截获 source 层的 error）
      // 2) 加 watchdog：6s 未就绪且不在加载中 → 视为失败，走回退链
      video.addEventListener("error", fallback, true);
      const checkWatchdog = () => {
        if (settled) return;
        if (video.readyState >= 1) { success(); return; }
        if (video.networkState === 3 || video.error) { fallback(); return; }
        // 仍在加载 → 再给 6s（最多 3 次，仍失败则兜底，避免无限等待）
        const tries = (checkWatchdog.tries = (checkWatchdog.tries || 0) + 1);
        if (tries >= 3) { fallback(); return; }
        watchdog = setTimeout(checkWatchdog, 6000);
      };
      watchdog = setTimeout(checkWatchdog, 6000);

      heroMediaEl.classList.add("is-filled");
      heroMediaEl.appendChild(video);
      bindReducedMotion(video);
    } else if (heroMedia.type === "image") {
      const img = document.createElement("img");
      img.src = heroMedia.src;
      img.alt = heroMedia.alt || "Hero background";
      img.setAttribute("aria-hidden", "true");

      // 图片失败 → 恢复 cinematic scene（同样加 naturalWidth 双重校验）
      img.addEventListener("error", () => {
        if (img.complete && img.naturalWidth > 0) return;
        restoreHeroPlaceholder(heroMediaEl, placeholderNodes);
      });

      heroMediaEl.classList.add("is-filled");
      heroMediaEl.appendChild(img);
    }
  }

  /**
   * 恢复 cinematic placeholder scene（video/poster 均失败时的兜底）
   */
  function restoreHeroPlaceholder(heroMediaEl, placeholderNodes) {
    heroMediaEl.classList.remove("is-filled");
    heroMediaEl.innerHTML = "";
    placeholderNodes.forEach((node) => heroMediaEl.appendChild(node));
  }


  /* ========================================
   * 3. MEDIA SLOT REPLACEMENT (for other slots)
   * ======================================== */

  function fillMediaSlot(container, media) {
    container.classList.add("is-filled");
    container.innerHTML = "";

    if (media.type === "video") {
      const video = document.createElement("video");
      video.src = media.src;
      video.autoplay = media.autoplay !== false;
      video.muted = media.muted !== false;
      video.loop = media.loop !== false;
      video.controls = media.controls === true;
      video.playsInline = true;
      video.setAttribute("playsinline", "");
      video.preload = media.preload || "metadata";
      if (media.poster) video.poster = media.poster;
      container.appendChild(video);
    } else if (media.type === "image") {
      const img = document.createElement("img");
      img.src = media.src;
      img.alt = media.alt || "";
      if (media.loading !== false) img.loading = "lazy";
      container.appendChild(img);
    }
  }

  /* 喇叭 SVG 图标（volume-on / volume-off 两条 path 组，随 muted 状态切换） */
  const speakerIcons = {
    on: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'
      + '<path d="M11 5 6 9H2v6h4l5 4V5z"/>'
      + '<path d="M15.5 8.5a5 5 0 0 1 0 7"/>'
      + '<path d="M18.5 5.5a9 9 0 0 1 0 13"/>'
      + '</svg>',
    off: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'
      + '<path d="M11 5 6 9H2v6h4l5 4V5z"/>'
      + '<path d="m16 9 6 6"/><path d="m22 9-6 6"/>'
      + '</svg>'
  };

  /**
   * 九州演示视频：视口播放控制
   * - 默认 muted；移除 autoplay 属性，播放完全由 IntersectionObserver 驱动
   * - threshold 0.5：视频 ≥50% 进入 viewport → play()；离开阈值 → pause()
   * - 不修改 currentTime：再次进入从暂停位置继续
   * - play() rejection（如加载策略限制）静默处理，不抛 blocking error
   */
  function setupJiuzhouViewportPlayback(container) {
    const video = container.querySelector("video");
    if (!video) return;

    video.muted = true;
    video.removeAttribute("autoplay");
    video.autoplay = false;

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const p = video.play();
              if (p && p.catch) p.catch(() => {});
            } else {
              video.pause();
            }
          });
        },
        { threshold: 0.5 }
      );
      observer.observe(video);
    } else {
      // 无 IO 支持时降级为静音循环自动播放
      video.autoplay = true;
      const p = video.play();
      if (p && p.catch) p.catch(() => {});
    }
  }

  /**
   * 九州演示视频：右下角 SVG 喇叭 overlay 按钮
   * - muted / unmuted 图标同步（重渲染 innerHTML，由 .is-muted 控制显隐）
   * - aria-pressed / aria-label 同步
   * - Desktop 显隐由 CSS（container hover / focus-within）控制
   */
  function addJiuzhouAudioToggle(container) {
    const video = container.querySelector("video");
    if (!video) return;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "exp-demo__audio-toggle";

    const syncState = () => {
      const isMuted = video.muted;
      button.classList.toggle("is-muted", isMuted);
      button.innerHTML = isMuted ? speakerIcons.off : speakerIcons.on;
      button.setAttribute("aria-label", isMuted ? "开启九州演示视频声音" : "静音九州演示视频");
      button.setAttribute("aria-pressed", String(!isMuted));
    };

    button.addEventListener("click", () => {
      video.muted = !video.muted;
      syncState();
    });
    video.addEventListener("volumechange", syncState);

    syncState();
    container.appendChild(button);
  }

  function renderMediaSlots() {
    // 同上：classic script 顶层 const 不会挂到 window
    const D = typeof SITE_DATA !== "undefined" ? SITE_DATA : null;
    if (!D || !D.media) return;

    // Find all slot containers in the page
    const slotContainers = document.querySelectorAll("[data-slot-id]");
    slotContainers.forEach((container) => {
      const slotId = container.getAttribute("data-slot-id");

      // Skip hero (handled separately)
      if (slotId === "hero-background") return;

      const media = D.media[slotId];
      if (!media || media.type === "placeholder") return;

      // If this is a media-slot inside a gallery item, fill the media-slot itself
      // Otherwise fill the container
      const target = container.classList.contains("media-slot")
        ? container
        : container.querySelector(".media-slot") || container;

      fillMediaSlot(target, media);
      if (slotId === "exp-jiuzhou-demo") {
        setupJiuzhouViewportPlayback(target);
        addJiuzhouAudioToggle(target);
      }
    });
  }


  /* ========================================
   * 4. REVEAL ANIMATION
   * ======================================== */

  function initReveal() {
    const elements = document.querySelectorAll(".reveal");
    if (!elements.length) return;

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
      );
      elements.forEach((el) => observer.observe(el));

      // Safety fallback: after 2s, show any elements that IO hasn't triggered
      // (useful for headless screenshots, slow scroll, or broken observers)
      setTimeout(() => {
        elements.forEach((el) => {
          if (!el.classList.contains("is-visible")) {
            el.classList.add("is-visible");
          }
        });
      }, 2000);
    } else {
      // Fallback for old browsers / no IntersectionObserver
      elements.forEach((el) => el.classList.add("is-visible"));
    }
  }


  /* ========================================
   * 5. FILM MODAL — 单实例 Lightbox 播放器
   * ========================================
   * 触发：.film__cta[data-film] 点击（事件委托）
   * 数据：SITE_DATA.aigcWorks.items 按 id 查找，
   *       视频源取 media[item.videoSlotId]。
   * 视频为 placeholder 时显示占位态（不产生 broken source）。
   * 关闭：ESC / 遮罩点击 / Close 按钮；关闭时暂停并清空 video。
   */

  function initFilmModal() {
    const modal = document.querySelector(".film-modal");
    if (!modal) return;

    const titleEl = modal.querySelector(".film-modal__title");
    const closeBtn = modal.querySelector(".film-modal__close");
    const stage = modal.querySelector(".film-modal__stage");
    if (!titleEl || !closeBtn || !stage) return;

    // classic script 顶层 const 不挂 window，直接引用
    const D = typeof SITE_DATA !== "undefined" ? SITE_DATA : null;
    let lastFocused = null;

    function closeModal() {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("is-film-modal-open");
      // 暂停并清空 video，释放资源
      stage.innerHTML = "";
      if (lastFocused && typeof lastFocused.focus === "function") {
        lastFocused.focus();
        lastFocused = null;
      }
    }

    function openModal(item) {
      // 标题：作品名 + 类型/年份
      const metaParts = [item.type, item.year].filter(Boolean);
      titleEl.innerHTML = "";
      titleEl.appendChild(document.createTextNode(item.title || ""));
      if (metaParts.length) {
        const small = document.createElement("small");
        small.textContent = metaParts.join(" · ");
        titleEl.appendChild(small);
      }

      stage.innerHTML = "";

      const videoMedia = D && D.media ? D.media[item.videoSlotId] : null;

      if (videoMedia && videoMedia.type === "video" && videoMedia.src) {
        const video = document.createElement("video");
        video.src = videoMedia.src;
        video.controls = true;
        video.autoplay = true;
        video.playsInline = true;
        video.setAttribute("playsinline", "");
        video.preload = "metadata";
        if (videoMedia.poster) video.poster = videoMedia.poster;
        video.style.width = "100%";
        video.style.height = "100%";
        stage.appendChild(video);
        const p = video.play();
        if (p && p.catch) p.catch(() => {});
      } else {
        // Placeholder 态：视频源未接入
        const ph = document.createElement("div");
        ph.className = "film-modal__placeholder";

        const mark = document.createElement("span");
        mark.className = "film-modal__placeholder-mark";
        mark.textContent = "DEMO COMING SOON";

        const note = document.createElement("p");
        note.className = "film-modal__placeholder-note";
        note.textContent = "视频源待接入（site-data.js media[\""
          + (item.videoSlotId || "") + "\"]）";

        ph.appendChild(mark);
        ph.appendChild(note);
        stage.appendChild(ph);
      }

      lastFocused = document.activeElement;
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("is-film-modal-open");
      closeBtn.focus();
    }

    // 事件委托：所有 .film__cta[data-film]
    document.addEventListener("click", (e) => {
      const trigger = e.target.closest("[data-film]");
      if (!trigger) return;
      e.preventDefault();
      if (!D || !D.aigcWorks || !Array.isArray(D.aigcWorks.items)) return;
      const item = D.aigcWorks.items.find(
        (it) => it.id === trigger.getAttribute("data-film")
      );
      if (item) openModal(item);
    });

    // 关闭：按钮 / ESC / 遮罩（点击 modal 自身而非内容区）
    closeBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("is-open")) {
        closeModal();
      }
    });
  }


  /* ========================================
   * 6. INIT
   * ======================================== */

  function init() {
    renderHeroMedia();
    renderMediaSlots();
    initReveal();
    initFilmModal();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
