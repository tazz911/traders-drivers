import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import UserModel from './models/Users.js';
import OrderModel from './models/Orders.js';
import bcrypt from 'bcrypt';

const app = express();

app.use(cors());
app.use(express.json());

app.listen(3002, () => {
    console.log("Server Connected...")
});

// ── Database Connection ───────────────────────────────────────────────
const conStr = "mongodb+srv://admin:admin123@cluster0.wdwfrgb.mongodb.net/T&D?appName=Cluster0";
mongoose.connect(conStr)
    .then(() => { console.log("Database Connected..") })
    .catch(error => { console.log("Database Error..." + error) });

// ── Fare Calculator (Business Logic / Server-side Processing) ─────────
const VEHICLE_RATES = {
    bike:         { multiplier: 1.0, basePerKm: 0.150 },
    auto:         { multiplier: 1.2, basePerKm: 0.200 },
    truck_small:  { multiplier: 1.5, basePerKm: 0.350 },
    truck_medium: { multiplier: 1.8, basePerKm: 0.500 },
    truck_large:  { multiplier: 2.2, basePerKm: 0.700 },
    truck_xlarge: { multiplier: 2.8, basePerKm: 0.950 }
};
const WEIGHT_RATE   = 0.010;
const URGENT_RATE   = 0.15;
const MIN_FARE      = 1.500;

function calculateFare(distance, weight, vehicleType, isUrgent) {
    const v = VEHICLE_RATES[vehicleType] || VEHICLE_RATES['truck_small'];
    const baseFare       = parseFloat((distance * v.basePerKm * v.multiplier).toFixed(3));
    const weightSurcharge = parseFloat((weight * WEIGHT_RATE).toFixed(3));
    let total = baseFare + weightSurcharge;
    if (isUrgent) total = total * (1 + URGENT_RATE);
    return {
        baseFare,
        weightSurcharge,
        vehicleMultiplier: v.multiplier,
        estimatedFare: parseFloat(Math.max(total, MIN_FARE).toFixed(3)),
        currency: "OMR"
    };
}

// ── USER ROUTES ───────────────────────────────────────────────────────

// GET all users  →  http://localhost:3002/getUsers
app.get("/getUsers", async (req, res) => {
    try {
        const users = await UserModel.find({});
        res.send(users);
    } catch (error) {
        res.send("Read Error..." + error);
    }
});

// POST register  →  http://localhost:3002/register
app.post("/register", async (req, res) => {
    try {
        const { fullName, email, password, phone, userType,
                licenseNumber, vehicleType, baseRate,
                companyName, registrationNumber, businessCategory } = req.body;

        const existing = await UserModel.findOne({ email });
        if (existing) {
            res.send({ message: "User Exists" });
        } else {
            // Validation: password min length
            if (!password || password.length < 6) {
                return res.send({ message: "Password must be at least 6 characters" });
            }
            const hpwd = await bcrypt.hash(password, 10);
            const newUser = new UserModel({
                fullName, email, password: hpwd, phone, userType, isActive: true,
                ...(userType === "driver" && { licenseNumber, vehicleType, baseRate: parseFloat(baseRate) || 0.350 }),
                ...(userType === "trader" && { companyName, registrationNumber, businessCategory })
            });
            await newUser.save();
            res.send({ message: "User Registered" });
        }
    } catch (error) {
        res.send("Read Error..." + error);
    }
});

// POST login  →  http://localhost:3002/login
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email });
        if (user) {
            const match = await bcrypt.compare(password, user.password);
            if (match)
                res.send({ user, message: "success" });
            else
                res.send({ message: "Invalid Credentials" });
        } else {
            res.send({ message: "Invalid Credentials" });
        }
    } catch (error) {
        res.send("Read Error..." + error);
    }
});

// PUT update driver location  →  http://localhost:3002/updateLocation
app.put("/updateLocation", async (req, res) => {
    try {
        const { email, lat, lng } = req.body;
        await UserModel.findOneAndUpdate({ email }, { lat, lng });
        res.send({ message: "Location Updated" });
    } catch (error) {
        res.send("Read Error..." + error);
    }
});

// ── ORDER ROUTES ──────────────────────────────────────────────────────

// GET all orders for a trader  →  http://localhost:3002/getOrders?email=x&status=y
app.get("/getOrders", async (req, res) => {
    try {
        const { email, status } = req.query;
        let query = {};
        if (email)  query.traderEmail = email;
        if (status) query.status = status;

        const orders = await OrderModel.aggregate([
            { $match: query },
            {
                $lookup: {
                    from: "Usertbl",
                    localField: "traderEmail",
                    foreignField: "email",
                    as: "trader"
                }
            },
            {
                $lookup: {
                    from: "Usertbl",
                    localField: "driverEmail",
                    foreignField: "email",
                    as: "driver"
                }
            },
            { $sort: { createdAt: -1 } },
            {
                $project: {
                    "trader.password": 0,
                    "driver.password": 0
                }
            }
        ]);
        res.send({ orders });
    } catch (error) {
        res.send("Read Error..." + error);
    }
});

// GET available (pending) orders for drivers  →  http://localhost:3002/getAvailableOrders
app.get("/getAvailableOrders", async (req, res) => {
    try {
        const orders = await OrderModel.aggregate([
            { $match: { status: "pending" } },
            {
                $lookup: {
                    from: "Usertbl",
                    localField: "traderEmail",
                    foreignField: "email",
                    as: "trader"
                }
            },
            { $sort: { createdAt: -1 } },
            { $project: { "trader.password": 0 } }
        ]);
        res.send({ orders });
    } catch (error) {
        res.send("Read Error..." + error);
    }
});

// POST create order  →  http://localhost:3002/saveOrder
app.post("/saveOrder", async (req, res) => {
    try {
        const { traderEmail, pickupLocation, deliveryLocation,
                pickupLat, pickupLng, deliveryLat, deliveryLng,
                distance, weight, vehicleType, specialInstructions,
                isUrgent, scheduledDate } = req.body;

        // Server-side fare calculation (business logic + validation)
        if (!pickupLocation || !deliveryLocation || !distance || !weight || !vehicleType) {
            return res.send({ message: "Missing required fields" });
        }
        if (distance <= 0 || weight <= 0) {
            return res.send({ message: "Distance and weight must be greater than 0" });
        }

        const fareData = calculateFare(
            parseFloat(distance),
            parseFloat(weight),
            vehicleType,
            !!isUrgent
        );

        const newOrder = new OrderModel({
            traderEmail, pickupLocation, deliveryLocation,
            pickupLat: pickupLat || null, pickupLng: pickupLng || null,
            deliveryLat: deliveryLat || null, deliveryLng: deliveryLng || null,
            distance: parseFloat(distance),
            weight: parseFloat(weight),
            vehicleType, specialInstructions, isUrgent: !!isUrgent,
            scheduledDate: scheduledDate || null,
            ...fareData
        });
        await newOrder.save();
        res.send({ message: "Order Posted", order: newOrder });
    } catch (error) {
        res.send("Read Error..." + error);
    }
});

// PUT accept order (driver)  →  http://localhost:3002/acceptOrder
app.put("/acceptOrder", async (req, res) => {
    try {
        const { orderid, driverEmail } = req.body;
        const order = await OrderModel.findOne({ _id: orderid });
        if (!order) return res.send({ message: "Order Not Found" });
        if (order.status !== "pending") return res.send({ message: "Order Not Available" });
        order.driverEmail = driverEmail;
        order.status = "accepted";
        await order.save();
        res.send({ message: "Order Accepted" });
    } catch (error) {
        res.send("Read Error..." + error);
    }
});

// PUT complete order (driver)  →  http://localhost:3002/completeOrder
app.put("/completeOrder", async (req, res) => {
    try {
        const { orderid } = req.body;
        const order = await OrderModel.findOne({ _id: orderid });
        if (!order) return res.send({ message: "Order Not Found" });
        order.status = "completed";
        order.completedAt = new Date();
        await order.save();
        res.send({ message: "Order Completed" });
    } catch (error) {
        res.send("Read Error..." + error);
    }
});

// PUT update order (trader edit)  →  http://localhost:3002/updOrder
app.put("/updOrder", async (req, res) => {
    try {
        const { orderid, pickupLocation, deliveryLocation,
                distance, weight, vehicleType, specialInstructions, isUrgent } = req.body;

        const order = await OrderModel.findOne({ _id: orderid });
        if (!order) return res.send({ message: "Order Not Found" });
        if (order.status !== "pending") return res.send({ message: "Only pending orders can be edited" });

        // Recalculate fare with new values
        const fareData = calculateFare(
            parseFloat(distance),
            parseFloat(weight),
            vehicleType,
            !!isUrgent
        );

        order.pickupLocation     = pickupLocation;
        order.deliveryLocation   = deliveryLocation;
        order.distance           = parseFloat(distance);
        order.weight             = parseFloat(weight);
        order.vehicleType        = vehicleType;
        order.specialInstructions = specialInstructions;
        order.isUrgent           = !!isUrgent;
        order.baseFare           = fareData.baseFare;
        order.weightSurcharge    = fareData.weightSurcharge;
        order.vehicleMultiplier  = fareData.vehicleMultiplier;
        order.estimatedFare      = fareData.estimatedFare;
        await order.save();
        res.send({ message: "Order Updated" });
    } catch (error) {
        res.send("Read Error..." + error);
    }
});

// PUT cancel order  →  http://localhost:3002/cancelOrder
app.put("/cancelOrder", async (req, res) => {
    try {
        const { orderid } = req.body;
        const order = await OrderModel.findOne({ _id: orderid });
        if (!order) return res.send({ message: "Order Not Found" });
        if (!["pending","accepted"].includes(order.status))
            return res.send({ message: "Cannot cancel at this stage" });
        order.status = "cancelled";
        await order.save();
        res.send({ message: "Order Cancelled" });
    } catch (error) {
        res.send("Read Error..." + error);
    }
});

// PUT pay order  →  http://localhost:3002/payOrder
app.put("/payOrder", async (req, res) => {
    try {
        const { orderid, paymentMethod } = req.body;
        const order = await OrderModel.findOne({ _id: orderid });
        if (!order) return res.send({ message: "Order Not Found" });
        order.isPaid = true;
        order.paymentMethod = paymentMethod;
        await order.save();
        res.send({ message: "Payment Successful" });
    } catch (error) {
        res.send("Read Error..." + error);
    }
});

// DELETE order  →  http://localhost:3002/delOrder/:orderid
app.delete("/delOrder/:orderid", async (req, res) => {
    try {
        const orderid = req.params.orderid;
        const order = await OrderModel.findOne({ _id: orderid });
        if (!order) return res.send({ message: "Order Not Found" });
        if (order.status !== "pending") return res.send({ message: "Only pending orders can be deleted" });
        const del = await OrderModel.findOneAndDelete({ _id: orderid });
        if (del)
            res.send({ message: "Order Deleted" });
        else
            res.send({ message: "Order Not Deleted" });
    } catch (error) {
        res.send("Read Error..." + error);
    }
});
