import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../lib/supabase';
import { Upload, CheckCircle, Car, AlertCircle, Loader2 } from 'lucide-react';

const BRANCHES_LIST = [
  "Artificial Intelligence (AI)",
  "Artificial Intelligence & Data Science (AI & DS)",
  "Artificial Intelligence & Machine Learning (AI & ML)",
  "Automobile Engineering",
  "Biotechnology",
  "Chemistry",
  "Civil Engineering",
  "Computer Science and Business Systems (CSBS)",
  "Computer Science and Engineering (CSE)",
  "Cyber Security (CyS)",
  "Data Science (DS)",
  "Electrical and Electronics Engineering",
  "Electronics and Communication Engineering",
  "Electronics and Instrumentation Engineering",
  "Electronics Engineering (VLSI Design & Technology)",
  "Information Technology",
  "Internet of Things (IoT)"
].sort();

const DEPARTMENTS_LIST = [
  "Automobile Engineering",
  "Biotechnology",
  "Chemistry",
  "Civil Engineering",
  "Computer Science and Engineering & CSBS",
  "CSE-(CyS, DS) and AI & DS",
  "CSE-AIML & IoT",
  "Electrical and Electronics Engineering",
  "Electronics and Communication Engineering",
  "Electronics and Instrumentation Engineering",
  "Electronics Engineering (VLSI Design & Technology)",
  "Information Technology"
].sort();

interface FormValues {
  fullName: string;
  role: string;
  department: string;
  rollNumber: string;
  facultyId: string;
  year: string;
  section: string;
  phone: string;
  email: string;
  parentPhone: string;
  dlNumber: string;
  plateNumber: string;
  vehicleType: string;
  drivingLicense: FileList;
  idCard: FileList;
}

export default function RegistrationForm({ user }: { user: { role: string; email: string } }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid }
  } = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: {
      role: user.role,
      email: user.email
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const uploadFile = async (file: File, folderName: string) => {
    const fileExt = file.name.split('.').pop();
    // We will save to: {folderName}/{role}/{emailRef}-{randomStr}.{ext}
    const emailPrefix = user.email.split('@')[0];
    const randomStr = Math.random().toString(36).substring(7);
    const filePath = `${folderName}/${user.role}/${emailPrefix}-${randomStr}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) {
      throw new Error(`Failed to upload file: ${uploadError.message}`);
    }

    const { data: urlData } = supabase.storage.from('documents').getPublicUrl(filePath);
    return urlData.publicUrl;
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setIsLoading(true);
      setSubmitError(null);

      // 1. Check if vehicle number already exists
      const { data: existingVehicle, error: countError } = await supabase
        .from('vehicles')
        .select('plate_number')
        .eq('plate_number', data.plateNumber.toUpperCase())
        .limit(1)
        .single();

      if (existingVehicle) {
        throw new Error('This vehicle plate number is already registered.');
      } else if (countError && countError.code !== 'PGRST116') {
        // PGRST116 means zero rows returned from .single() which is good
        throw new Error(`Error checking plate number: ${countError.message}`);
      }

      // 2. Upload files to organized folders
      const dlFile = data.drivingLicense[0];
      const idFile = data.idCard[0];

      let dlUrl = '';
      let idUrl = '';

      if (dlFile) dlUrl = await uploadFile(dlFile, 'driving-licenses');
      if (idFile) idUrl = await uploadFile(idFile, 'id-cards');

      // 3. Insert user data based on role
      const table = user.role === 'Student' ? 'students' : 'faculty';

      const insertData: any = {
        full_name: data.fullName,
        phone: data.phone,
        email: data.email,
        dl_number: data.dlNumber.toUpperCase(),
        dl_url: dlUrl,
        id_card_url: idUrl
      };

      if (user.role === 'Student') {
        insertData.branch = data.department;
        insertData.roll_number = data.rollNumber.toUpperCase();
        insertData.year = data.year;
        insertData.section = data.section;
        insertData.parent_guardian_phone = data.parentPhone;
      } else {
        insertData.department = data.department;
        insertData.faculty_id_number = data.facultyId.toUpperCase();
        insertData.parent_spouse_phone = data.parentPhone;
      }

      const { data: userData, error: userError } = await supabase
        .from(table)
        .insert(insertData)
        .select('id')
        .single();

      if (userError) {
        if (userError.code === '23505') {
          throw new Error('This email is already registered as an owner.');
        }
        throw new Error(`User creation failed: ${userError.message}`);
      }

      // 4. Insert vehicle data
      const vehicleInsertData: any = {
        plate_number: data.plateNumber.toUpperCase(),
        vehicle_type: data.vehicleType,
        status: 'pending'
      };

      if (user.role === 'Student') {
        vehicleInsertData.student_id = userData.id;
      } else {
        vehicleInsertData.faculty_id = userData.id;
      }

      const { error: vehicleError } = await supabase
        .from('vehicles')
        .insert(vehicleInsertData);

      if (vehicleError) throw new Error(`Vehicle registration failed: ${vehicleError.message}`);

      // Success
      setIsSuccess(true);
      reset();
    } catch (err: any) {
      setSubmitError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-2xl mx-auto p-8 bg-white shadow-xl rounded-2xl flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Vehicle Registered Successfully</h2>
        <p className="text-lg text-gray-600 mb-8 max-w-md">
          Your vehicle details and documents have been submitted and are currently awaiting verification.
        </p>
        <button
          onClick={() => setIsSuccess(false)}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Register Another Vehicle
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-8 xl:p-10 bg-white shadow-2xl rounded-3xl mt-8 mb-8 border border-gray-100">
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
        <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
          <Car size={32} />
        </div>
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Vehicle Registration</h2>
          <p className="text-gray-500 mt-1">Register your vehicle for the campus monitoring system</p>
        </div>
      </div>

      {submitError && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="flex-1 font-medium">{submitError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">

        {/* Owner Details Section */}
        <section>
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm mr-3">1</span>
            Owner Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Full Name</label>
              <input
                {...register('fullName', { required: 'Full name is required' })}
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                placeholder="John Doe"
              />
              {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Role</label>
              <select
                {...register('role', { required: 'Role is required' })}
                disabled
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed appearance-none"
              >
                <option value="Student">Student</option>
                <option value="Faculty">Faculty</option>
              </select>
              {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                {user.role === 'Student' ? 'Branch' : 'Department'}
              </label>
              <div className="relative">
                <select
                  {...register('department', { required: `${user.role === 'Student' ? 'Branch' : 'Department'} is required` })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white appearance-none"
                >
                  <option value="">Select your {user.role === 'Student' ? 'branch' : 'department'}</option>
                  {(user.role === 'Student' ? BRANCHES_LIST : DEPARTMENTS_LIST).map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
              {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Email Address</label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' }
                })}
                type="email"
                disabled
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
                placeholder="john@university.edu"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Phone Number</label>
              <input
                {...register('phone', {
                  required: 'Phone number is required',
                  pattern: { value: /^\d{10}$/, message: 'Phone number must be exactly 10 digits' }
                })}
                type="tel"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                placeholder="1234567890"
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
            </div>

            {user.role === 'Student' && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Roll Number</label>
                  <input
                    {...register('rollNumber', {
                      required: 'Roll number is required',
                      pattern: { value: /^[A-Z0-9]{10}$/i, message: 'Invalid format (e.g., 24071A6799)' }
                    })}
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white uppercase"
                    placeholder="24071A6799"
                  />
                  {errors.rollNumber && <p className="text-red-500 text-sm mt-1">{errors.rollNumber.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Year of Study</label>
                  <div className="relative">
                    <select
                      {...register('year', { required: 'Year is required' })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white appearance-none"
                    >
                      <option value="">Select Year</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                  {errors.year && <p className="text-red-500 text-sm mt-1">{errors.year.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Section</label>
                  <div className="relative">
                    <select
                      {...register('section', { required: 'Section is required' })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white appearance-none"
                    >
                      <option value="">Select Section</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                  {errors.section && <p className="text-red-500 text-sm mt-1">{errors.section.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Driving License Number</label>
                  <input
                    {...register('dlNumber', {
                      required: 'Driving license number is required',
                      pattern: {
                        value: /^[A-Z]{2}[ -]?[0-9]{2}[ -]?[0-9]{4}[ -]?[0-9]{7}$/i,
                        message: 'Invalid DL format (e.g., MH14 20110062821)'
                      }
                    })}
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white uppercase"
                    placeholder="MH14 20110062821"
                  />
                  {errors.dlNumber && <p className="text-red-500 text-sm mt-1">{errors.dlNumber.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Parent/Guardian Phone</label>
                  <input
                    {...register('parentPhone', {
                      required: 'Secondary phone number is required',
                      pattern: { value: /^\d{10}$/, message: 'Phone number must be exactly 10 digits' }
                    })}
                    type="tel"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                    placeholder="0987654321"
                  />
                  {errors.parentPhone && <p className="text-red-500 text-sm mt-1">{errors.parentPhone.message}</p>}
                </div>
              </>
            )}

            {user.role === 'Faculty' && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Faculty ID Number</label>
                  <input
                    {...register('facultyId', {
                      required: 'Faculty ID is required',
                      pattern: { value: /^[A-Z0-9]+$/i, message: 'Invalid format' }
                    })}
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white uppercase"
                    placeholder="EMP123"
                  />
                  {errors.facultyId && <p className="text-red-500 text-sm mt-1">{errors.facultyId.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Driving License Number</label>
                  <input
                    {...register('dlNumber', {
                      required: 'Driving license number is required',
                      pattern: {
                        value: /^[A-Z]{2}[ -]?[0-9]{2}[ -]?[0-9]{4}[ -]?[0-9]{7}$/i,
                        message: 'Invalid DL format (e.g., MH14 20110062821)'
                      }
                    })}
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white uppercase"
                    placeholder="MH14 20110062821"
                  />
                  {errors.dlNumber && <p className="text-red-500 text-sm mt-1">{errors.dlNumber.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Parent/Spouse Phone</label>
                  <input
                    {...register('parentPhone', {
                      required: 'Secondary phone number is required',
                      pattern: { value: /^\d{10}$/, message: 'Phone number must be exactly 10 digits' }
                    })}
                    type="tel"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                    placeholder="0987654321"
                  />
                  {errors.parentPhone && <p className="text-red-500 text-sm mt-1">{errors.parentPhone.message}</p>}
                </div>
              </>
            )}

          </div>
        </section>

        {/* Vehicle Details Section */}
        <section>
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm mr-3">2</span>
            Vehicle Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Vehicle Type</label>
              <div className="grid grid-cols-2 gap-4">
                <label className="relative flex cursor-pointer items-center justify-center p-4 rounded-xl border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-colors bg-white group">
                  <input
                    {...register('vehicleType', { required: 'Please select vehicle type' })}
                    type="radio"
                    value="2-wheeler"
                    className="sr-only"
                  />
                  <div className="text-center">
                    <span className="block font-medium text-gray-700 group-hover:text-blue-700">2-Wheeler</span>
                  </div>
                </label>
                <label className="relative flex cursor-pointer items-center justify-center p-4 rounded-xl border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-colors bg-white group">
                  <input
                    {...register('vehicleType', { required: 'Please select vehicle type' })}
                    type="radio"
                    value="4-wheeler"
                    className="sr-only"
                  />
                  <div className="text-center">
                    <span className="block font-medium text-gray-700 group-hover:text-blue-700">4-Wheeler</span>
                  </div>
                </label>
              </div>
              {errors.vehicleType && <p className="text-red-500 text-sm mt-1">{errors.vehicleType.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Vehicle / Plate Number</label>
              <input
                {...register('plateNumber', { required: 'Plate number is required' })}
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white uppercase"
                placeholder="ABC 1234"
              />
              {errors.plateNumber && <p className="text-red-500 text-sm mt-1">{errors.plateNumber.message}</p>}
            </div>

          </div>
        </section>

        {/* Document Upload Section */}
        <section>
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm mr-3">3</span>
            Document Uploads
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Upload Driving License (Image/PDF)</label>
              <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-8 hover:bg-blue-50 hover:border-blue-300 transition-all flex flex-col items-center justify-center text-center cursor-pointer group bg-gray-50 overflow-hidden min-h-[160px]">
                <input
                  {...register('drivingLicense', { required: 'Driving license image is required' })}
                  type="file"
                  accept="image/*,.pdf"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <Upload className="w-8 h-8 text-gray-400 group-hover:text-blue-500 mb-2 transition-colors" />
                <span className="text-sm text-gray-600 font-medium">Click to upload license</span>
                <span className="text-xs text-gray-400 mt-1">PDF, JPG, PNG up to 5MB</span>
              </div>
              {errors.drivingLicense && <p className="text-red-500 text-sm mt-1">{errors.drivingLicense.message as string}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Upload University ID Card</label>
              <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-8 hover:bg-blue-50 hover:border-blue-300 transition-all flex flex-col items-center justify-center text-center cursor-pointer group bg-gray-50 overflow-hidden min-h-[160px]">
                <input
                  {...register('idCard', { required: 'ID card image is required' })}
                  type="file"
                  accept="image/*,.pdf"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <Upload className="w-8 h-8 text-gray-400 group-hover:text-blue-500 mb-2 transition-colors" />
                <span className="text-sm text-gray-600 font-medium">Click to upload ID Card</span>
                <span className="text-xs text-gray-400 mt-1">PDF, JPG, PNG up to 5MB</span>
              </div>
              {errors.idCard && <p className="text-red-500 text-sm mt-1">{errors.idCard.message as string}</p>}
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => reset()}
            className="px-6 py-3 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            disabled={isLoading}
          >
            Clear Form
          </button>
          <button
            type="submit"
            disabled={!isValid || isLoading}
            className={`flex items-center gap-2 px-8 py-3 rounded-lg font-medium text-white shadow-md transition-all ${!isValid || isLoading
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
              }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Registration'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
