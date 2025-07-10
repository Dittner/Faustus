const operators: Set<string> = new Set(('-–—+*=~$@^%&?!#|/()[]{}<>:;,."`' + "'\\").split(''))
const numbers: Set<string> = new Set('0123456789'.split(''))

export enum Lexema {
  Number = 'N',
  Operator = 'O',
  Letter = 'L',
  String = 'S',
  Tag = 'T',
  Regex = 'R',
  Comment = 'M',
  Class = 'C',
  Empty = 'E',
  Space = '_',
  Function = 'F',
  Keyword = 'K',
  Decorator = 'D',
  LineBreak = 'B',
}


export class MDToken {
  value: string;
  lex: Lexema;
  private _prev: MDToken | undefined
  private _next: MDToken | undefined

  constructor(value: string, lex: Lexema) {
    this.value = value
    this.lex = lex
  }

  prev(): MDToken | undefined { return this._prev }
  next(): MDToken | undefined { return this._next }

  append(t: MDToken | undefined) {
    if (this._next) this._next._prev = undefined
    if (t) t._prev = this
    this._next = t
  }
}

export class Grammar {
  //Scheme of interval rules
  readonly ir = [
    'S(""")(""")',
    "S(''')(''')",
    'M(/*)(*/)',
    'M(#)(\n)',
    'M(//)(\n)',
    'S(")(")',
    "S(')(')",
    'S(`)(`)'
  ]

  readonly gr = [
    //Replace Letters(L) token with Keywords(K)
    'L(^(extends|default|implements|catch|switch|static|override|internal|void|null|protected|abstract|export|undefined|public|readonly|private|var|const|let|self|this|dict|string|list|final|double|throws|throw|new|instanceof|False|false|None|bool|int|str|enum|number|float|never|True|true|and|as|assert|case|match|async|await|break|interface|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|get|set|pass|raise|return|try|while|with|yield)$:K)',
    //Replace Letters(L) token with Decorators(D)
    'O(^@$:D) L(:D)',
    //Identifiers(L) can have numbers(N)
    'L(:) N(:L)',
    //Replace Letters(L) token separated with Spaces(_) with Class(C)
    'K(^(class|interface|new)$:) _(:) L(:C)',
    //Replace Letters(L) token with Decorators(D)
    'D(:) O(^[.]$:) L(:D)',
    //Replace Letters(L) token with Function(F)
    'L(:F) O(^[(<]:)',
    //Supports complex number
    'N(:) L(^j$:N)',
    //Supports html tags
    'O(</?:) L(:T)',
    //Supports hex numbers
    'N(^0$:) L(^x:N)',
    //Supports strings formating
    'L(^[fbr]$:S) S(:)',
  ]

  readonly intervalRules: IntervalRule[]
  readonly grammarRules: GrammarRule[]
  constructor() {
    this.intervalRules = this.ir.map(s => new IntervalRule(s))
    this.grammarRules = this.gr.map(s => new GrammarRule(s))
  }

  tokenize(code: string): MDToken {
    let root: MDToken | undefined
    let t: MDToken | undefined
    let tail: MDToken | undefined

    let buffer = ''
    let index = 0
    let curLex = Lexema.Letter

    const relalizBuffer = () => {
      if (buffer) {
        if (t) {
          t.append(new MDToken(buffer, curLex))
          t = t.next()
        } else {
          root = new MDToken(buffer, curLex)
          t = root
        }
        buffer = ''
      }
    }

    const matchIntervalRules = (): boolean => {
      for (let r of this.intervalRules) {
        if (r.match(code, index)) {
          relalizBuffer()
          let endAt = r.indexOfTo(code, index + 1)
          if (endAt === -1) {
            buffer = code.substring(index)
            index = code.length
          } else {
            buffer = code.substring(index, endAt + r.to.length)
            index = endAt + r.to.length - 1
          }
          curLex = r.lex
          relalizBuffer()
          return true
        }
      }
      return false
    }

    while (index < code.length) {
      const ch = code.charAt(index)
      const chl = this.charToLexema(ch)
      if (curLex !== chl) {
        relalizBuffer()
        curLex = chl
      }

      if (matchIntervalRules()) {
        index++
      } else {
        buffer += ch
        index++
      }
    }

    relalizBuffer()


    if (t && tail) t.append(tail)

    const res = root ?? tail ?? new MDToken('', Lexema.Empty)

    this.applyRules(res)

    return res
  }

  private charToLexema(ch: string): Lexema {
    if (ch === ' ') return Lexema.Space
    if (ch === '\n') return Lexema.LineBreak
    if (operators.has(ch)) return Lexema.Operator
    if (numbers.has(ch)) return Lexema.Number
    return Lexema.Letter
  }

  applyRules(root: MDToken) {
    this.grammarRules.forEach(r => {
      const hasChanges = r.apply(root)
      if (hasChanges) this.merge(root)
    });
  }

  merge(root: MDToken): MDToken {
    let t: MDToken | undefined = root
    while (t && t.next()) {
      if (t.lex === t.next()?.lex) {
        t.value += t.next()?.value
        t.append(t.next()?.next())
      } else {
        t = t.next()
      }
    }
    return root
  }
}

//\S\s – any symbols includine breaklines
const INTERVAL_RULE_REGEX = /^([KFCLORMNSTED_])\(([\S\s]*)\)\(([\S\s]*)\)$/
class IntervalRule {
  readonly from: string
  readonly to: string
  readonly lex: Lexema
  constructor(rule: string) {
    const params = rule.match(INTERVAL_RULE_REGEX);
    if (!params) throw new Error('Invalid interval rule: ' + rule)
    this.lex = params[1] as Lexema
    this.from = params[2]
    this.to = params[3]
  }

  match(str: string, pos: number): boolean {
    if (this.from.length > str.length + pos) return false
    for (let i = 0; i < this.from.length; i++) {
      if (str[pos + i] !== this.from[i]) return false
    }
    return true
  }

  indexOfTo(s: string, pos: number): number {
    let index = -1
    while (true) {
      index = s.indexOf(this.to, pos)
      if (index === -1)
        break
      else if (index === 0 || (index > 0 && s[index - 1] !== '\\'))
        break
      pos = index + 1
    }
    return index
  }
}

const GRAMMAR_RULE_REGEX = /^([KFCLORMNSTED_])\((.*):([KFCLORMNSTED_])?\)$/
class GrammarRule {
  readonly statementRoot: GrammarRuleStatement | undefined;

  constructor(rule: string) {
    let root: GrammarRuleStatement | undefined
    let s: GrammarRuleStatement | undefined

    for (let r of rule.split(' ')) {
      const params = r.match(GRAMMAR_RULE_REGEX);
      if (!params) throw new Error('Invalid grammar rule: ' + r)
      if (s) {
        s.append(new GrammarRuleStatement(params[0], params[1] as Lexema, params[2], params[3] as Lexema))
        s = s.next()
      }
      else {
        s = new GrammarRuleStatement(params[0], params[1] as Lexema, params[2], params[3] as Lexema)
        root = s
      }
    }

    this.statementRoot = root
  }

  apply(root: MDToken): boolean {
    let hasChanges = false
    let t: MDToken | undefined = root
    while (t) {
      let isMatched = true
      let tt: MDToken | undefined = t
      let s: GrammarRuleStatement | undefined = this.statementRoot
      //validation
      while (tt && s) {
        if (s.lexIn !== tt.lex) {
          isMatched = false
          break
        }
        if (s.condition && !tt.value.match(s.condition)) {
          isMatched = false
          break
        }
        //console.log('May be matched, token:', tt, ',s:', s)
        s = s.next()
        tt = tt.next()
      }

      if (isMatched && !s) {
        //updating
        hasChanges = true
        tt = t
        s = this.statementRoot
        while (tt && s) {
          if (s.lexOut !== undefined) {
            tt.lex = s.lexOut
          }
          s = s.next()
          tt = tt.next()
        }
      }
      t = t.next()
    }
    return hasChanges
  }
}

class GrammarRuleStatement {
  readonly rule: string
  readonly condition: string
  readonly lexIn: Lexema | undefined
  readonly lexOut: Lexema | undefined
  private _next: GrammarRuleStatement | undefined

  constructor(rule: string, lexIn: Lexema | undefined, condition: string, lexOut: Lexema | undefined) {
    this.rule = rule
    this.condition = condition
    this.lexIn = lexIn
    this.lexOut = lexOut
  }

  next(): GrammarRuleStatement | undefined { return this._next }

  append(s: GrammarRuleStatement) {
    this._next = s
  }
}




