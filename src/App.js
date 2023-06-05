import React, { useState, useRef } from 'react';
import { Stage, Layer, Line, Circle, Rect, Text } from 'react-konva';

const App = () => {
  const stageRef = useRef(null);
  const layerRef = useRef(null);
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#000000');
  const [thickness, setThickness] = useState(2);
  const [drawing, setDrawing] = useState(false);
  const [lines, setLines] = useState([]);
  const [shapes, setShapes] = useState([]);
  const [textElements, setTextElements] = useState([]);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 10, y: 10 });
  const [toolbarDragging, setToolbarDragging] = useState(false);
  const [lastToolbarX, setLastToolbarX] = useState(0);
  const [lastToolbarY, setLastToolbarY] = useState(0);
  const [textToolActive, setTextToolActive] = useState(false);
  const [textPosition, setTextPosition] = useState({ x: 100, y: 100 });
  const [editedText, setEditedText] = useState('');
  const [textColor, setTextColor] = useState('#000000');
  const [textSize, setTextSize] = useState(16);
  const [textFont, setTextFont] = useState('Arial');
  const [editingText, setEditingText] = useState(false);
  const [selectedTextId, setSelectedTextId] = useState(null);

  const handleMouseDown = (event) => {
    const stage = stageRef.current;
    const { x, y } = stage.getPointerPosition();

    if (tool === 'spotErase') {
      const intersectedShape = stage.getIntersection({ x, y });

      if (intersectedShape) {
        const shapeId = intersectedShape.id();

        if (intersectedShape.getClassName() === 'Text') {
          const updatedTextElements = textElements.filter((element) => element.id !== shapeId);
          setTextElements(updatedTextElements);
        } else {
          const updatedShapes = shapes.filter((shape) => shape.id !== shapeId);
          setShapes(updatedShapes);
        }
      }
    } else if (tool === 'text') {
      setTextPosition({ x, y });
      setTextToolActive(true);
    } else {
      setDrawing(true);

      if (tool === 'pen') {
        setLines([...lines, { tool, color, thickness, points: [x, y] }]);
      } else if (tool === 'circle' || tool === 'square') {
        setShapes([...shapes, { id: shapes.length, tool, color, thickness, startX: x, startY: y, endX: x, endY: y }]);
      }
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

    if (tool === 'spotErase') {
      const intersectedShape = stage.getIntersection({ x, y });
      stage.container().style.cursor = intersectedShape ? 'pointer' : 'default';
    }
  };

  const handleMouseUp = () => {
    setDrawing(false);
  };

  const clearCanvas = () => {
    setLines([]);
    setShapes([]);
    setTextElements([]);
  };

  const handleToolChange = (selectedTool) => {
    setTool(selectedTool);
    setTextToolActive(false);
    setEditingText(false);
    setSelectedTextId(null);
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

  const handleTextChange = (event) => {
    setEditedText(event.target.value);
  };

  const handleTextSubmit = () => {
    if (editedText !== '') {
      if (editingText) {
        const updatedTextElements = textElements.map((element) => {
          if (element.id === selectedTextId) {
            return {
              ...element,
              text: editedText,
              color: textColor,
              fontSize: textSize,
              fontFamily: textFont,
            };
          }
          return element;
        });
        setTextElements(updatedTextElements);
        setEditingText(false);
        setSelectedTextId(null);
      } else {
        setTextElements([
          ...textElements,
          {
            id: textElements.length,
            x: textPosition.x,
            y: textPosition.y,
            text: editedText,
            color: textColor,
            fontSize: textSize,
            fontFamily: textFont,
          },
        ]);
        setTextToolActive(false);
        setEditedText('');
      }
    }
  };

  const handleTextDelete = (id) => {
    const updatedTextElements = textElements.filter((element) => element.id !== id);
    setTextElements(updatedTextElements);
  };

  const handleTextDoubleClick = (id) => {
    const selectedTextElement = textElements.find((element) => element.id === id);
    if (selectedTextElement) {
      setSelectedTextId(id);
      setEditedText(selectedTextElement.text);
      setTextColor(selectedTextElement.color);
      setTextSize(selectedTextElement.fontSize);
      setTextFont(selectedTextElement.fontFamily);
      setTextToolActive(true);
      setEditingText(true);
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
                  id={shape.id}
                  x={shape.startX}
                  y={shape.startY}
                  radius={Math.sqrt(Math.pow(shape.endX - shape.startX, 2) + Math.pow(shape.endY - shape.startY, 2))}
                  stroke={shape.color}
                  strokeWidth={shape.thickness}
                  draggable
                />
              );
            } else if (shape.tool === 'square') {
              return (
                <Rect
                  key={index}
                  id={shape.id}
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
          {textElements.map((textElement) => (
            <Text
              key={textElement.id}
              id={textElement.id}
              x={textElement.x}
              y={textElement.y}
              text={textElement.text}
              fill={textElement.color}
              fontSize={textElement.fontSize}
              fontFamily={textElement.fontFamily}
              draggable
              onDblClick={() => handleTextDoubleClick(textElement.id)}
            />
          ))}
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
        <button onClick={() => handleToolChange('text')}>Text</button>
        <button onClick={() => handleToolChange('spotErase')}>Spot Erase</button>
        <input type="color" value={color} onChange={handleColorChange} />
        <input type="number" value={thickness} min={1} onChange={handleThicknessChange} />
        <button onClick={clearCanvas}>Clear</button>
      </div>
      {textToolActive && (
        <div
          style={{
            position: 'absolute',
            top: textPosition.y,
            left: textPosition.x,
            border: '1px solid black',
            background: 'white',
            padding: '10px',
            userSelect: 'none',
          }}
        >
          <input type="text" value={editedText} onChange={handleTextChange} />
          <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} />
          <input type="number" value={textSize} min={1} onChange={(e) => setTextSize(e.target.value)} />
          <select value={textFont} onChange={(e) => setTextFont(e.target.value)}>
            <option value="Arial">Arial</option>
            <option value="Verdana">Verdana</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Times New Roman">Times New Roman</option>
          </select>
          <button onClick={handleTextSubmit}>{editingText ? 'Update' : 'Place'}</button>
        </div>
      )}
    </div>
  );
};

export default App;