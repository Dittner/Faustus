import './index.css'
import './code.css'
import { App } from './App'

console.log('env:', import.meta.env);

const app = App()
document.getElementById('root')!.appendChild(app.dom)