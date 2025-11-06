import React, { useState, useEffect } from 'react';
import { Bell, AlertCircle, X } from 'lucide-react';
import { useNavigation } from '../../hooks/useNavigation';

const Header = ({ userRole }) => {
  const [userName, setUserName] = useState('');
  const [userInitials, setUserInitials] = useState('');
  const [profileIncomplete, setProfileIncomplete] = useState(false);
  const [showWarning, setShowWarning] = useState(true);
  const { navigateTo } = useNavigation();

  useEffect(() => {
    // Get user info from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserName(user.name || 'User');
      
      // Calculate initials
      const nameParts = (user.name || 'User').split(' ');
      const initials = nameParts.length > 1 
        ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
        : nameParts[0].substring(0, 2).toUpperCase();
      setUserInitials(initials);
    }

    // Check if profile is complete
    checkProfileCompletion();
  }, []);

  const checkProfileCompletion = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5001/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const user = data.user;

        // Check if essential fields are missing
        const isIncomplete = !user.phone || 
                           !user.address?.street || 
                           !user.address?.city || 
                           !user.address?.state ||
                           (user.role === 'veterinarian' && (!user.clinic || !user.license || !user.specialization));

        setProfileIncomplete(isIncomplete);

        // Store profile completion status in localStorage for other components to use
        localStorage.setItem('profileIncomplete', isIncomplete.toString());
      }
    } catch (error) {
      console.error('Error checking profile:', error);
    }
  };

  const handleSetupClick = () => {
    navigateTo('settings');
    setShowWarning(false);
  };

  return (
    <>
      <header className="bg-white shadow-sm p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Welcome back, {userName}!
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell size={20} className="text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
            {userInitials}
          </div>
        </div>
      </header>

      {/* Profile Incomplete Warning Banner */}
      {profileIncomplete && showWarning && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle size={24} className="text-amber-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-amber-900">Complete Your Profile</p>
              <p className="text-sm text-amber-800">
                {userRole === 'vet' || userRole === 'veterinarian'
                  ? 'Please complete your profile with clinic information before accessing patient records.'
                  : 'Please complete your profile with contact and address information before adding pets.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSetupClick}
              className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap"
            >
              Complete Profile
            </button>
            <button
              onClick={() => setShowWarning(false)}
              className="p-2 hover:bg-amber-100 rounded-lg transition-colors"
              title="Dismiss"
            >
              <X size={20} className="text-amber-600" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
