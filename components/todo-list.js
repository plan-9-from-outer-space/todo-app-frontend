
import styles from '../styles/todo-list.module.css'
import { useState, useEffect, useCallback, useRef } from 'react'
import { debounce } from 'lodash'
import ToDo from './todo'

export default function ToDoList() {

  // React hooks
  const [todos, setTodos] = useState(null)
  const [mainInput, setMainInput] = useState('')
  const [filter, setFilter] = useState()

  const didFetchRef = useRef(false)

  useEffect(() => {
    if (didFetchRef.current === false) {
      didFetchRef.current = true
      fetchTodos()
    }
  }, [])

  //   http://localhost:8000/todos
  //   http://localhost:8000/todos?completed=true

  async function fetchTodos(completed) {
    let path = '/todos'
    if (completed !== undefined) {
      path = `/todos?completed=${completed}`
    }
    // const finalPath = process.env.NEXT_PUBLIC_API_URL + path
    // const res = await fetch(finalPath)
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + path)
    const json = await res.json()
    setTodos(json)
  }

  //   React hooks: useCallback, lodash/debounce
  //   Note: Returns a memoized function
  const debouncedUpdateTodo = useCallback(debounce(updateTodo, 500), [])

  function handleToDoChange(e, id) {
    const target = e.target
    // const value = (target.type === 'checkbox' ? target.checked : target.value)
    const value = target.type === 'checkbox' ? target.checked : target.value
    const name = target.name
    const copy = [...todos]
    const idx = todos.findIndex( (todo) => todo.id === id )
    const changedToDo = {
      ...todos[idx],
      [name]: value
    }
    copy[idx] = changedToDo
    debouncedUpdateTodo(changedToDo)  // updates the backend/database
    setTodos(copy) // triggers a re-render of the component (frontend/UI)
  }

  async function updateTodo (todo) {
    // { name: "task 1", completed: false }
    const data = {
      name: todo.name,
      completed: todo.completed
    }
    // url = "http://localhost:8000/todos/5"
    const url = process.env.NEXT_PUBLIC_API_URL + `/todos/${todo.id}`;
    const result = await fetch(url, 
      {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      })
  }

  async function addToDo(name) {
    // url = "http://localhost:8000/todos/"
    const url = process.env.NEXT_PUBLIC_API_URL + `/todos/`;
    const result = await fetch(url, 
      {
        method: 'POST',
        body: JSON.stringify({ name: name, completed: false }),
        headers: { 'Content-Type': 'application/json' }
      });
    if (result.ok) {
      const json = await result.json();
      const copy = [...todos, json]
      setTodos(copy)
    }
  }

  async function handleDeleteToDo(id) {
    // url = "http://localhost:8000/todos/5"
    const url = process.env.NEXT_PUBLIC_API_URL + `/todos/${id}`;
    const result = await fetch(url, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    if (result.ok) {
      const idx = todos.findIndex((todo) => todo.id === id)
      const copy = [...todos]
      copy.splice(idx, 1) // remove the indexed task
      setTodos(copy)
    }
  }

  function handleMainInputChange(e) {
    setMainInput(e.target.value)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      if (mainInput.length > 0) {
        addToDo(mainInput)
        setMainInput('')
      }
    }
  }

  function handleFilterChange(value) {
    setFilter(value)
    fetchTodos(value)
  }

  // JSX return block
  return (
    <div className={styles.container}>
      <div className={styles.mainInputContainer}>
        <input className={styles.mainInput} placeholder="What needs to be done?" value={mainInput} 
               onChange={(e) => handleMainInputChange(e)} onKeyDown={handleKeyDown}>
        </input>
      </div>
      {!todos && (
        <div>Loading...</div>
      )}
      {todos && (
        <div>
          {todos.map((todo) => {
            return (
              <ToDo key={todo.id} todo={todo} onDelete={handleDeleteToDo} onChange={handleToDoChange} />
            )
          })}
        </div>
      )}
      <div className={styles.filters}>
        <button className={`${styles.filterBtn} ${filter === undefined && styles.filterActive}`} 
                onClick={() => handleFilterChange()}>All</button>
        <button className={`${styles.filterBtn} ${filter === false && styles.filterActive}`} 
                onClick={() => handleFilterChange(false)}>Active</button>
        <button className={`${styles.filterBtn} ${filter === true && styles.filterActive}`} 
                onClick={() => handleFilterChange(true)}>Completed</button>
      </div>
    </div>
  )

}

