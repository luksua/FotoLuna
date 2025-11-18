import React, { useState } from 'react';
import type { UserProfileData } from '../Components/types/Profile';
import ProfileTabs from '../Components/ProfileTabs';
import '../Styles/perfil/UserProfile.css';

interface UserProfileProps {
    isOpen: boolean;
    onClose: () => void;
    profile: UserProfileData;
    onProfileUpdate: (profile: UserProfileData) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({
    isOpen,
    onClose,
    profile,
    onProfileUpdate
}) => {
    const [activeTab, setActiveTab] = useState<string>('profile');

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Perfil de Usuario</h2>
                    <button
                        type="button"
                        className="btn-close"
                        onClick={onClose}
                        aria-label="Cerrar"
                    >
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <div className="modal-body">
                    <p className="modal-subtitle">
                        Administra tu información personal y de perfil.
                    </p>

                    <ProfileTabs
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        profile={profile}
                        onProfileUpdate={onProfileUpdate}
                    />
                </div>
            </div>
        </div>
    );
};

export default UserProfile;