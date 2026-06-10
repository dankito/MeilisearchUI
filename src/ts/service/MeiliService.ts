import {
  type DocumentQuery, type EnqueuedTask,
  type Filter, type Index,
  type Highlight,
  Meilisearch,
  type MultiSearchParams,
  type MultiSearchQuery,
  type MultiSearchResponse,
  type RecordAny,
  type SearchResponse, type Task, type TaskStatus, type Crop
} from "meilisearch"
import { SearchState } from "../ui/state/SearchState.svelte"

export class MeiliService {

  readonly client: Meilisearch

  constructor(host: string = "http://localhost:7700", apiKey?: string) {
    this.client = new Meilisearch({ host: host, apiKey: apiKey })
  }


  async search(indexName: string, search: SearchState): Promise<SearchResponse> {
    let query: string | undefined = search.query
    let filter: Filter | undefined = undefined
    // TODO: should we implement a convenience function and uppercase lowercase 'and', 'is', ...?
    // but then also do a case insensitive check in isFilterExpression()
    if (this.isFilterExpression(query)) {
      filter = query
      query = undefined
    }

    const offset = search.page * search.pageSize
    const highlight: Highlight = { attributesToHighlight: ["*"], highlightPreTag: `<span class="match">`, highlightPostTag: "</span>" }
    const crop: Crop = { attributesToCrop: ["*"], cropLength: 12, cropMarker: "..." }
    const searchQuery: MultiSearchQuery = { indexUid: indexName, q: query, filter: filter, limit: search.pageSize, offset: offset, matchingStrategy: search.matchingStrategy, ...highlight, ...crop }
    const params: MultiSearchParams = { queries: [ searchQuery ] }
    const response: MultiSearchResponse = await this.client.multiSearch(params)

    return response.results[0]
  }

  /**
   *
   * filter.equality:   Enables equality operators: =, !=, IN, NOT IN, IS NULL, IS NOT NULL, IS EMPTY, IS NOT EMPTY, EXISTS, NOT EXISTS.
   * filter.comparison: Enables comparison operators: >, >=, <, <=, TO
   * facetSearch:       Enables facet search on the attribute. Used with the /facet-search endpoint and facet distribution.
   * @param query
   * @private
   */
  private isFilterExpression(query: string): boolean {
    return query.includes("=") || query.includes(" IN ") || query.includes(" IS ") || query.includes(" EXISTS ")
      // filter.comparison
      || query.includes(">") || query.includes("<") || query.includes(" TO ")
  }

  async getDocument(indexName: string, documentId: string): Promise<RecordAny> {
    const query: DocumentQuery = {
      fields: ["*"]
    }

    return await this.client.index(indexName).getDocument(documentId, query)
  }

  async deleteDocument(index: Index, document: RecordAny): Promise<string | undefined> {
    try {
      const id = this.getId(document, index)
      if (!!!id) {
        if (!!!index.primaryKey) {
          return "Primary key is not defined for this index, therefore cannot determine document ID."
        }
        return `Document ID cannot be determined for primary key ${index.primaryKey}`
      }

      const enqueued = await index.deleteDocument(id)
      const task = await this.waitForTask(enqueued)
      const taskError = this.getTaskError(task)
      if (taskError) {
        return taskError
      }

      if (task.details?.deletedDocuments === 0) {
        return `Document with ID ${id} was not found in index ${index.uid}`
      }
      return undefined
    } catch (e) {
      console.error("Failed to delete document", e)
      return String(e)
    }
  }

  getId(document: RecordAny, index: Index): string | undefined {
    if (index.primaryKey) {
      return document[index.primaryKey]
    }

    return undefined
  }


  private async waitForTask(enqueued: EnqueuedTask): Promise<Task> {
    return await this.client.tasks.waitForTask(enqueued) // TODO: catch errors like MeilisearchTaskTimeOutError
  }

  private getTaskError(task: Task): string | undefined {
    if (task.status === "succeeded") {
      return undefined
    } else if (task.status === "canceled") {
      return `Meilisearch task ${task.uid} was canceled`
    } else if (task.error) {
      return `Meilisearch task ${task.uid} failed: ${task.error.type} ${task.error.code} (${task.error.link}): ${task.error.message}`
    } else {
      return `Meilisearch task ${task.uid} failed with status ${task.status}`
    }
  }

}