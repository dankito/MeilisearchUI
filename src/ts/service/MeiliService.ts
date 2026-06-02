import { Meilisearch } from "meilisearch"

export class MeiliService {

  readonly client: Meilisearch

  constructor(host: string = "http://localhost:7700", apiKey?: string) {
    this.client = new Meilisearch({ host: host, apiKey: apiKey })
  }
}