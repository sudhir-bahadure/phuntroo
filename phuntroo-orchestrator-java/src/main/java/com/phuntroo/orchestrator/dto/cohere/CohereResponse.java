package com.phuntroo.orchestrator.dto.cohere;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class CohereResponse {
    private String text;
    private String generation_id;
    private String response_id;
    private String token_count;
}
