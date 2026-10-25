import api from '../lib/api';

export interface ChangePasswordRequest {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
}

export interface ChangePasswordResponse {
    message: string;
}

export interface ErrorResponse {
    message?: string;
    errors?: { [key: string]: string[] };
}

export const changePassword = async (data: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
    const response = await api.post<ChangePasswordResponse>('/customer/password', {
        current_password: data.current_password,
        new_password: data.new_password,
        new_password_confirmation: data.new_password_confirmation,
    });
    return response.data;
};
