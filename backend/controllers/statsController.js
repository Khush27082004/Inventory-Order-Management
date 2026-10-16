import Order from '../models/Order.js';
import Product from '../models/Product.js';
import StockMovement from '../models/StockMovement.js';

// @desc    Get comprehensive business analytics and dashboard statistics
// @route   GET /api/stats/dashboard
// @access  Private
export const getDashboardStats = async (req, res, next) => {
  try {
    // 1. Order and Revenue Aggregations (excluding cancelled orders)
    const revenueAgg = await Order.aggregate([
      {
        $facet: {
          totalSales: [
            { $match: { orderStatus: { $ne: 'Cancelled' } } },
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: '$totalAmount' },
                orderCount: { $sum: 1 },
                avgOrderValue: { $avg: '$totalAmount' }
              }
            }
          ],
          byStatus: [
            {
              $group: {
                _id: '$orderStatus',
                count: { $sum: 1 },
                amount: { $sum: '$totalAmount' }
              }
            }
          ],
          byPayment: [
            {
              $group: {
                _id: '$paymentStatus',
                count: { $sum: 1 },
                amount: { $sum: '$totalAmount' }
              }
            }
          ]
        }
      }
    ]);

    const salesSummary = revenueAgg[0]?.totalSales[0] || {
      totalRevenue: 0,
      orderCount: 0,
      avgOrderValue: 0
    };

    // 2. Product Inventory Aggregations
    const productStats = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalUnits: { $sum: '$stockQuantity' },
          totalCostValue: { $sum: { $multiply: ['$stockQuantity', '$costPrice'] } },
          totalRetailValue: { $sum: { $multiply: ['$stockQuantity', '$price'] } },
          lowStockCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: ['$stockQuantity', 0] },
                    { $lte: ['$stockQuantity', '$minStockThreshold'] }
                  ]
                },
                1,
                0
              ]
            }
          },
          outOfStockCount: {
            $sum: {
              $cond: [{ $lte: ['$stockQuantity', 0] }, 1, 0]
            }
          }
        }
      }
    ]);

    const inventorySummary = productStats[0] || {
      totalProducts: 0,
      totalUnits: 0,
      totalCostValue: 0,
      totalRetailValue: 0,
      lowStockCount: 0,
      outOfStockCount: 0
    };

    // 3. Sales Trend for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const salesTrend = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          orderStatus: { $ne: 'Cancelled' }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Fill in missing days so the chart is smooth
    const trendMap = {};
    salesTrend.forEach((item) => {
      trendMap[item._id] = item;
    });

    const fullTrends = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().slice(0, 10);
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
      fullTrends.push({
        date: dateKey,
        day: dayLabel,
        revenue: trendMap[dateKey] ? parseFloat(trendMap[dateKey].revenue.toFixed(2)) : 0,
        orders: trendMap[dateKey] ? trendMap[dateKey].orders : 0
      });
    }

    // 4. Top 5 Best Selling Products
    const topProducts = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'Cancelled' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          sku: { $first: '$items.sku' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 }
    ]);

    // 5. Category Breakdown
    const categoryBreakdown = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          stockUnits: { $sum: '$stockQuantity' },
          stockValue: { $sum: { $multiply: ['$stockQuantity', '$price'] } }
        }
      },
      { $sort: { stockValue: -1 } }
    ]);

    // 6. Recent Orders & Recent Movements
    const recentOrders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(5);

    const recentMovements = await StockMovement.find({})
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalRevenue: parseFloat(salesSummary.totalRevenue.toFixed(2)),
          orderCount: salesSummary.orderCount,
          avgOrderValue: parseFloat((salesSummary.avgOrderValue || 0).toFixed(2)),
          totalProducts: inventorySummary.totalProducts,
          totalUnits: inventorySummary.totalUnits,
          totalCostValue: parseFloat(inventorySummary.totalCostValue.toFixed(2)),
          totalRetailValue: parseFloat(inventorySummary.totalRetailValue.toFixed(2)),
          potentialProfit: parseFloat((inventorySummary.totalRetailValue - inventorySummary.totalCostValue).toFixed(2)),
          lowStockCount: inventorySummary.lowStockCount,
          outOfStockCount: inventorySummary.outOfStockCount
        },
        salesTrend: fullTrends,
        topProducts,
        categoryBreakdown,
        ordersByStatus: revenueAgg[0]?.byStatus || [],
        recentOrders,
        recentMovements
      }
    });
  } catch (error) {
    next(error);
  }
};
