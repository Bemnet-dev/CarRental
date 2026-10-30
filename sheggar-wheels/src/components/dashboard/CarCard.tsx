import Image from "next/image";
import Link from "next/link";
import { Car as CarIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/dashboard";
import { cn } from "@/lib/utils";
import type { Car } from "@/types";

export function CarCard({
  car,
  href,
  footer,
  className,
}: {
  car: Car;
  href?: string;
  footer?: React.ReactNode;
  className?: string;
}) {
  const image = car.images?.[0];

  return (
    <article
      className={cn(
        "group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md",
        className,
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
        {image ? (
          <Image
            src={image}
            alt={car.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <CarIcon className="h-8 w-8" aria-hidden="true" />
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-foreground backdrop-blur">
          {car.category}
        </span>
      </div>
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-semibold leading-tight text-foreground">
              {car.name}
            </h3>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {car.location.neighbourhood}
            </p>
          </div>
          <p className="shrink-0 whitespace-nowrap text-sm font-semibold text-foreground">
            {formatCurrency(car.pricePerDay)}
            <span className="text-xs font-normal text-muted-foreground">
              /day
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{car.seats} seats</span>
          <span aria-hidden="true">·</span>
          <span>{car.transmission}</span>
          <span aria-hidden="true">·</span>
          <span>{car.fuelType}</span>
        </div>
        {footer ?? (
          <Button variant="outline" size="sm" asChild className="w-full">
            <Link href={href ?? `/cars/${car.id}`}>View car</Link>
          </Button>
        )}
      </div>
    </article>
  );
}
