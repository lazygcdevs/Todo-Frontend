"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import TodoItem from "../components/todo-item"
import type { Todo, CreateTodoRequest, UpdateTodoRequest } from "../types/todo"

const API_BASE = "https://todoapi.spshan.com/api/v1"

// API Client Functions
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    credentials: "include", // CRITICAL: Always include cookies
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

async function fetchTodos(): Promise<Todo[]> {
  const response = await apiCall("/todos")
  return response.todos
}

async function createTodo(data: CreateTodoRequest): Promise<Todo> {
  const response = await apiCall("/todos", {
    method: "POST",
    body: JSON.stringify(data),
  })
  return response.todo
}

async function updateTodo(id: string, data: UpdateTodoRequest): Promise<Todo> {
  const response = await apiCall(`/todos/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
  return response.todo
}

async function deleteTodo(id: string): Promise<void> {
  await apiCall(`/todos/${id}`, {
    method: "DELETE",
  })
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Load todos on component mount
  useEffect(() => {
    loadTodos()
  }, [])

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null)
        setSuccess(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, success])

  const loadTodos = async () => {
    try {
      setLoading(true)
      setError(null)
      const todosData = await fetchTodos()
      setTodos(todosData)
    } catch (err) {
      setError("Failed to load todos. Please check if the API server is running.")
      console.error("Error loading todos:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      setError("Title is required")
      return
    }

    try {
      setCreating(true)
      setError(null)

      const newTodo = await createTodo({
        title: title.trim(),
        description: description.trim() || undefined,
      })

      setTodos((prev) => [newTodo, ...prev])
      setTitle("")
      setDescription("")
      setSuccess("Todo created successfully!")
    } catch (err) {
      setError("Failed to create todo. Please try again.")
      console.error("Error creating todo:", err)
    } finally {
      setCreating(false)
    }
  }

  const handleToggleComplete = async (id: string, completed: boolean) => {
    try {
      setError(null)

      // Optimistic update
      setTodos((prev) => prev.map((todo) => (todo.id === id ? { ...todo, completed } : todo)))

      const updatedTodo = await updateTodo(id, { completed })

      // Update with server response
      setTodos((prev) => prev.map((todo) => (todo.id === id ? updatedTodo : todo)))
    } catch (err) {
      // Revert optimistic update
      setTodos((prev) => prev.map((todo) => (todo.id === id ? { ...todo, completed: !completed } : todo)))
      setError("Failed to update todo. Please try again.")
      console.error("Error updating todo:", err)
    }
  }

  const handleUpdateTodo = async (id: string, data: UpdateTodoRequest) => {
    try {
      setError(null)
      const updatedTodo = await updateTodo(id, data)
      setTodos((prev) => prev.map((todo) => (todo.id === id ? updatedTodo : todo)))
      setSuccess("Todo updated successfully!")
    } catch (err) {
      setError("Failed to update todo. Please try again.")
      console.error("Error updating todo:", err)
    }
  }

  const handleDeleteTodo = async (id: string) => {
    try {
      setError(null)
      await deleteTodo(id)
      setTodos((prev) => prev.filter((todo) => todo.id !== id))
      setSuccess("Todo deleted successfully!")
    } catch (err) {
      setError("Failed to delete todo. Please try again.")
      console.error("Error deleting todo:", err)
    }
  }

  const completedCount = todos.filter((todo) => todo.completed).length
  const totalCount = todos.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-3">
            Todo List
          </h1>
          <p className="text-gray-400 text-lg">Stay organized and get things done with style</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-8 backdrop-blur-md bg-red-500/10 border border-red-500/20 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
              <p className="text-red-200">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-8 backdrop-blur-md bg-green-500/10 border border-green-500/20 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0" />
              <p className="text-green-200">{success}</p>
            </div>
          </div>
        )}

        {/* Add Todo Form */}
        <div className="mb-12 backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Plus className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-white">Add New Todo</h2>
          </div>

          <form onSubmit={handleCreateTodo} className="space-y-6">
            <div>
              <Input
                placeholder="What needs to be done?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={creating}
                className="text-lg bg-white/5 border-white/10 text-white placeholder:text-gray-400 rounded-xl h-14 focus:bg-white/10 focus:border-blue-500/50 transition-all duration-200"
                required
              />
            </div>
            <div>
              <Textarea
                placeholder="Add a description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={creating}
                rows={3}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 rounded-xl focus:bg-white/10 focus:border-blue-500/50 transition-all duration-200 resize-none"
              />
            </div>
            <Button
              type="submit"
              disabled={!title.trim() || creating}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 rounded-xl h-12 px-8 font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-5 w-5" />
                  Add Todo
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Stats */}
        {totalCount > 0 && (
          <div className="flex flex-wrap gap-4 mb-8 justify-center sm:justify-start">
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl px-6 py-3 shadow-lg">
              <span className="text-gray-300 text-sm font-medium">Total: </span>
              <span className="text-white font-bold text-lg">{totalCount}</span>
            </div>
            <div className="backdrop-blur-md bg-green-500/10 border border-green-500/20 rounded-2xl px-6 py-3 shadow-lg">
              <span className="text-green-300 text-sm font-medium">Completed: </span>
              <span className="text-green-200 font-bold text-lg">{completedCount}</span>
            </div>
            <div className="backdrop-blur-md bg-blue-500/10 border border-blue-500/20 rounded-2xl px-6 py-3 shadow-lg">
              <span className="text-blue-300 text-sm font-medium">Remaining: </span>
              <span className="text-blue-200 font-bold text-lg">{totalCount - completedCount}</span>
            </div>
          </div>
        )}

        {/* Todo List */}
        <div className="space-y-4">
          {loading ? (
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl p-12 shadow-2xl">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6">
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                </div>
                <p className="text-gray-300 text-lg">Loading your todos...</p>
              </div>
            </div>
          ) : todos.length === 0 ? (
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl p-12 shadow-2xl">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-gray-600 to-gray-700 rounded-3xl mb-6">
                  <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">No todos yet</h3>
                <p className="text-gray-400 text-lg">Create your first todo to get started!</p>
              </div>
            </div>
          ) : (
            todos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggleComplete={handleToggleComplete}
                onUpdate={handleUpdateTodo}
                onDelete={handleDeleteTodo}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-16">
          <p className="text-gray-500 text-sm">Built with React and shadcn/ui</p>
        </div>
      </div>
    </div>
  )
}
