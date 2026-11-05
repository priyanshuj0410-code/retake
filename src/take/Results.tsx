import { useEffect, useRef, useState, type ReactNode } from 'react'
import { TAKE, type Bi } from './data'
import { say, T, useLang } from './lang'
import { AppFrame, HelpButton, Main, focusScreen, useMoreCue } from './parts'
import { useSound } from './sound'
import type { Answer } from './steps/common'
import { RateSheet } from './RateSheet'
import { SIDE, leanOf, readingOf, twinOf, type Side } from './reading'
import { Svg } from './Svg'

// The private reading after chapter 5 (first-take.md, "The results"; first_take.results_phones and the demo's fillRes):
// five cards worked out here from the player's own answers, and they are never sent: how often the equal two went one way,
// one twin that shows it, the part of life it leaned most, what to try, and what one sitting can say. No score: the
// lean out of 100 waits on the research line (RSE-164). No time either: nothing in the app counts it.

export function Results(props: {
  answers: Record<string, Answer>
  onNext: () => void
  onForget: () => void
  ask: boolean
  onAsked: () => void
  help: boolean
  onHelp: (o: boolean) => void
}) {
  const [n, setN] = useState(1)
  // the rating stays open over the reading from here until closed, even once it is sent, for its one line of thanks;
  // another window that has settled it closes it here too
  const [asking, setAsking] = useState(props.ask)
  const sentHere = useRef(false)
  useEffect(() => {
    if (!props.ask && !sentHere.current) setAsking(false)
  }, [props.ask])
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
  // the sheet closed: the reading is no longer inert, so its words can take the focus
  const wasAsking = useRef(asking)
  useEffect(() => {
    if (wasAsking.current && !asking && cue.ref.current) focusScreen(cue.ref.current)
    wasAsking.current = asking
  }, [asking, cue.ref])
  // every part of life's picture is asked for together, so what the network sees never says which one card 3 shows
  useEffect(() => {
    for (const a of Object.values(TAKE.results.areas)) new Image().src = a.scene
  }, [])
  const D = R.decisions
  const reading = readingOf(props.answers)
  const { read, m, w, more, twins } = reading

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
        ? [`${read.length} times, 2 people had the same numbers. It went each way ${m} times.`, `${read.length} बार, 2 लोगों के नंबर एक जैसे थे। ${m}-${m} बार पलड़ा दोनों तरफ़ झुका।`]
        : [`${read.length} times, 2 people had the same numbers. It went the ${SIDE[more][0]}'s way ${Math.max(m, w)} times.`,
           `${read.length} बार, 2 लोगों के नंबर एक जैसे थे। ${Math.max(m, w)} बार पलड़ा ${SIDE[more][1]} की तरफ़ झुका।`]
  } else if (n === 2) {
    const shown = twinOf(reading)
    if (!shown) text = ['Too few clear picks to show a pair.', 'दिखाने लायक़ जोड़ी नहीं बनी।']
    else {
      pcls = 'twin'
      pic = [shown.twin.a, shown.twin.b].map((id) => (
        <span className="half" key={id}>
          {D[id].pair.map((p) => (
            <span className={`pp${shown.marked[id] === p ? ' is-picked' : ''}`} key={p}>
              <i style={{ backgroundImage: `url(${D[id].faces[p]})` }} />
              <T as="b" t={[p, D[id].hi[p]]} />
              {D[id].nudged === p ? <T as="em" t={shown.twin.nudge} /> : null}
            </span>
          ))}
        </span>
      ))
      text = shown.text
    }
  } else if (n === 3) {
    const lean = leanOf(twins)
    if (!lean) text = ['Close to even in every part of life.', 'ज़िंदगी के हर हिस्से में लगभग बराबर।']
    else {
      pic = <span className="scene" style={{ backgroundImage: `url(${R.areas[lean.world].scene})` }} />
      text = lean.line
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
      {asking ? (
        <RateSheet
          world={card.world}
          onSent={() => {
            sentHere.current = true
            props.onAsked()
          }}
          onClose={() => {
            setAsking(false)
            if (props.ask) props.onAsked()
          }}
        />
      ) : null}
    </AppFrame>
  )
}
