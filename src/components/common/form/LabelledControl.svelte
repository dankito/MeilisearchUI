<script lang="ts">
  import FieldLabel from "./FieldLabel.svelte"
  import type { Snippet } from "svelte"

  let { label, children, class: classNames, labelClasses }:
    { label: string, children: Snippet, class?: string, labelClasses?: string } = $props()
</script>


<div class="flex flex-row gap-1.5 { classNames }">
  <FieldLabel {label} class={labelClasses} />

  {@render children()}
</div>