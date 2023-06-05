import { SummaryCardData, DataType } from "../pages/admin/[oid]";
import { getChain } from "../pages/_app";
import { useState } from "react";
import { ethers, getDefaultProvider } from 'ethers'
// import { useProvider } from 'wagmi';
import {
    ensRegistrarAddr, ensRegistrarAbi, ensBaseRegistrarAbi,
    namewrapperAbiGoerli,
    namewrapperAddrGoerli,
    ensBaseRegistrarAddr
} from './constants';
import { ApolloClient, InMemoryCache, gql } from '@apollo/client'
import { useNetwork, goerli, mainnet } from "wagmi";
import { useContractRead } from 'wagmi'
import namehash from "@ensdomains/eth-ens-namehash";
import { AnyARecord } from "dns";
import { resolve } from "path";
import { rejects } from "assert";
import { formatFullExpiry, formatExpiry } from "./utils"



const CHAIN_GRAPH_MAP = new Map([[goerli, 'https://api.thegraph.com/subgraphs/name/ensdomains/ensgoerli'], [mainnet, 'https://api.thegraph.com/subgraphs/name/ensdomains/ens']])

// new version of graph is still quite unstable
// const APIURL = 'https://gateway.thegraph.com/api/process.env.GRAPH_API_KEY/subgraphs/id/EjtE3sBkYYAwr45BASiFp8cSZEvd1VHTzzYFvJwQUuJx'
const APIURL = CHAIN_GRAPH_MAP.get(getChain());
const DEFAULT_AVATAR = "/img/dog_avatar.png";
export const GraphClient = new ApolloClient({
    uri: APIURL,
    cache: new InMemoryCache(),
})

const countSubdomains = async (ensName: string) => {
    const query =
        `
    {
        domains (where: {name:"${ensName}"}){
            subdomainCount
        }
    }    
    `
    const data = await GraphClient
        .query({
            query: gql(query),
        })

    return data;
}

const registeredDate = async (ensName: string) => {
    const query =
        `{
        registrations (where: {domain_: {name: "${ensName}"}}) {
            id
            registrationDate
        }
    }  
    `
    const data = await GraphClient
        .query({
            query: gql(query),
        })
    return data;
}

export const subdomainDetails = async (ensName: string) => {
    const id = namehash.hash(ensName);
    const query =
        `
    {
        domains (where: {name:"${ensName}"}){
            wrappedDomain {
                expiryDate
            }
            subdomains(first: 1000){
                owner{
                    id
                }    
                resolvedAddress{
                    id
                }
                name
                wrappedDomain {
                    expiryDate
                }
            }
        }
    }    `
    const data = await GraphClient
        .query({
            query: gql(query),
        })
    const subdomainDetails: DataType[] = [];
    console.log(data.data);
    if (!data.data.domains[0]) {
        return subdomainDetails;
    }
    for (let i = 0; i < data.data.domains[0].subdomains.length; ++i) {
        // const resolver = await provider.getResolver(data.data.domains[0].subdomains[i].name);
        // let avatar = await resolver.getText("avatar");
        let avatar;
        let name;
        if (data.data.domains[0].subdomains[i].resolvedAddress) {
            try {
                // console.log()
                //name = await provider.lookupAddress(data.data.domains[0].subdomains[i].resolvedAddress.id);
                //avatar = await (await provider.getResolver(name)).getText("avatar");
            } catch (error) {
                console.log(error);
            }
        }
        if (!avatar) avatar = "https://source.boringavatars.com/beam/40/" + data.data.domains[0].subdomains[i].name;

        if (!name) name = "Loading..."
        // alert(new Date(data.data.domains[0].subdomains[i].wrappedDomain.expiryDate * 1000).toDateString)
        // if(data.data.domains[0].subdomains[i].wrappedDomain){
        //     alert(new Date(1715245800));
        // }
        subdomainDetails.push({
            key: (i + 1).toString(),
            avatar: avatar,
            name: [name, false],
            domain: data.data.domains[0].subdomains[i].name,
            address: data.data.domains[0].subdomains[i].resolvedAddress ? data.data.domains[0].subdomains[i].resolvedAddress.id : "Not Set",
            expirationdate: data.data.domains[0].subdomains[i].wrappedDomain ? formatExpiry(new Date(data.data.domains[0].subdomains[i].wrappedDomain.expiryDate * 1000)) : "No Expiry",
            index: ""
        });
    }
    return subdomainDetails;
}

export const findAddress = async (ensName) => {
    const query =
        `
    {
        domains (where: {name:"${ensName}"}){
            resolvedAddress{
                id
            }
            name
        }
    }
    `
    const data = await GraphClient.query({
        query: gql(query),
    })

    return data;
}

export const myNamesData = async (address) => {
    console.log("my names data", address)
    const requestOptions = {
        method: 'POST',
        body: JSON.stringify(
            { "query": "query getNames($id: ID!, $expiryDate: Int) {\n  account(id: $id) {\n    registrations(first: 1000, where: {expiryDate_gt: $expiryDate}) {\n      registrationDate\n      expiryDate\n      domain {\n        id\n        labelName\n        labelhash\n        name\n        isMigrated\n        parent {\n          name\n          id\n        }\n        createdAt\n      }\n    }\n    domains(first: 1000) {\n      id\n      labelName\n      labelhash\n      name\n   resolver {\n      texts\n      coinTypes\n      contentHash\n      addr {\n        id\n      }\n    }   isMigrated\n      parent {\n        name\n        id\n      }\n      createdAt\n      registration {\n        registrationDate\n        expiryDate\n      }\n    }\n    wrappedDomains(first: 1000) {\n      expiryDate\n      fuses\n      domain {\n        id\n        labelName\n        labelhash\n        name\n   resolver {\n      texts\n      coinTypes\n      contentHash\n      addr {\n        id\n      }\n    }     isMigrated\n        parent {\n          name\n          id\n        }\n        createdAt\n        registration {\n          registrationDate\n          expiryDate\n        }\n      }\n    }\n  }\n}", "variables": { "id": address.toLowerCase(), "expiryDate": 0 }, "operationName": "getNames" }
        ),
        headers: {
            'Content-Type': 'application/json'
        },
    };


    const response = await fetch(`https://api.thegraph.com/subgraphs/name/ensdomains/ensgoerli`, requestOptions);
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data);
    }

    const filteredData = [];
    //console.log(data)
    if (!data.data.account) {
        return [];
    }
    const wrappedDomains = data.data.account.wrappedDomains;
    for (let i = 0; i < wrappedDomains.length; i++) {
        if (wrappedDomains[i].domain.parent.name != "eth") {
            console.log(wrappedDomains[i])
            //console.log(formatExpiry(new Date(parseInt(wrappedDomains[i].expiryDate)*1000)))
            const domain = wrappedDomains[i].domain
            const oneData = {
                parent: domain.parent.name,
                plan: domain.parent.name,
                domain: domain.name,
                expirationdate: formatExpiry(new Date(parseInt(wrappedDomains[i].expiryDate) * 1000)),
                id: BigInt(domain.id),
                labelhash: domain.labelhash
            }
            filteredData.push(oneData)
        }

    }
    return filteredData;
}


// const provider = getDefaultProvider();
// const provider = useProvider();
// const ethRegistrar = new ethers.Contract(
//     ensRegistrarAddr,
//     ensRegistrarAbi,
//     provider
// )
export const provider = new ethers.providers.InfuraProvider(
    process.env.NETWORK,
    process.env.INFURA_API_KEY
);
export async function domainData(domainName) {
    const resolver = await provider.getResolver(domainName);
    const subdomainCountsData = await countSubdomains(domainName);
    let subdomainCount;
    if (subdomainCountsData.data.domains[0] != null) {
        subdomainCount = subdomainCountsData ? subdomainCountsData.data.domains[0].subdomainCount : null;
    } else {
        subdomainCount = null;
    }
    let telegram: string = null;
    let url: string = null;
    let discord: string = null;
    let twitter: string = null;
    let communityName: string = null;
    let avatar: string = null;
    let time = null;
    if (resolver != null) {
        telegram = await resolver.getText("telegram");
        url = await resolver.getText("url");
        discord = await resolver.getText("com.discord");
        twitter = await resolver.getText("com.twitter");
        communityName = await resolver.getText("name");
        avatar = await resolver.getText("avatar");
        time = await registeredDate(domainName);
    }

    if (!avatar) avatar = "https://source.boringavatars.com/marble/40/" + domainName;

    const result: SummaryCardData = {
        communityName: communityName,
        ensDomain: domainName,
        memberNum: subdomainCount,
        avatarSrc: avatar,
        telegram: telegram,
        website: url,
        discord: discord,
        twitter: twitter,
        createdDate: time !== null ? new Date(time.data.registrations[0].registrationDate * 1000).toDateString() : null,

    }
    // console.log(result);
    return result;
}

async function readContract({ provider, address, abi, functionName, args }) {
    const contract = new ethers.Contract(address, abi, provider);
    const data = await contract[functionName](...args);
    return data;
}

export async function domainDataWithRegCheck(input) {
    /**
     * Check if the domain is registered or not
     */
    const domainName = input.indexOf(".eth") === -1 ? input + ".eth" : input;
    const owner = await readContract({
        provider,
        address: namewrapperAddrGoerli,
        abi: namewrapperAbiGoerli,
        functionName: 'ownerOf',
        args: [
            namehash.hash(domainName)
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

    const owner2 = await readContract({
        provider,
        address: ensBaseRegistrarAddr,
        abi: ensBaseRegistrarAbi,
        functionName: 'ownerOf',
        args: [
            ensTokenId(domainName)
        ]
    })

    /**
     * if not registered, return null
     */
    if (owner === "0x0000000000000000000000000000000000000000" && !owner2) {
        return null;
    }

    const resolver = await provider.getResolver(domainName);
    const subdomainCountsData = await countSubdomains(domainName);
    let subdomainCount;
    if (subdomainCountsData.data.domains[0] != null) {
        subdomainCount = subdomainCountsData ? subdomainCountsData.data.domains[0].subdomainCount : null;
    } else {
        subdomainCount = null;
    }
    let telegram: string = null;
    let url: string = null;
    let discord: string = null;
    let twitter: string = null;
    let communityName: string = null;
    let avatar: string = null;
    let time = null;
    if (resolver != null) {
        telegram = await resolver.getText("telegram");
        url = await resolver.getText("url");
        discord = await resolver.getText("com.discord");
        twitter = await resolver.getText("com.twitter");
        communityName = await resolver.getText("name");
        avatar = await resolver.getText("avatar");
        time = await registeredDate(domainName);
    }

    if (!avatar) avatar = "https://source.boringavatars.com/marble/40/" + domainName;

    const result: SummaryCardData = {
        communityName: communityName,
        ensDomain: domainName,
        memberNum: subdomainCount,
        avatarSrc: avatar,
        telegram: telegram,
        website: url,
        discord: discord,
        twitter: twitter,
        createdDate: time !== null ? new Date(time.data.registrations[0].registrationDate * 1000).toDateString() : null,

    }
    // console.log(result);
    return result;
}