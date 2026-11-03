"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import AppSignIn, {
  type AppSignInBrand,
  type AppSignInMode,
  type AppSignInPayload,
  type AppSignInTestimonial,
} from "@/components/ui/app-sign-in";
import { safeReturn, signIn, signUp } from "@/lib/session";
import { initData } from "@/lib/storage";

const BRAND: AppSignInBrand = {
  name: "DashDrive",
  tagline:
    "Rent cars straight from verified owners across Addis Ababa — no middlemen.",
  supportHref: "/#how",
  termsHref: "/#terms",
  privacyHref: "/#privacy",
};

const TESTIMONIAL: AppSignInTestimonial = {
  quote:
    "We landed at Bole at midnight and the keys were already waiting. Picking a car from a real owner beats standing at a rental desk every time.",
  author: "Hanna Girma",
  role: "Renter, Kazanchis",
};

export function AuthScreen({ defaultMode }: { defaultMode: AppSignInMode }) {
  const router = useRouter();

  // Seed the local demo store (users, cars, bookings) if it is empty.
  useEffect(() => {
    initData();
  }, []);

  const handleSubmit = async (payload: AppSignInPayload) => {
    if (payload.mode === "sign-up") {
      const [firstName, ...rest] = (payload.name ?? "").trim().split(/\s+/);
      const created = await signUp({
        firstName: firstName || "New",
        lastName: rest.join(" "),
        email: payload.email,
        password: payload.password,
        phone: "",
        neighbourhood: "",
      });
      if (!created.success) {
        throw new Error(created.message);
      }
    } else {
      const result = await signIn(payload.email, payload.password);
      if (!result.success) {
        throw new Error(result.message);
      }
    }

    const next = safeReturn(
      new URLSearchParams(window.location.search).get("next"),
    );
    router.push(next === "/" ? "/dashboard" : next);
    router.refresh();
  };

  return (
    <div className="flex w-full flex-1 flex-col">
      <div className="border-b border-border/70 bg-card/70 px-4 py-2 text-center text-[10.5px] leading-[1.5] text-muted-foreground sm:text-[11.5px]">
        Demo: admin@dashdrive.com/admin123 · owner1@dashdrive.com/owner123 ·
        renter1@dashdrive.com/renter123
      </div>
      <div className="grid min-h-[620px] w-full flex-1">
        <AppSignIn
          theme="light"
          defaultMode={defaultMode}
          brand={BRAND}
          testimonial={TESTIMONIAL}
          // Social providers and magic links are not wired to a backend here.
          providers={[]}
          onSubmit={handleSubmit}
          onMagicLink={() => {
            throw new Error(
              "Email sign-in links aren't connected yet. Use your password, or the demo accounts above.",
            );
          }}
          onContinue={() => router.push("/dashboard")}
        />
      </div>
    </div>
  );
}

