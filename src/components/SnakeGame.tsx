import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'motion/react';

type Point = { x: number; y: number };

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const INITIAL_SPEED = 150;

export default function SnakeGame({ onScoreChange }: { onScoreChange: (score: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [score, setScore] = useState(0);

  const directionRef = useRef<Point>(INITIAL_DIRECTION);
  const lastProcessedDirectionRef = useRef<Point>(INITIAL_DIRECTION);

  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // eslint-disable-next-line no-loop-func
      if (!currentSnake.some((segment) => segment.x === newFood.x && segment.y === newFood.y)) {
        break;
      }
    }
    return newFood;
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    directionRef.current = INITIAL_DIRECTION;
    lastProcessedDirectionRef.current = INITIAL_DIRECTION;
    setFood(generateFood(INITIAL_SNAKE));
    setGameOver(false);
    setScore(0);
    onScoreChange(0);
    setIsPaused(false);
    setHasStarted(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent scrolling
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === ' ' && gameOver) {
        resetGame();
        return;
      }

      if (e.key === ' ' && !gameOver && hasStarted) {
        setIsPaused(p => !p);
        return;
      }

      const currentDir = lastProcessedDirectionRef.current;
      let newDir = directionRef.current;
      let moved = false;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (currentDir.y !== 1) newDir = { x: 0, y: -1 };
          moved = true;
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (currentDir.y !== -1) newDir = { x: 0, y: 1 };
          moved = true;
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (currentDir.x !== 1) newDir = { x: -1, y: 0 };
          moved = true;
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (currentDir.x !== -1) newDir = { x: 1, y: 0 };
          moved = true;
          break;
      }

      if (moved && !isPaused && !gameOver) {
        directionRef.current = newDir;
        if (!hasStarted) {
            setHasStarted(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, isPaused, hasStarted, generateFood, onScoreChange]);

  const savedCallback = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    savedCallback.current = () => {
      const head = snake[0];
      const dir = directionRef.current;
      lastProcessedDirectionRef.current = dir;
      
      const newHead = { x: head.x + dir.x, y: head.y + dir.y };

      // Wall collision
      if (
        newHead.x < 0 ||
        newHead.x >= GRID_SIZE ||
        newHead.y < 0 ||
        newHead.y >= GRID_SIZE
      ) {
        setGameOver(true);
        return;
      }

      // Self collision
      if (snake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
        setGameOver(true);
        return;
      }

      const newSnake = [newHead, ...snake];

      // Food collision
      if (newHead.x === food.x && newHead.y === food.y) {
        const newScore = score + 10;
        setScore(newScore);
        onScoreChange(newScore);
        setFood(generateFood(newSnake));
        setSnake(newSnake);
      } else {
        newSnake.pop();
        setSnake(newSnake);
      }
    };
  });

  useEffect(() => {
    if (gameOver || isPaused || !hasStarted) return;

    const tick = () => {
      if (savedCallback.current) {
        savedCallback.current();
      }
    };

    const speed = Math.max(50, INITIAL_SPEED - Math.min(score, 100));
    const intervalId = setInterval(tick, speed);

    return () => clearInterval(intervalId);
  }, [gameOver, isPaused, hasStarted, score]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Responsive canvas
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cellSizeX = canvas.width / GRID_SIZE;
      const cellSizeY = canvas.height / GRID_SIZE;

      // Draw Grid (optional, for that brutalist/hardware look)
      ctx.strokeStyle = '#050510';
      ctx.lineWidth = 1;
      for (let i = 0; i <= GRID_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellSizeX, 0);
        ctx.lineTo(i * cellSizeX, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * cellSizeY);
        ctx.lineTo(canvas.width, i * cellSizeY);
        ctx.stroke();
      }

      // Draw Food
      ctx.fillStyle = '#ff00ff';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ff00ff';
      ctx.beginPath();
      const foodRadius = Math.min(cellSizeX, cellSizeY) / 2.5;
      ctx.arc(
        food.x * cellSizeX + cellSizeX / 2,
        food.y * cellSizeY + cellSizeY / 2,
        foodRadius,
        0,
        2 * Math.PI
      );
      ctx.fill();

      // Draw Snake
      snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#ffffff' : '#39ff14';
        ctx.shadowBlur = index === 0 ? 15 : 10;
        ctx.shadowColor = index === 0 ? '#ffffff' : '#39ff14';
        
        // Slight padding to show segments
        ctx.fillRect(
          segment.x * cellSizeX + 1,
          segment.y * cellSizeY + 1,
          cellSizeX - 2,
          cellSizeY - 2
        );
      });
      ctx.shadowBlur = 0;
    };

    draw();
  }, [snake, food]);

  return (
    <div className="relative w-full max-w-2xl mx-auto border-2 border-neon-cyan/50 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,255,255,0.2)] bg-neon-surface aspect-square flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={600}
        height={600}
        className="w-full h-full object-contain"
      />

      {!hasStarted && !gameOver && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm"
        >
          <h2 className="text-3xl text-neon-green tracking-[0.3em] font-bold mb-4 drop-shadow-[0_0_15px_rgba(57,255,20,1)] uppercase animate-pulse">Ready</h2>
          <p className="text-white font-mono tracking-widest text-sm uppercase opacity-80">Press any arrow key to start</p>
        </motion.div>
      )}

      {gameOver && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center backdrop-blur-sm"
        >
          <h2 className="text-4xl text-neon-pink font-bold mb-4 drop-shadow-[0_0_10px_rgba(255,0,255,0.8)]">SYSTEM FAILURE</h2>
          <p className="text-xl text-white font-mono mb-8">SCORE: {score}</p>
          <button 
            onClick={resetGame}
            className="px-8 py-3 outline outline-2 outline-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black font-bold uppercase transition-all shadow-[0_0_15px_rgba(0,255,255,0.5)]"
          >
            Reboot System
          </button>
        </motion.div>
      )}

      {isPaused && !gameOver && hasStarted && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
          <h2 className="text-3xl text-neon-green tracking-[0.2em] animate-pulse drop-shadow-[0_0_10px_rgba(57,255,20,0.8)]">PAUSED</h2>
        </div>
      )}
    </div>
  );
}
