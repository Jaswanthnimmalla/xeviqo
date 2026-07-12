import React from 'react'

interface State {
  hasError: boolean
  error?: Error | null
}

export default class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log to console (Vite terminal) so developer can see stack traces
    // eslint-disable-next-line no-console
    console.error('Uncaught render error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          background: '#071126',
          color: '#e6eef8',
          fontFamily: 'Inter, system-ui, sans-serif'
        }}>
          <div style={{maxWidth: 900}}>
            <h1 style={{fontSize: 24, marginBottom: 8}}>Application error</h1>
            <pre style={{whiteSpace: 'pre-wrap', color: '#ffdede', background: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 8}}>
              {String(this.state.error)}
            </pre>
            <p style={{opacity: 0.9, marginTop: 12}}>Check the terminal (Vite) for the full stack trace.</p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
