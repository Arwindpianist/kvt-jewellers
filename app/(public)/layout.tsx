import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { Meteors } from "@/components/ui/meteors";
import { PWAInstallPrompt } from "@/components/public/PWAInstallPrompt";
import { PWADiagnostic } from "@/components/public/PWADiagnostic";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-transparent">
      <Meteors number={30} />
      <div className="relative z-10 flex min-h-screen flex-col bg-transparent">
        <Header />
        <main className="flex-1 bg-transparent">{children}</main>
        <Footer />
        <PWAInstallPrompt />
        <PWADiagnostic />
      </div>
    </div>
  );
}

