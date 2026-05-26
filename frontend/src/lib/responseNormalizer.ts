export function normalizeResponse(content: string): string {
  if (!content) return '';

  let normalized = content.trim();

  // 1. Remove reasoning-like prefixes
  const prefixes = [
    /^(?:The user said|User asked)[^\n]*\n+/i,
    /^(?:Analysis|Reasoning|Thinking):[\s\n]*/i,
  ];

  let changed = true;
  while (changed) {
    changed = false;
    for (const regex of prefixes) {
      const match = normalized.match(regex);
      if (match && match.index === 0) {
        normalized = normalized.replace(regex, '').trimStart();
        changed = true;
      }
    }
  }

  // 2. Remove accidental code block wrapping around plain text
  const fullCodeBlockRegex = /^```[a-z]*\n([\s\S]*?)\n```$/i;
  const cbMatch = normalized.match(fullCodeBlockRegex);
  if (cbMatch) {
    // Only unwrap if there are no inner code blocks
    if (!cbMatch[1].includes('```')) {
      normalized = cbMatch[1].trim();
    }
  }

  // 3. Remove duplicated blank lines (3 or more newlines become exactly 2)
  normalized = normalized.replace(/\n{3,}/g, '\n\n');

  // 4. Trim leading/trailing whitespace
  return normalized.trim();
}
