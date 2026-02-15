"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase, GraduationCap, Crown, Heart, Users, X, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  age: number | null;
  avatarUrl: string | null;
  bio: string | null;
  city: string | null;
  interests: string[] | null;
  occupation: string | null;
  education: string | null;
}

interface ParticipantCardProps {
  participant: Participant;
  theirChoice?: string | null;
  compact?: boolean;
  choice?: "date" | "friend" | "no" | null;
  complete?: boolean;
  onClick?: () => void;
}

function VipChoiceBadge({ choice }: { choice: string }) {
  const t = useTranslations("matches");

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
        choice === "date" && "bg-pink-50 text-pink-600 ring-1 ring-pink-200",
        choice === "friend" && "bg-blue-50 text-blue-600 ring-1 ring-blue-200",
        choice === "no" && "bg-gray-50 text-gray-500 ring-1 ring-gray-200",
      )}
    >
      <Crown className="h-3 w-3" />
      {choice === "date" && t("vip_they_chose_date")}
      {choice === "friend" && t("vip_they_chose_friend")}
      {choice === "no" && t("vip_they_chose_pass")}
    </span>
  );
}

export function ParticipantCard({ participant, theirChoice, compact, choice, complete, onClick }: ParticipantCardProps) {
  const initials = `${participant.firstName[0] ?? ""}${participant.lastName?.[0] ?? ""}`.toUpperCase();
  const t = useTranslations("matches");

  if (compact) {
    return (
      <Card
        className={cn(
          "border overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md hover:ring-1 hover:ring-primary/20 hover:-translate-y-0.5",
          !choice && "border-dashed border-muted-foreground/30",
          choice && !complete && "ring-2 ring-amber-300 border-amber-200",
          choice === "date" && complete && "ring-2 ring-pink-300 border-pink-200",
          choice === "friend" && complete && "ring-2 ring-blue-300 border-blue-200",
          choice === "no" && complete && "ring-2 ring-gray-300 border-gray-200",
        )}
        onClick={onClick}
      >
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col items-center text-center gap-2">
            {/* Avatar with VIP indicator */}
            <div className="relative">
              <Avatar className="h-14 w-14 sm:h-16 sm:w-16 ring-2 ring-background shadow-md">
                <AvatarImage
                  src={participant.avatarUrl ?? undefined}
                  alt={participant.firstName}
                  className="object-cover"
                />
                <AvatarFallback className="text-sm font-semibold bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {theirChoice && (
                <div
                  className={cn(
                    "absolute -top-1 -end-1 h-5 w-5 rounded-full flex items-center justify-center shadow-sm",
                    theirChoice === "date" && "bg-pink-500",
                    theirChoice === "friend" && "bg-blue-500",
                    theirChoice === "no" && "bg-gray-400",
                  )}
                >
                  <Crown className="h-3 w-3 text-white" />
                </div>
              )}
            </div>

            {/* Name and info */}
            <div className="min-w-0 w-full">
              <p className="font-semibold text-sm truncate">
                {participant.firstName} {participant.lastName}
              </p>
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-0.5">
                {participant.age && <span>{participant.age}</span>}
                {participant.age && participant.city && <span>·</span>}
                {participant.city && (
                  <span className="inline-flex items-center gap-0.5 truncate">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{participant.city}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Choice badge */}
            {choice && complete && (
              <Badge
                variant="secondary"
                className={cn(
                  "text-xs gap-1",
                  choice === "date" && "bg-pink-100 text-pink-700 border-pink-200",
                  choice === "friend" && "bg-blue-100 text-blue-700 border-blue-200",
                  choice === "no" && "bg-gray-100 text-gray-600 border-gray-200",
                )}
              >
                {choice === "date" && <Heart className="h-3 w-3" />}
                {choice === "friend" && <Users className="h-3 w-3" />}
                {choice === "no" && <X className="h-3 w-3" />}
                {choice === "date" && t("date")}
                {choice === "friend" && t("friend")}
                {choice === "no" && t("pass")}
              </Badge>
            )}
            {choice && !complete && (
              <Badge variant="secondary" className="text-xs gap-1 bg-amber-100 text-amber-700 border-amber-200">
                <AlertCircle className="h-3 w-3" />
                {t("incomplete")}
              </Badge>
            )}
            {!choice && (
              <span className="text-xs text-muted-foreground/60">
                {t("open_to_score")}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full card (used in scoring view)
  return (
    <Card className="border-0 shadow-sm overflow-hidden">
      <CardContent className="p-5">
        {/* Header: avatar + name horizontal */}
        <div className="flex gap-4 items-start">
          <div className="relative shrink-0">
            <Avatar className="h-20 w-20 ring-2 ring-background shadow-lg">
              <AvatarImage
                src={participant.avatarUrl ?? undefined}
                alt={participant.firstName}
                className="object-cover"
              />
              <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            {theirChoice && (
              <div
                className={cn(
                  "absolute -bottom-1 -end-1 h-6 w-6 rounded-full flex items-center justify-center shadow-sm ring-2 ring-background",
                  theirChoice === "date" && "bg-pink-500",
                  theirChoice === "friend" && "bg-blue-500",
                  theirChoice === "no" && "bg-gray-400",
                )}
              >
                <Crown className="h-3.5 w-3.5 text-white" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold leading-tight">
              {participant.firstName} {participant.lastName}
            </h2>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
              {participant.age && <span>{participant.age}</span>}
              {participant.age && participant.city && (
                <span className="text-muted-foreground/40">·</span>
              )}
              {participant.city && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {participant.city}
                </span>
              )}
            </div>
            {(participant.occupation || participant.education) && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-sm text-muted-foreground/80">
                {participant.occupation && (
                  <span className="inline-flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5 shrink-0" />
                    {participant.occupation}
                  </span>
                )}
                {participant.education && (
                  <span className="inline-flex items-center gap-1">
                    <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                    {participant.education}
                  </span>
                )}
              </div>
            )}
            {theirChoice && (
              <div className="mt-2">
                <VipChoiceBadge choice={theirChoice} />
              </div>
            )}
          </div>
        </div>

        {/* Bio + interests below */}
        {(participant.bio || (participant.interests && participant.interests.length > 0)) && (
          <div className="mt-4 pt-4 border-t space-y-3">
            {participant.bio && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {participant.bio}
              </p>
            )}
            {participant.interests && participant.interests.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {participant.interests.slice(0, 6).map((interest, i) => (
                  <Badge key={i} variant="secondary" className="text-xs font-normal">
                    {interest}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
