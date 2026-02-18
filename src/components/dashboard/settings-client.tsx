"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { updatePassword, deleteAccount } from "@/lib/profile/actions";
import { updateNotificationPreferences } from "@/lib/dashboard/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import { Shield, Bell, Trash2, Download } from "lucide-react";

interface SettingsClientProps {
  notificationPrefs: {
    subscribed_email: boolean;
    subscribed_phone: boolean;
    subscribed_sms: boolean;
  };
}

export function SettingsClient({ notificationPrefs }: SettingsClientProps) {
  const t = useTranslations();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Notification state
  const [prefs, setPrefs] = useState(notificationPrefs);
  const [notifMsg, setNotifMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handlePasswordSubmit = () => {
    setPasswordMsg(null);
    if (newPassword.length < 6) {
      setPasswordMsg({ type: "error", text: t("auth.password_min_length") });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: t("dashboard.password_mismatch") });
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("new_password", newPassword);
      formData.set("confirm_password", confirmPassword);
      const result = await updatePassword(formData);
      if (result.success) {
        setPasswordMsg({ type: "success", text: t("profile.password_updated") });
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordMsg({ type: "error", text: result.error || t("dashboard.password_update_failed") });
      }
    });
  };

  const handleNotifToggle = (
    field: "subscribed_email" | "subscribed_phone" | "subscribed_sms",
    value: boolean
  ) => {
    const updated = { ...prefs, [field]: value };
    setPrefs(updated);
    setNotifMsg(null);

    startTransition(async () => {
      const result = await updateNotificationPreferences({ [field]: value });
      if (result.error) {
        setPrefs(prefs); // revert
        setNotifMsg({ type: "error", text: result.error });
      }
    });
  };

  const handleDeleteAccount = () => {
    startTransition(async () => {
      await deleteAccount();
    });
  };

  return (
    <Accordion type="multiple" defaultValue={["password", "notifications"]} className="space-y-3">
      {/* Password Section */}
      <AccordionItem value="password" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold text-sm">
              {t("dashboard.settings_password")}
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-4">
          <div className="space-y-3">
            <div>
              <Label htmlFor="new_password" className="text-sm">
                {t("profile.new_password")}
              </Label>
              <Input
                id="new_password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="confirm_password" className="text-sm">
                {t("profile.confirm_password")}
              </Label>
              <Input
                id="confirm_password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1"
              />
            </div>
            {passwordMsg && (
              <p
                className={`text-sm ${
                  passwordMsg.type === "success"
                    ? "text-green-600"
                    : "text-destructive"
                }`}
              >
                {passwordMsg.text}
              </p>
            )}
            <Button
              size="sm"
              onClick={handlePasswordSubmit}
              disabled={isPending || !newPassword || !confirmPassword}
            >
              {t("profile.update_password")}
            </Button>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Notifications Section */}
      <AccordionItem value="notifications" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold text-sm">
              {t("dashboard.settings_notifications")}
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="notif_email" className="cursor-pointer text-sm">
                {t("profile.email_notifications")}
              </Label>
              <Switch
                id="notif_email"
                checked={prefs.subscribed_email}
                onCheckedChange={(v) => handleNotifToggle("subscribed_email", v)}
                disabled={isPending}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="notif_phone" className="cursor-pointer text-sm">
                {t("profile.phone_notifications")}
              </Label>
              <Switch
                id="notif_phone"
                checked={prefs.subscribed_phone}
                onCheckedChange={(v) => handleNotifToggle("subscribed_phone", v)}
                disabled={isPending}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="notif_sms" className="cursor-pointer text-sm">
                {t("profile.sms_notifications")}
              </Label>
              <Switch
                id="notif_sms"
                checked={prefs.subscribed_sms}
                onCheckedChange={(v) => handleNotifToggle("subscribed_sms", v)}
                disabled={isPending}
              />
            </div>
            {notifMsg && (
              <p
                className={`text-sm ${
                  notifMsg.type === "success"
                    ? "text-green-600"
                    : "text-destructive"
                }`}
              >
                {notifMsg.text}
              </p>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Data & Privacy Section */}
      <AccordionItem value="data" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-2">
            <Download className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold text-sm">
              {t("dashboard.settings_data")}
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-4">
          <p className="text-sm text-muted-foreground mb-3">
            {t("profile.export_data_desc")}
          </p>
          <Button variant="outline" size="sm" asChild>
            <a href="/api/profile/export" download>
              <Download className="me-2 h-3.5 w-3.5" />
              {t("profile.export_data")}
            </a>
          </Button>
        </AccordionContent>
      </AccordionItem>

      {/* Danger Zone */}
      <AccordionItem value="danger" className="border border-destructive/20 rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-2">
            <Trash2 className="h-4 w-4 text-destructive" />
            <span className="font-semibold text-sm text-destructive">
              {t("dashboard.settings_danger_zone")}
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-4">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {t("profile.delete_account_desc")}
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={isPending}>
                  <Trash2 className="me-2 h-3.5 w-3.5" />
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
                    onClick={handleDeleteAccount}
                  >
                    {t("profile.delete_account")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
