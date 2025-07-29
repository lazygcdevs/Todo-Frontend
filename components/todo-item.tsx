"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Edit2, Trash2, Check, X, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { Todo, UpdateTodoRequest } from "../types/todo"

interface TodoItemProps {
  todo: Todo
  onToggleComplete: (id: string, completed: boolean) => void
  onUpdate: (id: string, data: UpdateTodoRequest) => void
  onDelete: (id: string) => void
}

export default function TodoItem({ todo, onToggleComplete, onUpdate, onDelete }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(todo.title)
  const [editDescription, setEditDescription] = useState(todo.description)

  const handleEdit = () => {
    setIsEditing(true)
    setEditTitle(todo.title)
    setEditDescription(todo.description)
  }

  const handleSave = () => {
    if (!editTitle.trim()) return

    onUpdate(todo.id, {
      title: editTitle.trim(),
      description: editDescription.trim() || undefined,
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditTitle(todo.title)
    setEditDescription(todo.description)
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy h:mm a")
    } catch {
      return dateString
    }
  }

  return (
    <div
      className={`group backdrop-blur-md border rounded-3xl p-6 shadow-2xl transition-all duration-300 hover:shadow-3xl hover:scale-[1.02] ${
        todo.completed ? "bg-white/5 border-white/10 opacity-75" : "bg-white/10 border-white/20 hover:bg-white/15"
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <div className="flex-shrink-0 mt-1">
          <div className="relative">
            <Checkbox
              checked={todo.completed}
              onCheckedChange={(checked) => onToggleComplete(todo.id, checked as boolean)}
              className="h-6 w-6 border-2 border-white/30 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-green-500 data-[state=checked]:to-emerald-600 data-[state=checked]:border-green-500 transition-all duration-200"
            />
            {todo.completed && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Check className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-4">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="text-lg font-medium bg-white/10 border-white/20 text-white placeholder:text-gray-400 rounded-xl focus:bg-white/15 focus:border-blue-500/50 transition-all duration-200"
                placeholder="Todo title"
              />
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Description (optional)"
                rows={3}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 rounded-xl focus:bg-white/15 focus:border-blue-500/50 transition-all duration-200 resize-none"
              />
              <div className="flex gap-3">
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={!editTitle.trim()}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 rounded-xl px-4 py-2 font-medium shadow-lg transition-all duration-200"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancel}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl px-4 py-2 font-medium transition-all duration-200"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <h3
                className={`text-xl font-semibold leading-tight transition-all duration-200 ${
                  todo.completed ? "line-through text-gray-400" : "text-white group-hover:text-blue-200"
                }`}
              >
                {todo.title}
              </h3>

              {todo.description && (
                <p
                  className={`text-sm leading-relaxed transition-all duration-200 ${
                    todo.completed ? "line-through text-gray-500" : "text-gray-300 group-hover:text-gray-200"
                  }`}
                >
                  {todo.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3 text-xs">
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
                  <Calendar className="h-3 w-3 text-blue-400" />
                  <span className="text-gray-300">Created: {formatDate(todo.created_at)}</span>
                </div>

                {todo.updated_at !== todo.created_at && (
                  <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg px-3 py-1.5">
                    <span className="text-purple-200">Updated: {formatDate(todo.updated_at)}</span>
                  </div>
                )}

                {todo.completed && (
                  <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg px-3 py-1.5">
                    <span className="text-green-200 font-medium">✓ Completed</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        {!isEditing && (
          <div className="flex-shrink-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleEdit}
              className="h-10 w-10 p-0 bg-white/10 hover:bg-blue-500/20 border border-white/20 hover:border-blue-500/40 rounded-xl text-gray-300 hover:text-blue-200 transition-all duration-200"
            >
              <Edit2 className="h-4 w-4" />
              <span className="sr-only">Edit todo</span>
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-10 w-10 p-0 bg-white/10 hover:bg-red-500/20 border border-white/20 hover:border-red-500/40 rounded-xl text-gray-300 hover:text-red-200 transition-all duration-200"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete todo</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-slate-900 border-slate-700">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">Delete Todo</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-300">
                    Are you sure you want to delete "{todo.title}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(todo.id)}
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
    </div>
  )
}
