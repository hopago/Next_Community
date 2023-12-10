import ThreadCard from "@/components/cards/ThreadCard";
import { fetchThreads } from "@/lib/actions/thread.actions";
import { currentUser } from "@clerk/nextjs";

export default async function Home() {
  const res = await fetchThreads();
  const user = await currentUser();

  return (
    <div>
      <h1 className="head-text text-left">Home</h1>

      <section className="mt-9 flex flex-col gap-10">
        {!res.threads.length ? (
          <p>No threads found...</p>
        ) : (
          res.threads.map((thread) => (
            <ThreadCard
              key={thread._id}
              id={thread._id}
              currentUserId={user?.id ?? ""}
              parentId={thread.parentId}
              content={thread.text}
              author={thread.author}
              community={thread.community}
              createdAt={thread.createdAt}
              comments={thread.children}
            />
          ))
        )}
      </section>
    </div>
  )
}