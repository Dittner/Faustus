import { RXObservableValue } from 'flinker'
import { buildRule, FontWeight, UIComponentProps } from 'flinker-dom'

export interface GlobalTheme {
  id: 'dark' | 'light'
  isLight: boolean
  defMenuFontSize: string
  defFontSize: string
  defFontWeight: FontWeight
  appBg: string
  text: string
  text50: string
  yellow: string
  red: string
  green: string
  em: string
  accent: string
  strong: string
  link: string
  blue: string
  editor: string
  mark: string
  btn: string
  statusFg: string
  statusBg: string
  comment: string
  transparent: string
  h1: string
  header: string
  menu: string
  menuDe: string
  menuEn: string
  maxNoteViewWidth: number
  menuWidth: number
  statusBarHeight: number
}

export class ThemeManager {
  private readonly _lightTheme: GlobalTheme
  private readonly _darkTheme: GlobalTheme

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

  switchTheme() {
    if (this.$theme.value.id === 'light')
      this.setDarkTheme()
    else if (this.$theme.value.id === 'dark')
      this.setLightTheme()
  }

  constructor() {
    this._lightTheme = this.createLightTheme()
    this._darkTheme = this.createDarkTheme(this._lightTheme)
    this.$theme = new RXObservableValue(this._lightTheme)

    this.buildThemeSelectors(this._lightTheme)
    this.buildThemeSelectors(this._darkTheme)

    const theme = window.localStorage.getItem('theme') ?? 'light'
    if (theme === 'light') {
      this.setLightTheme()
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
      defMenuFontSize: '0.8rem',
      defFontSize: '1rem',
      defFontWeight: '400',
      appBg: white,
      yellow: '#a56a26',
      mark: '#ac2f2f',
      btn: '#d14141',
      text: black,
      text50: black + '88',
      red,
      green: '#7198a9',
      h1: header,
      header,
      em: black,
      accent: '#d14141',
      strong: black,
      blue: '#0a4277',
      link: '#b16441',
      editor: black,
      comment: '#0b6039',
      transparent: '#00000000',
      statusFg: black,
      statusBg: white,
      menu: '#462962',
      menuDe: '#b16441',
      menuEn: '#ac2f2f',
      maxNoteViewWidth: 850,
      menuWidth: 500,
      statusBarHeight: 30,
    }
  }

  /*
  *
  * DARK THEME
  *
  * */


  createDarkTheme(t: GlobalTheme): GlobalTheme {
    const text = '#608086' //707786 
    const accent = '#aaAAaa'
    const red = '#eb6c6c'
    const blue = '#6fafe7'
    const black = '#111111'
    return Object.assign({}, t, {
      id: 'dark',
      isLight: false,
      appBg: black,
      text,
      text50: text + 'bb',
      red,
      green: '#5ea0a5',
      h1: '#b0c2c1',
      header: '#2a7098',
      em: '#b0c8b3',
      accent,
      strong: '#89bac1',
      blue,
      mark: '#cb6565',
      comment: '#74a7aa',
      link: '#aa8657',
      yellow: '#b0c8b3',
      btn: '#ffd195',
      editor: text,
      statusFg: '#b0c8b3',
      statusBg: '#181f23',
      menu: '#489fbd',
      menuDe: '#aa8657',
      menuEn: '#cb6582',
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
      fontSize: '1.5rem',
      fontWeight: 'bold',
      textColor: t.h1,
      paddingTop: headerPadingTop
    }
    buildRule(h1Props, parentSelector, 'h1')

    const h2Props: UIComponentProps = {
      fontSize: '1.2rem',
      fontWeight: 'bold',
      textColor: t.header,
      paddingTop: headerPadingTop,
    }
    buildRule(h2Props, parentSelector, 'h2')

    const h3Props: UIComponentProps = {
      fontSize: '1.1rem',
      fontWeight: 'bold',
      textAlign: 'left',
      textColor: t.header,
      paddingTop: headerPadingTop
    }
    buildRule(h3Props, parentSelector, 'h3')

    const h4Props: UIComponentProps = {
      fontSize: '1.1rem',
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
      textColor: t.strong,
      fontWeight: 'inherit',
      fontStyle: 'inherit'
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
      textColor: 'inherit',
      margin: '0px',
      padding: '0px'
    }
    buildRule(listItemProps, parentSelector, 'li')

    const listProps: UIComponentProps = {
      fontSize: 'inherit',
      fontWeight: t.defFontWeight,
      textColor: 'inherit',
      margin: '0px',
      padding: '0px'
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
    // code ``
    /******************************/

    const monoFontProps: UIComponentProps = {
      fontSize: '0.9rem',
      fontFamily: monoFont,
      display: 'inline',
      textColor: 'inherit',
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
    // alignment
    /******************************/

    const centerAlignmentProps: UIComponentProps = {
      width: '100%',
      textAlign: 'center',
      fontWeight: 'inherit',
      fontSize: 'inherit',
      textColor: 'inherit'
    }
    buildRule(centerAlignmentProps, parentSelector, 'p.md-center')

    const rightAlginmentProps: UIComponentProps = {
      width: '100%',
      textAlign: 'right',
      fontWeight: 'inherit',
      fontSize: 'inherit',
      textColor: 'inherit'
    }
    buildRule(rightAlginmentProps, parentSelector, 'p.md-right')

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
  }
}

export const themeManager = new ThemeManager()
export const theme = () => themeManager.$theme.value