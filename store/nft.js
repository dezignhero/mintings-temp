import Vue from 'vue'
import { get, isNumber, isNil } from 'lodash'
import { ThirdwebSDK, NATIVE_TOKEN_ADDRESS } from '@3rdweb/sdk'
import { ethers } from 'ethers'

const defaultState = () => ({
  nft: null,
  tokenId: null,
  timer: null,
  minting: false
})

// [TODO] Remove this and fix proxy issues
const apiBase = 'https://superlocal.tools/api'

const state = defaultState

const getters = {
  get(state) {
    return get(state, 'nft', null)
  },

  getPlace(state) {
    return get(state, 'nft.place', null)
  },

  getMinting(state) {
    return get(state, 'minting', null)
  },

  getTimer(state) {
    return get(state, 'timer', null)
  }
}

const actions = {
  async fetch({ dispatch }, data) {
    const response = await this.$axios.$get(`${apiBase}/mintings/${data.uuid}`)
    dispatch('set', get(response, 'data', null))
    return response
  },

  async generatePayloadSignature({ commit, state }, data) {
    commit('SET_MINTING', true)

    // Set up module with contract private (needs to be removed)
    const sdk = new ThirdwebSDK(
      new ethers.Wallet(
        process.env.modulePrivate,
        ethers.getDefaultProvider(process.env.provider)
      )
    )
    const module = sdk.getNFTModule(process.env.moduleAddress)

    // Nft Metadata
    const nftPrice = ethers.utils.parseUnits(
      get(state, 'nft.price', '0.05').toString()
    )
    const nftMeta = {
      to: data.walletAddress,
      metadata: {
        name: get(state, 'nft.place.name', 'Place'),
        description: get(state, 'nft.place.text', null) || 'Place Description',
        image: get(state, 'nft.image_urls.original_url', 'ipfs://')
      },
      price: nftPrice,
      currencyAddress: NATIVE_TOKEN_ADDRESS, // ethers.constants.AddressZero
      mintStartTimeEpochSeconds: 0, // signature valid immediately
      mintEndTimeEpochSeconds: Math.floor(Date.now() / 1000) + 60 * 60 * 24 // 1 day
    }

    // Get return { payload, signature }
    return await module.generateSignature(nftMeta).catch(e => {
      console.error(e)
      return commit('SET_MINTING', false)
    })
  },

  // Expects data = { signer, payload, signature }
  async mintWithSignature({ commit }, data) {
    const sdk = new ThirdwebSDK(data.signer)
    const module = sdk.getNFTModule(process.env.moduleAddress)

    const tokenId = await module.mintWithSignature(data.payload, data.signature)
    commit('SET_TOKEN', tokenId)
    commit('SET_MINTING', false)
    return tokenId
  },

  async sendMintedTokenId({ state }, data) {
    if (!isNil(state.tokenId)) {
      const response = await this.$axios.$post(
        `${apiBase}/mintings/${data.uuid}`,
        {
          token_id: get(state, 'tokenId._hex', null),
          owner_address: data.walletAddress
        }
      )
      return response
    }
  },

  resetMinting({ commit }) {
    commit('SET_MINTING', false)
  },

  set({ commit }, data) {
    commit('SET', data)
  },

  setPlace({ commit }, data) {
    commit('SET_PLACE', data)
  },

  clear({ commit }) {
    commit('CLEAR')
  }
}

const mutations = {
  SET(state, data) {
    if (isNumber(data.expires_at) && isNumber(data.created_at)) {
      Vue.set(state, 'timer', data.expires_at - Math.floor(Date.now() / 1000))
    }
    Vue.set(state, 'nft', data)
  },

  SET_PLACE(state, data) {
    Vue.set(state, 'place', data)
  },

  SET_TOKEN(state, tokenId) {
    Vue.set(state, 'tokenId', tokenId)
  },

  SET_MINTING(state, minting) {
    Vue.set(state, 'minting', minting)
  },

  CLEAR(state) {
    Object.assign(state, defaultState())
  }
}

export default {
  namespaced: true,
  state,
  actions,
  getters,
  mutations
}
