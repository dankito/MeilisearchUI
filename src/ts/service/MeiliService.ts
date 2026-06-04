import { type DocumentQuery, Meilisearch, type MultiSearchParams, type MultiSearchQuery, type MultiSearchResponse, type RecordAny, type SearchResponse } from "meilisearch"
import { SearchState } from "../ui/state/SearchState.svelte"

export class MeiliService {

  readonly client: Meilisearch

  constructor(host: string = "http://localhost:7700", apiKey?: string) {
    this.client = new Meilisearch({ host: host, apiKey: apiKey })
  }


  async search(indexName: string, search: SearchState): Promise<SearchResponse> {
    const searchQuery: MultiSearchQuery = { indexUid: indexName, q: search.query, limit: search.pageSize, offset: search.page, matchingStrategy: search.matchingStrategy }
    const params: MultiSearchParams = { queries: [ searchQuery ] }
    const response: MultiSearchResponse = await this.client.multiSearch(params)

    return response.results[0]
  }

  async getDocument(indexName: string, documentId: string): Promise<RecordAny> {
    const query: DocumentQuery = {
      fields: ["*"]
    }

    return await this.client.index(indexName).getDocument(documentId, query)
  }

}