import { combineReducers } from 'redux'

import user from './userReducer'

const AppReducer = combineReducers({
  user
})

export default AppReducer
