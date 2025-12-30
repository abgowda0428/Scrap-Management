/**
 * Approval Dashboard Component
 * 
 * Comprehensive approval management system for Supervisors and Managers
 * Features:
 * - Real-time approval queue monitoring
 * - Advanced filtering and search
 * - Bulk approval capabilities
 * - Detailed scrap entry review
 * - Material category and classification insights
 * - Mobile-optimized responsive design
 * - Indian currency formatting
 * 
 * @author SDE-3 Architecture
 */

import { useState, useMemo, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  FileText,
  Download,
  TrendingUp,
  Package,
  AlertCircle,
  Eye,
  CheckSquare,
  Calendar,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ApprovalStatus, MaterialCategory, ScrapClassification } from '../types/index';

// Types
interface ScrapEntryWithApproval {
  id: string;
  scrap_tracking_id: string;
  cutting_job_id: string;
  job_order_no?: string;
  material_code: string;
  material_identification: string;
  material_category: MaterialCategory;
  material_serial_no?: string;
  finished_good_code?: string;
  scrap_classification: ScrapClassification;
  operator_name: string;
  machine_name: string;
  scrap_date: string;
  scrap_time: string;
  scrap_weight_kg: number;
  scrap_quantity: number;
  scrap_type: string;
  reason_code: string;
  reason_name: string;
  reason_description?: string;
  scrap_value_estimate: number;
  is_recyclable: boolean;
  approval_status: ApprovalStatus;
  approved_by_id?: string;
  approved_by_name?: string;
  approval_date?: string;
  approval_notes?: string;
  reusable_storage_location?: string;
  potential_use?: string;
  dimension_details?: string;
  created_at: string;
}

interface FilterState {
  status: ApprovalStatus | 'ALL';
  materialCategory: MaterialCategory | 'ALL';
  classification: ScrapClassification | 'ALL';
  dateFrom: string;
  dateTo: string;
  searchTerm: string;
}

export function ApprovalDashboard() {
  const { currentUser } = useApp();
  
  // State management
  const [scrapEntries, setScrapEntries] = useState<ScrapEntryWithApproval[]>([]);
  const [selectedScrap, setSelectedScrap] = useState<ScrapEntryWithApproval | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [approvalNotes, setApprovalNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    status: 'PENDING',
    materialCategory: 'ALL',
    classification: 'ALL',
    dateFrom: '',
    dateTo: '',
    searchTerm: ''
  });

  // Load scrap entries
  useEffect(() => {
    loadScrapEntries();
  }, []);

  const loadScrapEntries = () => {
    setIsLoading(true);
    // Simulate API call - in production, this would fetch from backend
    setTimeout(() => {
      const enrichedScrap = mockScrap.map(scrap => ({
        ...scrap,
        job_order_no: `WO-2025-${scrap.cutting_job_id.slice(-3)}`,
        material_serial_no: `SN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        finished_good_code: `FG-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
      }));
      setScrapEntries(enrichedScrap as ScrapEntryWithApproval[]);
      setIsLoading(false);
    }, 500);
  };

  // Filtered and sorted entries
  const filteredEntries = useMemo(() => {
    let result = scrapEntries;

    // Status filter
    if (filters.status !== 'ALL') {
      result = result.filter(s => s.approval_status === filters.status);
    }

    // Material category filter
    if (filters.materialCategory !== 'ALL') {
      result = result.filter(s => s.material_category === filters.materialCategory);
    }

    // Classification filter
    if (filters.classification !== 'ALL') {
      result = result.filter(s => s.scrap_classification === filters.classification);
    }

    // Date range filter
    if (filters.dateFrom) {
      result = result.filter(s => s.scrap_date >= filters.dateFrom);
    }
    if (filters.dateTo) {
      result = result.filter(s => s.scrap_date <= filters.dateTo);
    }

    // Search filter
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      result = result.filter(s => 
        s.job_order_no?.toLowerCase().includes(term) ||
        s.operator_name.toLowerCase().includes(term) ||
        s.material_code.toLowerCase().includes(term) ||
        s.material_serial_no?.toLowerCase().includes(term) ||
        s.finished_good_code?.toLowerCase().includes(term)
      );
    }

    // Sort by date (newest first)
    return result.sort((a, b) => {
      const dateA = new Date(`${a.scrap_date} ${a.scrap_time}`);
      const dateB = new Date(`${b.scrap_date} ${b.scrap_time}`);
      return dateB.getTime() - dateA.getTime();
    });
  }, [scrapEntries, filters]);

  // Statistics
  const stats = useMemo(() => {
    const pending = scrapEntries.filter(s => s.approval_status === 'PENDING');
    const approved = scrapEntries.filter(s => s.approval_status === 'APPROVED');
    const rejected = scrapEntries.filter(s => s.approval_status === 'REJECTED');
    
    const today = new Date().toISOString().split('T')[0];
    const approvedToday = approved.filter(s => s.approval_date?.startsWith(today));
    const rejectedToday = rejected.filter(s => s.approval_date?.startsWith(today));

    const pendingValue = pending.reduce((sum, s) => sum + s.scrap_value_estimate, 0);
    const reusableCount = pending.filter(s => s.scrap_classification === 'REUSABLE').length;

    return {
      totalPending: pending.length,
      approvedToday: approvedToday.length,
      rejectedToday: rejectedToday.length,
      pendingValue,
      reusableCount,
      nonReusableCount: pending.length - reusableCount
    };
  }, [scrapEntries]);

  // Material category breakdown
  const categoryBreakdown = useMemo(() => {
    const pending = scrapEntries.filter(s => s.approval_status === 'PENDING');
    const breakdown = pending.reduce((acc, scrap) => {
      if (!acc[scrap.material_category]) {
        acc[scrap.material_category] = { count: 0, weight: 0, value: 0 };
      }
      acc[scrap.material_category].count++;
      acc[scrap.material_category].weight += scrap.scrap_weight_kg;
      acc[scrap.material_category].value += scrap.scrap_value_estimate;
      return acc;
    }, {} as Record<MaterialCategory, { count: number; weight: number; value: number }>);

    return Object.entries(breakdown).map(([category, data]) => ({
      category: category as MaterialCategory,
      ...data
    }));
  }, [scrapEntries]);

  // Handlers
  const handleApprove = (scrapId?: string) => {
    const idsToApprove = scrapId ? [scrapId] : Array.from(selectedIds);
    
    if (idsToApprove.length === 0) {
      alert('Please select at least one entry to approve');
      return;
    }

    const updatedEntries = scrapEntries.map(scrap => {
      if (idsToApprove.includes(scrap.id)) {
        return {
          ...scrap,
          approval_status: 'APPROVED' as ApprovalStatus,
          approved_by_id: currentUser?.id,
          approved_by_name: currentUser?.full_name,
          approval_date: new Date().toISOString(),
          approval_notes: approvalNotes || 'Approved'
        };
      }
      return scrap;
    });

    setScrapEntries(updatedEntries);
    setSelectedIds(new Set());
    setApprovalNotes('');
    setSelectedScrap(null);
    
    alert(`✓ ${idsToApprove.length} scrap ${idsToApprove.length === 1 ? 'entry' : 'entries'} approved!\nReady for SAP integration.`);
  };

  const handleReject = (scrapId?: string) => {
    if (!approvalNotes.trim()) {
      alert('Please provide rejection reason in notes');
      return;
    }

    const idsToReject = scrapId ? [scrapId] : Array.from(selectedIds);
    
    if (idsToReject.length === 0) {
      alert('Please select at least one entry to reject');
      return;
    }

    const updatedEntries = scrapEntries.map(scrap => {
      if (idsToReject.includes(scrap.id)) {
        return {
          ...scrap,
          approval_status: 'REJECTED' as ApprovalStatus,
          approved_by_id: currentUser?.id,
          approved_by_name: currentUser?.full_name,
          approval_date: new Date().toISOString(),
          approval_notes: approvalNotes
        };
      }
      return scrap;
    });

    setScrapEntries(updatedEntries);
    setSelectedIds(new Set());
    setApprovalNotes('');
    setSelectedScrap(null);
    
    alert(`✗ ${idsToReject.length} scrap ${idsToReject.length === 1 ? 'entry' : 'entries'} rejected.\nOperator will be notified.`);
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const selectAllVisible = () => {
    const visiblePending = filteredEntries.filter(s => s.approval_status === 'PENDING');
    if (selectedIds.size === visiblePending.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(visiblePending.map(s => s.id)));
    }
  };

  const exportToCSV = () => {
    // Implementation for CSV export
    alert('Export functionality will download CSV file with filtered results');
  };

  const getCategoryColor = (category: MaterialCategory) => {
    const colors: Record<MaterialCategory, string> = {
      STAINLESS_STEEL: 'bg-gray-100 text-gray-700',
      ALUMINUM: 'bg-blue-100 text-blue-700',
      BRASS: 'bg-yellow-100 text-yellow-700',
      PVDF: 'bg-purple-100 text-purple-700',
      PLASTIC: 'bg-green-100 text-green-700',
      MILD_STEEL: 'bg-gray-100 text-gray-600'
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  const getCategoryName = (category: MaterialCategory) => {
    return category.replace(/_/g, ' ');
  };

  return (
    <div className="pb-20 lg:pb-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-gray-900">Approval Dashboard</h1>
          <button
            onClick={loadScrapEntries}
            className="lg:flex hidden items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
        <p className="text-gray-600">Review and approve scrap entries for SAP integration</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-amber-500" />
            <span className="text-xs px-2 py-1 bg-amber-200 text-amber-800 rounded-full">Action Needed</span>
          </div>
          <p className="text-2xl text-amber-900 mb-1">{stats.totalPending}</p>
          <p className="text-sm text-amber-700">Pending Approval</p>
          <p className="text-xs text-amber-600 mt-1">₹{stats.pendingValue.toFixed(2)} value</p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <span className="text-xs px-2 py-1 bg-green-200 text-green-800 rounded-full">Today</span>
          </div>
          <p className="text-2xl text-green-900 mb-1">{stats.approvedToday}</p>
          <p className="text-sm text-green-700">Approved Today</p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <XCircle className="w-8 h-8 text-red-500" />
            <span className="text-xs px-2 py-1 bg-red-200 text-red-800 rounded-full">Today</span>
          </div>
          <p className="text-2xl text-red-900 mb-1">{stats.rejectedToday}</p>
          <p className="text-sm text-red-700">Rejected Today</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-8 h-8 text-blue-500" />
            <span className="text-xs px-2 py-1 bg-blue-200 text-blue-800 rounded-full">Pending</span>
          </div>
          <p className="text-2xl text-blue-900 mb-1">{stats.reusableCount}</p>
          <p className="text-sm text-blue-700">Reusable Items</p>
          <p className="text-xs text-blue-600 mt-1">{stats.nonReusableCount} non-reusable</p>
        </div>
      </div>

      {/* Material Category Breakdown - Mobile friendly */}
      {categoryBreakdown.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h3 className="text-gray-900 mb-3 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-gray-600" />
            Pending by Material Category
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {categoryBreakdown.map(({ category, count, weight, value }) => (
              <div key={category} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(category)}`}>
                  {getCategoryName(category)}
                </span>
                <p className="text-lg text-gray-900 mt-2">{count}</p>
                <p className="text-xs text-gray-600">{weight.toFixed(1)} kg</p>
                <p className="text-xs text-red-600">₹{value.toFixed(0)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scrap List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            {/* Filters Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex flex-col gap-3">
                {/* Search and Filter Toggle */}
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search job, operator, material, FG code..."
                      value={filters.searchTerm}
                      onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                      showFilters ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Filter className="w-4 h-4" />
                    <span className="hidden sm:inline">Filters</span>
                  </button>
                </div>

                {/* Status Filters */}
                <div className="flex flex-wrap gap-2">
                  {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(status => (
                    <button
                      key={status}
                      onClick={() => setFilters({ ...filters, status })}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        filters.status === status
                          ? status === 'PENDING' ? 'bg-amber-500 text-white' :
                            status === 'APPROVED' ? 'bg-green-600 text-white' :
                            status === 'REJECTED' ? 'bg-red-600 text-white' :
                            'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                {/* Advanced Filters */}
                {showFilters && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-gray-200">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Material Category</label>
                      <select
                        value={filters.materialCategory}
                        onChange={(e) => setFilters({ ...filters, materialCategory: e.target.value as MaterialCategory | 'ALL' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="ALL">All Categories</option>
                        <option value="STAINLESS_STEEL">Stainless Steel</option>
                        <option value="ALUMINUM">Aluminum</option>
                        <option value="BRASS">Brass</option>
                        <option value="PVDF">PVDF</option>
                        <option value="PLASTIC">Plastic</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Classification</label>
                      <select
                        value={filters.classification}
                        onChange={(e) => setFilters({ ...filters, classification: e.target.value as ScrapClassification | 'ALL' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="ALL">All Types</option>
                        <option value="REUSABLE">Reusable</option>
                        <option value="NON_REUSABLE">Non-Reusable</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 mb-1">From Date</label>
                      <input
                        type="date"
                        value={filters.dateFrom}
                        onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 mb-1">To Date</label>
                      <input
                        type="date"
                        value={filters.dateTo}
                        onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                {/* Bulk Actions */}
                {selectedIds.size > 0 && (
                  <div className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-lg">
                    <span className="text-sm text-blue-900">{selectedIds.size} selected</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove()}
                        className="px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors flex items-center gap-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve All
                      </button>
                      <button
                        onClick={() => handleReject()}
                        className="px-3 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors flex items-center gap-1"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject All
                      </button>
                      <button
                        onClick={() => setSelectedIds(new Set())}
                        className="px-3 py-1.5 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Results Header */}
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {filters.status === 'PENDING' && (
                  <button
                    onClick={selectAllVisible}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <CheckSquare className="w-4 h-4" />
                    {selectedIds.size === filteredEntries.filter(s => s.approval_status === 'PENDING').length ? 'Deselect' : 'Select'} All
                  </button>
                )}
                <span className="text-sm text-gray-600">
                  {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'}
                </span>
              </div>
              <button
                onClick={exportToCSV}
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>

            {/* Scrap List */}
            <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
              {isLoading ? (
                <div className="p-8 text-center">
                  <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-3 animate-spin" />
                  <p className="text-gray-500">Loading entries...</p>
                </div>
              ) : filteredEntries.length === 0 ? (
                <div className="p-8 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No scrap entries found</p>
                  <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
                </div>
              ) : (
                filteredEntries.map(scrap => (
                  <div
                    key={scrap.id}
                    className={`p-4 transition-colors ${
                      selectedScrap?.id === scrap.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox for pending items */}
                      {scrap.approval_status === 'PENDING' && (
                        <input
                          type="checkbox"
                          checked={selectedIds.has(scrap.id)}
                          onChange={() => toggleSelection(scrap.id)}
                          className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      )}

                      {/* Content */}
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => setSelectedScrap(scrap)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <p className="text-gray-900">{scrap.job_order_no}</p>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                scrap.approval_status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                                scrap.approval_status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {scrap.approval_status}
                              </span>
                              {scrap.finished_good_code && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                                  {scrap.finished_good_code}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{scrap.operator_name} • {scrap.machine_name}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">{scrap.scrap_date}</p>
                            <p className="text-xs text-gray-400">{scrap.scrap_time}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm mb-2">
                          <div>
                            <p className="text-xs text-gray-500">Material</p>
                            <p className="text-gray-900 truncate">{scrap.material_code}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Weight</p>
                            <p className="text-gray-900">{scrap.scrap_weight_kg} kg</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Serial No</p>
                            <p className="text-gray-900 text-xs truncate">{scrap.material_serial_no}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex gap-2 flex-wrap">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              scrap.scrap_classification === 'REUSABLE' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {scrap.scrap_classification}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(scrap.material_category)}`}>
                              {getCategoryName(scrap.material_category)}
                            </span>
                          </div>
                          <p className="text-sm text-red-600">₹{scrap.scrap_value_estimate.toFixed(2)}</p>
                        </div>
                      </div>

                      {/* Quick view button */}
                      <button
                        onClick={() => setSelectedScrap(scrap)}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Details & Approval Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-4 lg:p-6 lg:sticky lg:top-4">
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
                  <p className="text-xs text-gray-500 mt-1">Tracking: {selectedScrap.scrap_tracking_id}</p>
                </div>

                <div className="space-y-3 text-sm mb-4 max-h-[400px] overflow-y-auto">
                  <div>
                    <p className="text-xs text-gray-500">Job Order / FG Code</p>
                    <p className="text-gray-900">{selectedScrap.job_order_no}</p>
                    {selectedScrap.finished_good_code && (
                      <p className="text-xs text-purple-600 mt-0.5">{selectedScrap.finished_good_code}</p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Operator</p>
                    <p className="text-gray-900">{selectedScrap.operator_name}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Material</p>
                    <p className="text-gray-900 text-xs">{selectedScrap.material_identification}</p>
                    <p className="text-xs text-gray-600 mt-0.5">Code: {selectedScrap.material_code}</p>
                    {selectedScrap.material_serial_no && (
                      <p className="text-xs text-gray-600">Serial: {selectedScrap.material_serial_no}</p>
                    )}
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
                    <p className="text-xs text-gray-500">Scrap Type / Reason</p>
                    <p className="text-gray-900">{selectedScrap.scrap_type.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{selectedScrap.reason_name}</p>
                    {selectedScrap.reason_description && (
                      <p className="text-xs text-gray-500 mt-1 italic">{selectedScrap.reason_description}</p>
                    )}
                  </div>

                  <div className="pt-3 border-t">
                    <p className="text-xs text-gray-500 mb-2">Classification</p>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Material:</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${getCategoryColor(selectedScrap.material_category)}`}>
                          {getCategoryName(selectedScrap.material_category)}
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
                      Approval Notes <span className="text-red-500">*</span>
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
                        onClick={() => handleApprove(selectedScrap.id)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(selectedScrap.id)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                )}

                {selectedScrap.approval_status !== 'PENDING' && (
                  <div className="border-t pt-4">
                    <div className={`p-3 rounded-lg ${
                      selectedScrap.approval_status === 'APPROVED' ? 'bg-green-50' : 'bg-red-50'
                    }`}>
                      <p className="text-xs text-gray-600 mb-1">
                        {selectedScrap.approval_status === 'APPROVED' ? 'Approved' : 'Rejected'} by:
                      </p>
                      <p className="text-sm text-gray-900">{selectedScrap.approved_by_name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {selectedScrap.approval_date && new Date(selectedScrap.approval_date).toLocaleString('en-IN')}
                      </p>
                    </div>
                    {selectedScrap.approval_notes && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-1">Notes:</p>
                        <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                          {selectedScrap.approval_notes}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Select a scrap entry to review details</p>
                <p className="text-sm text-gray-400 mt-1">
                  {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'} available
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
