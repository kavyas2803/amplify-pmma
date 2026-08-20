import { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '@/app/router/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoadingState } from '@/components/common/LoadingState';

const LoginPage = lazy(() => import('@/pages/Login/LoginPage').then((m) => ({ default: m.LoginPage })));
const DashboardPage = lazy(() =>
  import('@/pages/Dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const ClassificationPage = lazy(() =>
  import('@/pages/Classification/ClassificationPage').then((m) => ({ default: m.ClassificationPage })),
);
const ClassificationResultsPage = lazy(() =>
  import('@/pages/ClassificationResults/ClassificationResultsPage').then((m) => ({
    default: m.ClassificationResultsPage,
  })),
);

function SuspenseFallback() {
  return <LoadingState label="Loading..." fullHeight />;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<SuspenseFallback />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/classification" element={<ClassificationPage />} />
              <Route path="/classification/:runId" element={<ClassificationResultsPage />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
