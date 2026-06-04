import { MeiliService } from "../../service/MeiliService"
import type { Hit, Index, Stats } from "meilisearch"
import { SearchState } from "./SearchState.svelte"

export class ViewState {

  static state = new ViewState()


  meili = $state<MeiliService | undefined>(undefined)

  meiliVersion = $state<string | undefined>(undefined)

  isHealthy = $state<boolean | undefined>(undefined)

  stats = $state<Stats | undefined>(undefined)


  indices = $state<Index[] | undefined>(undefined)

  selectedIndex = $state<Index | undefined>(undefined)


  search = $state(new SearchState())

  selectedHit = $state<Hit | undefined>(undefined)


  // Dialogs

  showIndexSettingsDialog = $state(false)

}