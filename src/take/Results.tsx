import { useEffect, useRef, useState, type ReactNode } from 'react'
import { TAKE, type Bi } from './data'
import { say, T, useLang } from './lang'
import { AppFrame, HelpButton, Main, focusScreen, useMoreCue } from './parts'
import { useSound } from './sound'
import type { Answer } from './steps/common'
import { favoured } from './reading'
import { Svg } from './Svg'

// The private reading after chapter 5 (first-take.md, "The results"; first_take.results_phones and the demo's fillRes):
// five cards worked out here from the player's own answers and sent nowhere: how often the equal two went one way,
// one twin that shows it, the part of life it leaned most, what to try, and what one sitting can say. No score: the
// lean out of 100 waits on the research line (RSE-164). No time either: nothing in the app counts it.

type Side = 'm' | 'w'
const SIDE: Record<Side, Bi> = { m: ['man', 'आदमी'], w: ['woman', 'औरत'] }

const swapEn = (s: string) => s.replace(/\b(man|woman)\b/g, (x) => (x === 'man' ? 'woman' : 'man'))
const swapHi = (s: string) => s.replace(/आदमी|औरत/g, (x) => (x === 'आदमी' ? 'औरत' : 'आदमी'))

export function Results(props: {
  answers: Record<string, Answer>
  onNext: () => void
  onForget: () => void
  help: boolean
  onHelp: (o: boolean) => void
}) {
  const [n, setN] = useState(1)
  const cue = useMoreCue([n])
  const lang = useLang()
  const { sound } = useSound()
  const R = TAKE.results
  // the next card's words take the focus, so a screen reader reads each card as it comes
  const seen = useRef(n)
  useEffect(() => {
    if (seen.current === n) return
    seen.current = n
    if (cue.ref.current) focusScreen(cue.ref.current)
  }, [n, cue.ref])
  // every part of life's picture is asked for together, so what the network sees never says which one card 3 shows
  useEffect(() => {
    for (const a of Object.values(TAKE.results.areas)) new Image().src = a.scene
  }, [])
  const D = R.decisions
  const picks = Object.fromEntries(Object.keys(D).map((id) => [id, favoured(id, props.answers[id])]))
  const sexOf = (id: string): Side | null => (picks[id] ? D[id].sex[picks[id]!] : null)
  const read = Object.keys(D).filter((id) => sexOf(id))
  const m = read.filter((id) => sexOf(id) === 'm').length
  const w = read.length - m
  const more: Side | null = m > w ? 'm' : w > m ? 'w' : null
  const twins = R.twins.filter((t) => t.kind !== 'hard').map((t) => ({ ...t, ga: sexOf(t.a), gb: sexOf(t.b) }))

  let pic: ReactNode = null
  let pcls = ''
  let text: Bi
  if (n === 1) {
    pcls = 'stacks'
    pic = (['w', 'm'] as Side[]).map((x) => (
      <span className="resstack" key={x}>
        <span className="bars">
          {Array.from({ length: x === 'm' ? m : w }, (_, k) => (
            <i key={k} />
          ))}
        </span>
        <T as="b" t={SIDE[x]} />
      </span>
    ))
    text = !read.length
      ? ['Your picks went outside the equal two every time.', 'आपने हर बार बराबर वाले दो से बाहर चुना।']
      : !more
        ? [`${read.length} times, 2 people had the same numbers. You picked each ${m} times.`, `${read.length} बार, 2 लोगों के नंबर एक जैसे थे। आपने दोनों को ${m}-${m} बार चुना।`]
        : [`${read.length} times, 2 people had the same numbers. You picked the ${SIDE[more][0]} ${Math.max(m, w)} times.`,
           `${read.length} बार, 2 लोगों के नंबर एक जैसे थे। आपने ${Math.max(m, w)} बार ${SIDE[more][1]} को चुना।`]
  } else if (n === 2) {
    const one = twins
      .filter((t) => t.ga && t.ga === t.gb)
      .sort((x, y) => Number(y.ga === more) - Number(x.ga === more) || Number(x.kind === 'matters') - Number(y.kind === 'matters'))[0]
    const both = one ?? twins.find((t) => t.ga && t.gb)
    if (!both) text = ['Too few clear picks to show a pair.', 'दिखाने लायक़ जोड़ी नहीं बनी।']
    else {
      pcls = 'twin'
      pic = [both.a, both.b].map((id) => (
        <span className="half" key={id}>
          {D[id].pair.map((p) => (
            <span className={`pp${picks[id] === p ? ' is-picked' : ''}`} key={p}>
              <i style={{ backgroundImage: `url(${D[id].faces[p]})` }} />
              <T as="b" t={[p, D[id].hi[p]]} />
              {D[id].nudged === p ? <T as="em" t={both.nudge} /> : null}
            </span>
          ))}
        </span>
      ))
      const cap = both.nudge[0][0].toUpperCase() + both.nudge[0].slice(1)
      text = one
        ? [`Same numbers both times. ${cap} swapped sides. You picked the ${SIDE[one.ga!][0]} both times.`,
           `दोनों बार नंबर एक जैसे थे। बस ${both.nudge[1]} की जगह बदली। आपने दोनों बार ${SIDE[one.ga!][1]} को चुना।`]
        : [`Same numbers both times. ${cap} swapped sides, and so did your pick.`, `दोनों बार नंबर एक जैसे थे। ${both.nudge[1]} की जगह बदली, और आपकी पसंद भी।`]
    }
  } else if (n === 3) {
    const score: Record<string, number> = {}
    for (const t of twins) if (t.ga && t.ga === t.gb) score[t.world] = (score[t.world] ?? 0) + (t.ga === 'm' ? 1 : -1)
    const top = Object.entries(score).sort((x, y) => Math.abs(y[1]) - Math.abs(x[1]))[0]
    if (!top || !top[1]) text = ['Close to even in every part of life.', 'ज़िंदगी के हर हिस्से में लगभग बराबर।']
    else {
      const A = R.areas[top[0]]
      pic = <span className="scene" style={{ backgroundImage: `url(${A.scene})` }} />
      text = top[1] > 0 ? A.real : [swapEn(A.real[0]), swapHi(A.real[1])]
    }
  } else if (n === 4) {
    pic = (
      <span className="trade">
        <i />
        <Svg name="arrow" />
        <Svg name="arrow" />
        <i />
      </span>
    )
    text = ['Before you choose, swap the 2 people in your head. Would you still choose the same?', 'चुनने से पहले, मन में दोनों को आपस में बदल दें। क्या तब भी वही चुनाव होगा?']
  } else {
    const all = TAKE.flow.filter((s) => s.type === 'step').length
    pic = (
      <span className="marks">
        <i />
        <i />
        <i />
        <i />
        <i />
      </span>
    )
    // the demo said "40 choices in 20 minutes"; the app counts no time (PRODUCT.md, Privacy; privacy-check), so the
    // card counts the choices only
    text = [`${all} choices. A first reading, from one sitting.`, `${all} चुनाव। एक बैठक की पहली रीडिंग।`]
  }
  const card = R.card
  return (
    <AppFrame world={card.world} kind="result" cls={`js-res`} label={say(lang, [`Your reading, card ${n} of 5`, `आपकी रीडिंग, कार्ड ${n}/5`])} art={card.art} help={props.help} onHelp={props.onHelp}>
      <div className="topbar">
        <div className="group" />
        <div className="group">
          <HelpButton onHelp={props.onHelp} />
        </div>
      </div>
      <div className={`scr-body${cue.more ? ' has-more' : ''}`} ref={cue.ref}>
        <div className={`respic${pcls ? ` ${pcls}` : ''}`}>{pic}</div>
        <div className="qbox">
          <T as="h1" t={text} className="q restext" />
        </div>
        {n === 5 ? (
          <button className="textbtn resforget" type="button" onClick={props.onForget}>
            <T t={['Not you? Remove this reading', 'आप नहीं? यह रीडिंग हटाएँ']} />
          </button>
        ) : null}
      </div>
      {cue.node}
      <Main
        t={['Next', 'आगे']}
        live
        out
        onGo={() => {
          sound.fx(card.world, 'commit')
          if (n < 5) setN(n + 1)
          else props.onNext()
        }}
      />
    </AppFrame>
  )
}
