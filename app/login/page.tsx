import AuthForms from "./AuthForms";

export const metadata = { title: "الدخول — قِمّة" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <div data-reveal className="shard p-7">
        <AuthForms next={next ?? ""} />
      </div>
    </section>
  );
}
