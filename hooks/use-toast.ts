/* eslint-disable react-hooks/exhaustive-deps */
// @ts-nocheck
/* eslint-disable */  

"use client"

import * as React from "react"
import type { ToastActionElement, ToastProps } from "@/components/ui/toast"

const TOAST_LIMIT = 3
const TOAST_REMOVE_DELAY = 5000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

type Action =
  | { type: typeof actionTypes.ADD_TOAST; toast: ToasterToast }
  | { type: typeof actionTypes.UPDATE_TOAST; toast: ToasterToast }
  | { type: typeof actionTypes.DISMISS_TOAST; toastId?: string }
  | { type: typeof actionTypes.REMOVE_TOAST; toastId?: string }

interface State {
  toasts: ToasterToast[]
}

let memoryState: State = { toasts: [] }
const listeners: Array<React.Dispatch<React.SetStateAction<State>>> = []

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({ type: "REMOVE_TOAST", toastId })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

const dispatch = (action: Action) => {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      memoryState.toasts = [...memoryState.toasts, action.toast]
      break
    case actionTypes.UPDATE_TOAST:
      memoryState.toasts = memoryState.toasts.map((t) =>
        t.id === action.toast.id ? { ...t, ...action.toast } : t
      )
      break
    case actionTypes.DISMISS_TOAST:
      memoryState.toasts = memoryState.toasts.map((t) =>
        t.id === action.toastId ? { ...t, open: false } : t
      )
      break
    case actionTypes.REMOVE_TOAST:
      memoryState.toasts = memoryState.toasts.filter((t) => t.id !== action.toastId)
      break
    default:
      break
  }

  listeners.forEach((listener) => listener(memoryState))
}

const toast = ({
  title,
  description,
  action,
  ...props
}: Omit<ToasterToast, "id">) => {
  const id = Math.random().toString(36).substr(2, 9)
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })
  const update = (newProps: Partial<ToasterToast>) =>
    dispatch({ type: "UPDATE_TOAST", toast: { id, ...newProps } })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      title,
      description,
      action,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
      ...props,
    },
  })

  addToRemoveQueue(id)

  return {
    id: id,
    dismiss,
    update,
  }
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [])

  return {
    toasts: state.toasts,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast, toast }
