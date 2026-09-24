import { TherapyBrand } from "@/components/therapy-brand";
import { MessageCircleQuestion } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen grid place-items-center px-5">
      <section className="w-full max-w-lg rounded-[2rem] border border-[#151515]/15 bg-white p-8 text-center shadow-2xl shadow-black/20 backdrop-blur">
      <div className="mb-7"><TherapyBrand /></div>
        <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-[#ff5d1a] text-[#151515]"><MessageCircleQuestion size={34} strokeWidth={2.3} /></div>
        <p className="eyebrow">Живой опрос</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Здесь появится вопрос ведущего</h1>
        <p className="mt-4 text-[#6d6a64]">Откройте ссылку или QR-код конкретного опроса, чтобы отправить анонимный ответ.</p>
      </section>
    </main>
  );
}
