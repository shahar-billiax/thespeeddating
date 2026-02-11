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
                  <Label htmlFor="first_name">{t("profile.first_name")}</Label>
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
                  <Label htmlFor="last_name">{t("profile.last_name")}</Label>
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
                  <Label htmlFor="date_of_birth">{t("profile.date_of_birth")}</Label>
                  <Input
                    id="date_of_birth"
                    name="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">{t("profile.gender")}</Label>
                  <Input
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    disabled
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email">{t("auth.email")}</Label>
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
                  <Label htmlFor="bio">{t("profile.bio")}</Label>
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
                    <Label htmlFor="occupation">{t("profile.occupation")}</Label>
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
                    <Label htmlFor="education">{t("profile.education")}</Label>
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
                    <Label htmlFor="relationship_status">{t("profile.relationship_status")}</Label>
                    <Select
                      value={formData.relationship_status || ""}
                      onValueChange={(value) =>
                        setFormData({ ...formData, relationship_status: value })
                      }
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
                    <input
                      type="hidden"
                      name="relationship_status"
                      value={formData.relationship_status || ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="faith">{t("profile.faith")}</Label>
                    <Select
                      value={formData.faith || ""}
                      onValueChange={(value) =>
                        setFormData({ ...formData, faith: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("profile.select_faith")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="secular">{t("profile.secular")}</SelectItem>
                        <SelectItem value="conservative">{t("profile.conservative")}</SelectItem>
                        <SelectItem value="orthodox">{t("profile.orthodox")}</SelectItem>
                        <SelectItem value="traditional">{t("profile.traditional")}</SelectItem>
                        <SelectItem value="reform">{t("profile.reform")}</SelectItem>
                        <SelectItem value="liberal">{t("profile.liberal")}</SelectItem>
                        <SelectItem value="modern_orthodox">{t("profile.modern_orthodox")}</SelectItem>
                        <SelectItem value="atheist">{t("profile.atheist")}</SelectItem>
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
                      {t("profile.has_children")}
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
                  <Label htmlFor="country_id">{t("profile.country")}</Label>
                  <Select
                    value={formData.country_id ? String(formData.country_id) : ""}
                    onValueChange={(value) =>
                      setFormData({ ...formData, country_id: value, city_id: null })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("profile.select_country")} />
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
                  <Label htmlFor="city_id">{t("profile.city")}</Label>
                  <Select
                    value={formData.city_id ? String(formData.city_id) : ""}
                    onValueChange={(value) =>
                      setFormData({ ...formData, city_id: value })
                    }
                    disabled={!formData.country_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("profile.select_city")} />
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
                  <Label htmlFor="phone">{t("profile.phone")}</Label>
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
                  <Label htmlFor="sexual_preference">{t("profile.interested_in")}</Label>
                  <Select
                    value={formData.sexual_preference || ""}
                    onValueChange={(value) =>
                      setFormData({ ...formData, sexual_preference: value })
                    }
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
                  <input
                    type="hidden"
                    name="sexual_preference"
                    value={formData.sexual_preference || ""}
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="subscribed_email">{t("profile.email_notifications")}</Label>
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
                    <Label htmlFor="subscribed_phone">{t("profile.phone_notifications")}</Label>
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
                    <Label htmlFor="subscribed_sms">{t("profile.sms_notifications")}</Label>
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
              {isPending ? t("common.saving") : t("profile.save")}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle>{t("profile.change_password")}</CardTitle>
          <CardDescription>{t("profile.change_password_desc")}</CardDescription>
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
              {isPasswordPending ? t("common.saving") : t("profile.update_password")}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Data & Privacy */}
      <Card>
        <CardHeader>
          <CardTitle>{t("profile.data_privacy")}</CardTitle>
          <CardDescription>{t("profile.data_privacy_desc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{t("profile.export_data")}</p>
              <p className="text-sm text-muted-foreground">{t("profile.export_data_desc")}</p>
            </div>
            <Button variant="outline" asChild>
              <a href="/api/profile/export" download>{t("profile.export")}</a>
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-destructive">{t("profile.delete_account")}</p>
              <p className="text-sm text-muted-foreground">{t("profile.delete_account_desc")}</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isPending}>
                  {t("profile.delete_account")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("profile.delete_confirm_title")}</AlertDialogTitle>
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
        </CardContent>
      </Card>
    </div>
  );
}
