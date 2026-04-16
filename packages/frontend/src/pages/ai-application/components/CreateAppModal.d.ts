import React from 'react';
import { AIApplication, CreateApplicationRequest, UpdateApplicationRequest } from '../../../services/aiApplicationApi';
interface CreateAppModalProps {
    visible: boolean;
    onCancel: () => void;
    onSubmit: (values: CreateApplicationRequest | UpdateApplicationRequest) => void;
    editingApp: AIApplication | null;
    projectId: string;
    loading: boolean;
}
declare const CreateAppModal: React.FC<CreateAppModalProps>;
export default CreateAppModal;
