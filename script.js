document.addEventListener("DOMContentLoaded", () => {
  /* ----------------------------------------------------------------------
     A. HEADER SCROLL & MOBILE MENU TOGGLE
     ---------------------------------------------------------------------- */
  const header = document.getElementById("header");
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("nav-links");
  const navLinkItems = document.querySelectorAll(".nav-link");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });

  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("open");
      navLinks.classList.toggle("open");
    });

    navLinkItems.forEach(link => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("open");
        navLinks.classList.remove("open");
      });
    });
  }

  /* ----------------------------------------------------------------------
     B. HERO STAGGERED TEXT LOAD ANIMATION (0.2s interval)
     ---------------------------------------------------------------------- */
  const staggerItems = document.querySelectorAll(".stagger-item");
  staggerItems.forEach((item, index) => {
    setTimeout(() => {
      item.classList.add("loaded");
    }, 150 + index * 200);
  });

  /* ----------------------------------------------------------------------
     C. INTERSECTION OBSERVER FOR SECTION REVEALS (translateY:30px->0)
     ---------------------------------------------------------------------- */
  const revealElements = document.querySelectorAll(".reveal");
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: "0px 0px -40px 0px"
  });

  revealElements.forEach(el => revealObserver.observe(el));

  /* ----------------------------------------------------------------------
     D. FILMSTRIP HORIZONTAL SCROLL (MOUSE DRAG & WHEEL)
     ---------------------------------------------------------------------- */
  const filmstrip = document.getElementById("filmstrip");
  if (filmstrip) {
    let isDown = false;
    let startX;
    let scrollLeft;

    filmstrip.addEventListener("mousedown", (e) => {
      isDown = true;
      startX = e.pageX - filmstrip.offsetLeft;
      scrollLeft = filmstrip.scrollLeft;
    });

    filmstrip.addEventListener("mouseleave", () => {
      isDown = false;
    });

    filmstrip.addEventListener("mouseup", () => {
      isDown = false;
    });

    filmstrip.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - filmstrip.offsetLeft;
      const walk = (x - startX) * 1.8; // Scroll sensitivity multiplier
      filmstrip.scrollLeft = scrollLeft - walk;
    });

    // Wheel support for horizontal scroll when hovering filmstrip
    filmstrip.addEventListener("wheel", (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        filmstrip.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    }, { passive: false });
  }
  /* -------------------------------------------
     5. Hero SVG Particle Animation
  ------------------------------------------- */
  const svg = document.getElementById("particle-svg");
  const svgNS = "http://www.w3.org/2000/svg";
  
  const particleCount = 25;
  const connectionDistance = 150;
  const particles = [];
  const lines = [];
  
  const colors = ["#e07a30", "#c9973a"]; // Accent & Amber
  
  // マウス位置
  let mouse = { x: -1000, y: -1000 };
  
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  // ウィンドウサイズに応じたSVGの更新用
  let width = window.innerWidth;
  let height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = window.innerWidth;
    height = window.innerHeight;
  });

  // パーティクル初期化
  for (let i = 0; i < particleCount; i++) {
    const p = {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5, // ゆっくり浮遊
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 1.5 + 1, // 半径1〜2.5px
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: Math.random() * 0.2 + 0.3, // 0.3〜0.5
      element: document.createElementNS(svgNS, "circle")
    };
    
    p.element.setAttribute("r", p.radius);
    p.element.setAttribute("fill", p.color);
    p.element.setAttribute("opacity", p.opacity);
    svg.appendChild(p.element);
    particles.push(p);
  }

  // アニメーションループ
  function animateParticles() {
    // 既存の線をクリア
    while (lines.length > 0) {
      const line = lines.pop();
      svg.removeChild(line);
    }

    // 位置更新
    for (let i = 0; i < particleCount; i++) {
      const p = particles[i];

      // マウス引力（カーソルに微かに引き寄せられる）
      const dxMouse = mouse.x - p.x;
      const dyMouse = mouse.y - p.y;
      const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
      
      if (distMouse < 200) {
        p.vx += (dxMouse / distMouse) * 0.02;
        p.vy += (dyMouse / distMouse) * 0.02;
      }

      // 摩擦（速度制限）
      p.vx *= 0.99;
      p.vy *= 0.99;

      // 最低速度の維持
      if (Math.abs(p.vx) < 0.1) p.vx += (Math.random() - 0.5) * 0.1;
      if (Math.abs(p.vy) < 0.1) p.vy += (Math.random() - 0.5) * 0.1;

      p.x += p.vx;
      p.y += p.vy;

      // 画面端のバウンド
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      p.element.setAttribute("cx", p.x);
      p.element.setAttribute("cy", p.y);

      // 線を描画
      for (let j = i + 1; j < particleCount; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < connectionDistance) {
          const line = document.createElementNS(svgNS, "line");
          line.setAttribute("x1", p.x);
          line.setAttribute("y1", p.y);
          line.setAttribute("x2", p2.x);
          line.setAttribute("y2", p2.y);
          line.setAttribute("stroke", "#e07a30"); // アクセント色
          line.setAttribute("stroke-width", "0.5");
          // 距離に応じて透明度を変化（最大 0.12）
          const lineOpacity = 0.12 * (1 - dist / connectionDistance);
          line.setAttribute("stroke-opacity", lineOpacity);
          
          svg.insertBefore(line, svg.firstChild); // 円より奥に配置
          lines.push(line);
        }
      }
    }
    requestAnimationFrame(animateParticles);
  }

  animateParticles();
});