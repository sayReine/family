import React, { useState } from 'react';
import { Users, Search, Plus, X, AlertCircle, Heart } from 'lucide-react';
import { useProfile } from '../../contexts/ProfileContext';

// Mock search function - replace with actual API call
const searchPersons = async (query: string): Promise<Array<{ id: string; name: string; birthYear?: number }>> => {
  // Simulated search results
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: '1', name: 'John Smith', birthYear: 1960 },
        { id: '2', name: 'Jane Doe', birthYear: 1962 },
        { id: '3', name: 'Robert Johnson', birthYear: 1958 },
      ].filter(p => p.name.toLowerCase().includes(query.toLowerCase())));
    }, 300);
  });
};

const FamilyRelationshipsSection: React.FC = () => {
  const { profileData, updateFamilyRelationships, addSpouse, removeSpouse } = useProfile();
  
  const [fatherSearch, setFatherSearch] = useState('');
  const [motherSearch, setMotherSearch] = useState('');
  const [spouseSearch, setSpouseSearch] = useState('');
  
  const [fatherResults, setFatherResults] = useState<Array<{ id: string; name: string; birthYear?: number }>>([]);
  const [motherResults, setMotherResults] = useState<Array<{ id: string; name: string; birthYear?: number }>>([]);
  const [spouseResults, setSpouseResults] = useState<Array<{ id: string; name: string; birthYear?: number }>>([]);
  
  const [selectedFather, setSelectedFather] = useState<{ id: string; name: string } | null>(null);
  const [selectedMother, setSelectedMother] = useState<{ id: string; name: string } | null>(null);
  
  const [showSpouseForm, setShowSpouseForm] = useState(false);
  const [newSpouse, setNewSpouse] = useState({
    spouseId: '',
    spouseName: '',
    marriageDate: '',
    status: 'MARRIED' as 'MARRIED' | 'DIVORCED' | 'WIDOWED',
  });

  const handleFatherSearch = async (query: string) => {
    setFatherSearch(query);
    if (query.length > 2) {
      const results = await searchPersons(query);
      setFatherResults(results);
    } else {
      setFatherResults([]);
    }
  };

  const handleMotherSearch = async (query: string) => {
    setMotherSearch(query);
    if (query.length > 2) {
      const results = await searchPersons(query);
      setMotherResults(results);
    } else {
      setMotherResults([]);
    }
  };

  const handleSpouseSearch = async (query: string) => {
    setSpouseSearch(query);
    if (query.length > 2) {
      const results = await searchPersons(query);
      setSpouseResults(results);
    } else {
      setSpouseResults([]);
    }
  };

  const selectFather = (person: { id: string; name: string }) => {
    setSelectedFather(person);
    updateFamilyRelationships({ biologicalFatherId: person.id });
    setFatherSearch(person.name);
    setFatherResults([]);
  };

  const selectMother = (person: { id: string; name: string }) => {
    setSelectedMother(person);
    updateFamilyRelationships({ biologicalMotherId: person.id });
    setMotherSearch(person.name);
    setMotherResults([]);
  };

  const selectSpouse = (person: { id: string; name: string }) => {
    setNewSpouse(prev => ({ ...prev, spouseId: person.id, spouseName: person.name }));
    setSpouseSearch(person.name);
    setSpouseResults([]);
  };

  const handleAddSpouse = () => {
    if (newSpouse.spouseId && newSpouse.spouseName) {
      addSpouse(newSpouse);
      setNewSpouse({
        spouseId: '',
        spouseName: '',
        marriageDate: '',
        status: 'MARRIED',
      });
      setSpouseSearch('');
      setShowSpouseForm(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3 pb-4 border-b">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <Users className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-50">Family Relationships</h2>
          <p className="text-sm text-gray-100 mt-1">
            Connect yourself to your family tree by identifying your relatives
          </p>
        </div>
      </div>

      {/* Important Notice */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-red-800">
          <p className="font-medium">Important: No free-text names allowed</p>
          <p className="mt-1">
            To maintain data accuracy, you must select existing family members from the search results. 
            If someone is not listed, please contact an administrator to add them first.
          </p>
        </div>
      </div>

      {/* Parents Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-100 uppercase tracking-wide flex items-center gap-2">
          <Users className="w-4 h-4" />
          Parents
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Father */}
          <div>
            <label className="block text-sm font-medium text-gray-100 mb-2">
              Biological Father
            </label>
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={fatherSearch}
                  onChange={(e) => handleFatherSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Search for father..."
                />
              </div>
              
              {/* Search Results */}
              {fatherResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {fatherResults.map(person => (
                    <button
                      key={person.id}
                      onClick={() => selectFather(person)}
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
            
            {selectedFather && (
              <div className="mt-2 flex items-center gap-2 p-2 bg-indigo-50 rounded-lg">
                <span className="text-sm text-indigo-900 font-medium">✓ {selectedFather.name}</span>
              </div>
            )}
            
            <button
              type="button"
              className="mt-2 text-xs text-gray-600 hover:text-indigo-600"
            >
              I don't know / Not listed
            </button>
          </div>

          {/* Mother */}
          <div>
            <label className="block text-sm font-medium text-gray-100 mb-2">
              Biological Mother
            </label>
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={motherSearch}
                  onChange={(e) => handleMotherSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Search for mother..."
                />
              </div>
              
              {/* Search Results */}
              {motherResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {motherResults.map(person => (
                    <button
                      key={person.id}
                      onClick={() => selectMother(person)}
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
            
            {selectedMother && (
              <div className="mt-2 flex items-center gap-2 p-2 bg-indigo-50 rounded-lg">
                <span className="text-sm text-indigo-900 font-medium">✓ {selectedMother.name}</span>
              </div>
            )}
            
            <button
              type="button"
              className="mt-2 text-xs text-gray-600 hover:text-indigo-600"
            >
              I don't know / Not listed
            </button>
          </div>
        </div>
      </div>

      {/* Spouses Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-100 uppercase tracking-wide flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Spouse(s)
          </h3>
          {!showSpouseForm && (
            <button
              onClick={() => setShowSpouseForm(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Spouse
            </button>
          )}
        </div>

        {/* Existing Spouses */}
        {profileData.spouses.length > 0 && (
          <div className="space-y-3">
            {profileData.spouses.map((spouse, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-pink-50 border border-pink-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{spouse.spouseName}</p>
                  <p className="text-sm text-gray-600">
                    {spouse.status} {spouse.marriageDate && `• Married ${new Date(spouse.marriageDate).getFullYear()}`}
                  </p>
                </div>
                <button
                  onClick={() => removeSpouse(index)}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add Spouse Form */}
        {showSpouseForm && (
          <div className="p-4 bg-gray-800 border border-gray-200 rounded-lg space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-100 mb-2">
                Search for Spouse
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={spouseSearch}
                  onChange={(e) => handleSpouseSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Search for spouse..."
                />
              </div>
              
              {/* Search Results */}
              {spouseResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {spouseResults.map(person => (
                    <button
                      key={person.id}
                      onClick={() => selectSpouse(person)}
                      className="w-full px-4 py-2 text-left hover:bg-indigo-50 transition-colors"
                    >
                      <p className="text-sm font-medium text-gray-100">{person.name}</p>
                      {person.birthYear && (
                        <p className="text-xs text-gray-100">Born {person.birthYear}</p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-100 mb-2">
                  Marriage Date (optional)
                </label>
                <input
                  type="date"
                  value={newSpouse.marriageDate}
                  onChange={(e) => setNewSpouse(prev => ({ ...prev, marriageDate: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-100 mb-2">
                  Status
                </label>
                <select
                  value={newSpouse.status}
                  onChange={(e) => setNewSpouse(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="MARRIED">Married</option>
                  <option value="DIVORCED">Divorced</option>
                  <option value="WIDOWED">Widowed</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddSpouse}
                disabled={!newSpouse.spouseId}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add Spouse
              </button>
              <button
                onClick={() => {
                  setShowSpouseForm(false);
                  setNewSpouse({
                    spouseId: '',
                    spouseName: '',
                    marriageDate: '',
                    status: 'MARRIED',
                  });
                  setSpouseSearch('');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-100 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FamilyRelationshipsSection;