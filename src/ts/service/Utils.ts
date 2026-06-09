export class Utils {

  async copyToClipboard(data: string, isHtml: boolean = false) {
    if (!navigator.clipboard) {
      console.warn("Aborting, clipboard is not supported")
      return
    }

    /**
     * A few caveats worth knowing:
     *
     * - Supported mime types by all browsers are `text/plain`, `text/html`, and `image/png` (https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API#browser_compatibility).
     * - **`text/markdown` is not a registered MIME type** the browser clipboard will accept. The workaround is to put your markdown in `text/plain` (most markdown-aware apps like
     * Notion, Linear, and Bear detect it anyway), or use a custom `web text/markdown` type with the new [Web Custom Formats](https://docs.google.com/document/d/1XDOtTv8DtwTi4GaszwRFIJCOuzAEA4g9Tk0HrasQAdE)
     * spec (Chrome 104+ only).
     * - **`clipboard.write()`** (as opposed to `writeText`) requires user gesture and a secure context, same as `writeText`.
     * - **Firefox** has partial support — `text/plain` and `text/html` work, but it may block custom types.
     * - **Safari** supports it but requires all `Blob` promises to be resolved *synchronously* at construction time — don't `await` anything before building the `ClipboardItem`.
     */
    const items: Record<string, string | Blob> = {}
    if (isHtml) {
      items["text/html"] = new Blob([data], { type: "text/html" })
    }
    items["text/plain"] = new Blob([data], { type: "text/plain" }) // without it copying html to clipboard will not work

    const clipboardItem = new ClipboardItem(items)
    await navigator.clipboard.write([ clipboardItem ])
  }


  async makeDownloadable(data: any, mediaType: string, filename: string) {
    const blob = new Blob([data], { type: mediaType })
    const url = URL.createObjectURL(blob)

    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = filename
    anchor.click()
    URL.revokeObjectURL(url)
  }

}