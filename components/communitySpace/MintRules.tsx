import { Input, InputNumber, message, Space } from "antd";
import { Modal, Card } from '@ensdomains/thorin';
import { Button } from '@ensdomains/thorin'
import { useEffect, useState } from "react";
import React from "react";
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
import CustomModal from "../CustomModal";
import { Typography } from "@ensdomains/thorin";
import CopyShare from "../../utils/CopyShare";
import { CheckCircleSVG } from "@ensdomains/thorin";


export default function MintRules(props) {
    const { open, setMintRuleOpen, data, setMintRuleData, mintRuleAccess, setMintRuleAccess, domainName } = props;
    const [submitLoading, setSubmitLoading] = useState(false);
    const [stopLoading, setStopLoading] = useState(false);
    const [rule, setRule] = useState("");
    const [fee, setFee] = useState("0.05");
    const [mintSuccessAndShare, setMintSuccessAndShare] = useState(false);
    const { address } = useAccount();

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
    const isCanUnwrapBurnt = useContractRead({
        address: namewrapperAddrGoerli,
        abi: namewrapperAbiGoerli,
        functionName: 'allFusesBurned',
        args: [
            namehash.hash(domainName),
            1,
        ]
    })


    useEffect(() => {
        if (isApprovedForAll.data || isCanUnwrapBurnt.data) {
            // toast.error("TODO: Already grant access but Create Mint Rules button still go to wrong modal. mintRuleAccess is still false.");
            setMintRuleAccess(true);

            console.log(isCanUnwrapBurnt.data);
            console.log(domainName);
        } else {
            setMintRuleAccess(false);
        }
    }, [])

    useEffect(() => {
        if (isCanUnwrapBurnt.data) {
            setMintRuleAccess(true);
        }
    }, [isCanUnwrapBurnt.data])


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
    useWaitForTransaction({
        hash: setApprovalForAll.data?.hash,
    })

    const burnCanUnwrapConfig = usePrepareContractWrite({
        address: namewrapperAddrGoerli,
        abi: namewrapperAbiGoerli,
        functionName: 'setFuses',
        args: [
            namehash.hash(domainName), // parentNode
            1, // CANNOT_UNWRAP
        ],
        overrides: {
            //gasLimit: '300000',
        },
    })
    const burnCanUnwrap = useContractWrite(burnCanUnwrapConfig.config)
    useWaitForTransaction({
        hash: burnCanUnwrap.data?.hash,
    })


    useEffect(() => {
        if (burnCanUnwrap.isSuccess) {
            toast.success("Successfully burn CAN_UNWRAP!")
            setMintRuleAccess(true)
        }
        else if (burnCanUnwrap.isSuccess === false) {
            setMintRuleAccess(false)
        }
    }, [burnCanUnwrap.isSuccess])

    // burnCanUnwrap.isSuccess
    const { config } = usePrepareContractWrite({
        address: M3mberRegistrarAddrGoerli,
        abi: M3mberRegistrarAbiGoerli,
        functionName: 'setupDomain',
        args: [
            namehash.hash(domainName), // node
            ethers.utils.parseEther(fee)
        ],
        overrides: {
            //gasLimit: '300000',
        },
    })

    const setupDomain = useContractWrite(config)
    useEffect(() => {
        if (setupDomain.isSuccess === false) {
            setMintRuleOpen(true)
        } else {
            setMintSuccessAndShare(true);
            setSubmitLoading(false);
        }
    }, [setupDomain.isSuccess])

    const handleCreate = () => {

        setSubmitLoading(true);

        setupDomain?.write({
            recklesslySetUnpreparedArgs: [
                namehash.hash(domainName), // node
                ethers.utils.parseEther(fee) // fee (in wei)
            ]
        })

        data.ruleCreated = true;
        console.log("rule is created!")
        setMintRuleData(data);
    }

    const handleResume = () => {
        //TODO: resume minting
        setSubmitLoading(true);
        setTimeout(() => {
            setSubmitLoading(false);
            setMintRuleOpen(false);
        }, 1000);
    }

    const handleStop = () => {
        //TODO: stop minting
        setStopLoading(true);
        setTimeout(() => {
            setStopLoading(false);
            setMintRuleOpen(false);
        }, 1000);
    }

    const handleRuleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setRule(e.target.value);
    }

    const handleFeeChange = (value: string) => {
        setFee(value);
    }


    // If the user haven't grant access yet
    if (!mintRuleAccess) {
        return (
                <Card title="Set up access"
                    style={{
                        display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
                        padding: 30, width: 500
                    }}>
                    <img src="/img/grant_access.png" alt="grant access figure"
                        style={{
                            width: "70%",
                            height: "auto",
                            margin: "auto"
                        }} />
                    <div style={{ display: "flex", justifyContent: "space-between", width: "90%", alignItems: "flex-end" }}>
                        <p >Step 1: setApprovalForAll        </p>
                        <Button size="small" loading={setApprovalForAll.isLoading}
                            onClick={() => { setApprovalForAll.write() }}
                            disabled={!setApprovalForAll.write || setApprovalForAll.isLoading || setApprovalForAll.isSuccess || isApprovedForAllResult}
                            style={{ width: "120px", height: "26px", float: "right", marginTop: "5px" }}>
                            {(setApprovalForAll.isSuccess || isApprovedForAll.data) ? "Done" : setApprovalForAll.isLoading ? "Loading..." : "Sign"}
                        </Button>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", width: "90%", alignItems: "flex-end" }}>

                        <p >Step 2: Burn CAN_UNWRAP fuses </p>
                        <Button size="small" loading={burnCanUnwrap.isLoading} onClick={() => burnCanUnwrap.write()} disabled={!burnCanUnwrap.write || burnCanUnwrap.isLoading || burnCanUnwrap.isSuccess || (!setApprovalForAll.isSuccess && !isApprovedForAll.data)} style={{ width: "120px", height: "26px", float: "right", marginTop: "5px" }}>{burnCanUnwrap.isSuccess ? "Done" : burnCanUnwrap.isLoading ? "Loading..." : "Sign"}</Button>
                    </div>

                </Card>

        );
    }

    //success & share page 
    //when (setupDomain.isSuccess is true, render the success page and allow users to copy link
    if (mintSuccessAndShare) {
        return (
            <CustomModal open={open} onDismiss={() => {
                setMintRuleOpen(false);
                setSubmitLoading(false);
                setMintSuccessAndShare(false);
            }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <CheckCircleSVG style={{ width: 50, height: 50, margin: "auto", color: "#53AC86", marginBottom: 10 }} />
                    <Typography fontVariant="extraLarge" color="green">Success!</Typography>
                    <Typography style={{ margin: "30px 0" }}>You are now able to invite people to join <b>{domainName}</b>!</Typography>
                    <Button size="small" key="submit" loading={submitLoading}
                        onClick={() => CopyShare(window.location.origin + '/invite/' + domainName)}>
                        Copy Invite Link
                    </Button>
                </div>
            </CustomModal>
        )
    }

    // access granted, but no rules created yet
    if (!data.ruleCreated) {
        return (
            <Modal open={open} onDismiss={() => { setMintRuleOpen(false); setSubmitLoading(false); }}>
                <Card title="Create mint rule"
                    style={{
                        display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
                        padding: 30, width: 500
                    }}>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: 30, width: "100%" }}>
                        <div style={{ flex: "1 1 auto" }}>
                            <p style={{ marginBottom: "10px", color: "#9B9BA5" }}>Rule</p>
                            <Input disabled value={rule} onChange={handleRuleChange} placeholder="Feature comming soom" />
                        </div>
                        <div style={{ flex: "0 1 130px", marginLeft: "10px" }}>
                            <p style={{ marginBottom: "10px", color: "#9B9BA5" }}>Fee</p>
                            <InputNumber
                                stringMode
                                className="fee-input"
                                prefix={<img src="img/eth.png" alt="etherem" style={{ height: 14, width: "100%" }} />}
                                value={fee}
                                onChange={handleFeeChange}
                                min="0" defaultValue="0.05" step="0.01" />
                        </div>
                    </div>
                    <div style={{ width: "100%", padding: "0 30px 20px 30px" }}>
                        <Button size="small" key="submit" loading={submitLoading} onClick={handleCreate} style={{ width: "100%" }}>
                            Create
                        </Button>
                    </div>
                </Card>
            </Modal>
        );
    }

    //the following two secnarios are for mint rule editing

    //access granted, rules created, and not yet stopped
    if (data.ruleCreated && !data.stopped) {
        return (
            <Modal open={open} onDismiss={() => { setMintRuleOpen(false); setSubmitLoading(false); }}>
                <Card title="Mint rule"
                    style={{
                        display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
                        padding: 30, width: 500
                    }}>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: 30, width: "100%" }}>
                        <div style={{ flex: "1 1 auto" }}>
                            <p style={{ marginBottom: "10px", color: "#9B9BA5" }}>Rule</p>
                            <Input disabled value={rule} onChange={handleRuleChange} placeholder="Feature comming soom" />
                        </div>
                        <div style={{ flex: "0 1 130px", marginLeft: "10px" }}>
                            <p style={{ marginBottom: "10px", color: "#9B9BA5" }}>Fee</p>
                            <InputNumber
                                stringMode
                                className="fee-input"
                                prefix={<img src="img/eth.png" alt="etherem" style={{ height: 14, width: "100%" }} />}
                                value={fee}
                                onChange={handleFeeChange}
                                min="0" defaultValue="0.05" step="0.01" />
                        </div>
                    </div>
                    <div style={{ textAlign: "left", padding: "0 30px", width: "100%" }}>
                        <Button size="small" key="submit" loading={submitLoading} onClick={handleCreate}
                            style={{ marginBottom: "10px" }}>
                            Create
                        </Button>
                        <Button size="small" colorStyle="redSecondary" loading={stopLoading} onClick={handleStop}
                            style={{ marginBottom: "10px" }}>
                            Stop Minting
                        </Button>
                        <small>If you close minting, you domain will no longer be accessible for new members to mint.</small>
                    </div>
                </Card>
            </Modal>
        );
    }

    //access granted, rules created, and stopped minting
    if (data.ruleCreated && data.stopped) {
        return (
            <Modal open={open} onDismiss={() => { setMintRuleOpen(false); setSubmitLoading(false); }}>
                <Card title="Mint rule"
                    style={{
                        display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
                        padding: 30, width: 500
                    }}>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: 30 }}>
                        <div style={{ flex: "1 1 auto" }}>
                            <p style={{ marginBottom: "10px", color: "#9B9BA5" }}>Rule</p>
                            <Input disabled value={rule} onChange={handleRuleChange} placeholder="Feature comming soom" />
                        </div>
                        <div style={{ flex: "0 1 130px", marginLeft: "10px" }}>
                            <p style={{ marginBottom: "10px", color: "#9B9BA5" }}>Fee</p>
                            <InputNumber
                                stringMode
                                className="fee-input"
                                prefix={<img src="img/eth.png" alt="etherem" style={{ height: 14, width: "100%" }} />}
                                value={fee}
                                onChange={handleFeeChange}
                                min="0" defaultValue="0.05" step="0.01" />
                        </div>
                    </div>
                    <div style={{ textAlign: "left", padding: "0 30px" }}>
                        <Button size="small" key="submit" loading={submitLoading} onClick={handleResume}
                            style={{ marginBottom: "10px" }}>
                            Resume Minting
                        </Button>
                        <small>If you close minting, you domain will no longer be accessible for new members to mint.</small>
                    </div>
                </Card>
            </Modal>
        );
    }


    // if we reach here it means some logic has went wrong
    return <Modal title="Something went wrong..." open={open} onDismiss={() => { setMintRuleOpen(false) }}>
    </Modal>


}
