import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide product name'],
      trim: true,
      maxlength: [120, 'Name cannot exceed 120 characters']
    },
    sku: {
      type: String,
      required: [true, 'Please provide a unique SKU'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true
    },
    category: {
      type: String,
      required: [true, 'Please specify category'],
      trim: true,
      index: true
    },
    price: {
      type: Number,
      required: [true, 'Please specify selling price'],
      min: [0, 'Price must be positive or zero']
    },
    costPrice: {
      type: Number,
      required: [true, 'Please specify cost price'],
      min: [0, 'Cost price must be positive or zero']
    },
    stockQuantity: {
      type: Number,
      required: [true, 'Please specify stock quantity'],
      min: [0, 'Stock quantity cannot be negative'],
      default: 0
    },
    minStockThreshold: {
      type: Number,
      default: 5,
      min: [0, 'Threshold cannot be negative']
    },
    unit: {
      type: String,
      default: 'pcs',
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    imageUrl: {
      type: String,
      default: ''
    },
    barcode: {
      type: String,
      default: '',
      trim: true
    },
    status: {
      type: String,
      enum: ['in_stock', 'low_stock', 'out_of_stock'],
      default: 'in_stock',
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Pre-save hook to compute status automatically
productSchema.pre('save', function (next) {
  if (this.stockQuantity <= 0) {
    this.status = 'out_of_stock';
  } else if (this.stockQuantity <= this.minStockThreshold) {
    this.status = 'low_stock';
  } else {
    this.status = 'in_stock';
  }
  next();
});

// Text index for search functionality
productSchema.index({ name: 'text', sku: 'text', category: 'text' });

const Product = mongoose.model('Product', productSchema);
export default Product;
