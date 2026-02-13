import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Eye, Lock, AlertCircle } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return {
    title: t("safety.title"),
    description: "Your safety is our priority - guidelines for safe speed dating",
  };
}

export default async function SafetyPage() {
  const t = await getTranslations();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">{t("safety.title")}</h1>
          <p className="text-xl text-muted-foreground">
            Your safety and wellbeing are our top priorities. Please read these guidelines carefully.
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Eye className="w-6 h-6 text-primary" />
                Before the Event
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>
                <strong>Choose public venues:</strong> Our events are held in reputable, public venues
                with staff present. Never agree to meet someone at a private location.
              </p>
              <p>
                <strong>Tell someone where you're going:</strong> Let a friend or family member know
                you're attending a speed dating event and which venue you'll be at.
              </p>
              <p>
                <strong>Review profiles carefully:</strong> While we verify all participants, use your
                judgment about who you're interested in meeting.
              </p>
              <p>
                <strong>Plan your transport:</strong> Arrange safe transportation to and from the event.
                Never accept a ride from someone you've just met.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-primary" />
                During the Event
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>
                <strong>Keep personal info private:</strong> Don't share your home address, workplace
                details, or other sensitive information during the speed dates. Exchange this after you
                match if you feel comfortable.
              </p>
              <p>
                <strong>Trust your instincts:</strong> If someone makes you uncomfortable, you're not
                obligated to continue the conversation. Our event coordinators are always available to
                help.
              </p>
              <p>
                <strong>Drink responsibly:</strong> Keep track of your drinks and never leave them
                unattended. Know your limits and stay in control.
              </p>
              <p>
                <strong>Stay in public areas:</strong> Don't leave the venue with someone you've just
                met. Keep all interactions within the event space.
              </p>
              <p>
                <strong>Report concerns:</strong> If anyone behaves inappropriately, inform our event
                coordinator immediately. We take all complaints seriously.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-primary" />
                After the Event
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>
                <strong>First dates in public:</strong> When meeting a match for the first time, always
                choose a busy, public place during daytime hours. Coffee shops, restaurants, and parks
                are ideal.
              </p>
              <p>
                <strong>Let someone know:</strong> Tell a friend or family member about your date plans,
                including where you're going and when you expect to be home.
              </p>
              <p>
                <strong>Provide your own transport:</strong> Don't accept rides until you know someone
                better. Meet at the location rather than being picked up.
              </p>
              <p>
                <strong>Take it slow:</strong> Don't feel pressured to share too much too soon. Build
                trust gradually and at your own pace.
              </p>
              <p>
                <strong>Video call first:</strong> Consider having a video call before meeting in person.
                This helps verify identity and build comfort.
              </p>
              <p>
                <strong>Trust your gut:</strong> If something feels off, it's okay to cancel plans or end
                a date early. Your safety comes first.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Lock className="w-6 h-6 text-primary" />
                Online Safety
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>
                <strong>Protect your privacy:</strong> Use only your first name initially. Don't share
                your full name, phone number, or social media profiles until you're comfortable.
              </p>
              <p>
                <strong>Be cautious with photos:</strong> Avoid sharing photos that reveal your home
                address, workplace, or other identifying information.
              </p>
              <p>
                <strong>Use the platform:</strong> Keep initial communications through our platform or
                email rather than giving out your personal phone number immediately.
              </p>
              <p>
                <strong>Watch for red flags:</strong> Be wary of anyone who asks for money, pressures you
                to meet quickly, or seems evasive about basic questions.
              </p>
              <p>
                <strong>Report suspicious behavior:</strong> If someone makes you uncomfortable online or
                violates our community guidelines, report them to our team immediately.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500" />
            If You Feel Unsafe
          </h2>
          <div className="text-muted-foreground space-y-2">
            <p>
              If you feel unsafe during an event, immediately notify our event coordinator or venue
              staff. If you feel unsafe after an event, trust your instincts and remove yourself from
              the situation.
            </p>
            <p>
              For serious safety concerns or to report inappropriate behavior, contact us at{" "}
              <a href="mailto:safety@thespeeddating.co.uk" className="text-primary hover:underline">
                safety@thespeeddating.co.uk
              </a>
              . For emergencies, always call 999 (UK) or local emergency services.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            These guidelines are recommendations for your safety. TheSpeedDating cannot guarantee the
            conduct of participants but we work hard to create safe, respectful environments.
          </p>
        </div>
      </div>
    </div>
  );
}
