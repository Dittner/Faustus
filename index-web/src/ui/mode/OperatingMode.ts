import { IndexContext } from "../IndexContext"
import { ActionController } from "./Action"

export type OperatingModeID = 'connect' | 'explore' | 'read' | 'search'

export class OperatingMode extends ActionController {
  readonly id: OperatingModeID

  constructor(id: OperatingModeID, ctx: IndexContext) {
    super(ctx)
    this.id = id
  }

  get isActive(): boolean {
    return this.ctx.$mode.value.id == this.id
  }

  activate(): void {
    this.ctx.$mode.value.deactivate()
    this.ctx.$actionControllerStack.popAll()
    this.ctx.$actionControllerStack.push(this)
    this.ctx.$mode.value = this
  }

  deactivate(): void {
    this.ctx.$msg.value = undefined
    this.ctx.$msg.value = { text: '', level: 'info' }
    this.lastExecutedAction = undefined
  }
}
