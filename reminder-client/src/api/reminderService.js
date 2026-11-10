import React, { useState } from 'react';
import { createBill } from '../api/reminderService';

export default function AddBillModal({ isOpen, onClose, onBillCreated }) {
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        dueDate: '',
        category: 0, // 0: Emi, 1: CreditCard, 2: Electricity, 3: Gas, 4: MobileRecharge, 5: Other
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'category' || name === 'amount' ? Number(value) : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const created = await createBill({
                title: formData.title,
                amount: parseFloat(formData.amount),
                dueDate: formData.dueDate,
                category: parseInt(formData.category, 10),
            });
            onBillCreated(created);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create bill.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={backdropStyle}>
            <div style={modalStyle}>
                <h3>Add New Bill</h3>
                {error && <p style={{ color: '#dc2626' }}>{error}</p>}

                <form onSubmit={handleSubmit}>
                    <div style={fieldStyle}>
                        <label>Title</label>
                        <input
                            type="text"
                            name="title"
                            required
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g., Electricity Bill"
                            style={inputStyle}
                        />
                    </div>

                    <div style={fieldStyle}>
                        <label>Amount (₹)</label>
                        <input
                            type="number"
                            name="amount"
                            step="0.01"
                            required
                            value={formData.amount}
                            onChange={handleChange}
                            placeholder="1500"
                            style={inputStyle}
                        />
                    </div>

                    <div style={fieldStyle}>
                        <label>Due Date</label>
                        <input
                            type="date"
                            name="dueDate"
                            required
                            value={formData.dueDate}
                            onChange={handleChange}
                            style={inputStyle}
                        />
                    </div>

                    <div style={fieldStyle}>
                        <label>Category</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            style={inputStyle}
                        >
                            <option value={0}>EMI</option>
                            <option value={1}>Credit Card</option>
                            <option value={2}>Electricity</option>
                            <option value={3}>Gas</option>
                            <option value={4}>Mobile Recharge</option>
                            <option value={5}>Other</option>
                        </select>
                    </div>

                    <div style={actionsStyle}>
                        <button type="button" onClick={onClose} style={cancelBtnStyle}>
                            Cancel
                        </button>
                        <button type="submit" disabled={submitting} style={submitBtnStyle}>
                            {submitting ? 'Saving...' : 'Save Bill'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const backdropStyle = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
};

const modalStyle = {
    backgroundColor: '#fff',
    padding: '1.5rem',
    borderRadius: '8px',
    width: '100%',
    maxWidth: '440px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
};

const fieldStyle = {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '1rem',
    gap: '0.25rem',
};

const inputStyle = {
    padding: '0.5rem',
    border: '1px solid #cbd5e1',
    borderRadius: '4px',
};

const actionsStyle = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.5rem',
    marginTop: '1.5rem',
};

const cancelBtnStyle = {
    padding: '0.5rem 1rem',
    background: '#f1f5f9',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
};

const submitBtnStyle = {
    padding: '0.5rem 1rem',
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
};