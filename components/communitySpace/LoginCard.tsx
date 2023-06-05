import { Input } from '@ensdomains/thorin';
import { message, Typography } from 'antd';
import { Button } from '@ensdomains/thorin';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/router';
import { useContractRead } from 'wagmi';
import {
    namewrapperAddrGoerli,
    namewrapperAbiGoerli,
    M3mberRegistrarAddrGoerli,
    M3mberRegistrarAbiGoerli,
    ensBaseRegistrarAddr,
    ensBaseRegistrarAbi
} from '../../lib/constants';
import useCheckMobileScreen from '../../hooks/useCheckMobileScreen';
import namehash from "@ensdomains/eth-ens-namehash";
import { redirect } from 'next/dist/server/api-utils';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';

const { Title, Text } = Typography;

export default function LoginCard({ ...props }) {
    const router = useRouter()
    const { address, connector, isConnected } = useAccount()

    const [displayText, setDisplayText] = useState("Please Connect Wallet");
    const [displayText2, setDisplayText2] = useState("Please Connect Wallet");
    const [connected, setConneted] = useState(false);

    const [input, setInput] = useState("");
    const [inputTemp, setInputTemp] = useState("");
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        if (isConnected) {
            setDisplayText("Start your web3 membership ➡️")
            setDisplayText2("Check out my current membership")
            setConneted(true);
        }
        else {
            setDisplayText("Please Connect Wallet")
            setDisplayText2("Please Connect Wallet")
            setConneted(false);
        }

    }, [isConnected]);


    const isApprovedForAll = useContractRead({
        address: namewrapperAddrGoerli,
        abi: namewrapperAbiGoerli,
        functionName: 'isApprovedForAll',
        args: [
            address,
            M3mberRegistrarAddrGoerli,
        ]
    })
    //isApprovedForAll.refetch()
    const isApprovedForAllResult: boolean = isApprovedForAll.data as boolean;
    const isCanUnwrapBurnt = useContractRead({
        address: namewrapperAddrGoerli,
        abi: namewrapperAbiGoerli,
        functionName: 'allFusesBurned',
        args: [
            namehash.hash(input.toLowerCase() + ".eth"),
            1,
        ]
    })

    const { data: namesResult } = useContractRead({
        address: M3mberRegistrarAddrGoerli,
        abi: M3mberRegistrarAbiGoerli,
        functionName: 'names',
        args: [
            namehash.hash(input.toLowerCase() + ".eth"),
        ]
    })

    const { data: owner, refetch: ownerRefetch } = useContractRead({
        address: namewrapperAddrGoerli,
        abi: namewrapperAbiGoerli,
        functionName: 'ownerOf',
        args: [
            namehash.hash(input.toLowerCase().split(".")[0] + ".eth")
        ]
    })

    const ensTokenId = (label) => {
        const BigNumber = ethers.BigNumber
        const utils = ethers.utils
        const name = label
        const labelHash = utils.keccak256(utils.toUtf8Bytes(name))
        const tokenId = BigNumber.from(labelHash).toString()
        return tokenId;
    }

    const { data: owner2, refetch: owner2Refetch } = useContractRead({
        address: ensBaseRegistrarAddr,
        abi: ensBaseRegistrarAbi,
        functionName: 'ownerOf',
        args: [
            ensTokenId(input.toLowerCase().split(".")[0])
        ]
    })



    async function adminRedirect() {
        //check if the input is valid
        let domain = input.toLowerCase();
        if (domain.indexOf(".eth") !== -1) {
            domain = domain.replace(".eth", "");
        }
        if (domain.split('.').length > 1) {
            toast.warning("We are currently only support 2LD names");
            return;
        }

        setLoading(true);
        await ownerRefetch();
        await owner2Refetch();
        setLoading(false);
        const isOwner = owner == address || owner2 == address;
        if (!isOwner) {
            toast.error("You are not the owner of this ENS domain!");
        } else if (owner === "0x0000000000000000000000000000000000000000" || !isApprovedForAll.data) {
            //isOwner but not wrapped or not approved for all, go to setup
            router.push("/setup/" + domain.toLowerCase() + ".eth")
        } else {
            // isOwner && wrapped && approvedForall, directly go to admin
            router.push("/admin/" + domain.toLowerCase() + ".eth")
        }
    }

    return (
        <div
            style={{ width: 600, borderRadius: "20px" }}
        >
            <Title style={{ fontSize: 48, fontWeight: 700, color: "white", marginBottom: 20 }}>
                Manage Your <br />
                Organizational Identity <br />
            </Title>
            <Text style={{ fontSize: 20, fontWeight: 500, color: "white" }}>
                Type the domain name of your community to manage your membership today
            </Text>
            <div style={{
                width: "100%", backgroundColor: "white", borderRadius: 25, height: 200,
                padding: 15, margin: "25px 0"
            }}>
                <Text style={{ fontSize: 24, fontWeight: 500, display: "block" }}>
                    Host
                </Text>
                <Input
                    label=""
                    placeholder="Create or manage your domain here"
                    value={inputTemp}
                    onChange={(e) => {
                        try {
                            namehash.hash(e.target.value.toLowerCase() + "a.eth")
                            setInputTemp(e.target.value)
                            try {
                                namehash.hash(e.target.value.toLowerCase() + ".eth")
                                setInput(e.target.value)
                            }
                            catch {

                            }
                        }
                        catch {

                        }
                    }}
                    onBlur={(e) => {
                        try {
                            namehash.hash(e.target.value.toLowerCase() + ".eth")
                            setInput(e.target.value)
                            setInputTemp(e.target.value)
                        }
                        catch {
                            setInputTemp("")
                            setInput("")
                            toast.error("invalid domain")
                        }
                    }}
                    suffix=".eth"
                    size="large"
                    className='host-input'
                />
                <Button onClick={() => { adminRedirect(); }}
                    disabled={!connected || !input || input.length == 0}
                    style={{ borderRadius: 30, marginTop: 10 }}
                    colorStyle="blueGradient"
                    loading={loading}>
                    {displayText}
                </Button>

            </div>
            <div style={{
                width: "100%", backgroundColor: "white", borderRadius: 25, height: 130,
                padding: 15, margin: "25px 0"
            }}>
                <Text style={{ fontSize: 24, fontWeight: 500, display: "block" }}>
                    Member
                </Text>
                <Button onClick={() => { router.push("/my/plans") }} disabled={!connected}
                    style={{ height: 50, borderRadius: 30, marginTop: 10 }}
                    colorStyle="accentGradient">
                    {displayText2}
                </Button>

            </div>


        </div>
    )
}