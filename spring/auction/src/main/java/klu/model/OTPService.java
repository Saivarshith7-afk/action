package klu.model;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OTPService {

    @Autowired
    private JavaMailSender mailSender;

    // Store OTPs temporarily (in production, use Redis or database)
    private final Map<String, OTPData> otpStore = new ConcurrentHashMap<>();
    private static final int OTP_EXPIRY_MINUTES = 10;
    private static final String FROM_EMAIL = "kanajamsaivarshith@gmail.com";

    private static class OTPData {
        String otp;
        long expiryTime;

        OTPData(String otp) {
            this.otp = otp;
            this.expiryTime = System.currentTimeMillis() + (OTP_EXPIRY_MINUTES * 60 * 1000);
        }

        boolean isExpired() {
            return System.currentTimeMillis() > expiryTime;
        }
    }

    public String generateOTP() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000); // 6-digit OTP
        return String.valueOf(otp);
    }

    public String sendOTP(String email) {
        try {
            // Validate email format
            if (email == null || email.trim().isEmpty() || !email.contains("@")) {
                return "400::Invalid email address";
            }
            
            // Check if user exists in database (optional validation)
            // You can add this check if needed
            
            // Generate OTP
            String otp = generateOTP();
            System.out.println("========================================");
            System.out.println("Generated OTP for " + email + ": " + otp);
            System.out.println("========================================");
            
            // Store OTP with expiry
            otpStore.put(email.toLowerCase().trim(), new OTPData(otp));
            
            // Send email
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(FROM_EMAIL);
            message.setTo(email);
            message.setSubject("Password Reset OTP - Online Auction Platform");
            message.setText("Dear User,\n\n" +
                    "You have requested to reset your password. Please use the following OTP to reset your password:\n\n" +
                    "OTP: " + otp + "\n\n" +
                    "This OTP is valid for " + OTP_EXPIRY_MINUTES + " minutes.\n\n" +
                    "If you did not request this password reset, please ignore this email.\n\n" +
                    "Best regards,\n" +
                    "Online Auction Platform Team");
            
            System.out.println("Attempting to send email to: " + email);
            System.out.println("From email: " + FROM_EMAIL);
            mailSender.send(message);
            System.out.println("Email sent successfully to: " + email);
            System.out.println("========================================");
            
            return "200::OTP sent successfully to your email";
        } catch (Exception e) {
            System.err.println("========================================");
            System.err.println("Error sending OTP: " + e.getMessage());
            System.err.println("Error class: " + e.getClass().getName());
            e.printStackTrace();
            System.err.println("========================================");
            return "500::Error sending OTP: " + e.getMessage() + ". Please check email configuration.";
        }
    }

    public String verifyOTP(String email, String otp) {
        OTPData otpData = otpStore.get(email.toLowerCase().trim());
        
        if (otpData == null) {
            return "404::OTP not found. Please request a new OTP.";
        }
        
        if (otpData.isExpired()) {
            otpStore.remove(email.toLowerCase().trim());
            return "401::OTP has expired. Please request a new OTP.";
        }
        
        if (!otpData.otp.equals(otp.trim())) {
            return "400::Invalid OTP. Please try again.";
        }
        
        // OTP verified successfully
        otpStore.remove(email.toLowerCase().trim());
        return "200::OTP verified successfully";
    }

    public void clearExpiredOTPs() {
        otpStore.entrySet().removeIf(entry -> entry.getValue().isExpired());
    }
}

