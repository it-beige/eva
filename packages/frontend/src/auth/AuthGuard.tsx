import { useEffect, useRef, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import authApi from '../services/authApi';
import PageLoading from '../components/feedback/PageLoading';
import {
  getAccessToken,
  getCurrentUser,
  persistCurrentUser,
  persistSession,
  clearSession,
} from './session';

type AuthGuardProps = {
  /** 当作为布局路由使用时不传 children，渲染 <Outlet /> */
  children?: ReactNode;
};

/**
 * 统一认证守卫
 *
 * 企业级设计要点：
 * 1. 只在首次挂载时执行一次异步校验，后续子路由切换不重复校验
 * 2. DEV 模式下自动 bootstrap demo 账号，避免开发时反复登录
 * 3. 使用 useRef 防止 StrictMode / 快速卸载导致的竞态问题
 */
const AuthGuard = ({ children }: AuthGuardProps) => {
  const location = useLocation();
  const [status, setStatus] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');
  const initRef = useRef(false);

  useEffect(() => {
    // 防止 StrictMode 双重执行或快速重挂载
    if (initRef.current) return;
    initRef.current = true;

    const validate = async () => {
      const token = getAccessToken();
      const user = getCurrentUser();

      // 已有 token + user → 直接放行
      if (token && user) {
        setStatus('authenticated');
        return;
      }

      // DEV 模式下无 token → 自动登录 demo 账号
      if (!token && import.meta.env.DEV) {
        try {
          const result = await authApi.login({
            employeeId: 'admin001',
            password: 'admin123',
          });
          persistSession(result.accessToken, result.user);
          setStatus('authenticated');
        } catch {
          clearSession();
          setStatus('unauthenticated');
        }
        return;
      }

      // 无 token → 未认证
      if (!token) {
        setStatus('unauthenticated');
        return;
      }

      // 有 token 但无 user → 通过 /auth/me 拉取用户信息
      try {
        const user = await authApi.me();
        persistCurrentUser(user);
        setStatus('authenticated');
      } catch {
        clearSession();
        setStatus('unauthenticated');
      }
    };

    validate();
  }, []);

  if (status === 'checking') {
    return <PageLoading />;
  }

  if (status === 'unauthenticated') {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  // 如果传了 children 就渲染 children（兼容旧用法），否则渲染 Outlet（布局路由模式）
  return <>{children ?? <Outlet />}</>;
};

export default AuthGuard;
