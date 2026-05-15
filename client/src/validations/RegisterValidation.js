import * as yup from "yup";

export const RegisterValidation = yup.object().shape({
    fullName: yup.string().required("Full name is required"),
    email:    yup.string().email("Invalid email format").required("Email is required"),
    phone:    yup.string().required("Phone number is required"),
    password: yup.string().min(8, "Password must be at least 8 characters").required("Password is required"),
    confirmPassword: yup.string()
        .oneOf([yup.ref("password")], "Passwords must match")
        .required("Confirm Password is required"),
    userType: yup.string().required("Please select user type")
});
