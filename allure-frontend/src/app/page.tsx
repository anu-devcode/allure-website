import { Hero } from "@/components/features/hero";
import { PromotionBanner } from "@/components/features/promotion-banner";
import { ProductCard } from "@/components/features/product-card";
import { MOCK_PRODUCTS } from "@/data/mock-products";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Testimonials } from "@/components/features/testimonials";

export default function Home() {
  const featuredProducts = MOCK_PRODUCTS.slice(0, 4);

  return (
    <div className="flex flex-col gap-0">
      <PromotionBanner />
      <Hero />

      {/* Featured Products Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="mb-12 flex flex-col items-center justify-between gap-4 md:flex-row md:items-end">
          <div className="text-center md:text-left">
            <h2 className="font-display text-4xl font-bold text-dark">Featured Collections</h2>
            <p className="mt-2 text-dark/60">Handpicked items just for you. Beautifully clean and modern.</p>
          </div>
          <Link href="/catalog">
            <Button variant="link" className="gap-1 text-accent font-bold">
              View All Products <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Social Proof / Call to Action */}
      <section className="bg-secondary/20 py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-4xl font-bold text-dark mb-6">Join our Allure Community</h2>
          <p className="max-w-xl mx-auto text-dark/60 mb-10 text-lg sm:text-xl">
            Stay updated with our latest arrivals and exclusive offers. Follow us on Instagram and TikTok for the best fashion inspiration.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="rounded-full px-10 h-14">Follow on Instagram</Button>
            <Button size="lg" variant="outline" className="rounded-full px-10 h-14">Follow on TikTok</Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />
    </div>
  );
}
