import { RXObservableValue } from "flinker";
import { globalContext } from "../../../App";
import { IndexContext } from "../../IndexContext";
import { OperatingModeClass } from "../OperatingMode";

export class ServerConnection extends OperatingModeClass {
  readonly $logs = new RXObservableValue('')
  constructor(ctx: IndexContext) {
    super('connect', ctx)
  }

  override activate(): void {
    super.activate()
    let logs = ''
    logs += 'API_URL: ' + globalContext.indexServer.baseUrl + '\n'
    logs += 'Connecting to the server...\n'
    this.$logs.value = logs
    globalContext.indexServer.ping().pipe()
      .onReceive(_ => {
        this.$logs.value += 'Success\n'
        const path = document.location.pathname.split('#')[0]
        if (path.endsWith('/')) this.ctx.explorer.activate()
        else this.ctx.reader.activate()
      })
      .onError(e => {
        this.$logs.value += 'Error: ' + e.message + '\n'
        this.ctx.$msg.value = { text: 'No connection to the server', level: 'error' }
      })
      .subscribe()
  }

  override deactivate(): void {
    super.deactivate()
  }
}