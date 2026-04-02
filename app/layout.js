'use client';

import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

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
  const [activeSection, setActiveSection] = useState(() => {
    if (typeof window === "undefined") return "home";
    return window.location.hash.replace("#", "") || "home";
  });

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

  const smoothScrollToSection = useCallback((targetId) => {
    const targetSection = document.getElementById(targetId);
    if (!targetSection) return;

    stopAnimation();
    isAutoScrollingRef.current = true;
    setActiveSection(targetId);
    updateUrlForSection(targetId);

    const startY = window.scrollY;
    const targetY = targetSection.getBoundingClientRect().top + window.scrollY;
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
  }, [stopAnimation, updateUrlForSection]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const initialHash = window.location.hash.replace("#", "");

    if (initialHash) {
      const section = document.getElementById(initialHash);
      if (section) {
        section.scrollIntoView({ behavior: "auto", block: "start" });
      }
    }
  }, []);

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

    const moveOneSection = (direction) => {
      const currentIndex = navItems.findIndex((item) => item.id === activeSectionRef.current);
      if (currentIndex === -1) return;

      const nextIndex = direction === "down"
        ? Math.min(currentIndex + 1, navItems.length - 1)
        : Math.max(currentIndex - 1, 0);

      const nextId = navItems[nextIndex].id;
      if (nextId === activeSectionRef.current) return;

      smoothScrollToSection(nextId);
    };

    const handleWheel = (event) => {
      if (Math.abs(event.deltaY) < 1) return;

      event.preventDefault();

      if (isAutoScrollingRef.current) return;

      moveOneSection(event.deltaY > 0 ? "down" : "up");
    };

    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel, { passive: false });
      stopAnimation();
    };
  }, [smoothScrollToSection, stopAnimation]);

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
      </body>
    </html>
  );
}
