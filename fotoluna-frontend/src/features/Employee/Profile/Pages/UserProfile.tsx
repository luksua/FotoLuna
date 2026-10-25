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
                <div className="profile-modal-header">
                    <div className="d-flex align-items-center gap-3">
                        <div className="profile-header-icon-badge">
                            <i className="bi bi-person-gear"></i>
                        </div>
                        <div>
                            <h2 className="profile-modal-title">Perfil de Usuario</h2>
                            <p className="profile-modal-subtitle">
                                Administra tu información personal, foto y opciones de seguridad.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="profile-btn-close"
                        onClick={onClose}
                        aria-label="Cerrar"
                    >
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <div className="profile-modal-body">
                    <ProfileTabs
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        profile={profile}
                        onProfileUpdate={onProfileUpdate}
                        onClose={onClose}
                    />
                </div>
            </div>
        </div>
    );
};

export default UserProfile;