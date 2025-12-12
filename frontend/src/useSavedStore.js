// useSavedStore.js

import { create } from "zustand";
import axios from "./axios.js"

export const useSavedStore = create((set) => ({
  saved: [],

  fetchSaved: async (userId) => {
    try {
      const res = await axios.get(`/listings/saved/${userId}`);
      // IMPORTANT: convert IDs to numbers to ensure consistency
      const savedIds = res.data.map((item) => Number(item.id));
      set({ saved: savedIds });
    } catch (err) {
      console.error("Error fetching saved list:", err);
    }
  },

  toggleSave: async (userId, listingId) => {
    let isCurrentlySaved; // Variable to store the state BEFORE the optimistic update

    // Optimistically update state
    set((state) => {
      isCurrentlySaved = state.saved.includes(listingId); // Store the current status

      if (isCurrentlySaved) {
        // Optimistic change: REMOVE
        return { saved: state.saved.filter((id) => id !== listingId) };
      } else {
        // Optimistic change: ADD
        return { saved: [...state.saved, listingId] };
      }
    });

    try {
      const payload = { user_id: userId, listing_id: listingId };

      // Post to the backend to perform the actual save/unsave operation
      const result = await axios.post("/listings/save", payload);
      console.log(result.data.message);
    } catch (err) {
      console.error("Failed to toggle save state:", err);

      // Revert optimistic update if API fails:
      // If it WAS saved (and we optimistically removed it), add it back.
      if (isCurrentlySaved) {
        set((state) => ({ saved: [...state.saved, listingId] }));
      } 
      // If it WAS NOT saved (and we optimistically added it), remove it.
      else {
        set((state) => ({ saved: state.saved.filter((id) => id !== listingId) }));
      }
    }
  },
}));
