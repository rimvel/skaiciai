export type Operation = 'addition' | 'subtraction'
export type TaskKind = 'choice' | 'missing' | 'compare' | 'story' | 'column' | 'operation' | 'match' | 'numberline' | 'bond'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type GameMode = 'classic' | 'story' | 'detective' | 'lightning' | 'columns' | 'learn10' | 'numberline' | 'make10'

export type Task = {
  id: number
  operation: Operation
  kind: TaskKind
  prompt: string
  answer: number | boolean | string
  options?: Array<number | string>
  hint: string
  explanation: string
  columnLayout?: ColumnLayout
  numberLineModel?: NumberLineModel
  bondModel?: BondModel
}

export type NumberLineModel = {
  start: number
  change: number
  target: number
  min: number
  max: number
}

export type BondModel = {
  whole: number
  left: number | null
  right: number | null
}

export type ColumnLayout = {
  topDigits: string[]
  bottomDigits: string[]
  hintDigits: string[]
  hintType: 'carry' | null
  borrowHintDigits: string[]
  operator: '+' | '-'
}

export type RewardState = {
  stars: number
  streak: number
  badges: string[]
  completed: number
  bestStreak: number
}

export type SessionConfig = {
  difficulty: Difficulty
  totalTasks: number
  mode: GameMode
}

export type LifetimeProgress = {
  starsCollected: number
  sessionsPlayed: number
  bestStreak: number
  badgesUnlocked: string[]
}

export type SessionState = {
  tasks: Task[]
  currentIndex: number
  rewards: RewardState
  hearts: number
  config: SessionConfig
  lifetime: LifetimeProgress
  history: AnswerHistoryEntry[]
}

export type AnswerHistoryEntry = {
  taskId: number
  kind: TaskKind
  operation: Operation
  prompt: string
  chosenAnswer: number | boolean | string
  correctAnswer: number | boolean | string
  correct: boolean
  explanation: string
}

export type SessionSummary = {
  correctCount: number
  wrongCount: number
  accuracy: number
  hardestKind: TaskKind | null
  hardestOperation: Operation | null
  mainMistake: string
  teachingFocus: string
}

export type AnswerResult = {
  correct: boolean
  praise: string
  explanation: string
  chosenAnswer: number | boolean | string
  correctAnswer: number | boolean | string
  teachingText: string
  nextSession: SessionState
}

type DifficultySettings = {
  additionRange: [number, number]
  subtractionRange: [number, number]
  threshold: number
  hearts: number
  totalTasks: number
  label: string
  helper: string
}

type ModeMeta = {
  label: string
  helper: string
  taskKinds: TaskKind[]
  operationBias: Operation[]
  taskBonus: number
}

const praise = ['Puiku!', 'Šauniai padirbėjai!', 'Valio, pavyko!', 'Tu tikras skaičiukų herojus!']

const difficultySettings: Record<Difficulty, DifficultySettings> = {
  easy: {
    additionRange: [1, 10],
    subtractionRange: [4, 12],
    threshold: 10,
    hearts: 4,
    totalTasks: 12,
    label: 'Lengvas',
    helper: 'Mažesni skaičiai ir daugiau gyvybių.'
  },
  medium: {
    additionRange: [2, 15],
    subtractionRange: [6, 18],
    threshold: 12,
    hearts: 3,
    totalTasks: 16,
    label: 'Vidutinis',
    helper: 'Daugiau įvairovės ir šiek tiek spartesnis tempas.'
  },
  hard: {
    additionRange: [4, 20],
    subtractionRange: [8, 25],
    threshold: 15,
    hearts: 3,
    totalTasks: 20,
    label: 'Iššūkis',
    helper: 'Didesni skaičiai ir gudresnės užduotys.'
  }
}

const gameModes: Record<GameMode, ModeMeta> = {
  classic: {
    label: 'Klasika',
    helper: 'Įvairios užduotys su sudėtimi ir atimtimi.',
    taskKinds: ['choice', 'missing', 'compare', 'story', 'operation', 'match'],
    operationBias: ['addition', 'subtraction'],
    taskBonus: 0
  },
  story: {
    label: 'Pasakojimų kelias',
    helper: 'Daugiau linksmų istorijų ir situacijų iš kasdienybės.',
    taskKinds: ['story', 'story', 'choice', 'missing', 'match'],
    operationBias: ['addition', 'subtraction'],
    taskBonus: 0
  },
  detective: {
    label: 'Skaičių detektyvas',
    helper: 'Rask trūkstamus skaičius ir patikrink, ar teiginys teisingas.',
    taskKinds: ['missing', 'compare', 'missing', 'choice', 'operation', 'match'],
    operationBias: ['addition', 'subtraction', 'subtraction'],
    taskBonus: 2
  },
  lightning: {
    label: 'Žaibo raundas',
    helper: 'Trumpesnis ir greitesnis raundas su aiškiais atsakymais.',
    taskKinds: ['choice', 'choice', 'compare', 'operation'],
    operationBias: ['addition', 'addition', 'subtraction'],
    taskBonus: -4
  },
  columns: {
    label: 'Stulpeliu',
    helper: 'Sudėtis ir atimtis stulpeliu su tvarkingu skaičių išdėstymu.',
    taskKinds: ['column'],
    operationBias: ['addition', 'subtraction'],
    taskBonus: -2
  },
  learn10: {
    label: 'Iki 10',
    helper: 'Pirmieji žingsniai: skaičiuojame ir sprendžiame iki 10.',
    taskKinds: ['choice', 'missing', 'story', 'compare'],
    operationBias: ['addition', 'subtraction'],
    taskBonus: -2
  },
  numberline: {
    label: 'Skaičių tiesė',
    helper: 'Mokomės judėti pirmyn ir atgal skaičių tiesėje.',
    taskKinds: ['numberline'],
    operationBias: ['addition', 'subtraction'],
    taskBonus: -3
  },
  make10: {
    label: 'Dešimties draugai',
    helper: 'Mokomės, kurie du skaičiai kartu sudaro 10.',
    taskKinds: ['bond'],
    operationBias: ['addition'],
    taskBonus: -4
  }
}

const badgeRules = [
  { name: 'Žvaigždučių kolekcininkas', stars: 6 },
  { name: 'Kantrus sprendėjas', completed: 4 },
  { name: 'Skaičiukų meistras', stars: 12 },
  { name: 'Serijos čempionas', streak: 5 }
]

const storyTemplates = {
  addition: [
    (a: number, b: number, total: number) => ({
      prompt: `Mildos krepšelyje yra ${a} ${formatCount(a, 'obuolys', 'obuoliai', 'obuolių')}. Senelis įdėjo dar ${b}. Kiek obuolių dabar yra krepšelyje?`,
      hint: `Pradėk nuo ${a} ir pridėk dar ${b}.`,
      explanation: `Krepšelyje buvo ${a} ${formatCount(a, 'obuolys', 'obuoliai', 'obuolių')}, senelis įdėjo dar ${b}, todėl dabar ten yra ${total} ${formatCount(total, 'obuolys', 'obuoliai', 'obuolių')}.`
    }),
    (a: number, b: number, total: number) => ({
      prompt: `Bokšte jau yra ${a} ${formatCount(a, 'kaladėlė', 'kaladėlės', 'kaladėlių')}. Tomas pridėjo dar ${b}. Kiek kaladėlių dabar yra bokšte?`,
      hint: `Suskaičiuok abi kaladėlių grupes kartu.`,
      explanation: `${a} + ${b} = ${total}, taigi bokšte yra ${total} kaladėlių.`
    }),
    (a: number, b: number, total: number) => ({
      prompt: `Piešinyje jau yra ${a} ${formatCount(a, 'gėlė', 'gėlės', 'gėlių')}. Ema nupiešė dar ${b}. Kiek gėlių dabar yra piešinyje?`,
      hint: `Sujunk abi gėlių grupes į vieną bendrą skaičių.`,
      explanation: `Piešinyje buvo ${a} ${formatCount(a, 'gėlė', 'gėlės', 'gėlių')}, Ema nupiešė dar ${b}, todėl dabar piešinyje yra ${total} ${formatCount(total, 'gėlė', 'gėlės', 'gėlių')}.`
    }),
    (a: number, b: number, total: number) => ({
      prompt: `Krepšelyje yra ${a} ${formatCount(a, 'kriaušė', 'kriaušės', 'kriaušių')}. Mama įdėjo dar ${b}. Kiek kriaušių dabar yra krepšelyje?`,
      hint: `Kai kažko įdedama daugiau, reikia sudėti.`,
      explanation: `${a} + ${b} = ${total}, todėl krepšelyje dabar yra ${total} ${formatCount(total, 'kriaušė', 'kriaušės', 'kriaušių')}.`
    })
  ],
  subtraction: [
    (a: number, b: number, difference: number) => ({
      prompt: `Ant stalo buvo ${a} ${formatCount(a, 'sausainis', 'sausainiai', 'sausainių')}. Vaikai suvalgė ${b}. Kiek sausainių liko?`,
      hint: `Pagalvok, kiek lieka, kai iš ${a} atimi ${b}.`,
      explanation: `Buvo ${a} ${formatCount(a, 'sausainis', 'sausainiai', 'sausainių')}, suvalgė ${b}, todėl liko ${difference}.`
    }),
    (a: number, b: number, difference: number) => ({
      prompt: `Žaislų dėžėje buvo ${a} ${formatCount(a, 'mašinėlė', 'mašinėlės', 'mašinėlių')}. Į lentyną padėjome ${b}. Kiek mašinėlių liko dėžėje?`,
      hint: `Iš bendro skaičiaus ${a} atimk ${b}.`,
      explanation: `${a} - ${b} = ${difference}, todėl dėžėje liko ${difference} mašinėlių.`
    }),
    (a: number, b: number, difference: number) => ({
      prompt: `Ant lentos buvo ${a} ${formatCount(a, 'lipdukas', 'lipdukai', 'lipdukų')}. ${b} nuėmėme. Kiek lipdukų liko?`,
      hint: `Kai dalį nuimame, skaičius sumažėja.`,
      explanation: `${a} - ${b} = ${difference}, todėl ant lentos liko ${difference} lipdukų.`
    }),
    (a: number, b: number, difference: number) => ({
      prompt: `Luko kambaryje buvo ${a} ${formatCount(a, 'balionas', 'balionai', 'balionų')}. ${b} jis padovanojo draugui. Kiek balionų liko?`,
      hint: `Pagalvok, kiek lieka po dovanojimo.`,
      explanation: `Luko kambaryje buvo ${a} ${formatCount(a, 'balionas', 'balionai', 'balionų')}, jis padovanojo ${b}, todėl liko ${difference} ${formatCount(difference, 'balionas', 'balionai', 'balionų')}.`
    })
  ]
}

const promptVariants = {
  additionChoice: [
    (a: number, b: number) => `Kiek bus ${a} + ${b}?`,
    (a: number, b: number) => `Suskaičiuok: ${a} + ${b}`,
    (a: number, b: number) => `Kiek gausime sudėję ${a} ir ${b}?`
  ],
  subtractionChoice: [
    (a: number, b: number) => `Kiek bus ${a} - ${b}?`,
    (a: number, b: number) => `Suskaičiuok: ${a} - ${b}`,
    (a: number, b: number) => `Kiek lieka, jei iš ${a} atimame ${b}?`
  ],
  additionMissing: [
    (a: number, total: number) => `${a} + ? = ${total}`,
    (a: number, total: number) => `Koks skaičius tinka: ${a} + ? = ${total}?`,
    (a: number, total: number) => `Užpildyk langelį: ${a} + ? = ${total}`
  ],
  subtractionMissing: [
    (a: number, difference: number) => `${a} - ? = ${difference}`,
    (a: number, difference: number) => `Ką reikia atimti iš ${a}, kad liktų ${difference}?`,
    (a: number, difference: number) => `Užpildyk langelį: ${a} - ? = ${difference}`
  ],
  additionCompare: [
    (a: number, b: number, threshold: number) => `Ar tiesa, kad ${a} + ${b} yra daugiau nei ${threshold}?`,
    (a: number, b: number, threshold: number) => `Ar suma ${a} + ${b} didesnė už ${threshold}?`,
    (a: number, b: number, threshold: number) => `Patikrink: ar ${a} + ${b} > ${threshold}?`
  ],
  subtractionCompare: [
    (a: number, b: number, edge: number) => `Ar tiesa, kad ${a} - ${b} yra mažiau nei ${edge}?`,
    (a: number, b: number, edge: number) => `Ar skirtumas ${a} - ${b} mažesnis už ${edge}?`,
    (a: number, b: number, edge: number) => `Patikrink: ar ${a} - ${b} < ${edge}?`
  ]
}

function formatCount(count: number, singular: string, few: string, many: string) {
  const remainder10 = count % 10
  const remainder100 = count % 100

  if (remainder10 === 1 && remainder100 !== 11) return singular
  if (remainder10 >= 2 && remainder10 <= 9 && (remainder100 < 11 || remainder100 > 19)) return few
  return many
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pickOne<T>(items: T[]) {
  return items[randomInt(0, items.length - 1)]
}

function sampleOptions(answer: number) {
  const set = new Set<number>([answer])

  while (set.size < 4) {
    const candidate = Math.max(0, answer + randomInt(-5, 5))
    set.add(candidate)
  }

  return Array.from(set).sort(() => Math.random() - 0.5)
}

function sampleExpressions(correct: string, distractors: string[]) {
  const unique = Array.from(new Set([correct, ...distractors]))

  const match = correct.match(/(\d+)\s*([+-])\s*(\d+)/)
  let filler = 1
  while (unique.length < 4) {
    const candidate = match
      ? `${Number(match[1]) + filler} ${match[2]} ${Math.max(0, Number(match[3]) - filler)}`
      : `${correct}`
    if (!unique.includes(candidate)) {
      unique.push(candidate)
    }
    filler += 1
  }

  return unique.sort(() => Math.random() - 0.5).slice(0, 4)
}

function withModeRanges(settings: DifficultySettings, mode: GameMode): DifficultySettings {
  if (mode === 'learn10' || mode === 'make10') {
    return {
      ...settings,
      additionRange: [0, 10],
      subtractionRange: [0, 10],
      threshold: 8
    }
  }

  if (mode === 'numberline') {
    return {
      ...settings,
      additionRange: settings.label === 'Lengvas' ? [0, 10] : [0, 20],
      subtractionRange: settings.label === 'Lengvas' ? [0, 10] : [0, 20],
      threshold: 10
    }
  }

  return settings
}

function getBadgeAwards(rewards: RewardState) {
  return badgeRules
    .filter((badge) => {
      if (badge.stars !== undefined) return rewards.stars >= badge.stars
      if (badge.completed !== undefined) return rewards.completed >= badge.completed
      if (badge.streak !== undefined) return rewards.bestStreak >= badge.streak
      return false
    })
    .map((badge) => badge.name)
}

function formatColumnPrompt(a: number, b: number, symbol: '+' | '-') {
  const digitsWidth = Math.max(String(a).length, String(b).length)
  const line1 = ` ${String(a).padStart(digitsWidth, ' ')}`
  const line2 = `${symbol}${String(b).padStart(digitsWidth, ' ')}`
  const line3 = ` ${'─'.repeat(digitsWidth)}`
  return `${line1}\n${line2}\n${line3}`
}

function toDigits(value: number, width: number) {
  return String(value)
    .padStart(width, ' ')
    .split('')
}

function createColumnLayout(a: number, b: number, operator: '+' | '-'): ColumnLayout {
  const width = Math.max(String(a).length, String(b).length)
  const topDigits = toDigits(a, width)
  const bottomDigits = toDigits(b, width)
  const hintDigits = Array.from({ length: width }, () => '')
  const borrowHintDigits = Array.from({ length: width }, () => '')

  if (operator === '+') {
    let carry = 0
    for (let index = width - 1; index >= 0; index -= 1) {
      const top = topDigits[index] === ' ' ? 0 : Number(topDigits[index])
      const bottom = bottomDigits[index] === ' ' ? 0 : Number(bottomDigits[index])
      const sum = top + bottom + carry
      carry = sum >= 10 ? 1 : 0
      if (carry === 1 && index > 0) {
        hintDigits[index - 1] = '1'
      }
    }
  } else {
    let borrow = 0
    for (let index = width - 1; index >= 0; index -= 1) {
      const top = topDigits[index] === ' ' ? 0 : Number(topDigits[index])
      const bottom = bottomDigits[index] === ' ' ? 0 : Number(bottomDigits[index])
      if (top - borrow < bottom && index > 0) {
        const leftDigit = topDigits[index - 1] === ' ' ? 0 : Number(topDigits[index - 1])
        borrowHintDigits[index - 1] = String(Math.max(0, leftDigit - 1))
        borrowHintDigits[index] = String(top + 10)
        borrow = 1
      } else {
        borrow = 0
      }
    }
  }

  return {
    topDigits,
    bottomDigits,
    hintDigits,
    hintType: hintDigits.some(Boolean) ? 'carry' : null,
    borrowHintDigits,
    operator
  }
}

function createNumberLineTask(id: number, settings: DifficultySettings): Task {
  const operation: Operation = Math.random() > 0.45 ? 'addition' : 'subtraction'

  if (operation === 'addition') {
    const start = randomInt(settings.additionRange[0], Math.max(settings.additionRange[0], settings.additionRange[1] - 4))
    const change = randomInt(1, Math.min(4, settings.additionRange[1] - start))
    const target = start + change

    return {
      id,
      operation,
      kind: 'numberline',
      prompt: `Pradėk nuo ${start} ir paeik ${change} žingsnius pirmyn. Kur atsidursi?`,
      answer: target,
      options: sampleOptions(target),
      hint: 'Skaičių tiesėje sudėtis reiškia judėjimą į dešinę.',
      explanation: `Pradėję nuo ${start} ir paėję ${change} žingsnius pirmyn, atsiduriame ties ${target}.`,
      numberLineModel: { start, change, target, min: 0, max: Math.max(10, target + 2) }
    }
  }

  const start = randomInt(3, settings.subtractionRange[1])
  const change = randomInt(1, Math.min(4, start))
  const target = start - change

  return {
    id,
    operation,
    kind: 'numberline',
    prompt: `Pradėk nuo ${start} ir paeik ${change} žingsnius atgal. Kur atsidursi?`,
    answer: target,
    options: sampleOptions(target),
    hint: 'Skaičių tiesėje atimtis reiškia judėjimą į kairę.',
    explanation: `Pradėję nuo ${start} ir paėję ${change} žingsnius atgal, atsiduriame ties ${target}.`,
    numberLineModel: { start, change: -change, target, min: 0, max: Math.max(10, start + 2) }
  }
}

function createBondTask(id: number): Task {
  const whole = 10
  const left = randomInt(0, 10)
  const right = whole - left
  const askLeft = Math.random() > 0.5
  const missingAnswer = askLeft ? left : right

  return {
    id,
    operation: 'addition',
    kind: 'bond',
    prompt: askLeft ? `Koks skaičius kartu su ${right} sudaro 10?` : `Koks skaičius kartu su ${left} sudaro 10?`,
    answer: missingAnswer,
    options: sampleOptions(missingAnswer),
    hint: 'Pagalvok, kiek dar trūksta iki 10.',
    explanation: `${left} ir ${right} kartu sudaro 10.`,
    bondModel: {
      whole,
      left: askLeft ? null : left,
      right: askLeft ? right : null
    }
  }
}

function createAdditionTask(id: number, kind: TaskKind, settings: DifficultySettings, mode: GameMode): Task {
  const [min, max] = settings.additionRange
  const a = randomInt(min, max)
  const b = randomInt(min, max)
  const total = a + b

  if (kind === 'choice') {
    return {
      id,
      operation: 'addition',
      kind,
      prompt: mode === 'lightning' ? `${a} + ${b} = ?` : pickOne(promptVariants.additionChoice)(a, b),
      answer: total,
      options: sampleOptions(total),
      hint: `Pradėk nuo ${a} ir suskaičiuok dar ${b}.`,
      explanation: `${a} pridėjus ${b}, gauname ${total}.`
    }
  }

  if (kind === 'missing') {
    return {
      id,
      operation: 'addition',
      kind,
      prompt: mode === 'detective' ? `Detektyvo užduotis: ${pickOne(promptVariants.additionMissing)(a, total)}` : pickOne(promptVariants.additionMissing)(a, total),
      answer: b,
      options: sampleOptions(b),
      hint: `Pagalvok, kiek reikia pridėti prie ${a}, kad gautum ${total}.`,
      explanation: `Kad iš ${a} pasiektum ${total}, reikia pridėti ${b}.`
    }
  }

  if (kind === 'compare') {
    const comparison = total > settings.threshold
    return {
      id,
      operation: 'addition',
      kind,
      prompt:
        mode === 'detective'
          ? `Užuomina detektyvui: ${pickOne(promptVariants.additionCompare)(a, b, settings.threshold)}`
          : pickOne(promptVariants.additionCompare)(a, b, settings.threshold),
      answer: comparison,
      options: ['Taip', 'Ne'],
      hint: `Pirmiausia suskaičiuok sumą, o tada palygink ją su ${settings.threshold}.`,
      explanation: `${a} + ${b} = ${total}, todėl atsakymas yra ${comparison ? 'Taip' : 'Ne'}.`
    }
  }

  if (kind === 'operation') {
    return {
      id,
      operation: 'addition',
      kind,
      prompt: `${a} ? ${b} = ${total}`,
      answer: '+',
      options: ['+', '-'],
      hint: `Pagalvok, ar skaičius turi padidėti, ar sumažėti.`,
      explanation: `Kad gautume ${total}, tarp ${a} ir ${b} reikia ženklo +.`
    }
  }

  if (kind === 'match') {
    const wrong1 = `${a} - ${b}`
    const wrong2 = `${Math.max(1, a - 1)} + ${b}`
    const wrong3 = `${total + 2} - 2`
    const correct = `${a} + ${b}`

    return {
      id,
      operation: 'addition',
      kind,
      prompt: `Kuris veiksmas duoda atsakymą ${total}?`,
      answer: correct,
      options: sampleExpressions(correct, [wrong1, wrong2, wrong3]),
      hint: `Mintyse paskaičiuok kiekvieną veiksmą ir surask tą, kuris duoda ${total}.`,
      explanation: `${a} + ${b} = ${total}, todėl tai teisingas pasirinkimas.`
    }
  }

  if (kind === 'column') {
    return {
      id,
      operation: 'addition',
      kind,
      prompt: formatColumnPrompt(a, b, '+'),
      answer: total,
      options: sampleOptions(total),
      hint: `Sudėk vienetus, tada dešimtis. Jei reikia, prisimink perkėlimą.`,
      explanation: `${a} + ${b} = ${total}. Skaičiuojant stulpeliu pirmiausia sudedami vienetai, po to dešimtys.`,
      columnLayout: createColumnLayout(a, b, '+')
    }
  }

  const story = pickOne(storyTemplates.addition)(a, b, total)
  return {
    id,
    operation: 'addition',
    kind,
    prompt: story.prompt,
    answer: total,
    options: sampleOptions(total),
    hint: story.hint,
    explanation: story.explanation
  }
}

function createSubtractionTask(id: number, kind: TaskKind, settings: DifficultySettings, mode: GameMode): Task {
  const [min, max] = settings.subtractionRange
  const a = randomInt(min, max)
  const b = randomInt(0, a)
  const difference = a - b

  if (kind === 'choice') {
    return {
      id,
      operation: 'subtraction',
      kind,
      prompt: mode === 'lightning' ? `${a} - ${b} = ?` : pickOne(promptVariants.subtractionChoice)(a, b),
      answer: difference,
      options: sampleOptions(difference),
      hint: `Iš ${a} atimk ${b} po truputį.`,
      explanation: `${a} atėmus ${b}, lieka ${difference}.`
    }
  }

  if (kind === 'missing') {
    return {
      id,
      operation: 'subtraction',
      kind,
      prompt: mode === 'detective' ? `Rask pasislėpusį skaičių: ${pickOne(promptVariants.subtractionMissing)(a, difference)}` : pickOne(promptVariants.subtractionMissing)(a, difference),
      answer: b,
      options: sampleOptions(b),
      hint: `Pagalvok, kiek turi dingti iš ${a}, kad liktų ${difference}.`,
      explanation: `Iš ${a} atėmus ${b}, lieka ${difference}.`
    }
  }

  if (kind === 'compare') {
    const edge = Math.max(5, settings.threshold - 5)
    const comparison = difference < edge
    return {
      id,
      operation: 'subtraction',
      kind,
      prompt:
        mode === 'detective'
          ? `Patikrink pėdsaką: ${pickOne(promptVariants.subtractionCompare)(a, b, edge)}`
          : pickOne(promptVariants.subtractionCompare)(a, b, edge),
      answer: comparison,
      options: ['Taip', 'Ne'],
      hint: `Pirmiausia rask skirtumą, o tada palygink jį su nurodytu skaičiumi.`,
      explanation: `${a} - ${b} = ${difference}, todėl atsakymas yra ${comparison ? 'Taip' : 'Ne'}.`
    }
  }

  if (kind === 'operation') {
    return {
      id,
      operation: 'subtraction',
      kind,
      prompt: `${a} ? ${b} = ${difference}`,
      answer: '-',
      options: ['+', '-'],
      hint: `Pagalvok, ar rezultatas turi būti mažesnis už pirmą skaičių.`,
      explanation: `Kad gautume ${difference}, tarp ${a} ir ${b} reikia ženklo -.`
    }
  }

  if (kind === 'match') {
    const wrong1 = `${a} + ${b}`
    const wrong2 = `${difference} + ${b}`
    const wrong3 = `${a} - ${Math.max(0, b - 1)}`
    const correct = `${a} - ${b}`

    return {
      id,
      operation: 'subtraction',
      kind,
      prompt: `Kuris veiksmas duoda atsakymą ${difference}?`,
      answer: correct,
      options: sampleExpressions(correct, [wrong1, wrong2, wrong3]),
      hint: `Patikrink, kuris veiksmas palieka ${difference}.`,
      explanation: `${a} - ${b} = ${difference}, todėl tai teisingas pasirinkimas.`
    }
  }

  if (kind === 'column') {
    return {
      id,
      operation: 'subtraction',
      kind,
      prompt: formatColumnPrompt(a, b, '-'),
      answer: difference,
      options: sampleOptions(difference),
      hint: `Atimk vienetus, po to dešimtis. Jei reikia, pasiskolink iš kairės pusės.`,
      explanation: `${a} - ${b} = ${difference}. Skaičiuojant stulpeliu pirmiausia atimami vienetai, po to dešimtys.`,
      columnLayout: createColumnLayout(a, b, '-')
    }
  }

  const story = pickOne(storyTemplates.subtraction)(a, b, difference)
  return {
    id,
    operation: 'subtraction',
    kind,
    prompt: story.prompt,
    answer: difference,
    options: sampleOptions(difference),
    hint: story.hint,
    explanation: story.explanation
  }
}

export function getDifficultyMeta(difficulty: Difficulty) {
  return difficultySettings[difficulty]
}

export function getModeMeta(mode: GameMode) {
  return gameModes[mode]
}

export function createTask(id: number, difficulty: Difficulty = 'easy', mode: GameMode = 'classic'): Task {
  const settings = withModeRanges(difficultySettings[difficulty], mode)
  const meta = gameModes[mode]
  if (mode === 'numberline') return createNumberLineTask(id, settings)
  if (mode === 'make10') return createBondTask(id)
  const operation = pickOne(meta.operationBias)
  const kind = pickOne(meta.taskKinds)

  return operation === 'addition'
    ? createAdditionTask(id, kind, settings, mode)
    : createSubtractionTask(id, kind, settings, mode)
}

export function createSession(difficulty: Difficulty = 'easy', mode: GameMode = 'classic'): SessionState {
  const settings = withModeRanges(difficultySettings[difficulty], mode)
  const meta = gameModes[mode]
  const totalTasks = Math.max(5, settings.totalTasks + meta.taskBonus)

  return {
    tasks: Array.from({ length: totalTasks }, (_, index) => createTask(index + 1, difficulty, mode)),
    currentIndex: 0,
    rewards: {
      stars: 0,
      streak: 0,
      badges: [],
      completed: 0,
      bestStreak: 0
    },
    hearts: settings.hearts,
    config: {
      difficulty,
      totalTasks,
      mode
    },
    lifetime: {
      starsCollected: 0,
      sessionsPlayed: 0,
      bestStreak: 0,
      badgesUnlocked: []
    },
    history: []
  }
}

export function normalizeAnswer(value: number | string | boolean) {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value
  if (value === 'Taip') return true
  if (value === 'Ne') return false
  if (/^-?\d+$/.test(value)) return Number(value)
  return value
}

export function withLifetimeProgress(session: SessionState, lifetime: LifetimeProgress) {
  return {
    ...session,
    lifetime
  }
}

function teachingTextForTask(task: Task, chosenAnswer: number | boolean | string) {
  const chosenLabel = typeof chosenAnswer === 'boolean' ? (chosenAnswer ? 'Taip' : 'Ne') : String(chosenAnswer)
  const correctLabel = typeof task.answer === 'boolean' ? (task.answer ? 'Taip' : 'Ne') : String(task.answer)

  if (task.kind === 'missing') {
      return `Tavo atsakymas: ${chosenLabel}. Teisingas atsakymas: ${correctLabel}. Pirmiausia pažiūrime, kokio skaičiaus trūksta, kad lygybė būtų teisinga. ${task.explanation}`
  }

  if (task.kind === 'compare') {
      return `Tavo atsakymas: ${chosenLabel}. Teisingas atsakymas: ${correctLabel}. Tokiose užduotyse pirmiausia apskaičiuojame veiksmą, o tik po to lyginame. ${task.explanation}`
  }

  if (task.kind === 'operation') {
    return `Tavo atsakymas: ${chosenLabel}. Teisingas ženklas: ${correctLabel}. Reikia pažiūrėti, ar rezultatas turi padidėti, ar sumažėti. ${task.explanation}`
  }

  if (task.kind === 'match') {
    return `Tavo pasirinkimas: ${chosenLabel}. Teisingas veiksmas: ${correctLabel}. Verta mintyse pasitikrinti kiekvieną veiksmą po vieną. ${task.explanation}`
  }

  if (task.kind === 'column') {
    return `Tavo atsakymas: ${chosenLabel}. Teisingas atsakymas: ${correctLabel}. Skaičiuojant stulpeliu pradedame nuo dešinės pusės. ${task.explanation}`
  }

  return `Tavo atsakymas: ${chosenLabel}. Teisingas atsakymas: ${correctLabel}. ${task.explanation}`
}

function getMainMistakeMessage(history: AnswerHistoryEntry[]) {
  const wrong = history.filter((entry) => !entry.correct)
  if (wrong.length === 0) return 'Šį kartą klaidų beveik nebuvo, puikus darbas.'

  const byKind = new Map<TaskKind, number>()
  const byOperation = new Map<Operation, number>()
  for (const entry of wrong) {
    byKind.set(entry.kind, (byKind.get(entry.kind) ?? 0) + 1)
    byOperation.set(entry.operation, (byOperation.get(entry.operation) ?? 0) + 1)
  }

  const hardestKind = [...byKind.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]
  const hardestOperation = [...byOperation.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]

  if (hardestKind === 'column') return 'Daugiausia klaidų buvo stulpeliu užduotyse, todėl verta lėčiau sekti vienetus ir dešimtis.'
  if (hardestKind === 'missing') return 'Dažniausiai suklydai ieškodamas trūkstamo skaičiaus, todėl verta pagalvoti, ko trūksta iki galutinio atsakymo.'
  if (hardestKind === 'compare') return 'Dažniausiai suklydai lyginimo užduotyse, todėl pirmiausia apskaičiuok veiksmą, o tik tada lygink.'
  if (hardestKind === 'operation') return 'Dažniausiai suklydai rinkdamasis ženklą, todėl stebėk, ar rezultatas didėja, ar mažėja.'
  if (hardestOperation === 'subtraction') return 'Atimties užduotys buvo sunkesnės, todėl verta dar kartą pasitreniruoti, kiek lieka atėmus.'
  return 'Kai kuriose užduotyse verta neskubėti ir pasitikrinti skaičiavimą dar kartą.'
}

export function summarizeSession(session: SessionState): SessionSummary {
  const total = session.history.length
  const correctCount = session.history.filter((entry) => entry.correct).length
  const wrongCount = total - correctCount
  const accuracy = total === 0 ? 0 : Math.round((correctCount / total) * 100)

  const wrong = session.history.filter((entry) => !entry.correct)
  const hardestKind = wrong.length ? wrong.reduce<Record<string, number>>((acc, entry) => {
    acc[entry.kind] = (acc[entry.kind] ?? 0) + 1
    return acc
  }, {}) : null
  const hardestOperation = wrong.length ? wrong.reduce<Record<string, number>>((acc, entry) => {
    acc[entry.operation] = (acc[entry.operation] ?? 0) + 1
    return acc
  }, {}) : null

  const topKind = hardestKind ? (Object.entries(hardestKind).sort((a, b) => b[1] - a[1])[0]?.[0] as TaskKind) : null
  const topOperation = hardestOperation ? (Object.entries(hardestOperation).sort((a, b) => b[1] - a[1])[0]?.[0] as Operation) : null

  return {
    correctCount,
    wrongCount,
    accuracy,
    hardestKind: topKind,
    hardestOperation: topOperation,
    mainMistake: getMainMistakeMessage(session.history),
    teachingFocus:
      topKind === 'column'
        ? 'Kitą kartą pradėk nuo vienetų ir tik tada pereik prie dešimčių.'
        : topOperation === 'subtraction'
          ? 'Kitą kartą pasitikrink, ar po atimties rezultatas tikrai mažesnis.'
          : 'Kitą kartą spręsk ramiai ir pirmiausia apskaičiuok, tik tada rinkis atsakymą.'
  }
}

export function finishSession(session: SessionState) {
  const badgesUnlocked = Array.from(new Set([...session.lifetime.badgesUnlocked, ...session.rewards.badges]))

  return {
    ...session,
    lifetime: {
      starsCollected: session.lifetime.starsCollected + session.rewards.stars,
      sessionsPlayed: session.lifetime.sessionsPlayed + 1,
      bestStreak: Math.max(session.lifetime.bestStreak, session.rewards.bestStreak),
      badgesUnlocked
    }
  }
}

export function applyAnswer(session: SessionState, value: number | string | boolean): AnswerResult {
  const task = session.tasks[session.currentIndex]
  const normalized = normalizeAnswer(value)
  const correct = normalized === task.answer
  const rewards = { ...session.rewards, badges: [...session.rewards.badges] }
  let hearts = session.hearts
  const historyEntry: AnswerHistoryEntry = {
    taskId: task.id,
    kind: task.kind,
    operation: task.operation,
    prompt: task.prompt,
    chosenAnswer: normalized,
    correctAnswer: task.answer,
    correct,
    explanation: task.explanation
  }

  if (correct) {
    rewards.stars += session.config.mode === 'lightning' ? 2 : task.kind === 'compare' ? 1 : 2
    rewards.streak += 1
    rewards.completed += 1
    rewards.bestStreak = Math.max(rewards.bestStreak, rewards.streak)
  } else {
    rewards.streak = 0
    hearts = Math.max(0, hearts - 1)
  }

  rewards.badges = getBadgeAwards(rewards)

  return {
    correct,
    praise: correct ? praise[(rewards.completed - 1) % praise.length] : 'Bandome dar kartą!',
    explanation: task.explanation,
    chosenAnswer: normalized,
    correctAnswer: task.answer,
    teachingText: teachingTextForTask(task, normalized),
    nextSession: {
      ...session,
      currentIndex: correct ? Math.min(session.tasks.length, session.currentIndex + 1) : session.currentIndex,
      rewards,
      hearts,
      history: [...session.history, historyEntry]
    }
  }
}

export function isFinished(session: SessionState) {
  return session.currentIndex >= session.tasks.length || session.hearts === 0
}

export function progressLabel(session: SessionState) {
  return `${Math.min(session.currentIndex + 1, session.tasks.length)}/${session.tasks.length}`
}
