import Head from 'next/head'
import styles from '../../styles/Home.module.css'
import React, { useState, useEffect } from "react";
import InputEns from '../../components/inputEns';
import LoginCard from '../../components/communitySpace/LoginCard';
import { useRouter } from 'next/router';
import CommunityInviteCard from '../../components/invite/CommunityInviteCard';
import { SummaryCardData } from '../admin/[oid]';
import { domainData } from '../../lib/ensdata';
import MyImage from '../../public/bgdecoration.png';
import MintCard from '../../components/invite/MintCard';

export default function Home() {
    const defaultCardData : SummaryCardData = {
        communityName: "",
        ensDomain: "",
        memberNum: 0,
        avatarSrc: "",
        telegram: "",
        twitter: "",
        website: "",
        discord: "",
        createdDate:""
    }
    const [oid, setOid] = useState("");
    const router = useRouter();
    
    const [summaryCardData, setSummaryCardData] = useState<SummaryCardData>(defaultCardData);

    // const onChange: TableProps<DataType>['onChange'] = (pagination, filters, sorter, extra) => {
    //     console.log('params', pagination, filters, sorter, extra);
    // };
    useEffect(() => {
        if (router.query.oid != undefined) {
            setOid(typeof (router.query.oid) == 'string' ? router.query.oid : router.query.oid[0]);
        }
    })

    useEffect(() => {
        (async () => {
        const oidDomainData = await domainData(oid);
        setSummaryCardData(oidDomainData);
        })()
    }, [oid]);

    return (
    <div style={{ overflow: "hidden",height:"100vh"}
    }>
        <Head>
        <title>ORG3 </title>
        <meta name="description" content="ORG3" />
        <link rel="icon" href="/favicon.ico" />
        </Head>

        <div style={{display: "flex", justifyContent: "center", alignContent: "center", marginTop: "120px"}}>
            <MintCard data={summaryCardData} />
        </div>
        

    </div>
    )
}
    