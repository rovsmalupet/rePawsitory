import React, { useEffect, useState } from 'react';
import AddRecordModal from '../components/AddRecordModal';
import { ArrowLeft, Edit2, Trash2 } from 'lucide-react';

const PetRecordsPage = ({ pet, onBack }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const fetchRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5001/api/pets/${pet._id}/medical-records`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load records');
      const data = await res.json();
      setRecords(data);
    } catch (err) {
      console.error(err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (pet) fetchRecords(); }, [pet]);

  const handleAdd = (newRecord) => {
    // prepend
    setRecords(prev => [newRecord, ...prev]);
  };

  const handleEdit = (updated) => {
    setRecords(prev => prev.map(r => r._id === updated._id ? updated : r));
    setEditingRecord(null);
  };

  const handleDelete = async (rec) => {
    if (!window.confirm('Delete this record? This cannot be undone.')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5001/api/medical-records/${rec._id}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete');
      setRecords(prev => prev.filter(r => r._id !== rec._id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete record');
    }
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'Unknown';
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const ageInYears = today.getFullYear() - birthDate.getFullYear();
    const ageInMonths = today.getMonth() - birthDate.getMonth();
    
    if (ageInYears > 0) {
      return `${ageInYears} year${ageInYears > 1 ? 's' : ''}`;
    } else {
      return `${ageInMonths} month${ageInMonths > 1 ? 's' : ''}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
          <ArrowLeft size={20} />
          <span className="font-medium">Back to Patients</span>
        </button>
      </div>

      {/* Pet Details Header Card */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
        <div className="flex gap-6">
          {/* Left Side - Pet Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{pet.name}</h1>
            
            {/* Basic Info Grid */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-4">
              <div>
                <span className="text-sm font-semibold text-gray-500">Species</span>
                <p className="text-gray-800">{pet.species}</p>
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-500">Breed</span>
                <p className="text-gray-800">{pet.breed || 'Mixed'}</p>
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-500">Age</span>
                <p className="text-gray-800">{calculateAge(pet.dateOfBirth)}</p>
              </div>
              {pet.gender && (
                <div>
                  <span className="text-sm font-semibold text-gray-500">Gender</span>
                  <p className="text-gray-800 capitalize">{pet.gender}</p>
                </div>
              )}
              {pet.weight?.value && (
                <div>
                  <span className="text-sm font-semibold text-gray-500">Weight</span>
                  <p className="text-gray-800">{pet.weight.value} {pet.weight.unit}</p>
                </div>
              )}
              {pet.color && (
                <div>
                  <span className="text-sm font-semibold text-gray-500">Color</span>
                  <p className="text-gray-800">{pet.color}</p>
                </div>
              )}
              {pet.microchipId && (
                <div className="col-span-2">
                  <span className="text-sm font-semibold text-gray-500">Microchip ID</span>
                  <p className="text-gray-800 font-mono text-sm">{pet.microchipId}</p>
                </div>
              )}
            </div>

            {/* Owner Badge */}
            {pet.owner && (
              <div className="mb-4">
                <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="font-medium">Owner: {pet.owner.name}</span>
                </div>
              </div>
            )}

            {/* Allergies Warning */}
            {pet.allergies && pet.allergies.length > 0 && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <span className="text-red-600 font-semibold text-sm">⚠️ Allergies:</span>
                  <div className="flex flex-wrap gap-2">
                    {pet.allergies.map((allergy, idx) => (
                      <span key={idx} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Chronic Conditions */}
            {pet.chronicConditions && pet.chronicConditions.length > 0 && (
              <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <span className="text-amber-700 font-semibold text-sm">📋 Chronic Conditions:</span>
                  <div className="flex flex-wrap gap-2">
                    {pet.chronicConditions.map((condition, idx) => (
                      <span key={idx} className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">
                        {condition.condition || condition}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Pet Photo */}
          <div className="flex-shrink-0 w-80">
            <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-lg overflow-hidden h-64 flex items-center justify-center">
              {pet.photoUrl ? (
                <img 
                  src={`http://localhost:5001${pet.photoUrl}`}
                  alt={pet.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-9xl">
                  {pet.species?.toLowerCase() === 'dog' ? '🐕' : 
                   pet.species?.toLowerCase() === 'cat' ? '🐱' : '🐾'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Add Record Button - Bottom */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button 
            onClick={() => setIsAddOpen(true)} 
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md hover:shadow-lg"
          >
            + Add Medical Record
          </button>
        </div>
      </div>

      {/* Medical Records Section */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Medical Records</h2>
            <p className="text-sm text-gray-500 mt-1">Complete medical history for {pet.name}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">{records.length}</div>
            <div className="text-xs text-gray-500">Total Records</div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading medical records...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-red-50 rounded-lg">
            <p className="text-red-600 font-semibold mb-2">Failed to load records</p>
            <p className="text-gray-600 text-sm">Please try refreshing the page</p>
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-gray-600 text-lg font-medium mb-2">No medical records yet</p>
            <p className="text-gray-500 text-sm mb-4">Get started by adding {pet.name}'s first medical record</p>
            <button 
              onClick={() => setIsAddOpen(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Add First Record
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {records.map(rec => (
              <div key={rec._id} className="flex items-start justify-between bg-gray-50 hover:bg-gray-100 transition-colors p-4 rounded-lg border border-gray-200">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full uppercase">
                      {rec.recordType}
                    </span>
                    <div className="font-bold text-lg text-gray-800">{rec.title || rec.recordType}</div>
                    <div className="text-sm text-gray-500">
                      {rec.date ? new Date(rec.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      }) : ''}
                    </div>
                  </div>
                  
                  {rec.notes && (
                    <div className="text-sm text-gray-700 mb-3 pl-1">{rec.notes}</div>
                  )}
                  
                  {/* Cost info */}
                  {rec.cost && rec.cost.amount > 0 && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-gray-600">
                        Cost: <span className="font-semibold">${rec.cost.amount}</span>
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${rec.cost.paid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {rec.cost.paid ? 'Paid' : 'Unpaid'}
                      </span>
                    </div>
                  )}
                  
                  {/* Attachments */}
                  {rec.attachments && rec.attachments.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {rec.attachments.map((a, i) => (
                        <a 
                          key={i}
                          className="flex items-center gap-2 text-sm bg-white border border-gray-300 text-blue-600 hover:bg-blue-50 px-3 py-2 rounded transition-colors" 
                          href={`http://localhost:5001${a.fileUrl}`} 
                          target="_blank" 
                          rel="noreferrer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          {a.filename || a.fileUrl.split('/').pop()}
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 ml-6">
                  <button 
                    onClick={() => setEditingRecord(rec)} 
                    className="px-4 py-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors flex items-center gap-2 font-semibold"
                  >
                    <Edit2 size={16}/> Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(rec)} 
                    className="px-4 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors flex items-center gap-2 font-semibold"
                  >
                    <Trash2 size={16}/> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddRecordModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSave={(r) => { handleAdd(r); setIsAddOpen(false); }}
        petId={pet._id}
      />

      {editingRecord && (
        <AddRecordModal
          isOpen={!!editingRecord}
          onClose={() => setEditingRecord(null)}
          onSave={handleEdit}
          petId={pet._id}
          initialData={editingRecord}
        />
      )}
    </div>
  );
};

export default PetRecordsPage;
