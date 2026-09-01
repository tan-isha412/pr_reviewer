function getPromptTone() {
    const tone = process.env.PROMPT_TONE;
    return tone.toUpperCase();
}

export default getPromptTone;
