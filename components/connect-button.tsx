// import toast from 'react-hot-toast'
import { ToastContainer, toast } from 'react-toastify';

import { useDisconnect, useAccount } from 'wagmi'
import { Button, Profile } from '@ensdomains/thorin'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useEffect, useState } from 'react';
import { ethers, getDefaultProvider } from 'ethers'

export default function ConnectButtonWrapper({ setEditProfileLink, setProfileEditOpen }) {
  const { disconnect } = useDisconnect();
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const { address, connector, isConnected } = useAccount()
  const provider = new ethers.providers.InfuraProvider(
    process.env.NETWORK,
    process.env.INFURA_API_KEY
  );
  const copyToClipBoard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Copied to clipboard')
    } catch (err) {
      console.error('Failed to copy text: ', err)
      toast.error('Failed to copy to clipboard')
    }
  }

  const getOneNameAndAvatar = async (address) =>{
    let finalavatar = "";
    let finalname = "No name set";
    if (address) {
        try {
            // console.log()
            finalname = await provider.lookupAddress(address);
            finalavatar = await (await provider.getResolver(finalname)).getText("avatar");
        } catch (error) {
            console.log(error);
        }
    }
    
    setName(finalname);
    setAvatar(finalavatar);
  }

  useEffect(()=>{
    if(address){
      getOneNameAndAvatar(address)
    }
  }, [isConnected && address])

  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, mounted }) => {
        return !account || !mounted || !chain ? (
          <div>
            <Button onClick={() => openConnectModal()}>Connect Wallet</Button>
          </div>
        ) : chain.unsupported ? (
          <ConnectButton />
        ) : (
          <Profile
            size={'medium'}
            address={account.address}
            ensName={name}
            avatar={avatar}
            dropdownItems={[
              {
                label: `Balance: ${account.displayBalance}`,
                disabled: true,
              },
              {
                label: 'Copy Address',
                onClick: async () => {
                  await copyToClipBoard(account.address)
                },
              },
              {
                label: 'Edit Profile',
                onClick: () => {
                  account.ensName == undefined ?
                    setEditProfileLink("https://alpha.ens.domains/my/names")
                    :
                    setEditProfileLink("https://alpha.ens.domains/" + account.ensName);
                  setProfileEditOpen(true);
                },
              },
              {
                label: 'Disconnect',
                color: 'red',
                onClick: () => disconnect(),
              },
            ]}
          />
        )
      }}
    </ConnectButton.Custom>
  )
}
