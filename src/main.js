const questionSet = [
  {
    prompt: '처음 눈길이 가는 건?',
    options: [
      { emoji: '🪞', title: '완벽하게 다듬어진 것', sub: '디테일까지 매끈한 완성도' },
      { emoji: '🧩', title: '처음 보는 독특한 것', sub: '조금 서툴러도 나만의 분위기' },
    ],
  },
  {
    prompt: '주말 마켓에서 딱 하나만 데려온다면?',
    options: [
      { emoji: '🍊', title: '모두에게 잘 어울리는 오브제', sub: '익숙하지만 안정적인 매력' },
      { emoji: '🪩', title: '세상에 하나뿐인 오브제', sub: '다시 봐도 기억에 남는 특별함' },
    ],
  },
  {
    prompt: '친구가 만든 플레이리스트, 어떤 제목이 더 궁금해?',
    options: [
      { emoji: '🌷', title: '오늘을 위한 포근한 노래', sub: '마음을 편하게 해주는 익숙함' },
      { emoji: '🛸', title: '아무도 모르는 비밀의 노래', sub: '어떤 분위기일지 상상이 안 되는 매력' },
    ],
  },
  {
    prompt: '선물 포장을 고른다면?',
    options: [
      { emoji: '🎀', title: '깔끔한 리본과 단정한 포장', sub: '정성스럽고 안정적인 완성' },
      { emoji: '🧡', title: '손그림 메모가 붙은 포장', sub: '조금 삐뚤어도 진심이 느껴지는 것' },
    ],
  },
  {
    prompt: '나를 더 설레게 하는 초대장은?',
    options: [
      { emoji: '🌟', title: '모두가 기다리는 인기 파티', sub: '사람들이 많이 찾는 이유가 궁금해' },
      { emoji: '🌙', title: '초대받은 사람만 아는 비밀 파티', sub: '나만 아는 특별한 순간 같아' },
    ],
  },
  {
    prompt: '마지막으로, 내 취향에 가까운 문장은?',
    options: [
      { emoji: '💎', title: '오래 사랑받는 클래식', sub: '시간이 지나도 좋은 건 좋은 것' },
      { emoji: '🦋', title: '오늘 처음 ���난 반짝임', sub: '새로운 느낌은 언제나 매력적' },
    ],
  },
];

const ratingLabels = [
  '이 결과물이 매력적으로 느껴진다',
  '이 결과물이 믿음직하고 완성도 있어 보인다',
  '다른 사람에게 보여주거나 공유하고 싶다',
  '이 결과물은 나에게 가치가 있어 보인다',
];

const STORAGE_KEY = 'heartbeat-study-responses-v2';
const SESSION_KEY = 'heartbeat-study-session-v2';

const state = {
  consent: false,
  condition: null,
  step: 0,
  answers: Array(questionSet.length).fill(null),
  ratings: Array(ratingLabels.length).fill(null),
};

const app = document.querySelector('#app');

function loadStoredResponses() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSession() {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
}

function restoreSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (saved && Array.isArray(saved.answers)) {
      Object.assign(state, saved);
    }
  } catch {
    // ignore
  }
}

function getCondition() {
  const rows = loadStoredResponses();
  const a = rows.filter((item) => item.condition === 'A').length;
  const b = rows.filter((item) => item.condition === 'B').length;
  return a <= b ? 'A' : 'B';
}

function setConditionIfNeeded() {
  if (!state.condition) {
    state.condition = getCondition();
  }
}

function renderTopbar() {
  const label = state.step === 0 ? '취향 탐험' : state.step === questionSet.length + 1 ? '심사 단계' : state.step === questionSet.length + 2 ? '결과 공개' : `질문 ${state.step} / ${questionSet.length}`;

  return `
    <div class="topbar">
      <span class="brand-badge">♡ HEART BEAT CLUB</span>
      <span class="status-pill">${label}</span>
    </div>
  `;
}

function renderIntro() {
  return `
    ${renderTopbar()}
    <section class="card">
      <div class="screen">
        <div class="eyebrow">✦ 오늘의 미니 취향 테스트</div>
        <div class="hero-sticker" aria-hidden="true">💖</div>
        <h1 class="hero-title">나의<br>하트비트!</h1>
        <p class="intro-copy">당신은 무엇을 가치 있다고 느끼나요?<br>���음이 먼저 반응하는 순간을 따라가 봐요.</p>

        <div class="notice-box">
          <label>
            <input type="checkbox" id="consent-checkbox" ${state.consent ? 'checked' : ''} />
            <span>참여 전 안내를 확인했어요. 이 활동은 연구 실험에 활용되며, 응답은 익명으로 저장됩니다. 참여는 자발적이며 언제든 창을 닫아 중단할 수 있어요.</span>
          </label>
        </div>

        <p class="ghost-copy">약 2분 · 정답은 없어요 · 결과는 마지막에 공개돼요</p>
        <div class="error-text hidden" id="intro-error">계속하려면 연구 참여 안내에 동의해 주세요.</div>
        <button class="primary-btn" id="start-btn">내 취향 알아보기 →</button>
      </div>
    </section>
  `;
}

function renderQuestion(index) {
  const question = questionSet[index];
  const progressValue = (index / questionSet.length) * 100;

  return `
    ${renderTopbar()}
    <section class="card">
      <div class="screen">
        <div class="question-index">YOUR VIBE · 0${index + 1}</div>
        <div class="progress-bar"><span style="width:${progressValue}%"></span></div>
        <h2 class="prompt">${question.prompt}</h2>
        <div class="choice-list">
          ${question.options
            .map(
              (option, optionIndex) => `
                <button class="choice ${state.answers[index] === optionIndex ? 'selected' : ''}" data-question-index="${index}" data-option-index="${optionIndex}">
                  <span class="choice-main"><span class="choice-emoji">${option.emoji}</span><span>${option.title}</span></span>
                  <span class="choice-sub">${option.sub}</span>
                </button>
              `
            )
            .join('')}
        </div>
        <div class="inline-actions">
          ${index > 0 ? '<button class="secondary-btn" id="prev-btn">← 이전</button>' : '<div></div>'}
          <button class="primary-btn" id="next-btn" ${state.answers[index] === null ? 'disabled' : ''}>
            ${index === questionSet.length - 1 ? '다음, 심사하러 가기' : '다음 질문 →'}
          </button>
        </div>
      </div>
    </section>
  `;
}

function renderJudgement() {
  const conditionLabel = state.condition === 'A'
    ? '🌟 아주 특별한 결과 · 상위 5%에게만'
    : '💫 많은 사람이 공통으로 받는 결과';

  return `
    ${renderTopbar()}
    <section class="card">
      <div class="screen">
        <div class="eyebrow">✦ 이제 당신이 심사위원!</div>
        <h2 class="prompt" style="margin-top:14px;">이 결과를 마주한<br>첫 느낌은 어때요?</h2>
        <div class="notice-box" style="margin-top: 0;">
          ${conditionLabel}
        </div>

        <div class="art-panel" aria-label="색감이 풍부한 하트 모양 작품">
          <div class="art-icon">💗</div>
          <div class="art-title">HEART GLOW</div>
          <p class="art-sub">a little light, made of you</p>
        </div>

        <p class="ghost-copy" style="margin: 14px 0 0;">작품을 천천히 보고, 느낌을 골라주세요</p>

        ${ratingLabels
          .map(
            (label, idx) => `
              <div class="rating-box">
                <p>${label}</p>
                <div class="scale">
                  ${[1, 2, 3, 4, 5]
                    .map(
                      (value) => `
                        <button class="rating ${state.ratings[idx] === value ? 'selected' : ''}" data-rating-index="${idx}" data-value="${value}" aria-label="${value}점">
                          ${value}
                          <span>${value === 1 ? '낮음' : value === 5 ? '높음' : ' '}</span>
                        </button>
                      `
                    )
                    .join('')}
                </div>
                <div class="scale-labels"><span>그렇지 않다</span><span>정말 그렇다</span></div>
              </div>
            `
          )
          .join('')}

        <div class="error-text ${state.ratings.includes(null) ? '' : 'hidden'}" id="rating-error">각 항목을 별점으로 평가해 주세요.</div>
        <button class="primary-btn" id="finish-btn">내 취향 결과 보기 ✨</button>
      </div>
    </section>
  `;
}

function getResultType() {
  const preferenceScore = state.answers.reduce((sum, answer) => sum + (answer === 1 ? 1 : 0), 0);

  if (preferenceScore >= 4) {
    return {
      name: '반짝임 수집가',
      title: '새로움에 심장이 쿵!',
      desc: '남들이 아직 발견하지 못한 매력을 알아보는 당신. 낯선 반짝임을 자기만의 감각으로 빛내는 타입이에요.',
    };
  }

  if (preferenceScore <= 2) {
    return {
      name: '무드 큐레이터',
      title: '좋은 감각은 오래 남아',
      desc: '마음에 드는 것의 이유를 차분히 알아보는 당신. 익숙한 아름다움 속에서도 작은 차이를 발견해요.',
    };
  }

  return {
    name: '하트비트 믹서',
    title: '두근거림의 균형을 아는',
    desc: '완성도와 새로운 감각 사이를 자유롭게 오가는 당신. 상황마다 가장 잘 어울리는 가치를 골라내요.',
  };
}

function renderResult() {
  const result = getResultType();

  return `
    ${renderTopbar()}
    <section class="card">
      <div class="screen" style="text-align:center;">
        <div class="hero-sticker" style="margin-top:4px;">✨</div>
        <div class="eyebrow">✦ 당신의 하트비트 결과</div>
        <h2 class="result-title">${result.name}</h2>
        <p class="result-sub">${result.title}</p>
        <p class="copy" style="text-align:left;">${result.desc}</p>

        <div class="debrief-box" style="margin-top:18px; text-align:left;">
          <strong>잠깐, 실험의 비밀을 공개할게요 🫧</strong><br />
          이 테스트는 같은 작품을 보여드리면서 소개 문구만 다르게 제시해, 희소하다는 정보가 작품의 가치 판단에 어떤 영향을 주는지 알아보는 연구예요. 참가자는 무작위로 두 조건 중 하나에 배정되었고, 작품은 모든 참가자에게 동일했어요. 소개 문구는 연구를 위해 실제와 다르게 안내한 것으로, 혼란을 드렸다면 미안해요. 응답은 익명으로 기록되며 연구 목적으로만 사용됩니다.<br /><br />
          함께해 주셔서 정말 고마워요! 💖
        </div>

        <button class="primary-btn" id="restart-btn" style="margin-top:18px;">반짝이는 하루 보내기 ♡</button>
      </div>
    </section>
  `;
}

function renderAdmin() {
  const rows = loadStoredResponses();
  const groupA = rows.filter((item) => item.condition === 'A');
  const groupB = rows.filter((item) => item.condition === 'B');

  const stats = ratingLabels.map((label, index) => {
    const a = averageByGroup(groupA, index);
    const b = averageByGroup(groupB, index);
    return {
      label,
      a,
      b,
      diff: a !== null && b !== null ? (a - b).toFixed(2) : '—',
    };
  });

  return `
    ${renderTopbar()}
    <section class="card">
      <div class="screen">
        <div class="eyebrow">🔒 운영자용 · 이 기기에 저장된 데이터</div>
        <h2 class="prompt" style="margin-top:14px;">하트비트 실험 요약</h2>
        <p class="ghost-copy" style="text-align:left; margin-top:0;">응답은 현재 브라우���의 로컬 저장소에만 저장됩니다. 공유 서버로 전송되지 않습니다.</p>

        <div class="summary-grid">
          <div class="summary-tile"><strong>${groupA.length}</strong><span>A · 희소 정보 조건</span></div>
          <div class="summary-tile"><strong>${groupB.length}</strong><span>B · 보편 정보 조건</span></div>
        </div>

        <table class="admin-table">
          <thead>
            <tr>
              <th>평가 항목</th>
              <th>A 평균</th>
              <th>B 평균</th>
              <th>차이</th>
            </tr>
          </thead>
          <tbody>
            ${stats
              .map(
                (item) => `
                  <tr>
                    <td>${item.label}</td>
                    <td>${item.a === null ? '—' : item.a.toFixed(2)}</td>
                    <td>${item.b === null ? '—' : item.b.toFixed(2)}</td>
                    <td>${item.diff}</td>
                  </tr>
                `
              )
              .join('')}
          </tbody>
        </table>

        <div class="admin-actions">
          <button class="primary-btn" id="download-csv" ${rows.length ? '' : 'disabled'}>CSV 다운로드 ↓</button>
          <button class="secondary-btn" id="clear-data" ${rows.length ? '' : 'disabled'}>데이터 삭제</button>
        </div>

        <p class="server-note">
          실제 연구 데이터는 보안된 서버와 관리자 인증, 서버 사이드 랜덤화가 필요합니다. 이 화면은 로컬 데모용 요약입니다.
        </p>

        <button class="secondary-btn" id="back-to-test" style="width:100%; margin-top:14px;">← 테스트로 돌아가기</button>
      </div>
    </section>
  `;
}

function averageByGroup(rows, index) {
  const values = rows
    .map((row) => Number(row.ratings?.[index]))
    .filter((value) => Number.isFinite(value));

  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function render() {
  const url = new URL(window.location.href);
  const isAdmin = url.searchParams.has('admin');

  if (isAdmin) {
    app.innerHTML = renderAdmin();
    bindAdminHandlers();
    return;
  }

  if (state.step === 0) {
    app.innerHTML = renderIntro();
    bindIntroHandlers();
    return;
  }

  if (state.step >= 1 && state.step <= questionSet.length) {
    app.innerHTML = renderQuestion(state.step - 1);
    bindQuestionHandlers();
    return;
  }

  if (state.step === questionSet.length + 1) {
    app.innerHTML = renderJudgement();
    bindJudgementHandlers();
    return;
  }

  app.innerHTML = renderResult();
  bindResultHandlers();
}

function bindIntroHandlers() {
  const startBtn = document.querySelector('#start-btn');
  const consent = document.querySelector('#consent-checkbox');

  consent.addEventListener('change', (event) => {
    state.consent = event.target.checked;
    saveSession();
  });

  startBtn.addEventListener('click', () => {
    const errorNode = document.querySelector('#intro-error');

    if (!state.consent) {
      errorNode.classList.remove('hidden');
      return;
    }

    setConditionIfNeeded();
    state.step = 1;
    saveSession();
    render();
  });
}

function bindQuestionHandlers() {
  const nextBtn = document.querySelector('#next-btn');
  const prevBtn = document.querySelector('#prev-btn');

  document.querySelectorAll('.choice').forEach((button) => {
    button.addEventListener('click', () => {
      const questionIndex = Number(button.dataset.questionIndex);
      const optionIndex = Number(button.dataset.optionIndex);
      state.answers[questionIndex] = optionIndex;
      saveSession();
      render();
    });
  });

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const currentIndex = state.step - 1;
      if (state.answers[currentIndex] === null) return;

      if (state.step < questionSet.length) {
        state.step += 1;
      } else {
        state.step = questionSet.length + 1;
      }
      saveSession();
      render();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      state.step -= 1;
      saveSession();
      render();
    });
  }
}

function bindJudgementHandlers() {
  document.querySelectorAll('.rating').forEach((button) => {
    button.addEventListener('click', () => {
      const index = Number(button.dataset.ratingIndex);
      const value = Number(button.dataset.value);
      state.ratings[index] = value;
      saveSession();
      render();
    });
  });

  const finishBtn = document.querySelector('#finish-btn');
  finishBtn.addEventListener('click', () => {
    const ratingError = document.querySelector('#rating-error');

    if (state.ratings.includes(null)) {
      ratingError.classList.remove('hidden');
      return;
    }

    const response = {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      completedAt: new Date().toISOString(),
      condition: state.condition,
      answers: [...state.answers],
      ratings: [...state.ratings],
    };

    const rows = loadStoredResponses();
    rows.push(response);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));

    state.step = questionSet.length + 2;
    saveSession();
    render();
  });
}

function bindResultHandlers() {
  const restartBtn = document.querySelector('#restart-btn');
  restartBtn.addEventListener('click', () => {
    sessionStorage.removeItem(SESSION_KEY);
    state.step = 0;
    state.answers = Array(questionSet.length).fill(null);
    state.ratings = Array(ratingLabels.length).fill(null);
    state.consent = false;
    state.condition = null;
    render();
  });
}

function bindAdminHandlers() {
  const backBtn = document.querySelector('#back-to-test');
  const clearBtn = document.querySelector('#clear-data');
  const downloadBtn = document.querySelector('#download-csv');

  backBtn.addEventListener('click', () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('admin');
    window.location.href = url.toString();
  });

  clearBtn.addEventListener('click', () => {
    if (!confirm('이 브라우저에 저장된 모든 응답을 삭제할까요?')) return;
    localStorage.removeItem(STORAGE_KEY);
    render();
  });

  downloadBtn.addEventListener('click', () => {
    const rows = loadStoredResponses();
    const headers = ['id', 'completed_at', 'condition', ...questionSet.map((_, idx) => `preference_${idx + 1}`), ...ratingLabels.map((_, idx) => `rating_${idx + 1}`)];
    const csvRows = [headers];

    rows.forEach((row) => {
      csvRows.push([
        row.id,
        row.completedAt,
        row.condition,
        ...row.answers,
        ...row.ratings,
      ]);
    });

    const csv = csvRows
      .map((row) => row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\r\n');

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `heartbeat-responses-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  });
}

restoreSession();
render();
