import { createStore } from 'redux'
import indexReducer from './indexReducer'

export default createStore(indexReducer)
export { Store } from 'redux'