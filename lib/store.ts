import { create } from "zustand"
import { persist } from "zustand/middleware"

export type UserRole = "Operator" | "QA" | "Regulatory" | "MD" | "Auditor"

interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

interface AppState {
  // User & Auth
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  switchRole: (role: UserRole) => void

  // UI State
  sidebarCollapsed: boolean
  toggleSidebar: () => void

  // Plant Info
  plantInfo: {
    name: string
    location: string
    licenseNo: string
    lastSync: string
  }
  updatePlantInfo: (info: Partial<AppState["plantInfo"]>) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      sidebarCollapsed: false,
      plantInfo: {
        name: "Shuddhi Pharma Manufacturing Unit 1",
        location: "Hyderabad, Telangana",
        licenseNo: "MFG/25/001234",
        lastSync: new Date().toISOString(),
      },

      // Actions
      login: async (email: string, password: string) => {
        // Mock authentication
        await new Promise((resolve) => setTimeout(resolve, 1000))

        if (email && password) {
          const mockUser: User = {
            id: "user-1",
            name: email
              .split("@")[0]
              .replace(".", " ")
              .replace(/\b\w/g, (l) => l.toUpperCase()),
            email,
            role: "QA", // Default role
          }

          set({
            user: mockUser,
            isAuthenticated: true,
            plantInfo: {
              ...get().plantInfo,
              lastSync: new Date().toISOString(),
            },
          })
        } else {
          throw new Error("Invalid credentials")
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false })
      },

      switchRole: (role: UserRole) => {
        const currentUser = get().user
        if (currentUser) {
          set({
            user: { ...currentUser, role },
            plantInfo: {
              ...get().plantInfo,
              lastSync: new Date().toISOString(),
            },
          })
        }
      },

      toggleSidebar: () => {
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }))
      },

      updatePlantInfo: (info) => {
        set((state) => ({
          plantInfo: { ...state.plantInfo, ...info },
        }))
      },
    }),
    {
      name: "shuddhi-app-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        sidebarCollapsed: state.sidebarCollapsed,
        plantInfo: state.plantInfo,
      }),
    },
  ),
)
