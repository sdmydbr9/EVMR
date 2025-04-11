// Mock data for Cancellation Management

// Mock service types for the application
export const mockServiceTypes = [
  {
    _id: '1',
    name: 'Routine Check-up',
    description: 'Regular health examination',
    duration: 30,
    price: 75,
    category: 'Check-ups',
    requiresDoctor: true,
    isActive: true
  },
  {
    _id: '2',
    name: 'Vaccination',
    description: 'Standard vaccination service',
    duration: 15,
    price: 50,
    category: 'Vaccinations',
    requiresDoctor: true,
    isActive: true
  },
  {
    _id: '3',
    name: 'Surgery - Minor',
    description: 'Minor surgical procedure',
    duration: 60,
    price: 250,
    category: 'Surgeries',
    requiresDoctor: true,
    isActive: true
  },
  {
    _id: '4',
    name: 'X-Ray',
    description: 'Diagnostic imaging',
    duration: 20,
    price: 120,
    category: 'Imaging',
    requiresDoctor: false,
    isActive: true
  }
];

export const mockCancellationPolicies = [
  {
    _id: 'policy_1',
    name: 'Standard Cancellation Policy',
    description: 'Default policy for most services',
    timeFrame: {
      value: 24,
      unit: 'hours'
    },
    refundPercentage: 100,
    autoApprove: true,
    serviceTypeIds: ['1', '3'],
    allowRescheduling: true,
    reschedulingTimeFrame: {
      value: 48,
      unit: 'hours'
    },
    reschedulingFee: 0,
    status: 'active',
    createdAt: '2023-06-15T10:00:00Z'
  },
  {
    _id: 'policy_2',
    name: 'Specialized Treatment Policy',
    description: 'Stricter policy for specialized treatments',
    timeFrame: {
      value: 48,
      unit: 'hours'
    },
    refundPercentage: 75,
    autoApprove: false,
    serviceTypeIds: ['2'],
    allowRescheduling: true,
    reschedulingTimeFrame: {
      value: 72,
      unit: 'hours'
    },
    reschedulingFee: 15,
    status: 'active',
    createdAt: '2023-07-20T14:30:00Z'
  }
];

export const mockCancellationRequests = [
  {
    _id: 'req_1',
    appointmentId: 'appt_123',
    appointmentDate: '2023-09-15T14:00:00Z',
    appointmentTime: '2:00 PM',
    userName: 'John Smith',
    userId: 'user_123',
    serviceName: 'Consultation',
    serviceId: '1',
    reason: 'I have a schedule conflict with an important work meeting that came up.',
    requestDate: '2023-09-13T09:30:00Z',
    originalAmount: 75.00,
    refundAmount: 75.00,
    policyId: 'policy_1',
    policyName: 'Standard Cancellation Policy',
    status: 'pending'
  },
  {
    _id: 'req_2',
    appointmentId: 'appt_124',
    appointmentDate: '2023-09-10T10:00:00Z',
    appointmentTime: '10:00 AM',
    userName: 'Sarah Johnson',
    userId: 'user_124',
    serviceName: 'Treatment',
    serviceId: '2',
    reason: 'I\'m feeling unwell and won\'t be able to make it.',
    requestDate: '2023-09-08T16:45:00Z',
    originalAmount: 120.00,
    refundAmount: 90.00,
    policyId: 'policy_2',
    policyName: 'Specialized Treatment Policy',
    status: 'approved',
    processedBy: 'Admin User'
  },
  {
    _id: 'req_3',
    appointmentId: 'appt_125',
    appointmentDate: '2023-09-12T13:30:00Z',
    appointmentTime: '1:30 PM',
    userName: 'Michael Brown',
    userId: 'user_125',
    serviceName: 'Follow-up',
    serviceId: '3',
    reason: 'I need to reschedule due to a family emergency.',
    requestDate: '2023-09-05T12:20:00Z',
    originalAmount: 50.00,
    refundAmount: 50.00,
    policyId: 'policy_1',
    policyName: 'Standard Cancellation Policy',
    status: 'rejected',
    processedBy: 'Admin User'
  },
  {
    _id: 'req_4',
    appointmentId: 'appt_126',
    appointmentDate: '2023-09-18T09:00:00Z',
    appointmentTime: '9:00 AM',
    userName: 'Lisa Wilson',
    userId: 'user_126',
    serviceName: 'Consultation',
    serviceId: '1',
    reason: 'I need to cancel because of transportation issues.',
    requestDate: '2023-09-17T08:15:00Z',
    originalAmount: 75.00,
    refundAmount: 75.00,
    policyId: 'policy_1',
    policyName: 'Standard Cancellation Policy',
    status: 'pending'
  }
];