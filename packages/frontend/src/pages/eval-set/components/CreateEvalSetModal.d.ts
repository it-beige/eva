import { EvalSetType, EvalSetSourceType } from '@eva/shared';
interface CreateEvalSetModalProps {
    open: boolean;
    onCancel: () => void;
    onSubmit: (values: CreateEvalSetFormValues) => void;
    loading?: boolean;
}
export interface CreateEvalSetFormValues {
    name: string;
    type: EvalSetType;
    description?: string;
    sourceType: EvalSetSourceType;
    publicEvalSetId?: string;
    gitRepoUrl?: string;
    fileUrl?: string;
    odpsTableName?: string;
    odpsPartition?: string;
    exampleFileUrl?: string;
    aiModelId?: string;
    aiGenerateCount?: number;
    columns?: Array<{
        name: string;
        type: string;
    }>;
    sdkEndpoint?: string;
}
export declare const CreateEvalSetModal: React.FC<CreateEvalSetModalProps>;
export default CreateEvalSetModal;
