import { useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

import HomeNavbar from './components/HomeNavbar';
import Navbar from '../user/components/Navbar';
import { useAuth } from '../../contexts/AuthContext';
import MainImage from '../../assets/images/beg.webp';
import FAQRing from './components/FAQRing';

const WORD = 'BoilerMate';

const INTRO_COOLDOWN_MS = 30 * 1000;
const VISIT_KEY = 'bm_last_seen_at';
const INTRO_SESS_KEY = 'bm_intro_played';

function getSkipIntro(cooldownMs: number) {
  if (typeof window === 'undefined') return false;
  try {
    const last = Number(localStorage.getItem(VISIT_KEY));
    const recent = Number.isFinite(last) && Date.now() - last < cooldownMs;
    const sessionOnce = sessionStorage.getItem(INTRO_SESS_KEY) === '1';
    return recent || sessionOnce;
  } catch {
    return false;
  }
}

function markSeen() {
  try {
    localStorage.setItem(VISIT_KEY, String(Date.now()));
    sessionStorage.setItem(INTRO_SESS_KEY, '1');
  } catch {}
}

export default function Homepage() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const { user } = useAuth();
  const [skipIntro] = useState(() => getSkipIntro(INTRO_COOLDOWN_MS));

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const prefersReduced = window.matchMedia?.(
        '(prefers-reduced-motion: reduce)',
      )?.matches;

      gsap.set(rootRef.current, { autoAlpha: 1 });

      gsap.set('.hero-img', { scale: 1.05, filter: 'blur(6px)' });
      gsap.set('.image-wipe', { xPercent: 0 });
      gsap.set('.image-reveal', { x: -28, autoAlpha: 0 });

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      if (skipIntro) {
        gsap.set('.intro', { display: 'none' });

        if (prefersReduced) {
          gsap.set('.image-wipe', { xPercent: 100 });
          tl.from('.animate-nav', { autoAlpha: 0, duration: 0.3 })
            .to('.image-reveal', { autoAlpha: 1, x: 0, duration: 0.3 }, '-=0.1')
            .to(
              '.hero-img',
              { scale: 1, filter: 'blur(0px)', duration: 0.4 },
              '<',
            )
            .from(
              '.line',
              { autoAlpha: 0, stagger: 0.08, duration: 0.25 },
              '-=0.2',
            )
            .from('.subtitle', { autoAlpha: 0, duration: 0.3 }, '-=0.15');
        } else {
          tl.from('.animate-nav', { y: -24, autoAlpha: 0, duration: 0.6 })
            .to('.image-reveal', { x: 0, autoAlpha: 1, duration: 0.6 }, '-=0.3')
            .to(
              '.image-wipe',
              { xPercent: 100, duration: 0.9, ease: 'power2.out' },
              '<',
            )
            .to(
              '.hero-img',
              {
                scale: 1,
                filter: 'blur(0px)',
                duration: 0.9,
                ease: 'power3.out',
              },
              '<',
            )
            .from(
              '.line',
              { yPercent: 120, autoAlpha: 0, duration: 0.8, stagger: 0.08 },
              '-=1',
            )
            .from('.subtitle', { y: 20, autoAlpha: 0, duration: 0.6 }, '-=1');
        }

        markSeen();
      } else {
        gsap.set('.intro', { autoAlpha: 1 });
        gsap.set('.intro-char', {
          yPercent: prefersReduced ? 0 : 120,
          rotateX: prefersReduced ? 0 : -90,
          transformPerspective: 600,
          transformOrigin: '50% 0%',
          autoAlpha: prefersReduced ? 1 : 0,
        });

        if (prefersReduced) {
          tl.to('.intro', { autoAlpha: 1, duration: 0.1 })
            .to('.intro', { yPercent: -100, duration: 0.4, ease: 'power2.in' })
            .set('.intro', { display: 'none' })
            .set('.image-wipe', { xPercent: 100 })
            .from('.animate-nav', { autoAlpha: 0, duration: 0.3 })
            .to('.image-reveal', { autoAlpha: 1, x: 0, duration: 0.3 }, '-=0.1')
            .to(
              '.hero-img',
              { scale: 1, filter: 'blur(0px)', duration: 0.4 },
              '<',
            )
            .from(
              '.line',
              { autoAlpha: 0, stagger: 0.08, duration: 0.25 },
              '-=0.2',
            )
            .from('.subtitle', { autoAlpha: 0, duration: 0.3 }, '-=0.15');
        } else {
          tl.to('.intro-char', {
            yPercent: 0,
            rotateX: 0,
            autoAlpha: 1,
            duration: 0.7,
            stagger: 0.05,
            ease: 'power3.out',
          })
            .fromTo(
              '.intro-word',
              { filter: 'drop-shadow(0 0 0px rgba(255,255,255,0))' },
              {
                filter: 'drop-shadow(0 0 16px rgba(255,255,255,0.35))',
                duration: 0.5,
                yoyo: true,
                repeat: 1,
                ease: 'power2.out',
              },
            )
            .to(
              '.intro',
              { yPercent: -100, duration: 0.8, ease: 'power4.in' },
              '-=1',
            )
            .set('.intro', { display: 'none' })
            .from(
              '.animate-nav',
              { y: -24, autoAlpha: 0, duration: 0.6 },
              '-=2',
            )
            .to('.image-reveal', { x: 0, autoAlpha: 1, duration: 0.6 }, '-=0.3')
            .to(
              '.image-wipe',
              { xPercent: 100, duration: 0.9, ease: 'power2.out' },
              '<',
            )
            .to(
              '.hero-img',
              {
                scale: 1,
                filter: 'blur(0px)',
                duration: 0.9,
                ease: 'power3.out',
              },
              '<',
            )
            .from(
              '.line',
              { yPercent: 120, autoAlpha: 0, duration: 0.8, stagger: 0.08 },
              '-=1',
            )
            .from('.subtitle', { y: 20, autoAlpha: 0, duration: 0.6 }, '-=1');
        }

        markSeen();
        tl.eventCallback('onComplete', markSeen);
      }

      if (prefersReduced) {
        gsap.set('.bm-title', { autoAlpha: 1, y: 0 });
        gsap.set('.bm-step', { autoAlpha: 1, x: 0 });
        gsap.set('.bm-divider', { scaleX: 1, transformOrigin: 'right center' });
      } else {
        const trigger = {
          trigger: '.bm-section',
          start: 'top 70%',
          once: true,
        };

        gsap.from('.bm-title', {
          y: 40,
          autoAlpha: 0,
          duration: 0.6,
          ease: 'power3.out',
          scrollTrigger: trigger,
        });

        gsap.from('.bm-step', {
          x: 40,
          autoAlpha: 0,
          duration: 0.5,
          ease: 'power3.out',
          stagger: 0.12,
          scrollTrigger: trigger,
        });

        gsap.from('.bm-divider', {
          scaleX: 0,
          transformOrigin: 'right center',
          duration: 0.4,
          ease: 'power2.out',
          stagger: 0.12,
          scrollTrigger: trigger,
        });
      }

      const onHide = () => markSeen();
      const onVis = () => {
        if (document.visibilityState === 'hidden') markSeen();
      };
      window.addEventListener('pagehide', onHide);
      document.addEventListener('visibilitychange', onVis);

      return () => {
        window.removeEventListener('pagehide', onHide);
        document.removeEventListener('visibilitychange', onVis);
      };
    }, rootRef);

    return () => ctx.revert();
  }, [skipIntro]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const btn = rootRef.current?.querySelector(
        'a[href="/signup"] > div',
      ) as HTMLElement | null;
      if (!btn) return;
      const content = btn.querySelector(':scope > div') as HTMLElement | null;
      const txt = btn.querySelector('p') as HTMLElement | null;
      if (!content || !txt) return;

      btn.classList.add('relative', 'overflow-hidden');
      content.classList.add('relative', 'z-10');

      const fill = document.createElement('span');
      fill.className =
        'absolute inset-0 z-0 bg-white origin-bottom scale-y-0 rounded-[100em] will-change-transform pointer-events-none';
      (fill.style as any).transformOrigin = 'bottom center';
      btn.appendChild(fill);

      const shine = document.createElement('span');
      shine.className =
        'absolute inset-x-0 bottom-0 z-10 h-1/2 opacity-0 pointer-events-none';
      shine.style.background =
        'linear-gradient(to top, rgba(255,255,255,0.65), rgba(255,255,255,0.0) 60%)';
      btn.appendChild(shine);

      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: 'power2.out' },
      });
      tl.to(fill, { scaleY: 1, duration: 0.55 }, 0)
        .to(shine, { opacity: 1, yPercent: -30, duration: 0.55 }, 0)
        .to(txt, { color: '#000000', duration: 0.4 }, 0)
        .to(btn, { y: -5, duration: 0.12, ease: 'power2.out' })
        .to(btn, { y: 0, duration: 0.28, ease: 'bounce.out' });

      const onEnter = () => tl.play();
      const onLeave = () => tl.reverse();
      btn.addEventListener('mouseenter', onEnter);
      btn.addEventListener('mouseleave', onLeave);
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className='bg-mainbrown relative h-760 opacity-0'>
      <div
        className='intro bg-mainbrown fixed inset-0 z-60 flex items-center justify-center select-none'
        aria-hidden='true'
        style={{ display: skipIntro ? ('none' as const) : undefined }}
      >
        <h1
          className='intro-word font-sourceserif4-18pt-regular text-maingray scale-x-90 px-6 text-center text-[18vw] leading-none tracking-tighter md:text-[220px]'
          style={{
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
          }}
        >
          {WORD.split('').map((ch, i) => (
            <span
              key={i}
              className='intro-char inline-block will-change-transform'
              style={{ perspective: '600px' }}
            >
              {ch === ' ' ? <span className='inline-block w-[0.3em]' /> : ch}
            </span>
          ))}
        </h1>
      </div>

      <div className='animate-nav'>{user ? <Navbar /> : <HomeNavbar />}</div>

      <div className='grid min-h-250 grid-cols-1 items-start gap-5 px-4 pt-5 md:grid-cols-2'>
        <div className='image-reveal relative overflow-hidden rounded-lg [clip-path:inset(0_0_40px_0_round_0.5rem)]'>
          <img
            src={MainImage}
            alt='BoilerMate hero'
            className='hero-img block h-auto w-full'
            loading='eager'
            decoding='async'
          />
          <div className='image-wipe bg-mainbrown rounded-inherit pointer-events-none absolute inset-0' />
        </div>

        <div className='flex origin-right flex-col items-end justify-start pt-10'>
          <div className='flex w-full justify-end overflow-hidden'>
            <h1 className='line font-sourceserif4-18pt-regular text-maingray origin-left scale-x-90 text-[22vw] leading-none tracking-tighter md:text-[230px]'>
              Boiler
            </h1>
          </div>
          <div className='-mt-4 flex w-full justify-end overflow-hidden md:-mt-10'>
            <h1 className='line font-sourceserif4-18pt-regular text-maingray origin-left scale-x-90 text-[22vw] leading-none tracking-tighter md:text-[230px]'>
              Mate
            </h1>
          </div>

          <div className='flex w-full justify-end overflow-hidden'>
            <h3 className='subtitle font-sourceserif4-18pt-light text-maingray scale-x-90 pt-8 text-right text-[7vw] leading-tight tracking-tighter md:text-[55px]'>
              Purdue’s Number 1 Roommate Matching Solution
            </h3>
          </div>
        </div>
      </div>

      <div className='bg-sharkgray bm-section z-10 h-250 w-full'>
        <div className='grid grid-cols-2 pt-10'>
          <div className='pl-10'>
            <h1 className='font-sourceserif4-18pt-regular bm-title scale-x-90 pt-40 text-[130px] leading-none text-white'>
              BoilerMate
            </h1>

            <div className='flex flex-col'>
              <a
                href='/listings'
                className='font-sourceserif4-18pt-light scale-x-90 text-[40px] text-white/95 transition-all hover:underline'
              >
                Start creating a listing
              </a>
              <a
                href='#faq'
                className='font-sourceserif4-18pt-light scale-x-90 text-[40px] text-white/85 transition-all hover:underline'
              >
                Learn more
              </a>
            </div>
          </div>

          <div className='flex flex-col gap-15 pt-20 pr-30 text-right'>
            <p className='font-roboto-light bm-step text-[50px] text-white'>
              1. Create your account
            </p>
            <div className='bg-grayline bm-divider my-2 h-px w-full' />
            <p className='font-roboto-light bm-step text-[50px] text-white'>
              2. Post a listing or join one
            </p>
            <div className='bg-grayline bm-divider my-2 h-px w-full' />
            <p className='font-roboto-light bm-step text-[50px] text-white'>
              3. Meet your new roomate
            </p>
            <div className='bg-grayline bm-divider my-2 h-px w-full' />
            <p className='font-roboto-light bm-step text-[50px] text-white'>
              4. Enjoy your new home!
            </p>
          </div>
        </div>
      </div>

      <div className='bg-mainbrown h-250 pt-17'>
        <FAQRing />
      </div>

      <div className='bg-sharkgray z-10 h-220 w-full'>
        <h1 className='font-sourceserif4-18pt-regular pt-60 text-center text-[100px] text-white'>
          Get Started with BoilerMate!
        </h1>

        <div className='flex justify-center pt-10'>
          <a href='/signup'>
            <div className='font-sourceserif4-18pt-regular h-30 w-90 rounded-[100em] border border-white text-[30px] tracking-wide text-white'>
              <div className='flex h-full items-center justify-center'>
                <p>Sign Up</p>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
