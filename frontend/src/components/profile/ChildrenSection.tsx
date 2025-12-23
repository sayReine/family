import React, { useState } from 'react';
import { Baby, Search, X, Info } from 'lucide-react';
import { useProfile } from '../../contexts/ProfileContext';

// Mock search function
const searchPersons = async (query: string): Promise<Array<{ id: string; name: string; birthYear?: number }>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: '4', name: 'Emma Smith', birthYear: 2015 },
        { id: '5', name: 'Liam Smith', birthYear: 2018 },
        { id: '6', name: 'Olivia Johnson', birthYear: 2020 },
      ].filter(p => p.name.toLowerCase().includes(query.toLowerCase())));
    }, 300);
  });
};

const ChildrenSection: React.FC = () => {
  const { profileData, updateChildren } = useProfile();
  
  const [hasChildren, setHasChildren] = useState<boolean | null>(null);
  const [childSearch, setChildSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ id: string; name: string; birthYear?: number }>>([]);
  const [selectedChildren, setSelectedChildren] = useState<Array<{ id: string; name: string; birthYear?: number }>>([]);

  const handleSearch = async (query: string) => {
    setChildSearch(query);
    if (query.length > 2) {
      const results = await searchPersons(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const selectChild = (person: { id: string; name: string; birthYear?: number }) => {
    if (!selectedChildren.find(c => c.id === person.id)) {
      const newChildren = [...selectedChildren, person];
      setSelectedChildren(newChildren);
      updateChildren(newChildren.map(c => c.id));
    }
    setChildSearch('');
    setSearchResults([]);
  };

  const removeChild = (childId: string) => {
    const newChildren = selectedChildren.filter(c => c.id !== childId);
    setSelectedChildren(newChildren);
    updateChildren(newChildren.map(c => c.id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3 pb-4 border-b">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <Baby className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-100">Children</h2>
          <p className="text-sm text-gray-100 mt-1">
            Link your children to complete your family connections
          </p>
        </div>
      </div>

      {/* Info Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium">Why this matters</p>
          <p className="mt-1">
            Adding children creates cross-verifiable relationships in the family tree, 
            helping administrators ensure accuracy and completeness.
          </p>
        </div>
      </div>

      {/* Do you have children? */}
      {hasChildren === null && (
        <div className="p-6 bg-gray-50 rounded-lg">
          <p className="text-lg font-medium text-gray-900 mb-4">Do you have children?</p>
          <div className="flex gap-4">
            <button
              onClick={() => setHasChildren(true)}
              className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Yes, I have children
            </button>
            <button
              onClick={() => setHasChildren(false)}
              className="flex-1 px-6 py-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              No children
            </button>
          </div>
        </div>
      )}

      {/* No children selected */}
      {hasChildren === false && (
        <div className="p-6 bg-gray-50 rounded-lg text-center">
          <p className="text-gray-600">No children to add</p>
          <button
            onClick={() => setHasChildren(null)}
            className="mt-3 text-sm text-indigo-600 hover:text-indigo-700"
          >
            Change answer
          </button>
        </div>
      )}

      {/* Has children - Show search */}
      {hasChildren === true && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Search and add your children
            </label>
            <button
              onClick={() => setHasChildren(null)}
              className="text-xs text-gray-600 hover:text-indigo-600"
            >
              Change answer
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={childSearch}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Search for child by name..."
              />
            </div>

            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {searchResults.map(person => (
                  <button
                    key={person.id}
                    onClick={() => selectChild(person)}
                    className="w-full px-4 py-2 text-left hover:bg-indigo-50 transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-900">{person.name}</p>
                    {person.birthYear && (
                      <p className="text-xs text-gray-500">Born {person.birthYear}</p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected Children List */}
          {selectedChildren.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">Selected Children ({selectedChildren.length})</p>
              {selectedChildren.map((child) => (
                <div key={child.id} className="flex items-center justify-between p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{child.name}</p>
                    {child.birthYear && (
                      <p className="text-sm text-gray-600">Born {child.birthYear}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeChild(child.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Request to add new child */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm font-medium text-amber-900">Child not listed?</p>
            <p className="text-sm text-amber-700 mt-1">
              If your child is not in the system yet, please contact a family administrator 
              to have them added. This ensures data accuracy and prevents duplicates.
            </p>
            <button className="mt-3 px-4 py-2 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 transition-colors">
              Request to Add Child Profile
            </button>
          </div>
        </div>
      )}

      {/* Cross-verification Note */}
      {selectedChildren.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-green-800">
            <p className="font-medium">✓ Relationships will be cross-verified</p>
            <p className="mt-1">
              When your profile is approved, these relationships will be validated with 
              the children's profiles, ensuring accuracy in the family tree.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChildrenSection;