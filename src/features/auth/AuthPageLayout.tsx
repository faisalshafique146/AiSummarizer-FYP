import type { ReactNode } from "react";
import { Link } from "react-router";
import { logo } from "../../assets";

interface AuthPageLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
}

function AuthPageLayout({
  title,
  description,
  children,
}: AuthPageLayoutProps) {
  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div className="main" aria-hidden="true">
        <div className="gradient" />
      </div>
      <section className="relative z-10 w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl">
        <Link to="/" className="mb-6 inline-block" aria-label="HiSumz home">
          <img src={logo} alt="HiSumz logo" className="w-28 object-contain" />
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        <p className="mt-2 text-sm text-gray-600">{description}</p>
        {children}
      </section>
    </main>
  );
}

export default AuthPageLayout;
