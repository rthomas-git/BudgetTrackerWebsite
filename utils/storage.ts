/**
 * Storage utility functions for the BudgetCraft application
 */

/**
 * Save data to localStorage with error handling
 */
export function saveToStorage<T>(key: string, data: T): boolean {
  try {
    // Convert data to string and save to localStorage
    const serializedData = JSON.stringify(data)
    localStorage.setItem(key, serializedData)

    // Verify the data was saved correctly
    const savedData = localStorage.getItem(key)
    if (!savedData) {
      console.error(`Failed to save data to localStorage (${key}): Data not found after saving`)
      return false
    }

    // Log successful save for debugging
    console.log(`Successfully saved data to localStorage (${key})`)
    return true
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error)

    // Check if it's a quota exceeded error
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      console.error("localStorage quota exceeded. Try clearing some space.")
    }

    return false
  }
}

/**
 * Retrieve data from localStorage with error handling
 */
export function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const storedValue = localStorage.getItem(key)
    if (!storedValue) {
      console.log(`No data found in localStorage for key (${key}), using default value`)
      return defaultValue
    }

    const parsedValue = JSON.parse(storedValue) as T
    console.log(`Successfully loaded data from localStorage (${key})`)
    return parsedValue
  } catch (error) {
    console.error(`Error retrieving from localStorage (${key}):`, error)
    return defaultValue
  }
}

/**
 * Check if localStorage is available and working
 */
export function isStorageAvailable(): boolean {
  try {
    const testKey = "budgetcraft-test"
    localStorage.setItem(testKey, "test")
    const result = localStorage.getItem(testKey) === "test"
    localStorage.removeItem(testKey)
    return result
  } catch (e) {
    return false
  }
}
