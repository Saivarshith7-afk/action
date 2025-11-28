package klu.controller;


import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import klu.model.Order;
import klu.model.OrderManager;

@RestController
@RequestMapping("/orders")
public class OrderController {

    @Autowired
    OrderManager OM;

    @PostMapping("/place")
    public String placeOrder(@RequestBody Order O) {
        return OM.placeOrder(O);
    }

    @PostMapping("/getbyuser")
    public List<Order> getOrdersByUser(@RequestBody Map<String, String> data) {
        return OM.getOrdersByUser(data.get("email"));
    }

    @GetMapping("/all")
    public List<Order> getAllOrders() {
        return OM.getAllOrders();
    }

    @PostMapping("/cancel")
    public String cancelOrder(@RequestBody Map<String, Integer> data) {
        Integer orderId = data.get("orderId");
        if (orderId == null) {
            return "400::Order ID is required";
        }
        return OM.cancelOrder(orderId);
    }
}

