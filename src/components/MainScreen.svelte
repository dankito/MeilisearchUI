<script lang="ts">
  import type { ViewState } from "../ts/ui/state/ViewState.svelte"
  import type { MeiliService } from "../ts/service/MeiliService"
  import Header from "./mainMenu/Header.svelte"
  import SearchResultsList from "./searchresults/SearchResultsList.svelte"

  let { viewState }: { viewState: ViewState } = $props()

  let meili = $derived(viewState.meili)


  $effect(() => {
    if (meili) {
      updateBasicData(meili).then(() => { })
    }
  })

  async function updateBasicData(meili: MeiliService) {
    // TODO: check if there are more pages but should in most cases be fine
    viewState.indices = (await meili.client.getIndexes()).results
    viewState.selectedIndex = viewState.indices.length ? viewState.indices[0] : undefined

    viewState.isHealthy = await meili.client.isHealthy()
    viewState.meiliVersion = (await meili.client.getVersion()).pkgVersion
    viewState.stats = await meili.client.getStats()

    //viewState.keys = (await meili.client.getKeys()).results
  }
</script>


<div class="w-full h-dvh flex flex-col">
  <Header {viewState} />

  <main class="w-full h-dvh flex flex-col items-center justify-center">
    <SearchResultsList {viewState} />
  </main>
</div>