import { Product } from "@/types";

export const MOCK_PRODUCTS: Product[] = [
    {
        id: "1",
        slug: "classic-silk-dress",
        name: "Classic Silk Dress",
        price: 4500,
        image: "/images/product-1.jpg",
        category: "Dresses",
        availability: "In-Store",
        origin: "Shein",
        description: "An elegant silk dress perfect for any social occasion. Features a smooth finish and comfortable fit.",
        variants: [
            { name: "Size", options: ["S", "M", "L", "XL"] },
            { name: "Color", options: ["Rose", "Sage", "Midnight"] }
        ]
    },
    {
        id: "2",
        slug: "modern-urban-blazer",
        name: "Modern Urban Blazer",
        price: 3800,
        image: "/images/product-2.jpg",
        category: "Outerwear",
        availability: "Pre-Order",
        origin: "Turkey",
        estimatedArrival: "10-14 days",
        description: "A tailored urban blazer that adds a touch of professionalism to any outfit.",
        variants: [
            { name: "Size", options: ["M", "L", "XL"] },
            { name: "Color", options: ["Cream", "Black"] }
        ]
    },
    {
        id: "3",
        slug: "elegant-pearl-necklace",
        name: "Elegant Pearl Necklace",
        price: 1200,
        image: "/images/product-3.jpg",
        category: "Accessories",
        availability: "In-Store",
        description: "Classic pearl necklace with a modern clasp. Elevates your evening wear instantly.",
        variants: []
    },
    {
        id: "4",
        slug: "soft-cotton-blouse",
        name: "Soft Cotton Blouse",
        price: 1800,
        image: "/images/product-4.jpg",
        category: "Tops",
        availability: "Sold Out",
        description: "Breathable cotton blouse with subtle embroidery detail.",
        variants: [
            { name: "Size", options: ["S", "M"] }
        ]
    },
    {
        id: "5",
        slug: "high-waist-pants",
        name: "High-Waist Styled Pants",
        price: 2500,
        image: "/images/product-5.jpg",
        category: "Bottoms",
        availability: "Pre-Order",
        origin: "Shein",
        estimatedArrival: "7-10 days",
        description: "Flattering high-waist pants with a wide-leg cut.",
        variants: [
            { name: "Size", options: ["S", "M", "L"] }
        ]
    },
    {
        id: "6",
        slug: "chic-summer-handbag",
        name: "Chic Summer Handbag",
        price: 3200,
        image: "/images/product-6.jpg",
        category: "Accessories",
        availability: "In-Store",
        description: "Lightweight summer handbag with woven textures.",
        variants: []
    }
];
