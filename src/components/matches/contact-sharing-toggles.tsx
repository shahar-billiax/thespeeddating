"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";

// Instagram and Facebook SVG icons (Lucide doesn't have branded icons)
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export interface ContactShares {
  shareEmail: boolean;
  sharePhone: boolean;
  shareWhatsapp: boolean;
  shareInstagram: boolean;
  shareFacebook: boolean;
}

export function ContactSharingToggles({
  shares,
  onChange,
}: {
  shares: ContactShares;
  onChange: (field: keyof ContactShares, value: boolean) => void;
}) {
  const t = useTranslations("matches");

  const items: { field: keyof ContactShares; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { field: "shareEmail", label: "Email", icon: Mail },
    { field: "sharePhone", label: "Phone", icon: Phone },
    { field: "shareWhatsapp", label: "WhatsApp", icon: MessageCircle },
    { field: "shareInstagram", label: "Instagram", icon: InstagramIcon },
    { field: "shareFacebook", label: "Facebook", icon: FacebookIcon },
  ];

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-muted-foreground">
        {t("share_if_match")}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {items.map(({ field, label, icon: Icon }) => (
          <div key={field} className="flex items-center gap-2">
            <Checkbox
              id={field}
              checked={shares[field]}
              onCheckedChange={(checked) => onChange(field, checked === true)}
            />
            <Label htmlFor={field} className="flex items-center gap-1.5 cursor-pointer text-sm">
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}
