package klu.controller;


import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import klu.model.User;
import klu.model.usersManager;
import klu.model.OTPService;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    usersManager UM;

    @Autowired
    OTPService otpService;

    // Registration endpoint
    @PostMapping("/signup")
    public String signup(@RequestBody User user) {
        try {
            return UM.addUser(user);
        } catch (Exception e) {
            System.err.println("Error in signup endpoint: " + e.getMessage());
            e.printStackTrace();
            return "500::Internal server error: " + e.getMessage();
        }
    }

    // Login endpoint
    @PostMapping("/signin")
    public String signin(@RequestBody User user) {
        return UM.validateCredentials(user.getEmail(), user.getPassword());
    }

    // Get fullname from token (for dashboard display)
    @PostMapping("/getfullname")
    public String getFullname(@RequestBody Map<String, String> data) {
        return UM.getFullname(data.get("csrid"));
    }

    // Send OTP for password reset
    @PostMapping("/send-otp")
    public String sendOTP(@RequestBody Map<String, String> data) {
        try {
            String email = data.get("email");
            if (email == null || email.trim().isEmpty()) {
                return "400::Email is required";
            }
            return otpService.sendOTP(email);
        } catch (Exception e) {
            System.err.println("Error in send OTP endpoint: " + e.getMessage());
            e.printStackTrace();
            return "500::Internal server error: " + e.getMessage();
        }
    }

    // Verify OTP and reset password
    @PostMapping("/forgot-password")
    public String forgotPassword(@RequestBody Map<String, String> data) {
        try {
            String email = data.get("email");
            String otp = data.get("otp");
            String newPassword = data.get("newPassword");

            if (email == null || email.trim().isEmpty()) {
                return "400::Email is required";
            }
            if (otp == null || otp.trim().isEmpty()) {
                return "400::OTP is required";
            }
            if (newPassword == null || newPassword.trim().isEmpty()) {
                return "400::New password is required";
            }

            // Verify OTP first
            String otpVerification = otpService.verifyOTP(email, otp);
            if (!otpVerification.startsWith("200::")) {
                return otpVerification;
            }

            // OTP verified, now reset password
            return UM.resetPassword(email, newPassword);
        } catch (Exception e) {
            System.err.println("Error in forgot password endpoint: " + e.getMessage());
            e.printStackTrace();
            return "500::Internal server error: " + e.getMessage();
        }
    }
}
