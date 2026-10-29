"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CarFront, ChevronDown, MapPin, Search } from "lucide-react";

const NEIGHBOURHOODS = ["Bole", "Kazanchis", "Piassa", "Merkato"];
const CATEGORIES = ["Economy", "SUV", "Luxury"];

export function HeroSearch() {
  const router = useRouter();
  const [neighbourhood, setNeighbourhood] = useState("");
  const [category, setCategory] = useState("");

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (neighbourhood) params.set("neighbourhood", neighbourhood);
    if (category) params.set("category", category);
    const query = params.toString();
    router.push(query ? `/cars?${query}` : "/cars");
  }

  return (
    <form
      onSubmit={submit}
      className="grid gap-2 rounded-2xl border border-border bg-card/95 p-2 shadow-xl shadow-black/10 backdrop-blur-xl sm:grid-cols-[1.1fr_1fr_auto]"
    >
      <div className="relative">
        <MapPin
          aria-hidden
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-clay"
        />
        <label htmlFor="hero-neighbourhood" className="sr-only">
          Pick-up neighbourhood
        </label>
        <select
          id="hero-neighbourhood"
          value={neighbourhood}
          onChange={(event) => setNeighbourhood(event.target.value)}
          className="h-12 w-full appearance-none rounded-xl bg-background pl-11 pr-10 text-sm text-foreground outline-none transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
        >
          <option value="" className="bg-card text-foreground">
            Anywhere in Addis
          </option>
          {NEIGHBOURHOODS.map((place) => (
            <option
              key={place}
              value={place}
              className="bg-card text-foreground"
            >
              {place}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        />
      </div>

      <div className="relative">
        <CarFront
          aria-hidden
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-clay"
        />
        <label htmlFor="hero-category" className="sr-only">
          Car type
        </label>
        <select
          id="hero-category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="h-12 w-full appearance-none rounded-xl bg-background pl-11 pr-10 text-sm text-foreground outline-none transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
        >
          <option value="" className="bg-card text-foreground">
            Any car type
          </option>
          {CATEGORIES.map((type) => (
            <option key={type} value={type} className="bg-card text-foreground">
              {type}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        />
      </div>

      <button
        type="submit"
        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-ink px-6 text-sm font-semibold text-sand transition-colors hover:bg-ink/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
      >
        <Search aria-hidden className="h-4 w-4" />
        Find a car
      </button>
    </form>
  );
}
