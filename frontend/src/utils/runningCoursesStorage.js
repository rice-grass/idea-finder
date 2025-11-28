/**
 * LocalStorage utility for managing saved running courses
 * Key: 'savedCourses'
 */

const STORAGE_KEY = 'savedCourses';

/**
 * Get all saved courses from localStorage
 * @returns {Array} Array of saved courses
 */
export const getSavedCourses = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error reading saved courses:', error);
    return [];
  }
};

/**
 * Save a course to localStorage
 * @param {Object} course - The course object to save
 * @returns {boolean} Success status
 */
export const saveCourse = (course) => {
  try {
    const savedCourses = getSavedCourses();

    // Add timestamp and unique ID if not present
    const courseToSave = {
      ...course,
      id: course.id || `course-${Date.now()}`,
      savedAt: course.savedAt || new Date().toISOString()
    };

    // Check if course already exists (by name or ID)
    const existingIndex = savedCourses.findIndex(
      c => c.id === courseToSave.id || c.name === courseToSave.name
    );

    if (existingIndex !== -1) {
      // Update existing course
      savedCourses[existingIndex] = courseToSave;
    } else {
      // Add new course
      savedCourses.push(courseToSave);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedCourses));
    return true;
  } catch (error) {
    console.error('Error saving course:', error);
    return false;
  }
};

/**
 * Delete a course from localStorage
 * @param {string} courseId - The ID of the course to delete
 * @returns {boolean} Success status
 */
export const deleteCourse = (courseId) => {
  try {
    const savedCourses = getSavedCourses();
    const filtered = savedCourses.filter(c => c.id !== courseId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting course:', error);
    return false;
  }
};

/**
 * Check if a course is saved
 * @param {string} courseId - The ID of the course
 * @returns {boolean} Whether the course is saved
 */
export const isCourseSaved = (courseId) => {
  try {
    const savedCourses = getSavedCourses();
    return savedCourses.some(c => c.id === courseId);
  } catch (error) {
    console.error('Error checking course:', error);
    return false;
  }
};

/**
 * Clear all saved courses
 * @returns {boolean} Success status
 */
export const clearAllCourses = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing courses:', error);
    return false;
  }
};

/**
 * Get course by ID
 * @param {string} courseId - The ID of the course
 * @returns {Object|null} The course object or null if not found
 */
export const getCourseById = (courseId) => {
  try {
    const savedCourses = getSavedCourses();
    return savedCourses.find(c => c.id === courseId) || null;
  } catch (error) {
    console.error('Error getting course:', error);
    return null;
  }
};
