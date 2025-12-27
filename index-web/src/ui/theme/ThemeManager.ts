import { RXObservableValue } from 'flinker'
import { buildRule, FontWeight, UIComponentProps } from 'flinker-dom'

export interface GlobalTheme {
  id: 'dark' | 'light' | 'night'
  isLight: boolean
  defMenuFontSize: string
  defFontSize: string
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
  comment: string
  transparent: string
  header: string
  menuDir: string
  menuFile: string
  menuPath: string
  menuPage: string
  maxBlogTextWidth: number
  menuWidth: number
  statusBarHeight: number
}

export class ThemeManager {
  private readonly _lightTheme: GlobalTheme
  private readonly _darkTheme: GlobalTheme
  private readonly _nightTheme: GlobalTheme

  readonly $theme: RXObservableValue<GlobalTheme>

  setLightTheme() {
    this.$theme.value = this._lightTheme
    const html = document.querySelector('html')
    if (html) {
      html.style.colorScheme = 'dark'
      html.style.backgroundColor = this.$theme.value.appBg
    }
    window.localStorage.setItem('theme', 'light')
  }

  setDarkTheme() {
    this.$theme.value = this._darkTheme
    const html = document.querySelector('html')
    if (html) {
      html.style.colorScheme = 'dark'
      html.style.backgroundColor = this.$theme.value.appBg
    }
    window.localStorage.setItem('theme', 'dark')
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
    if (this.$theme.value.id === 'light')
      this.setDarkTheme()
    else if (this.$theme.value.id === 'dark')
      this.setNightTheme()
    else if (this.$theme.value.id === 'night')
      this.setLightTheme()
  }

  constructor() {
    this._lightTheme = this.createLightTheme()
    this._darkTheme = this.createDarkTheme(this._lightTheme)
    this._nightTheme = this.createNightTheme(this._darkTheme)
    this.$theme = new RXObservableValue(this._lightTheme)

    this.buildThemeSelectors(this._lightTheme)
    this.buildThemeSelectors(this._darkTheme)
    this.buildThemeSelectors(this._nightTheme)

    const theme = window.localStorage.getItem('theme') ?? 'light'
    if (theme === 'light') {
      this.setLightTheme()
    } else if (theme === 'night') {
      this.setNightTheme()
    } else {
      this.setDarkTheme()
    }
  }

  /*
  *
  * LIGHT THEME
  *
  * */

  createLightTheme(): GlobalTheme {
    const black = '#222222'
    const white = '#ffFFff'//efeee8
    const red = '#ac2f2f'
    const header = '#755b54'
    return {
      id: 'light',
      isLight: true,
      defMenuFontSize: '0.7rem',
      defFontSize: '1rem',
      defFontWeight: '400',
      appBg: white,
      white,
      orange: '#a56a26',
      mark: '#ac2f2f',
      black,
      text: black,
      text50: black + '88',
      editorText: black,
      red,
      gray: '#8a9fb6',
      green: '#7198a9',
      header,
      code: red,
      codeBg: red + 10,
      em: black,
      blue: '#0a4277',
      link: '#b16441',
      pink: '#c7accc',
      purple: '#d5caf2',
      violet: '#43257c',
      warn: '#9a3f2b',
      info: '#3a84b8',
      comment: '#0b6039',
      transparent: '#00000000',
      statusFg: black,
      statusBg: white,
      menuDir: '#462962',
      menuFile: '#0f5848',
      menuPath: '#5c6c72',
      menuPage: '#ac2f2f',
      maxBlogTextWidth: 950,
      menuWidth: 450,
      statusBarHeight: 30,
    }
  }

  /*
  *
  * DARK THEME
  *
  * */

  createDarkTheme(t: GlobalTheme): GlobalTheme {
    const text = '#7d828e' //aab6c2
    const white = '#b5bac8'
    const red = '#cb6582'
    const blue = '#75bbe7'
    const black = '#212227' //212227
    const header = white//aaaaaa
    return Object.assign({}, t, {
      id: 'dark',
      isLight: false,
      appBg: black, //26272c 
      black,
      header,
      white,
      text,
      text50: text + 'aa',
      editorText: text,
      red,
      gray: '#79848d',
      green: '#6c8f9f',
      h2: header,
      em: '#999eac',
      code: header,
      codeBg: header + '08',
      blue,
      link: '#bd9054',
      violet: '#aeadde',
      warn: '#cb6582',
      mark: '#cb6582',
      info: blue,
      statusFg: '#b0c8b3',
      statusBg: black,
      purple: '#b2aee5',
      comment: '#7ea3a5',
      pink: '#c293cc',
      orange: '#463d16',
      menuDir: '#9b88ae',
      menuFile: '#5bafbc',
      menuPath: '#516e73',
      menuPage: '#77a2ae',
    })
  }

  /*
*
* NIGHT THEME
*
* */

  createNightTheme(t: GlobalTheme): GlobalTheme {
    const text = '#707786' //aab6c2
    const white = '#969dad'
    const red = '#df5f83'
    const blue = '#6194c1'
    const header = white
    const black = '#111111'
    return Object.assign({}, t, {
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
      em: '#8e94a5',
      code: '#adb4c1',
      codeBg: t.transparent,
      blue,
      violet: '#aeadde',
      warn: '#b0c8b3',
      mark: '#cb6582',
      info: blue,
      purple: '#b2aee5',
      comment: '#74a7aa',
      link: '#aa8657',
      pink: '#c293cc',
      orange: '#463d16',
      statusFg: '#b0c8b3',
      statusBg: '#181f23',
      menuDir: '#8d74a6',
      menuFile: '#5ea0a5',
      menuPath: '#4e6c70',
      menuPage: '#5ea0a5',
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
      textTransform: 'uppercase',
      fontSize: '2.0rem',
      fontWeight: 'bold',
      textColor: t.header,
      paddingTop: headerPadingTop
    }
    buildRule(h1Props, parentSelector, 'h1')

    const h2Props: UIComponentProps = {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      textColor: t.header,
      paddingTop: headerPadingTop
    }
    buildRule(h2Props, parentSelector, 'h2')

    const h3Props: UIComponentProps = {
      fontSize: '1.2rem',
      fontWeight: 'bold',
      textAlign: 'left',
      textColor: t.header,
      paddingTop: headerPadingTop
    }
    buildRule(h3Props, parentSelector, 'h3')

    const h4Props: UIComponentProps = {
      fontSize: '1.2rem',
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
      fontSize: 'inherit',
      fontWeight: t.defFontWeight,
      margin: '0px'
    }
    buildRule(listItemProps, parentSelector, 'li')

    const listProps: UIComponentProps = {
      fontSize: 'inherit',
      fontWeight: t.defFontWeight,
      margin: '0px'
    }
    buildRule(listProps, parentSelector, 'ul')
    buildRule(listProps, parentSelector, 'ol')

    /******************************/
    // table
    /******************************/

    const tableProps: UIComponentProps = {
      width: '100%',
      fontSize: '0.9rem',
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
      fontSize: '0.9rem',
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
    buildRule(linkProps, parentSelector, 'a', 'hover')

    /******************************/
    // quote
    /******************************/

    const blockquoteContentProps: UIComponentProps = {
      //marginVertical: '20px',
      //paddingVertical: '10px',
      paddingHorizontal: '20px',
      //bgColor: '#e5f0df',
      margin: '0px',
      fontSize: '0.9rem',
      textColor: t.comment,
      borderLeft: '1px solid ' + t.comment + '88'
    }
    buildRule(blockquoteContentProps, parentSelector, 'blockquote')

    /******************************/
    // image
    /******************************/

    const imgProps: UIComponentProps = {
      maxWidth: window.innerWidth - 40 + 'px',
      //paddingTop: '50px'
    }
    buildRule(imgProps, parentSelector, 'img')
    buildRule(imgProps, parentSelector, 'figure')

    const imgCaptionProps: UIComponentProps = {
      fontWeight: 'inherit',
      fontSize: '0.9rem',
      textColor: t.text50,
    }
    buildRule(imgCaptionProps, parentSelector, 'figcaption')

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
      fontSize: '0.9rem'
    }
    buildRule(poemProps, parentSelector, 'div.poem')
    buildRule({ fontSize: 'inherit', textColor: 'inherit' }, parentSelector, 'div.poem div')

    /******************************/
    // note
    /******************************/

    const noteProps: UIComponentProps = {
      width: '100%',
      fontSize: '0.9rem',
      fontWeight: t.defFontWeight,
      textColor: t.text,
      paddingHorizontal: '20px',
      //bgColor: '#e5f0df',
      borderLeft: '1px solid ' + t.text50
    }
    buildRule(noteProps, parentSelector, 'div.note')
    buildRule({ fontSize: 'inherit', textColor: 'inherit' }, parentSelector, 'div.note div')

    /******************************/
    // epigraph
    /******************************/

    const epigraphProps: UIComponentProps = {
      width: '100%',
      fontSize: '0.9rem',
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
      fontSize: '0.9rem',
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
      fontSize: '0.9rem',
      textColor: t.info,
      bgColor: t.info + '10',
      padding: '16px',
      border: '1px solid ' + t.info,
      borderLeft: '5px solid ' + t.info,
      fontWeight: 'inherit'
    }
    buildRule(infoProps, parentSelector, 'div.info')
    buildRule({ fontSize: 'inherit', textColor: 'inherit' }, parentSelector, 'div.info div')
  }
}

export const themeManager = new ThemeManager()
export const theme = () => themeManager.$theme.value