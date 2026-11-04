"use client";

import { useEffect, useRef, useState } from "react";

const SLIDES = [
  {
    eyebrow: "Earn alongside your job",
    title: "Your shift pays the bills. Your evenings can pay for dreams.",
    body: "Six evening visits a week can add about ₹15,600 a month, without leaving your hospital job.",
    stat: "₹15,600 extra a month",
    quote: "I visit three patients near home after my shift. It pays for my daughter's tuition.",
    by: "Soumya Joseph",
    role: "Staff Nurse",
  },
  {
    eyebrow: "What is Medico To Home",
    title: "The hospital, at the patient's door.",
    body: "Families book verified Medicos for care at home. We handle the booking, directions, payment and support, so you can focus on the patient.",
    quote: "My elderly patients no longer travel two hours for a check-up. I go to them.",
    by: "Dr. Reshma Unnikrishnan",
    role: "Geriatrician",
  },
  {
    eyebrow: "Your hours, your area",
    title: "Switch on when you're free. Say no anytime.",
    body: "No minimum hours. Choose the days, the times and how far you travel. Turn yourself off for exams, holidays or family.",
    quote: "I only take visits on my days off, within 8 km. Nobody pushes me for more.",
    by: "Midhun Sasi",
    role: "Physiotherapist",
  },
  {
    eyebrow: "Be proud",
    title: "You're not just a provider. You're family to them.",
    body: "Insured visits, verified patients and an SOS button on every visit. You are never on your own.",
    quote: "Amma's family calls me before they call their own relatives. That trust means everything.",
    by: "Sindhu Rajan",
    role: "Elderly Caregiver",
  },
];

const INTERVAL_MS = 5000;
const initials = (name: string) => name.replace("Dr. ", "").split(" ").map((w) => w[0]).slice(0, 2).join("");

/** Why join, one slide at a time: moves every 5 s, pauses on hover, swipes on touch. */
export function BenefitsSlider() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const go = (i: number) => setIndex((i + SLIDES.length) % SLIDES.length);

  useEffect(() => {
    if (paused) return;
    const timer = setTimeout(() => setIndex((i) => (i + 1) % SLIDES.length), INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [index, paused]);

  const slide = SLIDES[index]!;
  return (
    <section
      aria-roledescription="carousel"
      aria-label="Why Medicos join"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => (touchX.current = e.touches[0]?.clientX ?? null)}
      onTouchEnd={(e) => {
        const start = touchX.current;
        const end = e.changedTouches[0]?.clientX;
        touchX.current = null;
        if (start == null || end == null || Math.abs(end - start) < 40) return;
        go(index + (end < start ? 1 : -1));
      }}
      className="flex h-full flex-col justify-between gap-10 bg-navy px-6 py-10 text-white sm:px-12 lg:py-14"
    >
      <div key={index} className="fade-up flex flex-col gap-5" aria-live={paused ? "polite" : "off"}>
        <span className="text-[12px] font-medium uppercase tracking-[.1em] text-[#B9BCE0]">{slide.eyebrow}</span>
        <h2 className="max-w-lg text-[clamp(28px,3.4vw,42px)] font-light leading-[1.12] tracking-[-.03em]">{slide.title}</h2>
        <p className="max-w-md text-[16px] font-light leading-relaxed text-[#D6D8F0]">{slide.body}</p>
        {slide.stat && <span className="self-start rounded-full bg-white/10 px-4 py-2 text-[15px] font-medium">{slide.stat}</span>}
        <figure className="mt-2 max-w-md rounded-[18px] border border-white/15 bg-white/5 p-5">
          <blockquote className="text-[15px] font-light leading-relaxed">“{slide.quote}”</blockquote>
          <figcaption className="mt-4 flex items-center gap-3">
            <span aria-hidden className="flex size-10 items-center justify-center rounded-full bg-white/15 text-[13px] font-medium">{initials(slide.by)}</span>
            <span className="text-[14px]">
              <span className="font-medium">{slide.by}</span>
              <span className="block text-[#B9BCE0]">{slide.role}</span>
            </span>
          </figcaption>
        </figure>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-2" role="tablist" aria-label="Choose a slide">
          {SLIDES.map((s, i) => (
            <button
              key={s.eyebrow}
              role="tab"
              aria-selected={i === index}
              aria-label={s.eyebrow}
              onClick={() => go(i)}
              className={`h-2 cursor-pointer rounded-full transition-all ${i === index ? "w-7 bg-white" : "w-2 bg-white/35 hover:bg-white/60"}`}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={() => go(index - 1)} aria-label="Previous slide" className="flex size-10 cursor-pointer items-center justify-center rounded-full border border-white/25 hover:bg-white/10">←</button>
          <button onClick={() => go(index + 1)} aria-label="Next slide" className="flex size-10 cursor-pointer items-center justify-center rounded-full border border-white/25 hover:bg-white/10">→</button>
        </div>
      </div>
    </section>
  );
}
