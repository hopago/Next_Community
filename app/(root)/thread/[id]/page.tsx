import ThreadCard from "@/components/cards/ThreadCard";
import Comment from "@/components/forms/Comment";
import { fetchThreadById } from "@/lib/actions/thread.actions";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

type Props = {
  params: {
    id: string;
  };
};

export default async function page({ params }: Props) {
  if(!params.id) return null;
  
  const user = await currentUser();

  if(!user) return null;

  const userInfo = await fetchUser(user.id);
  if(!userInfo.onboarded) return redirect('/onboarding');

  const thread = await fetchThreadById(params.id);

  return (
    <section className="relative">
      <div>
        <ThreadCard
          id={thread._id}
          currentUserId={user.id}
          parentId={thread.parentId}
          content={thread.text}
          author={thread.author}
          community={null}
          createdAt={thread.createdAt}
          comments={thread.children}
        />
      </div>

      <div className="mt-7">
        <Comment
          threadId={thread?.id}
          currentUserImg={userInfo?.image}
          currentUserId={JSON.stringify(userInfo?._id)}
        />
      </div>

      <div className="mt-10">
        {thread.children.map((children: any) => (
          <ThreadCard
            key={children._id}
            id={children._id}
            currentUserId={children.author.id || ""}
            parentId={children.parentId}
            content={children.text}
            author={children.author}
            community={null}
            createdAt={children.createdAt}
            comments={children.children}
            isComment
          />
        ))}
      </div>
    </section>
  );
}
