import {
  SET_USER,
  SET_USER_PZ,
  SET_USER_AI_STRENGTH
} from '../actions/userActions'

const user = (state ={}, action) => {
  let user = state
  switch (action.type) {
    case 'SET_USER_AI_STRENGTH':
      user.ai.strength = action.value
      return user
    case 'SET_USER_PZ':
      user.pzs[action.pzIndex] = action.value
      return user
    case 'SET_USER':
      return action.value
    default:
      return state
  }
}

export default user
