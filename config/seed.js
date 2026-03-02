// Run: node config/seed.js
require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const MenuItem = require('../models/MenuItem');

const seedData = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Clear existing data
  await MenuItem.deleteMany();
  await User.deleteMany({ role: 'admin' });
  console.log('🗑️  Cleared old data');

  // Create admin
  await User.create({
    name:     'BITEHAUS Admin',
    email:    process.env.ADMIN_EMAIL    || 'admin@bitehaus.com',
    password: process.env.ADMIN_PASSWORD || 'Admin@123',
    role:     'admin'
  });
  console.log('👤 Admin user created');

  // Seed menu items
  await MenuItem.insertMany([
    { name: 'Black Beast Burger',    category: 'burger',  price: 349, description: 'Double smashed patty, black bun, caramelized onions, cheddar melt.',       badge: 'Bestseller', rating: 4.9, isFeatured: true  },
    { name: 'Volcano Pizza',         category: 'pizza',   price: 499, description: 'Spicy marinara, jalapeños, pepperoni, mozzarella, chili drizzle.',          badge: 'Hot 🔥',     rating: 4.8, isFeatured: true  },
    { name: 'Truffle Pasta',         category: 'pasta',   price: 429, description: 'Hand-rolled pasta, black truffle oil, parmesan, toasted breadcrumbs.',      badge: null,         rating: 4.7                     },
    { name: 'Crispy Chicken Burger', category: 'burger',  price: 299, description: 'Nashville hot chicken, pickles, slaw, honey mustard.',                      badge: 'New',        rating: 4.6                     },
    { name: 'BBQ Pulled Pork Pizza', category: 'pizza',   price: 549, description: 'Slow-cooked pork, BBQ base, red onion, jalapeños, smoke sauce.',            badge: null,         rating: 4.8                     },
    { name: 'Caesar Salad',          category: 'salad',   price: 249, description: 'Romaine, parmesan shavings, croutons, classic caesar dressing.',            badge: null,         rating: 4.5                     },
    { name: 'Molten Choco Lava',     category: 'dessert', price: 199, description: 'Warm chocolate cake with molten center, vanilla ice cream scoop.',          badge: 'Must Try',   rating: 4.9, isFeatured: true  },
    { name: 'Mango Lassi',           category: 'drink',   price: 129, description: 'Chilled mango, yogurt, cardamom, a touch of rose water.',                   badge: null,         rating: 4.7                     },
    { name: 'Penne Arrabbiata',      category: 'pasta',   price: 379, description: 'Penne in fiery tomato-garlic sauce, fresh basil, chili flakes.',            badge: null,         rating: 4.6                     },
    { name: 'Mango Habanero Wings',  category: 'burger',  price: 329, description: 'Crispy chicken wings tossed in mango habanero glaze.',                      badge: 'Spicy 🌶️',  rating: 4.8                     },
    { name: 'Watermelon Feta Salad', category: 'salad',   price: 279, description: 'Fresh watermelon, crumbled feta, mint, balsamic reduction.',                badge: null,         rating: 4.4                     },
    { name: 'Cold Brew Coffee',      category: 'drink',   price: 149, description: '18-hour steeped cold brew, served over ice with oat milk.',                 badge: null,         rating: 4.7                     },
  ]);
  console.log('🍔 Menu items seeded');

  console.log('\n✅ Seeding complete!');
  console.log(`   Admin email:    ${process.env.ADMIN_EMAIL || 'admin@bitehaus.com'}`);
  console.log(`   Admin password: ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);
  process.exit(0);
};

seedData().catch(err => { console.error(err); process.exit(1); });
