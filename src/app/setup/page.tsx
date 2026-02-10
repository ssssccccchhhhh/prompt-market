"use client";

export default function SetupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 font-[family-name:var(--font-geist-sans)]">
      <h1 className="text-3xl font-bold">셋업</h1>
      <p className="mt-4 text-gray-600">준비 중입니다.</p>
      <a href="/" className="mt-8 text-blue-600 hover:underline">
        ← 홈으로
      </a>
    </div>
  );
}
