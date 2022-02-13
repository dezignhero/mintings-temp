## Build Setup

`.env.dev` needs to be renamed to `.env` with values populated.

``` bash
# install dependencies
$ yarn install

# serve with hot reload at localhost:3000
$ yarn dev

# build for production and launch server
$ yarn build
$ yarn start
```

For detailed explanation on how things work, checkout [Nuxt.js docs](https://nuxtjs.org).


## NFT Minting

### User Flow
User lands on http://localhost:3000/mintings/9cf5a959-a7d8-40ae-aec6-9be4ba4e38b6

User connects their wallet by clicking *Connect your wallet* and is prompted with QR Modal from WalletConnect.

Once connected, minting becomes available and wallet data is loaded.

User begins minting process by clicking *Mint Now*

Thirdweb SDK instance initialized from contract module wallet/private key takes NFT metadata and generates a payload/signature.

`module.generateSignature` is called here.

Thirdweb SDK instance initialized from user wallet (e.g. Metamask) signer

User is prompted to approve minting transaction using payload/signature.

User approves transaction (the prompt to approve transaction via deeplink redirect is not working on mobile)

`module.mintWithSignature` is called here.

As an example, I would like this to work like example.walletconnect.org where approving a transaction triggers Metamask or connected wallet app to open on mobile phone.

### Files
`pages/mintings/_id.vue` - Renders minting page UI. URL will look like `/mintings/9cf5a959-a7d8-40ae-aec6-9be4ba4e38b6` where the slug is the UUID for API call. The file contains the entry point for connecting to wallet via WalletConnect and leverages API calls imported from the next file.

`store/nft.js` - Contains the Thirdweb SDK calls.
