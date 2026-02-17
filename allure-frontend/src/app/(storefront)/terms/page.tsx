export default function TermsPage() {
    return (
        <div className="container mx-auto max-w-3xl px-4 py-24">
            <h1 className="font-display text-4xl font-bold text-dark mb-8">Terms & Conditions</h1>

            <div className="prose prose-sm prose-slate max-w-none flex flex-col gap-8 text-dark/70 leading-relaxed">
                <section className="flex flex-col gap-4">
                    <h2 className="text-xl font-bold text-dark">1. Ordering Process</h2>
                    <p>
                        By placing an order on Allure Online Shopping, you agree to our manual payment and delivery process.
                        Orders are considered "pending" until payment confirmation is received.
                    </p>
                </section>

                <section className="flex flex-col gap-4">
                    <h2 className="text-xl font-bold text-dark">2. Pre-Orders</h2>
                    <p>
                        Items marked as "Pre-Order" are sourced globally (SHEIN, Turkey, etc.).
                        Estimated arrival times are between 7-14 days. Delays may occur due to international shipping and customs.
                    </p>
                </section>

                <section className="flex flex-col gap-4">
                    <h2 className="text-xl font-bold text-dark">3. Payment Policy</h2>
                    <p>
                        We accept manual payments via Telebirr, CBE, or Cash on Delivery (for eligible items).
                        Proof of payment (screenshot) must be shared via Telegram or WhatsApp to confirm your order.
                    </p>
                </section>

                <section className="flex flex-col gap-4">
                    <h2 className="text-xl font-bold text-dark">4. Returns & Exchanges</h2>
                    <p>
                        Due to the nature of our business model (sourcing specifically for you), we generally do not accept returns
                        unless the item is damaged or incorrect. Please check the size guides carefully before ordering.
                    </p>
                </section>

                <section className="flex flex-col gap-4">
                    <h2 className="text-xl font-bold text-dark">5. Delivery</h2>
                    <p>
                        Free delivery is provided within Addis Ababa. For cities outside Addis, delivery fees are negotiated
                        based on the distance and service provider (e.g. Anbesa Bus, Post Office).
                    </p>
                </section>
            </div>
        </div>
    );
}
