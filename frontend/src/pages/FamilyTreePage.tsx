import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Tree from 'react-d3-tree';
import { ArrowLeft, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { familiesAPI } from '../services/api';

interface PersonNode {
  id: string;
  firstName: string;
  lastName: string;
  gender: string | null;
  dateOfBirth: string | null;
  dateOfDeath: string | null;
  isDeceased: boolean;
  profilePhoto: string | null;
  bio: string | null;
  occupation: string | null;
  biologicalFatherId: string | null;
  biologicalMotherId: string | null;
  biologicalChildren: { id: string }[];
  biologicalChildrenMother: { id: string }[];
  marriagesAsSpouse1: { spouse2: { id: string; firstName: string; lastName: string } }[];
  marriagesAsSpouse2: { spouse1: { id: string; firstName: string; lastName: string } }[];
}

interface TreeNode {
  name: string;
  attributes?: Record<string, string>;
  children?: TreeNode[];
  _personId?: string;
}

// Build a hierarchical tree from flat person array
function buildTree(persons: PersonNode[]): TreeNode[] {
  const map = new Map(persons.map(p => [p.id, p]));

  // Find roots: people who have no parents in this family group
  const hasParentInSet = (p: PersonNode) =>
    (p.biologicalFatherId && map.has(p.biologicalFatherId)) ||
    (p.biologicalMotherId && map.has(p.biologicalMotherId));

  const roots = persons.filter(p => !hasParentInSet(p));

  const visited = new Set<string>();

  function toNode(p: PersonNode): TreeNode {
    visited.add(p.id);
    const name = `${p.firstName} ${p.lastName}`;
    const birthYear = p.dateOfBirth ? new Date(p.dateOfBirth).getFullYear().toString() : '';
    const deathYear = p.dateOfDeath ? new Date(p.dateOfDeath).getFullYear().toString() : '';

    const attributes: Record<string, string> = {};
    if (birthYear) attributes['Born'] = birthYear;
    if (p.isDeceased && deathYear) attributes['Died'] = deathYear;
    if (p.occupation) attributes['Occupation'] = p.occupation;

    // Collect children IDs
    const childIds = new Set([
      ...p.biologicalChildren.map(c => c.id),
      ...p.biologicalChildrenMother.map(c => c.id)
    ]);

    const children: TreeNode[] = [];

    // Add spouses as sibling-like nodes
    const spouses = [
      ...p.marriagesAsSpouse1.map(m => m.spouse2),
      ...p.marriagesAsSpouse2.map(m => m.spouse1)
    ];

    for (const spouse of spouses) {
      if (map.has(spouse.id) && !visited.has(spouse.id)) {
        visited.add(spouse.id);
        const spousePerson = map.get(spouse.id)!;
        const spouseChildren = [
          ...spousePerson.biologicalChildren.map(c => c.id),
          ...spousePerson.biologicalChildrenMother.map(c => c.id)
        ];
        spouseChildren.forEach(id => childIds.add(id));

        children.push({
          name: `💑 ${spouse.firstName} ${spouse.lastName}`,
          _personId: spouse.id,
          attributes: {}
        });
      }
    }

    for (const childId of childIds) {
      if (map.has(childId) && !visited.has(childId)) {
        children.push(toNode(map.get(childId)!));
      }
    }

    return {
      name,
      attributes,
      children: children.length > 0 ? children : undefined,
      _personId: p.id
    };
  }

  return roots.map(toNode);
}

// Custom node renderer
const CustomNode = ({ nodeDatum }: any) => {
  const isSpouseNode = nodeDatum.name.startsWith('💑');
  return (
    <g>
      <circle
        r={22}
        fill={isSpouseNode ? '#fef3c7' : '#eef2ff'}
        stroke={isSpouseNode ? '#f59e0b' : '#6366f1'}
        strokeWidth={2}
      />
      <text
        fill="#1f2937"
        x={0}
        y={36}
        textAnchor="middle"
        style={{ fontSize: '11px', fontWeight: 600 }}
      >
        {nodeDatum.name.replace('💑 ', '').split(' ')[0]}
      </text>
      <text
        fill="#6b7280"
        x={0}
        y={50}
        textAnchor="middle"
        style={{ fontSize: '10px' }}
      >
        {nodeDatum.name.replace('💑 ', '').split(' ').slice(1).join(' ')}
      </text>
      {nodeDatum.attributes?.Born && (
        <text
          fill="#9ca3af"
          x={0}
          y={63}
          textAnchor="middle"
          style={{ fontSize: '9px' }}
        >
          b. {nodeDatum.attributes.Born}
        </text>
      )}
    </g>
  );
};

const FamilyTreePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [zoom, setZoom] = useState(0.7);
  const [translate, setTranslate] = useState({ x: 400, y: 80 });
  const [familyName, setFamilyName] = useState('');

  const loadTree = useCallback(async () => {
    if (!id) return;
    try {
      const [familyData, persons] = await Promise.all([
        familiesAPI.get(id),
        familiesAPI.getTree(id)
      ]);
      setFamilyName(familyData.name);

      if (!persons || persons.length === 0) {
        setTreeData({ name: familyData.name, children: [] });
        return;
      }

      const roots = buildTree(persons as PersonNode[]);
      setTreeData({
        name: familyData.name,
        children: roots.length > 0 ? roots : []
      });
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load family tree');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadTree(); }, [loadTree]);

  useEffect(() => {
    if (containerRef.current) {
      const { width } = containerRef.current.getBoundingClientRect();
      setTranslate({ x: width / 2, y: 80 });
    }
  }, [loading]);

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <p className="text-red-500">{error}</p>
      <button onClick={() => navigate(-1)} className="text-indigo-600 hover:underline text-sm">Go Back</button>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/families/${id}`)}
            className="flex items-center gap-1 text-gray-500 hover:text-gray-900 dark:hover:text-white text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            🌳 {familyName} — Family Tree
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(z => Math.max(0.2, z - 0.1))}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs text-gray-500 w-12 text-center">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom(z => Math.min(2, z + 0.1))}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(0.7)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
            title="Reset zoom"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tree canvas */}
      <div ref={containerRef} className="flex-1 overflow-hidden">
        {treeData && (
          treeData.children?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400 gap-3">
              <p className="text-lg">No approved members in the tree yet.</p>
              <p className="text-sm">Members need to complete their profiles and get admin approval to appear here.</p>
            </div>
          ) : (
            <Tree
              data={treeData}
              orientation="vertical"
              zoom={zoom}
              translate={translate}
              renderCustomNodeElement={CustomNode}
              separation={{ siblings: 1.8, nonSiblings: 2.2 }}
              nodeSize={{ x: 160, y: 100 }}
              pathFunc="step"
              collapsible={true}
              enableLegacyTransitions={false}
            />
          )
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 px-6 py-2 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-indigo-100 border-2 border-indigo-500" />
          <span>Family member</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-yellow-100 border-2 border-yellow-500" />
          <span>Spouse</span>
        </div>
        <span className="ml-auto">Drag to pan · Scroll to zoom · Click node to expand/collapse</span>
      </div>
    </div>
  );
};

export default FamilyTreePage;
