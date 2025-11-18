export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export interface SettingsOption {
  id: string;
  label: string;
  description: string;
  icon: string;
  type: 'toggle' | 'button' | 'select';
  value?: boolean;
  options?: string[];
}