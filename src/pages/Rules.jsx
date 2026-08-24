export default function Rules() {
    const rules = [
        {
            title: 'Be respectful',
            text: 'Treat writers and readers with respect. Disagreement is welcome, personal attacks are not.'
        },
        {
            title: 'Publish original work',
            text: 'Only publish work that you have the right to share. Do not copy or impersonate another writer.'
        },
        {
            title: 'Keep it meaningful',
            text: 'Avoid spam, misleading content, excessive self-promotion, and content created only to manipulate engagement.'
        },
        {
            title: 'Write responsibly',
            text: 'Think about the impact of what you publish. Do not use Inkline to threaten, harass, or deliberately harm others.'
        },
        {
            title: 'Respect privacy',
            text: 'Do not publish private or sensitive personal information about another person without their permission.'
        },
        {
            title: 'Keep the conversation constructive',
            text: 'Comments should contribute to the discussion. Critique ideas, not people.'
        }
    ]

    return (
        <div className="mx-auto max-w-4xl px-6 py-20">
            <div className="max-w-2xl">
                <p className="font-sans text-sm uppercase tracking-widest text-accent mb-4">
                    Community Guidelines
                </p>

                <h1 className="font-display text-5xl font-medium tracking-tight text-ink mb-6">
                    The Inkline rules.
                </h1>

                <p className="font-sans text-lg leading-8 text-ink-soft mb-12">
                    Inkline works best when people can share ideas openly while
                    treating one another with respect. Keep these simple rules in mind
                    when you write and participate.
                </p>

                <div className="space-y-8">
                    {rules.map((rule, index) => (
                        <section
                            key={rule.title}
                            className="border-t border-line pt-6"
                        >
                            <div className="flex gap-5">
                                <span className="font-sans text-sm text-accent">
                                    0{index + 1}
                                </span>

                                <div>
                                    <h2 className="font-display text-2xl font-medium text-ink mb-2">
                                        {rule.title}
                                    </h2>

                                    <p className="font-sans leading-7 text-ink-soft">
                                        {rule.text}
                                    </p>
                                </div>
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </div>
    )
}