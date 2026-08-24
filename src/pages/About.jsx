export default function About() {
    return (
        <div className="mx-auto max-w-4xl px-6 py-20">
            <div className="max-w-2xl">
                <p className="font-sans text-sm uppercase tracking-widest text-accent mb-4">
                    About Inkline
                </p>

                <h1 className="font-display text-5xl font-medium tracking-tight text-ink mb-8">
                    A place for ideas worth reading.
                </h1>

                <div className="space-y-6 font-sans text-lg leading-8 text-ink-soft">
                    <p>
                        Inkline is a space for writers and readers to share thoughtful
                        stories, ideas, experiences, and perspectives.
                    </p>

                    <p>
                        We believe good writing does not need to be loud. It needs to be
                        honest, clear, and worth someone's time.
                    </p>

                    <p>
                        Whether you are publishing your first article or sharing your
                        hundredth story, Inkline gives you a simple place to write,
                        discover, and connect with other people through words.
                    </p>
                </div>

                <div className="mt-14 border-t border-line pt-8">
                    <h2 className="font-display text-2xl font-medium text-ink mb-3">
                        Write. Read. Connect.
                    </h2>

                    <p className="font-sans text-ink-soft leading-7">
                        Explore the feed, publish your own work, clap for stories you
                        enjoyed, and join the conversation through comments.
                    </p>
                </div>
            </div>
        </div>
    )
}