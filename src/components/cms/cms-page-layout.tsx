import { CmsContent } from "./cms-content";

interface CmsPageLayoutProps {
  title: string;
  contentHtml: string | null;
  fallbackTitle?: string;
}

export function CmsPageLayout({
  title,
  contentHtml,
  fallbackTitle,
}: CmsPageLayoutProps) {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              {title || fallbackTitle}
            </h1>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="mx-auto max-w-4xl">
          {contentHtml ? (
            <CmsContent html={contentHtml} />
          ) : (
            <p className="text-muted-foreground text-center">
              Content coming soon.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
