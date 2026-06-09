<script lang="ts">
  let { html, maxHeight }: { html: string, maxHeight?: string } = $props()
</script>

<!-- to avoid that html destroys our layout we have to use an iframe -->
<iframe srcdoc={html} sandbox="allow-scripts" title="HTML preview"
        class="size-full overflow-y-auto" style="height: {maxHeight ?? `600px`}; overflow-y: auto;">

</iframe>