<script lang="ts">
  let { html, maxHeight }: { html: string, maxHeight?: number } = $props()

  let fullHeight = $state(0)

  const iframeHeight = $derived(maxHeight ?? fullHeight)

  const srcdoc = $derived(buildHeightReportingSrcdoc(html))


  function onMessage(e: MessageEvent) {
    if (e.data?.type === "html-height") {
      fullHeight = e.data.height
    }
  }

  function buildHeightReportingSrcdoc(html: string): string {
    const heightScript = `
    <script>
      function postHeight() {
        window.parent.postMessage(
          { type: "html-height", height: document.documentElement.scrollHeight },
          "*"
        )
      }
      postHeight()
      new ResizeObserver(postHeight).observe(document.body)
    <\/script>`

    if (html.includes("</body>")) {
      return html.replace("</body>", `${heightScript}</body>`)
    }

    return `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          * { box-sizing: border-box; }
          body { margin: 0; padding: 0; overflow: hidden; }
        </style>
      </head>
      <body>
        ${html}
        ${heightScript}
      </body>
    </html>`
  }
</script>


<svelte:window on:message={onMessage} />

<!-- to avoid that html destroys our layout we have to use an iframe -->
<iframe srcdoc={srcdoc} sandbox="allow-scripts" title="HTML preview"
        class="w-full border-none block" style="height: {iframeHeight}px;">

</iframe>