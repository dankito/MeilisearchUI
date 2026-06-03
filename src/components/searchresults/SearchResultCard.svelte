<script lang="ts">
  import type { RecordAny } from "meilisearch"
  import Card from "../common/form/Card.svelte"

  let { hit }: { hit: RecordAny } = $props()
</script>


<Card class="p-4">
  {#each Object.entries(hit) as [key, value]}
    <div class="flex flex-row gap-2">
      <span class="font-bold">{key}:</span>
      <span class="line-clamp-4" title={value}>{value}</span>
    </div>
  {/each}
</Card>