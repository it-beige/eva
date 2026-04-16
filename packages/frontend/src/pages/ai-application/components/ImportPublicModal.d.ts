import React from 'react';
import { ImportPublicAgentRequest } from '../../../services/aiApplicationApi';
interface ImportPublicModalProps {
    visible: boolean;
    onCancel: () => void;
    onSubmit: (values: ImportPublicAgentRequest) => void;
    projectId: string;
    loading: boolean;
}
declare const ImportPublicModal: React.FC<ImportPublicModalProps>;
export default ImportPublicModal;
