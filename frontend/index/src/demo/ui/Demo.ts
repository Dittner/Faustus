import { RXObservableValue, RXSubject } from "flinker"
import { btn, div, h1, image, input, link, p, spacer, switcher, textarea, vlist, vstack } from "flinker-dom"
import { MaterialIcon } from "../../global/MaterialIcon"
import { globalContext } from "../../App"
import { Icon, IconBtn } from "../../index/ui/controls/Button"
import { TextInput } from "../../index/ui/editor/FileTextReplacer"
import { FontFamily } from "../../index/ui/controls/Font"
import { theme } from "../../global/ThemeManager"

export function DemoView() {
  return vstack()
    .react(s => {
      s.width = '900px'
      s.bgColor = '#f7f7f7'
      s.paddingLeft = (window.innerWidth - 900 >> 1) + 'px'
      s.textColor = theme().text
    })
    .children(() => {
      Counter(counterState)
      Buttons()
      TodoList()
      Images()
      Inputs()
    })
}

const counterState = new RXObservableValue(0)
const Counter = (rx: RXObservableValue<number>) => {
  // The function body will not update when the state changes.
  // Therefore we can declare any functions and states hier.
  //
  return div().children(() => {
    p()
      .observe(rx)
      .react(s => {
        // react function will be called after the state (rx) changes
        s.text = 'Count: ' + rx.value
        s.textColor = '#222222'
      })

    // btn will be rendered once,
    // because it is not subscribed to external state
    btn()
      .react(s => {
        s.text = 'Inc'
        s.textColor = '#ffFFff'
        s.bgColor = '#222222'
        s.cornerRadius = '4px'
        s.padding = '10px'
      })
      .whenHovered(s => {
        s.bgColor = '#444444'
      })
      .onClick(() => rx.value++)
  })
}

function Buttons() {
  return vstack()
    .react(s => {
      s.width = '100%'
      s.halign = 'left'
      s.valign = 'center'
      s.gap = '10px'
    })
    .children(() => {
      h1().react(s => {
        s.text = 'Buttons'
      })

      RedBtn()
        .react(s => s.text = 'Inc')
        .onClick(() => {
          console.log('Clicked')
        })

      ToggleBtn(new RXObservableValue(false))
        .react(s => s.text = 'Toggle Btn')
        .onClick(() => {
          console.log('ToggleBtn was clicked')
        })

      Switcher()

      spacer()
        .react(s => {
          s.height = '50px'
        })

      IconBtn()
        .react(s => {
          s.icon = MaterialIcon.add
          s.text = 'Icon Button'
          s.textColor = '#ffFFff'
          s.bgColor = '#111111'
          s.cornerRadius = '5px'
          s.padding = '10px'
        })
        .whenHovered(s => {
          s.textColor = '#cc2222'
          s.bgColor = '#222222'
        })

      IconBtn()
        .react(s => {
          s.isDisabled = true
          s.icon = MaterialIcon.add
          s.text = 'Disabled Icon Button'
          s.textColor = '#ffFFff'
          s.bgColor = '#111111'
          s.cornerRadius = '5px'
          s.padding = '10px'
        })
        .whenHovered(s => {
          s.textColor = '#cc2222'
          s.bgColor = '#222222'
        })

      link()
        .react(s => {
          s.text = 'Link Btn'
          s.href = '/books/bookId'
        })

      btn()
        .react(s => {
          s.textColor = '#000000'
          s.text = 'Custom Link Btn'
        })
        .onClick(() => globalContext.app.navigate('/books/bookId'))

    })
}

const RedBtn = () => {
  return btn()
    .react(s => {
      s.textColor = '#ffFFff'
      s.bgColor = '#222222'
      s.cornerRadius = '5px'
      s.padding = '10px'
    })
    .whenHovered(s => {
      s.textColor = '#cc2222'
    })
}

const FolderIcon = () => {
  return Icon()
    .react(s => {
      s.value = MaterialIcon.folder_open
      s.textColor = '#ffFFff'
    })
}

const ToggleBtn = ($isSelected: RXObservableValue<boolean>) => {
  return btn()
    .observe($isSelected)
    .react(state => {
      state.isSelected = $isSelected.value
      state.isDisabled = false
      state.textColor = '#ffFFff'
      state.bgColor = '#222222'
      state.cornerRadius = '5px'
      state.padding = '10px'
    })
    .whenHovered(state => {
      state.textColor = '#cc2222'
    })
    .whenSelected(state => {
      state.bgColor = '#cc2222'
    })
    .onClick(() => {
      $isSelected.value = !$isSelected.value
    })
}

const Switcher = () => {
  const $isSelectedState = new RXObservableValue(true)
  return switcher()
    .observe($isSelectedState)
    .react(state => {
      state.isSelected = $isSelectedState.value
    })
    .onClick(() => {
      $isSelectedState.value = !$isSelectedState.value
    })
}



export interface Task {
  id: number
  text: string
}

export class ToDoModel {
  readonly $tasks = new RXSubject<Task[], never>([])

  private lastTaskId = 0
  createTask(text: string) {
    this.$tasks.value.push({ id: this.lastTaskId++, text })
    this.$tasks.resend() // all subsctibers to the $tasks will be notified,  of the
  }
}

/*
*
*  TodoList
*
*/

const model = new ToDoModel()
const TodoList = () => {
  return vstack()
    .react(s => {
      s.width = '400px'
    })
    .children(() => {
      h1()
        .observe(model.$tasks)
        .react(s => s.text = 'TodoList (' + model.$tasks.value.length + ')')

      vlist<Task>()
        .observe(model.$tasks)
        .items(() => model.$tasks.value)
        .equals((a, b) => a.id === b.id)
        .itemRenderer(TaskView)

      btn()
        .react(s => {
          s.bgColor = '#222222'
          s.padding = '10px'
          s.cornerRadius = '4px'
          s.text = '+ New Task'
        })
        .onClick(() => {
          model.createTask('New Task')
        })
    })
}


const TaskView = (t: Task) => {
  return p()
    .react(s => {
      s.text = t.text
    })
}

/*
*
*  Images
*
*/

const Images = () => {
  return vstack()
    .react(s => {
      s.width = '400px'
    })
    .children(() => {
      h1().react(s => s.text = 'Images & icons')

      image().react(s => {
        s.src = '/src/resources/chaplin.jpg'
        s.alt = "Chaplin's photo"
      })

      p().react(s => s.text = 'Material folder icon:')
      FolderIcon()
    })
}

/*
*
*  Inputs
*
*/

const Inputs = () => {
  const $buffer = new RXObservableValue('')
  return vstack()
    .react(s => {
      s.width = '400px'
    })
    .children(() => {
      h1().react(s => s.text = 'Inputs')

      p()
        .observe($buffer)
        .react(s => s.text = 'Count letters: ' + $buffer.value.length)

      input()
        .bind($buffer)
        .react(s => {
          s.value = $buffer.value
          s.placeholder = 'TextInput'
          s.fontFamily = FontFamily.APP
          s.width = '100%'
          s.height = '50px'
          s.bgColor = '#00000000'
          s.border = '1px solid #aaaaaa'
          s.fontSize = '20px'
          s.textColor = '#ffFFff'
          s.autoCorrect = 'off'
          s.spellCheck = false
          s.paddingHorizontal = '10px'
        })
        .whenFocused(s => {
          s.bgColor = '#111111'
          s.border = '1px solid #2266ff'
        })
        .whenPlaceholderShown(s => {
          s.textColor = '#666666'
        })

      textarea()
        .bind($buffer)
        .react(s => {
          console.log('teaxtarea updated props')
          s.value = $buffer.value
          s.placeholder = 'TextArea'
          s.fontFamily = FontFamily.APP
          s.width = '100%'
          s.height = '300px'
          s.bgColor = '#00000000'
          s.border = '1px solid #aaaaaa'
          s.fontSize = '20px'
          s.textColor = '#ffFFff'
          s.autoCorrect = 'off'
          s.spellCheck = false
          s.paddingHorizontal = '10px'
        })
        .whenFocused(s => {
          s.bgColor = '#111111'
          s.border = '1px solid #2266ff'
        })
        .whenPlaceholderShown(s => {
          s.textColor = '#666666'
        })
        .onInput((e: any) => {
          console.log(e.target.value)
        })

      RedBtn()
        .react(s => s.text = 'Clear Inputs')
        .onClick(() => {
          console.log('Clear inputs, cur buffer value:', $buffer.value)
          $buffer.value = ''
        })

      TextInput($buffer)
        .react(s => {
          s.width = '100%'
          s.title = 'TextInput'
        })

    })
}
