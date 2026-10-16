import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import StockMovement from '../models/StockMovement.js';

dotenv.config();

export const seedData = async () => {
  try {
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log('[Seeder] Database already contains data. Skipping initial seed.');
      return;
    }

    console.log('[Seeder] Seeding initial database with realistic business data...');

    // 1. Create Demo Users
    const adminUser = await User.create({
      name: 'Alexander Wright',
      email: 'admin@inventory.com',
      password: 'admin123',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80'
    });

    const managerUser = await User.create({
      name: 'Elena Rostova',
      email: 'manager@inventory.com',
      password: 'manager123',
      role: 'manager',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80'
    });

    const staffUser = await User.create({
      name: 'David Chen',
      email: 'staff@inventory.com',
      password: 'staff123',
      role: 'staff',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80'
    });

    console.log('[Seeder] Demo users created successfully.');

    // 2. Create Products
    const productsData = [
      {
        name: 'Ergonomic Mesh Office Chair',
        sku: 'FURN-CH-01',
        category: 'Office Furniture',
        price: 189.99,
        costPrice: 95.00,
        stockQuantity: 28,
        minStockThreshold: 8,
        unit: 'pcs',
        description: 'Breathable mesh back with lumbar support, 3D armrests, and synchro-tilt mechanism.',
        imageUrl: 'https://images.unsplash.com/photo-1580481077195-c328a3f8f999?w=300&auto=format&fit=crop&q=80',
        barcode: '890123450001'
      },
      {
        name: 'Wireless Mechanical Keyboard (RGB)',
        sku: 'ELEC-KB-02',
        category: 'Electronics',
        price: 89.50,
        costPrice: 42.00,
        stockQuantity: 42,
        minStockThreshold: 12,
        unit: 'pcs',
        description: 'Compact 75% hot-swappable mechanical keyboard with triple connection modes (2.4G/BT5.0/USB-C).',
        imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&auto=format&fit=crop&q=80',
        barcode: '890123450002'
      },
      {
        name: 'USB-C Multi-Port Hub (8-in-1)',
        sku: 'ELEC-HB-03',
        category: 'Electronics',
        price: 49.99,
        costPrice: 21.00,
        stockQuantity: 5,
        minStockThreshold: 10,
        unit: 'pcs',
        description: '4K HDMI, 100W PD charging, SD/TF card slots, Gigabit Ethernet and 3x USB 3.0 ports.',
        imageUrl: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=300&auto=format&fit=crop&q=80',
        barcode: '890123450003'
      },
      {
        name: 'Ultra-Wide 34-Inch Curved Monitor',
        sku: 'ELEC-MN-04',
        category: 'Electronics',
        price: 449.00,
        costPrice: 280.00,
        stockQuantity: 14,
        minStockThreshold: 4,
        unit: 'pcs',
        description: 'WQHD 3440x1440p 144Hz IPS display with 1900R curvature and HDR400 certified.',
        imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300&auto=format&fit=crop&q=80',
        barcode: '890123450004'
      },
      {
        name: 'Active Noise Cancelling Headphones',
        sku: 'ELEC-HP-05',
        category: 'Electronics',
        price: 139.99,
        costPrice: 65.00,
        stockQuantity: 0,
        minStockThreshold: 6,
        unit: 'pcs',
        description: 'Hybrid ANC with 40-hour battery life, high-res audio certification, and memory foam earcups.',
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80',
        barcode: '890123450005'
      },
      {
        name: 'Adjustable Standing Desk Riser',
        sku: 'FURN-DK-06',
        category: 'Office Furniture',
        price: 219.00,
        costPrice: 115.00,
        stockQuantity: 18,
        minStockThreshold: 5,
        unit: 'pcs',
        description: 'Gas spring pneumatic height adjustable workstation dual-tier surface with keyboard tray.',
        imageUrl: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=300&auto=format&fit=crop&q=80',
        barcode: '890123450006'
      },
      {
        name: 'Thermal Shipping Label Printer',
        sku: 'OFFC-PR-07',
        category: 'Office Supplies',
        price: 169.00,
        costPrice: 89.00,
        stockQuantity: 4,
        minStockThreshold: 8,
        unit: 'pcs',
        description: 'High speed commercial grade direct thermal printer compatible with all major courier platforms.',
        imageUrl: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=300&auto=format&fit=crop&q=80',
        barcode: '890123450007'
      },
      {
        name: 'Fanfold Direct Thermal Labels (2000ct)',
        sku: 'OFFC-LB-08',
        category: 'Office Supplies',
        price: 32.50,
        costPrice: 13.00,
        stockQuantity: 95,
        minStockThreshold: 20,
        unit: 'box',
        description: '4x6 inch standard blank mailing barcodes and shipping labels, smudge-proof adhesive.',
        imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=300&auto=format&fit=crop&q=80',
        barcode: '890123450008'
      },
      {
        name: 'Precision Electronics Tool Kit (64-pc)',
        sku: 'TOOL-TK-09',
        category: 'Tools & Hardware',
        price: 36.99,
        costPrice: 15.50,
        stockQuantity: 34,
        minStockThreshold: 8,
        unit: 'kit',
        description: 'Magnetic driver bit set with ESD-safe tweezers, spudgers, and suction cup for tech repairs.',
        imageUrl: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=300&auto=format&fit=crop&q=80',
        barcode: '890123450009'
      },
      {
        name: 'Organic Cotton Polo Shirt (Navy/M)',
        sku: 'APPR-PL-10',
        category: 'Apparel',
        price: 26.00,
        costPrice: 10.50,
        stockQuantity: 65,
        minStockThreshold: 15,
        unit: 'pcs',
        description: '100% combed ring-spun organic cotton breathable pique polo with reinforced collar.',
        imageUrl: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=300&auto=format&fit=crop&q=80',
        barcode: '890123450010'
      }
    ];

    const createdProducts = [];
    for (const p of productsData) {
      let status = 'in_stock';
      if (p.stockQuantity <= 0) status = 'out_of_stock';
      else if (p.stockQuantity <= p.minStockThreshold) status = 'low_stock';

      const prod = await Product.create({ ...p, status });
      createdProducts.push(prod);

      // Create initial stock movement
      if (prod.stockQuantity > 0) {
        await StockMovement.create({
          product: prod._id,
          productName: prod.name,
          sku: prod.sku,
          type: 'INITIAL',
          quantityChanged: prod.stockQuantity,
          previousStock: 0,
          newStock: prod.stockQuantity,
          reason: 'Initial warehouse intake stock',
          performedBy: adminUser._id,
          performedByName: adminUser.name
        });
      }
    }

    console.log(`[Seeder] Created ${createdProducts.length} catalog products.`);

    // 3. Create Sample Customer Orders spanning the past week
    const customers = [
      {
        name: 'Apex Solutions LLC',
        email: 'procurement@apexsolutions.io',
        phone: '+1 (555) 234-8901',
        address: { street: '100 Tech Blvd Ste 400', city: 'Austin', state: 'TX', zip: '78701', country: 'USA' }
      },
      {
        name: 'Sarah Jenkins',
        email: 'sarah.j@gmail.com',
        phone: '+1 (555) 456-7890',
        address: { street: '742 Evergreen Terrace', city: 'Springfield', state: 'IL', zip: '62704', country: 'USA' }
      },
      {
        name: 'Nexus Logistics Corp',
        email: 'ops@nexuslogistics.com',
        phone: '+1 (555) 876-5432',
        address: { street: '450 Harbor Way', city: 'Seattle', state: 'WA', zip: '98101', country: 'USA' }
      },
      {
        name: 'Marcus Brody',
        email: 'mbrody@archeotech.org',
        phone: '+1 (555) 321-9876',
        address: { street: '12 University Plaza', city: 'Boston', state: 'MA', zip: '02115', country: 'USA' }
      },
      {
        name: 'Horizon Creative Studio',
        email: 'hello@horizonstudio.design',
        phone: '+1 (555) 654-3210',
        address: { street: '88 Creative Row', city: 'San Francisco', state: 'CA', zip: '94107', country: 'USA' }
      }
    ];

    const sampleOrders = [
      {
        daysAgo: 4,
        customer: customers[0],
        items: [
          { prodIndex: 0, qty: 2 }, // Ergonomic chair x2
          { prodIndex: 3, qty: 2 }  // 34" monitor x2
        ],
        paymentMethod: 'Bank Transfer',
        paymentStatus: 'Paid',
        orderStatus: 'Delivered',
        notes: 'Corporate office setup order. Delivered via freight.'
      },
      {
        daysAgo: 3,
        customer: customers[1],
        items: [
          { prodIndex: 1, qty: 1 }, // Mechanical keyboard x1
          { prodIndex: 8, qty: 1 }  // Precision screwdriver x1
        ],
        paymentMethod: 'Credit Card',
        paymentStatus: 'Paid',
        orderStatus: 'Shipped',
        notes: 'Standard residential shipping.'
      },
      {
        daysAgo: 2,
        customer: customers[2],
        items: [
          { prodIndex: 6, qty: 1 }, // Thermal label printer x1
          { prodIndex: 7, qty: 5 }  // Thermal labels x5
        ],
        paymentMethod: 'Credit Card',
        paymentStatus: 'Paid',
        orderStatus: 'Processing',
        notes: 'Priority courier dispatch.'
      },
      {
        daysAgo: 1,
        customer: customers[3],
        items: [
          { prodIndex: 5, qty: 1 }, // Standing desk riser x1
          { prodIndex: 1, qty: 1 }  // Keyboard x1
        ],
        paymentMethod: 'Credit Card',
        paymentStatus: 'Paid',
        orderStatus: 'Pending',
        notes: 'Customer requested signature on delivery.'
      },
      {
        daysAgo: 0,
        customer: customers[4],
        items: [
          { prodIndex: 2, qty: 3 }, // USB-C hub x3
          { prodIndex: 9, qty: 4 }  // Polo shirts x4
        ],
        paymentMethod: 'Credit Card',
        paymentStatus: 'Pending',
        orderStatus: 'Pending',
        notes: 'New design team onboarding package.'
      }
    ];

    for (let i = 0; i < sampleOrders.length; i++) {
      const orderDef = sampleOrders[i];
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - orderDef.daysAgo);

      const dateStr = targetDate.toISOString().slice(0, 10).replace(/-/g, '');
      const orderNumber = `ORD-${dateStr}-100${i + 1}`;

      let subtotal = 0;
      const orderItems = [];

      for (const itemDef of orderDef.items) {
        const prod = createdProducts[itemDef.prodIndex];
        const lineSubtotal = parseFloat((prod.price * itemDef.qty).toFixed(2));
        subtotal += lineSubtotal;

        orderItems.push({
          product: prod._id,
          name: prod.name,
          sku: prod.sku,
          quantity: itemDef.qty,
          unitPrice: prod.price,
          subtotal: lineSubtotal
        });

        // Record stock movement for this order
        await StockMovement.create({
          product: prod._id,
          productName: prod.name,
          sku: prod.sku,
          type: 'ORDER_SALE',
          quantityChanged: -itemDef.qty,
          previousStock: prod.stockQuantity + itemDef.qty,
          newStock: prod.stockQuantity,
          referenceId: orderNumber,
          reason: `Sold via Order ${orderNumber}`,
          performedBy: adminUser._id,
          performedByName: 'Alexander Wright',
          createdAt: targetDate
        });
      }

      const taxAmount = parseFloat((subtotal * 0.08).toFixed(2));
      const totalAmount = parseFloat((subtotal + taxAmount).toFixed(2));

      await Order.create({
        orderNumber,
        customer: orderDef.customer,
        items: orderItems,
        subtotal,
        taxRate: 0.08,
        taxAmount,
        discountAmount: 0,
        totalAmount,
        paymentStatus: orderDef.paymentStatus,
        paymentMethod: orderDef.paymentMethod,
        orderStatus: orderDef.orderStatus,
        notes: orderDef.notes,
        createdBy: adminUser._id,
        createdAt: targetDate,
        updatedAt: targetDate
      });
    }

    console.log(`[Seeder] Successfully seeded ${sampleOrders.length} realistic orders and sales movements.`);
  } catch (error) {
    console.error('[Seeder] Error during seeding:', error.message);
  }
};

// Standalone runner
if (process.argv[1]?.endsWith('seeder.js')) {
  (async () => {
    const { connectDB, closeDB } = await import('../config/db.js');
    await connectDB();
    await seedData();
    console.log('[Seeder] Finished. Exiting.');
    process.exit(0);
  })();
}
