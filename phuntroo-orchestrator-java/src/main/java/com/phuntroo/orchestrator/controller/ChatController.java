package com.phuntroo.orchestrator.controller;

import com.phuntroo.orchestrator.dto.ChatRequest;
import com.phuntroo.orchestrator.dto.ChatResponse;
import com.phuntroo.orchestrator.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*") // Allow all origins for now, restrict in production
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        ChatResponse response = chatService.processChat(request);
        return ResponseEntity.ok(response);
    }
}
