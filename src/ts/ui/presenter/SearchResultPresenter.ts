import type { Hit, Index } from "meilisearch"
import { HitFields } from "../HitFields"

export class SearchResultPresenter {

  // ── Heuristics ────────────────────────────────────────────────────────────

  /** Keys that are almost certainly not worth showing in a card overview */
  static BoringKeys = new Set([
    "slug", "created_at", "updated_at", "createdAt",
    "updatedAt", "password", "hash", "__v", "_rankingScore",
  ])

  static IdKeys = [
    "id", "_id", "uuid",
  ]

  static TitleKeys = [
    "title", "name", "label", "headline", "subject",
    "description", "summary", "excerpt",
    "type", "status",
  ]

  /** Priority keys shown first if present */
  static PriorityKeys = [
    ...SearchResultPresenter.TitleKeys,
    "body", "content",
    "author", "category", "tags",
    "price", "rating", "date", "year",
  ]

  static URL_PATTERN = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|avif|svg)(\?.*)?$/i
  static HTTP_PATTERN = /^https?:\/\//i

  static MarkdownPatterns = [
    /^#{1,6}\s/m,           // headings
    /\*\*.*?\*\*/,          // bold
    // /\*.*?\*/,              // italic
    /\[.*?\]\(.*?\)/,       // links
    /`[^`]+`/,              // inline code
    /^```/m,                // code blocks
    ///^[-*+]\s/m,            // unordered lists
    ///^\d+\.\s/m,            // ordered lists
    /^>\s/m,                // blockquotes
    /^---$/m,               // horizontal rule
  ]


  determineHitFields(index: Index | undefined, hit: Hit): HitFields {
    const titleKey = this.findTitleKey(hit)
    const idKey = index?.primaryKey

    return new HitFields(titleKey, this.getTitle(hit, titleKey), idKey, idKey ? this.getFieldValue(hit, idKey) : undefined,
      this.findImageUrl(hit), this.determineRankingScore(hit), this.determineDisplayedFields(hit, titleKey, idKey))
  }

  findTitleKey(hit: Hit): string | undefined {
    return SearchResultPresenter.TitleKeys.find(k => k in hit && typeof hit[k] === "string")
  }

  findImageUrl(hit: Hit): string | undefined {
    // Look for image in any value
    for (const val of Object.values(hit)) {
      if (this.isImageUrl(val)){
        return val as string
      }

      if (typeof val === "object" && val !== undefined && val !== null) {
        for (const nested of Object.values(val as object)) {
          if (this.isImageUrl(nested)) {
            return nested as string
          }
        }
      }
    }
    return undefined
  }

  isImageUrl(val: unknown): val is string {
    return typeof val === "string" && SearchResultPresenter.URL_PATTERN.test(val.trim())
  }

  isUrl(val: unknown): val is string {
    return typeof val === "string" && SearchResultPresenter.HTTP_PATTERN.test(val.trim())
  }

  getTitle(hit: Hit, titleKey: string | undefined): string {
    if (titleKey) {
      return this.getFieldValue(hit, titleKey)
    }

    // Fallback: first short string value
    for (const [, value] of Object.entries(hit)) {
      if (typeof value === "string" && value.length < 120 && !this.isImageUrl(value) && !this.isUrl(value)) {
        return value
      }
    }

    return "Untitled"
  }

  determineDisplayedFields(hit: Hit, titleKey: string | undefined, idKey: string | undefined): string[] {
    const countFieldsToFind = idKey ? 3 : 4

    const formatted = hit._formatted ?? {}
    const matchedFieldKeys = Object.keys(formatted)
      .filter(k => k !== titleKey && k !== idKey && this.formatValue(formatted[k]).includes(`<span class="match">`))
    if (matchedFieldKeys.length >= countFieldsToFind) {
      return matchedFieldKeys.slice(0, countFieldsToFind)
    }

    const allKeys = Object.keys(hit).filter(k => !SearchResultPresenter.BoringKeys.has(k) && k !== titleKey && k !== idKey && !this.isImageUrl(hit[k]))

    const prioritised = SearchResultPresenter.PriorityKeys
      .filter(k => allKeys.includes(k) && !matchedFieldKeys.includes(k))
      .concat(allKeys.filter(k => !SearchResultPresenter.PriorityKeys.includes(k)))
      .filter(k => {
        const v = hit[k]
        return v !== null && v !== undefined && String(v).trim() !== ""
      })

    return matchedFieldKeys
      .concat(prioritised)
      .slice(0, countFieldsToFind)
  }

  determineRankingScore(hit: Hit): number | undefined {
    const score = hit._rankingScore ?? hit._score ?? undefined
    if (score === undefined) {
      return undefined
    }
    return Math.round(Number(score) * 100)
  }

  getFieldValue(hit: Hit, key: string): string {
    if (hit._formatted && key in hit._formatted) {
      return hit._formatted[key]
    }

    const val = hit[key]
    if (val === undefined) {
      return ""
    }
    return this.formatValue(val)
  }

  formatValue(val: unknown): string {
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


  isProbablyMarkdown(text: string): boolean {
    return SearchResultPresenter.MarkdownPatterns.some(p => p.test(text))
  }

}