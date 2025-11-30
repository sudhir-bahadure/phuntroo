package com.phuntroo.orchestrator.client;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class CohereClient {

    @Value("${cohere.api.key}")
    private String apiKey;

    @Value("${cohere.api.url:https://api.cohere.ai/v1/chat}")
    private String apiUrl;

    private final RestTemplate restTemplate;

    public String generateChat(String message) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        // Simple request body for Cohere Chat API
        // Docs: https://docs.cohere.com/reference/chat
        Map<String, Object> body = Map.of(
            "message", message,
            "model", "command",
            "temperature", 0.3
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<CohereResponse> response = restTemplate.postForEntity(apiUrl, request, CohereResponse.class);
            if (response.getBody() != null && response.getBody().getText() != null) {
                return response.getBody().getText();
            }
        } catch (Exception e) {
            // Fallback or error logging
            System.err.println("Error calling Cohere API: " + e.getMessage());
            return "I'm having trouble connecting to my brain right now. Please try again.";
        }
        
        return "I didn't get a response.";
    }

    @Data
    public static class CohereResponse {
        private String text;
        private String generation_id;
        private String response_id;
        private String token_count;
    }
}
