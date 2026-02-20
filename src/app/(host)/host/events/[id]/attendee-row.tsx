"use client";

import { useState, useTransition } from "react";
import { checkInAttendee, uncheckInAttendee } from "@/lib/host/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
    created_at: string;
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

export function AttendeeRow({ registration }: AttendeeRowProps) {
  const [checkedIn, setCheckedIn] = useState(!!registration.checked_in_at);
  const [isPending, startTransition] = useTransition();
  const p = registration.profiles;

  function handleToggle() {
    startTransition(async () => {
      if (checkedIn) {
        await uncheckInAttendee(registration.id);
        setCheckedIn(false);
      } else {
        await checkInAttendee(registration.id);
        setCheckedIn(true);
      }
    });
  }

  return (
    <tr className={checkedIn ? "bg-green-50" : "hover:bg-gray-50"}>
      <td className="px-4 py-3">
        <span className="font-medium">
          {p?.first_name} {p?.last_name}
        </span>
      </td>
      <td className="px-4 py-3 text-gray-600">{calculateAge(p?.date_of_birth ?? null)}</td>
      <td className="px-4 py-3 text-gray-600 capitalize">{p?.gender ?? "—"}</td>
      <td className="px-4 py-3 text-gray-600">{p?.email ?? "—"}</td>
      <td className="px-4 py-3 text-gray-600">{p?.phone ?? "—"}</td>
      <td className="px-4 py-3">
        <Badge variant={registration.payment_status === "paid" ? "default" : "secondary"}>
          {registration.payment_status ?? "unknown"}
        </Badge>
      </td>
      <td className="px-4 py-3 print:hidden">
        <Button
          size="sm"
          variant={checkedIn ? "outline" : "default"}
          onClick={handleToggle}
          disabled={isPending}
          className={checkedIn ? "text-green-700 border-green-300" : ""}
        >
          {isPending ? "..." : checkedIn ? "✓ Checked in" : "Check in"}
        </Button>
      </td>
    </tr>
  );
}
