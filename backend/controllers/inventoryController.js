import Product from '../models/Product.js';
import StockMovement from '../models/StockMovement.js';

// @desc    Get high-level inventory & stock overview metrics
// @route   GET /api/inventory/overview
// @access  Private
export const getStockOverview = async (req, res, next) => {
  try {
    const products = await Product.find({});

    let totalProducts = products.length;
    let totalStockUnits = 0;
    let totalInventoryCost = 0;
    let totalRetailValue = 0;
    let inStockCount = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    products.forEach((p) => {
      totalStockUnits += p.stockQuantity;
      totalInventoryCost += p.stockQuantity * p.costPrice;
      totalRetailValue += p.stockQuantity * p.price;

      if (p.stockQuantity <= 0) {
        outOfStockCount++;
      } else if (p.stockQuantity <= p.minStockThreshold) {
        lowStockCount++;
      } else {
        inStockCount++;
      }
    });

    const potentialProfit = totalRetailValue - totalInventoryCost;
    const margin = totalRetailValue > 0 ? ((potentialProfit / totalRetailValue) * 100).toFixed(1) : 0;

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        totalStockUnits,
        totalInventoryCost: parseFloat(totalInventoryCost.toFixed(2)),
        totalRetailValue: parseFloat(totalRetailValue.toFixed(2)),
        potentialProfit: parseFloat(potentialProfit.toFixed(2)),
        marginPercentage: parseFloat(margin),
        inStockCount,
        lowStockCount,
        outOfStockCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Perform manual stock adjustments (Restock, Damage, Correction)
// @route   POST /api/inventory/adjust
// @access  Private (admin or manager)
export const adjustStock = async (req, res, next) => {
  try {
    const { productId, type, quantity, reason } = req.body;

    if (!productId || !type || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Product ID, adjustment type, and quantity are required'
      });
    }

    const numQty = Number(quantity);
    if (isNaN(numQty) || numQty <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Adjustment quantity must be a positive number'
      });
    }

    const validTypes = ['RESTOCK', 'DAMAGE', 'MANUAL_ADJUSTMENT'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Adjustment type must be one of: ${validTypes.join(', ')}`
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const previousStock = product.stockQuantity;
    let newStock = previousStock;
    let quantityChanged = 0;

    if (type === 'RESTOCK') {
      newStock = previousStock + numQty;
      quantityChanged = numQty;
    } else if (type === 'DAMAGE') {
      if (previousStock < numQty) {
        return res.status(400).json({
          success: false,
          message: `Cannot record damage of ${numQty} units. Only ${previousStock} units are currently in stock.`
        });
      }
      newStock = previousStock - numQty;
      quantityChanged = -numQty;
    } else if (type === 'MANUAL_ADJUSTMENT') {
      // For manual correction: if reason specifies add or subtract, or if quantity is replacement
      // We treat quantity as the signed or additive/subtractive difference from frontend
      // To keep it standard: if request specifies isDeduction: true, subtract; else add
      if (req.body.isDeduction) {
        if (previousStock < numQty) {
          return res.status(400).json({
            success: false,
            message: `Cannot deduct ${numQty} units. Current stock is ${previousStock}.`
          });
        }
        newStock = previousStock - numQty;
        quantityChanged = -numQty;
      } else {
        newStock = previousStock + numQty;
        quantityChanged = numQty;
      }
    }

    product.stockQuantity = newStock;
    if (newStock <= 0) {
      product.status = 'out_of_stock';
    } else if (newStock <= product.minStockThreshold) {
      product.status = 'low_stock';
    } else {
      product.status = 'in_stock';
    }

    await product.save();

    // Create audit record
    const movement = await StockMovement.create({
      product: product._id,
      productName: product.name,
      sku: product.sku,
      type,
      quantityChanged,
      previousStock,
      newStock,
      reason: reason || `${type} adjustment`,
      performedBy: req.user ? req.user._id : null,
      performedByName: req.user ? req.user.name : 'Staff Member'
    });

    res.status(200).json({
      success: true,
      message: `Stock successfully adjusted for ${product.name}. New stock: ${newStock}`,
      data: {
        product,
        movement
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get audit trail of stock movements
// @route   GET /api/inventory/movements
// @access  Private
export const getStockMovements = async (req, res, next) => {
  try {
    const { productId, type, limit = 50, page = 1 } = req.query;

    const query = {};
    if (productId) query.product = productId;
    if (type && type !== 'all') query.type = type;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const total = await StockMovement.countDocuments(query);
    const movements = await StockMovement.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: movements.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      data: movements
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get low stock and out of stock alerts
// @route   GET /api/inventory/alerts
// @access  Private
export const getLowStockAlerts = async (req, res, next) => {
  try {
    // Find products where stockQuantity <= minStockThreshold
    const alerts = await Product.find({
      $expr: { $lte: ['$stockQuantity', '$minStockThreshold'] }
    }).sort({ stockQuantity: 1 });

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    next(error);
  }
};
