const { getDBType, dataDir } = require('../config/db');
const fs = require('fs');
const path = require('path');

// Mongoose models
const User = require('../models/User');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const Notification = require('../models/Notification');

// Helper to read JSON file
const readJSON = (collectionName) => {
  const filePath = path.join(dataDir, `${collectionName}.json`);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2));
    return [];
  }
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

// Helper to write JSON file
const writeJSON = (collectionName, data) => {
  const filePath = path.join(dataDir, `${collectionName}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// Generate unique ID for JSON items
const generateId = () => {
  return 'json_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
};

class JSONCollection {
  constructor(name) {
    this.name = name;
  }

  read() {
    return readJSON(this.name);
  }

  write(data) {
    writeJSON(this.name, data);
  }

  async find(filter = {}, options = {}) {
    let items = this.read();

    // Filter items
    items = items.filter(item => {
      for (let key in filter) {
        if (filter[key] === undefined) continue;

        // Custom search handling
        if (key === '$or' && Array.isArray(filter[key])) {
          const matchesAny = filter[key].some(subFilter => {
            for (let subKey in subFilter) {
              if (subFilter[subKey] && subFilter[subKey].$regex) {
                const regex = new RegExp(subFilter[subKey].$regex, subFilter[subKey].$options || 'i');
                if (regex.test(item[subKey])) return true;
              } else if (item[subKey] === subFilter[subKey]) {
                return true;
              }
            }
            return false;
          });
          if (!matchesAny) return false;
          continue;
        }

        // Regex filtering
        if (filter[key] && filter[key].$regex) {
          const regex = new RegExp(filter[key].$regex, filter[key].$options || 'i');
          if (!regex.test(item[key])) return false;
          continue;
        }

        // Date range filtering
        if (filter[key] && (filter[key].$gte || filter[key].$lte)) {
          const itemDate = new Date(item[key]);
          if (filter[key].$gte && itemDate < new Date(filter[key].$gte)) return false;
          if (filter[key].$lte && itemDate > new Date(filter[key].$lte)) return false;
          continue;
        }

        // Standard matching
        if (item[key] !== filter[key]) return false;
      }
      return true;
    });

    // Sort items
    if (options.sort) {
      const sortField = Object.keys(options.sort)[0];
      const sortOrder = options.sort[sortField]; // 1 for asc, -1 for desc
      items.sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        // Handle dates
        if (sortField === 'createdAt' || sortField === 'lastOrderDate') {
          valA = valA ? new Date(valA).getTime() : 0;
          valB = valB ? new Date(valB).getTime() : 0;
        }

        if (valA < valB) return sortOrder === 1 ? -1 : 1;
        if (valA > valB) return sortOrder === 1 ? 1 : -1;
        return 0;
      });
    }

    // Pagination
    const total = items.length;
    let result = items;
    if (options.skip !== undefined && options.limit !== undefined) {
      result = items.slice(options.skip, options.skip + options.limit);
    }

    return result;
  }

  async findOne(filter = {}) {
    const items = await this.find(filter);
    return items[0] || null;
  }

  async findById(id) {
    const items = this.read();
    return items.find(item => item._id === id) || null;
  }

  async create(data) {
    const items = this.read();
    const newItem = {
      _id: generateId(),
      createdAt: new Date().toISOString(),
      ...data
    };

    // Calculate product status automatically
    if (this.name === 'products') {
      const qty = newItem.quantity || 0;
      const reorder = newItem.reorderLevel || 10;
      if (qty === 0) newItem.status = 'Out of Stock';
      else if (qty <= reorder) newItem.status = 'Low Stock';
      else newItem.status = 'In Stock';
    }

    items.push(newItem);
    this.write(items);
    return newItem;
  }

  async findByIdAndUpdate(id, updateData) {
    const items = this.read();
    const index = items.findIndex(item => item._id === id);
    if (index === -1) return null;

    items[index] = {
      ...items[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    // Re-evaluate product status
    if (this.name === 'products') {
      const qty = items[index].quantity || 0;
      const reorder = items[index].reorderLevel || 10;
      if (qty === 0) items[index].status = 'Out of Stock';
      else if (qty <= reorder) items[index].status = 'Low Stock';
      else items[index].status = 'In Stock';
    }

    this.write(items);
    return items[index];
  }

  async findByIdAndDelete(id) {
    const items = this.read();
    const index = items.findIndex(item => item._id === id);
    if (index === -1) return null;

    const deletedItem = items[index];
    items.splice(index, 1);
    this.write(items);
    return deletedItem;
  }

  async countDocuments(filter = {}) {
    const items = await this.find(filter);
    return items.length;
  }
}

class DatabaseService {
  constructor(collectionName, mongooseModel) {
    this.collectionName = collectionName;
    this.model = mongooseModel;
    this.jsonColl = new JSONCollection(collectionName);
  }

  isMongo() {
    return getDBType();
  }

  async find(filter = {}, options = {}) {
    if (this.isMongo()) {
      let query = this.model.find(filter);
      if (options.sort) query = query.sort(options.sort);
      if (options.skip !== undefined) query = query.skip(options.skip);
      if (options.limit !== undefined) query = query.limit(options.limit);
      if (options.populate) query = query.populate(options.populate);
      return await query.exec();
    } else {
      return await this.jsonColl.find(filter, options);
    }
  }

  async findOne(filter = {}) {
    if (this.isMongo()) {
      return await this.model.findOne(filter).exec();
    } else {
      return await this.jsonColl.findOne(filter);
    }
  }

  async findById(id) {
    if (this.isMongo()) {
      return await this.model.findById(id).exec();
    } else {
      return await this.jsonColl.findById(id);
    }
  }

  async create(data) {
    if (this.isMongo()) {
      const item = new this.model(data);
      return await item.save();
    } else {
      return await this.jsonColl.create(data);
    }
  }

  async findByIdAndUpdate(id, updateData) {
    if (this.isMongo()) {
      // { new: true, runValidators: true } ensures the updated doc is returned and validators run
      const doc = await this.model.findById(id);
      if (!doc) return null;
      Object.assign(doc, updateData);
      return await doc.save();
    } else {
      return await this.jsonColl.findByIdAndUpdate(id, updateData);
    }
  }

  async findByIdAndDelete(id) {
    if (this.isMongo()) {
      return await this.model.findByIdAndDelete(id).exec();
    } else {
      return await this.jsonColl.findByIdAndDelete(id);
    }
  }

  async countDocuments(filter = {}) {
    if (this.isMongo()) {
      return await this.model.countDocuments(filter).exec();
    } else {
      return await this.jsonColl.countDocuments(filter);
    }
  }

  async updateMany(filter = {}, updateData = {}) {
    if (this.isMongo()) {
      return await this.model.updateMany(filter, updateData).exec();
    } else {
      const items = this.jsonColl.read();
      let count = 0;
      const updatedItems = items.map(item => {
        let match = true;
        for (let key in filter) {
          if (item[key] !== filter[key]) {
            match = false;
            break;
          }
        }
        if (match) {
          count++;
          return { ...item, ...updateData };
        }
        return item;
      });
      this.jsonColl.write(updatedItems);
      return { modifiedCount: count };
    }
  }
}

const db = {
  users: new DatabaseService('users', User),
  products: new DatabaseService('products', Product),
  customers: new DatabaseService('customers', Customer),
  orders: new DatabaseService('orders', Order),
  notifications: new DatabaseService('notifications', Notification)
};

module.exports = db;
