import {
  type DocumentQuery, type EnqueuedTask,
  type Filter, type Index,
  Meilisearch,
  type MultiSearchParams,
  type MultiSearchQuery,
  type MultiSearchResponse,
  type RecordAny,
  type SearchResponse, type Task, type TaskStatus
} from "meilisearch"
import { SearchState } from "../ui/state/SearchState.svelte"

export class MeiliService {

  readonly client: Meilisearch

  constructor(host: string = "http://localhost:7700", apiKey?: string) {
    this.client = new Meilisearch({ host: host, apiKey: apiKey })
  }


  async search(indexName: string, search: SearchState): Promise<SearchResponse> {
    const offset = search.page * search.pageSize
    const searchQuery: MultiSearchQuery = { indexUid: indexName, q: search.query, limit: search.pageSize, offset: offset, matchingStrategy: search.matchingStrategy }
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