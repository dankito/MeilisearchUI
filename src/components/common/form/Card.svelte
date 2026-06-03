<script lang="ts">
  import type { Snippet } from "svelte"

  let { children, class: classNames = "" }: { children: Snippet, class?: string } = $props()
</script>

<div class={[ "bg-white rounded-2xl shadow-lg", classNames ]}>
  {@render children()}
</div>
