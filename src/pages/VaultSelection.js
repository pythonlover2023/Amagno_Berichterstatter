import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const VaultSelection = () => {
  const [vaults, setVaults] = useState([]);
  const [selectedVault, setSelectedVault] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVaults = async () => {
      try {
        const response = await axios.get('/api/vaults', { withCredentials: true });
        setVaults(response.data);
        setLoading(false);
      } catch (err) {
        setError('Fehler beim Laden der Ablagen');
        setLoading(false);
      }
    };

    fetchVaults();
  }, []);

  const handleContinue = () => {
    if (selectedVault) {
      // Vault-ID im globalen State speichern (später durch Context/Redux ersetzen)
      sessionStorage.setItem('selectedVault', selectedVault);
      navigate('/reports');
    }
  };

  if (loading) return <div className="text-center p-8">Lade Ablagen...</div>;
  if (error) return <div className="text-center text-red-500 p-8">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Ablage auswählen</h1>

      <div className="mb-6">
        <label className="block text-gray-700 mb-2">Wählen Sie eine Ablage:</label>
        <select
          value={selectedVault}
          onChange={(e) => setSelectedVault(e.target.value)}
          className="w-full p-2 border rounded-md"
        >
          <option value="">Bitte auswählen</option>
          {vaults.map(vault => (
            <option key={vault.id} value={vault.id}>
              {vault.name}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleContinue}
        disabled={!selectedVault}
        className={`w-full py-2 px-4 rounded-md ${
          selectedVault
            ? 'bg-blue-500 hover:bg-blue-600 text-white'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        Weiter zu Berichten
      </button>
    </div>
  );
};

export default VaultSelection;