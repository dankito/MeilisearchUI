<script lang="ts">
  import type { ViewState } from "../../ts/ui/state/ViewState.svelte"
  import type { Hit, Index, MatchingStrategies } from "meilisearch"
  import SearchResultCard from "./SearchResultCard.svelte"
  import { DI } from "../../ts/service/DI"
  import Error from "../common/controls/Error.svelte"

  let { viewState, onItemSelected }: { viewState: ViewState, onItemSelected?: (hit: Hit) => void } = $props()

  const presenter = DI.searchResultPresenter

  let meili = $derived(viewState.meili)

  let search = $derived(viewState.search)

  let searchError = $state<string | undefined>(undefined)

  let response = $derived(search.searchResponse)

  let hits = $derived(search.hits)

  let totalHits = $derived(response?.totalHits ?? response?.estimatedTotalHits ?? hits?.length)

  let isEstimated = $derived(response && !("totalHits" in response) && "estimatedTotalHits" in response)

  let hasImageUrls = $derived(hits.some(hit => presenter.findImageUrl(hit)) ?? false)

  let hasFacets = $derived(response?.facetDistribution && Object.keys(response.facetDistribution).length > 0)

  let loading = $state(false)

  let hasMoreItems = $state(false)


  // don't know why, but effects for viewState properties also fire when there is no change, so keep track of previous values
  let previousIndexUid: string | undefined = undefined
  let previousQuery: string | undefined = undefined
  let previousMatchingStrategy: MatchingStrategies | undefined = undefined

  $effect(() => {
    if (previousIndexUid !== viewState.selectedIndex?.uid) {
      previousIndexUid = viewState.selectedIndex?.uid

      resetHitsAndSearch()
    }
  })

  $effect(() => {
    if (previousQuery !== search.query) {
      previousQuery = search.query

      resetHitsAndSearch()
    }
  })

  $effect(() => {
    if (previousMatchingStrategy !== search.matchingStrategy) {
      previousMatchingStrategy = search.matchingStrategy

      resetHitsAndSearch()
    }
  })

  async function resetHitsAndSearch() {
    search.page = 0
    hits = []
    viewState.selectedHit = undefined
    searchError = undefined

    await doSearch()
  }

  async function doSearch(index: Index | undefined = viewState.selectedIndex) {
    loading = true

    if (meili && index) {
      try {
        const response = await meili.search(index.uid, search)
        search.searchResponse = response
        search.hits = [...hits, ...response.hits]
        searchError = undefined

        const countRetrievedItems = search.page * search.pageSize + response.hits.length
        hasMoreItems = response.totalPages ? search.page < response.totalPages :
          response.totalHits ? countRetrievedItems < response.totalHits :
            response.estimatedTotalHits ? countRetrievedItems < response.estimatedTotalHits : false
      } catch (e) {
        searchError = String(e)
      }
    }

    loading = false
  }

  function itemSelected(hit: Hit) {
    onItemSelected?.(hit)
  }

  async function onScroll(event: UIEvent) {
    const element = event.currentTarget as HTMLElement
    const nearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 200
    if (nearBottom) {
      await loadMore()
    }
  }

  async function loadMore() {
    if (hasMoreItems) {
      search.page++

      await doSearch()
    }
  }

  function formatMs(ms: number): string {
    return ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(2)} s`
  }
</script>

<section class="flex-1 flex w-full h-full min-w-0 min-h-0 max-w-200 mx-auto flex-col font-sans overflow-x-hidden overflow-y-auto px-2 py-1.5" onscroll={onScroll}>
  <Error errorMessage={searchError} />

  <!-- ── Meta bar ─────────────────────────────────────────────────────────── -->
  <div class="flex items-center justify-between border-b border-zinc-100 mb-2">
    {#if response}
      <div class="text-sm text-zinc-500">
        {#if response.query}
          Results for <span class="font-semibold text-zinc-800">"{response.query}"</span> —
        {/if}
        <span class="font-semibold text-zinc-800">{hits.length.toLocaleString()} / {isEstimated ? '~' : ''}{totalHits.toLocaleString()}</span>
         hit{totalHits !== 1 ? 's' : ''}
      </div>
      <div class="flex items-center gap-1 rounded-full bg-zinc-50 px-2.5 py-1
                   text-[11px] font-medium text-zinc-400 ring-1 ring-zinc-200">
        <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        {formatMs(response.processingTimeMs)}
      </div>
    {:else}
      <p class="text-sm text-zinc-400">No results yet</p>
    {/if}
  </div>

  <!-- ── Facet chips (optional, shown when facets present) ────────────────── -->
  {#if hasFacets && response?.facetDistribution}
    <div class="mb-3 flex flex-wrap gap-2">
      {#each Object.entries(response.facetDistribution) as [facet, values]}
        {#each Object.entries(values).slice(0, 4) as [val, count]}
          <span
              class="inline-flex items-center gap-1 rounded-full border border-zinc-200
                   bg-white px-2.5 py-0.5 text-[11px] text-zinc-600"
          >
            <span class="font-medium text-zinc-400">{facet}:</span>
            {val}
            <span class="rounded-full bg-zinc-100 px-1.5 text-[10px] font-semibold text-zinc-500">
              {count}
            </span>
          </span>
        {/each}
      {/each}
    </div>
  {/if}

  <!-- ── Hit list ──────────────────────────────────────────────────────────── -->
  <div class="flex-1">
    {#if loading && hits.length === 0}
      <!-- Skeleton cards -->
      <div class="h-full w-full flex flex-col items-center justify-center gap-4">
        <div class="flex items-center gap-2 text-sm text-zinc-400 mb-5">
          <!-- Spinner -->
          <svg class="h-4 w-4 animate-spin text-primary" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-dasharray="31.4 31.4"
                    stroke-linecap="round" />
          </svg>
          Searching…
        </div>

        <ul class="space-y-3">
          {#each Array(4) as _}
            <li class="w-80 h-36 flex gap-4 rounded-2xl border border-zinc-100 bg-white p-4">
              <div class="size-28 shrink-0 animate-pulse rounded-xl bg-zinc-100"></div>
              <div class="flex-1 space-y-6 py-1">
                <div class="h-3 w-2/3 animate-pulse rounded bg-zinc-100"></div>
                <div class="h-2.5 w-1/2 animate-pulse rounded bg-zinc-100"></div>
                <div class="h-2.5 w-3/4 animate-pulse rounded bg-zinc-100"></div>
              </div>
            </li>
          {/each}
        </ul>
      </div>

    {:else if hits.length > 0}
      <ul class="w-full space-y-3">
        {#each hits as hit, i}
          <li class="cursor-pointer" style="animation-delay: {i * 30}ms" role="button" tabindex="0"
              onclick={() => itemSelected(hit)} onkeydown={e => e.key === "Enter" && itemSelected(hit)} >
            <SearchResultCard {hit} {hasImageUrls} index={viewState.selectedIndex} />
          </li>
        {/each}
      </ul>

      <!-- Pagination hint -->
      {#if response && response.totalPages && response.totalPages > 1}
        <p class="mt-4 text-center text-xs text-zinc-400">
          Page {response.page ?? 1} of {response.totalPages}
        </p>
      {/if}

    {:else if response && hits.length === 0}
      <!-- Empty state -->
      <div class="flex flex-col items-center justify-center py-20 text-center">
        <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-50 ring-1 ring-zinc-200">
          <svg class="h-7 w-7 text-zinc-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        </div>
        <p class="text-sm font-semibold text-zinc-700">No results found</p>
        {#if response.query}
          <p class="mt-1 text-xs text-zinc-400">
            Nothing matched "<span class="font-medium">{response.query}</span>"
          </p>
        {/if}
      </div>

    {:else}
      <!-- Idle state -->
      <div class="flex flex-col items-center justify-center py-20 text-center">
        <div class="mb-4 flex size-16 items-center justify-center rounded-2xl bg-zinc-50 ring-1 ring-zinc-200">
          <svg class="size-7 text-zinc-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        </div>
        <p class="text-sm font-semibold text-zinc-700">Start searching</p>
        <p class="mt-1 text-xs text-zinc-400">Results will appear here.</p>
      </div>
    {/if}
  </div>

</section>