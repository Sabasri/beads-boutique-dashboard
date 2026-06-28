const bcrypt = require('bcryptjs');
const { connectDB, getDBType } = require('../config/db');
const db = require('./database');

// Sample names and materials to generate realistic products
const prefixes = ['Charming', 'Elegant', 'Mystic', 'Vintage', 'Royal', 'Bohemian', 'Celestial', 'Midnight', 'Sunlit', 'Forest', 'Ocean', 'Angelic', 'Ethereal', 'Sweetheart', 'Serene', 'Luminous'];
const materials = ['Quartz', 'Amethyst', 'Rose Quartz', 'Turquoise', 'Pearl', 'Jasper', 'Tiger\'s Eye', 'Lapis Lazuli', 'Aventurine', 'Obsidian', 'Onyx', 'Citrine', 'Jade', 'Hematite'];
const braceletSuffixes = ['Beaded Bracelet', 'Charm Bracelet', 'Stackable Bracelet', 'Woven Bracelet', 'Wrap Bracelet', 'Stretch Bracelet', 'Energy Bracelet'];
const earringSuffixes = ['Drop Earrings', 'Hoop Bead Earrings', 'Tassel Earrings', 'Stud Earrings', 'Chandelier Earrings', 'Threader Earrings'];

const braceletImages = [
  'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&auto=format&fit=crop&q=60'
];

const earringImages = [
  'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1629224316810-9d8805b95e76?w=500&auto=format&fit=crop&q=60'
];

const customizedImages = [
  'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=500&auto=format&fit=crop&q=60'
];

const giftImages = [
  'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&auto=format&fit=crop&q=60'
];

const customerNames = [
  'Emma Watson', 'Olivia Thompson', 'Sophia Martinez', 'Isabella Smith', 'Mia Davis', 
  'Evelyn Rodriguez', 'Charlotte Jones', 'Amelia Wilson', 'Abigail Anderson', 'Harper Taylor',
  'Emily Thomas', 'Elizabeth Moore', 'Avery Jackson', 'Sofia Martin', 'Ella Lee', 
  'Madison Perez', 'Scarlett Thompson', 'Victoria Harris', 'Grace Sanchez', 'Chloe Clark',
  'Camila Ramirez', 'Penelope Lewis', 'Riley Robinson', 'Layla Walker', 'Lillian Young',
  'Nora Allen', 'Zoey King', 'Lily Wright', 'Eleanor Scott', 'Hannah Torres',
  'Lydia Nguyen', 'Stella Hill', 'Lucy Flores', 'Paisley Green', 'Audrey Adams',
  'Claire Nelson', 'Skyler Baker', 'Violet Hall', 'Bella Rivera', 'Aurora Campbell',
  'Savannah Mitchell', 'Hazel Carter', 'Ellie Roberts', 'Luna Gomez', 'Brooklyn Phillips',
  'Leah Evans', 'Zoe Turner', 'Stella Diaz', 'Aria Parker', 'Natalie Cruz'
];

const cities = ['Boston, MA', 'New York, NY', 'Chicago, IL', 'Seattle, WA', 'Los Angeles, CA', 'Austin, TX', 'Miami, FL', 'Denver, CO', 'San Francisco, CA', 'Atlanta, GA'];
const streets = ['Maple St', 'Oak Ave', 'Pine Rd', 'Cedar Ln', 'Elm Blvd', 'Willow Dr', 'Birch Ct', 'Washington St', 'Broadway', 'Park Ave'];

const runSeed = async () => {
  try {
    // Force development environment configurations
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'secret';
    
    console.log('Connecting to database...');
    const { isMongoConnected } = await connectDB();
    const isMongo = isMongoConnected;
    console.log(`Seeding mode: ${isMongo ? 'MongoDB' : 'Local JSON files'}`);

    // 1. Clear database
    if (isMongo) {
      const mongoose = require('mongoose');
      await mongoose.connection.db.dropDatabase();
      console.log('MongoDB database dropped.');
    } else {
      const fs = require('fs');
      const path = require('path');
      const { dataDir } = require('../config/db');
      
      ['users', 'products', 'customers', 'orders', 'notifications'].forEach(coll => {
        const file = path.join(dataDir, `${coll}.json`);
        if (fs.existsSync(file)) fs.unlinkSync(file);
      });
      console.log('Local JSON database cleared.');
    }

    // 2. Seed Users
    const salt = bcrypt.genSaltSync(10);
    const adminPassword = bcrypt.hashSync('password123', salt);
    const staffPassword = bcrypt.hashSync('password123', salt);

    const admin = await db.users.create({
      name: 'Admin Manager',
      email: 'admin@boutique.com',
      password: adminPassword,
      role: 'admin'
    });

    const staff = await db.users.create({
      name: 'Staff Associate',
      email: 'staff@boutique.com',
      password: staffPassword,
      role: 'staff'
    });

    console.log('Users seeded:');
    console.log('- Admin: admin@boutique.com (password123)');
    console.log('- Staff: staff@boutique.com (password123)');

    // 3. Seed Products (exactly 100 products)
    const seededProducts = [];
    const categories = ['Handmade Bracelets', 'Earrings', 'Customized Jewelry', 'Gift Accessories'];
    
    console.log('Generating 100 products...');
    
    // Programmatic generation to make unique jewelry products
    for (let i = 1; i <= 100; i++) {
      let category, name, price, quantity, sku, image, description, reorderLevel;

      if (i <= 35) {
        // Handmade Bracelets
        category = 'Handmade Bracelets';
        const prefix = prefixes[i % prefixes.length];
        const mat = materials[i % materials.length];
        const suff = braceletSuffixes[i % braceletSuffixes.length];
        name = `${prefix} ${mat} ${suff}`;
        price = parseFloat((15 + (i * 0.8) % 30).toFixed(2));
        quantity = Math.floor(5 + (i * 3) % 45); // stock level
        sku = `BRAC-${1000 + i}`;
        image = braceletImages[i % braceletImages.length];
        description = `A beautiful, handcrafted beaded bracelet featuring premium ${mat.toLowerCase()} stones. Lovingly crafted by our artisans, this ${name.toLowerCase()} adds an elegant, natural touch to any ensemble. Perfect for stacking or wearing alone.`;
        reorderLevel = 10;
      } else if (i <= 60) {
        // Earrings
        category = 'Earrings';
        const index = i - 35;
        const prefix = prefixes[index % prefixes.length];
        const mat = materials[index % materials.length];
        const suff = earringSuffixes[index % earringSuffixes.length];
        name = `${prefix} ${mat} ${suff}`;
        price = parseFloat((10 + (index * 0.9) % 25).toFixed(2));
        quantity = Math.floor(8 + (index * 4) % 52);
        sku = `EARR-${1000 + index}`;
        image = earringImages[index % earringImages.length];
        description = `Stunning ${name.toLowerCase()} highlighting natural ${mat.toLowerCase()} beads hung in dynamic patterns. These earrings are lightweight, nickel-free, and designed to capture the light beautifully. Excellent craftsmanship.`;
        reorderLevel = 8;
      } else if (i <= 85) {
        // Customized Jewelry
        category = 'Customized Jewelry';
        const index = i - 60;
        const prefix = prefixes[index % prefixes.length];
        const mat = materials[index % materials.length];
        name = `Personalized ${prefix} ${mat} Name Necklace`;
        price = parseFloat((25 + (index * 1.5) % 50).toFixed(2));
        quantity = Math.floor(3 + (index * 2) % 15); // low stock levels
        sku = `CUST-${1000 + index}`;
        image = customizedImages[index % customizedImages.length];
        description = `Create a custom masterpiece with our ${name.toLowerCase()}. Select letters and charms to pair with genuine ${mat.toLowerCase()} beads. Made to order to match your unique style. A perfect personalized gift.`;
        reorderLevel = 5;
      } else {
        // Gift Accessories
        category = 'Gift Accessories';
        const index = i - 85;
        const accessories = ['Gift Box', 'Velvet Pouch', 'Wrapping Set', 'Care Kit', 'Gift Card Envelope', 'Display Stand'];
        name = `${prefixes[index % prefixes.length]} Silk ${accessories[index % accessories.length]}`;
        price = parseFloat((5 + (index * 1.2) % 20).toFixed(2));
        quantity = Math.floor(15 + (index * 5) % 80);
        sku = `GIFT-${1000 + index}`;
        image = giftImages[index % giftImages.length];
        description = `Upgrade your jewelry experience with this premium ${name.toLowerCase()}. Made with luxurious fabrics and protective padding to keep your valuable jewelry safe, dust-free, and presented beautifully.`;
        reorderLevel = 12;
      }

      // Automatically compute initial status based on quantity & reorder
      let status = 'In Stock';
      if (quantity === 0) status = 'Out of Stock';
      else if (quantity <= reorderLevel) status = 'Low Stock';

      const product = await db.products.create({
        name,
        category,
        description,
        price,
        quantity,
        sku,
        image,
        status,
        reorderLevel
      });
      seededProducts.push(product);
    }
    console.log('100 Products seeded.');

    // 4. Seed Customers (exactly 50 customers)
    const seededCustomers = [];
    console.log('Generating 50 customers...');
    for (let i = 0; i < 50; i++) {
      const name = customerNames[i];
      const email = `${name.toLowerCase().replace(' ', '.')}@example.com`;
      const phone = `+1 (555) ${Math.floor(100 + i * 8)}-${Math.floor(1000 + i * 17)}`;
      const streetNum = Math.floor(100 + i * 13);
      const street = streets[i % streets.length];
      const city = cities[i % cities.length];
      const address = `${streetNum} ${street}, ${city}`;

      const customer = await db.customers.create({
        name,
        email,
        phone,
        address,
        totalPurchases: 0,
        lastOrderDate: null
      });
      seededCustomers.push(customer);
    }
    console.log('50 Customers seeded.');

    // 5. Seed Orders (exactly 200 orders spread across 12 months)
    console.log('Generating 200 orders spread across the last 12 months...');
    const now = new Date();
    const orderDates = [];

    // Distribute dates over the last 365 days, with seasonal increases (December/Christmas, February/Valentine's)
    for (let i = 0; i < 200; i++) {
      // Base distribution
      let daysAgo = Math.floor((i / 200) * 365);
      
      // Introduce seasonal random adjustments
      const candidateDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      const month = candidateDate.getMonth();
      
      // Dec (11) & Feb (1) gets more orders by shifting some dates closer to these seasons
      if (month === 11 || month === 1) {
        // Leave them
      } else if (Math.random() < 0.2) {
        // Shift 20% of other orders into Dec/Feb peak
        const peakMonth = Math.random() < 0.6 ? 11 : 1; // Favors December
        const peakYear = peakMonth === 11 ? now.getFullYear() - 1 : now.getFullYear();
        candidateDate.setMonth(peakMonth);
        candidateDate.setFullYear(peakYear);
        candidateDate.setDate(Math.floor(1 + Math.random() * 28));
      }
      
      orderDates.push(candidateDate);
    }

    // Sort order dates to create them in chronological order
    orderDates.sort((a, b) => a - b);

    // Track total customer aggregate purchases
    const customerStats = {};
    seededCustomers.forEach(c => {
      customerStats[c._id.toString()] = {
        totalPurchases: 0,
        lastOrderDate: null
      };
    });

    for (let i = 0; i < 200; i++) {
      const orderDate = orderDates[i];
      const customer = seededCustomers[i % seededCustomers.length];
      
      // Choose 1 to 3 products
      const itemCount = 1 + (i % 3);
      const orderItems = [];
      let totalAmount = 0;

      for (let j = 0; j < itemCount; j++) {
        // Ensure different products in the same order
        const productIndex = (i * 3 + j * 17) % seededProducts.length;
        const product = seededProducts[productIndex];
        const qty = 1 + (j % 2); // 1 or 2 items

        totalAmount += product.price * qty;
        orderItems.push({
          product: product._id,
          name: product.name,
          quantity: qty,
          price: product.price
        });

        // Deduct stock in our product database
        const newStock = Math.max(0, product.quantity - qty);
        product.quantity = newStock;
      }

      // Order status distribution
      // Older orders are mostly Delivered, recent orders can be Pending/Processing/Shipped
      const ageInDays = (now - orderDate) / (1000 * 60 * 60 * 24);
      let orderStatus = 'Delivered';
      let paymentStatus = 'Paid';

      if (ageInDays < 5) {
        const roll = i % 5;
        if (roll === 0) {
          orderStatus = 'Pending';
          paymentStatus = 'Pending';
        } else if (roll === 1) {
          orderStatus = 'Processing';
          paymentStatus = 'Paid';
        } else if (roll === 2) {
          orderStatus = 'Shipped';
          paymentStatus = 'Paid';
        } else if (roll === 3) {
          orderStatus = 'Cancelled';
          paymentStatus = 'Failed';
        }
      } else if (Math.random() < 0.03) {
        // 3% cancel rate on historical orders
        orderStatus = 'Cancelled';
        paymentStatus = 'Failed';
      }

      const orderId = `BBB-${1000 + i + 1}`;

      await db.orders.create({
        orderId,
        customer: customer._id,
        customerName: customer.name,
        customerContact: customer.phone,
        shippingAddress: customer.address,
        products: orderItems,
        totalAmount,
        paymentStatus,
        orderStatus,
        createdAt: orderDate.toISOString()
      });

      // Update customer stats in memory (only if not cancelled)
      if (orderStatus !== 'Cancelled') {
        const stats = customerStats[customer._id.toString()];
        stats.totalPurchases += totalAmount;
        if (!stats.lastOrderDate || new Date(orderDate) > new Date(stats.lastOrderDate)) {
          stats.lastOrderDate = orderDate;
        }
      }
    }

    // Update customer models in the database with their aggregate stats
    for (let custId in customerStats) {
      const stats = customerStats[custId];
      if (stats.totalPurchases > 0) {
        await db.customers.findByIdAndUpdate(custId, {
          totalPurchases: parseFloat(stats.totalPurchases.toFixed(2)),
          lastOrderDate: stats.lastOrderDate ? stats.lastOrderDate.toISOString() : null
        });
      }
    }

    // Save updated product stock levels
    for (let product of seededProducts) {
      await db.products.findByIdAndUpdate(product._id, {
        quantity: product.quantity
      });
    }

    console.log('200 Orders seeded and inventory levels updated.');

    // 6. Seed some default notifications
    console.log('Seeding initial notifications...');
    await db.notifications.create({
      type: 'stock',
      message: 'Critical Alert: Product \'Rose Gold Hematite Stretch Bracelet\' (SKU: BRAC-1014) is Out of Stock.',
      read: false,
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
    });

    await db.notifications.create({
      type: 'stock',
      message: 'Stock Warning: Product \'Sweetheart Pearl Stud Earrings\' (SKU: EARR-1012) is Low in Stock (5 remaining).',
      read: false,
      createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString() // 4 hours ago
    });

    await db.notifications.create({
      type: 'order',
      message: 'New Order BBB-1200 received from Natalie Cruz for $124.50.',
      read: false,
      createdAt: new Date(now.getTime() - 10 * 60 * 1000).toISOString() // 10 mins ago
    });

    await db.notifications.create({
      type: 'milestone',
      message: 'Revenue Milestone Reached: Total sales have passed $25,000!',
      read: true,
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
    });

    console.log('Notifications seeded.');
    console.log('Database seeding completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

runSeed();
