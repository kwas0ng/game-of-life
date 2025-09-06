import { useCallback, useState, useEffect, useRef } from 'react';
import { PATTERNS } from './constants/patterns';
import {
    FaTrash,
    FaPencilAlt,
    FaEraser,
    FaStepForward,
    FaPlay,
    FaStop
} from 'react-icons/fa';


function Grid() {
    /*
    Conway's game of life
      2D array
      1. Any live cell with fewer than two live neighbours dies, as if caused by under-population.
      2. Any live cell with two or three live neighbours lives on to the next generation.
      3. Any live cell with more than three live neighbours dies, as if by over-population.
      4. Any dead cell winbh exactly three live neighbours becomes a live cell, as if by reproduction.
      
  
      status: live or dead, 0 or 1
      grid: 2D array of cells
  
    */
    const INITIAL_CELL_SIZE = 20;
    const GRID_COLS = 500;
    const GRID_ROWS = 500;
    const [cellSize, setCellSize] = useState(INITIAL_CELL_SIZE);
    const [offsetX, setOffsetX] = useState(0);
    const [offsetY, setOffsetY] = useState(0);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);
    const [containerHeight, setContainerHeight] = useState(0);
    const CANVAS_WIDTH = containerWidth;
    const CANVAS_HEIGHT = containerHeight;
    const [isSimulating, setIsSimulating] = useState(false);
    const [intervalId, setIntervalId] = useState<number | null>(null);
    const [intervalSpeed, setIntervalSpeed] = useState(100);
    const [isDrawing, setIsDrawing] = useState(true);
    const [isDragging, setIsDragging] = useState(false);
    const [isPanning, setIsPanning] = useState(false);
    const [lastPanPosition, setLastPanPosition] = useState<{ x: number, y: number } | null>(null);
    const [generation, setGeneration] = useState(0);
    // for auto start
    // const [hasAutoStarted, setHasAutoStarted] = useState(false);
    const [grid, setGrid] = useState<boolean[][]>(() =>
        Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLS).fill(false).map(() => Math.random() < 0.1))
    );

    const drawCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 0.5;

        const startCol = Math.floor(-offsetX / cellSize);
        const endCol = Math.floor((CANVAS_WIDTH - offsetX) / cellSize) + 1;
        const startRow = Math.floor(-offsetY / cellSize);
        const endRow = Math.floor((CANVAS_HEIGHT - offsetY) / cellSize) + 1;

        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                const x = col * cellSize + offsetX;
                const y = row * cellSize + offsetY;

                const isAlive = row >= 0 && row < grid.length &&
                    col >= 0 && col < grid[0].length &&
                    grid[row][col];

                if (isAlive) {
                    ctx.fillStyle = '#000000';
                    ctx.fillRect(x, y, cellSize, cellSize);
                } else {
                    ctx.fillStyle = '#ffffff';
                }

                ctx.strokeRect(x, y, cellSize, cellSize);
            }
        }
    }, [grid, cellSize, offsetX, offsetY, CANVAS_WIDTH, CANVAS_HEIGHT]);

    const checkNeighbors = (grid: boolean[][], row: number, col: number) => {
        const NEIGHBORS = [
            [-1, -1], [-1, 0], [1, -1], [1, 0],
            [0, -1], [0, 1],
            [-1, 1], [1, 1]
        ]

        let count = 0;
        const rowNum = grid.length;
        const colNum = grid[0].length;
        for (const [x, y] of NEIGHBORS) {
            const newRow = row + x;
            const newCol = col + y;

            if (newRow >= 0 && newRow < rowNum && newCol >= 0 && newCol < colNum) {
                if (grid[newRow][newCol]) {
                    count++;
                }
            }
        }
        return count;
    }
    const resetGrid = () => {
        setGrid(() => {
            return Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLS).fill(false))
        })
        setGeneration(0);
    }
    const propagate = useCallback(() => {
        setGrid(prevGrid => {
            const newGrid = prevGrid.map((row, rowIndex) =>
                row.map((cell, colIndex) => {
                    const neighbors = checkNeighbors(prevGrid, rowIndex, colIndex);
                    if (cell) {
                        return neighbors === 2 || neighbors === 3;
                    } else {
                        return neighbors === 3;
                    }
                })
            );
            return newGrid;
        });
        setGeneration(prev => prev + 1);
    }, []);

    const simulate = () => {
        if (isSimulating) {
            if (intervalId) {
                clearInterval(intervalId);
                setIntervalId(null);
            }
            setIsSimulating(false);
        } else {
            setIsSimulating(true);
            const interval = setInterval(() => {
                propagate();
            }, intervalSpeed);
            setIntervalId(interval);
        }
    }

    const loadPattern = (patternName: string) => {
        const pattern = PATTERNS.find(p => p.name === patternName);
        if (!pattern) return;

        const newGrid = Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLS).fill(false));

        const canvasCenterX = CANVAS_WIDTH / 2;
        const canvasCenterY = CANVAS_HEIGHT / 2;

        const gridCenterCol = Math.floor((canvasCenterX - offsetX) / cellSize);
        const gridCenterRow = Math.floor((canvasCenterY - offsetY) / cellSize);

        const startRow = gridCenterRow - Math.floor(pattern.height / 2);
        const startCol = gridCenterCol - Math.floor(pattern.width / 2);


        pattern.cells.forEach(([row, col]) => {
            const gridRow = startRow + row;
            const gridCol = startCol + col;

            if (gridRow >= 0 && gridRow < GRID_ROWS && gridCol >= 0 && gridCol < GRID_COLS) {
                newGrid[gridRow][gridCol] = true;
            }
        });

        setGrid(newGrid);
    }

    const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        const newCellSize = Math.max(2, Math.min(50, cellSize * zoomFactor));

        if (newCellSize !== cellSize) {
            const canvas = canvasRef.current;
            if (canvas) {
                const rect = canvas.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;

                const ratio = newCellSize / cellSize;
                setOffsetX(prev => mouseX - (mouseX - prev) * ratio);
                setOffsetY(prev => mouseY - (mouseY - prev) * ratio);
            }

            setCellSize(newCellSize);
        }
    }, [cellSize]);

    const handleClick = useCallback((row: number, col: number) => {
        setGrid(prevGrid => {
            const newGrid = [...prevGrid];
            newGrid[row] = [...prevGrid[row]];
            newGrid[row][col] = isDrawing ? true : false;
            return newGrid;
        });
    }, [isDrawing]);

    const getMousePosition = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return null;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const col = Math.floor((x - offsetX) / cellSize);
        const row = Math.floor((y - offsetY) / cellSize);

        if (row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS) {
            return { row, col };
        }
        return null;
    }, [cellSize, offsetX, offsetY]);

    const handleCanvasMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        if (e.button === 2) {
            setIsPanning(true);
            setLastPanPosition({ x: e.clientX, y: e.clientY });
        } else {
            const pos = getMousePosition(e);
            if (pos) {
                setIsDragging(true);
                handleClick(pos.row, pos.col);
            }
        }
    }, [getMousePosition, handleClick]);

    const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        if (isPanning && lastPanPosition) {
            const deltaX = e.clientX - lastPanPosition.x;
            const deltaY = e.clientY - lastPanPosition.y;

            setOffsetX(prev => prev + deltaX);
            setOffsetY(prev => prev + deltaY);
            setLastPanPosition({ x: e.clientX, y: e.clientY });
        } else if (isDragging) {
            const pos = getMousePosition(e);
            if (pos) {
                handleClick(pos.row, pos.col);
            }
        }
    }, [isDragging, isPanning, lastPanPosition, getMousePosition, handleClick]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        setIsPanning(false);
        setLastPanPosition(null);
    }, []);

    const handleChangeSpeed = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setIntervalSpeed(Number(e.target.value));
    }

    const handlePatternChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const patternName = e.target.value;
        if (patternName && patternName !== '') {
            loadPattern(patternName as string);
            setGeneration(0);
        }
    }

    useEffect(() => {
        setOffsetX(-Math.floor(GRID_COLS * INITIAL_CELL_SIZE / 2) + CANVAS_WIDTH / 2);
        setOffsetY(-Math.floor(GRID_ROWS * INITIAL_CELL_SIZE / 2) + CANVAS_HEIGHT / 2);
    }, [CANVAS_WIDTH, CANVAS_HEIGHT]);

    useEffect(() => {
        const updateContainerSize = () => {
            if (containerRef.current) {
                const availableWidth = containerRef.current.clientWidth;
                const maxWidth = Math.min(availableWidth, window.innerWidth - 40);
                const newWidth = Math.max(400, maxWidth);

                const availableHeight = window.innerHeight - 140;
                const maxHeight = Math.min(availableHeight, window.innerHeight * 0.8);
                const newHeight = Math.max(300, maxHeight);
                setContainerWidth(newWidth);
                setContainerHeight(newHeight);
            }
        };

        const resizeObserver = new ResizeObserver(() => {
            updateContainerSize();
        });

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        window.addEventListener('resize', updateContainerSize);

        updateContainerSize();

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('resize', updateContainerSize);
        };
    }, []);

    useEffect(() => {
        drawCanvas();
    }, [grid, drawCanvas]);

    useEffect(() => {
        document.addEventListener('mouseup', handleMouseUp);
        return () => document.removeEventListener('mouseup', handleMouseUp);
    }, [handleMouseUp]);

    useEffect(() => {
        if (isSimulating && intervalId) {
            clearInterval(intervalId);

            const newInterval = setInterval(() => {
                propagate();
            }, intervalSpeed);

            setIntervalId(newInterval);
        }
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [intervalSpeed]);
    
    // for autostart
    // useEffect(() => {
    //     if (CANVAS_WIDTH > 0 && CANVAS_HEIGHT > 0 && !hasAutoStarted) {
    //         setHasAutoStarted(true);
    //         simulate();
    //     }
    // }, [CANVAS_WIDTH, CANVAS_HEIGHT, hasAutoStarted, simulate]);

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                padding: '20px',
                boxSizing: 'border-box',
                flexDirection: 'column',
            }}
        >
            <div
                ref={containerRef}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%',
                    maxWidth: '100vw',
                    boxSizing: 'border-box',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
            >
                <div>
                    <canvas
                        ref={canvasRef}
                        width={CANVAS_WIDTH}
                        height={CANVAS_HEIGHT}
                        style={{
                            border: '2px solid #333',
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                            userSelect: 'none',
                            WebkitUserSelect: 'none',
                            display: 'block',
                            margin: '0 auto'
                        }}
                        onMouseDown={handleCanvasMouseDown}
                        onMouseMove={handleCanvasMouseMove}
                        onWheel={handleWheel}
                        onContextMenu={(e) => e.preventDefault()}
                        onDragStart={(e) => e.preventDefault()}
                    />
                </div>
            </div>

            <div style={{
                marginTop: '16px', display: 'flex', gap: '8px',
            }}>
                <button
                    onClick={resetGrid}
                    style={{
                        backgroundColor: 'white',
                        border: '1px solid black',
                        padding: '12px 16px',
                        cursor: 'pointer',
                        fontSize: '16px'
                    }}
                    title="Reset Grid"
                >
                    <FaTrash />
                </button>
                <button
                    onClick={() => { setIsDrawing(!isDrawing); }}
                    style={{
                        backgroundColor: 'white',
                        border: '1px solid black',
                        padding: '12px 16px',
                        cursor: 'pointer',
                        fontSize: '16px'
                    }}
                    title={isDrawing ? 'Switch to Erase Mode' : 'Switch to Draw Mode'}
                >
                    {isDrawing ? <FaEraser /> : <FaPencilAlt />}
                </button>
                <button
                    onClick={propagate}
                    style={{
                        backgroundColor: 'white',
                        border: '1px solid black',
                        padding: '12px 16px',
                        cursor: 'pointer',
                        fontSize: '16px'
                    }}
                    title="Next Generation"
                >
                    <FaStepForward />
                </button>
                <button
                    onClick={simulate}
                    style={{
                        backgroundColor: 'white',
                        border: '1px solid black',
                        padding: '12px 16px',
                        cursor: 'pointer',
                        fontSize: '16px'
                    }}
                    title={isSimulating ? 'Stop Simulation' : 'Start Simulation'}
                >
                    {isSimulating ? <FaStop /> : <FaPlay />}
                </button>
                <select
                    name="speed"
                    id="select-speed"
                    onChange={handleChangeSpeed}
                    value={intervalSpeed}
                    style={{
                        backgroundColor: 'white',
                        border: '1px solid black',
                        padding: '8px 12px',
                        cursor: 'pointer'
                    }}
                >
                    <option value={1000}>1x</option>
                    <option value={500}>5x</option>
                    <option value={100}>10x</option>
                    <option value={50}>20x</option>
                </select>
                <select
                    name="pattern"
                    id="select-pattern"
                    onChange={handlePatternChange}
                    style={{
                        backgroundColor: 'white',
                        border: '1px solid black',
                        padding: '8px 12px',
                        cursor: 'pointer'
                    }}
                    defaultValue=""
                >
                    <option value="">Select Pattern</option>
                    {PATTERNS.map((pattern, index) => (
                        <option key={index} value={pattern.name}>
                            {pattern.name}
                        </option>
                    ))}
                </select>
            </div>
            <div style={{
                marginTop: '16px',
                padding: '12px 20px',
                backgroundColor: '#f8f9fa',
                border: '2px solid #333',
                borderRadius: '8px',
                textAlign: 'center',
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#333',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                Generation: {generation}
            </div>
        </div>
    )
}

export default Grid
