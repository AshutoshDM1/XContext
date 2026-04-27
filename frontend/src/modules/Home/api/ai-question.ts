const apiBase = () => (process.env.NEXT_PUBLIC_BACKEND_URL ?? '').replace(/\/$/, '');

export type AiQuestionResponse = { question: string };

export async function postAiQuestion(topic: string): Promise<AiQuestionResponse> {
  const base = apiBase();
  if (!base) throw new Error('NEXT_PUBLIC_BACKEND_URL is not set');

  const res = await fetch(`${base}/api/v1/ai-question`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ topic }),
  });

  const data = (await res.json().catch(() => ({}))) as { message?: string; question?: string };
  if (!res.ok) throw new Error(data.message ?? `Request failed (${res.status})`);
  if (!data.question) throw new Error('Invalid response from server');
  return { question: data.question };
}
