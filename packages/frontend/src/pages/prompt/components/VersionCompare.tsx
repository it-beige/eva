import { useState, useEffect } from 'react';
import { Card, Radio, Space, Typography, Empty } from 'antd';
import { PromptVersion } from '../../../services/promptApi';
import styles from '../Prompt.module.css';

const { Text } = Typography;

interface VersionCompareProps {
  versions: PromptVersion[];
}

const VersionCompare = ({ versions }: VersionCompareProps) => {
  const [leftVersion, setLeftVersion] = useState<string>('');
  const [rightVersion, setRightVersion] = useState<string>('');

  useEffect(() => {
    if (versions.length >= 2) {
      setLeftVersion(versions[1]?.id || '');
      setRightVersion(versions[0]?.id || '');
    } else if (versions.length === 1) {
      setLeftVersion(versions[0]?.id || '');
      setRightVersion(versions[0]?.id || '');
    }
  }, [versions]);

  const leftContent = versions.find((v) => v.id === leftVersion)?.content || '';
  const rightContent = versions.find((v) => v.id === rightVersion)?.content || '';

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const renderDiff = (oldText: string, newText: string) => {
    const oldLines = oldText.split('\n');
    const newLines = newText.split('\n');
    const maxLines = Math.max(oldLines.length, newLines.length);
    const result: JSX.Element[] = [];

    for (let i = 0; i < maxLines; i++) {
      const oldLine = oldLines[i] || '';
      const newLine = newLines[i] || '';

      if (oldLine === newLine) {
        result.push(
          <div key={i} className={styles.diffLine}>
            <span>{oldLine || ' '}</span>
          </div>
        );
      } else {
        if (oldLine) {
          result.push(
            <div key={`old-${i}`} className={styles.diffRemoved}>
              <span>- {oldLine}</span>
            </div>
          );
        }
        if (newLine) {
          result.push(
            <div key={`new-${i}`} className={styles.diffAdded}>
              <span>+ {newLine}</span>
            </div>
          );
        }
      }
    }

    return result;
  };

  if (versions.length === 0) {
    return <Empty description="暂无版本" />;
  }

  return (
    <div>
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space>
          <Text>左侧版本:</Text>
          <Radio.Group
            value={leftVersion}
            onChange={(e) => setLeftVersion(e.target.value)}
            optionType="button"
            buttonStyle="solid"
            size="small"
          >
            {versions.map((v) => (
              <Radio.Button key={v.id} value={v.id}>
                v{v.version}
              </Radio.Button>
            ))}
          </Radio.Group>
        </Space>
        <Space style={{ marginLeft: 32 }}>
          <Text>右侧版本:</Text>
          <Radio.Group
            value={rightVersion}
            onChange={(e) => setRightVersion(e.target.value)}
            optionType="button"
            buttonStyle="solid"
            size="small"
          >
            {versions.map((v) => (
              <Radio.Button key={v.id} value={v.id}>
                v{v.version}
              </Radio.Button>
            ))}
          </Radio.Group>
        </Space>
      </Card>

      <div className={styles.compareContainer}>
        <div className={styles.comparePanel}>
          <div className={styles.comparePanelHeader}>
            版本 {versions.find((v) => v.id === leftVersion)?.version || '-'}
          </div>
          <pre className={styles.compareContent}>{leftContent}</pre>
        </div>
        <div className={styles.comparePanel}>
          <div className={styles.comparePanelHeader}>
            版本 {versions.find((v) => v.id === rightVersion)?.version || '-'}
          </div>
          <pre className={styles.compareContent}>{rightContent}</pre>
        </div>
      </div>
    </div>
  );
};

export default VersionCompare;
