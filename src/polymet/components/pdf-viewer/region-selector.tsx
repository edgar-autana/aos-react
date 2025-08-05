import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { CameraIcon } from "lucide-react";

interface SelectedRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
}

interface RegionSelectorProps {
  onRegionSelect: (region: SelectedRegion | null) => void;
  selectedRegion: SelectedRegion | null;
  isActive: boolean;
}

interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export default function RegionSelector({
  onRegionSelect,
  selectedRegion,
  isActive
}: RegionSelectorProps) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0
  });
  const [showSnapshotButton, setShowSnapshotButton] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const getRelativeCoordinates = useCallback((e: React.MouseEvent) => {
    if (!overlayRef.current) return { x: 0, y: 0 };
    
    const rect = overlayRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isActive) return;
    
    e.preventDefault();
    const coords = getRelativeCoordinates(e);
    
    setDragState({
      isDragging: true,
      startX: coords.x,
      startY: coords.y,
      currentX: coords.x,
      currentY: coords.y
    });

    // Clear any existing selection
    onRegionSelect(null);
    setShowSnapshotButton(false);
  }, [isActive, getRelativeCoordinates, onRegionSelect]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragState.isDragging || !isActive) return;
    
    e.preventDefault();
    const coords = getRelativeCoordinates(e);
    
    setDragState(prev => ({
      ...prev,
      currentX: coords.x,
      currentY: coords.y
    }));
  }, [dragState.isDragging, isActive, getRelativeCoordinates]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (!dragState.isDragging || !isActive) return;
    
    e.preventDefault();
    const coords = getRelativeCoordinates(e);
    
    const startX = Math.min(dragState.startX, coords.x);
    const startY = Math.min(dragState.startY, coords.y);
    const endX = Math.max(dragState.startX, coords.x);
    const endY = Math.max(dragState.startY, coords.y);
    
    const width = endX - startX;
    const height = endY - startY;
    
    // Only create a selection if the area is meaningful (> 10px in both dimensions)
    if (width > 10 && height > 10) {
      const region: SelectedRegion = {
        x: startX,
        y: startY,
        width,
        height,
        page: 1 // This will be set by the parent component
      };
      
      onRegionSelect(region);
    }
    
    setDragState({
      isDragging: false,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0
    });
  }, [dragState, isActive, getRelativeCoordinates, onRegionSelect]);

  const handleOverlayMouseEnter = useCallback(() => {
    if (selectedRegion && !dragState.isDragging) {
      setShowSnapshotButton(true);
    }
  }, [selectedRegion, dragState.isDragging]);

  const handleOverlayMouseLeave = useCallback(() => {
    setShowSnapshotButton(false);
  }, []);

  // Calculate current selection rectangle
  const getCurrentRect = useCallback(() => {
    if (!dragState.isDragging) return null;
    
    const startX = Math.min(dragState.startX, dragState.currentX);
    const startY = Math.min(dragState.startY, dragState.currentY);
    const width = Math.abs(dragState.currentX - dragState.startX);
    const height = Math.abs(dragState.currentY - dragState.startY);
    
    return { x: startX, y: startY, width, height };
  }, [dragState]);

  const currentRect = getCurrentRect();

  // Disable text selection and context menu during dragging
  useEffect(() => {
    if (dragState.isDragging) {
      document.body.style.userSelect = 'none';
      document.body.style.pointerEvents = 'none';
      if (overlayRef.current) {
        overlayRef.current.style.pointerEvents = 'auto';
      }
    } else {
      document.body.style.userSelect = '';
      document.body.style.pointerEvents = '';
    }
    
    return () => {
      document.body.style.userSelect = '';
      document.body.style.pointerEvents = '';
    };
  }, [dragState.isDragging]);

  if (!isActive) return null;

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 cursor-crosshair"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseEnter={handleOverlayMouseEnter}
      onMouseLeave={handleOverlayMouseLeave}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Current drag selection */}
      {currentRect && (
        <div
          className="absolute border-2 border-blue-500 bg-blue-500/20 pointer-events-none"
          style={{
            left: currentRect.x,
            top: currentRect.y,
            width: currentRect.width,
            height: currentRect.height,
          }}
        />
      )}
      
      {/* Selected region */}
      {selectedRegion && !dragState.isDragging && (
        <div
          className="absolute border-2 border-green-500 bg-green-500/20 group"
          style={{
            left: selectedRegion.x,
            top: selectedRegion.y,
            width: selectedRegion.width,
            height: selectedRegion.height,
          }}
        >
          {/* Snapshot button */}
          {showSnapshotButton && (
            <div className="absolute top-2 right-2">
              <Button
                size="sm"
                variant="secondary"
                className="h-8 w-8 p-0 shadow-lg"
                title="Capture selected region"
                onClick={(e) => {
                  e.stopPropagation();
                  // Signal parent to capture the region
                  // This will be handled by the parent's snapshot functionality
                }}
              >
                <CameraIcon className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          {/* Selection info */}
          <div className="absolute -top-8 left-0 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            {Math.round(selectedRegion.width)} × {Math.round(selectedRegion.height)}
          </div>
        </div>
      )}
      
      {/* Instructions overlay when no selection */}
      {!selectedRegion && !dragState.isDragging && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/60 text-white px-4 py-2 rounded-lg text-sm">
            Click and drag to select a region
          </div>
        </div>
      )}
    </div>
  );
}