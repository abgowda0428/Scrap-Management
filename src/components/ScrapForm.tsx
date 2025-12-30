import { useState, useEffect } from 'react';
import { ScrapItem } from '../App';
import { Plus, X } from 'lucide-react';

interface ScrapFormProps {
  onSubmit: (item: Omit<ScrapItem, 'id'> | ScrapItem) => void;
  editingItem: ScrapItem | null;
  onCancel: () => void;
}

const categories = ['Metal', 'Plastic', 'Paper', 'Glass', 'Electronics', 'Other'];

export function ScrapForm({ onSubmit, editingItem, onCancel }: ScrapFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Metal',
    quantity: '',
    weight: '',
    unit: 'kg' as 'kg' | 'lbs',
    pricePerUnit: '',
    notes: ''
  });

  useEffect(() => {
    if (editingItem) {
      setFormData({
        name: editingItem.name,
        category: editingItem.category,
        quantity: editingItem.quantity.toString(),
        weight: editingItem.weight.toString(),
        unit: editingItem.unit,
        pricePerUnit: editingItem.pricePerUnit.toString(),
        notes: editingItem.notes || ''
      });
    }
  }, [editingItem]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const item = {
      ...(editingItem && { id: editingItem.id }),
      name: formData.name,
      category: formData.category,
      quantity: parseInt(formData.quantity),
      weight: parseFloat(formData.weight),
      unit: formData.unit,
      pricePerUnit: parseFloat(formData.pricePerUnit),
      dateAdded: editingItem?.dateAdded || new Date().toISOString(),
      notes: formData.notes
    };

    onSubmit(item as any);
    
    if (!editingItem) {
      setFormData({
        name: '',
        category: 'Metal',
        quantity: '',
        weight: '',
        unit: 'kg',
        pricePerUnit: '',
        notes: ''
      });
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      category: 'Metal',
      quantity: '',
      weight: '',
      unit: 'kg',
      pricePerUnit: '',
      notes: ''
    });
    onCancel();
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="mb-4 flex items-center justify-between">
        {editingItem ? 'Edit Scrap Item' : 'Add New Scrap Item'}
        {editingItem && (
          <button
            type="button"
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">
            Item Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Copper Wire"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">
            Category *
          </label>
          <select
            required
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">
            Quantity *
          </label>
          <input
            type="number"
            required
            min="1"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Weight *
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Unit *
            </label>
            <select
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value as 'kg' | 'lbs' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="kg">kg</option>
              <option value="lbs">lbs</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">
            Price per Unit ($) *
          </label>
          <input
            type="number"
            required
            min="0"
            step="0.01"
            value={formData.pricePerUnit}
            onChange={(e) => setFormData({ ...formData, pricePerUnit: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Additional notes..."
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            {editingItem ? (
              <>Update Item</>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add Item
              </>
            )}
          </button>
          {editingItem && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
