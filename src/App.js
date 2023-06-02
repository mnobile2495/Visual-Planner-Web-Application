import React, { useState, useRef } from 'react';
import { Stage, Layer, Line, Circle, Rect } from 'react-konva';

const App = () => {
  const stageRef = useRef(null);
  const layerRef = useRef(null);
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#000000');
  const [thickness, setThickness] = useState(2);
  const [drawing, setDrawing] = useState(false);
  const [lines, setLines] = useState([]);
  const [shapes, setShapes] = useState([]);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 10, y: 10 });
  const [toolbarDragging, setToolbarDragging] = useState(false);
  const [lastToolbarX, setLastToolbarX] = useState(0);
  const [lastToolbarY, setLastToolbarY] = useState(0);

  const handleMouseDown = (event) => {
    const stage = stageRef.current;
    const { x, y } = stage.getPointerPosition();
    setDrawing(true);

    if (tool === 'pen') {
      setLines([...lines, { tool, color, thickness, points: [x, y] }]);
    } else if (tool === 'circle' || tool === 'square') {
      setShapes([...shapes, { tool, color, thickness, startX: x, startY: y, endX: x, endY: y }]);
    }
  };

  const handleMouseMove = (event) => {
    const stage = stageRef.current;
    const { x, y } = stage.getPointerPosition();

    if (drawing && tool === 'pen') {
      const updatedLines = [...lines];
      const lastLine = updatedLines[updatedLines.length - 1];
      lastLine.points = lastLine.points.concat([x, y]);
      setLines(updatedLines);
    } else if (drawing && (tool === 'circle' || tool === 'square')) {
      const updatedShapes = [...shapes];
      const lastShape = updatedShapes[updatedShapes.length - 1];
      lastShape.endX = x;
      lastShape.endY = y;
      setShapes(updatedShapes);
    }
  };

  const handleMouseUp = () => {
    setDrawing(false);
  };

  const clearCanvas = () => {
    setLines([]);
    setShapes([]);
  };

  const handleToolChange = (selectedTool) => {
    setTool(selectedTool);
  };

  const handleColorChange = (event) => {
    setColor(event.target.value);
  };

  const handleThicknessChange = (event) => {
    setThickness(Number(event.target.value));
  };

  const handleToolbarDragStart = (event) => {
    setToolbarDragging(true);
    setLastToolbarX(event.clientX);
    setLastToolbarY(event.clientY);
  };

  const handleToolbarDragEnd = () => {
    setToolbarDragging(false);
  };

  const handleToolbarDrag = (event) => {
    if (toolbarDragging) {
      const deltaX = event.clientX - lastToolbarX;
      const deltaY = event.clientY - lastToolbarY;
      setToolbarPosition((prevPosition) => ({
        x: prevPosition.x + deltaX,
        y: prevPosition.y + deltaY,
      }));
      setLastToolbarX(event.clientX);
      setLastToolbarY(event.clientY);
    }
  };

  return (
    <div>
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        ref={stageRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <Layer ref={layerRef}>
          {lines.map((line, index) => (
            <Line key={index} points={line.points} stroke={line.color} strokeWidth={line.thickness} />
          ))}
          {shapes.map((shape, index) => {
            if (shape.tool === 'circle') {
              return (
                <Circle
                  key={index}
                  x={shape.startX}
                  y={shape.startY}
                  radius={Math.sqrt(
                    Math.pow(shape.endX - shape.startX, 2) + Math.pow(shape.endY - shape.startY, 2)
                  )}
                  stroke={shape.color}
                  strokeWidth={shape.thickness}
                  draggable
                />
              );
            } else if (shape.tool === 'square') {
              return (
                <Rect
                  key={index}
                  x={Math.min(shape.startX, shape.endX)}
                  y={Math.min(shape.startY, shape.endY)}
                  width={Math.abs(shape.endX - shape.startX)}
                  height={Math.abs(shape.endY - shape.startY)}
                  stroke={shape.color}
                  strokeWidth={shape.thickness}
                  draggable
                />
              );
            }
            return null;
          })}
        </Layer>
      </Stage>
      <div
        style={{
          position: 'absolute',
          top: toolbarPosition.y,
          left: toolbarPosition.x,
          border: '1px solid black',
          background: 'white',
          padding: '10px',
          userSelect: 'none',
          cursor: toolbarDragging ? 'grabbing' : 'grab',
        }}
        onMouseDown={handleToolbarDragStart}
        onMouseUp={handleToolbarDragEnd}
        onMouseMove={handleToolbarDrag}
      >
        <button onClick={() => handleToolChange('pen')}>Pen</button>
        <button onClick={() => handleToolChange('circle')}>Circle</button>
        <button onClick={() => handleToolChange('square')}>Square</button>
        <input type="color" value={color} onChange={handleColorChange} />
        <input type="number" value={thickness} min={1} onChange={handleThicknessChange} />
        <button onClick={clearCanvas}>Clear</button>
      </div>
    </div>
  );
};

export default App;

