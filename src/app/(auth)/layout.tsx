import Link from "next/link";
import { Heart } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen flex-col items-center justify-center overflow-y-auto bg-muted/30 p-4">
      <div className="mb-8">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-foreground">
          <Heart className="h-5 w-5 text-primary fill-primary/20" />
          The Speed Dating
        </Link>
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
