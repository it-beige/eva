import type { ReactNode } from 'react';
import { Breadcrumb, Space, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { usePageMeta } from '../../hooks/usePageMeta';

const { Paragraph, Title } = Typography;

type PageContainerProps = {
  title?: string;
  description?: string;
  extra?: ReactNode;
  content?: ReactNode;
  children: ReactNode;
};

const PageContainer = ({ title, description, extra, content, children }: PageContainerProps) => {
  const navigate = useNavigate();
  const meta = usePageMeta();

  const breadcrumbItems = meta.breadcrumbs.map((item) => ({
    title: item.path ? (
      <a
        onClick={(event) => {
          event.preventDefault();
          navigate(item.path!);
        }}
        href={item.path}
      >
        {item.title}
      </a>
    ) : (
      item.title
    ),
  }));

  return (
    <div className="eva-page">
      <div className="eva-pageHeader">
        <div className="eva-pageTitleBlock">
          <div className="eva-pageEyebrow">
            <Breadcrumb items={breadcrumbItems} />
          </div>
          <Space orientation="vertical" size={10}>
            <Title level={1} className="eva-pageTitle">
              {title ?? meta.title}
            </Title>
            <Paragraph className="eva-pageDescription">
              {description ?? meta.description}
            </Paragraph>
          </Space>
        </div>
        {extra ? <div className="eva-pageActions">{extra}</div> : null}
      </div>

      {content}
      {children}
    </div>
  );
};

export default PageContainer;
