import Head from 'next/head'
import styles from '../../styles/Home.module.css'
import React, { useState, useEffect } from "react";
import InputEns from '../../components/inputEns';
import LoginCard from '../../components/communitySpace/LoginCard';
import { useRouter } from 'next/router';
import CommunityInviteCard from '../../components/invite/CommunityInviteCard';
import { SummaryCardData } from '../admin/[oid]';
import { domainData } from '../../lib/ensdata';
import MintRules from '../../components/communitySpace/MintRules';
import { Input, InputNumber, message, Space } from "antd";
import { Modal, Card, Heading, Button, Textarea } from '@ensdomains/thorin'
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
    ensResolverAbi,
    ensResolverAbiGoerli,
    ensResolver,
    ensResolverGoerli,
} from '../../lib/constants';
import { toast } from "react-toastify";
import namehash from "@ensdomains/eth-ens-namehash";
import { ethers } from 'ethers';
import { Typography } from "@ensdomains/thorin";
import CopyShare from "../../utils/CopyShare";
import { CheckCircleSVG } from "@ensdomains/thorin";
import Container from '../../components/Container';

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
    const [description, setDescription] = useState("")
    const [mintSuccessAndShare, setMintSuccessAndShare] = useState(false);
    const { address } = useAccount();

    // burnCanUnwrap.isSuccess
    const { config } = usePrepareContractWrite({
        address: M3mberRegistrarAddrGoerli,
        abi: M3mberRegistrarAbiGoerli,
        functionName: 'setupDomain',
        args: [
            namehash.hash(oid), // node
            ethers.utils.parseEther(fee)
        ],
        overrides: {
            //gasLimit: '300000',
        },
    })

    const setupDomain = useContractWrite(config)
    const setupDomainTransacation = useWaitForTransaction({
        hash: setupDomain.data?.hash,
    })

    // const setM3mbershipDescriptionConfig = usePrepareContractWrite({
    //     address: ensResolverGoerli,
    //     abi: ensResolverAbiGoerli,
    //     functionName: 'setText',
    //     args: [
    //         namehash.hash(oid), // node
    //         "M3mber Description",
    //         description,
    //     ],
    //     overrides: {
    //         //gasLimit: '300000',
    //     },
    // })


    // const setM3mbershipDescription = useContractWrite(setM3mbershipDescriptionConfig.config);
    // const setM3mbershipDescriptionTransaction = useWaitForTransaction({
    //     hash: setM3mbershipDescription.data?.hash,
    // })

    useEffect(() => {
        if (setupDomainTransacation.isSuccess) {
            toast.success("setup successfully")
            setSubmitLoading(false);
            router.push("/admin/" + oid)
            // setMintSuccessAndShare(true);
            // setSubmitLoading(false);
        }
    }, [setupDomainTransacation.isSuccess]) // setupDomainTransaction.isLoading

    // useEffect(() => {
    //     if (setM3mbershipDescriptionTransaction.isSuccess) {
    //         toast.success("M3mbership Rule Created Successfully: " + oid)
    //         router.push("/admin/" + oid)
    //     }
    // }, [setM3mbershipDescriptionTransaction.isSuccess])


    // const handleCreate = () => {
    //     if (setupDomain.isSuccess) {
    //         setSubmitLoading(true);
    //         setM3mbershipDescription.write();
    //     } else {
    //         setSubmitLoading(true);
    //         setupDomain?.write({
    //             recklesslySetUnpreparedArgs: [
    //                 namehash.hash(oid), // node
    //                 ethers.utils.parseEther(fee) // fee (in wei)
    //             ]
    //         })
    //     }
    // }

    const handleCreate = () => {
        setSubmitLoading(true);
        setupDomain?.write({
            recklesslySetUnpreparedArgs: [
                namehash.hash(oid), // node
                ethers.utils.parseEther(fee) // fee (in wei)
            ]
        })
    }

    // const handleRuleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    //     setRule(e.target.value);
    // }
    // const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    //     setDescription(e.target.value);
    // }

    const handleFeeChange = (value: string) => {
        setFee(value);
    }

    return (
        <div className={styles.container} >
            <Head>
                <title>ORG3</title>
                <meta name="description" content="ORG3" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Container marginTop={true}>
                <div style={{ maxWidth: 816, height: 389, margin: "auto" }}>
                    <Heading style={{ fontSize: "28px", marginBottom: 24 }}>Set Up Mint Rule</Heading>
                    {/* <Card style={{ boxShadow: "0 8px 20px rgba(0,0,0,0.12)", padding: 50 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginBottom: "10px" }}>
                            <div style={{ flex: "1 1 auto" }}>
                                <p style={{ marginBottom: "10px", color: "#9B9BA5" }}>Subname of</p>
                                <Input value={oid} onChange={handleRuleChange} placeholder=""
                                    style={{ height: 50 }} />
                            </div>
                            <div style={{ flex: "1 1 auto", marginLeft: "10px" }}>
                                <p style={{ marginBottom: "10px", color: "#9B9BA5" }}>Fee</p>
                                <InputNumber
                                    size="large"
                                    stringMode
                                    className="fee-input"
                                    prefix={<img src="/eth.png" alt="etherem" style={{ height: 14, width: "100%" }} />}
                                    value={fee}
                                    onChange={handleFeeChange}
                                    min="0" defaultValue="0.05" step="0.01"
                                    style={{ height: 50 }} />
                            </div>
                            <div style={{ flex: "0 1 200px", marginLeft: "10px" }}>
                                <p style={{ marginBottom: "10px", color: "#9B9BA5" }}>Period</p>
                                <Input disabled value={"Monthly"} onChange={handleRuleChange}
                                    style={{ height: 50 }} />
                            </div>
                        </div>
                        <div>
                            <p style={{ color: "#9B9BA5" }}>Description</p>
                            <Textarea label="" value={description} onChange={handleDescriptionChange}
                                style={{ height: "200px" }}
                                maxLength={1000}
                                placeholder="Describe what benefit this membership will provide" />
                        </div>
                        <Button key="submit" loading={submitLoading} onClick={handleCreate}
                            style={{ width: "200px", marginTop: 20 }}>
                            {setupDomainTransacation.isSuccess ? "Set Record" : "Save"}
                        </Button>

                    </Card> */}
                    <Card style={{ boxShadow: "0 8px 20px rgba(0,0,0,0.12)", padding: 60 }}>
                        <div style={{ marginBottom: 12 }}>
                            <p style={{ marginBottom: 12, color: "#9B9BA5" }}>Subname type</p>
                            <Input disabled value={"Any new subname"} size="large"
                                style={{ height: 44 }} />
                        </div>
                        <div style={{ marginBottom: 44 }}>
                            <p style={{ marginBottom: 12, color: "#9B9BA5" }}>Fee</p>
                            <InputNumber
                                size="large"
                                stringMode
                                className="fee-input"
                                prefix={<img src="/eth.png" alt="etherem" style={{ height: 14, width: "100%" }} />}
                                value={fee}
                                onChange={handleFeeChange}
                                min="0" defaultValue="0.05" step="0.01"
                                style={{ height: 44 }}
                            />
                        </div>
                        <Button key="submit" loading={submitLoading} onClick={handleCreate}
                            style={{ minWidth: "200px" }}>
                            Save
                        </Button>

                    </Card>
                </div>
            </Container>
        </div>
    )
}
