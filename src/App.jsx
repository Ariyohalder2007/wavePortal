import React, {useEffect, useState} from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/contractABI.json"


export default function App() {
  const [currentAccount, setCurrentAccount]=useState("");
  const [totalWaves, setTotalWaves]=useState(0);
  const [message, setMessage]=useState("Message");
  
  const contractAddress="0xB06fCf7E88aA9397345e6C4237A580c7C36DabEA";
  const contractABI=abi.abi;
  const [allWaves, setAllWaves] = useState([]);
  const getAllWaves= async ()=>{
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        const waves = await wavePortalContract.getAllWaves();
        let wavesCleaned=[];
        waves.forEach(wave=>{
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp*1000),
            message: wave.message
          })
        })
        setAllWaves(wavesCleaned);
        console.log(allWaves);
        
        } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }
  const getTotalWaves=async()=>{
    try{
      const {ethereum }=window;
      if(ethereum){
        const provider=new ethers.providers.Web3Provider(ethereum);
        const signer=provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress, contractABI, signer);
        let count = await wavePortalContract.getTotalWaves();
        setTotalWaves(count.toNumber());


      }
    }catch(err){
      console.log(err)
    }
  }
  const wave = async () => {
    try{
      const {ethereum }=window;
      if(ethereum ){
        const provider=new ethers.providers.Web3Provider(ethereum);
        const signer=provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress, contractABI, signer);
        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
        const waveTxn=await wavePortalContract.wave(message.length>0?message:"Hola!👋", { gasLimit: 300000 });
        console.log("Mining -- "+waveTxn.hash);
        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());


      }
    }catch(err){
      console.log(err)
    }
  }
  const checkIfWalletIsConnected= async ()  =>{
   try{ 
     const {ethereum }= window;
    if(!ethereum){
      alert("Install Metamask");
    }else{
      console.log("Good to Go");

    }
     const accounts = await ethereum.request({ method: "eth_accounts" });
    if(accounts.length!==0){
      let account=accounts[0];
      console.log("Current Account "+account);
      setCurrentAccount(account);
    }else {
        console.log("No authorized account found")
      }
   }catch(err){
     console.log(err)
   }
  }
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  const handleOnMsgChange=(e) => {
    setMessage(e.target.value);
  }

  useEffect(()=>{
    checkIfWalletIsConnected();
    let wavePortalContract;

    const onNewWave = (from, timestamp, message) => {
    console.log("NewWave", from, timestamp, message);
    setAllWaves(prevState => [
      ...prevState,
      {
        address: from,
        timestamp: new Date(timestamp * 1000),
        message: message,
      },
    ]);
  };
    if (window.ethereum) {
       getTotalWaves();
    getAllWaves();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
    wavePortalContract.on("NewWave", onNewWave);
  }
    return () => {
    if (wavePortalContract) {
      wavePortalContract.off("NewWave", onNewWave);
    }
  };

   
  }, [])
  
  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        👋 Hey there!
        </div>

        <div className="bio">
        I am Ariyo and I worked on Chat Apps so that's pretty cool right? Connect your Ethereum wallet and wave at me!
        </div>
        <div>
          Total Waves:{totalWaves}
        </div>
        <h2 >
        Enter a Message🚀
        </h2>
        <input id="message" value={message} onChange={handleOnMsgChange}/>
        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>
        <button className="waveButton" onClick={()=>{getTotalWaves();getAllWaves();}}>
          Check Waves
        </button>
        
        {!currentAccount && <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>}

        {allWaves.map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>)
        })}
      </div>
    </div>
  );
}
