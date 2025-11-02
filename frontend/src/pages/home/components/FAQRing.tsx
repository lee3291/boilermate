import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";

type FAQItem = { q: string; a: string };

const FAQ_ITEMS: FAQItem[] = [
    { q: "What is BoilerMate?", a: "A Purdue-only platform for safe roommate matching and housing listings with verified student identities." },
    { q: "Who can join?", a: "Current Purdue students. Sign in with your Purdue email to access the platform." },
    { q: "How does verification work?", a: "All users authenticate with Purdue email. Uploading a Purdue ID grants a verified badge and unlocks additional features." },
    { q: "What can I do on BoilerMate?", a: "Create a profile, set roommate preferences, discover and save matches, message peers, and post or browse housing listings." },
    { q: "How are matches generated?", a: "We compare stated and hidden preferences (e.g., pets, smoking, cleanliness, budget) to calculate compatibility scores." },
    { q: "How are safety and trust handled?", a: "Email/ID verification, reporting tools, admin moderation (warnings/bans), and reCAPTCHA/rate limiting reduce fraud and abuse." },
    { q: "What can I do with listings?", a: "Post, save, share, and flag listings; track views; mark contacted/archived/resolved; and explore via map and filters." },
    { q: "Can I deactivate or delete my account?", a: "You may deactivate your profile (hide activity) or permanently delete your account at any time." },
];

// Minimal modal
function Modal({
    open,
    onClose,
    title,
    children,
}: {
    open: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}) {
    if (!open) return null;
    return (
        <div
            className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            onClick={onClose}
        >
            <div
                className="w-full max-w-lg rounded-2xl bg-mainbrown text-maingray shadow-2xl p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-4">
                    <h3 className="font-sourceserif4-18pt-regular text-[28px] leading-tight">{title}</h3>
                    <button
                        className="font-roboto-light text-maingray/70 hover:text-maingray transition"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>
                <div className="mt-4 font-roboto-light text-[16px] leading-relaxed">{children}</div>
            </div>
        </div>
    );
}

/**
 * FAQRing — labels float gently in place (no rotation), text-only chips,
 * and the "FAQ" title is centered inside the ring (no subtitle).
 */
export default function FAQRing() {
    const ringRef = useRef<HTMLDivElement | null>(null);
    const [active, setActive] = useState<FAQItem | null>(null);

    useLayoutEffect(() => {
        const el = ringRef.current;
        if (!el) return;

        const prefersReduced =
            typeof window !== "undefined" &&
                window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

        const ctx = gsap.context(() => {
            gsap.from(".faq-section-in", { autoAlpha: 0, y: 24, duration: 0.5, ease: "power3.out" });

            // Float each label in place (no rotation)
            if (!prefersReduced) {
                const chips = gsap.utils.toArray<HTMLButtonElement>(".faq-chip");
                chips.forEach((chip, i) => {
                    const dur = gsap.utils.random(2.5, 4.0);
                    const yAmt = gsap.utils.random(8, 16);
                    const xAmt = gsap.utils.random(4, 10);
                    gsap.to(chip, {
                        y: `+=${yAmt}`,
                        x: `+=${xAmt}`,
                        duration: dur,
                        ease: "sine.inOut",
                        yoyo: true,
                        repeat: -1,
                        delay: i * 0.08,
                    });
                });
            } else {
                gsap.set(".faq-chip", { x: 0, y: 0 });
            }
        }, ringRef);

        return () => ctx.revert();
    }, []);

    // Layout ring positions
    const RADIUS = 300; // px
    const size = FAQ_ITEMS.length;

    return (
        <section id="faq" className="bg-mainbrown w-full">
            <div className="faq-section-in mx-auto max-w-6xl px-6 py-28 md:py-36">
                {/* Ring only (title inside) */}
                <div className="relative mx-auto" style={{ width: 520, height: 520, maxWidth: "90vw", maxHeight: "90vw" }}>
                    {/* Centered title inside the ring */}
                    <div
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                        flex items-center justify-center pointer-events-none select-none"
                        aria-hidden="true"
                    >
                        <h2 className="font-sourceserif4-18pt-regular text-maingray text-[22vw] md:text-[160px] leading-none scale-x-90">
                            FAQ
                        </h2>
                    </div>

                    {/* Static ring wrapper (no rotation) */}
                    <div ref={ringRef} className="absolute inset-0">
                        {FAQ_ITEMS.map((item, i) => {
                            const angle = (i / size) * Math.PI * 2; // radians
                            const x = Math.cos(angle) * RADIUS;
                            const y = Math.sin(angle) * RADIUS;
                            return (
                                <button
                                    key={i}
                                    onClick={() => setActive(item)}
                                    style={{
                                        left: "50%",
                                        top: "50%",
                                        transform: `translate(calc(${x}px - 50%), calc(${y}px - 50%))`,
                                    }}
                                    className={[
                                        "faq-chip absolute inline-block",
                                        // PURE TEXT: no bubble, no border, no bg
                                        "bg-transparent border-0 p-0",
                                        "font-sourceserif4-18pt-regular text-maingray text-base md:text-[25px]",
                                        "hover:underline focus:underline focus:outline-none",
                                        "transition-[transform,opacity] will-change-transform cursor-pointer",
                                    ].join(" ")}
                                >
                                    {item.q}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Modal */}
            <Modal open={!!active} onClose={() => setActive(null)} title={active?.q ?? ""}>
                {active?.a}
            </Modal>
        </section>
    );
}

