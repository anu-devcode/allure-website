import { MOCK_PRODUCTS } from "@/data/mock-products";
import { Product } from "@/types";

/**
 * Product Service
 * Currently using mock data, but designed to be easily switched to API calls.
 */
export const productService = {
    /**
     * Get all products
     */
    async getProducts(): Promise<Product[]> {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        return MOCK_PRODUCTS;
    },

    /**
     * Get a single product by ID
     */
    async getProductById(id: string): Promise<Product | undefined> {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 300));
        return MOCK_PRODUCTS.find((p) => p.id === id);
    },

    /**
     * Get products by category
     */
    async getProductsByCategory(category: string): Promise<Product[]> {
        const products = await this.getProducts();
        return products.filter((p) => p.category === category);
    },

    /**
     * Search products
     */
    async searchProducts(query: string): Promise<Product[]> {
        const products = await this.getProducts();
        const searchLower = query.toLowerCase();
        return products.filter(
            (p) =>
                p.name.toLowerCase().includes(searchLower) ||
                p.description.toLowerCase().includes(searchLower) ||
                p.category.toLowerCase().includes(searchLower)
        );
    }
};
