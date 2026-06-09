<script lang="ts">
    import type { DialogProperties } from "./DialogProperties"
    import { onMount } from "svelte"
    import { UuidService } from "../../ts/service/UuidService"

    let { children, show = true, title = "", titleBarVisible = true,
        dismissButtonText = "Cancel", disallowCancellingDialog = false,
        confirmButtonText = "Ok", confirmButtonVisible = true, confirmButtonEnabled = true,
        onClose, onDismiss, onConfirm }: DialogProperties = $props()

    let oldShow: boolean = $state(show)
    let dialogHistoryId: string | null = $state(null)


    onMount(() => {
        window.addEventListener("popstate", popState)
        document.addEventListener("keydown", keyDown)

        return () => {
            window.removeEventListener("popstate", popState)
            document.removeEventListener("keydown", keyDown)
        }
    })

    $effect(() => {
        if (show != oldShow) {
            oldShow = show

            if (show) {
                dialogHistoryId = UuidService.createId()
                history.pushState({ dialogId: dialogHistoryId }, "")
            }
        }
    })

    async function confirmed(event: Event) {
        preventFurtherActions(event)

        if (onConfirm) {
            const successful = await onConfirm()
            if (successful) {
                closeDialog(event)
            }
        } else {
            closeDialog(event)
        }
    }

    function dismiss(event: Event, goBack: boolean = true) {
      preventFurtherActions(event)

      if (onDismiss) {
        onDismiss()
      }

      closeDialog(event, goBack)
    }

    function keyDown(event: KeyboardEvent) {
        if (event.key === "Escape") {
          dismiss(event)
        }
    }

    function popState(event: PopStateEvent) {
      const dialogId = event.state?.dialogId
      if (dialogId == dialogHistoryId) {
        dismiss(event, false)
      }
    }

    function closeDialog(event: Event | null = null, goBack: boolean = true) {
        if (show) {
            preventFurtherActions(event)
            onClose()

            if (dialogHistoryId) {
                dialogHistoryId = null
                if (goBack) {
                    history.back()
                }
            }
        }
    }

    function preventFurtherActions(event: Event | null) {
        // otherwise e.g. causes in GespieltePartieContextMenu if ConfirmDialog to ask if Partie should be deleted, that the deleted Partie gets displayed
        event?.stopPropagation()
    }

</script>


{#if show}
  <div class="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black/50 z-[999]">
    <div class="flex flex-col min-w-[300px] max-w-[96vw] max-h-[96dvh] bg-zinc-100 rounded-2xl shadow-xl">

      {#if titleBarVisible}
        <div class="h-8 mx-3 flex items-center mt-2">
          <div class="flex-1 text-xl text-zinc-500 font-semibold mr-4">{ title ?? '\u00A0' }</div>

          {#if disallowCancellingDialog != true}
            <button class="close w-8 h-8 hover:bg-[rgba(0,0,0,0.04)]" onclick={dismiss}></button>
          {/if}
        </div>
      {/if}

      <div class="flex-1 mx-3 mt-2 bg-white rounded-2xl shadow-lg overflow-x-hidden overflow-y-auto">
        {@render children()}
      </div>

      <div class="w-full px-3 flex justify-evenly gap-4 text-primary">
        {#if disallowCancellingDialog == false}
          <button class="w-full h-10 font-semibold my-1 bg-transparent rounded-lg
             hover:text-primary-higher-contrast hover:bg-black/4
             active:text-primary-higher-contrast active:bg-black/8"
              onclick={dismiss} >
            {dismissButtonText}
          </button>
        {/if}

        {#if confirmButtonVisible}
          <button class="w-full h-10 font-semibold my-1 bg-transparent rounded-lg transition-all duration-150
             hover:text-primary-higher-contrast hover:bg-black/4
             active:text-primary-higher-contrast active:bg-black/8
             disabled:text-zinc-400 disabled:cursor-not-allowed"
                  disabled={!confirmButtonEnabled} onclick={confirmed}>
            {confirmButtonText}
          </button>
        {/if}
      </div>
    </div>
  </div>
{/if}


<style>
    .close:before, .close:after {
        display: inline-block;
        left: 14px;
        content: ' ';
        height: 28px;
        width: 2px;
        background-color: var(--color-zinc-500); /* the same as title's text color */
    }
    .close:before {
        transform: rotate(45deg);
    }
    .close:after {
        transform: rotate(-45deg);
    }
</style>
