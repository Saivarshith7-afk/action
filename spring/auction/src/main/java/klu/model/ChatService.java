package klu.model;

import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;

@Service
public class ChatService {

    public Map<String, String> getChatResponse(String userMessage, String userEmail) {
        String lowerMsg = userMessage.toLowerCase().trim();
        String response = "";
        
        // Bidding related queries
        if (lowerMsg.contains("bid") || lowerMsg.contains("bidding") || lowerMsg.contains("place bid")) {
            response = "To place a bid:\n" +
                      "1. Go to 'All Products' or search for a product\n" +
                      "2. Click on a product to view details\n" +
                      "3. Click 'Place Bid' button\n" +
                      "4. Enter your bid amount (must be higher than current highest bid)\n" +
                      "5. Confirm your bid\n\n" +
                      "You'll be notified if you're outbid or if you have the winning bid!";
        }
        // Order related queries
        else if (lowerMsg.contains("order") || lowerMsg.contains("purchase") || lowerMsg.contains("buy")) {
            response = "To place an order:\n" +
                      "1. Go to 'My Bids' page\n" +
                      "2. Find products where you have the winning bid\n" +
                      "3. Click 'Order Now' button\n" +
                      "4. Select or add a delivery address\n" +
                      "5. Review your order and click 'Place Order'\n\n" +
                      "You can track all your orders in the 'My Orders' page.";
        }
        // Wallet related queries
        else if (lowerMsg.contains("wallet") || lowerMsg.contains("money") || lowerMsg.contains("balance") || lowerMsg.contains("add money")) {
            response = "Wallet Management:\n" +
                      "• View your balance in the 'Wallet' page\n" +
                      "• Add money by clicking 'Add Money' and choosing a payment method\n" +
                      "• Your wallet balance is used for placing bids and making purchases\n" +
                      "• View all transactions in 'My Transactions' page\n\n" +
                      "You need sufficient balance to place bids or make purchases.";
        }
        // Product related queries
        else if (lowerMsg.contains("product") || lowerMsg.contains("item") || lowerMsg.contains("search")) {
            response = "Finding Products:\n" +
                      "• Browse all products in 'All Products' page\n" +
                      "• Use search and filters to find specific items\n" +
                      "• Click on any product to see details and place bids\n" +
                      "• View product images, descriptions, and current highest bid";
        }
        // Account related queries
        else if (lowerMsg.contains("account") || lowerMsg.contains("profile") || lowerMsg.contains("settings")) {
            response = "Account Management:\n" +
                      "• Your profile shows your name and email\n" +
                      "• Manage your wallet and transactions\n" +
                      "• View your bids and orders\n" +
                      "• Update delivery addresses when placing orders";
        }
        // Help or general queries
        else if (lowerMsg.contains("help") || lowerMsg.contains("how") || lowerMsg.contains("what") || lowerMsg.contains("?")) {
            response = "I can help you with:\n\n" +
                      "🔨 **Bidding**: How to place bids, check bid status\n" +
                      "🛒 **Orders**: How to place orders, track deliveries\n" +
                      "💰 **Wallet**: Adding money, checking balance\n" +
                      "📦 **Products**: Finding and viewing products\n" +
                      "👤 **Account**: Profile and settings\n\n" +
                      "Just ask me about any of these topics!";
        }
        // Greetings
        else if (lowerMsg.contains("hello") || lowerMsg.contains("hi") || lowerMsg.contains("hey")) {
            response = "Hello! 👋 I'm your auction platform assistant. " +
                      "I can help you with bidding, orders, wallet, products, and more. " +
                      "What would you like to know?";
        }
        // Default response
        else {
            response = "I'm here to help with your auction platform questions! " +
                      "I can assist with:\n" +
                      "• Bidding and placing bids\n" +
                      "• Orders and deliveries\n" +
                      "• Wallet and payments\n" +
                      "• Products and searching\n" +
                      "• Account management\n\n" +
                      "What would you like to know?";
        }
        
        Map<String, String> result = new HashMap<>();
        result.put("response", response);
        return result;
    }
}



