import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarCheck,
  Check,
  KeyRound,
  MapPin,
  Search,
} from "lucide-react";
import { ImageStreamHero } from "@/components/ui/image-stream-hero";
import { HeroSearch } from "@/components/HeroSearch";

const unsplash = (id: string, width = 800) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=80`;

const formatPrice = (price: number) => {
  return `${price} ETB`;
};

const HERO_IMAGES = [
  { src: unsplash("1503376780353-7e6692767b70", 480), alt: "Sports car on an open road" },
  { src: unsplash("1494976388531-d1058494cdd8", 480), alt: "Classic muscle car" },
  { src: unsplash("1552519507-da3b142c6e3d", 480), alt: "Silver coupe parked in the city" },
  { src: unsplash("1502877338535-766e1452684a", 480), alt: "Dark performance car" },
  { src: unsplash("1544636331-e26879cd4d9b", 480), alt: "Compact car on a coastal road" },
  { src: unsplash("1583121274602-3e2820c69888", 480), alt: "Supercar in warm evening light" },
  { src: unsplash("1511919884226-fd3cad34687c", 480), alt: "Car detail in sunlight" },
  { src: unsplash("1533473359331-0135ef1b58bf", 480), alt: "SUV on a mountain road" },
  { src: unsplash("1568605117036-5fe5e7bab0b7", 480), alt: "Off-road vehicle on a trail" },
  { src: unsplash("1555215695-3004980ad54e", 480), alt: "Blue sedan on a city street" },
  { src: unsplash("1616455579100-2ceaa4eb2d37", 480), alt: "Luxury sedan at dusk" },
  { src: unsplash("1623869675781-80aa31012a5a", 480), alt: "Everyday sedan in a parking bay" },
];

const FEATURED_CARS = [
  {
    id: "car-3",
    name: "BMW 3 Series 2022",
    category: "Luxury",
    location: "Kazanchis",
    price: 120,
    seats: 5,
    transmission: "Automatic",
    image: unsplash("1555215695-3004980ad54e", 1200),
  },
  {
    id: "car-2",
    name: "Honda CR-V 2021",
    category: "SUV",
    location: "Bole",
    price: 75,
    seats: 5,
    transmission: "Automatic",
    image: unsplash("1519641471654-76ce0107ad1b", 1200),
  },
  {
    id: "car-6",
    name: "Mercedes C-Class 2023",
    category: "Luxury",
    location: "Piassa",
    price: 150,
    seats: 5,
    transmission: "Automatic",
    image: unsplash("1616455579100-2ceaa4eb2d37", 1200),
  },
];

const NEIGHBOURHOODS = [
  { name: "Bole", count: "3 cars" },
  { name: "Kazanchis", count: "2 cars" },
  { name: "Piassa", count: "2 cars" },
  { name: "Merkato", count: "1 car" },
];

const STEPS = [
  {
    title: "Pick your car",
    body: "Filter by neighbourhood, body type and daily rate. Every listing shows the owner's real price up front — no counter upgrades, no surprises.",
    icon: Search,
  },
  {
    title: "Request the dates",
    body: "Send a request straight to the owner. They confirm, you check out, and the booking is locked in with the pickup details you agreed.",
    icon: CalendarCheck,
  },
  {
    title: "Meet and drive",
    body: "Collect the keys at the agreed spot in Bole, Kazanchis or Piassa. Return it full and your trip is closed out cleanly.",
    icon: KeyRound,
  },
];

const OWNER_POINTS = [
  "Set your own daily rate",
  "Approve every trip before it's booked",
  "Get paid after each completed rental",
];

export default function Home() {
  return (
    <main className="bg-background">
      <section className="relative">
        <ImageStreamHero
          images={HERO_IMAGES}
          cards={8}
          speed={24}
          axis={56}
          className="h-[calc(100svh-4rem)] min-h-[720px] max-h-[940px] w-full bg-background"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/30"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-background to-transparent"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-background to-transparent"
          />

          <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-between px-4 pb-10 pt-12 sm:px-6 sm:pb-14 sm:pt-16 lg:px-8">
            <div className="max-w-2xl">
              <p className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.24em] text-ink/70">
                <span aria-hidden className="h-px w-8 bg-ember" />
                Addis Ababa · Peer-to-peer
              </p>
              <h1 className="mt-6 font-display text-[clamp(2.9rem,7vw,5.4rem)] leading-[0.9] tracking-[-0.02em] text-ink">
                The city is yours.
                <span className="block italic text-clay">Take the wheel.</span>
              </h1>
              <p className="mt-6 max-w-lg text-pretty text-base leading-relaxed text-ink/75 sm:text-lg">
                Rent the car you actually want, from an owner who lives around
                the corner. Clear daily rates, flexible pick-up, and no rental
                desk in between.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/cars"
                  className="group inline-flex h-12 items-center gap-2 rounded-xl bg-ink px-6 text-sm font-semibold text-sand transition-colors hover:bg-ink/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Browse cars
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex h-12 items-center rounded-xl border border-ink/25 px-6 text-sm font-semibold text-ink transition-colors hover:border-ink/50 hover:bg-ink/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  List your car
                </Link>
              </div>
            </div>

            <div className="mt-12">
              <HeroSearch />
              <ul className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] uppercase tracking-[0.14em] text-ink/55 sm:gap-x-6 sm:text-[11px] sm:tracking-[0.16em]">
                <li className="flex items-center gap-2">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ember opacity-75 motion-reduce:hidden" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-ember" />
                  </span>
                  8 cars live
                </li>
                <li>Verified owners</li>
                <li>No hidden fees</li>
              </ul>
            </div>
          </div>
        </ImageStreamHero>
      </section>

      <section id="fleet" className="border-b border-border bg-background py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 border-b border-border pb-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-clay">
                The fleet
              </p>
              <h2 className="mt-4 font-display text-4xl leading-[1.05] tracking-tight text-foreground sm:text-5xl">
                A car for the way
                <br className="hidden sm:block" /> you move.
              </h2>
            </div>
            <div className="max-w-sm md:text-right">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Daily rates set by owners, not a rental desk. Every car is
                listed with its real pick-up neighbourhood.
              </p>
              <Link
                href="/cars"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground underline decoration-ember decoration-2 underline-offset-4 transition-colors hover:text-clay"
              >
                See all 8 cars
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {NEIGHBOURHOODS.map((place) => (
              <Link
                key={place.name}
                href={`/cars?neighbourhood=${encodeURIComponent(place.name)}`}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-medium text-foreground transition-colors hover:border-foreground/30 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {place.name}
                <span className="text-muted-foreground">{place.count}</span>
              </Link>
            ))}
          </div>

          <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURED_CARS.map((car) => (
              <Link
                key={car.id}
                href={`/cars/${car.id}`}
                className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
                  <Image
                    src={car.image}
                    alt={`${car.name} in ${car.location}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-ink/80 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-sand backdrop-blur-sm">
                    {car.category}
                  </span>
                </div>
                <div className="mt-4 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight text-foreground transition-colors group-hover:text-clay">
                      {car.name}
                    </h3>
                    <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <MapPin aria-hidden className="h-3.5 w-3.5" />
                        {car.location}
                      </span>
                      <span aria-hidden>·</span>
                      <span>{car.seats} seats</span>
                      <span aria-hidden>·</span>
                      <span>{car.transmission}</span>
                    </p>
                  </div>
                  <p className="shrink-0 text-right">
                    <span className="font-display text-2xl leading-none text-foreground">
                      {formatPrice(car.price)}
                    </span>
                    <span className="mt-1 block text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      per day
                    </span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-secondary/50 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-clay">
                The short version
              </p>
              <h2 className="mt-4 font-display text-4xl leading-[1.05] tracking-tight text-foreground sm:text-5xl">
                Three steps.
                <br />
                No middlemen.
              </h2>
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
                Sheggar Wheels connects you straight to the person who owns the
                car. You agree the details together; we keep the listing,
                request and payment in one place.
              </p>
            </div>

            <ol className="divide-y divide-border border-y border-border">
              {STEPS.map((step, index) => (
                <li
                  key={step.title}
                  className="grid gap-4 py-7 sm:grid-cols-[auto_1fr_auto] sm:items-start sm:gap-6"
                >
                  <span className="font-display text-3xl leading-none text-clay">
                    0{index + 1}
                  </span>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">
                      {step.title}
                    </h3>
                    <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                      {step.body}
                    </p>
                  </div>
                  <step.icon
                    aria-hidden
                    className="hidden h-5 w-5 text-muted-foreground sm:block"
                  />
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="bg-background py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-ember px-6 py-12 sm:px-10 sm:py-14 lg:px-14">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border-[40px] border-ink/10"
            />
            <div className="relative grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-ink/80">
                  For owners
                </p>
                <h2 className="mt-4 max-w-xl font-display text-4xl leading-[1.02] tracking-tight text-ink sm:text-5xl">
                  Your car earns while you sleep.
                </h2>
                <p className="mt-5 max-w-md text-sm leading-relaxed text-ink/75">
                  List it once, set your own rate, and approve the trips that
                  suit you. Payouts land after each completed booking.
                </p>
                <Link
                  href="/signup"
                  className="mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-ink px-6 text-sm font-semibold text-sand transition-colors hover:bg-ink/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ember"
                >
                  Become a host
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <ul className="space-y-4 border-t border-ink/20 pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
                {OWNER_POINTS.map((point) => (
                  <li
                    key={point}
                    className="flex items-start gap-3 text-sm font-medium text-ink"
                  >
                    <Check aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
