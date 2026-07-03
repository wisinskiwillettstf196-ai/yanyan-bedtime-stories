import { useEffect, useState } from "react";
import { goodnightWishes } from "../data/messages.js";
import { pickRandom } from "../utils/random.js";

export function GoodnightButton() {
  const [wish, setWish] = useState(null);

  useEffect(() => {
    if (!wish) return undefined;

    const closeTimer = window.setTimeout(() => setWish(null), 5600);
    const onKeyDown = (event) => {
      if (event.key === "Escape") setWish(null);
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(closeTimer);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [wish]);

  const openWish = () => {
    setWish(pickRandom(goodnightWishes));
  };

  return (
    <>
      <button className="goodnightButton" type="button" onClick={openWish}>
        ☾ 晚安
      </button>

      {wish && (
        <div className="wishLayer" role="dialog" aria-modal="true" onClick={() => setWish(null)}>
          <div className="wishCard" onClick={(event) => event.stopPropagation()}>
            <div className="wishMoon">☾</div>
            <div className="wishStars">
              <span>✦</span>
              <span>♥</span>
              <span>✧</span>
            </div>
            <p>{wish}</p>
            <button className="primaryButton" type="button" onClick={() => setWish(null)}>
              收好啦
            </button>
          </div>
        </div>
      )}
    </>
  );
}
