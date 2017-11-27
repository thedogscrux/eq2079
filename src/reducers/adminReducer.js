import {
  SET_DEBUG
} from '../actions/adminActions'

const DEFAULT_ADMIN = {
  debug: false
}

const admin = (state = DEFAULT_ADMIN, action) => {
  switch (action.type) {
    case 'SET_DEBUG':
      let admin = state
      admin.debug = action.value
      return admin
    default:
      return state
  }
}

export default admin
