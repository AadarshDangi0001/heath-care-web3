import React , {useState , useEffect} from "react";
import {ethers , BrowserProvider} from 'ethers';

const HealthCare =  () => {
    const[isOwner , setIsOwner] = useState("")
    const[currentAccountAddress , setCurrentAccountAddress] = useState("")
    const[authorizeUser , setAuthorizeUser] = useState("")
    const[smartContract, setSmartContract] = useState("")
    const[patientId , setPatientId] = useState()
    const[patientName , setpatientName] = useState("")
    const[patientDiagnosis , setpatientDiagnosis] = useState("")
    const[patientTreatment , setpatientTreatment] = useState("")
    const [CurrentPatientId , setCurrentPatientId] = useState()
    const [allRecord , setAllRecord] = useState([])
    const contractAdress = "0xBc155394E58A75b918BB98e8323b7D0FcDFA2682";
    const contractABI = [
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "patientID",
                    "type": "uint256"
                },
                {
                    "internalType": "string",
                    "name": "_patient_name",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "_diagnosis",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "_treatment",
                    "type": "string"
                }
            ],
            "name": "addPatientRecord",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "provider",
                    "type": "address"
                }
            ],
            "name": "authorizeTheProvider",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "name": "authorizedUser",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_patient_id",
                    "type": "uint256"
                }
            ],
            "name": "fetchAllRecords",
            "outputs": [
                {
                    "components": [
                        {
                            "internalType": "uint256",
                            "name": "record_id",
                            "type": "uint256"
                        },
                        {
                            "internalType": "string",
                            "name": "patient_name",
                            "type": "string"
                        },
                        {
                            "internalType": "string",
                            "name": "diagnosis",
                            "type": "string"
                        },
                        {
                            "internalType": "string",
                            "name": "treatment",
                            "type": "string"
                        },
                        {
                            "internalType": "uint256",
                            "name": "timestamp",
                            "type": "uint256"
                        }
                    ],
                    "internalType": "struct HealthCareSystem.Record[]",
                    "name": "",
                    "type": "tuple[]"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getOwner",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "owner",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "name": "patientRecords",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "record_id",
                    "type": "uint256"
                },
                {
                    "internalType": "string",
                    "name": "patient_name",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "diagnosis",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "treatment",
                    "type": "string"
                },
                {
                    "internalType": "uint256",
                    "name": "timestamp",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ]

    

        useEffect(()=>{
            const connectWallet = async()=>{
                    try{
                        if(!window.ethereum){
                            alert("Please install MetaMask or another injected wallet")
                            return
                        }

                        const provider = new ethers.BrowserProvider(window.ethereum)
                        // request accounts (this will also make MetaMask popup)
                        await window.ethereum.request({method: "eth_requestAccounts"})

                        const network = await provider.getNetwork()
                        console.log('Connected network:', network)

                        const signer = await provider.getSigner()
                        const accountAddress = await signer.getAddress()
                        console.log('accountAddress type:', typeof accountAddress);

                        setCurrentAccountAddress(accountAddress);

                        // Check that there is contract code at the configured address on the connected network
                        // If getCode returns '0x' there's no contract deployed at that address on this chain
                        const code = await provider.getCode(contractAdress)
                        console.log('contract code at address:', contractAdress, code)
                        if(code === '0x'){
                            console.error('No contract found at the provided address on the connected network')
                            alert('No contract found at the provided address on the connected network. Please switch MetaMask to the correct network or deploy the contract to this network.')
                            return
                        }

                        const contract = new ethers.Contract(contractAdress,contractABI,signer)
                        setSmartContract(contract)

                        // Wrap the read call in try/catch so we surface clearer errors instead of raw decode failures
                        try{
                            const owner = await contract.getOwner();
                            if(owner){
                                setIsOwner(accountAddress.toLowerCase() === owner.toLowerCase())
                            } else {
                                console.warn('getOwner returned empty value', owner)
                            }
                        }catch(callErr){
                            console.error('Failed to read owner from contract:', callErr)
                            // Most likely causes: wrong ABI/address or the node returned empty result (no contract at address / wrong chain)
                            alert('Failed to read contract owner. Check console for details and verify the contract address & network.')
                        }

                    }catch(err){
                        console.error('connectWallet error:', err)
                    }
            }
            connectWallet()
        },[])

    const authorizeProvider = async()=>{
        try{
                     if(!smartContract){
                         alert('Connect wallet first')
                         return
                     }
                     const authorizedPerson = await smartContract.authorizeTheProvider(authorizeUser)
                     setAuthorizeUser("")
           
        }catch(error){
            console.log("error",error);   
        }
    }

    const addRecords = async()=>{
        try{
                 if(!smartContract){
                     alert('Connect wallet first')
                     return
                 }
                 const patientInfo=   await smartContract.addPatientRecord(patientId,patientName,patientDiagnosis,patientTreatment)
         console.log(patientInfo);
         setPatientId("")
         setpatientName("")
         setpatientDiagnosis("")
         setpatientTreatment("")
        }catch(error){
            console.log("error" , error);
        }
    }

    const fetchPatientRecords = async()=>{
          try{
                         if(!smartContract){
                             alert('Connect wallet first')
                             return
                         }
                         const data = await smartContract.fetchAllRecords(CurrentPatientId)
             setAllRecord(data)
             
          }catch(error){
           console.log("error" , error);     
          }
    }
    
    return (
        <div className='container'>
            <h1 className="title">HealthCare Application</h1>
            {currentAccountAddress &&<p className='account-info'>Connected Account: {currentAccountAddress}</p>}
            {isOwner && <p className='owner-info'>You are the contract owner</p>}

            <div className='form-section'>
                <h2>Fetch Patient Records</h2>
                <input className='input-field' type='text' placeholder='Enter Patient ID' value={CurrentPatientId}
                onChange={(e)=> setCurrentPatientId(e.target.value)}/>
                <button className='action-button' onClick={fetchPatientRecords}>Fetch Records</button>
            </div>

            <div className="form-section">
                <h2>Add Patient Record</h2>
                <input className='input-field' type='text' placeholder='pateint ID' value={patientId}
                onChange={(e)=>setPatientId(e.target.value)}/>
                <input className='input-field' type='text' placeholder='pateint name' value={patientName}
                 onChange={(e)=>setpatientName(e.target.value)} />
                <input className='input-field' type='text' placeholder='Diagnosis' value={patientDiagnosis}
                onChange={(e)=>setpatientDiagnosis(e.target.value)} />
                <input className='input-field' type='text' placeholder='Treatment' value={patientTreatment}
                onChange={(e)=>setpatientTreatment(e.target.value)} />
                <button className='action-button' onClick={addRecords}>Add Records</button>

            </div>
            <div className="form-section">
                <h2>Authorize HealthCare Provider</h2>
                <input className='input-field' type="text" placeholder='Provider Address' value={authorizeUser}
                 onChange={(e)=>setAuthorizeUser(e.target.value)}/>
                <button className='action-button' onClick={authorizeProvider}>Authorize Provider</button>
            </div>

            { <div className='records-section'>
                <h2>Patient Records</h2>
                {allRecord.map((record, index) => (
                    <div key={index}>
                        <p>Record ID: {record.record_id}</p>
                        <p>Diagnosis: {record.diagnosis}</p>
                        <p>Treatment: {record.treatment}</p>
                        <p>Timestamp: {new Date(Number(record.timestamp) * 1000).toLocaleString()}</p>
                    </div>
                ))}
            </div> }

        </div>

    )

}

export default HealthCare;