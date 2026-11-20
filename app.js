/* ==========================================================================
   原初的失乐园：《普罗玛西亚的咒缚》交互脚本
   - 勒温动态 SVG 生活空间导视（约旦曲线实时变形）
   - 滚动触发 CoP 6 大空间明暗切换 & 五母水晶进度
   - 原位非跳转注释卡（悬停预览 + 点击展开）
   - 20 图一手实机取景框灯箱（支持拓扑场域筛选与键盘翻页）
   - 极轻量空间微粒子画布 & 专注阅读模式
   ========================================================================== */

(function () {
  "use strict";

  const LEWIN_TELEMETRY = {
    prologue:  { barrier: 50, bTxt: "分化", fluidity: 32, fTxt: "初分", time: 24, tTxt: "创世", px: 120, py: 78, toast: "进入「原初分化」：母水晶碎裂为五，幽暗根据撑开个体边界。" },
    promyvion: { barrier: 12, bTxt: "破裂", fluidity: 74, fTxt: "解离", time: 10, tTxt: "停滞", px: 126, py: 54, toast: "穿越边界 → 普罗米翁解离场：防刺激保护层破裂，坐标失效。" },
    tavnazia:  { barrier: 78, bTxt: "有界", fluidity: 28, fTxt: "抱持", time: 46, tTxt: "喘息", px: 120, py: 80, toast: "穿越边界 → 塔布纳基亚地下壕：三层岩穴分化，天井迎纳海风。" },
    stone:     { barrier: 92, bTxt: "高阻", fluidity: 18, fTxt: "凝滞", time: 58, tTxt: "30m",  px: 136, py: 68, toast: "穿越边界 → 高阻力路径空间：重力、瘴气与倒计时中的真实位移。" },
    altaieu:   { barrier: 6,  bTxt: "溶解", fluidity: 96, fTxt: "流态", time: 16, tTxt: "归零", px: 120, py: 78, toast: "穿越边界 → 天上之海流态去分化：边框消融，自我边界趋于溶解。" },
    dawn:      { barrier: 64, bTxt: "锚定", fluidity: 42, fTxt: "对位", time: 72, tTxt: "决断", px: 120, py: 52, toast: "穿越边界 → 天象之锁：俯瞰库菲姆大地，凡人战线击退求死之神。" },
    meadow:    { barrier: 58, bTxt: "弹性", fluidity: 36, fTxt: "澄明", time: 96, tTxt: "敞开", px: 186, py: 78, toast: "穿越边界 → 吕费斯草地：胸口矿石消溶，时间展望重新向未来敞开。" }
  };

  let toastTimer = null;
  let hasInitializedZone = false;
  function showBoundaryToast(zoneKey) {
    if (!hasInitializedZone) { hasInitializedZone = true; return; }
    if (document.body.getAttribute("data-focus") === "true") return;
    const toast = document.getElementById("boundary-toast");
    const t = LEWIN_TELEMETRY[zoneKey];
    const z = ZONES[zoneKey];
    if (!toast || !t || !z) return;
    toast.innerHTML = "<strong>" + z.lewinTitle + "</strong>" + t.toast;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 3400);
  }

  function updateLewinTelemetry(zoneKey) {
    const t = LEWIN_TELEMETRY[zoneKey] || LEWIN_TELEMETRY.prologue;
    const mb = document.getElementById("meter-barrier");
    const mf = document.getElementById("meter-fluidity");
    const mt = document.getElementById("meter-time");
    if (mb) mb.style.width = t.barrier + "%";
    if (mf) mf.style.width = t.fluidity + "%";
    if (mt) mt.style.width = t.time + "%";
    const vb = document.getElementById("val-barrier");
    const vf = document.getElementById("val-fluidity");
    const vt = document.getElementById("val-time");
    if (vb) vb.textContent = t.bTxt;
    if (vf) vf.textContent = t.fTxt;
    if (vt) vt.textContent = t.tTxt;
    const pDot = document.getElementById("lewin-person-dot");
    if (pDot) pDot.setAttribute("transform", `translate(${t.px}, ${t.py})`);
    document.querySelectorAll(".compass-node").forEach((btn) => {
      const zj = btn.getAttribute("data-zone-jump");
      btn.classList.toggle("active", zj === zoneKey || (zoneKey === "dawn" && zj === "altaieu"));
    });
  }

  document.querySelectorAll(".compass-node").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      const el = targetId && document.getElementById(targetId);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    });
  });

  const ZONES = {
    prologue: {
      label: "序章 · 瓦纳迪尔创世",
      coord: "PROLOGUE · E-8",
      ost: "Memoro de la Ŝtono",
      ostUrl: "https://www.jp.square-enix.com/music/en/lineup/item/SQEX-10041.html",
      lewinTitle: "原初同一体与个体根据",
      lewinDesc: "单一母水晶碎裂为五，幽暗“根据”撑开凡人容器的独立边界。",
      crystals: 1
    },
    promyvion: {
      label: "普罗米翁 · 创伤解离场",
      coord: "PROMYVION · ???",
      ost: "Faded Memories - Promyvion",
      ostUrl: "https://www.jp.square-enix.com/music/en/lineup/item/SQEX-10041.html",
      lewinTitle: "解离场（保护层破裂）",
      lewinDesc: "外部界膜断裂、图形/背景瓦解；反博物学的灰白虚空无法定位。",
      crystals: 1
    },
    tavnazia: {
      label: "塔布纳基亚地下壕 · 岩石摇篮",
      coord: "TAVNAZIA · 2F 天井",
      ost: "The Forgotten City - Tavnazian Safehold",
      ostUrl: "https://www.jp.square-enix.com/music/en/lineup/item/SQEX-10041.html",
      lewinTitle: "三层岩穴（有界抱持空间）",
      lewinDesc: "3F 高阻抗胡桃木门 / 2F 露天天井通透口 / 1F 地窖怨灵与双锁。",
      crystals: 2
    },
    stone: {
      label: "胸中矿石 · 帕拉达莫之丘",
      coord: "ATTOHWA · K-8 骨山",
      ost: "The Road Forks / One to be Feared",
      ostUrl: "https://www.jp.square-enix.com/music/en/lineup/item/SQEX-10041.html",
      lewinTitle: "高阻力路径空间（Hodological）",
      lewinDesc: "重力、瘴气与 30 分钟倒计时下的真实位移；由石蜕羽的微缩炼金。",
      crystals: 3
    },
    altaieu: {
      label: "阿尔·塔伊尤 · 天上之海",
      coord: "AL'TAIEU · 无重力海",
      ost: "The Celestial Capital - Al'Taieu",
      ostUrl: "https://www.jp.square-enix.com/music/en/lineup/item/SQEX-10041.html",
      lewinTitle: "极端流态去分化（Fluidity）",
      lewinDesc: "内部边界彻底羽化溶解；自我边界与食物链相克归零的纯白监牢。",
      crystals: 4
    },
    dawn: {
      label: "天象之锁 · 《晓》",
      coord: "EMPYREAL PARADOX",
      ost: "Dusk and Dawn",
      ostUrl: "https://www.jp.square-enix.com/music/en/lineup/item/SQEX-10041.html",
      lewinTitle: "大地锚定与复数战线",
      lewinDesc: "俯瞰库菲姆荒岛，在普利修可复活的凡人脆弱战线中击退求死之神。",
      crystals: 5
    },
    meadow: {
      label: "吕费斯草地 · 玫瑰色晨光",
      coord: "LUFAISE · 青草之丘",
      ost: "Distant Worlds",
      ostUrl: "https://www.jp.square-enix.com/music/en/lineup/item/SQEX-10041.html",
      lewinTitle: "时间展望重开（Time Perspective）",
      lewinDesc: "胸中矿石消溶，边界清晰而富于弹性，具身位移重新向未来敞开。",
      crystals: 5
    }
  };

  /* ------------------------------------------------------------------------
     1. 勒温动态 SVG 约旦曲线切换
     ------------------------------------------------------------------------ */
  function updateLewinDiagram(zoneKey) {
    const groups = document.querySelectorAll(".lewin-layer");
    groups.forEach((g) => {
      const isMatch = g.getAttribute("data-layer") === zoneKey;
      g.style.opacity = isMatch ? "1" : "0.08";
      g.style.transform = isMatch ? "scale(1)" : "scale(0.97)";
    });
    const info = ZONES[zoneKey] || ZONES.prologue;
    const titleEl = document.getElementById("lewin-title");
    const descEl = document.getElementById("lewin-desc");
    const zoneLabelEl = document.getElementById("topbar-zone-label");
    const coordEl = document.getElementById("topbar-zone-coord");
    const ostLinkEl = document.getElementById("topbar-ost-link");

    if (titleEl) titleEl.textContent = info.lewinTitle;
    if (descEl) descEl.textContent = info.lewinDesc;
    if (zoneLabelEl) zoneLabelEl.textContent = info.label;
    if (coordEl) coordEl.textContent = info.coord;
    if (ostLinkEl) {
      ostLinkEl.textContent = "♪ " + info.ost;
      ostLinkEl.href = info.ostUrl;
    }

    updateLewinTelemetry(zoneKey);
    showBoundaryToast(zoneKey);

    // 点亮五块母水晶
    document.querySelectorAll(".mc-node").forEach((node, idx) => {
      node.classList.toggle("lit", idx < info.crystals);
    });
  }

  /* ------------------------------------------------------------------------
     2. 滚动侦测（明暗场域切换 + 目录高亮 + 阅读进度条）
     ------------------------------------------------------------------------ */
  let currentZone = "prologue";
  const sections = Array.from(document.querySelectorAll("section[data-zone]"));
  const tocLinks = Array.from(document.querySelectorAll(".toc-link"));
  const progressFill = document.getElementById("crystal-progress-fill");

  function onScroll() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
    if (progressFill) progressFill.style.width = pct.toFixed(2) + "%";

    const anchorY = scrollTop + window.innerHeight * 0.32;
    let activeSec = sections[0];
    for (const sec of sections) {
      if (sec.offsetTop <= anchorY) {
        activeSec = sec;
      }
    }
    if (activeSec) {
      const z = activeSec.getAttribute("data-zone");
      if (z && z !== currentZone) {
        currentZone = z;
        document.body.setAttribute("data-zone", z);
        updateLewinDiagram(z);
      }
      const id = activeSec.getAttribute("id");
      tocLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === "#" + id);
      });
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  updateLewinDiagram("prologue");

  /* ------------------------------------------------------------------------
     3. 顶栏与侧栏交互（专注模式、打印、移动端目录、中英摘要切换）
     ------------------------------------------------------------------------ */
  const focusBtn = document.getElementById("btn-focus");
  if (focusBtn) {
    focusBtn.addEventListener("click", () => {
      const isFocus = document.body.getAttribute("data-focus") === "true";
      const nextFocus = !isFocus;
      document.body.setAttribute("data-focus", nextFocus ? "true" : "false");
      focusBtn.setAttribute("aria-pressed", nextFocus ? "true" : "false");
      const deskLabel = focusBtn.querySelector(".label-desktop");
      const mobLabel = focusBtn.querySelector(".label-mobile");
      if (deskLabel) deskLabel.textContent = nextFocus ? "恢复拓扑场域" : "专注阅读";
      if (mobLabel) mobLabel.textContent = nextFocus ? "场域" : "专注";
    });
  }

  const printBtn = document.getElementById("btn-print");
  if (printBtn) {
    printBtn.addEventListener("click", () => window.print());
  }

  const railToggle = document.getElementById("btn-rail-toggle");
  const railClose = document.getElementById("btn-rail-close");
  const railBackdrop = document.getElementById("rail-backdrop");
  const railEl = document.getElementById("topo-rail");

  function setRailOpen(open) {
    if (!railEl) return;
    railEl.classList.toggle("open", open);
    if (railBackdrop) railBackdrop.classList.toggle("open", open);
    if (window.innerWidth <= 960) {
      document.body.style.overflow = open ? "hidden" : "";
    }
  }

  if (railToggle && railEl) {
    railToggle.addEventListener("click", () => setRailOpen(!railEl.classList.contains("open")));
    if (railClose) railClose.addEventListener("click", () => setRailOpen(false));
    if (railBackdrop) railBackdrop.addEventListener("click", () => setRailOpen(false));
    tocLinks.forEach((l) => l.addEventListener("click", () => setRailOpen(false)));
  }

  // 五母水晶快捷跳转
  document.querySelectorAll(".mc-node").forEach((btn) => {
    btn.addEventListener("click", () => {
      setRailOpen(false);
      const targetId = btn.getAttribute("data-target");
      const el = targetId && document.getElementById(targetId);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    });
  });

  // 勒温 SVG 区域点击跳转
  document.querySelectorAll(".lewin-layer").forEach((g) => {
    g.addEventListener("click", () => {
      setRailOpen(false);
      const targetId = g.getAttribute("data-target");
      const el = targetId && document.getElementById(targetId);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    });
  });

  // 中英摘要切换
  const absTabs = document.querySelectorAll(".abstract-tab");
  const absPanels = document.querySelectorAll(".abstract-panel");
  absTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const mode = tab.getAttribute("data-abs");
      absTabs.forEach((t) => t.classList.toggle("active", t === tab));
      absPanels.forEach((p) => {
        if (mode === "both") {
          p.classList.add("active");
        } else {
          p.classList.toggle("active", p.getAttribute("data-panel") === mode);
        }
      });
    });
  });

  /* ------------------------------------------------------------------------
     4. 原位非跳转注释卡（悬停预览 + 点击原位展开）
     ------------------------------------------------------------------------ */
  const tooltip = document.getElementById("fn-hover-tooltip");

  document.querySelectorAll(".fn-trigger").forEach((btn) => {
    const noteId = btn.getAttribute("data-note");
    const sourceEl = noteId && document.getElementById(noteId);
    if (!sourceEl) return;

    // 创建原位展开卡（紧随所在段落之后）
    const parentP = btn.closest("p, li");
    let inlineCard = null;

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (tooltip) tooltip.classList.remove("visible");

      if (!inlineCard) {
        inlineCard = document.createElement("div");
        inlineCard.className = "fn-inline-card";
        inlineCard.innerHTML =
          '<button type="button" class="fn-close" aria-label="关闭注释">✕ 收起</button>' +
          sourceEl.innerHTML;
        inlineCard.querySelector(".fn-close").addEventListener("click", () => {
          inlineCard.classList.remove("open");
          btn.setAttribute("aria-expanded", "false");
        });
        if (parentP && parentP.parentNode) {
          parentP.parentNode.insertBefore(inlineCard, parentP.nextSibling);
        }
      }
      const willOpen = !inlineCard.classList.contains("open");
      inlineCard.classList.toggle("open", willOpen);
      btn.setAttribute("aria-expanded", willOpen ? "true" : "false");
    });

    // 桌面端悬停预览
    btn.addEventListener("mouseenter", () => {
      if (!tooltip || window.innerWidth < 768) return;
      tooltip.innerHTML = sourceEl.innerHTML;
      const rect = btn.getBoundingClientRect();
      const top = Math.min(window.innerHeight - 160, Math.max(66, rect.bottom + 8));
      const left = Math.min(window.innerWidth - 400, Math.max(16, rect.left - 80));
      tooltip.style.top = top + "px";
      tooltip.style.left = left + "px";
      tooltip.classList.add("visible");
    });

    btn.addEventListener("mouseleave", () => {
      if (tooltip) tooltip.classList.remove("visible");
    });
  });

  /* ------------------------------------------------------------------------
     5. 全屏取景框灯箱（支持拓扑场域筛选与键盘 ← / → / Esc 翻页）
     ------------------------------------------------------------------------ */
  const allFigures = Array.from(document.querySelectorAll(".figure-card[data-src]"));
  const lightbox = document.getElementById("lightbox");
  const lbImg = document.getElementById("lb-img");
  const lbMeta = document.getElementById("lb-meta");
  const lbCap = document.getElementById("lb-caption");
  const lbFilterBtns = Array.from(document.querySelectorAll(".lb-filter-btn"));

  let filteredFigures = allFigures.slice();
  let currentIdx = 0;

  function renderLightbox() {
    if (!filteredFigures.length) return;
    const fig = filteredFigures[currentIdx];
    lbImg.src = fig.getAttribute("data-src");
    lbImg.alt = fig.getAttribute("data-title") || "";
    const tag = fig.getAttribute("data-topo") || "";
    const title = fig.getAttribute("data-title") || "";
    lbMeta.textContent = `[${currentIdx + 1} / ${filteredFigures.length}]  ${tag} · ${title}`;
    const capEl = fig.querySelector(".figure-caption");
    lbCap.innerHTML = capEl ? capEl.innerHTML : title;
  }

  function openLightbox(targetFig) {
    filteredFigures = allFigures.slice();
    lbFilterBtns.forEach((b) => b.classList.toggle("active", b.getAttribute("data-filter") === "all"));
    currentIdx = Math.max(0, filteredFigures.indexOf(targetFig));
    renderLightbox();
    lightbox.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.classList.remove("open");
    document.body.style.overflow = "";
  }

  allFigures.forEach((fig) => {
    const frame = fig.querySelector(".figure-frame");
    if (frame) {
      frame.addEventListener("click", () => openLightbox(fig));
    }
  });

  const atlasBtn = document.getElementById("btn-open-atlas");
  if (atlasBtn && allFigures.length) {
    atlasBtn.addEventListener("click", () => {
      setRailOpen(false);
      openLightbox(allFigures[0]);
    });
  }

  const lbClose = document.getElementById("lb-close");
  const lbPrev = document.getElementById("lb-prev");
  const lbNext = document.getElementById("lb-next");
  if (lbClose) lbClose.addEventListener("click", closeLightbox);
  if (lbPrev) {
    lbPrev.addEventListener("click", () => {
      currentIdx = (currentIdx - 1 + filteredFigures.length) % filteredFigures.length;
      renderLightbox();
    });
  }
  if (lbNext) {
    lbNext.addEventListener("click", () => {
      currentIdx = (currentIdx + 1) % filteredFigures.length;
      renderLightbox();
    });
  }

  // 移动端灯箱左右滑动切换
  const lbStage = document.querySelector(".lb-stage");
  let touchStartX = 0;
  let touchStartY = 0;
  if (lbStage) {
    lbStage.addEventListener("touchstart", (e) => {
      if (e.touches.length !== 1) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    lbStage.addEventListener("touchend", (e) => {
      if (!e.changedTouches.length) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) > 42 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        currentIdx = dx < 0
          ? (currentIdx + 1) % filteredFigures.length
          : (currentIdx - 1 + filteredFigures.length) % filteredFigures.length;
        renderLightbox();
      }
    }, { passive: true });
  }

  lbFilterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const f = btn.getAttribute("data-filter");
      lbFilterBtns.forEach((b) => b.classList.toggle("active", b === btn));
      filteredFigures =
        f === "all"
          ? allFigures.slice()
          : allFigures.filter((fig) => fig.getAttribute("data-field") === f);
      currentIdx = 0;
      renderLightbox();
    });
  });

  document.addEventListener("keydown", (e) => {
    if (!lightbox || !lightbox.classList.contains("open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") {
      currentIdx = (currentIdx - 1 + filteredFigures.length) % filteredFigures.length;
      renderLightbox();
    }
    if (e.key === "ArrowRight") {
      currentIdx = (currentIdx + 1) % filteredFigures.length;
      renderLightbox();
    }
  });

  /* ------------------------------------------------------------------------
     6. 极轻量空间微粒子画布（随拓扑场域调整漂浮方向与速率）
     ------------------------------------------------------------------------ */
  const canvas = document.getElementById("ambient-canvas");
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext("2d");
    let w = 0, h = 0;
    const particles = Array.from({ length: 28 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 1 + Math.random() * 1.8,
      vx: (Math.random() - 0.5) * 0.00025,
      vy: (Math.random() - 0.5) * 0.00025
    }));

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    function tick() {
      if (document.body.getAttribute("data-focus") !== "true") {
        ctx.clearRect(0, 0, w, h);
        const col = getComputedStyle(document.body).getPropertyValue("--particle-color").trim() || "rgba(150,150,150,0.15)";
        ctx.fillStyle = col;
        for (const p of particles) {
          if (currentZone === "altaieu") {
            p.y -= 0.00035; // 天上之海：胶质光点缓慢上浮
          } else if (currentZone === "tavnazia") {
            p.y += 0.00032; // 地下壕天井：微凉雨雾缓落
          } else {
            p.x += p.vx;
            p.y += p.vy;
          }
          if (p.x < 0) p.x = 1;
          if (p.x > 1) p.x = 0;
          if (p.y < 0) p.y = 1;
          if (p.y > 1) p.y = 0;
          ctx.beginPath();
          ctx.arc(p.x * w, p.y * h, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
})();
