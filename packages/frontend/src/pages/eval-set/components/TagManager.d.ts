interface TagManagerProps {
    tags: string[];
    onAddTag: (tag: string) => void;
    onRemoveTag: (tag: string) => void;
    readonly?: boolean;
}
export declare const TagManager: React.FC<TagManagerProps>;
export default TagManager;
