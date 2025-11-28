package klu.model;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import klu.repo.UserRepository;

@Service
public class usersManager {

    @Autowired
    UserRepository UR;

    @Autowired
    JMTManager JWT;

    // Register a user
    public String addUser(User user) {
        try {
            // Validate required fields
            if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
                return "400::Email is required";
            }
            if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
                return "400::Password is required";
            }
            if (user.getFullname() == null || user.getFullname().trim().isEmpty()) {
                return "400::Full name is required";
            }
            
            // Check if email already exists
            if (UR.validateEmail(user.getEmail()) > 0) {
                return "404::Email already exists";
            }
            
            // Save user
            UR.save(user);
            return "200::User registration successful";
        } catch (Exception e) {
            System.err.println("Error registering user: " + e.getMessage());
            e.printStackTrace();
            return "500::Error registering user: " + e.getMessage();
        }
    }

    // Login user (and return token)
    public String validateCredentials(String email, String password) {
        if (UR.validateCredentials(email, password) > 0) {
            String token = JWT.generateToken(email);
            return "200::" + token;
        }
        return "401::Invalid credentials";
    }

    // Get user fullname from token
    public String getFullname(String token) {
        String email = JWT.validateToken(token);
        if (email.equals("401")) {
            return "401::Token Expired!";
        }

        if (email.equals("admin@gmail.com")) {
            return "Admin"; // Display "Admin" in top right
        }

        User user = UR.findById(email).orElse(null);
        if (user == null) {
            return "401::User not found";
        }

        return user.getFullname();
    }

    // Reset password (forgot password) - requires OTP verification
    public String resetPassword(String email, String newPassword) {
        try {
            if (email == null || email.trim().isEmpty()) {
                return "400::Email is required";
            }
            if (newPassword == null || newPassword.trim().isEmpty()) {
                return "400::Password is required";
            }

            User user = UR.findById(email).orElse(null);
            if (user == null) {
                return "404::User not found with this email";
            }

            user.setPassword(newPassword);
            UR.save(user);
            return "200::Password reset successfully";
        } catch (Exception e) {
            System.err.println("Error resetting password: " + e.getMessage());
            e.printStackTrace();
            return "500::Error resetting password: " + e.getMessage();
        }
    }
}
