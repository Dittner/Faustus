import { btn, hstack, input, p, spacer, vstack } from "flinker-dom"
import { IndexContext } from "../../IndexContext"
import { FontFamily } from "../../controls/Font"
import { Icon, IconBtn } from "../../controls/Button"
import { MaterialIcon } from "../../MaterialIcon"
import { Markdown } from "../../markdown/Markdown"
import { theme } from "../../theme/ThemeManager"
import { globalContext } from "../../../App"

export const TranslationPanel = () => {
  const ctx = IndexContext.self
  return vstack()
    .observe(ctx.reader.$translationSearchInputBuffer)
    .observe(ctx.reader.$translationSearchInputFocused)
    .react(s => {
      s.visible = ctx.reader.$translationSearchInputBuffer.value.length > 0 || ctx.reader.$translationSearchInputFocused.value
      s.gap = '5px'
      s.width = '100%'
      s.fontFamily = FontFamily.APP
    })
    .children(() => {

      hstack().react(s => {
        s.valign = 'center'
        s.width = '100%'
        s.maxWidth = '300px'
        s.gap = '10px'
        s.fontSize = theme().fontSizeXS
        s.paddingVertical = '2px'
      })
        .children(() => {
          p().react(s => {
            s.text = 'Search translation:'
            s.textColor = theme().text
            s.fontWeight = 'bold'
            s.fontSize = 'inherit'
          })

          spacer()

          btn()
            .observe(ctx.reader.$translationLanguage)
            .react(s => {
              s.text = 'de'
              s.isSelected = ctx.reader.$translationLanguage.value === 'de'
              s.textColor = theme().text50
              s.fontSize = 'inherit'
            })
            .whenHovered(s => {
              s.textColor = theme().text
            })
            .whenSelected(s => {
              s.textColor = theme().em
            })
            .onClick(() => ctx.reader.$translationLanguage.value = 'de')

          spacer().react(s => {
            s.width = '1px'
            s.height = '10px'
            s.bgColor = theme().text50
          })

          btn()
            .observe(ctx.reader.$translationLanguage)
            .react(s => {
              s.text = 'en'
              s.isSelected = ctx.reader.$translationLanguage.value === 'en'
              s.textColor = theme().text50
              s.fontSize = 'inherit'
            })
            .whenHovered(s => {
              s.textColor = theme().text
            })
            .whenSelected(s => {
              s.textColor = theme().em
            })
            .onClick(() => ctx.reader.$translationLanguage.value = 'en')
        })

      QuickSearchInput()

      IconBtn()
        .observe(ctx.reader.$translationSearchResult)
        .react(s => {
          const audioUrl = ctx.reader.$translationSearchResult.value?.audio_url ?? ''
          s.mouseEnabled = audioUrl !== ''
          s.marginTop = '5px'
          s.text = 'Audio'
          s.icon = MaterialIcon.volume_up
          s.opacity = audioUrl !== '' ? '1' : '0'
          s.fontSize = theme().fontSizeXS
          s.iconSize = theme().fontSizeS
          s.textColor = theme().text50
        })
        .whenHovered(s => s.textColor = theme().text)
        .onClick(() => ctx.reader.playTranslation())

      Markdown()
        .observe(ctx.reader.$translationSearchInputBuffer)
        .observe(ctx.reader.$translationSearchResult)
        .react(s => {
          s.visible = ctx.reader.$translationSearchInputBuffer.value.length > 0
          s.className = theme().searchTranslationTheme.id
          s.lineHeight = '1.4'
          s.fontFamily = FontFamily.ARTICLE
          s.fontSize = '0.8rem'
          s.textColor = theme().searchTranslationTheme.text
          s.width = '100%'
          s.text = ctx.reader.$translationSearchResult.value?.text ?? ''
          s.absolutePathPrefix = globalContext.derTutorServer.baseUrl
        })
    })
}

const QuickSearchInput = () => {
  const ctx = IndexContext.self
  return hstack()
    .observe(ctx.reader.$translationSearchInputFocused)
    .react(s => {
      s.fontFamily = FontFamily.APP
      s.valign = 'center'
      s.halign = 'stretch'
      s.width = '100%'
      s.gap = '5px'
      s.maxWidth = '300px'
      s.height = '35px'
      s.border = '1px solid ' + (ctx.reader.$translationSearchInputFocused.value ? theme().accent : theme().text50)
      s.cornerRadius = '4px'
      s.paddingHorizontal = '5px'
    })
    .children(() => {

      Icon()
        .react(s => {
          s.value = MaterialIcon.search
          s.width = '30px'
          s.maxWidth = '30px'
          s.textAlign = 'center'
          s.textColor = theme().text50
        })

      input()
        .bind(ctx.reader.$translationSearchInputBuffer)
        .observe(ctx.reader.$translationSearchInputFocused)
        .react(s => {
          s.type = 'text'
          s.fontFamily = FontFamily.APP
          s.width = '100%'
          //s.maxWidth = '300px'
          s.autoFocus = ctx.reader.$translationSearchInputFocused.value
          s.fontSize = theme().fontSizeXS
          s.placeholder = 'Enter a word to search'
          s.border = 'unset'
          s.textColor = theme().text
          s.caretColor = theme().accent
        })
        .whenPlaceholderShown(s => {
          s.textColor = theme().text50
        })
        .whenFocused(s => {
          s.textColor = theme().accent
        })
        .onBlur(() => { ctx.reader.$translationSearchInputFocused.value = false })
        .onFocus(() => {
          ctx.reader.$translationSearchInputFocused.value = true
          document.activeElement instanceof HTMLInputElement && document.activeElement.select()
        })
        .onKeyDown(e => {
          if (e.key === 'Enter') {
            e.stopImmediatePropagation()
            ctx.reader.searchTranslation(ctx.reader.$translationSearchInputBuffer.value)
            document.activeElement instanceof HTMLInputElement && document.activeElement.blur()
          }
          else if (e.key === 'Escape') {
            document.activeElement instanceof HTMLInputElement && document.activeElement.blur()
            ctx.reader.clearTranslationSearchResults()
          }
        })

      IconBtn()
        .observe(ctx.reader.$translationSearchInputBuffer.pipe().map(v => v.length > 0).removeDuplicates().fork())
        .react(s => {
          s.visible = ctx.reader.$translationSearchInputBuffer.value.length > 0
          s.icon = MaterialIcon.close
          s.iconSize = '0.75rem'
          s.textColor = theme().appBg
          s.bgColor = theme().text + 'cc'
          s.width = '15px'
          s.height = '15px'
          s.cornerRadius = '15px'
        })
        .whenHovered(s => s.bgColor = theme().text)
        .onClick(() => {
          ctx.reader.clearTranslationSearchResults()
        })
    })
}
