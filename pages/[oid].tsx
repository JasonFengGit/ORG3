import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Table, Tooltip, Row, Col, Input, Button } from 'antd';
import { Typography } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';
import { useAccount } from "wagmi";
import CommunitySummaryCardNew from "../components/communitySpace/CommunitySummaryCardNew";
import MintPriceCard from "../components/communitySpace/MintPriceCard";
import { domainData, subdomainDetails, provider } from "../lib/ensdata";
import { ensRegistrarAddr, ensRegistrarAbi } from '../lib/constants';
import { ApolloClient, InMemoryCache, gql } from '@apollo/client'
import { useProvider } from "wagmi";
import { useContractRead, useContractWrite, usePrepareContractWrite } from 'wagmi'
import {
    namewrapperAbiGoerli,
    namewrapperAddrGoerli,
    M3mberRegistrarAddrGoerli,
    M3mberRegistrarAbiGoerli,
    ensBaseRegistrarAbi,
    ensBaseRegistrarAddr
} from '../lib/constants';
import { toast } from "react-toastify";
import namehash from "@ensdomains/eth-ens-namehash";
import { ethers } from 'ethers';
import { DataSource } from "@syncfusion/ej2-react-diagrams";
import useCheckMobileScreen from "../hooks/useCheckMobileScreen";
import Container from "../components/Container";
import SquareIconButton from "../components/SquareIconButton";
import MembershipCard from "../components/MembershipCard";
import { Tag } from "@ensdomains/thorin";
import { CSVLink } from 'react-csv';
import { ExportOutlined, SearchOutlined } from '@ant-design/icons';
import Footer from "../components/footer";
import { PAGE_SIZE } from "../lib/constants";

//data for summary card
export type SummaryCardData = {
    communityName: string;
    ensDomain: string;
    memberNum: number;
    avatarSrc: string;
    telegram: string;
    twitter: string;
    website: string;
    discord: string;
    createdDate: string;

}
const defaultCardData: SummaryCardData = {
    communityName: "",
    ensDomain: "",
    memberNum: -1,
    avatarSrc: "",
    telegram: "",
    twitter: "",
    website: "",
    discord: "",
    createdDate: ""
}

const { Title, Text } = Typography;
//data for table
export interface DataType {
    key: React.Key;
    avatar: string;
    name: [string, boolean];
    domain: string;
    address: string;
    expirationdate: string;
    index: string;
}

//data for edit modal
export interface EditData {
    website: string;
    discord: string;
    twitter: string;
    telegram: string;
    background: string;
    image: string;
}

//data for mint rule
export interface MintRuleData {
    ruleCreated: boolean;
    stopped: boolean;
    rule: string;
    fee: number;
}

//columns setting
const columns: ColumnsType<DataType> = [
    {
        title: '',
        dataIndex: 'avatar',
        render: (avatar: string) => (
            <div style={{ width: 36, borderRadius: "50%", overflow: "hidden", display: "flex", justifyContent: "center" }}>
                <img src={avatar} alt="avatar" style={{ width: "100%", height: "auto" }} />
            </div>),
    },
    {
        title: 'Primary Name',
        dataIndex: 'name',
        sorter: {
            compare: (a, b) => {
                if (a.index == '0' || b.index == '0') {
                    return 0
                } else {
                    return a.name[0].localeCompare(b.name[0])
                }
            },
            multiple: 1,
        },
        render: (name: [string, boolean]) => {
            if (name[1]) {
                return (
                    <div style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",

                    }}>

                        <Text strong>{name[0]}</Text>
                        <div style={{
                            marginLeft: "20px"
                        }}></div>
                    </div>
                )
            } else {
                return (
                    <Text strong>{name[0]}</Text>
                )
            }
        }
    },
    {
        title: 'Domain',
        dataIndex: 'domain',
        sorter: {
            compare: (a, b) => {
                if (a.index == '0' || b.index == '0') {
                    return 0
                } else {
                    return a.domain.localeCompare(b.domain)
                }

            },
            multiple: 1,
        },
        render: (_, record) => {
            // if (record.name[0] != "Not Set") {
            //     return (
            //         <div>
            //             <Tooltip title="Copy address to clipboard">
            //                 <Tag
            //                     style={{
            //                         cursor: 'pointer', width: 150, height: 36, display: "flex", justifyContent: "center"
            //                     }}
            //                     onClick={() => navigator.clipboard.writeText(record.name[0])}
            //                 >
            //                     {record.name[0]}
            //                 </Tag>
            //             </Tooltip>
            //         </div>
            //     )
            // }

            if (record.domain.length <= 20) {
                return (
                    <div>
                        <Tooltip title="Copy domain to clipboard">
                            <Tag
                                style={{
                                    cursor: 'pointer', width: 200, height: 36, display: "flex", justifyContent: "center",
                                    borderColor: "rgba(78,134,247, 0.2)"
                                }}
                                onClick={() => navigator.clipboard.writeText(record.domain)}
                                colorStyle="blueSecondary"
                            >
                                {record.domain}
                            </Tag>
                        </Tooltip>
                    </div>
                )
            }
            let truncated = record.domain.substring(0, 9) + "..." + record.domain.substring(record.domain.length - 9, record.domain.length);
            return (
                <div>
                    <Tooltip title="Copy domain to clipboard">
                        <Tag
                            style={{
                                cursor: 'pointer', width: 200, height: 36, display: "flex", justifyContent: "center",
                                borderColor: "rgba(78,134,247, 0.2)"
                            }}
                            onClick={() => navigator.clipboard.writeText(record.domain)}
                            colorStyle="blueSecondary"
                        >
                            {truncated.toLowerCase()}
                        </Tag>
                    </Tooltip>
                </div>
            )
        }
    },
    {
        title: 'Resolved address',
        dataIndex: 'address',
        sorter: {
            compare: (a, b) => {
                if (a.index == '0' || b.index == '0') {
                    return 0
                } else {
                    return a.address.localeCompare(b.address)
                }

            },
            multiple: 1,
        },
        render: (_, record) => {
            if (record.address.length <= 11) {
                return (
                    <div>
                        <Tooltip title="Copy address to clipboard">
                            <Tag
                                style={{
                                    cursor: 'pointer', width: 150, height: 36, display: "flex", justifyContent: "center",
                                    color: "#4E86F7", borderColor: "rgba(78,134,247, 0.2)"
                                }}
                                onClick={() => navigator.clipboard.writeText(record.address)}
                                colorStyle="background"
                            >
                                {record.address}
                            </Tag>
                        </Tooltip>
                    </div>
                )
            }
            let truncated = record.address.substring(0, 4) + "..." + record.address.substring(record.address.length - 4, record.address.length);
            return (
                <div>
                    <Tooltip title="Copy address to clipboard">
                        <Tag
                            style={{
                                cursor: 'pointer', width: 150, height: 36, display: "flex", justifyContent: "center",
                                color: "#4E86F7", borderColor: "rgba(78,134,247, 0.2)"
                            }}
                            onClick={() => navigator.clipboard.writeText(record.address)}
                            colorStyle="background"
                        >
                            {truncated.toLowerCase()}
                        </Tag>
                    </Tooltip>
                </div>
            )
        }
    },
];

// headers for the export csv
const headers = [
    { label: "Avatar", key: "avatar" },
    { label: "Primary Name", key: "name" },
    { label: "Domain", key: "domain" },
    { label: "Resolved address", key: "address" }
];


// styling for search bar
// const { Search } = Input;


function OrgPage({ Component, pageProps }) {
    // const config = {
    //     address: ensRegistrarAddr,
    //     abi: ensRegistrarAbi,
    //     functionName: 'resolver',
    //     args: ["flamingle.eth"]
    //   }

    const router = useRouter();
    const [oid, setOid] = useState("");
    const [editOpen, setEditOpen] = useState(false);
    const [mintRuleOpen, setMintRuleOpen] = useState(false);

    const [summaryCardData, setSummaryCardData] = useState<SummaryCardData>(defaultCardData);
    const [communityPageData, setCommunityPageData] = useState<DataType[]>();
    const [communityPageSearchData, setCommunityPageSearchData] = useState<DataType[]>();
    const [tableLoading, setTableLoading] = useState(true);
    const { address, connector, isConnected } = useAccount();
    // TODO: set access
    const [mintRuleAccess, setMintRuleAccess] = useState(false);
    // TODO: set owner
    //const [isOwner, setIsOwnder] = useState(true);

    //TODO: set mint rules data, pay attention to ruleCreated and stopped
    //temperary data, replace with real web3 integration:
    const [mintRuleData, setMintRuleData] = useState({
        //change back!
        ruleCreated: false,
        stopped: false,
        rule: "",
        fee: 0.05
    })
    // const onChange: TableProps<DataType>['onChange'] = (pagination, filters, sorter, extra) => {
    //     console.log('params', pagination, filters, sorter, extra);
    // };

    //states for table UI
    const [fetchPage, setFetchPage] = useState(false);
    const [currPage, setCurrPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);

    const csvReport = {
        data: communityPageSearchData,
        headers: headers,
        filename: 'export_lists.csv'
    };

    useEffect(() => {
        if (router.query.oid != undefined) {
            setOid(typeof (router.query.oid) == 'string' ? router.query.oid : router.query.oid[0]);
        }
    })
    const isCanUnwrapBurnt = useContractRead({
        address: namewrapperAddrGoerli,
        abi: namewrapperAbiGoerli,
        functionName: 'allFusesBurned',
        args: [
            namehash.hash(oid),
            1,
        ]
    })

    // 0x00 => not wrapped yet, else => wrapped, owner address
    const { data: owner } = useContractRead({
        address: namewrapperAddrGoerli,
        abi: namewrapperAbiGoerli,
        functionName: 'ownerOf',
        args: [
            namehash.hash(oid)
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
    // UX: isOwner ? next step, just different page based on if it's wrapped : (owner === 0x000 ? error.[unregistered name (go to register) : you are not the owner] 
    // 0x00 => not owned, else => (owner address => if === current_address -> owner! / else -> check wrappedOwner)
    const { data: owner2 } = useContractRead({
        address: ensBaseRegistrarAddr,
        abi: ensBaseRegistrarAbi,
        functionName: 'ownerOf',
        args: [
            ensTokenId(oid.split(".")[0])
        ]
    })
    const isOwner = owner == address || owner2 == address; // @harry for landing page
    // console.log("+++++++++++++++++??????????????!!!!!!!!**************")
    // console.log(owner2);
    // console.log(ensTokenId(oid.split(".")[0]));
    const usingMobile = useCheckMobileScreen();
    //const isOwner = true; 


    const isApprovedForAll = useContractRead({
        address: namewrapperAddrGoerli,
        abi: namewrapperAbiGoerli,
        functionName: 'isApprovedForAll',
        args: [
            address,
            M3mberRegistrarAddrGoerli,
        ]
    })
    const { data: namesResult } = useContractRead({
        address: M3mberRegistrarAddrGoerli,
        abi: M3mberRegistrarAbiGoerli,
        functionName: 'names',
        args: [
            namehash.hash(oid),
        ]
    })

    const sortCommunityData = (row1: DataType, row2: DataType) => {
        // if (row1.avatar && row2.avatar) {
        //     if (row1.avatar > row2.avatar) return 1;
        //     else return -1;
        // }
        // if (row1.avatar) {
        //     return 1;
        // }
        // if (row2.avatar) {
        //     return -1;
        // }
        const addr1 = BigInt(row1.address);
        const addr2 = BigInt(row2.address);
        if (addr1 > addr2) {
            return -1;
        } else if (addr1 == addr2) {
            return 0;
        } else {
            return 1;
        }
    }

    useEffect(() => {
        if (isCanUnwrapBurnt.data && isApprovedForAll.data) {
            // console.log(isCanUnwrapBurnt.data);
            // console.log(namehash.hash(oid));
            // console.log("+++++");
            setMintRuleAccess(true);
        } else {
            setMintRuleAccess(false);
        }
    }, [oid])


    useEffect(() => {
        (async () => {
            const oidDomainData = await domainData(oid);
            setSummaryCardData(oidDomainData);
        })()
    }, [oid]);

    const getOneNameAndAvatar = async (row, i) => {
        let avatar;
        let name;
        if (row.address) {
            try {
                // console.log()
                name = await provider.lookupAddress(row.address);
                avatar = await (await provider.getResolver(name)).getText("avatar");
                if (!avatar.includes("https")) {
                    avatar = "https://metadata.ens.domains/goerli/avatar/" + name;
                }
            } catch (error) {
                console.log(error);
            }
        }
        if (!avatar) avatar = "https://source.boringavatars.com/beam/40/" + row.domain;

        if (!name) name = "Not Set";

        let communityPageDataCopy = [...communityPageData];
        row.name = [name, row.name[1]];
        row.avatar = avatar;
        communityPageDataCopy[i] = row;
        // lock?
        communityPageDataCopy.sort(sortCommunityData);
        setCommunityPageData(communityPageDataCopy);
        setCommunityPageSearchData(communityPageDataCopy);
        // lock release?
    }

    const onSearch = ((value: string) => {
        console.log(value);
        if (value === '') {
            setCommunityPageSearchData(communityPageData);
        }
        else {
            if (address) {
                let newSearchResults = [];
                for (var index in communityPageData) {
                    if (communityPageData[index].domain.includes(value)) {
                        newSearchResults.push(communityPageData[index]);
                    }
                    else if (communityPageData[index].name.includes(value)) {
                        newSearchResults.push(communityPageData[index]);
                    }
                    else if (communityPageData[index].address.includes(value)) {
                        newSearchResults.push(communityPageData[index]);
                    }
                }
                setCommunityPageSearchData(newSearchResults);
            }
        }
    });

    useEffect(() => {
        (async () => {
            const oidsubdomainDetails = await subdomainDetails(oid);
            // console.log(oidsubdomainDetails);
            oidsubdomainDetails.sort(sortCommunityData);
            // oidsubdomainDetails.forEach((row) => {
            //     console.log(BigInt(row.address));
            // })
            setTotalPage(Math.ceil(oidsubdomainDetails.length));
            setCommunityPageData(oidsubdomainDetails);
            setCommunityPageSearchData(oidsubdomainDetails);

            if (oidsubdomainDetails) {
                setTableLoading(false);
            }
        })()
    }, [oid]);

    //load each row
    useEffect(() => {
        (async () => {
            // console.log(communityPageData)
            if (communityPageData && communityPageData.length != 0) {
                for (let i = (currPage - 1) * PAGE_SIZE; i < Math.min(communityPageData.length, currPage * PAGE_SIZE); ++i) {
                    getOneNameAndAvatar(communityPageData[i], i);
                }
            }
        })()
    }, [communityPageData && communityPageData.length, fetchPage])

    useEffect(() => {
        if (namesResult) {
            var data = mintRuleData;
            data.ruleCreated = namesResult["available"];
            data.rule = "Any subdomain";
            data.fee = Number(ethers.utils.formatEther(namesResult["registrationFee"]));
            console.log(namesResult[2]);
        }

    }, [namesResult])

    function handleShare() {
        navigator.clipboard.writeText(window.location.origin + '/join/' + oid);
        toast.success("Successfully copied share link!")
    }

    const handleTableChange = (pagination) => {
        setCurrPage(pagination.current);
        setFetchPage(!fetchPage);
    };

    return (
        <>
            <Container marginTop={true}>
                <Row gutter={[16, 16]}>
                    <Col span={6}>
                        <CommunitySummaryCardNew data={summaryCardData} setEditOpen={setEditOpen}
                            isOwner={isOwner} ruleCreated={mintRuleData.ruleCreated} setMintRuleOpen={setMintRuleOpen}
                            stopped={mintRuleData.stopped} />
                        {/* <MintPriceCard data={summaryCardData} />
                    <CommunityTreasuryCardNew data={summaryCardData} /> */}
                    </Col>
                    <Col span={18}>
                        <div style={{ marginBottom: "20px" }}>
                            <Input prefix={<SearchOutlined style={{ marginRight: 10 }} />} style={{ width: "400px" }} placeholder="Search Member" onChange={(event) => onSearch(event.target.value)} />
                            {communityPageSearchData &&
                                <Button
                                    size="small"
                                    style={{ height: "32px", float: "right", color: "#4E86F7", backgroundColor: "#DCE7FD", paddingRight: "10px", paddingLeft: "10px" }}
                                    icon={<ExportOutlined style={{ marginRight: 10 }} />}
                                >
                                    <CSVLink {...csvReport}>Export List</CSVLink>
                                </Button>
                            }
                        </div>
                        <Table columns={columns}
                            dataSource={communityPageSearchData ?
                                communityPageSearchData.slice((currPage - 1) * PAGE_SIZE,
                                    Math.min(currPage * PAGE_SIZE, communityPageSearchData.length))
                                :
                                null
                            }
                            loading={tableLoading}
                            pagination={{
                                current: currPage,
                                pageSize: PAGE_SIZE, // You can set this to match your API's page size
                                total: totalPage,
                            }}
                            onChange={handleTableChange} />
                    </Col>
                </Row>
            </Container>
        </>



    );

}

export default OrgPage