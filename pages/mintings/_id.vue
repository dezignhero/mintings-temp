<template>
  <div class="flex justify-center min-h-screen flex-col md:py-12 p-6">
    <section class="section-nft">
      <div class="header">
        <img src="/logo/logo-nft.svg" />
        <div class="title">
          <span class="block text-lg text-white font-bold"
            >Superlocal Place NFT Minting</span
          >
          <span
            v-if="walletConnected"
            @click="disconnectWallet"
            class="block text-grey cursor-pointer"
            >{{ walletDetails }}</span
          >
        </div>
      </div>
      <div v-if="nft">
        <div class="image-wrap">
          <img :src="placeImage" class="block w-full" />
        </div>
        <div class="content">
          <div v-if="!mintSuccessful" class="heading">
            <div class="text-yellow text-lg">
              Mint Link Expires in: {{ mintExpiration }}
            </div>
            <div
              v-if="walletConnected && !mintSuccessful"
              class="text-lg text-grey"
            >
              {{ mintCost }}ETH; {{ nftAvailable }} of {{ nftTotal }} available
            </div>
          </div>
          <p class="text-white">{{ nftDescription }}</p>
        </div>
        <div v-if="mintSuccessful" class="actions">
          <div class="text-center text-grey text-sm mb-6">
            {{ buttonLabel }}
          </div>
          <ShareNetwork
            :title="shareMessage"
            :url="nftUrl"
            :media="placeImage"
            network="twitter"
            hashtags="superlocal"
          >
            <button :class="buttonColor" class="button text-center block">
              {{ buttonText }}
            </button>
          </ShareNetwork>
          <a class="button button-grey" href="https://www.superlocal.com"
            >Go back to Superlocal</a
          >
        </div>
        <div v-else class="actions">
          <div class="text-center text-blue text-sm mb-2">
            {{ buttonLabel }}
          </div>
          <button
            @click="buttonAction"
            :class="buttonColor"
            :disabled="minting"
            class="button text-center"
          >
            {{ buttonText }}
            <span v-if="minting" class="w-4 text-left">{{
              animatedEllipsis
            }}</span>
          </button>
          <div v-if="errorMsg" class="text-center text-red text-sm">
            {{ errorMsg }}
          </div>
        </div>
      </div>
      <div v-else class="spinner-wrap">
        <Spinner />
      </div>
    </section>
  </div>
</template>

<script>
import Spinner from '@/components/Spinner.vue'
import { mapGetters, mapActions } from 'vuex'
import { get, isNil } from 'lodash'
import WalletConnect from '@walletconnect/client'
import WalletConnectProvider from '@walletconnect/web3-provider'
import QRCodeModal from '@walletconnect/qrcode-modal'
import { ethers } from 'ethers'

class FlowState {
  static Connect = new FlowState('connect')
  static Mint = new FlowState('mint')
  static Insufficient = new FlowState('insufficient')
  static Locked = new FlowState('locked')
  static Done = new FlowState('done')

  constructor(name) {
    this.name = name
  }
}

export default {
  layout: 'empty',
  components: {
    Spinner
  },
  data() {
    return {
      timerCount: null,
      tokenName: '$LOCAL',
      flowState: FlowState.Connect.name,
      wcConnector: null,
      wcAccounts: null,
      errorMsg: null
    }
  },
  computed: {
    placeSlug() {
      return get(this.$route, 'params.id', null)
    },
    placeName() {
      return get(this.place, 'name', null)
    },
    placeImage() {
      return get(this.nft, 'image_urls.original_url', null)
    },
    mintSuccessful() {
      return this.flowState === FlowState.Done.name
    },
    walletConnected() {
      return get(this.wcConnector, 'connected', false)
    },
    walletAsset() {
      return get(this.assets, '0', null)
    },
    walletSymbol() {
      return get(this.walletAsset, 'symbol', 'ETH')
    },
    walletBalance() {
      const balance = get(this.walletAsset, 'balance', null)
      return isNil(balance)
        ? null
        : balance / Math.pow(10, get(this.walletAsset, 'decimals', 0))
    },
    walletBalanceText() {
      return isNil(this.walletBalance) ? '--' : this.walletBalance.toFixed(3)
    },
    walletAddress() {
      return get(this.wcAccounts, '0', null)
    },
    walletAddressTrimmed() {
      const addressLen = this.walletAddress.length
      if (addressLen > 20) {
        return `${this.walletAddress.substring(
          0,
          10
        )}...${this.walletAddress.substring(addressLen - 5, addressLen - 1)}`
      }
      return this.walletAddress
    },
    walletDetails() {
      return `${this.walletBalanceText} ${this.walletSymbol}\n${this.walletAddressTrimmed}`
    },
    nftDescription() {
      if (this.mintSuccessful) {
        return `You successfully became the Mayor of ${this.placeName} by minting it as an NFT!`
      }
      return `As the only Mayor of the ${this.placeName}, you will receive ${this.tokenName} tokens from the Superlocal treasury when other people make approved checkins from here. Passive token earnings!`
    },
    nftAvailability() {
      return `${this.nftAvailable} of ${this.nftTotal} available`
    },
    nftAvailable() {
      return get(this.nft, 'available', 1)
    },
    nftUrl() {
      return process.env.appUrl // [TODO] get from successful mint object
    },
    nftTotal() {
      return get(this.nft, 'total', 1)
    },
    mintCost() {
      return get(this.nft, 'price', 0.05)
    },
    mintExpiration() {
      if (this.timerCount === null) {
        return '--'
      }

      if (this.timerCount > 0) {
        return `${Math.floor(this.timerCount / 60)} minutes ${Math.floor(
          this.timerCount % 60
        )} seconds`
      } else {
        return 'Expired'
      }
    },
    buttonLabel() {
      if (this.mintSuccessful) {
        return `Let everyone know that they should post from here so you earn more ${this.tokenName} tokens:`
      }
      return `NFT holders will receive a ${this.tokenName} airdrop in the future.`
    },
    buttonColor() {
      switch (this.flowState) {
        case FlowState.Mint.name:
          return 'button-green'
        case FlowState.Insufficient.name:
          return 'button-grey'
        case FlowState.Locked.name:
          return 'button-red'
        default:
          return 'button-blue'
      }
    },
    buttonText() {
      switch (this.flowState) {
        case FlowState.Connect.name:
          return 'Connect your wallet'
        case FlowState.Mint.name:
          return this.minting ? 'Minting' : 'Mint Now'
        case FlowState.Insufficient.name:
          return 'You have insufficient ETH to mint'
        case FlowState.Locked.name:
          return 'Someone else started the mint process.  Keep refreshing to see if they dropped off and you can mint it...'
        case FlowState.Done.name:
          return 'Share Mayorship on Twitter'
        default:
          return 'Proceed'
      }
    },
    shareMessage() {
      return `I just minted the Mayorship NFT at ${this.placeName}.`
    },
    animatedEllipsis() {
      switch (this.timerCount % 4) {
        case 1:
          return '...'
        case 2:
          return '..'
        case 3:
          return '.'
        default:
          return ''
      }
    },
    ...mapGetters({
      nft: 'nft/get',
      place: 'nft/getPlace',
      timerStart: 'nft/getTimer',
      minting: 'nft/getMinting',
      assets: 'wallet/getAssets'
    })
  },
  watch: {
    timerCount: {
      handler(value) {
        if (value > 0) {
          setTimeout(() => {
            this.timerCount--
          }, 1000)
        }
      },
      immediate: true
    }
  },
  // [TODO] Not working on yarn build
  async fetch({ store, route }) {
    await store.dispatch('nft/fetch', {
      uuid: route.params.id
    })
  },
  beforeMount() {
    this.timerCount = this.timerStart
    // this.fetch({ uuid: this.$route.params.id })
  },
  methods: {
    connectWallet() {
      // Create a connector
      this.wcConnector = new WalletConnect({
        bridge: process.env.wcBridge,
        qrcodeModal: QRCodeModal
      })

      if (!this.wcConnector.connected) {
        // create new session
        this.wcConnector.createSession()
      } else {
        this.setAccounts(this.wcConnector.accounts, this.wcConnector.chainId)
      }

      // Subscribe to connection events
      this.wcConnector.on('connect', (error, payload) => {
        if (error) {
          throw error
        }

        // Get provided accounts and chainId
        const { accounts, chainId } = payload.params[0]
        this.setAccounts(accounts, chainId)
      })

      this.wcConnector.on('session_update', (error, payload) => {
        if (error) {
          throw error
        }
        // Get updated accounts and chainId
        const { accounts, chainId } = payload.params[0]
        this.setAccounts(accounts, chainId)
      })

      this.wcConnector.on('disconnect', (error, payload) => {
        if (error) {
          throw error
        }

        // Delete connector
        this.wcConnector = null

        // Reset Flow State
        this.setFlowState(FlowState.Connect.name)
      })
    },
    disconnectWallet() {
      if (this.walletConnected) {
        this.wcConnector.killSession()
      }
    },
    setFlowState(stateName) {
      this.flowState = stateName
    },
    setErrorMsg(text) {
      this.errorMsg = text
    },
    async mintNft() {
      // Reset Errors
      this.setErrorMsg(null)
      if (!isNil(this.walletAddress)) {
        // Metamask Provider (Working on Desktop)
        // if (typeof window.ethereum === 'undefined') {
        //   this.setErrorMsg('Ethereum instance not found')
        //   return this.resetMinting()
        // }
        // await window.ethereum.request({
        //   method: 'eth_requestAccounts'
        // })
        // const providerSource = window.ethereum

        // WalletConnect Provider
        const providerSource = new WalletConnectProvider({
          infuraId: process.env.infuraId,
          qrcode: true
          // rpc: {
          //   4: process.env.provider
          // }
        })
        await providerSource.enable()

        // Get Provider/Signer
        const provider = new ethers.providers.Web3Provider(providerSource)
        const signer = provider.getSigner()

        // Get payload and signature
        let payload, signature
        try {
          ;({ payload, signature } = await this.generatePayloadSignature({
            walletAddress: this.walletAddress
          }))
        } catch (e) {
          this.resetMinting()
          return
        }

        // Mint with generated signature
        this.mintWithSignature({
          signer,
          payload,
          signature
        })
          .then(() => {
            this.sendToken({
              uuid: this.$route.params.id,
              walletAddress: this.walletAddress
            })
            this.flowState = FlowState.Done.name
          })
          .catch(e => {
            console.error(e)
            this.resetMinting()
          })
      }
    },
    setAccounts(accounts, chainId) {
      if (accounts.length > 0) {
        this.wcAccounts = accounts
        this.fetchAssets({
          address: accounts[0],
          chainId
        })
        this.checkFunds()
      }
    },
    buttonAction() {
      switch (this.flowState) {
        case FlowState.Connect.name:
          return this.connectWallet()
        case FlowState.Mint.name:
          return this.mintNft()
        case FlowState.Insufficient.name:
          return this.checkFunds()
      }
    },
    checkFunds() {
      if (this.walletBalance < this.mintCost) {
        this.setFlowState(FlowState.Insufficient.name)
      } else {
        this.setFlowState(FlowState.Mint.name)
      }
    },
    ...mapActions({
      fetch: 'nft/fetch',
      generatePayloadSignature: 'nft/generatePayloadSignature',
      mintWithSignature: 'nft/mintWithSignature',
      resetMinting: 'nft/resetMinting',
      sendToken: 'nft/sendMintedTokenId',
      fetchAssets: 'wallet/fetchAssets'
    })
  }
}
</script>

<style scoped>
.logo {
  @apply block text-center mx-auto mb-6;
}

.section-nft {
  .actions {
    .button {
      @apply flex items-center justify-center w-full mb-4;
    }

    a.button {
      @apply flex text-center text-white;
    }
  }

  .header {
    @apply flex items-center justify-between mb-4;

    .title {
      @apply flex flex-col flex-1 items-end text-right;
    }
  }

  .image-wrap {
    @apply w-full mx-auto rounded-lg bg-black mb-4;
    min-height: 240px;
  }

  .content {
    @apply mb-4;

    .heading {
      @apply mb-2;
    }
  }
}

@screen md {
  section {
    @apply mx-auto w-full;
    max-width: 360px;
  }
}
</style>
