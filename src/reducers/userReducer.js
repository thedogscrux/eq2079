import {
  SET_USER,
  SET_USER_PZ
} from '../actions/userActions'

const user = (state ={}, action) => {
  switch (action.type) {
    case 'SET_USER_PZ':
      let user = state
      user.pzs[action.pzIndex] = action.value
      return user
    case 'SET_USER':
      return action.value
    default:
      return state
  }
}

export default user
