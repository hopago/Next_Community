"use server";

import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";

interface createThreadParams {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
}

interface addCommentToThreadParams {
  threadId: string,
  commentText: string,
  userId: string,
  path: string
}

export async function createThread({
  text,
  author,
  communityId,
  path,
}: createThreadParams) {
  try {
    await connectToDB();

    const createdThread = await Thread.create({
      text,
      author,
      community: null,
    });

    await User.findByIdAndUpdate(author, {
      $push: {
        threads: createdThread._id,
      },
    });

    revalidatePath(path);
  } catch (err: any) {
    throw new Error(`Failed to create/update thread... ${err.message}`);
  }
}

export async function fetchThreads(pageNumber = 1, pageSize = 20) {
  await connectToDB();

  // Calculate the number of posts to skip
  const skipAmount = (pageNumber - 1) * pageSize;

  {/* Top level Threads */}
  const threadsQuery = Thread.find({ parentId: { $in: [null, undefined] } })
    .sort({ createdAt: "desc" })
    .skip(skipAmount)
    .limit(pageSize)
    .populate({ path: "author", model: User })
    .populate({
      path: "children",
      populate: {
        path: "author",
        model: User,
        select: "_id name parentId image",
      },
    });

    const totalPostsCount = await Thread.countDocuments({ parentId: { $in: [null, undefined] } });

    const threads = await threadsQuery.exec();

    const isNext = totalPostsCount > skipAmount + threads.length;

    return { threads, isNext }
}

export async function fetchThreadById(id: string) {
  await connectToDB();

  try {
    const thread = await Thread.findById(id)
      .populate({
        path: 'author',
        model: User,
        select: "_id id name image"
      })
      .populate({
        path: 'children',
        populate: [
          {
            path: 'author',
            model: User,
            select: "_id id name parentId image"
          },
          {
            path: 'children',
            model: Thread,
            populate: {
              path: 'author',
              model: User,
              select: "_id id name parentId image"
            }
          }
        ]
      }).exec();

      return thread;
  } catch (err: any) {
    throw new Error(`Error fetching thread: ${err.message}`);
  }
}

export async function addCommentToThread({
  threadId,
  commentText,
  userId,
  path
}: addCommentToThreadParams) {
  await connectToDB();

  try {
    const referredThread = await Thread.findById(threadId);
    if (!referredThread) {
      throw new Error("Thread not found...");
    }

    const commentThread = new Thread({
      text: commentText,
      author: userId,
      parentId: threadId,
    });
    await commentThread.save();

    referredThread.children.push(commentThread._id);
    await referredThread.save();

    revalidatePath(path);
  } catch (err: any) {
    throw new Error(`Error adding comment to thread: ${err.message}`);
  }
}