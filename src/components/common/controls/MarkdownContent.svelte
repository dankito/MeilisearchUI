<script lang="ts">
  import { marked } from "marked"

  let { content, class: className = "" }: { content: string, class?: string } = $props()


  function sanitizeInput(content: string): string {
    //  Input: special ZERO WIDTH unicode characters (for example \uFEFF) might interfere with parsing. Some text
    //  editors add them at the start of the file (see: #2139).
    return content.replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/,"")
  }

  function sanitizeHtml(html: string): string {
    // TODO: better use DOMPurify

    // when content contained styles, this also affected our UI, so ensure it does not contain any styles
    const template = document.createElement("template")
    template.innerHTML = html

    // Use a more robust way to find and remove all style tags
    const styles = template.content.querySelectorAll("style,script") // also remove scripts to avoid injections
    styles.forEach(el => el.remove())

    // Also remove any inline style attributes from all elements
    const elementsWithStyles = template.content.querySelectorAll("[style]")
    elementsWithStyles.forEach(el => el.removeAttribute("style"))

    return template.content.firstChild instanceof HTMLElement || template.content.childNodes.length > 0 
      ? template.innerHTML 
      : ""
  }

  let html = $derived(sanitizeHtml(marked.parse(content) as string))
</script>

<div class="markdown-content min-w-0 {className}">
  {@html html}
</div>

<style>
  /* for the CSS see file css/markdown.css */
</style>