import { RXObservableValue } from "flinker";
import { globalContext } from "../../../App";
import { DertutorContext } from "../../../DertutorContext";
import { ViewModel } from "../ViewModel";

export class ServerConnectionVM extends ViewModel {
  readonly $logs = new RXObservableValue('')
  constructor(ctx: DertutorContext) {
    super('connection', ctx)
  }

  override activate(): void {
    super.activate()
    let logs = ''
    logs += 'API_URL: ' + globalContext.server.baseUrl + '\n'
    logs += 'Connecting to the server...\n'
    this.$logs.value = logs
    globalContext.server.ping().pipe()
      .onReceive(_ => {
        this.$logs.value += 'Success\n'
        this.ctx.langListVM.activate()
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