<script lang="ts" generics="T">
  import type { Option } from "../../../ts/ui/Option"

  let { label, options, selectedOption = $bindable(), selectionChanged, class: classNames = "" }:
    { label?: string, options: Option<T>[], selectedOption?: T, selectionChanged?: (option: T | undefined) => void, class?: string } = $props()


  function selectedItemChanged(event: Event) {
    const selectElement = event.target as HTMLSelectElement
    const selected = options[selectElement.selectedIndex]

    selectedOption = selected.value
    selectionChanged?.(selected.value)
  }
</script>

<div class="flex items-center gap-1.5 {classNames}">
  {#if label}
    <label for={label} class="shrink-0 whitespace-nowrap">{ label }</label>
  {/if}

  <select id={label} value={selectedOption !== undefined ? String(selectedOption) : ""} onchange={selectedItemChanged}
      class="flex-1 min-w-0 h-full px-2 py-1.5 truncate rounded-lg border border-zinc-300 text-zinc-700
           focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
  >
    {#each options as option}
      <option value={String(option.value)} disabled={option.disabled}>{option.label}</option>
    {/each}
  </select>
</div>