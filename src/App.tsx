import { useEffect, useMemo, useRef, useState } from 'react'
import {
  applyAnswer,
  createSession,
  finishSession,
  getDifficultyMeta,
  getModeMeta,
  isFinished,
  progressLabel,
  withLifetimeProgress,
  type Difficulty,
  type GameMode,
  type LifetimeProgress,
  type SessionState,
  type Task
} from './game'

const STORAGE_KEY = 'skaiciuku-sodas-progress'
const SETTINGS_KEY = 'skaiciuku-sodas-settings'

const defaultLifetime: LifetimeProgress = {
  starsCollected: 0,
  sessionsPlayed: 0,
  bestStreak: 0,
  badgesUnlocked: []
}

type ParentSettings = {
  soundEnabled: boolean
}

const defaultSettings: ParentSettings = {
  soundEnabled: true
}

function readLifetimeProgress(): LifetimeProgress {
  const raw = window.localStorage.getItem(STORAGE_KEY)

  if (!raw) return defaultLifetime

  try {
    const parsed = JSON.parse(raw) as LifetimeProgress
    return {
      starsCollected: parsed.starsCollected ?? 0,
      sessionsPlayed: parsed.sessionsPlayed ?? 0,
      bestStreak: parsed.bestStreak ?? 0,
      badgesUnlocked: Array.isArray(parsed.badgesUnlocked) ? parsed.badgesUnlocked : []
    }
  } catch {
    return defaultLifetime
  }
}

function readSettings(): ParentSettings {
  const raw = window.localStorage.getItem(SETTINGS_KEY)

  if (!raw) return defaultSettings

  try {
    const parsed = JSON.parse(raw) as ParentSettings
    return {
      soundEnabled: parsed.soundEnabled ?? true
    }
  } catch {
    return defaultSettings
  }
}

function playToneSequence(kind: 'success' | 'error' | 'celebration', enabled: boolean) {
  if (!enabled) return

  const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioCtx) return

  const context = new AudioCtx()
  const master = context.createGain()
  master.connect(context.destination)
  master.gain.value = 0.04

  const notes =
    kind === 'success'
      ? [523.25, 659.25]
      : kind === 'error'
        ? [220, 196]
        : [523.25, 659.25, 783.99, 1046.5]

  notes.forEach((frequency, index) => {
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    const startAt = context.currentTime + index * 0.08
    const duration = kind === 'celebration' ? 0.14 : 0.12

    oscillator.type = kind === 'error' ? 'triangle' : 'sine'
    oscillator.frequency.setValueAtTime(frequency, startAt)
    gain.gain.setValueAtTime(0.001, startAt)
    gain.gain.exponentialRampToValueAtTime(0.2, startAt + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, startAt + duration)
    oscillator.connect(gain)
    gain.connect(master)
    oscillator.start(startAt)
    oscillator.stop(startAt + duration)
  })

  const stopAt = context.currentTime + notes.length * 0.1 + 0.2
  window.setTimeout(() => {
    void context.close()
  }, Math.ceil((stopAt - context.currentTime) * 1000))
}

function getTaskSpecificTip(task: Task) {
  if (task.kind === 'choice') {
    return task.operation === 'addition'
      ? 'Pirmiausia mintyse suskaičiuok sumą, tik tada rinkis iš variantų.'
      : 'Pirmiausia rask, kiek lieka, tik tada žiūrėk į atsakymų mygtukus.'
  }

  if (task.kind === 'missing') {
    return task.operation === 'addition'
      ? 'Pagalvok, kokio skaičiaus trūksta, kad pasiektum parodytą sumą.'
      : 'Pagalvok, kiek reikia atimti, kad liktų parodytas rezultatas.'
  }

  if (task.kind === 'compare') {
    return 'Pirma apskaičiuok veiksmą, o tik tada nuspręsk, ar teiginys teisingas.'
  }

  if (task.kind === 'story') {
    return task.operation === 'addition'
      ? 'Įsivaizduok istoriją: kai kažko prisideda daugiau, dažniausiai reikia sudėti.'
      : 'Įsivaizduok istoriją: kai kažko sumažėja ar lieka mažiau, dažniausiai reikia atimti.'
  }

  if (task.kind === 'operation') {
    return 'Pažiūrėk, ar galutinis skaičius didesnis ar mažesnis už pirmąjį - tai padės parinkti ženklą.'
  }

  if (task.kind === 'match') {
    return 'Palygink visus veiksmus po vieną ir atmesk tuos, kurių rezultatas akivaizdžiai netinka.'
  }

  if (task.kind === 'column') {
    return task.operation === 'addition'
      ? 'Stulpeliu pradėk nuo vienetų. Jei gauni daugiau nei 9, perkelk vieną dešimtį į kitą stulpelį.'
      : 'Stulpeliu pradėk nuo vienetų. Jei viršuje skaičius per mažas, pasiskolink iš kairiojo stulpelio.'
  }

  return 'Ramiai perskaityk užduotį ir spręsk žingsnis po žingsnio.'
}

function getMascotHelp({
  showWelcome,
  finished,
  feedback,
  showHint,
  task,
  streak,
  hearts,
  currentIndex,
  totalTasks
}: {
  showWelcome: boolean
  finished: boolean
  feedback: { tone: 'success' | 'error'; text: string; explanation: string } | null
  showHint: boolean
  task: Task | undefined
  streak: number
  hearts: number
  currentIndex: number
  totalTasks: number
}) {
  if (showWelcome) return 'Pasirink žaidimą ir sunkumą. Pradžioje rekomenduoju lengvą lygį.'
  if (finished) return hearts === 0 ? 'Baigėsi gyvybės, bet gali pabandyti dar kartą ir pagerinti savo seriją.' : 'Sesija baigta. Peržiūrėk rezultatą ir išsirink naują žaidimą.'
  if (!task) return 'Tuoj paruošiu kitą užduotį.'
  if (feedback?.tone === 'error') return `Atsakymas buvo neteisingas. ${task.kind === 'column' ? 'Atverk žingsnius ir sek stulpelius iš dešinės į kairę.' : getTaskSpecificTip(task)}`
  if (feedback?.tone === 'success') return streak >= 3 ? `Puiki serija - jau ${streak} iš eilės! Pereik prie kitos užduoties.` : 'Teisingai. Perskaityk paaiškinimą ir tęsk toliau.'
  if (showHint) return task.kind === 'column' ? 'Viršuje matai pagalbinius žingsnius. Pirmiausia žiūrėk į vienetus, po to į dešimtis.' : `${task.hint} ${getTaskSpecificTip(task)}`
  if (hearts === 1) return 'Liko paskutinė gyvybė. Neskubėk ir pasinaudok užuomina, jei reikia.'
  if (task.kind === 'column') return `${getTaskSpecificTip(task)} Jei reikia pagalbos, spausk „Rodyti žingsnius“.`
  return `Dabar ${currentIndex + 1}-oji užduotis iš ${totalTasks}. ${getTaskSpecificTip(task)}`
}

function ColumnProblem({ task, showSteps, revealAnswer }: { task: Task; showSteps: boolean; revealAnswer: boolean }) {
  if (!task.columnLayout) {
    return <h2 className="task-prompt">{task.prompt}</h2>
  }

  const { topDigits, bottomDigits, hintDigits, hintType, borrowHintDigits, operator } = task.columnLayout
  const showCarryHints = hintType === 'carry' && hintDigits.some(Boolean)
  const showBorrowHints = borrowHintDigits.some(Boolean)
  const resultDigits = String(task.answer).padStart(topDigits.length, ' ').split('')

  const placeClass = (index: number, total: number) => {
    const fromRight = total - index
    if (fromRight === 1) return ' ones'
    if (fromRight === 2) return ' tens'
    return ''
  }

  return (
    <div className="column-problem" aria-label="Skaičiavimo stulpeliu užduotis">
      <div className="column-grid paper-grid">
        <div className="column-hint-spacer" />
        <div className="column-hint-row">
          {topDigits.map((_, index) => {
            const carryDigit = hintDigits[index]
            const borrowDigit = borrowHintDigits[index]

            return (
            <span
              key={`hint-${index}`}
              className={`column-hint-cell${showSteps && showCarryHints && carryDigit ? ' visible carry' : ''}${showSteps && showBorrowHints && borrowDigit ? ' visible borrow' : ''}`}
            >
              {showSteps ? (showBorrowHints && borrowDigit ? borrowDigit : showCarryHints ? carryDigit : '') : ''}
            </span>
            )
          })}
        </div>

        <div className="column-operator-spacer" />
        <div className="column-number-row top">
          {topDigits.map((digit, index) => (
            <span key={`top-${index}`} className={`column-digit-cell${placeClass(index, topDigits.length)}`}>
              {digit === ' ' ? '' : digit}
            </span>
          ))}
        </div>

        <div className="column-operator">{operator}</div>
        <div className="column-number-row bottom">
          {bottomDigits.map((digit, index) => (
            <span key={`bottom-${index}`} className={`column-digit-cell accent${placeClass(index, bottomDigits.length)}`}>
              {digit === ' ' ? '' : digit}
            </span>
          ))}
        </div>

        <div className="column-operator-spacer" />
        <div className="column-line" />

        <div className="column-operator-spacer" />
        <div className="column-number-row result">
          {resultDigits.map((digit, index) => (
            <span key={`result-${index}`} className={`column-digit-cell result-cell${placeClass(index, resultDigits.length)}`}>
              {revealAnswer && digit !== ' ' ? digit : ''}
            </span>
          ))}
        </div>
      </div>

      {showSteps ? (
        <div className="column-steps">
          <strong>Žingsniai</strong>
          <span>{operator === '+' ? '1. Sudėk vienetus, tada dešimtis.' : '1. Atimk vienetus, tada dešimtis.'}</span>
          <span>{showCarryHints ? '2. Mažas skaičius viršuje rodo perkėlimą į kitą stulpelį.' : showBorrowHints ? '2. Skaičiai viršuje rodo, iš kur buvo pasiskolinta.' : '2. Sek kiekvieną stulpelį iš dešinės į kairę.'}</span>
          <span>3. Pasirink teisingą atsakymą apačioje.</span>
        </div>
      ) : null}
    </div>
  )
}

function App() {
  const didFinishSession = useRef(false)
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [mode, setMode] = useState<GameMode>('classic')
  const [lifetime, setLifetime] = useState<LifetimeProgress>(() => readLifetimeProgress())
  const [session, setSession] = useState<SessionState>(() => withLifetimeProgress(createSession('easy', 'classic'), readLifetimeProgress()))
  const [settings, setSettings] = useState<ParentSettings>(() => readSettings())
  const [selected, setSelected] = useState<number | string | boolean | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; text: string; explanation: string } | null>(null)
  const [showWelcome, setShowWelcome] = useState(true)
  const [showParentDashboard, setShowParentDashboard] = useState(false)
  const [celebrationMode, setCelebrationMode] = useState<'idle' | 'correct' | 'finish'>('idle')

  const task = session.tasks[session.currentIndex]
  const finished = isFinished(session)
  const difficultyMeta = getDifficultyMeta(difficulty)
  const modeMeta = getModeMeta(mode)
  const mascotMessage = useMemo(
    () =>
      getMascotHelp({
        showWelcome,
        finished,
        feedback,
        showHint,
        task,
        streak: session.rewards.streak,
        hearts: session.hearts,
        currentIndex: session.currentIndex,
        totalTasks: session.tasks.length
      }),
    [feedback, finished, session.currentIndex, session.hearts, session.rewards.streak, session.tasks.length, showHint, showWelcome, task]
  )

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lifetime))
  }, [lifetime])

  useEffect(() => {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  }, [settings])

  useEffect(() => {
    if (finished && !showWelcome && !didFinishSession.current) {
      didFinishSession.current = true
      const updated = finishSession(session)
      setSession(updated)
      setLifetime(updated.lifetime)
      setCelebrationMode('finish')
      playToneSequence('celebration', settings.soundEnabled)
      window.setTimeout(() => setCelebrationMode('idle'), 1500)
    }
  }, [finished, session, settings.soundEnabled, showWelcome])

  useEffect(() => {
    setFeedback(null)
  }, [session.currentIndex])

  const startGame = (nextDifficulty = difficulty, nextMode = mode) => {
    didFinishSession.current = false
    const nextSession = withLifetimeProgress(createSession(nextDifficulty, nextMode), lifetime)
    setDifficulty(nextDifficulty)
    setMode(nextMode)
    setSession(nextSession)
    setSelected(null)
    setShowHint(false)
    setFeedback(null)
    setShowWelcome(false)
    setCelebrationMode('idle')
    setShowParentDashboard(false)
  }

  const submitAnswer = () => {
    if (selected === null || !task) return
    const result = applyAnswer(session, selected)

    setFeedback({
      tone: result.correct ? 'success' : 'error',
      text: result.praise,
      explanation: result.explanation
    })
    setSession(result.nextSession)
    setSelected(null)
    setShowHint(false)
    setCelebrationMode(result.correct ? 'correct' : 'idle')
    playToneSequence(result.correct ? 'success' : 'error', settings.soundEnabled)

    if (result.correct) {
      window.setTimeout(() => setCelebrationMode('idle'), 900)
    }
  }

  const openWelcome = () => {
    didFinishSession.current = false
    setShowWelcome(true)
    setFeedback(null)
    setSelected(null)
    setShowHint(false)
    setCelebrationMode('idle')
  }

  const resetLifetimeProgress = () => {
    didFinishSession.current = false
    setLifetime(defaultLifetime)
    window.localStorage.removeItem(STORAGE_KEY)
    setSession(withLifetimeProgress(createSession(difficulty, mode), defaultLifetime))
    setShowWelcome(true)
    setFeedback(null)
    setSelected(null)
    setShowHint(false)
    setShowParentDashboard(false)
  }

  const displayedBadges = showWelcome ? lifetime.badgesUnlocked : session.rewards.badges

  return (
    <div className="page-shell">
      <div className="sun" aria-hidden="true" />
      <div className="cloud cloud-left" aria-hidden="true" />
      <div className="cloud cloud-right" aria-hidden="true" />

      <main className={`app-card${!showWelcome && !finished ? ' gameplay-active' : ''}${finished ? ' gameplay-finished' : ''}${showWelcome ? ' gameplay-welcome' : ''}`}>
        <section className="hero-panel">
          <div>
            <p className="eyebrow">Skaičiukų sodas</p>
            <h1>Sudėtis ir atimtis</h1>
          </div>

          <div className="status-strip">
            <div className="status-pill">
              <span>Užduotis</span>
              <strong>{showWelcome ? '-' : finished ? `${session.tasks.length}/${session.tasks.length}` : progressLabel(session)}</strong>
            </div>
            <div className="status-pill">
              <span>Žvaigždutės</span>
              <strong>{showWelcome ? lifetime.starsCollected : session.rewards.stars}</strong>
            </div>
            <div className="status-pill">
              <span>Gyvybės</span>
              <strong>{showWelcome ? '❤️'.repeat(difficultyMeta.hearts) : '❤️'.repeat(session.hearts)}</strong>
            </div>
          </div>
        </section>

        <section className="board-grid">
          <article className={`game-panel ${celebrationMode !== 'idle' ? `celebration-${celebrationMode}` : ''}`}>
            {celebrationMode !== 'idle' ? (
              <div className="sparkle-layer" aria-hidden="true">
                <span className="sparkle sparkle-one">★</span>
                <span className="sparkle sparkle-two">✦</span>
                <span className="sparkle sparkle-three">★</span>
                <span className="sparkle sparkle-four">✦</span>
              </div>
            ) : null}

            {showWelcome ? (
              <div className="welcome-card">
                <p className="eyebrow">Pasiruoškime žaisti</p>
                <h2>Pasirink sunkumą ir žaidimą</h2>
                <p className="welcome-copy">Kiekvienas žaidimas turi savo nuotaiką: istorijas, detektyvinius galvosūkius ar greitąjį raundą.</p>

                <div className="difficulty-grid">
                  {(['easy', 'medium', 'hard'] as Difficulty[]).map((option) => {
                    const meta = getDifficultyMeta(option)
                    const active = difficulty === option

                    return (
                      <button key={option} className={`difficulty-card${active ? ' active' : ''}`} onClick={() => setDifficulty(option)}>
                        <strong>{meta.label}</strong>
                        <span>{meta.helper}</span>
                        <small>{meta.totalTasks} užduočių · {meta.hearts} gyvybės</small>
                      </button>
                    )
                  })}
                </div>

                <div className="mode-grid">
                  {(['classic', 'story', 'detective', 'lightning', 'columns'] as GameMode[]).map((option) => {
                    const meta = getModeMeta(option)
                    const active = mode === option

                    return (
                      <button key={option} className={`mode-card${active ? ' active' : ''}`} onClick={() => setMode(option)}>
                        <strong>{meta.label}</strong>
                        <span>{meta.helper}</span>
                      </button>
                    )
                  })}
                </div>

                <div className="welcome-actions">
                  <button className="primary-button" onClick={() => startGame(difficulty, mode)}>
                    Pradėti žaidimą
                  </button>
                </div>
              </div>
            ) : finished ? (
              <div className="finish-card">
                <p className="eyebrow">Sesija baigta</p>
                <h2>Šaunuolis!</h2>
                <p>
                  Surinkai <strong>{session.rewards.stars}</strong> žvaigždutes ir įveikei <strong>{session.rewards.completed}</strong> užduotis.
                </p>
                <div className="summary-grid summary-grid-wide">
                  <div className="summary-tile">
                    <span>Geriausia serija</span>
                    <strong>{session.rewards.bestStreak}</strong>
                  </div>
                  <div className="summary-tile">
                    <span>Visos žvaigždutės</span>
                    <strong>{lifetime.starsCollected}</strong>
                  </div>
                  <div className="summary-tile">
                    <span>Visos sesijos</span>
                    <strong>{lifetime.sessionsPlayed}</strong>
                  </div>
                  <div className="summary-tile">
                    <span>Žaidimas</span>
                    <strong>{getModeMeta(session.config.mode).label}</strong>
                  </div>
                </div>
                <div className="badges-wrap">
                  {session.rewards.badges.length > 0 ? (
                    session.rewards.badges.map((badge) => (
                      <span key={badge} className="badge-chip">
                        {badge}
                      </span>
                    ))
                  ) : (
                    <span className="badge-chip muted">Kitą kartą atrakinsi pirmuosius lipdukus!</span>
                  )}
                </div>
                <div className="actions-row">
                  <button className="secondary-button" onClick={openWelcome}>
                    Keisti nustatymus
                  </button>
                  <button className="primary-button" onClick={() => startGame(difficulty, mode)}>
                    Žaisti dar kartą
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="task-header">
                  <span className="task-kind">
                    {task.kind === 'choice'
                      ? 'Pasirink atsakymą'
                      : task.kind === 'missing'
                        ? 'Rask trūkstamą skaičių'
                        : task.kind === 'column'
                          ? 'Skaičiuok stulpeliu'
                        : task.kind === 'operation'
                          ? 'Parink ženklą'
                        : task.kind === 'match'
                          ? 'Rask tinkamą veiksmą'
                        : task.kind === 'story'
                          ? 'Užduotis iš pasakojimo'
                          : 'Pasakyk, ar tiesa'}
                  </span>
                  <span className="task-operation">{task.operation === 'addition' ? 'Sudėtis' : 'Atimtis'}</span>
                </div>

                <div className="task-topline">
                  <span className="difficulty-chip">{difficultyMeta.label}</span>
                  <span className="helper-copy">{modeMeta.label}: {modeMeta.helper}</span>
                </div>

                {task.kind === 'column' ? <ColumnProblem task={task} showSteps={showHint} revealAnswer={feedback !== null} /> : <h2 className="task-prompt">{task.prompt}</h2>}

                <div className="answer-grid">
                  {task.options?.map((option) => {
                    const active = selected === option
                    return (
                      <button key={String(option)} className={`answer-button${active ? ' active' : ''}`} onClick={() => setSelected(option)}>
                        {option}
                      </button>
                    )
                  })}
                </div>

                <div className="actions-row">
                  <button className="secondary-button" onClick={() => setShowHint((value) => !value)}>
                    {task.kind === 'column' ? (showHint ? 'Slėpti žingsnius' : 'Rodyti žingsnius') : showHint ? 'Paslėpti užuominą' : 'Rodyti užuominą'}
                  </button>
                  <button className="primary-button" disabled={selected === null} onClick={submitAnswer}>
                    Tikrinti
                  </button>
                </div>

                {showHint && task.kind !== 'column' ? <div className="hint-box">{task.hint}</div> : null}

                {feedback ? (
                  <div className={`feedback-box ${feedback.tone}`}>
                    <strong>{feedback.text}</strong>
                    <span>{feedback.explanation}</span>
                  </div>
                ) : null}
              </>
            )}
          </article>

          <aside className="side-panel">
            <div className="mascot-card">
              <div className="mascot-face" aria-hidden="true">
                <span className="eye" />
                <span className="eye" />
                <span className="smile" />
              </div>
              <p>{mascotMessage}</p>
            </div>

            <div className="mini-card">
              <h3>Atlygis</h3>
              <p>Dabartinė serija: {showWelcome ? lifetime.bestStreak : session.rewards.streak}</p>
              <p>Teisingai išspręsta: {showWelcome ? 0 : session.rewards.completed}</p>
              <p>Pasirinktas žaidimas: {modeMeta.label}</p>
            </div>

            <div className="mini-card">
              <h3>Šeimos kampelis</h3>
              <p>Iš viso sesijų: {lifetime.sessionsPlayed}</p>
              <p>Surinkta žvaigždučių: {lifetime.starsCollected}</p>
              <p>Geriausia serija: {lifetime.bestStreak}</p>
            </div>

            <div className="mini-card">
              <h3>Lipdukai</h3>
              <div className="badges-wrap">
                {displayedBadges.length > 0 ? (
                  displayedBadges.map((badge) => (
                    <span key={badge} className="badge-chip">
                      {badge}
                    </span>
                  ))
                ) : (
                  <span className="badge-chip muted">Dar renkami pirmieji lipdukai</span>
                )}
              </div>
            </div>
          </aside>
        </section>
      </main>

      <button className="home-fab" aria-label="Grįžti į pradžios puslapį" onClick={openWelcome}>
        ⌂
      </button>

      <button className="parent-fab" aria-label="Atidaryti tėvų skydelį" onClick={() => setShowParentDashboard(true)}>
        ⚙
      </button>

      {showParentDashboard ? (
        <div className="overlay" role="dialog" aria-modal="true" aria-label="Tėvų skydelis">
          <div className="parent-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Tėvų skydelis</p>
                <h2>Pažanga ir valdymas</h2>
              </div>
              <button className="secondary-button" onClick={() => setShowParentDashboard(false)}>
                Uždaryti
              </button>
            </div>

            <div className="parent-grid">
              <div className="mini-card">
                <h3>Bendra pažanga</h3>
                <p>Sesijų sužaista: {lifetime.sessionsPlayed}</p>
                <p>Žvaigždučių surinkta: {lifetime.starsCollected}</p>
                <p>Geriausia serija: {lifetime.bestStreak}</p>
                <p>Lipdukų atrakinta: {lifetime.badgesUnlocked.length}</p>
                <p>Pasirinktas žaidimas: {modeMeta.label}</p>
              </div>

              <div className="mini-card">
                <h3>Nustatymai</h3>
                <label className="toggle-row">
                  <span>Garso efektai</span>
                  <button className={`toggle-button${settings.soundEnabled ? ' active' : ''}`} onClick={() => setSettings((current) => ({ ...current, soundEnabled: !current.soundEnabled }))}>
                    {settings.soundEnabled ? 'Įjungta' : 'Išjungta'}
                  </button>
                </label>
                <p>Dabartinis sunkumas: {difficultyMeta.label}</p>
                <p>Dabartinis žaidimas: {modeMeta.label}</p>
                <p>Užduočių per sesiją: {session.config.totalTasks}</p>
              </div>

              <div className="mini-card">
                <h3>Valdymas</h3>
                <div className="dashboard-actions">
                  <button className="secondary-button" onClick={() => startGame(difficulty, mode)}>
                    Pradėti naują sesiją
                  </button>
                  <button className="danger-button" onClick={resetLifetimeProgress}>
                    Išvalyti pažangą
                  </button>
                </div>
                <p className="parent-note">Išvalius pažangą bus panaikintos sukauptos žvaigždutės, sesijos ir lipdukai.</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default App
