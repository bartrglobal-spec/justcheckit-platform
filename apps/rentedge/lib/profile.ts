// lib/profile.ts

export type Profile = {
  income: number
  employment: "employed" | "self"
  years: number
  idReady: boolean
  payslipReady: boolean
  bankReady: boolean
  deposit: number
}

const KEY = "rentedge_profile"

// 🔹 GET PROFILE
export const getProfile = (): Profile | null => {
  if (typeof window === "undefined") return null

  try {
    const data = localStorage.getItem(KEY)
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

// 🔹 SAVE PROFILE
export const saveProfile = (profile: Profile) => {
  if (typeof window === "undefined") return
  localStorage.setItem(KEY, JSON.stringify(profile))
}

// 🔹 CLEAR PROFILE (useful later)
export const clearProfile = () => {
  if (typeof window === "undefined") return
  localStorage.removeItem(KEY)
}