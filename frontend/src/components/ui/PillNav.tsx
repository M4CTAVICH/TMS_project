import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ShoppingCart } from "lucide-react";

export type PillNavItem = {
  label: string;
  href: string;
  ariaLabel?: string;
  badge?: number;
};

export interface PillNavProps {
  logo: string;
  logoAlt?: string;
  items: PillNavItem[];
  activeHref?: string;
  className?: string;
  ease?: string;
  baseColor?: string;
  pillColor?: string;
  hoveredPillTextColor?: string;
  pillTextColor?: string;
  onMobileMenuClick?: () => void;
  initialLoadAnimation?: boolean;
  rightContent?: React.ReactNode; // For user dropdown
}

const PillNav: React.FC<PillNavProps> = ({
  logo,
  logoAlt = "Logo",
  items,
  activeHref,
  className = "",
  ease = "power3.easeOut",
  baseColor = "rgba(30, 41, 59, 0.9)",
  pillColor = "rgba(15, 23, 42, 0.95)",
  hoveredPillTextColor = "#06b6d4",
  pillTextColor = "#e2e8f0",
  onMobileMenuClick,
  initialLoadAnimation = true,
  rightContent,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const circleRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const tlRefs = useRef<Array<gsap.core.Timeline | null>>([]);
  const activeTweenRefs = useRef<Array<gsap.core.Tween | null>>([]);
  const logoImgRef = useRef<HTMLImageElement | null>(null);
  const logoTweenRef = useRef<gsap.core.Tween | null>(null);
  const hamburgerRef = useRef<HTMLButtonElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const navItemsRef = useRef<HTMLDivElement | null>(null);
  const logoRef = useRef<HTMLAnchorElement | HTMLElement | null>(null);

  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach((circle) => {
        if (!circle?.parentElement) return;

        const pill = circle.parentElement as HTMLElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;
        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta =
          Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`,
        });

        const label = pill.querySelector<HTMLElement>(".pill-label");
        const white = pill.querySelector<HTMLElement>(".pill-label-hover");

        if (label) gsap.set(label, { y: 0 });
        if (white) gsap.set(white, { y: h + 12, opacity: 0 });

        const index = circleRefs.current.indexOf(circle);
        if (index === -1) return;

        tlRefs.current[index]?.kill();
        const tl = gsap.timeline({ paused: true });

        tl.to(
          circle,
          { scale: 1.2, xPercent: -50, duration: 2, ease, overwrite: "auto" },
          0
        );

        if (label) {
          tl.to(
            label,
            { y: -(h + 8), duration: 2, ease, overwrite: "auto" },
            0
          );
        }

        if (white) {
          gsap.set(white, { y: Math.ceil(h + 100), opacity: 0 });
          tl.to(
            white,
            { y: 0, opacity: 1, duration: 2, ease, overwrite: "auto" },
            0
          );
        }

        tlRefs.current[index] = tl;
      });
    };

    layout();

    const onResize = () => layout();
    window.addEventListener("resize", onResize);

    if (document.fonts) {
      document.fonts.ready.then(layout).catch(() => {});
    }

    const menu = mobileMenuRef.current;
    if (menu) {
      gsap.set(menu, { visibility: "hidden", opacity: 0, scaleY: 1, y: 0 });
    }

    if (initialLoadAnimation) {
      const logo = logoRef.current;
      const navItems = navItemsRef.current;

      if (logo) {
        gsap.set(logo, { scale: 0 });
        gsap.to(logo, {
          scale: 1,
          duration: 0.6,
          ease,
        });
      }

      if (navItems) {
        gsap.set(navItems, { width: 0, overflow: "hidden" });
        gsap.to(navItems, {
          width: "auto",
          duration: 0.6,
          ease,
        });
      }
    }

    return () => window.removeEventListener("resize", onResize);
  }, [items, ease, initialLoadAnimation]);

  const handleEnter = (i: number) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), {
      duration: 0.3,
      ease,
      overwrite: "auto",
    });
  };

  const handleLeave = (i: number) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(0, {
      duration: 0.2,
      ease,
      overwrite: "auto",
    });
  };

  const handleLogoEnter = () => {
    const img = logoImgRef.current;
    if (!img) return;
    logoTweenRef.current?.kill();
    gsap.set(img, { rotate: 0 });
    logoTweenRef.current = gsap.to(img, {
      rotate: 360,
      duration: 0.2,
      ease,
      overwrite: "auto",
    });
  };

  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);

    const hamburger = hamburgerRef.current;
    const menu = mobileMenuRef.current;

    if (hamburger) {
      const lines = hamburger.querySelectorAll(".hamburger-line");
      if (newState) {
        gsap.to(lines[0], { rotation: 45, y: 3, duration: 0.3, ease });
        gsap.to(lines[1], { rotation: -45, y: -3, duration: 0.3, ease });
      } else {
        gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.3, ease });
        gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.3, ease });
      }
    }

    if (menu) {
      if (newState) {
        gsap.set(menu, { visibility: "visible" });
        gsap.fromTo(
          menu,
          { opacity: 0, y: 10, scaleY: 1 },
          {
            opacity: 1,
            y: 0,
            scaleY: 1,
            duration: 0.3,
            ease,
            transformOrigin: "top center",
          }
        );
      } else {
        gsap.to(menu, {
          opacity: 0,
          y: 10,
          scaleY: 1,
          duration: 0.2,
          ease,
          transformOrigin: "top center",
          onComplete: () => {
            gsap.set(menu, { visibility: "hidden" });
          },
        });
      }
    }

    onMobileMenuClick?.();
  };

  const isExternalLink = (href: string) =>
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("//") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("#");

  const isRouterLink = (href?: string) => href && !isExternalLink(href);

  const cssVars = {
    ["--base"]: baseColor,
    ["--pill-bg"]: pillColor,
    ["--hover-text"]: hoveredPillTextColor,
    ["--pill-text"]: pillTextColor,
    ["--nav-h"]: "42px",
    ["--logo"]: "36px",
    ["--pill-pad-x"]: "18px",
    ["--pill-gap"]: "3px",
  } as React.CSSProperties;

  return (
    <div className="absolute top-[1.5em] left-1/2 -translate-x-1/2 z-[1000] w-full md:w-auto px-4 md:px-0">
      <nav
        className={`w-full md:w-max flex items-center justify-between md:justify-start gap-3 box-border ${className}`}
        aria-label="Primary"
        style={cssVars}
      >
        {isRouterLink(items?.[0]?.href) ? (
          <Link
            to={items[0].href}
            aria-label="Home"
            onMouseEnter={handleLogoEnter}
            role="menuitem"
            ref={(el) => {
              logoRef.current = el;
            }}
            className="rounded-full p-2 inline-flex items-center justify-center overflow-hidden backdrop-blur-md border border-white/10 shadow-lg shadow-blue-500/10"
            style={{
              width: "var(--nav-h)",
              height: "var(--nav-h)",
              background: "var(--base)",
            }}
          >
            <img
              src={logo}
              alt={logoAlt}
              ref={logoImgRef}
              className="w-full h-full object-cover block"
            />
          </Link>
        ) : (
          <a
            href={items?.[0]?.href || "#"}
            aria-label="Home"
            onMouseEnter={handleLogoEnter}
            ref={(el) => {
              logoRef.current = el;
            }}
            className="rounded-full p-2 inline-flex items-center justify-center overflow-hidden backdrop-blur-md border border-white/10 shadow-lg shadow-blue-500/10"
            style={{
              width: "var(--nav-h)",
              height: "var(--nav-h)",
              background: "var(--base)",
            }}
          >
            <img
              src={logo}
              alt={logoAlt}
              ref={logoImgRef}
              className="w-full h-full object-cover block"
            />
          </a>
        )}

        <div
          ref={navItemsRef}
          className="relative items-center rounded-full hidden md:flex backdrop-blur-md border border-white/10 shadow-lg shadow-blue-500/10"
          style={{
            height: "var(--nav-h)",
            background: "var(--base)",
          }}
        >
          <ul
            role="menubar"
            className="list-none flex items-stretch m-0 p-[3px] h-full"
            style={{ gap: "var(--pill-gap)" }}
          >
            {items.map((item, i) => {
              const isActive = activeHref === item.href;

              const pillStyle: React.CSSProperties = {
                background: "var(--pill-bg)",
                color: "var(--pill-text)",
                paddingLeft: "var(--pill-pad-x)",
                paddingRight: "var(--pill-pad-x)",
              };

              const PillContent = (
                <>
                  <span
                    className="hover-circle absolute left-1/2 bottom-0 rounded-full z-[1] block pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)",
                      willChange: "transform",
                    }}
                    aria-hidden="true"
                    ref={(el) => {
                      circleRefs.current[i] = el;
                    }}
                  />
                  <span className="label-stack relative inline-block leading-[1] z-[2]">
                    <span
                      className="pill-label relative z-[2] inline-flex items-center gap-2 leading-[1]"
                      style={{ willChange: "transform" }}
                    >
                      {item.label === "Cart" && (
                        <ShoppingCart className="w-4 h-4" />
                      )}
                      {item.label}
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-[10px] rounded-full font-bold min-w-[18px] text-center">
                          {item.badge > 99 ? "99+" : item.badge}
                        </span>
                      )}
                    </span>
                    <span
                      className="pill-label-hover absolute left-0 top-0 z-[3] inline-flex items-center gap-2"
                      style={{
                        color: "var(--hover-text)",
                        willChange: "transform, opacity",
                      }}
                      aria-hidden="true"
                    >
                      {item.label === "Cart" && (
                        <ShoppingCart className="w-4 h-4" />
                      )}
                      {item.label}
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-[10px] rounded-full font-bold min-w-[18px] text-center">
                          {item.badge > 99 ? "99+" : item.badge}
                        </span>
                      )}
                    </span>
                  </span>
                  {isActive && (
                    <span
                      className="absolute left-1/2 -bottom-[6px] -translate-x-1/2 w-3 h-3 rounded-full z-[4] shadow-lg shadow-cyan-500/50"
                      style={{
                        background:
                          "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)",
                      }}
                      aria-hidden="true"
                    />
                  )}
                </>
              );

              const basePillClasses =
                "relative overflow-hidden inline-flex items-center justify-center h-full no-underline rounded-full box-border font-semibold text-[16px] leading-[0] uppercase tracking-[0.2px] whitespace-nowrap cursor-pointer px-0";

              return (
                <li key={item.href} role="none" className="flex h-full">
                  {isRouterLink(item.href) ? (
                    <Link
                      role="menuitem"
                      to={item.href}
                      className={basePillClasses}
                      style={pillStyle}
                      aria-label={item.ariaLabel || item.label}
                      onMouseEnter={() => handleEnter(i)}
                      onMouseLeave={() => handleLeave(i)}
                    >
                      {PillContent}
                    </Link>
                  ) : (
                    <a
                      role="menuitem"
                      href={item.href}
                      className={basePillClasses}
                      style={pillStyle}
                      aria-label={item.ariaLabel || item.label}
                      onMouseEnter={() => handleEnter(i)}
                      onMouseLeave={() => handleLeave(i)}
                    >
                      {PillContent}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Right content (user dropdown) - Desktop only */}
        {rightContent && <div className="hidden md:block">{rightContent}</div>}

        <button
          ref={hamburgerRef}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
          className="md:hidden rounded-full border border-white/10 flex flex-col items-center justify-center gap-1 cursor-pointer p-0 relative backdrop-blur-md shadow-lg shadow-blue-500/10"
          style={{
            width: "var(--nav-h)",
            height: "var(--nav-h)",
            background: "var(--base)",
          }}
        >
          <span className="hamburger-line w-4 h-0.5 rounded origin-center transition-all duration-10ms ease-custom-ease bg-gradient-to-r from-blue-400 to-cyan-400" />
          <span className="hamburger-line w-4 h-0.5 rounded origin-center transition-all duration-10ms ease-custom-ease bg-gradient-to-r from-blue-400 to-cyan-400" />
        </button>
      </nav>

      <div
        ref={mobileMenuRef}
        className="md:hidden absolute top-[3.5em] left-1/2 -translate-x-1/2 w-[90vw] max-w-sm rounded-[27px] shadow-[0_8px_32px_rgba(37,99,235,0.3)] z-[998] origin-top backdrop-blur-md border border-white/10"
        style={{
          ...cssVars,
          background: "var(--base)",
        }}
      >
        <ul className="list-none m-0 p-[3px] flex flex-col gap-[3px]">
          {items.map((item) => {
            const isActive = activeHref === item.href;
            const defaultStyle: React.CSSProperties = {
              background: isActive
                ? "linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)"
                : "var(--pill-bg)",
              color: isActive ? "#ffffff" : "var(--pill-text)",
            };
            const hoverIn = (e: React.MouseEvent<HTMLAnchorElement>) => {
              if (!isActive) {
                e.currentTarget.style.background =
                  "linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)";
                e.currentTarget.style.color = "#ffffff";
              }
            };
            const hoverOut = (e: React.MouseEvent<HTMLAnchorElement>) => {
              if (!isActive) {
                e.currentTarget.style.background = "var(--pill-bg)";
                e.currentTarget.style.color = "var(--pill-text)";
              }
            };

            const linkClasses =
              "block py-3 px-4 text-[16px] font-medium rounded-[50px] transition-all duration-200 ease-custom-ease flex items-center justify-between";

            return (
              <li key={item.href}>
                {isRouterLink(item.href) ? (
                  <Link
                    to={item.href}
                    className={linkClasses}
                    style={defaultStyle}
                    onMouseEnter={hoverIn}
                    onMouseLeave={hoverOut}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="flex items-center gap-2">
                      {item.label === "Cart" && (
                        <ShoppingCart className="w-4 h-4" />
                      )}
                      {item.label}
                    </span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="px-2 py-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs rounded-full font-bold">
                        {item.badge > 99 ? "99+" : item.badge}
                      </span>
                    )}
                  </Link>
                ) : (
                  <a
                    href={item.href}
                    className={linkClasses}
                    style={defaultStyle}
                    onMouseEnter={hoverIn}
                    onMouseLeave={hoverOut}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span>{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="px-2 py-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs rounded-full font-bold">
                        {item.badge > 99 ? "99+" : item.badge}
                      </span>
                    )}
                  </a>
                )}
              </li>
            );
          })}
          {/* Mobile user section */}
          {rightContent && (
            <li className="md:hidden border-t border-white/10 mt-2 pt-2 px-1">
              {rightContent}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default PillNav;
