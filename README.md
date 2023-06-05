# ORG3

## One-liner

ENS namewrapper (ERC-1155) & subname empowered membership protocol w/on-chain expiry.

## Problem we solve

- The one-time purchase nature of NFT/token leads to two main problems with membership: 1. High barrier of entry for the user as it’s expensive; 2. Lack of incentivization of the core team/community leaders to deliver consistent value as there are few recurring revenues
- There is no standardized on-chain membership with expiry yet

## Solution we buidl

- A platform where the community leads & service providers can build subname membership of domain name. Here are the main features:
    - To the admin: can set up membership rules, can create a mint link for others to mint (profitable with mint price), airdrop and even bulk airdrop memberships, and also a management panel to overview all subname memberships.
    - To the user: can mint membership, can overview all of their membership, can extend, transfer, sell their membership.
- An API (& SDK in the future) for DApp to build subname-gated interaction
    - API: [https://m3-mber-eth-denver.vercel.app/api/m3mber_verify](https://m3-mber-eth-denver.vercel.app/api/m3mber_verify)
    - Example: {address: “0xD9F8bf1F266E50Bb4dE528007f28c14bb7edaff7”, name:”parentname.eth”}

## Why ENS Namewrapper?

- It’s on-chain but with expiry!
- Wide adoption of ENS (2.6 million registered) w/ many DApp adoption leads to better interoperability of ENS Subname too
- Namewrapper allows parents to make rule-based expiry extension, and also makes subnames ownable and transferrable

## Reference

- **Youtube: [https://www.youtube.com/watch?v=I_polQxDzUQ](https://www.youtube.com/watch?v=I_polQxDzUQ) (Pls check it out as it goes deep and holistic about our idea, platform, and API!)**
- Demo: [https://m3mber-ethdenver.vercel.app/](https://m3mber-ethdenver.vercel.app/) (Note that the namewrapper contract is updated the night before submission, so if you newly mint name on [alpha.ens.domains](http://alpha.ens.domains) (using v5 of namewrapper), you may not be able to use the platform (using v4 of namewrapper). We did not upgrade the smart contract because ensgoerli’s subgraph is not updated yet, so there will be data missed if we update to v5).
- Mint a subname thru:
    - [https://m3mber-ethdenver.vercel.app/join/dop3.eth](https://m3mber-ethdenver.vercel.app/join/dop3.eth)
    - [https://m3mber-ethdenver.vercel.app/join/](https://m3mber-ethdenver.vercel.app/join/dop3.eth)degens.eth
    - [https://m3mber-ethdenver.vercel.app/join/](https://m3mber-ethdenver.vercel.app/join/dop3.eth)airports.eth
