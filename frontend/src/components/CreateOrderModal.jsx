import React, { useState } from 'react';
import { X, ShoppingCart, Plus, Trash2, User, Mail, Phone, MapPin, AlertCircle, DollarSign } from 'lucide-react';

export default function CreateOrderModal({ isOpen, onClose, onSave, products = [] }) {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingStreet, setShippingStreet] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingState, setShippingState] = useState('');
  const [shippingZip, setShippingZip] = useState('');

  const [orderItems, setOrderItems] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [paymentStatus, setPaymentStatus] = useState('Paid');
  const [taxRate, setTaxRate] = useState(0.08); // 8%
  const [discountAmount, setDiscountAmount] = useState(0);
  const [notes, setNotes] = useState('');

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  // Selected product preview for adding
  const activeProductToAdd = products.find((p) => p._id === selectedProductId);

  const handleAddItem = () => {
    if (!activeProductToAdd) return;
    const qty = parseInt(selectedQuantity, 10);
    if (!qty || qty <= 0) {
      setError('Quantity must be at least 1');
      return;
    }

    if (activeProductToAdd.stockQuantity < qty) {
      setError(`Cannot add ${qty} units. Only ${activeProductToAdd.stockQuantity} available in inventory.`);
      return;
    }

    // Check if already in items
    const existingIndex = orderItems.findIndex((it) => it.product === activeProductToAdd._id);
    if (existingIndex !== -1) {
      const updated = [...orderItems];
      const newQty = updated[existingIndex].quantity + qty;
      if (newQty > activeProductToAdd.stockQuantity) {
        setError(`Total requested quantity (${newQty}) exceeds stock on hand (${activeProductToAdd.stockQuantity}).`);
        return;
      }
      updated[existingIndex].quantity = newQty;
      updated[existingIndex].subtotal = parseFloat((newQty * activeProductToAdd.price).toFixed(2));
      setOrderItems(updated);
    } else {
      setOrderItems([
        ...orderItems,
        {
          product: activeProductToAdd._id,
          name: activeProductToAdd.name,
          sku: activeProductToAdd.sku,
          unitPrice: activeProductToAdd.price,
          quantity: qty,
          subtotal: parseFloat((qty * activeProductToAdd.price).toFixed(2))
        }
      ]);
    }

    setError('');
    setSelectedQuantity(1);
  };

  const handleRemoveItem = (index) => {
    const updated = orderItems.filter((_, i) => i !== index);
    setOrderItems(updated);
  };

  const handleQuantityChange = (index, newQty) => {
    const qty = parseInt(newQty, 10);
    if (isNaN(qty) || qty <= 0) return;

    const item = orderItems[index];
    const originalProd = products.find((p) => p._id === item.product);
    if (originalProd && qty > originalProd.stockQuantity) {
      setError(`Cannot set quantity to ${qty}. Available: ${originalProd.stockQuantity}`);
      return;
    }

    setError('');
    const updated = [...orderItems];
    updated[index].quantity = qty;
    updated[index].subtotal = parseFloat((qty * updated[index].unitPrice).toFixed(2));
    setOrderItems(updated);
  };

  const itemsSubtotal = orderItems.reduce((acc, it) => acc + it.subtotal, 0);
  const taxAmount = parseFloat((itemsSubtotal * taxRate).toFixed(2));
  const totalAmount = parseFloat(Math.max(0, itemsSubtotal + taxAmount - Number(discountAmount || 0)).toFixed(2));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!customerName.trim()) return setError('Customer name is required');
    if (!customerEmail.trim()) return setError('Customer email is required');
    if (orderItems.length === 0) return setError('Please add at least one product item to the order');

    setSubmitting(true);
    try {
      const payload = {
        customer: {
          name: customerName.trim(),
          email: customerEmail.trim().toLowerCase(),
          phone: customerPhone.trim(),
          address: {
            street: shippingStreet.trim(),
            city: shippingCity.trim(),
            state: shippingState.trim(),
            zip: shippingZip.trim(),
            country: 'USA'
          }
        },
        items: orderItems.map((it) => ({
          productId: it.product,
          quantity: it.quantity,
          unitPrice: it.unitPrice
        })),
        paymentMethod,
        paymentStatus,
        taxRate,
        discountAmount: Number(discountAmount || 0),
        notes: notes.trim()
      };

      await onSave(payload);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '780px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShoppingCart size={18} color="#fff" />
            </div>
            <h3 className="modal-title">Create New Customer Order</h3>
          </div>
          <button onClick={onClose} className="modal-close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {error && (
              <div style={{
                background: 'var(--danger-light)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                color: '#fb7185',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem'
              }}>
                {error}
              </div>
            )}

            {/* Section 1: Customer Information */}
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>
                1. Customer Details
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Customer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Corporation or John Smith"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Customer Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="customer@domain.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Shipping Street Address</label>
                  <input
                    type="text"
                    placeholder="123 Business Parkway Suite 200"
                    value={shippingStreet}
                    onChange={(e) => setShippingStreet(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Product Line Items Builder */}
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>
                2. Order Line Items (Live Inventory Stock Allocation)
              </div>

              {/* Add item row */}
              <div style={{
                background: 'var(--bg-input)',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                display: 'grid',
                gridTemplateColumns: '3fr 1fr auto',
                gap: '12px',
                alignItems: 'flex-end',
                marginBottom: '14px'
              }}>
                <div>
                  <label className="form-label" style={{ marginBottom: '4px' }}>Select Product to Add</label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="form-select font-mono"
                    style={{ height: '38px', fontSize: '0.85rem' }}
                  >
                    <option value="">-- Choose Catalog SKU --</option>
                    {products.map((p) => (
                      <option
                        key={p._id}
                        value={p._id}
                        disabled={p.stockQuantity <= 0}
                      >
                        [{p.sku}] {p.name} — ${p.price.toFixed(2)} ({p.stockQuantity} in stock)
                        {p.stockQuantity <= 0 ? ' [DEPLETED]' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ marginBottom: '4px' }}>Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max={activeProductToAdd ? activeProductToAdd.stockQuantity : 999}
                    value={selectedQuantity}
                    onChange={(e) => setSelectedQuantity(e.target.value)}
                    className="form-input font-mono"
                    style={{ height: '38px' }}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddItem}
                  disabled={!selectedProductId || (activeProductToAdd && activeProductToAdd.stockQuantity <= 0)}
                  className="btn btn-secondary"
                  style={{ height: '38px' }}
                >
                  <Plus size={16} />
                  <span>Add Line Item</span>
                </button>
              </div>

              {/* Order items table */}
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      <th>Unit Price</th>
                      <th>Qty</th>
                      <th>Subtotal</th>
                      <th style={{ width: '40px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderItems.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '18px', color: 'var(--text-dim)' }}>
                          No products added to this order yet.
                        </td>
                      </tr>
                    ) : (
                      orderItems.map((it, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: 600 }}>{it.name}</td>
                          <td className="font-mono" style={{ color: '#818cf8', fontSize: '0.8rem' }}>{it.sku}</td>
                          <td className="font-mono">${it.unitPrice.toFixed(2)}</td>
                          <td>
                            <input
                              type="number"
                              min="1"
                              value={it.quantity}
                              onChange={(e) => handleQuantityChange(idx, e.target.value)}
                              className="form-input font-mono"
                              style={{ width: '70px', padding: '4px 8px', height: '30px' }}
                            />
                          </td>
                          <td className="font-mono" style={{ fontWeight: 700 }}>
                            ${it.subtotal.toFixed(2)}
                          </td>
                          <td>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="btn btn-secondary btn-icon btn-sm"
                              style={{ width: '28px', height: '28px', borderColor: 'transparent' }}
                            >
                              <Trash2 size={13} color="#f43f5e" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 3: Totals & Payment Setup */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-md)',
              padding: '16px'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* Left: Payment Method & Status */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="form-select"
                    >
                      <option value="Credit Card">Credit Card</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cash">Cash on Delivery</option>
                      <option value="UPI">UPI / Digital Wallet</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Payment Status</label>
                    <select
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value)}
                      className="form-select font-mono"
                    >
                      <option value="Paid">Paid (Confirmed)</option>
                      <option value="Pending">Pending Payment</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Order Notes / Instructions</label>
                    <input
                      type="text"
                      placeholder="e.g. Leave package with front desk"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                {/* Right: Calculations */}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Subtotal:</span>
                    <span className="font-mono">${itemsSubtotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Estimated Tax (8%):</span>
                    <span className="font-mono">${taxAmount.toFixed(2)}</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '10px',
                    marginTop: '4px'
                  }}>
                    <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>Order Total:</span>
                    <span className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399' }}>
                      ${totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || orderItems.length === 0}
              className="btn btn-primary"
            >
              {submitting ? 'Generating Order...' : `Confirm & Place Order ($${totalAmount.toFixed(2)})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
