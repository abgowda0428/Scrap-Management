import { useState } from 'react';
import { Search, Filter, X, XCircle, CheckCircle, Clock, ArrowLeft } from 'lucide-react';

import { EndPieceStatus, MaterialCategory } from '../types/index';
import { UseEndPieceModal } from './UseEndPieceModal';
import { useApp } from '../context/AppContext';

export function EndPieces() {
  const { setCurrentScreen } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<EndPieceStatus | 'ALL'>('ALL');
  const [filterMaterialCategory, setFilterMaterialCategory] = useState<MaterialCategory | 'ALL'>('ALL');
  const [filterGrade, setFilterGrade] = useState<string | 'ALL'>('ALL');
  const [selectedEndPiece, setSelectedEndPiece] = useState<typeof mockEndPieces[0] | null>(null);

  const handleUseEndPiece = (endPieceId: string, jobId: string, notes: string) => {
    console.log('Using end piece:', { endPieceId, jobId, notes });
    alert(
      `End piece ${selectedEndPiece?.end_piece_code} marked as RESERVED for job!\n\n` +
      `This end piece will be:\n` +
      `- Status updated to RESERVED\n` +
      `- Linked to the selected job\n` +
      `- Weight deducted from raw material requirements\n\n` +
      `Notes: ${notes || 'None'}`
    );
    setSelectedEndPiece(null);
  };

  // Get unique material categories
  const materialCategories = [...new Set(mockMaterials.map(m => m.material_category))];
  
  // Get grades based on selected category
  const availableGrades = filterMaterialCategory === 'ALL' 
    ? [...new Set(mockEndPieces.map(ep => ep.material_grade))]
    : [...new Set(
        mockMaterials
          .filter(m => m.material_category === filterMaterialCategory)
          .map(m => m.material_grade)
      )];

  const filteredEndPieces = mockEndPieces.filter(ep => {
    // Status filter
    if (filterStatus !== 'ALL' && ep.status !== filterStatus) return false;
    
    // Material Category filter
    if (filterMaterialCategory !== 'ALL') {
      const material = mockMaterials.find(m => m.id === ep.material_id);
      if (!material || material.material_category !== filterMaterialCategory) return false;
    }
    
    // Grade filter
    if (filterGrade !== 'ALL' && ep.material_grade !== filterGrade) return false;
    
    // Search filter
    if (searchTerm && !ep.end_piece_code.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    
    return true;
  });

  // Reset grade filter when category changes
  const handleCategoryChange = (category: string) => {
    setFilterMaterialCategory(category);
    setFilterGrade('ALL'); // Reset grade when category changes
  };

  const availableEndPieces = mockEndPieces.filter(ep => ep.status === 'AVAILABLE');
  const totalWeight = availableEndPieces.reduce((sum, ep) => sum + ep.weight_kg, 0);
  const totalValue = availableEndPieces.reduce((sum, ep) => {
    const material = mockMaterials.find(m => m.id === ep.material_id);
    return sum + (ep.weight_kg * (material?.cost_per_kg || 0));
  }, 0);

  // Get material category display name
  const getCategoryDisplayName = (category: string) => {
    const names: Record<string, string> = {
      'STAINLESS_STEEL': 'Stainless Steel',
      'ALUMINUM': 'Aluminum',
      'BRASS': 'Brass',
      'PVDF': 'PVDF',
      'PLASTIC': 'Plastic',
    };
    return names[category] || category;
  };

  return (
    <div>
      <div className="mb-4 lg:mb-6">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => setCurrentScreen('dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-gray-900 text-xl lg:text-2xl">End Piece Inventory</h1>
            <p className="text-gray-600 mt-1 text-sm lg:text-base">{filteredEndPieces.length} pieces found</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-4 lg:mb-6">
        <div className="bg-white rounded-lg shadow p-4 lg:p-6">
          <p className="text-xs lg:text-sm text-gray-600 mb-1">Available End Pieces</p>
          <p className="text-gray-900 text-lg lg:text-2xl">{availableEndPieces.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 lg:p-6">
          <p className="text-xs lg:text-sm text-gray-600 mb-1">Total Weight</p>
          <p className="text-gray-900 text-lg lg:text-2xl">{totalWeight.toFixed(1)} kg</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 lg:p-6">
          <p className="text-xs lg:text-sm text-gray-600 mb-1">Estimated Value</p>
          <p className="text-gray-900 text-lg lg:text-2xl">₹{totalValue.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 lg:p-6">
          <p className="text-xs lg:text-sm text-gray-600 mb-1">Reuse Rate</p>
          <p className="text-green-600 text-lg lg:text-2xl">
            {mockEndPieces.length > 0 
              ? ((mockEndPieces.filter(ep => ep.status === 'USED').length / mockEndPieces.length) * 100).toFixed(1)
              : 0}%
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 lg:p-6 mb-4 lg:mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              <Search className="w-4 h-4 inline mr-2" />
              Search by Code
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              placeholder="EP-2025-001"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-2" />
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as EndPieceStatus | 'ALL')}
              className="w-full px-4 py-3 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            >
              <option value="ALL">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="RESERVED">Reserved</option>
              <option value="USED">Used</option>
              <option value="SCRAPED">Scraped</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Filter by Material Category
            </label>
            <select
              value={filterMaterialCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-4 py-3 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            >
              <option value="ALL">All Categories</option>
              {materialCategories.map(category => (
                <option key={category} value={category}>{getCategoryDisplayName(category)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Filter by Grade
            </label>
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="w-full px-4 py-3 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              disabled={filterMaterialCategory === 'ALL' && availableGrades.length === 0}
            >
              <option value="ALL">All Grades</option>
              {availableGrades.map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters Display */}
        {(filterMaterialCategory !== 'ALL' || filterGrade !== 'ALL' || filterStatus !== 'ALL') && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Active Filters:</p>
            <div className="flex flex-wrap gap-2">
              {filterMaterialCategory !== 'ALL' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  Category: {getCategoryDisplayName(filterMaterialCategory)}
                  <button
                    onClick={() => handleCategoryChange('ALL')}
                    className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <XCircle className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filterGrade !== 'ALL' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                  Grade: {filterGrade}
                  <button
                    onClick={() => setFilterGrade('ALL')}
                    className="ml-1 hover:bg-green-200 rounded-full p-0.5"
                  >
                    <XCircle className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filterStatus !== 'ALL' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                  Status: {filterStatus}
                  <button
                    onClick={() => setFilterStatus('ALL')}
                    className="ml-1 hover:bg-purple-200 rounded-full p-0.5"
                  >
                    <XCircle className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setFilterMaterialCategory('ALL');
                  setFilterGrade('ALL');
                  setFilterStatus('ALL');
                  setSearchTerm('');
                }}
                className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800 underline"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* End Pieces List - Mobile Card View / Desktop Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Code</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Material</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Dimensions</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Weight</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Date Created</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEndPieces.map(ep => (
                <tr key={ep.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">{ep.end_piece_code}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">{ep.material_code}</p>
                    <p className="text-xs text-gray-500">{ep.material_grade}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">
                      {ep.length}mm
                      {ep.width && ` × ${ep.width}mm`}
                      {ep.diameter && ` ø${ep.diameter}mm`}
                    </p>
                    <p className="text-xs text-gray-500">T: {ep.thickness}mm</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">{ep.weight_kg.toFixed(2)} kg</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">{ep.storage_location}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">
                      {new Date(ep.date_created).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={ep.status} />
                  </td>
                  <td className="px-6 py-4">
                    {ep.status === 'AVAILABLE' && (
                      <button
                        onClick={() => setSelectedEndPiece(ep)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Use in Job
                      </button>
                    )}
                    {ep.status === 'USED' && ep.used_date && (
                      <p className="text-xs text-gray-500">
                        Used: {new Date(ep.used_date).toLocaleDateString()}
                      </p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden divide-y divide-gray-200">
          {filteredEndPieces.map(ep => (
            <div key={ep.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-gray-900 mb-1">{ep.end_piece_code}</p>
                  <StatusBadge status={ep.status} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                <div>
                  <p className="text-xs text-gray-600">Material</p>
                  <p className="text-gray-900">{ep.material_code}</p>
                  <p className="text-xs text-gray-500">{ep.material_grade}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Weight</p>
                  <p className="text-gray-900">{ep.weight_kg.toFixed(2)} kg</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Dimensions</p>
                  <p className="text-gray-900">
                    {ep.length}mm
                    {ep.width && ` × ${ep.width}mm`}
                    {ep.diameter && ` ø${ep.diameter}mm`}
                  </p>
                  <p className="text-xs text-gray-500">T: {ep.thickness}mm</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Location</p>
                  <p className="text-gray-900">{ep.storage_location}</p>
                </div>
              </div>

              <div className="text-xs text-gray-500 mb-3">
                Created: {new Date(ep.date_created).toLocaleDateString()}
              </div>

              {ep.status === 'AVAILABLE' && (
                <button
                  onClick={() => setSelectedEndPiece(ep)}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Use in Job
                </button>
              )}
              {ep.status === 'USED' && ep.used_date && (
                <p className="text-xs text-gray-500">
                  Used: {new Date(ep.used_date).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>

        {filteredEndPieces.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-500">No end pieces found matching your filters</p>
          </div>
        )}
      </div>

      {/* Use End Piece Modal */}
      {selectedEndPiece && (
        <UseEndPieceModal
          endPiece={selectedEndPiece}
          onClose={() => setSelectedEndPiece(null)}
          onUse={handleUseEndPiece}
        />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    AVAILABLE: { label: 'Available', className: 'bg-green-100 text-green-800', icon: CheckCircle },
    RESERVED: { label: 'Reserved', className: 'bg-yellow-100 text-yellow-800', icon: Clock },
    USED: { label: 'Used', className: 'bg-blue-100 text-blue-800', icon: CheckCircle },
    SCRAPED: { label: 'Scraped', className: 'bg-red-100 text-red-800', icon: XCircle },
  };

  const { label, className, icon: Icon } = config[status as keyof typeof config] || config.AVAILABLE;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${className}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}