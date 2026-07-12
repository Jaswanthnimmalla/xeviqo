import { useEffect, useState } from 'react'

export default function VersionChecker() {
  const [show, setShow] = useState(false)
  const [latest, setLatest] = useState('')

  useEffect(() => {
    const checkVersion = async () => {
      try {
        const res = await fetch(
  'https://xeviqo-c3035.firebaseapp.com/version.json?t=' + Date.now(),
  {
    cache: 'no-store',
  }
)

        const data = await res.json()

        const savedVersion = localStorage.getItem('xeviqo_version')

        if (!savedVersion) {
          localStorage.setItem('xeviqo_version', data.version)
          return
        }

        if (savedVersion !== data.version) {
          setLatest(data.version)
          setShow(true)
        }
      } catch (e) {
        console.error(e)
      }
    }

    checkVersion()

    const timer = setInterval(checkVersion, 30000)

    return () => clearInterval(timer)
  }, [])

  if (!show) return null

  const dismiss = () => {
    localStorage.setItem('xeviqo_version', latest)
    setShow(false)
  }

  const refresh = () => {
    localStorage.setItem('xeviqo_version', latest)
    setShow(false)
    window.location.reload()
  }

  return (
    <>
      <style>{`
       @keyframes slideDown {
  0%{
    opacity:0;
    transform:translate(-50%,-100px);
  }

  70%{
    transform:translate(-50%,8px);
  }

  100%{
    opacity:1;
    transform:translate(-50%,0);
  }
}

        @keyframes glow {

0%{
box-shadow:0 0 20px rgba(99,102,241,.4);
}

50%{
box-shadow:
0 0 25px rgba(99,102,241,.8),
0 0 60px rgba(168,85,247,.7),
0 0 90px rgba(236,72,153,.5);
}

100%{
box-shadow:0 0 20px rgba(99,102,241,.4);
}

}

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.04); }
          100% { transform: scale(1); }
        }
      `}</style>

      <div
        style={{
          position: 'fixed',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(92vw,520px)',
maxWidth: '650px',
padding: '0 12px',
boxSizing: 'border-box',
          zIndex: 999999999,
          animation: 'slideDown .4s ease',
        }}
      >
        <div
          style={{
            position: 'relative',
            background:
              'linear-gradient(135deg,#0f172a,#1e1b4b,#312e81,#4338ca)',
            color: '#fff',
            borderRadius: 22,
            padding:'18px 20px',
            border: '1px solid rgba(255,255,255,.12)',
            animation: 'glow 2s infinite',
            backdropFilter: 'blur(16px)',
          }}
        >
          <button
            onClick={dismiss}
            style={{
              position: 'absolute',
              top: 15,
              right: 18,
              border: 'none',
              background: 'transparent',
              color: '#fff',
              fontSize: 24,
              cursor: 'pointer',
            }}
          >
            ×
          </button>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 15,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                fontSize: 24,
                background:
                  'linear-gradient(135deg,#6366F1,#8B5CF6,#EC4899)',
              }}
            >
              🚀
            </div>

            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 24,
                  fontWeight: 800,
                }}
              >
                🚀 Xeviqo has been Updated
              </h2>

              <div
                style={{
                  marginTop: 4,
                  color: '#C7D2FE',
                  fontWeight: 600,
                }}
              >
                Version {latest}
              </div>
            </div>
          </div>

          <p
            style={{
              marginTop: 18,
              lineHeight: 1.7,
              color: '#E2E8F0',
              fontSize: 14,
            }}
          >
            We've released a new version with exciting improvements,
performance enhancements and bug fixes.

Click Refresh Now to enjoy the latest experience.
          </p>

          <div
            style={{
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
              marginTop: 22,
            }}
          >
            <button
              onClick={refresh}
              style={{
                flex: 1,
                minWidth: 170,
                border: 'none',
                cursor: 'pointer',
                padding: '15px',
                borderRadius: 14,
                color: '#fff',
                fontWeight: 700,
                fontSize: 16,
                background:
                  'linear-gradient(135deg,#6366F1,#8B5CF6,#EC4899)',
                animation:'pulse .8s infinite',
              }}
            >
              🔄 Refresh Now
            </button>

            <button
              onClick={dismiss}
              style={{
  flex: 1,
  minWidth: 140,
  cursor: 'pointer',
  padding: '15px 20px',
  borderRadius: 14,
  background: 'rgba(255,255,255,0.08)',
  color: '#fff',
  border: '1px solid rgba(255,255,255,0.15)',
  fontWeight: 700,
  fontSize: 16,
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  transition: 'all .3s ease',
  boxShadow: '0 4px 20px rgba(255,255,255,.08)',
}}
              
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </>
  )
}