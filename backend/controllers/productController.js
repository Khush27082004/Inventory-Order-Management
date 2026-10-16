import Product from '../models/Product.js';
import StockMovement from '../models/StockMovement.js';

// @desc    Get all products with searching, filtering, sorting, pagination
// @route   GET /api/products
// @access  Private
export const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      status,
      minPrice,
      maxPrice,
      sort = 'newest',
      page = 1,
      limit = 50
    } = req.query;

    const query = {};

    // Search by name, SKU, or category
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { sku: searchRegex },
        { category: searchRegex },
        { barcode: searchRegex }
      ];
    }

    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Filter by status (in_stock, low_stock, out_of_stock)
    if (status && status !== 'all') {
      query.status = status;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Sorting options
    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'stock_asc') sortOption = { stockQuantity: 1 };
    else if (sort === 'stock_desc') sortOption = { stockQuantity: -1 };
    else if (sort === 'name_asc') sortOption = { name: 1 };
    else if (sort === 'name_desc') sortOption = { name: -1 };

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Private
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Retrieve recent stock movements for this product
    const movements = await StockMovement.find({ product: product._id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        ...product.toObject(),
        recentMovements: movements
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Private (admin or manager)
export const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      sku,
      category,
      price,
      costPrice,
      stockQuantity,
      minStockThreshold,
      unit,
      description,
      imageUrl,
      barcode
    } = req.body;

    if (!name || !sku || !category || price === undefined || costPrice === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Name, SKU, category, price, and cost price are required'
      });
    }

    // Check SKU collision
    const existingSku = await Product.findOne({ sku: sku.trim().toUpperCase() });
    if (existingSku) {
      return res.status(400).json({
        success: false,
        message: `Product with SKU "${sku.toUpperCase()}" already exists`
      });
    }

    const initialStock = Number(stockQuantity) || 0;
    const threshold = Number(minStockThreshold) !== undefined ? Number(minStockThreshold) : 5;

    let computedStatus = 'in_stock';
    if (initialStock <= 0) computedStatus = 'out_of_stock';
    else if (initialStock <= threshold) computedStatus = 'low_stock';

    const product = await Product.create({
      name: name.trim(),
      sku: sku.trim().toUpperCase(),
      category: category.trim(),
      price: Number(price),
      costPrice: Number(costPrice),
      stockQuantity: initialStock,
      minStockThreshold: threshold,
      unit: unit || 'pcs',
      description: description || '',
      imageUrl: imageUrl || '',
      barcode: barcode || '',
      status: computedStatus
    });

    // Record initial stock movement if quantity > 0
    if (initialStock > 0) {
      await StockMovement.create({
        product: product._id,
        productName: product.name,
        sku: product.sku,
        type: 'INITIAL',
        quantityChanged: initialStock,
        previousStock: 0,
        newStock: initialStock,
        reason: 'Initial stock intake upon product creation',
        performedBy: req.user ? req.user._id : null,
        performedByName: req.user ? req.user.name : 'System Admin'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing product
// @route   PUT /api/products/:id
// @access  Private (admin or manager)
export const updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const {
      name,
      sku,
      category,
      price,
      costPrice,
      minStockThreshold,
      unit,
      description,
      imageUrl,
      barcode
    } = req.body;

    // If SKU changed, check uniqueness
    if (sku && sku.trim().toUpperCase() !== product.sku) {
      const existingSku = await Product.findOne({ sku: sku.trim().toUpperCase() });
      if (existingSku) {
        return res.status(400).json({
          success: false,
          message: `Product with SKU "${sku.toUpperCase()}" already exists`
        });
      }
      product.sku = sku.trim().toUpperCase();
    }

    if (name) product.name = name.trim();
    if (category) product.category = category.trim();
    if (price !== undefined) product.price = Number(price);
    if (costPrice !== undefined) product.costPrice = Number(costPrice);
    if (minStockThreshold !== undefined) product.minStockThreshold = Number(minStockThreshold);
    if (unit) product.unit = unit.trim();
    if (description !== undefined) product.description = description.trim();
    if (imageUrl !== undefined) product.imageUrl = imageUrl.trim();
    if (barcode !== undefined) product.barcode = barcode.trim();

    // Recompute status based on updated threshold
    if (product.stockQuantity <= 0) {
      product.status = 'out_of_stock';
    } else if (product.stockQuantity <= product.minStockThreshold) {
      product.status = 'low_stock';
    } else {
      product.status = 'in_stock';
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (admin)
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: `Product "${product.name}" deleted successfully`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all distinct categories with product counts
// @route   GET /api/products/categories
// @access  Private
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalStock: { $sum: '$stockQuantity' }
        }
      },
      {
        $project: {
          name: '$_id',
          count: 1,
          totalStock: 1,
          _id: 0
        }
      },
      { $sort: { name: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};
