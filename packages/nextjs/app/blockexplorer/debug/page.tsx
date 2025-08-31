import type { NextPage } from "next";

const Debug: NextPage = () => {
  return (
    <section className="flex flex-col items-center gap-4 w-full">
      <div className="p-8 flex flex-col gap-4 items-center rounded-lg border border-[#16203E] bg-base-200">
        <h1 className="text-2xl my-0">Debug Contracts</h1>
        <p className="text-slate-400 text-center">
          Debug functionality is temporarily disabled for local development.
        </p>
      </div>
    </section>
  );
};

export default Debug;
