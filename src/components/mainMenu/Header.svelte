<script lang="ts">
  import type { ViewState } from "../../ts/ui/state/ViewState.svelte"

  let { viewState }: { viewState: ViewState } = $props()

  let indices = $derived(viewState.indices ?? [])
</script>


<div class="w-full h-16 sticky top-0 z-50 shadow-md bg-white px-4 py-2 flex flex-row items-center justify-between">
  <div class="flex flex-row items-center gap-2">
    <div class="rounded-full size-5" class:bg-green-600={viewState.isHealthy} class:bg-red-600={!!!viewState.isHealthy}></div>

    <div class="">
      v{viewState.meiliVersion}
    </div>
  </div>

  <div class="flex flex-row items-center gap-2">
    {#each indices as index (index.uid)}
      <div class="flex items-center">
        <span class="">{index.uid}</span>
      </div>
    {/each}
  </div>

  <div class="">
    Right
  </div>
</div>