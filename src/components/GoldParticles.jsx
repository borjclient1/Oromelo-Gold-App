import React, { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import { useTheme } from "../hooks/useTheme";

const GoldParticles = () => {
  const { darkMode } = useTheme();
  
  // Initialize the particles
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  // Optional callback when particles container is loaded
  const particlesLoaded = useCallback(async () => {
    // Container is loaded and ready
  }, []);

  return (
    <Particles
      id="gold-particles"
      className="absolute inset-0 z-0"
      init={particlesInit}
      loaded={particlesLoaded}
      options={{
        background: {
          color: {
            value: "transparent",
          },
        },
        fpsLimit: 60,
        interactivity: {
          events: {
            onHover: {
              enable: true,
              mode: "repulse",
            },
            resize: true,
          },
          modes: {
            repulse: {
              distance: 100,
              duration: 0.4,
            },
          },
        },
        particles: {
          color: {
            value: [
              "#FFD700", // Gold
              "#FFDF00", // Golden Yellow
              "#DAA520", // Goldenrod
              "#B8860B", // Dark Goldenrod
              "#FFC125", // Bright Gold
            ],
          },
          links: {
            color: "#FFD700",
            distance: 150,
            enable: true,
            opacity: 0.3,
            width: 1,
          },
          move: {
            direction: "none",
            enable: true,
            outModes: {
              default: "bounce",
            },
            random: false,
            speed: 0.6,
            straight: false,
          },
          number: {
            density: {
              enable: true,
              area: 800,
            },
            value: 40,
          },
          opacity: {
            value: {
              min: 0.1, 
              max: 0.4,
            },
            animation: {
              enable: true,
              speed: 0.5,
              minimumValue: 0.1,
              sync: false
            }
          },
          shape: {
            type: "circle",
          },
          size: {
            value: { min: 1, max: 4 },
          },
          shadow: {
            color: {
              value: "#FFD700"
            },
            blur: 5,
            enable: darkMode,
            offset: {
              x: 0,
              y: 0
            }
          }
        },
        detectRetina: true,
      }}
    />
  );
};

export default GoldParticles;
