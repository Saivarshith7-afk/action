package klu.controller;

import klu.model.Notification;
import klu.model.NotificationManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    @Autowired
    private NotificationManager notificationManager;

    @GetMapping("/user")
    public List<Notification> getUserNotifications(@RequestParam String email) {
        return notificationManager.getUserNotifications(email);
    }

    @GetMapping("/unread")
    public List<Notification> getUnreadNotifications(@RequestParam String email) {
        return notificationManager.getUnreadNotifications(email);
    }

    @GetMapping("/unread-count")
    public Map<String, Long> getUnreadCount(@RequestParam String email) {
        return Map.of("count", notificationManager.getUnreadCount(email));
    }

    @PostMapping("/mark-read")
    public String markAsRead(@RequestParam int id) {
        return notificationManager.markAsRead(id);
    }

    @PostMapping("/mark-all-read")
    public String markAllAsRead(@RequestBody Map<String, String> data) {
        return notificationManager.markAllAsRead(data.get("email"));
    }
}



