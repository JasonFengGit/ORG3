import { Input } from '@nextui-org/react';
import { Button } from '@nextui-org/react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { findSubdomains } from '../utils/graph';
import { useAccount } from 'wagmi';
import LoginCard from './communitySpace/LoginCard';


function InputEns({...props}) {

  type SummaryCardData = {
    communityName: string;
    ensDomain: string;
    memberNum: number;
    avatarSrc: string;
}

const summaryCardData: SummaryCardData =
{
    communityName: "Flamingle Labs",
    ensDomain: "flamingle.eth",
    memberNum: 10,
    avatarSrc: "/img/comm_avatar_temp.png",
}

  const { setIsEns, setNickName } = props;
  const [ens, setEns] = useState("");
  
  const { address, connector, isConnected } = useAccount()


  const handleGo = async (event: any) => {
    event.preventDefault();
    let data = await findSubdomains(ens);
    console.log(ens);
    let intheOrganization = checkIfUnderDomain(data.data.domains[0]);
    console.log(address);
    // if (intheOrganization) {
      sessionStorage.setItem('isEns', ens);
      //setIsEns(true);
    // } else {
    //   toast.error("You are not in this organization! (Not own any of the subdomain/domain)");
    // }
  }

  const checkIfUnderDomain = (parentdomain: any) => {
    if (!parentdomain) {
      return false;
    }
    if (parentdomain.resolvedAddress && parentdomain.resolvedAddress.id.toLowerCase() == address.toLowerCase()) {
      //setNickName(parentdomain.name)
      return true;
    }
    if (!parentdomain.subdomains) {
      return false;
    }
    for (let i = 0; i < parentdomain.subdomains.length; ++i) {
      if (checkIfUnderDomain(parentdomain.subdomains[i])) {
        return true;
      }
    }
    return false;
  }

  function handleEnsChange(event: any) {
    setEns(event.target.value);
  }

  return (
    <form
      onSubmit={handleGo}
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "70vh",
        flexGrow: 0
      }}>

      <Input labelPlaceholder="Organization's ENS address" css={{ width: "300px" }} value={ens} onChange={handleEnsChange} />
      <Button type="submit" css={{ marginLeft: "10px" }}>
        Go
      </Button>

    </form>
  )
}

export default InputEns;
