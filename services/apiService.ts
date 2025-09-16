import type { UltraScore } from '../types';

export const analyzeProduct = async (term: string, base64Image?: string): Promise<UltraScore> => {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ term, image: base64Image }),
  });

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    try {
      // Attempt to parse a JSON error response from the server
      const errorData = await response.json();
      errorMessage = errorData.message || 'An error occurred during analysis.';
    } catch (e) {
      // If parsing fails, the response is not JSON. Use the raw text.
      // This is crucial for capturing HTML error pages from Vercel.
      const textError = await response.text();
      // Only use the text error if it's not empty, otherwise keep the status message.
      if (textError) {
        errorMessage = textError;
      }
    }
    throw new Error(errorMessage);
  }

  return response.json();
};