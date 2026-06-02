<script>
    import MainScreen from "./components/MainScreen.svelte"
    import {ViewState} from "./ts/ui/state/ViewState.svelte"

    const viewState = ViewState.state

</script>

<MainScreen {viewState} />