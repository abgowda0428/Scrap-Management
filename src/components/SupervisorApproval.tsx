import { useState } from 'react';
import { CheckCircle, XCircle, Clock, Search, Filter, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';

// Mock scrap entries awaiting approval
const mockPendingScraps = [
  {
    id: 'SCR-001',
    scrap_tracking_id: 'SCR-TRK-1734000000001',
    cutting_job_id: 'JOB-001',
    job_order_no: 'WO-2025-12-1234',
    material_code: 'RM0001',
    material_identification: 'Dia 60mm Stainless Steel SS304',
    material_category: 'STAINLESS_STEEL',
    scrap_classification: 'NON_REUSABLE',
    operator_name: 'John Doe',
    machine_name: 'Hydraulic Shear HS-01',
    scrap_date: '2025-12-11',
    scrap_time: '10:30:00',
    scrap_weight_kg: 2.5,
    scrap_quantity: 3,
    scrap_type: 'KERF_LOSS',
    reason_code: 'KRF-001',
    reason_name: 'Normal Kerf Loss',
    scrap_value_estimate: 1625,
    is_recyclable: true,
    approval_status: 'PENDING' as const,
    created_at: '2025-12-11T10:30:00Z',
  },
  {
    id: 'SCR-002',
    scrap_tracking_id: 'SCR-TRK-1734000000002',
    cutting_job_id: 'JOB-002',
    job_order_no: 'WO-2025-12-1235',
    material_code: 'RM0002',
    material_identification: '50x25mm Flat Bar Aluminum 6061',
    material_category: 'ALUMINUM',
    scrap_classification: 'REUSABLE',
    operator_name: 'John Doe',
    machine_name: 'Band Saw BS-02',
    scrap_date: '2025-12-11',
    scrap_time: '11:45:00',
    scrap_weight_kg: 1.8,
    scrap_quantity: 2,
    scrap_type: 'END_CUT',
    reason_code: 'END-001',
    reason_name: 'End Piece - Reusable',
    scrap_value_estimate: 1044,
    is_recyclable: false,
    reusable_storage_location: 'Rack A-12',
    potential_use: 'Future Production',
    dimension_details: 'L:500mm x W:50mm x T:25mm',
    approval_status: 'PENDING' as const,
    created_at: '2025-12-11T11:45:00Z',
  },
  {
    id: 'SCR-003',
    scrap_tracking_id: 'SCR-TRK-1734000000003',
    cutting_job_id: 'JOB-001',
    job_order_no: 'WO-2025-12-1234',
    material_code: 'RM0001',
    material_identification: 'Dia 60mm Stainless Steel SS304',
    material_category: 'STAINLESS_STEEL',
    scrap_classification: 'NON_REUSABLE',
    operator_name: 'John Doe',
    machine_name: 'Hydraulic Shear HS-01',
    scrap_date: '2025-12-11',
    scrap_time: '14:20:00',
    scrap_weight_kg: 3.2,
    scrap_quantity: 1,
    scrap_type: 'WRONG_CUT',
    reason_code: 'WRG-002',
    reason_name: 'Wrong Cut - Operator Error',
    scrap_value_estimate: 2080,
    is_recyclable: true,
    approval_status: 'PENDING' as const,
    created_at: '2025-12-11T14:20:00Z',
  },
];

export function SupervisorApproval() {
  const { currentUser, setCurrentScreen } = useApp();
  const [selectedScrap, setSelectedScrap] = useState<typeof mockPendingScraps[0] | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [searchTerm, setSearchTerm] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [scraps, setScraps] = useState(mockPendingScraps);

  const filteredScraps = scraps.filter(scrap => {
    const matchesFilter = filter === 'ALL' || scrap.approval_status === filter;
    const matchesSearch = scrap.job_order_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scrap.operator_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scrap.material_code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleApprove = () => {
    if (!selectedScrap) return;
    
    const approvedScrap = {
      ...selectedScrap,
      approval_status: 'APPROVED' as const,
      approved_by_id: currentUser?.id,
      approved_by_name: currentUser?.full_name,
      approval_date: new Date().toISOString(),
      approval_notes: approvalNotes,
    };

    setScraps(scraps.map(s => s.id === selectedScrap.id ? approvedScrap : s));
    alert(`Scrap ${selectedScrap.id} APPROVED!\nReady for SAP integration.`);
    setSelectedScrap(null);
    setApprovalNotes('');
  };

  const handleReject = () => {
    if (!selectedScrap) return;
    
    if (!approvalNotes.trim()) {
      alert('Please provide rejection reason in notes');
      return;
    }

    const rejectedScrap = {
      ...selectedScrap,
      approval_status: 'REJECTED' as const,
      approved_by_id: currentUser?.id,
      approved_by_name: currentUser?.full_name,
      approval_date: new Date().toISOString(),
      approval_notes: approvalNotes,
    };

    setScraps(scraps.map(s => s.id === selectedScrap.id ? rejectedScrap : s));
    alert(`Scrap ${selectedScrap.id} REJECTED!\nOperator will be notified.`);
    setSelectedScrap(null);
    setApprovalNotes('');
  };

  const pendingCount = scraps.filter(s => s.approval_status === 'PENDING').length;
  const approvedCount = scraps.filter(s => s.approval_status === 'APPROVED').length;
  const rejectedCount = scraps.filter(s => s.approval_status === 'REJECTED').length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-gray-900 mb-2">Scrap Approval Workflow</h1>
        <p className="text-gray-600">Review and approve scrap entries before SAP integration</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-700">Pending Approval</p>
              <p className="text-2xl text-amber-900 mt-1">{pendingCount}</p>
            </div>
            <Clock className="w-8 h-8 text-amber-500" />
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700">Approved Today</p>
              <p className="text-2xl text-green-900 mt-1">{approvedCount}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700">Rejected Today</p>
              <p className="text-2xl text-red-900 mt-1">{rejectedCount}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scrap List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            {/* Filters */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by job order, operator, material..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilter('ALL')}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      filter === 'ALL' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilter('PENDING')}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      filter === 'PENDING' ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => setFilter('APPROVED')}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      filter === 'APPROVED' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Approved
                  </button>
                  <button
                    onClick={() => setFilter('REJECTED')}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      filter === 'REJECTED' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Rejected
                  </button>
                </div>
              </div>
            </div>

            {/* Scrap List */}
            <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
              {filteredScraps.length === 0 ? (
                <div className="p-8 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No scrap entries found</p>
                </div>
              ) : (
                filteredScraps.map(scrap => (
                  <div
                    key={scrap.id}
                    onClick={() => setSelectedScrap(scrap)}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedScrap?.id === scrap.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-gray-900">{scrap.job_order_no}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            scrap.approval_status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                            scrap.approval_status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {scrap.approval_status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{scrap.operator_name} • {scrap.machine_name}</p>
                      </div>
                      <p className="text-sm text-gray-500">{scrap.scrap_date}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                      <div>
                        <p className="text-xs text-gray-500">Material</p>
                        <p className="text-gray-900">{scrap.material_code}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Weight</p>
                        <p className="text-gray-900">{scrap.scrap_weight_kg} kg</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          scrap.scrap_classification === 'REUSABLE' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {scrap.scrap_classification}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                          {scrap.material_category.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-red-600">₹{scrap.scrap_value_estimate.toFixed(2)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Details & Approval Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-4">
            {selectedScrap ? (
              <>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-gray-900">Scrap Details</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      selectedScrap.approval_status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                      selectedScrap.approval_status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedScrap.approval_status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">ID: {selectedScrap.id}</p>
                </div>

                <div className="space-y-3 text-sm mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Job Order</p>
                    <p className="text-gray-900">{selectedScrap.job_order_no}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Operator</p>
                    <p className="text-gray-900">{selectedScrap.operator_name}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Material</p>
                    <p className="text-gray-900">{selectedScrap.material_identification}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-500">Weight</p>
                      <p className="text-gray-900">{selectedScrap.scrap_weight_kg} kg</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Quantity</p>
                      <p className="text-gray-900">{selectedScrap.scrap_quantity} pcs</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Scrap Type</p>
                    <p className="text-gray-900">{selectedScrap.scrap_type.replace('_', ' ')}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Reason</p>
                    <p className="text-gray-900">{selectedScrap.reason_name}</p>
                  </div>

                  <div className="pt-3 border-t">
                    <p className="text-xs text-gray-500 mb-2">Classification</p>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Material:</span>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                          {selectedScrap.material_category.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Usability:</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          selectedScrap.scrap_classification === 'REUSABLE'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {selectedScrap.scrap_classification}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedScrap.scrap_classification === 'REUSABLE' && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-xs text-green-900 font-medium mb-2">Reusable Details</p>
                      {selectedScrap.dimension_details && (
                        <p className="text-xs text-green-800 mb-1">
                          <strong>Dimensions:</strong> {selectedScrap.dimension_details}
                        </p>
                      )}
                      {selectedScrap.reusable_storage_location && (
                        <p className="text-xs text-green-800 mb-1">
                          <strong>Storage:</strong> {selectedScrap.reusable_storage_location}
                        </p>
                      )}
                      {selectedScrap.potential_use && (
                        <p className="text-xs text-green-800">
                          <strong>Use:</strong> {selectedScrap.potential_use}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="pt-3 border-t">
                    <p className="text-xs text-gray-500">Estimated Value</p>
                    <p className="text-xl text-red-600">₹{selectedScrap.scrap_value_estimate.toFixed(2)}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedScrap.is_recyclable}
                      disabled
                      className="w-4 h-4"
                    />
                    <span className="text-xs text-gray-700">Recyclable</span>
                  </div>
                </div>

                {selectedScrap.approval_status === 'PENDING' && (
                  <div className="border-t pt-4">
                    <label className="block text-sm text-gray-700 mb-2">
                      Approval Notes
                    </label>
                    <textarea
                      value={approvalNotes}
                      onChange={(e) => setApprovalNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      rows={3}
                      placeholder="Add notes (required for rejection)..."
                    />

                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <button
                        onClick={handleApprove}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={handleReject}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                )}

                {selectedScrap.approval_status !== 'PENDING' && selectedScrap.approval_notes && (
                  <div className="border-t pt-4">
                    <p className="text-xs text-gray-500 mb-1">Approval Notes</p>
                    <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                      {selectedScrap.approval_notes}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      By: {selectedScrap.approved_by_name} on {selectedScrap.approval_date?.split('T')[0]}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <Filter className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Select a scrap entry to review</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
