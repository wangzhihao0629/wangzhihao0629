---
title: Job hunting in 2026 was a different kind of hard than 2022
date: 2026-09-10
subtitle: Four years apart, same person — but the market changed what "hard" actually meant.
---

**TL;DR**

```
zhihao@portfolio:~/job-hunt$ diff 2022.log 2026.log
- 2022: 200 companies asked -> 20 responded -> 74 rounds -> 8 offers
+ 2026: 23 companies asked  -> 18 responded -> 55 rounds -> 2 offers (+1 ref check)
```

I've run two real job searches, four years apart. One in 2022, finishing my master's at CMU, looking for
a Senior role right as the first big wave of tech layoffs hit. One this year, as a Staff-level engineer,
in a market obsessed with AI. Both were hard — but I tracked both closely enough to have real numbers, and
the numbers show something "job hunting is hard" doesn't: **they were hard in almost opposite ways.**

## Two job hunts, four years apart

Going into 2022, I already had 4+ years of experience as a backend engineer — not a new-grad search. But I
was targeting platform engineering roles with zero platform experience to show for it, just a backend
track record and a master's, trying to break into a new specialty from the outside. I started applying on
7/18/2022 — months before my December graduation — and tested positive for COVID right around then; stuck
at home with nothing else to do, I applied to tens of jobs a day for weeks. Volume was the whole strategy
— the market had gone cold, plenty of companies were quietly not hiring, and I was asking most of them to
bet on a pivot instead of a track record. The only way to find the ones willing to take that bet was to
apply to everyone and see who answered. I signed an offer on 11/2/2022.

In 2026 I did the opposite, because I was a different candidate. The pivot had actually worked — four
years deep on one infrastructure specialty gave me the track record I didn't have in 2022. So I went in
with a short, deliberate list of mostly warm targets (referrals, inbound recruiter interest, a couple of
direct applications), and put real prep behind each one instead of spreading thin. I was also doing this
on top of a full-time job — most interviews got scheduled after 4 or 5pm, once my actual workday was
over, which is a different kind of tired than searching full-time was in 2022. Most of these companies
ran on West Coast time too, so their normal business-hours slots landed squarely in my evening — which is
exactly why "after work" was even an option at all. Being 3 hours behind Silicon Valley: not a
strategy anyone would pick on purpose, but I'll take the one accidental perk.

```
A typical weekday, 2026 search (my time zone)

work        █████████████░░░░░░░  9am–5pm
interviews  ░░░░░░░░░░░░░███████  5pm–9pm
```

5pm where I live is 2pm in Silicon Valley — still the middle of their business day, which is the
whole reason this worked.

Part of that warm pipeline came from something unglamorous: showing up in person. I went to the yearly
conference for an open-source workflow engine I already used daily at work — not to job hunt, just to
learn — and ended up talking to engineers from half a dozen companies running the same tool at far bigger
scale: people from the AI frontier lab behind one of the most-used chatbots on the planet, an AI-native
code editor half of Silicon Valley switched to this year, and a streaming app most people reading this
already pay for. Hearing how much bigger the scale was at some of these places than at my own job is what
actually got me thinking about a move.

> A hiring manager from that same lab, after hearing me talk about my work: "you're exactly the engineer
> we're looking for."

That was the real moment I decided to start looking. Right after the conference, that same hiring
manager — who ran the team responsible for that same workflow engine internally — reached out and asked
if I wanted to interview. I hadn't applied anywhere yet; the opportunity found me. If there's
one practical tip in this whole post: go to the conference for whatever you use every day, talk to people,
and get on stage if you can. It beats another cold application.

```
2022 funnel
contacted   ████████████████████  200
interview   ██░░░░░░░░░░░░░░░░░░  20
final loop  █░░░░░░░░░░░░░░░░░░░  10
offer       █░░░░░░░░░░░░░░░░░░░  8

2026 funnel
contacted   ████████████████████  23
interview   ████████████████░░░░  18
final loop  ██████░░░░░░░░░░░░░░  7
offer       ██░░░░░░░░░░░░░░░░░░  2
```

| | 2022 | 2026 |
| --- | --- | --- |
| Companies contacted | ~200 | 23 |
| Reached any interview | 20 | 18 |
| Reached a full onsite / final loop | 10 | 7 |
| Total interview rounds | 74 | ~55–60 |
| Active window | ~11–12 weeks (+~3 months prep) | ~8 weeks (+3 weeks prep) |
| Offers | 8 | 2 (+1 reached reference checks, withdrawn after accepting elsewhere) |
| Offer rate (of companies touched) | ~4% | ~9% |
| Offer rate, once *any* interview happened | ~40% | ~11% |
| Offer rate, once a full onsite / final loop happened | ~70% | ~29% |
| AI-native companies (of those contacted) | ~4% | ~65% |
| AI-native companies (of those in the interview loop) | ~5% | ~72% |
| Metro areas spanned | ~30 | 3 |
| Strategy | breadth — apply to everything, see who bites | depth — few targets, go deep on each |

```
Offer rate, once any interview happened
2022  ████████░░░░░░░░░░░░  40%
2026  ██░░░░░░░░░░░░░░░░░░  11%

AI-native companies (of those contacted)
2022  █░░░░░░░░░░░░░░░░░░░   4%
2026  █████████████░░░░░░░  65%

Offer rate (of companies touched)
2022  █░░░░░░░░░░░░░░░░░░░   4%
2026  ██░░░░░░░░░░░░░░░░░░   9%
```

The number that surprised me most isn't company count — it's conversion rate. In 2022, only **1 in 10**
companies I reached out to (20 of 200) turned into a real conversation. In 2026, it was **nearly 4 in 5**
(18 of 23) — with a similar total round count either way (74 vs. ~55–60), just ~9x fewer applications to
get there. The bottleneck moved: in 2022 the hard part was **getting in the room**; in 2026 it was **what
happened once I was in it.**

The other two numbers say more about the market than about me. AI companies went from a rounding error in
2022 (~4% of the list) to **about two-thirds** of a much shorter list in 2026. The search also got
geographically narrower for reasons that have nothing to do with remote work: ~30 metro areas in 2022,
**just three** — Bay Area, NYC, remote — in 2026. Going deep meant fewer companies *and* fewer places.

One thing I noticed after the fact: a few weeks after my search ended, Lenny's Jobs published
[the Lenny 100](https://www.lennysjobs.com/lenny100) — their list of the 100 highest-talent-density,
highest-upside companies, picked with zero knowledge of what I was doing. Of the full 23 companies I
reached out to, **16 are on it (~70%).** But of the 7 I made it all the way to a final loop with,
**every single one** is on it (100%). I wasn't optimizing for a list that didn't exist yet — just
following warm signal and depth — but going deeper correlated with hitting that list more, not less.

```
Lenny 100 overlap, 2026 only
Applied to (23)
██████████████░░░░░░  70%

Reached final loop (7)
████████████████████  100%
```

```
zhihao@portfolio:~/job-hunt$ diff 2022.log 2026.log
- 2022: 200 companies asked -> 20 responded -> 74 rounds -> 8 offers
+ 2026: 23 companies asked  -> 18 responded -> 55 rounds -> 2 offers (+1 ref check)
```

## Why each one was hard

Zoom in on what happened after a company agreed to talk, and it gets sharper. In 2022, half of the 20 companies
I talked to made it to a full onsite loop, and most of those converted — **7 of 10 (70%).** In 2026, way
under half of the 18 made it to a full final loop — **only 7 of 18 (39%)** — and even that barely helped:
**only 2 of 7 converted (29%).** __Two filters stacked instead of one__: 2026 was harder to close *and*
harder to even reach the end stage.

**2022 was a macro problem.** Layoffs were just starting, hiring freezes were spreading, and a huge chunk
of my 200 applications went nowhere — not rejected, just silent, because the role had quietly frozen. The
lesson was really just volume and resilience: keep applying, expect most of it to vanish, don't read
silence as a verdict. But once I got in front of someone, my pass rate was high — **54 of the 74 logged
rounds were marked "passed"** (73%).

**2026 was a depth problem, and it came with a different set of expectations.** Almost nobody ghosted —
the market wanted to talk. But at Staff level, nobody expects zero experience anymore; the assumption
flips entirely — you're supposed to already have depth and breadth, not learn on the job. System design
itself also got harder — more topics to know, tougher questions, less room to hand-wave — on top of the
bar moving because I was interviewing for Staff now, not Senior.

What Staff level wants is for you to spot bottlenecks and failure modes as the system scales, without
being asked — and to get there *fast*. Requirements gathering and API design are still evaluated, but
they're supposed to move quickly, almost like a formality: spend too long there and it's hard to signal
you're a strong Staff candidate, because you're eating into the time you need for the part that actually
differentiates you. Still working through the basics at minute 25, and you're out of runway to show any
of that.

One piece of feedback caught me off guard, because I hadn't even clocked it as scored: I was told I
gathered requirements too slowly at the start of a design round. Not that they were wrong — just that the
pace ate into the time I needed for the deep part. I didn't realize that until after I got rejected.

Underneath it all, one more piece of feedback named the real gap: not wrong answers, just not enough
hands-on experience with a system's messy internals at real scale — __write-ahead logs__, __retention__,
__contention__, __networking limits__. The stuff that only shows up under load.

That's the real difference. 2022 was hard because **the market wasn't hiring**. 2026 is hard because
**the open roles assume a depth most careers never force you to build**. Some of that's just me — in 2022
I was asking companies to bet on a pivot with nothing but backend experience; by 2026 the pivot had paid
off and the rubric matched my experience. But the market moved too: that hands-on infra depth isn't
something you fake from adjacent experience, which is exactly why 2022-me couldn't have talked his way
past it either.

## The technical deep dive: a round that didn't really exist in 2022

In 2022, "tell me about a project" was one question inside a behavioral round — a few minutes, informal,
no real structure. In 2026, multiple companies gave it a dedicated round of its own, 30-45 minutes, with
real structure: prepare slides, 10-12 pages max, walk through business context first, then technical
complexity and architecture, then results and what you'd do differently. It's graded like any other
round — and on more than whether the project sounds impressive: __cross-functional collaboration__,
technical depth, system complexity, and actual impact, all at once.

**That last axis cost me an offer outright**, at a company most frontend engineers would recognize as where a
huge chunk of the internet's Next.js apps get deployed. I got great feedback on almost every round; the
one gap was no clear signal of cross-functional collaboration in the project I walked through. The project
was real and good — an internal platform built so other teams *wouldn't* need to coordinate with mine to
ship. Self-service by design, the opposite of cross-team blocking and tight deadlines. I made that case in
the room. Didn't matter — what they seemed to hear was a story about being blocked by other teams under
deadline pressure, or negotiating scope with a team that didn't report up through mine, or reconciling
priorities that two orgs disagreed on. My actual story, about engineering that need away entirely, was the
wrong shape for any of that, no matter how I told it. No offer. One flagged axis.

Uncomfortable lesson, but true: being a strong match is a **precondition**, not a **guarantee**. Enough
qualified people apply that a loop can reward whoever hits the rubric, not whoever fits best. At
senior/staff level you have to actively show every axis they grade — not just be good at the job. That
means picking the right project to present, and being deliberate about which signals you surface, even
when you'd rather let the work speak for itself. I hate that. Did it anyway for every deep dive after.

## How I prepped, and how that changed

The prep barely looks like the same activity across these two searches. In 2022 it was almost entirely
LeetCode — a habit that started back in CMU coursework and never stopped. My tracker has **600+ problems**
logged, timed and graded, repeated until the patterns clicked. That matched the interviews: closed-ended,
one correct-ish answer, a rubric you could reverse-engineer through enough reps.

In 2026 I barely touched LeetCode, because almost none of it was LeetCode-shaped. Companies asked
practical questions instead — often one problem stretched across several rounds of follow-ups — and graded
the code itself as much as correctness: how clean it stayed, whether it read like something worth
maintaining, whether smells crept in as you kept building. Different pressure than "find the algorithm" —
more like "keep writing shippable code for 45 minutes while requirements keep shifting."

Same pattern as the rest of this post: the market didn't just raise the system-design bar — it redefined
what "passing the coding round" means. Breaking both years down by question type makes it concrete:

**2022, by category:**

| Category | What it actually looked like | Share of rounds |
| --- | --- | --- |
| Classic algorithmic coding | Graph/matrix traversal, string parsing, rotated-sorted-array binary search, hash-based dedup, heap/stack/queue simulation — textbook shapes, medium-to-hard difficulty | ~55% |
| System design | A handful of dedicated design rounds (log storage, search), plus a few "coding + system design" hybrids — cache, DNS, scalability, database schema | ~15% |
| Practical/infra knowledge screens | Not algorithmic at all — conceptual grilling on cloud fundamentals, containers, CI/CD, distributed-systems basics, often tied to "walk me through your own project" | ~10% |
| Behavioral / hiring-manager | Standard BQ, career-goals, team-fit conversations | ~20% |

**2026, by category:**

| Category | What it looked like |
| --- | --- |
| Practical, follow-up-heavy coding | Not LeetCode-shaped — a real-world-flavored starting problem stretched across several rounds of follow-ups, graded as much on code cleanliness/maintainability as correctness |
| System design | Bottleneck/failure-mode analysis expected proactively; requirements-gathering and API design had to move fast to leave room for the deep dive; internals-level gaps got called out specifically (storage durability mechanics, data-retention tradeoffs, concurrency/contention, networking limits) |
| Technical deep-dive | A newly dedicated, multi-axis round of its own — see above |
| Behavioral | Least changed of the four — still standard BQ/culture-fit, no notable shift |

## Self-assessment: accurate in 2022, overconfident in 2026

I rated my own performance after almost every round, in both searches. In 2022, that rating held up. In
2026 it didn't — but only for the newer, more open-ended parts of the loop.

**2022:** I logged every interview in a Notion database — company, round, date, self-assessment out of
100. My gut was a genuinely good predictor, if anything leaning conservative: rounds that advanced averaged
**84/100** self-rated; rounds that didn't averaged **62** — a wide, honest gap.

**2026:** I ditched Notion for this one — Claude Cowork, connected to my Gmail and Google Calendar, did
the tracking instead.
After almost every interview I'd just talk it through, chat-style, and it would log the company, round,
and my self-rating for me. Faster than filling out a database by hand, but the ratings themselves still
broke down: coding rounds stayed honest — 90+ still meant a strong outcome. System
design and deep-dive rounds were the opposite: multiple **90/100** self-ratings ended in rejection. One loop
had two strong-feeling rounds outweighed by a debugging round I'd under-rated; another got feedback that
the real gap wasn't correctness — it was not proactively surfacing failure modes and alternatives
unprompted.

:::callout
This didn't exist in 2022 at all — it showed up specifically in 2026's judgment-based rounds. Not a
coincidence: **the more open-ended the round, the less you can trust your in-the-room feeling**, and
2026's loops were far more open-ended by design.
:::

## What was actually different about negotiating

2022 offer decisions were mostly arithmetic: compare four-year totals, pick the biggest number, add a
caveat or two (green card timeline, team fit). One offer came in **~8% ahead** on total comp, and that was
basically the whole decision. Title and comp moved together too — a Senior title meant Senior-band comp,
no exceptions, so the title on the offer letter and the number underneath it always told the same story.

**2026 broke that coupling.** A few AI companies would hand out a Senior title but pay Staff-level comp,
which meant the title on the letter stopped being a reliable stand-in for the number — you had to actually
compare the comp, not the label. And overall it was messier, ending with a call 2022-me wouldn't have
made. Two finalist offers landed the same day — the workflow-engine company from the conference story,
and a fast-growing legal-AI startup. Same pitch, same competing number, two different responses: one held
firm on a rigid pay band, the other moved up within days. I still took the smaller offer, from the
workflow-engine company. The legal-AI startup was **~$200K ahead** on total comp — officially a Senior
title, but they'd promised Staff-level comp to get me, and they delivered on it — though not really
apples-to-apples, since theirs was RSUs and mine was stock options with a fixed strike price. RSU value
scales 1:1 with the stock price; option value doesn't, because the strike price stays fixed while the
stock price moves. Illustrative numbers, not my real ones, to show the shape of it:

```
RSU vs. option value, relative to today (illustrative numbers)

0%    RSU  ███░░░░░░░░░░░░░░░░░  1.0x
      Opt  ███░░░░░░░░░░░░░░░░░  1.0x

+50%  RSU  ████░░░░░░░░░░░░░░░░  1.5x
      Opt  ██████░░░░░░░░░░░░░░  2.0x

+100% RSU  ██████░░░░░░░░░░░░░░  2.0x
      Opt  █████████░░░░░░░░░░░  3.0x

+200% RSU  █████████░░░░░░░░░░░  3.0x
      Opt  ██████████████░░░░░░  5.0x

+300% RSU  ███████████░░░░░░░░░  4.0x
      Opt  ████████████████████  7.0x
```

Same growth, very different payoff — the RSU column moves exactly with valuation, the option column bends
up faster (strike price held fixed the whole time). That's why a $200K/yr gap funded by RSUs doesn't need
"a few times over" to close if the smaller offer is options — a fairly modest bump in valuation is enough
to catch up.

But the equity math isn't really why I picked the smaller number — I don't want to pretend this was clever
arbitrage. An extra $200K a year doesn't change my quality of life at this point; it's just a bigger
number in an account. (There was a small, unglamorous factor in the same direction: the legal-AI startup
would have meant relocating to NYC or SF, a lot more expensive than where I actually live, on top of a
mortgage I'm still paying — but that's a minor point, not the reason. If the chatbot lab or the code-editor
startup from the conference story had made an offer instead, I'd have relocated for either of them without
a second thought.) What I actually weighed
was career growth: that same hiring manager from the
conference story — a senior practitioner at a company sitting right at the center of the AI wave — argued,
off the record, that depth in one hardcore infra domain builds more durable leverage than breadth across a
flashier one. That's what decided it, not the comp.

There was a public version of the same argument going around right around then, too:

> "In the age of AI, go deep or go home."

<details class="post-embed" open>
<summary>LinkedIn post</summary>
<div class="post-embed-frame post-embed-frame--li">
<iframe src="https://www.linkedin.com/embed/feed/update/urn:li:share:7491121132138524673?collapsed=1" frameborder="0" allowfullscreen="" title="Embedded post"></iframe>
</div>
</details>

**I'd rather bet on the domain that's further from being commoditized than on the bigger number.** I think
the company I picked has real upside over the long run, and I was optimizing for where that bet puts me
years from now, not for this year's total comp.

That trade-off didn't exist in 2022 — the money still mattered day-to-day, so the biggest number and the
better path were usually the same decision. By 2026, comp wasn't the variable that mattered. Career growth
was. First time I picked the smaller number on purpose.

Small postscript, as of writing this — and it's the opposite of the hedge I made above. I'd hoped the gap
might shrink if the offer I *took* grew in value. Instead, it's the offer I *declined* that just got a lot
more expensive to have walked away from:

```
zhihao@portfolio:~/job-hunt$ diff offer_then.log offer_now.log
- legal-AI startup valuation: $11B
+ legal-AI startup valuation: $15.5B (+41%, new funding round)
- comp gap vs. offer I took: ~$200K/yr
+ comp gap vs. offer I took: ~$300–350K/yr
```

Doesn't change the math I actually used to decide — but it's a funny footnote. I'm not too concerned about
it, though: I still think the offer I took has real 2-3x room of its own from here, which was a big part
of why I took it in the first place. **This is a one-round snapshot, not the final scoreboard** — and if
this whole post has a theme, it's that the landscape right now is changing too fast for any snapshot to
hold still for long.

## What I'd tell 2022-me and 2026-me

**2022:** you did this right. Silence isn't a verdict — the market is frozen, not judging you. Keep the
volume up and wait it out.

**2026, three things I'd do differently:** all three come down to the same thing — I was still calibrated
to 2022's rules, and didn't notice the game had changed until after the fact.

1. Passing the early screen and phone interview felt like being close to an offer, because that's what it
   meant in 2022. It isn't anymore — the bar moved past the early rounds, and I kept reading old signal
   into a new process.
2. The system design bar is genuinely higher than 2022, and the questions are harder. I could have
   prepped broader and deeper on more complicated systems — and I should have practiced them the way I
   did in 2022, with a ton of real mock interviews and a roommate giving me actual back-and-forth
   practice, not just solo review. That habit didn't carry over to 2026, and I felt the gap.
3. Deep-dive and behavioral rounds grade Staff differently than Senior: more cross-functional
   collaboration, more explicit ownership. I should have shown those signals on purpose from the start,
   instead of assuming the work would speak for itself.

## Closing thought

"Job hunting is hard" is true most years — which is why it's not a useful sentence on its own. What
matters is which kind of hard you're in: **a volume problem you can grind through,** or **a depth problem
you can only solve by getting deeper.**

That depth problem isn't evenly distributed. If your day job already has you deep in large systems —
especially if you interview candidates yourself — this might not feel hard. If it doesn't, the interview
process is unfamiliar, and AI has taken over most of your hands-on coding, it can get hard. The fix is
reps: practice, and real interviews, until none of it feels unfamiliar.

System design also covers more ground than it did four years ago, because AI itself created a bunch of
new systems to design — RAG is the obvious example, barely mentioned in 2022 and now everywhere. The
core skills haven't changed, but the list of things you're expected to know keeps growing.
