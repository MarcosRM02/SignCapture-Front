import { useState } from 'react'

export function usePersistentState(key, initialValue) {
  const [state, setState] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      const savedValue = window.localStorage.getItem(key)

      if (savedValue === null) {
        return initialValue
      }

      return JSON.parse(savedValue)
    } catch {
      return initialValue
    }
  })

  const updateState = (value) => {
    setState((currentValue) => {
      const nextValue = typeof value === 'function' ? value(currentValue) : value

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(nextValue))
      }

      return nextValue
    })
  }

  return [state, updateState]
}
