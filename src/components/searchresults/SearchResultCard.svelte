<script lang="ts">
  import { BookOpen } from "@lucide/svelte"
  import type { Hit } from "meilisearch"
  import { DI } from "../../ts/service/DI"

  let { hit, hasImageUrls = false }: { hit: Hit, hasImageUrls?: boolean } = $props()

  const presenter = DI.searchResultPresenter


  // ── Derived state ─────────────────────────────────────────────────────────

  let imageUrl = $derived(presenter.findImageUrl(hit))

  const titleKey = $derived(presenter.findTitleKey(hit))

  const title = $derived(presenter.getTitle(hit, titleKey))

  /** Keys to display as body fields — ordered by priority, capped at 4 */
  const bodyFields = $derived(presenter.determineBodyFields(hit, titleKey))

  const rankingScore = $derived(presenter.determineRankingScore(hit))

  let imgError = $state(false)
</script>

<article class="relative flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white
         px-3 py-3 shadow-sm transition-all duration-200
         hover:shadow-md hover:-translate-y-px">
  <!-- Image thumbnail -->
  {#if hasImageUrls}
    {#if imageUrl && !imgError}
      <img
          src={imageUrl}
          alt={title}
          onerror={() => (imgError = true)}
          class="size-20 rounded-lg object-cover ring-1 ring-zinc-100"
      />
    {:else}
      <!-- Placeholder icon -->
      <div
          class="shrink-0 size-20 flex items-center justify-center
             rounded-xl text-zinc-300 bg-zinc-50 ring-1 ring-zinc-100"
      >
        <BookOpen size={28} />
      </div>
    {/if}
  {/if}

  <!-- Content -->
  <div class="min-w-0 flex-1">
    <!-- Title row -->
    <div class="flex items-start justify-between gap-2">
      <h3 class="text-sm font-semibold leading-snug text-zinc-900 line-clamp-2">
        {title}
      </h3>
      {#if rankingScore !== null}
        <span
            class="ml-auto shrink-0 rounded-full bg-primary/10 px-2 py-0.5
                 text-[10px] font-semibold tracking-wide text-primary"
        >
          {rankingScore}%
        </span>
      {/if}
    </div>

    <!-- Body fields -->
    <dl class="mt-2 space-y-1">
      {#each bodyFields as key}
        {@const raw = hit[key]}
        {@const val = presenter.formatValue(raw)}
        {#if val}
          <div class="flex gap-1.5 text-xs leading-relaxed">
            <dt class="shrink-0 font-medium text-zinc-400 capitalize">{key.replace(/_/g, ' ')}</dt>
            <dd class="min-w-0 text-zinc-600 truncate break-all">
              {#if presenter.isUrl(raw)}
                <a href={raw} target="_blank" rel="noopener"
                   class="text-primary underline underline-offset-2 hover:text-primary/80">
                  {raw}
                </a>
              {:else}
                {val}
              {/if}
            </dd>
          </div>
        {/if}
      {/each}
    </dl>
  </div>

  <!-- Subtle right-arrow on hover -->
  <div
      class="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 transition-opacity
           duration-150 group-hover:opacity-100"
  >
    <svg class="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  </div>
</article>