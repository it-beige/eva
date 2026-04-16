import React from 'react';
import { EvalMetric } from '@eva/shared';
interface CreateMetricModalProps {
    visible: boolean;
    editingMetric: EvalMetric | null;
}
declare const CreateMetricModal: React.FC<CreateMetricModalProps>;
export default CreateMetricModal;
