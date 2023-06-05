// import { Button} from "antd";
import { RightOutlined } from "@ant-design/icons";
import { relative } from "path";
import { Select, Typography } from 'antd';
import { toast } from 'react-toastify';
import { Button, Checkbox } from '@nextui-org/react';
import { Input } from "@ensdomains/thorin";
import { useRouter } from "next/router";
import { EthIcon } from "../EthIcon";
import { Fragment, useState } from 'react';
import { provider } from '../../lib/ensdata';

import {
    useAccount,
    useContractRead,
    useContractWrite,
    usePrepareContractWrite,
    useWaitForTransaction,
    goerli
} from 'wagmi'
import {
    M3mberRegistrarAddrGoerli,
    M3mberRegistrarAbiGoerli,
    ensResolverGoerli,
    ensResolverAbi
} from '../../lib/constants';
import namehash from "@ensdomains/eth-ens-namehash";
import { useEffect } from "react";
import { ethers } from 'ethers';
import { addRequestMeta } from "next/dist/server/request-meta";
import useCheckMobileScreen from "../../hooks/useCheckMobileScreen";
const { Title, Text } = Typography;

export default function CommunityInviteCard({ ...props }) {
    const router = useRouter();
    const [input, setInput] = useState("");
    const [addrResolve, setAddrResolve] = useState(true)
    const { address, connector, isConnected } = useAccount()
    const [duration, setDuration] = useState(1);
    const [description, setDescription] = useState("Loading...");
    const { communityName,
        ensDomain,
        memberNum,
        avatarSrc,
        telegram,
        twitter,
        website,
        discord,
    } = props.data;
    const { data: data } = useContractRead({
        address: M3mberRegistrarAddrGoerli,
        abi: M3mberRegistrarAbiGoerli,
        functionName: 'names',
        args: [namehash.hash(ensDomain)]
    });
    console.log(namehash.hash(ensDomain), data)

    let resolver = new ethers.utils.Interface(ensResolverAbi);

    const { config } = usePrepareContractWrite({
        address: M3mberRegistrarAddrGoerli,
        abi: M3mberRegistrarAbiGoerli,
        functionName: 'register',
        args: [
            namehash.hash(ensDomain), // parentNode
            input, // label
            address, // newOwner --> just the owner
            ensResolverGoerli, // resolver
            0, // fuses
            duration,
            addrResolve && address ?
                [resolver.encodeFunctionData("setAddr(bytes32,address)", [namehash.hash(input + "." + ensDomain), address]), resolver.encodeFunctionData("setText(bytes32,string,string)", [namehash.hash(input + "." + ensDomain), "ORG3", "TRUE"])]
                : [], // records
        ],
        overrides: {
            ////gasLimit: '300000',
            value: data ? data["registrationFee"].mul(duration) : 0
        },
    })

    const registerSubname = useContractWrite(config)
    // if(regitserSubname.isSuccess)
    // Wait for the transaction to be mined
    const registerSubnameTransaction = useWaitForTransaction({
        hash: registerSubname.data?.hash,
    })
    console.log(registerSubname.error)


    function checkAvailability(label) {

    }

    const handleChange = (event) => {
        setAddrResolve(event);
    };


    const setAddrconfig = usePrepareContractWrite({
        address: ensResolverGoerli,
        abi: ensResolverAbi,
        functionName: 'setAddr',
        args: [
            namehash.hash(input + "." + ensDomain),
            address, // newOwner

        ],
        overrides: {
            //gasLimit: '300000'
        },
    })

    useEffect(() => {
        if (typeof registerSubnameTransaction.isSuccess === undefined) { return; }
        if (registerSubnameTransaction.isSuccess) {
            toast.success("Successfully mint subname")
            toast.success("Transaction: " + JSON.stringify(registerSubname.data));
            setTimeout(() => {
                router.push("/my/plans");
            }, 10000);

        } else {
        }
    }, [registerSubnameTransaction.isSuccess])

    useEffect(() => {
        const fetchData = async () => {
            let originalDescription = await (await provider.getResolver(ensDomain)).getText("M3mber Description");
            setDescription(originalDescription);
        }
        fetchData()
            // make sure to catch any error
            .catch(console.error);
    }, [ensDomain])
    const handleDurationChange = (value) => {
        setDuration(value);
    };

    return (
        <div
            style={{
                width: 604, overflow: "hidden", borderRadius: "10px", backgroundColor: "white",
                position: "sticky", top: "30px"
            }}
        >

            <div style={{ width: "100%", padding: 50 }}>
                <div style={{ display: "flex", marginBottom: 30 }}>
                    <svg style={{ width: 100, height: 100 }}
                        xmlns="http://www.w3.org/2000/svg" width="79" height="79" viewBox="0 0 79 79" fill="none">
                        <g clipPath="url(#clip0_31_2087)">
                            <path d="M39.467 6.58333C21.297 6.58333 6.55029 21.33 6.55029 39.5C6.55029 57.67 21.297 72.4167 39.467 72.4167C57.637 72.4167 72.3836 57.67 72.3836 39.5C72.3836 21.33 57.637 6.58333 39.467 6.58333ZM51.3499 27.4525C54.872 27.4525 57.7028 30.2833 57.7028 33.8054C57.7028 37.3275 54.872 40.1583 51.3499 40.1583C47.8278 40.1583 44.997 37.3275 44.997 33.8054C44.964 30.2833 47.8278 27.4525 51.3499 27.4525ZM31.5999 22.2517C35.879 22.2517 39.3682 25.7408 39.3682 30.02C39.3682 34.2992 35.879 37.7883 31.5999 37.7883C27.3207 37.7883 23.8315 34.2992 23.8315 30.02C23.8315 25.7079 27.2878 22.2517 31.5999 22.2517ZM31.5999 52.3046V64.6483C23.6999 62.1796 17.4457 56.09 14.6807 48.3217C18.137 44.635 26.7611 42.7587 31.5999 42.7587C33.3445 42.7587 35.5499 43.0221 37.854 43.4829C32.4557 46.3467 31.5999 50.1321 31.5999 52.3046ZM39.467 65.8333C38.5782 65.8333 37.7224 65.8004 36.8665 65.7017V52.3046C36.8665 47.6304 46.544 45.2933 51.3499 45.2933C54.872 45.2933 60.9615 46.5771 63.9899 49.0787C60.1386 58.855 50.6257 65.8333 39.467 65.8333Z" fill="#5686E1" />
                        </g>
                        <defs>
                            <clipPath id="clip0_31_2087">
                                <rect width="79" height="79" fill="white" />
                            </clipPath>
                        </defs>
                    </svg>
                    <div style={{
                        width: "100%", marginLeft: 20,
                        display: "flex", flexDirection: "column", alignItems: "left"
                    }}>
                        <Text strong style={{ margin: "1px 0", fontSize: 32 }}>{"Become a member of"}</Text>
                        <Text strong style={{ marginTop: "-10px", fontSize: 32 }}>{ensDomain}</Text>
                    </div>
                </div>

                <Text strong style={{
                    marginLeft: 10, fontSize: 16, marginBottom: 30, display: "block",
                    marginRight: "20px"
                }}>{description}</Text>



                <div style={{
                    justifyContent: 'space-between',
                    width: "100%"
                }}>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        borderRadius: '12px',
                        background: '#f5f5f5',
                        justifyContent: 'space-between',
                        width: 500,
                        marginBottom: "20px"
                    }}>
                        <div style={{ marginRight: '16px', marginLeft: "16px", fontWeight: "500" }}>{ensDomain} - Monthly</div>
                        <Select size="large" style={{ width: 106 }} value={duration} onChange={handleDurationChange}
                            options={[
                                { value: 1, label: '1 Month' },
                                { value: 2, label: '2 Months' },
                                { value: 3, label: '3 Months' },
                                { value: 4, label: '4 Months' },
                                { value: 5, label: '5 Months' },
                                { value: 6, label: '6 Months' },
                                { value: 7, label: '7 Months' },
                                { value: 8, label: '8 Months' },
                                { value: 9, label: '9 Months' },
                                { value: 10, label: '10 Months' },
                                { value: 11, label: '11 Months' },
                                { value: 12, label: '12 Months' },
                            ]}
                        >

                        </Select>
                    </div>
                    <Input
                        label=""
                        size="small"
                        suffix={"." + ensDomain}
                        placeholder=""
                        value={input}
                        onChange={(e) => {
                            try {
                                namehash.hash(e.target.value + "." + ensDomain)
                                setInput(e.target.value.toLowerCase());
                                checkAvailability(e.target.value);
                            }
                            catch {

                            }
                        }}
                    />

                    <Button.Group css={{ margin: "20px 0 0 0" }}>
                        <Button css={{ width: 400 }}
                            onClick={() => registerSubname.write?.({})} disabled={!isConnected || !input || input.length == 0 || !registerSubname.write || registerSubname.isLoading} color="primary"  >
                            {registerSubnameTransaction.isLoading ? 'Minting...' : "Claim"}
                        </Button>

                        <Button css={{ width: 100 }}
                            color="primary" disabled={!isConnected || !input || input.length == 0 || !registerSubname.write || registerSubname.isLoading} >

                            {ethers.utils.formatEther(data ? data["registrationFee"].mul(duration) : 0).toString() + " ETH"}
                        </Button>
                    </Button.Group>


                </div>

            </div>
        </div>
    )
}