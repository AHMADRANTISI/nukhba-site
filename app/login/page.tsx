import AuthForms from "./AuthForms";

export const metadata = { title: "الدخول — نخبة" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; as?: string }> }) {
  const { next, as } = await searchParams;
  const side = as === "pro" || next?.startsWith("/pro") ? "pro" : "customer";
  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <div data-reveal className="shard p-7">
        <AuthForms next={next ?? ""} side={side} />
      </div>
    </section>
  );
}
