"use client";

import { useState, useTransition, useRef } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Calendar, Heart, Crown, ExternalLink, User, Mail, Phone,
  MapPin, Briefcase, GraduationCap, Save, Pencil, X, ChevronDown,
} from "lucide-react";
import { updateMember } from "@/lib/admin/actions";
import { AdminSearchInput } from "./admin-data-table";

// ─── Types ──────────────────────────────────────────────────

interface MemberDetailProps {
  profile: any;
  registrations: any[];
  vipSubs: any[];
  matchResults: any[];
  matchmakingProfile: any;
  partners: Record<string, { first_name: string; last_name: string }>;
  countries: { id: number; name: string; code: string }[];
  cities: { id: number; name: string; country_id: number }[];
}

// ─── Age helper ─────────────────────────────────────────────

function getAge(dob: string): number | null {
  if (!dob) return null;
  return Math.floor(
    (Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  );
}

// ─── Stat card ──────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color, borderColor }: {
  label: string;
  value: string | number;
  icon: any;
  color?: string;
  borderColor?: string;
}) {
  return (
    <Card className={borderColor ? `border-l-2 ${borderColor}` : ""}>
      <CardContent className="pt-3 pb-3">
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Icon className={`h-3.5 w-3.5 ${color ?? "text-muted-foreground"}`} />
          {label}
        </p>
        <p className="text-xl font-bold mt-0.5">{value}</p>
      </CardContent>
    </Card>
  );
}

// ─── Read-only field display ────────────────────────────────

function ReadOnlyField({ label, value, icon: Icon }: {
  label: string;
  value: string | number | null | undefined;
  icon?: any;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </p>
      <p className="text-sm mt-0.5">{value || "—"}</p>
    </div>
  );
}

// ─── Event registration row with expandable details ────────

function EventRegRow({ reg }: { reg: any }) {
  const [expanded, setExpanded] = useState(false);

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
              href={`/admin/events/${reg.events?.id}`}
              className="font-medium text-primary hover:underline inline-flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              {reg.events?.event_date}
              {reg.events?.start_time && (
                <span className="text-muted-foreground text-xs ml-1">{reg.events.start_time}</span>
              )}
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </TableCell>
        <TableCell className="text-sm hidden md:table-cell">{reg.events?.cities?.name ?? "—"}</TableCell>
        <TableCell className="hidden md:table-cell text-sm">
          {reg.events?.venues?.name ? (
            <Link
              href={`/admin/venues/${reg.events.venues.id}`}
              className="text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {reg.events.venues.name}
            </Link>
          ) : "—"}
        </TableCell>
        <TableCell className="hidden md:table-cell">
          <Badge variant="outline" className="text-xs">
            {reg.events?.event_type?.replace(/_/g, " ") ?? "—"}
          </Badge>
        </TableCell>
        <TableCell>
          <Badge
            variant={
              reg.status === "confirmed" ? "default"
              : reg.status === "waitlisted" ? "secondary"
              : reg.status === "cancelled" ? "destructive"
              : "outline"
            }
          >
            {reg.status}
          </Badge>
        </TableCell>
        <TableCell className="hidden sm:table-cell">
          <Badge variant={reg.payment_status === "paid" ? "default" : "secondary"}>
            {reg.payment_status}
          </Badge>
        </TableCell>
        <TableCell className="hidden lg:table-cell text-sm">
          {reg.amount ? `${reg.amount} ${reg.currency ?? ""}` : "—"}
        </TableCell>
        <TableCell>
          {reg.attended === true ? (
            <Badge variant="default" className="bg-green-600">Attended</Badge>
          ) : reg.attended === false ? (
            <Badge variant="destructive">No show</Badge>
          ) : (
            <span className="text-muted-foreground text-sm">—</span>
          )}
        </TableCell>
      </TableRow>
      {expanded && (
        <TableRow className="lg:hidden bg-muted/30">
          <TableCell colSpan={8} className="py-2 px-4">
            <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-sm">
              <div className="md:hidden">
                <span className="text-muted-foreground">City: </span>
                <span>{reg.events?.cities?.name ?? "—"}</span>
              </div>
              <div className="md:hidden">
                <span className="text-muted-foreground">Venue: </span>
                <span>{reg.events?.venues?.name ?? "—"}</span>
              </div>
              <div className="md:hidden">
                <span className="text-muted-foreground">Type: </span>
                <Badge variant="outline" className="text-xs">
                  {reg.events?.event_type?.replace(/_/g, " ") ?? "—"}
                </Badge>
              </div>
              <div className="sm:hidden">
                <span className="text-muted-foreground">Payment: </span>
                <Badge variant={reg.payment_status === "paid" ? "default" : "secondary"} className="text-xs">
                  {reg.payment_status}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Amount: </span>
                <span>{reg.amount ? `${reg.amount} ${reg.currency ?? ""}` : "—"}</span>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

// ─── Main component ─────────────────────────────────────────

export function MemberDetailClient({
  profile,
  registrations,
  vipSubs,
  matchResults,
  matchmakingProfile,
  partners,
  countries,
  cities,
}: MemberDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [countryId, setCountryId] = useState(
    profile.country_id ? String(profile.country_id) : ""
  );
  const [eventSearch, setEventSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const age = getAge(profile.date_of_birth);
  const filteredCities = countryId
    ? cities.filter((c) => c.country_id === Number(countryId))
    : cities;

  // Event stats
  const attendedEvents = registrations.filter((r: any) => r.attended === true);
  const upcomingRegs = registrations.filter((r: any) =>
    r.events?.event_date >= new Date().toISOString().split("T")[0] && !r.events?.is_cancelled
  );
  const activeVip = vipSubs.find((s: any) => s.status === "active");

  // Filtered events
  const filteredRegistrations = eventSearch.trim()
    ? registrations.filter((r: any) => {
        const term = eventSearch.toLowerCase();
        return (
          (r.events?.event_date ?? "").includes(term) ||
          (r.events?.event_type ?? "").toLowerCase().replace(/_/g, " ").includes(term) ||
          (r.events?.cities?.name ?? "").toLowerCase().includes(term) ||
          (r.events?.venues?.name ?? "").toLowerCase().includes(term) ||
          (r.status ?? "").toLowerCase().includes(term)
        );
      })
    : registrations;

  function handleEdit() {
    setIsEditing(true);
    setSaveMessage(null);
  }

  function handleCancelEdit() {
    setShowCancelDialog(true);
  }

  function confirmCancel() {
    setIsEditing(false);
    setShowCancelDialog(false);
    setCountryId(profile.country_id ? String(profile.country_id) : "");
    formRef.current?.reset();
  }

  async function handleSave(formData: FormData) {
    setSaveMessage(null);
    startTransition(async () => {
      const result = await updateMember(profile.id, formData);
      if (result?.error) {
        setSaveMessage({ type: "error", text: result.error });
      } else {
        setSaveMessage({ type: "success", text: "Member updated successfully" });
        setIsEditing(false);
        setTimeout(() => setSaveMessage(null), 3000);
      }
    });
  }

  // ─── Resolve location names ─────────────────────────────
  const countryName = countries.find((c) => c.id === profile.country_id)?.name;
  const cityName = cities.find((c) => c.id === profile.city_id)?.name;

  return (
    <div className="space-y-4">
      {/* Header with Avatar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback className={`text-lg font-semibold ${
              profile.gender === "male"
                ? "bg-blue-50 text-blue-600"
                : profile.gender === "female"
                  ? "bg-pink-50 text-pink-600"
                  : "bg-primary/10 text-primary"
            }`}>
              {profile.first_name?.[0]}{profile.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">
              {profile.first_name} {profile.last_name}
            </h1>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Mail className="h-3.5 w-3.5" />
              <span>{profile.email}</span>
              {profile.phone && (
                <>
                  <span className="mx-1">|</span>
                  <Phone className="h-3.5 w-3.5" />
                  <span>{profile.phone}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge
            variant="outline"
            className={profile.gender === "male" ? "border-blue-300 text-blue-600" : "border-pink-300 text-pink-600"}
          >
            {profile.gender}
          </Badge>
          {age && <Badge variant="outline">Age {age}</Badge>}
          <Badge variant={profile.is_active ? "default" : "destructive"}>
            {profile.is_active ? "Active" : "Inactive"}
          </Badge>
          <Badge variant={profile.role === "admin" ? "default" : "secondary"}>
            {profile.role}
          </Badge>
          {activeVip && (
            <Badge className="bg-amber-500 text-white hover:bg-amber-600">
              <Crown className="h-3 w-3 mr-1" />
              VIP
            </Badge>
          )}
        </div>
      </div>

      {/* Stats cards with accent borders */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard label="Events" value={registrations.length} icon={Calendar} color="text-blue-600" borderColor="border-l-blue-400" />
        <StatCard label="Attended" value={attendedEvents.length} icon={Calendar} color="text-green-600" borderColor="border-l-green-400" />
        <StatCard label="Upcoming" value={upcomingRegs.length} icon={Calendar} color="text-indigo-600" borderColor="border-l-indigo-400" />
        <StatCard label="Matches" value={matchResults.length} icon={Heart} color="text-pink-600" borderColor="border-l-pink-400" />
        <StatCard label="VIP Subs" value={vipSubs.length} icon={Crown} color="text-amber-600" borderColor="border-l-amber-400" />
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="flex-wrap">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="events">Events ({registrations.length})</TabsTrigger>
          <TabsTrigger value="matches">Matches ({matchResults.length})</TabsTrigger>
          <TabsTrigger value="vip">VIP ({vipSubs.length})</TabsTrigger>
          {matchmakingProfile && <TabsTrigger value="matchmaking">Matchmaking</TabsTrigger>}
        </TabsList>

        {/* ─── Profile tab ─────────────────────────────────── */}
        <TabsContent value="profile" className="mt-4">
          {saveMessage && (
            <p className={`text-sm p-3 rounded mb-4 ${
              saveMessage.type === "error"
                ? "text-destructive bg-destructive/10"
                : "text-green-700 bg-green-100"
            }`}>
              {saveMessage.text}
            </p>
          )}

          {!isEditing ? (
            /* ─── VIEW MODE — two-column layout ──────── */
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Profile Details</h2>
                <Button onClick={handleEdit} variant="outline" size="sm">
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                {/* Left column */}
                <div className="lg:col-span-3 space-y-4">
                  <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4" /> Personal Info</CardTitle></CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
                        <ReadOnlyField label="First Name" value={profile.first_name} />
                        <ReadOnlyField label="Middle Name" value={profile.middle_name} />
                        <ReadOnlyField label="Last Name" value={profile.last_name} />
                        <ReadOnlyField label="Email" value={profile.email} icon={Mail} />
                        <ReadOnlyField label="Phone (Legacy)" value={profile.phone} icon={Phone} />
                        <ReadOnlyField label="Home Phone" value={profile.home_phone} icon={Phone} />
                        <ReadOnlyField label="Mobile Phone" value={profile.mobile_phone} icon={Phone} />
                        <ReadOnlyField label="Work Phone" value={profile.work_phone} icon={Phone} />
                        <ReadOnlyField label="Date of Birth" value={profile.date_of_birth ? `${profile.date_of_birth} (Age: ${age})` : null} />
                        <ReadOnlyField label="Gender" value={profile.gender} />
                        <ReadOnlyField label="Occupation" value={profile.occupation} icon={Briefcase} />
                        <ReadOnlyField label="Education" value={profile.education} icon={GraduationCap} />
                        <ReadOnlyField label="Relationship Status" value={profile.relationship_status} />
                        <ReadOnlyField label="Faith" value={profile.faith} />
                      </div>
                      {profile.bio && (
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1">Bio</p>
                          <p className="text-sm whitespace-pre-wrap">{profile.bio}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Social Profiles — always shown */}
                  <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-base">Social Profiles</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <ReadOnlyField label="Facebook" value={profile.facebook} />
                        <ReadOnlyField label="Instagram" value={profile.instagram} />
                        <ReadOnlyField label="WhatsApp" value={profile.whatsapp} />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right column */}
                <div className="lg:col-span-2 space-y-4">
                  <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><MapPin className="h-4 w-4" /> Location & Role</CardTitle></CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                        <ReadOnlyField label="Country" value={countryName} />
                        <ReadOnlyField label="City" value={cityName} />
                        <ReadOnlyField label="Role" value={profile.role} />
                        <div>
                          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Status</p>
                          <Badge variant={profile.is_active ? "default" : "destructive"} className="mt-0.5">
                            {profile.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Activity Summary — moved from page bottom */}
                  <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-base">Activity Summary</CardTitle></CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                        <ReadOnlyField label="Member Since" value={new Date(profile.created_at).toLocaleDateString()} />
                        <ReadOnlyField label="Last Updated" value={new Date(profile.updated_at).toLocaleDateString()} />
                        <ReadOnlyField label="Email Subscribed" value={profile.subscribed_email ? "Yes" : "No"} />
                        <ReadOnlyField label="SMS Subscribed" value={profile.subscribed_sms ? "Yes" : "No"} />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Admin Comments — always shown */}
                  <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-base">Admin Comments</CardTitle></CardHeader>
                    <CardContent>
                      <p className="text-sm whitespace-pre-wrap">{profile.admin_comments || "—"}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          ) : (
            /* ─── EDIT MODE — sticky bar + two columns ── */
            <form ref={formRef} action={handleSave}>
              {/* Sticky action bar */}
              <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b -mx-4 md:-mx-6 px-4 md:px-6 py-3 mb-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold">Editing Profile</h2>
                    <Badge variant="outline" className="border-amber-400 text-amber-600 bg-amber-50">
                      <Pencil className="h-3 w-3 mr-1" />
                      Edit Mode
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={handleCancelEdit} disabled={isPending}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button type="submit" size="sm" disabled={isPending}>
                      <Save className="h-4 w-4 mr-2" />
                      {isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                {/* Left column — Personal Info */}
                <div className="lg:col-span-3 space-y-4">
                  <Card className="border-amber-200 bg-amber-50/30">
                    <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4" /> Personal Info</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <Label>First Name</Label>
                          <Input name="first_name" defaultValue={profile.first_name} />
                        </div>
                        <div>
                          <Label>Middle Name</Label>
                          <Input name="middle_name" defaultValue={profile.middle_name ?? ""} />
                        </div>
                        <div>
                          <Label>Last Name</Label>
                          <Input name="last_name" defaultValue={profile.last_name} />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <Label>Email</Label>
                          <Input value={profile.email} disabled className="bg-muted" />
                        </div>
                        <div>
                          <Label>DOB</Label>
                          <Input value={profile.date_of_birth} disabled className="bg-muted" />
                          {age && <p className="text-xs text-muted-foreground mt-1">Age: {age}</p>}
                        </div>
                        <div>
                          <Label>Phone (Legacy)</Label>
                          <Input name="phone" defaultValue={profile.phone ?? ""} />
                        </div>
                      </div>

                      {/* Phone Numbers — grouped */}
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Phone Numbers</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <Label className="text-xs">Home</Label>
                            <Input name="home_phone" defaultValue={profile.home_phone ?? ""} className="h-8" />
                          </div>
                          <div>
                            <Label className="text-xs">Mobile</Label>
                            <Input name="mobile_phone" defaultValue={profile.mobile_phone ?? ""} className="h-8" />
                          </div>
                          <div>
                            <Label className="text-xs">Work</Label>
                            <Input name="work_phone" defaultValue={profile.work_phone ?? ""} className="h-8" />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <Label className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> Occupation</Label>
                          <Input name="occupation" defaultValue={profile.occupation ?? ""} />
                        </div>
                        <div>
                          <Label className="flex items-center gap-1"><GraduationCap className="h-3 w-3" /> Education</Label>
                          <Input name="education" defaultValue={profile.education ?? ""} />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <Label>Relationship Status</Label>
                          <Input name="relationship_status" defaultValue={profile.relationship_status ?? ""} />
                        </div>
                        <div>
                          <Label>Faith</Label>
                          <Input name="faith" defaultValue={profile.faith ?? ""} />
                        </div>
                      </div>
                      <div>
                        <Label>Bio</Label>
                        <Textarea name="bio" rows={3} defaultValue={profile.bio ?? ""} />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right column — Location & Role + Admin Comments */}
                <div className="lg:col-span-2 space-y-4">
                  <Card className="border-amber-200 bg-amber-50/30">
                    <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><MapPin className="h-4 w-4" /> Location & Role</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <Label>Country</Label>
                          <Select name="country_id" value={countryId} onValueChange={setCountryId}>
                            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>
                              {countries.map((c) => (
                                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>City</Label>
                          <Select name="city_id" defaultValue={profile.city_id ? String(profile.city_id) : ""}>
                            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>
                              {filteredCities.map((c) => (
                                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label>Role</Label>
                        <Select name="role" defaultValue={profile.role}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="host">Host</SelectItem>
                            <SelectItem value="host_plus">Host Plus</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg">
                        <Label htmlFor="is_active" className="cursor-pointer">Active</Label>
                        <Switch id="is_active" name="is_active" defaultChecked={profile.is_active} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-amber-200 bg-amber-50/30">
                    <CardHeader className="pb-3"><CardTitle className="text-base">Admin Comments</CardTitle></CardHeader>
                    <CardContent>
                      <Textarea
                        name="admin_comments"
                        rows={4}
                        defaultValue={profile.admin_comments ?? ""}
                        placeholder="Internal notes about this member..."
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </form>
          )}

          {/* Cancel confirmation dialog */}
          <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Discard changes?</AlertDialogTitle>
                <AlertDialogDescription>
                  Any unsaved changes will be lost. Are you sure you want to cancel editing?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep Editing</AlertDialogCancel>
                <AlertDialogAction onClick={confirmCancel}>
                  Discard Changes
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TabsContent>

        {/* Events tab */}
        <TabsContent value="events" className="mt-4 space-y-4">
          <AdminSearchInput
            value={eventSearch}
            onChange={setEventSearch}
            placeholder="Search events..."
          />

          {filteredRegistrations.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-sm">
                  {eventSearch ? "No events match your search." : "No event registrations."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="hidden md:table-cell">City</TableHead>
                    <TableHead className="hidden md:table-cell">Venue</TableHead>
                    <TableHead className="hidden md:table-cell">Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Payment</TableHead>
                    <TableHead className="hidden lg:table-cell">Amount</TableHead>
                    <TableHead>Attended</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrations.map((reg: any) => (
                    <EventRegRow key={reg.id} reg={reg} />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* Matches tab */}
        <TabsContent value="matches" className="mt-4">
          {matchResults.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-sm">No matches found.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event Date</TableHead>
                    <TableHead className="hidden md:table-cell">City</TableHead>
                    <TableHead>Match With</TableHead>
                    <TableHead className="hidden md:table-cell">Type</TableHead>
                    <TableHead className="hidden lg:table-cell">Computed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matchResults.map((match: any) => {
                    const isUserA = match.user_a_id === profile.id;
                    const partnerId = isUserA ? match.user_b_id : match.user_a_id;
                    const partner = partners[partnerId];
                    return (
                      <TableRow key={match.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell>
                          <Link
                            href={`/admin/events/${match.event_id}`}
                            className="font-medium text-primary hover:underline inline-flex items-center gap-1"
                          >
                            {match.events?.event_date ?? "—"}
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </TableCell>
                        <TableCell className="text-sm hidden md:table-cell">{match.events?.cities?.name ?? "—"}</TableCell>
                        <TableCell>
                          {partner ? (
                            <Link
                              href={`/admin/members/${partnerId}`}
                              className="text-primary hover:underline inline-flex items-center gap-1"
                            >
                              {partner.first_name} {partner.last_name}
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          ) : (
                            <span className="text-muted-foreground">Unknown</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant={match.result_type === "mutual" ? "default" : "secondary"}>
                            {match.result_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">
                          {new Date(match.computed_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* VIP tab */}
        <TabsContent value="vip" className="mt-4">
          {vipSubs.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-sm">No VIP subscriptions.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {vipSubs.map((sub: any) => (
                <Card key={sub.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Crown className="h-5 w-5 text-amber-500" />
                        <span className="font-semibold">{sub.plan_type} Plan</span>
                      </div>
                      <Badge variant={sub.status === "active" ? "default" : sub.status === "cancelled" ? "destructive" : "secondary"}>
                        {sub.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Price</p>
                        <p className="font-medium">{sub.price_per_month} {sub.currency}/month</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Period</p>
                        <p className="font-medium">
                          {sub.current_period_start ? new Date(sub.current_period_start).toLocaleDateString() : "—"}
                          {" → "}
                          {sub.current_period_end ? new Date(sub.current_period_end).toLocaleDateString() : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Created</p>
                        <p className="font-medium">{new Date(sub.created_at).toLocaleDateString()}</p>
                      </div>
                      {sub.cancelled_at && (
                        <div>
                          <p className="text-muted-foreground">Cancelled</p>
                          <p className="font-medium">{new Date(sub.cancelled_at).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>
                    {sub.stripe_subscription_id && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Stripe: {sub.stripe_subscription_id}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Matchmaking tab */}
        {matchmakingProfile && (
          <TabsContent value="matchmaking" className="mt-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Matchmaking Profile
                  </h3>
                  <Badge variant={
                    matchmakingProfile.status === "active" ? "default"
                    : matchmakingProfile.status === "matched" ? "default"
                    : "secondary"
                  }>
                    {matchmakingProfile.status}
                  </Badge>
                </div>
                {matchmakingProfile.package_type && (
                  <div>
                    <p className="text-sm text-muted-foreground">Package</p>
                    <p className="font-medium">{matchmakingProfile.package_type}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Created</p>
                    <p>{new Date(matchmakingProfile.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Updated</p>
                    <p>{new Date(matchmakingProfile.updated_at).toLocaleDateString()}</p>
                  </div>
                </div>
                {matchmakingProfile.admin_notes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Admin Notes</p>
                    <p className="text-sm whitespace-pre-wrap mt-1">{matchmakingProfile.admin_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
