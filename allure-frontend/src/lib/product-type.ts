export const PRODUCT_TYPE_OPTIONS = ["Clothing", "Shoes", "Jewelry", "Accessories", "Cosmetics", "Perfumes", "Other"] as const;

export const deriveProductType = (category?: string | null, fallback?: string | null): string | undefined => {
    const normalizedCategory = category?.trim();
    if (!normalizedCategory) {
        return fallback?.trim() || undefined;
    }

    const lowerCategory = normalizedCategory.toLowerCase();

    if (lowerCategory.includes("clothing")) return "Clothing";
    if (lowerCategory.includes("shoes")) return "Shoes";
    if (lowerCategory.includes("jewelry")) return "Jewelry";
    if (lowerCategory.includes("accessories")) return "Accessories";
    if (lowerCategory.includes("cosmetics")) return "Cosmetics";
    if (lowerCategory.includes("perfumes")) return "Perfumes";

    return fallback?.trim() || "Other";
};