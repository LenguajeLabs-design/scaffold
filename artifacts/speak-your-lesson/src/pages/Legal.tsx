import { Link } from "wouter";

const sections = [
  ["about", "About and methodology", <><h2>Independent educational tool</h2><p>Scaffold is an independently developed instructional planning tool created by Federico Orozco / Lenguaje Labs.</p><p>Scaffold uses its own six-level Language Support Level framework to help educators choose the amount and type of support a learner may need for a particular task.</p><p>The framework is instructional rather than evaluative. It considers listening, speaking, reading, and writing needs separately and translates classroom evidence into practical supports.</p></>],
  ["disclaimer", "Disclaimer", <><p>Scaffold generates instructional suggestions, not formal proficiency determinations or individualized educational recommendations. Teacher review is required: review and adapt all materials based on your students, curriculum, school policies, and professional judgment.</p><p>Scaffold should not be used to assign, predict, certify, or verify a student's official language proficiency or to make placement, eligibility, exit, or assessment decisions.</p></>],
  ["terms", "Terms of use", <><p>Scaffold is an instructional support tool. Generated content may contain errors, omissions, or suggestions that do not fit a particular classroom. Teachers retain responsibility for reviewing, adapting, and deciding whether to use any generated material.</p><p>Scaffold is not intended for formal student assessment, placement, certification, eligibility, exit, or other high-stakes decisions.</p><p>To the extent permitted by law, Scaffold and its creators are not liable for decisions, losses, or outcomes arising from reliance on generated content. Use of the tool is at the user’s discretion and risk.</p><p>Scaffold’s original software, content, branding, and visual design belong to Federico Orozco / Lenguaje Labs.</p></>],
  ["privacy", "Privacy policy", <><p>Scaffold is designed for educator planning and does not require student names or identifying information. Please do not enter confidential student records, medical information, or other sensitive personal data.</p><p>Planning information submitted for generation may be processed by the service providers that operate Scaffold’s AI features. Saved plans remain in your browser unless you choose to share them.</p><p>For privacy questions, contact <a href="mailto:forozc1@gmail.com" className="text-primary hover:underline">forozc1@gmail.com</a>.</p></>],
] as const;

export default function Legal() {
  return <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:py-16">
    <Link href="/" className="text-sm text-primary hover:underline">← Back to Scaffold</Link>
    <p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-teal-strong)]">Scaffold · Lenguaje Labs</p>
    <h1 className="mt-3 text-3xl font-semibold tracking-tight text-primary sm:text-4xl">About, methodology, and terms</h1>
    <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">A clear explanation of what Scaffold is, how it uses proficiency references, and what teacher review means.</p>
    <div className="mt-8 space-y-4">{sections.map(([id, title, content]) => <section id={id} key={id} className="scroll-mt-24 rounded-2xl border border-border/70 bg-card/80 p-6 shadow-sm sm:p-8"><h2 className="text-xl font-semibold text-foreground">{title}</h2><div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground">{content}</div></section>)}</div>
    <p className="mt-8 text-xs text-muted-foreground">© 2026 Federico Orozco / Lenguaje Labs. Scaffold is an independently developed educational tool.</p>
  </main>;
}
