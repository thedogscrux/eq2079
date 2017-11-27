import { combineReducers } from 'redux'

import user from './userReducer'
import admin from './adminReducer'

const AppReducer = combineReducers({
  user,
  admin
})

export default AppReducer
