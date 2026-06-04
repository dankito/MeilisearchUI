<script lang="ts">
  import { Settings } from "@lucide/svelte"
  import type { ViewState } from "../../ts/ui/state/ViewState.svelte"
  import ComboBox from "../common/form/ComboBox.svelte"
  import { Option } from "../../ts/ui/Option"
  import SearchBar from "./SearchBar.svelte"
  import { type Index, MatchingStrategies, type Stats } from "meilisearch"
  import { DI } from "../../ts/service/DI"

  let { viewState }: { viewState: ViewState } = $props()

  let indices = $derived(viewState.indices ?? [])

  let indexOptions = $derived(indices.map(index => new Option<Index>(index, getIndexLabel(index, viewState.stats))))

  let matchingStrategiesOptions = [ MatchingStrategies.LAST, MatchingStrategies.ALL, MatchingStrategies.FREQUENCY ]
    .map(strategy => new Option(strategy, strategy.substring(0, 1).toUpperCase() + strategy.substring(1)))

  const formatService = DI.formatService


  function getIndexLabel(index: Index, stats: Stats | undefined): string {
    const indexName = index.uid

    if (stats) {
      const indexStats = stats.indexes[index.uid]
      if (indexStats) {
        return `${indexName}  ${formatService.formatNumber(indexStats.numberOfDocuments)}`
      }
    }
    return indexName
  }
</script>


<div class="shrink-0 w-full h-16 sticky top-0 z-50 shadow-lg bg-white px-1.5 md:px-4 py-1.5 md:py-2 flex flex-row items-center justify-between overflow-hidden">
  <div class="shrink-0 flex flex-col md:flex-row items-center gap-1 md:gap-2">
    <div class="rounded-full size-5" class:bg-green-600={viewState.isHealthy} class:bg-red-600={!!!viewState.isHealthy}></div>

    <div class="max-sm:text-[10px]">
      v{viewState.meiliVersion}
    </div>
  </div>

  <div class="min-w-0 flex flex-row items-center gap-2 md:gap-4">
    <ComboBox class="shrink-0 h-10 max-sm:max-w-25" options={indexOptions} selectedOption={viewState.selectedIndex}
              selectionChanged={index => viewState.selectedIndex = index} />

    <SearchBar {viewState} />

    <ComboBox class="shrink-0 h-10 max-sm:w-[65px] sm:min-w-[65px] sm:max-w-[93px]" options={matchingStrategiesOptions} bind:selectedOption={viewState.search.matchingStrategy} />
  </div>

  <div class="shrink-0">
    <button onclick={() => viewState.showIndexSettingsDialog = true} aria-label="Show Index Settings Dialog"
            class="flex items-center justify-center size-9 rounded-full hover:bg-zinc-100 transition-colors text-zinc-600 hover:text-zinc-900">
      <Settings size={20} />
    </button>
  </div>
</div>