import { getTranslations } from "next-intl/server";
import { CmsContent } from "./cms-content";

interface CmsPageLayoutProps {
  title: string;
  contentHtml: string | null;
  fallbackTitle?: string;
}

export async function CmsPageLayout({
  title,
  contentHtml,
  fallbackTitle,
}: CmsPageLayoutProps) {
  const t = await getTranslations();
  return (
    <div>
      {/* Hero */}
      <section className="page-hero">
        <div className="section-container">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              {title || fallbackTitle}
            </h1>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 sm:py-20">
        <div className="section-container">
          <div className="mx-auto max-w-4xl">
            {contentHtml ? (
              <CmsContent html={contentHtml} />
            ) : (
              <p className="text-muted-foreground text-center">
                {t("common.content_coming_soon")}
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
