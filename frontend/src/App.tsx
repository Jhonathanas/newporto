import { lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'
import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Alert, AlertDescription, AlertTitle } from './components/ui/alert'
import { Button } from './components/ui/button'
import { Skeleton } from './components/ui/skeleton'
import { ContentProvider, useContent } from './lib/content'
import Home from './pages/Home'
import Projects from './pages/Projects'
import Blog from './pages/Blog'
import NotFound from './pages/NotFound'

// Panel admin dimuat terpisah agar bundle publik tetap ringan.
const AdminApp = lazy(() => import('./admin/AdminApp'))

// Halaman detail memuat markdown; dipisah agar bundle awal tetap ringan.
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'))
const BlogDetail = lazy(() => import('./pages/BlogDetail'))

function PageFallback() {
  return (
    <div className="container-page space-y-4 py-24">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-10 w-2/3" />
      <Skeleton className="h-4 w-full max-w-xl" />
      <Skeleton className="h-4 w-4/5 max-w-lg" />
    </div>
  )
}

function AdminFallback() {
  return (
    <div className="grid min-h-dvh place-items-center bg-background">
      <Loader2 size={22} className="animate-spin text-primary" />
    </div>
  )
}

function ContentLoading() {
  const { t } = useTranslation()

  return (
    <div className="grid min-h-dvh place-items-center bg-background px-6">
      <div className="w-full max-w-sm space-y-4 text-center">
        <Loader2 size={24} className="mx-auto animate-spin text-primary" />
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {t('common.loading')}
        </p>
        <Skeleton className="h-2 w-full" />
      </div>
    </div>
  )
}

function ContentError({ message, onRetry }: { message: string; onRetry: () => void }) {
  const { t } = useTranslation()

  return (
    <div className="grid min-h-dvh place-items-center bg-background px-6">
      <Alert variant="destructive" className="max-w-md">
        <AlertTitle className="text-base">{t('common.loadErrorTitle')}</AlertTitle>
        <AlertDescription>
          <p>{t('common.loadErrorNote')}</p>
          <p className="mt-2 font-mono text-[11px] opacity-80">{message}</p>
          <Button type="button" onClick={onRetry} className="mt-4">
            {t('common.retry')}
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  )
}

function PublicSite() {
  const { data, error, reload } = useContent()

  if (!data) {
    return error ? <ContentError message={error} onRetry={reload} /> : <ContentLoading />
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route
          path="/projects/:slug"
          element={
            <Suspense fallback={<PageFallback />}>
              <ProjectDetail />
            </Suspense>
          }
        />
        <Route path="/blog" element={<Blog />} />
        <Route
          path="/blog/:slug"
          element={
            <Suspense fallback={<PageFallback />}>
              <BlogDetail />
            </Suspense>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/admin/*"
        element={
          <Suspense fallback={<AdminFallback />}>
            <AdminApp />
          </Suspense>
        }
      />
      <Route
        path="/*"
        element={
          <ContentProvider>
            <PublicSite />
          </ContentProvider>
        }
      />
    </Routes>
  )
}
