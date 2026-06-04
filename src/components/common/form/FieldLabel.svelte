<script lang="ts">
  let { label, class: classNames }: { label: string, class?: string } = $props()
</script>


<div class="flex flex-row items-center text-sm font-bold text-zinc-500 whitespace-nowrap {classNames}">
  {label}
</div>