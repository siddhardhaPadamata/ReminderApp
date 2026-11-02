import { apiClient } from './client';
import type { Bill, Warranty, SearchItem } from '../types/reminders';

export interface CreateBillPayload {
    title: string;
    category: number;
    amount: number;
    dueDate: string;
}

export interface CreateWarrantyPayload {
    itemName: string;
    category?: string;
    purchaseDate: string; // YYYY-MM-DD
    expiryDate: string;   // YYYY-MM-DD
    notes?: string;
}

export const reminderApi = {
    getBills: async (): Promise<Bill[]> => {
        const res = await apiClient.get<Bill[]>('/bills');
        return res.data;
    },

    createBill: async (payload: CreateBillPayload): Promise<Bill> => {
        const res = await apiClient.post<Bill>('/bills', payload);
        return res.data;
    },

    uploadBillReceipt: async (billId: string, file: File): Promise<{ receiptUrl: string }> => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await apiClient.post<{ receiptUrl: string }>(`/bills/${billId}/upload-receipt`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data;
    },

    markBillPaid: async (id: string): Promise<void> => {
        await apiClient.patch(`/bills/${id}/mark-paid`);
    },

    getWarranties: async (): Promise<Warranty[]> => {
        const res = await apiClient.get<Warranty[]>('/warranties');
        return res.data;
    },

    createWarranty: async (payload: CreateWarrantyPayload): Promise<Warranty> => {
        const res = await apiClient.post<Warranty>('/warranties', payload);
        return res.data;
    },

    uploadWarrantyPhotos: async (
        warrantyId: string,
        invoiceFile?: File | null,
        itemFile?: File | null
    ): Promise<{ invoiceUrl?: string; itemUrl?: string }> => {
        const formData = new FormData();
        if (invoiceFile) formData.append('invoicePhoto', invoiceFile);
        if (itemFile) formData.append('itemPhoto', itemFile);

        const res = await apiClient.post<{ invoiceUrl?: string; itemUrl?: string }>(
            `/warranties/${warrantyId}/upload-photos`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        return res.data;
    },

    search: async (query?: string): Promise<SearchItem[]> => {
        const res = await apiClient.get<SearchItem[]>('/search', {
            params: query ? { query } : {},
        });
        return res.data;
    },
    deleteBill: async (id: string): Promise<void> => {
        await apiClient.delete(`/bills/${id}`);
    },

    deleteWarranty: async (id: string): Promise<void> => {
        await apiClient.delete(`/warranties/${id}`);
    },
};