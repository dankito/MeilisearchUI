<script lang="ts">
  import type { ViewState } from "../../ts/ui/state/ViewState.svelte"

  let { viewState }: { viewState: ViewState } = $props()

  let search = $derived(viewState.search)

  let searchInput: HTMLInputElement


  function clearClicked() {
    search.query = ""

    focusInput()
  }

  function searchIconClicked() {
    focusInput()
  }

  function focusInput() {
    searchInput.focus()
  }
</script>


<div class="flex-1 flex items-center gap-1 md:gap-2
    h-10 min-w-0 md:min-w-80 max-w-100 lg:max-w-none px-3 py-2
    rounded-2xl border border-zinc-200
    shadow-md shadow-zinc-300/80
    pointer-events-auto">
  <!-- Search icon -->
  <svg
      class="shrink-0 text-zinc-400 size-4 max-sm:hidden"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      onclick={searchIconClicked}
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>

  <!-- Input -->
  <input bind:this={searchInput} type="search" bind:value={search.query} placeholder="Search in {viewState.selectedIndex?.uid}"
         class="flex-1 md:h-6 min-w-0 bg-transparent outline-none placeholder:text-zinc-400" />

  <!-- Clear button — only shown when there's a query -->
  {#if search.query}
    <button type="button" aria-label="Clear search" onclick={clearClicked}
            class="shrink-0 md:h-6 flex items-center text-zinc-400 hover:text-zinc-600 transition-colors">
      <span class="icon-[mdi--close] size-5" ></span>
    </button>
  {/if}

</div>


<style>
    /* remove the "x" / clear button at the right when some text has been entered - we provide our own clear button */
    input[type="search"]::-webkit-search-cancel-button {
        display: none;
    }
</style>