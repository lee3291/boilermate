import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger"; // ← added
gsap.registerPlugin(ScrollTrigger);                  // ← added

import HomeNavbar from "./components/HomeNavbar";
import MainImage from "../../assets/images/beg.webp";

const WORD = "BoilerMate";

// Cooldown: 30 seconds
const INTRO_COOLDOWN_MS = 30 * 1000;
const VISIT_KEY = "bm_last_seen_at";
const INTRO_SESS_KEY = "bm_intro_played";

function getSkipIntro(cooldownMs: number) {
    // Runs on first client render to avoid any flash
    if (typeof window === "undefined") return false; // SSR safeguard
    try {
        const last = Number(localStorage.getItem(VISIT_KEY));
        const recent = Number.isFinite(last) && Date.now() - last < cooldownMs;
        const sessionOnce = sessionStorage.getItem(INTRO_SESS_KEY) === "1";
        return recent || sessionOnce;
    } catch {
        return false;
    }
}

function markSeen() {
    try {
        localStorage.setItem(VISIT_KEY, String(Date.now()));
        sessionStorage.setItem(INTRO_SESS_KEY, "1");
    } catch {}
}

export default function Homepage() {
    const rootRef = useRef<HTMLDivElement | null>(null);

    // Decide skip synchronously for this render (prevents overlay flash)
    const [skipIntro] = useState(() => getSkipIntro(INTRO_COOLDOWN_MS));

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const prefersReduced =
                window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

            // Ensure root is visible
            gsap.set(rootRef.current, { autoAlpha: 1 });

            // Shared hero start states
            gsap.set(".hero-img", { scale: 1.05, filter: "blur(6px)" });
            gsap.set(".image-wipe", { xPercent: 0 });
            gsap.set(".image-reveal", { x: -28, autoAlpha: 0 });

            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

            if (skipIntro) {
                // Hide/remove the intro immediately
                gsap.set(".intro", { display: "none" });

                if (prefersReduced) {
                    gsap.set(".image-wipe", { xPercent: 100 });
                    tl.from(".animate-nav", { autoAlpha: 0, duration: 0.3 })
                        .to(".image-reveal", { autoAlpha: 1, x: 0, duration: 0.3 }, "-=0.1")
                        .to(".hero-img", { scale: 1, filter: "blur(0px)", duration: 0.4 }, "<")
                        .from(".line", { autoAlpha: 0, stagger: 0.08, duration: 0.25 }, "-=0.2")
                        .from(".subtitle", { autoAlpha: 0, duration: 0.3 }, "-=0.15");
                } else {
                    tl.from(".animate-nav", { y: -24, autoAlpha: 0, duration: 0.6 })
                        .to(".image-reveal", { x: 0, autoAlpha: 1, duration: 0.6 }, "-=0.3")
                        .to(".image-wipe", { xPercent: 100, duration: 0.9, ease: "power2.out" }, "<")
                        .to(
                            ".hero-img",
                            { scale: 1, filter: "blur(0px)", duration: 0.9, ease: "power3.out" },
                            "<"
                        )
                        .from(
                            ".line",
                            { yPercent: 120, autoAlpha: 0, duration: 0.8, stagger: 0.08 },
                            "-=1"
                        )
                        .from(".subtitle", { y: 20, autoAlpha: 0, duration: 0.6 }, "-=1");
                }

                // Refresh last-seen
                markSeen();
            } else {
                // --- INTRO FLOW ---
                gsap.set(".intro", { autoAlpha: 1 });
                gsap.set(".intro-char", {
                    yPercent: prefersReduced ? 0 : 120,
                    rotateX: prefersReduced ? 0 : -90,
                    transformPerspective: 600,
                    transformOrigin: "50% 0%",
                    autoAlpha: prefersReduced ? 1 : 0,
                });

                if (prefersReduced) {
                    tl.to(".intro", { autoAlpha: 1, duration: 0.1 })
                        .to(".intro", { yPercent: -100, duration: 0.4, ease: "power2.in" })
                        .set(".intro", { display: "none" })
                        .set(".image-wipe", { xPercent: 100 })
                        .from(".animate-nav", { autoAlpha: 0, duration: 0.3 })
                        .to(".image-reveal", { autoAlpha: 1, x: 0, duration: 0.3 }, "-=0.1")
                        .to(".hero-img", { scale: 1, filter: "blur(0px)", duration: 0.4 }, "<")
                        .from(".line", { autoAlpha: 0, stagger: 0.08, duration: 0.25 }, "-=0.2")
                        .from(".subtitle", { autoAlpha: 0, duration: 0.3 }, "-=0.15");
                } else {
                    tl.to(".intro-char", {
                        yPercent: 0,
                        rotateX: 0,
                        autoAlpha: 1,
                        duration: 0.7,
                        stagger: 0.05,
                        ease: "power3.out",
                    })
                        .fromTo(
                            ".intro-word",
                            { filter: "drop-shadow(0 0 0px rgba(255,255,255,0))" },
                            {
                                filter: "drop-shadow(0 0 16px rgba(255,255,255,0.35))",
                                duration: 0.5,
                                yoyo: true,
                                repeat: 1,
                                ease: "power2.out",
                            }
                        )
                        .to(".intro", { yPercent: -100, duration: 0.8, ease: "power4.in" }, "-=1")
                        .set(".intro", { display: "none" })
                        .from(".animate-nav", { y: -24, autoAlpha: 0, duration: 0.6 }, "-=2")
                        .to(".image-reveal", { x: 0, autoAlpha: 1, duration: 0.6 }, "-=0.3")
                        .to(".image-wipe", { xPercent: 100, duration: 0.9, ease: "power2.out" }, "<")
                        .to(
                            ".hero-img",
                            { scale: 1, filter: "blur(0px)", duration: 0.9, ease: "power3.out" },
                            "<"
                        )
                        .from(
                            ".line",
                            { yPercent: 120, autoAlpha: 0, duration: 0.8, stagger: 0.08 },
                            "-=1"
                        )
                        .from(".subtitle", { y: 20, autoAlpha: 0, duration: 0.6 }, "-=1");
                }

                // Mark as seen no matter what
                markSeen();
                tl.eventCallback("onComplete", markSeen);
            }

            // ─────────────────────────────────────────────────────────────
            // Minimal scroll-triggered animation for the lower section only
            // ─────────────────────────────────────────────────────────────
            if (prefersReduced) {
                // Respect reduced motion: ensure visible without motion
                gsap.set(".bm-title", { autoAlpha: 1, y: 0 });
                gsap.set(".bm-step", { autoAlpha: 1, x: 0 });
                gsap.set(".bm-divider", { scaleX: 1, transformOrigin: "right center" });
            } else {
                const trigger = {
                    trigger: ".bm-section",
                    start: "top 70%",
                    once: true,
                };

                gsap.from(".bm-title", {
                    y: 40,
                    autoAlpha: 0,
                    duration: 0.6,
                    ease: "power3.out",
                    scrollTrigger: trigger,
                });

                gsap.from(".bm-step", {
                    x: 40,
                    autoAlpha: 0,
                    duration: 0.5,
                    ease: "power3.out",
                    stagger: 0.12,
                    scrollTrigger: trigger,
                });

                gsap.from(".bm-divider", {
                    scaleX: 0,
                    transformOrigin: "right center",
                    duration: 0.4,
                    ease: "power2.out",
                    stagger: 0.12,
                    scrollTrigger: trigger,
                });
            }
            // ─────────────────────────────────────────────────────────────

            // Update last-seen on hide/visibility change (helps with quick back/forward)
            const onHide = () => markSeen();
            const onVis = () => {
                if (document.visibilityState === "hidden") markSeen();
            };
            window.addEventListener("pagehide", onHide);
            document.addEventListener("visibilitychange", onVis);

            return () => {
                window.removeEventListener("pagehide", onHide);
                document.removeEventListener("visibilitychange", onVis);
            };
        }, rootRef);

        return () => ctx.revert();
    }, [skipIntro]);

    return (
        <div ref={rootRef} className="opacity-0 bg-mainbrown h-700 relative">
            {/* INTRO OVERLAY */}
            <div
                className="intro fixed inset-0 z-[60] bg-mainbrown flex items-center justify-center select-none"
                aria-hidden="true"
                style={{ display: skipIntro ? ("none" as const) : undefined }}
            >
                <h1
                    className="intro-word font-sourceserif4-18pt-regular tracking-tighter
                    text-maingray scale-x-90 text-[18vw] md:text-[220px] leading-none
                    px-6 text-center"
                    style={{
                        WebkitFontSmoothing: "antialiased",
                        MozOsxFontSmoothing: "grayscale",
                    }}
                >
                    {WORD.split("").map((ch, i) => (
                        <span
                            key={i}
                            className="intro-char inline-block will-change-transform"
                            style={{ perspective: "600px" }}
                        >
                            {ch === " " ? <span className="inline-block w-[0.3em]" /> : ch}
                        </span>
                    ))}
                </h1>
            </div>

            {/* NAV */}
            <div className="animate-nav">
                <HomeNavbar />
            </div>

            {/* HERO */}
            <div className="grid grid-cols-1 md:grid-cols-2 pt-5 px-4 gap-5 items-start min-h-250">
                <div
                    className="image-reveal relative overflow-hidden rounded-lg
                    [clip-path:inset(0_0_40px_0_round_0.5rem)]"
                >
                    <img
                        src={MainImage}
                        alt="BoilerMate hero"
                        className="hero-img block w-full h-auto"
                        loading="eager"
                        decoding="async"
                    />
                    <div className="image-wipe absolute inset-0 bg-mainbrown rounded-inherit pointer-events-none" />
                </div>

                <div className="pt-10 flex flex-col justify-start origin-right items-end">
                    <div className="overflow-hidden w-full flex justify-end">
                        <h1 className="line font-sourceserif4-18pt-regular tracking-tighter scale-x-90 text-maingray origin-left text-[22vw] md:text-[230px] leading-none">
                            Boiler
                        </h1>
                    </div>
                    <div className="overflow-hidden w-full flex justify-end -mt-4 md:-mt-10">
                        <h1 className="line font-sourceserif4-18pt-regular tracking-tighter scale-x-90 text-maingray origin-left text-[22vw] md:text-[230px] leading-none">
                            Mate
                        </h1>
                    </div>

                    <div className="overflow-hidden w-full flex justify-end">
                        <h3 className="subtitle font-sourceserif4-18pt-light tracking-tighter scale-x-90 text-maingray text-[7vw] md:text-[55px] leading-tight text-right pt-8">
                            Purdue’s Number 1 Roommate Matching Solution
                        </h3>
                    </div>
                </div>
            </div>

            {/* SECTION BELOW */}
            <div className="bg-sharkgray w-full h-250 z-10 bm-section">{/* ← added bm-section */}
                <div className="pt-10 grid grid-cols-2">
                    <div className="pl-10">
                        <h1 className="font-sourceserif4-18pt-regular text-white text-[130px] scale-x-90 pt-40 leading-none bm-title">
                            {/* ↑ added bm-title */}
                            BoilerMate
                        </h1>

                        <a href="#faq" className="pl-10 font-sourceserif4-18pt-light text-white/85 text-[40px] scale-x-90 hover:underline transition-all">
                            Learn more
                        </a>
                    </div>

                    <div className="flex flex-col gap-15 pt-20 text-right pr-30">
                        <p className="font-roboto-light text-white text-[50px] bm-step">
                            {/* ↑ added bm-step */}
                            1. Create your account
                        </p>
                        <div className="h-[1px] w-full bg-grayline my-2 bm-divider" />
                        {/* ↑ added bm-divider */}
                        <p className="font-roboto-light text-white text-[50px] bm-step">
                            2. Post a listing or join one
                        </p>
                        <div className="h-[1px] w-full bg-grayline my-2 bm-divider" />
                        <p className="font-roboto-light text-white text-[50px] bm-step">
                            3. Meet your new roomate
                        </p>
                        <div className="h-[1px] w-full bg-grayline my-2 bm-divider" />
                        <p className="font-roboto-light text-white text-[50px] bm-step">
                            4. Enjoy your new home!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

