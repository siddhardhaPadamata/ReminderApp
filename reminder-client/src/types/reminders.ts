export interface Bill {
    id: string;
    title: string;
    amount: number;
    dueDate: string;
    category: string | number;
    status: string;
    billReceiptUrl?: string; // Add this if backend returns billReceiptUrl
    receiptUrl?: string;
}

export interface Warranty {
    id: string;
    itemName: string;
    category: string;
    purchaseDate: string;
    expiryDate: string;
    notes?: string;
    invoicePhotoUrl?: string;
    itemPhotoUrl?: string;
    reminderSent?: boolean;
}
export interface SearchItem {
    id: string;
    title?: string;
    itemName?: string;
    targetDate?: string; // add this
    status?: string;     // add this
    category?: string | number;
    type?: 'bill' | 'warranty';
    [key: string]: any;  // optional fallback to prevent strict indexing errors
}

// export interface SearchItem {
//     id: string;
//     title: string;
//     type: string;
//     category: string;
//     date: string;
//}