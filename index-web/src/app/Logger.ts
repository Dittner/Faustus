const echo = import.meta.env.VITE_ECHO === 'true'

export const log = (...args: any[]) => {
  echo && console.log(...args)
}

export const logWarn = (...args: any[]) => {
  console.warn(...args)
}

export const logErr = (...args: any[]) => {
  console.error(...args)
}

console.log('Logger:', echo ? 'echo is on' : 'echo is off' )
log('Logger is initialized')