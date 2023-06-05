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
import { Form, Input, InputNumber, message, Select, Upload, UploadProps, Tooltip, Table } from "antd";
import { Modal, Card, Heading, Button, Textarea, UpArrowSVG, DownArrowSVG } from '@ensdomains/thorin'
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
import { Tabs } from 'antd';
import { LogoutOutlined, CloudUploadOutlined } from '@ant-design/icons';
import Container from '../../components/Container';
import Dragger from 'antd/es/upload/Dragger';
import Papa from 'papaparse'; // A CSV parser library
import { UploadOutlined } from '@ant-design/icons';
import { ethers } from 'ethers';

export default function GiveOutPass() {
    return (
        <div className={styles.container} >
            <Head>
                <title>ORG3 </title>
                <meta name="description" content="ORG3" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
           
            <Container>
                

                    <Heading style={{ fontSize: "50px", marginBottom: 50, fontWeight:"600", textAlign: "center"}}>Airdrop passes</Heading>
                    <Card style={{ boxShadow: "0 8px 20px rgba(0,0,0,0.12)", padding: "50px 50px 50px 50px", width: "816px", height:"458px", margin: "auto"}}>
                        <Tabs
                            defaultActiveKey="0"
                            items={[LogoutOutlined, CloudUploadOutlined].map((Icon, i) => {
                                const id = String(i + 1);
                                return {
                                    label: (
                                        <span>
                                            <Icon />
                                            {i === 0 ? "Manual Airdrop" : "Import CSV"}
                                        </span>
                                    ),
                                    key: id,
                                    children: i === 0 ? <ManualGive /> : <ImportCSV />,
                                };
                            })}
                        />
                    </Card>
            </Container>
            
        </div>
    )
}


function ManualGive() {
    const [oid, setOid] = useState("");
    const router = useRouter();
    useEffect(() => {
        if (router.query.oid != undefined) {
            setOid(typeof (router.query.oid) == 'string' ? router.query.oid : router.query.oid[0]);
        }
    })

    const [months, setMonths] = useState(1);
    // const { address } = useAccount();
    const [subname, setSubname] = useState("");
    const [receiveraddress, setReceiverAddress] = useState("");
    
    const [validAddress, setValidAddress] = useState(undefined);

    const copyToClipBoard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text)
            toast.success('Copied to clipboard')
        } catch (err) {
            console.error('Failed to copy text: ', err)
            toast.error('Failed to copy to clipboard')
        }
    }
    //   const setM3mbershipDescriptionConfig = usePrepareContractWrite({
    //     address: ensResolverGoerli,
    //     abi: ensResolverAbiGoerli,
    //     functionName: 'setText',
    //     args: [
    //         namehash.hash(oid), // node
    //         "M3mber Description",
    //         "asdf",
    //     ],
    //     overrides: {
    //         //gasLimit: '300000',
    //     },
    // }) 


    // const setM3mbershipDescription = useContractWrite(setM3mbershipDescriptionConfig.config);
    let resolver = new ethers.utils.Interface(ensResolverAbi);
    const provider = new ethers.providers.InfuraProvider(
        process.env.NETWORK,
        process.env.INFURA_API_KEY
      );

    const giveOutNameConfig = usePrepareContractWrite({
        address: M3mberRegistrarAddrGoerli,
        abi: M3mberRegistrarAbiGoerli,
        functionName: 'batchAirdrop',
        args: [
            namehash.hash(oid), // parentNode
            [subname], // labels
            [receiveraddress], // owners
            ensResolverGoerli, // resolver
            0,
            [months],
            [!receiveraddress ? [] : [resolver.encodeFunctionData("setAddr(bytes32,address)", [namehash.hash(subname + "." + oid), receiveraddress]), resolver.encodeFunctionData("setText(bytes32,string,string)", [namehash.hash(subname + "." + oid), "ORG3", "TRUE"])]], // records

        ],
        overrides: {
            //gasLimit: '300000',
            value: 0,
        },
    })
    
    // console.log(giveOutNameConfig)

    const giveOutName = useContractWrite(giveOutNameConfig.config)

    const giveOutNameTransaction = useWaitForTransaction({
        hash: giveOutName.data?.hash,
    })

    useEffect(() => {
        if (!giveOutNameTransaction.isLoading && giveOutNameTransaction.isSuccess) {
            toast.success("Name give out successful!");
        }
    }, [giveOutNameTransaction.isSuccess])


    const handleGive = () => {
        giveOutName.write();
    }

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setSubname(e.target.value);
    }

    const handleReceiverAddress = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    
        let addr = e.target.value
        console.log(addr)
        if (addr != "") {

            try {
                const result = await provider.resolveName(addr)
                if (result) {
                    console.log("successful ens")
                    setReceiverAddress(result);
                    setValidAddress(undefined);
                } else {
                    try {
                        console.log("unsuccessful ens")
                        resolver.encodeFunctionData("setAddr(bytes32,address)", [namehash.hash(subname + "." + oid), addr]);
                        console.log("successful address")
                        setReceiverAddress(addr);
                        setValidAddress(undefined);
                    } 
                    catch (e) {
                        console.log("unsuccessful address")
                        setValidAddress("error")
                    }
                }
            } catch (err) {
                console.log("ens throw error ")
                setValidAddress("error")
            }
            
        } else {
            console.log("empty!")
            setValidAddress(undefined)
        }
       
        
    }


    const handleMonthChange = (value) => {
        setMonths(value)
    };


    return (
        <>
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginBottom: "20px" }}>
                <div style={{ flex: "1 1 auto" }}>
                    <p style={{ marginBottom: "10px", color: "#9B9BA5" }}>Subname name</p>
                    <Input value={subname} onChange={handleNameChange} placeholder=""
                        style={{ height: 50 }} suffix={"." + oid} />
                </div>
                {/*<div style={{ flex: "0 1 200px", marginLeft: 25 }}>
                    <p style={{ marginBottom: "10px", color: "#9B9BA5" }}>Plans</p>
                    <Select
                        defaultValue={1}
                        size={"large"}
                        style={{ width: "20vw", fontSize: "50px" }}
                        onChange={handleMonthChange}
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
                    </div>*/}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginBottom: "10px" }}>
                <div style={{ flex: "1 1 auto" }}>

                    <p style={{ marginBottom: "10px", color: "#9B9BA5" }}>Recipient Address</p>
                    <Tooltip title="Enter either ENS address or wallet address" color="red" open={validAddress} trigger="contextMenu">
                        <Input onBlur={handleReceiverAddress} status={validAddress} placeholder="0x"
                            style={{ height: 50 }} />
                    </Tooltip>
                    
                </div>
            </div>
            <div style={{ display: "flex" }}>
                <Button key="submit" loading={giveOutNameTransaction.isLoading} onClick={handleGive}
                    style={{ width: "500px", marginTop: 20 }}>
                    {"Give"}
                </Button>
                <Button colorStyle="blueSecondary" onClick={() => { router.push("/admin/" + oid) }}
                    style={{ width: "500px", marginTop: 20, marginLeft: 10 }}>
                    Back
                </Button>
            </div>

        </>
    );
}

function ImportCSV() {


    const [oid, setOid] = useState("");
    useEffect(() => {
        if (router.query.oid != undefined) {
            setOid(typeof (router.query.oid) == 'string' ? router.query.oid : router.query.oid[0]);
        }
    })
    const [csvData, setCsvData] = useState([]);
    const [subnames, setSubnames] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [durations, setDurations] = useState([]);
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const router = useRouter();
    // Handle file upload

    //[resolver.encodeFunctionData("setAddr(bytes32,address)", [ namehash.hash(subname+"."+oid), receiveraddress ]), resolver.encodeFunctionData("setText(bytes32,string,string)", [ namehash.hash(subname+"."+oid), "M3MBER", "TRUE" ])]
    const giveOutNameConfig = usePrepareContractWrite({
        address: M3mberRegistrarAddrGoerli,
        abi: M3mberRegistrarAbiGoerli,
        functionName: 'batchAirdrop',
        args: [
            namehash.hash(oid), // parentNode
            subnames, // labels
            addresses, // owners
            ensResolverGoerli, // resolver
            0,
            durations,
            !addresses ? [] : records//records, // records

        ],
        overrides: {
            //gasLimit: '300000',
            value: 0,
        },
    })
    console.log(giveOutNameConfig)

    const giveOutName = useContractWrite(giveOutNameConfig.config)

    const giveOutNameTransaction = useWaitForTransaction({
        hash: giveOutName.data?.hash,
    })

    const handleGive = () => {
        giveOutName.write();
    }

    let resolver = new ethers.utils.Interface(ensResolverAbiGoerli);

    const setData = (data) => {
        console.log(data);
        let alldata = [];
        let newAddresses = [];
        let newSubnames = [];
        let newDurations = [];
        let newRecords = [];
        for (let i = 0; i < data.length; i++) {
            if (data[i]["Address"] && data[i]["Address"].includes("0x")) {
                alldata.push(data[i])
                newAddresses.push(data[i]["Address"])
                newSubnames.push(data[i]["Subdomain"])
                newDurations.push(1)
                //newRecords.push([resolver.encodeFunctionData("setAddr(bytes32,address)", [ namehash.hash(data[i]["Subdomain"]+"."+oid), data[i]["Address"] ])]);//[resolver.encodeFunctionData("setAddr(bytes32,address)", [ namehash.hash(data[i]["Subdomain"]+"."+oid), data[i]["Address"] ]), resolver.encodeFunctionData("setText(bytes32,string,string)", [ namehash.hash(data[i]["Subdomain"]+"."+oid), "M3MBER", "TRUE" ])])
                const oneRecords = resolver.encodeFunctionData("setAddr(bytes32,address)", [namehash.hash(data[i]["Subdomain"] + "." + oid), data[i]["Address"]]) + resolver.encodeFunctionData("setText(bytes32,string,string)", [namehash.hash(data[i]["Subdomain"] + "." + oid), "ORG3", "TRUE"])
                newRecords.push([])
            }
        }
        setAddresses(newAddresses);
        setSubnames(newSubnames);
        setDurations(newDurations);
        setRecords(newRecords);
        setCsvData(alldata);
    }
    const handleDownload = async () => {
        try {
            const response = await fetch('/api/download');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'org3-sample.csv');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpload = (info) => {
        console.log(info)
        const file = info.file.originFileObj;
        const reader = new FileReader();
        reader.onload = () => {
            const result = Papa.parse(reader.result, { header: true });
            setData(result.data);
            console.log(csvData)
        };
        reader.readAsText(file);
    };

    const columns = Object.keys(csvData[0] || {}).map((key) => ({
        title: key,
        dataIndex: key,
    }));

    const csvFileFilter = (file) => {
        const validTypes = ['text/csv'];
        const fileType = file.type;
        if (!validTypes.includes(fileType)) {
            message.error('You can only upload CSV files!');
            return false;
        }
        return true;
    };

    return (
        <>
            {/* <div style={{ display: "flex", marginBottom: "20px", justifyContent: "space-between" }}> */}
            <div>
                <div style={{ display: "flex", marginBottom: "20px", justifyContent: "space-between" }}>
                    <Button onClick={handleDownload} colorStyle="blueSecondary" style={{ width: "350px", marginLeft: 10 }} prefix={<DownArrowSVG></DownArrowSVG>}>Download Sample</Button>
                    <Upload
                        beforeUpload={csvFileFilter}
                        onChange={handleUpload}
                        showUploadList={false}
                        accept=".csv"
                    >
                        <Button style={{ width: "350px", marginLeft: 10 }} prefix={<UpArrowSVG></UpArrowSVG>}>Upload CSV file</Button>

                    </Upload>
                    
                </div>

                <Table dataSource={csvData} columns={columns} loading={loading} />
                
                <div style={{ display: "flex", marginTop: "20px", justifyContent: "space-between" }}>

                    <Button key="submit" loading={giveOutNameTransaction.isLoading} onClick={handleGive}
                        style={{ width: "500px", marginLeft: 10 }}>
                        {"Give"}
                    </Button>
                    <Button colorStyle="blueSecondary" onClick={() => { router.push("/admin/" + oid) }}
                        style={{ width: "500px", marginLeft: 10 }}>
                        Back
                    </Button>
                </div>
            </div>
            
        </>
    );
};


