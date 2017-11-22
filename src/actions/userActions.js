export const SET_USER = 'SET_USER'
export const SET_USER_PZ = 'SET_USER_PZ'
export const SET_USER_AI_STRENGTH = 'SET_AI_STRENGTH'

export function setUser (user) {
  return {
    type: SET_USER,
    value: user
  }
}

export function setUserPz (pzIndex, val) {
  return {
    type: SET_USER_PZ,
    pzIndex: pzIndex,
    value: val
  }
}

export function setUserAIStrength (strength) {
  return {
    type: SET_USER_AI_STRENGTH,
    value: strength
  }
}
