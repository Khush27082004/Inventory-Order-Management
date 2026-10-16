import React, { useState } from 'react';
import {
  Layers,
  AlertTriangle,
  History,
  TrendingUp,
  DollarSign,
  PlusCircle,
  Package,
  Calendar,
  Filter
} from 'lucide-react';

export default function InventoryView({
  overview = {},
  alerts = [],
  movements = [],
  onOpenAdjustModal,
  loading
}) {
  const [movementFilter, setMovementFilter] = useState('all');

  const filteredMovements = movements.filter((m) => {
    if (movementFilter === 'all') return true;
    return m.type === movementFilter;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: '4px' }}>
            Inventory Valuation & Stock Operations
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Real-time replenishment tracking, warehouse stock audit trail, and valuation analytics.
          </p>
        </div>

        <button onClick={() => onOpenAdjustModal()} className="btn btn-primary">
          <PlusCircle size={18} />
          <span>New Stock Adjustment</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '18px'
      }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Total Stock On Hand
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }} className="font-mono">
            {overview.totalStockUnits || 0}
            <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)', fontWeight: 500, marginLeft: '6px' }}>
              units
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Across {overview.totalProducts || 0} inventory products
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Total Inventory Cost Value
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }} className="font-mono">
            ${(overview.totalInventoryCost || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            Cost of goods invested in stock
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Retail Inventory Value
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#38bdf8' }} className="font-mono">
            ${(overview.totalRetailValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            Potential retail sell-through
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Projected Profit Margin
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34d399' }} className="font-mono">
            ${(overview.potentialProfit || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '4px', fontWeight: 600 }}>
            {overview.marginPercentage || 0}% average markup
          </div>
        </div>
      </div>

      {/* Critical Stock Replenishment Table (Low & Out of Stock) */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertTriangle size={18} color="#f59e0b" />
            </div>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                Stock Replenishment Alerts ({alerts.length})
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Items falling below safety threshold or completely depleted
              </div>
            </div>
          </div>
        </div>

        {alerts.length === 0 ? (
          <div style={{ padding: '28px', textAlign: 'center', color: '#34d399', background: 'rgba(16, 185, 129, 0.05)', borderRadius: 'var(--radius-md)' }}>
            ✓ All warehouse catalog inventory levels are healthy!
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product & SKU</th>
                  <th>Category</th>
                  <th>Current Stock</th>
                  <th>Min Threshold</th>
                  <th>Deficit</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((item) => {
                  const deficit = Math.max(0, item.minStockThreshold - item.stockQuantity);
                  return (
                    <tr key={item._id}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#fff' }}>{item.name}</div>
                        <div className="font-mono" style={{ fontSize: '0.75rem', color: '#818cf8' }}>{item.sku}</div>
                      </td>
                      <td>{item.category}</td>
                      <td>
                        <span className={`badge badge-${item.status}`}>
                          {item.stockQuantity} {item.unit || 'pcs'}
                        </span>
                      </td>
                      <td className="font-mono">{item.minStockThreshold}</td>
                      <td className="font-mono" style={{ color: '#fb7185', fontWeight: 700 }}>
                        -{deficit} units
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => onOpenAdjustModal(item)}
                          className="btn btn-primary btn-sm"
                          style={{ padding: '5px 12px', fontSize: '0.775rem' }}
                        >
                          <PlusCircle size={14} />
                          <span>Restock SKU</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stock Movement Transaction Log */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px'
        }}>
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
              <History size={18} color="#818cf8" />
            </div>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                Inventory Audit Trail & Movements
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Immutable historical record of all stock adjustments, sales, and intake
              </div>
            </div>
          </div>

          {/* Filter by type */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={15} color="var(--text-dim)" />
            <select
              value={movementFilter}
              onChange={(e) => setMovementFilter(e.target.value)}
              className="form-select"
              style={{ width: '180px', height: '36px', fontSize: '0.8rem' }}
            >
              <option value="all">All Movements</option>
              <option value="RESTOCK">Restock</option>
              <option value="ORDER_SALE">Order Sale</option>
              <option value="ORDER_CANCELLED">Order Restitution</option>
              <option value="DAMAGE">Damage</option>
              <option value="MANUAL_ADJUSTMENT">Manual Audit</option>
              <option value="INITIAL">Initial Intake</option>
            </select>
          </div>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Product / SKU</th>
                <th>Type</th>
                <th>Change</th>
                <th>Balance (Before ➔ After)</th>
                <th>Reason / Ref ID</th>
                <th>User</th>
              </tr>
            </thead>
            <tbody>
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-dim)' }}>
                    No stock movements found matching filter.
                  </td>
                </tr>
              ) : (
                filteredMovements.map((m) => {
                  const isPositive = m.quantityChanged > 0;
                  return (
                    <tr key={m._id}>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {new Date(m.createdAt).toLocaleString()}
                      </td>

                      <td>
                        <div style={{ fontWeight: 600 }}>{m.productName}</div>
                        <div className="font-mono" style={{ fontSize: '0.725rem', color: '#818cf8' }}>
                          {m.sku}
                        </div>
                      </td>

                      <td>
                        <span style={{
                          fontSize: '0.725rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background:
                            m.type === 'RESTOCK' || m.type === 'INITIAL'
                              ? 'rgba(16, 185, 129, 0.15)'
                              : m.type === 'ORDER_CANCELLED'
                              ? 'rgba(6, 182, 212, 0.15)'
                              : m.type === 'DAMAGE'
                              ? 'rgba(244, 63, 94, 0.15)'
                              : 'rgba(99, 102, 241, 0.15)',
                          color:
                            m.type === 'RESTOCK' || m.type === 'INITIAL'
                              ? '#34d399'
                              : m.type === 'ORDER_CANCELLED'
                              ? '#38bdf8'
                              : m.type === 'DAMAGE'
                              ? '#fb7185'
                              : '#a5b4fc'
                        }}>
                          {m.type.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="font-mono" style={{
                        fontWeight: 800,
                        color: isPositive ? '#34d399' : '#fb7185'
                      }}>
                        {isPositive ? `+${m.quantityChanged}` : m.quantityChanged}
                      </td>

                      <td className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {m.previousStock} ➔ <strong style={{ color: '#fff' }}>{m.newStock}</strong>
                      </td>

                      <td>
                        <div style={{ fontSize: '0.825rem' }}>{m.reason}</div>
                        {m.referenceId && (
                          <div className="font-mono" style={{ fontSize: '0.725rem', color: 'var(--text-dim)' }}>
                            Ref: {m.referenceId}
                          </div>
                        )}
                      </td>

                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {m.performedByName || 'System'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
