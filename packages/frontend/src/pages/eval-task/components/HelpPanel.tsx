import React from 'react';
import { Card, Typography } from 'antd';
import {
  BulbOutlined,
  QuestionCircleOutlined,
  FileTextOutlined,
} from '@ant-design/icons';

const { Title, Text, Link } = Typography;

const HelpPanel: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 什么是AI应用评测 */}
      <Card
        style={{ backgroundColor: '#f0f5ff', border: 'none' }}
        bodyStyle={{ padding: 16 }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <BulbOutlined style={{ fontSize: 20, color: '#1890ff', marginTop: 2 }} />
          <div>
            <Title level={5} style={{ margin: 0, marginBottom: 8 }}>
              什么是AI应用评测?
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              AI应用评测是通过标准化的评测集和评估指标，系统性地测试AI应用的性能、准确性和可靠性的过程。
            </Text>
            <div style={{ marginTop: 8 }}>
              <Link href="#" style={{ fontSize: 13 }}>
                了解更多
              </Link>
            </div>
          </div>
        </div>
      </Card>

      {/* 操作指南 */}
      <Card title="操作指南" bodyStyle={{ padding: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <QuestionCircleOutlined style={{ color: '#1890ff' }} />
              <Text strong>评测集是什么?</Text>
            </div>
            <Text type="secondary" style={{ fontSize: 13 }}>
              评测集是标准化的用于评估AI应用的测试数据集，包含输入问题、期望答案等信息。通过评测集可以系统性地测试AI应用在不同输入下的表现。
            </Text>
            <div style={{ marginTop: 4 }}>
              <Link href="#" style={{ fontSize: 13 }}>
                了解更多
              </Link>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <FileTextOutlined style={{ color: '#1890ff' }} />
              <Text strong>LLM指标/Code指标</Text>
            </div>
            <Text type="secondary" style={{ fontSize: 13 }}>
              LLM指标：使用大模型作为裁判，评估文本质量、相关性等主观指标，适合对话问答等场景。Code指标：通过代码执行、测试用例等客观方式评估，适合代码生成、技术任务等场景。
            </Text>
            <div style={{ marginTop: 4 }}>
              <Link href="#" style={{ fontSize: 13 }}>
                了解更多
              </Link>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <QuestionCircleOutlined style={{ color: '#1890ff' }} />
              <Text strong>字段映射</Text>
            </div>
            <Text type="secondary" style={{ fontSize: 13 }}>
              评估指标需要约定的变量输入才可完成评测，将评测集对应字段与指标所需变量做映射发起评测，变量含义可查看指标详情获取。
            </Text>
            <div style={{ marginTop: 4 }}>
              <Link href="#" style={{ fontSize: 13 }}>
                了解更多
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default HelpPanel;
