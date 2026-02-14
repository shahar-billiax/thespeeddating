import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function VerifyEmailPage() {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-center text-2xl font-bold">Check Your Email</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-muted-foreground leading-relaxed">
          We&apos;ve sent you a confirmation email. Please click the link in the email to verify
          your account.
        </p>
        <p className="text-sm text-muted-foreground">
          Already verified?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
