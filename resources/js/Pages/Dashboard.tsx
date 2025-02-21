import { motion } from 'framer-motion';
import { Head, usePage, PageProps } from '@inertiajs/react';
import { useEffect, useState, Fragment } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { ethers, providers } from 'ethers';
import React from 'react';

interface Allowance {
  id: number;
  contract_address: string;
  owner_address: string;
  spender_address: string;
  amount: string;
  block_number: number | null;
  tx_hash: string | null;
  created_at: string;
  updated_at: string;
}

interface DashboardProps extends PageProps {
  allowances: {
    id: number;
    address: string;
    token: string;
    allowance: string;
    created_at: string;
    updated_at: string;
  }[];
}

const Dashboard: React.FC<DashboardProps> = ({ allowances }) => {
  const [allowancesData, setAllowancesData] = useState<Allowance[]>(allowances);
  const [web3Provider, setWeb3Provider] = useState<providers.Web3Provider | null>(null); // Remnomé
  const [isConnected, setIsConnected] = useState(false);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAllowance, setEditingAllowance] = useState<Allowance | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<{
    contract_address: string;
    owner_address: string;
    spender_address: string;
    amount: string;
  }>();
    useEffect(() => {
        const init = async () => {
            if (typeof window.ethereum !== 'undefined') {
                try {
                    const providerInstance = new providers.Web3Provider(window.ethereum, "any"); 
                    setWeb3Provider(providerInstance); 

                    const accounts = await providerInstance.listAccounts();
                    if (accounts.length > 0) {
                        const signerInstance = providerInstance.getSigner();
                        setSigner(signerInstance);
                        setIsConnected(true);
                    }
                    

                    window.ethereum.on('accountsChanged', (accounts: string[]) => {
                        if (accounts.length > 0) {
                            setSigner(providerInstance.getSigner(accounts[0]));
                        } else {
                            setSigner(null);
                            setIsConnected(false);
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



  useEffect(() => {
    const fetchAllowances = async () => {
      try {
        const response = await axios.get('/api/allowances');
        setAllowancesData(response.data.allowances);
      } catch (error) {
        console.error("Erreur lors du chargement des autorisations:", error);
        toast.error("Erreur lors du chargement des autorisations.");
      }
    };
    fetchAllowances();
  }, []);


    const openAddModal = () => {
      setIsAddModalOpen(true);
      if (signer) {
          signer.getAddress().then(address => {
              setValue('owner_address', address);
          }).catch(err => {
              console.error("Failed to get address:", err);
              toast.error("Failed to get wallet address.");
          });
      }
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    reset();
  };

  const openEditModal = (allowance: Allowance) => {
    setEditingAllowance(allowance);
    setIsEditModalOpen(true);
    Object.entries(allowance).forEach(([key, value]) => {
      if (key === 'amount') {
        setValue(key, ethers.utils.formatUnits(value, 18));
      } else {
        setValue(key, value);
      }
    });
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingAllowance(null);
    reset();
  };


    const handleAddSubmit = async (data: { contract_address: string; owner_address: string; spender_address: string; amount: string }) => {
        if (!validateForm(data)) return;
        try {
            const response = await axios.post('/api/allowances', {
                ...data,
                amount: ethers.utils.parseUnits(data.amount, 18).toString(),
            });
            setAllowancesData([...allowancesData, response.data.allowance]);
            closeAddModal();
            toast.success('Autorisation ajoutée avec succès!');
        } catch (error: any) {
            handleApiError(error);
        }
    };

    const handleEditSubmit = async (data: { contract_address: string; owner_address: string; spender_address: string; amount: string }) => {
        if (!editingAllowance || !validateForm(data)) return;

        try {
          const response = await axios.put(`/api/allowances/${editingAllowance.id}`, {
            ...data,
            amount: ethers.utils.parseUnits(data.amount, 18).toString(),
          });

          setAllowancesData(
            allowancesData.map((a) => (a.id === editingAllowance.id ? response.data.allowance : a))
          );
          closeEditModal();
          toast.success('Autorisation mise à jour avec succès!');
        } catch (error: any) {
          handleApiError(error);
        }
    };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette autorisation ?')) return;

    try {
      await axios.delete(`/api/allowances/${id}`);
      setAllowancesData(allowancesData.filter((a) => a.id !== id));
      toast.success('Autorisation supprimée avec succès!');
    } catch (error: any) {
      handleApiError(error);
    }
  };

  const validateForm = (data: { contract_address: string; owner_address: string; spender_address: string; amount: string }): boolean => {
    if (!ethers.utils.isAddress(data.contract_address)) {
      toast.error("Adresse du contrat invalide.");
      return false;
    }
    if (!ethers.utils.isAddress(data.spender_address)) {
      toast.error("Adresse du dépensier invalide.");
      return false;
    }
    return true;
  };

  const handleApiError = (error: any) => {
    if (axios.isAxiosError(error) && error.response) {
      const errors = error.response.data.errors;
      if (errors) {
        Object.keys(errors).forEach((key) => {
          errors[key].forEach((message: string) => toast.error(message));
        });
      } else {
        toast.error("Une erreur s'est produite lors de la requête.");
      }
    } else {
      console.error("Erreur inattendue:", error);
      toast.error("Une erreur inattendue s'est produite.");
    }
  };

    const connectWallet = async () => {
        if (web3Provider) { 
            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                const signerInstance = web3Provider.getSigner();
                setSigner(signerInstance);
                setIsConnected(true);

            } catch (error: any) {
                console.error("User rejected request", error);
                toast.error("Connexion au portefeuille refusée.");
            }
        }
    };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 bg-black text-white min-h-screen"
    >
      <Head title="Tableau de Bord des Autorisations" />

      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Tableau de Bord des Autorisations</h1>

        {!isConnected && (
            <button onClick={connectWallet} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Connect Wallet
            </button>
        )}
      </div>

      <div className="mb-4">
        <button onClick={openAddModal} className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded">
          Ajouter une Autorisation
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Contrat
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Propriétaire
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Dépensier
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Montant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-900 divide-y divide-gray-700">
            {allowancesData.map((allowance) => (
              <tr key={allowance.id}>
                <td className="px-6 py-4 whitespace-nowrap">{allowance.contract_address}</td>
                <td className="px-6 py-4 whitespace-nowrap">{allowance.owner_address}</td>
                <td className="px-6 py-4 whitespace-nowrap">{allowance.spender_address}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {ethers.utils.formatUnits(allowance.amount, 18)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => openEditModal(allowance)}
                    className="text-blue-500 hover:text-blue-700 mr-2"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(allowance.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Supprimer
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      
      <Transition appear show={isAddModalOpen} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={closeAddModal}>
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
            </Transition.Child>

            <span className="inline-block h-screen align-middle" aria-hidden="true">
              ​
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                  Ajouter une Autorisation
                </Dialog.Title>
                <form onSubmit={handleSubmit(handleAddSubmit)} className="mt-4">
                  <div className="mb-4">
                    <label htmlFor="contract_address" className="block text-sm font-medium text-gray-700">
                      Adresse du Contrat
                    </label>
                    <input
                      type="text"
                      id="contract_address"
                      {...register("contract_address", { required: "L'adresse du contrat est requise." })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    {errors.contract_address && (
                      <p className="mt-2 text-sm text-red-600">{errors.contract_address.message}</p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label htmlFor="owner_address" className="block text-sm font-medium text-gray-700">
                      Adresse du Propriétaire
                    </label>
                    <input
                      type="text"
                      id="owner_address"
                      {...register("owner_address", { required: "L'adresse du propriétaire est requise." })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      readOnly
                    />
                    {errors.owner_address && (
                      <p className="mt-2 text-sm text-red-600">{errors.owner_address.message}</p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label htmlFor="spender_address" className="block text-sm font-medium text-gray-700">
                      Adresse du Dépensier
                    </label>
                    <input
                      type="text"
                      id="spender_address"
                      {...register("spender_address", { required: "L'adresse du dépensier est requise." })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    {errors.spender_address && (
                      <p className="mt-2 text-sm text-red-600">{errors.spender_address.message}</p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                      Montant de l'Autorisation
                    </label>
                    <input
                      type="text"
                      id="amount"
                      {...register("amount", { required: "Le montant est requis." })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    {errors.amount && (
                      <p className="mt-2 text-sm text-red-600">{errors.amount.message}</p>
                    )}
                  </div>

                  <div className="mt-4">
                    <button
                      type="submit"
                      className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
                    >
                      Ajouter
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 ml-3"
                      onClick={closeAddModal}
                    >
                      Annuler
                    </button>
                  </div>

                </form>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
      
      <Transition appear show={isEditModalOpen} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={closeEditModal}>
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
            </Transition.Child>

            <span className="inline-block h-screen align-middle" aria-hidden="true">
              ​
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                  Modifier l'autorisation
                </Dialog.Title>
                <form onSubmit={handleSubmit(handleEditSubmit)} className="mt-4">
                  <div className="mb-4">
                    <label htmlFor="contract_address" className="block text-sm font-medium text-gray-700">
                      Adresse du Contrat
                    </label>
                    <input
                      type="text"
                      id="contract_address"
                      {...register("contract_address", { required: "L'adresse du contrat est requise." })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    {errors.contract_address && (
                      <p className="mt-2 text-sm text-red-600">{errors.contract_address.message}</p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label htmlFor="owner_address" className="block text-sm font-medium text-gray-700">
                      Adresse du Propriétaire
                    </label>
                    <input
                      type="text"
                      id="owner_address"
                      {...register("owner_address", { required: "L'adresse du propriétaire est requise." })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      readOnly
                    />
                    {errors.owner_address && (
                      <p className="mt-2 text-sm text-red-600">{errors.owner_address.message}</p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label htmlFor="spender_address" className="block text-sm font-medium text-gray-700">
                      Adresse du Dépensier
                    </label>
                    <input
                      type="text"
                      id="spender_address"
                      {...register("spender_address", { required: "L'adresse du dépensier est requise." })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    {errors.spender_address && (
                      <p className="mt-2 text-sm text-red-600">{errors.spender_address.message}</p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                      Montant de l'Autorisation
                    </label>
                    <input
                      type="text"
                      id="amount"
                      {...register("amount", { required: "Le montant est requis." })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    {errors.amount && (
                      <p className="mt-2 text-sm text-red-600">{errors.amount.message}</p>
                    )}
                  </div>


                  <div className="mt-4">
                    <button
                      type="submit"
                      className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
                    >
                      Enregistrer
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 ml-3"
                      onClick={closeEditModal}
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      <ToastContainer />
    </motion.div>
  );
};

export default Dashboard;