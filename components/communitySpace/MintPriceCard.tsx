import { message, Space, Button } from "antd";
import Icon from "@ant-design/icons";
import { relative } from "path";
import { Typography, Card, Skeleton, Avatar, Tooltip } from 'antd';
const { Meta } = Card;
import { Tag } from "@ensdomains/thorin";
import { toast } from 'react-toastify';
import { useEffect, useState } from "react";
const { Title, Text } = Typography;
import router from "next/router";
import {
    useAccount,
    useContractRead,
    useContractWrite,
    usePrepareContractWrite,
    useWaitForTransaction,
} from 'wagmi'
import {
    M3mberRegistrarAddrGoerli,
    M3mberRegistrarAbiGoerli,
    ensResolverGoerli,
} from '../../lib/constants';
import namehash from "@ensdomains/eth-ens-namehash";
import { ethers } from 'ethers';
// import { Button } from "@ensdomains/thorin";
import { EditOutlined } from '@ant-design/icons';

export default function CommunityTreasuryCard(props) {

    const {
        communityName,
        ensDomain,
        memberNum,
        avatarSrc,
        telegram,
        twitter,
        website,
        discord,
        fee
    } = props.data;

    const { data: data } = useContractRead({
        address: M3mberRegistrarAddrGoerli,
        abi: M3mberRegistrarAbiGoerli,
        functionName: 'names',
        args: [namehash.hash(ensDomain)]
    });

    const [messageApi, contextHolder] = message.useMessage();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        if (props.data.ensDomain) {
            setLoading(false);
        }
    }, [props.data])

    const withdrawConfig = usePrepareContractWrite({
        address: M3mberRegistrarAddrGoerli,
        abi: M3mberRegistrarAbiGoerli,
        functionName: 'withdraw',
        args: [
            namehash.hash(ensDomain), // node
        ],
        overrides: {
            //gasLimit: '300000'
        },
    })

    const withdraw = useContractWrite(withdrawConfig.config);
    const withdrawTransaction = useWaitForTransaction({
        hash: withdraw.data?.hash,
    })

    // const handleWithdraw = () => {

    //     withdraw.write();
    // }

    useEffect(() => {
        if (withdrawTransaction.isSuccess) {
            toast.success("Successfully withdraw!");
        }
    }, [withdrawTransaction.isSuccess])

    if (loading) {
        return (
            <Card style={{
                width: "100%", height: 150, borderRadius: "10px",
                backgroundColor: "white",
                marginTop: 25
            }} loading={true}>
            </Card>)
    }

    return (
        <div style={{
            width: "100%", borderRadius: 20,
            padding: 20, color: "#4E86F7",
            backgroundColor: "white",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            marginTop: 25,
            position: "relative"
        }}>
            <Space wrap>
                <Space 
                    direction="vertical"
                    style={{ display: "flex"}}
                >
                    <p style={{ lineHeight: "19px", marginLeft: 10, color: "black", fontWeight: "700", fontSize: "14px" }}>
                        Mint Price
                    </p>
                    <p style={{ marginLeft: 10, fontSize: "20px", fontWeight: "700", lineHeight: "27px"}}>{ethers.utils.formatEther(data ? data["registrationFee"] : 0)} ETH</p>
                </Space>
                <div
                    style={{
                        float: "right",
                        position: "absolute",
                        top: "24px",
                        right: "24px",
                    }}
                >
                    <Tooltip title="Edit">
                        <Button
                            loading={withdrawTransaction.isLoading}
                            type="primary"
                            style={{
                                width: 48,
                                height: 48,
                            }}
                            onClick={() => {router.push("/edit/" + ensDomain);}}
                            icon={<Icon component={() => (<img src="/icons/mint_price_edit.svg" />)}/>}
                        >
                        </Button>
                    </Tooltip>
                </div> 
            </Space>
        </div>
    )
}