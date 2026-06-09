<script lang="ts">
  import { Trash } from "@lucide/svelte"
  import type { Hit, Index } from "meilisearch"
  import { DI } from "../../ts/service/DI"
  import type { ViewState } from "../../ts/ui/state/ViewState.svelte"
  import Card from "../common/form/Card.svelte"
  import ClosableHeader from "../common/controls/ClosableHeader.svelte"
  import SearchResultDetailField from "./SearchResultDetailField.svelte"
  import { MenuItem } from "../../ts/ui/MenuItem"
  import ConfirmDialog from "../dialog/ConfirmDialog.svelte"
  import Error from "../common/controls/Error.svelte"
  import type { MeiliService } from "../../ts/service/MeiliService"

  let { hit, viewState }: { hit: Hit, viewState: ViewState } = $props()

  const presenter = DI.searchResultPresenter

  const utils = DI.utils

  let title = $derived(presenter.getTitle(hit, presenter.findTitleKey(hit)))

  let imageUrl = $derived(presenter.findImageUrl(hit))

  let keys = $derived(Object.keys(hit))

  let showDeleteRecordConfirmDialog = $state(false)

  let deleteDocumentError = $state<string | undefined>(undefined)


  const menuItems = [
    new MenuItem("Download JSON", downloadJson, downloadIcon),
    new MenuItem("Copy JSON", copyJsonToClipboard, copyIcon),
    new MenuItem("Delete", () => showDeleteRecordConfirmDialog = true, deleteIcon),
  ]

  async function downloadJson() {
    await utils.makeDownloadable(getJson(), "application/json", `${title}.json`)
  }

  async function copyJsonToClipboard() {
    await utils.copyToClipboard(getJson())
  }

  function getJson(): string {
    return JSON.stringify(hit, null, 2)
  }

  async function deleteDocument(): Promise<boolean> {
    const index = viewState.selectedIndex
    const meili = viewState.meili

    if (index && meili) {
      deleteDocumentError = await meili.deleteDocument(index, hit)

      if (!!!deleteDocumentError) {
        successfullyDeletedDocument(hit, index, meili)
      }
    }

    return true
  }

  function successfullyDeletedDocument(hit: Hit, index: Index, meili: MeiliService) {
    const hitId = meili.getId(hit, index)

    viewState.search.hits = viewState.search.hits.filter(h => meili.getId(h, index) !== hitId)

    closeDetailView()
  }


  function closeDetailView() {
    viewState.selectedHit = undefined
  }
</script>

<div class="w-full h-full min-h-0 flex flex-col gap-3 px-2 py-3">
  <Card class="flex-1 min-h-0 flex flex-col gap-3 px-3 py-3">
    <ClosableHeader {title} {menuItems} onClose={closeDetailView} />

    <Error errorMessage={deleteDocumentError} />

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


<ConfirmDialog show={showDeleteRecordConfirmDialog} question={`Really delete record '${title}'?\nThis cannot be undone.`}
               onConfirm={deleteDocument} onClose={() => showDeleteRecordConfirmDialog = false} />


{#snippet copyIcon()}
  <span class="icon-[mdi--content-copy] size-4.5"></span>
{/snippet}

{#snippet downloadIcon()}
  <span class="icon-[mdi--tray-download] size-4.5"></span>
{/snippet}

{#snippet deleteIcon()}
  <Trash size={18} color="var(--color-red-600)" />
{/snippet}