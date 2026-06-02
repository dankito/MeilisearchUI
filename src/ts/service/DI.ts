import type {WebClient} from "../clients/web/WebClient"
import {FetchWebClient} from "../clients/web/FetchWebClient"
import {LogService} from "./LogService"

export class DI {

  static readonly log: LogService = new LogService()

  static readonly webClient: WebClient = new FetchWebClient(null, DI.log)

}