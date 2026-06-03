import type { Hit } from "meilisearch"

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


  findTitleKey(hit: Hit): string | null {
    return SearchResultPresenter.TitleKeys.find(k => k in hit && typeof hit[k] === "string") ?? null
  }

  findImageUrl(hit: Hit): string | null {
    // Look for image in any value
    for (const val of Object.values(hit)) {
      if (this.isImageUrl(val)){
        return val as string
      }

      if (typeof val === "object" && val !== null) {
        for (const nested of Object.values(val as object)) {
          if (this.isImageUrl(nested)) {
            return nested as string
          }
        }
      }
    }
    return null
  }

  isImageUrl(val: unknown): val is string {
    return typeof val === "string" && SearchResultPresenter.URL_PATTERN.test(val.trim())
  }

  isUrl(val: unknown): val is string {
    return typeof val === "string" && SearchResultPresenter.HTTP_PATTERN.test(val.trim())
  }

  getTitle(hit: Hit, titleKey: string | null): string {
    if (titleKey) {
      return String(hit[titleKey])
    }

    // Fallback: first short string value
    for (const [, value] of Object.entries(hit)) {
      if (typeof value === "string" && value.length < 120 && !this.isImageUrl(value) && !this.isUrl(value)) {
        return value
      }
    }

    return "Untitled"
  }

  determineBodyFields(hit: Hit, titleKey: string | null): string[] {
    const allKeys = Object.keys(hit).filter(k => !SearchResultPresenter.BoringKeys.has(k) && k !== titleKey && !this.isImageUrl(hit[k]))

    const idKey = allKeys.find(k => SearchResultPresenter.IdKeys.includes(k))

    const prioritised = SearchResultPresenter.PriorityKeys
      .filter(k => allKeys.includes(k))
      .concat(allKeys.filter(k => k !== idKey && !SearchResultPresenter.PriorityKeys.includes(k)))

    let idAndPrioritised = prioritised
      .filter(k => {
        const v = hit[k]
        return v !== null && v !== undefined && String(v).trim() !== ""
      })
      .slice(0, idKey ? 3 : 4)

    if (idKey) {
      idAndPrioritised = [ idKey, ...idAndPrioritised ]
    }

    return idAndPrioritised
  }

  determineRankingScore(hit: Hit): number | null {
    const score = hit._rankingScore ?? hit._score ?? null
    if (score === null) {
      return null
    }
    return Math.round(Number(score) * 100)
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

}