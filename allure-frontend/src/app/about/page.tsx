export default function AboutPage() {
    return (
        <div className="container mx-auto px-4 py-24">
            <div className="max-w-3xl mx-auto flex flex-col gap-12 text-center lg:text-left">
                <div className="flex flex-col gap-4">
                    <h1 className="font-display text-5xl font-bold text-dark">About Allure</h1>
                    <p className="text-xl text-dark/60">Eleveating online shopping in Ethiopia with beauty, trust, and speed.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
                    <div className="flex flex-col gap-4">
                        <h3 className="font-bold text-xl text-accent">Our Vision</h3>
                        <p className="text-dark/60">
                            Allure Online Shopping started with a simple idea: that shopping should be as beautiful as the products themselves.
                            We cater to social-media active customers who value aesthetics and reliability.
                        </p>
                    </div>
                    <div className="flex flex-col gap-4">
                        <h3 className="font-bold text-xl text-accent">Our Mission</h3>
                        <p className="text-dark/60">
                            We aim to provide a seamless digital foundation for small businesses to grow while offering urban shoppers a curated, high-quality experience.
                        </p>
                    </div>
                </div>

                <div className="bg-secondary/10 p-12 rounded-3xl flex flex-col gap-6 text-center">
                    <h3 className="font-display text-2xl font-bold text-dark uppercase tracking-widest">Minimal. Breathable. Elegant.</h3>
                    <p className="text-dark/60 max-w-lg mx-auto">
                        Our platform is built to be fast and uncluttered, ensuring your products take center stage.
                    </p>
                </div>
            </div>
        </div>
    );
}
