"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  Calendar,
  ExternalLink,
  GraduationCap,
  Heart,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Users,
} from "lucide-react";

type MemberRow = {
  id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  email: string;
  phone: string | null;
  home_phone: string | null;
  mobile_phone: string | null;
  work_phone: string | null;
  gender: string;
  date_of_birth: string;
  role: string;
  is_active: boolean;
  created_at: string;
  avatar_url: string | null;
  occupation: string | null;
  education: string | null;
  faith: string | null;
  relationship_status: string | null;
  has_children: boolean | null;
  sexual_preference: string | null;
  subscribed_email: boolean;
  subscribed_phone: boolean;
  subscribed_sms: boolean;
  admin_comments: string | null;
  cities: { name: string } | null;
  countries: { name: string; code: string } | null;
};

function getAge(dob: string): number | null {
  if (!dob) return null;
  return Math.floor(
    (Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  );
}

function getInitials(first: string, last: string): string {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

function InfoRow({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
      <Icon className="h-3 w-3 shrink-0 opacity-50" />
      <span className="truncate">{children}</span>
    </div>
  );
}

function MemberCard({ member: m }: { member: MemberRow }) {
  const age = getAge(m.date_of_birth);

  return (
    <Card className="hover:shadow-md transition-shadow group">
      <CardContent className="p-4">
        {/* Header: large avatar + name + badges */}
        <div className="flex items-start gap-3">
          <Avatar className="h-24 w-24 shrink-0 rounded-xl">
            {m.avatar_url && (
              <AvatarImage
                src={m.avatar_url}
                alt={m.first_name}
                className="object-cover"
              />
            )}
            <AvatarFallback
              className={`text-2xl font-semibold rounded-xl ${
                m.gender === "male"
                  ? "bg-blue-50 text-blue-600"
                  : "bg-pink-50 text-pink-600"
              }`}
            >
              {getInitials(m.first_name, m.last_name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0 pt-0.5">
            <Link
              href={`/admin/members/${m.id}`}
              className="font-semibold text-primary hover:underline inline-flex items-center gap-1"
            >
              <span className="truncate">
                {m.first_name} {m.last_name}
              </span>
              <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>

            <div className="text-sm text-muted-foreground mt-0.5">
              {[age ? `${age} y/o` : null, m.gender]
                .filter(Boolean)
                .join(" · ")}
            </div>

            {m.cities?.name && (
              <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                <MapPin className="h-3 w-3 opacity-50" />
                <span className="truncate">
                  {m.cities.name}
                  {m.countries?.code
                    ? `, ${m.countries.code.toUpperCase()}`
                    : ""}
                </span>
              </div>
            )}

            <div className="flex flex-wrap gap-1 mt-1.5">
              <Badge
                variant={m.is_active ? "default" : "destructive"}
                className="text-[10px] px-1.5 py-0"
              >
                {m.is_active ? "Active" : "Inactive"}
              </Badge>
              <Badge
                variant={
                  m.role === "admin"
                    ? "default"
                    : m.role === "host" || m.role === "host_plus"
                      ? "outline"
                      : "secondary"
                }
                className="text-[10px] px-1.5 py-0"
              >
                {m.role}
              </Badge>
              {m.relationship_status && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  {m.relationship_status}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Info rows */}
        <div className="mt-3 pt-3 border-t space-y-1">
          {m.occupation && <InfoRow icon={Briefcase}>{m.occupation}</InfoRow>}
          {m.education && <InfoRow icon={GraduationCap}>{m.education}</InfoRow>}
          {m.faith && (
            <InfoRow icon={Heart}>
              {m.faith.replace(/_/g, " ")}
              {m.has_children ? " · has children" : ""}
            </InfoRow>
          )}
          <InfoRow icon={Mail}>{m.email}</InfoRow>
          {(m.mobile_phone || m.phone) && <InfoRow icon={Phone}>{m.mobile_phone || m.phone}</InfoRow>}
        </div>

        {/* Footer: joined date + indicators */}
        <div className="mt-2 pt-2 border-t flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Calendar className="h-3 w-3 opacity-50" />
            {new Date(m.created_at).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-1">
            {m.subscribed_email && (
              <span title="Email subscribed" className="h-4 w-4 rounded-full bg-green-100 flex items-center justify-center">
                <Mail className="h-2.5 w-2.5 text-green-600" />
              </span>
            )}
            {m.subscribed_phone && (
              <span title="Phone subscribed" className="h-4 w-4 rounded-full bg-blue-100 flex items-center justify-center">
                <Phone className="h-2.5 w-2.5 text-blue-600" />
              </span>
            )}
            {m.admin_comments && m.admin_comments.trim() && (
              <span title="Has admin notes" className="h-4 w-4 rounded-full bg-amber-100 flex items-center justify-center">
                <MessageSquare className="h-2.5 w-2.5 text-amber-600" />
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function MembersCardView({ members }: { members: MemberRow[] }) {
  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Users className="h-10 w-10 mb-2 opacity-40" />
        <p className="text-sm">No members found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-4">
      {members.map((m) => (
        <MemberCard key={m.id} member={m} />
      ))}
    </div>
  );
}
