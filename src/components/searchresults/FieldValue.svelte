<script lang="ts">
  import { DI } from "../../ts/service/DI"

  let { value }: { value: any } = $props()

  const presenter = DI.searchResultPresenter

  let isUrl = $derived(presenter.isUrl(value))

  let formatted = $derived(formatValue(value))

  let long = $derived(isLong(formatted))

  let open = $state(false)

  let isCode = $derived(typeof value === 'object' || (typeof value === 'string' && value.includes('\n')))


  // After how many lines a value gets the expand toggle
  const CLAMP_LINES = 4;

  /**
   * A value is "long" if its formatted string contains more than CLAMP_LINES newlines
   * OR is longer than ~300 chars (proxy for multi-line display).
   */
  function isLong(val: string): boolean {
    const lines = val.split('\n').length;
    return lines > CLAMP_LINES || val.length > 300;
  }

  function formatValue(v: unknown): string {
    if (v === null || v === undefined) return '';
    if (Array.isArray(v)) return v.map(item =>
      typeof item === 'object' ? JSON.stringify(item, null, 2) : String(item)
    ).join('\n');
    if (typeof v === 'object') return JSON.stringify(v, null, 2);
    return String(v);
  }
</script>



{#if isUrl && typeof value === 'string'}
  <a
      href={value}
      target="_blank"
      rel="noopener"
      class="text-primary underline underline-offset-2 break-all hover:text-primary/80"
  >
    {value}
  </a>

{:else if isCode}
  <!-- Multiline / JSON: monospace block -->
  <div class="relative">
                <pre
                    class="rounded-xl bg-zinc-50 ring-1 ring-zinc-100 px-3 py-2.5
                         text-xs text-zinc-700 whitespace-pre-wrap break-words overflow-hidden transition-all duration-300"
                    class:line-clamp-4={long && !open}
                >{formatted}</pre>

    {#if long}
      <button onclick={() => open = !open}
          class="mt-1 flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary/80 transition-colors"
      >
        <svg
            class="h-3.5 w-3.5 transition-transform duration-200"
            class:rotate-180={open}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
        {open ? 'Collapse' : 'Expand'}
      </button>
    {/if}
  </div>

{:else}
  <!-- Plain text -->
  <div class="relative">
    <p
        class="text-zinc-800 leading-relaxed whitespace-pre-wrap break-words transition-all duration-300"
        class:line-clamp-4={long && !open}
    >
      {formatted}
    </p>

    {#if long}
      <button onclick={() => open = !open}
          class="mt-1 flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary/80 transition-colors"
      >
        <svg
            class="h-3.5 w-3.5 transition-transform duration-200"
            class:rotate-180={open}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
        {open ? 'Collapse' : 'Expand'}
      </button>
    {/if}
  </div>
{/if}