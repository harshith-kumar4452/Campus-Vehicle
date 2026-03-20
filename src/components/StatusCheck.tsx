import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../lib/supabase';
import { Search, Clock, CheckCircle2, XCircle } from 'lucide-react';

interface StatusForm {
  plateNumber: string;
}

export default function StatusCheck() {
  const { register, handleSubmit, formState: { errors } } = useForm<StatusForm>();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (formData: StatusForm) => { // Renamed data to formData to avoid conflict
    try {
      setIsLoading(true);
      setError(null);
      setResult(null); // Clear previous result

      const { data, error: fetchError } = await supabase
        .from('vehicles')
        .select(`
          plate_number,
          status,
          created_at,
          students (full_name, roll_number, branch),
          faculty (full_name, department)
        `)
        .eq('plate_number', formData.plateNumber.toUpperCase()) // Use formData.plateNumber
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          throw new Error('No vehicle found with this plate number.');
        }
        throw new Error(`Error fetching status: ${fetchError.message}`); // Re-throw as new Error for consistency
      }

      // If data is null (e.g., single() returns no row but no PGRST116 error)
      if (!data) {
        throw new Error('Vehicle not found. Please check the plate number.');
      }

      setResult({
        plateNumber: data.plate_number,
        status: data.status,
        ownerName: data.students?.full_name || data.faculty?.full_name || 'Unknown',
        role: data.students ? 'Student' : (data.faculty ? 'Faculty' : 'Unknown'),
        details: data.students
          ? `Roll: ${data.students.roll_number} | Branch: ${data.students.branch}`
          : (data.faculty ? `Dept: ${data.faculty.department}` : 'N/A'),
        submittedAt: new Date(data.created_at).toLocaleDateString()
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred while checking status.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (statusName: string) => {
    switch (statusName.toLowerCase()) {
      case 'approved':
        return <CheckCircle2 className="w-12 h-12 text-green-500 mb-2" />;
      case 'rejected':
        return <XCircle className="w-12 h-12 text-red-500 mb-2" />;
      case 'pending':
      default:
        return <Clock className="w-12 h-12 text-blue-500 mb-2" />;
    }
  };

  const getStatusColor = (statusName: string) => {
    switch (statusName.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-white shadow-xl rounded-3xl mt-8">
      <div className="flex flex-col items-center mb-8">
        <div className="p-3 bg-gray-50 rounded-full mb-3">
          <Search className="w-8 h-8 text-gray-700" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Check Status</h2>
        <p className="text-sm text-gray-500 mt-1">Enter your vehicle plate number</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input
            {...register('plateNumber', { required: 'Plate number is required' })}
            type="text"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 uppercase text-center font-bold text-lg"
            placeholder="ABC 1234"
          />
          {errors.plateNumber && <p className="text-red-500 text-sm mt-1 text-center">{errors.plateNumber.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">Checking...</span>
          ) : (
            <>Check Status</>
          )}
        </button>
      </form>

      {error && (
        <div className="mt-6 p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 text-center">
          {error}
        </div>
      )}

      {status && (
        <div className="mt-8 flex flex-col items-center p-6 border rounded-2xl bg-gray-50">
          {getStatusIcon(status)}
          <span className="text-gray-500 text-sm font-medium mb-1">Registration Status</span>
          <span className={`px-4 py-1.5 rounded-full text-sm font-bold capitalize border ${getStatusColor(status)}`}>
            {status}
          </span>
        </div>
      )}
    </div>
  );
}
