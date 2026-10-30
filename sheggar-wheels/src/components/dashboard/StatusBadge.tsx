import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  requested:
    "border-amber-600/20 bg-amber-500/10 text-amber-800 dark:text-amber-300",
  pending:
    "border-amber-600/20 bg-amber-500/10 text-amber-800 dark:text-amber-300",
  confirmed:
    "border-emerald-600/20 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300",
  approved:
    "border-emerald-600/20 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300",
  active:
    "border-emerald-600/20 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300",
  in_progress:
    "border-sky-600/20 bg-sky-500/10 text-sky-800 dark:text-sky-300",
  completed: "border-border bg-secondary text-secondary-foreground",
  declined:
    "border-red-600/20 bg-red-500/10 text-red-800 dark:text-red-300",
  cancelled:
    "border-red-600/20 bg-red-500/10 text-red-800 dark:text-red-300",
  rejected:
    "border-red-600/20 bg-red-500/10 text-red-800 dark:text-red-300",
  suspended:
    "border-red-600/20 bg-red-500/10 text-red-800 dark:text-red-300",
  disputed:
    "border-orange-600/20 bg-orange-500/10 text-orange-800 dark:text-orange-300",
  resolved:
    "border-teal-600/20 bg-teal-500/10 text-teal-800 dark:text-teal-300",
  inactive: "border-border bg-muted text-muted-foreground",
};

export function StatusBadge({ status }: { status: string }) {
  const label = status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
        statusStyles[status] ?? statusStyles.inactive,
      )}
    >
      {label}
    </span>
  );
}

const roleStyles: Record<string, string> = {
  admin: "border-ember/30 bg-ember/15 text-clay",
  owner:
    "border-sky-600/20 bg-sky-500/10 text-sky-800 dark:text-sky-300",
  renter:
    "border-emerald-600/20 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300",
};

export function RoleBadge({ role }: { role: string }) {
  const label = role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
        roleStyles[role] ?? roleStyles.renter,
      )}
    >
      {label}
    </span>
  );
}
