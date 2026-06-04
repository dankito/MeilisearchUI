<script lang="ts">
  import FieldValue from "./FieldValue.svelte"

  let { key, value }: { key: string, value: any } = $props()
</script>

<div class="w-full flex flex-col gap-0.5">
  <dt class="shrink-0 text-zinc-400 font-semibold">{key}</dt>
  <dd class="flex-1 w-full leading-relaxed">
    <FieldValue {value} />
  </dd>
</div>