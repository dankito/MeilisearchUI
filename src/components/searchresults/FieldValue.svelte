<script lang="ts">
  import { DI } from "../../ts/service/DI"
  import Card from "../common/form/Card.svelte"
  import MarkdownContent from "../common/controls/MarkdownContent.svelte"
  import HtmlContent from "../common/controls/HtmlContent.svelte"

  let { value, clampHeight }: { value: any, clampHeight?: boolean } = $props()

  const presenter = DI.searchResultPresenter

  let isUrl = $derived(presenter.isUrl(value))

  let formatted = $derived(formatValue(value))

  let isMarkdown = $derived(typeof value === "string" && presenter.isProbablyMarkdown(value))

  let isHtml = $derived(typeof value === "string" && value.trimStart().startsWith("<") && value.trimEnd().endsWith(">"))

  let isCode = $derived(typeof value === "object" || (typeof value === "string" && value.includes("\n")))


  function formatValue(value: any): string {
    if (value === null || value === undefined) {
      return ""
    }

    if (typeof value === "string") {
      return value
    }

    if (Array.isArray(value)) {
      return value.map(item =>
        typeof item === "object" ? JSON.stringify(item, null, 2) : String(item)
      ).join("\n")
    }

    if (typeof value === "object") {
      return JSON.stringify(value, null, 2)
    }

    return String(value)
  }
</script>



{#if isUrl}
  <a href={value} target="_blank" rel="noopener"
      class="text-primary underline underline-offset-2 break-all hover:text-primary/80" >
    {value}
  </a>

{:else if isHtml}
  <Card class="prose prose-sm prose-zinc max-w-none border border-zinc-200 p-3">
    <HtmlContent html={value} maxHeight={clampHeight ? "120px" : undefined} />
  </Card>

{:else if isMarkdown}
  <Card class="max-w-none border border-zinc-200 p-3">
    <div class="overflow-y-auto" class:max-h-30={clampHeight}>
      <MarkdownContent content={value} />
    </div>
  </Card>

{:else if isCode}
  <!-- Multiline / JSON: monospace block -->
  <div class="relative">
    <pre class="rounded-xl bg-zinc-50 ring-1 ring-zinc-100 px-3 py-2.5
             text-xs text-zinc-700 whitespace-pre-wrap wrap-break-word overflow-hidden transition-all duration-300"
        class:line-clamp-4={clampHeight}>
      {formatted}
    </pre>
  </div>

{:else}
  <!-- Plain text -->
  <div class="relative">
    <p class="text-zinc-800 leading-relaxed whitespace-pre-wrap wrap-break-word transition-all duration-300"
        class:line-clamp-4={clampHeight}>
      {formatted}
    </p>
  </div>
{/if}