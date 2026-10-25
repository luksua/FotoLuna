import React from 'react';
import type { ProfileTabProps } from './types/Profile';
import ProfileInfo from './ProfileInfo';
import SecuritySettings from './SecuritySettings';
import '../Styles/perfil/ProfileTabs.css';


const ProfileTabs: React.FC<ProfileTabProps> = ({
    activeTab,
    onTabChange,
    profile,
    onProfileUpdate,
    onClose
}) => {
    const tabs = [
        { id: 'profile', label: 'Información Personal', icon: 'bi-person-badge-fill' },
        { id: 'security', label: 'Seguridad', icon: 'bi-shield-check' },
    ];

    return (
        <div className="profile-tabs">
            {/* Segmented Navigation Tabs */}
            <div className="profile-tab-nav" role="tablist">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`profile-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => onTabChange(tab.id)}
                        type="button"
                        role="tab"
                    >
                        <i className={`bi ${tab.icon}`}></i>
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                <div className={`tab-pane fade ${activeTab === 'profile' ? 'show active' : ''}`}>
                    <ProfileInfo
                        profile={profile}
                        onProfileUpdate={onProfileUpdate}
                        onClose={onClose}
                    />
                </div>

                <div className={`tab-pane fade ${activeTab === 'security' ? 'show active' : ''}`}>
                    <SecuritySettings onClose={onClose} />
                </div>
            </div>
        </div>
    );
};

export default ProfileTabs;