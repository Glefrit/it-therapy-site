import PollClient from "./poll-client";

export default async function PollPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PollClient id={id} />;
}
