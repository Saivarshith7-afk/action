package klu.model;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import klu.repo.OrderRepository;

@Service
public class OrderManager {

    @Autowired
    OrderRepository OR;
    @Autowired
    WalletManager WM;

    public String placeOrder(Order O) {
        O.setOrderDate(LocalDateTime.now());
        OR.save(O);
        WM.deductBalance(O.getBuyerEmail(), O.getAmount());
        return "200::Order placed successfully";
    }

    public List<Order> getOrdersByUser(String email) {
        return OR.findByBuyerEmail(email);
    }

    public List<Order> getAllOrders() {
        return OR.findAll();
    }

    public String cancelOrder(int orderId) {
        Order order = OR.findById(orderId).orElse(null);
        if (order == null) {
            return "404::Order Not Found";
        }
        
        // Refund the amount to user's wallet
        WM.creditBalance(order.getBuyerEmail(), order.getAmount());
        
        // Delete the order
        OR.deleteById(orderId);
        
        return "200::Order cancelled and refund processed";
    }
}
