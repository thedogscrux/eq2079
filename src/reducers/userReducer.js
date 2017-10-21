import {
  SET_USER
} from '../actions/userActions'

const user = (state ={}, action) => {
  switch (action.type) {
    case 'SET_USER':
      return action.value
    default:
      return state
  }
}

export default user
