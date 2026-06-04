<script lang="ts">
  import IndexTab from "./IndexTab.svelte"
  import type { MeiliService } from "../../ts/service/MeiliService"

  let { meili }: { meili: MeiliService } = $props()
</script>

<IndexTab {meili} />