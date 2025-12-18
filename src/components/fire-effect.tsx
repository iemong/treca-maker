import { useEffect, useRef } from "react";

export function FireEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    let animationFrameId: number;
    const particles: Particle[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = 300; // Height of the fire area
    };

    window.addEventListener("resize", resize);
    resize();

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      life: number;
      maxLife: number;
      color: string;

      constructor(canvasWidth: number, canvasHeight: number) {
        this.x = Math.random() * canvasWidth;
        this.y = canvasHeight;
        this.y = canvasHeight;
        this.size = Math.random() * 25 + 15; // Slightly larger
        this.speedX = (Math.random() - 0.5) * 2;
        this.speedY = Math.random() * -3 - 3; // Faster upward speed (-3 to -6)
        this.maxLife = Math.random() * 30 + 30; // 30 to 60 frames
        this.life = this.maxLife;

        // Randomly pick a fire color
        const colors = ["#ff4500", "#ff8c00", "#ffd700", "#ff0000"];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= 1;
        // Ensure size never becomes negative
        if (this.size > 0.5) {
          this.size -= 0.3; // Slower size decay
        } else {
          this.size = 0; // Clamp to 0
        }
      }

      draw(context: CanvasRenderingContext2D) {
        context.fillStyle = this.color;
        context.globalAlpha = this.life / this.maxLife;
        context.beginPath();
        // Ensure radius is positive
        const radius = Math.max(0, this.size);
        context.arc(this.x, this.y, radius, 0, Math.PI * 2);
        context.fill();
        context.globalAlpha = 1;
      }
    }

    const animate = () => {
      // Use a semi-transparent clear to create a trail effect
      // Use a semi-transparent clear to create a trail effect
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(0, 0, 0, 0.2)"; // Dark trail
      ctx.fillRect(0, 0, canvas.width, canvas.height); // fillRect instead of clearRect

      // Create a base heat gradient at the bottom so it never looks empty
      const baseGrad = ctx.createLinearGradient(
        0,
        canvas.height,
        0,
        canvas.height - 100
      );
      baseGrad.addColorStop(0, "rgba(255, 69, 0, 0.4)");
      baseGrad.addColorStop(1, "rgba(255, 69, 0, 0)");
      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, canvas.height - 100, canvas.width, 100);

      // Create new particles - increase count for density
      for (let i = 0; i < 8; i++) {
        particles.push(new Particle(canvas.width, canvas.height));
      }

      // Add a glow effect for particles
      ctx.globalCompositeOperation = "lighter";

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw(ctx);

        // Remove dead particles
        if (particles[i].life <= 0 || particles[i].size <= 0.1) {
          particles.splice(i, 1);
          i -= 1;
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      className="pointer-events-none absolute bottom-0 left-0 z-0 h-[300px] w-full"
      ref={canvasRef}
      style={{ filter: "blur(8px)" }}
    />
  );
}
