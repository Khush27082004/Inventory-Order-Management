import React from 'react';
import {
  LayoutDashboard,
  Boxes,
  Layers,
  ShoppingCart,
  History,
  AlertTriangle,
  PlusCircle,
  TrendingUp,
  Database
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, counts = {}, onNewOrder, onNewProduct }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Boxes, badge: counts.products },
    {
      id: 'inventory',
      label: 'Inventory & Stock',
      icon: Layers,
      alertBadge: counts.lowStock > 0 ? counts.lowStock : null
    },
    { id: 'orders', label: 'Customer Orders', icon: ShoppingCart, badge: counts.orders },
    { id: 'movements', label: 'Stock Movements', icon: History }
  ];

  return (
    <aside style={{
      width: '260px',
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '24px 16px',
      height: 'calc(100vh - 70px)',
      position: 'sticky',
      top: '70px'
    }}>
      <div>
        {/* Quick Action Button */}
        <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={onNewOrder}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <PlusCircle size={18} />
            <span>Create New Order</span>
          </button>
        </div>

        {/* Navigation list */}
        <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.08em', padding: '0 12px 10px 12px' }}>
          Management Modules
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '11px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: isActive ? 'var(--primary-light)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--text-muted)',
                  border: isActive ? '1px solid var(--border-highlight)' : '1px solid transparent',
                  cursor: 'pointer',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.875rem',
                  transition: 'all 0.15s ease',
                  textAlign: 'left',
                  width: '100%'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                    e.currentTarget.style.color = '#fff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-muted)';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Icon
                    size={19}
                    color={isActive ? '#818cf8' : 'currentColor'}
                    style={{ flexShrink: 0 }}
                  />
                  <span>{item.label}</span>
                </div>

                {item.alertBadge ? (
                  <span style={{
                    background: '#f59e0b',
                    color: '#000',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    padding: '2px 7px',
                    borderRadius: '10px'
                  }}>
                    {item.alertBadge} alert
                  </span>
                ) : item.badge !== undefined && item.badge !== null ? (
                  <span style={{
                    background: isActive ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255, 255, 255, 0.06)',
                    color: isActive ? '#c7d2fe' : 'var(--text-muted)',
                    fontSize: '0.75rem',
                    padding: '2px 8px',
                    borderRadius: '10px'
                  }}>
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Database & System Info Box */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-md)',
        padding: '14px',
        border: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Database size={16} color="#10b981" />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>
            Database Storage
          </span>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', lineHeight: 1.4, margin: 0 }}>
          MongoDB Cluster active with strict validation and ACID-compliant stock logic.
        </p>
      </div>
    </aside>
  );
}
