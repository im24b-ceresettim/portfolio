'use client';

import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import UniverseBackground from "./components/UniverseBackground";

const navItems = [
  { id: "home", label: "home", href: "/" },
  { id: "projects", label: "projects", href: "/#projects" },
  { id: "about-me", label: "about me", href: "/#about-me" },
  { id: "contact", label: "contact", href: "/#contact" },
];

export default function RootLayout({ children }) {
  const [showSun, setShowSun] = useState(true);
  const [lightmode, setLightmode] = useState(true);
  const [isHoverDisabled, setIsHoverDisabled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

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
  const animationFrameRef = useRef(null);

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

  const smoothScrollToSection = useCallback((targetId, align = "top") => {
    const targetSection = document.getElementById(targetId);
    if (!targetSection) return;

    stopAnimation();
    isAutoScrollingRef.current = true;
    setActiveSection(targetId);
    updateUrlForSection(targetId);

    const startY = window.scrollY;
    const navOffset = getStickyNavOffset();
    const topY = targetSection.getBoundingClientRect().top + window.scrollY - navOffset;
    const bottomY =
      targetSection.offsetTop + targetSection.offsetHeight - window.innerHeight;
    const targetY = align === "bottom" ? Math.max(topY, bottomY) : topY;
    const duration = 500;
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
    };

    animationFrameRef.current = window.requestAnimationFrame(step);
  }, [getStickyNavOffset, stopAnimation, updateUrlForSection]);

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

    const moveOneSection = (direction) => {
      const currentIndex = navItems.findIndex((item) => item.id === activeSectionRef.current);
      if (currentIndex === -1) return;

      const nextIndex = direction === "down"
        ? Math.min(currentIndex + 1, navItems.length - 1)
        : Math.max(currentIndex - 1, 0);

      const nextId = navItems[nextIndex].id;
      if (nextId === activeSectionRef.current) return;

      const align =
        nextId === "about-me" &&
        direction === "up" &&
        window.innerWidth <= COMPACT_MAX_WIDTH
          ? "bottom"
          : "top";

      smoothScrollToSection(nextId, align);
    };

    const handleWheel = (event) => {
      if (Math.abs(event.deltaY) < 1) return;
      if (isAutoScrollingRef.current) return;

      const direction = event.deltaY > 0 ? "down" : "up";

      const snapToSection = () => {
        event.preventDefault();
        moveOneSection(direction);
      };

      if (window.innerWidth > COMPACT_MAX_WIDTH) {
        snapToSection();
        return;
      }

      const section = document.getElementById(activeSectionRef.current);
      if (!section) {
        snapToSection();
        return;
      }

      const navOffset = getStickyNavOffset();
      const viewportHeight = window.innerHeight;
      const isScrollable = section.scrollHeight > viewportHeight - navOffset + 2;

      if (!isScrollable) {
        snapToSection();
        return;
      }

      const sectionTopScroll = section.getBoundingClientRect().top + window.scrollY;
      const sectionBottomScroll = sectionTopScroll + section.offsetHeight;
      const atTop = window.scrollY <= sectionTopScroll - navOffset + SCROLL_EDGE_TOLERANCE;
      const atBottom =
        window.scrollY + viewportHeight >= sectionBottomScroll - SCROLL_EDGE_TOLERANCE;

      if (direction === "down" && !atBottom) return;
      if (direction === "up" && !atTop) return;

      snapToSection();
    };

    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel, { passive: false });
      stopAnimation();
    };
  }, [getStickyNavOffset, smoothScrollToSection, stopAnimation]);

  const handleNavClick = (event, item) => {
    if (typeof window !== "undefined" && window.location.pathname === "/") {
      event.preventDefault();
      smoothScrollToSection(item.id);
    }
  };

  const handleClick = () => {
    setLightmode(!lightmode);
    setShowSun(!showSun);
    setIsHoverDisabled(true);
  };

  const handleMouseLeave = () => {
    setIsHoverDisabled(false);
  };

  return (
    <html lang="en" className={lightmode ? "light" : "dark"}>
      <body>
        <UniverseBackground darkMode={!lightmode} />
        <div className="content-layer">
        <nav>
          <div className="flex nav-links">
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

          <div className="nav-controls">
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
                onClick={handleClick}
              />
              <Image
                className={showSun ? "sun-outline" : "sun-outline hidden"}
                src="/sun-outline.png"
                alt="sun"
                width={40}
                height={40}
                onClick={handleClick}
              />
            </div>
          </div>
        </nav>
        {children}
        </div>
      </body>
    </html>
  );
}
