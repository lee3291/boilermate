import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";

const IconX = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
        <path d="M13.58 10.7 21.5 2h-1.89l-6.78 7.38L7.57 2H2l8.35 12.08L2 22h1.89l7.19-7.83L16.43 22H22l-8.42-11.3Z" fill="currentColor"/>
    </svg>
);
const IconFacebook = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
        <path d="M22 12a10 10 0 1 0-11.56 9.87v-6.98H7.9V12h2.54V9.8c0-2.5 1.49-3.88 3.77-3.88 1.09 0 2.23.19 2.23.19v2.45h-1.26c-1.24 0-1.62.77-1.62 1.56V12h2.76l-.44 2.89h-2.32v6.98A10 10 0 0 0 22 12Z" fill="currentColor"/>
    </svg>
);
const IconLinkedIn = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
        <path d="M20.45 20.45h-3.55v-5.59c0-1.33-.03-3.03-1.85-3.03-1.86 0-2.14 1.45-2.14 2.94v5.68H9.36V9.56h3.41v1.49h.05c.48-.9 1.65-1.85 3.4-1.85 3.64 0 4.31 2.4 4.31 5.51v5.74ZM5.34 8.07a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM3.57 20.45h3.55V9.56H3.57v10.89Z" fill="currentColor"/>
    </svg>
);
const IconWhatsApp = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
        <path d="M20.52 3.48A11.94 11.94 0 0 0 12.06 0C5.53 0 .25 5.29.25 11.81c0 2.08.55 4.13 1.6 5.93L0 24l6.43-1.8a11.6 11.6 0 0 0 5.63 1.47h.01c6.53 0 11.81-5.29 11.83-11.8.01-3.15-1.22-6.11-3.38-8.39ZM12.07 21.3h-.01a9.51 9.51 0 0 1-4.86-1.32l-.35-.2-3.82 1.07 1.02-3.74-.23-.38a9.46 9.46 0 0 1-1.45-5.02c0-5.25 4.27-9.52 9.53-9.52 2.55 0 4.95.99 6.75 2.79a9.51 9.51 0 0 1 2.79 6.73c-.01 5.25-4.29 9.59-9.57 9.59Zm5.54-7.19c-.3-.15-1.78-.88-2.05-.98-.27-.1-.47-.15-.67.15-.2.29-.77.98-.95 1.18-.18.2-.35.22-.65.08-.3-.15-1.27-.47-2.42-1.5-.89-.79-1.49-1.77-1.67-2.07-.17-.29-.02-.45.13-.6.13-.13.3-.35.45-.53.15-.18.2-.29.3-.48.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.22-.24-.58-.48-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.28.29-1.05 1.03-1.05 2.5s1.08 2.88 1.23 3.08c.15.2 2.13 3.26 5.17 4.45.72.31 1.28.49 1.71.63.72.23 1.37.2 1.89.12.58-.09 1.78-.73 2.03-1.43.25-.7.25-1.29.17-1.43-.07-.15-.26-.22-.56-.37Z" fill="currentColor"/>
    </svg>
);
const IconMail = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
        <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4-8 5L4 8V6l8 5 8-5v2Z" fill="currentColor"/>
    </svg>
);
const IconSMS = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
        <path d="M21 4H3a2 2 0 0 0-2 2v11.5A2.5 2.5 0 0 0 3.5 20H18l3 3V6a2 2 0 0 0-2-2Z" fill="currentColor"/>
    </svg>
);
const IconLink = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
        <path d="M10.59 13.41a4 4 0 0 0 5.66 0l2.12-2.12a4 4 0 0 0-5.66-5.66l-1.06 1.06" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M13.41 10.59a4 4 0 0 0-5.66 0L5.63 12.7a4 4 0 0 0 5.66 5.66l1.06-1.06" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

function ModalPortal({ children }: { children: React.ReactNode }) {
    if (typeof document === "undefined") return null;
    return createPortal(children, document.body);
}

type ShareButtonsProps = {
    id: string;
    title: string;
    author?: string;
    price?: string;
    body?: string;
    location?: string;
    moveInStart?: string;
    moveInEnd?: string;
    roommates?: string;
    className?: string;
};

const shorten = (str: string, max = 180) => {
    if (!str) return "";
    const s = str.replace(/\s+/g, " ").trim();
    return s.length > max ? s.slice(0, max - 1).trimEnd() + "…" : s;
};

export default function ShareButtons({
    id,
    title,
    author,
    price,
    body,
    location,
    moveInStart,
    moveInEnd,
    roommates,
    className = "",
}: ShareButtonsProps) {
    const [open, setOpen] = useState(false);

    const overlayRef = useRef<HTMLDivElement | null>(null);
    const shellRef = useRef<HTMLDivElement | null>(null);
    const panelRef = useRef<HTMLDivElement | null>(null);
    const tlRef = useRef<gsap.core.Timeline | null>(null);

    const url = useMemo(() => {
        if (typeof window === "undefined") return "";
        try {
            return new URL(`/listings/${encodeURIComponent(id)}`, window.location.origin).toString();
        } catch {
            return "";
        }
    }, [id]);

    const shareText = useMemo(() => {
        const intro = "Using BoilerMate I'm trying to find a roommate for this listing, check it out:";
        const head = title ? `🏠 ${title}` : "🏠 Great room available";
        const facts: string[] = [];
        if (location) facts.push(`📍 ${location}`);
        if (price) facts.push(`💸 ${price}`);
        if (roommates) facts.push(`👥 Looking for ${roommates} roommate${roommates === "1" ? "" : "s"}`);
        const dateRange = [moveInStart, moveInEnd].filter(Boolean).join(" – ");
        if (dateRange) facts.push(`📅 Move-in: ${dateRange}`);
        const desc = body ? `📝 ${shorten(body, 200)}` : "";
        return [intro, head, facts.join(" • "), desc, "Interested? Check the listing:"]
            .filter(Boolean)
            .join("\n");
    }, [title, location, price, roommates, moveInStart, moveInEnd, body]);

    const shareTitle = title || "Roommate listing";
    const shareBodyWithLink = `${shareText}\n${url}`;
    const encoded = {
        url: encodeURIComponent(url),
        text: encodeURIComponent(shareText),
        title: encodeURIComponent(shareTitle),
        full: encodeURIComponent(shareBodyWithLink),
    };

    const animateOpen = () => {
        if (!overlayRef.current || !panelRef.current || !shellRef.current) return;
        const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

        gsap.set([overlayRef.current, shellRef.current], { display: "block" });
        gsap.set(overlayRef.current, { opacity: 0 });
        gsap.set(panelRef.current, { opacity: 0, y: -12, scale: 0.96 });

        const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
        if (reduce) {
            tl.set(overlayRef.current, { opacity: 1 }).set(panelRef.current, { opacity: 1, y: 0, scale: 1 });
        } else {
            tl.to(overlayRef.current, { opacity: 1, duration: 0.2 }, 0)
                .to(panelRef.current, { opacity: 1, y: 0, scale: 1, duration: 0.24 }, 0.02);
        }
        tlRef.current = tl;
    };

    const animateClose = (onFinish?: () => void) => {
        if (!overlayRef.current || !panelRef.current || !shellRef.current) { onFinish?.(); return; }
        const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

        const tl = gsap.timeline({
            defaults: { ease: "power2.in" },
            onComplete: () => {
                gsap.set([overlayRef.current, shellRef.current], { display: "none" });
                onFinish?.();
            },
        });

        if (reduce) {
            tl.set(panelRef.current, { opacity: 0 }).set(overlayRef.current, { opacity: 0 });
        } else {
            tl.to(panelRef.current, { opacity: 0, y: -8, scale: 0.97, duration: 0.16 }, 0)
                .to(overlayRef.current, { opacity: 0, duration: 0.16 }, 0.02);
        }
        tlRef.current = tl;
    };

    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && handleClose();
        document.addEventListener("keydown", onKey);
        animateOpen();
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = prev;
            tlRef.current?.kill();
        };
    }, [open]);

    const handleOpen = () => setOpen(true);
    const handleClose = () => animateClose(() => setOpen(false));

    const openWindow = (href: string) => {
        const w = 600, h = 540;
        const screenLeft = (window.screenX ?? window.screenLeft ?? 0);
        const screenTop  = (window.screenY ?? window.screenTop  ?? 0);

        const winWidth  = (window.outerWidth ?? document.documentElement.clientWidth ?? window.innerWidth ?? w);
        const winHeight = (window.outerHeight ?? document.documentElement.clientHeight ?? window.innerHeight ?? h);

        const left = Math.max(screenLeft + (winWidth  - w) / 2, 0);
        const top  = Math.max(screenTop  + (winHeight - h) / 2, 0);

        const features = [
            `width=${w}`, `height=${h}`,
            `left=${left}`, `top=${top}`,
            "noopener", "resizable=yes", "scrollbars=yes", "toolbar=no", "location=no", "status=no", "menubar=no"
        ].join(",");

        const win = window.open(href, "_blank", features);
        if (!win) alert("Your browser blocked the share popup. Please allow popups for this site and try again.");
        else win.focus?.();
    };
    const shareX = () => { openWindow(`https://twitter.com/intent/tweet?text=${encoded.full}`); handleClose(); };
    const shareFacebook = () => { openWindow(`https://www.facebook.com/sharer/sharer.php?u=${encoded.url}`); handleClose(); };
    const shareLinkedIn = () => { openWindow(`https://www.linkedin.com/sharing/share-offsite/?url=${encoded.url}`); handleClose(); };
    const shareWhatsApp = () => { openWindow(`https://api.whatsapp.com/send?text=${encoded.full}`); handleClose(); };
    const shareEmail = () => { window.location.href = `mailto:?subject=${encoded.title}&body=${encoded.full}`; handleClose(); };
    const shareSMS = () => { window.location.href = `sms:?&body=${encoded.full}`; handleClose(); };
    const copyLink = async () => {
        try { await navigator.clipboard.writeText(url); alert("Link copied!"); }
        catch { prompt("Copy this link:", url); }
        finally { handleClose(); }
    };

    function IconBtn({
        onClick, label, children,
    }: { onClick: () => void; label: string; children: React.ReactNode }) {
        const btnRef = useRef<HTMLButtonElement | null>(null);

        useEffect(() => {
            const el = btnRef.current;
            if (!el) return;

            const enter = () => {
                gsap.to(el, {
                    duration: 0.18,
                    scale: 1.08,
                    y: -2,
                    boxShadow: "0 8px 18px rgba(0,0,0,0.08)",
                    ease: "power2.out",
                });
            };
            const leave = () => {
                gsap.to(el, {
                    duration: 0.18,
                    scale: 1,
                    y: 0,
                    boxShadow: "0 0 0 rgba(0,0,0,0)",
                    ease: "power2.out",
                });
            };

            el.addEventListener("mouseenter", enter);
            el.addEventListener("mouseleave", leave);
            el.addEventListener("focus", enter);
            el.addEventListener("blur", leave);

            return () => {
                el.removeEventListener("mouseenter", enter);
                el.removeEventListener("mouseleave", leave);
                el.removeEventListener("focus", enter);
                el.removeEventListener("blur", leave);
            };
        }, []);

        return (
            <button
                ref={btnRef}
                onClick={onClick}
                aria-label={label}
                title={label}
                className="flex items-center justify-center h-11 w-11 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
                {children}
            </button>
        );
    }

    return (
        <div className={`relative inline-block ${className}`}>
            <button
                onClick={handleOpen}
                className="mt-10 h-12 w-30 rounded-3xl border border-black font-roboto-light bg-white cursor-pointer"
                aria-haspopup="dialog"
                aria-expanded={open}
            >
                Share
            </button>

            <ModalPortal>
                <div
                    ref={overlayRef}
                    onClick={handleClose}
                    className="fixed inset-0 bg-black/50 z-[9999]"
                    style={{ display: "none" }}
                    aria-hidden="true"
                    />
                <div
                    ref={shellRef}
                    className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
                    style={{ display: "none" }}
                    onClick={handleClose}
                >
                    <div
                        ref={panelRef}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Share listing"
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-lg rounded-3xl border border-gray-200 bg-white shadow-2xl overflow-hidden"
                    >
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
                            <h3 className="text-lg font-sourceserif4-18pt-regular text-[30px]">Share this listing</h3>
                            <button
                                onClick={handleClose}
                                className="rounded-full px-2 py-1 hover:bg-gray-100"
                                aria-label="Close share dialog"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="px-6 py-5 space-y-3 font-roboto-regular">
                            <p className="text-[18px]">I’m looking for a roommate!</p>

                            <div className="text-[17px] text-gray-700 whitespace-pre-line">
                                {shareText.split("\n").map((line, i) => (
                                    <p key={i}>{line}</p>
                                ))}
                            </div>

                            <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-sm text-blue-600 underline break-all"
                            >
                                {url}
                            </a>

                            <div className="grid grid-cols-7 gap-2 pt-3">
                                <IconBtn onClick={shareX} label="Share on X">
                                    <IconX className="w-5 h-5" />
                                </IconBtn>
                                <IconBtn onClick={shareFacebook} label="Share on Facebook">
                                    <IconFacebook className="w-5 h-5" />
                                </IconBtn>
                                <IconBtn onClick={shareLinkedIn} label="Share on LinkedIn">
                                    <IconLinkedIn className="w-5 h-5" />
                                </IconBtn>
                                <IconBtn onClick={shareWhatsApp} label="Share on WhatsApp">
                                    <IconWhatsApp className="w-5 h-5" />
                                </IconBtn>
                                <IconBtn onClick={shareEmail} label="Share via Email">
                                    <IconMail className="w-5 h-5" />
                                </IconBtn>
                                <IconBtn onClick={shareSMS} label="Share via SMS">
                                    <IconSMS className="w-5 h-5" />
                                </IconBtn>
                                <IconBtn onClick={copyLink} label="Copy link">
                                    <IconLink className="w-5 h-5" />
                                </IconBtn>
                            </div>
                        </div>
                    </div>
                </div>
            </ModalPortal>
        </div>
    );
}

