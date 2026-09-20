/* =====================================================================
   CLAYVE — ADVANCED APP SCRIPT
   Drop-in replacement for the original Clayve script.

   Keeps the original functionality while adding:
   - Persistent My List
   - Recently Viewed
   - Continue Watching
   - Watch progress
   - Search across title / genre / description
   - Search debounce
   - Toast notifications
   - Better keyboard accessibility
   - Modal focus trapping
   - URL deep linking
   - Better mobile behavior
   - Reduced-motion support
   - Safer dynamic HTML
   - Performance improvements
   ===================================================================== */

(() => {
  "use strict";

  /* ================================================================
     APP CONFIGURATION
     ================================================================ */

  const APP = {
    storageKey: "clayve:app:v2",

    searchDelay: 120,

    rowScrollAmount: 420,

    maxRecent: 8,

    maxHistory: 6,

    state: {
      myList: new Set(),
      recent: [],
      progress: {},
      searchHistory: [],
      theme: "dark"
    }
  };


  /* ================================================================
     1. MOVIE DATA
     ================================================================ */

  const movies = [

    {
      id: 1,
      title: "Silo",
      year: 2023,
      genre: "Sci-Fi",
      duration: "2h 18m",
      rating: 8.7,
      description:
        "When a signal from beyond the solar system starts rewriting Earth's skies, a grounded pilot and a reluctant scientist race to decode it before the horizon closes for good.",
      categories: ["trending", "action"],
      posterIcon: "🛰️",
      gradient: 1
    },

    {
      id: 2,
      title: "Velvet Noir",
      year: 2025,
      genre: "Mystery",
      duration: "1h 56m",
      rating: 8.4,
      description:
        "A jazz-club owner gets pulled into a decades-old disappearance when a stranger walks in humming a song no one outside the family should know.",
      categories: ["trending", "top-rated"],
      posterIcon: "🎷",
      gradient: 2
    },

    {
      id: 3,
      title: "The Ember Protocol",
      year: 2026,
      genre: "Thriller",
      duration: "2h 5m",
      rating: 7.9,
      description:
        "A disavowed analyst has twelve hours to stop a wildfire of misinformation before it burns down a fragile ceasefire.",
      categories: ["trending", "new", "action"],
      posterIcon: "🔥",
      gradient: 3
    },

    {
      id: 4,
      title: "Glass Kingdom",
      year: 2024,
      genre: "Fantasy",
      duration: "2h 22m",
      rating: 9.1,
      description:
        "In a city built entirely from enchanted glass, a young archivist discovers that every shattered window remembers what it once reflected.",
      categories: ["top-rated"],
      posterIcon: "🏰",
      gradient: 4
    },

    {
      id: 5,
      title: "Midnight Frequency",
      year: 2026,
      genre: "Horror",
      duration: "1h 48m",
      rating: 8.0,
      description:
        "A late-night radio host starts receiving calls from listeners who, records show, stopped existing years ago.",
      categories: ["new", "trending"],
      posterIcon: "📻",
      gradient: 5
    },

    {
      id: 6,
      title: "Iron Tide",
      year: 2023,
      genre: "War",
      duration: "2h 30m",
      rating: 8.6,
      description:
        "Two rival salvage crews are forced to work together when they surface a warship that was never supposed to be found.",
      categories: ["top-rated", "action"],
      posterIcon: "⚓",
      gradient: 6
    },

    {
      id: 7,
      title: "Neon Requiem",
      year: 2026,
      genre: "Sci-Fi",
      duration: "2h 10m",
      rating: 8.8,
      description:
        "In a city that never turns its lights off, a composer writing the last human symphony is hunted for the melody itself.",
      categories: ["new", "trending"],
      posterIcon: "🎹",
      gradient: 3
    },

    {
      id: 8,
      title: "Hollow Orbit",
      year: 2025,
      genre: "Adventure",
      duration: "2h 0m",
      rating: 7.7,
      description:
        "A salvage crew stranded on a derelict station discovers it isn't empty — and it's been expecting them.",
      categories: ["action", "new"],
      posterIcon: "🪐",
      gradient: 1
    },

    {
      id: 9,
      title: "Scarlet Fathom",
      year: 2024,
      genre: "Adventure",
      duration: "2h 8m",
      rating: 8.2,
      description:
        "A marine biologist chasing a myth finds a trench that shouldn't exist — and a reason it was hidden.",
      categories: ["top-rated"],
      posterIcon: "🌊",
      gradient: 2
    },

    {
      id: 10,
      title: "The Last Reel",
      year: 2026,
      genre: "Comedy",
      duration: "1h 52m",
      rating: 8.5,
      description:
        "A dying single-screen cinema gets one final shot at saving itself: a midnight screening nobody can agree on.",
      categories: ["new", "trending"],
      posterIcon: "🎞️",
      gradient: 4
    },

    {
      id: 11,
      title: "Paper Cartographer",
      year: 2023,
      genre: "Romance",
      duration: "2h 15m",
      rating: 8.9,
      description:
        "A mapmaker who has never left her village starts drawing places she's never seen — and they keep turning out to be real.",
      categories: ["top-rated"],
      posterIcon: "🗺️",
      gradient: 5
    },

    {
      id: 12,
      title: "Static Bloom",
      year: 2026,
      genre: "Mystery",
      duration: "1h 58m",
      rating: 7.8,
      description:
        "A sound engineer restoring old tapes keeps finding the same four seconds of static hidden underneath every one.",
      categories: ["new", "action"],
      posterIcon: "📼",
      gradient: 6
    }

  ];


  /* ================================================================
     2. DOM HELPERS
     ================================================================ */

  const $ = (selector, root = document) =>
    root.querySelector(selector);

  const $$ = (selector, root = document) =>
    [...root.querySelectorAll(selector)];

  const byId = (id) =>
    document.getElementById(id);

  const getMovie = (id) =>
    movies.find(movie => movie.id === Number(id));

  const isSaved = (id) =>
    APP.state.myList.has(Number(id));


  /* ================================================================
     3. SECURITY / HTML ESCAPING
     ================================================================ */

  function escapeHTML(value) {

    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  }


  /* ================================================================
     4. MOTION
     ================================================================ */

  function prefersReducedMotion() {

    return (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );

  }


  function scrollBehavior() {

    return prefersReducedMotion()
      ? "auto"
      : "smooth";

  }


  /* ================================================================
     5. LOCAL STORAGE
     ================================================================ */

  function safeStorageGet(key, fallback = null) {

    try {

      const raw = localStorage.getItem(key);

      return raw
        ? JSON.parse(raw)
        : fallback;

    } catch {

      return fallback;

    }

  }


  function safeStorageSet(key, value) {

    try {

      localStorage.setItem(
        key,
        JSON.stringify(value)
      );

    } catch {

      // App still works if storage is unavailable.

    }

  }


  function persistState() {

    safeStorageSet(APP.storageKey, {

      myList: [
        ...APP.state.myList
      ],

      recent: APP.state.recent,

      progress: APP.state.progress,

      searchHistory:
        APP.state.searchHistory,

      theme:
        APP.state.theme

    });

  }


  function restoreState() {

    const saved =
      safeStorageGet(
        APP.storageKey,
        {}
      );


    APP.state.myList =
      new Set(

        Array.isArray(saved?.myList)

          ? saved.myList
              .filter(id => getMovie(id))

          : []

      );


    APP.state.recent =
      Array.isArray(saved?.recent)

        ? saved.recent
            .filter(id => getMovie(id))
            .slice(0, APP.maxRecent)

        : [];


    APP.state.progress =
      saved?.progress &&
      typeof saved.progress === "object"

        ? saved.progress

        : {};


    APP.state.searchHistory =
      Array.isArray(saved?.searchHistory)

        ? saved.searchHistory
            .slice(0, APP.maxHistory)

        : [];


    APP.state.theme =
      saved?.theme === "light"
        ? "light"
        : "dark";

  }


  /* ================================================================
     6. ACCESSIBILITY LIVE REGION
     ================================================================ */

  function announce(message) {

    let live =
      byId("clayveLiveRegion");


    if (!live) {

      live =
        document.createElement("div");

      live.id =
        "clayveLiveRegion";

      live.setAttribute(
        "aria-live",
        "polite"
      );

      live.setAttribute(
        "aria-atomic",
        "true"
      );


      Object.assign(
        live.style,
        {

          position: "fixed",

          width: "1px",

          height: "1px",

          padding: "0",

          margin: "-1px",

          overflow: "hidden",

          clip: "rect(0,0,0,0)",

          whiteSpace: "nowrap",

          border: "0"

        }
      );


      document.body.appendChild(live);

    }


    live.textContent =
      message;

  }


  /* ================================================================
     7. TOAST NOTIFICATIONS
     ================================================================ */

  function toast(
    message,
    type = "default"
  ) {

    let container =
      byId("clayveToastContainer");


    if (!container) {

      container =
        document.createElement("div");

      container.id =
        "clayveToastContainer";

      container.setAttribute(
        "aria-live",
        "polite"
      );

      Object.assign(
        container.style,
        {

          position: "fixed",

          left: "50%",

          bottom: "24px",

          transform:
            "translateX(-50%)",

          zIndex: "99999",

          display: "grid",

          gap: "10px",

          width:
            "min(92vw, 420px)",

          pointerEvents:
            "none"

        }
      );


      document.body.appendChild(
        container
      );

    }


    const item =
      document.createElement("div");


    item.dataset.type =
      type;


    item.textContent =
      message;


    Object.assign(
      item.style,
      {

        pointerEvents: "auto",

        padding:
          "12px 16px",

        borderRadius:
          "14px",

        background:
          "rgba(20,20,24,.94)",

        color: "#fff",

        border:
          "1px solid rgba(255,255,255,.12)",

        boxShadow:
          "0 14px 40px rgba(0,0,0,.35)",

        backdropFilter:
          "blur(14px)",

        fontSize:
          "14px",

        lineHeight:
          "1.35",

        opacity: "0",

        transform:
          "translateY(8px)",

        transition:
          "opacity .2s ease, transform .2s ease"

      }
    );


    container.appendChild(item);


    requestAnimationFrame(() => {

      item.style.opacity = "1";

      item.style.transform =
        "translateY(0)";

    });


    setTimeout(() => {

      item.style.opacity = "0";

      item.style.transform =
        "translateY(8px)";


      setTimeout(() => {

        item.remove();

      }, 220);

    }, 2400);

  }


  /* ================================================================
     8. WATCH PROGRESS
     ================================================================ */

  function progressFor(movieId) {

    const value =
      Number(
        APP.state.progress[movieId]
      );


    if (!Number.isFinite(value))
      return 0;


    return Math.max(
      0,
      Math.min(100, value)
    );

  }

  /* ================================================================
     9. MOVIE CARD
     ================================================================ */

  function renderMovieCard(movie) {

    const saved =
      APP.state.myList.has(movie.id);

    const progress =
      progressFor(movie.id);

    return `
      <div
        class="movie-card"
        data-id="${movie.id}"
        tabindex="0"
        aria-label="Open ${escapeHTML(movie.title)}"
      >

        <div class="poster">

          <!-- My List -->
          <button
            class="list-toggle ${saved ? "is-active" : ""}"
            data-list-toggle="${movie.id}"
            aria-label="${
              saved
                ? `Remove ${escapeHTML(movie.title)} from My List`
                : `Add ${escapeHTML(movie.title)} to My List`
            }"
            aria-pressed="${saved}"
          >
            ${saved ? "♥" : "♡"}
          </button>


          <!-- Rating -->
          <span class="tag tag--solid poster-rating">
            ★ ${movie.rating}
          </span>


          <!-- Poster artwork -->
          <div
            class="poster-bg poster-g${movie.gradient}"
            aria-hidden="true"
          >
            ${movie.posterIcon}
          </div>


          <!-- Hover overlay -->
          <div
            class="poster-overlay"
            aria-hidden="true"
          ></div>


          <!-- Hover controls -->
          <div class="poster-hover">

            <button
              class="card-play"
              data-card-play="${movie.id}"
              aria-label="${
                progress > 0 && progress < 100
                  ? `Continue ${escapeHTML(movie.title)}`
                  : `Play ${escapeHTML(movie.title)}`
              }"
            >
              <span aria-hidden="true">▶</span>
            </button>


            <div
              class="card-hover-meta"
              aria-hidden="true"
            >
              <span>${escapeHTML(movie.duration)}</span>
              <span>•</span>
              <span>${escapeHTML(movie.genre)}</span>
            </div>

          </div>


          <!-- Bottom information -->
          <div class="poster-info">

            <div class="title">
              ${escapeHTML(movie.title)}
            </div>

            <div class="sub">
              ${movie.year} · ${escapeHTML(movie.genre)}
            </div>

          </div>


          ${
            progress > 0
              ? `
                <div
                  class="clayve-progress"
                  role="progressbar"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-valuenow="${progress}"
                  aria-label="${progress}% watched"
                >
                  <span
                    style="width:${progress}%"
                  ></span>
                </div>
              `
              : ""
          }

        </div>

      </div>
    `;
  }


  /* ================================================================
     10. EMPTY STATES
     ================================================================ */

  function renderEmpty(message) {

    return `
      <p class="mylist-empty">
        ${escapeHTML(message)}
      </p>
    `;

  }


  /* ================================================================
     11. MAIN MOVIE ROWS
     ================================================================ */

  function renderAllRows() {

    $$(".movie-row[data-category]")
      .forEach(row => {

        const category =
          row.dataset.category;


        if (
          category === "search" ||
          category === "recent" ||
          category === "continue"
        )
          return;


        const track =
          $(".movie-track", row);


        if (!track)
          return;


        const matches =
          movies.filter(
            movie =>
              movie.categories
                .includes(category)
          );


        track.innerHTML =
          matches.length

            ? matches
                .map(renderMovieCard)
                .join("")

            : renderEmpty(
                "Nothing here yet."
              );

      });

  }


  /* ================================================================
     12. MY LIST
     ================================================================ */

  function renderMyList() {

    const track =
      byId("mylistTrack");


    const emptyMsg =
      byId("mylistEmpty");


    if (!track)
      return;


    const saved =
      movies.filter(
        movie =>
          isSaved(movie.id)
      );


    track.innerHTML =
      saved
        .map(renderMovieCard)
        .join("");


    if (emptyMsg) {

      emptyMsg.hidden =
        saved.length > 0;

    }


    const count =
      byId("listCount");


    if (count) {

      count.textContent =
        APP.state.myList.size;

      count.hidden =
        APP.state.myList.size === 0;

    }

  }


  /* ================================================================
     13. RECENTLY VIEWED
     ================================================================ */

  function renderRecentRow() {

    const row =
      $('[data-category="recent"]');


    if (!row)
      return;


    const track =
      $(".movie-track", row);


    if (!track)
      return;


    const recentMovies =
      APP.state.recent
        .map(getMovie)
        .filter(Boolean);


    track.innerHTML =
      recentMovies.length

        ? recentMovies
            .map(renderMovieCard)
            .join("")

        : renderEmpty(
            "Movies you open will appear here."
          );

  }


  /* ================================================================
     14. CONTINUE WATCHING
     ================================================================ */

  function renderContinueWatching() {

    const row =
      $('[data-category="continue"]');


    if (!row)
      return;


    const track =
      $(".movie-track", row);


    if (!track)
      return;


    const continueMovies =
      movies.filter(movie => {

        const progress =
          progressFor(movie.id);

        return (
          progress > 0 &&
          progress < 100
        );

      });


    track.innerHTML =
      continueMovies.length

        ? continueMovies
            .map(renderMovieCard)
            .join("")

        : renderEmpty(
            "Start watching something and your progress will appear here."
          );

  }


  function renderEverything() {

    renderAllRows();

    renderMyList();

    renderRecentRow();

    renderContinueWatching();

  }


  /* ================================================================
     15. RECENT MOVIE TRACKING
     ================================================================ */

  function markRecent(movieId) {

    const id =
      Number(movieId);


    APP.state.recent = [

      id,

      ...APP.state.recent
        .filter(
          recentId =>
            recentId !== id
        )

    ].slice(
      0,
      APP.maxRecent
    );


    persistState();

    renderRecentRow();

  }


  /* ================================================================
     16. PLAY SIMULATION
     ================================================================ */

  function simulatePlay(movie) {

    const current =
      progressFor(movie.id);


    const next =
      current >= 95
        ? 100
        : Math.min(
            95,
            current + 10
          );


    APP.state.progress[movie.id] =
      next;


    persistState();

    renderEverything();


    if (next >= 100) {

      toast(
        `${movie.title} completed`,
        "success"
      );

      announce(
        `${movie.title} completed`
      );

    } else {

      toast(
        `Playing ${movie.title} · ${next}% watched`
      );

      announce(
        `Playing ${movie.title}, ${next}% watched`
      );

    }


    return next;

  }


  /* ================================================================
     17. MODAL
     ================================================================ */

  const modalOverlay =
    byId("movieModal");


  const modalContent =
    byId("modalContent");


  let modalLastFocused = null;

  let activeMovieId = null;


  function openModal(
    movieId,
    {
      updateHash = true
    } = {}
  ) {

    const movie =
      getMovie(movieId);


    if (
      !movie ||
      !modalOverlay ||
      !modalContent
    )
      return;


    activeMovieId =
      movie.id;


    modalLastFocused =
      document.activeElement;


    const saved =
      isSaved(movie.id);


    const progress =
      progressFor(movie.id);


    modalContent.innerHTML = `

      <div
        class="modal-banner poster-g${movie.gradient}"
      >

        <div>

          <div
            class="icon"
            aria-hidden="true"
          >
            ${movie.posterIcon}
          </div>

        </div>

      </div>


      <div class="modal-body">

        <h3 id="modalTitle">
          ${escapeHTML(movie.title)}
        </h3>


        <div class="modal-meta">

          <span class="tag">
            ${movie.year}
          </span>

          <span class="tag">
            ${escapeHTML(movie.genre)}
          </span>

          <span class="tag">
            ${escapeHTML(movie.duration)}
          </span>

          <span class="tag">
            ★ ${movie.rating}
          </span>

        </div>


        <p class="desc">
          ${escapeHTML(movie.description)}
        </p>


        ${
          progress > 0 &&
          progress < 100

            ? `

              <div
                class="clayve-modal-progress"
              >

                <div
                  style="width:${progress}%"
                ></div>

                <small>
                  ${progress}% watched
                </small>

              </div>

            `

            : ""
        }


        <div class="modal-actions">

          <button
            class="btn btn-primary"
            id="modalPlayBtn"
          >
            ▶ ${
              progress >= 95
                ? "Replay"
                : "Play"
            }
          </button>


          <button
            class="btn btn-secondary"
            data-list-toggle="${movie.id}"
            aria-pressed="${saved}"
          >

            ${
              saved
                ? "♥ In My List"
                : "♡ Add to My List"
            }

          </button>

        </div>

      </div>

    `;


    modalOverlay.classList.add(
      "is-open"
    );


    modalOverlay.setAttribute(
      "aria-hidden",
      "false"
    );


    document.body.style.overflow =
      "hidden";


    markRecent(movie.id);


    if (
      updateHash &&
      history.replaceState
    ) {

      history.replaceState(
        null,
        "",
        `#movie-${movie.id}`
      );

    }


    setTimeout(() => {

      byId("modalClose")?.focus();

    }, 0);

  }


  function closeModal(
    {
      clearHash = true
    } = {}
  ) {

    if (!modalOverlay)
      return;


    modalOverlay.classList.remove(
      "is-open"
    );


    modalOverlay.setAttribute(
      "aria-hidden",
      "true"
    );


    document.body.style.overflow =
      "";


    activeMovieId =
      null;


    if (
      clearHash &&
      location.hash.startsWith(
        "#movie-"
      ) &&
      history.replaceState
    ) {

      history.replaceState(
        null,
        "",
        location.pathname +
        location.search
      );

    }


    if (
      modalLastFocused &&
      typeof modalLastFocused.focus ===
        "function"
    ) {

      modalLastFocused.focus();

    }


    modalLastFocused =
      null;

  }


  /* ================================================================
     18. MODAL FOCUS TRAP
     ================================================================ */

  function trapModalFocus(event) {

    if (
      !modalOverlay?.classList.contains(
        "is-open"
      ) ||
      event.key !== "Tab"
    )
      return;


    const focusable =
      $$(
        `
        button:not([disabled]),
        [href],
        input:not([disabled]),
        select:not([disabled]),
        textarea:not([disabled]),
        [tabindex]:not([tabindex="-1"])
        `,
        modalOverlay
      );


    if (!focusable.length)
      return;


    const first =
      focusable[0];


    const last =
      focusable[
        focusable.length - 1
      ];


    if (
      event.shiftKey &&
      document.activeElement === first
    ) {

      event.preventDefault();

      last.focus();

    }


    else if (
      !event.shiftKey &&
      document.activeElement === last
    ) {

      event.preventDefault();

      first.focus();

    }

  }


  /* ================================================================
     19. MY LIST TOGGLE
     ================================================================ */

  function toggleMyList(movieId) {

    const id =
      Number(movieId);


    const movie =
      getMovie(id);


    if (!movie)
      return;


    const adding =
      !APP.state.myList.has(id);


    if (adding) {

      APP.state.myList.add(id);


      toast(
        `${movie.title} added to My List`,
        "success"
      );


      announce(
        `${movie.title} added to My List`
      );

    }

    else {

      APP.state.myList.delete(id);


      toast(
        `${movie.title} removed from My List`
      );


      announce(
        `${movie.title} removed from My List`
      );

    }


    persistState();

    renderEverything();


    if (
      modalOverlay?.classList.contains(
        "is-open"
      ) &&
      activeMovieId === id
    ) {

      openModal(
        id,
        {
          updateHash: false
        }
      );

    }

  }


  /* ================================================================
     20. SEARCH
     ================================================================ */

  const searchInput =
    byId("searchInput");


  const searchRow =
    byId("searchRow");


  const searchTrack =
    searchRow?.querySelector(
      ".movie-track"
    );


  let searchTimer = 0;


  function saveSearch(query) {

    const clean =
      query.trim();


    if (!clean)
      return;


    APP.state.searchHistory = [

      clean,

      ...APP.state.searchHistory
        .filter(
          item =>
            item.toLowerCase() !==
            clean.toLowerCase()
        )

    ].slice(
      0,
      APP.maxHistory
    );


    persistState();

  }


  function runSearch(rawQuery) {

    const query =
      rawQuery
        .trim()
        .toLowerCase();


    if (
      !searchRow ||
      !searchTrack
    )
      return;


    if (!query) {

      searchRow.hidden =
        true;

      searchTrack.innerHTML =
        "";

      return;

    }


    const results =
      movies.filter(movie =>

        movie.title
          .toLowerCase()
          .includes(query)

        ||

        movie.genre
          .toLowerCase()
          .includes(query)

        ||

        movie.description
          .toLowerCase()
          .includes(query)

      );


    searchRow.hidden =
      false;


    searchTrack.innerHTML =
      results.length

        ? results
            .map(renderMovieCard)
            .join("")

        : renderEmpty(
            `No titles match "${rawQuery.trim()}".`
          );


    announce(
      `${results.length} ${
        results.length === 1
          ? "result"
          : "results"
      } for ${rawQuery.trim()}`
    );

  }


  function handleSearchInput(event) {

    clearTimeout(
      searchTimer
    );


    const value =
      event.target.value;


    searchTimer =
      setTimeout(() => {

        runSearch(value);


        if (
          value.trim()
        ) {

          saveSearch(value);

        }

      }, APP.searchDelay);

  }


   /* ================================================================
     21. GLOBAL CLICK HANDLER
     ================================================================ */

  document.addEventListener(
    "click",
    event => {

      /* ------------------------------------------------------------
         My List
         ------------------------------------------------------------ */

      const toggle =
        event.target.closest?.(
          "[data-list-toggle]"
        );


      if (toggle) {

        event.preventDefault();

        event.stopPropagation();

        toggleMyList(
          toggle.dataset.listToggle
        );

        return;

      }


      /* ------------------------------------------------------------
         Movie Card Play Button
         ------------------------------------------------------------ */

      const cardPlay =
        event.target.closest?.(
          "[data-card-play]"
        );


      if (cardPlay) {

        event.preventDefault();

        event.stopPropagation();


        const movie =
          getMovie(
            cardPlay.dataset.cardPlay
          );


        if (!movie)
          return;


        markRecent(movie.id);

        simulatePlay(movie);


        return;

      }


      /* ------------------------------------------------------------
         Modal Play
         ------------------------------------------------------------ */

      const play =
        event.target.closest?.(
          "#modalPlayBtn"
        );


      if (
        play &&
        activeMovieId
      ) {

        event.preventDefault();


        const movie =
          getMovie(
            activeMovieId
          );


        if (movie) {

          simulatePlay(movie);

        }


        return;

      }


      /* ------------------------------------------------------------
         Movie Card
         ------------------------------------------------------------ */

      const card =
        event.target.closest?.(
          ".movie-card"
        );


      if (
        card &&
        !event.target.closest(
          "button, a, input, select, textarea"
        )
      ) {

        openModal(
          card.dataset.id
        );

      }

    }
  );

  /* ================================================================
     22. KEYBOARD CONTROLS
     ================================================================ */

  document.addEventListener(
    "keydown",
    event => {

      trapModalFocus(event);


      if (
        event.key === "Escape"
      ) {

        closeModal();

        return;

      }


      const card =
        event.target.closest?.(
          ".movie-card"
        );


      if (
        card &&
        (
          event.key === "Enter" ||
          event.key === " "
        )
      ) {

        event.preventDefault();


        openModal(
          card.dataset.id
        );

      }

    }
  );


  /* ================================================================
     23. MODAL CLOSE
     ================================================================ */

  byId("modalClose")
    ?.addEventListener(
      "click",
      () => closeModal()
    );


  modalOverlay
    ?.addEventListener(
      "click",
      event => {

        if (
          event.target ===
          modalOverlay
        ) {

          closeModal();

        }

      }
    );

  /* ================================================================
     24. ROW SCROLLING
     ================================================================ */

  $$(".row-arrow")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const row =
            button.closest(".movie-row");

          const track =
            row?.querySelector(".movie-track");

          if (!track)
            return;

          track.scrollBy({
            left: APP.rowScrollAmount,
            behavior: scrollBehavior()
          });

        }
      );

    });



  /* ================================================================
     25. NAVBAR
     ================================================================ */

  const navbar =
    byId("navbar");


  const menuToggle =
    byId("menuToggle");


  const mobileMenu =
    byId("mobileMenu");


  let scrollTicking =
    false;


  window.addEventListener(
    "scroll",
    () => {

      if (
        scrollTicking
      )
        return;


      scrollTicking =
        true;


      requestAnimationFrame(
        () => {

          navbar?.classList.toggle(
            "is-scrolled",
            window.scrollY > 12
          );


          scrollTicking =
            false;

        }
      );

    },
    {
      passive: true
    }
  );


  /* ================================================================
     26. MOBILE MENU
     ================================================================ */

  menuToggle
    ?.addEventListener(
      "click",
      () => {

        const isOpen =
          mobileMenu
            ?.classList
            .toggle(
              "is-open"
            ) ?? false;


        menuToggle.setAttribute(
          "aria-expanded",
          String(isOpen)
        );


        document.body.classList.toggle(
          "menu-open",
          isOpen
        );

      }
    );


  $$("#mobileMenu a")
    .forEach(link => {

      link.addEventListener(
        "click",
        () => {

          mobileMenu
            ?.classList
            .remove(
              "is-open"
            );


          menuToggle
            ?.setAttribute(
              "aria-expanded",
              "false"
            );


          document.body.classList.remove(
            "menu-open"
          );

        }
      );

    });


  /* ================================================================
     27. ACTIVE NAVIGATION
     ================================================================ */

  const sections =
    $$(
      "main > section[id], .hero[id]"
    );


  const navLinks =
    $$('.nav-links a[data-scroll]');


  if (
    "IntersectionObserver"
    in window
  ) {

    const sectionObserver =
      new IntersectionObserver(

        entries => {

          entries.forEach(
            entry => {

              if (
                !entry.isIntersecting
              )
                return;


              navLinks.forEach(
                link => {

                  link.classList.toggle(

                    "active",

                    link.getAttribute(
                      "href"
                    ) ===
                    `#${entry.target.id}`

                  );

                }
              );

            }
          );

        },

        {
          rootMargin:
            "-45% 0px -50% 0px"
        }

      );


    sections.forEach(
      section =>
        sectionObserver.observe(
          section
        )
    );

  }


  /* ================================================================
     28. HERO BUTTONS
     ================================================================ */

  byId("heroPlayBtn")
    ?.addEventListener(
      "click",
      () => openModal(1)
    );


  byId("heroInfoBtn")
    ?.addEventListener(
      "click",
      () => openModal(1)
    );


  /* ================================================================
     29. SEARCH EVENTS
     ================================================================ */

  searchInput
    ?.addEventListener(
      "input",
      handleSearchInput
    );


  searchInput
    ?.addEventListener(
      "keydown",
      event => {

        if (
          event.key === "Escape"
        ) {

          searchInput.value =
            "";

          runSearch("");

          searchInput.blur();

        }


        if (
          event.key === "Enter"
        ) {

          saveSearch(
            searchInput.value
          );


          runSearch(
            searchInput.value
          );

        }

      }
    );


  /* ================================================================
     30. DEEP LINKING
     ================================================================ */

  function handleHash() {

    const match =
      location.hash.match(
        /^#movie-(\d+)$/
      );


    if (match) {

      openModal(
        Number(match[1]),
        {
          updateHash: false
        }
      );

    }

  }


  window.addEventListener(
    "hashchange",
    handleHash
  );

/* ================================================================
   PROFILE MENU — v2.5
   ================================================================ */

const profileMenu = $(".profile-menu");
const profileButton = $("#profileButton");

const profileName = $("#profileName");
const profileStatus = $("#profileStatus");
const profileAvatar = $("#profileAvatar");

const profileLoginOption = $("#profileLoginOption");
const profileLogoutOption = $("#profileLogoutOption");

const ACCOUNT_STORAGE_KEY =
  "clayve:account:v1";


let account = {
  loggedIn: false,
  name: "Guest",
  email: ""
};


/* ---------------------------------------------------------------
   ACCOUNT STORAGE
   --------------------------------------------------------------- */

function loadAccount() {

  try {

    const saved =
      localStorage.getItem(
        ACCOUNT_STORAGE_KEY
      );

    if (!saved)
      return;

    const parsed =
      JSON.parse(saved);

    if (
      parsed &&
      typeof parsed === "object"
    ) {

      account = {
        loggedIn:
          Boolean(parsed.loggedIn),

        name:
          parsed.name ||
          "Guest",

        email:
          parsed.email ||
          ""
      };

    }

  } catch (error) {

    console.warn(
      "Clayve account restore failed:",
      error
    );

  }

}


function saveAccount() {

  try {

    localStorage.setItem(
      ACCOUNT_STORAGE_KEY,
      JSON.stringify(account)
    );

  } catch (error) {

    console.warn(
      "Clayve account save failed:",
      error
    );

  }

}


/* ---------------------------------------------------------------
   PROFILE UI
   --------------------------------------------------------------- */

function updateProfileUI() {

  if (!profileName || !profileStatus || !profileAvatar)
    return;


  if (account.loggedIn) {

    const name =
      account.name ||
      "Clayve User";

    const initial =
      name
        .trim()
        .charAt(0)
        .toUpperCase();


    profileName.textContent =
      name;

    profileStatus.textContent =
      "Signed in to Clayve";

    profileAvatar.textContent =
      initial;

    profileButton.textContent =
      initial;


    if (profileLoginOption)
      profileLoginOption.style.display =
        "none";

    if (profileLogoutOption)
      profileLogoutOption.style.display =
        "flex";

  } else {

    profileName.textContent =
      "Guest";

    profileStatus.textContent =
      "Sign in to personalize Clayve";

    profileAvatar.textContent =
      "G";

    profileButton.textContent =
      "G";


    if (profileLoginOption)
      profileLoginOption.style.display =
        "flex";

    if (profileLogoutOption)
      profileLogoutOption.style.display =
        "none";

  }

}

/* ---------------------------------------------------------------
   PROFILE DROPDOWN
   --------------------------------------------------------------- */

if (profileMenu && profileButton) {

  profileButton.addEventListener(
    "click",
    (event) => {

      event.stopPropagation();

      const isOpen =
        profileMenu.classList.toggle(
          "open"
        );

      profileButton.setAttribute(
        "aria-expanded",
        String(isOpen)
      );

    }
  );


  document.addEventListener(
    "click",
    (event) => {

      if (
        !profileMenu.contains(
          event.target
        )
      ) {

        profileMenu.classList.remove(
          "open"
        );

        profileButton.setAttribute(
          "aria-expanded",
          "false"
        );

      }

    }
  );

}


/* ---------------------------------------------------------------
   PROFILE OVERLAY
   --------------------------------------------------------------- */

function removeProfileOverlay() {

  const overlay =
    $("#profileOverlay");

  if (overlay)
    overlay.remove();

}


function createProfileOverlay(
  title,
  content
) {

  removeProfileOverlay();

  const overlay =
    document.createElement("div");

  overlay.className =
    "profile-overlay";

  overlay.id =
    "profileOverlay";

  overlay.innerHTML = `

    <div
      class="profile-panel"
      role="dialog"
      aria-modal="true"
    >

      <button
        class="profile-panel-close"
        type="button"
        aria-label="Close"
        id="profilePanelClose"
      >
        ×
      </button>

      <div class="profile-panel-content">

        <div class="profile-panel-brand">
          <span class="profile-panel-logo">
            C
          </span>

          <span>
            CLAYVE
          </span>
        </div>

        <h2>
          ${title}
        </h2>

        ${content}

      </div>

    </div>

  `;

  document.body.appendChild(
    overlay
  );


  requestAnimationFrame(() => {

    overlay.classList.add(
      "visible"
    );

  });


  const closeButton =
    $("#profilePanelClose");

  closeButton?.addEventListener(
    "click",
    removeProfileOverlay
  );


  overlay.addEventListener(
    "click",
    (event) => {

      if (
        event.target === overlay
      ) {

        removeProfileOverlay();

      }

    }
  );

}


/* ---------------------------------------------------------------
   LOG IN
   --------------------------------------------------------------- */

function openLoginPanel() {

  createProfileOverlay(
    "Welcome back",
    `

      <p class="profile-panel-subtitle">
        Sign in to continue watching and
        keep your Clayve experience personal.
      </p>

      <form
        class="profile-form"
        id="clayveLoginForm"
      >

        <label>
          Email
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            required
          >
        </label>

        <label>
          Password
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            required
          >
        </label>

        <button
          type="submit"
          class="profile-submit"
        >
          Log In
        </button>

      </form>

      <p class="profile-switch">

        Don't have an account?

        <button
          type="button"
          id="openSignup"
        >
          Sign Up
        </button>

      </p>

    `
  );


  const form =
    $("#clayveLoginForm");

  form?.addEventListener(
    "submit",
    (event) => {

      event.preventDefault();

      const formData =
        new FormData(form);

      const email =
        String(
          formData.get("email") || ""
        ).trim();

      const password =
        String(
          formData.get("password") || ""
        );

      if (
        !email ||
        !password
      )
        return;


      /*
       * Front-end account simulation.
       * No real authentication server
       * is connected yet.
       */

      const storedAccount =
        localStorage.getItem(
          "clayve:registered-account"
        );


      let name =
        email
          .split("@")[0]
          .replace(/[._-]+/g, " ")
          .replace(/\b\w/g, letter =>
            letter.toUpperCase()
          );


      if (storedAccount) {

        try {

          const parsed =
            JSON.parse(
              storedAccount
            );

          if (
            parsed.email === email
          ) {

            name =
              parsed.name ||
              name;

          }

        } catch (error) {}

      }


      account = {

        loggedIn: true,

        name,

        email

      };


      saveAccount();

      updateProfileUI();

      removeProfileOverlay();

      showToast(
        `Welcome back, ${name}`
      );

    }
  );


  $("#openSignup")?.addEventListener(
    "click",
    openSignupPanel
  );

}


/* ---------------------------------------------------------------
   SIGN UP
   --------------------------------------------------------------- */

function openSignupPanel() {

  createProfileOverlay(
    "Create your account",
    `

      <p class="profile-panel-subtitle">
        Create your Clayve profile and keep
        your watch experience in one place.
      </p>

      <form
        class="profile-form"
        id="clayveSignupForm"
      >

        <label>
          Name

          <input
            type="text"
            name="name"
            placeholder="Your name"
            required
          >

        </label>

        <label>
          Email

          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            required
          >

        </label>

        <label>
          Password

          <input
            type="password"
            name="password"
            placeholder="Create a password"
            minlength="6"
            required
          >

        </label>

        <button
          type="submit"
          class="profile-submit"
        >
          Create Account
        </button>

      </form>

      <p class="profile-switch">

        Already have an account?

        <button
          type="button"
          id="openLogin"
        >
          Log In
        </button>

      </p>

    `
  );


  const form =
    $("#clayveSignupForm");


  form?.addEventListener(
    "submit",
    (event) => {

      event.preventDefault();

      const formData =
        new FormData(form);

      const name =
        String(
          formData.get("name") || ""
        ).trim();

      const email =
        String(
          formData.get("email") || ""
        ).trim();

      const password =
        String(
          formData.get("password") || ""
        );


      if (
        !name ||
        !email ||
        !password
      )
        return;


      localStorage.setItem(
        "clayve:registered-account",
        JSON.stringify({

          name,

          email,

          password

        })
      );


      account = {

        loggedIn: true,

        name,

        email

      };


      saveAccount();

      updateProfileUI();

      removeProfileOverlay();

      showToast(
        `Welcome to Clayve, ${name}`
      );

    }
  );


  $("#openLogin")?.addEventListener(
    "click",
    openLoginPanel
  );

}


/* ---------------------------------------------------------------
   WATCH HISTORY
   --------------------------------------------------------------- */

function openWatchHistory() {

  if (!account.loggedIn) {

    createProfileOverlay(
      "You're browsing as a guest",
      `

        <p class="profile-panel-subtitle">
          Sign in to keep your Clayve watch
          history connected to your profile.
        </p>

        <button
          class="profile-submit"
          type="button"
          id="historyLoginButton"
        >
          Log In
        </button>

      `
    );


    $("#historyLoginButton")?.addEventListener(
      "click",
      openLoginPanel
    );

    return;

  }


  const recentMovies =
    Array.isArray(APP.state.recent)
      ? APP.state.recent
      : [];


  const movies =
    recentMovies
      .map(id => getMovie(id))
      .filter(Boolean);


  const historyHTML =
    movies.length

      ? `

        <div class="profile-history-list">

          ${movies.map(movie => `

            <button
              type="button"
              class="profile-history-item"
              data-history-movie="${movie.id}"
            >

              <div
                class="profile-history-poster"
                style="
                  background-image:
                  url('${escapeHTML(movie.poster)}');
                "
              ></div>

              <div class="profile-history-info">

                <strong>
                  ${escapeHTML(movie.title)}
                </strong>

                <span>
                  ${escapeHTML(movie.year || "")}
                </span>

              </div>

            </button>

          `).join("")}

        </div>

      `

      : `

        <div class="profile-empty-history">

          <span>
            ◷
          </span>

          <strong>
            Nothing here yet
          </strong>

          <p>
            Movies you watch will appear
            in your history.
          </p>

        </div>

      `;


  createProfileOverlay(
    "Watch History",
    historyHTML
  );


  $$(".profile-history-item")
    .forEach(item => {

      item.addEventListener(
        "click",
        () => {

          const movie =
            getMovie(
              item.dataset.historyMovie
            );

          removeProfileOverlay();

          if (movie)
            openMovie(movie);

        }
      );

    });

}


/* ---------------------------------------------------------------
   SETTINGS
   --------------------------------------------------------------- */

function openSettings() {

  createProfileOverlay(
    "Settings",
    `

      <div class="profile-settings">

        <div class="profile-setting-row">

          <div>

            <strong>
              Account
            </strong>

            <span>
              ${
                account.loggedIn
                  ? escapeHTML(account.email)
                  : "Guest account"
              }
            </span>

          </div>

        </div>


        <div class="profile-setting-row">

          <div>

            <strong>
              Reduced Motion
            </strong>

            <span>
              Respect your device preference
            </span>

          </div>

          <span class="profile-setting-state">
            ${
              window.matchMedia(
                "(prefers-reduced-motion: reduce)"
              ).matches
                ? "On"
                : "Off"
            }
          </span>

        </div>


        <div class="profile-setting-row">

          <div>

            <strong>
              My List
            </strong>

            <span>
              ${
                APP.state.myList.length
              } saved ${
                APP.state.myList.length === 1
                  ? "title"
                  : "titles"
              }
            </span>

          </div>

        </div>


        <button
          type="button"
          class="profile-settings-close"
          id="settingsDone"
        >
          Done
        </button>

      </div>

    `
  );


  $("#settingsDone")?.addEventListener(
    "click",
    removeProfileOverlay
  );

}


/* ---------------------------------------------------------------
   PROFILE ACTIONS
   --------------------------------------------------------------- */

if (profileMenu) {

  profileMenu.addEventListener(
    "click",
    (event) => {

      const option =
        event.target.closest(
          "[data-profile-action]"
        );

      if (!option)
        return;


      const action =
        option.dataset.profileAction;


      profileMenu.classList.remove(
        "open"
      );

      profileButton?.setAttribute(
        "aria-expanded",
        "false"
      );


      if (action === "login") {

        openLoginPanel();

      }


      if (action === "history") {

        openWatchHistory();

      }


      if (action === "settings") {

        openSettings();

      }


      if (action === "logout") {

        account = {

          loggedIn: false,

          name: "Guest",

          email: ""

        };


        saveAccount();

        updateProfileUI();

        showToast(
          "You have been logged out"
        );

      }

    }
  );

}


/* ---------------------------------------------------------------
   ACCOUNT INITIALIZATION
   --------------------------------------------------------------- */

loadAccount();

updateProfileUI();
  /* ================================================================
     31. APP ENHANCEMENT CSS
     ================================================================ */

  function injectAppStyles() {

    if (
      byId("clayveAppStyles")
    )
      return;


    const style =
      document.createElement(
        "style"
      );


    style.id =
      "clayveAppStyles";


    style.textContent = `

      .movie-card {

        outline: none;

        position: relative;

      }


      .movie-card:focus-visible {

        box-shadow:
          0 0 0 3px
          rgba(255,255,255,.85);

        border-radius: 12px;

      }


      .movie-card.is-saved
      .poster {

        box-shadow:
          0 0 0 1px
          rgba(255,255,255,.14);

      }


      .clayve-progress {

        position: absolute;

        left: 8px;

        right: 8px;

        bottom: 7px;

        height: 3px;

        border-radius: 99px;

        background:
          rgba(255,255,255,.18);

        overflow: hidden;

        z-index: 4;

      }


      .clayve-progress span {

        display: block;

        height: 100%;

        background:
          currentColor;

        border-radius: inherit;

      }


      .clayve-modal-progress {

        display: grid;

        gap: 6px;

        margin: 14px 0;

      }


      .clayve-modal-progress > div {

        height: 4px;

        border-radius: 99px;

        background:
          currentColor;

        opacity: .85;

      }


      .clayve-modal-progress small {

        opacity: .65;

      }


      @media
      (prefers-reduced-motion: reduce) {

        *,

        *::before,

        *::after {

          scroll-behavior:
            auto !important;

          animation-duration:
            .001ms !important;

          animation-iteration-count:
            1 !important;

          transition-duration:
            .001ms !important;

        }

      }

    `;


    document.head.appendChild(
      style
    );

  }


  /* ================================================================
     32. INITIALIZATION
     ================================================================ */

  function init() {

    restoreState();


    injectAppStyles();


    renderEverything();


    handleHash();


    if (searchRow) {

      searchRow.hidden =
        true;

    }


    if (modalOverlay) {

      modalOverlay.setAttribute(
        "role",
        "dialog"
      );


      modalOverlay.setAttribute(
        "aria-modal",
        "true"
      );


      modalOverlay.setAttribute(
        "aria-hidden",
        "true"
      );

    }


    menuToggle
      ?.setAttribute(
        "aria-expanded",
        "false"
      );


    /* ------------------------------------------------------------
       Smooth anchor navigation
       ------------------------------------------------------------ */

    $$(
      'a[href^="#"]'
    ).forEach(link => {

      link.addEventListener(
        "click",
        event => {

          const targetId =
            link.getAttribute(
              "href"
            );


          if (
            !targetId ||
            targetId === "#" ||
            targetId.startsWith(
              "#movie-"
            )
          )
            return;


          const target =
            $(targetId);


          if (!target)
            return;


          event.preventDefault();


          target.scrollIntoView({

            behavior:
              scrollBehavior(),

            block:
              "start"

          });

        }
      );

    });


    announce(
      "Clayve ready"
    );

  }


  /* ================================================================
     33. START APP
     ================================================================ */

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      init,
      {
        once: true
      }
    );

  } else {

    init();

  }


  /* ================================================================
     34. PUBLIC CLAYVE API
     ================================================================ */

  window.Clayve =
    Object.freeze({

      movies,

      openMovie:
        openModal,

      closeMovie:
        closeModal,

      toggleMyList,

      search:
        runSearch,

      getState: () => ({

        myList:
          [
            ...APP.state.myList
          ],

        recent:
          [
            ...APP.state.recent
          ],

        progress:
          {
            ...APP.state.progress
          }

      })

    });

})();