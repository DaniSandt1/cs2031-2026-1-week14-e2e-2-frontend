export function InlineMessage({
  tone,
  message
}: {
  tone: 'error' | 'success' | 'info';
  message: string;
}) {
  return <p className={`inline-message ${tone}`}>{message}</p>;
}
