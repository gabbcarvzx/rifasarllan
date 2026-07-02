import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main id="conteudo-principal" tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </main>
      <Footer />
    </div>
  );
}
