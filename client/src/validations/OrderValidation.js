import * as yup from "yup";

export const OrderValidation = yup.object().shape({
    pickupLocation:   yup.string().required("Pickup location is required"),
    deliveryLocation: yup.string().required("Delivery location is required"),
    cargoType:        yup.string().required("Cargo type is required"),
    weight:           yup.number().typeError("Enter a valid number").min(0.1, "Weight must be greater than 0").required("Weight is required"),
    distance:         yup.number().typeError("Enter a valid number").min(1, "Distance must be at least 1 km").required("Distance is required"),
    vehicleType:      yup.string().required("Please select a vehicle type")
});
