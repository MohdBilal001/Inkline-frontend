import { useState } from 'react'
import { sendContactMessage } from '../api/client'

const initialForm = { name: '', email: '', subject: '', message: '' }

export default function Contact() {
    const [form, setForm] = useState(initialForm)
    const [submitted, setSubmitted] = useState(false)
    const [sending, setSending] = useState(false)
    const [error, setError] = useState('')

    function handleChange(e) {
        const { name, value } = e.target
        setForm((current) => ({ ...current, [name]: value }))
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setSending(true)

        try {
            await sendContactMessage(form)
            setSubmitted(true)
            setForm(initialForm)
        } catch (err) {
            setError(err.message || 'Unable to send your message. Please try again.')
        } finally {
            setSending(false)
        }
    }

    return (
        <div className="mx-auto max-w-4xl px-6 py-20">
            <div className="grid gap-16 md:grid-cols-[0.8fr_1.2fr]">
                <div>
                    <p className="font-sans text-sm uppercase tracking-widest text-accent mb-4">
                        Contact Us
                    </p>

                    <h1 className="font-display text-5xl font-medium tracking-tight text-ink mb-6">
                        Let's talk.
                    </h1>

                    <p className="font-sans text-lg leading-8 text-ink-soft">
                        Have a question, feedback, or something you'd like us to know?
                        Send us a message.
                    </p>
                </div>

                <div>
                    {submitted ? (
                        <div className="border border-line rounded-lg p-8">
                            <h2 className="font-display text-2xl font-medium text-ink mb-3">
                                Thanks for reaching out.
                            </h2>

                            <p className="font-sans text-ink-soft leading-7">
                                Your message has been sent successfully. We'll get back to you as soon as possible.
                            </p>

                            <button
                                onClick={() => { setSubmitted(false); setError('') }}
                                className="mt-6 text-accent underline-grow font-sans"
                            >
                                Send another message
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6 font-sans">
                            <Field label="Name" name="name" type="text" value={form.name} onChange={handleChange} required />
                            <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
                            <Field label="Subject" name="subject" type="text" value={form.subject} onChange={handleChange} required />

                            <label className="block">
                                <span className="text-sm text-ink-soft mb-1 block">Message</span>
                                <textarea
                                    name="message"
                                    value={form.message}
                                    onChange={handleChange}
                                    required
                                    rows={6}
                                    className="w-full rounded-md border border-line bg-transparent px-3 py-2 focus:border-accent outline-none resize-none"
                                />
                            </label>

                            {error && (
                                <p className="text-sm text-red-700 leading-6">{error}</p>
                            )}

                            <button
                                type="submit"
                                disabled={sending}
                                className="rounded-full bg-ink text-paper px-6 py-3 font-medium hover:bg-accent transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {sending ? 'Sending…' : 'Send message'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}

function Field({ label, name, type, value, onChange, required }) {
    return (
        <label className="block">
            <span className="text-sm text-ink-soft mb-1 block">{label}</span>
            <input
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                required={required}
                className="w-full rounded-md border border-line bg-transparent px-3 py-2 focus:border-accent outline-none"
            />
        </label>
    )
}
