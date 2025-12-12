import {
  Wallet,
  Shield,
  Building2,
  Calendar,
  CreditCard,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Ban,
} from 'lucide-react';
import { useEffect, useState, useContext } from 'react';
import { UserContext } from './Context/UserContext.jsx';
import api from "./axios.js"
import { useToast } from './Components/ToastContext.jsx';

export default function TenantEscrow() {
  const { userProfile } = useContext(UserContext);
  const { toast } = useToast();
  const [escrowData, setEscrowData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile?.ic) return;
    const fetchEscrowData = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/users/${userProfile.ic}/rental-history`);
        // Extract escrow info and contract info
        const filteredData = data.map(item => ({
          contractId: item.contract.id,
          propertyTitle: item.contract.property.title,
          location: item.contract.property.location,
          amount: item.escrow?.amount || item.contract.deposit_amount,
          status: item.escrow?.status || 'pending',
          escrowId: item.escrow?.id || null,
          paymentDate: item.escrow?.created_at || null,
          paymentMethod: item.escrow?.paymentMethod || 'Fpx',
        }));
        setEscrowData(filteredData);
      } catch (err) {
        console.error(err);
        toast({ title: 'Error', description: 'Failed to fetch escrow data.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchEscrowData();
  }, [userProfile]);

  const handleRequestRelease = async (escrowId) => {
    try {
      const { data } = await api.post(`/escrow/${escrowId}/request-release`);
      toast({ title: 'Release requested', description: 'Your release request has been submitted.', variant: 'success' });
      setEscrowData(prev => prev.map(e => e.escrowId === escrowId ? { ...e, status: 'release_requested' } : e));
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to request release.', variant: 'destructive' });
    }
  };

  if (loading) return <p className="text-muted-foreground">Loading escrow data...</p>;

  const summary = {
    fundsSecured: escrowData.filter(e => e.status === 'secured').reduce((sum, e) => sum + e.amount, 0),
    pendingRelease: escrowData.filter(e => e.status === 'release_requested' || e.status === 'pending').reduce((sum, e) => sum + e.amount, 0),
    totalReleased: escrowData.filter(e => e.status === 'released').reduce((sum, e) => sum + e.amount, 0),
  };

  const escrowSummaryCards = [
    { title: "Funds Secured", icon: Shield, amount: summary.fundsSecured, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { title: "Pending Release", icon: Clock, amount: summary.pendingRelease, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { title: "Total Released", icon: CheckCircle2, amount: summary.totalReleased, color: 'text-blue-500', bg: 'bg-blue-500/10' }
  ];

  return (
    <div className="p-10 flex flex-col space-y-7">
      <div>
        <h1 className="font-bold text-2xl flex flex-row items-center"><Wallet className="mr-3"/> Escrow Management</h1>
        <p className="text-muted-foreground">Manage your rental deposits and payment status</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {escrowSummaryCards.map((card, i) => (
          <div key={i} className="flex flex-row border-2 justify-between p-8 rounded-lg items-center ">
            <div>
              <p>{card.title}</p>
              <h1 className="font-bold text-3xl">{`RM ${card.amount}`}</h1>
            </div>
            <div className={`rounded-lg ${card.bg} p-3`}>
              <card.icon className={`${card.color}`}/>
            </div>
          </div>
        ))}
      </div>

      {/* Escrow Records */}
      <div className="border border-2 rounded-md flex flex-col p-5 space-y-5">
        <div className='rounded-lg'>
          <p className='text-2xl flex flex-row items-center font-bold'>Escrow Record</p>
          <p className='text-muted-foreground'>All your escrow transactions and their current status</p>
        </div>
        <div className='flex flex-col space-y-4'>
          {escrowData.map((e, idx) => (
            <div key={idx} className='rounded-lg border-2 p-5 flex flex-row justify-between'>
              <div className="flex flex-row space-x-3">
                {e.status === 'disputed' ? <AlertCircle className='text-destructive' /> : <Shield className='text-accent' />}
                <div className='flex flex-col space-y-2'>
                  <p className='font-bold'>{e.propertyTitle}</p>
                  <p className='text-muted-foreground'>{e.location}</p>
                  <div className='flex flex-row space-x-3'>
                    <div className='rounded-lg px-3 bg-muted-foreground/10 items-center justify-between flex flex-col'>{e.paymentMethod}</div>
                    {e.paymentDate && <div className='flex flex-row items-center justify-center space-x-2'>
                      <Calendar className='w-4 h-4'/>
                      <p className='text-sm'>Paid: {new Date(e.paymentDate).toLocaleDateString()}</p>
                    </div>}
                  </div>
                </div>
              </div>
              <div className='flex flex-col items-end space-y-2'>
                <p className='font-bold text-lg'>RM{e.amount}</p>
                <div className={`${e.status === 'secured' ? 'text-accent bg-accent/10' : e.status === 'disputed' ? 'text-destructive bg-destructive/20' : 'text-amber-500 bg-amber-100'} p-1 rounded-xl text-sm flex-col flex items-center`}>
                  {e.status.replace('_', ' ').toUpperCase()}
                </div>
                {(e.status === 'secured' || e.status === 'pending') && e.escrowId && (
                  <button
                    onClick={() => handleRequestRelease(e.escrowId)}
                    className='flex flex-row rounded-lg border border-2 bg-muted-foreground/10 items-center text-md p-1'>
                    <ArrowUpRight className='w-5 h-5'/> Request Release
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border border-2 rounded-md flex flex-row p-5 space-x-5 " >
        <Shield className=' w-15 h-15'/>
        <div>
          <p className='font-bold text-lg'>RentSafe Escrow Protection</p>
          <p className='text-muted-foreground text-sm'>Your deposit is securely held in escrow until the end of your tenancy. Funds can only be released when both tenant and landlord agree, or through our dispute resolution process. This protects both parties and ensures fair handling of deposits.</p>
        </div>
      </div>
    </div>
  )
}
