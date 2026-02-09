import { Truck, Clock, ShieldCheck, HelpCircle } from "lucide-react";

export default function RulesPage() {
    return (
        <div className="container mx-auto px-4 py-24">
            <div className="max-w-3xl mx-auto flex flex-col gap-12">
                <div className="text-center flex flex-col gap-4">
                    <h1 className="font-display text-5xl font-bold text-dark">Ordering Rules</h1>
                    <p className="text-xl text-dark/60">Everything you need to know about shopping with us.</p>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    <div className="flex gap-6 p-8 rounded-3xl border border-secondary/20 hover:border-accent/40 transition-colors">
                        <div className="h-12 w-12 bg-primary/20 rounded-2xl flex items-center justify-center text-accent shrink-0"><Truck className="h-6 w-6" /></div>
                        <div>
                            <h3 className="font-bold text-xl text-dark mb-2">Delivery Policy</h3>
                            <p className="text-dark/60 leading-relaxed">
                                Free delivery is available for all orders within Addis Ababa. For other cities, delivery fees and schedules are negotiated manually after order placement.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-6 p-8 rounded-3xl border border-secondary/20 hover:border-accent/40 transition-colors">
                        <div className="h-12 w-12 bg-primary/20 rounded-2xl flex items-center justify-center text-accent shrink-0"><Clock className="h-6 w-6" /></div>
                        <div>
                            <h3 className="font-bold text-xl text-dark mb-2">Availability & Pre-Orders</h3>
                            <p className="text-dark/60 leading-relaxed">
                                <strong>In-Store:</strong> Available immediately. 1-2 days delivery.<br />
                                <strong>Pre-Order:</strong> Products directly from Shein or Turkey. Estimated wait time is 10-14 business days.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-6 p-8 rounded-3xl border border-secondary/20 hover:border-accent/40 transition-colors">
                        <div className="h-12 w-12 bg-primary/20 rounded-2xl flex items-center justify-center text-accent shrink-0"><ShieldCheck className="h-6 w-6" /></div>
                        <div>
                            <h3 className="font-bold text-xl text-dark mb-2">Payment Confirmation</h3>
                            <p className="text-dark/60 leading-relaxed">
                                All payments are manual. After placing an order, please share your payment confirmation screenshot (Telebirr/CBE) to our official Telegram channel for order validation.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
