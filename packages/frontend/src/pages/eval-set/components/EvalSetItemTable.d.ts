import { EvalSetItem } from '@eva/shared';
interface EvalSetItemTableProps {
    items: EvalSetItem[];
    loading: boolean;
    columns: string[];
    visibleColumns: string[];
    selectedRowKeys: string[];
    onSelectChange: (selectedRowKeys: string[]) => void;
    onEdit: (item: EvalSetItem) => void;
    onDelete: (itemId: string) => void;
    onViewCode?: (item: EvalSetItem) => void;
    isCodeType?: boolean;
}
export declare const EvalSetItemTable: React.FC<EvalSetItemTableProps>;
export default EvalSetItemTable;
