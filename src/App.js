import logo from './logo.svg';
import './App.css';

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import VotingABI from "./VotingABI.json";

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;
console.log(CONTRACT_ADDRESS);

function App() {
    const [account, setAccount] = useState(null);
    const [contract, setContract] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [selected, setSelected] = useState("");

    useEffect(() => { connectWallet(); }, []);

    useEffect(() => {
      checkWalletConnection();
    }, []);

  async function checkWalletConnection() {
      if (window.ethereum) {
          try {
              const accounts = await window.ethereum.request({ method: "eth_accounts" });

              const provider = new ethers.BrowserProvider(window.ethereum);
              const signer = await provider.getSigner();
              const contract = new ethers.Contract(CONTRACT_ADDRESS, VotingABI.abi, signer);
              setContract(contract);
              setAccount(await signer.getAddress());

              const candidatesList = await contract.getCandidates();
              console.log("Candidates from contract:", candidatesList); // printing candidates list
              setCandidates(candidatesList);

                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                }
          } catch (error) {
              console.error("Error fetching accounts:", error);
          }
      } else {
          alert("Please install MetaMask!");
      }
  }

  async function connectWallet() {
      if (window.ethereum) {
          try {
              const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
              const selected_account = accounts[0];
              setAccount(selected_account);
              
          } catch (error) {
              console.error("Error connecting wallet:", error);
          }
      } else {
          alert("Please install MetaMask!");
      }
  }
    async function vote() {
        if (!selected) return alert("Select a candidate!");
        
        try {
          const tx = await contract.vote(selected);
          await tx.wait();  // Wait for transaction confirmation
          alert(`Voted for ${selected}`);
            const provider = new ethers.BrowserProvider(window.ethereum);
            // const signer = await provider.getSigner();
            //   const contract = new ethers.Contract(CONTRACT_ADDRESS, VotingABI.abi, signer);
            const contract = new ethers.Contract(CONTRACT_ADDRESS, VotingABI.abi, provider);
            const filter = contract.filters.Voted();
            const events = await contract.queryFilter(filter);
            console.log(events);

        } catch (error) {
            console.error("Voting error:", error);
            alert("Voting failed. Check console for details.");
        }
    }

    const [blocks, setBlocks] = useState([]);

    async function view_blocks() {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const latest_block_number = await provider.getBlockNumber();

        let fetchedBlocks = [];

        for (let i = latest_block_number; i > 0; i--) {
            const block = await provider.getBlock(i, true); // Get full transactions
            let voteDetails = [];

            for (let tx of block.transactions) {
                try {
                    if (!tx.hash) {
                        console.error(`Skipping invalid transaction:`, tx);
                        const receipt = "kuchhbhi";
                        continue;
                    }
                    const receipt = await provider.getTransactionReceipt(tx.hash);
                    // if (!receipt) continue;

                    for (let log of receipt.logs) {
                        if (log.address.toLowerCase() === CONTRACT_ADDRESS.toLowerCase()) {
                            const iface = new ethers.Interface(VotingABI.abi);
                            const decodedLog = iface.parseLog(log);

                            if (decodedLog.name === "Voted") {
                                voteDetails.push({
                                    voter: decodedLog.args.voter,
                                    candidateId: decodedLog.args.candidateId.toString()
                                });
                            }
                        }
                    }
                } catch (error) {
                    console.error("Error decoding transaction:", error);
                }

                // console.log(`Transaction ${tx.hash} Logs:`, receipt?.logs || "No logs found");
            }
            fetchedBlocks.push({ block, voteDetails });
        }

        setBlocks(fetchedBlocks);
    }

    useEffect(() => {view_blocks();} , []);

    return (
        <div>
            <h2>Blockchain Voting</h2>
            <p>Account: {account}</p>
            <select onChange={(e) => setSelected(e.target.value)}>
                <option value="">Choose Candidate</option>
                {candidates.map((c) => <option key={c}>{c}</option>)}
            </select>
            <button onClick={vote}>Vote</button>

            <h1>Recent Blocks & Votes</h1>

            {blocks.map(({ block, voteDetails }) => (
                <div key={block.number} style={{ border: "2px solid black", padding: "10px", margin: "10px" }}>
                    <h3>Block #{block.number}</h3>
                    <p><strong>Hash:</strong> {block.hash}</p>
                    <p><strong>Transactions:</strong> {block.transactions.length}</p>

                    <h4>Votes in this block:</h4>
                    {voteDetails.length > 0 ? (
                        voteDetails.map((vote, idx) => (
                            <p key={idx}><strong>Voter:</strong> {vote.voter} voted for <strong>Candidate ID:</strong> {vote.candidateId}</p>
                        ))
                    ) : (
                        <p>No votes in this block.</p>
                    )}
                </div>
            ))}




            <h1>Recent Blocks (Full Details)</h1>
            {blocks.map((block) => (
                <div key={block.number} style={{ border: "2px solid black", padding: "10px", margin: "10px" }}>
                    <h3>Block #{block.number}</h3>
                    <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
                        {JSON.stringify(block, null, 2)}
                    </pre>
                </div>
            ))}
        </div>
    );
}

export default App;
