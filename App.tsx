import React, { useState } from 'react';
import LoginPage from './components/LoginPage';
import ChatPage from './components/ChatPage';
import CoursesPage from './components/CoursesPage';
import OnboardingPage from './components/OnboardingPage';

// Represents the user's authentication and location in the app flow
type AuthStatus = 'LOGGED_OUT' | 'ONBOARDING' | 'LOGGED_IN';

// Main application layout for authenticated users
const MainAppLayout: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'Chat' | 'Courses'>('Chat');
    const tabs: ('Chat' | 'Courses')[] = ['Chat', 'Courses'];

    return (
        <div>
            <nav className="bg-zinc-900 p-4 flex justify-center space-x-4 sticky top-0 z-50">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                            activeTab === tab
                                ? 'bg-zinc-700 text-white'
                                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                        }`}
                    >
                        {tab === 'Chat' ? 'Campo' : 'Doutrina'}
                    </button>
                ))}
            </nav>
            <main>
                {activeTab === 'Chat' ? <ChatPage /> : <CoursesPage />}
            </main>
        </div>
    );
};


const App: React.FC = () => {
    const [authStatus, setAuthStatus] = useState<AuthStatus>('LOGGED_OUT');

    const handleLogin = () => setAuthStatus('LOGGED_IN');
    const handleStartOnboarding = () => setAuthStatus('ONBOARDING');
    const handleCompleteOnboarding = () => setAuthStatus('LOGGED_IN');

    const renderContent = () => {
        switch (authStatus) {
            case 'LOGGED_OUT':
                return <LoginPage onLogin={handleLogin} onStartOnboarding={handleStartOnboarding} />;
            case 'ONBOARDING':
                return <OnboardingPage onCompleteOnboarding={handleCompleteOnboarding} />;
            case 'LOGGED_IN':
                return <MainAppLayout />;
            default:
                return <LoginPage onLogin={handleLogin} onStartOnboarding={handleStartOnboarding} />;
        }
    };

    return (
        <div className="font-['Inter',_Helvetica,_Arial,_sans-serif] text-[#eeeeee]">
            {renderContent()}
        </div>
    );
};

export default App;
