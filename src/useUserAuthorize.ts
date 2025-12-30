import { useEffect, useState } from 'react'
import { axiosInstance, LS_USER_ID_KEY } from './constants'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router'

const getUserData = async (creds: { name: string; password: string }) => {
  try {
    return await axiosInstance.post<{
      id: string
      name: string
    }>('/users/auth', creds)
  } catch (e: any) {
    if (e.status === 404) {
      return
    }

    toast(e.message)
  }
}

const isUserExist = async (userId: string) => {
  try {
    await axiosInstance.get(`/users/${userId}`)

    return true
  } catch (e: any) {
    toast(e.message)

    if (e.status === 404) return false
  }
}

const createNewUser = async (rawUser: { name: string; password: string }) => {
  const newUser = await axiosInstance.post<{ id: string; name: string }>(
    '/users',
    rawUser
  )

  return newUser
}

export const useUserAuthorize = () => {
  const navigate = useNavigate()
  const [userId, setUserId] = useState<string | null>(() =>
    localStorage.getItem(LS_USER_ID_KEY)
  )

  useEffect(() => {
    const authUser = async () => {
      const isExist = Boolean(userId) && (await isUserExist(userId!))

      if (!isExist) {
        localStorage.removeItem(LS_USER_ID_KEY)

        return
      }

      navigate('/home')
    }

    authUser()
  }, [])

  const updateUserCredentials = async (
    creds: {
      name: string
      password: string
    },
    onSuccess?: (args?: any) => void
  ) => {
    try {
      let userData = await getUserData(creds)

      if (!userData) {
        userData = await createNewUser(creds)
      }

      localStorage.setItem(LS_USER_ID_KEY, userData.data.id)

      setUserId(userData.data.id)

      if (onSuccess) onSuccess()
    } catch (e: any) {
      toast(e.response?.data)
    }
  }

  return { updateUserCredentials }
}
