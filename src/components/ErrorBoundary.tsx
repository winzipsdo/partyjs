import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message?: string;
}

// 全局错误兜底：捕获渲染期抛出的错误（包括某些浏览器扩展如 LocatorJS
// 干扰 React 内部导致的崩溃），显示友好界面而非白屏。
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error?.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // 仅记录，便于排查
    console.error('[ErrorBoundary]', error, info);
  }

  // 路由切换（hash 变化）时自动复位错误态，
  // 否则一个页面崩溃后，导航到其他页面仍会停留在错误屏
  componentDidMount() {
    window.addEventListener('hashchange', this.handleRouteChange);
  }

  componentWillUnmount() {
    window.removeEventListener('hashchange', this.handleRouteChange);
  }

  handleRouteChange = () => {
    if (this.state.hasError) {
      this.setState({ hasError: false, message: undefined });
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className='min-h-[100dvh] flex flex-col items-center justify-center gap-4 px-6 text-center '>
        <div className='text-5xl'>😵‍💫</div>
        <h1 className='text-xl font-bold text-white'>页面出了点小问题</h1>
        <p className='max-w-sm text-sm text-slate-500'>
          页面渲染时发生了错误。如果你安装了 React 相关的浏览器扩展（如 LocatorJS、React DevTools 等），
          请尝试关闭后重试。
        </p>
        <button
          onClick={this.handleReload}
          className='glass rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10'
        >
          刷新重试
        </button>
        {this.state.message && (
          <details className='mt-2 max-w-sm text-left'>
            <summary className='cursor-pointer text-xs text-slate-400'>错误详情</summary>
            <pre className='mt-1 overflow-x-auto rounded bg-white/[0.06] p-2 text-[11px] text-slate-400'>
              {this.state.message}
            </pre>
          </details>
        )}
      </div>
    );
  }
}
