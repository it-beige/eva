import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { CreateEvalSetModal } from './components/CreateEvalSetModal';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { createEvalSet } from '../../store/evalSetSlice';
import { EvalSetType } from '@eva/shared';

const CreateEvalSetPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { creating } = useAppSelector((state) => state.evalSet);
  const [modalOpen, setModalOpen] = useState(true);

  const handleSubmit = async (values: {
    name: string;
    type: EvalSetType;
    description?: string;
    sourceType: string;
    gitRepoUrl?: string;
    publicEvalSetId?: string;
    fileUrl?: string;
    odpsTableName?: string;
    odpsPartition?: string;
    exampleFileUrl?: string;
    aiModelId?: string;
    aiGenerateCount?: number;
    columns?: Array<{ name: string; type: string }>;
    sdkEndpoint?: string;
  }) => {
    try {
      const result = await dispatch(createEvalSet(values)).unwrap();
      message.success('评测集创建成功');
      setModalOpen(false);
      // 跳转到详情页
      navigate(`/eval/datasets/${result.id}`);
    } catch (error) {
      message.error('创建失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  const handleCancel = () => {
    setModalOpen(false);
    navigate('/eval/datasets');
  };

  return (
    <div style={{ padding: 24 }}>
      <Card variant="borderless">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/eval/datasets')}
          style={{ marginBottom: 16 }}
        >
          返回列表
        </Button>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <h3>正在创建评测集...</h3>
        </div>
      </Card>

      <CreateEvalSetModal
        open={modalOpen}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        loading={creating}
      />
    </div>
  );
};

export default CreateEvalSetPage;
