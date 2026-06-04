<script lang="ts">
  import type { MeiliService } from "../../ts/service/MeiliService"
  import type { Index, IndexObject, IndexStats, Settings } from "meilisearch"
  import { DI } from "../../ts/service/DI"
  import LabelledValue from "../common/form/LabelledValue.svelte"
  import Card from "../common/form/Card.svelte"

  let { meili }: { meili: MeiliService } = $props()

  let indices = $state<Index[]>([])

  let selectedIndex = $state<Index | undefined>(undefined)

  let rawIndexInfo = $state<IndexObject | undefined>(undefined)

  let indexStats = $state<IndexStats | undefined>(undefined)

  let indexSettings = $state<Settings | undefined>(undefined)

  const formatService = DI.formatService


  $effect(() => {
    const _ = meili
    fetchIndices().then(() => { })
  })

  $effect(() => {
    rawIndexInfo = undefined
    indexStats = undefined
    indexSettings = undefined

    if (selectedIndex !== undefined) {
      fetchIndexData(selectedIndex).then(() => { })
    }
  })


  async function fetchIndices() {
    indices = (await meili.client.getIndexes()).results
  }

  async function indexSelected(index: Index) {
    selectedIndex = index
  }

  async function fetchIndexData(index: Index) {
    // execute in parallel
    index.getRawInfo().then(result => rawIndexInfo = result)
    index.getStats().then(result => indexStats = result)
    index.getSettings().then(result => indexSettings = result)
  }

  function formatDate(date: Date | string | number): string {
    return formatService.formatDate(date)
  }

  function formatStringArray(array: string[] | undefined): string {
    if (!array) {
      return ""
    }

    return array.join("\n")
  }

</script>


<div class="w-full h-240 max-h-[90dvh] flex flex-row gap-3 md:gap-5">
  <ul class="shrink-0 overflow-x-hidden overflow-y-auto" class:max-sm:max-w-24={selectedIndex !== undefined} onclick={() => selectedIndex = undefined}>
    {#each indices as index (index.uid)}
      <li class="my-3">
        <button onclick={e => { e.stopPropagation(); indexSelected(index) }} aria-label="Select index {index.uid}"
                class=""
                class:text-primary={selectedIndex?.uid === index.uid}>
          {index.uid}
        </button>
      </li>
    {/each}
  </ul>

  <div class="flex-1 h-full flex flex-col gap-3 pb-1 overflow-y-auto">
    {#if selectedIndex}
      <div class="text-base font-semibold">
        {selectedIndex.uid}
      </div>

      {#if rawIndexInfo}
        <Card class="flex flex-col gap-3 p-3 border border-zinc-200">
          <LabelledValue label="Primary key" value={rawIndexInfo.primaryKey} />
          <LabelledValue label="Created at" value={formatDate(rawIndexInfo.createdAt)} />
          <LabelledValue label="Updated at" value={formatDate(rawIndexInfo.updatedAt)} />
        </Card>
      {/if}

      {#if indexStats}
        <Card class="flex flex-col gap-3 p-3 border border-zinc-200">
          <LabelledValue label="Number of documents" value={indexStats.numberOfDocuments.toString()} />
          <LabelledValue label="Number of embedded documents" value={indexStats.numberOfEmbeddedDocuments.toString()} />
          <LabelledValue label="Number of embeddings" value={indexStats.numberOfEmbeddings.toString()} />
          <LabelledValue label="DB size" value={indexStats.rawDocumentDbSize.toString()} />
          <LabelledValue label="Average document size" value={indexStats.avgDocumentSize.toString()} />
          <LabelledValue label="Is indexing" value={indexStats.isIndexing.toString()} />

          <div class="font-semibold mt-2">Field distribution</div>
          {#each Object.entries(indexStats.fieldDistribution) as [field, count]}
            <LabelledValue label={field} value={count.toString()} />
          {/each}
        </Card>
      {/if}

      {#if indexSettings}
        <Card class="flex flex-col gap-3 p-3 border border-zinc-200">
          <LabelledValue label="Displayed attributes" valueClasses="whitespace-pre" value={formatStringArray(indexSettings.displayedAttributes)} />
          <LabelledValue label="Searchable attributes" valueClasses="whitespace-pre" value={formatStringArray(indexSettings.searchableAttributes)} />
          <LabelledValue label="Filterable attributes" valueClasses="whitespace-pre" value={formatStringArray(indexSettings.filterableAttributes)} />
          <LabelledValue label="Sortable attributes" valueClasses="whitespace-pre" value={formatStringArray(indexSettings.sortableAttributes)} />
          <LabelledValue label="Ranking rules" valueClasses="whitespace-pre" value={formatStringArray(indexSettings.rankingRules)} />
        </Card>
      {/if}
    {/if}
  </div>
</div>