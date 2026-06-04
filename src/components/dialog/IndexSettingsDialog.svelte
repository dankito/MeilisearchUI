<script lang="ts">
  import type { ViewState } from "../../ts/ui/state/ViewState.svelte"
  import Dialog from "./Dialog.svelte"
  import Card from "../common/form/Card.svelte"
  import ClosableHeader from "../common/controls/ClosableHeader.svelte"
  import type { MeiliService } from "../../ts/service/MeiliService"
  import IndexSettingsDialogContent from "../indexSettings/IndexSettingsDialogContent.svelte"

  let { viewState, meili }: { viewState: ViewState, meili: MeiliService } = $props()
</script>


<Dialog open={viewState.showIndexSettingsDialog} showTitleBar={false} onClose={() => viewState.showIndexSettingsDialog = false}>
  <Card class="w-[96vw] max-w-200 min-h-0 flex flex-col gap-3 px-3 py-3">
    <ClosableHeader title="Index Settings" onClose={() => viewState.showIndexSettingsDialog = false} />

    <IndexSettingsDialogContent {meili} />
  </Card>
</Dialog>