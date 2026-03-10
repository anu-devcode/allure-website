export default function RootLoading() {
    return (
        <div className="min-h-screen bg-cream px-4 py-16">
            <div className="container mx-auto max-w-4xl">
                <div className="mb-10 h-8 w-64 animate-pulse rounded-full bg-secondary/20" />
                <div className="grid gap-6 md:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="rounded-[2rem] border border-secondary/10 bg-white p-8 shadow-sm">
                            <div className="mb-6 h-6 w-40 animate-pulse rounded bg-secondary/20" />
                            <div className="mb-3 h-4 w-full animate-pulse rounded bg-secondary/10" />
                            <div className="h-4 w-2/3 animate-pulse rounded bg-secondary/10" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
