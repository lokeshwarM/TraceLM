import re

with open('C:/Projects/TraceLM/backend/src/main/java/com/tracelm/backend/service/ConversationService.java', 'r') as f:
    content = f.read()

if 'import com.tracelm.backend.service.PiiRedactionService;' not in content:
    content = content.replace('import org.springframework.stereotype.Service;', 'import org.springframework.stereotype.Service;\nimport com.tracelm.backend.service.PiiRedactionService;')

if 'private final PiiRedactionService piiRedactionService;' not in content:
    content = content.replace('private final LoggingService loggingService;', 'private final LoggingService loggingService;\n    private final PiiRedactionService piiRedactionService;')

content = re.sub(
    r'Message userMessage = Message\.builder\(\)\s*\.conversation\(conversation\)\s*\.role\("USER"\)\s*\.content\(prompt\)\s*\.build\(\);', 
    'String sanitizedPrompt = piiRedactionService.sanitize(prompt);\\n        boolean redacted = !prompt.equals(sanitizedPrompt);\\n        Message userMessage = Message.builder()\\n                .conversation(conversation)\\n                .role("USER")\\n                .content(sanitizedPrompt)\\n                .piiRedacted(redacted)\\n                .build();', 
    content
)

with open('C:/Projects/TraceLM/backend/src/main/java/com/tracelm/backend/service/ConversationService.java', 'w') as f:
    f.write(content)
