import React from 'react';
import { AIApplication } from '../../../services/aiApplicationApi';
interface AppCardProps {
    application: AIApplication;
    onEdit: (app: AIApplication) => void;
    onDelete: (app: AIApplication) => void;
    onEvaluate: (app: AIApplication) => void;
}
declare const AppCard: React.FC<AppCardProps>;
export default AppCard;
