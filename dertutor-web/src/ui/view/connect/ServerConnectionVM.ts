import { RXObservableValue } from "flinker";
import { globalContext } from "../../../App";
import { DerTutorContext } from "../../../DerTutorContext";
import { ViewModel } from "../ViewModel";
import { UrlKeys } from "../../../app/URLNavigator";
import { Interactor } from "../Interactor";

export interface ServerConnectionState {
  hasConnection?: boolean
  logs?: string
}

export class ServerConnectionVM extends ViewModel<ServerConnectionState> {
  readonly $logs = new RXObservableValue('')
  constructor(ctx: DerTutorContext) {
    const interactor = new ServerConnectionInteractor(ctx)
    super('connection', ctx, interactor)
  }

  protected override stateDidChange(state: ServerConnectionState) {
    if (!this.activate) return
    console.log('Connection.stateDidChange:', state)
    this.$logs.value = state.logs ?? ''
    state.hasConnection && this.navigator.updateWith({}) //reload page without clearing url
  }
}

class ServerConnectionInteractor extends Interactor<ServerConnectionState> {
  constructor(ctx: DerTutorContext) {
    super(ctx)
    console.log('new ServerConnectionInteractor')
  }

  override async load(state: ServerConnectionState, keys: UrlKeys) {
    state.logs = ''
    state.logs += 'API_URL: ' + globalContext.server.baseUrl + '\n'
    state.logs += 'Connecting to the server...\n'
    await globalContext.server.ping().asAwaitable
    state.hasConnection = globalContext.server.$isServerAvailable.value
    state.logs += 'Success\n'
  }

  protected override errorDidCatch(e: any, state: ServerConnectionState): void {
    state.logs += 'Error: ' + e.message + '\n'
    this.ctx.$msg.value = { text: 'No connection to the server', level: 'error' }
  }
}