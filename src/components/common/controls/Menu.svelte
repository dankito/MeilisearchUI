<script lang="ts">

  import type { MenuItem } from "../../../ts/ui/MenuItem"

  interface Props {
    items: MenuItem[]
    onClose: () => void
  }

  const { items, onClose }: Props = $props()

  function handleClickOutside(event: MouseEvent) {
    if (!(event.target as Element).closest("[data-menu]")) {
      onClose()
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      onClose()
    }
  }

  function handlePopState() {
    onClose()
  }

  $effect(() => {
    document.addEventListener("click", handleClickOutside)
    document.addEventListener("keydown", handleKeydown)
    window.addEventListener("popstate", handlePopState)

    return () => {
      document.removeEventListener("click", handleClickOutside)
      document.removeEventListener("keydown", handleKeydown)
      window.removeEventListener("popstate", handlePopState)
    }
  })
</script>

<div data-menu
    class="absolute right-0 top-full mt-1 z-50 min-w-40 rounded-xl border border-zinc-200 bg-white py-1 shadow-lg" >
  {#each items as item}
    <button onclick={() => { item.onClick(); onClose() }}
        class="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 transition-colors" >
      {#if item.icon}
        {@render item.icon()}
      {/if}
      {item.label}
    </button>
  {/each}
</div>