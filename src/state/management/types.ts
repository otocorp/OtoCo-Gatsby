export const SET_OWN_SERIES = 'SET_OWN_SERIES'
export const SET_MANAGE_SERIES = 'SET_MANAGE_SERIES'
export const CLEAR_MANAGE_SERIES = 'CLEAR_MANAGE_SERIES'
export const SET_TOKEN_CONFIG = 'SET_TOKEN_CONFIG'
export const SET_TOKEN_DEPLOYED = 'SET_TOKEN_DEPLOYED'
export const SET_ENS_DOMAINS = 'SET_ENS_DOMAINS'
export const SET_MULTISIG_CONFIG = 'SET_MULTISIG_CONFIG'
export const SET_MULTISIG_DEPLOYED = 'SET_MULTISIG_DEPLOYED'
export const SET_MULTISIG_BALANCES = 'UPDATE_MULTISIG_BALANCE'
export const SET_CONTACT_FORM = 'SET_CONTACT_FORM'

export type SeriesType = {
  contract: string
  owner: string
  name: string
  jurisdiction: string
  created: Date
}

export type TokenConfig = {
  shares: string
  decimals: number
  name: string
  symbol: string
}

export type TokenDeployed = {
  creation: Date
  contract: string
}

export type TokenOwner = {
  address: string
  balance: number
}

export type ENSDomain = {
  domain: string
  address: string
}

export type ENSDomains = {
  domains: ENSDomain[]
}

export type MultisigConfig = {
  owners: string[]
  threshold: string
}

export type MultisigDeployed = {
  contract: string
}

export type MultisigBalances = {
  balances: MultisigBalance[]
}

export type MultisigBalance = {
  contract: string
  name: string
  symbol: string
  decimals: number
  amount: string
}

interface SetOwnSeries {
  type: typeof SET_OWN_SERIES
  payload: SeriesType[]
}
interface SetManageSeries {
  type: typeof SET_MANAGE_SERIES
  payload: SeriesType
}
interface ClearManageSeries {
  type: typeof CLEAR_MANAGE_SERIES
}
interface SetTokenConfig {
  type: typeof SET_TOKEN_CONFIG
  payload: TokenConfig
}
interface SetTokenDeployed {
  type: typeof SET_TOKEN_DEPLOYED
  payload: TokenDeployed
}
interface SetENSDomains {
  type: typeof SET_ENS_DOMAINS
  payload: ENSDomains
}
interface SetMultisigConfig {
  type: typeof SET_MULTISIG_CONFIG
  payload: MultisigConfig
}
interface SetMultisigDeployed {
  type: typeof SET_MULTISIG_DEPLOYED
  payload: MultisigDeployed
}
interface SetMultisigBalances {
  type: typeof SET_MULTISIG_BALANCES
  payload: MultisigBalances
}
interface SetContactForm {
  type: typeof SET_CONTACT_FORM
  payload: boolean
}
export interface IManagementState {
  series: SeriesType[]
  managing?: SeriesType
  multisigConfig?: MultisigConfig
  multisigDeployed?: MultisigDeployed
  multisigBalances?: MultisigBalances
  tokenConfig?: TokenConfig
  tokenDeployed?: TokenDeployed
  ensDomains?: ENSDomains
  contactForm: boolean
}

export type ManagementActionTypes =
  | SetOwnSeries
  | SetManageSeries
  | ClearManageSeries
  | SetTokenConfig
  | SetTokenDeployed
  | SetENSDomains
  | SetMultisigConfig
  | SetMultisigDeployed
  | SetMultisigBalances
  | SetContactForm
