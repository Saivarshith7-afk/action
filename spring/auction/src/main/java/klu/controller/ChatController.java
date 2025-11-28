package klu.controller;

import klu.model.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/chat")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @PostMapping("/message")
    public Map<String, String> sendMessage(@RequestBody Map<String, String> request) {
        String userMessage = request.get("message");
        String userEmail = request.get("email");
        
        if (userMessage == null || userMessage.trim().isEmpty()) {
            return Map.of("response", "Please enter a message.");
        }
        
        return chatService.getChatResponse(userMessage, userEmail);
    }
}



