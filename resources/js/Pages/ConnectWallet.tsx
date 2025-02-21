
import React, { useState, useEffect } from 'react';
import { ethers, providers } from 'ethers';
import { Head, router, PageProps } from '@inertiajs/react'; 
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';
import axios from 'axios';

interface ConnectWalletProps extends PageProps {
    
}

const ConnectWalletPage: React.FC<ConnectWalletProps> = () => {
    const [web3Provider, setWeb3Provider] = useState<providers.Web3Provider | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [signer, setSigner] = useState<ethers.Signer | null>(null);
    const [account, setAccount] = useState<string | null>(null);

    useEffect(() => {
        const init = async () => {
            if (typeof window.ethereum !== 'undefined') {
                try {
                    const web3Provider = new providers.Web3Provider(window.ethereum, "any");
                    setWeb3Provider(web3Provider);

                    const accounts = await web3Provider.listAccounts();
                    if (accounts.length > 0) {
                        const signerInstance = web3Provider.getSigner();
                        setSigner(signerInstance);
                        setIsConnected(true);
                        setAccount(accounts[0]);
                    }

                    window.ethereum.on('accountsChanged', (accounts: string[]) => {
                        if (accounts.length > 0) {
                            setSigner(web3Provider.getSigner(accounts[0]));
                            setAccount(accounts[0]);
                        } else {
                            setSigner(null);
                            setIsConnected(false);
                            setAccount(null);
                        }
                    });

                    window.ethereum.on('chainChanged', () => {
                        window.location.reload();
                    });

                } catch (error: any) {
                    console.error("Could not connect to wallet:", error);
                    toast.error("Échec de la connexion au portefeuille.");
                }
            } else {
                console.error("No wallet provider found");
                toast.error("Aucun fournisseur de portefeuille détecté.");
            }
        };

        init();

        return () => {
            if (window.ethereum) {
                window.ethereum.removeAllListeners('accountsChanged');
                window.ethereum.removeAllListeners('chainChanged');
            }
        };
    }, []);

    const connectWallet = async () => {
        if (web3Provider) {
            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                const signerInstance = web3Provider.getSigner();
                setSigner(signerInstance);
                setIsConnected(true);
                const accounts = await web3Provider.listAccounts();
                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                }
                await axios.post('/set-ethereum-connected');

                
                router.visit('/dashboard'); 

            } catch (error: any) {
                console.error("User rejected request", error);
                toast.error("Connexion au portefeuille refusée.");
            }
        }
    };

    const disconnectWallet = async () => {
        setSigner(null);
        setIsConnected(false);
        setAccount(null);

        
        await axios.post('/unset-ethereum-connected');
    };


    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-black text-white min-h-screen flex flex-col items-center justify-center"
        >
            <Head title="Connect Wallet" />
            <h1 className="text-4xl font-bold mb-8 text-orange-500">Connect to Wallet</h1>
            {!isConnected ? (
                <button
                    onClick={connectWallet}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-full transition-colors duration-200"
                >
                    Connect Wallet
                </button>
            ) : (
                <div className="text-center">
                    <p className="text-lg mb-4">Connected: <span className="text-orange-400">{account}</span></p>
                    <button
                        onClick={disconnectWallet}
                        className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-6 rounded-full transition-colors duration-200"
                    >
                        Disconnect
                    </button>
                </div>
            )}
            <ToastContainer />
        </motion.div>
    );
};

export default ConnectWalletPage;