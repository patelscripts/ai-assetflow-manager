export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Employee' | 'DepartmentHead' | 'AssetManager' | 'Admin';
  department?: string;
}

export interface Category {
  _id: string;
  name: string;
}

export interface Asset {
  _id: string;
  name: string;
  assetTag: string;
  serialNumber?: string;
  category: Category;
  condition: string;
  location?: string;
  isBookable: boolean;
  status: 'Available' | 'Allocated' | 'Reserved' | 'Under Maintenance' | 'Lost' | 'Retired' | 'Disposed';
  currentHolder?: { _id: string; name: string; email: string } | null;
}

export interface Allocation {
  _id: string;
  asset: { _id: string; name: string; assetTag: string };
  allocatedTo: { _id: string; name: string; email: string };
  department?: { _id: string; name: string };
  allocationDate: string;
  expectedReturnDate?: string;
  status: 'Active' | 'Returned' | 'Overdue' | 'TransferRequested' | 'Transferred';
  isOverdue?: boolean;
}

export interface Booking {
  _id: string;
  resource: { _id: string; name: string; assetTag: string };
  bookedBy: { _id: string; name: string; email: string };
  startTime: string;
  endTime: string;
  status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
}