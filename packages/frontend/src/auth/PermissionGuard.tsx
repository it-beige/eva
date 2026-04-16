import { Button, Result } from 'antd';
import type { ReactNode } from 'react';
import { UserRole } from '@eva/shared';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, hasRole } from './session';

type PermissionGuardProps = {
  requiredRole: UserRole;
  children: ReactNode;
};

const PermissionGuard = ({
  requiredRole,
  children,
}: PermissionGuardProps) => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  if (!hasRole(currentUser, requiredRole)) {
    return (
      <Result
        status="403"
        title="没有访问权限"
        subTitle="当前页面仅对具备对应角色的账号开放，请联系管理员开通权限。"
        extra={
          <Button type="primary" onClick={() => navigate('/eval/tasks')}>
            返回评测任务
          </Button>
        }
      />
    );
  }

  return <>{children}</>;
};

export default PermissionGuard;
