<script lang="ts">
  import { BookOpen } from "@lucide/svelte"
  import type { Hit } from "meilisearch"

  let { hit }: { hit: Hit } = $props()

  // ── Heuristics ────────────────────────────────────────────────────────────

  /** Keys that are almost certainly not worth showing in a card overview */
  const BORING_KEYS = new Set([
    "slug", "created_at", "updated_at", "createdAt",
    "updatedAt", "password", "hash", "__v", "_rankingScore",
  ])

  /** Priority keys shown first if present */
  const PRIORITY_KEYS = [
    "id", "_id", "uuid", "title", "name", "label", "headline", "subject",
    "description", "summary", "excerpt", "body", "content",
    "author", "category", "type", "status", "tags",
    "price", "rating", "date", "year",
  ]

  const URL_PATTERN = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|avif|svg)(\?.*)?$/i
  const HTTP_PATTERN = /^https?:\/\//i


  function findImageUrl(hit: Hit): string | null {
    // Look for image in any value
    for (const val of Object.values(hit)) {
      if (isImageUrl(val)){
        return val as string
      }

      if (typeof val === "object" && val !== null) {
        for (const nested of Object.values(val as object)) {
          if (isImageUrl(nested)) {
            return nested as string
          }
        }
      }
    }
    return null
  }

  function isImageUrl(val: unknown): val is string {
    return typeof val === "string" && URL_PATTERN.test(val.trim())
  }

  function isUrl(val: unknown): val is string {
    return typeof val === "string" && HTTP_PATTERN.test(val.trim())
  }

  function getTitle(hit: Hit): string {
    if (titleKey) {
      return truncate(String(hit[titleKey]), 80)
    }

    // Fallback: first short string value
    for (const [, v] of Object.entries(hit)) {
      if (typeof v === "string" && v.length < 120 && !isImageUrl(v) && !isUrl(v)) {
        return truncate(v, 80)
      }
    }

    return "Untitled"
  }

  function determineBodyFields(hit: Hit): string[] {
    const allKeys = Object.keys(hit).filter(k => !BORING_KEYS.has(k) && k !== titleKey && !isImageUrl(hit[k]))

    const prioritised = PRIORITY_KEYS
      .filter(k => allKeys.includes(k))
      .concat(allKeys.filter(k => !PRIORITY_KEYS.includes(k)))

    return prioritised
      .filter(k => {
        const v = hit[k]
        return v !== null && v !== undefined && String(v).trim() !== ""
      })
      .slice(0, 4)
  }

  function determineRankingScore(hit: Hit): number | null {
    const score = hit._rankingScore ?? hit._score ?? null
    if (score === null) {
      return null
    }
    return Math.round(Number(score) * 100)
  }

  function formatValue(val: unknown): string {
    if (val === null || val === undefined) {
      return ""
    }

    if (Array.isArray(val)) {
      return val.slice(0, 5).join(", ")
    }

    if (typeof val === "object") {
      return JSON.stringify(val)
    }
    return String(val)
  }

  function truncate(str: string, max: number): string {
    return str.length > max ? str.slice(0, max).trimEnd() + "…" : str
  }

  // ── Derived state ─────────────────────────────────────────────────────────

  let imageUrl = $derived(findImageUrl(hit))

  const titleKey = $derived(PRIORITY_KEYS.slice(0, 5).find(k => k in hit && typeof hit[k] === "string") ?? null)

  const title = $derived(getTitle(hit))

  /** Keys to display as body fields — ordered by priority, capped at 4 */
  const bodyFields = $derived(determineBodyFields(hit))

  const rankingScore = $derived(determineRankingScore(hit))

  let imgError = $state(false)
</script>

<article class="relative flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white
         px-3 py-3 shadow-sm transition-all duration-200
         hover:shadow-md hover:-translate-y-px">
  <!-- Image thumbnail -->
  {#if imageUrl && !imgError}
    <img
        src={imageUrl}
        alt={title}
        onerror={() => (imgError = true)}
        class="size-20 rounded-xl object-cover ring-1 ring-zinc-100"
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
        {@const val = formatValue(raw)}
        {#if val}
          <div class="flex gap-1.5 text-xs leading-relaxed">
            <dt class="shrink-0 font-medium text-zinc-400 capitalize">{key.replace(/_/g, ' ')}</dt>
            <dd class="min-w-0 text-zinc-600 line-clamp-1 break-all">
              {#if isUrl(raw)}
                <a href={raw} target="_blank" rel="noopener"
                   class="text-primary underline underline-offset-2 hover:text-primary/80">
                  {truncate(raw, 50)}
                </a>
              {:else}
                {truncate(val, 120)}
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