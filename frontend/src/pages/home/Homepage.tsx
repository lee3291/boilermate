import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";

import HomeNavbar from "./components/HomeNavbar";
import MainImage from "../../assets/images/beg.webp";

export default function Homepage() {
    const rootRef = useRef<HTMLDivElement | null>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
            const prefersReduced =
                window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

            gsap.set(rootRef.current, { autoAlpha: 1 });

            gsap.set(".hero-img", { scale: 1.05, filter: "blur(6px)" });
            gsap.set(".image-wipe", { xPercent: 0 });
            gsap.set(".image-reveal", { x: -28, autoAlpha: 0 });

            if (prefersReduced) {

                gsap.set(".image-wipe", { xPercent: 100 });
                tl.from(".animate-nav", { autoAlpha: 0, duration: 0.3 })
                    .to(".image-reveal", { autoAlpha: 1, x: 0, duration: 0.3 }, "-=0.1")
                    .to(".hero-img", { scale: 1, filter: "blur(0px)", duration: 0.4 }, "<")
                    .from(".line", { autoAlpha: 0, stagger: 0.08, duration: 0.25 }, "-=0.2")
                    .from(".subtitle", { autoAlpha: 0, duration: 0.3 }, "-=0.15");
            } else {

                tl.from(".animate-nav", { y: -24, autoAlpha: 0, duration: 0.6 })

                    .to(
                        ".image-reveal",
                        { x: 0, autoAlpha: 1, duration: 0.6 },
                        "-=0.3"
                    )

                    .to(
                        ".image-wipe",
                        { xPercent: 100, duration: 0.9, ease: "power2.out" },
                        "<"
                    )

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
        }, rootRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={rootRef} className="opacity-0 bg-mainbrown min-h-screen">
            <div className="animate-nav">
                <HomeNavbar />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 pt-5 px-4 gap-5 items-start">
                <div className="image-reveal relative overflow-hidden rounded-lg will-change-transform">
                    <img
                        src={MainImage}
                        alt="BoilerMate hero"
                        className="hero-img w-full h-auto block"
                        loading="eager"
                        decoding="async"
                        />
                    <div className="image-wipe absolute inset-0 bg-mainbrown" />
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
                        <h3 className="subtitle font-sourceserif4-18pt-light tracking-tighter scale-x-90 text-maingray text-[7vw] md:text-[55px] leading-none text-right pt-8 md:pt-10">
                            Purdue’s Number 1 Roomate Matching Solution
                        </h3>
                    </div>
                </div>
            </div>
        </div>
    );
}

