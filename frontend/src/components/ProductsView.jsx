import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Layers,
  LayoutGrid,
  List,
  AlertTriangle,
  ArrowUpDown,
  Barcode,
  Package
} from 'lucide-react';

export default function ProductsView({
  products = [],
  categories = [],
  loading,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedStatus,
  setSelectedStatus,
  onOpenAddModal,
  onOpenEditModal,
  onOpenAdjustModal,
  onDeleteProduct
}) {
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header & Action */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: '4px' }}>
            Product Catalog & Inventory
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Manage SKUs, product pricing tiers, inventory thresholds, and catalog details.
          </p>
        </div>

        <button onClick={onOpenAddModal} className="btn btn-primary">
          <Plus size={18} />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '16px 20px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px'
        }}>
          {/* Search bar */}
          <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
            <Search size={17} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input
              type="text"
              placeholder="Search by product name, SKU, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '38px', height: '40px' }}
            />
          </div>

          {/* Category Filter */}
          <div style={{ minWidth: '180px' }}>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form-select"
              style={{ height: '40px' }}
            >
              <option value="all">All Categories ({categories.length})</option>
              {categories.map((c, i) => (
                <option key={i} value={c.name}>
                  {c.name} ({c.count})
                </option>
              ))}
            </select>
          </div>

          {/* Stock Status Filter */}
          <div style={{ minWidth: '160px' }}>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="form-select"
              style={{ height: '40px' }}
            >
              <option value="all">All Stock Statuses</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock (Alert)</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>

          {/* View toggle button */}
          <div style={{
            display: 'flex',
            background: 'var(--bg-input)',
            borderRadius: 'var(--radius-md)',
            padding: '2px',
            border: '1px solid var(--border-subtle)'
          }}>
            <button
              onClick={() => setViewMode('table')}
              className="btn btn-sm"
              style={{
                background: viewMode === 'table' ? 'var(--primary)' : 'transparent',
                color: viewMode === 'table' ? '#fff' : 'var(--text-muted)',
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)'
              }}
              title="Table View"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className="btn btn-sm"
              style={{
                background: viewMode === 'grid' ? 'var(--primary)' : 'transparent',
                color: viewMode === 'grid' ? '#fff' : 'var(--text-muted)',
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)'
              }}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Table or Grid */}
      {loading ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading catalog products...
        </div>
      ) : products.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
          <Package size={48} color="var(--text-dim)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ color: '#fff', marginBottom: '8px' }}>No Products Found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '16px' }}>
            No products match the selected filters or search keyword.
          </p>
          <button onClick={onOpenAddModal} className="btn btn-primary btn-sm">
            Add Your First Product
          </button>
        </div>
      ) : viewMode === 'table' ? (
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
          <div className="data-table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product & SKU</th>
                  <th>Category</th>
                  <th>Price / Cost</th>
                  <th>Stock Level</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const profitMargin = p.price > 0 ? (((p.price - p.costPrice) / p.price) * 100).toFixed(1) : 0;
                  const stockPct = Math.min(100, Math.round((p.stockQuantity / Math.max(p.minStockThreshold * 2.5, 20)) * 100));

                  return (
                    <tr key={p._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover' }}
                            />
                          ) : (
                            <div style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: '8px',
                              background: 'var(--bg-input)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <Package size={20} color="var(--text-dim)" />
                            </div>
                          )}
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                              {p.name}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                              <span className="font-mono" style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 600 }}>
                                {p.sku}
                              </span>
                              {p.barcode && (
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                                  ({p.barcode})
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          color: 'var(--text-muted)'
                        }}>
                          {p.category}
                        </span>
                      </td>

                      <td>
                        <div>
                          <span className="font-mono" style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
                            ${p.price.toFixed(2)}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                          Cost: ${p.costPrice.toFixed(2)} · <span style={{ color: '#34d399' }}>{profitMargin}%</span>
                        </div>
                      </td>

                      <td style={{ minWidth: '150px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                          <span className="font-mono" style={{ fontWeight: 700 }}>
                            {p.stockQuantity} {p.unit || 'pcs'}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                            Min: {p.minStockThreshold}
                          </span>
                        </div>
                        <div style={{ height: '6px', background: 'var(--bg-input)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${stockPct}%`,
                            height: '100%',
                            background:
                              p.status === 'out_of_stock'
                                ? '#f43f5e'
                                : p.status === 'low_stock'
                                ? '#f59e0b'
                                : '#10b981',
                            borderRadius: '3px'
                          }}></div>
                        </div>
                      </td>

                      <td>
                        <span className={`badge badge-${p.status}`}>
                          {p.status === 'in_stock' ? 'In Stock' : p.status === 'low_stock' ? 'Low Stock' : 'Out of Stock'}
                        </span>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                          <button
                            onClick={() => onOpenAdjustModal(p)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '6px 10px', fontSize: '0.775rem' }}
                            title="Adjust Stock"
                          >
                            <Layers size={14} />
                            <span>Adjust</span>
                          </button>
                          <button
                            onClick={() => onOpenEditModal(p)}
                            className="btn btn-secondary btn-icon btn-sm"
                            title="Edit Product"
                          >
                            <Edit2 size={14} color="var(--text-muted)" />
                          </button>
                          <button
                            onClick={() => onDeleteProduct(p)}
                            className="btn btn-secondary btn-icon btn-sm"
                            style={{ borderColor: 'rgba(244, 63, 94, 0.3)' }}
                            title="Delete Product"
                          >
                            <Trash2 size={14} color="#f43f5e" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid View */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          {products.map((p) => {
            const profitMargin = p.price > 0 ? (((p.price - p.costPrice) / p.price) * 100).toFixed(1) : 0;
            return (
              <div key={p._id} className="glass-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ position: 'relative', height: '140px', borderRadius: '10px', overflow: 'hidden', marginBottom: '14px', background: 'var(--bg-input)' }}>
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Package size={36} color="var(--text-dim)" />
                      </div>
                    )}
                    <span className={`badge badge-${p.status}`} style={{ position: 'absolute', top: '10px', right: '10px' }}>
                      {p.status === 'in_stock' ? 'In Stock' : p.status === 'low_stock' ? 'Low Stock' : 'Out of Stock'}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 600 }} className="font-mono">
                    {p.sku}
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', margin: '4px 0 8px', lineHeight: 1.3 }}>
                    {p.name}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '14px' }}>
                    {p.category}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div>
                      <div className="font-mono" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                        ${p.price.toFixed(2)}
                      </div>
                      <div style={{ fontSize: '0.725rem', color: '#34d399' }}>
                        {profitMargin}% margin
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="font-mono" style={{ fontSize: '1rem', fontWeight: 700, color: p.stockQuantity <= p.minStockThreshold ? '#f59e0b' : '#fff' }}>
                        {p.stockQuantity} {p.unit || 'pcs'}
                      </div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-dim)' }}>
                        Min: {p.minStockThreshold}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => onOpenAdjustModal(p)}
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      <Layers size={14} />
                      <span>Adjust</span>
                    </button>
                    <button
                      onClick={() => onOpenEditModal(p)}
                      className="btn btn-secondary btn-icon btn-sm"
                      title="Edit"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => onDeleteProduct(p)}
                      className="btn btn-secondary btn-icon btn-sm"
                      title="Delete"
                      style={{ borderColor: 'rgba(244, 63, 94, 0.3)' }}
                    >
                      <Trash2 size={14} color="#f43f5e" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
