"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User } from "lucide-react";
import { AdminCountrySelector } from "@/components/admin/admin-country-selector";

interface Country {
  id: number;
  name: string;
  code: string;
  currency: string;
}

export function AdminTopbar({
  user,
  countries,
}: {
  user: { email: string };
  countries: Country[];
}) {
  const initials = user.email.slice(0, 2).toUpperCase();

  return (
    <header className="h-14 border-b bg-background flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-3">
        <div className="md:hidden w-10" />
        <AdminCountrySelector countries={countries} />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <span className="text-sm">{user.email}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <a href="/">
              <User className="mr-2 h-4 w-4" />
              View Site
            </a>
          </DropdownMenuItem>
          <form action="/auth/signout" method="post">
            <DropdownMenuItem asChild>
              <button type="submit" className="w-full">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </button>
            </DropdownMenuItem>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
