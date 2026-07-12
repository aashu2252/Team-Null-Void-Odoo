export const MODULES = [
  {
    moduleName: 'Dashboard',
    permissions: [
      { name: 'View Dashboard', code: 'dashboard.view' }
    ]
  },
  {
    moduleName: 'Vehicles',
    permissions: [
      { name: 'View Vehicles', code: 'vehicle.view' },
      { name: 'Create Vehicle', code: 'vehicle.create' },
      { name: 'Edit Vehicle', code: 'vehicle.edit' },
      { name: 'Delete Vehicle', code: 'vehicle.delete' },
      { name: 'Vehicle Analytics', code: 'vehicle.analytics' }
    ]
  },
  {
    moduleName: 'Drivers',
    permissions: [
      { name: 'View Drivers', code: 'driver.view' },
      { name: 'Create Driver', code: 'driver.create' },
      { name: 'Edit Driver', code: 'driver.edit' },
      { name: 'Delete Driver', code: 'driver.delete' },
      { name: 'Driver Analytics', code: 'driver.analytics' }
    ]
  },
  {
    moduleName: 'Trips',
    permissions: [
      { name: 'View Trips', code: 'trip.view' },
      { name: 'Create Trip', code: 'trip.create' },
      { name: 'Edit Trip', code: 'trip.edit' },
      { name: 'Delete Trip', code: 'trip.delete' },
      { name: 'Dispatch Trip', code: 'trip.dispatch' }
    ]
  },
  {
    moduleName: 'Maintenance',
    permissions: [
      { name: 'View Maintenance Logs', code: 'maintenance.view' },
      { name: 'Create Maintenance Log', code: 'maintenance.create' },
      { name: 'Edit Maintenance Log', code: 'maintenance.edit' },
      { name: 'Delete Maintenance Log', code: 'maintenance.delete' }
    ]
  },
  {
    moduleName: 'Fuel & Expenses',
    permissions: [
      { name: 'View Expenses', code: 'expense.view' },
      { name: 'Create Expense', code: 'expense.create' },
      { name: 'Edit Expense', code: 'expense.edit' },
      { name: 'Delete Expense', code: 'expense.delete' }
    ]
  },
  {
    moduleName: 'Admin Panel',
    permissions: [
      { name: 'Manage Users', code: 'admin.users' },
      { name: 'Manage Roles', code: 'admin.roles' }
    ]
  }
];
