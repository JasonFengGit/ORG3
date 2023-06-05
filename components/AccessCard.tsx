import React, { useEffect, useState } from "react";
//TODO: change the card to antd later
import { Card } from "@ensdomains/thorin";
import { Button } from "antd";
import { useRouter } from 'next/router';
import bg from '../public/background2.jpg';
import {
    useAccount,
    useContractRead,
    useContractWrite,
    usePrepareContractWrite,
    useWaitForTransaction,
    goerli
} from 'wagmi';
import {
    namewrapperAbiGoerli,
    namewrapperAddrGoerli,
    M3mberRegistrarAbiGoerli,
    M3mberRegistrarAddrGoerli,
} from '../lib/constants';

export default function AccessCard(props) {
    const { intervalId } = props;
    const [oid, setOid] = useState("");
    const router = useRouter();
    const { address } = useAccount();


    useEffect(() => {
        if (router.query.oid != undefined) {
            setOid(typeof (router.query.oid) == 'string' ? router.query.oid : router.query.oid[0]);
        }
    })

    //isApprovedForAll not working?
    const isApprovedForAll = useContractRead({
        address: namewrapperAddrGoerli,
        abi: namewrapperAbiGoerli,
        functionName: 'isApprovedForAll',
        args: [
            address,
            M3mberRegistrarAddrGoerli,
        ]
    })
    const isApprovedForAllResult: boolean = isApprovedForAll.data as boolean;

    const setApprovalForAllConfig = usePrepareContractWrite({
        address: namewrapperAddrGoerli,
        abi: namewrapperAbiGoerli,
        functionName: 'setApprovalForAll',
        args: [
            M3mberRegistrarAddrGoerli, // parentNode
            true, // label
        ],
        overrides: {
            //gasLimit: '300000',
        },
    })

    const setApprovalForAll = useContractWrite(setApprovalForAllConfig.config)
    const setApprovalForAllTransaction = useWaitForTransaction({
        hash: setApprovalForAll.data?.hash,
    })

    function handleApprove() {
        setApprovalForAll.write();
    }

    // console.log("setApprovalForAllTransaction", setApprovalForAllTransaction);
    // console.log("isApprovedForAll", isApprovedForAll);
    return (
        ((setApprovalForAllTransaction.isSuccess || isApprovedForAll.data)) ?
            // false ?
            <Card className="access-cards-complete"
                style={{ backgroundImage: `url(${bg.src})`, backgroundSize: "cover" }}>
                <div style={{
                    maxWidth: 450, width: "90%",
                    display: "flex",
                    flexFlow: "column",
                    justifyContent: "center"
                }}>
                    <img src="/check.png" alt="check" style={{ width: 75, height: 75, margin: "10px auto" }} />
                    <h2 style={{ fontSize: 30, textAlign: "center", margin: "10px 0" }}>Completed!</h2>

                    <p style={{
                        margin: "10px 0 50px 0",
                        fontSize: 16, textAlign: "center"
                    }}>
                        Congrats! You just approved this collection from your wallet!
                        <br />
                        Now feel free to check out how to set up mint rule.
                    </p>

                    <Button size="large" loading={setApprovalForAllTransaction.isLoading}
                        onClick={() => {
                            clearInterval(intervalId);
                            router.push(`/create/${oid}`);
                        }}
                        style={{ minWidth: 147, height: 48, margin: "auto auto 0 auto", color: "#4E86F7" }}
                    >
                        Set up mint rule
                    </Button>
                </div>
            </Card>
            :
            <Card className="access-cards">
                <div style={{
                    maxWidth: 450, width: "90%",
                    display: "flex",
                    flexFlow: "column",
                    justifyContent: "center"
                }}>
                    <img style={{ width: 70, height: 70, margin: "10px auto" }}
                        src="/metamask_logo.png" alt="Metamask logo" />
                    <h2 style={{ fontSize: 30, textAlign: "center", margin: "10px 0" }}>Grant ORG3 Contract Right</h2>

                    <p style={{ color: "#929292", margin: "10px 0 50px 0", fontSize: 16, textAlign: "center" }}>
                        You’ll be asked to approve this collection from your wallet.
                        <br />
                        You only need to approve each collection once.
                    </p>

                    <Button size="large" loading={setApprovalForAllTransaction.isLoading}
                        onClick={handleApprove}
                        type="primary"
                        style={{ minWidth: 147, height: 48, margin: "auto auto 0 auto" }}>
                        {setApprovalForAllTransaction.isLoading ? "Loading..." : "Sign"}
                    </Button>
                </div>
            </Card>
    );
}