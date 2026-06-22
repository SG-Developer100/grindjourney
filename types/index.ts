export type Role = 'youth' | 'mentor' | 'admin'

export type Stage =
  | 'Participant'
  | 'Grind Lab Athlete'
  | 'Grind Journey User'
  | 'Ambassador'
  | 'Mentor'
  | 'Community Leader'

export type SuccessPlanArea =
  | 'Athletic'
  | 'Academic'
  | 'Leadership'
  | 'Wellness'
  | 'Community'
  | 'Personal Growth'

export type MentorRequestStatus = 'requested' | 'matched' | 'active'
export type PlanStatus = 'active' | 'completed' | 'paused'

export interface Profile {
  id: string
  full_name: string
  age: number | null
  role: Role
  sport: string | null
  photo_url: string | null
  city: string | null
  stage: Stage
  goal: string | null
  barrier: string | null
  created_at: string
}

export interface PlanTemplate {
  id: string
  name: string
  description: string | null
}

export interface SuccessPlan {
  id: string
  user_id: string
  template_id: string | null
  title: string
  status: PlanStatus
  created_at: string
}

export interface Milestone {
  id: string
  plan_id: string
  area: SuccessPlanArea
  title: string
  description: string | null
  target_date: string | null
  is_complete: boolean
  completed_at: string | null
  sort_order: number
}

export interface MentorRequest {
  id: string
  youth_id: string
  mentor_id: string | null
  status: MentorRequestStatus
  note: string | null
  created_at: string
}

export interface CheckIn {
  id: string
  user_id: string
  date: string
  note: string | null
}

// Joined types for UI
export interface MilestonesByArea {
  [area: string]: Milestone[]
}

export interface PlanWithMilestones extends SuccessPlan {
  milestones: Milestone[]
  milestonesByArea: MilestonesByArea
  totalCount: number
  completedCount: number
  percentComplete: number
}

export interface YouthWithPlan extends Profile {
  plan?: PlanWithMilestones
  currentStreak?: number
  mentorRequest?: MentorRequest | null
}
