import Web3 from 'web3'
import {
  Users,
  Client,
  PrivateKey,
  PublicKey,
  KeyInfo,
  UserMessage,
  UserAuth,
  Identity,
  MailboxEvent,
  MailboxEventType,
} from '@textile/hub'
import aes256 from 'aes256'
import {
  CachedWallet,
  DecryptedMailbox,
  MessageSchema,
} from '../state/account/types'

const keyInfo: KeyInfo = {
  key: process.env.GATSBY_TEXTILE_UNSAFE_KEY,
  secret: process.env.GATSBY_TEXTILE_UNSAFE_SECRET,
}
const oraclePublicKey = process.env.GATSBY_ORACLE_KEY

const messageDecoder = async (
  message: UserMessage,
  privateKey: PrivateKey
): Promise<DecryptedMailbox> => {
  const bytes = await privateKey.decrypt(message.body)
  const bodyString = new TextDecoder().decode(bytes)
  let body: any
  try {
    body = JSON.parse(bodyString)
  } catch (err) {
    body = bodyString
  }
  const { from } = message
  const { readAt } = message
  const { createdAt } = message
  const { id } = message
  return { body, from, readAt, sent: createdAt, id }
}

interface TextileInterface {
  user: Users | null
  client: Client | null
  privateKey?: PrivateKey
  authorized: string | null
  lastAuthorization: number | null
  callbackInbox: (message: DecryptedMailbox) => void | null
  generateMessageForEntropy: (
    address: string,
    application_name: string,
    secret: string
  ) => string
  generateMessageForPublicKeyValidation: (publickey: string) => string
  generateIdentity: (address: string) => Promise<PrivateKey | null>
  generatePublicKeyValidation: (
    address: string,
    publickey: string
  ) => Promise<string | null>
  storeKeys: (address: string) => boolean
  storePrivateKey: (address: string, secret: string) => Promise<PrivateKey>
  fetchIdentity: (
    address: string,
    secret: string
  ) => Promise<CachedWallet | null>
  loginWithChallenge: (identity: Identity) => Promise<UserAuth>
  registerNewKey: (wallet: string, key: string, sig: string) => Promise<void>
  authorize: () => Promise<Client | null>
  watchInbox: (
    reply?: MailboxEvent | undefined,
    err?: Error | undefined
  ) => void
  setCallbackInbox: (callback: (message: DecryptedMailbox) => void) => void
  refreshAuthorization: () => Promise<Client | null>
  listInboxMessages: () => Promise<DecryptedMailbox[]>
  listOutboxMessages: () => Promise<DecryptedMailbox[]>
  sendMessage: (
    to: string,
    message: MessageSchema
  ) => Promise<UserMessage | null>
  deleteMessage: (id: string) => Promise<void>
  readMessage: (id: string) => Promise<void>
}

const Textile: TextileInterface = {
  user: null,
  client: null,
  privateKey: undefined,
  authorized: null, // Authorized Address
  lastAuthorization: null,
  callbackInbox: null,

  generateMessageForEntropy(
    address: string,
    application_name: string,
    secret: string
  ): string {
    return (
      'READ THIS MESSAGE CAREFULLY. ' +
      'DO NOT SHARE THIS SIGNED MESSAGE WITH ANYONE OR THEY WILL HAVE READ AND WRITE' +
      'ACCESS TO THIS APPLICATION. ' +
      'DO NOT SIGN THIS MESSAGE IF THE FOLLOWING IS NOT TRUE OR YOU DO NOT CONSENT' +
      'TO THE CURRENT APPLICATION HAVING ACCESS TO THE FOLLOWING APPLICATION. \n\n' +
      'The Ethereum address used by this application is: \n' +
      address +
      '\n\n' +
      'By signing this message, you authorize the current application to use the ' +
      'following app associated with the above address: \n' +
      '\n' +
      application_name +
      '\n\n' +
      'The hash of your non-recoverable, private, non-persisted password or secret ' +
      'phrase is: \n' +
      '\n' +
      secret +
      '\n\n' +
      'ONLY SIGN THIS MESSAGE IF YOU CONSENT TO THE CURRENT PAGE ACCESSING THE KEYS ' +
      'ASSOCIATED WITH THE ABOVE ADDRESS AND APPLICATION. ' +
      'AGAIN, DO NOT SHARE THIS SIGNED MESSAGE WITH ANYONE OR THEY WILL HAVE READ AND ' +
      'WRITE ACCESS TO THIS APPLICATION. \n'
    )
  },

  generateMessageForPublicKeyValidation(publickey: string): string {
    return (
      'THIS SIGNATURE SERVE TO THE PURPOSE OF \n' +
      'VALIDATE THE OWNERSHIP OF YOUR PUBLIC KEY \n' +
      'BY YOUR WALLET ADDRESS: \n' +
      publickey
    )
  },

  generateIdentity: async function (
    address: string
  ): Promise<PrivateKey | null> {
    const web3: Web3 = window.web3
    // avoid sending the raw secret by hashing it first
    const secretHashed = web3.utils.sha3(process.env.GATSBY_PASSWORD)
    if (!secretHashed) return null
    const message = this.generateMessageForEntropy(
      address,
      'otoco-dapp',
      secretHashed
    )
    const signedText = await web3.eth.personal.sign(message, address)
    const signatureHash = web3.utils.keccak256(signedText).replace('0x', '')
    // The following line converts the hash in hex to an array of 32 integers.
    const sigArray = signatureHash
      .match(/.{2}/g)
      .map((t) => web3.utils.hexToNumber('0x' + t))
    if (sigArray.length !== 32) {
      throw new Error(
        'Hash of signature is not the correct size! Something went wrong!'
      )
    }
    this.privateKey = PrivateKey.fromRawEd25519Seed(Uint8Array.from(sigArray))
    // Your app can now use this identity for generating a user Mailbox, Threads, Buckets, etc
    return this.privateKey
  },

  generatePublicKeyValidation: async function (
    address: string,
    publickey: string
  ): Promise<string | null> {
    try {
      const web3: Web3 = window.web3
      const message = this.generateMessageForPublicKeyValidation(publickey)
      const signature = await web3.eth.personal.sign(message, address)
      return signature
    } catch (err) {
      console.error('Signature Rejected.')
    }
    return null
  },

  storeKeys: function (address: string): boolean {
    if (!this.privateKey) return false
    const encrypted = aes256.encrypt(
      process.env.GATSBY_PASSWORD,
      this.privateKey.toString()
    )
    localStorage.setItem(
      `did:eth:${address.substr(2)}`,
      JSON.stringify({
        alias: '',
        password: false,
        key: encrypted,
      })
    )
    return true
  },

  fetchIdentity: async function (
    address: string,
    secret: string
  ): Promise<CachedWallet | null> {
    /** Restore any cached user identity first */
    const cachedString = localStorage.getItem(`did:eth:${address.substr(2)}`)
    if (!cachedString) return null
    const cached: CachedWallet = JSON.parse(cachedString)
    const decrypted = aes256.decrypt(secret, cached.key).toString('utf8')
    this.privateKey = PrivateKey.fromString(decrypted)
    cached.key = this.privateKey.toString()
    return cached
  },

  loginWithChallenge: async (identity: Identity): Promise<UserAuth> => {
    return new Promise((resolve, reject) => {
      /**
       * Configured for our development server
       *
       * Note: this should be upgraded to wss for production environments.
       */

      /** Initialize our websocket connection */
      const socket = new WebSocket(process.env.GATSBY_ORACLE_URL)
      socket.onerror = () => {
        reject('Error connecting socket')
      }
      /** Wait for our socket to open successfully */
      socket.onopen = () => {
        /** Get public key string */
        const publicKey = identity.public.toString()

        /** Send a new token request */
        socket.send(
          JSON.stringify({
            pubkey: publicKey,
            type: 'token',
          })
        )

        /** Listen for messages from the server */
        socket.onmessage = async (event) => {
          const data = JSON.parse(event.data)
          switch (data.type) {
            /** Error never happen :) */
            case 'error': {
              reject(data.value)
              break
            }
            /** The server issued a new challenge */
            case 'challenge': {
              /** Convert the challenge json to a Buffer */
              const buf = Buffer.from(data.value)
              /** User our identity to sign the challenge */
              const signed = await identity.sign(buf)
              /** Send the signed challenge back to the server */
              socket.send(
                JSON.stringify({
                  type: 'challenge',
                  sig: Buffer.from(signed).toJSON(),
                })
              )
              break
            }
            /** New token generated */
            case 'token': {
              resolve(data.value)
              break
            }
          }
        }
      }
    })
  },

  registerNewKey: async (
    wallet: string,
    key: string,
    sig: string
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const socket = new WebSocket(process.env.GATSBY_ORACLE_URL)

      /* Wait for our socket to open successfully */
      socket.onopen = () => {
        /* Send a new token request */
        socket.send(
          JSON.stringify({
            type: 'register',
            key,
            sig,
            wallet,
          })
        )

        /* Listen for messages from the server */
        socket.onmessage = async (event) => {
          const data = JSON.parse(event.data)
          if (data.type == 'error') reject('Error registering key.')
          if (data.type == 'wallet') resolve()
        }
      }
    })
  },

  authorize: async function () {
    if (!this.privateKey) throw 'No private key found'
    const auth: UserAuth = await this.loginWithChallenge(this.privateKey)
    this.user = await Users.withUserAuth(auth)
    this.client = await Client.withUserAuth(auth)
    await this.user.setupMailbox()
    const now = new Date()
    this.lastAuthorization = now.getTime()
    // await this.user.watchInbox(await this.user.getMailboxID(), this.watchInbox)
    return this.client
  },

  watchInbox: async function (
    reply?: MailboxEvent | undefined,
    err?: Error | undefined
  ) {
    if (!reply || !reply.message) return
    // if (reply.type !== MailboxEventType.CREATE) {
    //   return
    // }
    if (!Textile.privateKey) return
    const messageDecoded = await messageDecoder(
      reply.message,
      Textile.privateKey
    )
    Textile.callbackInbox(messageDecoded)
  },

  setCallbackInbox: async function (
    callback: (message: DecryptedMailbox) => void
  ) {
    this.callbackInbox = callback
  },

  refreshAuthorization: async function (): Promise<Client | null> {
    const now = new Date()
    try {
    if (!this.lastAuthorization) return await this.authorize()
    if (this.lastAuthorization + 120000 < now.getTime())
      return await this.authorize()
    } catch (err) {
      if (err == "No private key found") console.log('The accound has no Textile key registered.')
    }
    return null
  },

  // MAILBOX
  listInboxMessages: async function (): Promise<DecryptedMailbox[]> {
    await this.refreshAuthorization()
    if (!this.user) return []
    if (!this.privateKey) return []
    const messages = await this.user.listInboxMessages({ status: 2 })
    const privateKey = PrivateKey.fromString(this.privateKey.toString())
    const messageList = Promise.all(
      messages.map(async function (m) {
        return await messageDecoder(m, privateKey)
      })
    )
    return messageList
  },

  listOutboxMessages: async function (): Promise<DecryptedMailbox[]> {
    await this.refreshAuthorization()
    if (!this.user) throw 'No user defined'
    if (!this.privateKey) throw 'No private key present'
    const messages = await this.user.listSentboxMessages()
    const privateKey = PrivateKey.fromString(this.privateKey.toString())
    const messageList = Promise.all(
      messages.map(async function (m) {
        return await messageDecoder(m, privateKey)
      })
    )
    return messageList
  },

  sendMessage: async function (to: string, message: MessageSchema) {
    await this.refreshAuthorization()
    if (!this.user) return null
    if (!this.privateKey) return null
    const toPublicKey: PublicKey = PublicKey.fromString(to)
    const encoded = new TextEncoder().encode(JSON.stringify(message))
    // const encryptedEncoded = await toPublicKey.encrypt(encoded)
    // const decoded = new TextDecoder().decode(encryptedEncoded).toString()
    return await this.user.sendMessage(this.privateKey, toPublicKey, encoded)
  },

  readMessage: async function (id: string) {
    await this.refreshAuthorization()
    if (!this.user) return
    await this.user.readInboxMessage(id)
  },

  deleteMessage: async function (id: string) {
    await this.refreshAuthorization()
    if (!this.user) return
    // Delete from both cause it only exist in one
    await this.user.deleteSentboxMessage(id)
    await this.user.deleteInboxMessage(id)
  },

  // SHARABLE BUCKETS
  createBucket: async function () {},

  listBuckets: async function () {},

  listFilesInBucket: async function () {},

  uploadFile: async function () {},

  updateFolderPermission: async function () {},

  eraseFile: async function () {},
}

export default Textile
