import api from '../lib/api';

export interface UpdateProfileRequest {
    name: string;
    email: string;
    avatar?: File | null;
}

export interface UpdateProfileResponse {
    message: string;
    user: {
        id: number;
        name: string;
        email: string;
        avatar?: string;
    };
    photo?: string;
}

export const updateProfile = async (data: UpdateProfileRequest): Promise<UpdateProfileResponse> => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    
    if (data.avatar) {
        formData.append('avatar', data.avatar);
    }

    const response = await api.post<UpdateProfileResponse>('/api/customer', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
};
