import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/api';
import { tryCatch } from '@/lib/apiUtils';

export interface Course {
  enrolmentId: string;
  status: string;
  enrolledAt: string | Date | null;
  courseId: string;
  title: string;
  description: string;
  bannerImageUrl: string;
  slug: string;
  courseHours: number;
  courseDuration: string | null;
  totalLectures: number;
}

export interface PublicCourse {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  bannerImageUrl: string;
  bannerImageKey: string;
  courseHours: number;
  courseDuration: string;
  totalLectures: number;
  slug: string;
  path: string;
  courseOverview: string | null;
  whatYouWillLearn: string[];
  skillsAcquired: string[];
  createdAt: string;
  updatedAt: string;
}

interface CoursesState {
  courses: Course[];
  loading: boolean;
  error: string | null;
  allCourses: PublicCourse[];
  allCoursesLoading: boolean;
  allCoursesError: string | null;
}

const initialState: CoursesState = {
  courses: [],
  loading: false,
  error: null,
  allCourses: [],
  allCoursesLoading: false,
  allCoursesError: null,
};

export const fetchPurchasedCourses = createAsyncThunk(
  'courses/fetchPurchasedCourses',
  async (_, { rejectWithValue }) => {
    const { data: response, error } = await tryCatch(
      () => api.get('/api/auth/mobile/courses'),
      'Failed to fetch courses'
    );

    if (error || !response) {
      return rejectWithValue(error || 'Failed to fetch courses');
    }

    if (response.data.success) {
      return response.data.courses;
    }

    return rejectWithValue('Failed to fetch courses');
  }
);

export const fetchAllCourses = createAsyncThunk(
  'courses/fetchAllCourses',
  async (_, { rejectWithValue }) => {
    const { data: response, error } = await tryCatch(
      () => api.get('/api/course'),
      'Failed to fetch all courses'
    );

    if (error || !response) {
      return rejectWithValue(error || 'Failed to fetch all courses');
    }

    if (response.data.success) {
      return response.data.courses;
    }

    return rejectWithValue('Failed to fetch all courses');
  }
);

const coursesSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    clearCourses: (state) => {
      state.courses = [];
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPurchasedCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPurchasedCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload;
      })
      .addCase(fetchPurchasedCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchAllCourses.pending, (state) => {
        state.allCoursesLoading = true;
        state.allCoursesError = null;
      })
      .addCase(fetchAllCourses.fulfilled, (state, action) => {
        state.allCoursesLoading = false;
        state.allCourses = action.payload;
      })
      .addCase(fetchAllCourses.rejected, (state, action) => {
        state.allCoursesLoading = false;
        state.allCoursesError = action.payload as string;
      });
  },
});

export const { clearCourses } = coursesSlice.actions;

export default coursesSlice.reducer;
