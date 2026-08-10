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

  /* ----------------------------------------------------------------------
     E. HERO SVG PARTICLE ANIMATION (25 Circles + Distance Connections + Mouse Attraction)
     ---------------------------------------------------------------------- */
  const svg = document.getElementById("hero-svg-bg");
  if (svg) {
    const NUM_PARTICLES = 25;
    const MAX_DIST = 150;
    const MOUSE_ATTRACT_DIST = 220;
    const ACCENT_COLOR = "#e07a30";
    const AMBER_COLOR = "#c9973a";

    let width = svg.clientWidth || window.innerWidth;
    let height = svg.clientHeight || window.innerHeight;

    window.addEventListener("resize", () => {
      width = svg.clientWidth || window.innerWidth;
      height = svg.clientHeight || window.innerHeight;
    });

    let mouse = { x: -1000, y: -1000 };
    window.addEventListener("mousemove", (e) => {
      const rect = svg.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });

    // Particle class
    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.65;
        this.vy = (Math.random() - 0.5) * 0.65;
        this.r = 1 + Math.random() * 1.5; // Radius 1〜2.5px
        this.color = Math.random() > 0.5 ? ACCENT_COLOR : AMBER_COLOR;
        this.opacity = 0.3 + Math.random() * 0.2; // Opacity 0.3〜0.5

        // Create SVG circle element
        this.el = document.createElementNS(SVG_NS, "circle");
        this.el.setAttribute("r", this.r);
        this.el.setAttribute("fill", this.color);
        this.el.setAttribute("fill-opacity", this.opacity);
        svg.appendChild(this.el);
      }

      update() {
        // Subtle mouse attraction
        const dxMouse = mouse.x - this.x;
        const dyMouse = mouse.y - this.y;
        const distMouse = Math.hypot(dxMouse, dyMouse);

        if (distMouse < MOUSE_ATTRACT_DIST && distMouse > 5) {
          this.vx += (dxMouse / distMouse) * 0.015;
          this.vy += (dyMouse / distMouse) * 0.015;
        }

        // Damping to avoid excessive speed
        this.vx *= 0.99;
        this.vy *= 0.99;

        this.x += this.vx;
        this.y += this.vy;

        // Wrap around screen boundaries
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;

        // Render circle position
        this.el.setAttribute("cx", this.x);
        this.el.setAttribute("cy", this.y);
      }
    }

    // Initialize particles and SVG line pool
    const particles = [];
    for (let i = 0; i < NUM_PARTICLES; i++) {
      particles.push(new Particle());
    }

    // Line group for connecting lines
    const lineGroup = document.createElementNS(SVG_NS, "g");
    svg.insertBefore(lineGroup, svg.firstChild);

    function animate() {
      // Clear previous connection lines
      while (lineGroup.firstChild) {
        lineGroup.removeChild(lineGroup.firstChild);
      }

      // Update particle positions
      for (let i = 0; i < NUM_PARTICLES; i++) {
        particles[i].update();
      }

      // Check pairs for connections (< 150px)
      for (let i = 0; i < NUM_PARTICLES; i++) {
        for (let j = i + 1; j < NUM_PARTICLES; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.hypot(dx, dy);

          if (dist < MAX_DIST) {
            const line = document.createElementNS(SVG_NS, "line");
            line.setAttribute("x1", particles[i].x);
            line.setAttribute("y1", particles[i].y);
            line.setAttribute("x2", particles[j].x);
            line.setAttribute("y2", particles[j].y);
            line.setAttribute("stroke", ACCENT_COLOR);
            line.setAttribute("stroke-width", "0.5");
            // Alpha fades out as distance approaches 150px (max opacity 0.12)
            const alpha = (1 - dist / MAX_DIST) * 0.12;
            line.setAttribute("stroke-opacity", alpha);
            lineGroup.appendChild(line);
          }
        }
      }

      requestAnimationFrame(animate);
    }

    animate();
  }
});