import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import UserModel from './models/Users.js';
import OrderModel from './models/Orders.js';

dotenv.config();

const conStr = process.env.MONGO_URI;

const VEHICLE_RATES = {
    bike:         { multiplier: 1.0, basePerKm: 0.150 },
    auto:         { multiplier: 1.2, basePerKm: 0.200 },
    truck_small:  { multiplier: 1.5, basePerKm: 0.350 },
    truck_medium: { multiplier: 1.8, basePerKm: 0.500 },
    truck_large:  { multiplier: 2.2, basePerKm: 0.700 },
    truck_xlarge: { multiplier: 2.8, basePerKm: 0.950 }
};

function calculateFare(distance, weight, vehicleType, isUrgent=false) {
    const v = VEHICLE_RATES[vehicleType] || VEHICLE_RATES['truck_small'];
    const baseFare = parseFloat((distance * v.basePerKm * v.multiplier).toFixed(3));
    const weightSurcharge = parseFloat((weight * 0.010).toFixed(3));
    let total = baseFare + weightSurcharge;
    if (isUrgent) total = total * 1.15;
    return { baseFare, weightSurcharge, vehicleMultiplier: v.multiplier, estimatedFare: parseFloat(Math.max(total, 1.500).toFixed(3)), currency: "OMR" };
}

async function seed() {
    await mongoose.connect(conStr);
    await UserModel.deleteMany({});
    await OrderModel.deleteMany({});

    const hash = (p) => bcrypt.hash(p, 10);

    // Seed 3 traders + 3 drivers = 6 users in Usertbl
    const users = await UserModel.insertMany([
        { fullName:'Ahmed Al-Rashidi', email:'ahmed@trader.com', password: await hash('password123'),
          phone:'+968 9100 0001', userType:'trader', companyName:'Al-Rashidi Trading Co.',
          registrationNumber:'OM-2021-001', businessCategory:'wholesale', isActive:true, rating:4.8, totalTrips:45 },
        { fullName:'Sara Al-Balushi', email:'sara@trader.com', password: await hash('password123'),
          phone:'+968 9100 0002', userType:'trader', companyName:'Balushi Fresh Produce',
          registrationNumber:'OM-2021-002', businessCategory:'perishables', isActive:true, rating:4.9, totalTrips:32 },
        { fullName:'Khalid Al-Farsi', email:'khalid@trader.com', password: await hash('password123'),
          phone:'+968 9100 0003', userType:'trader', companyName:'Al-Farsi Manufacturing',
          registrationNumber:'OM-2021-003', businessCategory:'manufacturing', isActive:true, rating:4.7, totalTrips:28 },
        { fullName:'Mohammed Al-Harthi', email:'mo@driver.com', password: await hash('password123'),
          phone:'+968 9200 0001', userType:'driver', licenseNumber:'OM-DL-12345',
          vehicleType:'truck_medium', baseRate:0.500, isAvailable:true, isActive:true, rating:4.9, totalTrips:120,
          lat:23.6100, lng:58.5922 },
        { fullName:'Ali Al-Zadjali', email:'ali@driver.com', password: await hash('password123'),
          phone:'+968 9200 0002', userType:'driver', licenseNumber:'OM-DL-67890',
          vehicleType:'truck_large', baseRate:0.700, isAvailable:true, isActive:true, rating:4.7, totalTrips:88,
          lat:23.5957, lng:58.4059 },
        { fullName:'Yusuf Al-Ghafri', email:'yusuf@driver.com', password: await hash('password123'),
          phone:'+968 9200 0003', userType:'driver', licenseNumber:'OM-DL-11223',
          vehicleType:'bike', baseRate:0.150, isAvailable:false, isActive:true, rating:4.6, totalTrips:200,
          lat:23.5880, lng:58.3829 }
    ]);

    // Seed 5 orders in Orderstbl
    const ordersData = [
        { traderEmail:'ahmed@trader.com', driverEmail:'ali@driver.com',
          pickupLocation:'Muttrah Souq, Muscat', deliveryLocation:'Salalah, Dhofar',
          pickupLat:23.6189, pickupLng:58.5922, deliveryLat:17.0194, deliveryLng:54.1001,
          distance:1020, weight:500, vehicleType:'truck_large', status:'completed',
          isPaid:true, paymentMethod:'card', isUrgent:false, completedAt: new Date() },
        { traderEmail:'sara@trader.com', driverEmail:'mo@driver.com',
          pickupLocation:'Sohar Port, Al Batinah', deliveryLocation:'Muscat Airport',
          pickupLat:24.3473, pickupLng:56.7453, deliveryLat:23.5933, deliveryLng:58.2844,
          distance:215, weight:80, vehicleType:'truck_small', status:'accepted',
          isPaid:false, isUrgent:true },
        { traderEmail:'khalid@trader.com',
          pickupLocation:'Sur, Al Sharqiyah', deliveryLocation:'Nizwa, Ad Dakhiliyah',
          pickupLat:22.5654, pickupLng:59.5289, deliveryLat:22.9333, deliveryLng:57.5333,
          distance:310, weight:200, vehicleType:'truck_medium', status:'pending', isPaid:false, isUrgent:false },
        { traderEmail:'ahmed@trader.com',
          pickupLocation:'Barka, Al Batinah', deliveryLocation:'Ibri, Al Dhahirah',
          pickupLat:23.6929, pickupLng:57.8862, deliveryLat:23.2253, deliveryLng:56.5128,
          distance:180, weight:350, vehicleType:'truck_medium', status:'pending', isPaid:false, isUrgent:true },
        { traderEmail:'sara@trader.com',
          pickupLocation:'Muscat CBD', deliveryLocation:'Duqm SEZ',
          pickupLat:23.5957, pickupLng:58.4059, deliveryLat:19.6500, deliveryLng:57.7000,
          distance:600, weight:1200, vehicleType:'truck_xlarge', status:'cancelled', isPaid:false, isUrgent:false }
    ];

    const ordersWithFares = ordersData.map(o => ({
        ...o,
        ...calculateFare(o.distance, o.weight, o.vehicleType, o.isUrgent)
    }));

    await OrderModel.insertMany(ordersWithFares);

    console.log('✅ Seeded: 6 users in Usertbl, 5 orders in Orderstbl');
    console.log('Trader: ahmed@trader.com / password123');
    console.log('Driver: mo@driver.com / password123');
    process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
