import React, { useEffect, useRef } from 'react';
import { Box, Loader2 } from 'lucide-react';

interface Simple3DViewerProps {
  urn: string;
  onLoad?: () => void;
  onError?: (error: string) => void;
}

export default function Simple3DViewer({ urn, onLoad, onError }: Simple3DViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create a simple 3D scene for demonstration
    const createDemoScene = () => {
      const container = containerRef.current!;
      
      // Create a simple HTML-based 3D representation
      const scene = document.createElement('div');
      scene.style.cssText = `
        width: 100%;
        height: 400px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: white;
        font-family: monospace;
        position: relative;
        overflow: hidden;
      `;

      // Create a 3D cube using CSS
      const cube = document.createElement('div');
      cube.style.cssText = `
        width: 100px;
        height: 100px;
        background: rgba(255, 255, 255, 0.2);
        border: 2px solid rgba(255, 255, 255, 0.5);
        border-radius: 8px;
        transform: rotateX(45deg) rotateY(45deg);
        animation: rotate 10s linear infinite;
        margin-bottom: 20px;
      `;

      // Add CSS animation
      const style = document.createElement('style');
      style.textContent = `
        @keyframes rotate {
          from { transform: rotateX(45deg) rotateY(0deg); }
          to { transform: rotateX(45deg) rotateY(360deg); }
        }
      `;
      document.head.appendChild(style);

      // Add content
      const content = document.createElement('div');
      content.innerHTML = `
        <div style="text-align: center;">
          <h3 style="margin: 0 0 10px 0; font-size: 18px;">3D Model Viewer</h3>
          <p style="margin: 0 0 15px 0; font-size: 14px; opacity: 0.8;">
            URN: ${urn.substring(0, 20)}...
          </p>
          <div style="display: flex; gap: 10px; margin-top: 20px;">
            <button onclick="this.parentElement.parentElement.parentElement.style.transform='rotateX(45deg) rotateY(0deg)'" 
                    style="padding: 8px 16px; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); border-radius: 4px; color: white; cursor: pointer;">
              Reset View
            </button>
            <button onclick="this.parentElement.parentElement.parentElement.style.animation='rotate 5s linear infinite'" 
                    style="padding: 8px 16px; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); border-radius: 4px; color: white; cursor: pointer;">
              Auto Rotate
            </button>
          </div>
        </div>
      `;

      scene.appendChild(cube);
      scene.appendChild(content);
      container.appendChild(scene);

      // Call onLoad after a short delay to simulate loading
      setTimeout(() => {
        onLoad?.();
      }, 1000);
    };

    // Clear previous content
    containerRef.current.innerHTML = '';
    
    // Show loading state
    const loadingDiv = document.createElement('div');
    loadingDiv.style.cssText = `
      width: 100%;
      height: 400px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f8f9fa;
      border-radius: 8px;
      border: 2px dashed #dee2e6;
    `;
    loadingDiv.innerHTML = `
      <div style="text-align: center;">
        <div style="margin-bottom: 10px;">🔄</div>
        <div>Loading 3D viewer...</div>
      </div>
    `;
    containerRef.current.appendChild(loadingDiv);

    // Create demo scene after a short delay
    setTimeout(createDemoScene, 1500);

  }, [urn, onLoad, onError]);

  return (
    <div className="relative w-full h-full min-h-[400px]">
      <div 
        ref={containerRef} 
        className="w-full h-full min-h-[400px]"
      />
    </div>
  );
} 