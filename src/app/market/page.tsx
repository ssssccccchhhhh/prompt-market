import Link from "next/link";

export default function MarketPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 font-[family-name:var(--font-geist-sans)]">
      <h1 className="text-3xl font-bold">마켓플레이스</h1>
      <p className="mt-4 text-gray-600">준비 중입니다.</p>
      <Link href="/" className="mt-8 text-blue-600 hover:underline">
        ← 홈으로
      </Link>
    </div>
  );
}
