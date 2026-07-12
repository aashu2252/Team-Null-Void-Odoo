import { useAuth } from '../context/AuthContext';

const usePermissions = () => {
  const { user } = useAuth();

  // Extract permissions from the user's populated role object
  // Fallback to empty array if no role or permissions are found
  const userPermissions = user?.role?.permissions || [];

  /**
   * Check if the current user has a specific permission
   * @param {string} permissionCode - The permission code to check (e.g. 'vehicle.edit')
   * @returns {boolean}
   */
  const hasPermission = (permissionCode) => {
    // Super admins have the '*' wildcard permission
    if (userPermissions.includes('*')) {
      return true;
    }
    
    return userPermissions.includes(permissionCode);
  };

  /**
   * Check if the current user has ANY of the specified permissions
   * @param {string[]} permissionCodes - Array of permission codes to check
   * @returns {boolean}
   */
  const hasAnyPermission = (permissionCodes) => {
    if (userPermissions.includes('*')) {
      return true;
    }
    
    return permissionCodes.some(code => userPermissions.includes(code));
  };

  /**
   * Check if the current user has ALL of the specified permissions
   * @param {string[]} permissionCodes - Array of permission codes to check
   * @returns {boolean}
   */
  const hasAllPermissions = (permissionCodes) => {
    if (userPermissions.includes('*')) {
      return true;
    }
    
    return permissionCodes.every(code => userPermissions.includes(code));
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    userPermissions
  };
};

export default usePermissions;
