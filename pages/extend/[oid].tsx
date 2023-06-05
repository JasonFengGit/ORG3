import Head from 'next/head'
import styles from '../../styles/Home.module.css'
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import { Modal, Card, Heading, Button, Textarea } from '@ensdomains/thorin'
import { Input, InputNumber } from 'antd';
import Container from '../../components/Container';
import { RightOutlined } from "@ant-design/icons";
import { relative } from "path";
import { Select, Typography } from 'antd';
import { toast } from 'react-toastify';
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
import { ethers } from "ethers";

export default function Extend(props) {
    const [oid, setOid] = useState("");
    const router = useRouter();
    //TODO: hard coded data
    const [ensDomain, setEnsDomain] = useState("m3mber.eth");
    const [subname, setSubname] = useState("Julie.eth");
    //console.log(router.query.d)
    let dateParts = []
    if (router.query.d) {
        dateParts = (router.query.d as string).split("-")
    }
    else {
        dateParts = ["0000", "00", "00"]
    }
    const [expirationdate, setExpirationdate] = useState(new Date(dateParts[0], dateParts[1] - 1, dateParts[2]));
    const [addrResolve, setAddrResolve] = useState(true);
    //note that this date is one month ahead of expirationdate by default
    let newDate = new Date(expirationdate);
    newDate.setMonth(1 + expirationdate.getMonth());
    const [newExpirationdate, setNewExpirationdate] = useState(newDate);
    const [fee, setFee] = useState("0.05");
    const { address, connector, isConnected } = useAccount();
    const [duration, setDuration] = useState(1);
    const [submitLoading, setSubmitLoading] = useState(false);

    useEffect(() => {
        if (router.query.d) {
            dateParts = (router.query.d as string).split("-");
            setExpirationdate(new Date(dateParts[0], dateParts[1] - 1, dateParts[2]));
            let newDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
            newDate.setMonth(1 + newDate.getMonth());
            setNewExpirationdate(newDate)
        }
    }, [router.query.d])

    const { data: data } = useContractRead({
        address: M3mberRegistrarAddrGoerli,
        abi: M3mberRegistrarAbiGoerli,
        functionName: 'names',
        args: [namehash.hash(ensDomain)]
    });

    const { config } = usePrepareContractWrite({
        address: M3mberRegistrarAddrGoerli,
        abi: M3mberRegistrarAbiGoerli,
        functionName: 'renew',
        args: [
            namehash.hash(ensDomain), // parentNode
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes(subname.split(".")[0])),
            duration
        ],
        overrides: {
            //gasLimit: '300000',
            value: data ? data["registrationFee"].mul(duration) : 0
        },
    })
    const renewName = useContractWrite(config)

    const renewNameTransaction = useWaitForTransaction({
        hash: renewName.data?.hash,
    })

    const handleDurationChange = (value) => {
        setDuration(value);
        //at here, the new date is updated to be the current date + value*month
        let newDate = new Date(expirationdate);
        newDate.setMonth(value + expirationdate.getMonth());
        setNewExpirationdate(newDate);
    };

    const handleFeeChange = (value: string) => {
        setFee(value);
    }

    useEffect(() => {
        if (router.query.oid != undefined) {
            setOid(typeof (router.query.oid) == 'string' ? router.query.oid : router.query.oid[0]);
            setEnsDomain(oid.split(".")[1] + ".eth")
            setSubname(oid)
        }
    })

    useEffect(() => {
        if (!renewNameTransaction.isLoading && renewNameTransaction.isSuccess) {
            setSubmitLoading(false);
            toast.success("M3mbership extend successful!");
        }
    }, [renewNameTransaction.isSuccess])


    const handleRenew = () => {
        renewName.write();
        setSubmitLoading(true);
    }

    return (
        <div className={styles.container} style={{ overflow: "hidden" }}>
            <Head>
                <title>Extend Membership </title>
                <meta name="description" content="ORG3" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Container>
                <Heading style={{ fontSize: "50px", marginBottom: 30 }}>Extend Membership</Heading>
                <Card style={{ boxShadow: "0 8px 20px rgba(0,0,0,0.12)", padding: 0 }}>
                    <div style={{ display: "flex", height: 450 }}>
                        <div style={{ flex: "0 0 350px", borderRight: "1px solid #E0E0E0", padding: "60px 30px 30px 30px" }}>
                            <p style={{ fontSize: 16, marginBottom: 20, color: "#9B9BA5" }}>Current plan</p>
                            <p style={{ fontSize: 28, marginBottom: 50, color: "#4E86F7" }}>{ensDomain + " - Monthly"}</p>
                            <p style={{ fontSize: 16, marginBottom: 20, color: "#9B9BA5" }}>M3Mber subname</p>
                            <p style={{ fontSize: 28, marginBottom: 50, color: "#4E86F7" }}>{subname}</p>
                            <p style={{ fontSize: 16, marginBottom: 20, color: "#9B9BA5" }}>Expiration Date</p>
                            <p style={{ fontSize: 28, marginBottom: 50, color: "#BE2020" }}>{expirationdate.toDateString()}</p>
                        </div>
                        <div style={{ flex: "1 1 auto", padding: "60px 30px 30px 30px" }}>
                            <div style={{ display: "flex", marginBottom: 30 }}>
                                <div style={{ flex: "1 1 auto", marginRight: 15 }}>
                                    <p style={{ color: "#9B9BA5", marginBottom: 10 }}>Extend the plan by</p>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        borderRadius: '12px',
                                        background: '#f5f5f5',
                                        justifyContent: 'space-between',
                                        width: "100%",
                                        marginBottom: "20px"
                                    }}
                                        className="extend-select"
                                    >
                                        <div style={{ marginRight: '16px', marginLeft: "16px", fontWeight: "500" }}>{ensDomain} - Monthly</div>
                                        <Select style={{ width: "160px", height: 50 }} value={duration} onChange={handleDurationChange}
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
                                        />
                                    </div>
                                </div>
                                <div style={{ flex: "0 0 100px" }}>
                                    <p style={{ color: "#9B9BA5", marginBottom: 10 }}>Period</p>
                                    <Input size="large" disabled placeholder="Montly" style={{ height: 50 }} />
                                </div>
                            </div>
                            <div style={{ display: "flex", marginBottom: 60 }}>
                                <div style={{ flex: "1 1 auto", marginRight: 15 }}>
                                    <p style={{ color: "#9B9BA5", marginBottom: 10 }}>New Expiration Date</p>
                                    <Input size="large" disabled value={newExpirationdate.toDateString()} style={{ height: 50 }} />
                                </div>
                                <div style={{ flex: "1 1 auto" }}>
                                    <p style={{ color: "#9B9BA5", marginBottom: 10 }}>Cost</p>
                                    <InputNumber
                                        size="large"
                                        stringMode
                                        className="fee-input"
                                        prefix={<img src="/eth.png" alt="etherem" style={{ height: 14, width: "100%" }} />}
                                        value={ethers.utils.formatEther(data ? data["registrationFee"].mul(duration) : 0).toString()}
                                        onChange={() => { }}

                                    />
                                </div>
                            </div>
                            <div style={{ display: "flex" }}>
                                <Button loading={renewNameTransaction.isLoading} onClick={() => { handleRenew() }} style={{ marginRight: 20 }}>Extend</Button>
                                <Button colorStyle="blueSecondary"
                                    onClick={() => {
                                        router.push("/my/plans");
                                    }}>Back</Button>
                            </div>
                        </div>
                    </div>
                </Card>
            </Container>
        </div>
    )
}
