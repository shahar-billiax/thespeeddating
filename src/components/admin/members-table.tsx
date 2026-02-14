"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  SortableHeader, AdminSearchInput, EmptyTableRow,
  type SortDir,
} from "./admin-data-table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ChevronDown, ExternalLink } from "lucide-react";

type MemberRow = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  gender: string;
  date_of_birth: string;
  role: string;
  is_active: boolean;
  created_at: string;
  cities: { name: string } | null;
  countries: { name: string; code: string } | null;
};

type SortKey = "name" | "email" | "gender" | "age" | "city" | "role" | "joined" | "status";

function getAge(dob: string): number | null {
  if (!dob) return null;
  return Math.floor(
    (Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  );
}

function compareFn(a: MemberRow, b: MemberRow, key: SortKey, dir: SortDir): number {
  let cmp = 0;
  switch (key) {
    case "name":
      cmp = `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
      break;
    case "email":
      cmp = a.email.localeCompare(b.email);
      break;
    case "gender":
      cmp = a.gender.localeCompare(b.gender);
      break;
    case "age": {
      const aAge = getAge(a.date_of_birth) ?? 0;
      const bAge = getAge(b.date_of_birth) ?? 0;
      cmp = aAge - bAge;
      break;
    }
    case "city":
      cmp = (a.cities?.name ?? "").localeCompare(b.cities?.name ?? "");
      break;
    case "role":
      cmp = a.role.localeCompare(b.role);
      break;
    case "joined":
      cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      break;
    case "status": {
      const aVal = a.is_active ? 1 : 0;
      const bVal = b.is_active ? 1 : 0;
      cmp = aVal - bVal;
      break;
    }
  }
  return dir === "desc" ? -cmp : cmp;
}

function MemberRowItem({ member: m }: { member: MemberRow }) {
  const [expanded, setExpanded] = useState(false);
  const age = getAge(m.date_of_birth);

  return (
    <>
      <TableRow
        className="cursor-pointer lg:cursor-default"
        onClick={() => setExpanded((prev) => !prev)}
      >
        <TableCell>
          <div className="flex items-center gap-1">
            <ChevronDown
              className={`h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform lg:hidden ${
                expanded ? "rotate-180" : ""
              }`}
            />
            <Link
              href={`/admin/members/${m.id}`}
              className="text-primary hover:underline font-medium inline-flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              {m.first_name} {m.last_name}
              <ExternalLink className="h-3 w-3 shrink-0" />
            </Link>
          </div>
        </TableCell>
        <TableCell className="text-sm hidden lg:table-cell max-w-[150px] truncate">{m.email}</TableCell>
        <TableCell className="hidden md:table-cell">
          <Badge
            variant="outline"
            className={m.gender === "male" ? "border-blue-300 text-blue-600" : "border-pink-300 text-pink-600"}
          >
            {m.gender}
          </Badge>
        </TableCell>
        <TableCell className="hidden lg:table-cell">{age ?? "—"}</TableCell>
        <TableCell className="hidden lg:table-cell">{m.cities?.name ?? "—"}</TableCell>
        <TableCell>
          <Badge variant={m.role === "admin" ? "default" : m.role === "host" || m.role === "host_plus" ? "outline" : "secondary"}>
            {m.role}
          </Badge>
        </TableCell>
        <TableCell className="hidden md:table-cell">
          <Badge variant={m.is_active ? "default" : "destructive"} className="text-xs">
            {m.is_active ? "Active" : "Inactive"}
          </Badge>
        </TableCell>
        <TableCell className="text-sm text-muted-foreground hidden xl:table-cell">
          {new Date(m.created_at).toLocaleDateString()}
        </TableCell>
      </TableRow>
      {expanded && (
        <TableRow className="lg:hidden bg-muted/30">
          <TableCell colSpan={8} className="py-2 px-4">
            <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-sm">
              <div>
                <span className="text-muted-foreground">Email: </span>
                <span className="break-all">{m.email}</span>
              </div>
              <div className="md:hidden">
                <span className="text-muted-foreground">Gender: </span>
                <Badge
                  variant="outline"
                  className={`text-xs ${m.gender === "male" ? "border-blue-300 text-blue-600" : "border-pink-300 text-pink-600"}`}
                >
                  {m.gender}
                </Badge>
              </div>
              <div className="md:hidden">
                <span className="text-muted-foreground">Status: </span>
                <Badge variant={m.is_active ? "default" : "destructive"} className="text-xs">
                  {m.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Age: </span>
                <span>{age ?? "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">City: </span>
                <span>{m.cities?.name ?? "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Joined: </span>
                <span>{new Date(m.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

export function MembersTable({ members }: { members: MemberRow[] }) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey | null>("joined");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const filtered = useMemo(() => {
    let list = members;

    if (genderFilter !== "all") {
      list = list.filter((m) => m.gender === genderFilter);
    }

    if (roleFilter !== "all") {
      list = list.filter((m) => m.role === roleFilter);
    }

    if (search.trim()) {
      const term = search.toLowerCase().trim();
      list = list.filter((m) =>
        `${m.first_name} ${m.last_name}`.toLowerCase().includes(term) ||
        m.email.toLowerCase().includes(term) ||
        (m.phone ?? "").includes(term) ||
        (m.cities?.name ?? "").toLowerCase().includes(term) ||
        m.role.toLowerCase().includes(term)
      );
    }

    return list;
  }, [members, search, genderFilter, roleFilter]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => compareFn(a, b, sortKey, sortDir));
  }, [filtered, sortKey, sortDir]);

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
        <AdminSearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name, email, phone..."
        />
        <Select value={genderFilter} onValueChange={setGenderFilter}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
          </SelectContent>
        </Select>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="member">Member</SelectItem>
            <SelectItem value="host">Host</SelectItem>
            <SelectItem value="host_plus">Host Plus</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground ml-auto">
          {sorted.length} of {members.length} members
        </span>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader label="Name" sortKey="name" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
              <SortableHeader label="Email" sortKey="email" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} className="hidden lg:table-cell" />
              <SortableHeader label="Gender" sortKey="gender" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} className="hidden md:table-cell" />
              <SortableHeader label="Age" sortKey="age" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} className="hidden lg:table-cell" />
              <SortableHeader label="City" sortKey="city" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} className="hidden lg:table-cell" />
              <SortableHeader label="Role" sortKey="role" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
              <SortableHeader label="Status" sortKey="status" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} className="hidden md:table-cell" />
              <SortableHeader label="Joined" sortKey="joined" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} className="hidden xl:table-cell" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length === 0 ? (
              <EmptyTableRow colSpan={8} search={search} entityName="members" />
            ) : (
              sorted.map((m) => (
                <MemberRowItem key={m.id} member={m} />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
