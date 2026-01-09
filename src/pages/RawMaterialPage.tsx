import { useEffect, useState } from 'react';
import { RawMaterialList } from '../components/RawMaterialList';
import { searchRawMaterials } from '../src/services/api/rawMaterials.service';
// import { searchRawMaterials } from '../services//rawMaterials.service';

import { RawMaterial } from '../types';

export function RawMaterialPage() {
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastId, setLastId] = useState<string | null>(null);

  // 🔍 Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      const data = await searchRawMaterials({ search });
      setMaterials(data);
      setLastId(data?.[data.length - 1]?.id ?? null);
      setLoading(false);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [search]);

  const loadMore = async () => {
    const data = await searchRawMaterials({
      search,
      lastId,
    });

    setMaterials(prev => [...prev, ...data]);
    setLastId(data?.[data.length - 1]?.id ?? lastId);
  };

  return (
    <div>
      {/* 🔍 SEARCH BAR */}
      <div className="mb-4 flex gap-3">
        <input
          type="text"
          placeholder="Search material, grade, dimensions, code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      {loading && (
        <p className="text-sm text-gray-500 mb-2">Searching…</p>
      )}

      <RawMaterialList materials={materials} />

      {/* 📄 PAGINATION */}
      {materials.length === 50 && (
        <div className="mt-4 text-center">
          <button
            onClick={loadMore}
            className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
}
