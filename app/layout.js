'use client';

import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import UniverseBackground from "./components/UniverseBackground";
import { useCallback, useEffect, useRef, useState } from "react";

const navItems = [
  { id: "home", label: "home", href: "/" },
  { id: "projects", label: "projects", href: "/#projects" },
  { id: "about-me", label: "about me", href: "/#about-me" },
  { id: "contact", label: "contact", href: "/#contact" },
];


export default function RootLayout({ children }) {
    const [showSun,setShowSun] = useState(true);
    const [lightmode, setLightmode] = useState(true);
    const [backgroundMode, setBackgroundMode] = useState("auto");
    const [performanceMode, setPerformanceMode] = useState(false);
    const [isHoverDisabled, setIsHoverDisabled] = useState(false);
    const [activeSection, setActiveSection] = useState(() => {
        if (typeof window === "undefined") {
            return "home";
        }

        return window.location.hash.replace("#", "") || "home";
    });
    const isAutoScrolling = useRef(false);
    const activeSectionRef = useRef(activeSection);
    const animationFrameRef = useRef(null);

    useEffect(() => {
        activeSectionRef.current = activeSection;
    }, [activeSection]);

    const stopAnimation = useCallback(() => {
        if (animationFrameRef.current !== null) {
            window.cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
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
        if (!targetSection) {
            return;
        }

        stopAnimation();
        isAutoScrolling.current = true;
        setActiveSection(targetId);
        updateUrlForSection(targetId);

        const startY = window.scrollY;
        const targetY = targetSection.getBoundingClientRect().top + window.scrollY;
        const duration = 1100;
        const startTime = performance.now();

        const step = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Linear interpolation for constant perceived scrolling speed.
            window.scrollTo(0, startY + (targetY - startY) * progress);

            if (progress < 1) {
                animationFrameRef.current = window.requestAnimationFrame(step);
                return;
            }

            animationFrameRef.current = null;
            isAutoScrolling.current = false;
        };

        animationFrameRef.current = window.requestAnimationFrame(step);
    }, [stopAnimation, updateUrlForSection]);

    const getNextIndex = useCallback((direction) => {
        const currentIndex = navItems.findIndex((item) => item.id === activeSectionRef.current);
        if (currentIndex === -1) {
            return -1;
        }

        if (direction === "down") {
            return Math.min(currentIndex + 1, navItems.length - 1);
        }

        return Math.max(currentIndex - 1, 0);
    }, []);

    const moveOneSection = useCallback((direction) => {
        const nextIndex = getNextIndex(direction);
        if (nextIndex < 0) {
            return;
        }

        const nextId = navItems[nextIndex].id;
        if (nextId === activeSectionRef.current) {
            return;
        }

        smoothScrollToSection(nextId);
    }, [getNextIndex, smoothScrollToSection]);


    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const visibleEntry = entries.find((entry) => entry.isIntersecting);
                if (visibleEntry?.target?.id) {
                    const sectionId = visibleEntry.target.id;
                    setActiveSection(sectionId);
                    updateUrlForSection(sectionId);
                }
            },
            {
                threshold: 0.6,
                rootMargin: "-64px 0px -20% 0px",
            }
        );

        navItems.forEach((item) => {
            const section = document.getElementById(item.id);
            if (section) {
                observer.observe(section);
            }
        });


        return () => observer.disconnect();
    }, [updateUrlForSection]);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        const handleWheel = (event) => {
            if (isAutoScrolling.current) {
                event.preventDefault();
                return;
            }

            if (Math.abs(event.deltaY) < 1) {
                return;
            }

            event.preventDefault();
            moveOneSection(event.deltaY > 0 ? "down" : "up");
        };

        const handleKeyDown = (event) => {
            if (event.key !== "ArrowDown" && event.key !== "ArrowUp") {
                return;
            }

            const element = event.target;
            const tagName = element?.tagName?.toLowerCase();
            const isTypingField = tagName === "input"
                || tagName === "textarea"
                || tagName === "select"
                || element?.isContentEditable;

            if (isTypingField) {
                return;
            }

            event.preventDefault();

            if (isAutoScrolling.current) {
                return;
            }

            moveOneSection(event.key === "ArrowDown" ? "down" : "up");
        };

        window.addEventListener("wheel", handleWheel, { passive: false });
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("wheel", handleWheel, { passive: false });
            window.removeEventListener("keydown", handleKeyDown);
            stopAnimation();
        };
    }, [moveOneSection, stopAnimation]);

    const handleNavClick = (event, item) => {
        setActiveSection(item.id);

        if (item.id === "home") {
            if (window.location.pathname === "/") {
                event.preventDefault();
                smoothScrollToSection("home");
            }

            return;
        }

        event.preventDefault();
        smoothScrollToSection(item.id);
    };

    const handleClick = () => {
        setLightmode(!lightmode);
        setShowSun(!showSun);
        setIsHoverDisabled(true);
    };

    const handleMouseLeave = () => {
        setIsHoverDisabled(false);
    };

    const cycleBackgroundMode = () => {
        setBackgroundMode((current) => {
            if (current === "auto") {
                return "on";
            }

            if (current === "on") {
                return "off";
            }

            return "auto";
        });
    };

    const isUniverseEnabled = backgroundMode === "on" || (backgroundMode === "auto" && !lightmode);
    const backgroundLabel = backgroundMode === "auto"
        ? "BG: Dark only"
        : backgroundMode === "on"
            ? "BG: On"
            : "BG: Off";

  return (
    <html lang="en" className={lightmode ? "light" : "dark"}>
      <body>
        <UniverseBackground enabled={isUniverseEnabled} performanceMode={performanceMode} />
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
                    <button type="button" className="nav-control-btn" onClick={cycleBackgroundMode}>
                        {backgroundLabel}
                    </button>
                    <button
                        type="button"
                        className="nav-control-btn"
                        onClick={() => setPerformanceMode((value) => !value)}
                    >
                        Performance: {performanceMode ? "On" : "Off"}
                    </button>

                    <div
                        className="sun-div"
                        onMouseLeave={handleMouseLeave}
                        data-hover-disabled={isHoverDisabled}>
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
