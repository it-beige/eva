import React from 'react';
import { CreateEvalMetricData } from '../../../services/evalMetricApi';
interface LlmMetricFormProps {
    form: any;
    initialValues?: Partial<CreateEvalMetricData>;
}
declare const LlmMetricForm: React.FC<LlmMetricFormProps>;
export default LlmMetricForm;
