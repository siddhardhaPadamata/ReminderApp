import React, { useState, useEffect } from 'react';
import { reminderApi } from '../api/reminders';
import type { Bill, Warranty, SearchItem } from '../types/reminders';

import {
    Search,
    CreditCard,
    ShieldAlert,
    Calendar,
    CheckCircle2,
    Clock,
    FileText,
    Camera,
    LogOut,
    Plus,
    Tag,
    Loader2,
    Trash2,
} from 'lucide-react';

interface DashboardPageProps {
    onLogout: () => void;
    onOpenAddModal: (type: 'bill' | 'warranty') => void;
    onViewImage: (url: string, title: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
    onLogout,
    onOpenAddModal,
    onViewImage,
}) => {
    const [bills, setBills] = useState<Bill[]>([]);
    const [warranties, setWarranties] = useState<Warranty[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchItem[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            const [fetchedBills, fetchedWarranties] = await Promise.all([
                reminderApi.getBills(),
                reminderApi.getWarranties(),
            ]);
            setBills(fetchedBills);
            setWarranties(fetchedWarranties);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Handle Search Input with 350ms debounce
    useEffect(() => {
        const trimmed = searchQuery.trim();
        if (!trimmed) {
            setSearchResults(null);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        const delayDebounce = setTimeout(async () => {
            try {
                const results = await reminderApi.search(trimmed);
                setSearchResults(results);
            } catch (err) {
                console.error('Search failed:', err);
            } finally {
                setIsSearching(false);
            }
        }, 350);

        return () => clearTimeout(delayDebounce);
    }, [searchQuery]);

    const handleMarkAsPaid = async (billId: string) => {
        try {
            await reminderApi.markBillPaid(billId);
            setBills((prev) =>
                prev.map((b) => (b.id === billId ? { ...b, status: 'Paid' } : b))
            );
        } catch (err) {
            console.error('Failed to mark bill as paid:', err);
        }
    };

    const handleDeleteBill = async (billId: string) => {
        if (!window.confirm('Are you sure you want to delete this bill?')) return;
        try {
            await reminderApi.deleteBill(billId);
            setBills((prev) => prev.filter((b) => b.id !== billId));
        } catch (err) {
            console.error('Failed to delete bill:', err);
            alert('Could not delete bill. Please try again.');
        }
    };

    const handleDeleteWarranty = async (warrantyId: string) => {
        if (!window.confirm('Are you sure you want to delete this warranty?')) return;
        try {
            await reminderApi.deleteWarranty(warrantyId);
            setWarranties((prev) => prev.filter((w) => w.id !== warrantyId));
        } catch (err) {
            console.error('Failed to delete warranty:', err);
            alert('Could not delete warranty. Please try again.');
        }
    };

    const pendingBillsCount = bills.filter((b) => b.status === 'Pending').length;
    const activeWarrantiesCount = warranties.length;

    return (
        <div className= "min-h-screen bg-slate-50" >
        {/* Top Navigation */ }
        < header className = "bg-white border-b border-slate-200 sticky top-0 z-30" >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4" >
                <div className="flex items-center gap-2" >
                    <div className="p-2 bg-blue-600 rounded-lg text-white" >
                        <Clock className="w-5 h-5" />
                            </div>
                            < span className = "font-bold text-lg text-slate-900 tracking-tight" >
                                Smart Reminder
                                    </span>
                                    </div>

    {/* Unified Global Search Bar */ }
    <div className="flex-1 max-w-lg relative" >
        <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
    value = { searchQuery }
    onChange = {(e) => setSearchQuery(e.target.value)}
placeholder = "Search bills, warranties, notes, or categories..."
className = "w-full pl-10 pr-10 py-2 bg-slate-100 hover:bg-slate-200/70 focus:bg-white border border-slate-300 rounded-full text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
    />
{ isSearching && (
        <Loader2 className="absolute right-3.5 top-2.5 w-4 h-4 text-blue-600 animate-spin" />
            )}
</div>

    < div className = "flex items-center gap-3" >
        <button
              onClick={ () => onOpenAddModal('bill') }
className = "hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium text-sm rounded-lg transition cursor-pointer"
    >
    <Plus className="w-4 h-4" /> Add Bill
        </button>
        < button
onClick = {() => onOpenAddModal('warranty')}
className = "hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-medium text-sm rounded-lg transition cursor-pointer"
    >
    <Plus className="w-4 h-4" /> Add Warranty
        </button>
        < button
onClick = { onLogout }
title = "Sign Out"
className = "p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
    >
    <LogOut className="w-5 h-5" />
        </button>
        </div>
        </div>
        </header>

{/* Main Content Area */ }
<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" >
{/* Metric Badges */ }
    < section className = "grid grid-cols-1 sm:grid-cols-2 gap-4" >
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between" >
            <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500" >
                Pending Bills
                    </p>
                    < p className = "text-3xl font-extrabold text-slate-900 mt-1" >
                    { pendingBillsCount }
                        </p>
                        </div>
                        < div className = "p-3 bg-amber-50 rounded-xl text-amber-600" >
                            <CreditCard className="w-6 h-6" />
                                </div>
                                </div>
                                < div className = "bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between" >
                                    <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500" >
                                        Tracked Warranties
                                            </p>
                                            < p className = "text-3xl font-extrabold text-slate-900 mt-1" >
                                            { activeWarrantiesCount }
                                                </p>
                                                </div>
                                                < div className = "p-3 bg-indigo-50 rounded-xl text-indigo-600" >
                                                    <ShieldAlert className="w-6 h-6" />
                                                        </div>
                                                        </div>
                                                        </section>

{/* Global Search Results Overlay */ }
{
    searchResults !== null ? (
        <section className= "bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4" >
        <div className="flex items-center justify-between" >
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2" >
                <Search className="w-4 h-4 text-blue-600" />
                    Unified Search Results for "{searchQuery}"({ searchResults.length })
                        </h2>
                        < button
                onClick = {() => setSearchQuery('')}
className = "text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
    >
    Clear Search
        </button>
        </div>

{
    searchResults.length === 0 ? (
        <p className= "text-sm text-slate-500 py-6 text-center" >
        No matching bills or warranties found.
              </p>
            ) : (
        <div className= "grid grid-cols-1 md:grid-cols-2 gap-4" >
        {
            searchResults.map((item) => (
                <div
                    key= { item.id }
                    className = "p-4 border border-slate-200 rounded-xl flex items-center justify-between gap-3 bg-slate-50/50"
                >
                <div>
                <div className="flex items-center gap-2 mb-1" >
            <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full ${item.type === 'bill'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-indigo-100 text-indigo-800'
                }`}
        >
        { item.type }
        </span>
    {
        item.category && (
            <span className="text-xs text-slate-500 flex items-center gap-1" >
                <Tag className="w-3 h-3" /> { item.category }
                    </span>
                        )
    }
    </div>
        < p className = "text-sm font-semibold text-slate-900" >
        { item.title }
            </p>
            < p className = "text-xs text-slate-500 flex items-center gap-1 mt-1" >
                <Calendar className="w-3.5 h-3.5" /> Target: { item.targetDate }
    </p>
        </div>
    {
        item.status && (
            <span
                        className={
            `text-xs px-2.5 py-1 rounded-full font-medium ${item.status === 'Paid'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-slate-200 text-slate-700'
            }`
        }
                      >
        { item.status }
            </span>
                    )
    }
    </div>
                ))
}
</div>
            )}
</section>
        ) : (
    /* Normal Dashboard View */
    <div className= "grid grid-cols-1 lg:grid-cols-2 gap-8" >
    {/* Bills Section */ }
    < section className = "bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4" >
        <div className="flex items-center justify-between" >
            <div className="flex items-center gap-2" >
                <CreditCard className="w-5 h-5 text-amber-500" />
                    <h2 className="font-bold text-slate-900" > Upcoming Bills & EMIs </h2>
                        </div>
                        < button
onClick = {() => onOpenAddModal('bill')}
className = "text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
    >
    + Add New
        </button>
        </div>

{
    loading ? (
        <div className= "py-8 text-center text-sm text-slate-400" >
        Loading bills...
    </div>
              ) : bills.length === 0 ? (
        <div className= "py-8 text-center text-sm text-slate-400" >
        No bills added yet.
                </div>
              ) : (
        <div className= "space-y-3" >
        {
            bills.map((bill) => (
                <div
                      key= { bill.id }
                      className = "p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition flex items-center justify-between gap-4"
                >
                <div className="space-y-1" >
            <p className="text-sm font-semibold text-slate-900" >
            { bill.title }
            </p>
            < div className = "flex items-center gap-3 text-xs text-slate-500" >
            <span className="flex items-center gap-1" >
            <Calendar className="w-3.5 h-3.5" /> Due: { bill.dueDate }
            </span>
            <span>•</span>
            < span > { bill.category } </span>
            </div>
            </div>

            < div className = "flex items-center gap-3" >
            {
                bill.receiptUrl && (
                    <button
                            onClick={() =>
                onViewImage(
                    bill.receiptUrl!,
                    `Receipt - ${bill.title}`
                )
                            }
    className = "p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
    title = "View Bill Receipt"
        >
        <FileText className="w-4 h-4" />
            </button>
                        )
}
<span className="font-bold text-sm text-slate-900" >
                          ₹{ bill.amount.toFixed(2) }
</span>
{
    bill.status === 'Paid' ? (
        <span className= "inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full" >
        <CheckCircle2 className="w-3.5 h-3.5" /> Paid
            </span>
                        ) : (
        <button
                            onClick= {() => handleMarkAsPaid(bill.id)
}
className = "px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-md transition cursor-pointer"
    >
    Mark Paid
        </button>
                        )}
{/* Trash Delete Action */ }
<button
                          onClick={ () => handleDeleteBill(bill.id) }
className = "p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
title = "Delete Bill"
    >
    <Trash2 className="w-4 h-4" />
        </button>
        </div>
        </div>
                  ))}
</div>
              )}
</section>

{/* Warranties Section */ }
<section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4" >
    <div className="flex items-center justify-between" >
        <div className="flex items-center gap-2" >
            <ShieldAlert className="w-5 h-5 text-indigo-500" />
                <h2 className="font-bold text-slate-900" > Warranty Tracker </h2>
                    </div>
                    < button
onClick = {() => onOpenAddModal('warranty')}
className = "text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
    >
    + Add New
        </button>
        </div>

{
    loading ? (
        <div className= "py-8 text-center text-sm text-slate-400" >
        Loading warranties...
    </div>
              ) : warranties.length === 0 ? (
        <div className= "py-8 text-center text-sm text-slate-400" >
        No warranties tracked yet.
                </div>
              ) : (
        <div className= "space-y-3" >
        {
            warranties.map((w) => (
                <div
                      key= { w.id }
                      className = "p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition flex items-center justify-between gap-4"
                >
                <div className="space-y-1" >
            <p className="text-sm font-semibold text-slate-900" >
            { w.itemName }
            </p>
            < div className = "flex items-center gap-3 text-xs text-slate-500" >
            <span className="flex items-center gap-1" >
            <Calendar className="w-3.5 h-3.5" /> Expires: { w.expiryDate }
            </span>
                          {
                    w.category && (
                        <>
                        <span>•</span>
                < span > { w.category } </span>
                </>
            )
        }
        </div>
    {
        w.notes && (
            <p className="text-xs text-slate-400 italic" > { w.notes } </p>
                        )
    }
    </div>

        < div className = "flex items-center gap-2" >
        {
            w.invoicePhotoUrl && (
                <button
                            onClick={
        () =>
            onViewImage(
                w.invoicePhotoUrl!,
                `Invoice - ${w.itemName}`
            )
    }
    className = "p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
    title = "View Invoice"
        >
        <FileText className="w-4 h-4" />
            </button>
                        )
}
{
    w.itemPhotoUrl && (
        <button
                            onClick={
        () =>
            onViewImage(
                w.itemPhotoUrl!,
                `Product Photo - ${w.itemName}`
            )
    }
    className = "p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition cursor-pointer"
    title = "View Product Photo"
        >
        <Camera className="w-4 h-4" />
            </button>
                        )
}
{/* Trash Delete Action */ }
<button
                          onClick={ () => handleDeleteWarranty(w.id) }
className = "p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
title = "Delete Warranty"
    >
    <Trash2 className="w-4 h-4" />
        </button>
        </div>
        </div>
                  ))}
</div>
              )}
</section>
    </div>
        )}
</main>
    </div>
  );
};

export default DashboardPage;