function parseResponse(rawText) {
    const cleaned = rawText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    try {
        return JSON.parse(cleaned);
    } catch (err) {
        console.warn("Failed to parse LLM response:", rawText);
        return null;
    }
}

export default parseResponse;