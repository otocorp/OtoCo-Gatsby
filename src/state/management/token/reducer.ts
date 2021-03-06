import {
  SET_TOKEN_CONFIG,
  SET_TOKEN_DEPLOYED,
  CLEAR_TOKEN_DEPLOYED,
  ITokenState,
  TokenActionTypes,
} from './types'

const reducer = (
  state: ITokenState = {},
  action: TokenActionTypes
): ITokenState => {
  switch (action.type) {
    case SET_TOKEN_CONFIG:
      return {
        ...state,
        tokenConfig: action.payload,
      }
    case SET_TOKEN_DEPLOYED:
      return {
        ...state,
        tokenDeployed: action.payload,
      }
    case CLEAR_TOKEN_DEPLOYED:
      return {
        ...state,
        tokenDeployed: undefined,
        tokenConfig: undefined,
      }
    default:
      return state
  }
}

export default reducer
