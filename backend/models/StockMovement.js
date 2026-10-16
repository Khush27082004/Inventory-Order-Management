import mongoose from 'mongoose';

const stockMovementSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true
    },
    productName: {
      type: String,
      required: true
    },
    sku: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: [
        'RESTOCK',
        'ORDER_SALE',
        'ORDER_CANCELLED',
        'MANUAL_ADJUSTMENT',
        'DAMAGE',
        'INITIAL'
      ],
      required: true,
      index: true
    },
    quantityChanged: {
      type: Number,
      required: true
    },
    previousStock: {
      type: Number,
      required: true
    },
    newStock: {
      type: Number,
      required: true
    },
    referenceId: {
      type: String,
      default: ''
    },
    reason: {
      type: String,
      default: 'Inventory adjustment'
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    performedByName: {
      type: String,
      default: 'System Admin'
    }
  },
  {
    timestamps: true
  }
);

stockMovementSchema.index({ createdAt: -1 });

const StockMovement = mongoose.model('StockMovement', stockMovementSchema);
export default StockMovement;
