package klu.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import klu.model.Notification;

public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    List<Notification> findByUserEmailOrderByCreatedAtDesc(String userEmail);
    List<Notification> findByUserEmailAndReadFalseOrderByCreatedAtDesc(String userEmail);
    long countByUserEmailAndReadFalse(String userEmail);
}



