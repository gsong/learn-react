import React from 'react'
import ReactDOM from 'react-dom'
import {Provider, connect} from 'react-redux'
import {combineReducers, createStore} from 'redux'


// Reducers
const todo = (state, action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return {
        id: action.id,
        text: action.text,
        completed: false
      }

    case 'TOGGLE_TODO':
      if (state.id != action.id) {
        return state
      }

      return {
        ...state,
        completed: !state.completed
      }

    default:
      return state
  }
}


const todos = (state=[], action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return [...state, todo(undefined, action)]

    case 'TOGGLE_TODO':
      return state.map(t => todo(t, action))

    default:
      return state
  }
}


const visibilityFilter = (state='SHOW_ALL', action) => {
  switch (action.type) {
    case 'SET_VISIBILITY_FILTER':
      return action.filter

    default:
      return state
  }
}


const todoApp = combineReducers({todos, visibilityFilter})


// Utilities
const getVisibleTodos = (todos, filter) => {
  switch (filter) {
    case 'SHOW_ALL':
      return todos

    case 'SHOW_ACTIVE':
      return todos.filter(t => !t.completed)

    case 'SHOW_COMPLETED':
      return todos.filter(t => t.completed)
  }
}


let nextTodoId = 0;

const addTodo = ({store, value}) => {
  store.dispatch({
    type: 'ADD_TODO',
    id: nextTodoId++,
    text: value
  })
}


const toggleTodo = ({store, id}) => {
  store.dispatch({
    type: 'TOGGLE_TODO',
    id
  })
}


const applyFilter = ({store, filter}) => {
  store.dispatch({
    type: 'SET_VISIBILITY_FILTER',
    filter
  })
}


// Presentational components
const AddTodo = (__, {store}) => {
  let input;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        addTodo({store, value: input.value})
        input.value = ''
      }}
    >
      <input ref={node => input = node} />
      <button type="submit">Add Todo</button>
    </form>
  )
}
AddTodo.contextTypes = {
  store: React.PropTypes.object
}


const TodoList = ({todos, onTodoClick}, {store}) => (
  <ul>
    {todos.map(todo =>
      <Todo
        key={todo.id}
        {...todo}
        onClick={() => onTodoClick({store, id: todo.id})}
      />
    )}
  </ul>
)
TodoList.contextTypes = {
  store: React.PropTypes.object
}


const Todo = ({onClick, completed, text}) => (
  <li
    onClick={onClick}
    style={{
      textDecoration: completed ? 'line-through' : 'none'
    }}
  >
    {text}
  </li>
)


const Footer = () => (
  <div>
    Show:
    {' '}
    <FilterLink filter="SHOW_ALL">All</FilterLink>
    {', '}
    <FilterLink filter="SHOW_ACTIVE">Active</FilterLink>
    {', '}
    <FilterLink filter="SHOW_COMPLETED">Completed</FilterLink>
  </div>
)


const Link = ({active, onClick, children}) => {
  if (active) {
    return <span>{children}</span>
  }

  return (
    <a href="#"
      onClick={e => {
        e.preventDefault()
        onClick()
      }}
    >
      {children}
    </a>
  )
}


// Container components
const mapStateToProps = state => ({
  todos: getVisibleTodos(state.todos, state.visibilityFilter)
})

const mapDispatchToProps = dispatch => ({
  onTodoClick: id => {
    dispatch({type: 'TOGGLE_TODO', id})
  }
})

const VisibleTodos = connect(mapStateToProps, mapDispatchToProps)(TodoList)


//class VisibleTodos extends React.Component {
//  componentDidMount() {
//    const {store} = this.context
//    this.unsubscribe = store.subscribe(() => this.forceUpdate())
//  }
//
//  componentWillUnmount() {
//    this.unsubscribe()
//  }
//
//  render() {
//    const {store} = this.context
//    const {todos, visibilityFilter} = store.getState()
//
//    return (
//      <TodoList
//        todos={getVisibleTodos(todos, visibilityFilter)}
//        onTodoClick={toggleTodo}
//      />
//    )
//  }
//}
//VisibleTodos.contextTypes = {
//  store: React.PropTypes.object
//}


class FilterLink extends React.Component {
  componentDidMount() {
    const {store} = this.context
    this.unsubscribe = store.subscribe(() => this.forceUpdate())
  }

  componentWillUnmount() {
    this.unsubscribe()
  }

  render() {
    const {store} = this.context
    const {filter, children} = this.props
    const {visibilityFilter} = store.getState()

    return (
      <Link
        active={filter === visibilityFilter}
        onClick={() => applyFilter({store, filter})}
      >
        {children}
      </Link>
    )
  }
}
FilterLink.contextTypes = {
  store: React.PropTypes.object
}


const TodoApp = ({todos, visibilityFilter}) => (
  <div>
    <AddTodo />
    <VisibleTodos />
    <Footer />
  </div>
)


ReactDOM.render(
  <Provider store={createStore(todoApp)}>
    <TodoApp />
  </Provider>,
  document.getElementById('app')
)
