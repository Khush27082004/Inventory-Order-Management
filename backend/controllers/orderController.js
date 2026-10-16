import Order from '../models/Order.js';
import Product from '../models/Product.js';
import StockMovement from '../models/StockMovement.js';

// Helper to generate unique order number
const generateOrderNumber = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${dateStr}-${randomSuffix}`;
};

// @desc    Get all orders with filter and search
// @route   GET /api/orders
// @access  Private
export const getOrders = async (req, res, next) => {
  try {
    const {
      search,
      orderStatus,
      paymentStatus,
      page = 1,
      limit = 50,
      sort = 'newest'
    } = req.query;

    const query = {};

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { orderNumber: searchRegex },
        { 'customer.name': searchRegex },
        { 'customer.email': searchRegex },
        { 'customer.phone': searchRegex }
      ];
    }

    if (orderStatus && orderStatus !== 'all') {
      query.orderStatus = orderStatus;
    }

    if (paymentStatus && paymentStatus !== 'all') {
      query.paymentStatus = paymentStatus;
    }

    const sortOption = sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new customer order with atomic stock validation & decrement
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res, next) => {
  try {
    const {
      customer,
      items,
      paymentMethod = 'Credit Card',
      paymentStatus = 'Pending',
      taxRate = 0.08,
      discountAmount = 0,
      notes = ''
    } = req.body;

    // 1. Basic validation
    if (!customer || !customer.name || !customer.email) {
      return res.status(400).json({
        success: false,
        message: 'Customer name and email are required'
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one product item'
      });
    }

    // 2. Validate product availability and stock
    const validatedItems = [];
    let calculatedSubtotal = 0;
    const productDocsToUpdate = [];

    for (const item of items) {
      const quantity = Number(item.quantity);
      if (!quantity || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for item with ID: ${item.productId || item.product}`
        });
      }

      const prodId = item.productId || item.product;
      const product = await Product.findById(prodId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found for ID: ${prodId}`
        });
      }

      if (product.stockQuantity < quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}" (SKU: ${product.sku}). Requested: ${quantity}, Available: ${product.stockQuantity}`
        });
      }

      const unitPrice = Number(item.unitPrice !== undefined ? item.unitPrice : product.price);
      const subtotal = parseFloat((unitPrice * quantity).toFixed(2));
      calculatedSubtotal += subtotal;

      validatedItems.push({
        product: product._id,
        name: product.name,
        sku: product.sku,
        quantity,
        unitPrice,
        subtotal
      });

      productDocsToUpdate.push({
        product,
        quantityDeducted: quantity
      });
    }

    // 3. Compute financial amounts
    const validTaxRate = Number(taxRate) >= 0 ? Number(taxRate) : 0.08;
    const validDiscount = Number(discountAmount) >= 0 ? Number(discountAmount) : 0;
    const taxAmount = parseFloat((calculatedSubtotal * validTaxRate).toFixed(2));
    const totalAmount = parseFloat(Math.max(0, calculatedSubtotal + taxAmount - validDiscount).toFixed(2));

    const orderNumber = generateOrderNumber();

    // 4. Create Order
    const order = await Order.create({
      orderNumber,
      customer: {
        name: customer.name.trim(),
        email: customer.email.trim().toLowerCase(),
        phone: customer.phone ? customer.phone.trim() : '',
        address: customer.address || {
          street: '',
          city: '',
          state: '',
          zip: '',
          country: 'USA'
        }
      },
      items: validatedItems,
      subtotal: calculatedSubtotal,
      taxRate: validTaxRate,
      taxAmount,
      discountAmount: validDiscount,
      totalAmount,
      paymentMethod,
      paymentStatus,
      orderStatus: 'Pending',
      notes,
      createdBy: req.user ? req.user._id : null
    });

    // 5. Deduct stock and record StockMovement transactions
    for (const update of productDocsToUpdate) {
      const p = update.product;
      const prevStock = p.stockQuantity;
      const nextStock = prevStock - update.quantityDeducted;

      p.stockQuantity = nextStock;
      if (nextStock <= 0) {
        p.status = 'out_of_stock';
      } else if (nextStock <= p.minStockThreshold) {
        p.status = 'low_stock';
      } else {
        p.status = 'in_stock';
      }
      await p.save();

      await StockMovement.create({
        product: p._id,
        productName: p.name,
        sku: p.sku,
        type: 'ORDER_SALE',
        quantityChanged: -update.quantityDeducted,
        previousStock: prevStock,
        newStock: nextStock,
        referenceId: order.orderNumber,
        reason: `Deducted for Order ${order.orderNumber}`,
        performedBy: req.user ? req.user._id : null,
        performedByName: req.user ? req.user.name : 'System'
      });
    }

    res.status(201).json({
      success: true,
      message: `Order ${order.orderNumber} successfully created`,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status or payment status (with automatic stock restitution on cancellation)
// @route   PUT /api/orders/:id/status
// @access  Private
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus, paymentStatus, notes } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const previousStatus = order.orderStatus;

    // Handle cancellation: restore stock
    if (orderStatus && orderStatus === 'Cancelled' && previousStatus !== 'Cancelled') {
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          const prevStock = product.stockQuantity;
          const nextStock = prevStock + item.quantity;
          product.stockQuantity = nextStock;

          if (nextStock <= 0) {
            product.status = 'out_of_stock';
          } else if (nextStock <= product.minStockThreshold) {
            product.status = 'low_stock';
          } else {
            product.status = 'in_stock';
          }
          await product.save();

          await StockMovement.create({
            product: product._id,
            productName: product.name,
            sku: product.sku,
            type: 'ORDER_CANCELLED',
            quantityChanged: item.quantity,
            previousStock: prevStock,
            newStock: nextStock,
            referenceId: order.orderNumber,
            reason: `Restored stock due to cancellation of Order ${order.orderNumber}`,
            performedBy: req.user ? req.user._id : null,
            performedByName: req.user ? req.user.name : 'System Admin'
          });
        }
      }
      order.orderStatus = 'Cancelled';
    } else if (orderStatus) {
      order.orderStatus = orderStatus;
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    if (notes !== undefined) {
      order.notes = notes;
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: `Order ${order.orderNumber} status updated to ${order.orderStatus}`,
      data: order
    });
  } catch (error) {
    next(error);
  }
};
