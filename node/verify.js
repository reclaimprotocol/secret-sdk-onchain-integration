import { SecretNetworkClient, Wallet } from "secretjs";
import * as fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const wallet = new Wallet(process.env.MNEMONIC); // YOUR passphrase
const contract_wasm = fs.readFileSync("../contract.wasm.gz");

const secretjs = new SecretNetworkClient({
    chainId: "pulsar-3",
    url: "https://api.pulsar.scrttestnet.com",
    wallet: wallet,
    walletAddress: wallet.address,
});

// Uncomment for mainnet
// const secretjs = new SecretNetworkClient({
//     chainId: "secret-4",
//     url: "https://lcd.mainnet.secretsaturn.net",
//     wallet: wallet,
//     walletAddress: wallet.address,
// });

let codeId, contractCodeHash, contractAddress

let uploadContract = async () => {
    let tx = await secretjs.tx.compute.storeCode(
        {
            sender: wallet.address,
            wasm_byte_code: contract_wasm,
            source: "",
            builder: "",
        },
        {
            gasLimit: 4_000_000,
        }
    );

    codeId = Number(
        tx.arrayLog.find((log) => log.type === "message" && log.key === "code_id")
            .value
    );

    console.log("codeId: ", codeId);

    contractCodeHash = (
        await secretjs.query.compute.codeHashByCodeId({ code_id: codeId })
    ).code_hash;
    console.log(`Code hash: ${contractCodeHash}`);

};

await uploadContract();

let instantiateContract = async () => {
    const contract = "secret14k7awjkw8ykllsx8uvq0dfc6h57afrzudunhah"
    const code_hash = "db17efceec7a8d2c464af53e142dda38de5ea0665b5c548928d5243b21a624b4"
    // Uncomment for mainnet
    // const contract = "secret18u22df5dan6cyl6xuyjn9wsa3gauf53567ej90"
    // const code_hash = "db17efceec7a8d2c464af53e142dda38de5ea0665b5c548928d5243b21a624b4"
    
    const instantiateMsg = { contract: contract, code_hash: code_hash };
    let tx = await secretjs.tx.compute.instantiateContract(
        {
            code_id: codeId,
            sender: wallet.address,
            code_hash: contractCodeHash,
            init_msg: instantiateMsg,
            label: "Reclaim" + Math.ceil(Math.random() * 10000),
        },
        {
            gasLimit: 400_000,
        }
    );

    //Find the contract_address in the logs
    contractAddress = tx.arrayLog.find(
        (log) => log.type === "message" && log.key === "contract_address"
    ).value;

    console.log(`Contract address: ${contractAddress}`);
};

await instantiateContract();

let verifyProof = async () => {
    const owner = "0xe4c20c9f558160ec08106de300326f7e9c73fb7f"

    const claimInfo = {
        "provider": "http",
        "parameters": "{\"body\":\"\",\"geoLocation\":\"in\",\"method\":\"GET\",\"responseMatches\":[{\"type\":\"contains\",\"value\":\"_steamid\\\">Steam ID: 76561199632643233</div>\"}],\"responseRedactions\":[{\"jsonPath\":\"\",\"regex\":\"_steamid\\\">Steam ID: (.*)</div>\",\"xPath\":\"id(\\\"responsive_page_template_content\\\")/div[@class=\\\"page_header_ctn\\\"]/div[@class=\\\"page_content\\\"]/div[@class=\\\"youraccount_steamid\\\"]\"}],\"url\":\"https://store.steampowered.com/account/\"}",
        "context": "{\"contextAddress\":\"user's address\",\"contextMessage\":\"for acmecorp.com on 1st january\"}",
    }

    const identifier = "0x531322a6c34e5a71296a5ee07af13f0c27b5b1e50616f816374aff6064daaf55"

    const signedClaim = {
        "claim": {
            "identifier": identifier,
            "owner": owner,
            "epoch": 1,
            "timestampS": 1710157447
        },
        "signatures": ["0x52e2a591f51351c1883559f8b6c6264b9cb5984d0b7ccc805078571242166b357994460a1bf8f9903c4130f67d358d7d6e9a52df9a38c51db6a10574b946884c1b"],
    }


    const proof = {
        claimInfo: claimInfo,
        signedClaim: signedClaim
    }

    let tx = await secretjs.tx.compute.executeContract(
        {
            sender: wallet.address,
            contract_address: contractAddress,
            msg: {
                verify_proof: {
                    proof: proof
                }
            },
            code_hash: contractCodeHash,
        },
        { gasLimit: 200_000 }
    );

    console.log(`Tx hash: ${tx.transactionHash}`);
};

await verifyProof();