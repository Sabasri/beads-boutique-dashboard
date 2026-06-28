const db = require('../utils/database');

// Helper to create notifications
const createNotification = async (type, message) => {
  try {
    await db.notifications.create({ type, message, read: false });
  } catch (err) {
    console.error('Failed to create notification:', err.message);
  }
};

// Get All Products
const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    // Filter by Category
    if (req.query.category && req.query.category !== 'All') {
      filter.category = req.query.category;
    }

    // Filter by Status
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Search query (name or sku)
    if (req.query.search) {
      const searchRegex = { $regex: req.query.search, $options: 'i' };
      filter.$or = [
        { name: searchRegex },
        { sku: searchRegex }
      ];
    }

    // Sorting
    let sort = { createdAt: -1 }; // default newest
    if (req.query.sort) {
      switch (req.query.sort) {
        case 'price_asc':
          sort = { price: 1 };
          break;
        case 'price_desc':
          sort = { price: -1 };
          break;
        case 'stock_asc':
          sort = { quantity: 1 };
          break;
        case 'stock_desc':
          sort = { quantity: -1 };
          break;
        case 'newest':
          sort = { createdAt: -1 };
          break;
        default:
          sort = { createdAt: -1 };
      }
    }

    const products = await db.products.find(filter, { skip, limit, sort });
    const total = await db.products.countDocuments(filter);

    res.json({
      products,
      page,
      pages: Math.ceil(total / limit),
      totalProducts: total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching products' });
  }
};

// Get Single Product
const getProductById = async (req, res) => {
  try {
    const product = await db.products.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching product' });
  }
};

// Create Product (Admin Only)
const createProduct = async (req, res) => {
  try {
    const { name, category, description, price, quantity, sku, image, reorderLevel } = req.body;

    if (!name || !category || !description || price === undefined || quantity === undefined || !sku) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if SKU exists
    const skuExists = await db.products.findOne({ sku });
    if (skuExists) {
      return res.status(400).json({ message: 'Product SKU already exists' });
    }

    const product = await db.products.create({
      name,
      category,
      description,
      price: Number(price),
      quantity: Number(quantity),
      sku,
      image: image || '',
      reorderLevel: reorderLevel !== undefined ? Number(reorderLevel) : 10
    });

    // Check if product is low stock immediately
    if (product.quantity === 0) {
      await createNotification('stock', `Critical Alert: Product '${product.name}' (SKU: ${product.sku}) is created Out of Stock.`);
    } else if (product.quantity <= product.reorderLevel) {
      await createNotification('stock', `Stock Warning: Product '${product.name}' (SKU: ${product.sku}) is created with Low Stock (${product.quantity} remaining).`);
    }

    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating product' });
  }
};

// Update Product
const updateProduct = async (req, res) => {
  try {
    const { name, category, description, price, quantity, sku, image, reorderLevel } = req.body;

    const product = await db.products.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // If SKU is being updated, verify it is unique
    if (sku && sku !== product.sku) {
      const skuExists = await db.products.findOne({ sku });
      if (skuExists) {
        return res.status(400).json({ message: 'Product SKU already exists' });
      }
    }

    const updatedData = {
      name: name || product.name,
      category: category || product.category,
      description: description || product.description,
      price: price !== undefined ? Number(price) : product.price,
      quantity: quantity !== undefined ? Number(quantity) : product.quantity,
      sku: sku || product.sku,
      image: image !== undefined ? image : product.image,
      reorderLevel: reorderLevel !== undefined ? Number(reorderLevel) : product.reorderLevel
    };

    const updatedProduct = await db.products.findByIdAndUpdate(req.params.id, updatedData);

    // Create notifications for low/critical/out-of-stock events if quantity changed
    if (quantity !== undefined && Number(quantity) !== product.quantity) {
      const newQty = Number(quantity);
      const reorder = updatedProduct.reorderLevel;

      if (newQty === 0) {
        await createNotification('stock', `Critical Alert: Product '${updatedProduct.name}' (SKU: ${updatedProduct.sku}) is Out of Stock.`);
      } else if (newQty <= reorder) {
        await createNotification('stock', `Stock Warning: Product '${updatedProduct.name}' (SKU: ${updatedProduct.sku}) is Low in Stock (${newQty} remaining).`);
      }
    }

    res.json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating product' });
  }
};

// Delete Product (Admin Only)
const deleteProduct = async (req, res) => {
  try {
    const product = await db.products.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await db.products.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting product' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
