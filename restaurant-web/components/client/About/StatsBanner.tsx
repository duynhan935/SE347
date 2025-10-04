// File: app/_components/about/StatsBanner.tsx
const stats = [
        { value: "350+", label: "Order per minute" },
        { value: "10x", label: "Faster delivery" },
        { value: "10+", label: "In Country" },
        { value: "99.9%", label: "Order accuracy" },
];

export default function StatsBanner() {
        return (
                <section className="bg-brand-black text-white">
                        <div className="custom-container grid grid-cols-2 md:grid-cols-4 gap-y-8 text-center py-12">
                                {stats.map((stat) => (
                                        <div key={stat.label}>
                                                <h2 className="font-roboto-serif text-3xl md:text-4xl font-semibold">
                                                        {stat.value}
                                                </h2>
                                                <p className="mt-2 text-sm text-gray-300">{stat.label}</p>
                                        </div>
                                ))}
                        </div>
                </section>
        );
}
