import { toast } from "react-hot-toast";
import { BASE_URL } from "./Utils/Config";
import axios from "axios";

export function getLocal() {
  return localStorage.getItem("authToken");
}

export async function adminLogin(email, password) {
    try {
        const response = await axios.post(`${BASE_URL}/accounts/login/`, {
            email,
            password,
        });

        const data = response.data;

        if (response.status === 200) {
            const adminToken = data.access;  
            localStorage.setItem('adminAuthToken', adminToken); 
            toast.success('Admin Login Success');
            return data;
        } else {
            toast.error('Invalid Admin Credentials');
            return null;
        }
    } catch (error) {
        console.error('Error during admin login:', error);
        toast.error('An error occurred during admin login');
        return null;
    }
}


export async function companyLogin(username, password) {
    try {
        const response = await axios.post(`${BASE_URL}/company/company/login/`, {
            username,
            password,
        });

        if (response.status === 200) {
            const { access, refresh, company_id, company_name, role, ...companyData } = response.data;

            console.log("Login Successful");
            console.log("Access Token:", access);
            console.log("Refresh Token:", refresh);
            console.log("Company ID:", company_id);
            console.log("Company Name:", company_name);
            console.log("Company Data:", companyData);

            // Store access tokens
            localStorage.setItem("accessToken", access);
            localStorage.setItem("refreshToken", refresh);
            localStorage.setItem("role", role);

            // Store company ID and details if role is company
            if (role === "company" && company_id) {
                localStorage.setItem("company_id", company_id);
                localStorage.setItem("company_name", company_name);
                console.log("Stored company_id:", localStorage.getItem("company_id"));

                Object.keys(companyData).forEach((key) => {
                    localStorage.setItem(`company_${key}`, JSON.stringify(companyData[key]));
                });
            }

            // Remove user data if switching from user to company
            localStorage.removeItem("user_id");
            localStorage.removeItem("userAccessToken");
            localStorage.removeItem("userRefreshToken");

            toast.success("Admin Login Success");
            return response.data;
        } else {
            toast.error("Invalid Admin Credentials");
            return null;
        }
    } catch (error) {
        console.error("Error during admin login:", error);
        toast.error(error.response?.data?.error || "An error occurred during admin login.");
        return null;
    }
}
