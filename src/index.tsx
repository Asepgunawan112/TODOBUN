import { Elysia, t } from "elysia";
import { html } from "@elysiajs/html";
import Html from "@kitajs/html";

const BaseHtml = ({ children }: Html.PropsWithChildren) => (
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
      <script src="https://cdn.jsdelivr.net/npm/htmx.org@2.0.11/dist/htmx.min.js" integrity="sha384-2OatzQy1H+Zd/IIrjr1TcuDGqLXeHhbooAyJY1KdQMKnr4LZ22k31GBLdYKHmVjg" crossorigin="anonymous"></script>
      <title>BETH STACK</title>
    </head>
    {children}
  </html>
);

type Todo = {
  id: number,
  title: string,
  deadline: Date,
  note?: string,
  isCompleted: boolean,
  createdAt: Date,
  updatedAt: Date,
}

const db:Todo[] = [
  {
    id: 1,
    title: "Todo 1",
    deadline: new Date("10-31-2026"),
    note: "Note 1",
    isCompleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    title: "Todo 2",
    deadline: new Date(),
    note: "Note 2",
    isCompleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

function TodoForm(){
  return (
    <form class="flex flex-row spcae-x-3 w-full max-w-2xl px-4" hx-post="/todo" hx-target="closest div" hx-swap="beforebegin ">
      <input type="text" name="content" placeholder="Content" class="border border-gray-200 p-2 rounded-lg flex-1" />
      <button type="submit" class="bg-blue-500 text-white p-2 rounded-lg">Add</button>
    </form>
  )
}

let lastId = 3;

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
    <div class="flex flex-col space-y-3 w-full max-w-2xl px-4">
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
  .get("/todo", ()=><TodoList todos={db} />)
  .post("/todo/toggle/:id", ({ params}) => {
    const todo = db.find((todo) => todo.id === Number(params.id));
    if (todo){
        todo.isCompleted = !todo.isCompleted;
    return <TodoItem {...todo} />;
    }
  },{params:t.Object({
    id:t.Numeric(),
  })})
.delete(
  "/todo/:id",
  ({ params }) => {
    const index = db.findIndex((todo) => todo.id === params.id);
    if (index !== -1) db.splice(index, 1);
    return "";
  },
  {
    params: t.Object({
      id: t.Numeric(),
    }),
  }
)
.post(
  "/todo",
  ({ body }) => {
    if (body.content.length === 0) {
      throw new Error("Content cannot be empty");
    }
    const newTodo={
      id:lastId++,
      title:body.content,
      deadline: new Date(),
      note: "Note 1",
      isCompleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    db.push(newTodo);
    return <TodoItem {...newTodo} />;
  },
  {
    body: t.Object({
      content: t.String(),
    }),
  }
)
  .listen(3000);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);