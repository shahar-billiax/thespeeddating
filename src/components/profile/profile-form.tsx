"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProfile, updatePassword, deleteAccount } from "@/lib/profile/actions";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface Profile {
  first_name: string;
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
  whatsapp: string | null;
  instagram: string | null;
  facebook: string | null;
  sexual_preference: string | null;
  subscribed_email: boolean;
  subscribed_phone: boolean;
  subscribed_sms: boolean;
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

export function ProfileForm({ profile, countries, cities }: ProfileFormProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isPasswordPending, startPasswordTransition] = useTransition();

  const [formData, setFormData] = useState(profile);
  const [passwordData, setPasswordData] = useState({
    new_password: "",
    confirm_password: "",
  });

  const filteredCities = cities.filter(
    (city) => String(city.country_id) === String(formData.country_id)
  );

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
        toast.error(result.error || "Failed to update profile");
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
        toast.error(result.error || "Failed to update password");
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("profile.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t("profile.basic_info")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={(e) =>
                      setFormData({ ...formData, first_name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={(e) =>
                      setFormData({ ...formData, last_name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    name="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Input
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    disabled
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    disabled
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* About Me */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t("profile.about_me")}</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="occupation">Occupation</Label>
                    <Input
                      id="occupation"
                      name="occupation"
                      value={formData.occupation || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, occupation: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="education">Education</Label>
                    <Input
                      id="education"
                      name="education"
                      value={formData.education || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, education: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="relationship_status">Relationship Status</Label>
                    <Select
                      name="relationship_status"
                      value={formData.relationship_status || ""}
                      onValueChange={(value) =>
                        setFormData({ ...formData, relationship_status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="divorced">Divorced</SelectItem>
                        <SelectItem value="widowed">Widowed</SelectItem>
                        <SelectItem value="separated">Separated</SelectItem>
                      </SelectContent>
                    </Select>
                    <input
                      type="hidden"
                      name="relationship_status"
                      value={formData.relationship_status || ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="faith">Faith</Label>
                    <Select
                      name="faith"
                      value={formData.faith || ""}
                      onValueChange={(value) =>
                        setFormData({ ...formData, faith: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select faith" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="secular">Secular</SelectItem>
                        <SelectItem value="conservative">Conservative</SelectItem>
                        <SelectItem value="orthodox">Orthodox</SelectItem>
                        <SelectItem value="traditional">Traditional</SelectItem>
                        <SelectItem value="reform">Reform</SelectItem>
                        <SelectItem value="liberal">Liberal</SelectItem>
                        <SelectItem value="modern_orthodox">Modern Orthodox</SelectItem>
                        <SelectItem value="atheist">Atheist</SelectItem>
                      </SelectContent>
                    </Select>
                    <input type="hidden" name="faith" value={formData.faith || ""} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height_cm">Height (cm)</Label>
                    <Input
                      id="height_cm"
                      name="height_cm"
                      type="number"
                      value={formData.height_cm || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          height_cm: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-8">
                    <Checkbox
                      id="has_children"
                      name="has_children"
                      checked={formData.has_children ?? false}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, has_children: checked as boolean })
                      }
                    />
                    <input
                      type="hidden"
                      name="has_children"
                      value={formData.has_children ? "true" : "false"}
                    />
                    <Label htmlFor="has_children" className="cursor-pointer">
                      Has Children
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Location */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t("profile.location")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country_id">Country</Label>
                  <Select
                    name="country_id"
                    value={formData.country_id ? String(formData.country_id) : ""}
                    onValueChange={(value) =>
                      setFormData({ ...formData, country_id: value, city_id: null })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={String(country.id)} value={String(country.id)}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <input
                    type="hidden"
                    name="country_id"
                    value={formData.country_id || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city_id">City</Label>
                  <Select
                    name="city_id"
                    value={formData.city_id ? String(formData.city_id) : ""}
                    onValueChange={(value) =>
                      setFormData({ ...formData, city_id: value })
                    }
                    disabled={!formData.country_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredCities.map((city) => (
                        <SelectItem key={String(city.id)} value={String(city.id)}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <input type="hidden" name="city_id" value={formData.city_id || ""} />
                </div>
              </div>
            </div>

            <Separator />

            {/* Contact & Social */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t("profile.contact")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    name="whatsapp"
                    type="tel"
                    value={formData.whatsapp || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, whatsapp: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    name="instagram"
                    value={formData.instagram || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, instagram: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    name="facebook"
                    value={formData.facebook || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, facebook: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Preferences */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t("profile.preferences")}</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sexual_preference">Interested In</Label>
                  <Select
                    name="sexual_preference"
                    value={formData.sexual_preference || ""}
                    onValueChange={(value) =>
                      setFormData({ ...formData, sexual_preference: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="men">Men</SelectItem>
                      <SelectItem value="women">Women</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                  <input
                    type="hidden"
                    name="sexual_preference"
                    value={formData.sexual_preference || ""}
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="subscribed_email">Email Notifications</Label>
                    <Switch
                      id="subscribed_email"
                      name="subscribed_email"
                      checked={formData.subscribed_email}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, subscribed_email: checked })
                      }
                    />
                    <input
                      type="hidden"
                      name="subscribed_email"
                      value={formData.subscribed_email ? "true" : "false"}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="subscribed_phone">Phone Notifications</Label>
                    <Switch
                      id="subscribed_phone"
                      name="subscribed_phone"
                      checked={formData.subscribed_phone}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, subscribed_phone: checked })
                      }
                    />
                    <input
                      type="hidden"
                      name="subscribed_phone"
                      value={formData.subscribed_phone ? "true" : "false"}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="subscribed_sms">SMS Notifications</Label>
                    <Switch
                      id="subscribed_sms"
                      name="subscribed_sms"
                      checked={formData.subscribed_sms}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, subscribed_sms: checked })
                      }
                    />
                    <input
                      type="hidden"
                      name="subscribed_sms"
                      value={formData.subscribed_sms ? "true" : "false"}
                    />
                  </div>
                </div>
              </div>
            </div>

            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : t("profile.save")}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle>{t("profile.change_password")}</CardTitle>
          <CardDescription>Update your account password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
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
                  setPasswordData({
                    ...passwordData,
                    confirm_password: e.target.value,
                  })
                }
                required
              />
            </div>
            <Button type="submit" disabled={isPasswordPending}>
              {isPasswordPending ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Data & Privacy */}
      <Card>
        <CardHeader>
          <CardTitle>Data & Privacy</CardTitle>
          <CardDescription>Manage your personal data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Export My Data</p>
              <p className="text-sm text-muted-foreground">Download all your personal data as JSON</p>
            </div>
            <Button variant="outline" asChild>
              <a href="/api/profile/export" download>Export</a>
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-destructive">Delete Account</p>
              <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
            </div>
            <Button variant="destructive" onClick={() => {
              if (confirm("Are you sure you want to permanently delete your account? This cannot be undone.")) {
                startTransition(async () => {
                  await deleteAccount();
                });
              }
            }} disabled={isPending}>
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
