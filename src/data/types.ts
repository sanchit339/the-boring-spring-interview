export interface FollowUp {
  text: string;
}

export interface Question {
  id: number;
  text: string;
  followUps: FollowUp[];
  answer?: string;
  explanation?: string;
}

export interface Category {
  id: string;
  title: string;
  description: string;
  icon: string;
  questions: Question[];
}
