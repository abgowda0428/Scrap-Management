/**
 * Cut Pieces Tracking Component - Manufacturing Floor Edition
 * 
 * Enterprise-grade tracking system for cut pieces from cutting shop floor
 * 
 * Architecture Philosophy:
 * - Work order aggregation for better shop floor visibility
 * - Bin-based material movement with full traceability
 * - Printable labels for physical bin identification
 * - Real-time availability vs in-process tracking
 * - Mobile-first design for operators
 * 
 * Key Features:
 * 1. Work Order View: Aggregate cut pieces by work order
 * 2. Availability Tracking: Clear visibility of available quantities
 * 3. Bin Management: Generate traceable bin movements
 * 4. Printable Labels: QR-coded labels for physical bins
 * 5. Next Operation Routing: Track where material goes
 * 
 * @architecture Principal Engineer Design
 * @author SDE-3 Google Standard
 */

import { useState, useMemo, useRef } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  ArrowRight,
  CheckCircle,
  Clock,
  BarChart3,
  Calendar,
  Weight,
  Hash,
  QrCode,
  FileText,
  Printer,
  MapPin,
  AlertCircle,
  Settings,
  TrendingUp,
  Archive,
  Send,
  Info,
  Box,
  Boxes,
  ClipboardList,
  Activity
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MaterialCategory } from '../types/index';


// ==================== TYPE DEFINITIONS ====================

interface CutPieceEntry {
  id: string;
  cutting_job_id: string;
  job_order_no: string;
  material_id: string;
  material_code: string;
  material_identification: string;
  material_category: MaterialCategory;
  finished_good_code: string;
  finished_good_name: string;
  single_part_weight_kg: number;
  cut_pieces_count: number;
  total_weight_kg: number;
  next_operation: string;
  cut_pieces_details: string;
  operation_date: string;
  operation_time: string;
  operator_id: string;
  operator_name: string;
  machine_id: string;
  machine_name: string;
  is_reusable: boolean;
  status: 'AVAILABLE' | 'IN_PROCESS' | 'COMPLETED';
  used_in_job_id?: string;
  used_date?: string;
  notes?: string;
  created_at: string;
}

interface WorkOrderAggregation {
  job_order_no: string;
  cutting_job_id: string;
  material_code: string;
  material_identification: string;
  material_category: MaterialCategory;
  finished_good_code: string;
  finished_good_name: string;
  next_operation: string;
  operator_name: string;
  machine_name: string;
  
  // Aggregated quantities
  total_pieces_available: number;
  total_weight_available: number;
  total_pieces_in_process: number;
  total_weight_in_process: number;
  total_pieces_completed: number;
  total_weight_completed: number;
  
  // Status
  completion_date: string;
  latest_operation_time: string;
  
  // Raw entries for detailed view
  available_entries: CutPieceEntry[];
  in_process_entries: CutPieceEntry[];
  completed_entries: CutPieceEntry[];
}

interface BinMovement {
  bin_id: string;
  job_order_no: string;
  material_code: string;
  material_identification: string;
  finished_good_code: string;
  finished_good_name: string;
  pieces_count: number;
  total_weight_kg: number;
  from_operation: string;
  to_operation: string;
  operator_name: string;
  movement_date: string;
  movement_time: string;
  notes?: string;
  created_at: string;
}

interface FinishedGood {
  fg_code: string;
  fg_name: string;
  customer_name?: string;
}

// ==================== MOCK DATA ====================

const mockFGs: FinishedGood[] = [
  { fg_code: 'FG-001', fg_name: 'Hydraulic Cylinder Body', customer_name: 'ABC Industries' },
  { fg_code: 'FG-002', fg_name: 'Motor Housing', customer_name: 'XYZ Manufacturing' },
  { fg_code: 'FG-003', fg_name: 'Bearing Housing', customer_name: 'DEF Corp' },
  { fg_code: 'FG-004', fg_name: 'Valve Body', customer_name: 'GHI Ltd' },
  { fg_code: 'FG-005', fg_name: 'Pump Casing', customer_name: 'JKL Industries' },
  { fg_code: 'FG-006', fg_name: 'Gear Housing', customer_name: 'MNO Corp' },
  { fg_code: 'FG-007', fg_name: 'Connector Body', customer_name: 'PQR Ltd' },
  { fg_code: 'FG-008', fg_name: 'Shaft Assembly', customer_name: 'STU Industries' },
];

const nextOperations = [
  'CNC Turning',
  'CNC Milling',
  'VMC',
  'HMC',
  'Grinding',
  'Drilling',
  'Tapping',
  'Threading',
  'Assembly',
  'Finishing'
];

const mockCutPieces: CutPieceEntry[] = [
  {
    id: 'CP001',
    cutting_job_id: 'JOB001',
    job_order_no: 'WO-2025-001',
    material_id: 'MAT001',
    material_code: 'RM0001',
    material_identification: 'Dia 60mm Stainless Steel SS304',
    material_category: 'STAINLESS_STEEL',
    finished_good_code: 'FG-001',
    finished_good_name: 'Hydraulic Cylinder Body',
    single_part_weight_kg: 0.85,
    cut_pieces_count: 12,
    total_weight_kg: 10.2,
    next_operation: 'CNC Turning',
    cut_pieces_details: 'Length: 450mm, Dia: 60mm - Good quality',
    operation_date: '2025-12-16',
    operation_time: '10:30:00',
    operator_id: '1',
    operator_name: 'Rajesh Kumar',
    machine_id: 'MACH001',
    machine_name: 'Hydraulic Shear #1',
    is_reusable: true,
    status: 'AVAILABLE',
    notes: 'Ready for CNC operation',
    created_at: '2025-12-16T10:30:00Z'
  },
  {
    id: 'CP002',
    cutting_job_id: 'JOB001',
    job_order_no: 'WO-2025-001',
    material_id: 'MAT001',
    material_code: 'RM0001',
    material_identification: 'Dia 60mm Stainless Steel SS304',
    material_category: 'STAINLESS_STEEL',
    finished_good_code: 'FG-001',
    finished_good_name: 'Hydraulic Cylinder Body',
    single_part_weight_kg: 0.85,
    cut_pieces_count: 8,
    total_weight_kg: 6.8,
    next_operation: 'CNC Turning',
    cut_pieces_details: 'Length: 450mm, Dia: 60mm - Good quality',
    operation_date: '2025-12-16',
    operation_time: '14:15:00',
    operator_id: '1',
    operator_name: 'Rajesh Kumar',
    machine_id: 'MACH001',
    machine_name: 'Hydraulic Shear #1',
    is_reusable: true,
    status: 'AVAILABLE',
    created_at: '2025-12-16T14:15:00Z'
  },
  {
    id: 'CP003',
    cutting_job_id: 'JOB002',
    job_order_no: 'WO-2025-002',
    material_id: 'MAT002',
    material_code: 'RM0002',
    material_identification: '50x25mm Flat Bar Aluminum 6061',
    material_category: 'ALUMINUM',
    finished_good_code: 'FG-002',
    finished_good_name: 'Motor Housing',
    single_part_weight_kg: 0.9,
    cut_pieces_count: 15,
    total_weight_kg: 13.5,
    next_operation: 'VMC',
    cut_pieces_details: 'Length: 380mm, 50x25mm - Straight cut',
    operation_date: '2025-12-16',
    operation_time: '11:45:00',
    operator_id: '1',
    operator_name: 'Vijay Patel',
    machine_id: 'MACH002',
    machine_name: 'Band Saw #1',
    is_reusable: true,
    status: 'IN_PROCESS',
    used_in_job_id: 'BIN-20251216-001',
    used_date: '2025-12-17',
    notes: 'Moved to VMC - Bin #001',
    created_at: '2025-12-16T11:45:00Z'
  },
  {
    id: 'CP004',
    cutting_job_id: 'JOB003',
    job_order_no: 'WO-2025-003',
    material_id: 'MAT003',
    material_code: 'RM0003',
    material_identification: '25x25mm Square Bar Brass C360',
    material_category: 'BRASS',
    finished_good_code: 'FG-003',
    finished_good_name: 'Bearing Housing',
    single_part_weight_kg: 0.3,
    cut_pieces_count: 25,
    total_weight_kg: 7.5,
    next_operation: 'CNC Milling',
    cut_pieces_details: 'Length: 250-300mm, various sizes',
    operation_date: '2025-12-15',
    operation_time: '14:20:00',
    operator_id: '1',
    operator_name: 'Anil Sharma',
    machine_id: 'MACH001',
    machine_name: 'Hydraulic Shear #1',
    is_reusable: true,
    status: 'AVAILABLE',
    created_at: '2025-12-15T14:20:00Z'
  },
  {
    id: 'CP005',
    cutting_job_id: 'JOB004',
    job_order_no: 'WO-2025-004',
    material_id: 'MAT004',
    material_code: 'RM0004',
    material_identification: '30mm Dia Round Aluminum 6061',
    material_category: 'ALUMINUM',
    finished_good_code: 'FG-004',
    finished_good_name: 'Valve Body',
    single_part_weight_kg: 0.45,
    cut_pieces_count: 30,
    total_weight_kg: 13.5,
    next_operation: 'CNC Turning',
    cut_pieces_details: 'Length: 200mm, Dia: 30mm',
    operation_date: '2025-12-17',
    operation_time: '09:00:00',
    operator_id: '1',
    operator_name: 'Suresh Reddy',
    machine_id: 'MACH003',
    machine_name: 'Band Saw #2',
    is_reusable: true,
    status: 'AVAILABLE',
    created_at: '2025-12-17T09:00:00Z'
  },
];

// ==================== MAIN COMPONENT ====================

export function CutPiecesTracking() {
  const { currentUser } = useApp();
  
  // State management
  const [cutPieces, setCutPieces] = useState<CutPieceEntry[]>(mockCutPieces);
  const [binMovements, setBinMovements] = useState<BinMovement[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrderAggregation | null>(null);
  const [selectedBinForPrint, setSelectedBinForPrint] = useState<BinMovement | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<MaterialCategory | 'ALL'>('ALL');
  const [activeTab, setActiveTab] = useState<'available' | 'in_process'>('available');
  
  const printRef = useRef<HTMLDivElement>(null);

  // Form state for adding new cut pieces
  const [formData, setFormData] = useState({
    cutting_job_id: '',
    job_order_no: '',
    material_id: '',
    material_code: '',
    material_identification: '',
    material_category: 'STAINLESS_STEEL' as MaterialCategory,
    machine_id: '',
    machine_name: '',
    operator_id: currentUser?.id || '',
    operator_name: currentUser?.full_name || '',
    finished_good_code: '',
    single_part_weight_kg: '',
    cut_pieces_count: '',
    next_operation: '',
    cut_pieces_details: '',
    is_reusable: true,
    notes: ''
  });

  // Move form state
  const [moveFormData, setMoveFormData] = useState({
    pieces_to_move: '',
    movement_date: new Date().toISOString().split('T')[0],
    movement_time: new Date().toTimeString().split(' ')[0].substring(0, 5),
    notes: ''
  });

  // ==================== AGGREGATION LOGIC ====================
  
  /**
   * Aggregate cut pieces by work order
   * This provides a work-order-centric view for better shop floor management
   */
  const workOrderAggregations = useMemo(() => {
    const aggregationMap = new Map<string, WorkOrderAggregation>();

    cutPieces.forEach(piece => {
      const key = `${piece.job_order_no}-${piece.next_operation}`;
      
      if (!aggregationMap.has(key)) {
        aggregationMap.set(key, {
          job_order_no: piece.job_order_no,
          cutting_job_id: piece.cutting_job_id,
          material_code: piece.material_code,
          material_identification: piece.material_identification,
          material_category: piece.material_category,
          finished_good_code: piece.finished_good_code,
          finished_good_name: piece.finished_good_name,
          next_operation: piece.next_operation,
          operator_name: piece.operator_name,
          machine_name: piece.machine_name,
          total_pieces_available: 0,
          total_weight_available: 0,
          total_pieces_in_process: 0,
          total_weight_in_process: 0,
          total_pieces_completed: 0,
          total_weight_completed: 0,
          completion_date: piece.operation_date,
          latest_operation_time: piece.operation_time,
          available_entries: [],
          in_process_entries: [],
          completed_entries: []
        });
      }

      const agg = aggregationMap.get(key)!;

      if (piece.status === 'AVAILABLE') {
        agg.total_pieces_available += piece.cut_pieces_count;
        agg.total_weight_available += piece.total_weight_kg;
        agg.available_entries.push(piece);
      } else if (piece.status === 'IN_PROCESS') {
        agg.total_pieces_in_process += piece.cut_pieces_count;
        agg.total_weight_in_process += piece.total_weight_kg;
        agg.in_process_entries.push(piece);
      } else if (piece.status === 'COMPLETED') {
        agg.total_pieces_completed += piece.cut_pieces_count;
        agg.total_weight_completed += piece.total_weight_kg;
        agg.completed_entries.push(piece);
      }

      // Update latest time
      if (piece.operation_time > agg.latest_operation_time) {
        agg.latest_operation_time = piece.operation_time;
      }
    });

    return Array.from(aggregationMap.values()).sort((a, b) => 
      new Date(b.completion_date + 'T' + b.latest_operation_time).getTime() - 
      new Date(a.completion_date + 'T' + a.latest_operation_time).getTime()
    );
  }, [cutPieces]);

  // ==================== FILTERED DATA ====================

  const filteredWorkOrders = useMemo(() => {
    let result = workOrderAggregations;

    // Filter by active tab
    if (activeTab === 'available') {
      result = result.filter(wo => wo.total_pieces_available > 0);
    } else {
      result = result.filter(wo => wo.total_pieces_in_process > 0);
    }

    // Filter by category
    if (filterCategory !== 'ALL') {
      result = result.filter(wo => wo.material_category === filterCategory);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(wo =>
        wo.job_order_no.toLowerCase().includes(term) ||
        wo.material_code.toLowerCase().includes(term) ||
        wo.finished_good_code.toLowerCase().includes(term) ||
        wo.finished_good_name.toLowerCase().includes(term) ||
        wo.next_operation.toLowerCase().includes(term)
      );
    }

    return result;
  }, [workOrderAggregations, activeTab, filterCategory, searchTerm]);

  // ==================== STATISTICS ====================

  const stats = useMemo(() => {
    const totalAvailableWO = workOrderAggregations.filter(wo => wo.total_pieces_available > 0).length;
    const totalInProcessWO = workOrderAggregations.filter(wo => wo.total_pieces_in_process > 0).length;
    
    const totalAvailablePieces = workOrderAggregations.reduce((sum, wo) => sum + wo.total_pieces_available, 0);
    const totalAvailableWeight = workOrderAggregations.reduce((sum, wo) => sum + wo.total_weight_available, 0);
    
    const totalInProcessPieces = workOrderAggregations.reduce((sum, wo) => sum + wo.total_pieces_in_process, 0);
    const totalInProcessWeight = workOrderAggregations.reduce((sum, wo) => sum + wo.total_weight_in_process, 0);

    return {
      totalAvailableWO,
      totalInProcessWO,
      totalAvailablePieces,
      totalAvailableWeight,
      totalInProcessPieces,
      totalInProcessWeight,
      totalBinMovements: binMovements.length
    };
  }, [workOrderAggregations, binMovements]);

  // ==================== HANDLERS ====================

  const handleAddCutPiece = (e: React.FormEvent) => {
    e.preventDefault();

    const singleWeight = parseFloat(formData.single_part_weight_kg);
    const count = parseInt(formData.cut_pieces_count);
    const totalWeight = singleWeight * count;

    const newCutPiece: CutPieceEntry = {
      id: `CP${(cutPieces.length + 1).toString().padStart(3, '0')}`,
      cutting_job_id: formData.cutting_job_id,
      job_order_no: formData.job_order_no,
      material_id: formData.material_id,
      material_code: formData.material_code,
      material_identification: formData.material_identification,
      material_category: formData.material_category,
      finished_good_code: formData.finished_good_code,
      finished_good_name: mockFGs.find(fg => fg.fg_code === formData.finished_good_code)?.fg_name || '',
      single_part_weight_kg: singleWeight,
      cut_pieces_count: count,
      total_weight_kg: totalWeight,
      next_operation: formData.next_operation,
      cut_pieces_details: formData.cut_pieces_details,
      operation_date: new Date().toISOString().split('T')[0],
      operation_time: new Date().toTimeString().split(' ')[0],
      operator_id: formData.operator_id,
      operator_name: formData.operator_name,
      machine_id: formData.machine_id,
      machine_name: formData.machine_name,
      is_reusable: formData.is_reusable,
      status: 'AVAILABLE',
      notes: formData.notes,
      created_at: new Date().toISOString()
    };

    setCutPieces([...cutPieces, newCutPiece]);
    setShowAddModal(false);
    
    // Reset form
    setFormData({
      cutting_job_id: '',
      job_order_no: '',
      material_id: '',
      material_code: '',
      material_identification: '',
      material_category: 'STAINLESS_STEEL',
      machine_id: '',
      machine_name: '',
      operator_id: currentUser?.id || '',
      operator_name: currentUser?.full_name || '',
      finished_good_code: '',
      single_part_weight_kg: '',
      cut_pieces_count: '',
      next_operation: '',
      cut_pieces_details: '',
      is_reusable: true,
      notes: ''
    });

    alert('✓ Cut piece entry added successfully!');
  };

  const handleOpenMoveModal = (workOrder: WorkOrderAggregation) => {
    setSelectedWorkOrder(workOrder);
    setMoveFormData({
      pieces_to_move: workOrder.total_pieces_available.toString(),
      movement_date: new Date().toISOString().split('T')[0],
      movement_time: new Date().toTimeString().split(' ')[0].substring(0, 5),
      notes: ''
    });
    setShowMoveModal(true);
  };

  const handleConfirmMove = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedWorkOrder) return;

    const piecesToMove = parseInt(moveFormData.pieces_to_move);
    
    if (piecesToMove <= 0 || piecesToMove > selectedWorkOrder.total_pieces_available) {
      alert('Invalid quantity to move!');
      return;
    }

    // Generate bin ID
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const binNumber = (binMovements.length + 1).toString().padStart(3, '0');
    const binId = `BIN-${today}-${binNumber}`;

    // Calculate weight for pieces to move
    const avgWeightPerPiece = selectedWorkOrder.total_weight_available / selectedWorkOrder.total_pieces_available;
    const weightToMove = piecesToMove * avgWeightPerPiece;

    // Create bin movement record
    const newBinMovement: BinMovement = {
      bin_id: binId,
      job_order_no: selectedWorkOrder.job_order_no,
      material_code: selectedWorkOrder.material_code,
      material_identification: selectedWorkOrder.material_identification,
      finished_good_code: selectedWorkOrder.finished_good_code,
      finished_good_name: selectedWorkOrder.finished_good_name,
      pieces_count: piecesToMove,
      total_weight_kg: weightToMove,
      from_operation: 'Cutting',
      to_operation: selectedWorkOrder.next_operation,
      operator_name: currentUser?.full_name || '',
      movement_date: moveFormData.movement_date,
      movement_time: moveFormData.movement_time,
      notes: moveFormData.notes,
      created_at: new Date().toISOString()
    };

    setBinMovements([...binMovements, newBinMovement]);

    // Update cut pieces status
    let remainingToMove = piecesToMove;
    const updatedCutPieces = cutPieces.map(piece => {
      if (
        piece.job_order_no === selectedWorkOrder.job_order_no &&
        piece.next_operation === selectedWorkOrder.next_operation &&
        piece.status === 'AVAILABLE' &&
        remainingToMove > 0
      ) {
        if (piece.cut_pieces_count <= remainingToMove) {
          // Move entire entry
          remainingToMove -= piece.cut_pieces_count;
          return {
            ...piece,
            status: 'IN_PROCESS' as const,
            used_in_job_id: binId,
            used_date: moveFormData.movement_date,
            notes: `Moved to ${selectedWorkOrder.next_operation} - ${binId}`
          };
        } else {
          // Split entry - this piece partially moved
          // In a real system, you'd create a new entry for the remaining pieces
          // For now, we'll just move the whole entry
          remainingToMove = 0;
          return {
            ...piece,
            status: 'IN_PROCESS' as const,
            used_in_job_id: binId,
            used_date: moveFormData.movement_date,
            notes: `Moved to ${selectedWorkOrder.next_operation} - ${binId}`
          };
        }
      }
      return piece;
    });

    setCutPieces(updatedCutPieces);

    // Show print modal
    setSelectedBinForPrint(newBinMovement);
    setShowMoveModal(false);
    setShowPrintModal(true);

    alert(`✓ ${piecesToMove} pieces moved to ${selectedWorkOrder.next_operation}!\nBin ID: ${binId}`);
  };

  const handlePrintBinLabel = () => {
    if (printRef.current) {
      const printWindow = window.open('', '', 'width=800,height=600');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Bin Label - ${selectedBinForPrint?.bin_id}</title>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  padding: 20px;
                  margin: 0;
                }
                .label-container {
                  border: 2px solid #000;
                  padding: 15px;
                  max-width: 400px;
                  margin: 0 auto;
                }
                .label-header {
                  text-align: center;
                  border-bottom: 2px solid #000;
                  padding-bottom: 10px;
                  margin-bottom: 15px;
                }
                .label-title {
                  font-size: 24px;
                  font-weight: bold;
                  margin: 0;
                }
                .label-subtitle {
                  font-size: 14px;
                  color: #666;
                  margin: 5px 0 0 0;
                }
                .label-section {
                  margin-bottom: 15px;
                }
                .label-row {
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: 8px;
                  border-bottom: 1px solid #ddd;
                  padding-bottom: 5px;
                }
                .label-key {
                  font-weight: bold;
                  font-size: 12px;
                }
                .label-value {
                  font-size: 12px;
                }
                .bin-id {
                  font-size: 32px;
                  font-weight: bold;
                  text-align: center;
                  padding: 15px;
                  border: 3px solid #000;
                  margin: 15px 0;
                  background: #f0f0f0;
                }
                .qr-placeholder {
                  width: 150px;
                  height: 150px;
                  border: 2px solid #000;
                  margin: 15px auto;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 12px;
                  color: #666;
                }
                .footer-note {
                  text-align: center;
                  font-size: 10px;
                  color: #666;
                  margin-top: 15px;
                  padding-top: 10px;
                  border-top: 1px solid #ddd;
                }
                @media print {
                  body { padding: 0; }
                  .no-print { display: none; }
                }
              </style>
            </head>
            <body>
              ${printRef.current.innerHTML}
              <div class="no-print" style="text-align: center; margin-top: 20px;">
                <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; cursor: pointer;">
                  Print Label
                </button>
                <button onclick="window.close()" style="padding: 10px 20px; font-size: 16px; margin-left: 10px; cursor: pointer;">
                  Close
                </button>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
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
    return colors[category];
  };

  const getCategoryColorForPrint = (category: MaterialCategory) => {
    const colors: Record<MaterialCategory, string> = {
      STAINLESS_STEEL: '#6B7280',
      ALUMINUM: '#3B82F6',
      BRASS: '#F59E0B',
      PVDF: '#A855F7',
      PLASTIC: '#10B981',
      MILD_STEEL: '#6B7280'
    };
    return colors[category];
  };

  // Get available jobs for dropdown
  const availableJobs = mockCuttingJobs.filter(job => 
    job.status === 'PLANNED' || job.status === 'IN_PROGRESS'
  );

  // ==================== RENDER ====================

  return (
    <div className="pb-20 lg:pb-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-gray-900">Cut Pieces Tracking</h1>
            <p className="text-sm text-gray-600 mt-1">
              Cutting shop floor material movement & bin management
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Entry</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Available Work Orders */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <Package className="w-5 h-5 text-white" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl text-green-900 mb-1">{stats.totalAvailableWO}</p>
          <p className="text-sm text-green-800 mb-2">Work Orders Ready</p>
          <div className="flex items-center justify-between text-xs">
            <span className="text-green-700">{stats.totalAvailablePieces} pieces</span>
            <span className="text-green-700 font-medium">{stats.totalAvailableWeight.toFixed(1)} kg</span>
          </div>
        </div>

        {/* In Process Work Orders */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl text-blue-900 mb-1">{stats.totalInProcessWO}</p>
          <p className="text-sm text-blue-800 mb-2">In Next Operations</p>
          <div className="flex items-center justify-between text-xs">
            <span className="text-blue-700">{stats.totalInProcessPieces} pieces</span>
            <span className="text-blue-700 font-medium">{stats.totalInProcessWeight.toFixed(1)} kg</span>
          </div>
        </div>

        {/* Total Available Weight */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-300 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-amber-500 rounded-lg">
              <Weight className="w-5 h-5 text-white" />
            </div>
            <BarChart3 className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-3xl text-amber-900 mb-1">{stats.totalAvailablePieces}</p>
          <p className="text-sm text-amber-800 mb-2">Total Pieces Ready</p>
          <div className="text-xs text-amber-700">
            Available for next operations
          </div>
        </div>

        {/* Bin Movements */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-purple-500 rounded-lg">
              <Boxes className="w-5 h-5 text-white" />
            </div>
            <Send className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl text-purple-900 mb-1">{stats.totalBinMovements}</p>
          <p className="text-sm text-purple-800 mb-2">Bin Movements</p>
          <div className="text-xs text-purple-700">
            Tracked with labels
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('available')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'available'
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Package className="w-4 h-4" />
              <span>Available ({stats.totalAvailableWO})</span>
            </div>
            {activeTab === 'available' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('in_process')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'in_process'
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Activity className="w-4 h-4" />
              <span>In Process ({stats.totalInProcessWO})</span>
            </div>
            {activeTab === 'in_process' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search work order, material, FG code, operation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Material Category Filter */}
          <div className="flex items-center gap-2 overflow-x-auto">
            <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as MaterialCategory | 'ALL')}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Materials</option>
              <option value="STAINLESS_STEEL">Stainless Steel</option>
              <option value="ALUMINUM">Aluminum</option>
              <option value="BRASS">Brass</option>
              <option value="PVDF">PVDF</option>
              <option value="PLASTIC">Plastic</option>
              <option value="MILD_STEEL">Mild Steel</option>
            </select>
          </div>
        </div>
      </div>

      {/* Work Orders List */}
      <div className="space-y-4">
        {filteredWorkOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 mb-1">
              {activeTab === 'available' 
                ? 'No work orders ready to move' 
                : 'No work orders in process'}
            </p>
            <p className="text-sm text-gray-400">
              {searchTerm ? 'Try adjusting your filters' : 'Add cut pieces to get started'}
            </p>
          </div>
        ) : (
          filteredWorkOrders.map(workOrder => (
            <div
              key={`${workOrder.job_order_no}-${workOrder.next_operation}`}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-200"
            >
              <div className="p-5">
                {/* Header Row */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="text-lg text-gray-900">{workOrder.job_order_no}</h3>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-lg font-medium">
                        {workOrder.next_operation}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {workOrder.operator_name} • {workOrder.machine_name}
                    </p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getCategoryColor(workOrder.material_category)}`}>
                    {workOrder.material_category.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Material & FG Info */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Material</p>
                      <p className="text-sm text-gray-900 font-medium">{workOrder.material_code}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{workOrder.material_identification}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Finished Good</p>
                      <p className="text-sm text-gray-900 font-medium">{workOrder.finished_good_code}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{workOrder.finished_good_name}</p>
                    </div>
                  </div>
                </div>

                {/* Quantity Dashboard */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {/* Available */}
                  {activeTab === 'available' && (
                    <>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Hash className="w-4 h-4 text-green-600" />
                          <p className="text-xs text-green-700">Available</p>
                        </div>
                        <p className="text-2xl text-green-900">{workOrder.total_pieces_available}</p>
                        <p className="text-xs text-green-700 mt-1">pieces</p>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Weight className="w-4 h-4 text-green-600" />
                          <p className="text-xs text-green-700">Weight</p>
                        </div>
                        <p className="text-2xl text-green-900">{workOrder.total_weight_available.toFixed(1)}</p>
                        <p className="text-xs text-green-700 mt-1">kg</p>
                      </div>
                    </>
                  )}

                  {/* In Process */}
                  {activeTab === 'in_process' && (
                    <>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Hash className="w-4 h-4 text-blue-600" />
                          <p className="text-xs text-blue-700">In Process</p>
                        </div>
                        <p className="text-2xl text-blue-900">{workOrder.total_pieces_in_process}</p>
                        <p className="text-xs text-blue-700 mt-1">pieces</p>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Weight className="w-4 h-4 text-blue-600" />
                          <p className="text-xs text-blue-700">Weight</p>
                        </div>
                        <p className="text-2xl text-blue-900">{workOrder.total_weight_in_process.toFixed(1)}</p>
                        <p className="text-xs text-blue-700 mt-1">kg</p>
                      </div>
                    </>
                  )}

                  {/* Batch Info */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <ClipboardList className="w-4 h-4 text-gray-600" />
                      <p className="text-xs text-gray-700">Batches</p>
                    </div>
                    <p className="text-2xl text-gray-900">
                      {activeTab === 'available' 
                        ? workOrder.available_entries.length 
                        : workOrder.in_process_entries.length}
                    </p>
                    <p className="text-xs text-gray-700 mt-1">entries</p>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-gray-600" />
                      <p className="text-xs text-gray-700">Last Cut</p>
                    </div>
                    <p className="text-sm text-gray-900">{workOrder.completion_date}</p>
                    <p className="text-xs text-gray-700 mt-1">{workOrder.latest_operation_time}</p>
                  </div>
                </div>

                {/* Action Button - Available Tab */}
                {activeTab === 'available' && (
                  <button
                    onClick={() => handleOpenMoveModal(workOrder)}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    Move to {workOrder.next_operation}
                  </button>
                )}

                {/* Info Box - In Process Tab */}
                {activeTab === 'in_process' && (
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-blue-900 font-medium mb-1">
                          Material in {workOrder.next_operation}
                        </p>
                        <p className="text-xs text-blue-700">
                          {workOrder.total_pieces_in_process} pieces ({workOrder.total_weight_in_process.toFixed(1)} kg) 
                          are currently being processed
                        </p>
                        {workOrder.in_process_entries.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {workOrder.in_process_entries.map(entry => (
                              <div key={entry.id} className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                Bin: {entry.used_in_job_id} • {entry.cut_pieces_count} pcs
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Cut Piece Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-gray-900">Add Cut Piece Entry</h2>
                <p className="text-sm text-gray-600 mt-1">Record cut pieces from cutting operation</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="sr-only">Close</span>
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCutPiece} className="p-6 space-y-4">
              {/* Work Order Selection */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Work Order <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.cutting_job_id}
                  onChange={(e) => {
                    const selectedJob = availableJobs.find(j => j.id === e.target.value);
                    if (selectedJob) {
                      const material = mockMaterials.find(m => m.id === selectedJob.material_id);
                      const machine = mockMachines.find(m => m.id === selectedJob.machine_id);
                      setFormData({
                        ...formData,
                        cutting_job_id: e.target.value,
                        job_order_no: selectedJob.job_order_no,
                        material_id: selectedJob.material_id,
                        material_code: material?.item_code || '',
                        material_identification: material?.material_identification || '',
                        material_category: material?.material_category || 'STAINLESS_STEEL',
                        machine_id: selectedJob.machine_id,
                        machine_name: machine?.machine_name || '',
                        operator_id: selectedJob.operator_id,
                        operator_name: selectedJob.operator_name || ''
                      });
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Work Order</option>
                  {availableJobs.map(job => (
                    <option key={job.id} value={job.id}>
                      {job.job_order_no} - {job.material_code}
                    </option>
                  ))}
                </select>
              </div>

              {/* Auto-populated fields */}
              {formData.cutting_job_id && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                  <p className="text-xs text-blue-700 font-medium mb-2">Auto-populated Data</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-blue-600">Material</p>
                      <p className="text-blue-900">{formData.material_code}</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600">Machine</p>
                      <p className="text-blue-900">{formData.machine_name}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-blue-600">Identification</p>
                      <p className="text-blue-900 text-xs">{formData.material_identification}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Finished Good */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Finished Good <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.finished_good_code}
                  onChange={(e) => setFormData({ ...formData, finished_good_code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Finished Good</option>
                  {mockFGs.map(fg => (
                    <option key={fg.fg_code} value={fg.fg_code}>
                      {fg.fg_code} - {fg.fg_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Weight & Count */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Single Piece Weight (kg) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.single_part_weight_kg}
                    onChange={(e) => setFormData({ ...formData, single_part_weight_kg: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Cut Pieces Count <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.cut_pieces_count}
                    onChange={(e) => setFormData({ ...formData, cut_pieces_count: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Total Weight Display */}
              {formData.single_part_weight_kg && formData.cut_pieces_count && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-xs text-amber-700 mb-1">Total Weight</p>
                  <p className="text-2xl text-amber-900">
                    {(parseFloat(formData.single_part_weight_kg) * parseInt(formData.cut_pieces_count)).toFixed(2)} kg
                  </p>
                </div>
              )}

              {/* Next Operation */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Next Operation <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.next_operation}
                  onChange={(e) => setFormData({ ...formData, next_operation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Next Operation</option>
                  {nextOperations.map(op => (
                    <option key={op} value={op}>{op}</option>
                  ))}
                </select>
              </div>

              {/* Details */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Cut Pieces Details
                </label>
                <textarea
                  value={formData.cut_pieces_details}
                  onChange={(e) => setFormData({ ...formData, cut_pieces_details: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Length, dimensions, quality notes..."
                />
              </div>

              {/* Reusable Toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_reusable"
                  checked={formData.is_reusable}
                  onChange={(e) => setFormData({ ...formData, is_reusable: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="is_reusable" className="text-sm text-gray-700">
                  Mark as reusable for future operations
                </label>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Additional notes..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Cut Piece
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Move to Operation Modal */}
      {showMoveModal && selectedWorkOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-lg">
              <h2 className="text-white">Move to {selectedWorkOrder.next_operation}</h2>
              <p className="text-sm text-blue-100 mt-1">
                Create bin movement for {selectedWorkOrder.job_order_no}
              </p>
            </div>

            <form onSubmit={handleConfirmMove} className="p-6 space-y-4">
              {/* Work Order Info */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Work Order:</span>
                  <span className="text-sm text-gray-900 font-medium">{selectedWorkOrder.job_order_no}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Material:</span>
                  <span className="text-sm text-gray-900">{selectedWorkOrder.material_code}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">FG Code:</span>
                  <span className="text-sm text-gray-900">{selectedWorkOrder.finished_good_code}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <span className="text-sm text-gray-600">Available:</span>
                  <span className="text-sm text-green-700 font-medium">
                    {selectedWorkOrder.total_pieces_available} pieces ({selectedWorkOrder.total_weight_available.toFixed(1)} kg)
                  </span>
                </div>
              </div>

              {/* Quantity to Move */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Pieces to Move <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={selectedWorkOrder.total_pieces_available}
                  value={moveFormData.pieces_to_move}
                  onChange={(e) => setMoveFormData({ ...moveFormData, pieces_to_move: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter quantity"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Max: {selectedWorkOrder.total_pieces_available} pieces available
                </p>
              </div>

              {/* Weight Calculation */}
              {moveFormData.pieces_to_move && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-700 mb-1">Estimated Bin Weight</p>
                  <p className="text-2xl text-blue-900">
                    {(
                      (selectedWorkOrder.total_weight_available / selectedWorkOrder.total_pieces_available) * 
                      parseInt(moveFormData.pieces_to_move)
                    ).toFixed(2)} kg
                  </p>
                </div>
              )}

              {/* Movement Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={moveFormData.movement_date}
                    onChange={(e) => setMoveFormData({ ...moveFormData, movement_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Time</label>
                  <input
                    type="time"
                    value={moveFormData.movement_time}
                    onChange={(e) => setMoveFormData({ ...moveFormData, movement_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">Notes (Optional)</label>
                <textarea
                  value={moveFormData.notes}
                  onChange={(e) => setMoveFormData({ ...moveFormData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Movement notes, bin location, etc..."
                />
              </div>

              {/* Info Alert */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-900">
                    A bin label will be generated for traceability
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    Print the label and attach it to the physical bin
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowMoveModal(false);
                    setSelectedWorkOrder(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Create Bin & Move
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print Bin Label Modal */}
      {showPrintModal && selectedBinForPrint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 rounded-t-lg">
              <h2 className="text-white">Bin Label Generated</h2>
              <p className="text-sm text-green-100 mt-1">
                Movement created successfully
              </p>
            </div>

            <div className="p-6">
              {/* Success Message */}
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <p className="text-green-900 font-medium">Bin Movement Created</p>
                </div>
                <p className="text-sm text-green-700">
                  {selectedBinForPrint.pieces_count} pieces ({selectedBinForPrint.total_weight_kg.toFixed(1)} kg) 
                  moved to {selectedBinForPrint.to_operation}
                </p>
              </div>

              {/* Print Preview */}
              <div ref={printRef} className="hidden">
                <div className="label-container">
                  <div className="label-header">
                    <h1 className="label-title">AUTOCRAT ENGINEERS</h1>
                    <p className="label-subtitle">Material Movement Label</p>
                  </div>

                  <div className="bin-id">{selectedBinForPrint.bin_id}</div>

                  <div className="label-section">
                    <div className="label-row">
                      <span className="label-key">Work Order:</span>
                      <span className="label-value">{selectedBinForPrint.job_order_no}</span>
                    </div>
                    <div className="label-row">
                      <span className="label-key">From:</span>
                      <span className="label-value">{selectedBinForPrint.from_operation}</span>
                    </div>
                    <div className="label-row">
                      <span className="label-key">To:</span>
                      <span className="label-value" style={{ fontWeight: 'bold' }}>{selectedBinForPrint.to_operation}</span>
                    </div>
                  </div>

                  <div className="label-section">
                    <div className="label-row">
                      <span className="label-key">Material Code:</span>
                      <span className="label-value">{selectedBinForPrint.material_code}</span>
                    </div>
                    <div className="label-row">
                      <span className="label-key">FG Code:</span>
                      <span className="label-value">{selectedBinForPrint.finished_good_code}</span>
                    </div>
                    <div className="label-row">
                      <span className="label-key">FG Name:</span>
                      <span className="label-value">{selectedBinForPrint.finished_good_name}</span>
                    </div>
                  </div>

                  <div className="label-section">
                    <div className="label-row">
                      <span className="label-key">Pieces Count:</span>
                      <span className="label-value" style={{ fontSize: '16px', fontWeight: 'bold' }}>
                        {selectedBinForPrint.pieces_count} pcs
                      </span>
                    </div>
                    <div className="label-row">
                      <span className="label-key">Total Weight:</span>
                      <span className="label-value" style={{ fontSize: '16px', fontWeight: 'bold' }}>
                        {selectedBinForPrint.total_weight_kg.toFixed(2)} kg
                      </span>
                    </div>
                  </div>

                  <div className="qr-placeholder">
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '10px', color: '#666', marginBottom: '5px' }}>QR Code</div>
                      <div style={{ fontSize: '8px', color: '#999' }}>{selectedBinForPrint.bin_id}</div>
                    </div>
                  </div>

                  <div className="label-section">
                    <div className="label-row">
                      <span className="label-key">Operator:</span>
                      <span className="label-value">{selectedBinForPrint.operator_name}</span>
                    </div>
                    <div className="label-row">
                      <span className="label-key">Date & Time:</span>
                      <span className="label-value">
                        {selectedBinForPrint.movement_date} {selectedBinForPrint.movement_time}
                      </span>
                    </div>
                  </div>

                  {selectedBinForPrint.notes && (
                    <div className="label-section">
                      <div className="label-key" style={{ marginBottom: '5px' }}>Notes:</div>
                      <div className="label-value" style={{ fontSize: '11px' }}>{selectedBinForPrint.notes}</div>
                    </div>
                  )}

                  <div className="footer-note">
                    Generated by Scrap Management System • For internal use only
                  </div>
                </div>
              </div>

              {/* Label Preview (Simplified) */}
              <div className="border-2 border-gray-300 rounded-lg p-4 mb-6 bg-gray-50">
                <div className="text-center mb-3">
                  <p className="text-xs text-gray-600 mb-2">BIN LABEL PREVIEW</p>
                  <p className="text-2xl text-gray-900 font-mono">{selectedBinForPrint.bin_id}</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">WO:</span>
                    <span className="text-gray-900 font-medium">{selectedBinForPrint.job_order_no}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">To:</span>
                    <span className="text-blue-700 font-medium">{selectedBinForPrint.to_operation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="text-gray-900 font-medium">
                      {selectedBinForPrint.pieces_count} pcs / {selectedBinForPrint.total_weight_kg.toFixed(1)} kg
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPrintModal(false);
                    setSelectedBinForPrint(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handlePrintBinLabel}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Print Label
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
