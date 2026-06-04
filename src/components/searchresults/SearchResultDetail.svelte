<script lang="ts">
  import type { Hit } from "meilisearch"
  import { DI } from "../../ts/service/DI"
  import type { ViewState } from "../../ts/ui/state/ViewState.svelte"
  import Card from "../common/form/Card.svelte"
  import ClosableHeader from "../common/controls/ClosableHeader.svelte"
  import SearchResultDetailField from "./SearchResultDetailField.svelte"

  let { hit, viewState }: { hit: Hit, viewState: ViewState } = $props()

  const presenter = DI.searchResultPresenter

  let title = $derived(presenter.getTitle(hit, presenter.findTitleKey(hit)))

  let imageUrl = $derived(presenter.findImageUrl(hit))

  let keys = $derived(Object.keys(hit))


  function closeDetailView() {
    viewState.selectedHit = undefined
  }
</script>

<div class="w-full h-full min-h-0 flex flex-col gap-3 px-2 py-3">
  <Card class="flex-1 min-h-0 flex flex-col gap-3 px-3 py-3">
    <ClosableHeader {title} onClose={closeDetailView} />

    <div class="flex-1 flex flex-col gap-3 overflow-y-auto">
      {#if imageUrl}
        <div class="shrink-0 w-full h-64 flex flex-col items-center justify-center">
          <img src={imageUrl} alt={title} class="h-full mx-auto rounded-2xl object-cover shadow-lg ring-1 ring-zinc-100" />
        </div>
      {/if}

      <dl class="flex-1 flex flex-col gap-3.5">
        {#each keys as key}
          <SearchResultDetailField {key} value={hit[key]} />
        {/each}
      </dl>
    </div>
  </Card>
</div>