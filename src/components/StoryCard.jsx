export function StoryCard({ story, liked, read, onLike, onOpen, featured = false }) {
  const onCardKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen();
    }
  };

  return (
    <article
      className={`storyCard ${featured ? "featured" : ""}`}
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={onCardKeyDown}
    >
      <div className="cardTopLine">
        <span className="tagBadge">{story.tag}</span>
        <button
          className={`heartButton ${liked ? "liked" : ""}`}
          type="button"
          aria-label={liked ? "取消喜欢" : "喜欢"}
          onClick={(event) => {
            event.stopPropagation();
            onLike();
          }}
        >
          ♥
        </button>
      </div>
      <h3>{story.title}</h3>
      <p>{story.summary}</p>
      <div className="cardMeta">
        <span>{story.readTime}</span>
        {read && <span className="readBadge">已读</span>}
      </div>
    </article>
  );
}
