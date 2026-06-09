<script lang="ts">
  import { X } from "@lucide/svelte"
  import type { MenuItem } from "../../../ts/ui/MenuItem"
  import Menu from "./Menu.svelte"

  let { title, onClose, menuItems = [] }: { title: string, onClose: () => void, menuItems?: MenuItem[] } = $props()

  let menuOpen = $state(false)
</script>


<div class="shrink-0 w-full relative flex items-center">
  <div class="w-full flex flex-row gap-3 items-center">
    <div class="flex-1 text-base font-medium truncate">
      { title }
    </div>

    <div class="shrink-0 flex flex-row items-center gap-1.5">
      {#if menuItems && menuItems.length}
        <button onclick={(e) => { e.stopPropagation(); menuOpen = !menuOpen }} aria-label="More options"
                class="size-9 p-1 rounded-lg text-zinc-500 hover:bg-zinc-100 transition-colors" >
          <span class="icon-[mdi--dots-vertical] size-5"></span>
        </button>
      {/if}

      <button class="size-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200" onclick={onClose}>
        <X size={20} />
      </button>
    </div>
  </div>

  {#if menuOpen}
    <Menu items={menuItems} onClose={() => menuOpen = false} />
  {/if}
</div>