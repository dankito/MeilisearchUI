<script lang="ts">
  import type { ViewState } from "../../ts/ui/state/ViewState.svelte"
  import type { MeiliService } from "../../ts/service/MeiliService.ts"
  import type { Index, MatchingStrategies } from "meilisearch"
  import SearchResultCard from "./SearchResultCard.svelte"

  let { viewState }: { viewState: ViewState } = $props()

  let meili = $derived(viewState.meili)

  let search = $derived(viewState.search)

  let hits = $derived(search.searchResponse?.hits ?? [])


  $effect(() => {
    doSearch(meili, viewState.selectedIndex, search.query, search.matchingStrategy).then(() => { })
  })

  async function doSearch(meili: MeiliService | undefined, index: Index | undefined, query: string, matchingStrategy: MatchingStrategies) {
    search.page = 0

    search.searchResponse = undefined

    if (meili && index) {
      search.searchResponse = await meili.search(index.uid, search)
    }
  }
</script>


<div class="w-full h-full max-w-250 min-h-0 mx-auto flex flex-col gap-2 overflow-y-auto">
  <div class="mt-3 mb-1.5 flex flex-row gap-2">
    {#if search.searchResponse?.processingTimeMs}
      <span class="">Processing time: </span>
      <span class="">{search.searchResponse.processingTimeMs} ms</span>
    {/if}
    {#if search.searchResponse?.estimatedTotalHits}
      <span class="">Total hits: ~</span>
      <span class="">{search.searchResponse.estimatedTotalHits}</span>
    {/if}
  </div>

  <div class="shrink-0 w-full min-h-0 flex flex-col gap-2.5">
    {#each hits as hit}
      <SearchResultCard {hit} />
    {/each}
  </div>
</div>