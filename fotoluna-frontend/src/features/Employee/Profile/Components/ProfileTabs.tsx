import React from 'react';
import type { ProfileTabProps } from './types/Profile';
import ProfileInfo from './ProfileInfo';
import SecuritySettings from './SecuritySettings';
import '../Styles/perfil/ProfileTabs.css';


const ProfileTabs: React.FC<ProfileTabProps> = ({
    activeTab,
    onTabChange,
    profile,
    onProfileUpdate
}) => {
    const tabs = [
        { id: 'profile', label: 'Información Personal', icon: 'bi-person' },
        { id: 'security', label: 'Seguridad', icon: 'bi-shield-lock' },
    ];

    return (
        <div className="profile-tabs">
            {/* Navigation Tabs */}
            <ul className="nav nav-tabs tab-nav" role="tablist">
                {tabs.map((tab) => (
                    <li key={tab.id} className="nav-item" role="presentation">
                        <button
                            className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => onTabChange(tab.id)}
                            type="button"
                            role="tab"
                        >
                            <i className={`${tab.icon} me-2`}></i>
                            {tab.label}
                        </button>
                    </li>
                ))}
            </ul>

            {/* Tab Content */}
            <div className="tab-content">
                <div className={`tab-pane fade ${activeTab === 'profile' ? 'show active' : ''}`}>
                    <ProfileInfo
                        profile={profile}
                        onProfileUpdate={onProfileUpdate}
                    />
                </div>

                <div className={`tab-pane fade ${activeTab === 'security' ? 'show active' : ''}`}>
                    <SecuritySettings />
                </div>
            </div>
        </div>
    );
};

export default ProfileTabs;