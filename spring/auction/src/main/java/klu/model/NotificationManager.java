package klu.model;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import klu.repo.NotificationRepository;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationManager {

    @Autowired
    private NotificationRepository notificationRepository;

    public void createNotification(String userEmail, String message, String type, Integer productId) {
        Notification notification = new Notification();
        notification.setUserEmail(userEmail);
        notification.setMessage(message);
        notification.setType(type);
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        notification.setProductId(productId);
        notificationRepository.save(notification);
    }

    public List<Notification> getUserNotifications(String userEmail) {
        return notificationRepository.findByUserEmailOrderByCreatedAtDesc(userEmail);
    }

    public List<Notification> getUnreadNotifications(String userEmail) {
        return notificationRepository.findByUserEmailAndReadFalseOrderByCreatedAtDesc(userEmail);
    }

    public long getUnreadCount(String userEmail) {
        return notificationRepository.countByUserEmailAndReadFalse(userEmail);
    }

    public String markAsRead(int notificationId) {
        Notification notification = notificationRepository.findById(notificationId).orElse(null);
        if (notification == null) {
            return "404::Notification Not Found";
        }
        notification.setRead(true);
        notificationRepository.save(notification);
        return "200::Notification marked as read";
    }

    public String markAllAsRead(String userEmail) {
        List<Notification> unreadNotifications = getUnreadNotifications(userEmail);
        for (Notification notification : unreadNotifications) {
            notification.setRead(true);
            notificationRepository.save(notification);
        }
        return "200::All notifications marked as read";
    }
}



