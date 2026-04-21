import { useEffect, type ReactNode } from 'react';
import { Typography } from 'antd';
import { useLocation } from 'react-router-dom';
import { usePageMeta } from '../../hooks/usePageMeta';
import { useAppDispatch } from '../../hooks/useRedux';
import { addTab } from '../../store/tabsSlice';

const { Paragraph, Title } = Typography;

type PageContainerProps = {
  title?: string;
  description?: ReactNode;
  extra?: ReactNode;
  content?: ReactNode;
  children: ReactNode;
};

const PageContainer = ({ title, description, extra, content, children }: PageContainerProps) => {
  const meta = usePageMeta();
  const location = useLocation();
  const dispatch = useAppDispatch();

  // 页面挂载时自动注册到标签页
  const pageTitle = (title ?? meta.title) as string;
  const pagePath = location.pathname;

  useEffect(() => {
    dispatch(
      addTab({
        key: pagePath,
        title: pageTitle,
        closable: true,
      }),
    );
  }, [dispatch, pagePath, pageTitle]);

  return (
    <div className="eva-page">
      <div className="eva-pageHeader">
        <div className="eva-pageTitleBlock">
          <Title level={1} className="eva-pageTitle">
            {title ?? meta.title}
          </Title>
          <Paragraph className="eva-pageDescription">
            {description ?? meta.description}
          </Paragraph>
        </div>
        {extra ? <div className="eva-pageActions">{extra}</div> : null}
      </div>

      {content}
      {children}
    </div>
  );
};

export default PageContainer;
