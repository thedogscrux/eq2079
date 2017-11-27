export const SET_DEBUG = 'SET_DEBUG'

export function setDebug (debug) {
  return {
    type: SET_DEBUG,
    value: debug
  }
}
