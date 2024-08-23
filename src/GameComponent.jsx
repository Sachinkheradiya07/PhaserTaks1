import React, { useState, useEffect } from "react";
import Phaser from "phaser";
import tickSoundFile from "./assets/clock.mp3"; // Use proper file import for Phaser

const GameComponent = () => {
  const [sessionId, setSessionId] = useState("");
  const [counter, setCounter] = useState(0);
  const [sessions, setSessions] = useState([]);
  const [game, setGame] = useState(null);

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: "phaser-game",
      scene: {
        preload,
        create,
        update,
      },
      physics: {
        default: "arcade",
        arcade: {
          gravity: { y: 0 },
        },
      },
    };

    const newGame = new Phaser.Game(config);
    setGame(newGame);

    return () => {
      if (newGame) {
        newGame.destroy(true);
      }
    };
  }, []);

  function preload() {
    // Load assets
    this.load.audio("tick", tickSoundFile); // Ensure proper file import
    this.load.image("ball", "./assets/ball.png");
    this.load.image("background", "./assets/background.png");

    // Handle file load events
    this.load.on("filecomplete", (key, type, data) => {
      console.log(`File complete: ${key}, Type: ${type}`);
    });

    this.load.on("fileerror", (file) => {
      console.error(`Failed to load file: ${file.key}`);
    });

    this.load.on("loaderror", (file) => {
      console.error(`Failed to process file: ${file.key}`);
    });
  }

  function create() {
    // Create game elements
    this.ball = this.physics.add.sprite(400, 300, "ball");
    this.ball.setCollideWorldBounds(true);
    this.ball.setBounce(1);

    // Initialize tick sound
    this.tickSound = this.sound.add("tick", { loop: true });

    console.log("Tick sound initialized successfully");
  }

  function update() {
    // Game update logic
  }

  const startSession = () => {
    if (game && game.scene.scenes[0]) {
      const scene = game.scene.scenes[0];
      const { tickSound, ball } = scene;

      if (tickSound) {
        console.log("Playing tick sound...");
        tickSound.play({ loop: true, volume: 1 });
      } else {
        console.error("Tick sound not initialized");
      }

      const newSessionId = Math.random().toString(36).substring(7);
      const randomCounter = Math.floor(Math.random() * 50) + 1;
      const startTime = new Date();

      setSessionId(newSessionId);
      setCounter(randomCounter);

      if (game && game.scene.isPaused()) {
        game.scene.resume();
      }

      if (ball) {
        const speedMultiplier = 1.5;

        ball.setVelocity(
          Phaser.Math.Between(-200 * speedMultiplier, 200 * speedMultiplier),
          Phaser.Math.Between(-200 * speedMultiplier, 200 * speedMultiplier)
        );
      }

      const interval = setInterval(() => {
        setCounter((prevCounter) => {
          if (prevCounter <= 1) {
            clearInterval(interval);
            const endTime = new Date();
            const sessionData = {
              sessionId: newSessionId,
              startTime,
              endTime,
            };
            setSessions((prevSessions) => [...prevSessions, sessionData]);

            if (game) {
              game.scene.pause();
              if (ball) {
                ball.setVelocity(0, 0);
              }
            }

            if (scene.tickSound) {
              scene.tickSound.stop();
            }
          }

          return prevCounter - 1;
        });
      }, 1000);
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <div className="left-panel">
        <p>Session ID: {sessionId}</p>
        <p>Time Left: {counter} seconds</p>
        <button onClick={startSession}>Start Session</button>
        <div id="phaser-game"></div>
      </div>
      <div className="right-panel" style={{ marginLeft: "20px" }}>
        <h3>Completed Sessions</h3>
        <ul>
          {sessions.map((session, index) => (
            <li key={index}>
              {session.sessionId} - Start:{" "}
              {session.startTime.toLocaleTimeString()} - End:{" "}
              {session.endTime.toLocaleTimeString()}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default GameComponent;
