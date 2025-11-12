const STORAGE_KEY = 'savedIdeas';

/**
 * Get all saved ideas from localStorage
 * @returns {Array} Array of saved idea objects
 */
export const getSavedIdeas = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error reading saved ideas:', error);
    return [];
  }
};

/**
 * Save an idea to localStorage
 * @param {Object} idea - The idea object to save
 * @param {Object} metadata - Additional metadata (devType, days, techStacks)
 * @returns {boolean} Success status
 */
export const saveIdea = (idea, metadata = {}) => {
  try {
    const saved = getSavedIdeas();

    // Add timestamp, unique ID, and metadata
    const ideaWithMeta = {
      ...idea,
      savedAt: new Date().toISOString(),
      savedId: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      metadata: {
        devType: metadata.devType || '',
        devTypeLabel: metadata.devTypeLabel || '',
        days: metadata.days || 7,
        techStacks: metadata.techStacks || []
      }
    };

    // Check if already saved (by project name)
    const exists = saved.some(
      item => item['Project Name'] === idea['Project Name']
    );

    if (exists) {
      console.log('Idea already saved');
      return false;
    }

    saved.push(ideaWithMeta);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    return true;
  } catch (error) {
    console.error('Error saving idea:', error);
    return false;
  }
};

/**
 * Remove a saved idea
 * @param {string} savedId - The unique ID of the saved idea
 * @returns {boolean} Success status
 */
export const removeSavedIdea = (savedId) => {
  try {
    const saved = getSavedIdeas();
    const filtered = saved.filter(item => item.savedId !== savedId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error removing saved idea:', error);
    return false;
  }
};

/**
 * Check if an idea is saved
 * @param {string} projectName - The project name to check
 * @returns {boolean|Object} False if not saved, saved object if saved
 */
export const isIdeaSaved = (projectName) => {
  const saved = getSavedIdeas();
  return saved.find(item => item['Project Name'] === projectName) || false;
};

/**
 * Clear all saved ideas
 * @returns {boolean} Success status
 */
export const clearAllSavedIdeas = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing saved ideas:', error);
    return false;
  }
};

/**
 * Export saved ideas as JSON file
 */
export const exportSavedIdeas = () => {
  const saved = getSavedIdeas();
  const dataStr = JSON.stringify(saved, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `saved-ideas-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
