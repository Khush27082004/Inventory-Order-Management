import React, { useState, useEffect } from 'react';
import { api } from './api';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AuthModal from './components/AuthModal';
import DashboardView from './components/DashboardView';
import ProductsView from './components/ProductsView';
import InventoryView from './components/InventoryView';
import OrdersView from './components/OrdersView';
import ProductFormModal from './components/ProductFormModal';
import AdjustStockModal from './components/AdjustStockModal';
import CreateOrderModal from './components/CreateOrderModal';
import InvoiceModal from './components/InvoiceModal';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export default function App() {
  // Authentication State
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [authChecked, setAuthChecked] = useState(false);

  // Active View Tab: 'dashboard' | 'products' | 'inventory' | 'orders' | 'movements'
  const [activeTab, setActiveTab] = useState('dashboard');

  // Main Data Entities
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [movements, setMovements] = useState([]);
  const [overview, setOverview] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // Filter States for Products & Orders
  const [productSearch, setProductSearch] = useState('');
  const [productCategory, setProductCategory] = useState('all');
  const [productStatus, setProductStatus] = useState('all');

  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  // Modals
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [adjustTargetProduct, setAdjustTargetProduct] = useState(null);

  const [createOrderModalOpen, setCreateOrderModalOpen] = useState(false);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

  // Toast Notification System
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initial Auth Check
  useEffect(() => {
    const verifyUser = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await api.auth.getMe();
          setUser(res.user);
          setToken(storedToken);
        } catch (err) {
          console.warn('Session expired or invalid token');
          localStorage.removeItem('token');
          setUser(null);
          setToken('');
        }
      }
      setAuthChecked(true);
    };
    verifyUser();
  }, []);

  // Fetch all core datasets
  const fetchAllData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [
        productsRes,
        categoriesRes,
        ordersRes,
        movementsRes,
        overviewRes,
        alertsRes,
        statsRes
      ] = await Promise.all([
        api.products.getAll({
          search: productSearch,
          category: productCategory,
          status: productStatus
        }),
        api.products.getCategories(),
        api.orders.getAll({
          search: orderSearch,
          orderStatus: orderStatusFilter
        }),
        api.inventory.getMovements({ limit: 100 }),
        api.inventory.getOverview(),
        api.inventory.getAlerts(),
        api.stats.getDashboard()
      ]);

      setProducts(productsRes.data || []);
      setCategories(categoriesRes.data || []);
      setOrders(ordersRes.data || []);
      setMovements(movementsRes.data || []);
      setOverview(overviewRes.data || {});
      setAlerts(alertsRes.data || []);
      setStats(statsRes.data || null);
    } catch (err) {
      console.error('Error fetching data:', err);
      addToast(err.message || 'Error loading dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Trigger data fetch on auth or filter changes
  useEffect(() => {
    if (user && token) {
      fetchAllData();
    }
  }, [user, token, productSearch, productCategory, productStatus, orderSearch, orderStatusFilter]);

  // Handle Login Success
  const handleLoginSuccess = (loggedInUser, userToken) => {
    setUser(loggedInUser);
    setToken(userToken);
    addToast(`Welcome back, ${loggedInUser.name}!`, 'success');
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken('');
    addToast('You have been logged out securely.', 'info');
  };

  // Product Actions
  const handleSaveProduct = async (productData, id) => {
    try {
      if (id) {
        await api.products.update(id, productData);
        addToast(`Product "${productData.name}" updated successfully.`);
      } else {
        await api.products.create(productData);
        addToast(`New product "${productData.name}" added to inventory.`);
      }
      fetchAllData();
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteProduct = async (product) => {
    if (window.confirm(`Are you sure you want to delete product "${product.name}" (${product.sku})?`)) {
      try {
        await api.products.delete(product._id);
        addToast(`Product "${product.name}" deleted.`);
        fetchAllData();
      } catch (err) {
        addToast(err.message || 'Failed to delete product', 'error');
      }
    }
  };

  // Stock Adjustment Action
  const handleSaveAdjustment = async (adjustmentData) => {
    try {
      const res = await api.inventory.adjustStock(adjustmentData);
      addToast(res.message || 'Stock successfully adjusted.', 'success');
      fetchAllData();
    } catch (err) {
      throw err;
    }
  };

  // Order Actions
  const handleCreateOrder = async (orderData) => {
    try {
      const res = await api.orders.create(orderData);
      addToast(`Order ${res.data.orderNumber} successfully placed!`, 'success');
      fetchAllData();
      // Open invoice preview automatically
      setSelectedInvoiceOrder(res.data);
    } catch (err) {
      throw err;
    }
  };

  const handleUpdateOrderStatus = async (order, newStatus) => {
    if (newStatus === 'Cancelled') {
      const confirmCancel = window.confirm(
        `Are you sure you want to cancel Order ${order.orderNumber}? This will automatically return all ${order.items.length} line items back to available inventory.`
      );
      if (!confirmCancel) return;
    }

    try {
      const res = await api.orders.updateStatus(order._id, { orderStatus: newStatus });
      addToast(res.message || `Order status updated to ${newStatus}`, 'success');
      fetchAllData();
    } catch (err) {
      addToast(err.message || 'Failed to update order status', 'error');
    }
  };

  // If initial auth is not resolved yet
  if (!authChecked) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        color: 'var(--text-muted)'
      }}>
        Loading CoreStock System...
      </div>
    );
  }

  // If unauthenticated, show Auth Modal
  if (!user || !token) {
    return <AuthModal onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        user={user}
        onLogout={handleLogout}
        alertCount={alerts.length}
        onOpenAlerts={() => setActiveTab('inventory')}
      />

      {/* Main Body with Sidebar + Workspace View */}
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          counts={{
            products: products.length,
            lowStock: alerts.length,
            orders: orders.length
          }}
          onNewOrder={() => setCreateOrderModalOpen(true)}
          onNewProduct={() => {
            setEditingProduct(null);
            setProductModalOpen(true);
          }}
        />

        <main style={{
          flex: 1,
          padding: '32px 36px',
          maxWidth: '1500px',
          overflowY: 'auto',
          minHeight: 'calc(100vh - 70px)'
        }}>
          {activeTab === 'dashboard' && (
            <DashboardView
              stats={stats}
              onNewOrder={() => setCreateOrderModalOpen(true)}
              onNewProduct={() => {
                setEditingProduct(null);
                setProductModalOpen(true);
              }}
              onAdjustStock={(prod) => {
                setAdjustTargetProduct(prod || null);
                setAdjustModalOpen(true);
              }}
              onViewInvoice={(ord) => setSelectedInvoiceOrder(ord)}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'products' && (
            <ProductsView
              products={products}
              categories={categories}
              loading={loading}
              searchTerm={productSearch}
              setSearchTerm={setProductSearch}
              selectedCategory={productCategory}
              setSelectedCategory={setProductCategory}
              selectedStatus={productStatus}
              setSelectedStatus={setProductStatus}
              onOpenAddModal={() => {
                setEditingProduct(null);
                setProductModalOpen(true);
              }}
              onOpenEditModal={(prod) => {
                setEditingProduct(prod);
                setProductModalOpen(true);
              }}
              onOpenAdjustModal={(prod) => {
                setAdjustTargetProduct(prod);
                setAdjustModalOpen(true);
              }}
              onDeleteProduct={handleDeleteProduct}
            />
          )}

          {(activeTab === 'inventory' || activeTab === 'movements') && (
            <InventoryView
              overview={overview}
              alerts={alerts}
              movements={movements}
              onOpenAdjustModal={(prod) => {
                setAdjustTargetProduct(prod || null);
                setAdjustModalOpen(true);
              }}
              loading={loading}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersView
              orders={orders}
              loading={loading}
              searchTerm={orderSearch}
              setSearchTerm={setOrderSearch}
              statusFilter={orderStatusFilter}
              setStatusFilter={setOrderStatusFilter}
              onOpenCreateOrder={() => setCreateOrderModalOpen(true)}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onViewInvoice={(ord) => setSelectedInvoiceOrder(ord)}
            />
          )}
        </main>
      </div>

      {/* Product Form Modal (Add / Edit) */}
      <ProductFormModal
        isOpen={productModalOpen}
        onClose={() => {
          setProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
        editingProduct={editingProduct}
      />

      {/* Stock Adjustment Modal */}
      <AdjustStockModal
        isOpen={adjustModalOpen}
        onClose={() => {
          setAdjustModalOpen(false);
          setAdjustTargetProduct(null);
        }}
        onSave={handleSaveAdjustment}
        products={products}
        initialProduct={adjustTargetProduct}
      />

      {/* Create Customer Order Modal */}
      <CreateOrderModal
        isOpen={createOrderModalOpen}
        onClose={() => setCreateOrderModalOpen(false)}
        onSave={handleCreateOrder}
        products={products}
      />

      {/* Printable Invoice Modal */}
      <InvoiceModal
        order={selectedInvoiceOrder}
        isOpen={Boolean(selectedInvoiceOrder)}
        onClose={() => setSelectedInvoiceOrder(null)}
      />

      {/* Toast Notification Container */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            {toast.type === 'success' && <CheckCircle size={18} color="#10b981" />}
            {toast.type === 'error' && <AlertCircle size={18} color="#f43f5e" />}
            {toast.type === 'info' && <Info size={18} color="#06b6d4" />}
            <span style={{ fontSize: '0.875rem', fontWeight: 500, flex: 1 }}>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 0 }}
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
