"use client";

import { useState, useTransition, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { updateProfile, updatePassword, deleteAccount } from "@/lib/profile/actions";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  User,
  Camera,
  Trash2,
  Loader2,
  Lock,
  Phone,
  MapPin,
  Heart,
  Bell,
  Shield,
  Download,
  AlertTriangle,
} from "lucide-react";

// ─── Constants ──────────────────────────────────────────────

const FAITH_OPTIONS = [
  { value: "Jewish - Orthodox", key: "faith_jewish_orthodox" },
  { value: "Jewish - Conservative", key: "faith_jewish_conservative" },
  { value: "Jewish - Reform", key: "faith_jewish_reform" },
  { value: "Jewish - Traditional", key: "faith_jewish_traditional" },
  { value: "Jewish - Secular", key: "faith_jewish_secular" },
  { value: "Christian", key: "faith_christian" },
  { value: "Muslim", key: "faith_muslim" },
  { value: "Buddhist", key: "faith_buddhist" },
  { value: "Hindu", key: "faith_hindu" },
  { value: "Spiritual", key: "faith_spiritual" },
  { value: "Not religious", key: "faith_not_religious" },
  { value: "Other", key: "faith_other" },
] as const;

const EDUCATION_OPTIONS = [
  { value: "high_school", level: 1, key: "education_high_school" },
  { value: "some_college", level: 2, key: "education_some_college" },
  { value: "bachelors", level: 3, key: "education_bachelors" },
  { value: "masters", level: 4, key: "education_masters" },
  { value: "doctorate", level: 5, key: "education_doctorate" },
] as const;

// ─── Types ──────────────────────────────────────────────────

interface Profile {
  first_name: string;
  middle_name: string | null;
  last_name: string;
  email: string;
  date_of_birth: string;
  gender: string;
  bio: string | null;
  occupation: string | null;
  education: string | null;
  relationship_status: string | null;
  has_children: boolean | null;
  faith: string | null;
  height_cm: number | null;
  country_id: number | string | null;
  city_id: number | string | null;
  phone: string | null;
  home_phone: string | null;
  mobile_phone: string | null;
  work_phone: string | null;
  whatsapp: string | null;
  instagram: string | null;
  facebook: string | null;
  sexual_preference: string | null;
  subscribed_email: boolean;
  subscribed_phone: boolean;
  subscribed_sms: boolean;
  avatar_url: string | null;
}

interface Country {
  id: number | string;
  name: string;
}

interface City {
  id: number | string;
  name: string;
  country_id: number | string;
}

interface ProfileFormProps {
  profile: Profile;
  countries: Country[];
  cities: City[];
}

// ─── Helpers ────────────────────────────────────────────────

function formatDOB(dob: string, locale: string): string {
  const date = new Date(dob + "T00:00:00");
  const formatted = date.toLocaleDateString(
    locale === "he" ? "he-IL" : "en-GB",
    { day: "numeric", month: "long", year: "numeric" }
  );
  const age = Math.floor(
    (Date.now() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  );
  return `${formatted} (${age})`;
}

function getInitials(first: string, last: string): string {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

// ─── Read-only field display ────────────────────────────────

function ReadOnlyValue({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

// ─── Section header ─────────────────────────────────────────

function SectionIcon({
  icon: Icon,
  label,
  iconClassName,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  iconClassName?: string;
}) {
  return (
    <CardTitle className="text-base flex items-center gap-2.5">
      <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${iconClassName || "bg-muted text-muted-foreground"}`}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      {label}
    </CardTitle>
  );
}

// ─── Avatar Upload ──────────────────────────────────────────

function AvatarUpload({
  avatarUrl,
  initials,
  onUploaded,
}: {
  avatarUrl: string | null;
  initials: string;
  onUploaded: (url: string | null) => void;
}) {
  const t = useTranslations();
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const displayUrl = preview || avatarUrl;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }

      const { url } = await res.json();
      onUploaded(url);
      toast.success(t("profile.saved"));
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
      setPreview(null);
    } finally {
      setUploading(false);
      URL.revokeObjectURL(objectUrl);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleRemove() {
    setUploading(true);
    try {
      const res = await fetch("/api/profile/avatar", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to remove");
      onUploaded(null);
      setPreview(null);
      toast.success(t("profile.saved"));
    } catch {
      toast.error("Failed to remove photo");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
      <div className="relative shrink-0 group">
        <div className="h-28 w-28 rounded-full overflow-hidden ring-4 ring-primary/10 ring-offset-2 ring-offset-background bg-muted flex items-center justify-center transition-all group-hover:ring-primary/20">
          {displayUrl ? (
            <Image
              src={displayUrl}
              alt="Profile"
              width={112}
              height={112}
              className="h-full w-full object-cover"
              unoptimized
            />
          ) : (
            <span className="text-3xl font-bold text-muted-foreground/60">
              {initials}
            </span>
          )}
          {uploading && (
            <div className="absolute inset-0 rounded-full bg-background/60 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
        </div>
        {!uploading && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="absolute bottom-0 end-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md ring-2 ring-background hover:bg-primary/90 transition-colors"
          >
            <Camera className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <div className="text-center sm:text-start space-y-2">
        <p className="text-xs text-muted-foreground">{t("profile.photo_hint")}</p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
          >
            <Camera className="h-3.5 w-3.5 me-1.5" />
            {displayUrl ? t("profile.change_photo") : t("profile.upload_photo")}
          </Button>
          {displayUrl && !uploading && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5 me-1.5" />
              {t("profile.remove_photo")}
            </Button>
          )}
        </div>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}

// ─── Main Form Component ────────────────────────────────────

export function ProfileForm({ profile, countries, cities }: ProfileFormProps) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isPasswordPending, startPasswordTransition] = useTransition();

  // Pre-populate mobile_phone from legacy phone if needed
  const initialProfile = useMemo(() => {
    const p = { ...profile };
    if (p.phone && !p.mobile_phone) {
      p.mobile_phone = p.phone;
    }
    return p;
  }, [profile]);

  const [formData, setFormData] = useState(initialProfile);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
  const [passwordData, setPasswordData] = useState({
    new_password: "",
    confirm_password: "",
  });

  const filteredCities = cities.filter(
    (city) => String(city.country_id) === String(formData.country_id)
  );

  // Unsaved changes detection
  const hasUnsavedChanges = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialProfile);
  }, [formData, initialProfile]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasUnsavedChanges]);

  function handleCancel() {
    setFormData(initialProfile);
  }

  function updateField<K extends keyof typeof formData>(
    key: K,
    value: (typeof formData)[K]
  ) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formDataObj = new FormData(form);

    startTransition(async () => {
      const result = await updateProfile(formDataObj);
      if (result.success) {
        toast.success(t("profile.saved"));
        router.refresh();
      } else {
        toast.error(result.error || t("profile.failed_update"));
      }
    });
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formDataObj = new FormData(form);

    startPasswordTransition(async () => {
      const result = await updatePassword(formDataObj);
      if (result.success) {
        toast.success(t("profile.password_updated"));
        setPasswordData({ new_password: "", confirm_password: "" });
      } else {
        toast.error(result.error || t("profile.failed_password"));
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* ─── Main Profile Form ─────────────────────────── */}
      <form onSubmit={handleSubmit}>
        {/* Profile Photo Card */}
        <Card className="mb-6">
          <CardContent className="py-6 px-6">
            <AvatarUpload
              avatarUrl={avatarUrl}
              initials={getInitials(formData.first_name, formData.last_name)}
              onUploaded={(url) => setAvatarUrl(url)}
            />
          </CardContent>
        </Card>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ─── Left Column ─────────────────────────── */}
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader className="pb-4">
                <SectionIcon icon={User} label={t("profile.basic_info")} iconClassName="bg-blue-100 text-blue-600" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">{t("profile.first_name")}</Label>
                    <Input
                      id="first_name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={(e) => updateField("first_name", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="middle_name">{t("profile.middle_name")}</Label>
                    <Input
                      id="middle_name"
                      name="middle_name"
                      value={formData.middle_name || ""}
                      onChange={(e) => updateField("middle_name", e.target.value || null)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">{t("profile.last_name")}</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={(e) => updateField("last_name", e.target.value)}
                    required
                  />
                </div>

                {/* Read-only fields */}
                <div className="pt-2 border-t space-y-3">
                  <ReadOnlyValue
                    label={t("auth.email")}
                    value={formData.email}
                    icon={Lock}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <ReadOnlyValue
                      label={t("profile.date_of_birth")}
                      value={formatDOB(formData.date_of_birth, locale)}
                    />
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">
                        {t("profile.gender")}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {formData.gender === "male"
                          ? t("profile.male")
                          : t("profile.female")}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Details */}
            <Card>
              <CardHeader className="pb-4">
                <SectionIcon icon={Phone} label={t("profile.contact_details")} iconClassName="bg-emerald-100 text-emerald-600" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="home_phone">{t("profile.home_phone")}</Label>
                    <Input
                      id="home_phone"
                      name="home_phone"
                      type="tel"
                      value={formData.home_phone || ""}
                      onChange={(e) => updateField("home_phone", e.target.value || null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mobile_phone">{t("profile.mobile_phone")}</Label>
                    <Input
                      id="mobile_phone"
                      name="mobile_phone"
                      type="tel"
                      value={formData.mobile_phone || ""}
                      onChange={(e) => updateField("mobile_phone", e.target.value || null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="work_phone">{t("profile.work_phone")}</Label>
                    <Input
                      id="work_phone"
                      name="work_phone"
                      type="tel"
                      value={formData.work_phone || ""}
                      onChange={(e) => updateField("work_phone", e.target.value || null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input
                      id="whatsapp"
                      name="whatsapp"
                      type="tel"
                      value={formData.whatsapp || ""}
                      onChange={(e) => updateField("whatsapp", e.target.value || null)}
                    />
                  </div>
                </div>

                {/* Social */}
                <div className="pt-3 border-t">
                  <p className="text-xs font-medium text-muted-foreground mb-3">
                    {t("profile.social_profiles")}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="instagram">Instagram</Label>
                      <Input
                        id="instagram"
                        name="instagram"
                        value={formData.instagram || ""}
                        onChange={(e) => updateField("instagram", e.target.value || null)}
                        placeholder="@username"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="facebook">Facebook</Label>
                      <Input
                        id="facebook"
                        name="facebook"
                        value={formData.facebook || ""}
                        onChange={(e) => updateField("facebook", e.target.value || null)}
                      />
                    </div>
                  </div>
                </div>

                {/* Hidden phone field for backward compat */}
                <input type="hidden" name="phone" value={formData.phone || ""} />
              </CardContent>
            </Card>
          </div>

          {/* ─── Right Column ────────────────────────── */}
          <div className="space-y-6">
            {/* Personal Details */}
            <Card>
              <CardHeader className="pb-4">
                <SectionIcon icon={Heart} label={t("profile.personal_details")} iconClassName="bg-pink-100 text-pink-600" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bio">{t("profile.bio")}</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio || ""}
                    onChange={(e) => updateField("bio", e.target.value || null)}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="occupation">{t("profile.occupation")}</Label>
                    <Input
                      id="occupation"
                      name="occupation"
                      value={formData.occupation || ""}
                      onChange={(e) => updateField("occupation", e.target.value || null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("profile.education")}</Label>
                    <Select
                      value={formData.education || ""}
                      onValueChange={(v) => updateField("education", v || null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("profile.select_education")} />
                      </SelectTrigger>
                      <SelectContent>
                        {EDUCATION_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {t(`profile.${opt.key}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <input type="hidden" name="education" value={formData.education || ""} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("profile.relationship_status")}</Label>
                    <Select
                      value={formData.relationship_status || ""}
                      onValueChange={(v) => updateField("relationship_status", v || null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("profile.select_status")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">{t("profile.single")}</SelectItem>
                        <SelectItem value="divorced">{t("profile.divorced")}</SelectItem>
                        <SelectItem value="widowed">{t("profile.widowed")}</SelectItem>
                        <SelectItem value="separated">{t("profile.separated")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <input type="hidden" name="relationship_status" value={formData.relationship_status || ""} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("profile.faith")}</Label>
                    <Select
                      value={formData.faith || ""}
                      onValueChange={(v) => updateField("faith", v || null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("profile.select_faith")} />
                      </SelectTrigger>
                      <SelectContent>
                        {FAITH_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {t(`profile.${opt.key}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <input type="hidden" name="faith" value={formData.faith || ""} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height_cm">{t("profile.height")}</Label>
                    <Input
                      id="height_cm"
                      name="height_cm"
                      type="number"
                      value={formData.height_cm || ""}
                      onChange={(e) =>
                        updateField("height_cm", e.target.value ? Number(e.target.value) : null)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("profile.interested_in")}</Label>
                    <Select
                      value={formData.sexual_preference || ""}
                      onValueChange={(v) => updateField("sexual_preference", v || null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("profile.select_preference")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="men">{t("profile.men")}</SelectItem>
                        <SelectItem value="women">{t("profile.women")}</SelectItem>
                        <SelectItem value="both">{t("profile.both")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <input type="hidden" name="sexual_preference" value={formData.sexual_preference || ""} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("profile.children")}</Label>
                    <Select
                      value={formData.has_children === true ? "yes" : formData.has_children === false ? "no" : ""}
                      onValueChange={(v) =>
                        updateField("has_children", v === "yes" ? true : v === "no" ? false : null)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("profile.select_children")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">{t("profile.yes")}</SelectItem>
                        <SelectItem value="no">{t("profile.no")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <input
                      type="hidden"
                      name="has_children"
                      value={formData.has_children === true ? "true" : formData.has_children === false ? "false" : ""}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader className="pb-4">
                <SectionIcon icon={MapPin} label={t("profile.location")} iconClassName="bg-amber-100 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("profile.country")}</Label>
                    <Select
                      value={formData.country_id ? String(formData.country_id) : ""}
                      onValueChange={(v) => {
                        updateField("country_id", v);
                        updateField("city_id", null);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("profile.select_country")} />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((c) => (
                          <SelectItem key={String(c.id)} value={String(c.id)}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <input type="hidden" name="country_id" value={formData.country_id || ""} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("profile.city")}</Label>
                    <Select
                      value={formData.city_id ? String(formData.city_id) : ""}
                      onValueChange={(v) => updateField("city_id", v)}
                      disabled={!formData.country_id}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("profile.select_city")} />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredCities.map((c) => (
                          <SelectItem key={String(c.id)} value={String(c.id)}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <input type="hidden" name="city_id" value={formData.city_id || ""} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card>
              <CardHeader className="pb-4">
                <SectionIcon icon={Bell} label={t("profile.preferences")} iconClassName="bg-violet-100 text-violet-600" />
              </CardHeader>
              <CardContent className="space-y-1">
                <label htmlFor="subscribed_email" className="flex items-center justify-between rounded-lg border p-3.5 cursor-pointer hover:bg-muted/30 transition-colors">
                  <div>
                    <p className="text-sm font-medium">{t("profile.email_notifications")}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t("profile.email_notifications_desc")}</p>
                  </div>
                  <Switch
                    id="subscribed_email"
                    checked={formData.subscribed_email}
                    onCheckedChange={(v) => updateField("subscribed_email", v)}
                  />
                  <input type="hidden" name="subscribed_email" value={formData.subscribed_email ? "true" : "false"} />
                </label>
                <label htmlFor="subscribed_phone" className="flex items-center justify-between rounded-lg border p-3.5 cursor-pointer hover:bg-muted/30 transition-colors">
                  <div>
                    <p className="text-sm font-medium">{t("profile.phone_notifications")}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t("profile.phone_notifications_desc")}</p>
                  </div>
                  <Switch
                    id="subscribed_phone"
                    checked={formData.subscribed_phone}
                    onCheckedChange={(v) => updateField("subscribed_phone", v)}
                  />
                  <input type="hidden" name="subscribed_phone" value={formData.subscribed_phone ? "true" : "false"} />
                </label>
                <label htmlFor="subscribed_sms" className="flex items-center justify-between rounded-lg border p-3.5 cursor-pointer hover:bg-muted/30 transition-colors">
                  <div>
                    <p className="text-sm font-medium">{t("profile.sms_notifications")}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t("profile.sms_notifications_desc")}</p>
                  </div>
                  <Switch
                    id="subscribed_sms"
                    checked={formData.subscribed_sms}
                    onCheckedChange={(v) => updateField("subscribed_sms", v)}
                  />
                  <input type="hidden" name="subscribed_sms" value={formData.subscribed_sms ? "true" : "false"} />
                </label>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ─── Sticky Save/Cancel Bar ────────────────── */}
        {hasUnsavedChanges && (
          <div className="sticky bottom-0 z-20 -mx-4 sm:-mx-6 lg:-mx-8">
            <div className="border-t bg-background/95 backdrop-blur-sm px-4 sm:px-6 lg:px-8 py-3 shadow-[0_-2px_10px_rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-between">
                <p className="text-sm text-amber-600 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {t("profile.unsaved_changes")}
                </p>
                <div className="flex items-center gap-3">
                  <Button type="button" variant="outline" size="sm" onClick={handleCancel}>
                    {t("common.cancel")}
                  </Button>
                  <Button type="submit" size="sm" disabled={isPending}>
                    {isPending && <Loader2 className="h-3.5 w-3.5 me-1.5 animate-spin" />}
                    {isPending ? t("common.saving") : t("profile.save")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>

      {/* ─── Change Password ─────────────────────────── */}
      <Card>
        <CardHeader>
          <SectionIcon icon={Shield} label={t("profile.change_password")} iconClassName="bg-slate-100 text-slate-600" />
          <CardDescription>{t("profile.change_password_desc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new_password">{t("profile.new_password")}</Label>
                <Input
                  id="new_password"
                  name="new_password"
                  type="password"
                  value={passwordData.new_password}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, new_password: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm_password">{t("profile.confirm_password")}</Label>
                <Input
                  id="confirm_password"
                  name="confirm_password"
                  type="password"
                  value={passwordData.confirm_password}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirm_password: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <Button type="submit" disabled={isPasswordPending}>
              {isPasswordPending ? t("common.saving") : t("profile.update_password")}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ─── Data & Privacy ──────────────────────────── */}
      <Card>
        <CardHeader>
          <SectionIcon icon={Lock} label={t("profile.data_privacy")} iconClassName="bg-red-100 text-red-600" />
          <CardDescription>{t("profile.data_privacy_desc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">{t("profile.export_data")}</p>
              <p className="text-xs text-muted-foreground">
                {t("profile.export_data_desc")}
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href="/api/profile/export" download>
                <Download className="h-3.5 w-3.5 me-1.5" />
                {t("profile.export")}
              </a>
            </Button>
          </div>
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm text-destructive">
                  {t("profile.delete_account")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("profile.delete_account_desc")}
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" disabled={isPending}>
                    {t("profile.delete_account")}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {t("profile.delete_confirm_title")}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {t("profile.delete_confirm_desc")}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={() => {
                        startTransition(async () => {
                          await deleteAccount();
                        });
                      }}
                    >
                      {t("profile.delete_account")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
