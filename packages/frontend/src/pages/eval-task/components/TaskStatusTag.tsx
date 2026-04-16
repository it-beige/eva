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
        <Tag color="success" icon={<CheckCircleOutlined />}>
          成功
        </Tag>
      );
    case EvalTaskStatus.RUNNING:
      return (
        <Tag color="processing" icon={<LoadingOutlined spin />}>
          运行中 {progress > 0 ? `${progress.toFixed(2)}%` : '0%'}
        </Tag>
      );
    case EvalTaskStatus.FAILED:
      return (
        <Tag color="error" icon={<CloseCircleOutlined />}>
          失败
        </Tag>
      );
    case EvalTaskStatus.ABORTED:
      return (
        <Tag color="warning" icon={<PauseCircleOutlined />}>
          中止
        </Tag>
      );
    case EvalTaskStatus.PENDING:
    default:
      return (
        <Tag color="default">
          <Spin size="small" className={styles.pendingSpin} />
          待执行
        </Tag>
      );
  }
};

export default TaskStatusTag;
