import { data, redirect, Form, Link, useActionData, useLoaderData } from "react-router";
import { prisma, isAlreadyExistError } from "~/.server/infra/db";
import type { Route } from "./+types/tasks";

export async function loader() {
  const tasks = await prisma.tasks.findMany({
    orderBy: { createdAt: "desc" },
  });
  return { tasks };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();

  if (!title) {
    return data({ error: "タイトルは必須です" }, { status: 400 });
  }

  try {
    await prisma.tasks.create({
      data: { title, body: body || null },
    });
  } catch (e) {
    if (isAlreadyExistError(e)) {
      return data(
        { error: "同じタイトルのタスクが既に存在します" },
        { status: 409 },
      );
    }
    throw e;
  }

  return redirect("/tasks");
}

export default function Tasks() {
  const { tasks } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Tasks</h1>

      {/* 新規作成フォーム */}
      <div className="mb-8 rounded-lg border p-4">
        <h2 className="mb-4 text-lg font-semibold">新規作成</h2>
        <Form method="post" className="space-y-4">
          <div>
            <label htmlFor="title" className="mb-1 block text-sm font-medium">
              タイトル
            </label>
            <input
              type="text"
              id="title"
              name="title"
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
              rows={3}
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
            作成
          </button>
        </Form>
      </div>

      {/* 一覧テーブル */}
      {tasks.length === 0 ? (
        <p className="text-gray-500">タスクがありません</p>
      ) : (
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="border-b bg-gray-50 text-left">
              <th className="px-4 py-2">タイトル</th>
              <th className="px-4 py-2">本文</th>
              <th className="px-4 py-2">作成日時</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id} className="border-b">
                <td className="px-4 py-2">{task.title}</td>
                <td className="px-4 py-2 text-gray-600">
                  {task.body || "-"}
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  {new Date(task.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-2">
                  <Link
                    to={`/tasks/${task.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    詳細
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
