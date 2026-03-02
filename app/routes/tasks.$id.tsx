import { data, redirect, Form, Link, useActionData, useLoaderData } from "react-router";
import { prisma, isNotFoundError, isAlreadyExistError } from "~/.server/infra/db";
import type { Route } from "./+types/tasks.$id";

export async function loader({ params }: Route.LoaderArgs) {
  const task = await prisma.tasks.findUnique({
    where: { id: params.id },
  });

  if (!task) {
    throw data("タスクが見つかりません", { status: 404 });
  }

  return { task };
}

export async function action({ request, params }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    try {
      await prisma.tasks.delete({ where: { id: params.id } });
    } catch (e) {
      if (isNotFoundError(e)) {
        throw data("タスクが見つかりません", { status: 404 });
      }
      throw e;
    }
    return redirect("/tasks");
  }

  if (intent === "update") {
    const title = String(formData.get("title") || "").trim();
    const body = String(formData.get("body") || "").trim();

    if (!title) {
      return data({ error: "タイトルは必須です" }, { status: 400 });
    }

    try {
      await prisma.tasks.update({
        where: { id: params.id },
        data: { title, body: body || null },
      });
    } catch (e) {
      if (isNotFoundError(e)) {
        throw data("タスクが見つかりません", { status: 404 });
      }
      if (isAlreadyExistError(e)) {
        return data(
          { error: "同じタイトルのタスクが既に存在します" },
          { status: 409 },
        );
      }
      throw e;
    }

    return redirect(`/tasks/${params.id}`);
  }

  return data({ error: "不正なリクエストです" }, { status: 400 });
}

export default function TaskDetail() {
  const { task } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div className="mx-auto max-w-2xl p-6">
      <Link to="/tasks" className="mb-4 inline-block text-blue-600 hover:underline">
        &larr; 一覧へ戻る
      </Link>

      <h1 className="mb-6 text-2xl font-bold">タスク編集</h1>

      {/* 編集フォーム */}
      <Form method="post" className="mb-8 space-y-4">
        <input type="hidden" name="intent" value="update" />
        <div>
          <label htmlFor="title" className="mb-1 block text-sm font-medium">
            タイトル
          </label>
          <input
            type="text"
            id="title"
            name="title"
            defaultValue={task.title}
            required
            className="w-full rounded border px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="body" className="mb-1 block text-sm font-medium">
            本文
          </label>
          <textarea
            id="body"
            name="body"
            defaultValue={task.body ?? ""}
            rows={5}
            className="w-full rounded border px-3 py-2"
          />
        </div>
        {actionData && "error" in actionData && (
          <p className="text-sm text-red-600">{actionData.error}</p>
        )}
        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          更新
        </button>
      </Form>

      {/* 削除フォーム */}
      <div className="border-t pt-6">
        <h2 className="mb-2 text-lg font-semibold text-red-600">削除</h2>
        <Form method="post">
          <input type="hidden" name="intent" value="delete" />
          <button
            type="submit"
            className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            onClick={(e) => {
              if (!confirm("本当に削除しますか？")) {
                e.preventDefault();
              }
            }}
          >
            このタスクを削除
          </button>
        </Form>
      </div>

      {/* メタ情報 */}
      <div className="mt-6 border-t pt-4 text-sm text-gray-500">
        <p>作成日時: {new Date(task.createdAt).toLocaleString()}</p>
        <p>更新日時: {new Date(task.updatedAt).toLocaleString()}</p>
      </div>
    </div>
  );
}
