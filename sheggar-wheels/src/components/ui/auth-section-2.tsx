"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

type FleetSlide = {
  src: string;
  alt: string;
  name: string;
  area: string;
  price: string;
  note: string;
};

const fleetSlides: FleetSlide[] = [
  {
    src: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80",
    alt: "Silver sports car parked on an open mountain road",
    name: "Porsche 911 Carrera",
    area: "Bole",
    price: "ETB 9,800 / day",
    note: "Weekend drives along Entoto with the city skyline behind you.",
  },
  {
    src: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=800&q=80",
    alt: "Red muscle car parked in a sunlit lot",
    name: "Ford Mustang GT",
    area: "Old Airport",
    price: "ETB 7,200 / day",
    note: "A loud, honest V8 for weddings, shoots, and long Sunday loops.",
  },
  {
    src: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80",
    alt: "Blue sports car with sharp body lines",
    name: "Chevrolet Corvette",
    area: "Sarbet",
    price: "ETB 11,500 / day",
    note: "Reserved for the days that deserve a little more drama.",
  },
  {
    src: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80",
    alt: "White sedan parked on a quiet street",
    name: "Toyota Camry Hybrid",
    area: "CMC",
    price: "ETB 4,600 / day",
    note: "Quiet, efficient, and the easiest yes for a week of meetings.",
  },
];

export type AuthSectionTwoProps = {
  eyebrow?: string;
  heading: string;
  description?: string;
  aside?: React.ReactNode;
  dividerLabel?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export default function AuthSectionTwo({
  eyebrow,
  heading,
  description,
  aside,
  dividerLabel = "or continue with email",
  children,
  footer,
}: AuthSectionTwoProps) {
  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) return;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % fleetSlides.length);
    }, 4200);

    return () => window.clearInterval(interval);
  }, []);

  const activeSlide = fleetSlides[activeIndex];

  return (
    <section className="bg-background px-3 py-6 sm:px-4 sm:py-8 lg:py-10">
      <div className="mx-auto grid w-full max-w-[1400px] gap-3 lg:grid-cols-[0.94fr_1.06fr] lg:gap-4">
        <aside className="relative flex flex-col justify-center overflow-hidden rounded-xl bg-ink px-6 py-8 text-sand sm:px-10 lg:min-h-[680px] lg:px-12 lg:py-14 xl:px-16">
          <div className="mx-auto flex w-full max-w-[500px] flex-col">
            <Link
              href="/"
              className="flex items-center gap-3 text-lg text-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember focus-visible:ring-offset-4 focus-visible:ring-offset-ink"
            >
              <span className="flex size-8 items-center justify-center rounded-lg bg-ember text-sm font-bold text-ink">
                SW
              </span>
              <span className="font-semibold tracking-tight">
                Sheggar Wheels
              </span>
            </Link>

            <div className="relative mt-7 grid w-full grid-cols-[1.55fr_1fr] gap-2 rounded-lg">
              <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-16 bg-gradient-to-b from-ink to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-20 bg-gradient-to-t from-ink to-transparent" />
              <ImageTile
                src={fleetSlides[0]}
                active={activeIndex === 0}
                className="row-span-2 h-[208px] sm:h-[248px]"
              />
              <ImageTile
                src={fleetSlides[1]}
                active={activeIndex === 1}
                className="h-[100px] sm:h-[120px]"
              />
              <ImageTile
                src={fleetSlides[3]}
                active={activeIndex === 3}
                className="h-[100px] sm:h-[120px]"
              />
              <ImageTile
                src={fleetSlides[2]}
                active={activeIndex === 2}
                className="col-span-2 h-[100px] sm:h-[120px]"
              />
            </div>

            <div className="mt-5 w-full rounded-xl border border-dashed border-sand/20 px-4 py-3.5">
              <div className="flex items-end gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-sand/40">
                    {activeSlide.area} · {activeSlide.price}
                  </p>
                  <p className="mt-1 truncate text-sm font-medium text-sand">
                    {activeSlide.name}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-sand/55">
                    {activeSlide.note}
                  </p>
                </div>
                <Link
                  href="/cars"
                  aria-label="Browse the full fleet"
                  className="grid size-9 shrink-0 place-items-center rounded-full bg-sand/15 text-sand transition-colors hover:bg-ember hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember"
                >
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
            </div>

            <p className="mt-6 max-w-[300px] text-xl leading-tight text-sand">
              Cars owned by people, not fleets.
            </p>
            <p className="mt-2 max-w-[320px] text-sm leading-6 text-sand/50">
              Peer-to-peer rentals across Addis Ababa — booked in minutes,
              backed by verified owners.
            </p>

            <div className="mt-auto flex gap-1.5 pt-8">
              {fleetSlides.map((slide, index) => (
                <button
                  key={slide.name}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className="group py-2 focus-visible:outline-none"
                  aria-label={`Show ${slide.name}`}
                  aria-current={activeIndex === index}
                >
                  <span
                    className={cn(
                      "block h-1 rounded-full transition-all duration-300 group-focus-visible:ring-2 group-focus-visible:ring-ember group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-ink",
                      activeIndex === index
                        ? "w-10 bg-sand"
                        : "w-4 bg-sand/35 group-hover:bg-sand/60",
                    )}
                  />
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="flex items-center justify-center rounded-xl bg-card px-5 py-10 sm:px-10 lg:px-12 xl:px-16">
          <div className="w-full max-w-[460px]">
            {eyebrow ? (
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-ember">
                {eyebrow}
              </p>
            ) : null}
            <h1 className="mt-2 text-3xl font-medium tracking-[-0.04em] text-foreground sm:text-4xl">
              {heading}
            </h1>
            {description ? (
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            ) : null}

            {aside ? <div className="mt-7">{aside}</div> : null}

            <AuthDivider label={dividerLabel} />

            {children}

            {footer ? (
              <div className="mt-7 text-center text-sm text-muted-foreground">
                {footer}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function ImageTile({
  src,
  active,
  className,
}: {
  src: FleetSlide;
  active: boolean;
  className: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-visible rounded-lg",
        className,
        active ? "z-10" : "z-0",
      )}
    >
      <div className="relative h-full w-full overflow-hidden rounded-lg bg-ink">
        <Image
          src={src.src}
          alt={src.alt}
          fill
          sizes="(min-width: 1024px) 30vw, 55vw"
          className={cn(
            "object-cover transition-opacity duration-700",
            active ? "opacity-100" : "opacity-40",
          )}
        />
      </div>
      <FocusCorners active={active} />
    </div>
  );
}

function FocusCorners({ active }: { active: boolean }) {
  const baseClass = cn(
    "pointer-events-none absolute h-4 w-4 border-sand/60 transition-all duration-500 ease-out",
    active ? "translate-x-0 translate-y-0 opacity-100" : "opacity-0",
  );

  return (
    <>
      <div
        className={cn(
          baseClass,
          "-left-2 -top-2 border-l border-t",
          !active && "-translate-x-2 -translate-y-2",
        )}
      />
      <div
        className={cn(
          baseClass,
          "-right-2 -top-2 border-r border-t",
          !active && "translate-x-2 -translate-y-2",
        )}
      />
      <div
        className={cn(
          baseClass,
          "-bottom-2 -left-2 border-b border-l",
          !active && "-translate-x-2 translate-y-2",
        )}
      />
      <div
        className={cn(
          baseClass,
          "-bottom-2 -right-2 border-b border-r",
          !active && "translate-x-2 translate-y-2",
        )}
      />
    </>
  );
}

export function AuthDivider({ label }: { label: string }) {
  return (
    <div className="my-7 flex items-center gap-4 text-xs uppercase tracking-[0.16em] text-muted-foreground">
      <div className="h-px flex-1 bg-border" />
      <span className="whitespace-nowrap">{label}</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

export function AuthField({
  label,
  hint,
  className,
  id,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
}) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;

  return (
    <div className={cn("space-y-2", className)}>
      <label
        htmlFor={inputId}
        className="flex items-baseline justify-between gap-3 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground"
      >
        <span>{label}</span>
        {hint ? (
          <span className="normal-case tracking-normal text-muted-foreground/70">
            {hint}
          </span>
        ) : null}
      </label>
      <input
        id={inputId}
        className="h-11 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 hover:border-foreground/25 focus-visible:border-ember focus-visible:ring-2 focus-visible:ring-ember/25 disabled:cursor-not-allowed disabled:opacity-60"
        {...props}
      />
    </div>
  );
}

export function AuthSelect({
  label,
  className,
  id,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
}) {
  const generatedId = React.useId();
  const selectId = id ?? generatedId;

  return (
    <div className={cn("space-y-2", className)}>
      <label
        htmlFor={selectId}
        className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground"
      >
        {label}
      </label>
      <select
        id={selectId}
        className="h-11 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground outline-none transition-colors hover:border-foreground/25 focus-visible:border-ember focus-visible:ring-2 focus-visible:ring-ember/25"
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

export function AuthCheckbox({
  children,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { children: React.ReactNode }) {
  return (
    <label
      className={cn(
        "flex items-start gap-2.5 text-xs leading-5 text-muted-foreground",
        className,
      )}
    >
      <span className="relative mt-0.5 size-4 shrink-0">
        <input
          type="checkbox"
          className="peer size-full appearance-none rounded-[3px] border border-border bg-background transition-colors checked:border-ink checked:bg-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember focus-visible:ring-offset-2 focus-visible:ring-offset-card dark:checked:border-sand dark:checked:bg-sand"
          {...props}
        />
        <Check
          className="pointer-events-none absolute inset-0 hidden size-4 p-0.5 text-primary-foreground peer-checked:block dark:text-ink"
          aria-hidden="true"
        />
      </span>
      <span>{children}</span>
    </label>
  );
}

export function AuthAlert({
  tone = "error",
  children,
}: {
  tone?: "error" | "success";
  children: React.ReactNode;
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-lg border px-4 py-3 text-sm leading-5",
        tone === "error"
          ? "border-destructive/30 bg-destructive/10 text-destructive"
          : "border-emerald-600/25 bg-emerald-600/10 text-emerald-800 dark:text-emerald-300",
      )}
    >
      {children}
    </div>
  );
}

export function AuthSubmit({
  children,
  loading = false,
  className,
  disabled,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      className={cn(
        "flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-ink text-base font-medium text-sand transition-colors hover:bg-ink/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:cursor-not-allowed disabled:opacity-60 dark:bg-sand dark:text-ink dark:hover:bg-sand/90",
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : null}
      {children}
      <ArrowRight className="size-4" aria-hidden="true" />
    </button>
  );
}
