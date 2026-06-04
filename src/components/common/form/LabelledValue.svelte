<script lang="ts">
  import LabelledControl from "./LabelledControl.svelte"

  let { label, value, labelClasses, valueClasses }:
    { label: string, value?: string, labelClasses?: string, valueClasses?: string } = $props()
</script>


<LabelledControl {label} labelClasses="{labelClasses} min-w-36 md:min-w-40">
  <div class="{valueClasses} flex flex-row items-center">
    {value ?? ""}
  </div>
</LabelledControl>