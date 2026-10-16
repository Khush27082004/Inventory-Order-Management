import React from 'react';
import { Package, LogOut, ShieldCheck, UserCheck, Bell, Activity } from 'lucide-react';

export default function Navbar({ activeTab, user, onLogout, onOpenAlerts, alertCount }) {
  const getTabTitle = (tab) => {
    switch (tab) {
      case 'dashboard': return 'Executive Dashboard & Overview';
      case 'products': return 'Product Catalog & Pricing';
      case 'inventory': return 'Stock Operations & Valuation';
      case 'orders': return 'Customer Order Management';
      case 'movements': return 'Stock Movement Audit History';
      default: return 'Inventory Management';
    }
  };

  return (
    <header style={{
      height: '70px',
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(10, 14, 23, 0.95)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      position: 'sticky',
      top: 0,
      zIndex: 40
    }}>
      {/* Left: View Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
          borderRadius: '10px',
          width: '38px',
          height: '38px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)'
        }}>
          <Package size={20} color="#fff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>
              CoreStock
            </span>
            <span style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: '4px',
              background: 'linear-gradient(90deg, #6366f1, #a855f7)',
              color: '#fff',
              textTransform: 'uppercase'
            }}>
              Enterprise
            </span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {getTabTitle(activeTab)}
          </div>
        </div>
      </div>

      {/* Right: Status Pill, Alerts, User Profile, Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Backend Connectivity Status */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          borderRadius: '20px',
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          fontSize: '0.75rem',
          color: '#34d399',
          fontWeight: 600
        }}>
          <span className="pulse-dot" style={{ backgroundColor: '#10b981' }}></span>
          <span>API Connected (Live)</span>
        </div>

        {/* Low Stock Alerts Notification Bell */}
        {alertCount > 0 && (
          <button
            onClick={onOpenAlerts}
            className="btn btn-secondary btn-icon"
            style={{ position: 'relative' }}
            title={`${alertCount} low/out of stock items`}
          >
            <Bell size={18} color="#f59e0b" />
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: '#f43f5e',
              color: '#fff',
              fontSize: '0.7rem',
              fontWeight: 700,
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid var(--bg-primary)'
            }}>
              {alertCount}
            </span>
          </button>
        )}

        {/* User Badge */}
        {user ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '4px 8px 4px 12px',
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-main)' }}>
                {user.name}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2px' }}>
                <span className="badge badge-role">
                  {user.role}
                </span>
              </div>
            </div>
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.9rem'
              }}>
                {user.name.charAt(0)}
              </div>
            )}
            <button
              onClick={onLogout}
              className="btn btn-secondary btn-icon btn-sm"
              style={{ marginLeft: '4px', width: '30px', height: '30px' }}
              title="Logout"
            >
              <LogOut size={15} color="#94a3b8" />
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
