import {
  SET_OWN_SERIES,
  SET_MANAGE_SERIES,
  CLEAR_MANAGE_SERIES,
  SET_TOKEN_CONFIG,
  SET_TOKEN_DEPLOYED,
  SET_ENS_DOMAINS,
  SET_CONTACT_FORM,
  SET_MULTISIG_CONFIG,
  SET_MULTISIG_DEPLOYED,
  SET_MULTISIG_BALANCES,
  IManagementState,
  ManagementActionTypes,
} from './types'

export const initialState = {
  contactForm: false,
  series: [],
}

const reducer = (
  state: IManagementState = initialState,
  action: ManagementActionTypes
): IManagementState => {
  switch (action.type) {
    case SET_OWN_SERIES:
      return {
        ...state,
        series: action.payload,
      }
    case SET_MANAGE_SERIES:
      return {
        ...state,
        managing: action.payload,
      }
    case CLEAR_MANAGE_SERIES:
      return {
        ...state,
        managing: undefined,
        tokenConfig: undefined,
        tokenDeployed: undefined,
        ensDomains: undefined,
        multisigConfig: undefined,
        multisigDeployed: undefined,
        multisigBalances: undefined,
      }
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
    case SET_ENS_DOMAINS:
      return {
        ...state,
        ensDomains: action.payload,
      }
    case SET_CONTACT_FORM:
      return {
        ...state,
        contactForm: action.payload,
      }
    case SET_MULTISIG_CONFIG:
      return {
        ...state,
        multisigConfig: action.payload,
      }
    case SET_MULTISIG_DEPLOYED:
      return {
        ...state,
        multisigDeployed: action.payload,
      }
    case SET_MULTISIG_BALANCES:
      return {
        ...state,
        multisigBalances: action.payload,
      }
    default:
      return state
  }
}

export default reducer
