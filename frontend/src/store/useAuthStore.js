import { create } from 'zustand';

const storedUser = localStorage.getItem('user');
const parsedUser = storedUser ? JSON.parse(storedUser) : null;

export const useAuthStore = create((set) => ({
    user: parsedUser,
    token: localStorage.getItem('token') || null,
    points: parsedUser?.loyaltyPoints || 0,
    login: (userData, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        set({ user: userData, token, points: userData.loyaltyPoints });
    },
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null, points: 0 });
    },
    setPoints: (newPoints) => set((state) => {
        const nextUser = state.user ? { ...state.user, loyaltyPoints: newPoints } : state.user;
        if (nextUser) {
            localStorage.setItem('user', JSON.stringify(nextUser));
        }
        return { points: newPoints, user: nextUser };
    }),
    setUser: (nextUser) => set(() => {
        localStorage.setItem('user', JSON.stringify(nextUser));
        return { user: nextUser, points: nextUser.loyaltyPoints ?? 0 };
    })
}));
