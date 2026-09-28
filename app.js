/* =========================================================
   عالم الدراسة — PUBLIC APP
   app.js
========================================================= */


/* =========================================================
   CONFIG
========================================================= */

// غيّر كلمة المرور من هنا فقط
const SITE_PASSWORD = "0000";

// اسم صورة ليو
const DEFAULT_AI_AVATAR = "assets/images/ai-avatar.png";


/* =========================================================
   SUPABASE
========================================================= */

const { createClient } = window.supabase;

const db = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);


/* =========================================================
   HELPERS
========================================================= */

const $ = selector =>
  document.querySelector(selector);


const state = {

  questions: [],

  chapters: [],

  categories: [],

  settings: {}

};


/* =========================================================
   PASSWORD GATE
========================================================= */

(() => {

  const gate =
    document.getElementById(
      "passwordGate"
    );

  const form =
    document.getElementById(
      "passwordForm"
    );

  const input =
    document.getElementById(
      "sitePassword"
    );

  const error =
    document.getElementById(
      "passwordError"
    );

  const video =
    document.getElementById(
      "lockBackgroundVideo"
    );


  if (!gate || !form || !input) {

    return;

  }


  /*
    مهم:
    نفس المفتاح يستخدمه الموقع كله.
  */

  const STORAGE_KEY =
    "study_world_unlocked";


  const unlocked =
    sessionStorage.getItem(
      STORAGE_KEY
    ) === "1";


  /* -----------------------------------------
     VIDEO
  ----------------------------------------- */

  if (video) {

    video.muted = true;

    video.playsInline = true;

    const playPromise =
      video.play();

    if (playPromise) {

      playPromise.catch(
        () => {}
      );

    }

  }


  /* -----------------------------------------
     ALREADY UNLOCKED
  ----------------------------------------- */

  if (unlocked) {

    gate.classList.add(
      "hidden"
    );

    gate.style.display =
      "none";

    document.body.classList.remove(
      "password-locked"
    );

    return;

  }


  /* -----------------------------------------
     LOCK
  ----------------------------------------- */

  document.body.classList.add(
    "password-locked"
  );


  setTimeout(
    () => {

      input.focus();

    },
    250
  );


  /* -----------------------------------------
     PASSWORD SUBMIT
  ----------------------------------------- */

  form.addEventListener(
    "submit",
    event => {

      event.preventDefault();


      const password =
        input.value.trim();


      /* CORRECT */

      if (
        password ===
        SITE_PASSWORD
      ) {

        sessionStorage.setItem(
          STORAGE_KEY,
          "1"
        );


        if (error) {

          error.textContent =
            "";

        }


        gate.classList.add(
          "hidden"
        );

        document.body.classList.remove(
          "password-locked"
        );


        setTimeout(
          () => {

            gate.style.display =
              "none";

          },
          700
        );


        input.value = "";


        return;

      }


      /* WRONG */

      if (error) {

        error.textContent =
          "كلمة المرور غير صحيحة.";

      }


      input.value = "";

      input.focus();


      input.animate(

        [

          {
            transform:
              "translateX(0)"
          },

          {
            transform:
              "translateX(-10px)"
          },

          {
            transform:
              "translateX(10px)"
          },

          {
            transform:
              "translateX(-7px)"
          },

          {
            transform:
              "translateX(0)"
          }

        ],

        {

          duration: 360,

          easing:
            "ease-out"

        }

      );

    }

  );


  /* -----------------------------------------
     PASSWORD SHOW / HIDE
  ----------------------------------------- */

  const toggle =
    document.getElementById(
      "passwordToggle"
    );


  if (toggle) {

    toggle.addEventListener(
      "click",
      () => {

        const hidden =
          input.type ===
          "password";


        input.type =
          hidden
            ? "text"
            : "password";


        toggle.textContent =
          hidden
            ? "◉"
            : "◌";


        input.focus();

      }
    );

  }

})();


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    createBubbles();

    bindNavigation();

    bindFilters();

    await loadPublicData();

  }
);


/* =========================================================
   BACKGROUND BUBBLES
========================================================= */

function createBubbles() {

  const box =
    $("#bubbles");


  if (!box) {

    return;

  }


  for (
    let i = 0;
    i < 18;
    i++
  ) {

    const bubble =
      document.createElement(
        "span"
      );


    const size =
      20 +
      Math.random() *
      90;


    bubble.className =
      "bubble";


    bubble.style.width =
      `${size}px`;


    bubble.style.height =
      `${size}px`;


    bubble.style.left =
      `${Math.random() * 100}%`;


    bubble.style.animationDuration =
      `${18 + Math.random() * 25}s`;


    bubble.style.animationDelay =
      `${-Math.random() * 30}s`;


    box.appendChild(
      bubble
    );

  }

}


/* =========================================================
   NAVIGATION
========================================================= */

function bindNavigation() {

  const toggle =
    $("#menuToggle");

  const nav =
    $("#mainNav");


  toggle?.addEventListener(
    "click",
    () => {

      const open =
        nav.classList.toggle(
          "open"
        );


      toggle.setAttribute(
        "aria-expanded",
        String(open)
      );

    }
  );


  nav
    ?.querySelectorAll("a")
    .forEach(
      link => {

        link.addEventListener(
          "click",
          () => {

            nav.classList.remove(
              "open"
            );

          }
        );

      }
    );

}


/* =========================================================
   FILTERS
========================================================= */

function bindFilters() {

  const search =
    document.getElementById(
      "searchInput"
    );

  const chapter =
    document.getElementById(
      "chapterFilter"
    );

  const category =
    document.getElementById(
      "categoryFilter"
    );


  search?.addEventListener(
    "input",
    () => {

      renderCategoryBubble();

      renderQuestions();

    }
  );


  chapter?.addEventListener(
    "change",
    () => {

      renderCategoryBubble();

      renderQuestions();

    }
  );


  category?.addEventListener(
    "change",
    () => {

      renderCategoryBubble();

      renderQuestions();

    }
  );


  $("#categoryBubbleBtn")
    ?.addEventListener(
      "click",
      event => {

        event.stopPropagation();

        $("#categoryBubble")
          ?.classList.toggle(
            "open"
          );

      }
    );


  document.addEventListener(
    "click",
    event => {

      if (
        !event.target.closest(
          ".category-filter-wrap"
        )
      ) {

        $("#categoryBubble")
          ?.classList.remove(
            "open"
          );

      }

    }
  );


  $("#clearFilters")
    ?.addEventListener(
      "click",
      () => {

        if (search) {
          search.value = "";
        }

        if (chapter) {
          chapter.value = "";
        }

        if (category) {
          category.value = "";
        }


        renderCategoryBubble();

        renderQuestions();

      }
    );

}


/* =========================================================
   LOAD SUPABASE DATA
========================================================= */

async function loadPublicData() {

  setQuestionsState(
    QA_I18N.t(
      "LOADING"
    )
  );


  const [
    questionsResult,
    chaptersResult,
    categoriesResult,
    settingsResult
  ] = await Promise.allSettled(

    [

      db
        .from("questions")
        .select("*"),

      db
        .from("chapters")
        .select(
          "id,title,description,display_order,created_at"
        )
        .order(
          "display_order",
          {
            ascending: true
          }
        ),

      db
        .from("categories")
        .select(
          "id,name,slug,description,created_at"
        )
        .order(
          "name",
          {
            ascending: true
          }
        ),

      db
        .from("site_settings")
        .select(
          "key,value"
        )

    ]

  );


  function unwrap(
    result,
    fallback
  ) {

    if (
      result.status ===
        "fulfilled" &&
      !result.value.error
    ) {

      return (
        result.value.data ||
        fallback
      );

    }


    return fallback;

  }


  state.questions =
    unwrap(
      questionsResult,
      []
    )
      .filter(
        question =>
          question.published !== false
      )
      .sort(
        (
          a,
          b
        ) => {

          const orderA =
            Number(
              a.display_order
            ) ||
            999999;


          const orderB =
            Number(
              b.display_order
            ) ||
            999999;


          if (
            orderA !==
            orderB
          ) {

            return (
              orderA -
              orderB
            );

          }


          return (
            new Date(
              a.created_at ||
              0
            ) -
            new Date(
              b.created_at ||
              0
            )
          );

        }
      );


  state.chapters =
    unwrap(
      chaptersResult,
      []
    );


  state.categories =
    unwrap(
      categoriesResult,
      []
    );


  state.settings =
    Object.fromEntries(

      unwrap(
        settingsResult,
        []
      ).map(
        setting => [
          setting.key,
          setting.value
        ]
      )

    );


  renderAll();

  applySiteBranding();


  if (
    questionsResult.status !==
      "fulfilled" ||
    questionsResult.value?.error
  ) {

    console.error(
      "Questions load error:",
      questionsResult.reason ||
      questionsResult.value?.error
    );

  }

}


/* =========================================================
   RENDER ALL
========================================================= */

function renderAll() {

  renderStats();

  renderFilters();

  renderQuestions();

  renderChapters();

  renderContact();

}


/* =========================================================
   SITE BRANDING
========================================================= */

function applySiteBranding() {

  const name =
    state.settings.site_name ||
    "عالم الدراسة";


  document.title =
    name;


  document
    .querySelectorAll(
      ".brand strong,.footer-grid strong"
    )
    .forEach(
      element => {

        element.textContent =
          name;

      }
    );


  const footer =
    document.getElementById(
      "footerText"
    );


  if (footer) {

    footer.textContent =
      state.settings.footer_text ||
      `© 2026 ${name}`;

  }


  /* -----------------------------------------
     LOCK VIDEO
  ----------------------------------------- */

  const video =
    document.getElementById(
      "lockBackgroundVideo"
    );


  if (
    video &&
    state.settings.lock_video_url
  ) {

    video.src =
      state.settings.lock_video_url;


    video.classList.add(
      "has-lock-video"
    );


    video.load();


    video.play()
      .catch(
        () => {}
      );

  }


  /* -----------------------------------------
     LEO IMAGE
  ----------------------------------------- */

  const avatarImages =
    document.querySelectorAll(
      ".leo-avatar img,.leo-fab-icon img"
    );


  avatarImages.forEach(
    image => {

      image.src =
        state.settings.leo_image_url ||
        DEFAULT_AI_AVATAR;


      image.alt =
        "ليو AI";

    }
  );

}


/* =========================================================
   STATS
========================================================= */

function renderStats() {

  const questions =
    $("#totalQuestions");


  const chapters =
    $("#totalChapters");


  const categories =
    $("#totalCategories");


  if (questions) {

    questions.textContent =
      state.questions.length;

  }


  if (chapters) {

    chapters.textContent =
      state.chapters.length;

  }


  if (categories) {

    categories.textContent =
      state.categories.length;

  }

}


/* =========================================================
   FILTER OPTIONS
========================================================= */

function renderFilters() {

  const chapterSelect =
    $("#chapterFilter");


  const categorySelect =
    $("#categoryFilter");


  if (!chapterSelect ||
      !categorySelect) {

    return;

  }


  const chaptersHTML =
    state.chapters
      .map(
        chapter => `

          <option
            value="${attr(chapter.id)}"
          >
            ${esc(chapter.title)}
          </option>

        `
      )
      .join("");


  const categoriesHTML =
    state.categories
      .map(
        category => `

          <option
            value="${attr(category.id)}"
          >
            ${esc(category.name)}
          </option>

        `
      )
      .join("");


  chapterSelect.innerHTML = `

    <option value="">
      ${esc(
        QA_I18N.t(
          "ALL_CHAPTERS"
        )
      )}
    </option>

    ${chaptersHTML}

  `;


  categorySelect.innerHTML = `

    <option value="">
      ${esc(
        QA_I18N.t(
          "ALL_CATEGORIES"
        )
      )}
    </option>

    ${categoriesHTML}

  `;


  renderCategoryBubble();

}


/* =========================================================
   CATEGORY BUBBLE
========================================================= */

function renderCategoryBubble() {

  const box =
    $("#categoryBubble");


  if (!box) {

    return;

  }


  const current =
    $("#categoryFilter")
      ?.value ||
    "";


  box.innerHTML = `

    <button
      type="button"
      class="category-chip ${
        !current
          ? "active"
          : ""
      }"
      data-cat=""
    >
      كل التصنيفات
    </button>

    ${state.categories
      .map(
        category => `

          <button
            type="button"
            class="category-chip ${
              current ===
              String(
                category.id
              )
                ? "active"
                : ""
            }"
            data-cat="${attr(
              category.id
            )}"
          >

            ${esc(
              category.name
            )}

          </button>

        `
      )
      .join("")}

  `;


  box
    .querySelectorAll(
      "[data-cat]"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            $("#categoryFilter").value =
              button.dataset.cat;


            box.classList.remove(
              "open"
            );


            $("#categoryBubbleBtn")
              ?.classList.toggle(
                "active",
                Boolean(
                  button.dataset.cat
                )
              );


            renderCategoryBubble();

            renderQuestions();

          }
        );

      }
    );

}


/* =========================================================
   RENDER QUESTIONS
========================================================= */

function renderQuestions() {

  const search =
    $("#searchInput")
      ?.value
      .trim()
      .toLowerCase() ||
    "";


  const chapterId =
    $("#chapterFilter")
      ?.value ||
    "";


  const categoryId =
    $("#categoryFilter")
      ?.value ||
    "";


  const list =
    state.questions.filter(
      question => {

        const chapter =
          state.chapters.find(
            item =>
              item.id ===
              question.chapter_id
          );


        const category =
          state.categories.find(
            item =>
              item.id ===
              question.category_id
          );


        const haystack = [

          question.title,

          question.question_text,

          chapter?.title,

          category?.name

        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();


        return (

          (
            !search ||
            haystack.includes(
              search
            )
          ) &&

          (
            !chapterId ||
            question.chapter_id ===
              chapterId
          ) &&

          (
            !categoryId ||
            question.category_id ===
              categoryId
          )

        );

      }
    );


  const resultCount =
    $("#resultCount");


  if (resultCount) {

    resultCount.textContent =
      list.length;

  }


  const grid =
    $("#questionsGrid");


  if (!grid) {

    return;

  }


  if (!list.length) {

    grid.innerHTML =
      "";


    setQuestionsState(

      search ||
      chapterId ||
      categoryId

        ? QA_I18N.t(
            "NO_RESULTS"
          )

        : QA_I18N.t(
            "NO_QUESTIONS"
          )

    );


    return;

  }


  setQuestionsState(
    ""
  );


  grid.innerHTML =
    list
      .map(
        (
          question,
          index
        ) =>
          questionCard(
            question,
            index
          )
      )
      .join("");

}


/* =========================================================
   QUESTION CARD
========================================================= */

function questionCard(
  question,
  index
) {

  const chapter =
    state.chapters.find(
      item =>
        item.id ===
        question.chapter_id
    );


  const category =
    state.categories.find(
      item =>
        item.id ===
        question.category_id
    );


  const image =
    question.image_url

      ? `

        <div class="media-frame">

          <img
            src="${attr(
              question.image_url
            )}"
            alt="${attr(
              question.title
            )}"
            loading="lazy"
          >

        </div>

      `

      : "";


  const video =
    buildVideo(
      question.video_url
    );


  return `

    <article
      class="question-card"
      id="question-${attr(
        question.id
      )}"
    >


      <div class="question-number">

        <span>
          ${String(
            index + 1
          ).padStart(
            2,
            "0"
          )}
        </span>

        <i></i>

      </div>


      <div class="card-meta">

        <span>
          ${esc(
            chapter?.title ||
            QA_I18N.t(
              "ARCHIVE"
            )
          )}
        </span>

        <span>
          ${esc(
            category?.name ||
            QA_I18N.t(
              "QUESTION"
            )
          )}
        </span>

      </div>


      <h3>
        ${esc(
          question.title
        )}
      </h3>


      <div class="question-text">

        ${esc(
          question.question_text ||
          ""
        )}

      </div>


      ${image}

      ${video}


      <div class="card-actions">


        <button
          class="mini-btn"
          type="button"
          onclick="toggleBox(
            this,
            'answer-${attr(
              question.id
            )}',
            'SHOW_ANSWER',
            'HIDE_ANSWER'
          )"
        >

          ${QA_I18N.t(
            "SHOW_ANSWER"
          )}

        </button>


        <button
          class="mini-btn"
          type="button"
          onclick="toggleBox(
            this,
            'explanation-${attr(
              question.id
            )}',
            'SHOW_EXPLANATION',
            'HIDE_EXPLANATION'
          )"
        >

          ${QA_I18N.t(
            "SHOW_EXPLANATION"
          )}

        </button>


        ${
          question.code

            ? `

              <button
                class="mini-btn"
                type="button"
                onclick="toggleBox(
                  this,
                  'code-${attr(
                    question.id
                  )}',
                  'SHOW_CODE',
                  'HIDE_CODE'
                )"
              >

                ${QA_I18N.t(
                  "SHOW_CODE"
                )}

              </button>

            `

            : ""
        }


        <button
          class="mini-btn"
          type="button"
          onclick="copyQuestion(
            '${attr(
              question.id
            )}'
          )"
        >

          ${QA_I18N.t(
            "COPY"
          )}

        </button>


        <button
          class="
            mini-btn
            leo-question-btn
          "
          type="button"
          onclick="askLeo(
            '${attr(
              question.id
            )}'
          )"
        >

          اسأل ليو

        </button>


        <button
          class="
            mini-btn
            danger
          "
          type="button"
          onclick="reportQuestion(
            '${attr(
              question.id
            )}'
          )"
        >

          ${QA_I18N.t(
            "REPORT"
          )}

        </button>


      </div>


      <div
        class="
          answer-box
          reveal-box
        "
        id="answer-${attr(
          question.id
        )}"
      >

        ${esc(
          question.answer ||
          QA_I18N.t(
            "ANSWER_EMPTY"
          )
        )}

      </div>


      <div
        class="
          answer-box
          reveal-box
        "
        id="explanation-${attr(
          question.id
        )}"
      >

        ${esc(
          question.explanation ||
          QA_I18N.t(
            "EXPLANATION_EMPTY"
          )
        )}

      </div>


      ${
        question.code

          ? `

            <pre
              class="
                answer-box
                reveal-box
                code-box
              "
              id="code-${attr(
                question.id
              )}"
            >

              <code>
                ${esc(
                  question.code
                )}
              </code>

            </pre>

          `

          : ""
      }


    </article>

  `;

}


/* =========================================================
   VIDEO
========================================================= */

function buildVideo(
  url
) {

  if (!url) {

    return "";

  }


  const youtubeId =
    getYouTubeId(
      url
    );


  if (youtubeId) {

    return `

      <div
        class="
          media-frame
          video-wrap
        "
      >

        <iframe
          src="https://www.youtube.com/embed/${encodeURIComponent(
            youtubeId
          )}"
          title="${esc(
            QA_I18N.t(
              "VIDEO"
            )
          )}"
          loading="lazy"
          allowfullscreen
        ></iframe>

      </div>

    `;

  }


  return `

    <div
      class="
        media-frame
        video-wrap
      "
    >

      <video
        controls
        preload="metadata"
      >

        <source
          src="${attr(
            url
          )}"
        >

        Video

      </video>

    </div>

  `;

}


/* =========================================================
   YOUTUBE ID
========================================================= */

function getYouTubeId(
  url
) {

  try {

    const parsed =
      new URL(
        url
      );


    if (
      parsed.hostname.includes(
        "youtu.be"
      )
    ) {

      return parsed.pathname
        .slice(1);

    }


    if (
      parsed.hostname.includes(
        "youtube.com"
      )
    ) {

      return (
        parsed.searchParams.get(
          "v"
        ) ||
        parsed.pathname
          .split("/")
          .pop()
      );

    }

  } catch {

    return null;

  }


  return null;

}


/* =========================================================
   CHAPTERS
========================================================= */

function renderChapters() {

  const grid =
    $("#chaptersGrid");


  if (!grid) {

    return;

  }


  if (
    !state.chapters.length
  ) {

    grid.innerHTML = `

      <div class="state-message">

        ${esc(
          QA_I18N.t(
            "NO_CHAPTERS"
          )
        )}

      </div>

    `;


    return;

  }


  grid.innerHTML =
    state.chapters
      .map(
        (
          chapter,
          index
        ) => {

          const count =
            state.questions.filter(
              question =>
                question.chapter_id ===
                chapter.id
            ).length;


          return `

            <article
              class="chapter-card"
              onclick="selectChapter(
                '${attr(
                  chapter.id
                )}'
              )"
            >


              <span
                class="chapter-index"
              >

                ${String(
                  index + 1
                ).padStart(
                  2,
                  "0"
                )}

              </span>


              <div>

                <p>
                  CHAPTER
                  ${String(
                    index + 1
                  ).padStart(
                    2,
                    "0"
                  )}
                </p>


                <h3>

                  ${esc(
                    chapter.title
                  )}

                </h3>


                <small>

                  ${count}

                  ${esc(
                    QA_I18N.t(
                      "CHAPTER_QUESTIONS"
                    )
                  )}

                </small>

              </div>


              <b>
                ↙
              </b>


            </article>

          `;

        }
      )
      .join("");

}


/* =========================================================
   SELECT CHAPTER
========================================================= */

function selectChapter(
  id
) {

  const select =
    $("#chapterFilter");


  if (select) {

    select.value =
      id;

  }


  const section =
    $("#questions");


  section?.scrollIntoView(
    {
      behavior:
        "smooth",

      block:
        "start"

    }
  );


  renderQuestions();

}


/* =========================================================
   CONTACT
========================================================= */

function renderContact() {

  const number =
    (
      state.settings
        .whatsapp_number ||
      ""
    )
      .replace(
        /\D/g,
        ""
      );


  const message =
    state.settings
      .whatsapp_message ||
    "أهلًا، عندي مشكلة في أحد الأسئلة.";


  const email =
    state.settings
      .contact_email ||
    "";


  let html =
    "";


  if (number) {

    html += `

      <a
        class="btn btn-gold"
        target="_blank"
        rel="noopener noreferrer"
        href="https://wa.me/${number}?text=${encodeURIComponent(
          message
        )}"
      >

        ${esc(
          QA_I18N.t(
            "WHATSAPP"
          )
        )}

      </a>

    `;

  }


  if (email) {

    html += `

      <a
        class="btn"
        href="mailto:${attr(
          email
        )}"
      >

        ${esc(
          QA_I18N.t(
            "EMAIL"
          )
        )}

      </a>

    `;

  }


  const actions =
    $("#contactActions");


  if (!actions) {

    return;

  }


  actions.innerHTML =
    html ||

    `

      <span class="state-message">

        ${esc(
          QA_I18N.t(
            "CONTACT_UNAVAILABLE"
          )
        )}

      </span>

    `;

}


/* =========================================================
   ANSWER TOGGLE
========================================================= */

window.toggleBox =
  (
    button,
    id,
    showKey,
    hideKey
  ) => {

    const element =
      document.getElementById(
        id
      );


    if (!element) {

      return;

    }


    const open =
      element.classList.toggle(
        "open"
      );


    button.textContent =
      QA_I18N.t(
        open
          ? hideKey
          : showKey
      );

  };


/* =========================================================
   COPY ANSWER
========================================================= */

window.copyQuestion =
  async id => {

    const question =
      state.questions.find(
        item =>
          String(
            item.id
          ) ===
          String(id)
      );


    if (!question) {

      return;

    }


    const answer =
      (
        question.answer ||
        ""
      ).trim();


    if (!answer) {

      toast(
        QA_I18N.t(
          "ANSWER_EMPTY"
        )
      );

      return;

    }


    try {

      await navigator.clipboard
        .writeText(
          answer
        );


      toast(
        QA_I18N.t(
          "COPIED"
        )
      );

    } catch {

      toast(
        QA_I18N.t(
          "COPY_FAIL"
        )
      );

    }

  };


/* =========================================================
   REPORT QUESTION
========================================================= */

window.reportQuestion =
  id => {

    const question =
      state.questions.find(
        item =>
          String(
            item.id
          ) ===
          String(id)
      );


    if (!question) {

      return;

    }


    const number =
      (
        state.settings
          .whatsapp_number ||
        ""
      )
        .replace(
          /\D/g,
          ""
        );


    if (!number) {

      toast(
        QA_I18N.t(
          "CONTACT_UNAVAILABLE"
        )
      );

      return;

    }


    const message = `Question #${question.id}
${question.title}`;


    window.open(
      `https://wa.me/${number}?text=${encodeURIComponent(
        message
      )}`,
      "_blank",
      "noopener"
    );

  };


/* =========================================================
   QUESTION STATE
========================================================= */

function setQuestionsState(
  message
) {

  const element =
    $("#questionsState");


  if (element) {

    element.textContent =
      message || "";

  }

}


/* =========================================================
   TOAST
========================================================= */

function toast(
  message
) {

  const region =
    $("#toastRegion");


  if (!region) {

    return;

  }


  const element =
    document.createElement(
      "div"
    );


  element.className =
    "toast";


  element.textContent =
    message;


  region.appendChild(
    element
  );


  setTimeout(
    () => {

      element.remove();

    },
    2800
  );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function esc(
  value
) {

  return String(
    value ?? ""
  ).replace(
    /[&<>"']/g,
    character => ({

      "&":
        "&amp;",

      "<":
        "&lt;",

      ">":
        "&gt;",

      '"':
        "&quot;",

      "'":
        "&#039;"

    }[character])
  );

}


/* =========================================================
   ATTRIBUTE ESCAPE
========================================================= */

function attr(
  value
) {

  return esc(
    value
  );

}


/* =========================================================
   LANGUAGE CHANGE
========================================================= */

window.addEventListener(
  "qa-language-change",
  () => {

    const search =
      $("#searchInput");


    if (search) {

      search.placeholder =
        QA_I18N.t(
          "SEARCH_PLACEHOLDER"
        );

    }


    renderFilters();

    renderQuestions();

    renderChapters();

    renderContact();

    renderStats();

  }
);


/* =========================================================
   LEO AI — CURRENT QUESTION
========================================================= */

(() => {

  const overlay =
    document.getElementById(
      "leoOverlay"
    );


  const fab =
    document.getElementById(
      "leoFab"
    );


  const context =
    document.getElementById(
      "leoQuestionContext"
    );


  if (!overlay || !fab) {

    return;

  }


  window.leoCurrentQuestion =
    null;


  /* -----------------------------------------
     OPEN
  ----------------------------------------- */

  function openLeo(
    question = null
  ) {

    if (question) {

      window.leoCurrentQuestion =
        question;


      const title =
        context?.querySelector(
          "strong"
        );


      if (title) {

        title.textContent =
          question.title ||
          "السؤال الحالي";

      }

    }


    overlay.classList.add(
      "open"
    );


    overlay.setAttribute(
      "aria-hidden",
      "false"
    );


    document.body.classList.add(
      "leo-open"
    );


    const input =
      document.getElementById(
        "homeAiInput"
      );


    if (input) {

      setTimeout(
        () => {

          input.focus();

        },
        180
      );

    }

  }


  /* -----------------------------------------
     CLOSE
  ----------------------------------------- */

  function closeLeo() {

    overlay.classList.remove(
      "open"
    );


    overlay.setAttribute(
      "aria-hidden",
      "true"
    );


    document.body.classList.remove(
      "leo-open"
    );

  }


  window.openLeo =
    openLeo;


  window.closeLeo =
    closeLeo;


  /* -----------------------------------------
     ASK LEO
  ----------------------------------------- */

  window.askLeo =
    id => {

      const question =
        state.questions.find(
          item =>
            String(
              item.id
            ) ===
            String(id)
        );


      if (!question) {

        return;

      }


      openLeo(
        question
      );


      const messages =
        document.getElementById(
          "homeAiMessages"
        );


      if (messages) {

        messages.innerHTML = `

          <div
            class="
              ai-message
              ai-message-bot
            "
          >

            <div
              class="ai-message-label"
            >
              ليو
            </div>


            <div
              class="ai-message-text"
            >

              أنا معاك في السؤال ده.
              قلّي الجزء اللي مش واضح،
              أو اضغط «اشرح السؤال».

            </div>

          </div>

        `;

      }


      window.dispatchEvent(
        new CustomEvent(
          "leo-question-selected",
          {
            detail:
              question
          }
        )
      );

    };


  /* -----------------------------------------
     FLOAT BUTTON
  ----------------------------------------- */

  fab.addEventListener(
    "click",
    () => {

      openLeo(
        window.leoCurrentQuestion
      );

    }
  );


  /* -----------------------------------------
     CLOSE BUTTONS
  ----------------------------------------- */

  overlay
    .querySelectorAll(
      "[data-leo-close]"
    )
    .forEach(
      element => {

        element.addEventListener(
          "click",
          closeLeo
        );

      }
    );


  /* -----------------------------------------
     ESC
  ----------------------------------------- */

  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key ===
        "Escape"
      ) {

        closeLeo();

      }

    }
  );

})();


/* =========================================================
   LEO AI — N8N
========================================================= */

(() => {


  const N8N_AI_URL =
    "https://jane-loy.app.n8n.cloud/webhook/5e5a2910-d731-49b4-9217-c70938ca749c";


  const messages =
    document.getElementById(
      "homeAiMessages"
    );


  const input =
    document.getElementById(
      "homeAiInput"
    );


  const send =
    document.getElementById(
      "homeAiSend"
    );


  const stop =
    document.getElementById(
      "homeAiStop"
    );


  const newChat =
    document.getElementById(
      "aiNewChat"
    );


  const typing =
    document.getElementById(
      "homeAiTyping"
    );


  if (
    !messages ||
    !input ||
    !send
  ) {

    return;

  }


  let history = [];

  let controller = null;

  let loading = false;


  /* -----------------------------------------
     ESCAPE
  ----------------------------------------- */

  function escapeHTML(
    text
  ) {

    return String(
      text ?? ""
    )
      .replace(
        /&/g,
        "&amp;"
      )
      .replace(
        /</g,
        "&lt;"
      )
      .replace(
        />/g,
        "&gt;"
      )
      .replace(
        /"/g,
        "&quot;"
      )
      .replace(
        /'/g,
        "&#039;"
      );

  }


  /* -----------------------------------------
     MESSAGE
  ----------------------------------------- */

  function addMessage(
    text,
    type
  ) {

    const message =
      document.createElement(
        "div"
      );


    message.className =
      `ai-message ai-message-${type}`;


    let formatted =
      escapeHTML(
        text
      );


    /* Code blocks */

    formatted =
      formatted.replace(
        /```([\s\S]*?)```/g,
        `
          <div class="ai-code">

            <div class="ai-code-header">
              <span>CODE</span>
            </div>

            <pre>$1</pre>

          </div>
        `
      );


    /* Inline code */

    formatted =
      formatted.replace(
        /`([^`]+)`/g,
        "<code>$1</code>"
      );


    /* Bold */

    formatted =
      formatted.replace(
        /\*\*(.*?)\*\*/g,
        "<strong>$1</strong>"
      );


    /* New lines */

    formatted =
      formatted.replace(
        /\n/g,
        "<br>"
      );


    message.innerHTML = `

      <div
        class="ai-message-label"
      >

        ${
          type === "user"
            ? "أنت"
            : "ليو"
        }

      </div>


      <div
        class="ai-message-text"
      >

        ${formatted}

      </div>

    `;


    messages.appendChild(
      message
    );


    messages.scrollTop =
      messages.scrollHeight;

  }


  /* -----------------------------------------
     LOADING
  ----------------------------------------- */

  function setLoading(
    value
  ) {

    loading =
      value;


    typing?.classList.toggle(
      "hidden",
      !value
    );


    send?.classList.toggle(
      "hidden",
      value
    );


    stop?.classList.toggle(
      "hidden",
      !value
    );


    input.disabled =
      value;

  }


  /* -----------------------------------------
     EXTRACT AI RESPONSE
  ----------------------------------------- */

  function extractReply(
    data
  ) {

    if (!data) {

      return "";

    }


    if (
      typeof data ===
      "string"
    ) {

      return data;

    }


    const keys = [

      "reply",

      "output",

      "text",

      "response",

      "answer",

      "message"

    ];


    for (
      const key of keys
    ) {

      if (
        typeof data[key] ===
        "string"
      ) {

        return data[key];

      }

    }


    if (data.data) {

      return extractReply(
        data.data
      );

    }


    if (
      Array.isArray(data) &&
      data.length
    ) {

      return extractReply(
        data[0]
      );

    }


    return "";

  }


  /* -----------------------------------------
     SEND
  ----------------------------------------- */

  async function sendMessage() {

    if (loading) {

      return;

    }


    const text =
      input.value.trim();


    if (!text) {

      return;

    }


    addMessage(
      text,
      "user"
    );


    input.value =
      "";


    input.style.height =
      "auto";


    history.push({

      role:
        "user",

      content:
        text

    });


    setLoading(
      true
    );


    controller =
      new AbortController();


    try {


      const current =
        window.leoCurrentQuestion;


      const response =
        await fetch(
          N8N_AI_URL,
          {

            method:
              "POST",


            headers: {

              "Content-Type":
                "application/json",

              "Accept":
                "application/json"

            },


            body:
              JSON.stringify({

                message:
                  text,


                history:
                  history.slice(
                    -20
                  ),


                language:
                  "ar",


                mode:
                  "developer",


                source:
                  "question-archive-leo",


                currentQuestion:

                  current

                    ? {

                        id:
                          current.id,

                        title:
                          current.title,

                        question:
                          current.question_text,

                        answer:
                          current.answer,

                        explanation:
                          current.explanation,

                        code:
                          current.code

                      }

                    : null

              }),


            signal:
              controller.signal

          }
        );


      if (
        !response.ok
      ) {

        const errorText =
          await response.text();


        throw new Error(
          `n8n Error ${response.status}: ${errorText}`
        );

      }


      const contentType =
        response.headers.get(
          "content-type"
        ) || "";


      let data;


      if (
        contentType.includes(
          "application/json"
        )
      ) {

        data =
          await response.json();

      } else {

        data =
          await response.text();

      }


      const reply =
        extractReply(
          data
        );


      if (!reply) {

        throw new Error(
          "لم يرجع n8n رد من الـ AI."
        );

      }


      addMessage(
        reply,
        "bot"
      );


      history.push({

        role:
          "assistant",

        content:
          reply

      });


    } catch (
      error
    ) {


      if (
        error.name ===
        "AbortError"
      ) {

        addMessage(
          "تم إيقاف الرد.",
          "bot"
        );

      } else {

        console.error(
          "Leo AI Error:",
          error
        );


        addMessage(
          "حصلت مشكلة في الاتصال بالـ AI. تأكد أن Webhook الخاص بـ n8n شغال.",
          "bot"
        );

      }

    } finally {

      controller =
        null;


      setLoading(
        false
      );


      input.focus();

    }

  }


  /* -----------------------------------------
     SEND BUTTON
  ----------------------------------------- */

  send.addEventListener(
    "click",
    sendMessage
  );


  /* -----------------------------------------
     STOP
  ----------------------------------------- */

  stop?.addEventListener(
    "click",
    () => {

      if (controller) {

        controller.abort();

      }

    }
  );


  /* -----------------------------------------
     ENTER
  ----------------------------------------- */

  input.addEventListener(
    "keydown",
    event => {

      if (
        event.key ===
          "Enter" &&
        !event.shiftKey
      ) {

        event.preventDefault();

        sendMessage();

      }

    }
  );


  /* -----------------------------------------
     AUTO RESIZE
  ----------------------------------------- */

  input.addEventListener(
    "input",
    () => {

      input.style.height =
        "auto";


      input.style.height =
        `${Math.min(
          input.scrollHeight,
          150
        )}px`;

    }
  );


  /* -----------------------------------------
     NEW CHAT
  ----------------------------------------- */

  newChat?.addEventListener(
    "click",
    () => {

      history = [];


      messages.innerHTML = `

        <div
          class="
            ai-message
            ai-message-bot
          "
        >

          <div
            class="ai-message-label"
          >
            ليو
          </div>


          <div
            class="ai-message-text"
          >

            أهلاً بيك.

            <br><br>

            المحادثة بدأت من جديد.
            اسألني عن البرمجة أو ابعت
            الكود اللي محتاج مساعدة فيه.

          </div>

        </div>

      `;


      input.value =
        "";


      input.style.height =
        "auto";


      input.focus();

    }
  );


  /* -----------------------------------------
     QUICK PROMPTS
  ----------------------------------------- */

  document.addEventListener(
    "click",
    event => {

      const button =
        event.target.closest(
          "[data-ai-home-prompt]"
        );


      if (!button) {

        return;

      }


      const prompt =
        button.dataset
          .aiHomePrompt;


      input.value =
        prompt;


      input.focus();


      input.style.height =
        "auto";


      input.style.height =
        `${input.scrollHeight}px`;

    }
  );

})();
