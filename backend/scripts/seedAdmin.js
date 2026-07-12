require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Role = require('../models/Role');

const seedAdmin = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/transitops');
    console.log('Connected to MongoDB');

    // 1. Check if Super Admin role exists
    let superAdminRole = await Role.findOne({ name: 'Super Admin' });
    if (!superAdminRole) {
      console.log('Creating Super Admin role...');
      superAdminRole = await Role.create({
        name: 'Super Admin',
        description: 'Has access to all system features',
        permissions: ['*']
      });
      console.log('Super Admin role created');
    } else {
      console.log('Super Admin role already exists');
    }

    // 2. Check if admin user exists
    const adminEmail = 'admin@transitops.com';
    const adminUser = await User.findOne({ email: adminEmail });

    if (!adminUser) {
      console.log(`Creating default admin user (${adminEmail})...`);
      
      // Cleanup legacy index if exists
      try {
        await User.collection.dropIndex('phone_1');
        console.log('Dropped legacy phone_1 index');
      } catch (e) {
        // Ignore if index doesn't exist
      }

      await User.create({
        firstName: 'Super',
        lastName: 'Admin',
        email: adminEmail,
        password: 'Password123!', // You should change this after first login
        role: superAdminRole._id,
        isActive: true
      });
      console.log(`Admin user created successfully! Email: ${adminEmail}, Password: Password123!`);
    } else {
      console.log(`Admin user (${adminEmail}) already exists. Ensuring role is Super Admin...`);
      adminUser.role = superAdminRole._id;
      await adminUser.save();
      console.log('Admin user updated');
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
