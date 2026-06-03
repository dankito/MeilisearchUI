<script lang="ts">
  import type { ViewState } from "../../ts/ui/state/ViewState.svelte"
  import ComboBox from "../common/form/ComboBox.svelte"
  import { Option } from "../../ts/ui/Option"
  import SearchBar from "./SearchBar.svelte"
  import type { Index } from "meilisearch"

  let { viewState }: { viewState: ViewState } = $props()

  let indices = $derived(viewState.indices ?? [])

  let indexOptions = $derived(indices.map(index => new Option<Index>(index, index.uid)))
</script>


<div class="w-full h-16 sticky top-0 z-50 shadow-md bg-white px-4 py-2 flex flex-row items-center justify-between">
  <div class="flex flex-col md:flex-row items-center gap-1 md:gap-2">
    <div class="rounded-full size-5" class:bg-green-600={viewState.isHealthy} class:bg-red-600={!!!viewState.isHealthy}></div>

    <div class="">
      v{viewState.meiliVersion}
    </div>
  </div>

  <div class="flex flex-row items-center gap-4">
    <ComboBox class="h-10 max-sm:max-w-30" options={indexOptions} selectedOption={viewState.selectedIndex}
              selectionChanged={index => viewState.selectedIndex = index} />

    <SearchBar {viewState} />
  </div>

  <div class="">
    <!-- Right -->
  </div>
</div>