// Database Seeding Script - Creates real test data
// Usage: node scripts/seedDatabase.js
import dotenv from 'dotenv';
dotenv.config();

import sequelize, { initializePostgres } from '../src/config/database.js';
import User from '../src/models/User.js';
import PickupRequest from '../src/models/PickupRequest.js';
import Payment from '../src/models/Payment.js';
import Bin from '../src/models/Bin.js';
import Complaint from '../src/models/Complaint.js';
import SystemSettings from '../src/models/SystemSettings.js';
import AuditLog from '../src/models/AuditLog.js';

async function seedDatabase() {
  try {
    console.log('[Seed] Connecting to database...');
    await initializePostgres();
    console.log('[Seed] Connected. Starting seeding...');

    // ==================== USERS ====================
    // Password will be auto-hashed by beforeCreate hook
    const existingAdmin = await User.findOne({ where: { email: 'admin@test.com' } });
    if (existingAdmin) {
      console.log('[Seed] Seed data already exists, skipping...');
      console.log('[Seed] Login credentials:');
      console.log('  Citizen: citizen@test.com / password123');
      console.log('  Citizen 2: citizen2@test.com / password123');
      console.log('  Collector: collector@test.com / password123');
      console.log('  Collector 2: collector2@test.com / password123');
      console.log('  Admin: admin@test.com / password123');
      process.exit(0);
    }

    // Create admin
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@test.com',
      phoneNumber: '+919876543200',
      password: 'password123',
      role: 'admin',
      status: 'active',
      address: 'Municipal Office, Sector 1',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001'
    });
    console.log('[Seed] Created admin:', admin.email);

    // Create citizens
    const citizen1 = await User.create({
      firstName: 'Rahul',
      lastName: 'Sharma',
      email: 'citizen@test.com',
      phoneNumber: '+919876543201',
      password: 'password123',
      role: 'citizen',
      status: 'active',
      address: '123, Green Avenue, Andheri West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400058'
    });
    console.log('[Seed] Created citizen 1:', citizen1.email);

    const citizen2 = await User.create({
      firstName: 'Priya',
      lastName: 'Patel',
      email: 'citizen2@test.com',
      phoneNumber: '+919876543202',
      password: 'password123',
      role: 'citizen',
      status: 'active',
      address: '456, Clean Street, Bandra',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400050'
    });
    console.log('[Seed] Created citizen 2:', citizen2.email);

    const citizen3 = await User.create({
      firstName: 'Amit',
      lastName: 'Kumar',
      email: 'citizen3@test.com',
      phoneNumber: '+919876543203',
      password: 'password123',
      role: 'citizen',
      status: 'active',
      address: '789, Eco Lane, Juhu',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400049'
    });
    console.log('[Seed] Created citizen 3:', citizen3.email);

    // Create collectors
    const collector1 = await User.create({
      firstName: 'Vikram',
      lastName: 'Singh',
      email: 'collector@test.com',
      phoneNumber: '+919876543210',
      password: 'password123',
      role: 'collector',
      status: 'active',
      address: '100, Service Road, Malad',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400064',
      collectorType: 'individual',
      collectorLicense: 'MH-COL-2024-001',
      collectorVehicleType: 'Auto Rickshaw',
      documentsVerified: true,
      isOnline: true
    });
    console.log('[Seed] Created collector 1:', collector1.email);

    const collector2 = await User.create({
      firstName: 'Suresh',
      lastName: 'Yadav',
      email: 'collector2@test.com',
      phoneNumber: '+919876543211',
      password: 'password123',
      role: 'collector',
      status: 'active',
      address: '200, Waste Management Road, Goregaon',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400063',
      collectorType: 'individual',
      collectorLicense: 'MH-COL-2024-002',
      collectorVehicleType: 'Mini Truck',
      documentsVerified: true,
      isOnline: true
    });
    console.log('[Seed] Created collector 2:', collector2.email);

    // ==================== PICKUP REQUESTS ====================
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const dayAfter = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    const threeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);

    // Pending requests (unassigned)
    const req1 = await PickupRequest.create({
      citizenId: citizen1.id,
      wasteType: 'biodegradable',
      wasteQuantity: 5.0,
      description: 'Kitchen waste and garden trimmings',
      pickupAddress: '123, Green Avenue, Andheri West, Mumbai',
      scheduledDate: tomorrow,
      preferredTimeSlot: '8AM-11AM',
      requestStatus: 'pending',
      priority: 'medium',
      estimatedServiceCharge: 100
    });

    const req2 = await PickupRequest.create({
      citizenId: citizen2.id,
      wasteType: 'recyclable',
      wasteQuantity: 8.0,
      description: 'Old newspapers, plastic bottles, cardboard boxes',
      pickupAddress: '456, Clean Street, Bandra, Mumbai',
      scheduledDate: tomorrow,
      preferredTimeSlot: '11AM-2PM',
      requestStatus: 'pending',
      priority: 'low',
      estimatedServiceCharge: 130
    });

    const req3 = await PickupRequest.create({
      citizenId: citizen3.id,
      wasteType: 'e-waste',
      wasteQuantity: 3.0,
      description: 'Old laptop, broken phone charger, wires',
      pickupAddress: '789, Eco Lane, Juhu, Mumbai',
      scheduledDate: dayAfter,
      preferredTimeSlot: '2PM-5PM',
      requestStatus: 'pending',
      priority: 'high',
      estimatedServiceCharge: 180
    });

    // Assigned requests (assigned by admin to collector)
    const req4 = await PickupRequest.create({
      citizenId: citizen1.id,
      collectorId: collector1.id,
      wasteType: 'hazardous',
      wasteQuantity: 2.0,
      description: 'Old batteries and paint cans',
      pickupAddress: '123, Green Avenue, Andheri West, Mumbai',
      scheduledDate: tomorrow,
      preferredTimeSlot: '2PM-5PM',
      requestStatus: 'assigned',
      priority: 'urgent',
      estimatedServiceCharge: 220
    });

    const req5 = await PickupRequest.create({
      citizenId: citizen2.id,
      collectorId: collector1.id,
      wasteType: 'mixed',
      wasteQuantity: 10.0,
      description: 'Mixed household waste',
      pickupAddress: '456, Clean Street, Bandra, Mumbai',
      scheduledDate: tomorrow,
      preferredTimeSlot: '8AM-11AM',
      requestStatus: 'assigned',
      priority: 'medium',
      estimatedServiceCharge: 150
    });

    // In-transit request
    const req6 = await PickupRequest.create({
      citizenId: citizen3.id,
      collectorId: collector2.id,
      wasteType: 'biodegradable',
      wasteQuantity: 7.0,
      description: 'Garden waste and food scraps',
      pickupAddress: '789, Eco Lane, Juhu, Mumbai',
      scheduledDate: now,
      preferredTimeSlot: '11AM-2PM',
      requestStatus: 'in_transit',
      priority: 'medium',
      estimatedServiceCharge: 120,
      collectorAcceptanceTime: yesterday
    });

    // Collected requests
    const req7 = await PickupRequest.create({
      citizenId: citizen1.id,
      collectorId: collector1.id,
      wasteType: 'recyclable',
      wasteQuantity: 15.0,
      description: 'Large batch of recyclable materials',
      pickupAddress: '123, Green Avenue, Andheri West, Mumbai',
      scheduledDate: yesterday,
      preferredTimeSlot: '8AM-11AM',
      requestStatus: 'collected',
      priority: 'medium',
      estimatedServiceCharge: 200,
      collectorAcceptanceTime: twoDaysAgo,
      collectionTime: yesterday
    });

    // Verified/Completed requests (history)
    const req8 = await PickupRequest.create({
      citizenId: citizen2.id,
      collectorId: collector2.id,
      wasteType: 'biodegradable',
      wasteQuantity: 4.0,
      description: 'Organic kitchen waste',
      pickupAddress: '456, Clean Street, Bandra, Mumbai',
      scheduledDate: fiveDaysAgo,
      preferredTimeSlot: '2PM-5PM',
      requestStatus: 'verified',
      priority: 'low',
      estimatedServiceCharge: 90,
      collectorAcceptanceTime: fiveDaysAgo,
      collectionTime: fiveDaysAgo,
      verificationTime: fiveDaysAgo,
      verificationNotes: 'Collection verified successfully'
    });

    const req9 = await PickupRequest.create({
      citizenId: citizen1.id,
      collectorId: collector1.id,
      wasteType: 'mixed',
      wasteQuantity: 6.0,
      description: 'General household cleanup',
      pickupAddress: '123, Green Avenue, Andheri West, Mumbai',
      scheduledDate: fiveDaysAgo,
      preferredTimeSlot: '5PM-8PM',
      requestStatus: 'completed',
      priority: 'medium',
      estimatedServiceCharge: 110,
      collectorAcceptanceTime: fiveDaysAgo,
      collectionTime: fiveDaysAgo,
      verificationTime: fiveDaysAgo
    });

    console.log('[Seed] Created 9 pickup requests');

    // ==================== PAYMENTS ====================
    // Payment for verified request
    await Payment.create({
      pickupRequestId: req8.id,
      citizenId: citizen2.id,
      serviceCharge: 90,
      tax: 16.2,
      totalAmount: 106.2,
      currency: 'INR',
      paymentMethod: 'upi',
      paymentStatus: 'completed',
      transactionId: 'TXN-' + Date.now() + '-001',
      invoiceNumber: 'INV-2026-0001',
      invoiceDate: fiveDaysAgo,
      paidAt: fiveDaysAgo
    });

    // Payment for completed request
    await Payment.create({
      pickupRequestId: req9.id,
      citizenId: citizen1.id,
      serviceCharge: 110,
      tax: 19.8,
      totalAmount: 129.8,
      currency: 'INR',
      paymentMethod: 'credit_card',
      paymentStatus: 'completed',
      transactionId: 'TXN-' + Date.now() + '-002',
      invoiceNumber: 'INV-2026-0002',
      invoiceDate: fiveDaysAgo,
      paidAt: fiveDaysAgo
    });

    // Pending payment for collected request
    await Payment.create({
      pickupRequestId: req7.id,
      citizenId: citizen1.id,
      serviceCharge: 200,
      tax: 36,
      totalAmount: 236,
      currency: 'INR',
      paymentMethod: 'upi',
      paymentStatus: 'pending',
      invoiceNumber: 'INV-2026-0003',
      invoiceDate: yesterday
    });

    console.log('[Seed] Created 3 payments');

    // ==================== BINS ====================
    const binsData = [
      { location: 'Andheri West Junction', fillLevel: 85, status: 'full', wasteType: 'biodegradable', lastCollected: twoDaysAgo },
      { location: 'Bandra Station Road', fillLevel: 45, status: 'half', wasteType: 'recyclable', lastCollected: yesterday },
      { location: 'Juhu Beach Entrance', fillLevel: 92, status: 'full', wasteType: 'mixed', lastCollected: fiveDaysAgo },
      { location: 'Malad Market Area', fillLevel: 20, status: 'empty', wasteType: 'biodegradable', lastCollected: now },
      { location: 'Goregaon Bus Stop', fillLevel: 60, status: 'half', wasteType: 'recyclable', lastCollected: twoDaysAgo },
      { location: 'Dadar TT Circle', fillLevel: 10, status: 'empty', wasteType: 'hazardous', lastCollected: yesterday },
      { location: 'Powai Lake Area', fillLevel: 78, status: 'full', wasteType: 'mixed', lastCollected: fiveDaysAgo },
      { location: 'Kurla West Park', fillLevel: 35, status: 'half', wasteType: 'biodegradable', lastCollected: twoDaysAgo },
      { location: 'Worli Sea Face', fillLevel: 55, status: 'half', wasteType: 'recyclable', lastCollected: yesterday },
      { location: 'Colaba Market', fillLevel: 95, status: 'full', wasteType: 'mixed', lastCollected: fiveDaysAgo },
      { location: 'Vile Parle Station', fillLevel: 5, status: 'empty', wasteType: 'e-waste', lastCollected: now },
      { location: 'Santacruz East', fillLevel: 70, status: 'half', wasteType: 'biodegradable', lastCollected: twoDaysAgo },
    ];

    await Bin.bulkCreate(binsData);
    console.log('[Seed] Created 12 bins');

    // ==================== COMPLAINTS ====================
    await Complaint.create({
      citizenId: citizen1.id,
      category: 'missed_pickup',
      description: 'My scheduled pickup for last Tuesday was missed. No collector arrived during the assigned time slot.',
      location: '123, Green Avenue, Andheri West',
      status: 'in_review'
    });

    await Complaint.create({
      citizenId: citizen2.id,
      category: 'bin_overflow',
      description: 'The community bin near Bandra Station has been overflowing for 3 days. It is causing bad smell in the area.',
      location: 'Bandra Station Road',
      status: 'submitted'
    });

    await Complaint.create({
      citizenId: citizen3.id,
      category: 'collector_behavior',
      description: 'The collector was rude during the pickup and did not segregate waste properly.',
      status: 'resolved',
      adminNotes: 'Spoke with the collector. Warning issued. Apology sent to citizen.',
      resolvedAt: yesterday
    });

    console.log('[Seed] Created 3 complaints');

    // ==================== SYSTEM SETTINGS ====================
    const settings = [
      { key: 'systemName', value: 'Smart Waste Management System', category: 'general' },
      { key: 'adminEmail', value: 'admin@wms.com', category: 'general' },
      { key: 'timezone', value: 'IST', category: 'general' },
      { key: 'emailNotifications', value: true, category: 'notifications' },
      { key: 'smsNotifications', value: true, category: 'notifications' },
      { key: 'dryWastePrice', value: 50, category: 'pricing' },
      { key: 'wetWastePrice', value: 30, category: 'pricing' },
      { key: 'hazardousWastePrice', value: 100, category: 'pricing' },
      { key: 'maxPickupsPerCollector', value: 15, category: 'collection' },
    ];

    for (const setting of settings) {
      await SystemSettings.upsert(setting);
    }
    console.log('[Seed] Created system settings');

    console.log('\n[Seed] Database seeding complete!');
    console.log('\n[Seed] Login credentials:');
    console.log('  Citizen 1: citizen@test.com / password123');
    console.log('  Citizen 2: citizen2@test.com / password123');
    console.log('  Citizen 3: citizen3@test.com / password123');
    console.log('  Collector 1: collector@test.com / password123');
    console.log('  Collector 2: collector2@test.com / password123');
    console.log('  Admin: admin@test.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
