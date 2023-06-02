import React, { useRef, useState } from "react";
import { Stage, Layer, Line, Rect } from "react-konva";
import { ChromePicker } from "react-color";

const App = () => {
  const stageRef = useRef(null);
  const [color, setColor] = useState("#000000");
  const [isDrawing, setIsDrawing] = useState(false);
  const [toolBarPos, setToolBarPos] = useState({ x: 10, y: 10 });

  const handleMouseDown = () => {
    setIsDrawing(true);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) {
      return;
    }
    const stage = stageRef.current;
    const point = stage.getPointerPosition();
    // Offset the point to account for the toolbar position
    point.x -= toolBarPos.x;
    point.y -= toolBarPos.y;
    setLines([...lines, { points: [point.x, point.y], color }]);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const [lines, setLines] = useState([]);

  const handleColorChange = (color) => {
    setColor(color.hex);
  };

  const handleToolBarDragMove = (e) => {
    const node = e.target;
    const absolutePos = node.absolutePosition();
    setToolBarPos({ x: absolutePos.x, y: absolutePos.y });
  };

  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          position: "absolute",
          zIndex: 10,
          top: toolBarPos.y,
          left: toolBarPos.x,
          border: "1px solid #000",
          background: "#FFF",
          padding: 5,
          borderRadius: 5,
        }}
        draggable
        onDragMove={handleToolBarDragMove}
      >
        <ChromePicker color={color} onChange={handleColorChange} />
      </div>
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
        ref={stageRef}
      >
        <Layer>
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke={line.color}
              strokeWidth={5}
              lineCap="round"
              globalCompositeOperation={
                line.color === "#FFFFFF" ? "destination-out" : "source-over"
              }
            />
          ))}
        </Layer>
        <Layer>
          <Rect width={toolBarPos.x + 200} height={70} />
        </Layer>
      </Stage>
    </div>
  );
};

export default App;


