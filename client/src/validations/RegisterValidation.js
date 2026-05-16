import * as yup from "yup";

export const RegisterValidation = yup.object().shape({
    fullName: yup.string().required("Full name is required"),
    email:    yup.string().email("Invalid email format").required("Email is required"),
    phone:    yup.string().required("Phone number is required"),
    password: yup.string()
        .required("Password is required")
        .min(8, "Password must be at least 8 characters")
        .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
        .matches(/[a-z]/, "Password must contain at least one lowercase letter")
        .matches(/[0-9]/, "Password must contain at least one number")
        .matches(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character"),
    confirmPassword: yup.string()
        .oneOf([yup.ref("password")], "Passwords must match")
        .required("Confirm Password is required"),
    userType: yup.string().required("Please select user type")
});
