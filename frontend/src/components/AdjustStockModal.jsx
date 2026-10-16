import React, { useState, useEffect } from 'react';
import { X, Layers, PlusCircle, MinusCircle, AlertCircle, RefreshCw } from 'lucide-react';

export default function AdjustStockModal({
  isOpen,
  onClose,
  onSave,
  products = [],
  initialProduct = null
}) {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [type, setType] = useState('RESTOCK');
  const [quantity, setQuantity] = useState('10');
  const [isDeduction, setIsDeduction] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialProduct) {
      setSelectedProductId(initialProduct._id);
    } else if (products.length > 0 && !selectedProductId) {
      setSelectedProductId(products[0]._id);
    }
    setType('RESTOCK');
    setQuantity('10');
    setIsDeduction(false);
    setReason('Supplier delivery stock replenishment');
    setError('');
  }, [initialProduct, isOpen, products]);

  if (!isOpen) return null;

  const currentProduct = products.find((p) => p._id === selectedProductId) || initialProduct;
  const currentStock = currentProduct?.stockQuantity || 0;
  const numQty = parseInt(quantity, 10) || 0;

  let projectedStock = currentStock;
  if (type === 'RESTOCK') {
    projectedStock = currentStock + numQty;
  } else if (type === 'DAMAGE') {
    projectedStock = Math.max(0, currentStock - numQty);
  } else if (type === 'MANUAL_ADJUSTMENT') {
    projectedStock = isDeduction ? Math.max(0, currentStock - numQty) : currentStock + numQty;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedProductId) return setError('Please select a product');
    if (numQty <= 0) return setError('Adjustment quantity must be greater than zero');
    if ((type === 'DAMAGE' || (type === 'MANUAL_ADJUSTMENT' && isDeduction)) && numQty > currentStock) {
      return setError(`Cannot deduct ${numQty} units. Only ${currentStock} units in stock.`);
    }

    setSubmitting(true);
    try {
      await onSave({
        productId: selectedProductId,
        type,
        quantity: numQty,
        isDeduction: type === 'MANUAL_ADJUSTMENT' ? isDeduction : type === 'DAMAGE',
        reason: reason.trim() || `${type} inventory adjustment`
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to adjust stock');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(6, 182, 212, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Layers size={18} color="#38bdf8" />
            </div>
            <h3 className="modal-title">Inventory Stock Adjustment</h3>
          </div>
          <button onClick={onClose} className="modal-close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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

            {/* Product Selector */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Target Product *</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="form-select font-mono"
                disabled={Boolean(initialProduct)}
              >
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    [{p.sku}] {p.name} (Current: {p.stockQuantity} {p.unit || 'pcs'})
                  </option>
                ))}
              </select>
            </div>

            {/* Adjustment Type Selector */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Adjustment Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{
                    background: type === 'RESTOCK' ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-input)',
                    color: type === 'RESTOCK' ? '#34d399' : 'var(--text-muted)',
                    border: type === 'RESTOCK' ? '1px solid #10b981' : '1px solid var(--border-subtle)'
                  }}
                  onClick={() => {
                    setType('RESTOCK');
                    setReason('Supplier restock order received');
                  }}
                >
                  <PlusCircle size={14} />
                  <span>Restock</span>
                </button>

                <button
                  type="button"
                  className="btn btn-sm"
                  style={{
                    background: type === 'DAMAGE' ? 'rgba(244, 63, 94, 0.2)' : 'var(--bg-input)',
                    color: type === 'DAMAGE' ? '#fb7185' : 'var(--text-muted)',
                    border: type === 'DAMAGE' ? '1px solid #f43f5e' : '1px solid var(--border-subtle)'
                  }}
                  onClick={() => {
                    setType('DAMAGE');
                    setReason('Damaged in warehouse / transit');
                  }}
                >
                  <MinusCircle size={14} />
                  <span>Damage</span>
                </button>

                <button
                  type="button"
                  className="btn btn-sm"
                  style={{
                    background: type === 'MANUAL_ADJUSTMENT' ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-input)',
                    color: type === 'MANUAL_ADJUSTMENT' ? '#818cf8' : 'var(--text-muted)',
                    border: type === 'MANUAL_ADJUSTMENT' ? '1px solid #6366f1' : '1px solid var(--border-subtle)'
                  }}
                  onClick={() => {
                    setType('MANUAL_ADJUSTMENT');
                    setReason('Physical inventory audit count correction');
                  }}
                >
                  <RefreshCw size={14} />
                  <span>Audit Count</span>
                </button>
              </div>
            </div>

            {/* Manual adjustment direction (Add or Deduct) */}
            {type === 'MANUAL_ADJUSTMENT' && (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Action:</span>
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{
                    background: !isDeduction ? 'var(--primary)' : 'var(--bg-input)',
                    color: '#fff',
                    padding: '4px 12px'
                  }}
                  onClick={() => setIsDeduction(false)}
                >
                  + Add Stock
                </button>
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{
                    background: isDeduction ? '#f43f5e' : 'var(--bg-input)',
                    color: '#fff',
                    padding: '4px 12px'
                  }}
                  onClick={() => setIsDeduction(true)}
                >
                  - Deduct Stock
                </button>
              </div>
            )}

            {/* Quantity */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Units to Adjust *</label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="form-input font-mono"
              />
            </div>

            {/* Live Projected Stock preview badge */}
            <div style={{
              background: 'var(--bg-input)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Current Stock</div>
                <div className="font-mono" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>
                  {currentStock} {currentProduct?.unit || 'pcs'}
                </div>
              </div>
              <div style={{ fontSize: '1.2rem', color: 'var(--text-dim)' }}>➔</div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Projected Stock</div>
                <div className="font-mono" style={{
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  color: projectedStock <= (currentProduct?.minStockThreshold || 5) ? '#f59e0b' : '#34d399'
                }}>
                  {projectedStock} {currentProduct?.unit || 'pcs'}
                </div>
              </div>
            </div>

            {/* Reason */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Adjustment Reason / Reference Notes</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. PO-8902 received or broken during transport"
                className="form-input"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Applying Adjustment...' : 'Confirm Stock Adjustment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
