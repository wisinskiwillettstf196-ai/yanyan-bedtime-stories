import { useEffect, useMemo, useState } from "react";
import { loveNotes } from "../data/messages.js";
import { pickRandom } from "../utils/random.js";

function createStars() {
  const count = window.innerWidth < 520 ? 18 : 26;

  return Array.from({ length: count }, (_, index) => ({
    id: index,
    left: 4 + Math.random() * 92,
    top: 4 + Math.random() * 68,
    size: 3 + Math.random() * 6,
    delay: Math.random() * 4,
  }));
}

function createFireflies() {
  const count = window.innerWidth < 520 ? 6 : 9;

  return Array.from({ length: count }, (_, index) => ({
    id: index,
    left: 8 + Math.random() * 84,
    top: 45 + Math.random() * 42,
    delay: Math.random() * 8,
  }));
}

export function StarryBackground() {
  const stars = useMemo(createStars, []);
  const fireflies = useMemo(createFireflies, []);
  const [note, setNote] = useState(null);
  const [sparkles, setSparkles] = useState([]);

  useEffect(() => {
    let lastSparkle = 0;

    const addSparkle = (clientX, clientY) => {
      const now = performance.now();
      if (now - lastSparkle < 76) return;
      lastSparkle = now;

      const id = `${now}-${Math.random()}`;
      setSparkles((current) =>
        [
          ...current.slice(-12),
          {
            id,
            x: clientX,
            y: clientY,
            size: 5 + Math.random() * 7,
          },
        ],
      );

      window.setTimeout(() => {
        setSparkles((current) => current.filter((sparkle) => sparkle.id !== id));
      }, 900);
    };

    const onPointerMove = (event) => addSparkle(event.clientX, event.clientY);
    const onTouchMove = (event) => {
      const touch = event.touches[0];
      if (touch) addSparkle(touch.clientX, touch.clientY);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  const showNote = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setNote({
      id: Math.random(),
      text: pickRandom(loveNotes),
      x: rect.left + rect.width / 2,
      y: rect.top,
    });

    window.setTimeout(() => setNote(null), 2600);
  };

  return (
    <div className="skyBackground" aria-hidden="true">
      <div className="moon" />
      <div className="cloud cloudOne" />
      <div className="cloud cloudTwo" />

      {stars.map((star) => (
        <button
          key={star.id}
          className="tapStar"
          type="button"
          onClick={showNote}
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: `${star.size * 5}px`,
            height: `${star.size * 5}px`,
            animationDelay: `${star.delay}s`,
          }}
          tabIndex={-1}
        >
          ✦
        </button>
      ))}

      {fireflies.map((firefly) => (
        <span
          key={firefly.id}
          className="firefly"
          style={{
            left: `${firefly.left}%`,
            top: `${firefly.top}%`,
            animationDelay: `${firefly.delay}s`,
          }}
        />
      ))}

      {note && (
        <div
          key={note.id}
          className="starNote"
          style={{ left: `${note.x}px`, top: `${note.y}px` }}
        >
          {note.text}
        </div>
      )}

      {sparkles.map((sparkle) => (
        <span
          key={sparkle.id}
          className="trailSparkle"
          style={{
            left: `${sparkle.x}px`,
            top: `${sparkle.y}px`,
            width: `${sparkle.size}px`,
            height: `${sparkle.size}px`,
          }}
        />
      ))}
    </div>
  );
}
