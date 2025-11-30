package com.phuntroo.orchestrator.service;

import com.phuntroo.orchestrator.client.CohereClient;
import com.phuntroo.orchestrator.dto.ChatRequest;
import com.phuntroo.orchestrator.dto.ChatResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final CohereClient cohereClient;

    public ChatResponse processChat(ChatRequest request) {
        String reply = cohereClient.generateChat(request.getMessage());
        
        return ChatResponse.builder()
                .reply(reply)
                .provider("Cohere")
                .build();
    }
}
