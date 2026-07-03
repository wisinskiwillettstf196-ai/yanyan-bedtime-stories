export function StoryReader({ story, liked, read, onBack, onLike, onMarkRead }) {
  return (
    <article className="readerWrap">
      <div className="readerToolbar">
        <button className="iconTextButton" type="button" onClick={onBack}>
          ← 故事库
        </button>
        <div className="readerActions">
          <button
            className={`heartButton large ${liked ? "liked" : ""}`}
            type="button"
            aria-label={liked ? "取消喜欢" : "喜欢"}
            onClick={onLike}
          >
            ♥
          </button>
          <button
            className={`secondaryButton smallButton ${read ? "isDone" : ""}`}
            type="button"
            onClick={onMarkRead}
          >
            {read ? "已读完" : "标记已读"}
          </button>
        </div>
      </div>

      <div className="readerPaper">
        <div className="readerHeader">
          <span className="tagBadge">{story.tag}</span>
          <h1>{story.title}</h1>
          <p>{story.summary}</p>
          <div className="readerMeta">
            <span>{story.readTime}</span>
            <span>{story.keywords.join(" · ")}</span>
          </div>
        </div>

        <div className="storyBody">
          {story.content.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <footer className="eggNote">
          <span>写给妍妍的晚安彩蛋</span>
          <p>{story.egg}</p>
        </footer>
      </div>
    </article>
  );
}
