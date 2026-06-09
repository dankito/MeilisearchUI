<script lang="ts">
  import BaseDialog from "./BaseDialog.svelte"

  let { show, question, confirmButtonText = "Ok", dismissButtonText = "Cancel", onClose, onConfirm }:
      { show: boolean, question: string, confirmButtonText?: string, dismissButtonText?: string, onClose: () => void, onConfirm: () => Promise<boolean> } = $props()
</script>

<BaseDialog {show} titleBarVisible={true} {confirmButtonText} {dismissButtonText} {onClose} {onConfirm} >
  <div class="max-sm:min-w-[80vw] md:min-w-125 max-w-[550px] p-4 leading-normal text-center whitespace-pre-line">
    { question }
  </div>
</BaseDialog>
