import { RXObservableValue } from 'flinker'
import { buildRule, FontWeight, UIComponentProps } from 'flinker-dom'

export interface GlobalTheme {
  id: string
  isLight: boolean
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
  comment: string
  selectedBlockBg: string
  hoveredBlockBg: string
  modalViewBg: string
  transparent: string
  menuItem: string
  h1: string
  h2: string
  h3: string
  h4: string
  h5: string
  h6: string
  menuHoveredItem: string
  menuSelectedItem: string
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
      defFontSize: '1.4rem',
      defFontWeight: '400',
      appBg: white,
      white,
      orange: '#a56a26',
      black,
      text: black,
      text50: black + '88',
      editorText: black,
      red,
      gray: '#8a9fb6',
      green: '#7198a9',
      h1: black,
      h2: header,
      h3: header,
      h4: header,
      h5: header,
      h6: black + '88',
      code: black,
      codeBg: '#f4f3f2',
      em: black,
      blue: '#0a4277',
      link: '#9d6f32',
      pink: '#c7accc',
      purple: '#d5caf2',
      violet: '#43257c',
      comment: '#0b6039',
      selectedBlockBg: red + '15',
      hoveredBlockBg: black + '15',
      modalViewBg: '#e5d8f1',
      transparent: '#00000000',
      menuItem: black + 'cc',
      menuHoveredItem: red,
      menuSelectedItem: black,
      maxBlogTextWidth: '950px',
      maxBlogTextWidthPx: 950,
      menuWidthPx: 500
    }
  }

  /*
  *
  * DARK THEME
  *
  * */

  createDarkTheme(t: GlobalTheme): GlobalTheme {
    const text = '#888a8f' //aab6c2
    const white = '#d0d8df'
    const red = '#df5f83'
    const header = '#bbbbbb'//aaaaaa
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
      h1: white,
      h2: header,
      h3: header,
      h4: header,
      h5: header,
      h6: text + '88',
      em: '#aaaaaa',
      code: '#c0c8cf',
      codeBg: header + '08',
      border: '#ffFFff10',
      blue: '#75bbe7',
      link: '#bd9054',
      violet: '#aeadde',
      purple: '#b2aee5',
      comment: '#7ea3a5',
      pink: '#c293cc',
      orange: '#463d16',
      selectedBlockBg: text + '07',
      hoveredBlockBg: text + '10',
      modalViewBg: '#43354b',
      menuItem: white + '88',
      menuHoveredItem: red,
      menuSelectedItem: white
    })
  }

  /*
*
* NIGHT THEME
*
* */

  createNightTheme(t: GlobalTheme): GlobalTheme {
    const text = '#767a82' //aab6c2
    const white = '#c6d4e3'
    const red = '#df5f83'
    const header = '#aaAAaa'
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
      green: '#6c8f9f',
      h1: white,
      h2: header,
      h3: header,
      h4: header,
      h5: header,
      h6: text + '88',
      em: '#96989f',
      code: '#b1b7c3',
      codeBg: '#18191c',
      border: '#ffFFff10',
      blue: '#5fa2cd',
      violet: '#aeadde',
      purple: '#b2aee5',
      comment: '#7ea3a5',
      link: '#bd9054',
      pink: '#c293cc',
      orange: '#463d16',
      selectedBlockBg: text + '07',
      hoveredBlockBg: text + '10',
      modalViewBg: '#43354b',
      menuItem: white + '88',
      menuHoveredItem: red,
      menuSelectedItem: white
    })
  }

  buildThemeSelectors(t: GlobalTheme) {
    const parentSelector = t.id
    const monoFont = 'var(--font-family-mono)'
    const articleFont = 'var(--font-family-article)'
    const textColor = t.text
    const headerPadingTop = '20px'
    // const textProps: StylableComponentProps = { textColor: '#86b3c7' }
    // buildRule(textProps, theme.id, '*')

    const h1Props: UIComponentProps = {
      textTransform: 'uppercase',
      fontSize: '2.5rem',
      fontWeight: 'bold',
      textColor: t.h1,
      paddingTop: headerPadingTop
    }
    buildRule(h1Props, parentSelector, 'h1')

    const h2Props: UIComponentProps = {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      textColor: t.h2,
      paddingTop: headerPadingTop
    }
    buildRule(h2Props, parentSelector, 'h2')

    const h3Props: UIComponentProps = {
      fontSize: '2.0rem',
      fontWeight: 'bold',
      textAlign: 'left',
      textColor: t.h3,
      paddingTop: headerPadingTop
    }
    buildRule(h3Props, parentSelector, 'h3')

    const h4Props: UIComponentProps = {
      fontSize: t.defFontSize,
      fontWeight: 'bold',
      textAlign: 'left',
      textColor: t.h4,
    }
    buildRule(h4Props, parentSelector, 'h4')

    const h5Props: UIComponentProps = {
      fontSize: t.defFontSize,
      fontStyle: 'italic',
      fontWeight: 'normal',
      textColor: t.h5
    }
    buildRule(h5Props, parentSelector, 'h5')

    const h6Props: UIComponentProps = {
      fontSize: '1.2rem',
      fontWeight: t.defFontWeight,
      textColor: t.h6
    }
    buildRule(h6Props, parentSelector, 'h6')

    const pProps: UIComponentProps = {
      fontSize: 'inherit',
      fontWeight: t.defFontWeight,
      //textIndent: '2rem',
      //paddingTop: t.defFontSize,
      textColor
    }
    buildRule(pProps, parentSelector, 'p')

    const globalProps: UIComponentProps = {
      fontFamily: articleFont,
      fontSize: 'inherit',
      fontWeight: t.defFontWeight,
      textColor
    }
    buildRule(globalProps, parentSelector, 'div')
    buildRule(globalProps, parentSelector, 'span')

    const strongProps: UIComponentProps = {
      //fontFamily: '--font-family-article-bi',
      fontSize: 'inherit',
      fontWeight: 'bold',
      fontStyle: 'italic'
    }
    buildRule(strongProps, parentSelector, 'strong')

    const boldProps: UIComponentProps = {
      fontSize: 'inherit',
      fontWeight: 'bold'
    }
    buildRule(boldProps, parentSelector, 'b')

    const italicProps: UIComponentProps = {
      fontSize: 'inherit',
      fontWeight: t.defFontWeight,
      fontStyle: 'italic'
    }
    buildRule(italicProps, parentSelector, 'i')

    //list
    const listItemProps: UIComponentProps = {
      fontSize: 'inherit',
      fontWeight: t.defFontWeight
    }
    buildRule(listItemProps, parentSelector, 'li')

    const listProps: UIComponentProps = {
      fontSize: 'inherit',
      fontWeight: t.defFontWeight,
      margin: '0px'
    }
    buildRule(listProps, parentSelector, 'ul')
    buildRule(listProps, parentSelector, 'ol')

    //highliting: ` 
    const emphasizeProps: UIComponentProps = {
      fontFamily: articleFont,
      bgColor: t.isLight ? '#edf4ee' : 'undefined',
      textColor: t.em,
      fontStyle: 'normal',
      paddingVertical: '5px'
    }
    buildRule(emphasizeProps, parentSelector, 'em')

    //one line code: ```
    const monoFontProps: UIComponentProps = {
      fontSize: 'inherit',
      fontFamily: monoFont,
      display: 'inline',
      bgColor: t.codeBg,
      textColor: t.code,
      //padding: '5px'
    }
    buildRule(monoFontProps, parentSelector, 'code')

    // const preCodeProps: StylableComponentProps = {
    //   fontFamily: 'Georgia',
    //   fontSize: t.defFontSize,
    //   // textAlign: 'center',
    //   bgColor: t.gray,
    //   textColor: t.isLight ? textColor : t.black,
    //   width: '100%',
    //   paddingHorizontal: '100px'
    // }
    // buildRule(preCodeProps, parentSelector, 'code.language-js')

    buildRule({
      fontSize: t.defFontSize,
      fontWeight: t.defFontWeight,
      bgColor: '#ffFF00',
      textColor
    }, parentSelector, 'mark')

    buildRule({
      fontSize: '1.5rem',
      textColor: t.h1
    }, parentSelector, 'mjx-math')

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
    buildRule(linkProps, parentSelector, 'a:hover')

    const blockquoteContentProps: UIComponentProps = {
      //marginVertical: '20px',
      //paddingVertical: '10px',
      paddingHorizontal: '20px',
      //bgColor: '#e5f0df',
      borderLeft: '1px solid ' + t.comment + '88'
    }
    buildRule(blockquoteContentProps, parentSelector, 'blockquote')

    const blockquoteTextProps: UIComponentProps = {
      fontSize: '1.3rem',
      textColor: t.comment
    }
    buildRule(blockquoteTextProps, parentSelector, 'blockquote p')
    buildRule(blockquoteTextProps, parentSelector, 'blockquote i')
    buildRule(blockquoteTextProps, parentSelector, 'blockquote strong')

    // const blockquoteAuthorProps: StylableComponentProps = {
    //   fontFamily: articleFont,
    //   fontSize: t.defFontSize,
    //   textColor
    // }
    // buildRule(blockquoteAuthorProps, parentSelector, 'blockquote h4')

    // const blockquoteProps: StylableComponentProps = {
    //   paddingVertical: '20px'
    // }
    // buildRule(blockquoteProps, parentSelector, 'blockquote')

    const imgProps: UIComponentProps = {
      maxWidth: (t.maxBlogTextWidthPx + 200) + 'px',
      //paddingTop: '50px'
    }
    buildRule(imgProps, parentSelector, 'img')

    /*
    *
    * p with classname
    *
    * */
    //stars delim
    const delimProps: UIComponentProps = {
      width: '100%',
      fontWeight: 'bold',
      paddingVertical: '0px',
      textAlign: 'center'
    }
    buildRule(delimProps, parentSelector, 'p.md-delim')

    //align center
    const pCenterProps: UIComponentProps = {
      width: '100%',
      textAlign: 'center',
      fontWeight: 'inherit',
      fontSize: 'inherit',
      textColor: 'inherit'
    }
    buildRule(pCenterProps, parentSelector, 'div.md-center')

    //align right
    const pRightProps: UIComponentProps = {
      width: '100%',
      textAlign: 'right',
      fontWeight: 'inherit',
      fontSize: 'inherit',
      textColor: 'inherit'
    }
    buildRule(pRightProps, parentSelector, 'div.md-right')

    //bash-code
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

    //img legend
    const imgLegendProps: UIComponentProps = {
      fontWeight: 'inherit',
      fontSize: '1.2rem',
      textColor: t.text50,
    }
    buildRule(imgLegendProps, parentSelector, 'p.md-legend')

    /*
    *
    * div with classname
    *
    * */

    //poem
    const poemProps: any = {
      textColor: 'inherit',
      width: '100%',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      paddingHorizontal: '50px',
      fontSize: '1.3rem'
    }
    buildRule(poemProps, parentSelector, 'div.poem')
    buildRule({ fontSize: 'inherit', textColor: 'inherit' }, parentSelector, 'div.poem div')

    //note
    const noteProps: UIComponentProps = {
      width: '100%',
      fontSize: '1.3rem',
      fontWeight: t.defFontWeight,
      textColor: t.text,
      paddingHorizontal: '20px',
      //bgColor: '#e5f0df',
      borderLeft: '1px solid ' + t.text50
    }
    buildRule(noteProps, parentSelector, 'div.note')
    buildRule({ fontSize: 'inherit', textColor: 'inherit' }, parentSelector, 'div.note div')

    //epigraph
    const epigraphProps: any = {
      width: '100%',
      fontSize: '1.3rem',
      paddingLeft: '50%',
      flexDirection: 'row',
      justifyContent: 'right',
      textAlign: 'left',
      fontWeight: 'inherit',
      textColor: t.h2
    }
    buildRule(epigraphProps, parentSelector, 'div.epi')
    buildRule({ fontSize: 'inherit', textColor: 'inherit' }, parentSelector, 'div.epi div')

    //textAlign center
    const centerProps: UIComponentProps = {
      width: '100%',
      fontSize: '1.3rem',
      fontWeight: t.defFontWeight,
      textAlign: 'center',
      textColor: 'inherit'
    }
    buildRule(centerProps, parentSelector, 'div.center')
    buildRule({ fontSize: 'inherit', textColor: 'inherit' }, parentSelector, 'div.center div')
  }
}

export const themeManager = new ThemeManager()
export const theme = () => themeManager.$theme.value