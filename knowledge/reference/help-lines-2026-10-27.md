---
type: reference
title: Help lines for the First take's hard chapters, checked against official sources
description: The three national help lines planned for the "?" sheet of the First take's hard-topic chapters (Tele-MANAS, ERSS 112, NALSA 15100), each checked on 27 Oct 2026 against official raw text by one researcher and two independent checkers; the numbers, hours, cost, who each serves, languages, how well each fits its chapter, the wording each needs, and what is still open before they ship.
plane_issues:
  - https://app.plane.so/the-equal-lens/browse/EVAL-22/
---

# Help lines for the hard chapters, checked 27 October 2026

The owner asked on 27 Oct 2026 to "check the numbers" before the help lines go into the app. The plan comes from [first-take.md](../content/first-take.md) ("Notes for the coordinator") and F-47 in [feature-set.md](../ux/feature-set.md): each chapter's "?" sheet holds one national line that serves women and men alike, because every hard twin has a man's half.

**How it was checked.** For each line, one agent found the official pages and two more worked independently: one fetched every page again and matched every quote; the other looked for reasons the plan is wrong (the line changed or closed, it serves only one group, it does not suit the chapter). Every claim below comes from raw page text fetched with curl (or a PDF through pdftotext), never from a tool's summary. Official means a .gov.in or .nic.in site or the body's own domain. The structured results, with every quote and URL, are in [assets/help-lines-2026-10-27/evidence.json](assets/help-lines-2026-10-27/evidence.json); its `raw_file` paths pointed at a scratch folder that no longer exists, so the URLs are the way back to each source.

## The answer in one table

| Chapter and hard topic | Line | Number | Checked | Fit |
|---|---|---|---|---|
| Station: complaints of bullying at work | Tele-MANAS (mental health) | **14416**, or 1-800-891-4416 | 41 of 41 claims confirmed | Partly: for talking to someone, not for making a complaint |
| Lugdi: reports of being followed at night | ERSS, the national emergency number | **112** | 42 of 42 claims confirmed | Yes |
| Jadugar: harassment reports backstage | ERSS | **112** | as above | Partly: only while the danger is live |
| Cricket: police complaints of violence at home | ERSS | **112** | as above | Partly: only while the danger is live |
| Rukavat: who the children live with when parents separate; a dowry demand | NALSA national legal aid line | **15100** | 39 of 39 claims confirmed | Yes, with two conditions below |

All three numbers are current, national and free, and all three serve women and men alike. Keep the plan. Two things must happen first: the wording below, and a test call to NALSA.

## Tele-MANAS: 14416

- **Run by** the Ministry of Health and Family Welfare, with NIMHANS as the apex centre; state cells answer the calls.
- **Number, hours, cost.** "A toll-free, 24/7 helpline number (14416) has been set up across the country." (telemanas.mohfw.gov.in, the site's own text file). Both numbers: "Launched on October 10, 2022, as a 24x7 toll-free helpline (14416 or 1-800-891-4416)." (PIB, 11 Feb 2026, PRID 2226319).
- **Who.** "Any individual with mental health issues can reach out to Tele MANAS services for help." (Tele-MANAS FAQ). "The almost equal number of men and women seeking help" (Health Minister, PIB PRID 2177389, Oct 2025). No age limit.
- **Languages.** "Tele-MANAS services are available in 20 languages based on the languages opted by the States." (PIB PRID 2224522, 2 Feb 2026). The only list naming them puts Hindi and English first (PIB PRID 1896958, 7 Feb 2023). Calls go to the caller's state cell, so Hindi or English is likely but not promised in every state.
- **Coverage.** "As of 2nd February 2026, 53 Tele MANAS Cells have been set up in 36 States/ UTs" (PIB PRID 2224522).
- **Fit for bullying at work.** The site lists "workplace stress" among the distress it handles. It offers counselling and referral, not action on a complaint, and it is not an emergency service: its FAQ says a psychiatric emergency "will require consultation by doctors in the hospital".
- **Never copy** the launch release's "1-800-91-4416" (PIB, 10 Oct 2022, still in the site's own news feed): it is one digit short. Use 14416 alone on the sheet, and the plain digits 14416 in the tel: link.

## ERSS: 112

- **Run by** the Ministry of Home Affairs, under the Nirbhaya Fund; each state runs its own emergency centre.
- **What and who.** "for reporting and addressing all kinds of emergencies from across the country." (mha.gov.in, ERSS section). "All users can dial 112 to avail the ERSS emergency services" (Sikkim Police). No official text names men, and none limits it to women; the Nirbhaya branding is framing, not a limit.
- **Hours and cost.** "ERSS is active 24×7 across the country" (Sikkim Police). "Is 112 a free number? Yes." (112.gov.in FAQ, archived 11 May 2026).
- **Coverage.** "Emergency Response Support System (ERSS-112) has been established in all 36 States and UTs for various emergencies" (PIB PRID 2205103, 17 Dec 2025).
- **Languages.** "English/Hindi are the most used languages; in 36 states/UTs you can get assistance in English/Hindi." (112.gov.in FAQ, archived). This is the only official text on languages, and that FAQ is partly copied from a European one (it mentions provinces and gives 101 as the police number), so treat it with care.
- **Fit.** 112 is for danger now: the official page says to use SOS "when you feel your safety or the safety of another is in imminent danger". That suits being followed at night. Jadugar's and Cricket's situations are reports and complaints made after the fact, which are work for the local police station. No national line for harassment that serves women and men alike was found.
- **Do not mention** the 112 India app's SHOUT feature: it is offered to women and children only.

## NALSA: 15100

- **Run by** the National Legal Services Authority, under the Legal Services Authorities Act, 1987; calls go to the caller's state and district legal services authority.
- **Number and cost.** "National Free Legal Helpline : 15100 (Toll Free Number)," (Madhya Pradesh legal services authority, one of six state sites that list it). NALSA's accounts show it pays for the line ("Expenditure on Toll free Helpline Number 15100"). One conflict: DoT's 2014 allotment letter lists the code as "(iii) Metered Service.", and DoT's 2023 change kept "All other features" the same. NALSA's own pages say toll-free.
- **Who.** "Caller Any citizen calling on 15100 helpline" (NALSA's staff guide for the line). "Callers have the choice to be transferred either to a male or female panel" advocate (same guide). On the kinds of case: "There is hence, no bar as to which kind of cases one can apply and not apply for." (nalsa.gov.in FAQ).
- **Advice for all, a free lawyer unequally.** "Yes, a woman is entitled for free legal aid irrespective of her income or financial status." A man gets a free lawyer only in the Section 12 groups, but anyone outside them "can still avail legal advice and assistance from the Legal Services Institutions." (nalsa.gov.in FAQ). So the sheet must offer free legal advice, never a free lawyer.
- **Hours.** "Yes, the IVRS will handle the call 24X7 for all the calls, however, will transfer calls to SLSA/DLSA front office only between 10 AM- 5 PM" (staff guide). Missed calls are called back by the next working day. Do not print "24x7".
- **Languages.** "The system is available in 10 Indian languages." (staff guide). No official text names them, so Hindi and English are **not confirmed**.
- **Fit.** Custody when parents separate is a legal question NALSA covers, and it also runs mediation. A dowry demand is a crime under the Dowry Prohibition Act, and NALSA's Women and Law handbook says a complaint can be made "by the person aggrieved by offence or a parent or other relative of such person", so a cousin of either sex can ask what to do.
- **The fallback if the language check fails:** Tele-Law, 14454 (Department of Justice), free pre-litigation advice for all citizens by appointment, covering dowry, family disputes and divorce. Its official text on the phone line itself is thin, so it was not checked to the same standard.

## Wording the sheet will need

These are word suggestions for when the help line is drawn; nothing is designed yet.

- **Station:** support, not a complaint desk. For example "Upset by bullying at work? Talk to a counsellor, free: 14416."
- **Lugdi, Jadugar, Cricket:** danger now. For example "In danger right now? Call 112."
- **Rukavat:** free legal advice. For example "Free legal advice: 15100." No hours, no "lawyer".
- **Never print:** a call count (the official figures disagree), an income limit for legal aid (NALSA's own pages give three), SHOUT, "24x7" for NALSA, or the launch typo 1-800-91-4416.

## Still open before the help lines ship

1. **A test call to 15100** from the owner or the team, to hear whether the menu offers Hindi and English. Claude cannot call. If it offers neither, use Tele-Law 14454 for Rukavat after checking it the same way.
2. **Open https://112.gov.in/faq from an Indian network.** The live site timed out from here, so its language and cost lines rest on archived copies from December 2025 to May 2026.
3. **Draw the help line in the library** (the "?" sheet, in all five worlds and both languages, within the sheet's word budget) for the owner's approval before it is built, as for every other part.
4. **The Hindi wording** of each line needs the same native read as the rest of the Hindi.
