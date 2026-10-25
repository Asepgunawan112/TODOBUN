import { Elysia, t } from "elysia";
import { html } from "@elysiajs/html";
import Html from "@kitajs/html";
import {db} from "./db/index"
import {Todo, todos} from "./db/schema"
import { eq } from "drizzle-orm";

const BaseHtml = ({ children }: Html.PropsWithChildren) => (
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
      <script src="https://cdn.jsdelivr.net/npm/htmx.org@2.0.11/dist/htmx.min.js"></script>
      <title>BETH STACK</title>
    </head>
    {children}
  </html>
);



function TodoForm(){
  return (
    <form class="flex flex-row space-x-3 w-full max-w-2xl px-4" hx-post="/todo" hx-target="#todo-list" hx-swap="afterbegin">
      <input type="text" name="content" placeholder="Content" required class="border border-gray-200 p-2 rounded-lg flex-1" />
      <button type="submit" class="bg-blue-500 text-white p-2 rounded-lg">Add</button>
    </form>
  )
}


function TodoItem({title, isCompleted, id, deadline}:Todo){
  return(
    <div class="flex flex-row items-center justify-between space-x-4 border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow hover:cursor-pointer">
      <p class="flex-1 font-medium">{title}</p>
      <p class="text-sm text-gray-500">{deadline.toDateString()}</p>
      <input type="checkbox" checked={isCompleted} class="w-4 h-4 cursor-pointer" hx-post={`/todo/toggle/${id}`} hx-target="closest div" hx-swap="outerHTML"/>
      <button class="text-red-500 font-bold hover:text-red-700" hx-delete={`/todo/${id}`} hx-target="closest div" hx-swap="outerHTML">X</button> 
    </div>
  )
}

function TodoList({todos}: {todos: Todo[]}){
  return (
    <div id="todo-list" class="flex flex-col space-y-3 w-full max-w-2xl px-4">
      {todos.map((todo) => (
        <TodoItem {...todo} />
      ))}
      <TodoForm/>
    </div>
  )
}

const app = new Elysia()
  .use(html())
  .get("/", () => (
    <BaseHtml>
      <body hx-get="/todo" hx-trigger="load" hx-swap="innerHTML" class="flex w-full h-screen justify-center items-center flex-col gap-2">
      </body>
    </BaseHtml>
  )).post("/clicked", <div>Clicked!</div>)
  .get("/todo",  async ()=>{
    const data = await db.select().from(todos).all();
    return <TodoList todos={data} />
  })
  .post("/todo/toggle/:id", async ({ params, set }) => {
    const oldTodo = await db.select().from(todos).where(eq(todos.id, Number(params.id))).get();
    if (!oldTodo) {
      set.status = 404;
      return "Todo not found";
    }
    const newTodo = await db.update(todos).set({isCompleted: !oldTodo.isCompleted}).where(eq(todos.id, Number(params.id))).returning().get();
    return <TodoItem {...newTodo} />;
  }
  ,{params:t.Object({
    id:t.Numeric(),
  })})
.delete(
  "/todo/:id",
  async ({ params }) => {
      await db.delete(todos).where(eq(todos.id, Number(params.id)))
      return ""
  },
  {
    params: t.Object({
      id: t.Numeric(),
    }),
  }
)
.post(
  "/todo",
  async ({ body }) => {
    if (body.content.length === 0) {
      throw new Error("Content cannot be empty");
    }
    const newTodo = await db
      .insert(todos)
      .values({
        title: body.content,
      })
      .returning()
      .get();
    return <TodoItem {...newTodo} />;
  },
  {
    body: t.Object({
      content: t.String(),
    }),
  }
)
  .listen({ port: 3000, hostname: "0.0.0.0" });

console.log(`🦊 Elysia is running at http://localhost:${app.server?.port}`);
