import firebase from 'gatsby-plugin-firebase'

export default {
  fillForm: async (
    wallet: string,
    email: string
  ): Promise<boolean | undefined> => {
    try {
      const res = await firebase
        .database()
        .ref('data/' + wallet)
        .set({
          email,
          // name,
          // website,
          filling: true,
        })
      return res
    } catch (err) {
      console.error(err)
    }
  },

  getFilling: async (wallet: string): Promise<boolean> => {
    const ret = await firebase
      .database()
      .ref('/data/' + wallet + '/filling')
      .once('value')
    return ret.val()
  },
}
