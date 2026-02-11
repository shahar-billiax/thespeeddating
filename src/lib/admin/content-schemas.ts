import { z } from "zod";

// ─── FAQ page content_json schema ─────────────────────────
export const faqQuestionSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
});

export const faqCategorySchema = z.object({
  title: z.string().min(1),
  questions: z.array(faqQuestionSchema),
});

export const faqContentSchema = z.object({
  categories: z.array(faqCategorySchema),
});

export type FaqContent = z.infer<typeof faqContentSchema>;

// ─── Contact page content_json schema ─────────────────────
export const openingHoursSchema = z.object({
  days: z.string().min(1),
  hours: z.string().min(1),
  note: z.string().optional(),
});

export const contactContentSchema = z.object({
  openingHours: z.array(openingHoursSchema),
  phone: z.string(),
  email: z.string(),
});

export type ContactContent = z.infer<typeof contactContentSchema>;

// ─── Validation helper ────────────────────────────────────
export function validateContentJson(
  pageType: string,
  data: unknown
): { success: true; data: unknown } | { success: false; error: string } {
  const schemaMap: Record<string, z.ZodType> = {
    faq: faqContentSchema,
    contact: contactContentSchema,
  };

  const schema = schemaMap[pageType];
  if (!schema) return { success: true, data };

  const result = schema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.issues.map((e) => e.message).join(", ") };
  }
  return { success: true, data: result.data };
}
