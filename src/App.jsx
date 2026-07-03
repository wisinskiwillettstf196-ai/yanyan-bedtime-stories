import { useEffect, useMemo, useState } from "react";
import { stories } from "./data/stories.js";
import { loveNotes, themePalettes, welcomeMessages } from "./data/messages.js";
import { GoodnightButton } from "./components/GoodnightButton.jsx";
import { MusicPlayer } from "./components/MusicPlayer.jsx";
import { StarryBackground } from "./components/StarryBackground.jsx";
import { StoryCard } from "./components/StoryCard.jsx";
import { StoryReader } from "./components/StoryReader.jsx";
import { getTodayKey, pickRandom, stableIndexForDate } from "./utils/random.js";
import { addId, loadStoryState, saveStoryState, toggleId } from "./utils/storage.js";

const tagFilters = ["全部", "童话", "恋爱日常", "冒险", "悬疑"];

function normalizeStoredIds(ids, validIds) {
  return [...new Set(ids)].filter((id) => validIds.has(id));
}

function getRoute() {
  const hash = window.location.hash.replace(/^#/, "");
  return hash || "/";
}

function App() {
  const [route, setRoute] = useState(getRoute);
  const [storyState, setStoryState] = useState(loadStoryState);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("全部");
  const [notice, setNotice] = useState(null);

  const theme = useMemo(() => pickRandom(themePalettes), []);
  const welcome = useMemo(() => pickRandom(welcomeMessages), []);
  const validStoryIds = useMemo(() => new Set(stories.map((story) => story.id)), []);
  const todayStory = useMemo(
    () => stories[stableIndexForDate(new Date(), stories.length)],
    [],
  );

  useEffect(() => {
    const onHashChange = () => setRoute(getRoute());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    saveStoryState(storyState);
  }, [storyState]);

  const likedIds = useMemo(
    () => normalizeStoredIds(storyState.likedIds, validStoryIds),
    [storyState.likedIds, validStoryIds],
  );
  const readIds = useMemo(
    () => normalizeStoredIds(storyState.readIds, validStoryIds),
    [storyState.readIds, validStoryIds],
  );
  const likedSet = useMemo(() => new Set(likedIds), [likedIds]);
  const readSet = useMemo(() => new Set(readIds), [readIds]);

  useEffect(() => {
    if (
      likedIds.length !== storyState.likedIds.length ||
      readIds.length !== storyState.readIds.length
    ) {
      setStoryState({ likedIds, readIds });
    }
  }, [likedIds, readIds, storyState.likedIds.length, storyState.readIds.length]);

  const currentStoryId = route.match(/^\/story\/(.+)$/)?.[1];
  const currentStory = currentStoryId
    ? stories.find((story) => story.id === currentStoryId)
    : null;

  const navigate = (path) => {
    window.location.hash = path;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleLike = (storyId) => {
    setStoryState((current) => ({
      ...current,
      likedIds: toggleId(current.likedIds, storyId),
    }));
  };

  const markRead = (storyId) => {
    setStoryState((current) => ({
      ...current,
      readIds: addId(current.readIds, storyId),
    }));
  };

  const resetRead = () => {
    setStoryState((current) => ({ ...current, readIds: [] }));
    setNotice("已读记录已经清空，今晚又有新的梦可以抽啦。");
  };

  const openRandomStory = () => {
    const unreadStories = stories.filter((story) => !readSet.has(story.id));
    if (!unreadStories.length) {
      setNotice("妍妍已经把故事都读完啦，可以重置已读记录再抽新的梦。");
      return;
    }

    const nextStory = pickRandom(unreadStories);
    navigate(`/story/${nextStory.id}`);
  };

  const filteredStories = stories.filter((story) => {
    const query = search.trim().toLowerCase();
    const matchesTag = activeTag === "全部" || story.tag === activeTag;
    const matchesSearch =
      !query ||
      story.title.toLowerCase().includes(query) ||
      story.keywords.some((keyword) => keyword.toLowerCase().includes(query));

    return matchesTag && matchesSearch;
  });

  const likedStories = stories.filter((story) => likedSet.has(story.id));
  const readStories = stories.filter((story) => readSet.has(story.id));

  return (
    <div className="dreamApp" style={theme.vars}>
      <StarryBackground />
      <MusicPlayer />

      <div className="appShell">
        <header className="topBar">
          <button className="brandButton" type="button" onClick={() => navigate("/")}>
            <span className="brandMoon">☾</span>
            <span>
              <strong>妍妍的睡前故事小屋</strong>
              <small>{theme.name}</small>
            </span>
          </button>

          <nav className="navPills" aria-label="主导航">
            <button
              className={route === "/" ? "active" : ""}
              type="button"
              onClick={() => navigate("/")}
            >
              首页
            </button>
            <button
              className={route === "/library" ? "active" : ""}
              type="button"
              onClick={() => navigate("/library")}
            >
              故事库
            </button>
            <button
              className={route === "/box" ? "active" : ""}
              type="button"
              onClick={() => navigate("/box")}
            >
              盒子
            </button>
          </nav>
        </header>

        <main>
          {route === "/" && (
            <HomeView
              welcome={welcome}
              todayStory={todayStory}
              todayKey={getTodayKey()}
              readCount={readIds.length}
              likedCount={likedIds.length}
              onRandom={openRandomStory}
              onOpenStory={(id) => navigate(`/story/${id}`)}
              onOpenLibrary={() => navigate("/library")}
              onOpenBox={() => navigate("/box")}
              onLike={toggleLike}
              likedSet={likedSet}
              readSet={readSet}
            />
          )}

          {route === "/library" && (
            <LibraryView
              activeTag={activeTag}
              filteredStories={filteredStories}
              likedSet={likedSet}
              readSet={readSet}
              search={search}
              setActiveTag={setActiveTag}
              setSearch={setSearch}
              onLike={toggleLike}
              onOpenStory={(id) => navigate(`/story/${id}`)}
            />
          )}

          {route === "/box" && (
            <StoryBoxView
              likedStories={likedStories}
              readStories={readStories}
              likedSet={likedSet}
              readSet={readSet}
              onLike={toggleLike}
              onOpenStory={(id) => navigate(`/story/${id}`)}
              onResetRead={resetRead}
            />
          )}

          {currentStory && (
            <StoryReader
              key={currentStory.id}
              story={currentStory}
              liked={likedSet.has(currentStory.id)}
              read={readSet.has(currentStory.id)}
              onBack={() => navigate("/library")}
              onLike={() => toggleLike(currentStory.id)}
              onMarkRead={() => markRead(currentStory.id)}
            />
          )}

          {currentStoryId && !currentStory && (
            <section className="emptyState">
              <span>☁</span>
              <h1>这朵云没有找到故事</h1>
              <button className="primaryButton" type="button" onClick={() => navigate("/library")}>
                回到故事库
              </button>
            </section>
          )}
        </main>
      </div>

      <GoodnightButton />

      {notice && (
        <div className="noticeLayer" role="dialog" aria-modal="true">
          <div className="noticeCard">
            <span className="noticeGlow">✦</span>
            <p>{notice}</p>
            <div className="noticeActions">
              {readIds.length === stories.length && (
                <button className="secondaryButton" type="button" onClick={resetRead}>
                  重置已读
                </button>
              )}
              <button className="primaryButton" type="button" onClick={() => setNotice(null)}>
                知道啦
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function HomeView({
  welcome,
  todayStory,
  todayKey,
  readCount,
  likedCount,
  onRandom,
  onOpenStory,
  onOpenLibrary,
  onOpenBox,
  onLike,
  likedSet,
  readSet,
}) {
  const [loveNote, setLoveNote] = useState(null);

  const showLoveNote = () => {
    setLoveNote(pickRandom(loveNotes));
    window.setTimeout(() => setLoveNote(null), 2800);
  };

  return (
    <div className="pageStack">
      <section className="homeHero">
        <div className="heroConstellation" aria-label="小星星情话">
          {[0, 1, 2].map((star) => (
            <button
              className="heroStarButton"
              type="button"
              key={star}
              aria-label="点亮一句小情话"
              onClick={showLoveNote}
            >
              ✦
            </button>
          ))}
        </div>
        {loveNote && <div className="heroLoveNote">{loveNote}</div>}
        <div className="heroCopy">
          <p className="eyebrow">Tonight's tiny dream</p>
          <h1>{welcome}</h1>
          <p>这里收着只给妍妍的晚安故事，月亮会翻页，星星会小声鼓掌。</p>
        </div>
        <div className="quickActions">
          <button className="primaryButton" type="button" onClick={onRandom}>
            ✦ 随机一个梦
          </button>
          <button className="secondaryButton" type="button" onClick={onOpenLibrary}>
            故事库
          </button>
          <button className="secondaryButton" type="button" onClick={onOpenBox}>
            我的盒子
          </button>
        </div>
      </section>

      <section className="statsRow" aria-label="故事状态">
        <div>
          <strong>{readCount}</strong>
          <span>已读</span>
        </div>
        <div>
          <strong>{likedCount}</strong>
          <span>喜欢</span>
        </div>
        <div>
          <strong>{stories.length}</strong>
          <span>故事</span>
        </div>
      </section>

      <section className="sectionBlock">
        <div className="sectionTitle">
          <span>☾</span>
          <div>
            <h2>今日睡前故事</h2>
            <p>{todayKey}</p>
          </div>
        </div>
        <StoryCard
          story={todayStory}
          liked={likedSet.has(todayStory.id)}
          read={readSet.has(todayStory.id)}
          onLike={() => onLike(todayStory.id)}
          onOpen={() => onOpenStory(todayStory.id)}
          featured
        />
      </section>
    </div>
  );
}

function LibraryView({
  activeTag,
  filteredStories,
  likedSet,
  readSet,
  search,
  setActiveTag,
  setSearch,
  onLike,
  onOpenStory,
}) {
  return (
    <div className="pageStack">
      <section className="pageHeading">
        <p className="eyebrow">Story library</p>
        <h1>故事库</h1>
      </section>

      <section className="libraryTools">
        <label className="searchField">
          <span>⌕</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="搜索标题或关键词"
          />
        </label>
        <div className="tagFilters" aria-label="标签筛选">
          {tagFilters.map((tag) => (
            <button
              className={activeTag === tag ? "active" : ""}
              type="button"
              key={tag}
              onClick={() => setActiveTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      <section className="storyGrid">
        {filteredStories.map((story) => (
          <StoryCard
            key={story.id}
            story={story}
            liked={likedSet.has(story.id)}
            read={readSet.has(story.id)}
            onLike={() => onLike(story.id)}
            onOpen={() => onOpenStory(story.id)}
          />
        ))}
      </section>

      {!filteredStories.length && (
        <section className="emptyState">
          <span>✧</span>
          <h2>暂时没有找到这个梦</h2>
        </section>
      )}
    </div>
  );
}

function StoryBoxView({
  likedStories,
  readStories,
  likedSet,
  readSet,
  onLike,
  onOpenStory,
  onResetRead,
}) {
  return (
    <div className="pageStack">
      <section className="pageHeading">
        <p className="eyebrow">My little box</p>
        <h1>我的故事盒子</h1>
      </section>

      <section className="sectionBlock">
        <div className="sectionTitle withAction">
          <div>
            <h2>喜欢过的故事</h2>
            <p>{likedStories.length} 篇</p>
          </div>
        </div>
        <div className="storyGrid compact">
          {likedStories.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              liked={likedSet.has(story.id)}
              read={readSet.has(story.id)}
              onLike={() => onLike(story.id)}
              onOpen={() => onOpenStory(story.id)}
            />
          ))}
        </div>
        {!likedStories.length && <p className="softEmpty">还没有点亮爱心。</p>}
      </section>

      <section className="sectionBlock">
        <div className="sectionTitle withAction">
          <div>
            <h2>读完的故事</h2>
            <p>{readStories.length} 篇</p>
          </div>
          <button className="secondaryButton smallButton" type="button" onClick={onResetRead}>
            重置已读
          </button>
        </div>
        <div className="storyGrid compact">
          {readStories.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              liked={likedSet.has(story.id)}
              read={readSet.has(story.id)}
              onLike={() => onLike(story.id)}
              onOpen={() => onOpenStory(story.id)}
            />
          ))}
        </div>
        {!readStories.length && <p className="softEmpty">今晚还没有读完的故事。</p>}
      </section>
    </div>
  );
}

export default App;
