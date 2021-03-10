const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

/**
 * user
 * id:string - uuid
 * name:string
 * username:string
 * todos:[] 
 */

/**
 *todos
 * id:string - uuid
 * title:string
 * done:boolean
 * deadline:date
 * created_at:date
 */

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if(!user){
    return response.status(404).json({error:"Not found"});
  };

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name,username } = request.body;

  const userAlreadyExist = users.find(user => user.username === username);

  if(userAlreadyExist){
    return response.status(400).json({error:"User already exists!"})
  }

  const newUser = {
    id:uuidv4(),
    name,
    username,
    todos:[]
  };

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title,deadline } = request.body;

  const { user } = request;

  const todoOperation = {
    id:uuidv4(),
    title,
    deadline:new Date(deadline),
    done:false,
    created_at:new Date()
  }

  user.todos.push(todoOperation);

  return response.status(201).json(todoOperation);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title,deadline } = request.body;
  const { id } = request.params;
  const { user } = request;

  const findTodo = user.todos.find(f => f.id === id);

  if(!findTodo){
    return response.status(404).json({error:"Todo not found"})
  }

  findTodo.title = title;
  findTodo.deadline = deadline;
 
  return response.status(201).json(findTodo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const findTodo = user.todos.find(f => f.id === id);

  if(!findTodo){
    return response.status(404).json({error:"Todo not found"})
  }

  findTodo.done = true;

  return response.status(201).json(findTodo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const findTodo = user.todos.find(f => f.id === id);

  if(!findTodo){
    return response.status(404).json({error:"Todo not found"})
  }

  user.todos.splice(findTodo,1)

  return response.status(204).json(user.todos);
});

module.exports = app;