import React, { useRef, useEffect } from 'react';

const KeywordConstellation = ({ keywords }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !keywords || keywords.length === 0) return;

    const ctx = canvas.getContext('2d');
    let width = canvas.width = canvas.parentElement.clientWidth;
    let height = canvas.height = 300;

    const nodes = [];
    const maxNodes = Math.min(keywords.length, 15); // Limit nodes for performance

    // Initialize Nodes
    for (let i = 0; i < maxNodes; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: i === 0 ? 8 : (Math.random() * 3 + 2), // First node is largest (topic)
        text: keywords[i],
        color: i === 0 ? '#06b6d4' : '#8b5cf6' // Cyan core, Violet orbiters
      });
    }

    // Force central node to the middle
    if (nodes.length > 0) {
      nodes[0].x = width / 2;
      nodes[0].y = height / 2;
      nodes[0].vx = 0;
      nodes[0].vy = 0;
    }

    let animationFrameId;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Update positions and bounce off walls
      for (let i = 1; i < nodes.length; i++) { // Skip index 0 (center)
        let node = nodes[i];
        
        // Slight gravitational pull towards center (index 0)
        const dx = nodes[0].x - node.x;
        const dy = nodes[0].y - node.y;
        node.vx += dx * 0.0001;
        node.vy += dy * 0.0001;

        node.x += node.vx;
        node.y += node.vy;

        if (node.x <= 0 || node.x >= width) node.vx *= -1;
        if (node.y <= 0 || node.y >= height) node.vy *= -1;
      }

      // Draw Lines
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(139, 92, 246, ${1 - dist / 150})`;
            ctx.lineWidth = 1;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw Nodes and Text
      nodes.forEach((node, i) => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        
        // Glow effect
        ctx.shadowColor = node.color;
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowColor = 'transparent'; // Reset

        // Draw Text
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = i === 0 ? "bold 14px 'Outfit', sans-serif" : "10px 'Outfit', sans-serif";
        ctx.textAlign = 'center';
        ctx.fillText(node.text, node.x, node.y - node.radius - 5);
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    // Handle Resize
    const handleResize = () => {
      width = canvas.width = canvas.parentElement.clientWidth;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [keywords]);

  return (
    <div className="w-full bg-dark-900/40 rounded-2xl overflow-hidden border border-brand-violet/20 relative shadow-inner">
      <div className="absolute top-4 left-4 z-10">
         <span className="text-[10px] bg-brand-violet/20 text-brand-violet-light border border-brand-violet/30 px-2 py-1 rounded shadow-sm font-bold tracking-widest uppercase">
            Semantic Orbit Map
         </span>
      </div>
      <canvas ref={canvasRef} className="w-full h-[300px] cursor-crosshair" />
    </div>
  );
};

export default KeywordConstellation;
