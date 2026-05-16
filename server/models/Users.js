import mongoose from "mongoose";

const UserSchema = mongoose.Schema({
    fullName:           { type: String, required: true },
    email:              { type: String, required: true, unique: true },
    password:           { type: String, required: true },
    phone:              { type: String, required: true },
    userType:           { type: String, required: true },   // "trader" or "driver"
    isActive:           { type: Boolean, default: true },
    // Driver fields
    licenseNumber:      { type: String, default: null },
    vehicleType:        { type: String, default: null },
    baseRate:           { type: Number, default: null },
    isAvailable:        { type: Boolean, default: true },
    // Trader fields
    companyName:        { type: String, default: null },
    registrationNumber: { type: String, default: null },
    businessCategory:   { type: String, default: null },
    // Location
    lat:                { type: Number, default: null },
    lng:                { type: Number, default: null },
    rating:             { type: Number, default: 5.0 },
    totalTrips:         { type: Number, default: 0 },
    isAdmin:            { type: Boolean, default: false },
    profilePic:         { type: String, default: null }
}, { timestamps: { createdAt: true, updatedAt: false } });

const UserModel = mongoose.model("Usertbl", UserSchema, "Usertbl");
export default UserModel;
