import React from 'react';
import { Tag, Spin } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  PauseCircleOutlined,
} from '@ant-design/icons';
import { EvalTaskStatus } from '@eva/shared';
import styles from './TaskStatusTag.module.scss';

interface TaskStatusTagProps {
  status: EvalTaskStatus;
  progress?: number;
}

const TaskStatusTag: React.FC<TaskStatusTagProps> = ({ status, progress = 0 }) => {
  switch (status) {
    case EvalTaskStatus.SUCCESS:
      return (
        <Tag className="eva-pillTagGreen" icon={<CheckCircleOutlined />}>
          成功
        </Tag>
      );
    case EvalTaskStatus.RUNNING:
      return (
        <Tag className={`eva-pillTagBlue ${styles.runningTag}`} icon={<LoadingOutlined spin />}>
          运行中 {progress > 0 ? `${progress.toFixed(2)}%` : '0%'}
        </Tag>
      );
    case EvalTaskStatus.FAILED:
      return (
        <Tag className="eva-pillTagRed" icon={<CloseCircleOutlined />}>
          失败
        </Tag>
      );
    case EvalTaskStatus.ABORTED:
      return (
        <Tag className="eva-pillTagOrange" icon={<PauseCircleOutlined />}>
          中止
        </Tag>
      );
    case EvalTaskStatus.PENDING:
    default:
      return (
        <Tag>
          <Spin size="small" className={styles.pendingSpin} />
          待执行
        </Tag>
      );
  }
};

export default TaskStatusTag;
