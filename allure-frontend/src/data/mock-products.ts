import { Product } from "@/types";

export const MOCK_PRODUCTS: Product[] = [
    {
        id: "1",
        slug: "classic-silk-dress",
        name: "Classic Silk Dress",
        price: 4500,
        image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1983&auto=format&fit=crop",
        category: "Dresses",
        availability: "In-Store",
        origin: "Shein",
        description: "An elegant silk dress perfect for any social occasion. Features a smooth, lustrous finish and a comfortable tailored fit that gracefully accentuates the silhouette. Designed for those who appreciate timeless aesthetics.",
        variants: [
            { name: "Size", options: ["S", "M", "L", "XL"] },
            { name: "Color", options: ["Deep Rose", "Sage Green", "Midnight Blue"] }
        ]
    },
    {
        id: "2",
        slug: "modern-urban-blazer",
        name: "Modern Urban Blazer",
        price: 3800,
        image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1936&auto=format&fit=crop",
        category: "Outerwear",
        availability: "Pre-Order",
        origin: "Turkey",
        estimatedArrival: "10-14 days",
        description: "A sharp, tailored urban blazer that brings effortless professionalism to any wardrobe. Crafted from premium breathable fabric, it features sleek lapels and a versatile cut suitable for both formal and semi-formal outings.",
        variants: [
            { name: "Size", options: ["M", "L", "XL"] },
            { name: "Color", options: ["Ivory Cream", "Charcoal Black"] }
        ]
    },
    {
        id: "3",
        slug: "elegant-pearl-necklace",
        name: "Elegant Pearl Necklace",
        price: 1200,
        image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=1887&auto=format&fit=crop",
        category: "Accessories",
        availability: "In-Store",
        description: "A classic pearl necklace featuring hand-selected pearls with a radiant luster. The modern gold-plated clasp adds a contemporary touch, making it a perfect statement piece for your evening ensembles.",
        variants: []
    },
    {
        id: "4",
        slug: "linen-summer-blouse",
        name: "Linen Summer Blouse",
        price: 1800,
        image: "https://images.unsplash.com/photo-1534126416832-a88fdf2911c2?q=80&w=2070&auto=format&fit=crop",
        category: "Tops",
        availability: "In-Store",
        description: "Breathable and lightweight linen blouse designed for maximum comfort in warm weather. Features subtle artisanal embroidery and a relaxed fit that pairs perfectly with denim or tailored trousers.",
        variants: [
            { name: "Size", options: ["S", "M", "L"] },
            { name: "Color", options: ["White", "Sky Blue"] }
        ]
    },
    {
        id: "5",
        slug: "high-waist-tailored-pants",
        name: "High-Waist Tailored Pants",
        price: 2500,
        image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=1887&auto=format&fit=crop",
        category: "Bottoms",
        availability: "Pre-Order",
        origin: "Shein",
        estimatedArrival: "7-10 days",
        description: "Flattering high-waist pants with a crisp wide-leg cut. These pants offer a sophisticated look while remaining comfortable for all-day wear, making them a staple for the modern urban buyer.",
        variants: [
            { name: "Size", options: ["S", "M", "L"] }
        ]
    },
    {
        id: "6",
        slug: "minimalist-leather-tote",
        name: "Minimalist Leather Tote",
        price: 3200,
        image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1935&auto=format&fit=crop",
        category: "Accessories",
        availability: "In-Store",
        description: "Clean, minimalist tote bag made from high-quality vegan leather. Spacious enough for all your essentials with a structured design that keeps you looking sharp from morning coffee to evening events.",
        variants: []
    }
];
