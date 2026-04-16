import React from 'react';
import { Card, Typography } from 'antd';
import {
  BulbOutlined,
  QuestionCircleOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import styles from './HelpPanel.module.scss';

const { Title, Text, Link } = Typography;

const HelpPanel: React.FC = () => {
  return (
    <div className={styles.root}>
      <Card className={styles.heroCard}>
        <div className={styles.heroContent}>
          <BulbOutlined className={styles.heroIcon} />
          <div>
            <Title level={5} className={styles.sectionTitle}>
              什么是AI应用评测?
            </Title>
            <Text type="secondary" className={styles.bodyText}>
              AI应用评测是通过标准化的评测集和评估指标，系统性地测试AI应用的性能、准确性和可靠性的过程。
            </Text>
            <div className={styles.linkRow}>
              <Link href="#" className={styles.link}>
                了解更多
              </Link>
            </div>
          </div>
        </div>
      </Card>

      <Card title="操作指南" className={styles.guideCard}>
        <div className={styles.guideList}>
          <div>
            <div className={styles.itemHeader}>
              <QuestionCircleOutlined className={styles.itemIcon} />
              <Text strong>评测集是什么?</Text>
            </div>
            <Text type="secondary" className={styles.bodyText}>
              评测集是标准化的用于评估AI应用的测试数据集，包含输入问题、期望答案等信息。通过评测集可以系统性地测试AI应用在不同输入下的表现。
            </Text>
            <div className={styles.linkRowCompact}>
              <Link href="#" className={styles.link}>
                了解更多
              </Link>
            </div>
          </div>

          <div>
            <div className={styles.itemHeader}>
              <FileTextOutlined className={styles.itemIcon} />
              <Text strong>LLM指标/Code指标</Text>
            </div>
            <Text type="secondary" className={styles.bodyText}>
              LLM指标：使用大模型作为裁判，评估文本质量、相关性等主观指标，适合对话问答等场景。Code指标：通过代码执行、测试用例等客观方式评估，适合代码生成、技术任务等场景。
            </Text>
            <div className={styles.linkRowCompact}>
              <Link href="#" className={styles.link}>
                了解更多
              </Link>
            </div>
          </div>

          <div>
            <div className={styles.itemHeader}>
              <QuestionCircleOutlined className={styles.itemIcon} />
              <Text strong>字段映射</Text>
            </div>
            <Text type="secondary" className={styles.bodyText}>
              评估指标需要约定的变量输入才可完成评测，将评测集对应字段与指标所需变量做映射发起评测，变量含义可查看指标详情获取。
            </Text>
            <div className={styles.linkRowCompact}>
              <Link href="#" className={styles.link}>
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
