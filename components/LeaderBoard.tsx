import React, { useEffect, useState } from "react";
import { Button, Input, Space } from 'antd';
import { SummaryCardData } from "../pages/[oid]";
import { domainData, domainDataWithRegCheck } from "../lib/ensdata";
import { Card, Avatar, Typography, Skeleton } from 'antd';
import { useContractRead, useContractWrite, usePrepareContractWrite } from 'wagmi'
import {
    namewrapperAbiGoerli,
    namewrapperAddrGoerli,
    M3mberRegistrarAddrGoerli,
    M3mberRegistrarAbiGoerli,
    ensBaseRegistrarAbi,
    ensBaseRegistrarAddr
} from '../lib/constants';
import namehash from "@ensdomains/eth-ens-namehash";
import { ethers } from 'ethers';
import { useRouter } from "next/router";
import { SearchOutlined } from '@ant-design/icons';

const { Search } = Input;
const { Text } = Typography

function Record(props) {
    const { ensDomain, avatarSrc, memberNum } = props;
    const router = useRouter();
    if (!ensDomain) {
        return <Card className="leaderboard-record-card">
            <Skeleton loading={true} active avatar paragraph={{ rows: 0 }} />
        </Card>
    }

    if (ensDomain === "No result") {
        return <Card className="leaderboard-record-card"
            style={{ display: "flex", alignItems: "center" }}>
            <Text style={{ fontSize: 16 }}>{ensDomain}</Text>
        </Card>
    }

    return (
        <Card className="leaderboard-record-card"
            onClick={() => { router.push(`/${ensDomain}`) }}>
            <Avatar src={avatarSrc} size="large" />
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                width: "70%",
            }}>
                <Text style={{ fontSize: 16 }}>{ensDomain}</Text>
                <Text style={{ fontSize: 16 }}>{memberNum ? memberNum : 0} members</Text>
            </div>
        </Card>
    )
}


export default function LeaderBoard() {
    const [searchTerm, setSearchTerm] = useState("");
    const [defaultRecords, setDefaultRecords] = useState<SummaryCardData[]>([]);
    const [resultRecord, setResultRecord] = useState<SummaryCardData>(null);
    const feature = ["kongz.eth", "org3.eth", "flamingle.eth"];
    const [searching, setSearching] = useState(false);

    const { data: owner, refetch: ownerRefetch } = useContractRead({
        address: namewrapperAddrGoerli,
        abi: namewrapperAbiGoerli,
        functionName: 'ownerOf',
        args: [
            namehash.hash(searchTerm.toLowerCase().indexOf(".eth") === -1 ?
                searchTerm.toLowerCase() + ".eth" : searchTerm.toLowerCase())
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
            ensTokenId(searchTerm.toLowerCase().split(".")[0])
        ]
    })

    useEffect(() => {
        (async () => {
            const recordPromises = feature.map(record => domainData(record));
            const allRecords = await Promise.all(recordPromises);
            setDefaultRecords(allRecords);
        })()
    }, [])

    useEffect(() => {
        if (resultRecord != null) {
            setSearching(false);
        }
    }, [resultRecord])

    function handleSearchChange(e) {
        setResultRecord(null);
        try {
            namehash.hash(e.target.value.toLowerCase() + "a.eth")
            setSearchTerm(e.target.value)
            try {
                namehash.hash(e.target.value.toLowerCase() + ".eth")
                setSearchTerm(e.target.value)
            }
            catch {

            }
        }
        catch {

        }
    }

    function handleSearch() {
        (async () => {
            setResultRecord(null);
            setSearching(true);
            await ownerRefetch();
            await owner2Refetch();
            // console.log({ owner: owner, owner2: owner2 });
            if (owner === "0x0000000000000000000000000000000000000000" && !owner2) {
                setResultRecord({
                    communityName: "",
                    ensDomain: "No result",
                    memberNum: 0,
                    avatarSrc: "",
                    telegram: "",
                    twitter: "",
                    website: "",
                    discord: "",
                    createdDate: ""
                });
            } else {
                let searchQuery = searchTerm.indexOf(".eth") === -1 ? searchTerm + ".eth" : searchTerm;
                const result = await domainData(searchQuery);
                setResultRecord(result);
            }
        })()
        // (async () => {
        //     const result = await domainDataWithRegCheck(searchTerm);
        //     if (!result) {
        //         setResultRecord({
        //             communityName: "",
        //             ensDomain: "No result",
        //             memberNum: 0,
        //             avatarSrc: "",
        //             telegram: "",
        //             twitter: "",
        //             website: "",
        //             discord: "",
        //             createdDate: ""
        //         });
        //     } else {
        //         setResultRecord(result);
        //     }
        // })()
    }

    return (
        <div style={{ width: 388, paddingTop: 30, marginLeft: 24 }}>
            <Search prefix={<SearchOutlined style={{ marginRight: 10 }} />}
                className="search-bar" size="large" value={searchTerm}
                onChange={handleSearchChange}
                onSearch={handleSearch}
                enterButton={<Button>Search</Button>}
            />
            {
                //didn't start searching and the default records haven't loaded yet
                !searchTerm && defaultRecords.length == 0 && (
                    <>
                        <Record
                            ensDomain={""}
                            memberNum={0}
                            avatarSrc={""}
                        />
                        <Record
                            ensDomain={""}
                            memberNum={0}
                            avatarSrc={""}
                        />
                        <Record
                            ensDomain={""}
                            memberNum={0}
                            avatarSrc={""}
                        />
                    </>
                )}
            {
                //didn't start searching and the default records finished loading
                !searchTerm && defaultRecords.map((record) => {
                    return <Record
                        ensDomain={record.ensDomain}
                        memberNum={record.memberNum}
                        avatarSrc={record.avatarSrc}
                    />
                })}
            {
                //searted seaarching but the result is not loaded yet
                searchTerm && searching && <Record
                    ensDomain={""}
                    memberNum={0}
                    avatarSrc={""}
                />}
            {
                //searted seaarching and the result is not loaded yet
                searchTerm && resultRecord && <Record
                    ensDomain={resultRecord.ensDomain}
                    memberNum={resultRecord.memberNum}
                    avatarSrc={resultRecord.avatarSrc}
                />}
        </div>
    )
}