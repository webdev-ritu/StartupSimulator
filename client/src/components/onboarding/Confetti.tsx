import { useEffect, useState } from 'react';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  color: string;
  xVelocity: number;
  yVelocity: number;
  rotationVelocity: number;
}

export function Confetti() {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  
  useEffect(() => {
    // Generate random confetti pieces
    const colors = [
      '#FF5252', // red
      '#448AFF', // blue
      '#B388FF', // purple
      '#FFD740', // yellow
      '#69F0AE', // green
      '#FF80AB', // pink
    ];
    
    const newPieces: ConfettiPiece[] = [];
    const piecesCount = 100;
    
    for (let i = 0; i < piecesCount; i++) {
      newPieces.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -20 - Math.random() * 100, // Start above the viewport
        size: 5 + Math.random() * 10,
        rotation: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
        xVelocity: -2 + Math.random() * 4,
        yVelocity: 3 + Math.random() * 5,
        rotationVelocity: -4 + Math.random() * 8,
      });
    }
    
    setPieces(newPieces);
    
    // Animation loop
    let animationFrameId: number;
    let lastTime = performance.now();
    
    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 16; // Normalize to ~60fps
      lastTime = currentTime;
      
      setPieces(prevPieces => {
        return prevPieces.map(piece => {
          // Update position and rotation
          const x = piece.x + piece.xVelocity * deltaTime;
          const y = piece.y + piece.yVelocity * deltaTime;
          const rotation = piece.rotation + piece.rotationVelocity * deltaTime;
          
          // Remove pieces that have fallen below the viewport
          if (y > window.innerHeight + 20) {
            return { ...piece, y: window.innerHeight + 50 }; // Move far below to be filtered out
          }
          
          return { ...piece, x, y, rotation };
        }).filter(piece => piece.y < window.innerHeight + 20);
      });
      
      // Continue animation if there are still pieces in the viewport
      if (pieces.length > 0) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };
    
    animationFrameId = requestAnimationFrame(animate);
    
    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {pieces.map(piece => (
        <div
          key={piece.id}
          className="absolute"
          style={{
            left: `${piece.x}px`,
            top: `${piece.y}px`,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotation}deg)`,
            opacity: 0.8,
          }}
        />
      ))}
    </div>
  );
}