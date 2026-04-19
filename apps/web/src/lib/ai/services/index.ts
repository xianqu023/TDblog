import { AIConfig } from "../types";
import { AIWriterService } from "./writer";
import { AIImageService } from "./image";
import { AISEOService } from "./seo";
import { SearchPushService } from "./push";
import { AITranslateService } from "./translate";

export class AIService {
  private config: AIConfig;
  public writer: AIWriterService;
  public image: AIImageService;
  public seo: AISEOService;
  public push: SearchPushService;
  public translate: AITranslateService;

  constructor(config: AIConfig) {
    this.config = config;
    this.writer = new AIWriterService(config);
    this.image = new AIImageService(config);
    this.seo = new AISEOService(config);
    this.push = new SearchPushService(config);
    this.translate = new AITranslateService(config);
  }
}

export * from "./writer";
export * from "./image";
export * from "./seo";
export * from "./push";
export * from "./translate";
