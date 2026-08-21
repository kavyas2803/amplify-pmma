import { useState } from 'react';
import { Alert, Button, Form, Input } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthProvider';
import { assets } from '@/config/assets';
import { labels } from '@/constants/labels';
import type { LoginPayload } from '@/types/user';

interface LocationState {
  from?: { pathname: string };
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFinish = async (values: LoginPayload) => {
    setSubmitting(true);
    setErrorMessage(null);
    try {
      await login(values);
      const state = location.state as LocationState | null;
      const destination = state?.from?.pathname ?? '/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      setErrorMessage((err as { message?: string })?.message ?? 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col md:flex-row overflow-hidden">
      <div className="h-40 md:h-auto md:w-1/2 bg-sidebar flex items-center justify-center shrink-0 overflow-hidden">
        <img src={assets.panasonicWordmark} alt="Panasonic" className="w-[75%] max-w-[700px] h-auto object-contain" />
      </div>

      <div className="flex-1 flex items-start md:items-center justify-center bg-page-background px-6 overflow-y-auto">
        <div className="w-full max-w-sm pt-10 pb-8 md:py-8">
          <h1 className="text-3xl font-bold text-text mb-1">Welcome Back!</h1>
          <p className="text-text-muted mb-6">Enter your email and password.</p>

          {errorMessage && (
            <Alert type="error" message={errorMessage} showIcon className="mb-4" />
          )}

          <Form layout="vertical" onFinish={handleFinish} requiredMark={false} disabled={submitting}>
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: 'Please enter your email.' }]}
            >
              <Input placeholder="Enter your Email ID" size="large" autoComplete="username" />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: 'Please enter your password.' }]}
            >
              <Input.Password
                placeholder="Enter your Password"
                size="large"
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item className="mb-3">
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                loading={submitting}
              >
                {submitting ? labels.actions.signingIn : labels.actions.signIn}
              </Button>
            </Form.Item>

          </Form>
        </div>
      </div>
    </div>
  );
}
