import React from 'react';
import { CreateEvalMetricData } from '../../../services/evalMetricApi';
interface CodeMetricFormProps {
    form: any;
    initialValues?: Partial<CreateEvalMetricData>;
}
declare const CodeMetricForm: React.FC<CodeMetricFormProps>;
export default CodeMetricForm;
