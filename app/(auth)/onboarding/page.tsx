import AccountProfile from '@/components/forms/AccountProfile';
import { fetchUser } from '@/lib/actions/user.actions';
import { currentUser } from '@clerk/nextjs';

export default async function page() {
  const currUser = await currentUser();

  let userInfo;

  if (currUser) {
    userInfo = await fetchUser(currUser.id);
  }

  const currUserData = {
    id: currUser?.id as string,
    objectId: userInfo?._id,
    username: userInfo?.username || currUser?.username,
    name: userInfo?.name || currUser?.firstName || "",
    bio: userInfo?.bio || "",
    image: userInfo?.image || currUser?.imageUrl
  }

  return (
    <main className='mx-auto flex max-w-3xl flex-col justify-start px-10 py-20'>
      <h1 className="head-text">Onboarding</h1>
      <p className='mt-3 text-base-regular text-light-2'>
        Complete your profile!
      </p>

      <section className='mt-9 bg-dark-2 p-10'>
        <AccountProfile user={currUserData} btnTitle="Continue" />
      </section>
    </main>
  );
}