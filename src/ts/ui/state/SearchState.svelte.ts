import { type Hit, MatchingStrategies, type SearchResponse } from "meilisearch"

export class SearchState {

  query = $state<string>("")

  matchingStrategy = $state<MatchingStrategies>(MatchingStrategies.LAST)

  page = 0
  pageSize = 25

  searchResponse = $state<SearchResponse | undefined>(undefined)

  hits = $state<Hit[]>([])

}