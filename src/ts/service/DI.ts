import type {WebClient} from "../clients/web/WebClient"
import {FetchWebClient} from "../clients/web/FetchWebClient"
import {LogService} from "./LogService"
import { SearchResultPresenter } from "../ui/presenter/SearchResultPresenter"
import { FormatService } from "./FormatService"
import { Utils } from "./Utils"

export class DI {

  static readonly log: LogService = new LogService()

  static readonly formatService = new FormatService()

  static readonly utils = new Utils()

  static readonly webClient: WebClient = new FetchWebClient(null, DI.log)

  static readonly searchResultPresenter = new SearchResultPresenter()

}