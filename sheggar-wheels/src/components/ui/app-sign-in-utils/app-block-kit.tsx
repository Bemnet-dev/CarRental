"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Theme                                                                     */
/* -------------------------------------------------------------------------- */

export type AppBlockTheme = "auto" | "light" | "dark";

type Palette = Record<string, string>;

const LIGHT_PALETTE: Palette = {
  "--bjork-bg": "#f7f3ea",
  "--bjork-surface": "#fffcf6",
  "--bjork-surface-muted": "rgba(250, 246, 237, 0.94)",
  "--bjork-surface-hover": "#f5efe3",
  "--bjork-surface-active": "#efe7d8",
  "--bjork-panel": "#f8f2e7",
  "--bjork-menu": "rgba(255, 252, 246, 0.98)",
  "--bjork-field": "rgba(255, 252, 246, 0.96)",
  "--bjork-field-muted": "rgba(248, 242, 231, 0.82)",
  "--bjork-field-inset": "rgba(239, 231, 216, 0.72)",
  "--bjork-error-bg": "#fff0e8",
  "--bjork-text": "#171717",
  "--bjork-text-strong": "rgba(23, 23, 23, 0.9)",
  "--bjork-text-medium": "rgba(23, 23, 23, 0.72)",
  "--bjork-text-muted": "rgba(23, 23, 23, 0.56)",
  "--bjork-text-soft": "rgba(23, 23, 23, 0.46)",
  "--bjork-text-faint": "rgba(23, 23, 23, 0.22)",
  "--bjork-inverted-text": "#fff8f0",
  "--bjork-border": "#eee6db",
  "--bjork-border-muted": "#f5ede2",
  "--bjork-border-strong": "#e1d7c8",
  "--bjork-thumb": "#a49b8e",
  "--bjork-track": "#ded6ca",
  "--bjork-accent": "#ec7d43",
  "--bjork-accent-hover": "#f0935f",
  "--bjork-accent-soft": "rgba(236, 125, 67, 0.1)",
  "--bjork-accent-muted": "rgba(236, 125, 67, 0.2)",
  "--bjork-accent-foreground": "#3f2112",
  "--bjork-accent-ink": "#b4521f",
  "--bjork-error": "#b3371f",
  "--bjork-error-soft": "#fbeae4",
  "--bjork-success": "#2f7a4f",
  "--bjork-success-soft": "#e8f3eb",
  "--bjork-warning": "#9a6512",
  "--bjork-chart-ghost": "#cfc5b4",
  "--bjork-shadow-surface":
    "inset 0 7px 14px rgba(88, 72, 49, 0.045), inset 0 0.5px 0.5px rgba(255, 255, 255, 0.92), inset 1px 0 0 rgba(88, 72, 49, 0.026), inset -1px 0 0 rgba(255, 255, 255, 0.68), 0 14px 22px -9px rgba(66, 52, 33, 0.11)",
  "--bjork-shadow-soft":
    "inset 0 1px 0 rgba(88, 72, 49, 0.045), inset 0 0.5px 0.5px rgba(255, 255, 255, 0.86)",
  "--bjork-shadow-panel":
    "inset 0 1px 0 rgba(88, 72, 49, 0.04), inset 1px 0 0 rgba(88, 72, 49, 0.024), inset -1px 0 0 rgba(255, 255, 255, 0.64), 0 18px 38px -30px rgba(66, 52, 33, 0.2)",
  "--bjork-shadow-menu":
    "inset 0 1px 0 rgba(88, 72, 49, 0.04), inset 0 12px 24px rgba(88, 72, 49, 0.022), inset 1px 0 0 rgba(88, 72, 49, 0.024), inset -1px 0 0 rgba(255, 255, 255, 0.62), 0 22px 44px -26px rgba(66, 52, 33, 0.22)",
  "--bjork-shadow-inset":
    "inset 0 1px 10px rgba(88, 72, 49, 0.12), inset 0 0.5px 0.5px rgba(255, 255, 255, 0.72)",
  "--bjork-ring-offset": "#f7f3ea",
};

const DARK_PALETTE: Palette = {
  "--bjork-bg": "#111111",
  "--bjork-surface": "#121212",
  "--bjork-surface-muted": "rgba(22, 22, 22, 0.92)",
  "--bjork-surface-hover": "#181818",
  "--bjork-surface-active": "#202020",
  "--bjork-panel": "#0d0d0d",
  "--bjork-menu": "rgba(18, 18, 18, 0.98)",
  "--bjork-field": "rgba(18, 18, 18, 0.95)",
  "--bjork-field-muted": "rgba(18, 18, 18, 0.55)",
  "--bjork-field-inset": "rgba(9, 9, 9, 0.75)",
  "--bjork-error-bg": "#130d0a",
  "--bjork-text": "#ededed",
  "--bjork-text-strong": "rgba(237, 237, 237, 0.9)",
  "--bjork-text-medium": "rgba(237, 237, 237, 0.72)",
  "--bjork-text-muted": "rgba(237, 237, 237, 0.6)",
  "--bjork-text-soft": "rgba(237, 237, 237, 0.4)",
  "--bjork-text-faint": "rgba(237, 237, 237, 0.22)",
  "--bjork-inverted-text": "#080808",
  "--bjork-border": "#232323",
  "--bjork-border-muted": "#1c1c1c",
  "--bjork-border-strong": "#343434",
  "--bjork-thumb": "#626262",
  "--bjork-track": "#090909",
  "--bjork-accent": "#ec5c13",
  "--bjork-accent-hover": "#f07832",
  "--bjork-accent-soft": "rgba(236, 92, 19, 0.12)",
  "--bjork-accent-muted": "rgba(236, 92, 19, 0.24)",
  "--bjork-accent-foreground": "#fff2ea",
  "--bjork-accent-ink": "#f0935f",
  "--bjork-error": "#f08063",
  "--bjork-error-soft": "rgba(240, 128, 99, 0.14)",
  "--bjork-success": "#5ecf92",
  "--bjork-success-soft": "rgba(94, 207, 146, 0.14)",
  "--bjork-warning": "#e2b45f",
  "--bjork-chart-ghost": "#3a3a3a",
  "--bjork-shadow-surface":
    "inset 0 7px 14px rgba(255, 255, 255, 0.03), inset 0 0.5px 0.5px rgba(255, 255, 255, 0.06), 0 14px 20px -6px rgba(0, 0, 0, 0.45)",
  "--bjork-shadow-soft": "inset 0 1px 0 rgba(255, 255, 255, 0.045)",
  "--bjork-shadow-panel":
    "inset 0 1px 0 rgba(255, 255, 255, 0.035), 0 18px 36px -28px rgba(0, 0, 0, 0.9)",
  "--bjork-shadow-menu":
    "inset 0 1px 0 rgba(255, 255, 255, 0.055), inset 0 12px 24px rgba(255, 255, 255, 0.018), inset 0 -18px 26px rgba(0, 0, 0, 0.24), 0 22px 42px -22px rgba(0, 0, 0, 0.9)",
  "--bjork-shadow-inset": "inset 0 1px 10px rgba(0, 0, 0, 0.45)",
  "--bjork-ring-offset": "#080808",
};

/**
 * Semantic aliases used by the block. They are declared on the same element as
 * the palette so `var()` substitution always resolves against the block's own
 * light/dark values, never the surrounding app theme.
 */
const BLOCK_ALIASES: Palette = {
  "--blk-accent-fill": "var(--bjork-accent)",
  "--blk-accent-fill-ink": "var(--bjork-accent-foreground)",
  "--blk-accent-ink": "var(--bjork-accent-ink)",
  "--blk-error": "var(--bjork-error)",
  "--blk-error-soft": "var(--bjork-error-soft)",
  "--blk-success": "var(--bjork-success)",
  "--blk-success-soft": "var(--bjork-success-soft)",
  "--blk-warning": "var(--bjork-warning)",
  "--blk-chart-ghost": "var(--bjork-chart-ghost)",
};

export const blockRoot =
  "app-block bg-[var(--bjork-bg)] text-[color:var(--bjork-text)] antialiased";

export const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--bjork-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bjork-ring-offset)]";

/**
 * Resolves an `auto` theme from the document's `.dark` class (falling back to
 * the OS preference) and returns the palette as inline custom properties so
 * the block keeps its own colours regardless of where it is mounted.
 */
export function useAppBlockTheme(theme: AppBlockTheme = "auto") {
  const [documentDark, setDocumentDark] = React.useState(false);
  const [systemDark, setSystemDark] = React.useState(false);

  React.useEffect(() => {
    const root = document.documentElement;
    const sync = () => setDocumentDark(root.classList.contains("dark"));
    sync();

    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => setSystemDark(query.matches);
    sync();

    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  const resolved: "light" | "dark" =
    theme === "auto" ? (documentDark || systemDark ? "dark" : "light") : theme;

  const style = {
    colorScheme: resolved,
    ...BLOCK_ALIASES,
    ...(resolved === "dark" ? DARK_PALETTE : LIGHT_PALETTE),
  } as React.CSSProperties & Record<string, string>;

  return { resolved, style };
}

/* -------------------------------------------------------------------------- */
/*  Motion + a11y helpers                                                     */
/* -------------------------------------------------------------------------- */

export function useBlockReducedMotion() {
  const [reduce, setReduce] = React.useState(false);

  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduce(query.matches);
    sync();

    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return reduce;
}

export function useAnnouncer() {
  const [message, setMessage] = React.useState("");
  const timer = React.useRef<number | null>(null);

  const announce = React.useCallback((next: string) => {
    setMessage("");
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setMessage(next), 60);
  }, []);

  React.useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  const region = (
    <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
      {message}
    </div>
  );

  return { announce, region };
}

export type BlockToastTone = "default" | "success" | "error";

export function useBlockToast() {
  const [toast, setToast] = React.useState<{
    id: number;
    message: string;
    tone: BlockToastTone;
  } | null>(null);
  const timer = React.useRef<number | null>(null);

  const show = React.useCallback(
    (message: string, tone: BlockToastTone = "default") => {
      if (timer.current) window.clearTimeout(timer.current);
      setToast({ id: Date.now(), message, tone });
      timer.current = window.setTimeout(() => setToast(null), 4200);
    },
    [],
  );

  React.useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  const node = toast ? (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <div
        key={toast.id}
        role="status"
        aria-live="polite"
        className={cn(
          "pointer-events-auto flex max-w-[380px] items-center gap-2.5 rounded-[11px] border border-[color:var(--bjork-border)] bg-[var(--bjork-menu)] px-3.5 py-2.5 text-[12.5px] text-[color:var(--bjork-text)] shadow-[var(--bjork-shadow-menu)] backdrop-blur",
        )}
      >
        <span
          aria-hidden="true"
          className="grid size-4 shrink-0 place-items-center rounded-full"
          style={{
            background:
              toast.tone === "success"
                ? "var(--bjork-success-soft)"
                : toast.tone === "error"
                  ? "var(--bjork-error-soft)"
                  : "var(--bjork-accent-soft)",
          }}
        >
          <svg viewBox="0 0 12 12" className="size-2.5">
            {toast.tone === "error" ? (
              <path
                d="M3 3l6 6M9 3l-6 6"
                fill="none"
                stroke="var(--bjork-error)"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M2.5 6.2 5 8.5l4.5-5"
                fill="none"
                stroke={
                  toast.tone === "success"
                    ? "var(--bjork-success)"
                    : "var(--bjork-accent)"
                }
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </svg>
        </span>
        <span className="min-w-0">{toast.message}</span>
      </div>
    </div>
  ) : null;

  return { show, node };
}

/* -------------------------------------------------------------------------- */
/*  Button                                                                    */
/* -------------------------------------------------------------------------- */

export type BlockButtonVariant = "primary" | "secondary" | "ghost";
export type BlockButtonSize = "sm" | "md" | "lg";

const BUTTON_VARIANTS: Record<BlockButtonVariant, string> = {
  primary:
    "border border-[color:color-mix(in_oklab,var(--bjork-accent)_80%,black)] bg-[var(--bjork-accent)] text-[color:var(--bjork-accent-foreground)] shadow-[0_1px_2px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.22)] hover:bg-[var(--bjork-accent-hover)]",
  secondary:
    "border border-[color:var(--bjork-border)] bg-[var(--bjork-surface)] text-[color:var(--bjork-text)] shadow-[var(--bjork-shadow-soft)] hover:bg-[var(--bjork-surface-hover)]",
  ghost:
    "border border-transparent bg-transparent text-[color:var(--bjork-text-medium)] hover:bg-[var(--bjork-surface-hover)] hover:text-[color:var(--bjork-text)]",
};

const BUTTON_SIZES: Record<BlockButtonSize, string> = {
  sm: "h-8 rounded-[8px] px-2.5 text-[12px]",
  md: "h-9 rounded-[9px] px-3 text-[12.5px]",
  lg: "h-10 rounded-[10px] px-4 text-[13px]",
};

export interface BlockButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BlockButtonVariant;
  size?: BlockButtonSize;
}

export const BlockButton = React.forwardRef<
  HTMLButtonElement,
  BlockButtonProps
>(function BlockButton(
  { variant = "primary", size = "md", className, type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 font-medium transition-[background-color,border-color,box-shadow,color,opacity] duration-150 disabled:cursor-not-allowed disabled:opacity-60 [&_svg]:size-4 [&_svg]:shrink-0",
        BUTTON_VARIANTS[variant],
        BUTTON_SIZES[size],
        focusRing,
        className,
      )}
      {...props}
    />
  );
});

/* -------------------------------------------------------------------------- */
/*  Field                                                                     */
/* -------------------------------------------------------------------------- */

export interface BlockFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null;
  hint?: React.ReactNode;
  labelAside?: React.ReactNode;
  trailing?: React.ReactNode;
}

export const BlockField = React.forwardRef<HTMLInputElement, BlockFieldProps>(
  function BlockField(
    { label, error, hint, labelAside, trailing, className, id, name, ...props },
    ref,
  ) {
    const generated = React.useId();
    const inputId = id ?? `${generated}-${name ?? "field"}`;
    const descriptionId = `${inputId}-description`;

    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between gap-3">
          <label
            htmlFor={inputId}
            className="text-[12.5px] font-medium text-[color:var(--bjork-text-medium)]"
          >
            {label}
          </label>
          {labelAside}
        </div>

        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            name={name}
            aria-invalid={error ? true : undefined}
            aria-describedby={error || hint ? descriptionId : undefined}
            className={cn(
              "h-10 w-full rounded-[10px] border bg-[var(--bjork-field)] px-3 text-[13.5px] text-[color:var(--bjork-text)] shadow-[var(--bjork-shadow-soft)] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[color:var(--bjork-text-faint)] hover:border-[color:var(--bjork-border-strong)] focus-visible:border-[color:var(--bjork-accent)] focus-visible:ring-[3px] focus-visible:ring-[color:var(--bjork-accent-soft)] read-only:opacity-70",
              error
                ? "border-[color:var(--blk-error)]"
                : "border-[color:var(--bjork-border)]",
              trailing && "pr-10",
              className,
            )}
            {...props}
          />
          {trailing ? (
            <div className="absolute right-1 top-1/2 -translate-y-1/2">
              {trailing}
            </div>
          ) : null}
        </div>

        {error ? (
          <p
            id={descriptionId}
            role="alert"
            className="text-[11.5px] leading-[1.45] text-[color:var(--blk-error)]"
          >
            {error}
          </p>
        ) : hint ? (
          <div
            id={descriptionId}
            className="text-[11.5px] leading-[1.45] text-[color:var(--bjork-text-soft)]"
          >
            {hint}
          </div>
        ) : null}
      </div>
    );
  },
);

/* -------------------------------------------------------------------------- */
/*  Icon button                                                               */
/* -------------------------------------------------------------------------- */

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  size?: "sm" | "md";
  pressed?: boolean;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    { label, size = "md", pressed, className, children, ...props },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type="button"
        aria-label={label}
        aria-pressed={pressed}
        className={cn(
          "grid cursor-pointer place-items-center rounded-[7px] text-[color:var(--bjork-text-muted)] transition-colors duration-150 hover:bg-[var(--bjork-surface-hover)] hover:text-[color:var(--bjork-text)] [&_svg]:size-4",
          size === "sm" ? "size-7" : "size-8",
          focusRing,
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);

/* -------------------------------------------------------------------------- */
/*  Avatar                                                                    */
/* -------------------------------------------------------------------------- */

export function InitialsAvatar({
  name,
  size = 32,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const initials = React.useMemo(() => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }, [name]);

  return (
    <span
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        fontSize: Math.max(10, Math.round(size * 0.36)),
      }}
      className={cn(
        "grid shrink-0 place-items-center rounded-full border border-[color:var(--bjork-border-strong)] bg-[var(--bjork-surface-active)] font-medium tracking-[0.02em] text-[color:var(--bjork-text-medium)]",
        className,
      )}
    >
      {initials}
    </span>
  );
}
