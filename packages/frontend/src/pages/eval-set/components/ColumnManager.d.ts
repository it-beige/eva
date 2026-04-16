interface ColumnManagerProps {
    allColumns: string[];
    visibleColumns: string[];
    onChange: (visibleColumns: string[]) => void;
}
export declare const ColumnManager: React.FC<ColumnManagerProps>;
export default ColumnManager;
