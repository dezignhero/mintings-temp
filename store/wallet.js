import Vue from 'vue'
import { get } from 'lodash'

const baseUrl = 'https://ethereum-api.xyz'

const defaultState = () => ({
  status: null,
  assets: null,
  transactions: null,
  nonce: null,
  gasPrices: null
})

const state = defaultState

const getters = {
  getStatus(state) {
    return state.status
  },

  getAssets(state) {
    return state.assets
  },

  getTransactions(state) {
    return state.transactions
  },

  getNonce(state) {
    return state.nonce
  },

  getGasPrices(state) {
    return state.gasPrices
  }
}

const actions = {
  async fetchAssets({ dispatch, commit, state }, data) {
    // Prevent simultaneous calls
    if (!get(state, 'fetching', false)) {
      commit('FETCHING', true)
      const response = await this.$axios.$get(
        `${baseUrl}/account-assets?address=${data.address}&chainId=${data.chainId}`
      )
      dispatch('setAssets', response.result)
      return response
    }
    return null
  },

  async fetchTransactions({ dispatch, commit, state }, data) {
    if (!get(state, 'fetching', false)) {
      commit('FETCHING', true)
      const response = await this.$axios.$get(
        `${baseUrl}/account-transactions?address=${data.address}&chainId=${data.chainId}`
      )
      dispatch('setTransactions', response.result)
      return response
    }
    return null
  },

  async fetchAccountNonce({ dispatch, commit, state }, data) {
    if (!get(state, 'fetching', false)) {
      commit('FETCHING', true)
      const response = await this.$axios.$get(
        `${baseUrl}/account-nonce?address=${data.address}&chainId=${data.chainId}`
      )
      dispatch('setNonce', response.result)
      return response
    }
    return null
  },

  async fetchGasPrices({ dispatch, commit, state }) {
    if (!get(state, 'fetching', false)) {
      commit('FETCHING', true)
      const response = await this.$axios.$get(`${baseUrl}/gas-prices`)
      dispatch('setGasPrices', response.result)
      return response
    }
    return null
  },

  setAssets({ commit }, assets) {
    commit('SET_ASSETS', assets)
  },

  setTransactions({ commit }, transactions) {
    commit('SET_TRANSACTIONS', transactions)
  },

  setNonce({ commit }, nonce) {
    commit('SET_NONCE', nonce)
  },

  setGasPrices({ commit }, prices) {
    commit('SET_GASPRICES', prices)
  },

  clear({ commit }) {
    commit('CLEAR')
  }
}

const mutations = {
  SET_ASSETS(state, assets) {
    Vue.set(state, 'fetching', false)
    Vue.set(state, 'assets', assets)
  },

  SET_TRANSACTIONS(state, transactions) {
    Vue.set(state, 'fetching', false)
    Vue.set(state, 'transactions', transactions)
  },

  SET_NONCE(state, nonce) {
    Vue.set(state, 'fetching', false)
    Vue.set(state, 'nonce', nonce)
  },

  SET_GASPRICES(state, gasPrices) {
    Vue.set(state, 'fetching', false)
    Vue.set(state, 'gasPrices', gasPrices)
  },

  FETCHING(state, fetching) {
    Vue.set(state, 'fetching', fetching)
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
