import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { SideCart } from "@/components/features/side-cart";
import { FloatingRequestButton } from "@/components/features/floating-request-button";

export default function StorefrontLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Header />
            <main className="flex-grow pb-24 md:pb-0">
                {children}
            </main>
            <Footer />
            <SideCart />
            <MobileBottomNav />
            <FloatingRequestButton />
        </>
    );
}
