// import { useState, useEffect } from 'react';
// import { ArrowLeft, Plus, Package } from 'lucide-react';
// import { useApp } from '../context/AppContext';


// // Mock FG Master Data
// const mockFinishedGoods = [
//   { id: 'FG001', fg_code: 'FG-001', fg_name: 'Hydraulic Cylinder Body', customer_name: 'ABC Industries' },
//   { id: 'FG002', fg_code: 'FG-002', fg_name: 'Motor Housing', customer_name: 'XYZ Manufacturing' },
//   { id: 'FG003', fg_code: 'FG-003', fg_name: 'Bearing Housing', customer_name: 'DEF Corp' },
//   { id: 'FG004', fg_code: 'FG-004', fg_name: 'Valve Body', customer_name: 'GHI Ltd' },
//   { id: 'FG005', fg_code: 'FG-005', fg_name: 'Pump Casing', customer_name: 'JKL Industries' },
//   { id: 'FG006', fg_code: 'FG-006', fg_name: 'Shaft Coupling', customer_name: 'MNO Works' },
//   { id: 'FG007', fg_code: 'FG-007', fg_name: 'Gearbox Housing', customer_name: 'PQR Automotive' },
//   { id: 'FG008', fg_code: 'FG-008', fg_name: 'Flange Adapter', customer_name: 'STU Engineering' },
// ];

// export function CreateCuttingJob() {
//   const { currentUser, setCurrentScreen } = useApp();
  
//   // Auto-generate job order number
//   const generateJobOrderNumber = () => {
//     const today = new Date();
//     const year = today.getFullYear();
//     const month = String(today.getMonth() + 1).padStart(2, '0');
//     const randomNum = Math.floor(Math.random() * 9000) + 1000;
//     return `WO-${year}-${month}-${randomNum}`;
//   };

//   const [formData, setFormData] = useState({
//     job_order_no: generateJobOrderNumber(),
//     job_date: new Date().toISOString().split('T')[0],
//     shift: currentUser?.shift || 'DAY',
//     operator_id: currentUser?.role === 'OPERATOR' ? currentUser.id : '',
//     supervisor_id: '',
//     machine_id: '',
//     fg_code: '',
//     material_id: '',
//     rm_batch_no: '',
//     raw_material_weight_kg: '',
//     planned_output_qty: '',
//     notes: ''
//   });

//   const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
//   const [selectedFG, setSelectedFG] = useState<any>(null);

//   const activeMachines = mockMachines.filter(m => m.status === 'ACTIVE');
//   const activeMaterials = mockMaterials.filter(m => m.status === 'ACTIVE' && m.current_stock_qty > 0);
//   const supervisors = mockUsers.filter(u => u.role === 'SUPERVISOR' && u.is_active);
//   const operators = mockUsers.filter(u => u.role === 'OPERATOR' && u.is_active);

//   // When material is selected, auto-populate details
//   useEffect(() => {
//     if (formData.material_id) {
//       const material = mockMaterials.find(m => m.id === formData.material_id);
//       setSelectedMaterial(material);
//     } else {
//       setSelectedMaterial(null);
//     }
//   }, [formData.material_id]);

//   // When finished good is selected, auto-populate details
//   useEffect(() => {
//     if (formData.fg_code) {
//       const fg = mockFinishedGoods.find(f => f.fg_code === formData.fg_code);
//       setSelectedFG(fg);
//     } else {
//       setSelectedFG(null);
//     }
//   }, [formData.fg_code]);

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
    
//     // Generate scrap tracking ID
//     const scrapTrackingId = `SCR-TRK-${Date.now()}`;
    
//     console.log('Creating job with data:', {
//       ...formData,
//       scrap_tracking_id: scrapTrackingId,
//       status: 'PLANNED',
//       sap_updated: false,
//     });
    
//     alert(`Job Order ${formData.job_order_no} created successfully!\nScrap Tracking ID: ${scrapTrackingId}`);
//     setCurrentScreen('my-jobs');
//   };

//   const calculateRMCost = () => {
//     if (selectedMaterial && formData.raw_material_weight_kg) {
//       return parseFloat(formData.raw_material_weight_kg) * selectedMaterial.cost_per_kg;
//     }
//     return 0;
//   };

//   return (
//     <div>
//       <div className="mb-4 lg:mb-6">
//         <div className="flex items-center gap-4 mb-4">
//           <button
//             onClick={() => setCurrentScreen('my-jobs')}
//             className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//           >
//             <ArrowLeft className="w-5 h-5" />
//           </button>
//           <div>
//             <h1 className="text-gray-900">Create Cutting Job</h1>
//             <p className="text-gray-600 text-sm lg:text-base">Set up a new cutting operation</p>
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
//         {/* Main Form */}
//         <div className="lg:col-span-2">
//           <div className="bg-white rounded-lg shadow p-4 lg:p-6">
//             <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
//                 {/* Job Order Number - Auto-generated, Read-only */}
//                 <div>
//                   <label className="block text-sm text-gray-700 mb-2">
//                     Job Order Number *
//                   </label>
//                   <input
//                     type="text"
//                     value={formData.job_order_no}
//                     readOnly
//                     className="w-full px-4 py-3 lg:py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
//                   />
//                   <p className="text-xs text-gray-500 mt-1">Auto-generated</p>
//                 </div>

//                 {/* Job Date */}
//                 <div>
//                   <label className="block text-sm text-gray-700 mb-2">
//                     Job Date *
//                   </label>
//                   <input
//                     type="date"
//                     required
//                     value={formData.job_date}
//                     onChange={(e) => setFormData({ ...formData, job_date: e.target.value })}
//                     className="w-full px-4 py-3 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>

//                 {/* Shift */}
//                 <div>
//                   <label className="block text-sm text-gray-700 mb-2">
//                     Shift *
//                   </label>
//                   <select
//                     required
//                     value={formData.shift}
//                     onChange={(e) => setFormData({ ...formData, shift: e.target.value as any })}
//                     className="w-full px-4 py-3 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   >
//                     <option value="DAY">Day Shift</option>
//                     <option value="NIGHT">Night Shift</option>
//                     <option value="AFTERNOON">Afternoon Shift</option>
//                   </select>
//                 </div>

//                 {/* Operator */}
//                 <div>
//                   <label className="block text-sm text-gray-700 mb-2">
//                     Operator *
//                   </label>
//                   <select
//                     required
//                     value={formData.operator_id}
//                     onChange={(e) => setFormData({ ...formData, operator_id: e.target.value })}
//                     className="w-full px-4 py-3 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     disabled={currentUser?.role === 'OPERATOR'}
//                   >
//                     <option value="">Select operator...</option>
//                     {operators.map(op => (
//                       <option key={op.id} value={op.id}>
//                         {op.full_name} ({op.employee_id})
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* Supervisor */}
//                 <div>
//                   <label className="block text-sm text-gray-700 mb-2">
//                     Supervisor *
//                   </label>
//                   <select
//                     required
//                     value={formData.supervisor_id}
//                     onChange={(e) => setFormData({ ...formData, supervisor_id: e.target.value })}
//                     className="w-full px-4 py-3 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   >
//                     <option value="">Select supervisor...</option>
//                     {supervisors.map(sup => (
//                       <option key={sup.id} value={sup.id}>
//                         {sup.full_name} ({sup.employee_id})
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* Machine */}
//                 <div>
//                   <label className="block text-sm text-gray-700 mb-2">
//                     Machine *
//                   </label>
//                   <select
//                     required
//                     value={formData.machine_id}
//                     onChange={(e) => setFormData({ ...formData, machine_id: e.target.value })}
//                     className="w-full px-4 py-3 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   >
//                     <option value="">Select machine...</option>
//                     {activeMachines.map(machine => (
//                       <option key={machine.id} value={machine.id}>
//                         {machine.machine_name} ({machine.machine_code})
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* Raw Material Weight in KG */}
//                 <div>
//                   <label className="block text-sm text-gray-700 mb-2">
//                     Raw Material Weight (kg) *
//                   </label>
//                   <input
//                     type="number"
//                     required
//                     min="0.01"
//                     step="0.01"
//                     value={formData.raw_material_weight_kg}
//                     onChange={(e) => setFormData({ ...formData, raw_material_weight_kg: e.target.value })}
//                     className="w-full px-4 py-3 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     placeholder="Enter weight in kg"
//                   />
//                   {selectedMaterial && formData.raw_material_weight_kg && (
//                     <p className="text-xs text-gray-500 mt-1">
//                       Estimated cost: ${(parseFloat(formData.raw_material_weight_kg) * selectedMaterial.cost_per_kg).toFixed(2)}
//                     </p>
//                   )}
//                 </div>

//                 {/* Planned Output Qty */}
//                 <div>
//                   <label className="block text-sm text-gray-700 mb-2">
//                     Planned Output Quantity *
//                   </label>
//                   <input
//                     type="number"
//                     required
//                     min="1"
//                     value={formData.planned_output_qty}
//                     onChange={(e) => setFormData({ ...formData, planned_output_qty: e.target.value })}
//                     className="w-full px-4 py-3 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     placeholder="Number of pieces"
//                   />
//                 </div>

//                 {/* Raw Material Code */}
//                 <div className="md:col-span-2">
//                   <label className="block text-sm text-gray-700 mb-2">
//                     Raw Material Code (Item Code) *
//                   </label>
//                   <select
//                     required
//                     value={formData.material_id}
//                     onChange={(e) => setFormData({ ...formData, material_id: e.target.value })}
//                     className="w-full px-4 py-3 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   >
//                     <option value="">Select raw material...</option>
//                     {activeMaterials.map(material => (
//                       <option key={material.id} value={material.id}>
//                         {material.item_code} - {material.material_identification}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* Material Identification - Auto-filled */}
//                 {selectedMaterial && (
//                   <>
//                     <div>
//                       <label className="block text-sm text-gray-700 mb-2">
//                         Material Identification
//                       </label>
//                       <input
//                         type="text"
//                         value={selectedMaterial.material_identification}
//                         readOnly
//                         className="w-full px-4 py-3 lg:py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm text-gray-700 mb-2">
//                         Material Grade
//                       </label>
//                       <input
//                         type="text"
//                         value={selectedMaterial.material_grade}
//                         readOnly
//                         className="w-full px-4 py-3 lg:py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
//                       />
//                     </div>

//                     <div className="md:col-span-2 p-4 bg-blue-50 rounded-lg">
//                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
//                         <div>
//                           <p className="text-gray-600 text-xs mb-1">Material Type</p>
//                           <p className="text-blue-900">{selectedMaterial.material_type}</p>
//                         </div>
//                         <div>
//                           <p className="text-gray-600 text-xs mb-1">Category</p>
//                           <p className="text-blue-900">{selectedMaterial.material_category}</p>
//                         </div>
//                         <div>
//                           <p className="text-gray-600 text-xs mb-1">Available Stock</p>
//                           <p className="text-blue-900">{selectedMaterial.current_stock_qty} kg</p>
//                         </div>
//                         <div>
//                           <p className="text-gray-600 text-xs mb-1">Cost per kg</p>
//                           <p className="text-blue-900">₹{selectedMaterial.cost_per_kg}</p>
//                         </div>
//                       </div>
//                     </div>
//                   </>
//                 )}

//                 {/* RM Batch Number */}
//                 <div>
//                   <label className="block text-sm text-gray-700 mb-2">
//                     RM Batch Number *
//                   </label>
//                   <input
//                     type="text"
//                     required
//                     value={formData.rm_batch_no}
//                     onChange={(e) => setFormData({ ...formData, rm_batch_no: e.target.value })}
//                     className="w-full px-4 py-3 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     placeholder="e.g., BATCH-2025-001"
//                   />
//                 </div>

//                 {/* Finished Good Code */}
//                 <div>
//                   <label className="block text-sm text-gray-700 mb-2">
//                     FG Code *
//                   </label>
//                   <input
//                     type="text"
//                     required
//                     value={formData.fg_code}
//                     onChange={(e) => setFormData({ ...formData, fg_code: e.target.value.toUpperCase() })}
//                     className="w-full px-4 py-3 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     placeholder="e.g., FG-001"
//                   />
//                 </div>

//                 {/* Notes */}
//                 <div className="md:col-span-2">
//                   <label className="block text-sm text-gray-700 mb-2">
//                     Notes (Optional)
//                   </label>
//                   <textarea
//                     value={formData.notes}
//                     onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
//                     className="w-full px-4 py-3 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     rows={3}
//                     placeholder="Any special instructions or notes..."
//                   />
//                 </div>
//               </div>

//               <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
//                 <button
//                   type="submit"
//                   className="flex-1 bg-blue-600 text-white px-6 py-3 lg:py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
//                 >
//                   <Plus className="w-5 h-5" />
//                   Create Job & Start
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => setCurrentScreen('my-jobs')}
//                   className="px-6 py-3 lg:py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>

//         {/* Job Summary Sidebar */}
//         <div className="lg:col-span-1">
//           <div className="bg-white rounded-lg shadow p-4 lg:p-6 sticky top-4">
//             <h3 className="text-gray-900 mb-4">Job Summary</h3>
            
//             <div className="space-y-3 text-sm">
//               <div>
//                 <p className="text-gray-600 text-xs mb-1">Job Order No.</p>
//                 <p className="text-gray-900">{formData.job_order_no}</p>
//               </div>

//               {formData.machine_id && (
//                 <div>
//                   <p className="text-gray-600 text-xs mb-1">Machine</p>
//                   <p className="text-gray-900">
//                     {activeMachines.find(m => m.id === formData.machine_id)?.machine_name}
//                   </p>
//                   <p className="text-gray-500 text-xs">
//                     Type: {activeMachines.find(m => m.id === formData.machine_id)?.machine_type}
//                   </p>
//                   <p className="text-gray-500 text-xs">
//                     Location: {activeMachines.find(m => m.id === formData.machine_id)?.location}
//                   </p>
//                 </div>
//               )}

//               {formData.fg_code && (
//                 <div>
//                   <p className="text-gray-600 text-xs mb-1">FG Code</p>
//                   <p className="text-gray-900">{formData.fg_code}</p>
//                   {selectedFG && (
//                     <>
//                       <p className="text-gray-500 text-xs">{selectedFG.fg_name}</p>
//                       <p className="text-gray-500 text-xs">Customer: {selectedFG.customer_name}</p>
//                     </>
//                   )}
//                 </div>
//               )}

//               {selectedMaterial && (
//                 <div>
//                   <p className="text-gray-600 text-xs mb-1">Material</p>
//                   <p className="text-gray-900">{selectedMaterial.item_code}</p>
//                   <p className="text-gray-500 text-xs">{selectedMaterial.material_identification}</p>
//                 </div>
//               )}

//               {formData.raw_material_weight_kg && (
//                 <div>
//                   <p className="text-gray-600 text-xs mb-1">RM Weight</p>
//                   <p className="text-gray-900">{formData.raw_material_weight_kg} kg</p>
//                 </div>
//               )}

//               {formData.planned_output_qty && (
//                 <div>
//                   <p className="text-gray-600 text-xs mb-1">Planned Output</p>
//                   <p className="text-gray-900">{formData.planned_output_qty} pieces</p>
//                 </div>
//               )}
//             </div>

//             {/* Cost Calculation */}
//             {selectedMaterial && (
//               <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//                 <h3 className="text-sm text-blue-900 mb-2">Cost Calculation</h3>
//                 <div className="space-y-1">
//                   <p className="text-xs text-blue-700">
//                     Material Cost/kg: ₹{selectedMaterial.cost_per_kg}
//                   </p>
//                   <p className="text-xs text-blue-700">
//                     Raw Material Weight: {formData.raw_material_weight_kg || 0} kg
//                   </p>
//                   <div className="pt-2 border-t border-blue-200 mt-2">
//                     <p className="text-sm text-blue-900">
//                       Estimated RM Cost: <span className="font-semibold">₹{calculateRMCost().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Package } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../src/config/supabase';

// JOB ORDER GENERATOR
function generateJobOrderNumber() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const randomNum = Math.floor(Math.random() * 9000) + 1000;
  return `WO-${year}-${month}-${randomNum}`;
}

const normalize = (obj: Record<string, any>) =>
  Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, v === '' ? null : v])
  );

export function CreateCuttingJob() {
  const { currentUser, setCurrentScreen } = useApp();
  
  /* --------------------------------------------------
     SECURITY GUARD
  -------------------------------------------------- */
  if (!currentUser) {
    return null;
  }

  /* --------------------------------------------------
     MASTER DATA STATE (FROM DB)
  -------------------------------------------------- */
  const [operators, setOperators] = useState<any[]>([]);
  const [supervisors, setSupervisors] = useState<any[]>([]);
  const [machines, setMachines] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [finishedGoods, setFinishedGoods] = useState<any[]>([]);
  const [materialSearch, setMaterialSearch] = useState('');

const [showMaterialDropdown, setShowMaterialDropdown] = useState(false);

  


  /* --------------------------------------------------
     FORM STATE
  -------------------------------------------------- */
  const [formData, setFormData] = useState({
    job_order_no: generateJobOrderNumber(),
    job_date: new Date().toISOString().split('T')[0],
    shift: currentUser?.shift || 'DAY',
    operator_id: currentUser?.role === 'OPERATOR' ? currentUser.id : null,
    supervisor_id: null as string | null,
    machine_id: null as string | null,
    fg_code: '',
    material_id: null as string | null,
    rm_batch_no: '',
    raw_material_weight_kg: '',
    planned_output_qty: '',
    notes: ''
  });

  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [selectedFG, setSelectedFG] = useState<any>(null);

  /* --------------------------------------------------
     DERIVED DATA
  -------------------------------------------------- */
  const activeMachines = machines; // All fetched are ACTIVE
  //const activeMaterials = materials.filter(m => m.current_stock_qty > 0); prajeeth
  const activeMaterials = materials;
  const filteredMaterials = materialSearch.trim()
  ? activeMaterials
      .filter(m => {
        const q = materialSearch.toLowerCase();
        return (
          m.item_code.toLowerCase().includes(q) ||
          m.material_identification.toLowerCase().includes(q)
        );
      })
      .slice(0, 10)
  : [];




  /* --------------------------------------------------
     LOAD MASTER DATA
  -------------------------------------------------- */
  useEffect(() => {
    const loadMasters = async () => {
      const [{ data: usersData }, { data: machinesData }, { data: materialsData }, { data: fgData }] =
        await Promise.all([
          supabase.from('users').select('id, full_name, employee_id, role').eq('is_active', true),
          supabase.from('machines').select('id, machine_name, machine_code, machine_type, location').eq('status', 'ACTIVE'),
          supabase.from('raw_materials').select('id, item_code, material_identification, material_grade, material_type, material_category, current_stock_qty, cost_per_kg').eq('status', 'ACTIVE'),
          supabase.from('finished_goods').select('id, fg_code, fg_name, customer_name'),
        ]);

      setOperators(usersData?.filter(u => u.role === 'OPERATOR') || []);
      setSupervisors(usersData?.filter(u => u.role === 'SUPERVISOR') || []);
      setMachines(machinesData || []);
      setMaterials(materialsData || []);
      setFinishedGoods(fgData || []);
    };

    loadMasters();
  }, []);

  // When material is selected, auto-populate details
  useEffect(() => {
    if (formData.material_id) {
      const material = materials.find(m => m.id === formData.material_id);
      setSelectedMaterial(material);
    } else {
      setSelectedMaterial(null);
    }
  }, [formData.material_id, materials]);

  // When finished good is selected, auto-populate details
  // useEffect(() => {
  //   if (formData.fg_code) {
  //     const fg = finishedGoods.find(f => f.fg_code === formData.fg_code);
  //     setSelectedFG(fg);
  //   } else {
  //     setSelectedFG(null);
  //   }
  // }, [formData.fg_code, finishedGoods]);

  useEffect(() => {
    if (!formData.fg_code) {
      setSelectedFG(null);
    return;
    }

    const fg = finishedGoods.find(
      f => f.fg_code === formData.fg_code.trim()
    );

    setSelectedFG(fg || null); // always safe
  }, [formData.fg_code, finishedGoods]);

  /* --------------------------------------------------
     SUBMIT HANDLER (DB INSERT)
  -------------------------------------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.material_id || !formData.machine_id || !formData.supervisor_id) {
      alert('Please fill all required fields');
      return;
    }
    
    // Generate scrap tracking ID
    const scrapTrackingId = `SCR-TRK-${Date.now()}`;

    const payload = {
      job_order_no: formData.job_order_no,
      job_date: formData.job_date,
      shift: formData.shift,

      operator_id: formData.operator_id || null,
      supervisor_id: formData.supervisor_id || null,
      machine_id: formData.machine_id || null,

      // ALWAYS save what operator typed
      fg_code: formData.fg_code.trim(),

      // OPTIONAL FK (never required)
      fg_id: selectedFG ? selectedFG.id : null,

      material_id: formData.material_id,
      rm_batch_no: formData.rm_batch_no || null,

      planned_output_qty: Number(formData.planned_output_qty),
      total_input_weight_kg: Number(formData.raw_material_weight_kg),

      scrap_tracking_id: scrapTrackingId,
      notes: formData.notes || null,

      status: 'PLANNED',
      sap_updated: false,
      created_by: currentUser.id
    };


    const { error } = await supabase
      .from('cutting_jobs')
      .insert(normalize(payload));

    if (error) {
      console.error('Create job failed:', error);
      alert('Failed to create job. Check console.');
      return;
    }
    
    alert(`Job Order ${formData.job_order_no} created successfully!\nScrap Tracking ID: ${scrapTrackingId}`);
    setCurrentScreen('my-jobs');
  };

  const calculateRMCost = () => {
    if (selectedMaterial && formData.raw_material_weight_kg) {
      return parseFloat(formData.raw_material_weight_kg) * selectedMaterial.cost_per_kg;
    }
    return 0;
  };

  return (
    <div>
      <div className="mb-4 lg:mb-6">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => setCurrentScreen('my-jobs')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-gray-900">Create Cutting Job</h1>
            <p className="text-gray-600 text-sm lg:text-base">Set up a new cutting operation</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-4 lg:p-6">
            <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                {/* Job Order Number - Auto-generated, Read-only */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Job Order Number *
                  </label>
                  <input
                    type="text"
                    value={formData.job_order_no}
                    readOnly
                    className="w-full px-4 py-3 lg:py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Auto-generated</p>
                </div>

                {/* Job Date */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Job Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.job_date}
                    onChange={(e) => setFormData({ ...formData, job_date: e.target.value })}
                    className="w-full px-4 py-3 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Shift */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Shift *
                  </label>
                  <select
                    required
                    value={formData.shift}
                    onChange={(e) => setFormData({ ...formData, shift: e.target.value as any })}
                    className="w-full px-4 py-3 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="DAY">Day Shift</option>
                    <option value="NIGHT">Night Shift</option>
                    <option value="AFTERNOON">Afternoon Shift</option>
                  </select>
                </div>

                {/* Operator */}
                {/* <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Operator *
                  </label>
                  <select
                    required
                    value={formData.operator_id}
                    onChange={(e) => setFormData({ ...formData, operator_id: e.target.value })}
                    className="w-full px-4 py-3 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={currentUser?.role === 'OPERATOR'}
                  >
                    <option value="">Select operator...</option>
                    {operators.map(op => (
                      <option key={op.id} value={op.id}>
                        {op.full_name} ({op.employee_id})
                      </option>
                    ))}
                  </select>
                </div> */}

                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Operator
                  </label>
                  <input
                    type="text"
                    value={`${currentUser.full_name} (${currentUser.employee_id})`}
                    readOnly
                    className="w-full px-4 py-3 lg:py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                  />
                </div>

                {/* Supervisor */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Supervisor *
                  </label>
                  <select
                    required
                    value={formData.supervisor_id ?? ''}
                    onChange={(e) => setFormData({ ...formData, supervisor_id: e.target.value || null })}
                    className="w-full px-4 py-3 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select supervisor...</option>
                    {supervisors.map(sup => (
                      <option key={sup.id} value={sup.id}>
                        {sup.full_name} ({sup.employee_id})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Machine */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Machine *
                  </label>
                  <select
                    required
                    value={formData.machine_id ?? ''}
                    onChange={(e) => setFormData({ ...formData, machine_id: e.target.value || null})}
                    className="w-full px-4 py-3 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select machine...</option>
                    {activeMachines.map(machine => (
                      <option key={machine.id} value={machine.id}>
                        {machine.machine_name} ({machine.machine_code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Raw Material Weight in KG */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Raw Material Weight (kg) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0.01"
                    step="0.01"
                    value={formData.raw_material_weight_kg}
                    onChange={(e) => setFormData({ ...formData, raw_material_weight_kg: e.target.value })}
                    className="w-full px-4 py-3 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter weight in kg"
                  />
                  {selectedMaterial && formData.raw_material_weight_kg && (
                    <p className="text-xs text-gray-500 mt-1">
                      Estimated cost: ${(parseFloat(formData.raw_material_weight_kg) * selectedMaterial.cost_per_kg).toFixed(2)}
                    </p>
                  )}
                </div>

                {/* Planned Output Qty */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Planned Output Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.planned_output_qty}
                    onChange={(e) => setFormData({ ...formData, planned_output_qty: e.target.value })}
                    className="w-full px-4 py-3 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Number of pieces"
                  />
                </div>

                {/* Raw Material Code */}
               {/* Raw Material Code */}
{/* Raw Material Code (Searchable Select – SINGLE SLOT) */}
{/* Raw Material Code (Searchable Select – SINGLE SLOT) */}
<div className="md:col-span-2 relative">
  <label className="block text-sm text-gray-700 mb-2">
    Raw Material Code (Item Code) *
  </label>

  <input
    type="text"
    value={materialSearch}
    onChange={(e) => {
      setMaterialSearch(e.target.value);
      setShowMaterialDropdown(true);
      setFormData({ ...formData, material_id: null });
    }}
    onFocus={() => setShowMaterialDropdown(true)}
    placeholder="Search RM-Code Here..."
    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
  />

  {showMaterialDropdown && materialSearch.trim() && (
    <div
      className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow max-h-60 overflow-auto"
      onMouseDown={(e) => e.preventDefault()} // 🔒 IMPORTANT FIX
    >
      {filteredMaterials.length ? (
        filteredMaterials.map(material => (
          <div
            key={material.id}
            onClick={() => {
              setMaterialSearch(
                `${material.item_code} - ${material.material_identification}`
              );
              setFormData({ ...formData, material_id: material.id });
              setShowMaterialDropdown(false);
            }}
            className="px-4 py-2 cursor-pointer hover:bg-blue-100"
          >
            <div className="font-medium">{material.item_code}</div>
            <div className="text-xs text-gray-500">
              {material.material_identification}
            </div>
          </div>
        ))
      ) : (
        <div className="px-4 py-2 text-sm text-gray-500">
          No materials found
        </div>
      )}
    </div>
  )}

  {/* Validation message */}
  {!formData.material_id && materialSearch && (
    <p className="text-xs text-red-600 mt-1">
      Please select a material from the list
    </p>
  )}
</div>



                {/* Material Identification - Auto-filled */}
                {selectedMaterial && (
                  <>
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Material Identification
                      </label>
                      <input
                        type="text"
                        value={selectedMaterial.material_identification}
                        readOnly
                        className="w-full px-4 py-3 lg:py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Material Grade
                      </label>
                      <input
                        type="text"
                        value={selectedMaterial.material_grade}
                        readOnly
                        className="w-full px-4 py-3 lg:py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                      />
                    </div>

                    <div className="md:col-span-2 p-4 bg-blue-50 rounded-lg">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600 text-xs mb-1">Material Type</p>
                          <p className="text-blue-900">{selectedMaterial.material_type}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-xs mb-1">Category</p>
                          <p className="text-blue-900">{selectedMaterial.material_category}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-xs mb-1">Available Stock</p>
                          <p className="text-blue-900">{selectedMaterial.current_stock_qty} kg</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-xs mb-1">Cost per kg</p>
                          <p className="text-blue-900">₹{selectedMaterial.cost_per_kg}</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* RM Batch Number */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    RM Batch Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.rm_batch_no}
                    onChange={(e) => setFormData({ ...formData, rm_batch_no: e.target.value })}
                    className="w-full px-4 py-3 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., BATCH-2025-001"
                  />
                </div>

                {/* Finished Good Code */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Master Serial Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fg_code}
                    onChange={(e) => setFormData({ ...formData, fg_code: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-3 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., OPW-05, APT-30"
                  />

                  {/* <select
                      required
                      value={formData.fg_id || ''}
                      onChange={(e) => {
                        const fg = finishedGoods.find(f => f.id === e.target.value);
                        setSelectedFG(fg);
                        setFormData({ ...formData, fg_id: e.target.value });
                      }}
                      className="w-full px-4 py-2 border rounded"
                    >
                      <option value="">Select Finished Good</option>
                      {finishedGoods.map(fg => (
                        <option key={fg.id} value={fg.id}>
                          {fg.fg_code} - {fg.fg_name}
                        </option>
                      ))}
                    </select> */}


                </div>

                {/* Notes */}
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-3 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Any special instructions or notes..."
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-6 py-3 lg:py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Create Job & Start
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentScreen('my-jobs')}
                  className="px-6 py-3 lg:py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Job Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-4 lg:p-6 sticky top-4">
            <h3 className="text-gray-900 mb-4">Job Summary</h3>
            
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600 text-xs mb-1">Job Order No.</p>
                <p className="text-gray-900">{formData.job_order_no}</p>
              </div>

              {formData.machine_id && (
                <div>
                  <p className="text-gray-600 text-xs mb-1">Machine</p>
                  <p className="text-gray-900">
                    {activeMachines.find(m => m.id === formData.machine_id)?.machine_name}
                  </p>
                  <p className="text-gray-500 text-xs">
                    Type: {activeMachines.find(m => m.id === formData.machine_id)?.machine_type}
                  </p>
                  <p className="text-gray-500 text-xs">
                    Location: {activeMachines.find(m => m.id === formData.machine_id)?.location}
                  </p>
                </div>
              )}

              {formData.fg_code && (
                <div>
                  <p className="text-gray-600 text-xs mb-1">FG Code</p>
                  <p className="text-gray-900">{formData.fg_code}</p>
                  {selectedFG && (
                    <>
                      <p className="text-gray-500 text-xs">{selectedFG.fg_name}</p>
                      <p className="text-gray-500 text-xs">Customer: {selectedFG.customer_name}</p>
                    </>
                  )}
                </div>
              )}

              {selectedMaterial && (
                <div>
                  <p className="text-gray-600 text-xs mb-1">Material</p>
                  <p className="text-gray-900">{selectedMaterial.item_code}</p>
                  <p className="text-gray-500 text-xs">{selectedMaterial.material_identification}</p>
                </div>
              )}

              {formData.raw_material_weight_kg && (
                <div>
                  <p className="text-gray-600 text-xs mb-1">RM Weight</p>
                  <p className="text-gray-900">{formData.raw_material_weight_kg} kg</p>
                </div>
              )}

              {formData.planned_output_qty && (
                <div>
                  <p className="text-gray-600 text-xs mb-1">Planned Output</p>
                  <p className="text-gray-900">{formData.planned_output_qty} pieces</p>
                </div>
              )}
            </div>

            {/* Cost Calculation */}
            {selectedMaterial && (
  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">

                <h3 className="text-sm text-blue-900 mb-2">Cost Calculation</h3>
                <div className="space-y-1">
                  <p className="text-xs text-blue-700">
                    Material Cost/kg: ₹{selectedMaterial.cost_per_kg}
                  </p>
                  <p className="text-xs text-blue-700">
                    Raw Material Weight: {formData.raw_material_weight_kg || 0} kg
                  </p>
                  <div className="pt-2 border-t border-blue-200 mt-2">
                    <p className="text-sm text-blue-900">
                      Estimated RM Cost: <span className="font-semibold">₹{calculateRMCost().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}