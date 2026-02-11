import { RXObservableValue } from 'flinker'
import { buildRule, FontWeight, UIComponentProps } from 'flinker-dom'

type THEME_ID = 'night' | 'night-st' | 'dark' | 'dark-st'

export interface GlobalTheme {
  id: THEME_ID
  isLight: boolean
  fontSizeXL: string
  fontSizeL: string
  fontSizeM: string
  fontSize: string
  defFontSize: string
  fontSizeS: string
  fontSizeXS: string
  defFontWeight: FontWeight
  appBg: string
  white: string
  black: string
  text: string
  text50: string
  editorText: string
  orange: string
  red: string
  gray: string
  green: string
  code: string
  codeBg: string
  em: string
  accent: string
  link: string
  blue: string
  pink: string
  purple: string
  violet: string
  warn: string
  info: string
  mark: string
  statusFg: string
  statusBg: string
  actionsBg: string
  comment: string
  quote: string
  transparent: string
  header: string
  menuDir: string
  menuFile: string
  menuPath: string
  menuPage: string
  searchTranslationTheme: GlobalTheme
}

export class ThemeManager {
  private readonly _darkTheme: GlobalTheme
  private readonly _nightTheme: GlobalTheme

  readonly $theme: RXObservableValue<GlobalTheme>

  setDarkTheme() {
    this.$theme.value = this._darkTheme
    const html = document.querySelector('html')
    if (html) {
      html.style.colorScheme = 'dark'
      html.style.backgroundColor = this.$theme.value.appBg
    }
    window.localStorage.setItem('theme', 'light')
  }

  setNightTheme() {
    this.$theme.value = this._nightTheme
    const html = document.querySelector('html')
    if (html) {
      html.style.colorScheme = 'dark'
      html.style.backgroundColor = this.$theme.value.appBg
    }
    window.localStorage.setItem('theme', 'night')
  }

  switchTheme() {
    if (this.$theme.value.id === 'dark')
      this.setNightTheme()
    else if (this.$theme.value.id === 'night')
      this.setDarkTheme()
  }

  constructor() {
    this._darkTheme = this.createDarkTheme()
    this._nightTheme = this.createNightTheme(this._darkTheme)
    this.$theme = new RXObservableValue(this._darkTheme)

    this.buildThemeSelectors(this._darkTheme)
    this.buildThemeSelectors(this._darkTheme.searchTranslationTheme)
    this.buildThemeSelectors(this._nightTheme)
    this.buildThemeSelectors(this._nightTheme.searchTranslationTheme)

    const theme = window.localStorage.getItem('theme') ?? 'light'
    if (theme === 'light') {
      this.setDarkTheme()
    } else {
      this.setNightTheme()
    }
  }

  /*
  *
  * Dark THEME
  *
  * */

  createDarkTheme(): GlobalTheme {
    const text = '#888d98' //aab6c2
    const white = '#ced6dc'
    const red = '#df5f83'
    const blue = '#4984c8'
    const header = '#b1b8c6'
    const black = '#1f2226'
    const accent = '#b0c8b3'
    const res = {
      id: 'dark',
      isLight: false,

      fontSizeXL: '2.0rem',
      fontSizeL: '1.2rem',
      fontSizeM: '1.1rem',
      fontSize: '1rem',
      defFontSize: 'inherit',
      fontSizeS: '0.85rem',
      fontSizeXS: '0.65rem',

      defFontWeight: 'normal',

      appBg: black,
      black,
      white,
      text,
      text50: text + 'bb',
      editorText: text,
      red,
      gray: '#79848d',
      green: '#546f7cff',
      header,
      em: '#7c8393',
      accent: '#b0c8b3',
      code: '#adb4c1',
      transparent: '#00000000',
      codeBg: '#00000000',
      blue,
      violet: '#aeadde',
      warn: accent,
      mark: '#cb6582',
      info: blue,
      purple: '#b2aee5',
      comment: '#74a7aa',
      quote: '#adadad',
      link: '#aa8657',
      pink: '#c293cc',
      orange: '#463d16',
      statusFg: accent,
      statusBg: '#181f23',
      actionsBg: '#212125',
      menuDir: '#8d74a6',
      menuFile: '#5ea570',
      menuPath: '#4e6c70',
      menuPage: '#6bb0ff',

    } as GlobalTheme

    res.searchTranslationTheme = this.createSearchTranslationTheme(res)

    return res
  }

/*
*
* NIGHT THEME
*
* */

  createNightTheme(t: GlobalTheme): GlobalTheme {
    const text = '#69707e' //aab6c2
    const white = '#969dad'
    const red = '#df5f83'
    const blue = '#4984c8'
    const header = white
    const black = '#111111'
    const accent = '#b0c8b3'
    const res = Object.assign({}, t, {
      id: 'night',
      isLight: false,
      appBg: black,
      black,
      white,
      text,
      text50: text + 'bb',
      editorText: text,
      red,
      gray: '#79848d',
      green: '#546f7cff',
      header,
      em: '#7c8393',
      accent: '#b0c8b3',
      code: '#adb4c1',
      codeBg: t.transparent,
      blue,
      violet: '#aeadde',
      warn: accent,
      mark: '#cb6582',
      info: blue,
      purple: '#b2aee5',
      comment: '#649193',
      quote: '#959595',
      link: '#aa8657',
      pink: '#c293cc',
      orange: '#463d16',
      statusFg: accent,
      statusBg: '#181f23',
      actionsBg: '#212125',
      menuDir: '#8d74a6',
      menuFile: '#74a7aa',
      menuPath: '#4e6c70',
      menuPage: '#55a4ff',
    }) as GlobalTheme

    res.searchTranslationTheme = this.createSearchTranslationTheme(res)

    return res
  }

  /*
  *
  * SEARCH_TRANSLATION_THEME
  *
  * */

  createSearchTranslationTheme(t: GlobalTheme): GlobalTheme {
    const text = '#888888' //707f8b 
    const accent = '#a5a5a5'  //9fa786
    return Object.assign({}, t, {
      id: t.id + '-st',
      text: text,
      defTextColor: text,
      text50: text + 'aa',
      strong: accent,
      header: accent,
      fontSizeXL: t.fontSize,
      fontSizeL: t.fontSizeS,
      fontSizeM: t.fontSizeS,
      defFontSize: t.fontSizeS,
      fontSizeS: t.fontSizeXS,
      fontSizeXS: t.fontSizeXS,
      note: '#779685',
    })
  }

  buildThemeSelectors(t: GlobalTheme) {
    const parentSelector = t.id
    const monoFont = 'var(--font-family-mono)'
    const articleFont = 'var(--font-family-article)'
    const textColor = t.text
    const headerPadingTop = '0px'
    // const textProps: StylableComponentProps = { textColor: '#86b3c7' }
    // buildRule(textProps, theme.id, '*')

    /******************************/
    // header
    /******************************/

    const h1Props: UIComponentProps = {
      //textTransform: 'uppercase',
      fontSize: t.fontSizeXL,
      fontWeight: 'normal',
      textColor: t.header,
      paddingTop: headerPadingTop
    }
    buildRule(h1Props, parentSelector, 'h1')

    const h2Props: UIComponentProps = {
      fontSize: t.fontSizeL,
      fontWeight: 'bold',
      textColor: t.header,
      paddingTop: headerPadingTop
    }
    buildRule(h2Props, parentSelector, 'h2')

    const h3Props: UIComponentProps = {
      fontSize: t.fontSizeM,
      fontWeight: 'bold',
      textAlign: 'left',
      textColor: t.header,
      paddingTop: headerPadingTop
    }
    buildRule(h3Props, parentSelector, 'h3')

    const h4Props: UIComponentProps = {
      fontSize: t.fontSizeM,
      fontWeight: 'bold',
      textAlign: 'left',
      textColor: t.header,
    }
    buildRule(h4Props, parentSelector, 'h4')

    const h5Props: UIComponentProps = {
      fontSize: t.defFontSize,
      fontWeight: 'bold',
      textColor: t.header
    }
    buildRule(h5Props, parentSelector, 'h5')

    const h6Props: UIComponentProps = {
      fontSize: t.defFontSize,
      fontWeight: t.defFontWeight,
      textColor: t.header
    }
    buildRule(h6Props, parentSelector, 'h6')

    /******************************/
    // div, p, span
    /******************************/

    const globalProps: UIComponentProps = {
      fontFamily: articleFont,
      fontSize: 'inherit',
      fontWeight: t.defFontWeight,
      textColor: 'inherit'
    }
    buildRule(globalProps, parentSelector, 'div')
    buildRule(globalProps, parentSelector, 'p')
    buildRule(globalProps, parentSelector, 'span')

    /******************************/
    // strong, b, i
    /******************************/

    const strongProps: UIComponentProps = {
      //fontFamily: '--font-family-article-bi',
      fontSize: 'inherit',
      textColor: t.header,
      fontWeight: 'inherit',
      fontStyle: 'italic'
    }
    buildRule(strongProps, parentSelector, 'strong')

    const boldProps: UIComponentProps = {
      fontSize: 'inherit',
      textColor: 'inherit',
      fontWeight: 'bold'
    }
    buildRule(boldProps, parentSelector, 'b')

    const italicProps: UIComponentProps = {
      fontSize: 'inherit',
      textColor: 'inherit',
      fontWeight: 'inherit',
      fontStyle: 'italic'
    }
    buildRule(italicProps, parentSelector, 'i')

    /******************************/
    // list
    /******************************/

    const listItemProps: UIComponentProps = {
      fontSize: t.defFontSize,
      fontWeight: t.defFontWeight,
      textColor: 'inherit',
      margin: '0px',
      padding: '0px'
    }
    buildRule(listItemProps, parentSelector, 'li')
    buildRule(listItemProps, parentSelector, 'ol')

    const listProps: UIComponentProps = {
      fontSize: 'inherit',
      fontWeight: t.defFontWeight,
      textColor: 'inherit',
      margin: '0px',
      marginLeft: '20px',
      padding: '0px',
    }
    buildRule(listProps, parentSelector, 'ul')

    /******************************/
    // table
    /******************************/

    const tableProps: UIComponentProps = {
      width: '100%',
      fontSize: t.fontSizeS,
      textColor: 'inherit',
      fontWeight: t.defFontWeight,
      border: '1px solid ' + t.text50,
    }
    buildRule(tableProps, parentSelector, 'table')

    // const trProps: UIComponentProps = {
    //   fontSize: 'inherit',
    //   textColor: 'inherit',
    //   fontWeight: 'inherit',
    //   bgColor: t.green + '10'
    // }
    // buildRule(trProps, parentSelector, 'tr:nth-child(even)')

    const tdProps: UIComponentProps = {
      fontSize: 'inherit',
      textColor: 'inherit',
      fontWeight: 'inherit',
      border: '1px solid ' + t.text + 40,
      padding: '10px'
    }

    buildRule(tdProps, parentSelector, 'th')
    buildRule(tdProps, parentSelector, 'td')

    /******************************/
    // em `
    /******************************/

    const emphasizeProps: UIComponentProps = {
      fontFamily: articleFont,
      bgColor: t.isLight ? '#edf4ee' : 'undefined',
      textColor: t.em,
      fontStyle: 'normal',
      paddingVertical: '5px'
    }
    buildRule(emphasizeProps, parentSelector, 'em')

    /******************************/
    // code
    /******************************/

    //one line code: ```
    const monoFontProps: UIComponentProps = {
      fontSize: t.fontSizeS,
      fontFamily: monoFont,
      display: 'inline',
      bgColor: t.codeBg,
      textColor: t.code,
      padding: '2px',
      whiteSpace: 'nowrap'
      //padding: '5px'
    }
    buildRule(monoFontProps, parentSelector, 'code')

    /******************************/
    // mark
    /******************************/

    const markProps: UIComponentProps = {
      fontSize: 'inherit',
      fontWeight: 'inherit',
      textColor: t.mark,
      bgColor: t.transparent
    }

    buildRule(markProps, parentSelector, 'mark')

    /******************************/
    // link
    /******************************/

    const linkProps: UIComponentProps = {
      fontSize: 'inherit',
      fontWeight: t.defFontWeight,
      textColor: t.link
    }

    buildRule(linkProps, parentSelector, 'a')
    buildRule(linkProps, parentSelector, 'a:link')
    buildRule(linkProps, parentSelector, 'a:visited')
    buildRule(linkProps, parentSelector, 'a:active')
    linkProps.textDecoration = 'underline'
    buildRule(linkProps, parentSelector, 'a', ':hover')

    /******************************/
    // quote
    /******************************/

    const blockquoteContentProps: UIComponentProps = {
      //marginVertical: '20px',
      //paddingVertical: '10px',
      paddingHorizontal: '20px',
      //bgColor: '#e5f0df',
      margin: '0px',
      fontSize: 'inherit',
      textColor: t.quote,
      borderLeft: '1px solid ' + t.quote + '88'
    }
    buildRule(blockquoteContentProps, parentSelector, 'blockquote')
    blockquoteContentProps.fontStyle = 'italic'
    blockquoteContentProps.textAlign = 'right'
    blockquoteContentProps.paddingVertical = '10px'
    blockquoteContentProps.borderLeft = undefined
    buildRule(blockquoteContentProps, parentSelector, 'blockquote footer')

    /******************************/
    // image
    /******************************/

    const imgProps: UIComponentProps = {
      maxWidth: Math.min(1000, window.innerWidth - 40) + 'px',
      //paddingTop: '50px'
    }
    buildRule(imgProps, parentSelector, 'img')
    buildRule(imgProps, parentSelector, 'figure')

    const imgCaptionProps: UIComponentProps = {
      fontWeight: 'inherit',
      fontSize: t.fontSizeXS,
      textColor: t.text50,
    }
    buildRule(imgCaptionProps, parentSelector, 'figcaption')

    /******************************/
    // hr
    /******************************/

    const hrProps: UIComponentProps = {
      width: '100%',
      height: '1px',
      border: '1px solid ' + t.text + '40',
      //marginBottom: '20px',
    }
    buildRule(hrProps, parentSelector, 'hr')

    /******************************/
    // stars delim
    /******************************/

    const delimProps: UIComponentProps = {
      width: '100%',
      fontWeight: 'bold',
      paddingVertical: '0px',
      textAlign: 'center'
    }
    buildRule(delimProps, parentSelector, '.md-delim')

    /******************************/
    // align
    /******************************/

    const centerAlignmentProps: UIComponentProps = {
      width: '100%',
      textAlign: 'center',
      fontWeight: 'inherit',
      fontSize: 'inherit',
      textColor: 'inherit'
    }
    buildRule(centerAlignmentProps, parentSelector, '.md-center')

    const rightAlginmentProps: UIComponentProps = {
      width: '100%',
      textAlign: 'right',
      fontWeight: 'inherit',
      fontSize: 'inherit',
      textColor: 'inherit'
    }
    buildRule(rightAlginmentProps, parentSelector, '.md-right')

    /******************************/
    // ru translation
    /******************************/

    const ruParagraphProps: UIComponentProps = {
      fontWeight: 'inherit',
      fontSize: t.defFontSize,
      textColor: t.isLight ? 'inherit' : t.text50,
      fontStyle: t.isLight ? 'italic' : 'inherit'
    }
    buildRule(ruParagraphProps, parentSelector, '.md-ru')

    // custom rule
    const centerAllProps: any = {
      width: '100%',
      fontSize: 'inherit',
      flexDirection: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      fontWeight: 'inherit',
      textColor: 'inherit'
    }
    buildRule(centerAllProps, parentSelector, 'div.center')

    /******************************/
    // bash
    /******************************/

    const bashCodeProps: UIComponentProps = {
      width: '100%',
      fontFamily: monoFont,
      display: 'block',
      textColor: t.code,
      bgColor: t.codeBg,
      padding: '20px',
      cornerRadius: '10px',
      fontWeight: 'inherit',
      fontSize: 'inherit',
    }
    buildRule(bashCodeProps, parentSelector, '.md-bash-code')

    /******************************/
    // poem
    /******************************/

    const poemProps: any = {
      textColor: 'inherit',
      width: '100%',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      paddingHorizontal: '50px',
      fontSize: t.fontSizeS
    }
    buildRule(poemProps, parentSelector, 'div.poem')
    buildRule({ fontSize: 'inherit', textColor: 'inherit' }, parentSelector, 'div.poem div')

    /******************************/
    // note
    /******************************/

    const noteProps: UIComponentProps = {
      width: '100%',
      fontSize: t.fontSizeS,
      fontWeight: t.defFontWeight,
      textColor: t.comment,
      paddingTop: '5px',
      paddingHorizontal: '20px',
      //bgColor: '#e5f0df',
      borderLeft: '1px solid ' + t.comment
    }
    buildRule(noteProps, parentSelector, '.md-note')

    /******************************/
    // epigraph
    /******************************/

    const epigraphProps: UIComponentProps = {
      width: '100%',
      fontSize: t.fontSizeS,
      paddingLeft: '50%',
      flexDirection: 'row',
      justifyContent: 'right',
      textAlign: 'left',
      fontWeight: 'inherit',
      textColor: t.header
    }
    buildRule(epigraphProps, parentSelector, 'div.epi')
    buildRule({ fontSize: 'inherit', textColor: 'inherit' }, parentSelector, 'div.epi div')

    /******************************/
    // warning
    /******************************/

    const warnProps: UIComponentProps = {
      width: '100%',
      fontSize: t.fontSizeS,
      textColor: t.warn,
      bgColor: t.warn + '10',
      padding: '16px',
      border: '1px solid ' + t.warn,
      borderLeft: '5px solid ' + t.warn,
      fontWeight: 'inherit'
    }
    buildRule(warnProps, parentSelector, 'div.warn')
    buildRule({ fontSize: 'inherit', textColor: 'inherit' }, parentSelector, 'div.warn div')

    /******************************/
    // info
    /******************************/

    const infoProps: UIComponentProps = {
      width: '100%',
      fontSize: t.fontSizeS,
      textColor: t.info,
      bgColor: t.info + '10',
      padding: '16px',
      border: '1px solid ' + t.info,
      borderLeft: '5px solid ' + t.info,
      fontWeight: 'inherit'
    }
    buildRule(infoProps, parentSelector, 'div.info')
    buildRule({ fontSize: 'inherit', textColor: 'inherit' }, parentSelector, 'div.info div')

    /******************************/
    // note
    /******************************/

    const notePropsErr: UIComponentProps = {
      width: '100%',
      fontSize: t.fontSizeS,
      flexDirection: 'row',
      textAlign: 'left',
      fontWeight: 'inherit',
      textColor: t.red
    }
    buildRule(notePropsErr, parentSelector, 'div.note')
    buildRule({ fontSize: 'inherit', textColor: 'inherit' }, parentSelector, 'div.note div')
  }
}

export const themeManager = new ThemeManager()
export const theme = () => themeManager.$theme.value