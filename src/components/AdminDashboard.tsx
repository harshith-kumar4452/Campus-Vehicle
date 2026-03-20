import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { CheckCircle, XCircle, Search, ExternalLink, Car } from 'lucide-react';

interface VehicleRegistration {
  id: string;
  plate_number: string;
  vehicle_type: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  students: {
    full_name: string;
    roll_number: string;
    branch: string;
    email: string;
    phone: string;
    dl_url: string;
    id_card_url: string;
    dl_number: string;
    year: string;
    section: string;
  } | null;
  faculty: {
    full_name: string;
    faculty_id_number: string;
    department: string;
    email: string;
    phone: string;
    dl_url: string;
    id_card_url: string;
    dl_number: string;
  } | null;
}

export default function AdminDashboard() {
  const [registrations, setRegistrations] = useState<VehicleRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRegistrations = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('vehicles')
        .select(`
          *,
          students (*),
          faculty (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRegistrations(data || []);
    } catch (err) {
      console.error('Error fetching registrations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const updateStatus = async (vehicleId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .update({ status })
        .eq('id', vehicleId);

      if (error) throw error;
      
      // Update local state
      setRegistrations(prev => prev.map(reg => 
        reg.id === vehicleId ? { ...reg, status } : reg
      ));
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status');
    }
  };

  const filteredRegistrations = registrations.filter(reg => {
    const matchesFilter = filter === 'all' || reg.status === filter;
    const owner = reg.students || reg.faculty;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      reg.plate_number.toLowerCase().includes(searchLower) ||
      owner?.full_name.toLowerCase().includes(searchLower) ||
      (reg.students?.roll_number.toLowerCase().includes(searchLower)) ||
      (reg.faculty?.faculty_id_number.toLowerCase().includes(searchLower));
    
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Admin Dashboard</h2>
          <p className="text-gray-500 mt-1">Review and verify vehicle registration requests</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search plate, name, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm w-64"
            />
          </div>
          
          <div className="flex bg-gray-100 p-1 rounded-xl">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                  filter === f 
                  ? 'bg-white shadow-sm text-blue-700' 
                  : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredRegistrations.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500 font-medium text-lg">No registration requests found matching your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredRegistrations.map((reg) => {
            const owner = reg.students || reg.faculty;
            const isStudent = !!reg.students;
            
            return (
              <div key={reg.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row justify-between gap-6">
                    {/* Left: Plate & Basic Info */}
                    <div className="flex gap-4">
                      <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                        <Car size={32} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="text-xl font-bold text-gray-900">{reg.plate_number}</h4>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            reg.status === 'approved' ? 'bg-green-100 text-green-700' :
                            reg.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {reg.status}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                          {reg.vehicle_type} • Registered {new Date(reg.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Middle: Owner Details */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:px-6 border-gray-100 lg:border-x">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Owner Info</p>
                        <p className="font-bold text-gray-900">{owner?.full_name}</p>
                        <p className="text-sm text-gray-600">{isStudent ? 'Student' : 'Faculty'} • {isStudent ? reg.students?.roll_number : reg.faculty?.faculty_id_number}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Contact</p>
                        <p className="text-sm font-medium text-gray-900">{owner?.email}</p>
                        <p className="text-sm text-gray-600">{owner?.phone}</p>
                      </div>
                    </div>

                    {/* Right: Actions & Links */}
                    <div className="flex flex-col sm:flex-row lg:flex-col justify-center gap-3 shrink-0">
                      <div className="flex gap-2">
                        <a 
                          href={owner?.dl_url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-700 transition-all border border-gray-100"
                        >
                          <ExternalLink size={14} />
                          View DL
                        </a>
                        <a 
                          href={owner?.id_card_url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-700 transition-all border border-gray-100"
                        >
                          <ExternalLink size={14} />
                          View ID
                        </a>
                      </div>
                      
                      {reg.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateStatus(reg.id, 'approved')}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-xl text-xs font-extrabold text-white transition-all shadow-sm"
                          >
                            <CheckCircle size={14} />
                            Approve
                          </button>
                          <button
                            onClick={() => updateStatus(reg.id, 'rejected')}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-xl text-xs font-extrabold text-white transition-all shadow-sm"
                          >
                            <XCircle size={14} />
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Detailed bits */}
                  <div className="mt-4 pt-4 border-t border-gray-50 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Dept/Branch</p>
                      <p className="text-sm font-bold text-gray-700">{isStudent ? reg.students?.branch : reg.faculty?.department}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">DL Number</p>
                      <p className="text-sm font-bold text-gray-700">{owner?.dl_number || 'N/A'}</p>
                    </div>
                    {isStudent && (
                      <>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Year</p>
                          <p className="text-sm font-bold text-gray-700">{reg.students?.year}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Section</p>
                          <p className="text-sm font-bold text-gray-700">{reg.students?.section}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
