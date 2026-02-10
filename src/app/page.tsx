import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8 font-[family-name:var(--font-geist-sans)]">
      <h1 className="text-4xl font-bold">Jetsong Toy</h1>
      <p className="text-lg text-gray-600">
        MCP 서버와 Skill을 관리하는 내부 마켓플레이스
      </p>
      <div className="flex gap-4">
        <Link
          href="/market"
          className="rounded-lg bg-black px-6 py-3 text-white hover:bg-gray-800"
        >
          마켓플레이스
        </Link>
        <Link
          href="/setup"
          className="rounded-lg border border-gray-300 px-6 py-3 hover:bg-gray-50"
        >
          셋업
        </Link>
      </div>
    </div>
  );
}
