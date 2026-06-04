<script lang="ts">
  import FieldValue from "./FieldValue.svelte"

  let { key, value }: { key: string, value: any } = $props()

  // TODO: also check arrays and objects
  let isLongValue = $derived(typeof value === "string" && isLong(value))

  let isExpanded = $state(false)


  // After how many lines a value gets the expand toggle
  const CLAMP_LINES = 4

  /**
   * A value is "long" if its formatted string contains more than CLAMP_LINES newlines
   * OR is longer than ~300 chars (proxy for multi-line display).
   */
  function isLong(value: string): boolean {
    const lines = value.split("\n").length
    return lines > CLAMP_LINES || value.length > 300
  }
</script>

<div class="w-full flex flex-col gap-0.5">
  <div class="w-full flex flex-row items-center">
    <dt class="flex-1 text-zinc-400 font-semibold">{key}</dt>

    {#if isLongValue}
      <button onclick={() => isExpanded = !isExpanded}
              class="flex items-center gap-1 py-1.5 font-medium text-primary hover:text-primary/80 transition-colors">
        {isExpanded ? "Collapse" : "Expand"}
        <svg class="size-4 transition-transform duration-200"
             class:rotate-180={isExpanded}
             viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    {/if}
  </div>

  <dd class="flex-1 w-full leading-relaxed">
    <FieldValue {value} clampHeight={isLongValue && !!!isExpanded} />
  </dd>
</div>