interface CreatePromptModalProps {
    open: boolean;
    onCancel: () => void;
    onSuccess: () => void;
    initialValues?: any;
}
declare const CreatePromptModal: ({ open, onCancel, onSuccess, initialValues, }: CreatePromptModalProps) => import("react/jsx-runtime").JSX.Element;
export default CreatePromptModal;
