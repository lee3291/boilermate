import { useRef, useLayoutEffect, useMemo } from 'react';
import gsap from 'gsap';
import accountIcon from '@/assets/images/account.png';

export default function Navbar() {
    const lettersRef = useRef<Array<HTMLSpanElement | null>>([]);
    const brandRef = useRef<HTMLAnchorElement | null>(null);
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const brandText = 'BoilerMate';
  const chars = useMemo(() => brandText.split(''), []);

  useLayoutEffect(() => {
    if (!brandRef.current || prefersReduced) return;

    // Ensure clean-up when component unmounts or re-renders
    const ctx = gsap.context(() => {
      // Prime letters to a neutral baseline
      gsap.set(lettersRef.current, { y: 0, rotation: 0, scale: 1, filter: 'brightness(1)', textShadow: '0 0 0px rgba(255,255,255,0)' });
    }, brandRef);

    return () => ctx.revert();
  }, [prefersReduced]);

  const onEnter = () => {
    if (prefersReduced) return;

    // Fun hover timeline: pop, tilt, glow with a staggered wave
    gsap.to(lettersRef.current, {
      keyframes: [
        { y: -8, rotation: (i: number) => gsap.utils.wrap([-8, 8])(i), scale: 1.08, duration: 0.18, ease: 'power2.out' },
        { y: 0, rotation: (i: number) => gsap.utils.wrap([6, -6])(i), scale: 1.02, duration: 0.22, ease: 'back.out(2)' }
      ],
      stagger: { each: 0.03, from: 'center' }
    });

    // Subtle shimmer/glow + warmth
    gsap.to(lettersRef.current, {
      filter: 'brightness(1.15)',
      duration: 0.2,
      ease: 'power1.out'
    });
    gsap.to(lettersRef.current, {
      textShadow: '0 0 10px rgba(255, 230, 180, 0.7)',
      duration: 0.35,
      ease: 'power2.out'
    });
  };

  const onLeave = () => {
    if (prefersReduced) return;

    // Return gracefully
    gsap.to(lettersRef.current, {
      y: 0,
      rotation: 0,
      scale: 1,
      filter: 'brightness(1)',
      textShadow: '0 0 0px rgba(255,255,255,0)',
      duration: 0.35,
      ease: 'power2.out',
      stagger: { each: 0.02, from: 'edges' }
    });
  };

  return (
    <div className='sticky top-0 z-50 w-full pt-3 px-3'>
      <nav className='relative z-10 mx-auto h-16 w-full rounded-lg border border-bisonbrown bg-mainbrown px-4 md:px-6'>
        <div className='flex h-full items-center justify-between gap-4'>
          <div />
          <a
            ref={brandRef}
            href='/'
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
            className='cursor-pointer select-none font-sourceserif4-18pt-light scale-x-90 text-[30px] tracking-tight'
            aria-label='BoilerMate home'
          >
            {chars.map((ch, i) => (
              <span
                key={`${ch}-${i}`}
                ref={el => (lettersRef.current[i] = el)}
                className='inline-block will-change-transform'
                style={{ display: 'inline-block', padding: '0 1px' }}
              >
                {ch === ' ' ? '\u00A0' : ch}
              </span>
            ))}
          </a>

          <a href='/temp-account' className='flex items-center gap-2'>
            <img src={accountIcon} className='h-6 w-auto' alt='Account' />
          </a>
        </div>
      </nav>
    </div>
  );
}

