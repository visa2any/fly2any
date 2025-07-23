import React from 'react';
import Image from 'next/image';

export default function OmnichannelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <title>Central Omnichannel - Fly2Any</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style dangerouslySetInnerHTML={{
          __html: `
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              color: #333;
            }
            
            .omni-container {
              width: 100%;
              min-height: 100vh;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 0;
              margin: 0;
            }
            
            .omni-header {
              background: rgba(255, 255, 255, 0.95);
              backdrop-filter: blur(20px);
              border-bottom: 1px solid rgba(255, 255, 255, 0.2);
              box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
              padding: 24px;
              position: sticky;
              top: 0;
              z-index: 100;
            }
            
            .omni-header-content {
              max-width: 1200px;
              margin: 0 auto;
              display: flex;
              align-items: center;
              justify-content: space-between;
            }
            
            .omni-logo-area {
              display: flex;
              align-items: center;
              gap: 16px;
            }
            
            .omni-logo {
              width: 64px;
              height: 64px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 16px;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
              transform: rotate(-3deg);
              font-size: 28px;
              color: white;
            }
            
            .omni-title {
              font-size: 32px;
              font-weight: 800;
              color: #1e293b;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
            }
            
            .omni-subtitle {
              font-size: 16px;
              color: #64748b;
              margin: 4px 0 0 0;
              font-weight: 500;
            }
            
            .omni-actions {
              display: flex;
              align-items: center;
              gap: 16px;
            }
            
            .omni-status {
              display: flex;
              align-items: center;
              gap: 8px;
              padding: 12px 20px;
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              border-radius: 25px;
              color: white;
              box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3);
              font-size: 14px;
              font-weight: 600;
            }
            
            .omni-status-dot {
              width: 8px;
              height: 8px;
              background: #34d399;
              border-radius: 50%;
              animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.7; }
            }
            
            .omni-btn {
              padding: 12px 24px;
              background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
              color: white;
              border: none;
              border-radius: 12px;
              font-size: 14px;
              font-weight: 600;
              cursor: pointer;
              box-shadow: 0 4px 16px rgba(249, 115, 22, 0.3);
              transition: all 0.3s ease;
              text-decoration: none;
              display: inline-block;
            }
            
            .omni-btn:hover {
              transform: translateY(-2px);
              box-shadow: 0 8px 24px rgba(249, 115, 22, 0.4);
            }
            
            .omni-content {
              max-width: 1200px;
              margin: 0 auto;
              padding: 32px 24px;
            }
          `
        }} />
      </head>
      <body>
        <div className="omni-container">
          <div className="omni-header">
            <div className="omni-header-content">
              <div className="omni-logo-area">
                <div className="omni-logo">
                  <Image
                    src="/fly2any-logo.png"
                    alt="Fly2Any"
                    width={40}
                    height={16}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h1 className="omni-title">Central Omnichannel Premium</h1>
                  <p className="omni-subtitle">
                    Gerencie todas as conversas com design premium e funcionalidades avançadas
                  </p>
                </div>
              </div>
              
              <div className="omni-actions">
                <div className="omni-status">
                  <div className="omni-status-dot"></div>
                  Sistema Online
                </div>
                <a href="/admin" className="omni-btn">
                  ← Voltar Admin
                </a>
              </div>
            </div>
          </div>
          
          <div className="omni-content">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}