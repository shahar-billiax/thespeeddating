"use client";

import { useState, useTransition } from "react";
import {
  searchHostUsers,
  addVenueHostess,
  removeVenueHostess,
} from "@/lib/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface VenueHostessesProps {
  venueId: number;
  initialHostesses: Array<{
    id: number;
    user_id: string;
    created_at: string;
    profiles: {
      first_name: string | null;
      last_name: string | null;
      email: string | null;
      role: string;
    } | null;
  }>;
}

export function VenueHostesses({
  venueId,
  initialHostesses,
}: VenueHostessesProps) {
  const [hostesses, setHostesses] = useState(initialHostesses);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    startTransition(async () => {
      const results = await searchHostUsers(searchQuery);
      setSearchResults(results);
    });
  }

  function handleAdd(userId: string) {
    startTransition(async () => {
      await addVenueHostess(venueId, userId);
      window.location.reload();
    });
  }

  function handleRemove(venueHostId: number) {
    startTransition(async () => {
      await removeVenueHostess(venueHostId);
      setHostesses((prev) => prev.filter((h) => h.id !== venueHostId));
    });
  }

  const assignedUserIds = new Set(hostesses.map((h) => h.user_id));

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Assigned Hostesses</h3>
        {hostesses.length === 0 ? (
          <p className="text-sm text-gray-500">No hostesses assigned yet.</p>
        ) : (
          <ul className="space-y-2">
            {hostesses.map((h) => (
              <li
                key={h.id}
                className="flex items-center justify-between bg-gray-50 rounded px-3 py-2 text-sm"
              >
                <div>
                  <span className="font-medium">
                    {h.profiles?.first_name} {h.profiles?.last_name}
                  </span>
                  <span className="text-gray-500 ml-2">{h.profiles?.email}</span>
                  <span className="text-xs text-gray-400 ml-2 capitalize">
                    ({h.profiles?.role})
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => handleRemove(h.id)}
                  disabled={isPending}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Add Hostess</h3>
        <form onSubmit={handleSearch} className="flex gap-2 mb-3">
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xs"
          />
          <Button type="submit" size="sm" disabled={isPending}>
            Search
          </Button>
        </form>

        {searchResults.length > 0 && (
          <ul className="space-y-1">
            {searchResults.map((user) => (
              <li
                key={user.id}
                className="flex items-center justify-between bg-white border border-gray-200 rounded px-3 py-2 text-sm"
              >
                <div>
                  <span className="font-medium">
                    {user.first_name} {user.last_name}
                  </span>
                  <span className="text-gray-500 ml-2">{user.email}</span>
                  <span className="text-xs text-gray-400 ml-2 capitalize">
                    ({user.role})
                  </span>
                </div>
                {assignedUserIds.has(user.id) ? (
                  <span className="text-xs text-green-600 font-medium">
                    Already assigned
                  </span>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAdd(user.id)}
                    disabled={isPending}
                  >
                    Add
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
