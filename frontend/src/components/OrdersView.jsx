import React, { useState } from 'react';
import {
  ShoppingCart,
  Search,
  Filter,
  PlusCircle,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  CreditCard,
  DollarSign
} from 'lucide-react';

export default function OrdersView({
  orders = [],
  loading,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  onOpenCreateOrder,
  onUpdateOrderStatus,
  onViewInvoice
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
            Customer Orders & Fulfillment
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Process customer orders, verify stock allocations, update dispatch statuses, and issue invoices.
          </p>
        </div>

        <button onClick={onOpenCreateOrder} className="btn btn-primary">
          <PlusCircle size={18} />
          <span>Create New Order</span>
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
          <div style={{ position: 'relative', flex: '1', minWidth: '260px' }}>
            <Search size={17} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input
              type="text"
              placeholder="Search by order number (ORD-...), customer name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '38px', height: '40px' }}
            />
          </div>

          {/* Status filter */}
          <div style={{ minWidth: '180px' }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select"
              style={{ height: '40px' }}
            >
              <option value="all">All Order Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading orders...
        </div>
      ) : orders.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
          <ShoppingCart size={48} color="var(--text-dim)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ color: '#fff', marginBottom: '8px' }}>No Customer Orders Found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '16px' }}>
            No orders match your filter criteria or no orders have been created yet.
          </p>
          <button onClick={onOpenCreateOrder} className="btn btn-primary btn-sm">
            Create First Order
          </button>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="data-table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order Details</th>
                  <th>Customer Information</th>
                  <th>Order Items</th>
                  <th>Total Amount</th>
                  <th>Payment</th>
                  <th>Fulfillment Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((ord) => {
                  const totalItemsCount = ord.items?.reduce((sum, it) => sum + (it.quantity || 0), 0) || 0;
                  return (
                    <tr key={ord._id}>
                      <td>
                        <div className="font-mono" style={{ fontWeight: 700, color: '#818cf8', fontSize: '0.9rem' }}>
                          {ord.orderNumber}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                          {new Date(ord.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 600, color: '#fff' }}>{ord.customer?.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ord.customer?.email}</div>
                        {ord.customer?.phone && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                            {ord.customer?.phone}
                          </div>
                        )}
                      </td>

                      <td>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                          {totalItemsCount} {totalItemsCount === 1 ? 'unit' : 'units'}
                        </div>
                        <div style={{ fontSize: '0.725rem', color: 'var(--text-dim)', maxWidth: '180px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {ord.items?.map((it) => `${it.quantity}x ${it.name}`).join(', ')}
                        </div>
                      </td>

                      <td>
                        <div className="font-mono" style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>
                          ${(ord.totalAmount || 0).toFixed(2)}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                          Tax: ${(ord.taxAmount || 0).toFixed(2)}
                        </div>
                      </td>

                      <td>
                        <span className={`badge badge-${(ord.paymentStatus || '').toLowerCase()}`}>
                          {ord.paymentStatus}
                        </span>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                          {ord.paymentMethod}
                        </div>
                      </td>

                      <td>
                        {/* Status selector with live change */}
                        <select
                          value={ord.orderStatus}
                          onChange={(e) => onUpdateOrderStatus(ord, e.target.value)}
                          className="form-select font-mono"
                          style={{
                            padding: '4px 8px',
                            height: '32px',
                            fontSize: '0.775rem',
                            fontWeight: 600,
                            background:
                              ord.orderStatus === 'Delivered'
                                ? 'rgba(16, 185, 129, 0.15)'
                                : ord.orderStatus === 'Cancelled'
                                ? 'rgba(244, 63, 94, 0.15)'
                                : 'var(--bg-input)',
                            color:
                              ord.orderStatus === 'Delivered'
                                ? '#34d399'
                                : ord.orderStatus === 'Cancelled'
                                ? '#fb7185'
                                : 'var(--text-main)',
                            borderColor:
                              ord.orderStatus === 'Delivered'
                                ? 'rgba(16, 185, 129, 0.3)'
                                : ord.orderStatus === 'Cancelled'
                                ? 'rgba(244, 63, 94, 0.3)'
                                : 'var(--border-subtle)'
                          }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled (Restores Stock)</option>
                        </select>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => onViewInvoice(ord)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '6px 12px', fontSize: '0.775rem' }}
                          title="Generate & Print Invoice"
                        >
                          <FileText size={15} />
                          <span>Invoice</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
