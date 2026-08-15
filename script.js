document.addEventListener("DOMContentLoaded", () => {
  /* -------------------------------------------
     1. Header Scroll Effect
  ------------------------------------------- */
  const header = document.getElementById("header");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });

  /* -------------------------------------------
     2. Hero Stagger Animation on Load
  ------------------------------------------- */
  const staggerElems = document.querySelectorAll(".stagger-elem");
  staggerElems.forEach((elem, index) => {
    setTimeout(() => {
      elem.style.transition = "opacity 0.8s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)";
      elem.style.opacity = "1";
      elem.style.transform = "translateY(0)";
    }, index * 200 + 100);
  });

  /* -------------------------------------------
     3. Scroll Fade In (Intersection Observer)
  ------------------------------------------- */
  const fadeElements = document.querySelectorAll('.fade-in');
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

  fadeElements.forEach(el => observer.observe(el));

  /* -------------------------------------------
     4. Works Horizontal Scroll & Drag
  ------------------------------------------- */
  const scrollContainer = document.getElementById('works-scroll-container');
  let isDown = false;
  let startX;
  let scrollLeft;

  // マウスドラッグで横スクロール
  scrollContainer.addEventListener('mousedown', (e) => {
    isDown = true;
    startX = e.pageX - scrollContainer.offsetLeft;
    scrollLeft = scrollContainer.scrollLeft;
  });
  
  scrollContainer.addEventListener('mouseleave', () => {
    isDown = false;
  });
  
  scrollContainer.addEventListener('mouseup', () => {
    isDown = false;
  });
  
  scrollContainer.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - scrollContainer.offsetLeft;
    const walk = (x - startX) * 2; // スクロール速度
    scrollContainer.scrollLeft = scrollLeft - walk;
  });

  // マウスホイールの縦スクロールを横スクロールに変換
  scrollContainer.addEventListener('wheel', (e) => {
    if (e.deltaY !== 0) {
      e.preventDefault();
      scrollContainer.scrollLeft += e.deltaY;
    }
  });

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