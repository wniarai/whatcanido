import { addAlias } from 'module-alias'
import 'module-alias/register'
import path from 'path'

addAlias('@', path.join(__dirname, '.'))
addAlias('@static', path.join(__dirname, '../static'))
