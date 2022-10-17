const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const datefns = require("date-fns");
const { format, compareAsc, isValid } = datefns;

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

//API 1

app.get("/todos/", async (request, response) => {
  const {
    search_q = "",
    priority = "",
    status = "",
    category = "",
  } = request.query;
  let statussplit = status.split("%20").join(" ");
  let checkStatus = ["TO DO", "IN PROGRESS", "DONE"];
  let checkPriority = ["HIGH", "MEDIUM", "LOW"];
  let checkCategory = ["WORK", "HOME", "LEARNING"];

  if (priority != "" && status != "") {
    if (checkPriority.includes(priority)) {
      if (checkStatus.includes(status)) {
        const getTodoQuery = `SELECT
            id,
            todo,
            category,
            priority,
            status,
            due_date as dueDate
            FROM
            todo
            where status ='${statussplit}' and priority = '${priority}'
            ;`;
        const dbResponse = await db.all(getTodoQuery);
        response.send(dbResponse);
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  } else if (category != "" && status != "") {
    if (checkCategory.includes(category)) {
      if (checkStatus.includes(status)) {
        const getTodoQuery = `SELECT
            id,
            todo,
            category,
            priority,
            status,
            due_date as dueDate
            FROM
            todo
            where status ='${statussplit}' and category = '${category}'
            ;`;
        const dbResponse = await db.all(getTodoQuery);
        response.send(dbResponse);
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
    }
  } else if (category != "" && priority != "") {
    if (checkCategory.includes(category)) {
      if (checkPriority.includes(priority)) {
        const getTodoQuery = `SELECT
            id,
            todo,
            category,
            priority,
            status,
            due_date as dueDate
            FROM
            todo
            where priority ='${priority}' and category = '${category}'
            ;`;
        const dbResponse = await db.all(getTodoQuery);
        response.send(dbResponse);
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
    }
  } else if (status != "") {
    if (checkStatus.includes(status)) {
      const getTodoQuery = `SELECT
        id,
            todo,
            category,
            priority,
            status,
            due_date as dueDate
        FROM
        todo
        where status ='${statussplit}' 
        
        ;`;
      const dbResponse = await db.all(getTodoQuery);
      response.send(dbResponse);
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else if (category != "") {
    if (checkCategory.includes(category)) {
      const getTodoQuery = `SELECT
        id,
            todo,
            category,
            priority,
            status,
            due_date as dueDate
        FROM
        todo
        where category ='${category}' 
        
        ;`;
      const dbResponse = await db.all(getTodoQuery);
      response.send(dbResponse);
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
    }
  } else if (search_q != "") {
    const getTodoQuery = `SELECT
      id,
            todo,
            category,
            priority,
            status,
            due_date as dueDate
    FROM
      todo
      where  todo like '%${search_q}%'
      
      ;`;
    const dbResponse = await db.all(getTodoQuery);
    response.send(dbResponse);
  } else {
    if (checkPriority.includes(priority)) {
      const getTodoQuery = `SELECT
        id,
            todo,
            category,
            priority,
            status,
            due_date as dueDate
        FROM
        todo
        where priority='${priority}' 
      
      ;`;
      const dbResponse = await db.all(getTodoQuery);
      response.send(dbResponse);
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  }
});

//--------------------------------------------------

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `SELECT
      id,
            todo,
            category,
            priority,
            status,
            due_date as dueDate
    FROM
      todo
    WHERE
      id = ${todoId};`;
  const todoResponse = await db.get(getTodoQuery);

  response.send(todoResponse);
});

//----------------------------------------------------
/*
let due_dat = new Date("2021-02-22");
var result = isValid(new Date(due_dat));
console.log(result);
*/
//---------------------------------------------------------

app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  var result = isValid(new Date(date));
  if (result == true) {
    let formateddate = format(new Date(date), "yyyy-MM-dd");
    const getTodoQuery = ` 
    select id,
            todo,
            category,
            priority,
            status,
            due_date as dueDate from todo where due_date = '${formateddate}';
    `;
    const dbResponse = await db.all(getTodoQuery);
    response.send(dbResponse);
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }

  /*const getTodoQuery = `SELECT
      *
    FROM
      todo
      where status ='${statussplit}'
      ;`;
  const dbResponse = await db.all(getTodoQuery);
  response.send(dbResponse);*/
});

//-------------------------------------------------------------

app.post("/todos/", async (request, response) => {
  const todoDetails = request.body;
  const { id, todo, priority, status, category, dueDate } = todoDetails;
  let checkStatus = ["TO DO", "IN PROGRESS", "DONE"];
  let checkPriority = ["HIGH", "MEDIUM", "LOW"];
  let checkCategory = ["WORK", "HOME", "LEARNING"];
  if (checkStatus.includes(status)) {
    if (checkPriority.includes(priority)) {
      if (checkCategory.includes(category)) {
        var result = isValid(new Date(dueDate));
        if (result == true) {
          let formateddate = format(new Date(dueDate), "yyyy-MM-dd");
          const addTodoQuery = `INSERT INTO
      todo (id,todo,priority,status,category,due_date)
    VALUES
      (
        ${id},
       '${todo}',
       '${priority}',
       '${status}',
       '${category}',
       '${formateddate}'
        
      );`;

          const dbResponse = await db.run(addTodoQuery);

          response.send("Todo Successfully Added");
        } else {
          response.status(400);
          response.send("Invalid Due Date");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  } else {
    response.status(400);
    response.send("Invalid Todo Status");
  }
});
//------------------------------------------------------------

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const todoDetails = request.body;
  let checkStatus = ["TO DO", "IN PROGRESS", "DONE"];
  let checkPriority = ["HIGH", "MEDIUM", "LOW"];
  let checkCategory = ["WORK", "HOME", "LEARNING"];
  const { status, priority, todo, category, dueDate } = todoDetails;
  if (priority != undefined) {
    if (checkPriority.includes(priority)) {
      const updateTodo = `
        update todo set 
        priority = '${priority}'  
        where id = ${todoId};  `;
      const dbResponse = await db.run(updateTodo);
      response.send("Priority Updated");
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  } else if (status != undefined) {
    if (checkStatus.includes(status)) {
      const updateTodo = `
            update todo set 
            status = '${status}'  
            where id = ${todoId};
            `;
      const dbResponse = await db.run(updateTodo);
      response.send("Status Updated");
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else if (category != undefined) {
    if (checkCategory.includes(category)) {
      const updateTodo = `
            update todo set 
            category = '${category}'  
            where id = ${todoId};
            `;
      const dbResponse = await db.run(updateTodo);
      response.send("Category Updated");
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
    }
  } else if (dueDate != undefined) {
    var result = isValid(new Date(dueDate));
    if (result == true) {
      let formateddate = format(new Date(dueDate), "yyyy-MM-dd");
      const updateTodo = `
            update todo set 
            due_date = '${formateddate}'  
            where id = ${todoId};
            `;
      const dbResponse = await db.run(updateTodo);
      response.send("Due Date Updated");
    } else {
      response.status(400);
      response.send("Invalid Due Date");
    }
  } else {
    const updateTodo = `
    update todo set 
    todo = '${todo}'
  
    where id = ${todoId};
    `;
    const dbResponse = await db.run(updateTodo);
    response.send("Todo Updated");
  }
});

//----------------------------------

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuary = `
    delete from todo where id = ${todoId};
    `;
  await db.run(deleteTodoQuary);
  response.send("Todo Deleted");
});

module.exports = app;
