export async function askGemmaStream(prompt, onToken, options = {}) {
  try {
    // ✅ FIX: Use the correct Ollama endpoint
    const response = await fetch("http://127.0.0.1:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemma3:4b",
        prompt,
        stream: true,
        keep_alive: "30m",
        options: {
          num_predict: options.num_predict ?? 150,
          temperature: options.temperature ?? 0.4,
          num_ctx: options.num_ctx ?? 2048,
          ...options,
        },
      }),
    });

    if (!response.ok || !response.body) {
      throw new Error(`Failed to connect to Ollama: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        try {
          const json = JSON.parse(trimmed);
          if (json.response) {
            fullText += json.response;
            onToken?.(json.response, fullText);
          }
          if (json.done) {
            return fullText;
          }
        } catch {
          // Skip malformed JSON
        }
      }
    }

    return fullText;
  } catch (error) {
    console.error("Ollama Stream Error:", error);
    const fallback = "Unable to connect to Gemma. Please make sure Ollama is running on http://127.0.0.1:11434";
    onToken?.(fallback, fallback);
    return fallback;
  }
}

// Non-streaming fallback
export async function askGemma(prompt) {
  try {
    const response = await fetch("http://127.0.0.1:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gemma3:4b",
        prompt,
        stream: false,
        keep_alive: "30m",
        options: {
          num_predict: 150,
          num_ctx: 2048,
        },
      }),
    });

    if (!response.ok) throw new Error("Failed to connect to Ollama");

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error("Ollama Error:", error);
    return "Unable to connect to Gemma. Please make sure Ollama is running.";
  }
}
