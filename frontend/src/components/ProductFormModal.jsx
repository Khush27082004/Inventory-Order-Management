import React, { useState, useEffect } from 'react';
import { X, Package, DollarSign, Tag, Hash, FileText, Image as ImageIcon } from 'lucide-react';

export default function ProductFormModal({ isOpen, onClose, onSave, editingProduct }) {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [price, setPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('10');
  const [minStockThreshold, setMinStockThreshold] = useState('5');
  const [unit, setUnit] = useState('pcs');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [barcode, setBarcode] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name || '');
      setSku(editingProduct.sku || '');
      setCategory(editingProduct.category || 'Electronics');
      setPrice(editingProduct.price !== undefined ? editingProduct.price.toString() : '');
      setCostPrice(editingProduct.costPrice !== undefined ? editingProduct.costPrice.toString() : '');
      setStockQuantity(editingProduct.stockQuantity !== undefined ? editingProduct.stockQuantity.toString() : '0');
      setMinStockThreshold(editingProduct.minStockThreshold !== undefined ? editingProduct.minStockThreshold.toString() : '5');
      setUnit(editingProduct.unit || 'pcs');
      setDescription(editingProduct.description || '');
      setImageUrl(editingProduct.imageUrl || '');
      setBarcode(editingProduct.barcode || '');
    } else {
      setName('');
      setSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
      setCategory('Electronics');
      setPrice('');
      setCostPrice('');
      setStockQuantity('15');
      setMinStockThreshold('5');
      setUnit('pcs');
      setDescription('');
      setImageUrl('');
      setBarcode('');
    }
    setError('');
  }, [editingProduct, isOpen]);

  if (!isOpen) return null;

  const numPrice = parseFloat(price) || 0;
  const numCost = parseFloat(costPrice) || 0;
  const profitMargin = numPrice > 0 ? (((numPrice - numCost) / numPrice) * 100).toFixed(1) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) return setError('Product name is required');
    if (!sku.trim()) return setError('SKU identifier is required');
    if (numPrice < 0 || numCost < 0) return setError('Price and Cost must be non-negative');

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        sku: sku.trim().toUpperCase(),
        category: category.trim(),
        price: numPrice,
        costPrice: numCost,
        stockQuantity: parseInt(stockQuantity, 10) || 0,
        minStockThreshold: parseInt(minStockThreshold, 10) || 5,
        unit: unit.trim() || 'pcs',
        description: description.trim(),
        imageUrl: imageUrl.trim(),
        barcode: barcode.trim()
      };
      await onSave(payload, editingProduct?._id);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Package size={18} color="#818cf8" />
            </div>
            <h3 className="modal-title">
              {editingProduct ? 'Edit Catalog Product' : 'Add New Product to Inventory'}
            </h3>
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

            {/* Row 1: Name and SKU */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mechanical Gaming Keyboard"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">SKU Identifier *</label>
                <input
                  type="text"
                  required
                  placeholder="ELEC-01"
                  value={sku}
                  onChange={(e) => setSku(e.target.value.toUpperCase())}
                  className="form-input font-mono"
                />
              </div>
            </div>

            {/* Row 2: Category and Unit */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Category *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electronics, Office Furniture"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="form-input"
                  list="category-suggestions"
                />
                <datalist id="category-suggestions">
                  <option value="Electronics" />
                  <option value="Office Furniture" />
                  <option value="Office Supplies" />
                  <option value="Tools & Hardware" />
                  <option value="Apparel" />
                </datalist>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Unit of Measure</label>
                <input
                  type="text"
                  placeholder="pcs, box, kg"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            {/* Row 3: Pricing and Margin Indicator */}
            <div style={{
              background: 'var(--bg-input)',
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', alignItems: 'center' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Selling Retail Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="form-input font-mono"
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Unit Cost Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="0.00"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    className="form-input font-mono"
                  />
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Gross Profit Margin</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#34d399' }} className="font-mono">
                    {profitMargin}%
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                    +${(numPrice - numCost).toFixed(2)} per unit
                  </div>
                </div>
              </div>
            </div>

            {/* Row 4: Initial Stock & Min Threshold */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">
                  {editingProduct ? 'Current Stock Quantity' : 'Initial Stock Quantity'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  className="form-input font-mono"
                  disabled={Boolean(editingProduct)} // For existing products, prompt to use Stock Adjustment for audit trail
                />
                {editingProduct && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                    Use "Adjust Stock" on dashboard to record audit movement.
                  </span>
                )}
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Min Stock Threshold (Alert Limit)</label>
                <input
                  type="number"
                  min="0"
                  value={minStockThreshold}
                  onChange={(e) => setMinStockThreshold(e.target.value)}
                  className="form-input font-mono"
                />
              </div>
            </div>

            {/* Row 5: Image URL & Barcode */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Product Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Barcode / UPC Number</label>
                <input
                  type="text"
                  placeholder="890123450001"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="form-input font-mono"
                />
              </div>
            </div>

            {/* Description */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Description & Specifications</label>
              <textarea
                rows="2"
                placeholder="Key technical specifications, warranty, or packaging details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-textarea"
              ></textarea>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
