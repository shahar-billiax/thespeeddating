"use server";

import { z } from "zod/v4";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Invalid email address"),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export async function submitContactForm(formData: FormData) {
  try {
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      subject: formData.get("subject"),
      message: formData.get("message"),
    };

    const validated = contactSchema.parse(data);

    // TODO: SendGrid integration will be added later
    // For now, log to console
    console.log("Contact form submission:", {
      name: validated.name,
      email: validated.email,
      subject: validated.subject,
      message: validated.message,
      timestamp: new Date().toISOString(),
    });

    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 500));

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0].message,
      };
    }

    console.error("Contact form error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}
