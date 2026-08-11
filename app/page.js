import Link from "next/link";
import { FileText, ShieldCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import { AuthNavActions } from "@/components/auth/auth-nav-actions";

const FEATURES = [
  {
    icon: FileText,
    title: "Request in minutes",
    description: "Pick the documents you need — transcripts, certificates, letters — in one application.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by design",
    description: "Your account and payments are protected with modern, cookie-based authentication.",
  },
  {
    icon: Clock,
    title: "Track every step",
    description: "Follow your application from submission to completion, in real time.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-svh flex-col">
      <Navbar actions={<AuthNavActions />} />
      <main className="flex-1">
        <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 py-24 text-center">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Request official documents, without the paperwork.
          </h1>
          <p className="max-w-xl text-balance text-muted-foreground">
            Transcripts, certificates, and letters — requested online, paid for securely, and tracked from
            submission to delivery.
          </p>
          <div className="flex gap-3">
            <Button asChild size="lg">
              <Link href="/register">Get started</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </section>

        <section className="mx-auto grid max-w-5xl gap-6 px-4 pb-24 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-lg border bg-card p-6">
              <Icon className="size-6 text-primary" />
              <h2 className="mt-4 font-medium">{title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
