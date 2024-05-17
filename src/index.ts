import { AnchorProvider, Program, Wallet } from "@project-serum/anchor";
import { Connection, Keypair } from "@solana/web3.js";
import BN from 'bn.js'
import { config } from 'dotenv'
config();

(async () => {
    let wallet = new Wallet(Keypair.generate())
    let provider = new AnchorProvider(new Connection(process.env.RPC_URL!), wallet, { commitment: 'confirmed' })
    let idl = await Program.fetchIdl('E7HtfkEMhmn9uwL7EFNydcXBWy5WCYN1vFmKKjipEH1x', provider)
    if (idl) {
        let program = new Program(idl, 'E7HtfkEMhmn9uwL7EFNydcXBWy5WCYN1vFmKKjipEH1x', provider)
        // console.log(program.account)
        let merkle_distributors = await program.account['merkleDistributor'].all();
        let totalForgone = ([...merkle_distributors.values()].map(programAccount => {
            // console.log((programAccount as any).account.totalAmountForgone)
            return (programAccount as any).account.totalAmountForgone
        }).reduce((a: BN, b: BN) => {
            // console.log(a, b)
            return a.add(b)
        }, new BN(0)) as BN).div(new BN(Math.pow(10, 6)))
        let totalClaimed = ([...merkle_distributors.values()].map(programAccount => {
            // console.log((programAccount as any).account.totalAmountForgone)
            return (programAccount as any).account.totalAmountClaimed
        }).reduce((a: BN, b: BN) => {
            // console.log(a, b)
            return a.add(b)
        }, new BN(0)) as BN).div(new BN(Math.pow(10, 6)))
        console.log('Forgone', new Intl.NumberFormat("en-US", { style: 'currency', currency: 'USD' }).format(totalForgone.toNumber()).replace('$', 'DRIFT '))
        console.log('% Forgone', ((totalForgone.toNumber() / 120000000) * 100).toFixed(2) + '%' )
        console.log('Claimed', new Intl.NumberFormat("en-US", { style: 'currency', currency: 'USD' }).format(totalClaimed.toNumber()).replace('$', 'DRIFT '))
        console.log('% Claimed', ((totalClaimed.toNumber() / 120000000) * 100).toFixed(2) + '%' )
    }
})();
