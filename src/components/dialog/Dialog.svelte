<script lang="ts">
  import { X } from "@lucide/svelte"
  import { onMount, onDestroy, type Snippet } from "svelte"

  interface Props {
    open: boolean
    children: Snippet
    showTitleBar?: boolean
    onClose: () => void
  }

  let { open, children, showTitleBar = true, onClose }: Props = $props()


  $effect(() => {
    if (open) {
      history.pushState({ dialog: true }, "")
    }
  })

  onMount(() => {
    window.addEventListener("popstate", handlePopState)
  })

  onDestroy(() => {
    window.removeEventListener("popstate", handlePopState)
  })

  function historyBack() {
    history.back()
  }

  function handlePopState() {
    if (open) {
      onClose()
    }
  }
</script>

{#if open}
  <div class="fixed top-0 left-0 right-0 bottom-0 inset-0 z-50 flex flex-col items-center justify-center bg-black/50 overflow-y-auto">
    {#if showTitleBar}
      <div class="flex items-center justify-end p-2 border-b border-zinc-800">
        <button class="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
                aria-label="Close" onclick={historyBack} >
          <X size={22} />
        </button>
      </div>
    {/if}

    <div class="max-w-full min-h-0">
      {@render children()}
    </div>
  </div>
{/if}