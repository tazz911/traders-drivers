import mongoose from "mongoose";

const OrderSchema = mongoose.Schema({
    traderEmail:         { type: String, required: true },
    driverEmail:         { type: String, default: null },
    pickupLocation:      { type: String, required: true },
    deliveryLocation:    { type: String, required: true },
    pickupLat:           { type: Number, default: null },
    pickupLng:           { type: Number, default: null },
    deliveryLat:         { type: Number, default: null },
    deliveryLng:         { type: Number, default: null },
    distance:            { type: Number, required: true },
    weight:              { type: Number, required: true },
    vehicleType:         { type: String, required: true },
    specialInstructions: { type: String, default: "" },
    isUrgent:            { type: Boolean, default: false },
    scheduledDate:       { type: Date, default: null },
    status:              { type: String, default: "pending" },
    // Server-side calculated fare fields
    baseFare:            { type: Number, default: 0 },
    weightSurcharge:     { type: Number, default: 0 },
    vehicleMultiplier:   { type: Number, default: 1 },
    estimatedFare:       { type: Number, default: 0 },
    currency:            { type: String, default: "OMR" },
    // Payment
    isPaid:              { type: Boolean, default: false },
    paymentMethod:       { type: String, default: null },
    completedAt:         { type: Date, default: null }
}, { timestamps: { createdAt: true, updatedAt: false } });

const OrderModel = mongoose.model("Orderstbl", OrderSchema, "Orderstbl");
export default OrderModel;
