import {
  applyAnswer,
  createSession,
  createTask,
  finishSession,
  getDifficultyMeta,
  getModeMeta,
  isFinished,
  normalizeAnswer,
  withLifetimeProgress
} from './game'

describe('game logic', () => {
  it('creates a session using difficulty defaults', () => {
    const session = createSession('medium', 'classic')
    expect(session.tasks).toHaveLength(getDifficultyMeta('medium').totalTasks)
    expect(session.hearts).toBe(getDifficultyMeta('medium').hearts)
    expect(session.config.difficulty).toBe('medium')
    expect(session.config.mode).toBe('classic')
  })

  it('creates a lightning session with adjusted task count', () => {
    const session = createSession('easy', 'lightning')
    expect(session.tasks).toHaveLength(Math.max(5, getDifficultyMeta('easy').totalTasks + getModeMeta('lightning').taskBonus))
    expect(session.config.mode).toBe('lightning')
  })

  it('creates a column arithmetic task in column mode', () => {
    const task = createTask(3, 'medium', 'columns')
    expect(['column', 'choice']).toContain(task.kind)
    if (task.kind === 'column') {
      expect(task.prompt).toContain('─')
      expect(task.options).toHaveLength(4)
      expect(task.columnLayout).toBeDefined()
      expect(task.columnLayout?.topDigits.length).toBe(task.columnLayout?.bottomDigits.length)
    }
  })

  it('normalizes boolean answers from Lithuanian labels', () => {
    expect(normalizeAnswer('Taip')).toBe(true)
    expect(normalizeAnswer('Ne')).toBe(false)
    expect(normalizeAnswer('+')).toBe('+')
  })

  it('can create an operation task with symbol answers', () => {
    const task = createTask(4, 'easy', 'classic')
    if (task.kind === 'operation') {
      expect(task.options).toEqual(['+', '-'])
      expect(['+', '-']).toContain(task.answer)
    }
  })

  it('can create a match task with expression options', () => {
    const originalRandom = Math.random
    const values = [0.9, 0.95, 0.1, 0.1, 0.1]
    let index = 0
    Math.random = () => values[index++] ?? originalRandom()

    const task = createTask(5, 'medium', 'classic')
    Math.random = originalRandom

    if (task.kind === 'match') {
      expect(typeof task.answer).toBe('string')
      expect(task.options?.length).toBeGreaterThanOrEqual(3)
    }
  })

  it('can create a story task on hard difficulty', () => {
    const originalRandom = Math.random
    const values = [0.9, 0.2]
    let index = 0
    Math.random = () => values[index++] ?? originalRandom()

    const task = createTask(1, 'hard', 'story')

    Math.random = originalRandom

    expect(task.kind).toBe('story')
    expect(typeof task.prompt).toBe('string')
    expect(task.options).toHaveLength(4)
  })

  it('rewards a correct answer with stars and streak', () => {
    const task = createTask(1, 'easy', 'classic')
    const session = withLifetimeProgress(
      {
        tasks: [{ ...task, answer: 7, kind: 'choice', options: [7, 8, 9, 10] }],
        currentIndex: 0,
        rewards: { stars: 0, streak: 0, badges: [], completed: 0, bestStreak: 0 },
        hearts: 3,
        config: { difficulty: 'easy' as const, totalTasks: 1, mode: 'classic' as const },
        lifetime: { starsCollected: 0, sessionsPlayed: 0, bestStreak: 0, badgesUnlocked: [] }
      },
      { starsCollected: 0, sessionsPlayed: 0, bestStreak: 0, badgesUnlocked: [] }
    )

    const result = applyAnswer(session, 7)
    expect(result.correct).toBe(true)
    expect(result.nextSession.rewards.stars).toBeGreaterThan(0)
    expect(result.nextSession.rewards.streak).toBe(1)
    expect(result.nextSession.rewards.bestStreak).toBe(1)
  })

  it('reduces hearts after a wrong answer', () => {
    const task = createTask(2, 'easy', 'classic')
    const session = {
      tasks: [{ ...task, answer: 3, options: [1, 2, 3, 4] }],
      currentIndex: 0,
      rewards: { stars: 0, streak: 2, badges: [], completed: 0, bestStreak: 2 },
      hearts: 3,
      config: { difficulty: 'easy' as const, totalTasks: 1, mode: 'classic' as const },
      lifetime: { starsCollected: 0, sessionsPlayed: 0, bestStreak: 0, badgesUnlocked: [] }
    }

    const result = applyAnswer(session, 1)
    expect(result.correct).toBe(false)
    expect(result.nextSession.hearts).toBe(2)
    expect(result.nextSession.rewards.streak).toBe(0)
  })

  it('accumulates lifetime progress after finishing a session', () => {
    const session = finishSession({
      ...createSession('easy', 'classic'),
      rewards: {
        stars: 8,
        streak: 0,
        completed: 5,
        badges: ['Žvaigždučių kolekcininkas'],
        bestStreak: 4
      },
      lifetime: {
        starsCollected: 10,
        sessionsPlayed: 2,
        bestStreak: 3,
        badgesUnlocked: []
      }
    })

    expect(session.lifetime.starsCollected).toBe(18)
    expect(session.lifetime.sessionsPlayed).toBe(3)
    expect(session.lifetime.badgesUnlocked).toContain('Žvaigždučių kolekcininkas')
  })

  it('finishes when hearts run out', () => {
    const session = createSession('easy', 'classic')
    session.hearts = 0
    expect(isFinished(session)).toBe(true)
  })
})
