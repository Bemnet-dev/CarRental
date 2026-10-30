"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Car as CarIcon, CheckCircle2 } from "lucide-react";

import { useDashboard } from "@/components/dashboard/dashboard-context";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { emitDataChanged } from "@/lib/dashboard";
import { KEYS, read, write } from "@/lib/storage";
import type { Car } from "@/types";

const categories: Car["category"][] = [
  "Economy",
  "SUV",
  "Luxury",
  "Van",
  "Truck",
];
const transmissions: Car["transmission"][] = ["Automatic", "Manual"];
const fuelTypes: Car["fuelType"][] = ["Petrol", "Diesel", "Hybrid", "Electric"];

const selectClassName =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const initialForm = {
  name: "",
  brand: "",
  model: "",
  year: 2020,
  category: "Economy" as Car["category"],
  pricePerDay: 50,
  seats: 5,
  transmission: "Automatic" as Car["transmission"],
  fuelType: "Petrol" as Car["fuelType"],
  description: "",
  neighbourhood: "",
  address: "",
  features: "",
};

export default function NewCarPage() {
  const router = useRouter();
  const { session, data } = useDashboard();
  const [form, setForm] = React.useState(initialForm);
  const [submitted, setSubmitted] = React.useState(false);

  const isOwner = data.role === "owner" || data.role === "admin";

  const update = <K extends keyof typeof initialForm>(
    key: K,
    value: (typeof initialForm)[K],
  ) => setForm((current) => ({ ...current, [key]: value }));

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const car: Car = {
      id: `car-${Date.now()}`,
      ownerId: session.userId,
      name: form.name.trim(),
      brand: form.brand.trim(),
      model: form.model.trim(),
      year: Number(form.year) || new Date().getFullYear(),
      category: form.category,
      pricePerDay: Number(form.pricePerDay) || 0,
      images: [
        "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800",
      ],
      seats: Number(form.seats) || 4,
      transmission: form.transmission,
      fuelType: form.fuelType,
      description: form.description.trim(),
      location: {
        neighbourhood: form.neighbourhood.trim(),
        address: form.address.trim(),
      },
      features: form.features
        .split(",")
        .map((feature) => feature.trim())
        .filter(Boolean),
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    const cars = read<Car[]>(KEYS.CARS, []);
    write(KEYS.CARS, [...cars, car]);
    emitDataChanged();
    setSubmitted(true);
    router.push("/dashboard/listings");
  };

  if (!isOwner) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Owner tools"
          title="Add a car"
          description="Only owner accounts can add vehicles to the marketplace."
        />
        <SectionCard title="Owner access required">
          <div className="flex flex-col items-start gap-3 p-5 text-sm text-muted-foreground">
            <p>
              This account is a renter. Create an owner account to list your car
              and start receiving booking requests.
            </p>
            <Button asChild>
              <Link href="/signup">Become an owner</Link>
            </Button>
          </div>
        </SectionCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Owner tools"
        title="Add a car"
        description="Share a few details about your vehicle. New listings are reviewed by our team before they go live."
        actions={
          <Button variant="outline" asChild>
            <Link href="/dashboard/listings">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to listings
            </Link>
          </Button>
        }
      />

      <form onSubmit={submit} className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <SectionCard
            title="Vehicle details"
            description="The essentials renters use to find your car."
            contentClassName="space-y-4 p-5"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Listing name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(event) => update("name", event.target.value)}
                placeholder="e.g. Toyota Corolla 2021"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  value={form.brand}
                  onChange={(event) => update("brand", event.target.value)}
                  placeholder="Toyota"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={form.model}
                  onChange={(event) => update("model", event.target.value)}
                  placeholder="Corolla"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  min={1990}
                  max={new Date().getFullYear() + 1}
                  value={form.year}
                  onChange={(event) =>
                    update("year", Number(event.target.value))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  className={selectClassName}
                  value={form.category}
                  onChange={(event) =>
                    update("category", event.target.value as Car["category"])
                  }
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="seats">Seats</Label>
                <Input
                  id="seats"
                  type="number"
                  min={2}
                  max={16}
                  value={form.seats}
                  onChange={(event) =>
                    update("seats", Number(event.target.value))
                  }
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="pricePerDay">Daily rate (ETB)</Label>
                <Input
                  id="pricePerDay"
                  type="number"
                  min={0}
                  value={form.pricePerDay}
                  onChange={(event) =>
                    update("pricePerDay", Number(event.target.value))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transmission">Transmission</Label>
                <select
                  id="transmission"
                  className={selectClassName}
                  value={form.transmission}
                  onChange={(event) =>
                    update(
                      "transmission",
                      event.target.value as Car["transmission"],
                    )
                  }
                >
                  {transmissions.map((transmission) => (
                    <option key={transmission} value={transmission}>
                      {transmission}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fuelType">Fuel type</Label>
                <select
                  id="fuelType"
                  className={selectClassName}
                  value={form.fuelType}
                  onChange={(event) =>
                    update("fuelType", event.target.value as Car["fuelType"])
                  }
                >
                  {fuelTypes.map((fuelType) => (
                    <option key={fuelType} value={fuelType}>
                      {fuelType}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(event) => update("description", event.target.value)}
                placeholder="Tell renters what makes this car a good pick."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="features">Features</Label>
              <Input
                id="features"
                value={form.features}
                onChange={(event) => update("features", event.target.value)}
                placeholder="Air conditioning, Bluetooth, Reverse camera"
              />
              <p className="text-xs text-muted-foreground">
                Separate each feature with a comma.
              </p>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard
            title="Pickup location"
            description="Where renters collect the car."
            contentClassName="space-y-4 p-5"
          >
            <div className="space-y-2">
              <Label htmlFor="neighbourhood">Neighbourhood</Label>
              <Input
                id="neighbourhood"
                value={form.neighbourhood}
                onChange={(event) =>
                  update("neighbourhood", event.target.value)
                }
                placeholder="e.g. Bole"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(event) => update("address", event.target.value)}
                placeholder="Street, landmark"
                required
              />
            </div>
          </SectionCard>

          <SectionCard
            title="Publish"
            description="Listings start as pending until approved."
            contentClassName="space-y-4 p-5"
          >
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2
                  className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                  aria-hidden="true"
                />
                You can edit details any time from My listings.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2
                  className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                  aria-hidden="true"
                />
                Our team reviews new cars within one business day.
              </li>
            </ul>

            <div className="flex flex-col gap-2 border-t border-border/70 pt-4">
              <Button type="submit" className="w-full">
                <CarIcon className="h-4 w-4" aria-hidden="true" />
                Submit for review
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => router.push("/dashboard/listings")}
              >
                Cancel
              </Button>
              <p aria-live="polite" className="text-xs text-muted-foreground">
                {submitted ? "Listing submitted for review." : ""}
              </p>
            </div>
          </SectionCard>
        </div>
      </form>
    </div>
  );
}
