<script lang="ts">
  import type { ViewState } from "../ts/ui/state/ViewState.svelte"
  import type { MeiliService } from "../ts/service/MeiliService"
  import Header from "./mainMenu/Header.svelte"
  import SearchResultsList from "./searchresults/SearchResultsList.svelte"
  import type { Hit } from "meilisearch"
  import SearchResultDetail from "./searchresults/SearchResultDetail.svelte"
  import { Constants } from "../ts/service/Constants"
  import Dialog from "./dialog/Dialog.svelte"
  import IndexSettingsDialog from "./dialog/IndexSettingsDialog.svelte"

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

    setInterval(async () => {
      viewState.isHealthy = await meili.client.isHealthy()
    }, 10_000)

    setInterval(async () => {
      viewState.stats = await meili.client.getStats()
    }, 2 * 60_000)
  }


  async function selectHit(hit: Hit) {
    viewState.selectedHit = hit

    const index = viewState.selectedIndex
    if (meili && index) {
      const primaryKey = index!!.primaryKey
      if (primaryKey) {
        const documentId = hit[primaryKey]
        meili.getDocument(index.uid, documentId)
          .then(fullDocument => viewState.selectedHit = fullDocument)
      }
    }
  }
</script>


<div class="w-full h-dvh flex flex-col">
  <Header {viewState} />

  <main class="flex-1 w-full h-full min-h-0 flex flex-col md:flex-row">
    <SearchResultsList {viewState} onItemSelected={selectHit} />

    {#if viewState.selectedHit}
      {#if Constants.isSmallScreen}
        <Dialog open={viewState.selectedHit !== undefined} showTitleBar={false} onClose={() => (viewState.selectedHit = undefined)}>
          <SearchResultDetail hit={viewState.selectedHit} {viewState} />
        </Dialog>
      {:else}
        <div class="flex-1">
          <SearchResultDetail hit={viewState.selectedHit} {viewState} />
        </div>
      {/if}
    {/if}
  </main>
</div>


{#if viewState.showIndexSettingsDialog && meili}
 <IndexSettingsDialog {viewState} {meili} />
{/if}