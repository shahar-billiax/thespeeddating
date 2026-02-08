import { getTranslations } from "@/lib/i18n/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function HomePage() {
  const { t } = await getTranslations();

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-2xl text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          The Speed Dating
        </h1>
        <p className="text-lg text-muted-foreground">
          Jewish speed dating events in the UK and Israel. Meet your match in person.
        </p>
        <div className="flex justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/events">{t("nav.events")}</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/about">{t("nav.about")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
