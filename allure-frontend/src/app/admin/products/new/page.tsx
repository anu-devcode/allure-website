import { ProductForm } from "@/components/admin/product-form";

export default function NewProductPage() {
    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="font-display text-4xl font-bold text-dark">Add New Product</h1>
                <p className="text-dark/60">Create a new listing for your store.</p>
            </div>
            <ProductForm />
        </div>
    );
}
