import { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from "ethers";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { address, name } = req.body;

    if (address && name && name.includes(".eth") && ethers.utils.isAddress(address)) {
        console.log(`Address: ${address}, Name: ${name}`);
        const requestOptions = {
            method: 'POST',
            body: JSON.stringify(
                { "query": "query getNames($id: ID!, $expiryDate: Int) {\n  account(id: $id) {\n    registrations(first: 1000, where: {expiryDate_gt: $expiryDate}) {\n      registrationDate\n      expiryDate\n      domain {\n        id\n        labelName\n        labelhash\n        name\n        isMigrated\n        parent {\n          name\n          id\n        }\n        createdAt\n      }\n    }\n    domains(first: 1000) {\n      id\n      labelName\n      labelhash\n      name\n   resolver {\n      texts\n      coinTypes\n      contentHash\n      addr {\n        id\n      }\n    }   isMigrated\n      parent {\n        name\n        id\n      }\n      createdAt\n      registration {\n        registrationDate\n        expiryDate\n      }\n    }\n    wrappedDomains(first: 1000) {\n      expiryDate\n      fuses\n      domain {\n        id\n        labelName\n        labelhash\n        name\n   resolver {\n      texts\n      coinTypes\n      contentHash\n      addr {\n        id\n      }\n    }     isMigrated\n        parent {\n          name\n          id\n        }\n        createdAt\n        registration {\n          registrationDate\n          expiryDate\n        }\n      }\n    }\n  }\n}", "variables": { "id": address.toLowerCase(), "expiryDate": 0 }, "operationName": "getNames" }
            ),
            headers: {
                'Content-Type': 'application/json'
            },
        };

        let finished = false;

        const response = await fetch(`https://api.thegraph.com/subgraphs/name/ensdomains/ensgoerli`, requestOptions);
        const data = await response.json();
        if (!response.ok || !data.data.account) {
            res.status(200).send(false);
            return;
        }
        else {
            const wrappedDomains = data.data.account.wrappedDomains;
            for (let i = 0; i < wrappedDomains.length; i++) {
                const domain = wrappedDomains[i].domain.name;
                //console.log(domain)
                if (domain.split(".").length - 1 == 1) {
                    continue;
                }
                else {
                    if (domain.includes(name)) {
                        res.status(200).send(true);
                        finished = true;
                        return;
                    }
                }
            }
            if (!finished) {
                res.status(200).send(false);
                return;
            }
        }
    } else {
        res.status(400).send('Missing parameters: address and name are required');
        return;
    }
};

export default handler;