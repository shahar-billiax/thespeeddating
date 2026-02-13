"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { submitContactForm } from "@/lib/contact/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function ContactForm() {
  const t = useTranslations();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const result = await submitContactForm(formData);

    setIsSubmitting(false);

    if (result.success) {
      toast.success(t("contact.sent_success"));
      e.currentTarget.reset();
    } else {
      toast.error(result.error || t("contact.error"));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="name">{t("contact.name")}</Label>
        <Input
          id="name"
          name="name"
          type="text"
          required
          placeholder={t("contact.name_placeholder")}
          disabled={isSubmitting}
          className="mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="email">{t("contact.email")}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder={t("contact.email_placeholder")}
          disabled={isSubmitting}
          className="mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="subject">{t("contact.subject")}</Label>
        <Input
          id="subject"
          name="subject"
          type="text"
          required
          placeholder={t("contact.subject_placeholder")}
          disabled={isSubmitting}
          className="mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="message">{t("contact.message")}</Label>
        <Textarea
          id="message"
          name="message"
          required
          placeholder={t("contact.message_placeholder")}
          rows={6}
          disabled={isSubmitting}
          className="mt-1.5"
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? t("contact.sending") : t("contact.send")}
      </Button>
    </form>
  );
}
