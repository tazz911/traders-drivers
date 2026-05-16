import mongoose from "mongoose";

const PaymentSchema = mongoose.Schema({
    orderId:          { type: mongoose.Schema.Types.ObjectId, ref: "Orderstbl", required: true },
    traderEmail:      { type: String, required: true },
    amount:           { type: Number, required: true },
    currency:         { type: String, default: "OMR" },
    cardholderName:   { type: String, required: true },
    last4:            { type: String, required: true },
    expiry:           { type: String, required: true },
    hashedCardNumber: { type: String, required: true },
    hashedCVV:        { type: String, required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

const PaymentModel = mongoose.model("Paymentbl", PaymentSchema, "Paymentbl");
export default PaymentModel;
