import { AIConfig, AIProvider } from "../types";
import { AIProviderBase } from "./base";
import { OpenAIProvider } from "./openai";

export class AIProviderFactory {
  static createProvider(config: AIConfig): AIProviderBase {
    if (!config.enabled) {
      throw new Error("AI 功能未启用");
    }

    switch (config.provider) {
      case "openai":
      case "azure":
        return new OpenAIProvider(config);
      case "anthropic":
        // TODO: Implement Anthropic provider
        throw new Error("Anthropic provider not implemented yet");
      case "google":
        // TODO: Implement Google provider
        throw new Error("Google provider not implemented yet");
      case "deepseek":
        // DeepSeek uses OpenAI-compatible API
        return new OpenAIProvider({
          ...config,
          apiEndpoint: config.apiEndpoint || "https://api.deepseek.com/v1",
        });
      case "custom":
        // Custom provider uses OpenAI-compatible API
        return new OpenAIProvider(config);
      default:
        throw new Error(`Unknown AI provider: ${config.provider}`);
    }
  }
}
