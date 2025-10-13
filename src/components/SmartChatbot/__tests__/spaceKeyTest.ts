// Test to verify that space key works in chatbot input
import { sanitizeInput } from '../utils/security';

describe('Space key functionality', () => {
  test('should preserve spaces in input', () => {
    // Test that spaces are preserved during real-time input (no trimming)
    const inputWithSpaces = "Hello world with spaces";
    const sanitized = sanitizeInput(inputWithSpaces, undefined, false);
    expect(sanitized).toBe(inputWithSpaces);
    
    // Test that spaces are trimmed during final submission
    const sanitizedTrimmed = sanitizeInput(inputWithSpaces, undefined, true);
    expect(sanitizedTrimmed).toBe(inputWithSpaces); // Should still be the same since spaces are in the middle
    
    // Test leading/trailing spaces
    const inputWithLeadingTrailingSpaces = "  Hello world  ";
    const sanitizedNoTrim = sanitizeInput(inputWithLeadingTrailingSpaces, undefined, false);
    expect(sanitizedNoTrim).toBe(inputWithLeadingTrailingSpaces);
    
    const sanitizedWithTrim = sanitizeInput(inputWithLeadingTrailingSpaces, undefined, true);
    expect(sanitizedWithTrim).toBe("Hello world");
  });
});