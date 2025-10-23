import { RXObservableValue } from 'flinker'
import { buildRule, FontWeight, UIComponentProps } from 'flinker-dom'

export interface GlobalTheme {
  id: string
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
  yellow: string
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
  statusFg: string
  statusBg: string
  comment: string
  selectedBlockBg: string
  hoveredBlockBg: string
  modalViewBg: string
  transparent: string
  menuItem: string
  header: string
  menuHoveredItem: string
  menuSelectedItem: string
  menuHeader: string
  menuHoveredHeader: string
  maxBlogTextWidth: string
  maxBlogTextWidthPx: number
  menuWidthPx: number
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
    const red = '#93324f'
    const header = '#755b54'
    return {
      id: 'light',
      isLight: true,
      defMenuFontSize: '0.85rem',
      defFontSize: '1rem',
      defFontWeight: '400',
      appBg: white,
      white,
      orange: '#a56a26',
      yellow: '#a56a26',
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
      statusFg: '#376a83',
      statusBg: '#152832',
      comment: '#0b6039',
      selectedBlockBg: red + '15',
      hoveredBlockBg: black + '15',
      modalViewBg: '#e5d8f1',
      transparent: '#00000000',
      menuItem: black + 'cc',
      menuHoveredItem: red,
      menuSelectedItem: black,
      menuHeader: '#0a4277',
      menuHoveredHeader: red,
      maxBlogTextWidth: '950px',
      maxBlogTextWidthPx: 950,
      menuWidthPx: 550
    }
  }

  /*
  *
  * DARK THEME
  *
  * */

  createDarkTheme(t: GlobalTheme): GlobalTheme {
    const text = '#7d828e' //aab6c2
    const white = '#ced6dc'
    const red = '#df5f83'
    const blue = '#75bbe7'
    const header = '#bcc3c9'//aaaaaa
    return Object.assign({}, t, {
      id: 'dark',
      isLight: false,
      appBg: '#212224', //26272c 
      white,
      text,
      text50: text + 'aa',
      editorText: text,
      red,
      gray: '#79848d',
      green: '#6c8f9f',
      h2: header,
      em: '#989ba2ff',
      code: header,
      codeBg: header + '08',
      border: '#ffFFff10',
      blue,
      link: '#bd9054',
      violet: '#aeadde',
      warn: '#ba4f37',
      info: blue,
      statusFg: '#376a83',
      statusBg: '#152832',
      purple: '#b2aee5',
      comment: '#7ea3a5',
      pink: '#c293cc',
      orange: '#463d16',
      selectedBlockBg: text + '07',
      hoveredBlockBg: text + '10',
      modalViewBg: '#43354b',
      menuItem: text,
      menuHoveredItem: white,
      menuSelectedItem: white,
      menuHeader: blue,
      menuHoveredHeader: white,
    })
  }

  /*
*
* NIGHT THEME
*
* */

  createNightTheme(t: GlobalTheme): GlobalTheme {
    const text = '#707682' //aab6c2
    const white = '#c6d4e3'
    const red = '#df5f83'
    const blue = '#6194c1'
    const header = '#9ca0ae'
    return Object.assign({}, t, {
      id: 'night',
      isLight: false,
      appBg: '#111111', //131417 262730
      white,
      text,
      text50: text + 'aa',
      editorText: text,
      red,
      gray: '#79848d',
      green: '#546f7cff',
      header,
      em: '#8b8e97',
      code: '#adb4c1',
      codeBg:  t.transparent,
      border: '#ffFFff10',
      blue,
      violet: '#aeadde',
      warn: '#9fa786',
      yellow: '#9fa786',
      info: blue,
      statusFg: '#376a83',
      statusBg: '#181f23',
      purple: '#b2aee5',
      comment: '#7ea3a5',
      link: '#aa8657',
      pink: '#c293cc',
      orange: '#463d16',
      selectedBlockBg: text + '07',
      hoveredBlockBg: text + '10',
      modalViewBg: '#43354b',
      menuItem: text,
      menuHoveredItem: header,
      menuSelectedItem: header,
      menuHeader: blue,
      menuHoveredHeader: '#7cbcf4',
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
      fontSize: '1rem',
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
      textColor: 'inherit',
      fontWeight: 'bold',
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
      fontWeight: t.defFontWeight,
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
      border: '1px solid ' + t.text50,
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
      textColor: t.yellow,
      bgColor: t.appBg
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
      maxWidth: (t.maxBlogTextWidthPx + 200) + 'px',
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