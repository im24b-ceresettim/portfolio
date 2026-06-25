'use client';

import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import UniverseBackground from "./components/UniverseBackground";
import { isOverlayScrollGuardActive, lockBodyScroll } from "./utils/lockBodyScroll";

const navItems = [
  { id: "home", label: "home", href: "/" },
  { id: "projects", label: "projects", href: "/#projects" },
  { id: "about-me", label: "about me", href: "/#about-me" },
  { id: "contact", label: "contact", href: "/#contact" },
];

const PHONE_MAX_WIDTH = 600;

const isPhoneMode = () =>
  typeof window !== "undefined" && window.innerWidth <= PHONE_MAX_WIDTH;

const isOverlayLockActive = () => {
  if (typeof document === "undefined") return false;
  const html = document.documentElement;
  return (
    html.classList.contains("lightbox-open") ||
    html.classList.contains("menu-open") ||
    isOverlayScrollGuardActive()
  );
};

export default function RootLayout({ children }) {
  const [showSun, setShowSun] = useState(true);
  const [lightmode, setLightmode] = useState(true);
  const [isHoverDisabled, setIsHoverDisabled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [pressedNavId, setPressedNavId] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "");
      if (hash) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setActiveSection(hash);
      }
    }
  }, []);

  const activeSectionRef = useRef("home");
  const isAutoScrollingRef = useRef(false);
  const isClampingRef = useRef(false);
  const animationFrameRef = useRef(null);
  const skipSettleUntilRef = useRef(0);
  const programmaticScrollUntilRef = useRef(0);
  const pendingNavScrollRef = useRef(null);
  const hasSnappedThisGestureRef = useRef(false);
  const isTouchActiveRef = useRef(false);
  const pendingTouchSettleRef = useRef(false);

  useEffect(() => {
    activeSectionRef.current = activeSection;
  }, [activeSection]);

  const stopAnimation = useCallback(() => {
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    isAutoScrollingRef.current = false;
  }, []);

  const updateUrlForSection = useCallback((sectionId) => {
    const nextUrl = sectionId === "home" ? "/" : `/#${sectionId}`;
    const currentUrl = `${window.location.pathname}${window.location.hash}`;

    if (currentUrl !== nextUrl) {
      window.history.replaceState(null, "", nextUrl);
    }
  }, []);

  const getStickyNavOffset = useCallback(() => {
    const nav = document.querySelector("nav");
    if (!nav) return 0;
    const height = nav.getBoundingClientRect().height;
    return Number.isFinite(height) ? height : 0;
  }, []);

  const scrollToSection = useCallback(
    (targetId, align = "top", behavior = "smooth") => {
      const targetSection = document.getElementById(targetId);
      if (!targetSection) return;

      stopAnimation();

      const navOffset = getStickyNavOffset();
      const topY =
        targetSection.getBoundingClientRect().top + window.scrollY - navOffset;
      const bottomY =
        targetSection.offsetTop + targetSection.offsetHeight - window.innerHeight;
      const targetY = align === "bottom" ? Math.max(topY, bottomY) : topY;

      activeSectionRef.current = targetId;
      setActiveSection(targetId);
      updateUrlForSection(targetId);

      if (behavior === "instant") {
        window.scrollTo({ top: targetY, behavior: "instant" });
        return;
      }

      isAutoScrollingRef.current = true;
      const startY = window.scrollY;
      const duration = isPhoneMode() ? 700 : 550;
      const guardUntil = performance.now() + duration + 450;
      programmaticScrollUntilRef.current = guardUntil;
      skipSettleUntilRef.current = Date.now() + duration + 450;
      const startTime = performance.now();

      const step = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        window.scrollTo(0, startY + (targetY - startY) * easedProgress);

        if (progress < 1) {
          animationFrameRef.current = window.requestAnimationFrame(step);
          return;
        }

        animationFrameRef.current = null;
        isAutoScrollingRef.current = false;
        hasSnappedThisGestureRef.current = false;
      };

      animationFrameRef.current = window.requestAnimationFrame(step);
    },
    [getStickyNavOffset, stopAnimation, updateUrlForSection]
  );

  const smoothScrollToSection = useCallback(
    (targetId, align = "top") => {
      scrollToSection(targetId, align, "smooth");
    },
    [scrollToSection]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const initialHash = window.location.hash.replace("#", "");

    if (initialHash) {
      const section = document.getElementById(initialHash);
      if (section) {
        const navOffset = getStickyNavOffset();
        const y = section.getBoundingClientRect().top + window.scrollY - navOffset;
        window.scrollTo(0, y);
      }
    }
  }, [getStickyNavOffset]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isClampingRef.current || isOverlayLockActive()) return;

        const visibleEntry = entries.find((entry) => entry.isIntersecting);
        if (!visibleEntry?.target?.id) return;

        const sectionId = visibleEntry.target.id;
        setActiveSection(sectionId);
        updateUrlForSection(sectionId);
      },
      {
        threshold: 0.6,
        rootMargin: "-64px 0px -20% 0px",
      }
    );

    navItems.forEach((item) => {
      const section = document.getElementById(item.id);
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, [updateUrlForSection]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const COMPACT_MAX_WIDTH = 1030;
    const SCROLL_EDGE_TOLERANCE = 8;
    const WHEEL_ACCUMULATE_MS = 120;
    const WHEEL_SNAP_THRESHOLD = 50;
    const SETTLE_DEBOUNCE_MS = 150;
    const TOUCH_SWIPE_THRESHOLD = 60;
    const SKIP_SETTLE_AFTER_SNAP_MS = 900;
    const SKIP_SETTLE_AFTER_TOUCH_MS = 300;
    const GESTURE_IDLE_MS = 400;
    const WHEEL_IDLE_SNAP_THRESHOLD = 25;

    const stopScrollMomentum = () => {
      window.scrollTo({ top: window.scrollY, behavior: "instant" });
    };

    const recordSnap = () => {
      skipSettleUntilRef.current = Date.now() + SKIP_SETTLE_AFTER_SNAP_MS;
    };

    const getSectionScrollBounds = (section, navOffset) => {
      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      const sectionBottom = sectionTop + section.offsetHeight;
      const minY = sectionTop - navOffset;
      const maxY = sectionBottom - window.innerHeight;
      return { minY, maxY: Math.max(minY, maxY) };
    };

    const isSectionTallerThanViewport = (section, navOffset) =>
      section.scrollHeight > window.innerHeight - navOffset + 2;

    const getActiveSection = () => document.getElementById(activeSectionRef.current);

    const isAtSectionEdge = (section, direction, navOffset) => {
      if (!section) return true;

      const viewportHeight = window.innerHeight;
      const isScrollable = section.scrollHeight > viewportHeight - navOffset + 2;
      if (!isScrollable) return true;

      const sectionTopScroll = section.getBoundingClientRect().top + window.scrollY;
      const sectionBottomScroll = sectionTopScroll + section.offsetHeight;
      const atTop =
        window.scrollY <= sectionTopScroll - navOffset + SCROLL_EDGE_TOLERANCE;
      const atBottom =
        window.scrollY + viewportHeight >=
        sectionBottomScroll - SCROLL_EDGE_TOLERANCE;

      if (direction === "down") return atBottom;
      if (direction === "up") return atTop;
      return atTop || atBottom;
    };

    const getNearestSectionId = (scrollY, navOffset) => {
      let nearestId = navItems[0].id;
      let minDistance = Infinity;

      navItems.forEach((item) => {
        const section = document.getElementById(item.id);
        if (!section) return;

        const { minY } = getSectionScrollBounds(section, navOffset);
        const distance = Math.abs(scrollY - minY);
        if (distance < minDistance) {
          minDistance = distance;
          nearestId = item.id;
        }
      });

      return nearestId;
    };

    const isInsideTallSectionBounds = (scrollY, navOffset) => {
      if (window.innerWidth > COMPACT_MAX_WIDTH) return false;

      const section = getActiveSection();
      if (!section || !isSectionTallerThanViewport(section, navOffset)) return false;

      const { minY, maxY } = getSectionScrollBounds(section, navOffset);
      return (
        scrollY >= minY - SCROLL_EDGE_TOLERANCE &&
        scrollY <= maxY + SCROLL_EDGE_TOLERANCE
      );
    };

    const syncActiveSection = (sectionId) => {
      if (activeSectionRef.current === sectionId) return;
      activeSectionRef.current = sectionId;
      setActiveSection(sectionId);
      updateUrlForSection(sectionId);
    };

    const applyClamp = (targetY, sectionId) => {
      isClampingRef.current = true;
      window.scrollTo(0, targetY);
      syncActiveSection(sectionId);
      requestAnimationFrame(() => {
        isClampingRef.current = false;
      });
    };

    const clampScrollBounds = () => {
      if (isPhoneMode()) return;
      if (isOverlayLockActive()) return;
      if (isAutoScrollingRef.current || isClampingRef.current) return;
      if (performance.now() < programmaticScrollUntilRef.current) return;
      if (window.innerWidth > COMPACT_MAX_WIDTH) return;

      const navOffset = getStickyNavOffset();
      const aboutMe = document.getElementById("about-me");

      if (aboutMe && isSectionTallerThanViewport(aboutMe, navOffset)) {
        const { minY, maxY } = getSectionScrollBounds(aboutMe, navOffset);
        const contact = document.getElementById("contact");
        const contactMinY = contact
          ? contact.getBoundingClientRect().top + window.scrollY - navOffset
          : Infinity;

        if (
          window.scrollY > maxY &&
          window.scrollY < contactMinY - SCROLL_EDGE_TOLERANCE
        ) {
          applyClamp(maxY, "about-me");
          return;
        }

        const projects = document.getElementById("projects");
        const projectsMaxY = projects
          ? getSectionScrollBounds(projects, navOffset).maxY
          : -Infinity;

        if (
          window.scrollY < minY &&
          window.scrollY > projectsMaxY - SCROLL_EDGE_TOLERANCE
        ) {
          applyClamp(minY, "about-me");
          return;
        }
      }

      const section = getActiveSection();
      if (!section || !isSectionTallerThanViewport(section, navOffset)) return;

      const { minY, maxY } = getSectionScrollBounds(section, navOffset);

      if (window.scrollY < minY) {
        applyClamp(minY, section.id);
      } else if (window.scrollY > maxY) {
        applyClamp(maxY, section.id);
      }
    };

    const moveOneSection = (direction, behavior = "smooth") => {
      if (isAutoScrollingRef.current) return false;

      const currentIndex = navItems.findIndex(
        (item) => item.id === activeSectionRef.current
      );
      if (currentIndex === -1) return false;

      const nextIndex =
        direction === "down"
          ? Math.min(currentIndex + 1, navItems.length - 1)
          : Math.max(currentIndex - 1, 0);

      const nextId = navItems[nextIndex].id;
      if (nextId === activeSectionRef.current) return false;

      const align =
        nextId === "about-me" &&
        direction === "up" &&
        window.innerWidth <= COMPACT_MAX_WIDTH
          ? "bottom"
          : "top";

      scrollToSection(nextId, align, behavior);
      return true;
    };

    let wheelAccumulator = 0;
    let wheelAccumulateTimer = null;
    let gestureIdleTimer = null;

    const resetWheelAccumulator = () => {
      wheelAccumulator = 0;
      if (wheelAccumulateTimer !== null) {
        window.clearTimeout(wheelAccumulateTimer);
        wheelAccumulateTimer = null;
      }
    };

    const markWheelGestureActivity = () => {
      if (gestureIdleTimer !== null) {
        window.clearTimeout(gestureIdleTimer);
      }

      gestureIdleTimer = window.setTimeout(() => {
        gestureIdleTimer = null;

        if (
          !hasSnappedThisGestureRef.current &&
          Math.abs(wheelAccumulator) >= WHEEL_IDLE_SNAP_THRESHOLD
        ) {
          const direction = wheelAccumulator > 0 ? "down" : "up";
          performSnap(direction, null);
        }

        resetWheelAccumulator();

        if (!isAutoScrollingRef.current) {
          hasSnappedThisGestureRef.current = false;
        }
      }, GESTURE_IDLE_MS);
    };

    const performSnap = (direction, event) => {
      if (hasSnappedThisGestureRef.current) {
        resetWheelAccumulator();
        if (event) event.preventDefault();
        return;
      }

      stopScrollMomentum();

      if (!moveOneSection(direction)) {
        resetWheelAccumulator();
        if (event) event.preventDefault();
        return;
      }

      hasSnappedThisGestureRef.current = true;
      resetWheelAccumulator();
      recordSnap();
      if (event) event.preventDefault();
    };

    const trySnapSection = (direction, event = null) => {
      performSnap(direction, event);
    };

    const getSettleAlign = (nearestId, scrollY, navOffset) => {
      if (nearestId !== "about-me" || window.innerWidth > COMPACT_MAX_WIDTH) {
        return "top";
      }

      const aboutMe = document.getElementById("about-me");
      if (!aboutMe) return "top";

      const { minY, maxY } = getSectionScrollBounds(aboutMe, navOffset);
      const distToTop = Math.abs(scrollY - minY);
      const distToBottom = Math.abs(scrollY - maxY);

      if (scrollY > maxY - SCROLL_EDGE_TOLERANCE && distToBottom <= distToTop) {
        return "bottom";
      }

      return "top";
    };

    const settleToSection = () => {
      if (isPhoneMode()) return;
      if (isOverlayLockActive()) return;
      if (isAutoScrollingRef.current || isClampingRef.current) return;
      if (performance.now() < programmaticScrollUntilRef.current) return;
      if (Date.now() < skipSettleUntilRef.current) return;

      const navOffset = getStickyNavOffset();
      const scrollY = window.scrollY;

      if (isInsideTallSectionBounds(scrollY, navOffset)) return;

      const nearestId = getNearestSectionId(scrollY, navOffset);
      const section = document.getElementById(nearestId);
      if (!section) return;

      const { minY } = getSectionScrollBounds(section, navOffset);
      if (
        nearestId === activeSectionRef.current &&
        Math.abs(scrollY - minY) <= SCROLL_EDGE_TOLERANCE
      ) {
        return;
      }

      stopScrollMomentum();
      const align = getSettleAlign(nearestId, scrollY, navOffset);
      scrollToSection(nearestId, align, "instant");
    };

    const snapFromWheelAccumulator = (event) => {
      if (Math.abs(wheelAccumulator) < WHEEL_SNAP_THRESHOLD) {
        wheelAccumulator = 0;
        return;
      }

      const direction = wheelAccumulator > 0 ? "down" : "up";
      performSnap(direction, event);
    };

    const scheduleWheelFlush = (event) => {
      if (wheelAccumulateTimer !== null) {
        window.clearTimeout(wheelAccumulateTimer);
      }

      wheelAccumulateTimer = window.setTimeout(() => {
        wheelAccumulateTimer = null;
        snapFromWheelAccumulator(event);
      }, WHEEL_ACCUMULATE_MS);
    };

    const handleWheel = (event) => {
      if (isPhoneMode()) return;
      if (isOverlayLockActive()) return;

      if (isAutoScrollingRef.current) {
        event.preventDefault();
        return;
      }

      const direction = event.deltaY > 0 ? "down" : "up";
      const navOffset = getStickyNavOffset();

      if (window.innerWidth > COMPACT_MAX_WIDTH) {
        event.preventDefault();
        markWheelGestureActivity();

        if (hasSnappedThisGestureRef.current) {
          return;
        }

        if (Math.abs(event.deltaY) < 0.01) return;

        wheelAccumulator += event.deltaY;

        if (Math.abs(wheelAccumulator) >= WHEEL_SNAP_THRESHOLD) {
          if (wheelAccumulateTimer !== null) {
            window.clearTimeout(wheelAccumulateTimer);
            wheelAccumulateTimer = null;
          }
          snapFromWheelAccumulator(event);
          return;
        }

        scheduleWheelFlush(event);
        return;
      }

      const section = getActiveSection();

      if (!section || !isSectionTallerThanViewport(section, navOffset)) {
        event.preventDefault();
        markWheelGestureActivity();

        if (hasSnappedThisGestureRef.current) {
          resetWheelAccumulator();
          return;
        }

        wheelAccumulator += event.deltaY;

        if (Math.abs(wheelAccumulator) >= WHEEL_SNAP_THRESHOLD) {
          if (wheelAccumulateTimer !== null) {
            window.clearTimeout(wheelAccumulateTimer);
            wheelAccumulateTimer = null;
          }
          snapFromWheelAccumulator(event);
          return;
        }

        scheduleWheelFlush(event);
        return;
      }

      if (!isAtSectionEdge(section, direction, navOffset)) {
        resetWheelAccumulator();
        return;
      }

      event.preventDefault();
      markWheelGestureActivity();

      if (hasSnappedThisGestureRef.current) {
        resetWheelAccumulator();
        return;
      }

      wheelAccumulator += event.deltaY;

      if (Math.abs(wheelAccumulator) >= WHEEL_SNAP_THRESHOLD) {
        if (wheelAccumulateTimer !== null) {
          window.clearTimeout(wheelAccumulateTimer);
          wheelAccumulateTimer = null;
        }
        snapFromWheelAccumulator(event);
        return;
      }

      scheduleWheelFlush(event);
    };

    let clampRaf = null;
    let settleTimer = null;
    let touchStartY = null;

    const runPostScrollCorrection = () => {
      if (isPhoneMode()) return;
      if (isOverlayLockActive()) return;
      if (isTouchActiveRef.current) return;

      clampScrollBounds();

      if (pendingTouchSettleRef.current) {
        pendingTouchSettleRef.current = false;
        settleToSection();
        skipSettleUntilRef.current = Date.now() + SKIP_SETTLE_AFTER_TOUCH_MS;
        return;
      }

      settleToSection();
    };

    const scheduleClamp = () => {
      if (isPhoneMode()) return;
      if (isTouchActiveRef.current) return;

      if (clampRaf !== null) {
        window.cancelAnimationFrame(clampRaf);
      }

      clampRaf = window.requestAnimationFrame(() => {
        clampRaf = null;
        clampScrollBounds();
      });
    };

    const scheduleSettle = () => {
      if (isPhoneMode()) return;
      if (isTouchActiveRef.current) return;

      if (settleTimer !== null) {
        window.clearTimeout(settleTimer);
      }

      settleTimer = window.setTimeout(() => {
        settleTimer = null;
        runPostScrollCorrection();
      }, SETTLE_DEBOUNCE_MS);
    };

    const handleScroll = () => {
      if (isPhoneMode()) return;
      if (isOverlayLockActive()) return;
      scheduleClamp();
      scheduleSettle();
    };

    const handleScrollEnd = () => {
      if (isPhoneMode()) return;
      if (isOverlayLockActive()) return;
      if (isTouchActiveRef.current) return;

      if (settleTimer !== null) {
        window.clearTimeout(settleTimer);
        settleTimer = null;
      }
      runPostScrollCorrection();
    };

    const finishTouchGesture = (endY) => {
      if (isPhoneMode()) {
        isTouchActiveRef.current = false;
        touchStartY = null;
        pendingTouchSettleRef.current = false;
        return;
      }

      isTouchActiveRef.current = false;

      if (touchStartY === null) {
        pendingTouchSettleRef.current = true;
        return;
      }

      const deltaY = touchStartY - endY;
      touchStartY = null;

      if (isAutoScrollingRef.current) return;

      stopScrollMomentum();

      const direction = deltaY > 0 ? "down" : "up";
      const navOffset = getStickyNavOffset();
      const section = getActiveSection();
      const absDelta = Math.abs(deltaY);

      if (absDelta >= TOUCH_SWIPE_THRESHOLD) {
        const atEdge =
          !section ||
          !isSectionTallerThanViewport(section, navOffset) ||
          isAtSectionEdge(section, direction, navOffset);

        if (atEdge && moveOneSection(direction, "instant")) {
          skipSettleUntilRef.current = Date.now() + SKIP_SETTLE_AFTER_TOUCH_MS;
          return;
        }
      }

      pendingTouchSettleRef.current = true;
    };

    const handleTouchStart = (event) => {
      if (isPhoneMode()) return;
      if (isOverlayLockActive()) return;
      if (event.touches.length !== 1) return;
      isTouchActiveRef.current = true;
      pendingTouchSettleRef.current = false;
      touchStartY = event.touches[0].clientY;
    };

    const handleTouchEnd = (event) => {
      if (isPhoneMode()) return;
      if (isOverlayLockActive()) return;
      if (event.changedTouches.length === 0) {
        finishTouchGesture(touchStartY ?? 0);
        return;
      }
      finishTouchGesture(event.changedTouches[0].clientY);
    };

    const handleTouchCancel = () => {
      if (isPhoneMode()) return;
      if (isOverlayLockActive()) return;
      finishTouchGesture(touchStartY ?? 0);
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("scrollend", handleScrollEnd, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("touchcancel", handleTouchCancel, { passive: true });

    return () => {
      window.removeEventListener("wheel", handleWheel, { passive: false });
      window.removeEventListener("scroll", handleScroll, { passive: true });
      window.removeEventListener("scrollend", handleScrollEnd, { passive: true });
      window.removeEventListener("touchstart", handleTouchStart, { passive: true });
      window.removeEventListener("touchend", handleTouchEnd, { passive: true });
      window.removeEventListener("touchcancel", handleTouchCancel, { passive: true });
      if (clampRaf !== null) {
        window.cancelAnimationFrame(clampRaf);
      }
      resetWheelAccumulator();
      if (gestureIdleTimer !== null) {
        window.clearTimeout(gestureIdleTimer);
      }
      if (settleTimer !== null) {
        window.clearTimeout(settleTimer);
      }
      stopAnimation();
    };
  }, [getStickyNavOffset, scrollToSection, stopAnimation, updateUrlForSection]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const toggleMenu = useCallback(() => setMenuOpen((open) => !open), []);

  useEffect(() => {
    if (!menuOpen) return;
    return lockBodyScroll();
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen, closeMenu]);

  useEffect(() => {
    if (menuOpen || !pendingNavScrollRef.current) return;

    const targetId = pendingNavScrollRef.current;
    pendingNavScrollRef.current = null;

    requestAnimationFrame(() => {
      smoothScrollToSection(targetId);
    });
  }, [menuOpen, smoothScrollToSection]);

  const handleNavClick = (event, item) => {
    if (typeof window !== "undefined" && window.location.pathname === "/") {
      event.preventDefault();
      smoothScrollToSection(item.id);
    }
    closeMenu();
  };

  const handleDrawerNavClick = (event, item) => {
    const isHome =
      typeof window !== "undefined" && window.location.pathname === "/";

    if (isHome) {
      event.preventDefault();
    }

    setPressedNavId(item.id);

    window.setTimeout(() => {
      if (isHome) {
        pendingNavScrollRef.current = item.id;
      }
      closeMenu();
      setPressedNavId(null);
    }, 160);
  };

  const toggleTheme = () => {
    setLightmode((current) => !current);
    setShowSun((current) => !current);
    setIsHoverDisabled(true);
  };

  const handleMouseLeave = () => {
    setIsHoverDisabled(false);
  };

  return (
    <html
      lang="en"
      className={`${lightmode ? "light" : "dark"}${menuOpen ? " menu-open" : ""}`}
    >
      <body>
        <UniverseBackground darkMode={!lightmode} />
        <div className="content-layer">
        <nav>
          <div className="flex nav-links nav-links--desktop">
            {navItems.map((item) => (
              <Link
                key={item.id}
                className={`block nav-link ${activeSection === item.id ? "active" : ""}`}
                href={item.href}
                onClick={(event) => handleNavClick(event, item)}
                aria-current={activeSection === item.id ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="nav-controls nav-controls--desktop">
            <div
              className="sun-div"
              onMouseLeave={handleMouseLeave}
              data-hover-disabled={isHoverDisabled}
            >
              <Image
                className={showSun ? "sun" : "sun hidden"}
                src="/sun.png"
                alt="sun"
                width={40}
                height={40}
                onClick={toggleTheme}
              />
              <Image
                className={showSun ? "sun-outline" : "sun-outline hidden"}
                src="/sun-outline.png"
                alt="sun"
                width={40}
                height={40}
                onClick={toggleTheme}
              />
            </div>
          </div>

          <div
            className={`nav-drawer-backdrop ${menuOpen ? "is-open" : ""}`}
            onClick={closeMenu}
            aria-hidden={!menuOpen}
          />

          <aside
            id="mobile-nav-drawer"
            className={`nav-drawer ${menuOpen ? "is-open" : ""}`}
            aria-hidden={!menuOpen}
          >
            <div className="nav-drawer-links">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  className={`block nav-link${activeSection === item.id ? " active" : ""}${pressedNavId === item.id ? " nav-link--pressed" : ""}`}
                  href={item.href}
                  onClick={(event) => handleDrawerNavClick(event, item)}
                  aria-current={activeSection === item.id ? "page" : undefined}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="nav-drawer-theme">
              <div className="nav-drawer-theme-controls">
                <div className="sun-div sun-div--drawer" data-hover-disabled="true" aria-hidden>
                  <Image
                    className={`sun sun--drawer-slot ${lightmode ? "is-visible" : "is-hidden"}`}
                    src="/sun.png"
                    alt=""
                    width={36}
                    height={36}
                  />
                </div>
                <label className="ios-switch">
                  <input
                    type="checkbox"
                    role="switch"
                    checked={!lightmode}
                    onChange={toggleTheme}
                    aria-label="Dark mode"
                  />
                  <span className="ios-switch-track" aria-hidden />
                </label>
                <div className="sun-div sun-div--drawer" data-hover-disabled="true" aria-hidden>
                  <Image
                    className={`sun-outline sun--drawer-slot ${lightmode ? "is-hidden" : "is-visible"}`}
                    src="/sun-outline.png"
                    alt=""
                    width={36}
                    height={36}
                  />
                </div>
              </div>
            </div>
          </aside>

          <button
            type="button"
            className="nav-burger"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-drawer"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={toggleMenu}
          >
            <span className="nav-burger-line" />
            <span className="nav-burger-line" />
            <span className="nav-burger-line" />
          </button>
        </nav>
        {children}
        </div>
      </body>
    </html>
  );
}
