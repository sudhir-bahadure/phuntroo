package com.phuntroo.orchestrator.dto.cohere;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class CohereRequest {
    private String message;
    private List<CohereMessage> chat_history;
    private String model;
    private Double temperature;

    @Data
    @Builder
    public static class CohereMessage {
        private String role;
        private String message;
    }
}
