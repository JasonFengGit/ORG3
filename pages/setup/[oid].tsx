import Head from 'next/head'
import styles from '../../styles/Home.module.css'
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import { Modal, Card } from '@ensdomains/thorin';
import { Heading, Button } from '@ensdomains/thorin'
import {
    useAccount,
    useContractRead,
    useContractWrite,
    usePrepareContractWrite,
    useWaitForTransaction,
    goerli
} from 'wagmi'
import {
    namewrapperAbiGoerli,
    namewrapperAddrGoerli,
    M3mberRegistrarAbiGoerli,
    M3mberRegistrarAddrGoerli,
} from '../../lib/constants';
import { toast } from "react-toastify";
import namehash from "@ensdomains/eth-ens-namehash";
import { ethers } from 'ethers';
import AccessCard from '../../components/AccessCard';
import UpgradeCard from '../../components/UpgradeCard';
import Container from '../../components/Container';
import Footer from '../../components/footer';

export default function Home() {
    const [oid, setOid] = useState("");
    const router = useRouter();
    useEffect(() => {
        if (router.query.oid != undefined) {
            setOid(typeof (router.query.oid) == 'string' ? router.query.oid : router.query.oid[0]);
        }
    })

    const [submitLoading, setSubmitLoading] = useState(false);
    const [stopLoading, setStopLoading] = useState(false);
    const [rule, setRule] = useState("");
    const [fee, setFee] = useState("0.05");
    const [mintSuccessAndShare, setMintSuccessAndShare] = useState(false);
    const [wrapped, setWrapped] = useState(false);
    const [intervalId, setIntervalId] = useState(null);
    const { address } = useAccount();

    const wrappedOwner = useContractRead({
        address: namewrapperAddrGoerli,
        abi: namewrapperAbiGoerli,
        functionName: 'ownerOf',
        args: [
            namehash.hash(oid)
        ]
    })
    // console.log("wrappedOwner", wrappedOwner)

    //moved inside
    // const isApprovedForAll = useContractRead({
    //     address: namewrapperAddrGoerli,
    //     abi: namewrapperAbiGoerli,
    //     functionName: 'isApprovedForAll',
    //     args: [
    //         address,
    //         M3mberRegistrarAddrGoerli,
    //     ]
    // })
    // const isApprovedForAllResult: boolean = isApprovedForAll.data as boolean;
    // const isCanUnwrapBurnt = useContractRead({
    //     address: namewrapperAddrGoerli,
    //     abi: namewrapperAbiGoerli,
    //     functionName: 'allFusesBurned',
    //     args: [
    //         namehash.hash(oid),
    //         1,
    //     ]
    // })
    // console.log(isCanUnwrapBurnt);
    // const wrapETH2LDConfig = usePrepareContractWrite({
    //     address: namewrapperAddrGoerli,
    //     abi: namewrapperAbiGoerli,
    //     functionName: 'wrapETH2LD',
    //     args: [
    //         M3mberRegistrarAddrGoerli, // parentNode
    //         true, // label
    //     ],
    //     overrides: {
    //         //gasLimit: '300000',
    //     },
    // })

    // const wrapETH2LD = useContractWrite(wrapETH2LDConfig.config)
    // useWaitForTransaction({
    //     hash: wrapETH2LD.data?.hash,
    // })

    //moved inside
    // const setApprovalForAllConfig = usePrepareContractWrite({
    //     address: namewrapperAddrGoerli,
    //     abi: namewrapperAbiGoerli,
    //     functionName: 'setApprovalForAll',
    //     args: [
    //         M3mberRegistrarAddrGoerli, // parentNode
    //         true, // label
    //     ],
    //     overrides: {
    //         //gasLimit: '300000',
    //     },
    // })

    // const setApprovalForAll = useContractWrite(setApprovalForAllConfig.config)
    // const setApprovalForAllTransaction = useWaitForTransaction({
    //     hash: setApprovalForAll.data?.hash,
    // })

    // const burnCanUnwrapConfig = usePrepareContractWrite({
    //     address: namewrapperAddrGoerli,
    //     abi: namewrapperAbiGoerli,
    //     functionName: 'setFuses',
    //     args: [
    //         namehash.hash(oid), // parentNode
    //         1, // CANNOT_UNWRAP
    //     ],
    //     overrides: {
    //         //gasLimit: '300000',
    //     },
    // })
    // const burnCanUnwrap = useContractWrite(burnCanUnwrapConfig.config)
    // useWaitForTransaction({
    //     hash: burnCanUnwrap.data?.hash,
    // })


    // useEffect(() => {
    //     if (burnCanUnwrap.isSuccess) {
    //         toast.success("Successfully burn CAN_UNWRAP!")
    //     }
    //     else if (burnCanUnwrap.isSuccess === false) {
    //     }
    // }, [burnCanUnwrap.isSuccess])

    // async function checkForWrapped() {
    //     const intervalFn = async () => {
    //         // if (!wrappedOwner) {
    //         //     setTimeout(intervalFn, 2000);
    //         // } else 
    //         if (wrappedOwner.data === "0x0000000000000000000000000000000000000000") {
    //             //recheck
    //             console.log("refetch!")
    //             await wrappedOwner.refetch();
    //             if (wrappedOwner.data === "0x0000000000000000000000000000000000000000") {
    //                 setTimeout(intervalFn, 2000);
    //             }
    //         } else {
    //             console.log("wrappedOwner.data has a valid value. Stopping the loop.");
    //         }
    //     };
    //     intervalFn();
    // }

    async function checkForWrapped() {
        //TODO
        const id = setInterval(async () => {
            if (wrappedOwner.data === "0x0000000000000000000000000000000000000000") {
                //recheck
                console.log("refetch!");
                wrappedOwner.refetch();
            } else {
                console.log("wrappedOwner.data has a valid value. Stopping the loop.");
                clearInterval(intervalId);
            }
        }, 2000)
        setIntervalId(id);
    }



    return (
        <div className={styles.container} style={{ overflow: "hidden" }
        }>
            <Head>
                <title>ORG3 </title>
                <meta name="description" content="ORG3" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Container marginTop={true}>
                <div style={{ width: "100%", maxWidth: "800px", margin: "auto" }}>
                    <Heading style={{ fontSize: "28px" }}>{
                        wrappedOwner.data && wrappedOwner.data !== "0x0000000000000000000000000000000000000000" ?
                            "Grant Access" : "Upgrade to namewrapper"}</Heading>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginTop: 24 }}>
                    {//for now
                        wrappedOwner.data && wrappedOwner.data !== "0x0000000000000000000000000000000000000000" ?
                            <AccessCard intervalId={intervalId} /> : <UpgradeCard checkForWrapped={checkForWrapped} />}
                </div>
            </Container>
        </div>
    )
}
