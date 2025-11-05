import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import PageRouter from '../components/PageRouter';
import { useNavigation } from '../hooks/useNavigation';
import { useMockData } from '../hooks/useMockData';
import { usePets } from '../hooks/usePets';
import { usePatients } from '../hooks/usePatients';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';

const PetHealthApp = () => {
  const navigation = useNavigation();
  const [authView, setAuthView] = useState('login'); // 'login' | 'signup'
  const { recentRecords } = useMockData();
  const { pets, loading, error, addPet } = usePets();
  const { patients, loading: patientsLoading, error: patientsError } = usePatients();

  return (
    <>
      {!navigation.isAuthenticated ? (
        authView === 'login' ? (
          <LoginPage 
            login={navigation.login} 
            switchToSignup={() => setAuthView('signup')} 
          />
        ) : (
          <SignupPage 
            signup={navigation.signup} 
            switchToLogin={() => setAuthView('login')} 
          />
        )
      ) : (
        <Layout 
          sidebarOpen={navigation.sidebarOpen}
          setSidebarOpen={navigation.setSidebarOpen}
          userRole={navigation.userRole}
          navItems={navigation.navItems}
          currentPage={navigation.currentPage}
          setCurrentPage={navigation.setCurrentPage}
          logout={navigation.logout}
        >
          <PageRouter 
            currentPage={navigation.currentPage}
            userRole={navigation.userRole}
            pets={pets}
            recentRecords={recentRecords}
            petsLoading={loading}
            petsError={error}
            addPet={addPet}
            patients={patients}
            patientsLoading={patientsLoading}
            patientsError={patientsError}
          />
        </Layout>
      )}
    </>
  );
};

export default PetHealthApp;