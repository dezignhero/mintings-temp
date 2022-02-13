const defaultState = () => ({
  // Add properties here
})

const state = defaultState

const actions = {
  nuxtClientInit({ dispatch }, context) {
    // dispatch('communities/fetch')
  },

  nuxtServerInit({ dispatch }, { req }) {
    // dispatch('communities/fetch')
  }
}

// export const strict = false; // added to speed up (might be causing memory exceed locally)

export default {
  state,
  actions
}
