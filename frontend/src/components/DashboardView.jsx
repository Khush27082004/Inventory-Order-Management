import React from 'react';
import {
  DollarSign,
  TrendingUp,
  Package,
  AlertTriangle,
  ShoppingCart,
  ArrowUpRight,
  PlusCircle,
  Eye,
  FileText,
  Clock,
  Sparkles,
  BarChart3,
  Layers
} from 'lucide-react';
import SalesChart from './SalesChart';

export default function DashboardView({
  stats,
  onNewOrder,
  onNewProduct,
  onAdjustStock,
  onViewInvoice,
  onNavigateTab
}) {
  const summary = stats?.summary || {};
  const salesTrend = stats?.salesTrend || [];
  const topProducts = stats?.topProducts || [];
  const categoryBreakdown = stats?.categoryBreakdown || [];
  const recentOrders = stats?.recentOrders || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Top Banner / Welcome & Quick Action Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: '4px' }}>
            Business Performance Dashboard
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Real-time stock valuation, order processing status, and revenue telemetry.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={onNewOrder} className="btn btn-primary">
            <PlusCircle size={16} />
            <span>Create Order</span>
          </button>
          <button onClick={onNewProduct} className="btn btn-secondary">
            <Package size={16} />
            <span>Add Product</span>
          </button>
          <button onClick={() => onAdjustStock()} className="btn btn-secondary">
            <Layers size={16} />
            <span>Adjust Stock</span>
          </button>
        </div>
      </div>

      {/* Critical Stock Alert Banner if any items low/out */}
      {(summary.lowStockCount > 0 || summary.outOfStockCount > 0) && (
        <div style={{
          background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.15) 0%, rgba(244, 63, 94, 0.15) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <AlertTriangle size={22} color="#000" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
                Inventory Replenishment Required
              </div>
              <div style={{ fontSize: '0.825rem', color: '#fed7aa' }}>
                There are currently <strong>{summary.lowStockCount}</strong> items below minimum threshold and{' '}
                <strong>{summary.outOfStockCount}</strong> out of stock products.
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('inventory')}
            className="btn btn-secondary btn-sm"
            style={{ borderColor: 'rgba(245, 158, 11, 0.4)', color: '#fed7aa' }}
          >
            Review Stock Alerts →
          </button>
        </div>
      )}

      {/* 4 Primary KPI Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px'
      }}>
        {/* KPI 1: Total Revenue */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Total Revenue
            </span>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <DollarSign size={20} color="#818cf8" />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: '6px' }} className="font-mono">
            ${(summary.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.775rem', color: '#34d399' }}>
            <ArrowUpRight size={14} />
            <span>{summary.orderCount || 0} customer orders fulfilled</span>
          </div>
        </div>

        {/* KPI 2: Total Inventory Valuation */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Inventory Valuation
            </span>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <TrendingUp size={20} color="#34d399" />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: '6px' }} className="font-mono">
            ${(summary.totalRetailValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
            Cost: <span className="font-mono" style={{ color: '#fff' }}>${(summary.totalCostValue || 0).toFixed(2)}</span> · Margin:{' '}
            <span style={{ color: '#34d399', fontWeight: 700 }}>+${(summary.potentialProfit || 0).toFixed(2)}</span>
          </div>
        </div>

        {/* KPI 3: Total Stock Units */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Stock On Hand
            </span>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(6, 182, 212, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Package size={20} color="#38bdf8" />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: '6px' }} className="font-mono">
            {summary.totalUnits || 0}{' '}
            <span style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-muted)' }}>units</span>
          </div>
          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
            Cataloged across <strong style={{ color: '#fff' }}>{summary.totalProducts || 0}</strong> unique SKUs
          </div>
        </div>

        {/* KPI 4: Stock Health Index */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Stock Health Status
            </span>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: summary.outOfStockCount > 0 ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertTriangle size={20} color={summary.outOfStockCount > 0 ? '#fb7185' : '#34d399'} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '6px' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }} className="font-mono">
              {summary.totalProducts - (summary.lowStockCount + summary.outOfStockCount)}
            </span>
            <span style={{ fontSize: '0.9rem', color: '#34d399', fontWeight: 600 }}>Healthy</span>
          </div>
          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', display: 'flex', gap: '8px' }}>
            <span style={{ color: '#fbbf24' }}>● {summary.lowStockCount || 0} Low</span>
            <span style={{ color: '#fb7185' }}>● {summary.outOfStockCount || 0} Out</span>
          </div>
        </div>
      </div>

      {/* Mid Section: Sales Revenue Trend Chart + Category Distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Sales Trend Chart Panel */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>
                Sales Revenue Velocity (Past 7 Days)
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Daily aggregated customer checkout volume
              </div>
            </div>
            <span className="badge" style={{ background: 'var(--primary-light)', color: '#818cf8' }}>
              Live Telemetry
            </span>
          </div>

          <SalesChart data={salesTrend} />
        </div>

        {/* Category Breakdown Panel */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
            Category Valuation
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
            Stock distribution by department
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {categoryBreakdown.map((cat, idx) => {
              const maxCatVal = Math.max(...categoryBreakdown.map((c) => c.stockValue || 1));
              const pct = Math.round((cat.stockValue / maxCatVal) * 100);
              return (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '5px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{cat._id}</span>
                    <span className="font-mono" style={{ color: 'var(--text-muted)' }}>
                      ${(cat.stockValue || 0).toLocaleString()} ({cat.count} SKUs)
                    </span>
                  </div>
                  <div style={{ height: '7px', background: 'var(--bg-input)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${pct}%`,
                      height: '100%',
                      background: idx % 2 === 0 ? 'linear-gradient(90deg, #6366f1, #818cf8)' : 'linear-gradient(90deg, #06b6d4, #38bdf8)',
                      borderRadius: '4px',
                      transition: 'width 0.5s ease'
                    }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Section: Top Best Selling Products & Recent Orders */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '20px' }}>
        {/* Top 5 Best Sellers */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
            Top Performing SKUs
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            By sales volume and revenue
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {topProducts.length === 0 ? (
              <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>No orders placed yet.</div>
            ) : (
              topProducts.map((p, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  background: 'var(--bg-input)',
                  borderRadius: 'var(--radius-md)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: idx === 0 ? '#f59e0b' : 'rgba(255, 255, 255, 0.1)',
                      color: idx === 0 ? '#000' : '#fff',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      #{idx + 1}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-dim)' }} className="font-mono">
                        {p.sku}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399' }} className="font-mono">
                      ${(p.totalRevenue || 0).toFixed(2)}
                    </div>
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                      {p.totalQuantity} sold
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Orders Stream */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>
                Recent Order Fulfillment
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Latest customer order pipeline
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('orders')}
              className="btn btn-secondary btn-sm"
            >
              All Orders →
            </button>
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-dim)' }}>
                      No recent orders found.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((ord) => (
                    <tr key={ord._id}>
                      <td className="font-mono" style={{ fontWeight: 600, color: '#818cf8' }}>
                        {ord.orderNumber}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{ord.customer?.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{ord.customer?.email}</div>
                      </td>
                      <td className="font-mono" style={{ fontWeight: 700 }}>
                        ${(ord.totalAmount || 0).toFixed(2)}
                      </td>
                      <td>
                        <span className={`badge badge-${(ord.orderStatus || '').toLowerCase()}`}>
                          {ord.orderStatus}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => onViewInvoice(ord)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          title="View Invoice"
                        >
                          <FileText size={14} />
                          <span>Invoice</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
