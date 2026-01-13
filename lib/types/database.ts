export type UserRole = 'student' | 'coach'

export interface Profile {
    id: string
    name: string
    role: UserRole
    email?: string
    created_at: string
    updated_at: string
}

export interface Camp {
    id: string
    name: string
    start_date: string
    end_date: string
    price: number
    location: string
    description: string | null
    created_at: string
    updated_at: string
}

export interface Enrollment {
    id: string
    student_id: string
    camp_id: string
    enrolled_at: string
}

export interface Game {
    id: string
    camp_id: string
    game_date: string
    opponent_name?: string | null
    team_1_name: string
    team_2_name: string
    created_at: string
    updated_at: string
}

export interface GameStat {
    id: string
    game_id: string
    student_id: string
    points: number
    rebounds: number
    assists: number
    steals: number
    blocks: number
    team_choice: 'team_1' | 'team_2' | null
    created_at: string
    updated_at: string
}

export interface TrainingSession {
    id: string
    camp_id: string
    session_date: string
    drill_topic: string
    notes: string | null
    created_at: string
    updated_at: string
}

updated_at: string
}

export interface Evaluation {
    id: string
    training_session_id: string
    student_id: string
    rating: number
    strengths: string | null
    weaknesses: string | null
    coach_notes: string | null
    created_at: string
    updated_at: string
}

export interface Attendance {
    id: string
    student_id: string
    game_id?: string
    training_session_id?: string
    status: 'present' | 'absent' | 'excused'
    created_at: string
    updated_at: string
}

// Extended types with joined data
export interface EnrollmentWithDetails extends Enrollment {
    camps?: Camp
    profiles?: Profile
}

export interface GameWithCamp extends Game {
    camps?: Camp
}

export interface GameStatWithDetails extends GameStat {
    games?: GameWithCamp
    profiles?: Profile
}

export interface EvaluationWithDetails extends Evaluation {
    training_sessions?: TrainingSession
    profiles?: Profile
}
