<script lang="ts">
  import { X } from "@lucide/svelte"

  let { title, onClose }: { title: string, onClose: () => void } = $props()
</script>


<div class="shrink-0 flex flex-row gap-3 items-center">
  <div class="flex-1 text-base font-medium truncate">
    { title }
  </div>

  <button class="shrink-0 size-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200" onclick={onClose}>
    <X size={20} />
  </button>
</div>