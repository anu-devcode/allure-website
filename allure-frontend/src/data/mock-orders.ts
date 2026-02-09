export interface OrderItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
}

export interface Order {
    id: string;
    customerName: string;
    phone: string;
    city: string;
    total: number;
    items: OrderItem[];
    status: "New" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled";
    paymentStatus: "Pending" | "Paid";
    createdAt: string;
}

export const MOCK_ORDERS: Order[] = [
    {
        id: "ORD-1021",
        customerName: "Abebe Kebede",
        phone: "0911223344",
        city: "Addis Ababa",
        total: 4500,
        status: "New",
        paymentStatus: "Pending",
        createdAt: "2026-02-09T14:30:00Z",
        items: [
            { id: "1", name: "Classic Silk Dress", price: 4500, quantity: 1, image: "" }
        ]
    },
    {
        id: "ORD-1022",
        customerName: "Sara Tekle",
        phone: "0920112233",
        city: "Adama",
        total: 7600,
        status: "Confirmed",
        paymentStatus: "Paid",
        createdAt: "2026-02-08T10:15:00Z",
        items: [
            { id: "2", name: "Modern Urban Blazer", price: 3800, quantity: 2, image: "" }
        ]
    },
    {
        id: "ORD-1023",
        customerName: "Muna Ahmed",
        phone: "0944556677",
        city: "Addis Ababa",
        total: 1200,
        status: "Delivered",
        paymentStatus: "Paid",
        createdAt: "2026-02-05T16:45:00Z",
        items: [
            { id: "3", name: "Elegant Pearl Necklace", price: 1200, quantity: 1, image: "" }
        ]
    }
];
