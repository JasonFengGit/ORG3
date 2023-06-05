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

export default function UpgradeCard(props) {
    const { checkForWrapped } = props;
    const [oid, setOid] = useState("");
    const router = useRouter();
    const { address } = useAccount();
    const [isLoading, setIsLoading] = useState(false);


    useEffect(() => {
        if (router.query.oid != undefined) {
            setOid(typeof (router.query.oid) == 'string' ? router.query.oid : router.query.oid[0]);
        }
    })

    function handleSign() {
        setIsLoading(true);
        checkForWrapped();
    }

    // console.log("setApprovalForAllTransaction", setApprovalForAllTransaction);
    // console.log("isApprovedForAll", isApprovedForAll);
    return (
        <Card className="access-cards upgrade-cards">
            <div style={{
                maxWidth: 450, width: "90%",
                display: "flex",
                flexFlow: "column",
                justifyContent: "center"
            }}>
                <img style={{ width: 70, height: 70, margin: "10px auto" }}
                    src="/ens.png" alt="Metamask logo" />
                <h2 style={{ fontSize: 30, textAlign: "center", margin: "10px 0" }}>
                    Upgrade your name to latest
                    <br />
                    ENS Namewrapper
                </h2>

                <p style={{ color: "#929292", margin: "10px 0 50px 0", fontSize: 16, textAlign: "center" }}>
                    You’ll be redirect to ENS's official site to upgrade your name to latest name wrapper
                    <br />
                    Come back to this page after finish it
                </p>

                <Button size="large" loading={isLoading}
                    onClick={handleSign}
                    type="primary"
                    href={`https://alpha.ens.domains/${oid}`}
                    target="_blank"
                    style={{
                        minWidth: 147, height: 48, margin: "auto auto 0 auto",
                        display: "flex", justifyContent: "center", alignItems: "center"
                    }}>
                    {isLoading ? "Please Finish Upgrade on ENS" : "Go to ENS Official Site"}
                </Button>
            </div>
        </Card>
    );
}