import { Button, message, Space } from "antd";
import { relative } from "path";
import { Typography, Card, Skeleton, Avatar } from 'antd';
const { Meta } = Card;
import { toast } from 'react-toastify';
import { useEffect, useState } from "react";
const { Title, Text } = Typography;
import {
    useAccount,
    useContractRead,
    useContractWrite,
    useWaitForTransaction,
    goerli
} from 'wagmi'
import {
    M3mberRegistrarAddrGoerli,
    M3mberRegistrarAbiGoerli,
    ensResolverGoerli,
} from '../../lib/constants';
import namehash from "@ensdomains/eth-ens-namehash";
import { ethers } from 'ethers';

export default function CommunityStatCard(props) {

    
    return (
        <Card
            style={{
                width: 365, overflow: "hidden", borderRadius: "10px", backgroundColor: "white", marginBottom: "30px"
            }}
            className={"mint-rule-card"}
        >
            <div style={{ width: "100%", height: "auto", position: "relative" }}>
                <div style={{
                    width: "100%", display: "flex", flexDirection: "column"
                }}>
                    <div>
                        <Text style={{ fontSize: "24px", fontWeight: "700" }}>Membership Claimed </Text>
                    </div>

                    <div style={{marginTop: "20px"}}>
                        <div>
                            <Text style={{ fontSize: "16px", fontWeight: "500", color: "rgba(155, 155, 165, 1)" }}>0</Text>
                            
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    )
}