import { Flex, Spin, Typography } from 'antd';
import styles from './PageLoading.module.scss';

const { Text } = Typography;

const PageLoading = () => {
  return (
    <Flex
      vertical
      align="center"
      justify="center"
      gap={8}
      className={styles.root}
    >
      <Spin size="large" />
      <Text type="secondary">Loading</Text>
    </Flex>
  );
};

export default PageLoading;
