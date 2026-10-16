import React from 'react';
import { X, Printer, Package, CheckCircle2, Clock } from 'lucide-react';

export default function InvoiceModal({ order, isOpen, onClose }) {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const invoiceDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '720px' }}>
        {/* Modal Controls Bar */}
        <div className="modal-header" style={{ background: 'var(--bg-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>
              Tax Invoice Preview — {order.orderNumber}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button onClick={handlePrint} className="btn btn-primary btn-sm">
              <Printer size={15} />
              <span>Print Invoice</span>
            </button>
            <button onClick={onClose} className="modal-close">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div id="printable-invoice" style={{
          padding: '36px',
          background: '#ffffff',
          color: '#111827',
          fontFamily: "'Plus Jakarta Sans', sans-serif"
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #e5e7eb', paddingBottom: '24px', marginBottom: '24px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <div style={{ width: '28px', height: '28px', background: '#4f46e5', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Package size={16} color="#fff" />
                </div>
                <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>
                  CoreStock Systems Inc.
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280', lineHeight: 1.4 }}>
                100 Innovation Boulevard, Suite 500<br />
                San Francisco, CA 94105<br />
                support@corestock.io · +1 (800) 555-STOCK
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#4f46e5', letterSpacing: '-0.02em' }}>
                INVOICE
              </div>
              <div className="font-mono" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111827' }}>
                #{order.orderNumber}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '4px' }}>
                Issued: {invoiceDate}
              </div>
              <div style={{ marginTop: '8px' }}>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: '12px',
                  background: order.paymentStatus === 'Paid' ? '#dcfce7' : '#fef3c7',
                  color: order.paymentStatus === 'Paid' ? '#15803d' : '#b45309'
                }}>
                  Payment: {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Bill To info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '28px' }}>
            <div>
              <div style={{ fontSize: '0.725rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: '6px' }}>
                Billed To Customer:
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#111827' }}>
                {order.customer?.name}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#4b5563', marginTop: '2px' }}>
                {order.customer?.email}
              </div>
              {order.customer?.phone && (
                <div style={{ fontSize: '0.85rem', color: '#4b5563' }}>
                  {order.customer?.phone}
                </div>
              )}
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.725rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: '6px' }}>
                Order Fulfillment:
              </div>
              <div style={{ fontSize: '0.85rem', color: '#111827' }}>
                Status: <strong>{order.orderStatus}</strong>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#4b5563' }}>
                Method: {order.paymentMethod}
              </div>
              {order.customer?.address?.street && (
                <div style={{ fontSize: '0.85rem', color: '#4b5563', marginTop: '2px' }}>
                  Ship To: {order.customer.address.street}, {order.customer.address.city || ''}
                </div>
              )}
            </div>
          </div>

          {/* Items Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
            <thead>
              <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' }}>Description</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' }}>SKU</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' }}>Price</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' }}>Qty</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((it, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px', fontSize: '0.85rem', fontWeight: 600, color: '#111827' }}>{it.name}</td>
                  <td style={{ padding: '12px', fontSize: '0.8rem', color: '#6b7280', fontFamily: 'monospace' }}>{it.sku}</td>
                  <td style={{ padding: '12px', textAlign: 'right', fontSize: '0.85rem', color: '#111827' }}>${it.unitPrice.toFixed(2)}</td>
                  <td style={{ padding: '12px', textAlign: 'center', fontSize: '0.85rem', color: '#111827', fontWeight: 600 }}>{it.quantity}</td>
                  <td style={{ padding: '12px', textAlign: 'right', fontSize: '0.85rem', fontWeight: 700, color: '#111827' }}>${it.subtotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals Summary */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
            <div style={{ width: '260px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.85rem', color: '#4b5563' }}>
                <span>Subtotal:</span>
                <span style={{ fontWeight: 600 }}>${(order.subtotal || 0).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.85rem', color: '#4b5563' }}>
                <span>Tax ({(order.taxRate * 100 || 8).toFixed(0)}%):</span>
                <span>${(order.taxAmount || 0).toFixed(2)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.85rem', color: '#15803d' }}>
                  <span>Discount:</span>
                  <span>-${order.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px 0 6px',
                fontSize: '1.15rem',
                fontWeight: 800,
                color: '#111827',
                borderTop: '2px solid #111827',
                marginTop: '6px'
              }}>
                <span>Total Amount:</span>
                <span style={{ color: '#4f46e5' }}>${(order.totalAmount || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px', textAlign: 'center', fontSize: '0.75rem', color: '#9ca3af' }}>
            Thank you for your business! If you have any inquiries regarding this invoice, contact our billing desk at billing@corestock.io.
          </div>
        </div>
      </div>
    </div>
  );
}
