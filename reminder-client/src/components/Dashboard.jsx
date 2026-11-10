import React, { useEffect, useState } from 'react';
import { getBills, getWarranties } from '../api/reminderService';
import AddBillModal from './AddBillModal';
import AddWarrantyModal from './AddWarrantyModal';

export default function Dashboard() {
    const [bills, setBills] = useState([]);
    const [warranties, setWarranties] = useState([]);
    const [showBillModal, setShowBillModal] = useState(false);
    const [showWarrantyModal, setShowWarrantyModal] = useState(false);

    const loadData = async () => {
        const [b, w] = await Promise.all([getBills(), getWarranties()]);
        setBills(b);
        setWarranties(w);
    };

    useEffect(() => {
        loadData();
    }, []);

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>ReminderApp Dashboard</h2>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        onClick={() => setShowBillModal(true)}
                        style={{ padding: '0.5rem 1rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        + Add Bill
                    </button>
                    <button
                        onClick={() => setShowWarrantyModal(true)}
                        style={{ padding: '0.5rem 1rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        + Add Warranty
                    </button>
                </div>
            </header>

            {/* Render Lists */}
            {/* ... [Table code from previous turn] ... */}

            {/* Modals */}
            <AddBillModal
                isOpen={showBillModal}
                onClose={() => setShowBillModal(false)}
                onBillCreated={(newBill) => setBills((prev) => [...prev, newBill])}
            />

            <AddWarrantyModal
                isOpen={showWarrantyModal}
                onClose={() => setShowWarrantyModal(false)}
                onWarrantyCreated={(newWarranty) => setWarranties((prev) => [...prev, newWarranty])}
            />
        </div>
    );
}