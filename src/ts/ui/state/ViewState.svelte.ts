import { MeiliService } from "../../service/MeiliService"
import type { Index, Stats } from "meilisearch"

export class ViewState {

  static state = new ViewState()


  meili = $state<MeiliService | undefined>(undefined)

  meiliVersion = $state<string | undefined>(undefined)

  isHealthy = $state<boolean | undefined>(undefined)

  indices = $state<Index[] | undefined>(undefined)

  stats = $state<Stats | undefined>(undefined)

}