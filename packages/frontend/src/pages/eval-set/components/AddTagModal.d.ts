interface AddTagModalProps {
    open: boolean;
    onCancel: () => void;
    onSubmit: (tagName: string) => void;
    existingTags: string[];
    loading?: boolean;
}
export declare const AddTagModal: React.FC<AddTagModalProps>;
export default AddTagModal;
