package com.phuntroo.orchestrator.api;

import com.phuntroo.orchestrator.dto.ChatRequest;
import com.phuntroo.orchestrator.dto.ChatResponse;
import com.phuntroo.orchestrator.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Allow all origins for now (dev mode)
public class ChatController {

    private final ChatService chatService;

    @GetMapping("/health")
    public Map<String, String> healthCheck() {
        return Map.of(
            "status", "online",
            "service", "Phuntroo Orchestrator",
            "version", "1.0.0"
        );
    }

    @PostMapping("/chat")
    public ChatResponse chat(@RequestBody ChatRequest request) {
        return chatService.processChat(request);
    }
}
