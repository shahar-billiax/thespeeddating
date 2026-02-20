"use client";

import { useState, useTransition } from "react";
import { checkInAttendee, uncheckInAttendee } from "@/lib/host/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { ChevronDown } from "lucide-react";

interface AttendeeRowProps {
  registration: {
    id: number;
    checked_in_at: string | null;
    profiles: {
      first_name: string | null;
      last_name: string | null;
      email: string | null;
      phone: string | null;
      date_of_birth: string | null;
      gender: string | null;
    } | null;
    status: string | null;
    payment_status: string | null;
    registered_at: string;
  };
}

function calculateAge(dob: string | null): string {
  if (!dob) return "—";
  const birth = new Date(dob);
  const today = new Date();
  const age =
    today.getFullYear() -
    birth.getFullYear() -
    (today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
      ? 1
      : 0);
  return String(age);
}

const INELIGIBLE_STATUSES = new Set(["cancelled"]);
const INELIGIBLE_PAYMENT_STATUSES = new Set(["refunded", "failed"]);

export function AttendeeRow({ registration }: AttendeeRowProps) {
  const [checkedIn, setCheckedIn] = useState(!!registration.checked_in_at);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const p = registration.profiles;

  const canCheckIn =
    !INELIGIBLE_STATUSES.has(registration.status ?? "") &&
    !INELIGIBLE_PAYMENT_STATUSES.has(registration.payment_status ?? "");

  const isCancelled =
    registration.status === "cancelled" ||
    registration.payment_status === "refunded";

  function handleToggle() {
    setError(null);
    startTransition(async () => {
      try {
        if (checkedIn) {
          await uncheckInAttendee(registration.id);
          setCheckedIn(false);
        } else {
          await checkInAttendee(registration.id);
          setCheckedIn(true);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to update check-in");
      }
    });
  }

  return (
    <>
      <TableRow
        className={
          isCancelled
            ? "opacity-50 cursor-pointer lg:cursor-default"
            : checkedIn
            ? "bg-green-50 hover:bg-green-100 cursor-pointer lg:cursor-default"
            : "cursor-pointer lg:cursor-default"
        }
        onClick={() => setExpanded((prev) => !prev)}
      >
        <TableCell className="font-medium">
          <div className="flex items-center gap-1">
            <ChevronDown
              className={`h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform lg:hidden ${
                expanded ? "rotate-180" : ""
              }`}
            />
            {p?.first_name} {p?.last_name}
          </div>
        </TableCell>
        <TableCell>{calculateAge(p?.date_of_birth ?? null)}</TableCell>
        <TableCell className="capitalize hidden sm:table-cell">{p?.gender ?? "—"}</TableCell>
        <TableCell className="hidden lg:table-cell">{p?.email ?? "—"}</TableCell>
        <TableCell className="hidden lg:table-cell">{p?.phone ?? "—"}</TableCell>
        <TableCell>
          <Badge
            variant={
              registration.payment_status === "paid"
                ? "default"
                : registration.payment_status === "refunded" ||
                  registration.status === "cancelled"
                ? "destructive"
                : "secondary"
            }
          >
            {registration.status === "cancelled"
              ? "cancelled"
              : (registration.payment_status ?? "unknown")}
          </Badge>
        </TableCell>
        <TableCell className="print:hidden" onClick={(e) => e.stopPropagation()}>
          {canCheckIn ? (
            <>
              <Button
                size="sm"
                variant={checkedIn ? "outline" : "default"}
                onClick={handleToggle}
                disabled={isPending}
                className={checkedIn ? "text-green-700 border-green-300" : ""}
              >
                {isPending ? "..." : checkedIn ? "✓ Checked in" : "Check in"}
              </Button>
              {error && (
                <p className="text-xs text-red-600 mt-1">{error}</p>
              )}
            </>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </TableCell>
      </TableRow>
      {expanded && (
        <TableRow className="lg:hidden bg-muted/30">
          <TableCell colSpan={7} className="py-2 px-4">
            <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-sm">
              <div className="sm:hidden">
                <span className="text-muted-foreground">Gender: </span>
                <span className="capitalize">{p?.gender ?? "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Email: </span>
                <span className="break-all">{p?.email ?? "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Phone: </span>
                <span>{p?.phone ?? "—"}</span>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
